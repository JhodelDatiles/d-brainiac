import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const limiter = (limit: number, keyGenerator?: (req: Request) => string) =>
  rateLimit({
    windowMs: 10 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
    ...(keyGenerator && { keyGenerator }),
  });

export const signupLimiter = limiter(10);
export const loginLimiter = limiter(20);
export const verifyLimiter = limiter(20);

// Limits guessing against one account (per IP + email)
export const loginAccountLimiter = limiter(
  5,
  (req) =>
    `${ipKeyGenerator(req.ip ?? "")}|${String(req.body?.email ?? "").toLowerCase()}`,
);
