// Shared Indian Rupee Currency Formatter
// Unit: integer paise (1 Rupee = 100 Paise)

const defaultFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats integer paise into an Indian Rupee string (e.g. 49950 -> "₹499.50", 123450 -> "₹1,234.50")
 * @param {number|string|bigint} paise - Amount in integer paise
 * @param {Intl.NumberFormatOptions} [options] - Optional custom Intl format options
 * @returns {string} Formatted INR currency string
 */
export function formatINR(paise, options) {
  if (paise == null || isNaN(Number(paise))) {
    return '₹0.00';
  }
  const rupees = Number(paise) / 100;
  if (options && Object.keys(options).length > 0) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
      ...options,
    }).format(rupees);
  }
  return defaultFormatter.format(rupees);
}

/**
 * Converts user decimal rupees input into integer paise (e.g. 450.50 -> 45050)
 * @param {number|string} rupees - User-entered rupees
 * @returns {number} Integer paise
 */
export function rupeesToPaise(rupees) {
  if (rupees == null || isNaN(Number(rupees))) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
}

/**
 * Converts integer paise into decimal rupees (e.g. 45050 -> 450.5)
 * @param {number|string} paise - Amount in paise
 * @returns {number} Decimal rupees
 */
export function paiseToRupees(paise) {
  if (paise == null || isNaN(Number(paise))) {
    return 0;
  }
  return Number(paise) / 100;
}
