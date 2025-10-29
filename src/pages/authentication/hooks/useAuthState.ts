import { useState } from 'react';
import { type CountryCode, COUNTRY_CODES } from '../types';

/**
 * Authentication state types
 */
export type AuthMethod = 'phone' | 'email';
export type AuthStep = 'input' | 'verify';

/**
 * Custom hook to manage authentication UI state
 *
 * Manages:
 * - Authentication method selection (phone vs email)
 * - Current step in auth flow (input vs verify)
 * - Country code selection for phone auth
 * - Phone number state (local and international format)
 * - Email address state
 * - Verification code state
 * - Error messages
 * - User details capture flow
 *
 * @returns Authentication state and updater functions
 */
export const useAuthState = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [authStep, setAuthStep] = useState<AuthStep>('input');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // Default to Australia
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(''); // Phone number without country code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showCaptureDetails, setShowCaptureDetails] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [verifiedUserData, setVerifiedUserData] = useState<any>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const resetState = () => {
    setAuthMethod('phone');
    setAuthStep('input');
    setSelectedCountry(COUNTRY_CODES[0]);
    setPhoneNumber('');
    setLocalPhoneNumber('');
    setEmail('');
    setCode('');
    setError('');
  };

  const switchToEmail = () => {
    setAuthMethod('email');
    setAuthStep('input');
    setError('');
  };

  const switchToPhone = () => {
    setAuthMethod('phone');
    setAuthStep('input');
    setError('');
  };

  return {
    // State
    authMethod,
    authStep,
    selectedCountry,
    phoneNumber,
    localPhoneNumber,
    email,
    code,
    error,
    showCaptureDetails,
    verifiedUserId,
    verifiedUserData,
    pendingToken,

    // Setters
    setAuthMethod,
    setAuthStep,
    setSelectedCountry,
    setPhoneNumber,
    setLocalPhoneNumber,
    setEmail,
    setCode,
    setError,
    setShowCaptureDetails,
    setVerifiedUserId,
    setVerifiedUserData,
    setPendingToken,

    // Actions
    resetState,
    switchToEmail,
    switchToPhone,
  };
};
