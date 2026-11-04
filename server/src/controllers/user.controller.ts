import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.ts";
import type {
  ChangePasswordInput,
  DeleteAccountInput,
} from "../schemas/auth.schema.ts";
import {
  clearAuthCookie,
  setAuthCookie,
  signAuthToken,
} from "../services/token.service.ts";

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    const user = await User.findById(res.locals.userId).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    // Invalidates every other session; re-issue the cookie for this one
    user.tokenVersion += 1;
    await user.save();

    setAuthCookie(res, signAuthToken(user.id, user.tokenVersion));
    res.json({ message: "Password updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password } = req.body as DeleteAccountInput;

    const user = await User.findById(res.locals.userId).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: "Password is incorrect" });
      return;
    }

    // Cascade-delete the user's own data here once other models exist
    await User.deleteOne({ _id: user._id });

    clearAuthCookie(res);
    res.json({ message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};
