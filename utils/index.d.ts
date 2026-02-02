// ============================================================================
// Price Utilities
// ============================================================================

export interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  showCents?: boolean;
}

export interface FormatPercentOptions {
  decimals?: number;
  showSign?: boolean;
}

export function formatPrice(price: number | string, options?: FormatPriceOptions): string;
export function formatPercent(value: number | string, options?: FormatPercentOptions): string;
export function calculateDiscountPercent(originalPrice: number | string, discountedPrice: number | string): number;
export function parsePrice(price: string | number): number;

// ============================================================================
// Bulk Discount Utilities
// ============================================================================

export interface BulkDiscount {
  min_quantity: number;
  max_quantity: number | null;
  discount_type: "percentage" | "fixed";
  discount_value: string;
}

export interface BulkDiscountResult {
  percentage: number;
  amount: number;
  subtotal: number;
  total: number;
  appliedTier: BulkDiscount | null;
}

export interface CalculateBulkDiscountOptions {
  price: string | number;
  quantity: number;
  bulkDiscounts?: BulkDiscount[];
}

export interface GetNextDiscountTierOptions {
  quantity: number;
  bulkDiscounts?: BulkDiscount[];
}

export interface NextDiscountTier {
  tier: BulkDiscount;
  quantityNeeded: number;
}

export interface DiscountTierSummary {
  tier: BulkDiscount;
  savings: number;
  pricePerUnit: number;
  discountPercent: number;
}

export interface GetDiscountTiersSummaryOptions {
  price: string | number;
  bulkDiscounts?: BulkDiscount[];
}

export function calculateBulkDiscount(options: CalculateBulkDiscountOptions): BulkDiscountResult;
export function getNextDiscountTier(options: GetNextDiscountTierOptions): NextDiscountTier | null;
export function getDiscountTiersSummary(options: GetDiscountTiersSummaryOptions): DiscountTierSummary[];
export function hasBulkDiscounts(bulkDiscounts?: BulkDiscount[]): boolean;
