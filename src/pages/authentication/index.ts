// Authentication Module - Centralized authentication components and functionality
// Version: 1.0.0
// Last Updated: 2025-01-12
// Dependencies: React 18+, Chakra UI, Apollo Client, React Router DOM

// Components
export { UnifiedLoginModal } from "./components/UnifiedLoginModal";
export { CaptureUserDetailsModal } from "./components/CaptureUserDetailsModal";
export { SecureMembershipButton } from "./components/SecureMembershipButton";
export { EmailChangeModal } from "./components/EmailChangeModal";
export { PhoneChangeModal } from "./components/PhoneChangeModal";

// Legacy exports for backward compatibility (deprecated - use UnifiedLoginModal)
export { UnifiedLoginModal as LoginModal } from "./components/UnifiedLoginModal";
export { UnifiedLoginModal as LoginWithSmsModal } from "./components/UnifiedLoginModal";

// Types (frontend-specific only - GraphQL types come from generated/graphql.ts)
export type {
  CountryCode,
  LoginModalProps,
  LoginWithSmsModalProps,
  CaptureUserDetailsModalProps,
  SecureMembershipButtonProps,
  UserDetailsFormData,
  JWTDecoded,
} from "./types";

export { COUNTRY_CODES } from "./types";

// GraphQL queries and mutations
export {
  REQUEST_AUTH,
  VERIFY_AUTH,
  REQUEST_AUTH_SMS,
  VERIFY_AUTH_SMS,
  UPDATE_CLIENT,
  GET_CLIENT,
  GET_CLIENT_BY_PHONE,
  GET_CLIENT_BY_ID,
  REQUEST_EMAIL_CHANGE,
  VERIFY_EMAIL_CHANGE,
  REQUEST_PHONE_CHANGE,
  VERIFY_PHONE_CHANGE,
} from "./queries";