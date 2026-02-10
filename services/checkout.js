/**
 * Checkout Module
 *
 * Two-step checkout flow (guest):
 * 1. start() — validates cart, sends OTP to customer email
 * 2. complete() — verifies OTP, creates order from cart
 *
 * Authenticated flow (logged in):
 * 1. start() — validates cart, returns summary (no OTP)
 * 2. complete() — creates order directly (no code needed)
 */

export class CheckoutModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * Start checkout — validates cart and prepares for order.
   * If authenticated, skips OTP. If guest, sends OTP to email.
   *
   * @param {Object} data
   * @param {string} data.cartId - Cart ID
   * @param {string} [data.email] - Customer email (required for guest checkout)
   * @returns {Promise<Object>} Cart summary, customer preview, auth status
   */
  async start(data) {
    const { cartId, email } = data;
    if (!cartId) {
      throw new Error("cartId is required");
    }

    const headers = {};
    if (this.client.auth && this.client.auth.token) {
      headers["Authorization"] = `Bearer ${this.client.auth.token}`;
    } else if (!email) {
      throw new Error("cartId and email are required for guest checkout");
    }

    const body = { cart_id: cartId };
    if (email) body.email = email;

    const url = `${this.client.baseURL}/api/storefront/checkout/start`;
    return this.client._fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * Get allowed shipping locations (countries and states).
   * Returns only locations the organization ships to.
   * If no restrictions are configured, returns all available locations.
   *
   * @returns {Promise<{countries: Array<{id: string, name: string, code: string, states: Array}>}>}
   *
   * @example
   * const { countries } = await dash.checkout.getShippingLocations();
   * // countries = [{ id: "...", name: "United States", code: "US", states: [...] }]
   */
  async getShippingLocations() {
    const url = `${this.client.baseURL}/api/storefront/shipping-locations`;
    return this.client._fetch(url);
  }

  /**
   * Complete checkout — creates order from cart.
   * If authenticated, no code needed. If guest, requires email + OTP code.
   *
   * @param {Object} data
   * @param {string} data.cartId - Cart ID
   * @param {string} [data.email] - Customer email (required for guest)
   * @param {string} [data.code] - 6-digit OTP code (required for guest)
   * @param {Object} data.shipping - Shipping address
   * @param {string} [data.customerNotes] - Optional order notes
   * @returns {Promise<Object>} Order data, customer, auth tokens (guest only)
   */
  async complete(data) {
    const { cartId, email, code, shipping, customerNotes, payment } = data;
    if (!cartId || !shipping) {
      throw new Error("cartId and shipping are required");
    }

    const headers = {};
    if (this.client.auth && this.client.auth.token) {
      headers["Authorization"] = `Bearer ${this.client.auth.token}`;
    } else if (!email || !code) {
      throw new Error("email and code are required for guest checkout");
    }

    const body = {
      cart_id: cartId,
      shipping,
      customer_notes: customerNotes || "",
    };
    if (email) body.email = email;
    if (code) body.code = code;
    if (payment) body.payment = payment;

    const url = `${this.client.baseURL}/api/storefront/checkout/complete`;
    return this.client._fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }
}

export default CheckoutModule;
