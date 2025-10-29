import { useMutation } from '@apollo/client';
import { useToast } from '@chakra-ui/react';
import { gql } from '@apollo/client';
import { type AuthMethod } from './useAuthState';
import { isValidPhoneNumber, isValidEmail, getPhoneValidationError } from '../utils';
import { type CountryCode } from '../types';

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

interface UseAuthVerificationParams {
  authMethod: AuthMethod;
  phoneNumber: string;
  localPhoneNumber: string;
  email: string;
  code: string;
  selectedCountry: CountryCode;
  setAuthStep: (step: 'input' | 'verify') => void;
  setError: (error: string) => void;
  setCode: (code: string) => void;
  setVerifiedUserId: (id: string | null) => void;
  setVerifiedUserData: (data: any) => void;
  setPendingToken: (token: string | null) => void;
  setShowCaptureDetails: (show: boolean) => void;
  onSuccess: (token: string) => void;
  onClose: () => void;
}

/**
 * Custom hook to manage authentication verification flow
 *
 * Features:
 * - Send SMS/email verification codes
 * - Verify SMS/email codes
 * - Handle user details capture for incomplete profiles
 * - Manage loading states and errors
 *
 * @param params - Authentication verification parameters
 * @returns Verification handlers and loading states
 */
export const useAuthVerification = (params: UseAuthVerificationParams) => {
  const {
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
    onSuccess,
    onClose,
  } = params;

  const toast = useToast();

  const [sendSmsCode, { loading: sendingSms }] = useMutation(SEND_SMS_CODE);
  const [verifySmsCode, { loading: verifyingSms }] = useMutation(VERIFY_SMS_CODE);
  const [sendEmailCode, { loading: sendingEmail }] = useMutation(SEND_EMAIL_CODE);
  const [verifyEmailCode, { loading: verifyingEmail }] = useMutation(VERIFY_EMAIL_CODE);

  const handleSendCode = async () => {
    setError('');

    if (authMethod === 'phone') {
      if (!isValidPhoneNumber(localPhoneNumber, selectedCountry)) {
        const errorMsg = getPhoneValidationError(localPhoneNumber, selectedCountry);
        setError(errorMsg);
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
            onSuccess(token);
            onClose();
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
            onSuccess(token);
            onClose();
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

  return {
    handleSendCode,
    handleVerifyCode,
    handleResendCode,
    loading,
  };
};
