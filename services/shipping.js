/**
 * Shipping Module
 *
 * Provides shipping integration (ShipStation) via the platform API.
 * ShipStation API keys stay server-side — this module proxies through the platform.
 */

export class ShippingModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get shipping rates for a package.
   * @param {Object} options
   * @param {string} options.carrier_code - Carrier code (e.g. "stamps_com", "fedex", "ups")
   * @param {string} options.from_postal - Origin zip code
   * @param {string} options.to_state - Destination state
   * @param {string} [options.to_country="US"] - Destination country code
   * @param {string} options.to_postal - Destination zip code
   * @param {number} options.weight_oz - Package weight in ounces
   * @param {Object} [options.dimensions] - Optional package dimensions
   * @returns {Promise<{rates: Array}>}
   */
  async getRates(options) {
    const { carrier_code, from_postal, to_state, to_country, to_postal, weight_oz, dimensions } = options;

    if (!carrier_code) {
      throw new Error("carrier_code is required");
    }
    if (!to_postal) {
      throw new Error("to_postal is required");
    }
    if (!weight_oz) {
      throw new Error("weight_oz is required");
    }

    const url = `${this.client.baseURL}/api/storefront/shipping/rates`;
    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        carrier_code,
        from_postal,
        to_state,
        to_country: to_country || "US",
        to_postal,
        weight_oz,
        dimensions,
      }),
    });
  }

  /**
   * Track a shipment by tracking number.
   * @param {string} trackingNumber - The tracking number
   * @param {string} [carrierCode] - Optional carrier code for accurate tracking URL
   * @returns {Promise<{tracking_number: string, carrier_code: string, tracking_url: string}>}
   */
  async track(trackingNumber, carrierCode = "") {
    if (!trackingNumber) {
      throw new Error("trackingNumber is required");
    }

    let url = `${this.client.baseURL}/api/storefront/shipping/track/${encodeURIComponent(trackingNumber)}`;
    if (carrierCode) {
      url += `?carrier_code=${encodeURIComponent(carrierCode)}`;
    }
    return this.client._fetch(url, {
      method: "GET",
    });
  }
}

export default ShippingModule;
