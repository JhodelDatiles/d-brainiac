import { Router } from "express";
import {
  login,
  logout,
  me,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.ts";
import {
  loginAccountLimiter,
  loginLimiter,
  signupLimiter,
  verifyLimiter,
} from "../middlewares/rateLimiter.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  resendVerificationSchema
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

export default router;
