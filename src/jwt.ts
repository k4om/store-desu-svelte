import { Type as t, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

export const userSchema = t.Object({
  id: t.Integer(),
  email: t.String({ format: "email" }),
  firstName: t.String(),
  lastName: t.Optional(t.String()),
});

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

// Same secret as the Elysia version, so existing cookies keep working.
// Consider moving it to .env (e.g. process.env.JWT_SECRET) instead of source control.
const secret = new TextEncoder().encode("Fischl von Luftschloss Narfidort");

/**
 * Equivalent of `userjwt.sign(...)`. @elysiajs/jwt defaults to HS256 via jose,
 * so tokens signed here and by the old Elysia code are interchangeable.
 * Note: this also sets an expiry (the Elysia config didn't), matching the cookie lifetime.
 */
export const signToken = (payload: User & Record<string, unknown>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);

/** Equivalent of `userjwt.verify(...)`: the payload, or null if invalid. */
export const verifyToken = async (
  token: string,
): Promise<Static<typeof userSchema> | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Elysia's `schema: userSchema` validated the payload too.
    return Value.Check(userSchema, payload) ? payload : null;
  } catch {
    return null; // bad signature, expired, malformed...
  }
};