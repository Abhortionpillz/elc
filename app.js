
const WHATSAPP_NUMBER = "2347035074453";

// Correct ID references
const grid = document.getElementById("product-list");
const categoryFilter = document.getElementById("category-filter");

// Fetch products from backend (Vercel API Route → Postgres DB)
async function fetchProducts() {
  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error("Failed to fetch products from server.");
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("❌ Error loading products:", error);

    grid.innerHTML = `
      <p style="text-align:center; color:red; font-size:16px;">
        ⚠️ Unable to load products. Please try again later.
      </p>
    `;

    return [];
  }
}

// Render products for customers
async function renderProducts(filter = "all") {
  const products = await fetchProducts();

  // Reset category filter (keep "All Categories")
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Populate category filter dynamically
  const categories = [...new Set(products.map((p) => p.category))];
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  grid.innerHTML = "";

  // Apply category filter
  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <p style="text-align:center; margin-top:20px;">
        No products found in this category.
      </p>
    `;
    return;
  }

  // Create product cards
  filteredProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₦${Number(p.price).toLocaleString()}</p>
      <small class="category">${p.category}</small>
      <button onclick="orderWhatsApp('${p.name}', '${p.price}')">
        Order via WhatsApp
      </button>
    `;

    grid.appendChild(card);
  });
}

// WhatsApp Buy Button
function orderWhatsApp(name, price) {
  const msg = encodeURIComponent(
    `Hello! I'm interested in buying *${name}* for ₦${price}.`
  );

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

// Category filter listener
categoryFilter.addEventListener("change", () => {
  renderProducts(categoryFilter.value);
});

// Load products on startup
renderProducts();
