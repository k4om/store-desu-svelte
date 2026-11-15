import Elysia, { t } from "elysia";
import { userJWT } from "./jwt.ts";
import { userdb } from "./db/userdb.ts";
import { DBError } from "./db/core.ts";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export const authCookie = t.Cookie(
  { auth: t.Optional(t.Nullable(t.String())) },
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  },
);

export const Unauthorized = { message: "Unauthorized" } as const;
export const Forbidden = { message: "Forbidden" } as const;

export const roleBasedAccessLimiter = new Elysia({ name: "auth" })
  .use(userJWT)
  .macro({
    role: (required: "user" | "admin") => ({
      cookie: authCookie,
      async resolve({ userjwt, cookie: { auth }, status }) {
        const token: string = auth.value as string;

        console.log("Cookie value:", typeof token, token?.length);

        if (typeof token !== "string") {
          console.log("Missing cookie value");
          return status(401, Unauthorized);
        }

        const profile = await userjwt.verify(token);

        console.log("Verified JWT:", profile);

        if (!profile) {
          console.log("JWT verification failed");
          return status(401, Unauthorized);
        }

        // 2. Does the user still exist? What is their role right now?
        const found = await userdb.getBy("id", profile.id);
        if (!found || found instanceof DBError) {
          return status(401, Unauthorized);
        }

        // 3. Enough privilege?
        if (required === "admin" && found.role !== "admin") {
          return status(403, Forbidden);
        }

        // Don't expose the password hash to handlers.
        const { pwhash: _password, ...user } = found;
        return { user };
      },
    }),
  });
