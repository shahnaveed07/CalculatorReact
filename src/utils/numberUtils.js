/**
 * Precision numerical formatting and arithmetic helper functions.
 */

// Maximum floating point precision for display rounding to prevent IEEE-754 artifacts
const EPSILON = 1e-12;
const MAX_SAFE_FACTORIAL = 170; // 171! exceeds Number.MAX_VALUE (Infinity)

/**
 * Normalizes floating point results to avoid issues like 0.1 + 0.2 = 0.30000000000000004
 * or Math.sin(Math.PI) returning 1.2246467991473532e-16 instead of 0.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 */
export function normalizeFloat(value, decimals = 12) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return value;
  }

  // Treat values extremely close to 0 as exact 0
  if (Math.abs(value) < EPSILON) {
    return 0;
  }

  // Treat values extremely close to integers as integers
  const roundedInt = Math.round(value);
  if (Math.abs(value - roundedInt) < EPSILON) {
    return roundedInt;
  }

  // Round to specified significant decimals to strip float artifacts
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculates n! safely for integer values between 0 and 170.
 * Throws errors for negative numbers, non-integers, or overflow.
 * @param {number} n
 * @returns {number}
 */
export function factorial(n) {
  if (!Number.isFinite(n)) {
    throw new Error('Invalid input');
  }
  if (n < 0) {
    throw new Error('Negative factorial');
  }
  if (!Number.isInteger(n)) {
    throw new Error('Non-integer factorial');
  }
  if (n > MAX_SAFE_FACTORIAL) {
    throw new Error('Overflow');
  }
  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Formats a numeric value or string for calculator display.
 * Adds thousand separator commas to the integer part while preserving decimals.
 * Falls back to clean scientific notation for extreme numbers.
 * @param {number|string} val
 * @param {number} maxSignificantDigits
 * @returns {string}
 */
export function formatDisplayNumber(val, maxSignificantDigits = 12) {
  if (val === null || val === undefined || val === '') {
    return '0';
  }

  // Handle direct string errors
  if (typeof val === 'string' && isNaN(Number(val))) {
    return val;
  }

  const num = typeof val === 'string' ? Number(val) : val;

  if (Number.isNaN(num)) {
    return 'Error';
  }

  if (!Number.isFinite(num)) {
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  const absNum = Math.abs(num);

  // If number is zero
  if (absNum === 0) {
    // Check if it's negative zero
    return Object.is(num, -0) ? '-0' : '0';
  }

  // Use scientific notation for very large or microscopic numbers
  if (absNum >= 1e14 || (absNum < 1e-7 && absNum > 0)) {
    return num.toExponential(7).replace(/\.?0+e/, 'e');
  }

  // Standard representation with normalized decimals
  const normalized = normalizeFloat(num, 10);
  const parts = normalized.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer portion with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
}

/**
 * Formats active user input (which may be in the middle of typing, e.g. "12." or "-0.00")
 * @param {string} inputStr
 * @returns {string}
 */
export function formatActiveInput(inputStr) {
  if (!inputStr) return '0';
  if (inputStr === '-') return '-';
  if (inputStr === 'Error' || inputStr.startsWith('Cannot') || inputStr === 'Infinity' || inputStr === '-Infinity') {
    return inputStr;
  }

  const hasDecimal = inputStr.includes('.');
  const parts = inputStr.split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Format integer part
  const sign = intPart.startsWith('-') ? '-' : '';
  const digits = sign ? intPart.slice(1) : intPart;
  const formattedDigits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedInt = `${sign}${formattedDigits}`;

  if (hasDecimal) {
    return `${formattedInt}.${decPart || ''}`;
  }

  return formattedInt;
}
