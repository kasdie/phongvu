import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const systemPrompt = `
Ban la tro ly ao cua Phong Vu. Hay tra loi bang tieng Viet, ngan gon,
than thien va uu tien tu van laptop, PC, linh kien, man hinh, khuyen mai.
Neu chua du thong tin, hay hoi them nhu cau, ngan sach, muc dich su dung.
`.trim();

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

async function saveMessage(supabase, sessionId, role, content) {
  if (!sessionId) return;

  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role,
    content,
  });

  if (error) {
    console.warn("Could not save chat message:", error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, {
      error: "OPENAI_NOT_CONFIGURED",
      detail: "OpenAI API key is not configured yet.",
    });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(res, 503, {
      error: "SUPABASE_NOT_CONFIGURED",
      detail: "Supabase environment variables are not configured yet.",
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const message = String(req.body?.message || "").trim();
  let sessionId = req.body?.sessionId || null;

  if (!message) {
    return sendJson(res, 400, { error: "Message is required" });
  }

  try {
    if (!sessionId) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({})
        .select("id")
        .single();

      if (!error) {
        sessionId = data?.id || null;
      }
    }

    await saveMessage(supabase, sessionId, "user", message);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      instructions: systemPrompt,
      input: message,
    });

    const reply =
      response.output_text?.trim() ||
      "Xin loi, hien tai minh chua tao duoc cau tra loi. Ban thu lai giup minh nhe.";

    await saveMessage(supabase, sessionId, "assistant", reply);

    return sendJson(res, 200, {
      reply,
      sessionId,
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || error.error?.code || "";
    const message = error.message || "Unknown error";

    console.error("Chat API error:", {
      status,
      code,
      message,
      requestId: error.request_id,
    });

    if (status === 429 && code === "insufficient_quota") {
      return sendJson(res, 429, {
        error: "OPENAI_QUOTA_EXCEEDED",
        detail: "OpenAI API quota is exhausted. Check billing, credits, or project limits.",
      });
    }

    if (status === 429) {
      return sendJson(res, 429, {
        error: "OPENAI_RATE_LIMITED",
        detail: "OpenAI API rate limit was reached. Try again later.",
      });
    }

    return sendJson(res, 500, {
      error: "Chat API failed",
      detail: message,
    });
  }
}
