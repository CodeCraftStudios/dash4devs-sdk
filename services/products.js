/**
 * Products Module
 *
 * Provides access to product listing and details from the storefront API.
 */

export class ProductsModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * List products with optional filters
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of products per page (default: 20, max: 100)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @param {string} options.category - Filter by category slug
   * @param {string} options.search - Search in product name
   * @returns {Promise<{products: Array, pagination: Object}>}
   */
  async list(options = {}) {
    const params = new URLSearchParams();

    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);
    if (options.category) params.append("category", options.category);
    if (options.search) params.append("search", options.search);

    const queryString = params.toString();
    const url = `${this.client.baseURL}/api/storefront/products${queryString ? `?${queryString}` : ""}`;

    return this.client._fetch(url);
  }

  /**
   * Get a single product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<{product: Object}>}
   */
  async get(slug) {
    const url = `${this.client.baseURL}/api/storefront/products/${encodeURIComponent(slug)}`;
    return this.client._fetch(url);
  }
}

export default ProductsModule;
