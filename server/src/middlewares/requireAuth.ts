import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.ts";
import {
  AUTH_COOKIE,
  clearAuthCookie,
  verifyAuthToken,
} from "../services/token.service.ts";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  const payload = typeof token === "string" ? verifyAuthToken(token) : null;
  const user = payload ? await User.findById(payload.userId) : null;

  if (
    !payload ||
    !user ||
    !user.isVerified ||
    user.tokenVersion !== payload.tokenVersion
  ) {
    clearAuthCookie(res);
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.locals.userId = user.id;
  next();
};
