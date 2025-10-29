import { type CountryCode } from '../types';
import { formatPhoneNumber, toInternationalFormat } from '../utils';

/**
 * Custom hook to manage phone number input with country-specific formatting
 *
 * Features:
 * - Automatic formatting as user types
 * - Country code handling
 * - Conversion between local and international formats
 * - Leading zero removal for Australian numbers
 *
 * @param selectedCountry - Currently selected country code
 * @param setLocalPhoneNumber - Setter for local phone number state
 * @param setPhoneNumber - Setter for international phone number state
 * @returns Phone input handler function
 */
export const usePhoneInput = (
  selectedCountry: CountryCode,
  setLocalPhoneNumber: (value: string) => void,
  setPhoneNumber: (value: string) => void
) => {
  const handlePhoneInput = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry.code);
    setLocalPhoneNumber(formatted);
    // Store the full international number for backend
    const international = toInternationalFormat(formatted, selectedCountry.code);
    setPhoneNumber(international);
  };

  return { handlePhoneInput };
};
