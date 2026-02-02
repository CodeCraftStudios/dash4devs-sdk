/**
 * Utility functions for dash4devs
 */

export {
  formatPrice,
  formatPercent,
  calculateDiscountPercent,
  parsePrice,
} from "./price.js";

export {
  calculateBulkDiscount,
  getNextDiscountTier,
  getDiscountTiersSummary,
  hasBulkDiscounts,
} from "./bulk-discount.js";
