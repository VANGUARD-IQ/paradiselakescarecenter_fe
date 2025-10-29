import React from 'react';
import {
  Box,
  FormControl,
  FormErrorMessage,
  HStack,
  PinInput,
  PinInputField,
  Text,
  Button,
  Link,
} from '@chakra-ui/react';
import { type AuthMethod } from '../hooks';

interface CodeVerificationFormProps {
  authMethod: AuthMethod;
  phoneNumber: string;
  email: string;
  code: string;
  error: string;
  loading: boolean;
  // Theme colors
  formFieldBg: string;
  formFieldBorder: string;
  formFieldBorderFocus: string;
  textPrimary: string;
  textMuted: string;
  accentBlue: string;
  accentHover: string;
  // Handlers
  onCodeChange: (code: string) => void;
  onVerifyCode: (code?: string) => void;
  onResendCode: () => void;
  onChangeIdentifier: () => void;
}

/**
 * Code verification form with 4-digit PIN input
 *
 * Features:
 * - 4-digit PIN input (2 + 2 format)
 * - Auto-submit on completion
 * - Resend code option
 * - Change phone/email option
 */
export const CodeVerificationForm: React.FC<CodeVerificationFormProps> = ({
  authMethod,
  phoneNumber,
  email,
  code,
  error,
  loading,
  formFieldBg,
  formFieldBorder,
  formFieldBorderFocus,
  textPrimary,
  textMuted,
  accentBlue,
  accentHover,
  onCodeChange,
  onVerifyCode,
  onResendCode,
  onChangeIdentifier,
}) => {
  return (
    <Box>
      <Text mb={4} color={textPrimary}>
        Enter the two 2-digit numbers sent to{' '}
        <strong>{authMethod === 'phone' ? phoneNumber : email}</strong>
      </Text>

      <FormControl isInvalid={!!error}>
        <HStack justify="center" spacing={2}>
          <PinInput
            value={code}
            onChange={onCodeChange}
            onComplete={onVerifyCode}
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
        onClick={() => onVerifyCode()}
        isLoading={loading}
        isDisabled={code.length !== 4}
        _hover={{ bg: accentHover }}
      >
        Verify & Sign In
      </Button>

      <HStack justify="center" mt={4} spacing={4}>
        <Link fontSize="sm" color={accentBlue} onClick={onResendCode}>
          Resend code
        </Link>
        <Text fontSize="sm" color={textMuted}>•</Text>
        <Link fontSize="sm" color={accentBlue} onClick={onChangeIdentifier}>
          Change {authMethod === 'phone' ? 'number' : 'email'}
        </Link>
      </HStack>
    </Box>
  );
};
