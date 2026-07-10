import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DEFAULT_OUT_DIR = path.join(ROOT_DIR, "data", "phongvu-catalog");
const PRODUCT_SITEMAP_INDEX = "https://phongvu.vn/sitemap-collection-products.xml";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const args = parseArgs(process.argv.slice(2));
const outDir = path.resolve(args.outDir || DEFAULT_OUT_DIR);
const sitemapDir = path.join(outDir, "sitemaps");
const productsNdjsonPath = path.join(outDir, "products.ndjson");
const errorsNdjsonPath = path.join(outDir, "errors.ndjson");
const productUrlsPath = path.join(outDir, "product-urls.json");
const productsJsonPath = path.join(outDir, "products.json");
const productsCsvPath = path.join(outDir, "products.csv");
const errorsJsonPath = path.join(outDir, "errors.json");
const demoProductsJsonPath = path.join(outDir, "demo-products.json");
const demoProductsCsvPath = path.join(outDir, "demo-products.csv");
const demoByCategoryJsonPath = path.join(outDir, "demo-products-by-category.json");
const demoSummaryPath = path.join(outDir, "demo-summary.json");

const CATEGORY_NAMES = {
  "dien-may-dien-gia-dung": "Điện máy - Điện gia dụng",
  "dien-thoai-may-tinh-bang-phu-kien": "Điện thoại, Tablet, Phụ kiện",
  "do-gia-dung": "Đồ gia dụng",
  "giai-phap-doanh-nghiep": "Giải pháp doanh nghiệp",
  "h-gaming-gear": "Gaming Gear",
  "hang-thanh-ly": "Hàng thanh lý",
  laptop: "Laptop",
  "linh-kien-may-tinh": "Linh kiện máy tính",
  "man-hinh-may-tinh": "Màn hình máy tính",
  "may-tinh-de-ban": "PC - Máy tính để bàn",
  "phu-kien-chung": "Phụ kiện",
  "phu-kien-pc": "Phụ kiện máy tính",
  "san-pham-apple": "Sản phẩm Apple",
  "thiet-bi-am-thanh": "Thiết bị âm thanh",
  "thiet-bi-van-phong": "Thiết bị văn phòng",
};

await mkdir(sitemapDir, { recursive: true });

const productUrls = await discoverProductUrls();
await writeJson(productUrlsPath, productUrls);
console.log(`Found ${productUrls.length} product URLs. Saved ${relative(productUrlsPath)}.`);

if (args.discoverOnly) {
  process.exit(0);
}

if (args.rebuildOnly) {
  const { products, errors } = await rebuildOutputs();
  console.log(`Rebuilt ${relative(productsJsonPath)} and ${relative(productsCsvPath)} from ${products.length} products.`);
  if (errors.length) console.log(`Rebuilt ${relative(errorsJsonPath)} from ${errors.length} errors.`);
  process.exit(0);
}

if (args.demoSample) {
  const result = await buildDemoSample(productUrls);
  await rebuildOutputs();
  console.log(
    `Saved ${result.products.length} demo products to ${relative(demoProductsJsonPath)}, ` +
      `${relative(demoByCategoryJsonPath)}, and ${relative(demoProductsCsvPath)}.`,
  );
  console.log(`Saved demo summary to ${relative(demoSummaryPath)}.`);
  process.exit(0);
}

const existingProducts = await readNdjsonMap(productsNdjsonPath, "sourceUrl");
const existingErrors = await readNdjsonMap(errorsNdjsonPath, "sourceUrl");
const start = Math.max(0, Number(args.start || 0));
const limit = Number(args.limit || 0);
const selected = productUrls
  .slice(start, limit > 0 ? start + limit : undefined)
  .filter((item) => args.force || !existingProducts.has(item.url));

console.log(
  `Scraping ${selected.length} pages` +
    (existingProducts.size ? ` (${existingProducts.size} already saved)` : "") +
    ` with concurrency=${args.concurrency}, delay=${args.delayMs}ms.`,
);

let cursor = 0;
let saved = 0;
let failed = 0;

await Promise.all(
  Array.from({ length: args.concurrency }, (_, workerIndex) => worker(workerIndex + 1)),
);

const { products, errors } = await rebuildOutputs();

console.log(`Saved ${products.length} products to ${relative(productsJsonPath)} and ${relative(productsCsvPath)}.`);
if (errors.length) console.log(`Saved ${errors.length} errors to ${relative(errorsJsonPath)}.`);
console.log(`This run added ${saved} products and ${failed} errors.`);

async function worker(workerIndex) {
  while (cursor < selected.length) {
    const item = selected[cursor++];
    try {
      const product = await scrapeAndStoreProduct(item);
      saved += 1;
      if (saved % 25 === 0 || saved === selected.length) {
        console.log(`[${workerIndex}] saved ${saved}/${selected.length}: ${product.sku || product.name}`);
      }
    } catch (error) {
      failed += 1;
      const record = {
        sourceUrl: item.url,
        sitemapUrl: item.sitemapUrl,
        categorySlug: item.categorySlug,
        message: error.message,
        scrapedAt: new Date().toISOString(),
      };
      if (args.force || !existingErrors.has(item.url)) {
        await appendFile(errorsNdjsonPath, `${JSON.stringify(record)}\n`, "utf8");
      }
      console.warn(`[${workerIndex}] failed ${item.url}: ${error.message}`);
    }

    if (args.delayMs > 0) await sleep(args.delayMs);
  }
}

async function buildDemoSample(urls) {
  const productsMap = await readNdjsonMap(productsNdjsonPath, "sourceUrl");
  const errorsMap = await readNdjsonMap(errorsNdjsonPath, "sourceUrl");
  const urlsByCategory = groupProductUrlsByCategory(urls);
  const demoProducts = [];
  const summary = [];

  for (const [categorySlug, categoryUrls] of Object.entries(urlsByCategory)) {
    const target = Math.min(args.samplePerCategory, categoryUrls.length);
    const poolTarget = Math.min(Math.max(args.samplePoolSize, target), categoryUrls.length);
    let candidates = productsForCategory(productsMap, categorySlug);

    console.log(
      `Category ${categorySlug}: ${candidates.length}/${poolTarget} cached candidates, target ${target} demo products.`,
    );

    if (candidates.length < poolTarget) {
      const preferredUrls = pickSpread(categoryUrls, Math.min(categoryUrls.length, poolTarget * 2));
      const fallbackUrls = categoryUrls.filter((item) => !preferredUrls.some((preferred) => preferred.url === item.url));
      const fetchQueue = [...preferredUrls, ...fallbackUrls];
      const attempted = new Set();

      for (const item of fetchQueue) {
        if (pricedProducts(candidates).length >= poolTarget) break;
        if (productsMap.has(item.url) || attempted.has(item.url)) continue;

        attempted.add(item.url);
        try {
          const product = await scrapeAndStoreProduct(item);
          productsMap.set(product.sourceUrl, product);
          if (productBelongsToCategory(product, categorySlug)) candidates.push(product);
          console.log(`  saved ${categorySlug}: ${product.sku || product.name} - ${formatVnd(product.price)}`);
        } catch (error) {
          const record = {
            sourceUrl: item.url,
            sitemapUrl: item.sitemapUrl,
            categorySlug: item.categorySlug,
            message: error.message,
            scrapedAt: new Date().toISOString(),
          };
          if (!errorsMap.has(item.url)) {
            errorsMap.set(item.url, record);
            await appendFile(errorsNdjsonPath, `${JSON.stringify(record)}\n`, "utf8");
          }
          console.warn(`  failed ${item.url}: ${error.message}`);
        }

        if (args.delayMs > 0) await sleep(args.delayMs);
      }
    }

    candidates = uniqueBy(pricedProducts(candidates), "sourceUrl");
    const selected = pickPriceDiverse(candidates, target).map((product, index, selectedProducts) =>
      decorateDemoProduct(product, categorySlug, index, selectedProducts.length),
    );

    demoProducts.push(...selected);
    summary.push({
      categorySlug,
      categoryName: categoryName(categorySlug),
      sourceUrlCount: categoryUrls.length,
      candidateCount: candidates.length,
      selectedCount: selected.length,
      targetCount: target,
      minPrice: selected.length ? Math.min(...selected.map((product) => product.price)) : null,
      maxPrice: selected.length ? Math.max(...selected.map((product) => product.price)) : null,
      status: selected.length >= target ? "ok" : "partial",
    });
  }

  const productsByCategory = Object.fromEntries(
    Object.entries(groupBy(demoProducts, "categorySlug")).map(([categorySlug, products]) => [
      categorySlug,
      {
        categoryName: categoryName(categorySlug),
        products,
      },
    ]),
  );

  await writeJson(demoProductsJsonPath, demoProducts);
  await writeFile(demoProductsCsvPath, `\uFEFF${toDemoCsv(demoProducts)}`, "utf8");
  await writeJson(demoByCategoryJsonPath, productsByCategory);
  await writeJson(demoSummaryPath, summary);

  return { products: demoProducts, summary };
}

async function scrapeAndStoreProduct(item) {
  const html = await fetchText(item.url);
  const product = parseProductPage(html, item);
  await appendFile(productsNdjsonPath, `${JSON.stringify(product)}\n`, "utf8");
  return product;
}

async function discoverProductUrls() {
  const indexXml = await cachedFetch(PRODUCT_SITEMAP_INDEX);
  const sitemapUrls = extractSitemapUrls(indexXml);
  const productsByUrl = new Map();

  for (const sitemapUrl of sitemapUrls) {
    if (args.category && !sitemapUrl.includes(args.category)) continue;

    const xml = await cachedFetch(sitemapUrl);
    for (const item of extractUrlEntries(xml)) {
      if (!item.loc.includes("phongvu.vn/")) continue;

      const previous = productsByUrl.get(item.loc);
      const categorySlug = categoryFromSitemapUrl(sitemapUrl);
      if (previous) {
        previous.categorySlugs = [...new Set([...previous.categorySlugs, categorySlug])];
        previous.sitemapImages = [...new Set([...previous.sitemapImages, ...item.imageUrls])];
        continue;
      }

      productsByUrl.set(item.loc, {
        url: item.loc,
        sku: skuFromUrl(item.loc),
        slug: slugFromUrl(item.loc),
        lastmod: item.lastmod || null,
        sitemapUrl,
        categorySlug,
        categorySlugs: [categorySlug],
        sitemapImages: item.imageUrls,
      });
    }
  }

  return [...productsByUrl.values()];
}

async function rebuildOutputs() {
  const products = [...(await readNdjsonMap(productsNdjsonPath, "sourceUrl")).values()].sort((a, b) =>
    (a.sku || a.sourceUrl).localeCompare(b.sku || b.sourceUrl),
  );
  const errors = [...(await readNdjsonMap(errorsNdjsonPath, "sourceUrl")).values()];

  await writeJson(productsJsonPath, products);
  await writeFile(productsCsvPath, `\uFEFF${toCsv(products)}`, "utf8");
  await writeJson(errorsJsonPath, errors);

  return { products, errors };
}

async function cachedFetch(url) {
  const filePath = path.join(sitemapDir, cacheFileName(url));
  if (!args.force && (await exists(filePath))) return readFile(filePath, "utf8");

  const text = await fetchText(url);
  await writeFile(filePath, text, "utf8");
  return text;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), args.timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi,en-US;q=0.8,en;q=0.6",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseProductPage(html, sitemapEntry) {
  const jsonLd = extractJsonLd(html);
  const product = jsonLd.find((entry) => hasType(entry, "Product"));
  if (!product) {
    throw new Error("Product JSON-LD not found");
  }

  const breadcrumb = jsonLd.find((entry) => hasType(entry, "BreadcrumbList"));
  const meta = extractMeta(html);
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers || {};
  const imageList = normalizeArray(product.image)
    .concat(sitemapEntry.sitemapImages || [])
    .concat(meta.image ? [meta.image] : []);
  const specifications = normalizeArray(product.additionalProperty)
    .filter((item) => item && item.name)
    .map((item) => ({
      name: cleanText(item.name),
      value: cleanText(item.value),
    }));

  return {
    sourceUrl: sitemapEntry.url,
    productUrl: product.url || meta.canonical || sitemapEntry.url,
    slug: sitemapEntry.slug,
    sku: String(product.sku || sitemapEntry.sku || ""),
    name: cleanText(product.name || meta.title || ""),
    brand: cleanText(product.brand?.name || product.brand || ""),
    category: cleanText(product.category || ""),
    categorySlug: sitemapEntry.categorySlug,
    categorySlugs: sitemapEntry.categorySlugs,
    description: cleanText(product.description || meta.description || ""),
    price: numberOrNull(offer.price),
    priceCurrency: offer.priceCurrency || "VND",
    availability: cleanAvailability(offer.availability),
    itemCondition: cleanSchemaUrl(offer.itemCondition),
    image: firstUnique(imageList),
    images: unique(imageList),
    breadcrumbs: parseBreadcrumbs(breadcrumb),
    specifications,
    specificationMap: Object.fromEntries(specifications.map((item) => [item.name, item.value])),
    sitemapLastmod: sitemapEntry.lastmod,
    meta,
    scrapedAt: new Date().toISOString(),
  };
}

function extractJsonLd(html) {
  const blocks = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(regex)) {
    const raw = decodeHtml(match[1].trim());
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      blocks.push(...flattenJsonLd(parsed));
    } catch {
      continue;
    }
  }
  return blocks;
}

function flattenJsonLd(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (value["@graph"]) return flattenJsonLd(value["@graph"]);
  return [value];
}

function extractMeta(html) {
  const meta = {};
  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (title) meta.title = cleanText(decodeHtml(title[1]));

  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (canonical) meta.canonical = decodeHtml(canonical[1]);

  const metaRegex = /<meta\b([^>]+)>/gi;
  for (const match of html.matchAll(metaRegex)) {
    const attrs = match[1];
    const name = getAttr(attrs, "name") || getAttr(attrs, "property");
    const content = getAttr(attrs, "content");
    if (!name || !content) continue;

    const key = name.toLowerCase();
    if (key === "description" || key === "og:description") meta.description ||= cleanText(decodeHtml(content));
    if (key === "keywords") meta.keywords = cleanText(decodeHtml(content));
    if (key === "image" || key === "og:image") meta.image ||= decodeHtml(content);
    if (key === "title" || key === "og:title") meta.title ||= cleanText(decodeHtml(content));
  }

  return meta;
}

function getAttr(attrs, name) {
  const regex = new RegExp(`${name}=["']([^"']+)["']`, "i");
  return attrs.match(regex)?.[1] || "";
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi)]
    .map((match) => match[1].match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1])
    .filter(Boolean)
    .map((url) => decodeXml(url.trim()));
}

function extractUrlEntries(xml) {
  return [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => {
    const block = match[1];
    return {
      loc: decodeXml(block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1]?.trim() || ""),
      lastmod: decodeXml(block.match(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim() || ""),
      imageUrls: [...block.matchAll(/<image:loc\b[^>]*>([\s\S]*?)<\/image:loc>/gi)]
        .map((image) => decodeXml(image[1].trim()))
        .filter(Boolean),
    };
  });
}

function parseBreadcrumbs(breadcrumb) {
  return normalizeArray(breadcrumb?.itemListElement)
    .map((item) => ({
      position: item.position || null,
      name: cleanText(item.item?.name || item.name || ""),
      url: item.item?.["@id"] || item.item || "",
    }))
    .filter((item) => item.name);
}

function toCsv(products) {
  const columns = [
    "sku",
    "name",
    "brand",
    "category",
    "categorySlug",
    "price",
    "priceCurrency",
    "availability",
    "description",
    "image",
    "productUrl",
    "sitemapLastmod",
    "specificationsJson",
  ];
  const rows = products.map((product) => ({
    ...product,
    specificationsJson: JSON.stringify(product.specifications || []),
  }));
  return [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\n");
}

function toDemoCsv(products) {
  const columns = [
    "categoryName",
    "priceBand",
    "sku",
    "name",
    "brand",
    "price",
    "priceFormatted",
    "availability",
    "description",
    "keySpecs",
    "image",
    "productUrl",
  ];
  return [columns.join(","), ...products.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join(
    "\n",
  );
}

function decorateDemoProduct(product, categorySlug, index, total) {
  return {
    categorySlug,
    categoryName: categoryName(categorySlug),
    priceBand: priceBand(index, total),
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    priceFormatted: formatVnd(product.price),
    availability: product.availability,
    description: product.description,
    image: product.image,
    productUrl: product.productUrl,
    sourceUrl: product.sourceUrl,
    keySpecs: (product.specifications || [])
      .slice(0, 8)
      .map((item) => `${item.name}: ${item.value}`)
      .join("; "),
    specifications: product.specifications || [],
    specificationMap: product.specificationMap || {},
    scrapedAt: product.scrapedAt,
  };
}

function priceBand(index, total) {
  if (total <= 1) return "tham khảo";
  const ratio = index / (total - 1);
  if (ratio < 0.34) return "giá thấp";
  if (ratio < 0.67) return "giá tầm trung";
  return "giá cao";
}

function formatVnd(price) {
  if (!Number.isFinite(price)) return "";
  return `${new Intl.NumberFormat("vi-VN").format(price)} đ`;
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

async function readNdjsonMap(filePath, key) {
  const map = new Map();
  if (!(await exists(filePath))) return map;

  const text = await readFile(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record?.[key]) map.set(record[key], record);
    } catch {
      continue;
    }
  }
  return map;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(rawArgs) {
  const parsed = {
    concurrency: 1,
    delayMs: 1000,
    timeoutMs: 30000,
    limit: 0,
    start: 0,
    force: false,
    discoverOnly: false,
    rebuildOnly: false,
    demoSample: false,
    samplePerCategory: 10,
    samplePoolSize: 30,
    category: "",
    outDir: "",
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--force") parsed.force = true;
    else if (arg === "--discover-only") parsed.discoverOnly = true;
    else if (arg === "--rebuild-only") parsed.rebuildOnly = true;
    else if (arg === "--demo-sample") parsed.demoSample = true;
    else if (arg === "--limit") parsed.limit = Number(rawArgs[++index] || 0);
    else if (arg === "--start") parsed.start = Number(rawArgs[++index] || 0);
    else if (arg === "--concurrency") parsed.concurrency = Math.max(1, Number(rawArgs[++index] || 1));
    else if (arg === "--delay-ms") parsed.delayMs = Math.max(0, Number(rawArgs[++index] || 0));
    else if (arg === "--timeout-ms") parsed.timeoutMs = Math.max(5000, Number(rawArgs[++index] || 30000));
    else if (arg === "--sample-per-category") parsed.samplePerCategory = Math.max(1, Number(rawArgs[++index] || 10));
    else if (arg === "--sample-pool-size") parsed.samplePoolSize = Math.max(1, Number(rawArgs[++index] || 30));
    else if (arg === "--category") parsed.category = rawArgs[++index] || "";
    else if (arg === "--out-dir") parsed.outDir = rawArgs[++index] || "";
  }

  return parsed;
}

function cacheFileName(url) {
  const parsed = new URL(url);
  const base = path.basename(parsed.pathname) || "sitemap.xml";
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `${base.replace(/[^a-z0-9_.-]+/gi, "-")}-${hash}.xml`;
}

function categoryFromSitemapUrl(url) {
  return path
    .basename(new URL(url).pathname, ".xml")
    .replace(/^sitemap-collection-products-\d+-/, "");
}

function skuFromUrl(url) {
  return url.match(/--[sp](\d+)(?:$|[/?#])/i)?.[1] || "";
}

function slugFromUrl(url) {
  return path.basename(new URL(url).pathname).replace(/--[sp]\d+$/i, "");
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasType(entry, type) {
  return normalizeArray(entry?.["@type"]).some((entryType) => String(entryType).toLowerCase() === type.toLowerCase());
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "";
    if (!groups[value]) groups[value] = [];
    groups[value].push(item);
    return groups;
  }, {});
}

function groupProductUrlsByCategory(urls) {
  return urls.reduce((groups, item) => {
    const categorySlugs = normalizeArray(item.categorySlugs).length ? normalizeArray(item.categorySlugs) : [item.categorySlug];
    for (const categorySlug of categorySlugs) {
      if (!categorySlug) continue;
      if (!groups[categorySlug]) groups[categorySlug] = [];
      groups[categorySlug].push(item);
    }
    return groups;
  }, {});
}

function productsForCategory(productsMap, categorySlug) {
  return [...productsMap.values()].filter((product) => productBelongsToCategory(product, categorySlug));
}

function productBelongsToCategory(product, categorySlug) {
  return product.categorySlug === categorySlug || normalizeArray(product.categorySlugs).includes(categorySlug);
}

function pricedProducts(products) {
  return products.filter((product) => Number.isFinite(product.price) && product.price > 0);
}

function pickPriceDiverse(products, count) {
  const sorted = uniqueBy(products, "sourceUrl").sort((a, b) => a.price - b.price);
  if (sorted.length <= count) return sorted;

  const prices = sorted.map((product) => product.price).filter((price) => Number.isFinite(price) && price > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice === maxPrice) {
    return pickSpread(sorted, count);
  }

  const bucketCount = Math.min(8, count, sorted.length);
  const buckets = Array.from({ length: bucketCount }, () => []);
  const logMin = Math.log(minPrice);
  const logMax = Math.log(maxPrice);

  for (const product of sorted) {
    const ratio = (Math.log(product.price) - logMin) / Math.max(0.000001, logMax - logMin);
    const bucketIndex = Math.max(0, Math.min(bucketCount - 1, Math.floor(ratio * bucketCount)));
    buckets[bucketIndex].push(product);
  }

  const selected = [];
  const used = new Set();
  const bucketPicks = buckets.map((bucket) => pickSpread(bucket, Math.min(bucket.length, Math.ceil(count / bucketCount) + 1)));

  while (selected.length < count && bucketPicks.some((bucket) => bucket.length)) {
    for (const bucket of bucketPicks) {
      const product = bucket.shift();
      if (!product) continue;
      const key = product.sourceUrl || product.sku;
      if (used.has(key)) continue;
      selected.push(product);
      used.add(key);
      if (selected.length >= count) break;
    }
  }

  for (const product of pickSpread(sorted, count * 2)) {
    if (selected.length >= count) break;
    const key = product.sourceUrl || product.sku;
    if (used.has(key)) continue;
    selected.push(product);
    used.add(key);
  }

  for (const product of sorted) {
    if (selected.length >= count) break;
    const key = product.sourceUrl || product.sku;
    if (used.has(key)) continue;
    selected.push(product);
    used.add(key);
  }

  return selected.sort((a, b) => a.price - b.price);
}

function pickSpread(items, count) {
  if (items.length <= count) return [...items];
  if (count <= 1) return [items[0]];

  const selected = [];
  const used = new Set();
  for (let index = 0; index < count; index += 1) {
    const itemIndex = Math.round((index * (items.length - 1)) / (count - 1));
    if (used.has(itemIndex)) continue;
    used.add(itemIndex);
    selected.push(items[itemIndex]);
  }
  return selected;
}

function uniqueBy(items, key) {
  const seen = new Set();
  const uniqueItems = [];
  for (const item of items) {
    const value = item[key];
    if (!value || seen.has(value)) continue;
    seen.add(value);
    uniqueItems.push(item);
  }
  return uniqueItems;
}

function categoryName(categorySlug) {
  return CATEGORY_NAMES[categorySlug] || categorySlug.replaceAll("-", " ");
}

function firstUnique(values) {
  return unique(values)[0] || "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function cleanAvailability(value) {
  return cleanSchemaUrl(value || "");
}

function cleanSchemaUrl(value) {
  return String(value || "").split("/").filter(Boolean).pop() || "";
}

function numberOrNull(value) {
  if (value == null || value === "") return null;
  const number = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function cleanText(value) {
  return decodeHtml(String(value || ""))
    .replace(/<br\s*\/?>/gi, "; ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function decodeHtml(value) {
  return decodeXml(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function relative(filePath) {
  return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, "/");
}
