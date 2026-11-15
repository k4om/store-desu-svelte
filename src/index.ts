import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";

// import mockApi from "./routes/mock.ts"; // TODO: convert mock.ts and mount it below
import adminApi from "./routes/admin.ts";
import authApi from "./routes/auth.ts";
import userApi from "./routes/user.ts";
import categoryApi from "./routes/categories.ts";
import productApi from "./routes/products.ts";

// Mounted by the app at "/api" (see production.ts): app.use("/api", api)
export const api = Router();

// Body / cookie parsing lives here so every route (and requireRole) can rely on it.
api.use(express.json());
// Plain HTML <form method="post"> submissions (e.g. login/register) arrive as
// application/x-www-form-urlencoded. Elysia parsed these automatically; Express does not.
api.use(express.urlencoded({ extended: false }));
api.use(cookieParser());

// Each sub-router replaces an Elysia `prefix`.
// api.use("/mock", mockApi);
api.use("/admin", adminApi);
api.use("/auth", authApi);
api.use("/me", userApi);
api.use("/category", categoryApi);
api.use("/product", productApi);

// Unknown /api routes -> JSON 404 (so they never fall through to the SPA's index.html).
api.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler (also catches rejected promises from async handlers in Express 5).
api.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // express.json() sets err.status = 400 for malformed JSON bodies.
  const status =
    typeof err?.status === "number" && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  if (status >= 500) console.error("[api] unhandled error:", err);

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : (err.message ?? "Error"),
  });
});