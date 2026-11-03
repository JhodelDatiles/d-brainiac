import { Router } from "express";
import {
  login,
  logout,
  me,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.ts";
import { loginLimiter, signupLimiter } from "../middlewares/rateLimiter.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
} from "../schemas/auth.schema.ts";

const router = Router();

router.post("/signup", signupLimiter, validate(signupSchema), signup);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
