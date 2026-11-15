import { t } from "elysia";
import { defineTable, col, type InferEntity } from "./Database.ts";

export const userdb = defineTable({
  table: "users",
  primaryKey: "id",
  fields: {
    id: col("user_id", t.Number()),
    email: col("user_email", t.String()),
    pwhash: col("user_pwhash", t.String()),
    firstName: col("user_firstname", t.String()),
    lastName: col("user_lastname", t.Optional(t.String())),
    role: col("user_role", t.String()),
  },
});

export type User = InferEntity<typeof userdb>;
export type userid = User["id"];