/**
 * Marketing Module
 *
 * Handles client-side marketing script injection (e.g. Klaviyo onsite JS).
 * Fetches the store's email provider config and injects the appropriate script tag.
 */

export class MarketingModule {
  constructor(client) {
    this.client = client;
    this._initialized = false;
    this._config = null;
  }

  /**
   * Initialize marketing scripts based on the store's email provider config.
   * Fetches /api/storefront/email/config and injects the provider's client-side JS.
   * Safe to call multiple times — only runs once.
   *
   * @returns {Promise<{active: boolean, provider: string|null}>}
   *
   * @example
   * await client.marketing.init();
   */
  async init() {
    if (this._initialized) {
      return this._config;
    }
    this._initialized = true;

    if (typeof window === "undefined") {
      // SSR — skip script injection
      return { active: false, provider: null };
    }

    try {
      const url = `${this.client.baseURL}/api/storefront/email/config`;
      const data = await this.client._fetch(url);
      this._config = data;

      if (!data.active || !data.provider) {
        return data;
      }

      const slug = data.provider.slug;

      if (slug === "klaviyo") {
        this._injectKlaviyo(data.config);
      }

      return data;
    } catch (err) {
      console.warn("Marketing init failed:", err.message);
      this._config = { active: false, provider: null };
      return this._config;
    }
  }

  /**
   * Get the cached config (call init() first).
   * @returns {Object|null}
   */
  getConfig() {
    return this._config;
  }

  /**
   * Inject Klaviyo onsite JS script tag.
   * @private
   */
  _injectKlaviyo(config) {
    const companyId = config?.company_id;
    if (!companyId) {
      console.warn("Klaviyo company_id not configured");
      return;
    }

    // Avoid duplicate injection
    if (document.getElementById("klaviyo-onsite-js")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "klaviyo-onsite-js";
    script.async = true;
    script.type = "text/javascript";
    script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${companyId}`;
    document.head.appendChild(script);
  }
}

export default MarketingModule;
