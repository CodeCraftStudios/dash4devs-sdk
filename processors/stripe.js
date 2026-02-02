/**
 * Stripe Processor — Client-Side (CSR)
 *
 * Handles loading Stripe.js and tokenizing card data.
 * Uses Stripe Elements for PCI-compliant card collection.
 */

const STRIPE_JS_URL = "https://js.stripe.com/v3/";

export class StripeCSR {
  constructor(config) {
    this._publishableKey = config.publishable_key;
    this._environment = config.environment || "test";
    this._stripe = null;
    this._loaded = false;
    this._loading = null;
  }

  /**
   * Load Stripe.js and initialize the Stripe instance.
   * Idempotent — safe to call multiple times.
   * @returns {Promise<void>}
   */
  async load() {
    if (this._loaded) return;
    if (this._loading) return this._loading;

    if (typeof window === "undefined") {
      throw new Error(
        "StripeCSR.load() can only be called in a browser environment."
      );
    }

    this._loading = new Promise((resolve, reject) => {
      // Check if Stripe is already loaded
      if (window.Stripe) {
        this._stripe = window.Stripe(this._publishableKey);
        this._loaded = true;
        resolve();
        return;
      }

      // Check for existing script
      const existing = document.querySelector(`script[src="${STRIPE_JS_URL}"]`);
      if (existing) {
        existing.addEventListener("load", () => {
          this._stripe = window.Stripe(this._publishableKey);
          this._loaded = true;
          resolve();
        });
        return;
      }

      const script = document.createElement("script");
      script.src = STRIPE_JS_URL;
      script.async = true;

      script.onload = () => {
        this._stripe = window.Stripe(this._publishableKey);
        this._loaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Stripe.js. Check your network connection."));
      };

      document.head.appendChild(script);
    });

    return this._loading;
  }

  /**
   * Get the Stripe instance for creating Elements.
   * Useful for developers who want to use Stripe Elements directly.
   * @returns {Object} Stripe instance
   */
  getStripe() {
    if (!this._stripe) {
      throw new Error("Stripe is not loaded. Call load() first.");
    }
    return this._stripe;
  }

  /**
   * Create a Stripe Elements instance for building payment forms.
   * @param {Object} [options] - Stripe Elements options
   * @returns {Object} Stripe Elements instance
   */
  createElements(options = {}) {
    return this.getStripe().elements(options);
  }

  /**
   * Tokenize a Stripe card element.
   * Returns a processor-agnostic token object.
   *
   * @param {Object} cardElement - Stripe card Element instance
   * @param {Object} [billingDetails] - Optional billing details
   * @returns {Promise<{token: string, descriptor: string}>}
   */
  async tokenize(cardElement, billingDetails = {}) {
    if (!this._stripe) {
      await this.load();
    }

    // Create a PaymentMethod from the card element
    const { paymentMethod, error } = await this._stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      const err = new Error(error.message || "Card validation failed.");
      err.code = error.code;
      err.type = error.type;
      throw err;
    }

    return {
      token: paymentMethod.id,
      descriptor: "STRIPE.PAYMENT_METHOD",
    };
  }
}

export default StripeCSR;
