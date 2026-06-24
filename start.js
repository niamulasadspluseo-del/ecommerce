import http from "http";
import { spawn, execSync } from "child_process";
import { Writable } from "stream";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const PORT = process.env.PORT || 8080;
const PHP_PORT = 8081;
const CLIENT_DIR = "dist/client";

const MIME = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain",
};

// ---------- Laravel setup ----------
console.log("[start] Initializing Laravel...");

// Override .env with Render env vars so Laravel picks them up
const ENV_OVERRIDES = ["DB_CONNECTION", "DB_URL", "APP_KEY", "APP_ENV", "APP_DEBUG", "SESSION_DRIVER", "CACHE_STORE", "QUEUE_CONNECTION", "FRONTEND_URL"];
let envContent = readFileSync("backend/.env", "utf-8");
for (const key of ENV_OVERRIDES) {
  if (process.env[key]) {
    const re = new RegExp(`^${key}=.*`, "m");
    if (re.test(envContent)) {
      envContent = envContent.replace(re, `${key}=${process.env[key]}`);
    } else {
      envContent += `\n${key}=${process.env[key]}`;
    }
  }
}
writeFileSync("backend/.env", envContent);

if (!process.env.DB_CONNECTION || process.env.DB_CONNECTION === "sqlite") {
  if (!existsSync("backend/database/database.sqlite")) {
    execSync("touch backend/database/database.sqlite", { stdio: "inherit" });
  }
}
if (!process.env.APP_KEY) {
  execSync("php artisan key:generate --force", { cwd: "backend", stdio: "inherit" });
}
// Ensure DB and run migrations
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

  // API → Laravel PHP
  if (url.startsWith("/api/") || url.startsWith("/sanctum/")) {
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
    return;
  }

  // Static assets → serve from dist/client directly
  const assetPath = url.split("?")[0];
  const filePath = path.join(CLIENT_DIR, assetPath.replace(/^\//, ""));
  const ext = path.extname(filePath).toLowerCase();
  if (ext && MIME[ext] && existsSync(filePath)) {
    try {
      const content = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  // Everything else → SSR handler
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
});

server.listen(PORT, () => console.log(`[start] Server running on port ${PORT}`));
