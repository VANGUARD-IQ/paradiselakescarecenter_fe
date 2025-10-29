import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  HStack,
  PinInput,
  PinInputField,
  Alert,
  AlertIcon,
  Link,
  Select,
  InputGroup,
  InputLeftAddon,
  useColorMode,
} from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
import { COUNTRY_CODES, type CountryCode } from '../types';
import { getColor, getComponent } from '../../../brandConfig';
import { CaptureUserDetailsModal } from './CaptureUserDetailsModal';

const SEND_SMS_CODE = gql`
  mutation SendSmsCode($phoneNumber: String!) {
    sendSmsCode(phoneNumber: $phoneNumber)
  }
`;

const VERIFY_SMS_CODE = gql`
  mutation VerifySmsCode($phoneNumber: String!, $code: String!) {
    verifySmsCode(phoneNumber: $phoneNumber, code: $code) {
      token
      client {
        id
        fName
        lName
        email
        phoneNumber
      }
    }
  }
`;

const SEND_EMAIL_CODE = gql`
  mutation SendEmailCode($email: String!) {
    sendEmailCode(email: $email)
  }
`;

const VERIFY_EMAIL_CODE = gql`
  mutation VerifyEmailCode($email: String!, $code: String!) {
    verifyEmailCode(email: $email, code: $code) {
      token
      client {
        id
        fName
        lName
        email
        phoneNumber
      }
    }
  }
`;

type AuthMethod = 'phone' | 'email';
type AuthStep = 'input' | 'verify';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
  // Legacy prop names for backward compatibility
  onLoginSuccess?: () => void;
}

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

  const toast = useToast();

  const [sendSmsCode, { loading: sendingSms }] = useMutation(SEND_SMS_CODE);
  const [verifySmsCode, { loading: verifyingSms }] = useMutation(VERIFY_SMS_CODE);
  const [sendEmailCode, { loading: sendingEmail }] = useMutation(SEND_EMAIL_CODE);
  const [verifyEmailCode, { loading: verifyingEmail }] = useMutation(VERIFY_EMAIL_CODE);

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

  const handleClose = () => {
    resetState();
    onClose();
  };

  const formatPhoneNumber = (value: string, countryCode: string): string => {
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

  const handlePhoneInput = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry.code);
    setLocalPhoneNumber(formatted);
    // Store the full international number for backend
    let digitsOnly = formatted.replace(/\D/g, '');

    // Remove leading 0 for Australian numbers (common format)
    if (selectedCountry.code === '+61' && digitsOnly.startsWith('0')) {
      digitsOnly = digitsOnly.substring(1);
    }

    setPhoneNumber(selectedCountry.code + digitsOnly);
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

  const isValidPhoneNumber = (): boolean => {
    let digitsOnly = localPhoneNumber.replace(/\D/g, '');

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

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    setError('');

    if (authMethod === 'phone') {
      if (!isValidPhoneNumber()) {
        let digitsOnly = localPhoneNumber.replace(/\D/g, '');
        if (digitsOnly.startsWith('0')) {
          digitsOnly = digitsOnly.substring(1);
        }
        if (selectedCountry.code === '+61') {
          if (digitsOnly.length < 9) {
            setError(`Australian mobile numbers need 9 digits (you entered ${digitsOnly.length})`);
          } else {
            setError(`Australian mobile numbers must be exactly 9 digits (you entered ${digitsOnly.length})`);
          }
        } else {
          setError(`Please enter a valid ${selectedCountry.country} mobile number`);
        }
        return;
      }

      try {
        await sendSmsCode({
          variables: { phoneNumber },
        });
        setAuthStep('verify');
        toast({
          title: 'Code sent',
          description: 'Check your phone for the verification code',
          status: 'success',
          duration: 3000,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to send SMS code');
      }
    } else {
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      try {
        await sendEmailCode({
          variables: { email },
        });
        setAuthStep('verify');
        toast({
          title: 'Code sent',
          description: 'Check your email for the verification code',
          status: 'success',
          duration: 3000,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to send email code');
      }
    }
  };

  const handleVerifyCode = async (codeValue?: string) => {
    setError('');

    // Use the provided code value (from onComplete) or fall back to state
    const verificationCode = codeValue || code;

    if (verificationCode.length !== 4) {
      setError('Please enter both 2-digit numbers');
      return;
    }

    try {
      if (authMethod === 'phone') {
        console.log('📱 Verifying SMS code:', verificationCode);
        const result = await verifySmsCode({
          variables: {
            phoneNumber,
            code: verificationCode,
          },
        });
        console.log('📱 SMS verification result:', result);
        const token = result.data?.verifySmsCode?.token;
        const client = result.data?.verifySmsCode?.client;
        console.log('🔑 Extracted token:', token);
        console.log('👤 Client data:', client);

        if (token && client) {
          // Check if we need to capture missing details
          const missingName = !client.fName || !client.lName;
          const missingEmail = !client.email;

          console.log('🔍 Missing details check:', { missingName, missingEmail });

          if (missingName || missingEmail) {
            // Show capture details modal
            console.log('📝 Opening CaptureUserDetailsModal for missing details');
            setVerifiedUserId(client.id);
            setVerifiedUserData(client);
            setPendingToken(token);
            setShowCaptureDetails(true);
          } else {
            // All details present, proceed with login
            console.log('✅ All details present, proceeding with login');
            handleSuccess(token);
            handleClose();
          }
        } else {
          console.error('❌ No token or client in response:', result.data);
          throw new Error('No token received');
        }
      } else {
        console.log('📧 Verifying email code:', verificationCode);
        const result = await verifyEmailCode({
          variables: {
            email,
            code: verificationCode,
          },
        });
        console.log('📧 Email verification result:', result);
        const token = result.data?.verifyEmailCode?.token;
        const client = result.data?.verifyEmailCode?.client;
        console.log('🔑 Extracted token:', token);
        console.log('👤 Client data:', client);

        if (token && client) {
          // Check if we need to capture missing details
          const missingName = !client.fName || !client.lName;
          const missingPhone = !client.phoneNumber;

          console.log('🔍 Missing details check:', { missingName, missingPhone });

          if (missingName || missingPhone) {
            // Show capture details modal
            console.log('📝 Opening CaptureUserDetailsModal for missing details');
            setVerifiedUserId(client.id);
            setVerifiedUserData(client);
            setPendingToken(token);
            setShowCaptureDetails(true);
          } else {
            // All details present, proceed with login
            console.log('✅ All details present, proceeding with login');
            handleSuccess(token);
            handleClose();
          }
        } else {
          console.error('❌ No token or client in response:', result.data);
          throw new Error('No token received');
        }
      }
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Invalid verification code');
      setCode('');
    }
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

  const handleResendCode = async () => {
    setError('');
    setCode('');

    try {
      if (authMethod === 'phone') {
        await sendSmsCode({
          variables: { phoneNumber },
        });
      } else {
        await sendEmailCode({
          variables: { email },
        });
      }
      toast({
        title: 'Code resent',
        description: `Check your ${authMethod === 'phone' ? 'phone' : 'email'} for the new code`,
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const loading = sendingSms || verifyingSms || sendingEmail || verifyingEmail;

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
                  <Box>
                    <Alert status="info" mb={4} borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        We recommend using your mobile number for faster authentication
                      </Text>
                    </Alert>

                    <FormControl isInvalid={!!error}>
                      <FormLabel color={formLabelColor}>Country</FormLabel>
                      <Select
                        value={selectedCountry.code}
                        onChange={handleCountryChange}
                        mb={3}
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _focus={{ borderColor: formFieldBorderFocus }}
                        _hover={{ borderColor: formFieldBorderFocus }}
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option key={country.code + country.country} value={country.code}>
                            {country.flag} {country.country} ({country.code})
                          </option>
                        ))}
                      </Select>

                      <FormLabel color={formLabelColor}>Mobile Number</FormLabel>
                      <InputGroup>
                        <InputLeftAddon bg={formFieldBg} color={textPrimary} borderColor={formFieldBorder}>
                          {selectedCountry.code}
                        </InputLeftAddon>
                        <Input
                          placeholder={selectedCountry.placeholder}
                          value={localPhoneNumber}
                          onChange={(e) => handlePhoneInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                          autoFocus
                          bg={formFieldBg}
                          color={textPrimary}
                          borderColor={formFieldBorder}
                          _placeholder={{ color: textMuted }}
                          _focus={{ borderColor: formFieldBorderFocus }}
                          _hover={{ borderColor: formFieldBorderFocus }}
                        />
                      </InputGroup>
                      {localPhoneNumber && (
                        <Text fontSize="xs" color={textMuted} mt={1}>
                          Will be sent as: {phoneNumber}
                        </Text>
                      )}
                      <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>

                    <Button
                      bg={accentBlue}
                      color="white"
                      width="100%"
                      mt={4}
                      onClick={handleSendCode}
                      isLoading={loading}
                      _hover={{ bg: accentHover }}
                    >
                      Send Verification Code
                    </Button>

                    <Text textAlign="center" mt={4} fontSize="sm" color={textSecondary}>
                      Don't have an Australian mobile?{' '}
                      <Link color={accentBlue} onClick={switchToEmail}>
                        Use email instead
                      </Link>
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <FormControl isInvalid={!!error}>
                      <FormLabel color={formLabelColor}>Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                        autoFocus
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _placeholder={{ color: textMuted }}
                        _focus={{ borderColor: formFieldBorderFocus }}
                        _hover={{ borderColor: formFieldBorderFocus }}
                      />
                      <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>

                    <Button
                      bg={accentBlue}
                      color="white"
                      width="100%"
                      mt={4}
                      onClick={handleSendCode}
                      isLoading={loading}
                      _hover={{ bg: accentHover }}
                    >
                      Send Verification Code
                    </Button>

                    <Text textAlign="center" mt={4} fontSize="sm" color={textSecondary}>
                      Have an Australian mobile?{' '}
                      <Link color={accentBlue} onClick={switchToPhone}>
                        Use phone instead
                      </Link>
                    </Text>
                  </Box>
                )}
              </>
            )}

            {authStep === 'verify' && (
              <Box>
                <Text mb={4} color={textPrimary}>
                  Enter the two 2-digit numbers sent to{' '}
                  <strong>{authMethod === 'phone' ? phoneNumber : email}</strong>
                </Text>

                <FormControl isInvalid={!!error}>
                  <HStack justify="center" spacing={2}>
                    <PinInput
                      value={code}
                      onChange={setCode}
                      onComplete={handleVerifyCode}
                      autoFocus
                      size="lg"
                    >
                      <PinInputField
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _focus={{ borderColor: formFieldBorderFocus }}
                      />
                      <PinInputField
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _focus={{ borderColor: formFieldBorderFocus }}
                        mr={4}
                      />
                      <PinInputField
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _focus={{ borderColor: formFieldBorderFocus }}
                        ml={4}
                      />
                      <PinInputField
                        bg={formFieldBg}
                        color={textPrimary}
                        borderColor={formFieldBorder}
                        _focus={{ borderColor: formFieldBorderFocus }}
                      />
                    </PinInput>
                  </HStack>
                  <FormErrorMessage justifyContent="center">{error}</FormErrorMessage>
                </FormControl>

                <Button
                  bg={accentBlue}
                  color="white"
                  width="100%"
                  mt={4}
                  onClick={() => handleVerifyCode()}
                  isLoading={loading}
                  isDisabled={code.length !== 4}
                  _hover={{ bg: accentHover }}
                >
                  Verify & Sign In
                </Button>

                <HStack justify="center" mt={4} spacing={4}>
                  <Link fontSize="sm" color={accentBlue} onClick={handleResendCode}>
                    Resend code
                  </Link>
                  <Text fontSize="sm" color={textMuted}>•</Text>
                  <Link fontSize="sm" color={accentBlue} onClick={() => setAuthStep('input')}>
                    Change {authMethod === 'phone' ? 'number' : 'email'}
                  </Link>
                </HStack>
              </Box>
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
