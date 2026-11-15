import Elysia, { t } from "elysia";

export default new Elysia()
  .get("/hello", () => ({
    message: `Hello from Elysia running on ${typeof Bun !== "undefined" ? "Bun" : "Node.js"}!`,
  }))
  .post(
    "/echo",
    ({ body }) => ({
      received: body.text.toUpperCase(),
    }),
    {
      body: t.Object({
        text: t.String(),
      }),
    }
  )