/**
 * Payment Module
 *
 * Processor-agnostic payment abstraction for the dash4devs SDK.
 * Developers interact with a single API regardless of which payment
 * processor the organization has configured.
 *
 * CSR (browser):
 *   await dash.payment.load();        // Loads the processor's client library
 *   const token = await dash.payment.tokenize(cardData);
 *
 * SSR (server):
 *   const result = await dash.payment.charge({ token, amount, ... });
 *
 * The SDK dynamically loads only the required processor library
 * (Accept.js for Authorize.net, Stripe.js for Stripe, etc.)
 * — never all of them.
 */

import { AuthorizeNetCSR } from "../processors/authorize-net.js";
import { StripeCSR } from "../processors/stripe.js";

export class PaymentModule {
  constructor(client) {
    this.client = client;

    // Processor info
    this._processor = null;     // { slug, name, environment }
    this._clientConfig = null;  // Public keys only
    this._handler = null;       // CSR processor handler instance

    this._loading = null;
    this._loaded = false;
  }

  /**
   * Load the active payment processor's client library.
   *
   * Call this once in your app's layout/header. Based on the org's
   * configured processor, it will:
   * 1. Fetch the processor info + public keys from the API
   * 2. Dynamically load only that processor's client library
   *
   * @returns {Promise<{slug: string, name: string, environment: string}>}
   *
   * @example
   * // In your layout/header (CSR only)
   * const processor = await dash.payment.load();
   * console.log(processor.slug); // "authorize-net"
   */
  async load() {
    if (this._loaded) return this._processor;
    if (this._loading) return this._loading;

    this._loading = (async () => {
      // Fetch processor info + public keys
      const url = `${this.client.baseURL}/api/storefront/payment/client-config`;
      const data = await this.client._fetch(url);

      this._processor = data.processor;
      this._clientConfig = data.client_config;

      if (!this._processor) {
        throw new Error("No active payment processor configured for this organization.");
      }

      // Initialize the correct CSR handler (browser only)
      if (typeof window !== "undefined") {
        this._handler = this._createHandler(this._processor.slug, {
          ...this._clientConfig,
          environment: this._processor.environment,
        });

        // Load the processor's client library (Accept.js, Stripe.js, etc.)
        await this._handler.load();
      }

      this._loaded = true;
      return this._processor;
    })();

    return this._loading;
  }

  /**
   * Get the active processor info.
   * Returns cached data if load() has been called, otherwise fetches.
   *
   * @returns {Promise<{slug: string, name: string, environment: string} | null>}
   */
  async getProcessor() {
    if (this._processor) return this._processor;

    const url = `${this.client.baseURL}/api/storefront/payment/processor`;
    const data = await this.client._fetch(url);
    this._processor = data.processor;
    return data.processor;
  }

  /**
   * Tokenize card data using the loaded processor's client library.
   * Must call load() first. CSR only.
   *
   * For Authorize.net: pass { cardNumber, expDate, cvv }
   * For Stripe: pass a Stripe card Element as the first argument
   *
   * Returns a processor-agnostic token that can be sent to charge().
   *
   * @param {Object} cardData - Card data or Stripe Element
   * @param {string} [cardData.cardNumber] - Card number (Authorize.net)
   * @param {string} [cardData.expDate] - Expiration date MM/YY (Authorize.net)
   * @param {string} [cardData.cvv] - Security code (Authorize.net)
   * @param {Object} [extra] - Extra options (e.g., billingDetails for Stripe)
   * @returns {Promise<{token: string, descriptor: string}>}
   *
   * @example
   * // Authorize.net
   * const { token, descriptor } = await dash.payment.tokenize({
   *   cardNumber: "4111111111111111",
   *   expDate: "12/25",
   *   cvv: "123",
   * });
   *
   * @example
   * // Stripe (pass the card Element)
   * const { token, descriptor } = await dash.payment.tokenize(cardElement, {
   *   name: "John Doe",
   * });
   */
  async tokenize(cardData, extra = {}) {
    if (!this._loaded || !this._handler) {
      throw new Error(
        "Payment processor not loaded. Call dash.payment.load() first."
      );
    }

    if (typeof window === "undefined") {
      throw new Error(
        "tokenize() can only be called in a browser environment (CSR). " +
        "Use charge() on the server side (SSR)."
      );
    }

    // Route to the correct handler
    switch (this._processor.slug) {
      case "authorize-net":
        return this._handler.tokenize(cardData);

      case "stripe":
        return this._handler.tokenize(cardData, extra);

      default:
        throw new Error(`Tokenization not supported for ${this._processor.name}.`);
    }
  }

  /**
   * Charge a tokenized payment through the storefront API.
   * Single-step flow: Authorize AND capture in one call.
   * The backend uses the org's encrypted credentials to process the charge.
   * Works on both CSR and SSR.
   *
   * @param {Object} chargeData
   * @param {string} chargeData.token - Token from tokenize()
   * @param {string} chargeData.descriptor - Descriptor from tokenize()
   * @param {string|number} chargeData.amount - Charge amount (e.g., "99.99")
   * @param {string} [chargeData.currency] - Currency code (default: "USD")
   * @param {string} [chargeData.invoiceNumber] - Invoice/order number
   * @param {string} [chargeData.description] - Charge description
   * @param {Object} [chargeData.billing] - Billing address
   * @returns {Promise<{success: boolean, transaction: Object}>}
   *
   * @example
   * const result = await dash.payment.charge({
   *   token: tokenData.token,
   *   descriptor: tokenData.descriptor,
   *   amount: "99.99",
   *   invoiceNumber: "1001",
   *   billing: {
   *     first_name: "John",
   *     last_name: "Doe",
   *     address: "123 Main St",
   *     city: "New York",
   *     state: "NY",
   *     zip_code: "10001",
   *   },
   * });
   */
  async charge(chargeData) {
    if (!chargeData || !chargeData.token || !chargeData.amount) {
      throw new Error("token and amount are required for charge().");
    }

    const url = `${this.client.baseURL}/api/storefront/payment/charge`;

    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: chargeData.token,
        descriptor: chargeData.descriptor || "",
        amount: String(chargeData.amount),
        currency: chargeData.currency || "USD",
        invoice_number: chargeData.invoiceNumber || "",
        description: chargeData.description || "",
        billing: chargeData.billing || {},
      }),
    });
  }

  // ===========================================================================
  // TWO-STEP PAYMENT FLOW: Authorize → Capture (or Void)
  // ===========================================================================

  /**
   * Authorize a payment without capturing (place a hold on the card).
   * Two-step flow, Step 1: The card is validated and funds are held,
   * but not actually charged yet.
   *
   * Use capture() to charge the held amount, or void() to release the hold.
   * Authorizations typically expire after 7-30 days depending on card issuer.
   *
   * @param {Object} authData
   * @param {string} authData.token - Token from tokenize()
   * @param {string} authData.descriptor - Descriptor from tokenize()
   * @param {string|number} authData.amount - Amount to authorize
   * @param {string} [authData.currency] - Currency code (default: "USD")
   * @param {string} [authData.invoiceNumber] - Invoice/order number
   * @param {string} [authData.description] - Description
   * @param {Object} [authData.billing] - Billing address
   * @returns {Promise<{success: boolean, authorization: Object}>}
   *
   * @example
   * // Step 1: Authorize (place hold)
   * const auth = await dash.payment.authorize({
   *   token: tokenData.token,
   *   descriptor: tokenData.descriptor,
   *   amount: "99.99",
   * });
   *
   * // Store auth.authorization.transaction_id for later capture
   * const transactionId = auth.authorization.transaction_id;
   *
   * // Step 2a: Capture when ready to charge
   * const result = await dash.payment.capture({ transactionId });
   *
   * // OR Step 2b: Void if you don't want to charge
   * await dash.payment.void({ transactionId });
   */
  async authorize(authData) {
    if (!authData || !authData.token || !authData.amount) {
      throw new Error("token and amount are required for authorize().");
    }

    const url = `${this.client.baseURL}/api/storefront/payment/authorize`;

    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: authData.token,
        descriptor: authData.descriptor || "",
        amount: String(authData.amount),
        currency: authData.currency || "USD",
        invoice_number: authData.invoiceNumber || "",
        description: authData.description || "",
        billing: authData.billing || {},
      }),
    });
  }

  /**
   * Capture a previously authorized payment.
   * Two-step flow, Step 2a: Actually charge the held funds.
   *
   * @param {Object} captureData
   * @param {string} captureData.transactionId - Transaction ID from authorize()
   * @param {string|number} [captureData.amount] - Amount to capture (optional,
   *   defaults to original auth amount. Can be less than original, not more.)
   * @returns {Promise<{success: boolean, transaction: Object}>}
   *
   * @example
   * const result = await dash.payment.capture({
   *   transactionId: "123456789",
   *   amount: "89.99", // Optional: capture less than authorized
   * });
   */
  async capture(captureData) {
    if (!captureData || !captureData.transactionId) {
      throw new Error("transactionId is required for capture().");
    }

    const url = `${this.client.baseURL}/api/storefront/payment/capture`;

    const body = {
      transaction_id: captureData.transactionId,
    };

    if (captureData.amount !== undefined) {
      body.amount = String(captureData.amount);
    }

    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Void a previously authorized payment.
   * Two-step flow, Step 2b: Release the hold without charging.
   *
   * Use this when you don't want to capture an authorization
   * (e.g., order cancelled, fraud detected, inventory unavailable).
   *
   * @param {Object} voidData
   * @param {string} voidData.transactionId - Transaction ID from authorize()
   * @returns {Promise<{success: boolean, transaction: Object}>}
   *
   * @example
   * const result = await dash.payment.void({
   *   transactionId: "123456789",
   * });
   */
  async void(voidData) {
    if (!voidData || !voidData.transactionId) {
      throw new Error("transactionId is required for void().");
    }

    const url = `${this.client.baseURL}/api/storefront/payment/void`;

    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        transaction_id: voidData.transactionId,
      }),
    });
  }

  /**
   * Get the underlying processor handler for advanced usage.
   * For Stripe, this gives access to createElements() for custom forms.
   *
   * @returns {Object} The processor handler (AuthorizeNetCSR, StripeCSR, etc.)
   */
  getHandler() {
    if (!this._handler) {
      throw new Error("Payment processor not loaded. Call load() first.");
    }
    return this._handler;
  }

  /**
   * Whether the processor's client library has been loaded.
   * @returns {boolean}
   */
  get isLoaded() {
    return this._loaded;
  }

  /**
   * The active processor's slug (e.g., "authorize-net", "stripe").
   * @returns {string|null}
   */
  get processorSlug() {
    return this._processor?.slug || null;
  }

  /**
   * Create the CSR handler for a given processor.
   * @private
   */
  _createHandler(slug, config) {
    switch (slug) {
      case "authorize-net":
        return new AuthorizeNetCSR(config);

      case "stripe":
        return new StripeCSR(config);

      default:
        throw new Error(
          `Unsupported payment processor: ${slug}. ` +
          `Supported: authorize-net, stripe.`
        );
    }
  }
}

export default PaymentModule;
