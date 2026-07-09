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

function cleanPhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "").slice(0, 20);
}

function cleanEmail(email) {
  const value = String(email || "").trim().toLowerCase().slice(0, 160);
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const name = String(req.body?.name || "").trim().slice(0, 120);
  const phone = cleanPhone(req.body?.phone);
  const email = cleanEmail(req.body?.email);
  const need = String(req.body?.need || "").trim().slice(0, 1000);
  const preferredContactTime = String(req.body?.preferredContactTime || "").trim().slice(0, 160);
  const consent = req.body?.consent === true;

  if (!name || !phone || !consent) {
    return sendJson(res, 400, {
      error: "Lead requires name, phone, and consent",
    });
  }

  const supabase =
    process.env.SUPABASE_DISABLE !== "true" &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : null;

  let leadId = `local-${Date.now()}`;
  const budgetRange = req.body?.budgetRange || {};

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("sales_leads")
          .insert({
            session_id: req.body?.sessionId || null,
            name,
            phone,
            email,
            need: need || "Cần tư vấn sản phẩm",
            budget_min: Number.isFinite(Number(budgetRange.min)) ? Number(budgetRange.min) : null,
            budget_max: Number.isFinite(Number(budgetRange.max)) ? Number(budgetRange.max) : null,
            preferred_contact_time: preferredContactTime || null,
            status: "new",
          })
          .select("id")
          .single(),
        2500,
        "Supabase lead insert",
      );

      if (error) {
        console.warn("Could not save sales lead:", error.message);
      } else if (data?.id) {
        leadId = data.id;
      }
    } catch (error) {
      console.warn("Could not save sales lead:", error.message);
    }
  }

  return sendJson(res, 200, {
    ok: true,
    leadId,
    stored: Boolean(supabase),
  });
}
