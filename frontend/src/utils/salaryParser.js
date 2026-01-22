import { getCurrencyByCode, getCurrencyBySymbol } from './currencyHelpers';

/**
 * Parse salary range string into min, max, and currency
 * Expected format: "50000$ - 80000$" or "50000 USD - 80000 USD"
 * @param {string} salaryRange - The salary range string
 * @returns {{minSalary: number, maxSalary: number, currency: string} | null}
 */
export function parseSalaryRange(salaryRange) {
  if (!salaryRange || typeof salaryRange !== 'string') {
    return null;
  }

  // Remove extra whitespace and normalize
  const normalized = salaryRange.trim();

  // Pattern: number + currency - number + currency
  // Supports: 50000$ - 80000$, 50,000$ - 80,000$, 50000 USD - 80000 USD
  const pattern = /^([\d,]+)\s*([A-Z₪$€£¥₹]+)\s*-\s*([\d,]+)\s*([A-Z₪$€£¥₹]+)?$/i;
  const match = normalized.match(pattern);

  if (!match) {
    return null;
  }

  const [, minStr, currency1, maxStr, currency2] = match;

  // Remove commas and parse numbers
  const minSalary = parseInt(minStr.replace(/,/g, ''), 10);
  const maxSalary = parseInt(maxStr.replace(/,/g, ''), 10);

  // Validate numbers
  if (isNaN(minSalary) || isNaN(maxSalary) || minSalary < 0 || maxSalary < 0) {
    return null;
  }

  if (minSalary > maxSalary) {
    return null;
  }

  // Determine currency (prefer second if present, otherwise use first)
  let currencyCode = (currency2 || currency1).toUpperCase();

  // Normalize common currency name variations to codes
  const currencyMap = {
    'EURO': 'EUR',
    'EUROS': 'EUR',
    'DOLLAR': 'USD',
    'DOLLARS': 'USD',
    'POUND': 'GBP',
    'POUNDS': 'GBP',
    'YEN': 'JPY',
    'YUAN': 'CNY',
    'SHEKEL': 'ILS',
    'SHEKELS': 'ILS',
    'RUPEE': 'INR',
    'RUPEES': 'INR',
  };

  // Convert common names to codes
  if (currencyMap[currencyCode]) {
    currencyCode = currencyMap[currencyCode];
  }

  // Find matching currency by code or symbol
  const currencyInfo = getCurrencyByCode(currencyCode) || getCurrencyBySymbol(currency1);

  return {
    minSalary,
    maxSalary,
    currency: currencyInfo?.code || currencyCode,
  };
}

/**
 * Format salary range for display
 * @param {number} minSalary
 * @param {number} maxSalary
 * @param {string} currency
 * @returns {string}
 */
export function formatSalaryRange(minSalary, maxSalary, currency = 'USD') {
  if (!minSalary && !maxSalary) {
    return '';
  }

  const currencyInfo = getCurrencyByCode(currency);

  // Always use a symbol - fallback to common symbols if currency not found
  let symbol = currencyInfo?.symbol;

  if (!symbol) {
    // Fallback symbols for unknown currencies
    const fallbackSymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'ILS': '₪',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'Fr',
    };
    symbol = fallbackSymbols[currency] || '$'; // Ultimate fallback to $
  }

  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  if (minSalary && maxSalary) {
    return `${symbol}${formatNumber(minSalary)} - ${symbol}${formatNumber(maxSalary)}`;
  } else if (minSalary) {
    return `${symbol}${formatNumber(minSalary)}+`;
  } else {
    return `Up to ${symbol}${formatNumber(maxSalary)}`;
  }
}

/**
 * Validate salary range format
 * @param {string} salaryRange
 * @returns {{valid: boolean, error?: string}}
 */
export function validateSalaryRange(salaryRange) {
  if (!salaryRange || salaryRange.trim() === '') {
    return { valid: true }; // Optional field
  }

  const result = parseSalaryRange(salaryRange);

  if (!result) {
    return {
      valid: false,
      error: 'Invalid format. Use: 50000$ - 80000$ or 50000 USD - 80000 USD',
    };
  }

  return { valid: true };
}
