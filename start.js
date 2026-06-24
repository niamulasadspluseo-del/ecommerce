import http from "http";
import { spawn, execSync } from "child_process";
import { Writable } from "stream";
import { existsSync } from "fs";

const PORT = process.env.PORT || 8080;
const PHP_PORT = 8081;

// ---------- Laravel setup ----------
console.log("[start] Initializing Laravel...");
if (!existsSync("backend/database/database.sqlite")) {
  execSync("touch backend/database/database.sqlite", { stdio: "inherit" });
}
execSync("php artisan key:generate --force", { cwd: "backend", stdio: "inherit" });
execSync("php artisan migrate --force --seed", { cwd: "backend", stdio: "inherit" });
console.log("[start] Laravel ready");

// ---------- Start PHP backend ----------
const php = spawn("php", ["artisan", "serve", "--host=0.0.0.0", `--port=${PHP_PORT}`], {
  cwd: "backend",
  stdio: "inherit",
});
php.on("error", (e) => console.error("[start] PHP error:", e));

// ---------- Import SSR handler ----------
const { default: ssrHandler } = await import("./dist/server/server.js");

// Let PHP start
await new Promise((r) => setTimeout(r, 2000));

// ---------- Reverse proxy ----------
const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const url = req.url;

  if (url.startsWith("/api/") || url.startsWith("/sanctum/")) {
    // Proxy to Laravel PHP
    const opts = {
      hostname: "127.0.0.1",
      port: PHP_PORT,
      path: url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${PHP_PORT}` },
    };
    const proxyReq = http.request(opts, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on("error", () => {
      res.writeHead(502, { "content-type": "text/plain" });
      res.end("Backend unavailable");
    });
    proxyReq.end(body);
  } else {
    // SSR via TanStack Start / Nitro
    try {
      const requestUrl = new URL(url, `http://${req.headers.host || "localhost"}`);
      const headers = new Headers(req.headers);
      const init = { method: req.method, headers };
      if (body.length > 0) init.body = body;
      const response = await ssrHandler.fetch(new Request(requestUrl, init), {}, {});
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) {
        await response.body.pipeTo(Writable.toWeb(res));
      } else {
        res.end();
      }
    } catch (err) {
      console.error("[start] SSR error:", err);
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("Internal server error");
    }
  }
});

server.listen(PORT, () => console.log(`[start] Server running on port ${PORT}`));
