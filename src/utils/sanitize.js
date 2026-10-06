import DOMPurify from 'dompurify';

/**
 * Centralized input sanitization utilities.
 * Prevents XSS via form inputs and ensures consistent data validation.
 * Uses DOMPurify for robust sanitization (M-2 fix — regex was bypassable).
 */

/**
 * Strip ALL HTML tags from a string, returning safe plain text.
 * Uses DOMPurify with no allowed tags to defeat malformed-HTML bypass attacks.
 * @param {string} input - Raw user input
 * @returns {string} Cleaned plain-text string with no HTML
 */
export function stripHtml(input) {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Sanitize and validate an email address.
 * @param {string} email - Raw email input
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizeEmail(email) {
  const cleaned = stripHtml(email).toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return {
    valid: emailRegex.test(cleaned),
    value: cleaned,
  };
}

/**
 * Sanitize and validate a name field.
 * @param {string} name - Raw name input
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizeName(name) {
  const cleaned = stripHtml(name).trim();
  const nameRegex = /^[A-Za-z\s.'-]{2,50}$/;
  return {
    valid: nameRegex.test(cleaned),
    value: cleaned,
  };
}

/**
 * Sanitize and validate a phone number (Indian format).
 * @param {string} phone - Raw phone input
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizePhone(phone) {
  // Strip everything except digits and leading +
  const cleaned = stripHtml(phone).replace(/[^\d+]/g, '');
  // Indian phone: 10 digits, optionally prefixed with +91 or 0
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  return {
    valid: phoneRegex.test(cleaned),
    value: cleaned,
  };
}

/**
 * Sanitize and validate a PIN code (Indian 6-digit).
 * @param {string} pin - Raw pin input
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizePin(pin) {
  const cleaned = stripHtml(pin).replace(/\D/g, '');
  const pinRegex = /^[1-9]\d{5}$/;
  return {
    valid: pinRegex.test(cleaned),
    value: cleaned,
  };
}

/**
 * Sanitize a general text input (address, city, message, etc.).
 * Strips HTML but allows most characters.
 * @param {string} input - Raw text input
 * @param {number} [maxLength=200] - Maximum allowed length
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizeText(input, maxLength = 200) {
  const cleaned = stripHtml(input).trim();
  return {
    valid: cleaned.length > 0 && cleaned.length <= maxLength,
    value: cleaned.slice(0, maxLength),
  };
}

/**
 * Sanitize a coupon code.
 * @param {string} code - Raw coupon input
 * @returns {{ valid: boolean, value: string }}
 */
export function sanitizeCoupon(code) {
  const cleaned = stripHtml(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const couponRegex = /^[A-Z0-9]{3,20}$/;
  return {
    valid: couponRegex.test(cleaned),
    value: cleaned,
  };
}
