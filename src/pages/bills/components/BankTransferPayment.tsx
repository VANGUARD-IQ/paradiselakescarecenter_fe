import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  SimpleGrid,
  Divider,
  useClipboard,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { brandConfig } from "../../../brandConfig";

interface BankTransferPaymentProps {
  billId: string;
  amount: number;
  bankDetails?: {
    accountName: string;
    bsb: string;
    accountNumber: string;
    bankName?: string;
    swiftCode?: string;
  };
  onPaymentInitiated?: () => void;
}

export const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({
  billId,
  amount,
  bankDetails,
  onPaymentInitiated,
}) => {
  const [referenceCode] = useState(`INV-${billId.substring(0, 4).toUpperCase()}`);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const toast = useToast();

  // Clipboard hooks for each field
  const { hasCopied: hasAccountNameCopied, onCopy: onAccountNameCopy } = useClipboard(
    bankDetails?.accountName || ""
  );
  const { hasCopied: hasBsbCopied, onCopy: onBsbCopy } = useClipboard(
    bankDetails?.bsb || ""
  );
  const { hasCopied: hasAccountNumberCopied, onCopy: onAccountNumberCopy } = useClipboard(
    bankDetails?.accountNumber || ""
  );
  const { hasCopied: hasReferenceCopied, onCopy: onReferenceCopy } = useClipboard(
    referenceCode
  );
  const { hasCopied: hasAmountCopied, onCopy: onAmountCopy } = useClipboard(
    amount.toFixed(2)
  );

  const handlePaymentInitiated = () => {
    setPaymentInitiated(true);
    if (onPaymentInitiated) {
      onPaymentInitiated();
    }
    toast({
      title: "Payment Instructions Sent",
      description: "Please complete the bank transfer using the details provided. Your payment will be confirmed once received.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  if (!bankDetails) {
    return (
      <Card
        bg={brandConfig.colors.background.cardGradient}
        borderColor={brandConfig.colors.border.darkCard}
        borderWidth="1px"
      >
        <CardBody>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Bank Transfer Not Available</Text>
              <Text fontSize="sm">
                Bank account details have not been configured for this merchant.
                Please choose a different payment method.
              </Text>
            </Box>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      bg={brandConfig.colors.background.cardGradient}
      borderColor={brandConfig.colors.border.darkCard}
      borderWidth="1px"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      backdropFilter="blur(10px)"
    >
      <CardHeader>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color={brandConfig.colors.text.inverse}>
            🏦 Bank Transfer Payment
          </Text>
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
            Manual Transfer
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Important Notice */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Important: Include Reference Number</Text>
              <Text fontSize="sm">
                Please include the reference number when making your transfer to ensure your payment is correctly matched to this bill.
              </Text>
            </Box>
          </Alert>

          {/* Amount Display */}
          <Box
            p={4}
            bg={brandConfig.colors.background.main}
            borderRadius="md"
            border="1px"
            borderColor={brandConfig.colors.border.darkCard}
          >
            <VStack spacing={2}>
              <Text fontSize="sm" color={brandConfig.colors.text.mutedDark}>
                Amount to Transfer
              </Text>
              <HStack>
                <Text fontSize="3xl" fontWeight="bold" color={brandConfig.colors.text.inverse}>
                  ${amount.toFixed(2)}
                </Text>
                <Tooltip label={hasAmountCopied ? "Copied!" : "Copy amount"}>
                  <IconButton
                    aria-label="Copy amount"
                    icon={hasAmountCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    onClick={onAmountCopy}
                    colorScheme={hasAmountCopied ? "green" : "gray"}
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
              <Text fontSize="xs" color={brandConfig.colors.text.mutedDark}>
                AUD - Australian Dollars
              </Text>
            </VStack>
          </Box>

          <Divider />

          {/* Bank Account Details */}
          <Box>
            <Text fontWeight="bold" fontSize="md" mb={3} color={brandConfig.colors.text.inverse}>
              Bank Account Details
            </Text>
            
            <VStack spacing={3} align="stretch">
              {/* Account Name */}
              <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md">
                <HStack justify="space-between">
                  <Box flex={1}>
                    <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={1}>
                      Account Name
                    </Text>
                    <Text fontWeight="semibold" color={brandConfig.colors.text.inverse}>
                      {bankDetails.accountName}
                    </Text>
                  </Box>
                  <Tooltip label={hasAccountNameCopied ? "Copied!" : "Copy"}>
                    <IconButton
                      aria-label="Copy account name"
                      icon={hasAccountNameCopied ? <CheckIcon /> : <CopyIcon />}
                      size="sm"
                      onClick={onAccountNameCopy}
                      colorScheme={hasAccountNameCopied ? "green" : "gray"}
                      variant="ghost"
                    />
                  </Tooltip>
                </HStack>
              </Box>

              {/* BSB and Account Number */}
              <SimpleGrid columns={2} spacing={3}>
                <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md">
                  <HStack justify="space-between">
                    <Box flex={1}>
                      <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={1}>
                        BSB
                      </Text>
                      <Text fontWeight="semibold" color={brandConfig.colors.text.inverse}>
                        {bankDetails.bsb}
                      </Text>
                    </Box>
                    <Tooltip label={hasBsbCopied ? "Copied!" : "Copy"}>
                      <IconButton
                        aria-label="Copy BSB"
                        icon={hasBsbCopied ? <CheckIcon /> : <CopyIcon />}
                        size="sm"
                        onClick={onBsbCopy}
                        colorScheme={hasBsbCopied ? "green" : "gray"}
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Box>

                <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md">
                  <HStack justify="space-between">
                    <Box flex={1}>
                      <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={1}>
                        Account Number
                      </Text>
                      <Text fontWeight="semibold" color={brandConfig.colors.text.inverse}>
                        {bankDetails.accountNumber}
                      </Text>
                    </Box>
                    <Tooltip label={hasAccountNumberCopied ? "Copied!" : "Copy"}>
                      <IconButton
                        aria-label="Copy account number"
                        icon={hasAccountNumberCopied ? <CheckIcon /> : <CopyIcon />}
                        size="sm"
                        onClick={onAccountNumberCopy}
                        colorScheme={hasAccountNumberCopied ? "green" : "gray"}
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Box>
              </SimpleGrid>

              {/* Bank Name (if available) */}
              {bankDetails.bankName && (
                <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md">
                  <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={1}>
                    Bank Name
                  </Text>
                  <Text fontWeight="semibold" color={brandConfig.colors.text.inverse}>
                    {bankDetails.bankName}
                  </Text>
                </Box>
              )}

              {/* SWIFT Code (if available for international) */}
              {bankDetails.swiftCode && (
                <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md">
                  <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={1}>
                    SWIFT Code (International Transfers)
                  </Text>
                  <Text fontWeight="semibold" color={brandConfig.colors.text.inverse}>
                    {bankDetails.swiftCode}
                  </Text>
                </Box>
              )}

              {/* Reference Number - IMPORTANT */}
              <Box p={3} bg="orange.900" borderRadius="md" borderWidth="2px" borderColor="orange.500">
                <HStack justify="space-between">
                  <Box flex={1}>
                    <Text fontSize="xs" color="orange.200" mb={1}>
                      ⚠️ IMPORTANT - Payment Reference
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {referenceCode}
                    </Text>
                  </Box>
                  <Tooltip label={hasReferenceCopied ? "Copied!" : "Copy reference"}>
                    <IconButton
                      aria-label="Copy reference"
                      icon={hasReferenceCopied ? <CheckIcon /> : <CopyIcon />}
                      size="sm"
                      onClick={onReferenceCopy}
                      colorScheme={hasReferenceCopied ? "green" : "orange"}
                      variant="solid"
                    />
                  </Tooltip>
                </HStack>
              </Box>
            </VStack>
          </Box>

          <Divider />

          {/* Payment Instructions */}
          <Box>
            <Text fontWeight="bold" fontSize="sm" mb={2} color={brandConfig.colors.text.inverse}>
              How to Complete Your Payment:
            </Text>
            <VStack align="start" spacing={2} fontSize="sm" color={brandConfig.colors.text.secondaryDark}>
              <Text>1. Log in to your online banking or visit your bank branch</Text>
              <Text>2. Create a new payment or transfer</Text>
              <Text>3. Enter the bank account details exactly as shown above</Text>
              <Text>4. Enter ${amount.toFixed(2)} as the amount</Text>
              <Text>5. <Text as="span" fontWeight="bold" color="orange.400">Include the reference: {referenceCode}</Text></Text>
              <Text>6. Complete the transfer</Text>
              <Text>7. Click "I've Made the Transfer" below</Text>
            </VStack>
          </Box>

          {/* Action Button */}
          {!paymentInitiated ? (
            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handlePaymentInitiated}
            >
              I've Made the Transfer
            </Button>
          ) : (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Transfer Instructions Recorded</Text>
                <Text fontSize="sm">
                  We'll confirm your payment once it's received (usually 1-2 business days).
                  You'll receive an email confirmation when the payment is processed.
                </Text>
              </Box>
            </Alert>
          )}

          {/* Processing Time Notice */}
          <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md" fontSize="xs">
            <HStack spacing={2}>
              <Text fontWeight="bold" color={brandConfig.colors.text.secondaryDark}>
                Processing Time:
              </Text>
              <Text color={brandConfig.colors.text.mutedDark}>
                1-2 business days for domestic transfers, 3-5 days for international
              </Text>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BankTransferPayment;