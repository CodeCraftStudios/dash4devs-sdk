# dash4devs

> E-commerce SDK for developers - integrate DevDash storefront into any website

Built by [CodeCraft Studios](https://www.codecraftstudios.net)

## Installation

```bash
npm install dash4devs
```

## Quick Start

```javascript
import { DashClient } from "dash4devs";

// Initialize with your API key from DevDash dashboard
const dash = new DashClient({
  apiKey: "pk_test_your_key_here"
});

// Fetch global store data (branding, contact info)
const { global } = await dash.getGlobalData();
console.log(global.store_name);    // "My Store"
console.log(global.logo);          // Logo URL

// Fetch products
const { products } = await dash.products.list({ limit: 12 });

// Display products
products.forEach(product => {
  console.log(`${product.name} - $${product.price}`);
});
```

## Features

- **Global Data API** - Store branding, contact info, and global configuration
- **Products API** - List, search, and get product details
- **Categories API** - Navigate your catalog with tree support
- **SEO API** - Lightweight SEO metadata for meta tags and structured data
- **Cart API** - Add to cart with stock validation and persistent cart IDs
- **Pages API** - Flexible routing - use any URL structure you want
- **TypeScript Support** - Full type definitions included
- **Lightweight** - No dependencies, ~5KB minified

## API Reference

### DashClient

```javascript
const dash = new DashClient({
  apiKey: "pk_test_xxx"  // Your API key from DevDash dashboard
});
```

### Global Data

Fetch store branding and contact information configured in your DevDash dashboard.

```javascript
const { global } = await dash.getGlobalData();

// Available fields
console.log(global.store_name);        // "My Awesome Store"
console.log(global.store_description); // "Welcome to our store..."
console.log(global.logo);              // "https://...logo.png"
console.log(global.business_email);    // "contact@store.com"
console.log(global.business_phone);    // "+1 555-123-4567"
console.log(global.website);           // "https://mystore.com"
console.log(global.address);           // "123 Main St"
console.log(global.city);              // "New York"
console.log(global.zip_code);          // "10001"
console.log(global.business_type);     // "retail"
console.log(global.industry);          // "fashion"
```

Use this data to populate your navbar, footer, and any global UI components:

```jsx
// Example: Next.js Layout
export default async function RootLayout({ children }) {
  const { global } = await dash.getGlobalData();

  return (
    <html>
      <body>
        <Navbar logo={global.logo} storeName={global.store_name} />
        {children}
        <Footer
          email={global.business_email}
          phone={global.business_phone}
          address={global.address}
        />
      </body>
    </html>
  );
}
```

### Products

```javascript
// List products
const { products, pagination } = await dash.products.list({
  limit: 20,              // Products per page (max 100)
  offset: 0,              // Pagination offset
  category: "electronics", // Filter by category slug
  search: "laptop"        // Search in product name
});

// Product object structure
products.forEach(product => {
  console.log(product.id);              // "prod_abc123"
  console.log(product.name);            // "Product Name"
  console.log(product.slug);            // "product-name"
  console.log(product.price);           // "99.99"
  console.log(product.discounted_price); // "79.99" or null
  console.log(product.main_image);      // "https://...image.jpg"
  console.log(product.in_stock);        // true/false
  console.log(product.category);        // { id, name, slug }
  console.log(product.description);     // "Product description..."
  console.log(product.attributes);      // [{ name, options: [...] }]
  console.log(product.features);        // [{ key, value }]
  console.log(product.images);          // [{ id, url }]
});

// Get single product
const { product } = await dash.products.get("product-slug");
```

### Categories

```javascript
// List categories (flat)
const { categories } = await dash.categories.list();

// List categories (tree structure with children)
const { categories } = await dash.categories.list({ tree: true });

// Get category with products
const { category } = await dash.categories.get("electronics", {
  includeProducts: true,
  limit: 20
});
```

### SEO

Lightweight endpoint for fetching just SEO metadata - perfect for generating meta tags without loading full product data.

```javascript
// Get SEO metadata for a product
const { seo } = await dash.seo.product("product-slug");

// Use in Next.js generateMetadata
export async function generateMetadata({ params }) {
  const { seo } = await dash.seo.product(params.slug);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      images: seo.og_image ? [seo.og_image] : [],
    },
  };
}

// SEO object structure
console.log(seo.title);          // "Product Title" (falls back to product name)
console.log(seo.description);    // "Meta description..."
console.log(seo.keywords);       // "keyword1, keyword2, keyword3"
console.log(seo.og_image);       // "https://..." (falls back to main_image)
console.log(seo.schema);         // JSON-LD schema object (if configured)
console.log(seo.canonical_slug); // "product-slug"
```

### Cart

The cart module maintains state both locally and on the server, with persistent cart IDs for returning customers.

```javascript
// Add to cart
const result = await dash.cart.add({
  productId: "prod_abc123",
  sizeId: "size_456",
  quantity: 2
});

// Cart ID is returned - save this for returning customers
console.log(result.cart_id); // "cart_xyz789"
localStorage.setItem("cart_id", result.cart_id);

// Load existing cart (for returning customers)
await dash.cart.load(savedCartId);

// Get cart contents from server
const cart = await dash.cart.get();
console.log(cart.cart_id);     // "cart_xyz789"
console.log(cart.items);       // Array of cart items
console.log(cart.subtotal);    // "199.98"
console.log(cart.item_count);  // 2 (number of unique items)

// Cart item structure
cart.items.forEach(item => {
  console.log(item.id);              // Cart item ID
  console.log(item.product_id);      // Product ID
  console.log(item.product_name);    // "Product Name"
  console.log(item.product_slug);    // "product-name"
  console.log(item.product_image);   // Image URL
  console.log(item.size_id);         // Size ID
  console.log(item.size_label);      // "Large" or "Default"
  console.log(item.quantity);        // 2
  console.log(item.unit_price);      // "99.99"
  console.log(item.total_price);     // "199.98"
  console.log(item.stock_available); // 10
});

// Update item quantity
await dash.cart.update("size_456", 3);

// Remove item
await dash.cart.remove("size_456");

// Clear entire cart
await dash.cart.clear();

// Get local cart totals (sync'd after each operation)
const { itemCount, subtotal } = dash.cart.getTotals();

// Access local cart items
console.log(dash.cart.items);
```

### Pages (Flexible Routing)

The selling point: **use whatever routing you want**. Your `/about`, `/products`, `/shop`, `/whatever` - just fetch the page data and render.

```javascript
// Get page data by path
const { page, params, global, data } = await dash.getPageData("/products/my-product");

// params contains dynamic route values
// If route is "/products/<slug>", params = { slug: "my-product" }

// Get page data by name
const { page, global, data } = await dash.getPageData("home", { byName: true });

// List all configured pages (for sitemaps, navigation)
const { pages } = await dash.pages.list();
```

Example: Universal page component that works with any route:

```jsx
// app/[...slug]/page.tsx
export default async function DynamicPage({ params }) {
  const path = "/" + (params.slug?.join("/") || "");
  const { page, data, global } = await dash.getPageData(path);

  // Render based on page type
  switch (page.type) {
    case "product":
      return <ProductPage product={data.product} />;
    case "category":
      return <CategoryPage category={data.category} products={data.products} />;
    case "home":
      return <HomePage featured={data.featured_products} />;
    default:
      return <CustomPage content={data} />;
  }
}
```

### Health Check

```javascript
const status = await dash.ping();
console.log(status.status);           // "ok"
console.log(status.organization.name); // "My Store"
console.log(status.environment);       // "test" or "live"
```

## React/Next.js Example

### Cart Provider

```jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import dash from "@/lib/dash";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [subtotal, setSubtotal] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);

  // Number of unique items
  const itemCount = items.length;
  // Sum of all quantities
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem("cart_id");
    if (savedCartId) {
      loadCart(savedCartId);
    }
  }, []);

  const loadCart = async (id) => {
    setIsLoading(true);
    try {
      await dash.cart.load(id);
      const state = await dash.cart.get();
      setItems(state.items || []);
      setSubtotal(state.subtotal || "0.00");
      setCartId(state.cart_id);
    } catch (error) {
      localStorage.removeItem("cart_id");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId, sizeId, quantity = 1) => {
    setIsLoading(true);
    try {
      const result = await dash.cart.add({ productId, sizeId, quantity });
      if (result.cart_id) {
        setCartId(result.cart_id);
        localStorage.setItem("cart_id", result.cart_id);
      }
      setItems(dash.cart.items);
      setSubtotal(dash.cart.getTotals().subtotal);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items, cartId, itemCount, totalItemCount, subtotal, isLoading, addItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

### Add to Cart Button

```jsx
"use client";
import { useCart } from "./CartProvider";

export default function AddToCartButton({ productId, sizeId }) {
  const { addItem, isLoading } = useCart();

  return (
    <button
      onClick={() => addItem(productId, sizeId)}
      disabled={isLoading}
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

## Error Handling

```javascript
try {
  const { product } = await dash.products.get("non-existent");
} catch (error) {
  console.log(error.message);  // "Product not found"
  console.log(error.status);   // 404
  console.log(error.code);     // "not_found"
}
```

## API Keys

- **Public keys** (`pk_*`) - Safe for frontend, read-only access
- **Secret keys** (`sk_*`) - Server-side only, full access

Get your API keys from the DevDash dashboard under Settings > API Keys.

## Documentation

Full documentation at [devdash.io/docs](https://devdash.io/docs)

## License

MIT
