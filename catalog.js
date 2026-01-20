const SUPABASE_URL = "https://kbguphxloslhdcpbxqub.supabase.co";
const SUPABASE_KEY = "sb_publishable__Ve_OcWmEs8Hpns4PA-Teg_6gb7S-iO";
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const getSelectedValues = (name) =>
  Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (el) => el.value
  );

const applyFiltersToProducts = (products, filters) =>
  products.filter((product) => {
    if (filters.colors.length && !filters.colors.includes(product.color)) {
      return false;
    }
    if (filters.styles.length && !filters.styles.includes(product.style)) {
      return false;
    }
    if (filters.fits.length && !filters.fits.includes(product.fit)) {
      return false;
    }
    if (filters.materials.length && !filters.materials.includes(product.material)) {
      return false;
    }
    if (filters.models.length && !filters.models.includes(product.model)) {
      return false;
    }
    if (filters.sizes.length) {
      const hasSize = product.sizes.some((s) => filters.sizes.includes(s));
      if (!hasSize) return false;
    }
    if (filters.prices.length) {
      const priceMatch = filters.prices.some((range) => {
        if (range === "0-50") return product.price <= 50;
        if (range === "50-100") return product.price > 50 && product.price <= 100;
        if (range === "100-200") return product.price > 100 && product.price <= 200;
        if (range === "200+") return product.price > 200;
        return false;
      });
      if (!priceMatch) return false;
    }
    return true;
  });

const getLang = () => localStorage.getItem("lang") || "en";
const toastMessages = {
  en: {
    login: "Please login to continue",
    added: "Added to wishlist",
  },
  ru: {
    login: "Войдите в аккаунт",
    added: "Добавлено в избранное",
  },
};

const showToast = (key) => {
  const lang = getLang();
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "24px";
    toast.style.transform = "translateX(-50%)";
    toast.style.padding = "10px 16px";
    toast.style.borderRadius = "999px";
    toast.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    toast.style.background = "rgba(0, 0, 0, 0.7)";
    toast.style.color = "var(--text-color, #f8f3ef)";
    toast.style.fontSize = "12px";
    toast.style.letterSpacing = "0.14em";
    toast.style.textTransform = "uppercase";
    toast.style.zIndex = "10";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease";
    toast.style.pointerEvents = "none";
    document.body.appendChild(toast);
  }
  toast.textContent = toastMessages[lang]?.[key] || toastMessages.en[key] || key;
  toast.style.opacity = "1";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
};
const viewLabels = { en: "View", ru: "Смотреть" };
const filterLabels = {
  en: {
    Black: "Black",
    White: "White",
    Blue: "Blue",
    Grey: "Grey",
    Street: "Street",
    Classic: "Classic",
    Minimal: "Minimal",
    Regular: "Regular",
    Relaxed: "Relaxed",
    Slim: "Slim",
    Cotton: "Cotton",
    Fleece: "Fleece",
    Denim: "Denim",
    Leather: "Leather",
    "0-50": "$0–50",
    "50-100": "$50–100",
    "100-200": "$100–200",
    "200+": "$200+",
  },
  ru: {
    Black: "Черный",
    White: "Белый",
    Blue: "Синий",
    Grey: "Серый",
    Street: "Street",
    Classic: "Classic",
    Minimal: "Minimal",
    Regular: "Regular",
    Relaxed: "Relaxed",
    Slim: "Slim",
    Cotton: "Хлопок",
    Fleece: "Флис",
    Denim: "Деним",
    Leather: "Кожа",
    "0-50": "$0–50",
    "50-100": "$50–100",
    "100-200": "$100–200",
    "200+": "$200+",
  },
};

const translateFilterOptions = (lang) => {
  const map = filterLabels[lang] || filterLabels.en;
  document.querySelectorAll(".filter-option").forEach((label) => {
    const input = label.querySelector("input");
    if (!input) return;
    let textSpan = label.querySelector(".filter-text");
    if (!textSpan) {
      const textNodes = Array.from(label.childNodes).filter(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      const text = textNodes.map((node) => node.textContent).join(" ").trim();
      textNodes.forEach((node) => node.remove());
      textSpan = document.createElement("span");
      textSpan.className = "filter-text";
      textSpan.textContent = text || input.value;
      label.appendChild(textSpan);
    }
    textSpan.textContent = map[input.value] || input.value;
  });
};

const renderProducts = (products) => {
  const grid = document.getElementById("grid");
  if (!grid) return;
  if (!products.length) {
    const emptyState = document.getElementById("emptyState");
    if (emptyState) emptyState.hidden = false;
    grid.innerHTML = "";
    return;
  }
  const emptyState = document.getElementById("emptyState");
  if (emptyState) emptyState.hidden = true;
  const viewLabel = viewLabels[getLang()] || viewLabels.en;
  grid.innerHTML = products
    .map(
      (product) => `
      <div class="card" data-id="${product.id}">
        <div class="thumb"${
          product.image
            ? ` style="background-image: url('${product.image}'); background-size: cover; background-position: center;"`
            : ""
        }>
          <a class="view-button" href="product.html?productId=${encodeURIComponent(
            product.id
          )}&img=${encodeURIComponent(product.image || "")}" data-id="${
            product.id
          }">${viewLabel}</a>
        </div>
        <div class="card-title">${product.name}</div>
        <div class="card-price">$${product.price}</div>
        <div class="card-actions">
          <div></div>
          <button class="wishlist" data-id="${product.id}">
            <img src="image copy 2.png" alt="Wishlist" />
          </button>
        </div>
      </div>
    `
    )
    .join("");

  grid.querySelectorAll(".wishlist").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!supabaseClient) return;
      const { data } = await supabaseClient.auth.getSession();
      const session = data.session;
      if (!session) {
        showToast("login");
        return;
      }
      const productId = btn.dataset.id;
      const item = products.find((p) => p.id === productId);
      if (!item) return;
      await supabaseClient.from("wishlist_items").insert({
        user_id: session.user.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        material: item.material,
        model: item.model,
        category: item.category,
      });
      showToast("added");
    });
  });

  grid.querySelectorAll(".view-button").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.id;
      const item = products.find((p) => p.id === productId);
      if (item) {
        localStorage.setItem("selectedProduct", JSON.stringify(item));
      }
    });
  });
};

const filterBySearch = (products, query) => {
  if (!query) return products;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.model,
      product.category,
      product.color,
      product.material,
      product.style,
      product.fit,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
};

let baseProducts = [];
let currentProducts = [];

const initCatalog = () => {
  if (!window.CATALOG_DATA) return;
  const products = window.CATALOG_DATA.products || [];
  baseProducts = products;
  localStorage.setItem("catalogProducts", JSON.stringify(products));
  const query = new URLSearchParams(window.location.search).get("q") || "";
  baseProducts = filterBySearch(products, query);
  currentProducts = baseProducts;
  renderProducts(currentProducts);
  translateFilterOptions(getLang());

  const filterButton = document.getElementById("filterButton");
  const filterDrawer = document.getElementById("filterDrawer");
  const filterOverlay = document.getElementById("filterOverlay");
  const applyButton = document.getElementById("applyFilters");
  const resetButton = document.getElementById("resetFilters");

  const openDrawer = () => {
    filterDrawer.classList.add("open");
    filterOverlay.classList.add("open");
  };
  const closeDrawer = () => {
    filterDrawer.classList.remove("open");
    filterOverlay.classList.remove("open");
  };

  if (filterButton) filterButton.addEventListener("click", openDrawer);
  if (filterOverlay) filterOverlay.addEventListener("click", closeDrawer);

  if (applyButton) {
    applyButton.addEventListener("click", () => {
      const filters = {
        colors: getSelectedValues("color"),
        sizes: getSelectedValues("size"),
        styles: getSelectedValues("style"),
        fits: getSelectedValues("fit"),
        materials: getSelectedValues("material"),
        models: getSelectedValues("model"),
        prices: getSelectedValues("price"),
      };
      const filtered = applyFiltersToProducts(baseProducts, filters);
      currentProducts = filtered;
      renderProducts(currentProducts);
      closeDrawer();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      document
        .querySelectorAll(
          'input[name="color"], input[name="size"], input[name="style"], input[name="fit"], input[name="material"], input[name="model"], input[name="price"]'
        )
        .forEach((input) => {
          input.checked = false;
        });
      currentProducts = baseProducts;
      renderProducts(currentProducts);
    });
  }

  document.querySelectorAll(".lang button").forEach((btn) => {
    btn.addEventListener("click", () => {
      translateFilterOptions(btn.dataset.lang);
      renderProducts(currentProducts);
    });
  });
};

document.addEventListener("DOMContentLoaded", initCatalog);
