import type { NextFunction, Request, Response } from "express";
import { config } from "../envConfig.ts";

// Blocks state-changing requests that come from a different website.
// Requests with no Origin header (curl, Postman) are allowed through.
export const requireSameOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (origin && origin !== config.clientUrl) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
