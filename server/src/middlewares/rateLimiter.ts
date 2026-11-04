import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const MIN = 60 * 1000;

const limiter = (
  limit: number,
  windowMs = 15 * MIN,
  keyGenerator?: (req: Request) => string,
  skipSuccessfulRequests = false,
) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { message: "Too many attempts. Please try again later." },
    ...(keyGenerator && { keyGenerator }),
  });

export const signupLimiter = limiter(10);
export const resendLimiter = limiter(5);
export const loginLimiter = limiter(30);
export const verifyLimiter = limiter(20);
export const avatarLimiter = limiter(10);

// Limits password guessing against one account (per IP + email).
// Successful logins don't count against the limit.
export const loginAccountLimiter = limiter(
  5,
  15 * MIN,
  (req) =>
    `${ipKeyGenerator(req.ip ?? "")}|${String(req.body?.email ?? "")
      .trim()
      .toLowerCase()}`,
  true,
);

// Per logged-in user. Only failed attempts count (current-password guessing).
export const passwordGuessLimiter = limiter(
  5,
  15 * MIN,
  (req) => String(req.res?.locals["userId"] ?? ipKeyGenerator(req.ip ?? "")),
  true,
);