import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../envConfig.ts";

export const AUTH_COOKIE = "brainiac_token";

const ISSUER = "brainiac";
const MAX_AGE_SECONDS = config.jwt.expiresInDays * 24 * 60 * 60;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "lax",
  path: "/",
};

export interface AuthPayload {
  userId: string;
  tokenVersion: number;
}

export const signAuthToken = (userId: string, tokenVersion: number): string =>
  jwt.sign({ sub: userId, tv: tokenVersion }, config.jwt.secret, {
    algorithm: "HS256",
    expiresIn: MAX_AGE_SECONDS,
    issuer: ISSUER,
  });

export const verifyAuthToken = (token: string): AuthPayload | null => {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
      issuer: ISSUER,
    });
    if (
      typeof payload === "object" &&
      typeof payload.sub === "string" &&
      typeof payload.tv === "number"
    ) {
      return { userId: payload.sub, tokenVersion: payload.tv };
    }
    return null;
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
