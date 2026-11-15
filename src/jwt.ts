import { t } from "elysia";
import jwt from "@elysiajs/jwt";

export const userSchema = t.Object({
  id: t.Integer(),
  email: t.String({ format: "email" }),
  firstName: t.String(),
  lastName: t.Optional(t.String()),
});

export const userJWT = jwt({
  name: "userjwt",
  secret: "Fischl von Luftschloss Narfidort",
  schema: userSchema,
});

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}