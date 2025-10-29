import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Text,
  Button,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react';
import { COUNTRY_CODES, type CountryCode } from '../types';

interface PhoneInputFormProps {
  selectedCountry: CountryCode;
  localPhoneNumber: string;
  phoneNumber: string;
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
  onCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneInput: (value: string) => void;
  onSendCode: () => void;
  onSwitchToEmail: () => void;
}

/**
 * Phone number input form with country selection and formatting
 *
 * Features:
 * - Country code selector
 * - Auto-formatted phone input
 * - Real-time international format preview
 * - Switch to email authentication option
 */
export const PhoneInputForm: React.FC<PhoneInputFormProps> = ({
  selectedCountry,
  localPhoneNumber,
  phoneNumber,
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
  onCountryChange,
  onPhoneInput,
  onSendCode,
  onSwitchToEmail,
}) => {
  return (
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
          onChange={onCountryChange}
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
            onChange={(e) => onPhoneInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendCode()}
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
        onClick={onSendCode}
        isLoading={loading}
        _hover={{ bg: accentHover }}
      >
        Send Verification Code
      </Button>

      <Text textAlign="center" mt={4} fontSize="sm" color={textSecondary}>
        Don't have an Australian mobile?{' '}
        <Link color={accentBlue} onClick={onSwitchToEmail}>
          Use email instead
        </Link>
      </Text>
    </Box>
  );
};
