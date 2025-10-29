import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  Button,
  Link,
} from '@chakra-ui/react';

interface EmailInputFormProps {
  email: string;
  error: string;
  loading: boolean;
  // Theme colors
  formLabelColor: string;
  formFieldBg: string;
  formFieldBorder: string;
  formFieldBorderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBlue: string;
  accentHover: string;
  // Handlers
  onEmailChange: (value: string) => void;
  onSendCode: () => void;
  onSwitchToPhone: () => void;
}

/**
 * Email address input form for authentication
 *
 * Features:
 * - Email input with validation
 * - Submit on Enter key
 * - Switch to phone authentication option
 */
export const EmailInputForm: React.FC<EmailInputFormProps> = ({
  email,
  error,
  loading,
  formLabelColor,
  formFieldBg,
  formFieldBorder,
  formFieldBorderFocus,
  textPrimary,
  textSecondary,
  textMuted,
  accentBlue,
  accentHover,
  onEmailChange,
  onSendCode,
  onSwitchToPhone,
}) => {
  return (
    <Box>
      <FormControl isInvalid={!!error}>
        <FormLabel color={formLabelColor}>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSendCode()}
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
        onClick={onSendCode}
        isLoading={loading}
        _hover={{ bg: accentHover }}
      >
        Send Verification Code
      </Button>

      <Text textAlign="center" mt={4} fontSize="sm" color={textSecondary}>
        Have an Australian mobile?{' '}
        <Link color={accentBlue} onClick={onSwitchToPhone}>
          Use phone instead
        </Link>
      </Text>
    </Box>
  );
};
