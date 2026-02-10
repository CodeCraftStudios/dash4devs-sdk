/**
 * Cart Module
 *
 * Provides shopping cart functionality with server-side persistence.
 * Cart state is synced between local memory and the backend.
 */

export class CartModule {
  constructor(client) {
    this.client = client;
    this._cartId = null;
    this._items = [];
    this._subtotal = "0.00";
    this._itemCount = 0;
  }

  /**
   * Get current cart ID
   * @returns {string|null}
   */
  get cartId() {
    return this._cartId;
  }

  /**
   * Get current cart items (local state)
   * @returns {Array}
   */
  get items() {
    return this._items;
  }

  /**
   * Load an existing cart by ID
   * Use this to restore a cart from localStorage on page load
   * @param {string} cartId - Cart ID to load
   * @returns {Promise<{cart_id: string, items: Array, subtotal: string, item_count: number}>}
   */
  async load(cartId) {
    this._cartId = cartId;
    return this.get();
  }

  /**
   * Add item to cart
   * @param {Object} options - Item options
   * @param {string} options.productId - Product ID
   * @param {string} options.sizeId - Size ID
   * @param {number} options.quantity - Quantity (default: 1)
   * @returns {Promise<{cart_id: string, item: Object}>}
   */
  async add(options) {
    const { productId, sizeId, quantity = 1 } = options;

    if (!productId || !sizeId) {
      throw new Error("productId and sizeId are required");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/add`;
    const response = await this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        size_id: sizeId,
        quantity,
        cart_id: this._cartId,
      }),
    });

    // Update local state
    this._cartId = response.cart_id;

    // Sync with server - fetch full cart state
    await this.get();

    return response;
  }

  /**
   * Update item quantity in cart
   * @param {string} sizeId - Size ID of item to update
   * @param {number} quantity - New quantity (0 to remove)
   * @returns {Promise<Object>}
   */
  async update(sizeId, quantity) {
    if (!this._cartId) {
      throw new Error("No cart loaded");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/update`;
    const response = await this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        size_id: sizeId,
        quantity,
      }),
    });

    // Sync local state
    await this.get();

    return response;
  }

  /**
   * Get cart contents from server
   * @returns {Promise<{cart_id: string, items: Array, subtotal: string, item_count: number}>}
   */
  async get() {
    if (!this._cartId) {
      return { cart_id: null, items: [], subtotal: "0.00", item_count: 0 };
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}`;
    const response = await this.client._fetch(url);

    // Update local state from server
    this._items = response.items || [];
    this._subtotal = response.subtotal || "0.00";
    this._itemCount = response.item_count || 0;

    return response;
  }

  /**
   * Remove item from cart
   * @param {string} sizeId - Size ID of item to remove
   * @returns {Promise<Object>}
   */
  async remove(sizeId) {
    if (!this._cartId) {
      throw new Error("No cart loaded");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/remove/${encodeURIComponent(sizeId)}`;
    const response = await this.client._fetch(url, {
      method: "DELETE",
    });

    // Update local state from response
    if (response.cart) {
      this._items = response.cart.items || [];
      this._subtotal = response.cart.subtotal || "0.00";
      this._itemCount = response.cart.item_count || 0;
    }

    return response;
  }

  /**
   * Clear all items from cart
   * @returns {Promise<Object>}
   */
  async clear() {
    if (!this._cartId) {
      this._items = [];
      this._subtotal = "0.00";
      this._itemCount = 0;
      return { message: "Cart already empty" };
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/clear`;
    const response = await this.client._fetch(url, {
      method: "DELETE",
    });

    // Clear local state
    this._items = [];
    this._subtotal = "0.00";
    this._itemCount = 0;

    return response;
  }

  /**
   * Apply a discount code to the cart
   * @param {string} code - Discount code
   * @returns {Promise<{message: string, cart: Object}>}
   */
  async applyDiscount(code) {
    if (!this._cartId) {
      throw new Error("No cart loaded");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/apply-discount`;
    const response = await this.client._fetch(url, {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    // Update local state from cart response
    if (response.cart) {
      this._items = response.cart.items || [];
      this._subtotal = response.cart.subtotal || "0.00";
      this._itemCount = response.cart.item_count || 0;
    }

    return response;
  }

  /**
   * Remove discount code from cart
   * @returns {Promise<{message: string, cart: Object}>}
   */
  async removeDiscount() {
    if (!this._cartId) {
      throw new Error("No cart loaded");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/remove-discount`;
    const response = await this.client._fetch(url, {
      method: "POST",
    });

    if (response.cart) {
      this._items = response.cart.items || [];
      this._subtotal = response.cart.subtotal || "0.00";
      this._itemCount = response.cart.item_count || 0;
    }

    return response;
  }

  /**
   * Get cart totals (from local state)
   * @returns {{itemCount: number, subtotal: string}}
   */
  getTotals() {
    return {
      itemCount: this._itemCount,
      subtotal: this._subtotal,
    };
  }

  /**
   * Get total quantity across all items
   * @returns {number}
   */
  getTotalQuantity() {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Migrate guest cart to authenticated user's cart
   * Call this after user logs in to merge their guest cart with their account
   * @returns {Promise<{cart_id: string, items: Array, subtotal: string, item_count: number}>}
   */
  async migrateToUser() {
    if (!this._cartId) {
      return this.loadUserCart();
    }

    const token = this.client.auth?._accessToken;
    if (!token) {
      throw new Error("Authentication required for cart migration");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/${this._cartId}/migrate`;
    try {
      const response = await this.client._fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.cart_id) {
        this._cartId = response.cart_id;
      }

      await this.get();
      return response;
    } catch (error) {
      console.error("Cart migration failed:", error);
      this._cartId = null;
      return { cart_id: null, items: [], subtotal: "0.00", item_count: 0 };
    }
  }

  /**
   * Load user's cart after login (fetches cart associated with authenticated user)
   * @returns {Promise<{cart_id: string, items: Array, subtotal: string, item_count: number}>}
   */
  async loadUserCart() {
    const token = this.client.auth?._accessToken;
    if (!token) {
      throw new Error("Authentication required to load user cart");
    }

    const url = `${this.client.baseURL}/api/storefront/cart/user`;
    try {
      const response = await this.client._fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.cart_id) {
        this._cartId = response.cart_id;
        this._items = response.items || [];
        this._subtotal = response.subtotal || "0.00";
        this._itemCount = response.item_count || 0;
      }

      return response;
    } catch (error) {
      console.error("Failed to load user cart:", error);
      return { cart_id: null, items: [], subtotal: "0.00", item_count: 0 };
    }
  }

  /**
   * Reset cart state (used on logout)
   */
  reset() {
    this._cartId = null;
    this._items = [];
    this._subtotal = "0.00";
    this._itemCount = 0;
  }
}

export default CartModule;
