import currencies from './currencies.json';

/**
 * Get currency info by code
 * @param {string} code - Currency code (e.g., 'USD', 'EUR')
 * @returns {Object | null} Currency object with code, symbol, name
 */
export function getCurrencyByCode(code) {
  return currencies.find(c => c.code === code) || null;
}

/**
 * Get currency info by symbol
 * @param {string} symbol - Currency symbol (e.g., '$', '€')
 * @returns {Object | null} Currency object with code, symbol, name
 */
export function getCurrencyBySymbol(symbol) {
  return currencies.find(c => c.symbol === symbol) || null;
}

/**
 * Get all currencies
 * @returns {Array} Array of all currency objects
 */
export function getAllCurrencies() {
  return currencies;
}

/**
 * Get currency symbol by code
 * @param {string} code - Currency code
 * @returns {string} Currency symbol or code if not found
 */
export function getCurrencySymbol(code) {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || code;
}

/**
 * Get currency name by code
 * @param {string} code - Currency code
 * @returns {string} Currency name or code if not found
 */
export function getCurrencyName(code) {
  const currency = getCurrencyByCode(code);
  return currency?.name || code;
}

/**
 * Format currency options for Select component
 * @returns {Array} Array of {value, label} objects
 */
export function getCurrencyOptions() {
  return currencies.map(c => ({
    value: c.code,
    label: `${c.symbol} ${c.name} (${c.code})`
  }));
}
