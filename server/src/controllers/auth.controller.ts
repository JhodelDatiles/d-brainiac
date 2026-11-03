import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { config } from "../envConfig.ts";
import { User } from "../models/User.ts";
import type { LoginInput, SignupInput, VerifyEmailInput } from "../schemas/auth.schema.ts";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "../services/token.service.ts";
import { sendEmail, verificationEmail } from "../services/email.service.ts";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return {
    rawToken,
    hashedToken: hashToken(rawToken),
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  };
};

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: number }).code === 11000;

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SignupInput;

  const existing = await User.findOne({ email });

  if (existing?.isVerified) {
    res
      .status(409)
      .json({ message: "An account with this email already exists" });
    return;
  }

  const { rawToken, hashedToken, expires } = generateVerificationToken();
  let createdId: string | undefined;

  if (existing) {
    // Signed up before but never confirmed: just issue a fresh link
    await User.updateOne(
      { _id: existing._id },
      { verificationToken: hashedToken, verificationTokenExpires: expires },
    );
  } else {
    try {
      const user = await User.create({
        email,
        password: await bcrypt.hash(password, 12),
        verificationToken: hashedToken,
        verificationTokenExpires: expires,
      });
      createdId = user.id;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        res
          .status(409)
          .json({ message: "An account with this email already exists" });
        return;
      }
      throw error;
    }
  }

  const link = `${config.clientUrl}/verify-email?token=${rawToken}`;

  try {
    await sendEmail({ to: email, ...verificationEmail(link) });
  } catch (error) {
    console.error(
      "Failed to send verification email:",
      error instanceof Error ? error.message : error,
    );
    // Roll back a brand-new account so the user can simply try again
    if (createdId) await User.deleteOne({ _id: createdId });
    res
      .status(502)
      .json({
        message: "Could not send the verification email. Please try again.",
      });
    return;
  }

  res.status(createdId ? 201 : 200).json({
    message: "Check your email to confirm your address.",
  });
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


// Used so a missing account takes as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const toPublicUser = (user: { id: string; email: string }) => ({
  id: user.id,
  email: user.email,
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({
      message: "Please confirm your email first. Sign up again with the same email to get a new link.",
    });
    return;
  }

  setAuthCookie(res, signAuthToken(user.id));
  res.json({ user: toPublicUser(user) });
};

export const logout = (_req: Request, res: Response): void => {
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