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
   * @param {string} options.brand - Filter by brand slug
   * @param {string} options.search - Search in product name
   * @param {string[]} options.include - Include additional fields (e.g. ["main_size", "variations"])
   * @param {Object} options.customFields - Filter by custom fields (e.g. {popular: true, homepage_section: "hero"})
   * @returns {Promise<{products: Array, pagination: Object}>}
   *
   * @example
   * // Get featured products for homepage with main_size for pricing
   * const featured = await client.products.list({
   *   customFields: { featured: true, homepage_section: "hero" },
   *   include: ["main_size"],
   *   limit: 6
   * });
   *
   * @example
   * // Get new arrivals
   * const newArrivals = await client.products.list({
   *   customFields: { new_arrival: true },
   *   limit: 12
   * });
   */
  async list(options = {}) {
    const params = new URLSearchParams();

    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);
    if (options.category) params.append("category", options.category);
    if (options.brand) params.append("brand", options.brand);
    if (options.search || options.q) params.append("search", options.search || options.q);

    // Include additional fields (e.g., main_size for pricing details)
    if (options.include && Array.isArray(options.include)) {
      params.append("include", options.include.join(","));
    }

    // Custom fields filtering - prefix with cf_
    if (options.customFields && typeof options.customFields === "object") {
      for (const [key, value] of Object.entries(options.customFields)) {
        params.append(`cf_${key}`, String(value));
      }
    }

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

  /**
   * Get reviews for a product
   * @param {string} slug - Product slug
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of reviews per page (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<{reviews: Array, stats: Object, pagination: Object}>}
   *
   * @example
   * const { reviews, stats } = await client.products.getReviews("blue-widget");
   * console.log(`${stats.count} reviews, avg rating: ${stats.average_rating}`);
   */
  async getReviews(slug, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);

    const queryString = params.toString();
    const url = `${this.client.baseURL}/api/storefront/products/${encodeURIComponent(slug)}/reviews${queryString ? `?${queryString}` : ""}`;
    return this.client._fetch(url);
  }

  /**
   * Submit a review for a product
   * @param {string} slug - Product slug
   * @param {Object} data - Review data
   * @param {number} data.rating - Rating from 1-5 (required)
   * @param {string} data.author_name - Reviewer name (required)
   * @param {string} [data.author_email] - Reviewer email (optional)
   * @param {string} [data.title] - Review title (optional)
   * @param {string} [data.body] - Review content (optional)
   * @param {string} [data.variation_slug] - Variation slug (optional)
   * @param {string[]} [data.media_urls] - Array of media URLs (optional)
   * @returns {Promise<{review: Object}>}
   */
  async submitReview(slug, data) {
    const url = `${this.client.baseURL}/api/storefront/products/${encodeURIComponent(slug)}/reviews`;
    return this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all approved reviews across all products
   * @param {Object} options - Query options
   * @param {number} [options.limit] - Number of reviews per page (default: 20)
   * @param {number} [options.offset] - Pagination offset (default: 0)
   * @returns {Promise<{reviews: Array, avg_rating: number, total: number, pagination: Object}>}
   */
  async getAllReviews(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);
    if (options.product) params.append("product", options.product);
    const qs = params.toString();
    const url = `${this.client.baseURL}/api/storefront/reviews${qs ? `?${qs}` : ""}`;
    return this.client._fetch(url);
  }

  /**
   * Get featured variations (variations with show_in_bg custom field)
   * @returns {Promise<{variations: Array}>}
   */
  async getFeaturedVariations() {
    const url = `${this.client.baseURL}/api/storefront/featured-variations`;
    return this.client._fetch(url);
  }
}

export default ProductsModule;
