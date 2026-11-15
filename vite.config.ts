import { defineConfig, loadEnv, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { Readable } from "node:stream";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Loads all .env variables from project root into process.env for Elysia
  const env = loadEnv(mode, path.resolve("."), "");
  Object.assign(process.env, env);

  return {
    root: "svelte/",
    envDir: path.resolve("."),
    plugins: [tailwindcss(), svelte(), elysiaDevPlugin("../src/index.ts")],
    optimizeDeps: {
      exclude: ["@milizt/runeway"],
    },

    server: {
      host: true,
      port: 5173,
      allowedHosts: ["archlinux.local"]
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

function elysiaDevPlugin(entry = "/src/server/api.ts"): Plugin {
  return {
    name: "elysia-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();

        try {
          // Loads & hot-reloads your TypeScript API via Vite's module graph
          const mod = await server.ssrLoadModule(entry);
          const app = mod.api || mod.default;

          const url = new URL(
            req.url,
            `http://${req.headers.host || "localhost"}`,
          );
          const hasBody = req.method !== "GET" && req.method !== "HEAD";

          const webRequest = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: hasBody
              ? (Readable.toWeb(req) as unknown as ReadableStream)
              : undefined,
            // @ts-expect-error required by Node's fetch Request for streaming bodies
            duplex: "half",
          });

          const webResponse: Response = await app.handle(webRequest);

          res.statusCode = webResponse.status;
          webResponse.headers.forEach((value, key) =>
            res.setHeader(key, value),
          );

          if (webResponse.body) {
            Readable.fromWeb(webResponse.body as any).pipe(res);
          } else {
            res.end();
          }
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          next(err);
        }
      });
    },
  };
}
