import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.ts";
import {
  forgotLimiter,
  loginAccountLimiter,
  loginLimiter,
  resetLimiter,
  signupLimiter,
  verifyLimiter,
} from "../middlewares/rateLimiter.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../schemas/auth.schema.ts";
import { resendVerification } from "../controllers/auth.controller.ts";
import { resendLimiter } from "../middlewares/rateLimiter.ts";

const router = Router();

router.post("/signup", signupLimiter, validate(signupSchema), signup);
router.post(
  "/verify-email",
  verifyLimiter,
  validate(verifyEmailSchema),
  verifyEmail,
);
router.post(
  "/resend-verification",
  resendLimiter,
  validate(resendVerificationSchema),
  resendVerification,
);
router.post(
  "/login",
  loginLimiter,
  loginAccountLimiter,
  validate(loginSchema),
  login,
);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

router.post(
  "/forgot-password",
  forgotLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  resetLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
