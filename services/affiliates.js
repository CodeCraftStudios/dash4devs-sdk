/**
 * Affiliates Module
 *
 * Provides affiliate program application functionality for storefronts.
 */

export class AffiliatesModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get the affiliate application form configuration
   * @returns {Promise<{is_active: boolean, custom_fields: Array, welcome_message: string}>}
   *
   * @example
   * const config = await dash.affiliates.getFormConfig();
   * if (config.is_active) {
   *   // Render form with config.custom_fields
   * }
   */
  async getFormConfig() {
    const url = `${this.client.baseURL}/api/storefront/affiliates/form-config`;
    return this.client._fetch(url);
  }

  /**
   * Submit an affiliate application
   * @param {Object} data - Application data
   * @param {string} data.name - Applicant name (required)
   * @param {string} data.email - Applicant email (required)
   * @param {string} [data.phone] - Phone number (optional)
   * @param {string} [data.paypal_email] - PayPal email for commission payouts (optional)
   * @param {Object} [data.custom_fields] - Custom field values (optional)
   * @param {string} [data.source_url] - URL where form was submitted from (optional)
   * @param {string} [data.turnstile_token] - Cloudflare Turnstile token (optional)
   * @returns {Promise<{success: boolean, message: string, request_id: string}>}
   *
   * @example
   * const result = await dash.affiliates.apply({
   *   name: "Jane Doe",
   *   email: "jane@example.com",
   *   paypal_email: "jane@paypal.com",
   *   custom_fields: { website: "https://janeblog.com", audience_size: "10000" }
   * });
   */
  async apply(data) {
    const url = `${this.client.baseURL}/api/storefront/affiliates/apply`;

    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export default AffiliatesModule;
