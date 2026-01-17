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
  grid.innerHTML = products
    .map(
      (product) => `
      <div class="card" data-id="${product.id}">
        <div class="thumb">
          <a class="view-button" href="product.html">View</a>
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
        alert("Please login to add to wishlist.");
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
      alert("Added to wishlist.");
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

const initCatalog = () => {
  if (!window.CATALOG_DATA) return;
  const products = window.CATALOG_DATA.products || [];
  const query = new URLSearchParams(window.location.search).get("q") || "";
  const baseProducts = filterBySearch(products, query);
  renderProducts(baseProducts);

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
      renderProducts(filtered);
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
      renderProducts(baseProducts);
    });
  }
};

document.addEventListener("DOMContentLoaded", initCatalog);
