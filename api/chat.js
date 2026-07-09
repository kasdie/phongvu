import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { faqItems } from "../data/chatbot-faq.js";
import {
  buildComparison,
  searchCatalog,
} from "../data/catalog-search.js";

function normalizeLanguage(language) {
  return String(language || "").toLowerCase().startsWith("en") ? "en" : "vi";
}

function languageName(language) {
  return normalizeLanguage(language) === "en" ? "English" : "Vietnamese";
}

function systemPromptForLanguage(language) {
  const targetLanguage = languageName(language);
  return `
You are Phong Vu's AI sales agent for an e-commerce demo.
Always write every customer-facing field in ${targetLanguage}, matching the storefront language mode.
Keep the tone concise, natural, sales-oriented, and directly focused on the shopper's question.

Mandatory rules:
- Do not use template answers. Read the provided grounded data and write a fresh answer.
- Prices, stock status, warranty, and technical specifications must only come from the provided catalog/policy/context.
- If catalog data is missing RAM/SSD/display/warranty details or looks stale, say that it needs to be checked.
- If the question is outside catalog/policy, you may answer with general knowledge, but do not invent Phong Vu-specific facts.
- When matching products exist, explain why they fit, the tradeoffs, and the next best action.
- Return valid JSON only. Do not wrap it in markdown fenced code.

Output schema:
{
  "reply": "string",
  "followUpQuestions": ["string"],
  "missingData": ["string"],
  "confidence": "high|medium|low"
}
`.trim();
}

function rewritePromptForLanguage(language) {
  const targetLanguage = languageName(language);
  return `
Rewrite this assistant JSON payload so every customer-facing field is natural ${targetLanguage}.
Preserve product names, SKUs, prices, stock status, warranty terms, and specifications exactly when they are catalog data.
Do not add new facts, recommendations, products, prices, or policy claims.
Return valid JSON only with the same schema:
{
  "reply": "string",
  "followUpQuestions": ["string"],
  "missingData": ["string"],
  "confidence": "high|medium|low"
}
`.trim();
}

const fastModel = process.env.OPENAI_MODEL || "gpt-5.4-mini";

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

let catalogCache = null;

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

function loadCatalog() {
  if (catalogCache) return catalogCache;

  const catalogPath = join(process.cwd(), "data", "phongvu-catalog", "demo-products.json");
  if (!existsSync(catalogPath)) {
    catalogCache = [];
    return catalogCache;
  }

  catalogCache = JSON.parse(readFileSync(catalogPath, "utf8"));
  return catalogCache;
}

function isPolicyMessage(message) {
  const normalized = String(message || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  return [
    "bao hanh",
    "doi tra",
    "giao hang",
    "tra gop",
    "hoa don",
    "vat",
    "hotline",
    "don hang",
    "ship",
  ].some((keyword) => normalized.includes(keyword));
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s%.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value, maxLength = 900) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function findPolicyKnowledge(message, limit = 3) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) return [];

  return faqItems
    .map((item) => {
      const score = item.keywords.reduce((total, keyword) => {
        return normalizedMessage.includes(normalizeText(keyword)) ? total + 1 : total;
      }, 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => ({
      title: item.title,
      keywords: item.keywords,
      policyKnowledge: item.answer,
    }));
}

function uniqueBySku(products = []) {
  return [...new Map(products.filter(Boolean).map((product) => [product.sku, product])).values()];
}

function productsFromContext(catalog, context) {
  const skus = [
    ...(Array.isArray(context.shortlistedProductSkus) ? context.shortlistedProductSkus : []),
    ...(Array.isArray(context.viewedProductSkus) ? context.viewedProductSkus : []),
  ];
  return uniqueBySku(skus.map((sku) => catalog.find((product) => product.sku === sku)));
}

function sourceProductsFromResult(catalog, catalogResult, context) {
  const bySku = new Map(catalog.map((product) => [product.sku, product]));
  const recommendationProducts = (catalogResult.recommendations || [])
    .map((item) => bySku.get(item.sku))
    .filter(Boolean);
  const contextProducts = productsFromContext(catalog, context);
  const products = catalogResult.isComparison
    ? [...(catalogResult.comparisonProducts || []), ...contextProducts, ...recommendationProducts]
    : [...contextProducts, ...recommendationProducts];

  return uniqueBySku(products).slice(0, catalogResult.isComparison ? 2 : 5);
}

function productForAi(product) {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    price: product.price,
    priceFormatted: product.priceFormatted,
    availability: product.availability,
    productUrl: product.productUrl,
    scrapedAt: product.scrapedAt,
    description: compactText(product.description, 700),
    keySpecs: compactText(product.keySpecs, 1200),
    specifications: Array.isArray(product.specifications)
      ? product.specifications
          .filter((item) => item?.name && item?.value)
          .map((item) => ({ name: item.name, value: item.value }))
      : [],
  };
}

function buildGroundedInput({ message, context, catalogResult, sourceProducts, policyKnowledge, comparison, language }) {
  const targetLanguage = languageName(language);
  return [
    `User message: ${message}`,
    `Storefront language mode: ${targetLanguage}`,
    `Storefront context: ${JSON.stringify(context)}`,
    `Retrieval summary: ${JSON.stringify({
      category: catalogResult.category,
      budget: catalogResult.budget,
      need: catalogResult.need,
      isComparison: catalogResult.isComparison,
      recommendationCount: catalogResult.recommendations?.length || 0,
    })}`,
    `Source products from catalog: ${JSON.stringify(sourceProducts.map(productForAi))}`,
    `Prebuilt structured recommendations: ${JSON.stringify(catalogResult.recommendations || [])}`,
    comparison ? `Prebuilt comparison table from full catalog specs: ${JSON.stringify(comparison)}` : "",
    policyKnowledge.length ? `Policy knowledge snippets for AI to read, not templates to copy: ${JSON.stringify(policyKnowledge)}` : "",
    [
      `Answer the user's exact question in ${targetLanguage}.`,
      "If the user asks for a comparison, summarize the two choices, key pros/cons, and which one to choose for the stated need.",
      "If the user asks for search or recommendations, justify the products using Source products.",
      "If no product/policy data is relevant, answer with general knowledge and ask for the missing details.",
      "Return only valid JSON that follows the requested schema.",
    ].join("\n"),
  ].filter(Boolean).join("\n\n");
}

function extractJsonObject(text) {
  const value = String(text || "").trim();
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(value.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function fallbackReply(language) {
  return normalizeLanguage(language) === "en"
    ? "I could not generate a reliable answer yet. Please try again with a little more detail."
    : "Mình chưa tạo được câu trả lời đủ tin cậy. Bạn thử hỏi lại với thêm một chút thông tin nhé.";
}

function normalizeAiPayload(outputText, language = "vi") {
  const parsed = extractJsonObject(outputText);
  if (!parsed || typeof parsed !== "object") {
    return {
      reply: outputText?.trim() || fallbackReply(language),
      followUpQuestions: [],
      missingData: [],
      confidence: "medium",
    };
  }

  return {
    reply: String(parsed.reply || "").trim(),
    followUpQuestions: Array.isArray(parsed.followUpQuestions)
      ? parsed.followUpQuestions.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [],
    missingData: Array.isArray(parsed.missingData)
      ? parsed.missingData.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [],
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
  };
}

function normalizeForLanguageCheck(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function payloadLanguageText(payload) {
  return normalizeForLanguageCheck([
    payload.reply,
    ...(payload.followUpQuestions || []),
    ...(payload.missingData || []),
  ].join(" "));
}

function looksVietnamese(payload) {
  const normalized = payloadLanguageText(payload);
  if (!normalized) return false;

  const padded = ` ${normalized} `;
  const markers = [
    " minh ",
    " ban ",
    " nen ",
    " gia ",
    " bao hanh ",
    " san pham ",
    " lua chon ",
    " so sanh ",
    " can kiem tra ",
    " phu hop ",
    " con hang ",
    " het hang ",
    " ngan sach ",
    " khach ",
    " duoc ",
    " voi ",
    " hoac ",
    " neu ",
    " chon ",
    " trong ",
    " duoi ",
  ];
  return markers.filter((marker) => padded.includes(marker)).length >= 2;
}

function looksEnglish(payload) {
  const normalized = normalizeForLanguageCheck([
    payload.reply,
    ...(payload.followUpQuestions || []),
    ...(payload.missingData || []),
  ].join(" "));
  if (!normalized) return false;

  const padded = ` ${normalized} `;
  const markers = [
    " the ",
    " you ",
    " should ",
    " choose ",
    " price ",
    " stock ",
    " warranty ",
    " recommend ",
    " because ",
    " product ",
    " option ",
    " budget ",
    " compare ",
    " suitable ",
    " available ",
  ];
  return markers.filter((marker) => padded.includes(marker)).length >= 3;
}

function needsLocaleRewrite(payload, language) {
  return normalizeLanguage(language) === "en" ? looksVietnamese(payload) : looksEnglish(payload);
}

function localeRewriteFallback(language) {
  return normalizeLanguage(language) === "en"
    ? {
        reply: "I found relevant catalog information, but I could not safely format the answer in English. Please ask again with the exact products, budget, or SKU.",
        followUpQuestions: ["Which products or SKUs should I compare?", "What budget range should I use?"],
        missingData: [],
        confidence: "low",
      }
    : {
        reply: "Mình đã tìm thấy dữ liệu catalog liên quan, nhưng chưa định dạng câu trả lời tiếng Việt đủ an toàn. Bạn vui lòng hỏi lại với đúng sản phẩm, ngân sách hoặc SKU nhé.",
        followUpQuestions: ["Bạn muốn so sánh những sản phẩm hoặc SKU nào?", "Mình nên dùng khoảng ngân sách nào?"],
        missingData: [],
        confidence: "low",
      };
}

async function ensureLocalePayload(openai, payload, language) {
  if (!needsLocaleRewrite(payload, language)) return payload;

  try {
    const rewrite = await withTimeout(
      openai.responses.create({
        model: fastModel,
        instructions: rewritePromptForLanguage(language),
        input: JSON.stringify(payload),
      }),
      7000,
      "OpenAI locale rewrite",
    );

    const rewrittenPayload = normalizeAiPayload(rewrite.output_text, language);
    return rewrittenPayload.reply ? rewrittenPayload : payload;
  } catch (error) {
    console.warn("Could not rewrite assistant answer for locale:", error.message);
    return localeRewriteFallback(language);
  }
}

function sourceLabel({ sourceProducts, policyKnowledge }) {
  if (sourceProducts.length && policyKnowledge.length) return "ai_catalog_policy_grounded";
  if (sourceProducts.length) return "ai_catalog_grounded";
  if (policyKnowledge.length) return "ai_policy_grounded";
  return "openai";
}

async function saveMessage(supabase, sessionId, role, content) {
  if (!supabase || !sessionId) return;

  try {
    const { error } = await withTimeout(
      supabase.from("chat_messages").insert({
        session_id: sessionId,
        role,
        content,
      }),
      2500,
      "Supabase saveMessage",
    );

    if (error) {
      console.warn("Could not save chat message:", error.message);
    }
  } catch (error) {
    console.warn("Could not save chat message:", error.message);
  }
}

async function createSession(supabase) {
  if (!supabase) return null;

  let result;
  try {
    result = await withTimeout(
      supabase
        .from("chat_sessions")
        .insert({})
        .select("id")
        .single(),
      2500,
      "Supabase createSession",
    );
  } catch (error) {
    console.warn("Could not create chat session:", error.message);
    return null;
  }

  const { data, error } = result;
  if (error) {
    console.warn("Could not create chat session:", error.message);
    return null;
  }

  return data?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const message = String(req.body?.message || "").trim();
  let sessionId = req.body?.sessionId || null;
  const context = req.body?.context && typeof req.body.context === "object" ? req.body.context : {};
  const language = normalizeLanguage(req.body?.language || context.language);
  const localizedContext = { ...context, language };

  if (!message) {
    return sendJson(res, 400, { error: "Message is required" });
  }

  const supabase =
    process.env.SUPABASE_DISABLE !== "true" &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : null;

  try {
    if (!sessionId) {
      sessionId = await createSession(supabase);
    }

    await saveMessage(supabase, sessionId, "user", message);

    if (!process.env.OPENAI_API_KEY) {
      return sendJson(res, 503, {
        error: "OPENAI_NOT_CONFIGURED",
        detail: "AI-first answers require OPENAI_API_KEY.",
        sessionId,
      });
    }

    const catalog = loadCatalog();
    const catalogResult = searchCatalog(catalog, { message, context: localizedContext, limit: 5 });
    const policyIntent = isPolicyMessage(message);
    const contextProducts = productsFromContext(catalog, localizedContext);
    const retrievedProducts = sourceProductsFromResult(catalog, catalogResult, localizedContext);
    const sourceProducts = policyIntent
      ? uniqueBySku([...contextProducts, ...retrievedProducts.slice(0, 1)])
      : retrievedProducts;
    const responseRecommendations = policyIntent ? [] : catalogResult.recommendations || [];
    const comparison = catalogResult.isComparison
      ? buildComparison(sourceProducts.length >= 2 ? sourceProducts : catalogResult.comparisonProducts, { budget: catalogResult.budget, language })
      : null;
    const policyKnowledge = policyIntent ? findPolicyKnowledge(message) : [];

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await withTimeout(
      openai.responses.create({
        model: fastModel,
        instructions: systemPromptForLanguage(language),
        input: buildGroundedInput({
          message,
          context: localizedContext,
          catalogResult,
          sourceProducts,
          policyKnowledge,
          comparison,
          language,
        }),
      }),
      10000,
      "OpenAI grounded answer",
    );

    const aiPayload = await ensureLocalePayload(openai, normalizeAiPayload(response.output_text, language), language);
    const reply = aiPayload.reply || fallbackReply(language);

    await saveMessage(supabase, sessionId, "assistant", reply);

    return sendJson(res, 200, {
      reply,
      recommendations: responseRecommendations,
      comparison,
      followUpQuestions: aiPayload.followUpQuestions,
      missingData: aiPayload.missingData,
      confidence: aiPayload.confidence,
      sourceProducts: sourceProducts.map((product) => product.sku),
      sessionId,
      language,
      source: sourceLabel({ sourceProducts, policyKnowledge }),
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
