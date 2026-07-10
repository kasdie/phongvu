(() => {
  const CART_KEY = "phongvu-cart-v1";
  const TOAST_MS = 3000;
  let toastTimer = 0;
  let miniCartTimer = 0;
  let syncQueued = false;

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.qty > 0) : [];
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items.filter((item) => item.qty > 0)));
    updateCartUi();
  }

  function formatVnd(value) {
    return `${Math.max(0, Number(value) || 0).toLocaleString("vi-VN")}đ`;
  }

  function parseVnd(text = "") {
    const digits = String(text).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  }

  function compactText(text = "", max = 88) {
    const clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[character]));
  }

  function hashText(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return Math.abs(hash).toString(36);
  }

  function cartTotals(items = readCart()) {
    const qty = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const oldSubtotal = items.reduce((sum, item) => sum + (item.oldPrice || item.price) * item.qty, 0);
    return {
      qty,
      subtotal,
      discount: Math.max(0, oldSubtotal - subtotal),
    };
  }

  function absoluteImage(src) {
    if (!src) return "assets/images/logos/logo.svg";
    try {
      return new URL(src, window.location.href).href;
    } catch {
      return src;
    }
  }

  function productFromProductCard(card) {
    const name = card.querySelector("h3")?.textContent || card.querySelector("img")?.alt || "Sản phẩm Phong Vũ";
    const priceText = card.querySelector("strong")?.textContent || "";
    const oldPriceText = card.querySelector("del")?.textContent || "";
    const brand = card.querySelector("b")?.textContent || "Phong Vũ";
    const image = card.querySelector("img")?.getAttribute("src") || card.querySelector("img")?.currentSrc || "";
    const price = parseVnd(priceText);
    const oldPrice = parseVnd(oldPriceText);
    const id = card.dataset.cartId || `card-${hashText(`${name}|${price}|${brand}`)}`;
    card.dataset.cartId = id;
    return {
      id,
      name: compactText(name, 120),
      brand: compactText(brand, 40),
      price,
      oldPrice,
      image: absoluteImage(image),
      sku: card.dataset.sku || id,
    };
  }

  function productFromCatalogCard(card) {
    const sku = card.dataset.sku || "";
    const name = card.querySelector("h3")?.textContent || "Sản phẩm Phong Vũ";
    const price = parseVnd(card.querySelector("strong")?.textContent || "");
    const image = card.querySelector("img")?.getAttribute("src") || card.querySelector("img")?.currentSrc || "";
    const brand = card.querySelector(".product-badge")?.textContent || "Phong Vũ";
    return {
      id: sku ? `sku-${sku}` : `catalog-${hashText(`${name}|${price}`)}`,
      sku,
      name: compactText(name, 130),
      brand: compactText(brand, 40),
      price,
      oldPrice: 0,
      image: absoluteImage(image),
    };
  }

  function addItem(product, qty = 1) {
    if (!product || !product.id) return;
    const items = readCart();
    const existing = items.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += qty;
      existing.price = product.price || existing.price;
      existing.oldPrice = product.oldPrice || existing.oldPrice;
      existing.image = product.image || existing.image;
    } else {
      items.push({ ...product, qty });
    }
    writeCart(items);
    showToast("Đã thêm sản phẩm vào giỏ hàng");
    renderMiniCart();
  }

  function updateQty(id, delta) {
    const items = readCart();
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      writeCart(items.filter((entry) => entry.id !== id));
    } else {
      writeCart(items);
    }
    showToast("Đã cập nhật giỏ hàng");
  }

  function removeItem(id) {
    writeCart(readCart().filter((item) => item.id !== id));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng");
  }

  function clearCart() {
    writeCart([]);
    showToast("Đã xóa tất cả sản phẩm trong giỏ hàng");
  }

  function updateHeaderCount(items = readCart()) {
    const total = cartTotals(items).qty;
    document.querySelectorAll(".cart-header-link span").forEach((label) => {
      label.innerHTML = `Giỏ hàng của bạn<br>(${total}) sản phẩm`;
    });
  }

  function ensureToast() {
    let toast = document.querySelector("[data-cart-toast]");
    if (toast) return toast;
    toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.dataset.cartToast = "";
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span aria-hidden="true">✓</span>
      <strong>Đã thêm sản phẩm vào giỏ hàng</strong>
      <button type="button" aria-label="Đóng">×</button>
    `;
    toast.querySelector("button")?.addEventListener("click", () => toast.classList.remove("is-visible"));
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message) {
    const toast = ensureToast();
    toast.querySelector("strong").textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
  }

  function ensureMiniCart() {
    let panel = document.querySelector("[data-mini-cart]");
    if (panel) return panel;
    panel = document.createElement("aside");
    panel.className = "mini-cart-panel";
    panel.dataset.miniCart = "";
    panel.setAttribute("aria-label", "Giỏ hàng nhanh");
    document.body.appendChild(panel);
    panel.addEventListener("mouseenter", () => window.clearTimeout(miniCartTimer));
    panel.addEventListener("mouseleave", () => hideMiniCartSoon(250));
    panel.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-mini-cart-action]");
      if (!actionButton) return;
      event.preventDefault();
      const id = actionButton.closest("[data-cart-id]")?.dataset.cartId;
      if (!id) return;
      if (actionButton.dataset.miniCartAction === "plus") updateQty(id, 1);
      if (actionButton.dataset.miniCartAction === "minus") updateQty(id, -1);
      renderMiniCart(panel);
    });
    return panel;
  }

  function renderMiniCart(panel = ensureMiniCart()) {
    const items = readCart();
    const totals = cartTotals(items);
    if (!items.length) {
      panel.innerHTML = `
        <div class="mini-cart-empty">
          <strong>Giỏ hàng đang trống</strong>
          <p>Thêm sản phẩm để xem nhanh đơn hàng.</p>
        </div>
      `;
      return panel;
    }
    panel.innerHTML = `
      <div class="mini-cart-list">
        ${items.slice(0, 4).map((item) => `
          <article class="mini-cart-item" data-cart-id="${escapeHtml(item.id)}">
            <img src="${escapeHtml(item.image)}" alt="">
            <div>
              <h3>${escapeHtml(compactText(item.name, 72))}</h3>
              <small>Số lượng ${item.qty}</small>
              <strong>${formatVnd(item.price * item.qty)}</strong>
            </div>
            <div class="mini-cart-stepper">
              <button type="button" data-mini-cart-action="minus">−</button>
              <span>${item.qty}</span>
              <button type="button" data-mini-cart-action="plus">+</button>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="mini-cart-total">
        <span>Tổng tiền (${totals.qty}) sản phẩm</span>
        <strong>${formatVnd(totals.subtotal)}</strong>
      </div>
      <a class="mini-cart-view" href="/cart">Xem giỏ hàng</a>
    `;
    return panel;
  }

  function placeMiniCart(panel) {
    const link = document.querySelector(".cart-header-link");
    if (!link) return;
    const rect = link.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    panel.style.width = `${width}px`;
    panel.style.top = `${Math.max(72, rect.bottom + 12)}px`;
    panel.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.right - width))}px`;
  }

  function showMiniCart(autoHide = true) {
    const panel = renderMiniCart();
    placeMiniCart(panel);
    panel.classList.add("is-visible");
    window.clearTimeout(miniCartTimer);
    if (autoHide) hideMiniCartSoon(3600);
  }

  function hideMiniCartSoon(delay = 500) {
    window.clearTimeout(miniCartTimer);
    miniCartTimer = window.setTimeout(() => {
      document.querySelector("[data-mini-cart]")?.classList.remove("is-visible");
    }, delay);
  }

  function restoreAddButton(button) {
    if (!button.classList.contains("cart-stepper-button")) return;
    button.classList.remove("cart-stepper-button");
    button.removeAttribute("data-cart-id");
    button.textContent = button.dataset.cartOriginalText || "Thêm vào giỏ";
  }

  function syncProductButtons() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const buttons = [...card.querySelectorAll("button")].filter((button) => !button.classList.contains("heart"));
      const button = buttons.at(-1);
      if (!button) return;
      if (!button.dataset.cartOriginalText && !button.classList.contains("cart-stepper-button")) {
        button.dataset.cartOriginalText = button.textContent.trim() || "Thêm vào giỏ";
      }
      const product = productFromProductCard(card);
      const item = readCart().find((entry) => entry.id === product.id);
      if (!item) {
        restoreAddButton(button);
        return;
      }
      button.classList.add("cart-stepper-button");
      button.dataset.cartId = item.id;
      button.innerHTML = `
        <span data-cart-card-action="minus">−</span>
        <strong>${item.qty}</strong>
        <span data-cart-card-action="plus">+</span>
      `;
    });
  }

  function scheduleSyncProductButtons() {
    if (syncQueued) return;
    syncQueued = true;
    window.requestAnimationFrame(() => {
      syncQueued = false;
      syncProductButtons();
    });
  }

  function renderCartPage() {
    const main = document.querySelector(".cart-main .container");
    if (!main) return;
    const items = readCart();
    const totals = cartTotals(items);
    if (!items.length) {
      main.innerHTML = `
        <nav class="cart-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span>/</span><strong>Giỏ hàng</strong></nav>
        <h1>Giỏ hàng</h1>
        <div class="cart-layout">
          <section class="cart-empty-card" aria-label="Giỏ hàng trống">
            <div class="cart-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64"><circle cx="24" cy="52" r="4"></circle><circle cx="46" cy="52" r="4"></circle><path d="M9 12h9l6 28h24l6-19H22"></path><path d="M24 44h25"></path></svg>
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ để xem báo giá, ưu đãi và tiến hành đặt hàng.</p>
            <div class="cart-empty-actions"><a class="primary" href="/">Tiếp tục mua sắm</a><a href="/">Xem khuyến mãi</a></div>
          </section>
          <aside class="cart-summary-card" aria-label="Thông tin đơn hàng">
            <h2>Thông tin đơn hàng</h2>
            <dl><div><dt>Tạm tính</dt><dd>0đ</dd></div><div><dt>Giảm giá</dt><dd>0đ</dd></div><div class="total"><dt>Tổng cộng</dt><dd>0đ</dd></div></dl>
            <button type="button" disabled>Tiến hành thanh toán</button>
            <p>Đơn hàng chưa có sản phẩm. Bạn có thể quay lại trang chủ để chọn sản phẩm phù hợp.</p>
          </aside>
        </div>
      `;
      return;
    }
    main.innerHTML = `
      <nav class="cart-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span>/</span><strong>Giỏ hàng</strong></nav>
      <div class="cart-title-row">
        <h1>Giỏ hàng (${totals.qty})</h1>
        <button type="button" data-cart-clear>Xóa tất cả</button>
      </div>
      <div class="cart-layout has-items">
        <section class="cart-items-card" aria-label="Sản phẩm trong giỏ hàng">
          <div class="cart-items-head">
            <label><input type="checkbox" checked> CÔNG TY CỔ PHẦN THƯƠNG MẠI DỊCH VỤ PHONG VŨ</label>
            <span>Đơn giá</span><span>Số lượng</span><span>Thành tiền</span>
          </div>
          <div class="cart-items-list">
            ${items.map((item) => `
              <article class="cart-line-item" data-cart-id="${escapeHtml(item.id)}">
                <label class="cart-line-check"><input type="checkbox" checked></label>
                <img src="${escapeHtml(item.image)}" alt="">
                <div class="cart-line-info">
                  <h2>${escapeHtml(compactText(item.name, 96))}</h2>
                  ${item.sku ? `<p>SKU: ${escapeHtml(item.sku)}</p>` : ""}
                  <small>${escapeHtml(item.brand)}</small>
                  <div class="cart-line-promo">🎁 Giảm ${formatVnd(Math.min(40000, Math.max(0, (item.oldPrice || item.price) - item.price)))} (áp dụng vào giá sản phẩm)</div>
                </div>
                <div class="cart-line-price">
                  <strong>${formatVnd(item.price)}</strong>
                  ${item.oldPrice && item.oldPrice > item.price ? `<del>${formatVnd(item.oldPrice)}</del>` : ""}
                </div>
                <div class="cart-line-stepper">
                  <button type="button" data-cart-page-action="minus">−</button>
                  <span>${item.qty}</span>
                  <button type="button" data-cart-page-action="plus">+</button>
                </div>
                <strong class="cart-line-total">${formatVnd(item.price * item.qty)}</strong>
                <button class="cart-line-remove" type="button" data-cart-page-action="remove">Xóa</button>
              </article>
            `).join("")}
          </div>
        </section>
        <aside class="cart-summary-card" aria-label="Thông tin đơn hàng">
          <div class="cart-promo-box"><strong>Khuyến mãi</strong><a href="#">Chọn hoặc nhập khuyến mãi</a></div>
          <h2>Thanh toán</h2>
          <dl>
            <div><dt>Tổng tạm tính</dt><dd>${formatVnd(totals.subtotal)}</dd></div>
            <div><dt>Giảm giá</dt><dd>${formatVnd(totals.discount)}</dd></div>
            <div class="total"><dt>Thành tiền</dt><dd>${formatVnd(totals.subtotal)}</dd></div>
          </dl>
          <button class="cart-checkout-button" type="button">THANH TOÁN<br><small>Bạn cần đăng nhập để tiếp tục</small></button>
        </aside>
      </div>
    `;
  }

  function handleAddClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const stepperButton = button.closest(".cart-stepper-button");
    if (stepperButton) {
      const id = stepperButton.dataset.cartId;
      if (!id) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const action = event.target.closest("[data-cart-card-action]")?.dataset.cartCardAction || "plus";
      updateQty(id, action === "minus" ? -1 : 1);
      return;
    }

    const catalogButton = event.target.closest('button[data-action="cart"]');
    if (catalogButton) {
      const card = catalogButton.closest(".catalog-product-card");
      if (!card) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      addItem(productFromCatalogCard(card));
      return;
    }

    const card = button.closest(".product-card");
    if (!card) return;
    const actionButtons = [...card.querySelectorAll("button")].filter((item) => !item.classList.contains("heart"));
    if (actionButtons.at(-1) !== button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addItem(productFromProductCard(card));
  }

  function handleCartPageClick(event) {
    const clearButton = event.target.closest("[data-cart-clear]");
    if (clearButton) {
      clearCart();
      renderCartPage();
      return;
    }

    const actionButton = event.target.closest("[data-cart-page-action]");
    if (!actionButton) return;
    const id = actionButton.closest("[data-cart-id]")?.dataset.cartId;
    if (!id) return;
    const action = actionButton.dataset.cartPageAction;
    if (action === "plus") updateQty(id, 1);
    if (action === "minus") updateQty(id, -1);
    if (action === "remove") removeItem(id);
    renderCartPage();
  }

  function updateCartUi() {
    const items = readCart();
    updateHeaderCount(items);
    renderMiniCart();
    renderCartPage();
    scheduleSyncProductButtons();
  }

  document.addEventListener("click", handleAddClick, true);
  document.addEventListener("click", handleCartPageClick);

  document.addEventListener("DOMContentLoaded", () => {
    updateCartUi();
    const headerLink = document.querySelector(".cart-header-link");
    if (headerLink) {
      headerLink.addEventListener("mouseenter", () => showMiniCart(false));
      headerLink.addEventListener("mouseleave", () => hideMiniCartSoon(450));
      headerLink.addEventListener("focus", () => showMiniCart(false));
      headerLink.addEventListener("blur", () => hideMiniCartSoon(450));
    }
    window.addEventListener("resize", () => {
      const panel = document.querySelector("[data-mini-cart].is-visible");
      if (panel) placeMiniCart(panel);
    });
    const observer = new MutationObserver(scheduleSyncProductButtons);
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.PhongVuCart = {
    read: readCart,
    add: addItem,
    updateQty,
    clear: clearCart,
    render: updateCartUi,
  };
})();
