import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadLocalEnv();

function sendJson(res, status, data) {
  res.status(status).json(data);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const eventName = String(req.body?.eventName || "").trim();
  if (!eventName) {
    return sendJson(res, 400, { error: "eventName is required" });
  }

  const supabase =
    process.env.SUPABASE_DISABLE !== "true" &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : null;

  if (supabase) {
    try {
      const { error } = await withTimeout(
        supabase.from("analytics_events").insert({
          session_id: req.body?.sessionId || null,
          anonymous_user_id: req.body?.anonymousUserId || null,
          event_name: eventName,
          payload: req.body?.payload || {},
        }),
        2000,
        "Supabase analytics insert",
      );

      if (error) {
        console.warn("Could not save analytics event:", error.message);
      }
    } catch (error) {
      console.warn("Could not save analytics event:", error.message);
    }
  }

  return sendJson(res, 200, {
    ok: true,
    stored: Boolean(supabase),
  });
}
