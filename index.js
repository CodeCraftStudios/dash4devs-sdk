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

    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this._sessionId = null;

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

    // Inject footer branding (skip in test mode)
    if (typeof window !== "undefined" && !this.apiKey.includes("_test_")) {
      this._injectFooterBranding();
    }
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
      if (footer.innerHTML.includes("dashfordevs.com") ||
          footer.innerHTML.includes("Dash4Devs") ||
          footer.innerHTML.includes("codecraftstudios.net")) {
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
        Powered by <a href="https://dashfordevs.com" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #0ea5e9; text-decoration: none;">Dash4Devs</a>,
        by <a href="https://www.codecraftstudios.net" target="_blank" rel="noopener noreferrer" style="font-weight: 600; color: #0ea5e9; text-decoration: none;">CodeCraft Studios</a>
      `;

      // Append to footer
      footer.appendChild(brandingDiv);
    };

    // Delay injection to allow SSR hydration to complete
    // This prevents hydration mismatches in frameworks like Next.js
    setTimeout(() => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inject);
      } else {
        inject();
      }
    }, 100);
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

    // Include session ID if available (client-side only)
    if (typeof window !== "undefined") {
      const sessionId = this.getSessionId();
      if (sessionId) headers["X-Session-Id"] = sessionId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error || "API request failed");
      error.status = response.status;
      error.details = data;
      throw error;
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

// Re-export processor classes for advanced usage
export { AuthorizeNetCSR } from "./processors/authorize-net.js";

// Default export
export default DashClient;
