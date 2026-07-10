export function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(normalizedText, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;
  const pattern = normalizedKeyword
    .split(" ")
    .filter(Boolean)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(`(^|\\s)${pattern}(?=\\s|$)`).test(normalizedText);
}

function hasAnyKeyword(normalizedText, keywords = []) {
  return keywords.some((keyword) => hasKeyword(normalizedText, keyword));
}

export function formatVnd(value) {
  if (!Number.isFinite(Number(value))) return "Contact for price";
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}

function normalizeLanguage(language) {
  return String(language || "").toLowerCase().startsWith("en") ? "en" : "vi";
}

function textFor(language, viText, enText) {
  return normalizeLanguage(language) === "en" ? enText : viText;
}

export function inferCategoryFromText(text) {
  const normalized = normalizeText(text);
  if (hasAnyKeyword(normalized, ["mac", "macbook", "mac mini", "imac", "iphone", "ipad", "apple"])) return "san-pham-apple";
  if (hasAnyKeyword(normalized, ["laptop", "may tinh xach tay"])) return "laptop";
  const rules = [
    ["san-pham-apple", ["mac", "macbook", "mac mini", "imac", "iphone", "ipad", "apple"]],
    ["may-tinh-de-ban", ["pc", "may tinh ban", "desktop pc", "build pc"]],
    ["man-hinh-may-tinh", ["man hinh", "monitor", "144hz", "2k", "4k"]],
    ["h-gaming-gear", ["gaming gear", "chuot gaming", "ban phim gaming", "tai nghe gaming"]],
    ["phu-kien-pc", ["phu kien pc", "chuot", "mouse", "ban phim", "keyboard", "lot chuot", "mousepad"]],
    ["thiet-bi-van-phong", ["may in", "van phong", "muc in"]],
    ["thiet-bi-am-thanh", ["tai nghe", "headphone", "headset", "loa", "speaker"]],
    ["linh-kien-may-tinh", ["cpu", "ram", "ssd", "hdd", "vga", "card man hinh", "mainboard", "nguon", "case"]],
    ["laptop", ["laptop", "hoc lap trinh", "sinh vien", "van phong", "gaming"]],
  ];
  return rules.find(([, words]) => hasAnyKeyword(normalized, words))?.[0] || "";
}

export function inferNeedFromText(text, language = "vi") {
  const normalized = normalizeText(text);
  if (normalized.includes("hoc lap trinh")) return textFor(language, "Học lập trình", "Programming");
  if (normalized.includes("sinh vien") || normalized.includes("hoc tap")) return textFor(language, "Học tập", "Study");
  if (normalized.includes("gaming") || normalized.includes("choi game")) return "Gaming";
  if (normalized.includes("do hoa") || normalized.includes("render")) return textFor(language, "Đồ họa", "Graphics");
  if (normalized.includes("van phong") || normalized.includes("excel")) return textFor(language, "Văn phòng", "Office work");
  return "";
}

export function parseBudgetFromText(text) {
  const normalized = normalizeText(text);
  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi)\s*(\d+(?:\.\d+)?)\s*(?:trieu|tr|m)/);
  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]) * 1000000,
      max: Number(rangeMatch[2]) * 1000000,
      strictMax: true,
    };
  }

  const thousandRangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi)\s*(\d+(?:\.\d+)?)\s*(?:k|nghin|ngan)/);
  if (thousandRangeMatch) {
    return {
      min: Number(thousandRangeMatch[1]) * 1000,
      max: Number(thousandRangeMatch[2]) * 1000,
      strictMax: true,
    };
  }

  const strictBudget = [
    "duoi",
    "toi da",
    "under",
    "chi co",
    "ngan sach toi da",
    "budget toi chi co",
    "budget chi co",
  ].some((keyword) => normalized.includes(keyword));

  const thousandMatch = normalized.match(/(?:duoi|toi da|tam|khoang|under)?\s*(\d+(?:\.\d+)?)\s*(?:k|nghin|ngan)/);
  if (thousandMatch) {
    const amount = Number(thousandMatch[1]) * 1000;
    if (strictBudget) return { min: 0, max: amount, strictMax: true };
    if (normalized.includes("tren")) return { min: amount, max: 999999999 };

    const delta = Math.max(50000, amount * 0.2);
    return { min: Math.max(0, amount - delta), max: amount + delta, strictMax: false };
  }

  const millionMatch = normalized.match(/(?:duoi|toi da|tam|khoang|under)?\s*(\d+(?:\.\d+)?)\s*(?:trieu|tr|m)/);
  if (!millionMatch) return null;

  const amount = Number(millionMatch[1]) * 1000000;

  if (strictBudget) {
    return { min: 0, max: amount, strictMax: true };
  }
  if (normalized.includes("tren")) return { min: amount, max: 999999999 };
  return { min: Math.max(0, amount - 3000000), max: amount + 3000000, strictMax: false };
}

function productSearchText(product) {
  return normalizeText([
    product.sku,
    product.name,
    product.brand,
    product.categoryName,
    product.category,
    product.categorySlug,
    product.description,
    product.keySpecs,
    ...(Array.isArray(product.specifications) ? product.specifications.flatMap((item) => [item.name, item.value]) : []),
  ].join(" "));
}

function productKeySpecs(product, limit = 3) {
  if (Array.isArray(product.specifications) && product.specifications.length) {
    return product.specifications
      .filter((item) => item?.name && item?.value)
      .slice(0, limit)
      .map((item) => `${item.name}: ${item.value}`);
  }

  return String(product.keySpecs || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function getProductSpec(product, aliases = []) {
  const specs = Array.isArray(product.specifications) ? product.specifications : [];
  const normalizedAliases = aliases.map(normalizeText);
  const found = specs.find((item) => {
    if (typeof item === "string") {
      return normalizedAliases.some((alias) => normalizeText(item).includes(alias));
    }
    return normalizedAliases.includes(normalizeText(item?.name));
  });

  if (typeof found === "string") {
    const [, value] = found.split(/:(.+)/);
    return (value || found).trim();
  }

  const asksWarranty = normalizedAliases.some((alias) => alias === "bao hanh" || alias === "warranty");
  return found?.value || (asksWarranty ? product.warranty || "" : "");
}

function readableAvailability(value, language = "vi") {
  if (value === "InStock") return textFor(language, "Còn hàng", "In stock");
  if (value === "OutOfStock") return textFor(language, "Hết hàng", "Out of stock");
  return textFor(language, "Cần kiểm tra", "Needs checking");
}

function getFullSpecValue(product, aliases = []) {
  const directValue = getProductSpec(product, aliases);
  if (directValue) return directValue;

  const normalizedAliases = aliases.map(normalizeText);
  return productKeySpecs(product, 40)
    .map((line) => {
      const [name, ...rest] = String(line).split(":");
      return {
        name: normalizeText(name),
        value: rest.join(":").trim(),
      };
    })
    .find((item) => normalizedAliases.some((alias) => item.name === alias || item.name.includes(alias)))?.value || "";
}

function isLaptopProduct(product) {
  const searchText = productSearchText(product);
  return product.categorySlug === "laptop" || hasAnyKeyword(searchText, ["laptop", "may tinh xach tay"]);
}

function hasDedicatedLaptopGpu(product) {
  if (!isLaptopProduct(product)) return false;
  const graphicsText = normalizeText([
    getFullSpecValue(product, ["chip do hoa", "vga", "card do hoa", "gpu"]),
    product.name,
    product.description,
    product.keySpecs,
  ].join(" "));
  const hasDedicated = hasAnyKeyword(graphicsText, [
    "rtx",
    "gtx",
    "geforce",
    "radeon rx",
    "arc a",
    "arc b",
    "nvidia",
  ]);
  return hasDedicated;
}

function inferLaptopUseTypeFromText(text) {
  const normalized = normalizeText(text);
  if (hasAnyKeyword(normalized, ["gaming", "choi game", "rtx", "gtx", "vga roi", "card roi", "card do hoa roi"])) {
    return "gaming";
  }
  if (hasAnyKeyword(normalized, ["van phong", "office", "mong nhe", "sinh vien", "hoc tap", "excel", "khong card roi", "khong vga roi"])) {
    return "office";
  }
  return "";
}

function productComparisonSpecs(product, language = "vi") {
  return {
    warranty: getFullSpecValue(product, ["bao hanh", "warranty"]) || textFor(language, "Theo catalog", "According to catalog"),
    cpu: getFullSpecValue(product, ["cpu", "bo vi xu ly"]),
    ram: getFullSpecValue(product, ["ram", "bo nho", "memory"]),
    storage: getFullSpecValue(product, ["o cung", "ssd", "hdd", "luu tru"]),
    screen: getFullSpecValue(product, ["man hinh", "kich thuoc man hinh", "display"]),
    graphics: getFullSpecValue(product, ["chip do hoa", "vga", "card do hoa", "gpu"]),
    npu: getFullSpecValue(product, ["npu", "ai"]),
    need: getFullSpecValue(product, ["nhu cau"]) || product.categoryName || "",
  };
}

function warrantyMonths(value) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function buildProsCons(product, allItems, specs, language = "vi") {
  const pros = [];
  const cons = [];
  const price = Number(product.price || 0);
  const prices = allItems.map((item) => Number(item.price || 0)).filter(Number.isFinite);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const warranty = warrantyMonths(specs.warranty);
  const bestWarranty = Math.max(...allItems.map((item) => warrantyMonths(item.specs.warranty)));

  if (product.availabilityRaw === "InStock") pros.push(textFor(language, "Đang còn hàng, phù hợp nếu cần chốt nhanh", "In stock, suitable if the shopper needs to buy quickly"));
  if (product.availabilityRaw === "OutOfStock") cons.push(textFor(language, "Đang hết hàng, không phù hợp nếu cần mua ngay", "Out of stock, so it is not ideal for immediate purchase"));

  if (price === minPrice && prices.length > 1) pros.push(textFor(language, "Giá thấp nhất trong các lựa chọn", "Lowest price among the selected options"));
  if (price === maxPrice && prices.length > 1 && maxPrice > minPrice) cons.push(textFor(language, "Giá cao hơn lựa chọn còn lại", "Higher price than the other selected option"));

  if (warranty && warranty === bestWarranty && bestWarranty > 12) pros.push(textFor(language, `Bảo hành ${specs.warranty}, lợi thế cho dùng lâu dài`, `Warranty ${specs.warranty}, better for long-term use`));
  if (warranty && warranty < bestWarranty) cons.push(textFor(language, `Bảo hành ${specs.warranty}, ngắn hơn lựa chọn còn lại`, `Warranty ${specs.warranty}, shorter than the other option`));

  const normalizedSpecs = normalizeText([specs.cpu, specs.ram, specs.storage, specs.screen, specs.graphics, specs.npu, specs.need].join(" "));
  if (normalizedSpecs.includes("ryzen") || normalizedSpecs.includes("core ultra") || normalizedSpecs.includes("core 7")) {
    pros.push(textFor(language, "CPU nổi bật hơn nhóm phổ thông", "CPU configuration stands out versus mainstream options"));
  }
  if (normalizedSpecs.includes("rtx") || normalizedSpecs.includes("geforce")) {
    pros.push(textFor(language, "Có GPU rời, hợp gaming hoặc đồ họa hơn", "Dedicated GPU, better suited for gaming or graphics work"));
  }
  if (normalizedSpecs.includes("oled") || normalizedSpecs.includes("144hz") || normalizedSpecs.includes("180hz")) {
    pros.push(textFor(language, "Màn hình có lợi thế rõ cho trải nghiệm nhìn hoặc chuyển động", "Display has a notable advantage for viewing or motion experience"));
  }
  if (normalizedSpecs.includes("ai") || specs.npu) {
    pros.push(textFor(language, "Catalog có thông tin AI/NPU", "Catalog includes AI/NPU information"));
  }
  if (!specs.storage) cons.push(textFor(language, "Catalog thiếu thông tin lưu trữ; cần kiểm tra trước khi chốt", "Catalog is missing storage details; check before closing"));
  if (!specs.ram) cons.push(textFor(language, "Catalog thiếu thông tin RAM; cần kiểm tra trước khi chốt", "Catalog is missing RAM details; check before closing"));

  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 3),
  };
}

function isProductInBudget(product, budget, allowNear = false) {
  if (!budget || !Number.isFinite(Number(product.price))) return true;
  const price = Number(product.price);
  const max = allowNear && !budget.strictMax ? budget.max * 1.15 : budget.max;
  return price >= budget.min && price <= max;
}

function scoreProduct(product, query, options = {}) {
  const normalizedQuery = normalizeText(query);
  const searchText = productSearchText(product);
  const productName = normalizeText(product.name);
  const terms = normalizedQuery.split(" ").filter((term) => term.length > 1);
  let score = 0;

  for (const term of terms) {
    if (searchText.includes(term)) score += 2;
    if (productName.includes(term)) score += 2;
    if (normalizeText(product.brand).includes(term)) score += 1;
  }

  const wantsMouse = hasAnyKeyword(normalizedQuery, ["chuot", "mouse"]);
  const wantsMousepad = hasAnyKeyword(normalizedQuery, ["lot chuot", "mousepad", "mouse mat"]);
  const isMousepad = hasAnyKeyword(productName, ["lot chuot", "tam lot chuot", "mieng lot chuot", "mousepad", "mouse mat"]);
  if (wantsMouse && !wantsMousepad && isMousepad) score -= 8;

  const laptopUseType = inferLaptopUseTypeFromText(`${query} ${options.need || ""}`);
  if (laptopUseType && isLaptopProduct(product)) {
    const hasDedicatedGpu = hasDedicatedLaptopGpu(product);
    if (laptopUseType === "gaming") score += hasDedicatedGpu ? 10 : -10;
    if (laptopUseType === "office") score += hasDedicatedGpu ? -8 : 8;
  }

  if (options.category && product.categorySlug === options.category) score += 8;
  if (product.availability === "InStock") score += 4;
  if (options.shortlistedSkus?.includes(product.sku)) score += 5;

  if (options.budget && Number.isFinite(Number(product.price))) {
    if (isProductInBudget(product, options.budget)) score += 7;
    else if (isProductInBudget(product, options.budget, true)) score += 3;
    else score -= 6;
  }

  if (options.need && searchText.includes(normalizeText(options.need))) score += 4;
  return score;
}

function compactRecommendation(product, language = "vi") {
  const reasons = [];
  if (product.availability === "InStock") reasons.push(textFor(language, "Còn hàng theo catalog demo", "In stock in the demo catalog"));
  if (product.availability === "OutOfStock") reasons.push(textFor(language, "Đang hết hàng theo catalog demo", "Out of stock in the demo catalog"));
  if (Number.isFinite(Number(product.price))) reasons.push(textFor(language, `Giá ${product.priceFormatted || formatVnd(product.price)}`, `Price ${product.priceFormatted || formatVnd(product.price)}`));
  reasons.push(...productKeySpecs(product, 2));

  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    price: product.price,
    priceFormatted: product.priceFormatted || formatVnd(product.price),
    availability: product.availability,
    image: product.image,
    productUrl: product.productUrl,
    scrapedAt: product.scrapedAt,
    warranty: getProductSpec(product, ["bao hanh", "warranty"]),
    specifications: productKeySpecs(product, 6),
    reasons: reasons.slice(0, 4),
    warnings: product.availability === "OutOfStock"
      ? [textFor(language, "Không nên recommend làm lựa chọn chính nếu khách cần mua ngay.", "Do not recommend as the main option if the shopper needs to buy immediately.")]
      : [],
  };
}

function comparisonItem(product, language = "vi") {
  const specs = productComparisonSpecs(product, language);
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    price: product.price,
    priceFormatted: product.priceFormatted || formatVnd(product.price),
    availability: readableAvailability(product.availability, language),
    availabilityRaw: product.availability,
    warranty: specs.warranty,
    cpu: specs.cpu,
    ram: specs.ram,
    storage: specs.storage,
    screen: specs.screen,
    graphics: specs.graphics,
    npu: specs.npu,
    need: specs.need,
    specs,
    image: product.image,
    productUrl: product.productUrl,
    scrapedAt: product.scrapedAt,
  };
}

export function isCompareMessage(message) {
  const normalized = normalizeText(message);
  return ["so sanh", "compare", "chon giua", "khac nhau"].some((keyword) => normalized.includes(keyword));
}

export function buildComparison(products = [], { budget = null, language = "vi" } = {}) {
  const items = products.slice(0, 2).map((item) => comparisonItem(item, language));
  if (items.length < 2) return null;

  const enrichedItems = items.map((item) => ({
    ...item,
    ...buildProsCons(item, items, item.specs, language),
  }));

  const inStockItems = enrichedItems.filter((item) => item.availabilityRaw === "InStock");
  const decisionPool = inStockItems.length ? inStockItems : items;
  const bestValue = [...decisionPool].sort((a, b) => {
    const budgetDelta =
      Number(Boolean(budget && b.price >= budget.min && b.price <= budget.max)) -
      Number(Boolean(budget && a.price >= budget.min && a.price <= budget.max));
    const warrantyDelta = warrantyMonths(b.warranty) - warrantyMonths(a.warranty);
    return budgetDelta || warrantyDelta || Number(a.price || 0) - Number(b.price || 0);
  })[0];

  return {
    title: textFor(language, "So sánh 2 lựa chọn theo catalog", "Compare 2 catalog options"),
    recommendation: bestValue
      ? textFor(
          language,
          `Mình nghiêng về ${bestValue.name} vì ${bestValue.availabilityRaw === "InStock" ? "đang còn hàng" : "có giá tốt hơn"}; giá ${bestValue.priceFormatted}, bảo hành ${bestValue.warranty}. Nếu cần cấu hình chi tiết hơn, nên kiểm tra lại các dòng còn thiếu trong catalog trước khi chốt.`,
          `I would lean toward ${bestValue.name} because it ${bestValue.availabilityRaw === "InStock" ? "is in stock" : "has better value"}; price ${bestValue.priceFormatted}, warranty ${bestValue.warranty}. If the shopper needs deeper configuration details, verify any missing catalog fields before closing.`,
        )
      : textFor(language, "Mình cần thêm ít nhất 2 sản phẩm để so sánh rõ hơn.", "I need at least 2 products to build a clear comparison."),
    items: enrichedItems.map(({ specs, availabilityRaw, ...item }) => item),
  };
}

export function isProductDiscoveryMessage(message, context = {}) {
  const normalized = normalizeText([
    message,
    context.currentCategory,
    context.searchQuery,
    context.userNeed,
  ].join(" "));

  return [
    "tu van",
    "tim",
    "mua",
    "goi y",
    "recommend",
    "buy",
    "mac",
    "macbook",
    "apple",
    "laptop",
    "pc",
    "man hinh",
    "chuot",
    "mouse",
    "ban phim",
    "keyboard",
    "tai nghe",
    "headphone",
    "headset",
    "may in",
    "printer",
    "ram",
    "ssd",
    "vga",
    "gaming",
    "so sanh",
    "duoi",
    "trieu",
    "sku",
  ].some((keyword) => normalized.includes(keyword));
}

export function searchCatalog(products, { message = "", context = {}, limit = 4 } = {}) {
  const language = normalizeLanguage(context.language);
  const query = [message, context.searchQuery, context.userNeed].filter(Boolean).join(" ");
  const messageCategory = inferCategoryFromText(message);
  const category = messageCategory || inferCategoryFromText(query) || context.currentCategory || "";
  const budget = context.budgetRange || parseBudgetFromText(query);
  const need = context.userNeed || inferNeedFromText(query, language);
  const laptopUseType = inferLaptopUseTypeFromText(query);
  const shortlistedSkus = Array.isArray(context.shortlistedProductSkus) ? context.shortlistedProductSkus : [];
  const viewedSkus = Array.isArray(context.viewedProductSkus) ? context.viewedProductSkus : [];
  const compareSkus = [...new Set(shortlistedSkus.length ? shortlistedSkus : viewedSkus)];
  const shouldCompare = isCompareMessage(message);

  let ranked = products
    .filter((product) => {
      if (shouldCompare && compareSkus.length) {
        return compareSkus.includes(product.sku);
      }
      if (category && product.categorySlug !== category) return false;
      if (category === "laptop" && laptopUseType === "gaming" && !hasDedicatedLaptopGpu(product)) return false;
      if (category === "laptop" && laptopUseType === "office" && hasDedicatedLaptopGpu(product)) return false;
      if (budget && !isProductInBudget(product, budget, true)) return false;
      return true;
    })
    .map((product) => ({
      product,
      score: scoreProduct(product, query, { category, budget, need, shortlistedSkus: compareSkus }),
    }))
    .filter((item) => item.score > 0 || compareSkus.includes(item.product.sku))
    .sort((a, b) => {
      const stockDelta = Number(b.product.availability === "InStock") - Number(a.product.availability === "InStock");
      return stockDelta || b.score - a.score || Number(a.product.price || 0) - Number(b.product.price || 0);
    })
    .map((item) => item.product);

  if (!ranked.length && category && !budget?.strictMax) {
    ranked = products
      .filter((product) => product.categorySlug === category)
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }

  if (shouldCompare && ranked.length < 2 && compareSkus.length) {
    const selectedProduct = products.find((product) => compareSkus.includes(product.sku));
    const fallbackCategory = selectedProduct?.categorySlug || category;
    const extras = products
      .filter((product) => product.sku && !ranked.some((item) => item.sku === product.sku))
      .filter((product) => !fallbackCategory || product.categorySlug === fallbackCategory)
      .sort((a, b) => {
        const stockDelta = Number(b.availability === "InStock") - Number(a.availability === "InStock");
        return stockDelta || Math.abs(Number(a.price || 0) - Number(selectedProduct?.price || 0)) - Math.abs(Number(b.price || 0) - Number(selectedProduct?.price || 0));
      })
      .slice(0, 2 - ranked.length);
    ranked = [...ranked, ...extras];
  }

  return {
    category,
    budget,
    need,
    isComparison: shouldCompare,
    comparisonProducts: shouldCompare ? ranked.slice(0, 2) : [],
    recommendations: ranked.slice(0, shouldCompare ? 2 : limit).map((product) => compactRecommendation(product, language)),
  };
}

export function buildCatalogReply({ recommendations, budget, need, isComparison, language = "vi" }) {
  if (!recommendations.length) {
    return textFor(
      language,
      "Mình chưa tìm thấy sản phẩm khớp rõ trong catalog demo. Bạn cho mình thêm ngân sách, nhu cầu hoặc thương hiệu để lọc sát hơn nhé.",
      "I could not find a clear product match in the demo catalog. Please share the budget, use case, or preferred brand so I can narrow it down.",
    );
  }

  if (isComparison) {
    return textFor(
      language,
      `Mình đã dựng bảng so sánh nhanh cho ${Math.min(recommendations.length, 3)} sản phẩm đã chọn. Nhìn trước vào giá, tồn kho, bảo hành và cấu hình chính; nếu cần chốt nhanh thì ưu tiên mẫu còn hàng và nằm đúng ngân sách.`,
      `I built a quick comparison for ${Math.min(recommendations.length, 3)} selected products. Start with price, stock, warranty, and key specs; if the shopper needs to close quickly, prioritize an in-stock option within budget.`,
    );
  }

  const budgetText = budget ? textFor(language, ` trong khoảng ${formatVnd(budget.min)} - ${formatVnd(budget.max)}`, ` in the ${formatVnd(budget.min)} - ${formatVnd(budget.max)} range`) : "";
  const needText = need ? textFor(language, ` cho nhu cầu ${need.toLowerCase()}`, ` for ${need.toLowerCase()}`) : "";
  const outOfStockCount = recommendations.filter((item) => item.availability === "OutOfStock").length;
  const warning = outOfStockCount
    ? textFor(language, ` Có ${outOfStockCount} lựa chọn đang hết hàng nên mình sẽ ưu tiên mẫu còn hàng khi chốt.`, ` ${outOfStockCount} option(s) are out of stock, so I would prioritize in-stock products when closing.`)
    : "";

  return textFor(
    language,
    `Mình đã lọc catalog demo và chọn ${recommendations.length} sản phẩm phù hợp${needText}${budgetText}. Bấm "Xem trong store" để kiểm tra card sản phẩm hoặc gửi lead để sales tư vấn nhanh.${warning}`,
    `I filtered the demo catalog and selected ${recommendations.length} suitable product(s)${needText}${budgetText}. Use "View in store" to inspect the product card or send a lead for quick sales support.${warning}`,
  );
}
