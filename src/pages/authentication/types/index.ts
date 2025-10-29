// Authentication module types
// NOTE: GraphQL input types (AuthInput, VerifyInput, etc.) are auto-generated
// by 'yarn generate' and imported from '@/generated/graphql'
// This file only contains frontend-specific types not in the backend schema

// Country code configuration for SMS login
export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  placeholder: string;
}

// Modal props interfaces
export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export interface LoginWithSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export interface CaptureUserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUpdateSuccess?: () => void;
  currentUserData?: {
    fName?: string;
    lName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface SecureMembershipButtonProps {
  size?: string;
}

// User details form data (frontend form state, not GraphQL input)
export interface UserDetailsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

// JWT payload interface - Updated to follow best practices
export interface JWTDecoded {
  clientId?: string;    // Best practice: include user ID in JWT for efficient lookup
  email?: string;       // Optional: for backward compatibility
  phoneNumber?: string; // Optional: for backward compatibility
  tenantId?: string;    // Multi-tenant context
  exp: number;          // Expiration timestamp
}

// Common country codes for international phone numbers
export const COUNTRY_CODES: CountryCode[] = [
  { code: "+61", country: "Australia", flag: "🇦🇺", placeholder: "412 345 678" },
  { code: "+1", country: "United States", flag: "🇺🇸", placeholder: "555 123 4567" },
  { code: "+1", country: "Canada", flag: "🇨🇦", placeholder: "555 123 4567" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", placeholder: "7700 900123" },
  { code: "+33", country: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "+49", country: "Germany", flag: "🇩🇪", placeholder: "30 12345678" },
  { code: "+81", country: "Japan", flag: "🇯🇵", placeholder: "90 1234 5678" },
  { code: "+86", country: "China", flag: "🇨🇳", placeholder: "139 0013 8000" },
  { code: "+91", country: "India", flag: "🇮🇳", placeholder: "98765 43210" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿", placeholder: "21 123 4567" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", placeholder: "8123 4567" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", placeholder: "812 3456 789" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", placeholder: "12 345 6789" },
  { code: "+66", country: "Thailand", flag: "🇹🇭", placeholder: "81 234 5678" },
  { code: "+63", country: "Philippines", flag: "🇵🇭", placeholder: "917 123 4567" },
];