import { defineConfig, loadEnv, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import express from "express";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Loads all .env variables from project root into process.env for the API
  const env = loadEnv(mode, path.resolve("."), "");
  Object.assign(process.env, env);

  return {
    root: "svelte/",
    envDir: path.resolve("."),
    plugins: [tailwindcss(), svelte(), expressDevPlugin("../src/index.ts")],
    optimizeDeps: {
      exclude: ["@milizt/runeway"],
    },

    server: {
      host: true,
      port: 5173,
      allowedHosts: ["archlinux.local"],
    },

    resolve: {
      alias: {
        $lib: path.resolve("svelte/lib"),
        $server: path.resolve("src"),
      },
    },

    publicDir: "../public",

    build: {
      outDir: "../dist",
      emptyOutDir: true,
    },
  };
});

function expressDevPlugin(entry = "/src/server/api.ts"): Plugin {
  return {
    name: "express-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();

        try {
          // Loads & hot-reloads your TypeScript API via Vite's module graph
          const mod = await server.ssrLoadModule(entry);
          const api = mod.api || mod.default;

          // An Express Router is just a (req, res, next) handler, so no Request/Response
          // conversion is needed. It must run inside an Express app, though: the app is
          // what adds res.json(), res.status(), res.cookie(), etc. to Node's raw objects.
          // Rebuilt per request so it always uses the freshly reloaded router.
          const app = express();
          app.use("/api", api);

          app(req as express.Request, res as express.Response, next);
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          next(err);
        }
      });
    },
  };
}