import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.SUPABASE_DISABLE ??= "true";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const portArgIndex = process.argv.findIndex((arg) => arg === "--port");
const port = Number(process.env.PORT || (portArgIndex >= 0 ? process.argv[portArgIndex + 1] : 3000));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function createApiResponse(res) {
  let statusCode = 200;
  return {
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    status(status) {
      statusCode = status;
      return this;
    },
    json(data) {
      const body = JSON.stringify(data);
      send(res, statusCode, body, { "Content-Type": "application/json; charset=utf-8" });
    },
  };
}

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolveBody({});
      try {
        resolveBody(JSON.parse(body));
      } catch {
        resolveBody({});
      }
    });
    req.on("error", reject);
  });
}

async function handleApi(req, res, pathname) {
  const moduleMap = {
    "/api/chat": "./api/chat.js",
    "/api/track": "./api/track.js",
    "/api/leads": "./api/leads.js",
  };
  const modulePath = moduleMap[pathname];
  if (!modulePath) return false;

  try {
    const body = await readJsonBody(req);
    const mod = await import(`${pathToFileURL(join(root, modulePath)).href}?t=${Date.now()}`);
    await mod.default(
      {
        method: req.method,
        headers: req.headers,
        body,
      },
      createApiResponse(res),
    );
  } catch (error) {
    console.error(`API error for ${pathname}:`, error);
    send(res, 500, JSON.stringify({ error: "Local API failed", detail: error.message }), {
      "Content-Type": "application/json; charset=utf-8",
    });
  }

  return true;
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = resolve(root, `.${requested}`);

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
  }

  const ext = extname(filePath).toLowerCase();
  send(res, 200, readFileSync(filePath), {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (await handleApi(req, res, url.pathname)) return;
  serveStatic(req, res, url.pathname);
});

server.listen(port, () => {
  console.log(`Phong Vu demo server ready at http://localhost:${port}`);
  console.log("Local demo mode: SUPABASE_DISABLE=true, chat requires OPENAI_API_KEY");
});
