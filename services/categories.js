/**
 * Categories Module
 *
 * Provides access to category listing and details from the storefront API.
 * Supports nested categories with tree structure and depth-based filtering.
 */

export class CategoriesModule {
  constructor(client) {
    this.client = client;
  }

  /**
   * List categories
   * @param {Object} options - Query options
   * @param {boolean} options.tree - If true, returns nested tree structure with children
   * @param {string} options.parent - Filter by parent category slug
   * @param {number} options.depth - Filter by depth level (0 = root, 1 = first level children, etc.)
   * @param {Object} options.customFields - Filter by custom fields (e.g. {show_in_mega_menu: true})
   * @returns {Promise<{categories: Array}>}
   *
   * @example
   * // Get categories for mega menu
   * const menuCategories = await client.categories.list({
   *   customFields: { show_in_mega_menu: true }
   * });
   *
   * @example
   * // Get featured categories for homepage
   * const featured = await client.categories.list({
   *   customFields: { featured_on_homepage: true },
   *   depth: 0
   * });
   */
  async list(options = {}) {
    const params = new URLSearchParams();

    if (options.tree) params.append("tree", "true");
    if (options.parent) params.append("parent", options.parent);
    if (options.depth !== undefined) params.append("depth", options.depth);

    // Custom fields filtering - prefix with cf_
    if (options.customFields && typeof options.customFields === "object") {
      for (const [key, value] of Object.entries(options.customFields)) {
        params.append(`cf_${key}`, String(value));
      }
    }

    const queryString = params.toString();
    const url = `${this.client.baseURL}/api/storefront/categories${queryString ? `?${queryString}` : ""}`;

    return this.client._fetch(url);
  }

  /**
   * Get a single category with its products
   * @param {string} slug - Category slug
   * @param {Object} options - Query options
   * @param {boolean} options.includeProducts - Include products in response (default: true)
   * @param {boolean} options.includeChildren - Include nested child categories (default: true)
   * @param {number} options.limit - Number of products
   * @param {number} options.offset - Pagination offset
   * @returns {Promise<{category: Object}>}
   */
  async get(slug, options = {}) {
    const params = new URLSearchParams();

    if (options.includeProducts === false) params.append("include_products", "false");
    if (options.includeChildren === false) params.append("include_children", "false");
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);

    const queryString = params.toString();
    const url = `${this.client.baseURL}/api/storefront/categories/${encodeURIComponent(slug)}${queryString ? `?${queryString}` : ""}`;

    return this.client._fetch(url);
  }

  /**
   * Get categories at a specific depth level
   * Convenience method for building navbars (depth 0) or submenus
   * @param {number} depth - Depth level (0 = root categories)
   * @returns {Promise<{categories: Array}>}
   */
  async getByDepth(depth = 0) {
    return this.list({ depth });
  }

  /**
   * Get category tree starting from root
   * Returns full nested hierarchy
   * @returns {Promise<{categories: Array}>}
   */
  async getTree() {
    return this.list({ tree: true });
  }

  /**
   * Get children of a specific category
   * @param {string} parentSlug - Parent category slug
   * @returns {Promise<{categories: Array}>}
   */
  async getChildren(parentSlug) {
    return this.list({ parent: parentSlug });
  }
}

export default CategoriesModule;
