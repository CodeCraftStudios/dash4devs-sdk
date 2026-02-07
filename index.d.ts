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
  /** Bulk discount tiers for this size */
  bulk_discounts?: BulkDiscount[];
}

/**
 * Selectable variation for products with show_sizes_and_variations=true
 * Each variation has its own sizes with pricing
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
export interface Product {
  id: string;
  name: string;
  slug: string;
  main_image: string | null;
  category: { id: string; name: string; slug: string } | null;
  price: string | null;
  discounted_price: string | null;
  in_stock: boolean;

  /**
   * Maximum bulk discount percentage available for this product.
   * Calculated from the highest discount tier across all sizes.
   * Useful for showing "Up to X% bulk discount" badges on product cards.
   */
  max_bulk_discount?: number | null;

  // Detail fields (only present when fetched with include_details)
  description?: string;

  /**
   * Determines product page UI mode:
   * - true: Shows variation selector + size selector (dual mode)
   * - false: Shows only size selector (simple mode)
   */
  show_sizes_and_variations?: boolean;

  /**
   * Selectable variations (when show_sizes_and_variations=true)
   * Each variation has its own sizes with pricing
   */
  selectable_variations?: SelectableVariation[] | null;

  /**
   * Direct sizes (when show_sizes_and_variations=false)
   * These are sizes not linked to any variation
   */
  sizes?: ProductSize[];

  /** Attributes (e.g., Color, Fabric) containing options with sizes */
  attributes?: ProductAttribute[];
  images?: { id: string; url: string }[];
  features?: { key: string; value: string }[];
  qna?: { question: string; answer: string }[];
  seo?: ProductSEO;
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

export interface ProductReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  verified_purchase: boolean;
  created_at: string;
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
  requestOTP(email: string): Promise<{ message: string; email: string }>;

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
  /** Opaque token from the processor (Accept.js nonce, Stripe PaymentMethod ID, etc.) */
  token: string;
  /** Token type descriptor (e.g., "COMMON.ACCEPT.INAPP.PAYMENT", "STRIPE.PAYMENT_METHOD") */
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

declare class StripeCSR {
  constructor(config: { publishable_key: string; environment?: string });
  load(): Promise<void>;
  getStripe(): any;
  createElements(options?: any): any;
  tokenize(cardElement: any, billingDetails?: any): Promise<PaymentToken>;
}

declare class PaymentModule {
  constructor(client: DashClient);

  /** Whether the processor's client library has been loaded */
  readonly isLoaded: boolean;

  /** The active processor's slug (e.g., "authorize-net", "stripe") */
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
   * For Stripe: pass a Stripe card Element as first arg
   *
   * @example
   * const { token, descriptor } = await dash.payment.tokenize({
   *   cardNumber: "4111111111111111",
   *   expDate: "12/25",
   *   cvv: "123",
   * });
   */
  tokenize(cardData: CardData | any, extra?: any): Promise<PaymentToken>;

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
   * For Stripe, gives access to createElements() for custom forms.
   */
  getHandler(): AuthorizeNetCSR | StripeCSR;
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
  email: string;
  /** 6-digit OTP verification code */
  code: string;
  /** Shipping address */
  shipping: CheckoutShipping;
  /** Optional order notes */
  customerNotes?: string;
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
}

export default DashClient;
