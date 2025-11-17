// js/app.js

const WHATSAPP_NUMBER = "2347035074453";
// **CORRECTION**: The IDs now correctly match index.html
const grid = document.getElementById("product-list"); 
const categoryFilter = document.getElementById("category-filter"); 

// Async function to fetch products from the Vercel API Route
async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response) throw new Error("Failed to fetch products");
    // Products now come from Postgres/Vercel API
    const products = await response.json(); 
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Display error message to user if fetching fails
    grid.innerHTML = "<p style='text-align:center; color: red;'>Could not load products. Check the server logs.</p>";
    return [];
  }
}

async function renderProducts(filter = "all") {
  const products = await fetchProducts();
  
  // Clear and repopulate filter options based on live data
  // Start from the second option (index 1) to keep "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  
  grid.innerHTML = "";
  
  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='text-align:center;'>No products available in this category.</p>";
    return;
  }

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}"> 
      <h3>${p.name}</h3>
      <p>₦${p.price}</p>
      <p><small>${p.category}</small></p>
      <button onclick="goToWhatsApp('${p.name}', '${p.price}')">Order via WhatsApp</button>
    `;
    grid.appendChild(div);
  });
}

function goToWhatsApp(name, price) {
  const phoneNumber = WHATSAPP_NUMBER; 
  const message = encodeURIComponent(`Hi! I'm interested in buying *${name}* for ₦${price}.`);
  // **CORRECTION**: Now uses WHATSAPP_NUMBER instead of the undefined 'phoneNumber'
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank"); 
}

categoryFilter.addEventListener("change", () => {
  renderProducts(categoryFilter.value);
});

// Initial call
renderProducts();