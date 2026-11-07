import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { config } from "../envConfig.ts";
import { User } from "../models/User.ts";
import { toPublicUser } from "../utils/publicUser.ts";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResendVerificationInput,
  ResetPasswordInput,
  SignupInput,
  VerifyEmailInput,
} from "../schemas/auth.schema.ts";
import {
  AUTH_COOKIE,
  clearAuthCookie,
  setAuthCookie,
  signAuthToken,
  verifyAuthToken,
} from "../services/token.service.ts";
import {
  resetPasswordEmail,
  sendEmail,
  verificationEmail,
} from "../services/email.service.ts";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const RESET_RESPONSE = {
  message: "If an account exists for this email, a reset link is on its way.",
};

// Used so a missing account takes as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Same response for every signup/resend outcome, so it reveals nothing
const GENERIC_RESPONSE = {
  message:
    "If this email can be registered, a confirmation link is on its way.",
};

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateVerificationToken = (ttlMs = TOKEN_TTL_MS) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return {
    rawToken,
    hashedToken: hashToken(rawToken),
    expires: new Date(Date.now() + ttlMs),
  };
};

// A new link is allowed only if the last one was sent over a minute ago
const canSend = (
  expires: Date | null | undefined,
  ttlMs = TOKEN_TTL_MS,
): boolean =>
  !expires || expires.getTime() - ttlMs + RESEND_COOLDOWN_MS <= Date.now();

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: number }).code === 11000;

// Runs in the background so the HTTP response never waits on SMTP
const sendVerification = async (
  email: string,
  rawToken: string,
  rollbackId?: string,
): Promise<void> => {
  try {
    const link = `${config.clientUrl}/verify-email?token=${rawToken}`;
    await sendEmail({ to: email, ...verificationEmail(link) });
  } catch (error) {
    console.error(
      "Failed to send verification email:",
      error instanceof Error ? error.message : error,
    );
    // Remove a brand-new account so the user can simply sign up again
    if (rollbackId) await User.deleteOne({ _id: rollbackId }).catch(() => {});
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SignupInput;

  // Hash first so every path takes about the same time
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email }).select(
    "+verificationTokenExpires",
  );

  // Verified account, or a link was sent under a minute ago:
  // respond identically and do nothing
  if (
    existing?.isVerified ||
    (existing && !canSend(existing.verificationTokenExpires))
  ) {
    res.json(GENERIC_RESPONSE);
    return;
  }

  const { rawToken, hashedToken, expires } = generateVerificationToken();
  let createdId: string | undefined;

  if (existing) {
    // Never confirmed before: the latest signup wins
    await User.updateOne(
      { _id: existing._id },
      {
        password: passwordHash,
        verificationToken: hashedToken,
        verificationTokenExpires: expires,
      },
    );
  } else {
    try {
      const user = await User.create({
        email,
        password: passwordHash,
        verificationToken: hashedToken,
        verificationTokenExpires: expires,
      });
      createdId = user.id;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        res.json(GENERIC_RESPONSE);
        return;
      }
      throw error;
    }
  }

  void sendVerification(email, rawToken, createdId);
  res.json(GENERIC_RESPONSE);
};

// Sends a fresh link without touching the password
export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body as ResendVerificationInput;
  const user = await User.findOne({ email }).select(
    "+verificationTokenExpires",
  );

  if (user && !user.isVerified && canSend(user.verificationTokenExpires)) {
    const { rawToken, hashedToken, expires } = generateVerificationToken();
    await User.updateOne(
      { _id: user._id },
      { verificationToken: hashedToken, verificationTokenExpires: expires },
    );
    void sendVerification(email, rawToken);
  }

  res.json(GENERIC_RESPONSE);
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body as VerifyEmailInput;

  const user = await User.findOneAndUpdate(
    {
      verificationToken: hashToken(token),
      verificationTokenExpires: { $gt: new Date() },
    },
    {
      $set: { isVerified: true },
      $unset: { verificationToken: 1, verificationTokenExpires: 1 },
    },
  );

  if (!user) {
    res.status(400).json({
      message:
        "This link is invalid or has expired. Sign up again to get a new one.",
    });
    return;
  }

  res.json({ message: "Email confirmed. You can now log in." });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({
      message:
        "Please confirm your email first. Check your inbox, or sign up again with the same email to get a new link.",
    });
    return;
  }

  setAuthCookie(res, signAuthToken(user.id, user.tokenVersion));
  res.json({ user: toPublicUser(user) });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  const payload = typeof token === "string" ? verifyAuthToken(token) : null;

  // Invalidate the JWT server-side (best effort: still clears the cookie
  // even if the token was already expired or invalid)
  if (payload) {
    await User.updateOne(
      { _id: payload.userId, tokenVersion: payload.tokenVersion },
      { $inc: { tokenVersion: 1 } },
    );
  }

  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};

export const me = async (_req: Request, res: Response): Promise<void> => {
  const user = await User.findById(res.locals.userId);

  if (!user?.isVerified) {
    clearAuthCookie(res);
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({ user: toPublicUser(user) });
};

const sendResetLink = async (email: string, rawToken: string): Promise<void> => {
  try {
    const link = `${config.clientUrl}/reset-password?token=${rawToken}`;
    await sendEmail({ to: email, ...resetPasswordEmail(link) });
  } catch (error) {
    console.error(
      "Failed to send reset email:",
      error instanceof Error ? error.message : error,
    );
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body as ForgotPasswordInput;
    const user = await User.findOne({ email }).select("+resetPasswordExpires");

    // Same response whether or not the account exists, is verified, or is rate-gated
    if (user?.isVerified && canSend(user.resetPasswordExpires, RESET_TTL_MS)) {
      const { rawToken, hashedToken, expires } =
        generateVerificationToken(RESET_TTL_MS);
      await User.updateOne(
        { _id: user._id },
        { resetPasswordToken: hashedToken, resetPasswordExpires: expires },
      );
      void sendResetLink(email, rawToken);
    }

    res.json(RESET_RESPONSE);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, password } = req.body as ResetPasswordInput;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: hashToken(token),
        resetPasswordExpires: { $gt: new Date() },
      },
      {
        $set: { password: passwordHash },
        // Invalidates every existing session
        $inc: { tokenVersion: 1 },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      },
    );

    if (!user) {
      res.status(400).json({
        message: "This link is invalid or has expired. Request a new one.",
      });
      return;
    }

    res.json({ message: "Password updated. You can now log in." });
  } catch (error) {
    next(error);
  }
};