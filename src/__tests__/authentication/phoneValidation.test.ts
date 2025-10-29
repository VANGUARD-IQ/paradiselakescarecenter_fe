import {
  formatPhoneNumber,
  isValidPhoneNumber,
  toInternationalFormat,
  getPhoneValidationError,
} from '../../pages/authentication/utils/phoneValidation';
import { COUNTRY_CODES } from '../../pages/authentication/types';

describe('phoneValidation utilities', () => {
  describe('formatPhoneNumber', () => {
    it('should format Australian numbers correctly', () => {
      expect(formatPhoneNumber('0412345678', '+61')).toBe('0412 345 678');
      expect(formatPhoneNumber('412345678', '+61')).toBe('0412 345 678');
      expect(formatPhoneNumber('0412', '+61')).toBe('0412');
      expect(formatPhoneNumber('04123', '+61')).toBe('0412 3');
    });

    it('should format US numbers correctly', () => {
      expect(formatPhoneNumber('5551234567', '+1')).toBe('555 123 4567');
      expect(formatPhoneNumber('555', '+1')).toBe('555');
      expect(formatPhoneNumber('5551', '+1')).toBe('555 1');
    });

    it('should format UK numbers correctly', () => {
      expect(formatPhoneNumber('02071234567', '+44')).toBe('0207 123456');
      expect(formatPhoneNumber('0207', '+44')).toBe('0207');
    });

    it('should handle non-digit characters', () => {
      expect(formatPhoneNumber('0412-345-678', '+61')).toBe('0412 345 678');
      expect(formatPhoneNumber('(0412) 345 678', '+61')).toBe('0412 345 678');
    });

    it('should format default pattern for unknown countries', () => {
      const result = formatPhoneNumber('123456789', '+99');
      expect(result).toMatch(/\d{3} \d{3} \d{3}/);
    });
  });

  describe('isValidPhoneNumber', () => {
    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;
    const usCountry = COUNTRY_CODES.find(c => c.code === '+1')!;

    it('should validate Australian mobile numbers', () => {
      expect(isValidPhoneNumber('0412345678', australiaCountry)).toBe(true);
      expect(isValidPhoneNumber('412345678', australiaCountry)).toBe(true);
      expect(isValidPhoneNumber('0412 345 678', australiaCountry)).toBe(true);
    });

    it('should reject invalid Australian numbers', () => {
      expect(isValidPhoneNumber('041234567', australiaCountry)).toBe(false); // Too short
      expect(isValidPhoneNumber('04123456789', australiaCountry)).toBe(false); // Too long
      expect(isValidPhoneNumber('123', australiaCountry)).toBe(false);
    });

    it('should validate other country numbers with general rules', () => {
      expect(isValidPhoneNumber('5551234567', usCountry)).toBe(true); // 10 digits
      expect(isValidPhoneNumber('123456789012345', usCountry)).toBe(true); // 15 digits (max)
    });

    it('should reject numbers that are too short or too long for other countries', () => {
      expect(isValidPhoneNumber('1234567', usCountry)).toBe(false); // Too short (< 8)
      expect(isValidPhoneNumber('1234567890123456', usCountry)).toBe(false); // Too long (> 15)
    });
  });

  describe('toInternationalFormat', () => {
    it('should convert Australian numbers to international format', () => {
      expect(toInternationalFormat('0412345678', '+61')).toBe('+61412345678');
      expect(toInternationalFormat('412345678', '+61')).toBe('+61412345678');
    });

    it('should convert other country numbers to international format', () => {
      expect(toInternationalFormat('5551234567', '+1')).toBe('+15551234567');
      expect(toInternationalFormat('02071234567', '+44')).toBe('+4402071234567');
    });

    it('should handle numbers with formatting', () => {
      expect(toInternationalFormat('0412 345 678', '+61')).toBe('+61412345678');
      expect(toInternationalFormat('(555) 123-4567', '+1')).toBe('+15551234567');
    });
  });

  describe('getPhoneValidationError', () => {
    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;
    const usCountry = COUNTRY_CODES.find(c => c.code === '+1')!;

    it('should return error for Australian numbers that are too short', () => {
      const error = getPhoneValidationError('041234567', australiaCountry);
      expect(error).toContain('9 digits');
      expect(error).toContain('you entered 8');
    });

    it('should return error for Australian numbers that are too long', () => {
      const error = getPhoneValidationError('04123456789', australiaCountry);
      expect(error).toContain('exactly 9 digits');
      expect(error).toContain('you entered 10');
    });

    it('should return empty string for valid Australian numbers', () => {
      expect(getPhoneValidationError('0412345678', australiaCountry)).toBe('');
      expect(getPhoneValidationError('412345678', australiaCountry)).toBe('');
    });

    it('should return generic error for other countries', () => {
      const error = getPhoneValidationError('123', usCountry);
      expect(error).toContain('valid');
      expect(error).toContain(usCountry.country);
    });
  });
});
