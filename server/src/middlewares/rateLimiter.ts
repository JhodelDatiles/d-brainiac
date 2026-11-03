import rateLimit from "express-rate-limit";

const limiter = (limit: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
  });

export const signupLimiter = limiter(10);
export const loginLimiter = limiter(20);
