import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../envConfig.ts";

export const AUTH_COOKIE = "brainiac_token";

const MAX_AGE_SECONDS = config.jwt.expiresInDays * 24 * 60 * 60;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "lax",
  path: "/",
};

export const signAuthToken = (userId: string): string =>
  jwt.sign({ sub: userId }, config.jwt.secret, { expiresIn: MAX_AGE_SECONDS });

export const verifyAuthToken = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
    });
    return typeof payload === "object" && typeof payload.sub === "string"
      ? payload.sub
      : null;
  } catch {
    return null;
  }
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE, token, {
    ...cookieOptions,
    maxAge: MAX_AGE_SECONDS * 1000,
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
};
