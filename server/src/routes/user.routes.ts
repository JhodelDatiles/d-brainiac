import { Router } from "express";
import {
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.ts";
import { passwordGuessLimiter } from "../middlewares/rateLimiter.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  changePasswordSchema,
  deleteAccountSchema,
} from "../schemas/auth.schema.ts";

const router = Router();

router.use(requireAuth);

router.patch(
  "/me/password",
  passwordGuessLimiter,
  validate(changePasswordSchema),
  changePassword,
);
router.delete(
  "/me",
  passwordGuessLimiter,
  validate(deleteAccountSchema),
  deleteAccount,
);

export default router;
