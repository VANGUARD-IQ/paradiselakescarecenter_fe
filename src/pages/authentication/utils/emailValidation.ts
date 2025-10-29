/**
 * Validates email address format using standard regex pattern
 *
 * @param email - Email address to validate
 * @returns true if valid email format, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
