/**
 * Authorize.net Processor — Client-Side (CSR)
 *
 * Handles loading Accept.js and tokenizing card data.
 * Card data never touches the merchant's server — it goes directly
 * to Authorize.net's servers via Accept.js and returns an opaque token.
 */

// Accept.js CDN URLs
const ACCEPT_JS_PROD = "https://js.authorize.net/v1/Accept.js";
const ACCEPT_JS_SANDBOX = "https://jstest.authorize.net/v1/Accept.js";

// Accept.js error code translations
const ERROR_MESSAGES = {
  E_WC_01: "Please check the expiration date and try again.",
  E_WC_02: "Please check the card information and try again.",
  E_WC_03: "Please check the card information and try again.",
  E_WC_04: "Please check the security code (CVV) and try again.",
  E_WC_05: "Please include all required fields.",
  E_WC_06: "Please check the security code (CVV) and try again.",
  E_WC_07: "Please check the card number and try again.",
  E_WC_08: "Please check the card number and try again.",
  E_WC_09: "Please provide a valid bank routing number.",
  E_WC_10: "Please provide a valid bank account number.",
  E_WC_11: "Please provide a valid bank name.",
  E_WC_12: "Please provide a valid bank account name.",
  E_WC_13: "Please provide a valid echeck type.",
  E_WC_14: "Please include all required fields.",
  E_WC_15: "The card has expired. Please use a different card.",
  E_WC_16: "The card number appears to be invalid.",
  E_WC_17: "Please check the card expiration date.",
  E_WC_18: "Please check the card security code (CVV).",
  E_WC_19: "An unexpected error occurred. Please try again.",
  E_WC_20: "The merchant credentials are invalid.",
  E_WC_21: "The request could not be processed. Please try again.",
};

export class AuthorizeNetCSR {
  constructor(config) {
    this._apiLoginId = config.api_login_id;
    this._clientKey = config.client_key;
    this._environment = config.environment || "test";
    this._loaded = false;
    this._loading = null;
  }

  /**
   * Load Accept.js script into the DOM.
   * Idempotent — safe to call multiple times.
   * @returns {Promise<void>}
   */
  async load() {
    if (this._loaded) return;
    if (this._loading) return this._loading;

    if (typeof window === "undefined") {
      throw new Error(
        "AuthorizeNetCSR.load() can only be called in a browser environment. " +
        "Use AuthorizeNetSSR for server-side operations."
      );
    }

    this._loading = new Promise((resolve, reject) => {
      // Check if already loaded by another instance
      if (window.Accept) {
        this._loaded = true;
        resolve();
        return;
      }

      const src = this._environment === "live" ? ACCEPT_JS_PROD : ACCEPT_JS_SANDBOX;

      // Remove any existing Accept.js script (in case of environment switch)
      const existing = document.querySelector(`script[src*="authorize.net"]`);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = () => {
        this._loaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Accept.js. Check your network connection."));
      };

      document.head.appendChild(script);
    });

    return this._loading;
  }

  /**
   * Tokenize card data using Accept.js.
   * Returns a processor-agnostic token object.
   *
   * @param {Object} cardData
   * @param {string} cardData.cardNumber - Card number (spaces allowed)
   * @param {string} cardData.expDate - Expiration date (MM/YY or MM/YYYY)
   * @param {string} cardData.cvv - Security code (CVV/CVC)
   * @returns {Promise<{token: string, descriptor: string}>}
   */
  async tokenize(cardData) {
    if (!this._loaded) {
      await this.load();
    }

    if (!window.Accept) {
      throw new Error("Accept.js is not loaded. Call load() first.");
    }

    // Validate inputs
    const cleaned = this._validateAndClean(cardData);

    return new Promise((resolve, reject) => {
      const secureData = {
        authData: {
          clientKey: this._clientKey,
          apiLoginID: this._apiLoginId,
        },
        cardData: {
          cardNumber: cleaned.cardNumber,
          month: cleaned.month,
          year: cleaned.year,
          cardCode: cleaned.cvv,
        },
      };

      window.Accept.dispatchData(secureData, (response) => {
        if (response.messages.resultCode === "Error") {
          const errors = response.messages.message || [];
          const firstError = errors[0] || {};
          const code = firstError.code || "";
          const friendlyMessage = ERROR_MESSAGES[code] || firstError.text || "Card validation failed.";

          const error = new Error(friendlyMessage);
          error.code = code;
          error.details = errors;
          reject(error);
          return;
        }

        // Return processor-agnostic token format
        resolve({
          token: response.opaqueData.dataValue,
          descriptor: response.opaqueData.dataDescriptor,
        });
      });
    });
  }

  /**
   * Validate and clean card input data.
   * @private
   */
  _validateAndClean(cardData) {
    if (!cardData) throw new Error("Card data is required.");

    const { cardNumber, expDate, cvv } = cardData;

    // Card number
    if (!cardNumber) throw new Error("Card number is required.");
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      throw new Error("Invalid card number.");
    }

    // Expiration date
    if (!expDate) throw new Error("Expiration date is required.");
    const expMatch = expDate.match(/^(\d{1,2})\/?(\d{2,4})$/);
    if (!expMatch) throw new Error("Expiration date must be in MM/YY or MM/YYYY format.");

    let month = expMatch[1].padStart(2, "0");
    let year = expMatch[2];

    // Convert 4-digit year to 2-digit
    if (year.length === 4) {
      year = year.slice(-2);
    }

    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      throw new Error("Invalid expiration month.");
    }

    // Check if expired
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const yearNum = parseInt(year, 10);

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      throw new Error("This card has expired.");
    }

    // CVV
    if (!cvv) throw new Error("Security code (CVV) is required.");
    if (!/^\d{3,4}$/.test(cvv)) {
      throw new Error("Security code must be 3 or 4 digits.");
    }

    return { cardNumber: cleanNumber, month, year, cvv };
  }
}

export default AuthorizeNetCSR;
