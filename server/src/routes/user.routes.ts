import { Router } from "express";
import {
  changePassword,
  deleteAccount,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../controllers/user.controller.ts";
import {
  passwordGuessLimiter,
  avatarLimiter,
} from "../middlewares/rateLimiter.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { validate } from "../middlewares/validate.ts";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.ts";
import { avatarUpload } from "../middlewares/avatarUpload.ts";

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
router.patch("/me", validate(updateProfileSchema), updateProfile);
router.put("/me/avatar", avatarLimiter, avatarUpload, uploadAvatar);
router.delete("/me/avatar", avatarLimiter, removeAvatar);

export default router;
