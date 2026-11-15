import { Elysia, t } from "elysia";
import { userJWT } from "./jwt.ts";
import mockApi from "./routes/mock.ts";
import adminApi from "./routes/admin.ts";
import authApi from "./routes/auth.ts";
import userApi from "./routes/user.ts";
import categoryApi from "./routes/categories.ts";
import productApi from "./routes/products.ts";

export const api = new Elysia({ prefix: "/api" })
  .use(userJWT)
  .use(mockApi)
  .use(adminApi)
  .use(authApi)
  .use(userApi)
  .use(categoryApi)
  .use(productApi);

export type App = typeof api;
