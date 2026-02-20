/**
 * dash4devs - E-commerce SDK for developers
 * TypeScript definitions
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Bulk discount tier for quantity-based pricing
 */
export interface BulkDiscount {
  /** Minimum quantity to trigger this discount tier */
  min_quantity: number;
  /** Maximum quantity for this tier (null = unlimited) */
  max_quantity: number | null;
  /** Type of discount */
  discount_type: "percentage" | "fixed";
  /** Discount value (e.g., "10" for 10% or $10 off) */
  discount_value: string;
}

/**
 * Product size/variant with pricing, stock, and bulk discounts
 */
export interface ProductSize {
  id: string;
  label: string;
  price: string;
  discounted_price: string | null;
  stock: number;
  in_stock: boolean;
  image: string | null;
  main: boolean;
  /** Weight value for bulk discount calculations (BamTHC style) */
  weight: string | null;
  /** Weight unit (g, oz, lb, etc.) */
  weight_unit: string;
  /** Cannabinoid classification for state-level tax calculation */
  cannabinoid_type: "general" | "cbd" | "delta8" | "delta9" | "thca" | "hhc";
  /** Loyalty points earned per unit purchased */
  points: number;
  /** Bulk discount tiers for this size */
  bulk_discounts?: BulkDiscount[];
}

/**
 * Selectable variation for products with variations.
 * Each variation has its own sizes with pricing.
 */
export interface SelectableVariation {
  id: string;
  /** Display name (e.g., "Blue Razz", "Strawberry") */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Rich HTML description */
  description: string | null;
  /** Variation image (typically from main size) */
  image: string | null;
  /** Whether this is the main/default variation */
  main: boolean;
  /** Total stock across all sizes */
  stock: number;
  /** Sizes available for this variation */
  sizes: ProductSize[];
}

/**
 * Product with full details for product page rendering
 */
export interface FreestyleSlotOption {
  id: string;
  product_name: string;
  short_name?: string;
  product_slug: string;
  image: string | null;
  variation_name: string | null;
  size_label: string | null;
  in_stock: boolean;
}

export interface FreestyleSlot {
  id: string;
  name: string;
  options: FreestyleSlotOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  main_image: string | null;
  category: { id: string; name: string; slug: string } | null;
  price: string | null;
  discounted_price: string | null;
  in_stock: boolean;
  bundle_type?: string;
  is_bundle?: boolean;

  /**
   * Maximum bulk discount percentage available for this product.
   * Calculated from the highest discount tier across all sizes.
   * Useful for showing "Up to X% bulk discount" badges on product cards.
   */
  max_bulk_discount?: number | null;

  // Detail fields (only present when fetched with include_details)
  description?: string;

  /**
   * Whether this product has variations (auto-detected from active attribute options)
   */
  has_variations?: boolean;

  /**
   * Selectable variations with their own sizes and pricing
   */
  selectable_variations?: SelectableVariation[] | null;

  /**
   * Direct sizes (not linked to any variation)
   */
  sizes?: ProductSize[];

  /** Attributes (e.g., Color, Fabric) containing options with sizes */
  attributes?: ProductAttribute[];
  images?: { id: string; url: string }[];
  features?: { key: string; value: string }[];
  qna?: { question: string; answer: string }[];
  seo?: ProductSEO;

  /** Bundle includes for fixed bundles */
  includes?: any[] | null;
  /** Freestyle bundle slots (only present for freestyle bundles) */
  freestyle_slots?: FreestyleSlot[] | null;
}

/**
 * Product SEO metadata
 */
export interface ProductSEO {
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image: string | null;
  schema: object | null;
}

export interface ProductAttribute {
  id: string;
  /** Attribute name (e.g., "Color", "Fabric", "Size Type") */
  name: string;
  /** Options for this attribute, each containing sizes with pricing */
  options: ProductAttributeOption[];
}

export interface ProductAttributeOption {
  id: string;
  /** Option value (e.g., "Black", "Cotton", "Standard") */
  value: string;
  slug: string;
  description: string;
  /** Whether this is the main/default option */
  main: boolean;
  /** Whether this option acts as its own product page */
  use_as_product_page: boolean;
  /** Open Graph image for this option */
  og_image: string | null;
  /** SEO title for this option's page */
  seo_title: string | null;
  /** SEO description for this option's page */
  seo_description: string | null;
  /** Sizes available for this option, with pricing and stock */
  sizes: ProductSize[];
}

export interface CategoryImage {
  id: string;
  image: string | null;
  alt_text: string | null;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Category cover image (for listings/home page) */
  image: string | null;
  /** Hero banner image (for category page hero section) */
  hero_image: string | null;
  parent_id: string | null;
  /** Short name for navigation menus (falls back to name if not set) */
  navbar_name: string | null;
  /** Caption text shown under navbar name in mega menus */
  navbar_caption: string | null;
  /** Whether this category appears on the home page */
  show_in_home: boolean;
  /** Flexible custom fields for filtering */
  custom_fields: Record<string, any>;
  // SEO fields
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  /** Open Graph image for social sharing */
  og_image: string | null;
  /** JSON-LD schema markup */
  schema_json: object | null;
  /** Gallery images for the category */
  images: CategoryImage[];
  children?: Category[];
  products?: {
    items: Product[];
    pagination: Pagination;
  };
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  size_id: string;
  size_label: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  cannabinoid_type: string;
}

// =============================================================================
// OPTIONS
// =============================================================================

export interface DashClientOptions {
  /** Your API key (pk_* for public, sk_* for secret) */
  apiKey: string;
  /** Backend URL (default: "http://localhost:8000") */
  baseURL?: string;
}

export interface ProductsListOptions {
  /** Number of products per page (default: 20, max: 100) */
  limit?: number;
  /** Pagination offset (default: 0) */
  offset?: number;
  /** Filter by category slug */
  category?: string;
  /** Filter by brand slug */
  brand?: string;
  /** Search in product name */
  search?: string;
  /** Filter by custom fields (e.g. {popular: true, homepage_section: "hero"}) */
  customFields?: Record<string, string | number | boolean>;
}

export interface ReviewMedia {
  id: string;
  file_url: string;
  file_type: "image" | "video";
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  verified_purchase: boolean;
  created_at: string;
  variation_name?: string;
  variation_slug?: string;
  product_name?: string;
  product_slug?: string;
  product_image?: string | null;
  media?: ReviewMedia[];
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  stats: {
    count: number;
    average_rating: number;
    rating_breakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SubmitReviewData {
  /** Rating from 1-5 (required) */
  rating: number;
  /** Reviewer name (required) */
  author_name: string;
  /** Reviewer email (optional) */
  author_email?: string;
  /** Review title (optional) */
  title?: string;
  /** Review content (optional) */
  body?: string;
  /** Variation slug (optional) */
  variation_slug?: string;
  /** Array of uploaded media URLs (optional) */
  media_urls?: string[];
}

export interface AllReviewsResponse {
  reviews: ProductReview[];
  avg_rating: number;
  total: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SubmitReviewResponse {
  review: ProductReview;
  message: string;
}

export interface CategoriesListOptions {
  /** If true, returns nested tree structure */
  tree?: boolean;
  /** Filter by parent category slug */
  parent?: string;
  /** Filter by depth level (0 = root, 1 = first level children, etc.) */
  depth?: number;
  /** Filter by custom fields (e.g. {show_in_mega_menu: true}) */
  customFields?: Record<string, string | number | boolean>;
}

export interface CategoryGetOptions {
  /** Include products in response (default: true) */
  includeProducts?: boolean;
  /** Number of products */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

export interface CartAddOptions {
  /** Product ID */
  productId: string;
  /** Size/variant ID */
  sizeId: string;
  /** Quantity (default: 1) */
  quantity?: number;
  /** Freestyle bundle selections (slot_id + option_id pairs) */
  freestyleSelections?: { slot_id: string; option_id: string }[];
}

// =============================================================================
// RESPONSES
// =============================================================================

export interface PingResponse {
  status: string;
  message: string;
  organization: { id: string; name: string };
  environment: string;
  timestamp: string;
}

export interface ProductsListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductGetResponse {
  product: Product;
}

export interface FeaturedVariation {
  id: string;
  /** Variation name (e.g. "Blue Razz") */
  name: string;
  /** Variation slug */
  slug: string;
  /** Variation's main size image URL */
  image: string | null;
  /** Parent product name */
  product_name: string;
  /** Parent product slug for linking */
  product_slug: string;
  /** Desktop: horizontal position % (0-100) */
  d_pos_x: number | null;
  /** Desktop: vertical position % (0-100) */
  d_pos_y: number | null;
  /** Desktop: scale multiplier (1 = default) */
  d_scale: number | null;
  /** Desktop: rotation in degrees */
  d_rot: number | null;
  /** Mobile: horizontal position % (0-100) */
  m_pos_x: number | null;
  /** Mobile: vertical position % (0-100) */
  m_pos_y: number | null;
  /** Mobile: scale multiplier (1 = default) */
  m_scale: number | null;
  /** Mobile: rotation in degrees */
  m_rot: number | null;
}

export interface FeaturedVariationsResponse {
  variations: FeaturedVariation[];
}

export interface CategoriesListResponse {
  categories: Category[];
}

export interface CategoryGetResponse {
  category: Category;
}

export interface CartAddResponse {
  cart_id: string;
  item: CartItem;
  message: string;
}

export interface CartGetResponse {
  cart_id: string | null;
  items: CartItem[];
  subtotal: string;
  item_count: number;
}

export interface CartUpdateResponse {
  cart_id: string;
  item?: CartItem;
  message: string;
}

export interface CartRemoveResponse {
  message: string;
  cart: CartGetResponse;
}

export interface CartClearResponse {
  message: string;
  cart: CartGetResponse;
}

export interface CartTotals {
  itemCount: number;
  subtotal: string;
}

// =============================================================================
// PAGE DATA TYPES
// =============================================================================

export interface PageInfo {
  name: string;
  path: string;
  title: string | null;
  description: string | null;
}

export interface GlobalData {
  /** Store name (from Organization or StorefrontConfig) */
  store_name: string | null;
  /** Store description */
  store_description: string | null;
  /** Logo URL (from StorefrontConfig) */
  logo_url?: string | null;
  /** Logo image (from Organization) */
  logo: string | null;
  /** Business contact email */
  business_email: string | null;
  /** Business phone number */
  business_phone: string | null;
  /** Business website URL */
  website: string | null;
  /** Business address */
  address: string | null;
  /** City */
  city: string | null;
  /** Postal/ZIP code */
  zip_code: string | null;
  /** State information */
  state: { id: string; name: string; code: string } | null;
  /** Business type */
  business_type: { id: string; name: string } | null;
  /** Industry classification */
  industry: { id: string; name: string } | null;

  // Storefront settings
  /** Minimum cart subtotal for free shipping (null = no free shipping) */
  min_for_free_shipping: string | null;
  /** Default shipping rate when below free shipping threshold */
  shipping_rate: string | null;
  /** Tax rate as percentage (e.g., "8.25" for 8.25%) */
  tax_rate: string | null;
  /** Currency code (ISO 4217, e.g., "USD") */
  currency: string;

  /** Additional global data sources (nav_categories, etc.) */
  [key: string]: any;
}

export interface GlobalDataResponse {
  global: GlobalData;
}

export interface PageDataResponse {
  page: PageInfo;
  params: Record<string, string>;
  global: GlobalData;
  data: Record<string, any>;
}

export interface PagesListResponse {
  pages: PageInfo[];
}

export interface GetPageDataOptions {
  /** If true, treats the first parameter as a page name instead of path */
  byName?: boolean;
}

// =============================================================================
// MODULES
// =============================================================================

declare class ProductsModule {
  /**
   * List products with optional filters
   */
  list(options?: ProductsListOptions): Promise<ProductsListResponse>;

  /**
   * Get a single product by slug
   */
  get(slug: string): Promise<ProductGetResponse>;

  /**
   * Get reviews for a product
   * @param slug - Product slug
   * @param options - Pagination options
   */
  getReviews(slug: string, options?: { limit?: number; offset?: number }): Promise<ProductReviewsResponse>;

  /**
   * Submit a review for a product
   * @param slug - Product slug
   * @param data - Review data
   */
  submitReview(slug: string, data: SubmitReviewData): Promise<SubmitReviewResponse>;

  /**
   * Get all approved reviews across all products
   */
  getAllReviews(options?: { limit?: number; offset?: number }): Promise<AllReviewsResponse>;

  /**
   * Get featured variations (variations with show_in_bg custom field)
   */
  getFeaturedVariations(): Promise<FeaturedVariationsResponse>;
}

declare class CategoriesModule {
  /**
   * List categories
   */
  list(options?: CategoriesListOptions): Promise<CategoriesListResponse>;

  /**
   * Get a single category with its products
   */
  get(slug: string, options?: CategoryGetOptions): Promise<CategoryGetResponse>;

  /**
   * Get categories at a specific depth level
   * Convenience method for building navbars (depth 0) or submenus
   * @param depth - Depth level (0 = root categories)
   */
  getByDepth(depth?: number): Promise<CategoriesListResponse>;

  /**
   * Get category tree starting from root
   * Returns full nested hierarchy
   */
  getTree(): Promise<CategoriesListResponse>;

  /**
   * Get children of a specific category
   * @param parentSlug - Parent category slug
   */
  getChildren(parentSlug: string): Promise<CategoriesListResponse>;
}

// =============================================================================
// BRANDS MODULE
// =============================================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface BrandsListResponse {
  brands: Brand[];
}

export interface BrandDetail {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  short_description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image: string | null;
  custom_fields: Record<string, any>;
}

export interface BrandDetailResponse {
  brand: BrandDetail;
  products: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface BrandGetOptions {
  limit?: number;
  offset?: number;
}

declare class BrandsModule {
  /**
   * List all active brands
   */
  list(): Promise<BrandsListResponse>;

  /**
   * Get a single brand with its products
   */
  get(slug: string, options?: BrandGetOptions): Promise<BrandDetailResponse>;
}

export interface MarketingConfig {
  active: boolean;
  provider: { slug: string; name: string } | null;
  config?: Record<string, string>;
}

declare class MarketingModule {
  /**
   * Initialize marketing scripts (e.g. Klaviyo onsite JS).
   * Fetches email provider config and injects the appropriate script tag.
   * Safe to call multiple times — only runs once.
   */
  init(): Promise<MarketingConfig>;

  /**
   * Get the cached config (call init() first).
   */
  getConfig(): MarketingConfig | null;
}

declare class CartModule {
  /** Current cart ID */
  readonly cartId: string | null;

  /** All items in the cart */
  readonly items: CartItem[];

  /**
   * Load an existing cart by ID
   * @param cartId - Cart ID to load
   */
  load(cartId: string): Promise<CartGetResponse>;

  /**
   * Add item to cart
   */
  add(options: CartAddOptions): Promise<CartAddResponse>;

  /**
   * Update item quantity in cart
   * @param sizeId - Size ID of item to update
   * @param quantity - New quantity (0 to remove)
   */
  update(sizeId: string, quantity: number): Promise<CartUpdateResponse>;

  /**
   * Get cart contents from server
   */
  get(): Promise<CartGetResponse>;

  /**
   * Remove item from cart
   * @param sizeId - Size ID of item to remove
   */
  remove(sizeId: string): Promise<CartRemoveResponse>;

  /**
   * Clear all items from cart
   */
  clear(): Promise<CartClearResponse>;

  /**
   * Get cart totals
   */
  getTotals(): CartTotals;

  /**
   * Get total quantity across all items
   */
  getTotalQuantity(): number;
}

declare class PagesModule {
  /**
   * List all configured pages
   */
  list(): Promise<PagesListResponse>;

  /**
   * Get page data by path (with dynamic route matching)
   */
  getByPath(path: string): Promise<PageDataResponse>;

  /**
   * Get page data by name
   */
  getByName(name: string): Promise<PageDataResponse>;
}

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface CustomerAddress {
  line1: string;
  line2: string;
  city: string;
  state: string | null;
  state_name: string | null;
  zip_code: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email_verified: boolean;
  has_password: boolean;
  has_address: boolean;
  address: CustomerAddress | null;
  accepts_marketing: boolean;
  /** Loyalty points balance */
  points: number;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  customer: Customer;
}

export interface AuthRefreshResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface CustomerProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  accepts_marketing?: boolean;
}

declare class AuthModule {
  /** Current access token */
  readonly accessToken: string | null;

  /** Current customer (if authenticated) */
  readonly customer: Customer | null;

  /** Whether user is authenticated */
  readonly isAuthenticated: boolean;

  /**
   * Request OTP code via email
   * @param email - Customer email address
   */
  requestOTP(email: string, options?: { accepts_marketing?: boolean }): Promise<{ message: string; email: string }>;

  /**
   * Verify OTP and get tokens
   * @param email - Customer email address
   * @param code - 6-digit OTP code
   */
  verifyOTP(email: string, code: string): Promise<AuthTokenResponse>;

  /**
   * Refresh access token
   */
  refresh(): Promise<AuthRefreshResponse>;

  /**
   * Logout current customer
   * @param allSessions - If true, revokes all sessions
   */
  logout(allSessions?: boolean): Promise<void>;

  /**
   * Get current customer profile
   */
  getProfile(): Promise<{ customer: Customer }>;

  /**
   * Update customer profile
   */
  updateProfile(data: CustomerProfileUpdate): Promise<{ customer: Customer }>;

  /**
   * Get customer's order history
   */
  getOrders(options?: { limit?: number; offset?: number }): Promise<CustomerOrdersResponse>;

  /**
   * Get a single order by ID
   */
  getOrder(orderId: string): Promise<{ order: CheckoutOrder }>;

  /**
   * Check if current IP/session is banned
   */
  checkBan(): Promise<{ banned: boolean; reason?: string }>;

  /**
   * Set tokens manually (e.g., from localStorage on page load)
   */
  setTokens(accessToken: string, refreshToken: string): void;

  /**
   * Clear stored tokens
   */
  clearTokens(): void;
}

export interface CustomerOrdersResponse {
  orders: CheckoutOrder[];
  pagination: Pagination;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface StorefrontPaymentProcessor {
  slug: string;
  name: string;
  environment: "test" | "live";
  supported_currencies?: string[];
  features?: string[];
}

export interface PaymentToken {
  /** Opaque token from the processor (Accept.js nonce, etc.) */
  token: string;
  /** Token type descriptor (e.g., "COMMON.ACCEPT.INAPP.PAYMENT") */
  descriptor: string;
}

export interface CardData {
  /** Card number (spaces allowed, will be cleaned) */
  cardNumber: string;
  /** Expiration date in MM/YY or MM/YYYY format */
  expDate: string;
  /** Security code (CVV/CVC) — 3 or 4 digits */
  cvv: string;
}

export interface ChargeData {
  /** Token from tokenize() */
  token: string;
  /** Descriptor from tokenize() */
  descriptor?: string;
  /** Charge amount as a string (e.g., "99.99") */
  amount: string | number;
  /** Currency code (default: "USD") */
  currency?: string;
  /** Invoice or order number */
  invoiceNumber?: string;
  /** Charge description */
  description?: string;
  /** Billing address */
  billing?: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

export interface ChargeResult {
  success: boolean;
  error?: string;
  transaction?: {
    transaction_id: string;
    auth_code: string;
    response_code: string;
    account_number?: string;
    account_type?: string;
    processor: string;
    amount: string;
    status?: string;
  };
}

export interface AuthorizeData {
  /** Token from tokenize() */
  token: string;
  /** Descriptor from tokenize() */
  descriptor?: string;
  /** Amount to authorize */
  amount: string | number;
  /** Currency code (default: "USD") */
  currency?: string;
  /** Invoice or order number */
  invoiceNumber?: string;
  /** Description */
  description?: string;
  /** Billing address */
  billing?: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

export interface AuthorizeResult {
  success: boolean;
  error?: string;
  authorization?: {
    transaction_id: string;
    auth_code: string;
    response_code: string;
    account_number?: string;
    account_type?: string;
    processor: string;
    amount: string;
    status: "authorized";
  };
}

export interface CaptureData {
  /** Transaction ID from authorize() */
  transactionId: string;
  /** Amount to capture (optional, defaults to original auth amount) */
  amount?: string | number;
}

export interface CaptureResult {
  success: boolean;
  error?: string;
  transaction?: {
    transaction_id: string;
    auth_code?: string;
    response_code: string;
    processor: string;
    amount?: string;
    status: "captured";
  };
}

export interface VoidData {
  /** Transaction ID from authorize() */
  transactionId: string;
}

export interface VoidResult {
  success: boolean;
  error?: string;
  transaction?: {
    transaction_id: string;
    response_code: string;
    processor: string;
    status: "voided";
  };
}

export interface PaymentClientConfig {
  processor: StorefrontPaymentProcessor;
  client_config: Record<string, string>;
}

declare class AuthorizeNetCSR {
  constructor(config: { api_login_id: string; client_key: string; environment?: string });
  load(): Promise<void>;
  tokenize(cardData: CardData): Promise<PaymentToken>;
}

declare class PaymentModule {
  constructor(client: DashClient);

  /** Whether the processor's client library has been loaded */
  readonly isLoaded: boolean;

  /** The active processor's slug (e.g., "authorize-net") */
  readonly processorSlug: string | null;

  /**
   * Load the active payment processor's client library.
   * Call once in your app's layout/header (CSR only).
   * Fetches public keys and dynamically loads only the required library.
   *
   * @example
   * const processor = await dash.payment.load();
   * console.log(processor.slug); // "authorize-net"
   */
  load(): Promise<StorefrontPaymentProcessor>;

  /**
   * Get the active processor info without loading the client library.
   */
  getProcessor(): Promise<StorefrontPaymentProcessor | null>;

  /**
   * Tokenize card data. CSR only — must call load() first.
   *
   * For Authorize.net: pass { cardNumber, expDate, cvv }
   *
   * @example
   * const { token, descriptor } = await dash.payment.tokenize({
   *   cardNumber: "4111111111111111",
   *   expDate: "12/25",
   *   cvv: "123",
   * });
   */
  tokenize(cardData: CardData): Promise<PaymentToken>;

  /**
   * Charge a tokenized payment via the storefront API.
   * Single-step flow: Authorize AND capture in one call.
   * Works on both CSR and SSR.
   *
   * @example
   * const result = await dash.payment.charge({
   *   token: tokenData.token,
   *   descriptor: tokenData.descriptor,
   *   amount: "99.99",
   *   invoiceNumber: "1001",
   * });
   */
  charge(data: ChargeData): Promise<ChargeResult>;

  /**
   * Authorize a payment without capturing (place a hold on the card).
   * Two-step flow, Step 1. Use capture() to charge, or void() to release.
   *
   * @example
   * const auth = await dash.payment.authorize({
   *   token: tokenData.token,
   *   descriptor: tokenData.descriptor,
   *   amount: "99.99",
   * });
   * // Store auth.authorization.transaction_id for later
   */
  authorize(data: AuthorizeData): Promise<AuthorizeResult>;

  /**
   * Capture a previously authorized payment.
   * Two-step flow, Step 2a: Actually charge the held funds.
   *
   * @example
   * const result = await dash.payment.capture({
   *   transactionId: "123456789",
   *   amount: "89.99", // Optional: capture less than authorized
   * });
   */
  capture(data: CaptureData): Promise<CaptureResult>;

  /**
   * Void a previously authorized payment.
   * Two-step flow, Step 2b: Release the hold without charging.
   *
   * @example
   * const result = await dash.payment.void({
   *   transactionId: "123456789",
   * });
   */
  void(data: VoidData): Promise<VoidResult>;

  /**
   * Get the underlying processor handler for advanced usage.
   */
  getHandler(): AuthorizeNetCSR;
}

// =============================================================================
// BLOG TYPES
// =============================================================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  featured_image_alt: string;
  author_name: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  tags: string[];
  is_featured: boolean;
  reading_time: number;
  view_count: number;
  published_at: string | null;
  created_at: string;

  // Detail fields (only present when fetched with get())
  content?: string;
  allow_comments?: boolean;
  seo?: BlogPostSEO;
}

export interface BlogPostSEO {
  title: string;
  description: string;
  keywords: string;
  og_image: string | null;
}

export interface BlogPostsListOptions {
  /** Number of posts per page (default: 20, max: 100) */
  limit?: number;
  /** Pagination offset (default: 0) */
  offset?: number;
  /** Filter by category slug */
  category?: string;
  /** Filter by tag */
  tag?: string;
  /** Search in title and excerpt */
  search?: string;
  /** Only featured posts */
  featured?: boolean;
  /** Filter by custom fields (e.g. {show_in_sidebar: true, homepage_section: "latest_news"}) */
  customFields?: Record<string, string | number | boolean>;
}

export interface BlogPostsListResponse {
  posts: BlogPost[];
  pagination: Pagination;
}

export interface BlogPostGetOptions {
  /** View tracking mode (default: "session") */
  trackViews?: "session" | "always" | "none";
}

export interface BlogPostGetResponse {
  post: BlogPost;
}

export interface BlogPostSeoResponse {
  seo: BlogPostSEO & { canonical_slug: string };
}

export interface BlogCategoriesListResponse {
  categories: BlogCategory[];
}

declare class SeoModule {
  /**
   * Get SEO metadata for a product
   */
  product(slug: string): Promise<{ seo: ProductSEO & { canonical_slug: string } }>;

  /**
   * Get SEO metadata for a blog post
   */
  blogPost(slug: string): Promise<BlogPostSeoResponse>;
}

declare class BlogModule {
  /**
   * List published blog posts with optional filters
   */
  list(options?: BlogPostsListOptions): Promise<BlogPostsListResponse>;

  /**
   * Get a single blog post by slug (with full content)
   * @param slug - Blog post slug
   * @param options - Options (trackViews: "session" | "always" | "none")
   */
  get(slug: string, options?: BlogPostGetOptions): Promise<BlogPostGetResponse>;

  /**
   * Get SEO metadata for a blog post
   */
  getSeo(slug: string): Promise<BlogPostSeoResponse>;

  /**
   * List active blog categories
   */
  listCategories(): Promise<BlogCategoriesListResponse>;
}

// =============================================================================
// CHECKOUT TYPES
// =============================================================================

export interface CheckoutStartData {
  /** Cart ID */
  cartId: string;
  /** Customer email address */
  email: string;
}

export interface CheckoutStartResponse {
  message: string;
  email: string;
  /** Whether the user is authenticated (skipped OTP) */
  authenticated: boolean;
  customer: {
    first_name: string;
    last_name: string;
    has_address: boolean;
    address: CustomerAddress | null;
  };
  cart_summary: {
    item_count: number;
    subtotal: string;
    items: CartItem[];
  };
}

export interface CheckoutShipping {
  first_name: string;
  last_name: string;
  phone?: string;
  address: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
}

export interface CheckoutCompleteData {
  /** Cart ID */
  cartId: string;
  /** Customer email */
  email?: string;
  /** 6-digit OTP verification code */
  code?: string;
  /** Shipping address */
  shipping: CheckoutShipping;
  /** Optional order notes */
  customerNotes?: string;
  /** Payment authorization data */
  payment?: {
    transaction_id: string;
    auth_code: string;
    fraud_held?: boolean;
    posthog_session_id?: string;
  };
  /** Frontend-calculated totals to override server-side calculation */
  totals?: {
    shipping_cost: number;
    tax_amount: number;
  };
  /** Captcha token for bot protection */
  captcha_token?: string;
}

export interface CheckoutOrderItem {
  product_name: string;
  size_label: string;
  product_image: string | null;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface CheckoutOrder {
  id: string;
  order_number: number;
  status: string;
  payment_status: string;
  email: string;
  shipping: CheckoutShipping;
  items: CheckoutOrderItem[];
  subtotal: string;
  shipping_cost: string;
  tax_amount: string;
  total: string;
  customer_notes: string;
  created_at: string;
}

export interface CheckoutCompleteResponse {
  order: CheckoutOrder;
  customer: Customer;
  access_token: string;
  refresh_token: string;
}

declare class CheckoutModule {
  /**
   * Start checkout — validates cart and sends OTP verification code to email.
   * Creates customer account if one doesn't exist for the email.
   *
   * @example
   * const result = await dash.checkout.start({
   *   cartId: dash.cart.cartId,
   *   email: "customer@example.com",
   * });
   */
  start(data: CheckoutStartData): Promise<CheckoutStartResponse>;

  /**
   * Complete checkout — verifies OTP code, creates order from cart.
   * Returns the created order, customer data, and auth tokens.
   *
   * @example
   * const result = await dash.checkout.complete({
   *   cartId: dash.cart.cartId,
   *   email: "customer@example.com",
   *   code: "123456",
   *   shipping: {
   *     first_name: "John", last_name: "Doe",
   *     address: "123 Main St", city: "New York",
   *     state: "NY", zip_code: "10001",
   *   },
   * });
   */
  complete(data: CheckoutCompleteData): Promise<CheckoutCompleteResponse>;
}

// =============================================================================
// SHIPPING MODULE
// =============================================================================

/** A single shipping rate option returned by the shipping provider */
export interface ShippingRate {
  /** Human-readable service name (e.g., "USPS Priority Mail") */
  serviceName: string;
  /** Service code for creating labels (e.g., "usps_priority_mail") */
  serviceCode: string;
  /** Base shipping cost */
  shipmentCost: number;
  /** Additional costs (insurance, surcharges, etc.) */
  otherCost: number;
  /** Estimated transit days (null if unknown) */
  transitDays: number | null;
  /** Computed total cost (shipmentCost + otherCost), added by helper methods */
  totalCost?: number;
  /** Additional provider-specific fields */
  [key: string]: any;
}

export interface ShippingRateOptions {
  /** Carrier code (e.g., "stamps_com", "fedex", "ups") */
  carrier_code?: string;
  /** Carrier IDs (e.g., ["se-xxxxxx"]) */
  carrier_ids?: string[];
  /** Service type filter (e.g., "ups_ground", "usps_priority_mail") */
  service_type?: string;
  /** Origin zip code */
  from_postal?: string;
  /** Full origin address object */
  from_address?: Record<string, string>;
  /** Destination street address (needed for accurate rates) */
  to_address_line1?: string;
  /** Destination city (needed for accurate rates) */
  to_city?: string;
  /** Destination recipient name */
  to_name?: string;
  /** Destination state abbreviation (e.g., "CA") */
  to_state?: string;
  /** Destination country code (default: "US") */
  to_country?: string;
  /** Destination zip code */
  to_postal: string;
  /** Package weight in ounces */
  weight_oz: number;
  /** Package dimensions */
  dimensions?: {
    length: number;
    width: number;
    height: number;
    units?: string;
  };
}

export interface ShippingRateResult {
  /** The selected rate (cheapest or fastest) */
  rate: ShippingRate | null;
  /** All available rates, sorted by the selection criteria */
  all_rates: ShippingRate[];
}

export interface ShippingGetRateOptions extends ShippingRateOptions {
  /** Rate selection preference (default: "cheapest") */
  prefer?: "cheapest" | "fastest";
}

export interface FreeShippingCheck {
  /** Whether the subtotal meets the free shipping threshold */
  qualifies: boolean;
  /** The free shipping threshold (null if not configured) */
  threshold: number | null;
  /** Amount remaining to qualify for free shipping */
  remaining: number;
}

export interface TrackingResult {
  tracking_number: string;
  carrier_code: string;
  tracking_url: string;
}

export interface AddressValidationInput {
  /** Street address line 1 */
  address_line1: string;
  /** City name */
  city: string;
  /** State abbreviation (e.g. "CA") */
  state: string;
  /** ZIP / postal code */
  postal_code: string;
  /** Country code (default: "US") */
  country_code?: string;
}

export interface AddressValidationResult {
  /** Validation status from the shipping provider */
  status: "verified" | "unverified" | "warning";
  /** The original address as submitted */
  original_address: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  /** The normalized/corrected address from the provider */
  matched_address: {
    address_line1: string;
    city_locality: string;
    state_province: string;
    postal_code: string;
    country_code: string;
  };
  /** Informational or warning messages from the provider */
  messages: string[];
}

export declare class ShippingModule {
  /**
   * Get all available shipping rates for a package.
   * Returns the raw list of rate options from the shipping provider.
   *
   * @example
   * const { rates } = await dash.shipping.getRates({
   *   carrier_code: "stamps_com",
   *   to_state: "CA",
   *   to_postal: "90210",
   *   weight_oz: 16,
   * });
   */
  getRates(options: ShippingRateOptions): Promise<{ rates: ShippingRate[] }>;

  /**
   * Validate and normalize a shipping address via ShipEngine.
   *
   * @example
   * const result = await dash.shipping.validateAddress({
   *   address_line1: "123 Main St",
   *   city: "New York",
   *   state: "NY",
   *   postal_code: "10001",
   * });
   */
  validateAddress(address: AddressValidationInput): Promise<AddressValidationResult>;

  /**
   * Track a shipment by tracking number.
   *
   * @example
   * const tracking = await dash.shipping.track("1Z999AA10123456784", "ups");
   * console.log(tracking.tracking_url);
   */
  track(trackingNumber: string, carrierCode?: string): Promise<TrackingResult>;

  /**
   * Get the cheapest shipping rate for a package.
   * Fetches all rates and returns the one with the lowest total cost.
   *
   * @example
   * const { rate } = await dash.shipping.getCheapestRate({
   *   carrier_code: "stamps_com",
   *   to_postal: "10001",
   *   weight_oz: 8,
   * });
   * console.log(rate.serviceName);  // "USPS First Class Mail"
   * console.log(rate.totalCost);    // 4.25
   */
  getCheapestRate(options: ShippingRateOptions): Promise<ShippingRateResult>;

  /**
   * Get the fastest shipping rate for a package.
   * Fetches all rates and returns the one with fewest transit days.
   * Ties broken by lowest cost.
   *
   * @example
   * const { rate } = await dash.shipping.getFastestRate({
   *   carrier_code: "fedex",
   *   to_postal: "73301",
   *   weight_oz: 32,
   * });
   * console.log(rate.serviceName);  // "FedEx 2Day"
   * console.log(rate.transitDays);  // 2
   */
  getFastestRate(options: ShippingRateOptions): Promise<ShippingRateResult>;

  /**
   * Get a single recommended shipping rate.
   * Returns cheapest by default, or fastest if prefer="fastest".
   *
   * @example
   * const rate = await dash.shipping.getRate({
   *   carrier_code: "stamps_com",
   *   to_postal: "90210",
   *   weight_oz: 16,
   * });
   */
  getRate(options: ShippingGetRateOptions): Promise<ShippingRate | null>;

  /**
   * Check if an order qualifies for free shipping based on store config.
   *
   * @example
   * const result = await dash.shipping.checkFreeShipping(cart.subtotal);
   * if (!result.qualifies) {
   *   console.log(`Add $${result.remaining.toFixed(2)} more for free shipping`);
   * }
   */
  checkFreeShipping(subtotal: number | string): Promise<FreeShippingCheck>;
}

// =============================================================================
// TAX MODULE
// =============================================================================

export interface TaxCalculateOptions {
  /** Two-letter US state code (e.g., "CA") */
  state: string;
  /** Cart ID to calculate tax for */
  cart_id?: string;
  /** Manual items list (alternative to cart_id) */
  items?: Array<{
    price: number;
    quantity: number;
    cannabinoid_type?: string;
  }>;
}

export interface TaxBreakdownItem {
  cannabinoid_type: string;
  rate: string | null;
  special_tax_rate: string;
  special_tax_name?: string;
  tax_amount: string;
  illegal?: boolean;
}

export interface TaxCalculateResponse {
  state_code: string;
  state_name: string;
  tax_breakdown: TaxBreakdownItem[];
  total_tax: string;
  is_legal: boolean;
  illegal_items: Array<{ cannabinoid_type: string; message: string }>;
  fallback: boolean;
}

export interface TaxLegalityCheck {
  /** Whether all items are legal in the state */
  legal: boolean;
  /** Details about illegal items */
  illegal_items: Array<{ cannabinoid_type: string; message: string }>;
  /** Full state name */
  state_name: string;
  /** Two-letter state code */
  state_code: string;
}

export interface TaxOrderTotal {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface TaxOrderTotalParams {
  /** Cart subtotal */
  subtotal: number | string;
  /** Shipping cost (default: 0) */
  shipping?: number | string;
  /** Discount amount as positive number (default: 0) */
  discount?: number | string;
  /** Result from calculate() */
  taxResult: TaxCalculateResponse;
}

export interface TaxBreakdownLine {
  /** Human-readable label (e.g., "State Tax (delta9)") */
  label: string;
  /** Tax amount as string (e.g., "3.50") */
  amount: string;
  /** Tax rate as string with % (e.g., "7.25%") */
  rate: string;
}

export declare class TaxModule {
  /**
   * Calculate tax for items in a given state.
   * Supports per-cannabinoid tax rates when state configs are available.
   * Falls back to flat org tax rate when no state configs exist.
   *
   * @example
   * const result = await dash.tax.calculate({ state: "CA", cart_id: dash.cart.cartId });
   * console.log(result.total_tax);  // "12.50"
   * console.log(result.is_legal);   // true
   */
  calculate(options: TaxCalculateOptions): Promise<TaxCalculateResponse>;

  /**
   * Calculate tax for the current cart in a given state.
   * Automatically uses the cart module's cart ID.
   *
   * @example
   * const result = await dash.tax.calculateForCart("NY");
   * console.log(result.total_tax);  // "8.50"
   */
  calculateForCart(state: string): Promise<TaxCalculateResponse>;

  /**
   * Check if all items are legal to sell in a given state.
   * Returns a simple boolean + details about illegal items.
   *
   * @example
   * const check = await dash.tax.checkLegality("ID");
   * if (!check.legal) {
   *   check.illegal_items.forEach(item => console.log(item.message));
   * }
   */
  checkLegality(state: string, options?: Omit<TaxCalculateOptions, "state">): Promise<TaxLegalityCheck>;

  /**
   * Parse the total tax amount from a calculation result as a number.
   *
   * @example
   * const taxAmount = dash.tax.getTotal(result);  // 12.50
   */
  getTotal(taxResult: TaxCalculateResponse): number;

  /**
   * Calculate the complete order total with subtotal, shipping, discount, and tax.
   *
   * @example
   * const totals = dash.tax.getOrderTotal({
   *   subtotal: cart.subtotal,
   *   shipping: shippingRate.totalCost,
   *   discount: 5.00,
   *   taxResult,
   * });
   * console.log(totals.total);  // 112.75
   */
  getOrderTotal(params: TaxOrderTotalParams): TaxOrderTotal;

  /**
   * Format a tax breakdown into human-readable lines for display in checkout UI.
   *
   * @example
   * const lines = dash.tax.formatBreakdown(result);
   * // [{ label: "State Tax (general)", amount: "3.50", rate: "7.25%" }]
   */
  formatBreakdown(taxResult: TaxCalculateResponse): TaxBreakdownLine[];

  /**
   * Get a cached tax result if available.
   */
  getCached(state: string, cartId?: string): TaxCalculateResponse | null;

  /**
   * Clear the tax result cache.
   * Call this when cart contents change.
   */
  clearCache(): void;
}

// =============================================================================
// COA (Certificate of Analysis) MODULE
// =============================================================================

export interface CoaProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  variation_count: number;
}

export interface CoaListResponse {
  products: CoaProduct[];
  total_products: number;
}

export interface CoaVariation {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  lab_report_url: string | null;
}

export interface CoaProductResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
  };
  variations: CoaVariation[];
  total_variations: number;
}

export interface CoaDetailResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    selectable_variations?: { slug: string }[] | null;
  };
  variation: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    lab_report_url: string | null;
  };
}

export declare class CoaModule {
  constructor(client: DashClient);

  /** List products that have at least one variation with a lab-report file */
  list(options?: { q?: string }): Promise<CoaListResponse>;

  /** Get a product and its variations that have COA files */
  getProduct(productSlug: string): Promise<CoaProductResponse>;

  /** Get a single variation's COA detail (lab report URL) */
  getVariation(productSlug: string, variationSlug: string): Promise<CoaDetailResponse>;
}

// =============================================================================
// LEGAL DOCUMENT TYPES
// =============================================================================

export interface LegalDocumentListItem {
  title: string;
  slug: string;
  updated_at: string;
}

export interface LegalDocumentDetail {
  title: string;
  slug: string;
  content: string;
  updated_at: string;
}

export interface LegalDocumentsListResponse {
  documents: LegalDocumentListItem[];
}

export interface LegalDocumentResponse {
  document: LegalDocumentDetail;
}

export declare class LegalModule {
  constructor(client: DashClient);

  /** List all published legal documents (title, slug, updated_at) */
  list(): Promise<LegalDocumentsListResponse>;

  /** Get a single legal document by slug (full content) */
  get(slug: string): Promise<LegalDocumentResponse>;
}

// =============================================================================
// MEDIA MODULE
// =============================================================================

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt_text: string;
  file_type: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  tags: string[];
}

export interface MediaFolderResponse {
  folder: string;
  items: MediaItem[];
}

export declare class MediaModule {
  constructor(client: DashClient);

  /**
   * Get all media files within a named folder
   * @param folderName - The folder name (e.g. "gallery_01")
   *
   * @example
   * const { items } = await dash.media.getFolder("gallery_01");
   * items.forEach(img => console.log(img.url));
   */
  getFolder(folderName: string): Promise<MediaFolderResponse>;
}

export declare class EmailModule {
  constructor(client: DashClient);

  /**
   * Identify/update a customer profile in the email provider (Klaviyo).
   */
  identify(options: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    properties?: Record<string, any>;
  }): Promise<{ message: string }>;

  /**
   * Track an event in the email provider (Klaviyo).
   * Events can trigger flows (order confirmations, abandoned cart, etc.)
   */
  track(options: {
    email: string;
    event: string;
    properties?: Record<string, any>;
  }): Promise<{ message: string }>;
}

// =============================================================================
// DISCOUNT STORE TYPES
// =============================================================================

export interface DiscountStoreProduct {
  id: string;
  title: string;
  description: string;
  is_percentage: boolean;
  rate: string;
  min_subtotal: string | null;
  max_subtotal: string | null;
  point_cost: number;
  display_order: number;
}

export interface DiscountStoreListResponse {
  products: DiscountStoreProduct[];
  customer_points: number | null;
}

export interface DiscountStoreRedeemResponse {
  success: boolean;
  discount_code: {
    id: string;
    code: string;
    is_percentage: boolean;
    rate: string;
    min_subtotal: string | null;
    max_subtotal: string | null;
    valid_from: string | null;
    valid_until: string | null;
  };
  points_remaining: number;
}

export declare class DiscountStoreModule {
  constructor(client: DashClient);

  /** List available discount store products (includes customer points if authenticated) */
  list(): Promise<DiscountStoreListResponse>;

  /** Redeem a product using loyalty points (requires auth) */
  redeem(productId: string): Promise<DiscountStoreRedeemResponse>;
}

// =============================================================================
// MAIN CLIENT
// =============================================================================

export declare class DashClient {
  /**
   * Create a new DashClient instance
   */
  constructor(options: DashClientOptions);

  /** Your API key */
  readonly apiKey: string;

  /** Backend URL */
  readonly baseURL: string;

  /** Products API */
  readonly products: ProductsModule;

  /** Categories API */
  readonly categories: CategoriesModule;

  /** Cart API */
  readonly cart: CartModule;

  /** Pages API */
  readonly pages: PagesModule;

  /** SEO API */
  readonly seo: SeoModule;

  /** Auth API (Customer authentication) */
  readonly auth: AuthModule;

  /** Payment API */
  readonly payment: PaymentModule;

  /** Blog API */
  readonly blog: BlogModule;

  /** Checkout API */
  readonly checkout: CheckoutModule;

  /** Brands API */
  readonly brands: BrandsModule;

  /** Marketing script injection (Klaviyo onsite JS, etc.) */
  readonly marketing: MarketingModule;

  /** Shipping rate lookup, comparison, and tracking */
  readonly shipping: ShippingModule;

  /** Tax calculation API */
  readonly tax: TaxModule;

  /** COA / Lab Reports API */
  readonly coa: CoaModule;

  /** Legal Documents API */
  readonly legal: LegalModule;

  /** Email/Marketing integration (Klaviyo) */
  readonly email: EmailModule;

  /** Media files API */
  readonly media: MediaModule;

  /** Discount Store (loyalty point redemption) */
  readonly discountStore: DiscountStoreModule;

  /**
   * Health check - validates API key and returns organization info
   */
  ping(): Promise<PingResponse>;

  /**
   * Get page data - convenience method for SSR/SSG
   * Fetches all configured data for a page in a single request.
   *
   * @param pathOrName - URL path or page name
   * @param options - Options (use byName: true to lookup by name instead of path)
   *
   * @example
   * // By path (default)
   * const { page, params, global, data } = await dash.getPageData("/products/my-product");
   *
   * @example
   * // By name
   * const { page, global, data } = await dash.getPageData("home", { byName: true });
   */
  getPageData(pathOrName: string, options?: GetPageDataOptions): Promise<PageDataResponse>;

  /**
   * Get global store data (branding, contact info, etc.)
   * This is the data configured in dashboard settings/api-branding.
   *
   * @example
   * const { global } = await dash.getGlobalData();
   * console.log(global.store_name);       // "My Store"
   * console.log(global.logo);             // "https://..."
   * console.log(global.business_email);   // "contact@mystore.com"
   */
  getGlobalData(): Promise<GlobalDataResponse>;

  /** Get the current session ID used for analytics tracking */
  getSessionId(): string;

  /** Manually set the session ID (e.g., from PostHog or your own tracking) */
  setSessionId(id: string): void;
}

export default DashClient;

// =============================================================================
// REVALIDATION HANDLER (Next.js App Router)
// =============================================================================

export interface RevalidateHandlerOptions {
  /** Shared secret that must match between backend and frontend */
  secret: string | undefined;
}

/**
 * Create a Next.js App Router POST handler for on-demand ISR revalidation.
 * Validates a shared secret from the request body, then calls revalidatePath()
 * for each path in the paths array.
 *
 * @example
 * // app/api/revalidate/route.ts
 * import { createRevalidateHandler } from "@/lib/dash4devs";
 * export const POST = createRevalidateHandler({ secret: process.env.REVALIDATE_SECRET });
 */
export function createRevalidateHandler(options: RevalidateHandlerOptions): (request: Request) => Promise<Response>;
