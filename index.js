/**
 * dash4devs - E-commerce SDK for developers
 *
 * Solution by CodeCraft Studios (https://www.codecraftstudios.net)
 * A JavaScript SDK for integrating with DevDash e-commerce backend.
 * Provides easy access to products, categories, cart, and page data.
 */

import { ProductsModule } from "./services/products.js";
import { CategoriesModule } from "./services/categories.js";
import { CartModule } from "./services/cart.js";
import { PagesModule } from "./services/pages.js";
import { SeoModule } from "./services/seo.js";
import { AuthModule } from "./services/auth.js";
import { PaymentModule } from "./services/payment.js";
import { BlogModule } from "./services/blog.js";
import { CheckoutModule } from "./services/checkout.js";
import { EmailModule } from "./services/email.js";
import { ShippingModule } from "./services/shipping.js";
import { TrackingModule } from "./services/tracking.js";
import { ContactModule } from "./services/contact.js";
import { UploadModule } from "./services/upload.js";
import { BrandsModule } from "./services/brands.js";
import { MarketingModule } from "./services/marketing.js";
import { AffiliatesModule } from "./services/affiliates.js";
import { TaxModule } from "./services/tax.js";
import { CoaModule } from "./services/coa.js";
import { LegalModule } from "./services/legal.js";
import { MediaModule } from "./services/media.js";
import { ReferralsModule } from "./services/referrals.js";
import { DiscountStoreModule } from "./services/discount-store.js";
import { EarnPointsModule } from "./services/earn-points.js";
import { SitemapModule } from "./services/sitemap.js";
import { AdminModule } from "./services/admin.js";
import { ContentTypesModule } from "./services/content-types.js";
import { CalendarModule } from "./services/calendar.js";

// =============================================================================
// MAIN CLIENT
// =============================================================================

export class DashClient {
  /**
   * Create a new DashClient instance
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - Your API key (pk_* or sk_*) from DevDash dashboard
   * @param {string} [options.baseURL] - Optional: Override API URL (for local development only)
   */
  constructor({ apiKey, baseURL = "https://api.dashfordevs.com" }) {
    if (!apiKey) {
      throw new Error("apiKey is required");
    }

    if (!apiKey.startsWith("pk_") && !apiKey.startsWith("sk_")) {
      throw new Error("apiKey must start with 'pk_' or 'sk_'");
    }

    // SECURITY: Prevent secret keys from being used in browser environments
    if (typeof window !== "undefined" && apiKey.startsWith("sk_")) {
      throw new Error(
        "\n\n🚨 DASH4DEVS SECURITY ERROR 🚨\n\n" +
        "You are using a SECRET key (sk_*) in a browser environment.\n" +
        "This exposes your entire store to anyone who views your site.\n\n" +
        "SECRET keys must ONLY be used in server-side code (API routes, backend).\n" +
        "Use your PUBLIC key (pk_*) for client-side / NEXT_PUBLIC_ env vars.\n\n" +
        "If this key has been exposed, rotate it immediately in your dashboard:\n" +
        "Settings > API > Keys\n"
      );
    }

    // SECURITY: Detect if secret key was leaked via NEXT_PUBLIC_ env vars
    if (typeof process !== "undefined" && typeof process.env !== "undefined") {
      const envEntries = Object.entries(process.env || {});
      for (const [key, value] of envEntries) {
        if (key.startsWith("NEXT_PUBLIC_") && typeof value === "string" && (value.startsWith("sk_live_") || value.startsWith("sk_test_"))) {
          throw new Error(
            "\n\n🚨 DASH4DEVS SECURITY ERROR 🚨\n\n" +
            `Secret key detected in ${key}!\n` +
            "NEXT_PUBLIC_ variables are exposed to the browser.\n" +
            "Move your secret key to a non-NEXT_PUBLIC_ variable and use it only in server-side code.\n\n" +
            "Use your PUBLIC key (pk_*) for NEXT_PUBLIC_ env vars.\n"
          );
        }
      }
    }

    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this._sessionId = null;

    // Startup info table
    this._printStartupInfo();

    // Initialize modules
    this.products = new ProductsModule(this);
    this.categories = new CategoriesModule(this);
    this.cart = new CartModule(this);
    this.pages = new PagesModule(this);
    this.seo = new SeoModule(this);
    this.auth = new AuthModule(this);
    this.payment = new PaymentModule(this);
    this.blog = new BlogModule(this);
    this.checkout = new CheckoutModule(this);
    this.email = new EmailModule(this);
    this.shipping = new ShippingModule(this);
    this.tracking = new TrackingModule(this);
    this.contact = new ContactModule(this);
    this.upload = new UploadModule(this);
    this.brands = new BrandsModule(this);
    this.marketing = new MarketingModule(this);
    this.affiliates = new AffiliatesModule(this);
    this.tax = new TaxModule(this);
    this.coa = new CoaModule(this);
    this.legal = new LegalModule(this);
    this.media = new MediaModule(this);
    this.referrals = new ReferralsModule(this);
    this.discountStore = new DiscountStoreModule(this);
    this.earnPoints = new EarnPointsModule(this);
    this.sitemap = new SitemapModule(this);
    this.calendar = new CalendarModule(this);

    // Admin module — only available with secret keys (sk_*)
    if (apiKey.startsWith("sk_")) {
      this.admin = new AdminModule(this);
      this.contentTypes = new ContentTypesModule(this);
    }

    // SDK version
    this.version = "0.1.0";

    // Inject footer branding for all keys (production and test)
    if (typeof window !== "undefined") {
      this._injectFooterBranding();
    }

    // Check org lock status on client-side init
    if (typeof window !== "undefined") {
      this._checkLockStatus();
    }
  }

  /**
   * Print startup info table to console
   * @private
   */
  _printStartupInfo() {
    // Only print on server side (terminal) — never expose key info in browser
    if (typeof window !== "undefined") return;

    const maskKey = (key) => {
      if (!key || key.length < 8) return key;
      const prefix = key.slice(0, key.indexOf("_", 3) + 1);
      const last4 = key.slice(-4);
      return `${prefix}${"*".repeat(Math.max(0, key.length - prefix.length - 4))}${last4}`;
    };

    const keyType = this.apiKey.startsWith("pk_") ? "Public" : "Secret";
    const env = this.apiKey.includes("_live_") ? "Production" : this.apiKey.includes("_test_") ? "Test" : "Unknown";

    console.log("");
    console.log("┌─────────────────────────────────────────────┐");
    console.log(`│  Dash4Devs SDK v${this.version}                          │`);
    console.log("├──────────────────┬──────────────────────────┤");
    console.log(`│  Key Type        │  ${(keyType + " (" + env + ")").padEnd(24)} │`);
    console.log(`│  API Key         │  ${maskKey(this.apiKey).padEnd(24)} │`);
    console.log(`│  Base URL        │  ${this.baseURL.slice(0, 24).padEnd(24)} │`);
    console.log(`│  Environment     │  ${"Server (Node.js)".padEnd(24)} │`);
    console.log("└──────────────────┴──────────────────────────┘");

    if (env === "Production" && keyType === "Public") {
      console.log("  ✓ Production mode — branding will be injected");
    } else if (env === "Test") {
      console.log("  ⚡ Test mode — branding disabled");
    }
    if (keyType === "Secret") {
      console.log("  🔒 Secret key — server-side only");
    }
    console.log("");
  }

  /**
   * Inject "Powered by" branding into the footer
   * For SSR frameworks (Next.js, etc.), include the Dash4DevsBranding component instead.
   * @private
   */
  _injectFooterBranding() {
    // Wait for DOM and hydration to complete
    const inject = () => {
      // Check if branding already exists (e.g., from SSR component)
      if (document.getElementById("dash4devs-branding")) {
        return;
      }

      // Check for branding text to avoid duplicates with SSR-rendered branding
      const footer = document.querySelector("footer");
      if (!footer) {
        // Retry after a short delay if footer not found yet
        setTimeout(inject, 500);
        return;
      }

      // Check if branding already exists in footer (SSR-rendered)
      if (document.getElementById("dash4devs-branding") ||
          footer.innerHTML.includes("dashfordevs.com") ||
          footer.innerHTML.includes("Powered by Dash4Devs")) {
        return; // Branding already present, skip injection
      }

      // Create the branding element
      const brandingDiv = document.createElement("div");
      brandingDiv.id = "dash4devs-branding";
      brandingDiv.style.cssText = `
        text-align: center;
        padding: 16px;
        font-size: 14px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
        margin-top: 16px;
      `;

      brandingDiv.innerHTML = `
        Powered by <a href="https://dashfordevs.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #0ea5e9; text-decoration: none;">Dash4Devs</a>
        <span style="color: #9ca3af; font-size: 11px; margin-left: 4px;">v${this.version}</span>
      `;

      // Append to footer
      footer.appendChild(brandingDiv);
    };

    // Delay injection well past SSR hydration to prevent hydration mismatches.
    // requestIdleCallback fires after the main thread is idle (post-hydration).
    const schedule = typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (fn) => setTimeout(fn, 2000);

    schedule(() => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inject);
      } else {
        inject();
      }
    });
  }

  /**
   * Check if the organization is locked and redirect if so.
   * @private
   */
  async _checkLockStatus() {
    try {
      const res = await this.ping();
      if (res.organization?.is_locked) {
        window.location.href = "https://www.codecraftstudios.net";
      }
    } catch {
      // Silently fail — don't block the page if ping fails
    }
  }

  /**
   * Get the current session ID for analytics tracking.
   * Tries PostHog session ID first, then falls back to a generated ID stored in sessionStorage.
   * @returns {string} Session ID or empty string on server
   */
  getSessionId() {
    if (this._sessionId) return this._sessionId;
    if (typeof window !== "undefined" && window.posthog) {
      const id = window.posthog.get_session_id?.();
      if (id) return id;
    }
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("dash4devs_session_id");
      if (!id) {
        id = "ds_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("dash4devs_session_id", id);
      }
      return id;
    }
    return "";
  }

  /**
   * Manually set the session ID (e.g., from PostHog or your own tracking)
   * @param {string} id - Session ID to use
   */
  setSessionId(id) {
    this._sessionId = id;
  }

  /**
   * Internal fetch wrapper
   * @private
   */
  async _fetch(url, options = {}) {
    const headers = {
      "X-API-Key": this.apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Include auth token if available (for customer-specific features like discounts)
    if (this.auth && this.auth._accessToken && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.auth._accessToken}`;
    }

    // Include session ID if available (client-side only)
    if (typeof window !== "undefined") {
      const sessionId = this.getSessionId();
      if (sessionId) headers["X-Session-Id"] = sessionId;
    }

    // Skip Next.js fetch cache in dev mode
    const isDev = typeof process !== "undefined" && process.env?.DEV === "true";
    const fetchOptions = { ...options, headers };
    if (isDev) fetchOptions.cache = "no-store";

    const response = await fetch(url, fetchOptions);

    const data = await response.json();

    if (!response.ok) {
      // Auto-redirect to /banned on ban responses (client-side only)
      if (response.status === 403 && data.error === "banned" && typeof window !== "undefined") {
        const reason = data.reason ? `?reason=${encodeURIComponent(data.reason)}` : "";
        window.location.href = `/banned${reason}`;
      }

      const error = new Error(data.message || data.error || "API request failed");
      error.status = response.status;
      error.details = data;
      throw error;
    }

    // Check if organization is locked — redirect storefront to codecraftstudios.net
    if (data.organization?.is_locked && typeof window !== "undefined") {
      window.location.href = "https://www.codecraftstudios.net";
      return data;
    }

    return data;
  }

  /**
   * Health check - validates API key and returns organization info
   * @returns {Promise<{status: string, organization: Object, environment: string}>}
   */
  async ping() {
    const url = `${this.baseURL}/api/storefront/ping`;
    return this._fetch(url);
  }

  /**
   * Get page data - convenience method for SSR/SSG
   * Fetches all configured data for a page in a single request.
   *
   * @param {string} pathOrName - URL path (e.g., "/products/my-product") or page name (e.g., "home")
   * @param {Object} options - Options
   * @param {boolean} options.byName - If true, treats pathOrName as a page name instead of path
   * @returns {Promise<{page: Object, params: Object, global: Object, data: Object}>}
   *
   * @example
   * // By path (default) - matches dynamic routes like "/products/<slug>"
   * const { page, params, global, data } = await dash.getPageData("/products/my-product");
   * // params = { slug: "my-product" }
   *
   * @example
   * // By name - direct lookup
   * const { page, global, data } = await dash.getPageData("home", { byName: true });
   */
  async getPageData(pathOrName, options = {}) {
    if (options.byName) {
      return this.pages.getByName(pathOrName);
    }
    return this.pages.getByPath(pathOrName);
  }

  /**
   * Get global store data (branding, contact info, etc.)
   * This is the data configured in dashboard settings/api-branding.
   *
   * Returns store information that should be available on every page:
   * - Store name, description, logo
   * - Contact information (email, phone, website)
   * - Business address
   * - Business type and industry
   * - Global data sources (if configured)
   *
   * @returns {Promise<{global: Object}>}
   *
   * @example
   * const { global } = await dash.getGlobalData();
   * console.log(global.store_name);       // "My Store"
   * console.log(global.logo);             // "https://..."
   * console.log(global.business_email);   // "contact@mystore.com"
   * console.log(global.nav_categories);   // [...] if configured
   */
  async getGlobalData() {
    const url = `${this.baseURL}/api/storefront/global`;
    return this._fetch(url);
  }
}

// =============================================================================
// REVALIDATION HANDLER (Next.js App Router)
// =============================================================================

/**
 * Create a Next.js App Router POST handler for on-demand ISR revalidation.
 * Validates a shared secret, then calls revalidatePath() for each path.
 *
 * @param {Object} options
 * @param {string} options.secret - Shared secret (must match backend REVALIDATE_SECRET)
 * @returns {Function} POST handler for route.ts
 *
 * @example
 * // app/api/revalidate/route.ts
 * import { createRevalidateHandler } from "@/lib/dash4devs";
 * export const POST = createRevalidateHandler({ secret: process.env.REVALIDATE_SECRET });
 */
export function createRevalidateHandler({ secret }) {
  return async function POST(request) {
    const { NextResponse } = await import("next/server");
    const { revalidatePath } = await import("next/cache");

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!secret || body.secret !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const paths = body.paths;
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "paths must be a non-empty array" }, { status: 400 });
    }

    const revalidated = [];

    // Always revalidate the root layout so navbar/footer update
    try {
      revalidatePath("/", "layout");
      revalidated.push("/ (layout)");
    } catch {}

    for (const p of paths) {
      try {
        revalidatePath(p);
        revalidated.push(p);
      } catch (e) {
        console.error(`[revalidate] Failed for ${p}:`, e.message);
      }
    }

    console.log(`[revalidate] Revalidated ${revalidated.length}/${paths.length} paths:`, revalidated);
    return NextResponse.json({ revalidated });
  };
}

// Re-export modules for advanced usage
export { ProductsModule } from "./services/products.js";
export { CategoriesModule } from "./services/categories.js";
export { CartModule } from "./services/cart.js";
export { PagesModule } from "./services/pages.js";
export { SeoModule } from "./services/seo.js";
export { AuthModule } from "./services/auth.js";
export { PaymentModule } from "./services/payment.js";
export { BlogModule } from "./services/blog.js";
export { CheckoutModule } from "./services/checkout.js";
export { EmailModule } from "./services/email.js";
export { ShippingModule } from "./services/shipping.js";
export { TrackingModule } from "./services/tracking.js";
export { ContactModule } from "./services/contact.js";
export { UploadModule } from "./services/upload.js";
export { BrandsModule } from "./services/brands.js";
export { MarketingModule } from "./services/marketing.js";
export { AffiliatesModule } from "./services/affiliates.js";
export { TaxModule } from "./services/tax.js";
export { CoaModule } from "./services/coa.js";
export { LegalModule } from "./services/legal.js";
export { ReferralsModule } from "./services/referrals.js";
export { DiscountStoreModule } from "./services/discount-store.js";
export { EarnPointsModule } from "./services/earn-points.js";
export { SitemapModule } from "./services/sitemap.js";
export { CalendarModule } from "./services/calendar.js";

// Re-export processor classes for advanced usage
export { AuthorizeNetCSR } from "./processors/authorize-net.js";

// Default export
export default DashClient;
