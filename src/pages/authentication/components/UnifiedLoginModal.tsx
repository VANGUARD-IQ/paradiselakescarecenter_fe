import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { getColor, getComponent } from '../../../brandConfig';
import { CaptureUserDetailsModal } from './CaptureUserDetailsModal';
import { useAuthState, usePhoneInput, useAuthVerification } from '../hooks';
import { PhoneInputForm } from './PhoneInputForm';
import { EmailInputForm } from './EmailInputForm';
import { CodeVerificationForm } from './CodeVerificationForm';
import { COUNTRY_CODES } from '../types';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
  // Legacy prop names for backward compatibility
  onLoginSuccess?: () => void;
}

/**
 * Unified Login Modal Component
 *
 * Provides passwordless authentication via:
 * - SMS verification (preferred for Australian mobile numbers)
 * - Email verification (fallback option)
 *
 * Features:
 * - Country-specific phone formatting
 * - Automatic user details capture for incomplete profiles
 * - Dark mode support
 * - Accessibility compliant
 *
 * @example
 * ```tsx
 * <UnifiedLoginModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSuccess={(token) => {
 *     localStorage.setItem('auth_token', token);
 *     navigate('/dashboard');
 *   }}
 * />
 * ```
 */
export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginSuccess, // Legacy prop for backward compatibility
}) => {
  // Color mode support
  const { colorMode } = useColorMode();

  // Define theme-aware colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const textPrimary = getColor(
    colorMode === 'light' ? "text.primary" : "text.primaryDark",
    colorMode
  );
  const textSecondary = getColor(
    colorMode === 'light' ? "text.secondary" : "text.secondaryDark",
    colorMode
  );
  const textMuted = getColor(
    colorMode === 'light' ? "text.muted" : "text.mutedDark",
    colorMode
  );
  const accentBlue = getColor("primary", colorMode);
  const accentHover = getColor("primaryHover", colorMode);

  // Form component colors
  const formFieldBg = getComponent("form", "fieldBg", colorMode);
  const formFieldBorder = getComponent("form", "fieldBorder", colorMode);
  const formFieldBorderFocus = getComponent("form", "fieldBorderFocus", colorMode);
  const formLabelColor = getComponent("form", "labelColor", colorMode);

  // Authentication state management
  const {
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
    setAuthStep,
    setSelectedCountry,
    setLocalPhoneNumber,
    setPhoneNumber,
    setEmail,
    setCode,
    setError,
    setShowCaptureDetails,
    setVerifiedUserId,
    setVerifiedUserData,
    setPendingToken,
    resetState,
    switchToEmail,
    switchToPhone,
  } = useAuthState();

  // Phone input handling
  const { handlePhoneInput } = usePhoneInput(
    selectedCountry,
    setLocalPhoneNumber,
    setPhoneNumber
  );

  // Handle both new and legacy callback signatures
  const handleSuccess = (token: string) => {
    console.log('[FRONTEND-1] 🎉 handleSuccess called with token:', token);
    console.log('[FRONTEND-2] 📝 Token length:', token?.length);

    if (onSuccess) {
      console.log('[FRONTEND-3] 🔄 Calling onSuccess callback');
      onSuccess(token);
    } else if (onLoginSuccess) {
      console.log('[FRONTEND-3] 💾 Using legacy onLoginSuccess - storing in localStorage');
      localStorage.setItem('auth_token', token);

      // Verify it was stored
      const storedToken = localStorage.getItem('auth_token');
      console.log('[FRONTEND-4] ✅ Verification - token stored in localStorage as "auth_token":', !!storedToken);
      console.log('[FRONTEND-5] ✅ Stored token matches:', storedToken === token);

      console.log('[FRONTEND-6] 📞 Calling onLoginSuccess callback');
      onLoginSuccess();
    } else {
      console.error('[FRONTEND-3] ❌ No callback provided!');
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRY_CODES.find(c => c.code === e.target.value);
    if (country) {
      setSelectedCountry(country);
      // Reformat existing number for new country
      if (localPhoneNumber) {
        handlePhoneInput(localPhoneNumber);
      }
    }
  };

  // Verification handlers
  const {
    handleSendCode,
    handleVerifyCode,
    handleResendCode,
    loading,
  } = useAuthVerification({
    authMethod,
    phoneNumber,
    localPhoneNumber,
    email,
    code,
    selectedCountry,
    setAuthStep,
    setError,
    setCode,
    setVerifiedUserId,
    setVerifiedUserData,
    setPendingToken,
    setShowCaptureDetails,
    onSuccess: handleSuccess,
    onClose: handleClose,
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg} color={textPrimary}>
          <ModalHeader color={textPrimary}>
            {authStep === 'input' ? 'Sign In' : 'Verify Code'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {authStep === 'input' && (
                <>
                  {authMethod === 'phone' ? (
                    <PhoneInputForm
                      selectedCountry={selectedCountry}
                      localPhoneNumber={localPhoneNumber}
                      phoneNumber={phoneNumber}
                      error={error}
                      loading={loading}
                      formLabelColor={formLabelColor}
                      formFieldBg={formFieldBg}
                      formFieldBorder={formFieldBorder}
                      formFieldBorderFocus={formFieldBorderFocus}
                      textPrimary={textPrimary}
                      textSecondary={textSecondary}
                      textMuted={textMuted}
                      accentBlue={accentBlue}
                      accentHover={accentHover}
                      onCountryChange={handleCountryChange}
                      onPhoneInput={handlePhoneInput}
                      onSendCode={handleSendCode}
                      onSwitchToEmail={switchToEmail}
                    />
                  ) : (
                    <EmailInputForm
                      email={email}
                      error={error}
                      loading={loading}
                      formLabelColor={formLabelColor}
                      formFieldBg={formFieldBg}
                      formFieldBorder={formFieldBorder}
                      formFieldBorderFocus={formFieldBorderFocus}
                      textPrimary={textPrimary}
                      textSecondary={textSecondary}
                      textMuted={textMuted}
                      accentBlue={accentBlue}
                      accentHover={accentHover}
                      onEmailChange={setEmail}
                      onSendCode={handleSendCode}
                      onSwitchToPhone={switchToPhone}
                    />
                  )}
                </>
              )}

              {authStep === 'verify' && (
                <CodeVerificationForm
                  authMethod={authMethod}
                  phoneNumber={phoneNumber}
                  email={email}
                  code={code}
                  error={error}
                  loading={loading}
                  formFieldBg={formFieldBg}
                  formFieldBorder={formFieldBorder}
                  formFieldBorderFocus={formFieldBorderFocus}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  accentBlue={accentBlue}
                  accentHover={accentHover}
                  onCodeChange={setCode}
                  onVerifyCode={handleVerifyCode}
                  onResendCode={handleResendCode}
                  onChangeIdentifier={() => setAuthStep('input')}
                />
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Capture User Details Modal - shown when user is missing fname/lname/email/phone */}
      {showCaptureDetails && verifiedUserId && (
        <CaptureUserDetailsModal
          isOpen={showCaptureDetails}
          onClose={() => {
            setShowCaptureDetails(false);
            setVerifiedUserId(null);
            setVerifiedUserData(null);
            setPendingToken(null);
          }}
          userId={verifiedUserId}
          currentUserData={verifiedUserData}
          onUpdateSuccess={() => {
            console.log('📝 User details captured successfully');
            setShowCaptureDetails(false);
            // Now complete the login with the pending token
            if (pendingToken) {
              handleSuccess(pendingToken);
            }
            handleClose();
          }}
        />
      )}
    </>
  );
};
