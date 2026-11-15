import type { CookieOptions, NextFunction, Request, Response } from "express";

import { userdb } from "./db/userdb.ts";
import { DBError } from "./db/core.ts";
import { SESSION_MAX_AGE, verifyToken } from "./jwt.ts";

// Routes import signToken from here; it lives in jwt.ts.
export { signToken } from "./jwt.ts";

export const AUTH_COOKIE = "auth";

/**
 * Options for res.cookie(AUTH_COOKIE, token, authCookieOptions).
 * Note: Express's `maxAge` is in MILLISECONDS (Elysia's was seconds).
 */
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: SESSION_MAX_AGE * 1000,
  path: "/",
};

export const Unauthorized = { message: "Unauthorized" } as const;
export const Forbidden = { message: "Forbidden" } as const;

/* --------------------------- req.user type augmentation ----------------------- */

type FoundUser = Exclude<Awaited<ReturnType<typeof userdb.getBy>>, null | undefined>;
export type AuthUser = Omit<FoundUser, "pwhash">;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/* -------------------------------- Middleware --------------------------------- */

/**
 * Express equivalent of the Elysia `role` macro.
 * Requires `cookie-parser` to be installed: app.use(cookieParser())
 */
export const requireRole =
  (required: "user" | "admin") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[AUTH_COOKIE];

      if (typeof token !== "string" || token.length === 0) {
        return res.status(401).json(Unauthorized);
      }

      const profile = await verifyToken(token);
      if (!profile) return res.status(401).json(Unauthorized);

      // Does the user still exist? What is their role right now?
      const found = await userdb.getBy("id", profile.id);
      if (!found || found instanceof DBError) {
        return res.status(401).json(Unauthorized);
      }

      // Enough privilege?
      if (required === "admin" && found.role !== "admin") {
        return res.status(403).json(Forbidden);
      }

      // Don't expose the password hash to handlers.
      const { pwhash: _password, ...user } = found;
      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  };