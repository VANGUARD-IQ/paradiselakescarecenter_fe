import { type CountryCode } from '../types';

/**
 * Formats a phone number according to country-specific patterns
 *
 * Supports:
 * - Australia (+61): XXXX XXX XXX
 * - US/Canada (+1): XXX XXX XXXX
 * - UK (+44): XXXX XXXXXX
 * - Default: Groups of 3 digits
 *
 * @param value - Raw phone number input (may contain spaces/formatting)
 * @param countryCode - Country code prefix (e.g., "+61")
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string, countryCode: string): string => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');

  // Apply formatting based on country
  if (countryCode === '+61') {
    // Australian format: XXXX XXX XXX (handles both 0412 345 678 and 412 345 678)
    if (digitsOnly.length <= 4) return digitsOnly;
    if (digitsOnly.length <= 7) return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
    return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 10)}`;
  } else if (countryCode === '+1') {
    // US/Canada format: XXX XXX XXXX
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
  } else if (countryCode === '+44') {
    // UK format: XXXX XXXXXX
    if (digitsOnly.length <= 4) return digitsOnly;
    return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 10)}`;
  }

  // Default: just digits with spaces every 3
  return digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ');
};

/**
 * Validates phone number based on country-specific rules
 *
 * @param phoneNumber - Local phone number (without country code)
 * @param selectedCountry - Country code object with validation rules
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber: string, selectedCountry: CountryCode): boolean => {
  let digitsOnly = phoneNumber.replace(/\D/g, '');

  // Country-specific validation
  if (selectedCountry.code === '+61') {
    // Remove leading 0 if present for validation
    if (digitsOnly.startsWith('0')) {
      digitsOnly = digitsOnly.substring(1);
    }
    // Australian mobiles: must be exactly 9 digits (after removing leading 0)
    return digitsOnly.length === 9;
  }

  // Basic validation for other countries - at least 8 digits, max 15
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return false;
  }

  return true;
};

/**
 * Converts local phone number to international format
 * Handles country-specific formatting (e.g., removes leading 0 for Australian numbers)
 *
 * @param localNumber - Phone number in local format
 * @param countryCode - Country code prefix
 * @returns Full international phone number
 */
export const toInternationalFormat = (localNumber: string, countryCode: string): string => {
  let digitsOnly = localNumber.replace(/\D/g, '');

  // Remove leading 0 for Australian numbers (common format)
  if (countryCode === '+61' && digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.substring(1);
  }

  return countryCode + digitsOnly;
};

/**
 * Gets a user-friendly validation error message for phone numbers
 *
 * @param localNumber - Phone number in local format
 * @param selectedCountry - Country code object
 * @returns Error message string or empty string if valid
 */
export const getPhoneValidationError = (localNumber: string, selectedCountry: CountryCode): string => {
  let digitsOnly = localNumber.replace(/\D/g, '');

  if (digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.substring(1);
  }

  if (selectedCountry.code === '+61') {
    if (digitsOnly.length < 9) {
      return `Australian mobile numbers need 9 digits (you entered ${digitsOnly.length})`;
    } else if (digitsOnly.length > 9) {
      return `Australian mobile numbers must be exactly 9 digits (you entered ${digitsOnly.length})`;
    }
  } else {
    return `Please enter a valid ${selectedCountry.country} mobile number`;
  }

  return '';
};
