import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE, verifyAuthToken } from "../services/token.service.ts";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  const userId = typeof token === "string" ? verifyAuthToken(token) : null;

  if (!userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.locals.userId = userId;
  next();
};
