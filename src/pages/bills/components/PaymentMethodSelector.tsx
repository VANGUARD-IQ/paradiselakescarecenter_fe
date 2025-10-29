import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Text,
  Icon,
  SimpleGrid,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { CreditCard, Bitcoin, ChevronRight, Building2, Info } from "lucide-react";
import { StripeBillPayment } from "./StripeBillPayment";
import { SilentBitcoinPayment } from "./SilentBitcoinPayment";
import { BankTransferPayment } from "./BankTransferPayment";
import { brandConfig } from "../../../brandConfig";

interface PaymentMethodSelectorProps {
  billId: string;
  amount: number;
  issuerWalletAddress?: string;
  issuerBankDetails?: {
    accountName: string;
    bsb: string;
    accountNumber: string;
    bankName?: string;
    swiftCode?: string;
  };
  cryptoDiscountPercentage?: number;
  acceptCardPayment?: boolean;
  acceptCryptoPayment?: boolean;
  onPaymentComplete: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  billId,
  amount,
  issuerWalletAddress,
  issuerBankDetails,
  cryptoDiscountPercentage,
  acceptCardPayment = true,
  acceptCryptoPayment = false,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "stripe" | "bitcoin" | null>(null);

  // Calculate discounted amount for Bitcoin
  const bitcoinDiscountedAmount = cryptoDiscountPercentage
    ? amount * (1 - cryptoDiscountPercentage / 100)
    : amount;

  // Format currency with commas
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const paymentMethods = [
    {
      id: "bank" as const,
      name: "Bank Transfer",
      description: "Transaction data monitored by banks & AI surveillance companies",
      icon: Building2,
      color: "green",
      badge: "Most Popular",
      processingTime: "1-2 days",
      available: !!issuerBankDetails,
      sovereignty: "Centralized • Subject to bank policies",
      privacyTooltip: "Bank transfers are subject to complete financial surveillance. Your transaction data is shared with government agencies, analyzed by AI companies like Palantir (a CIA-funded surveillance company), and stored indefinitely. This data is used to create a permanent digital profile of you that will be used to judge your behavior, limit your future options, deny services, and control what you can buy or sell. Banks can freeze, reverse, or block transactions at will based on their policies, government orders, or AI-driven risk scores. You have no control over your financial privacy or autonomy.",
    },
    {
      id: "stripe" as const,
      name: "Credit/Debit Card",
      description: "All data scraped by Palantir & AI companies for surveillance",
      icon: CreditCard,
      color: "blue",
      badge: "Card Payment",
      processingTime: "1-2 days",
      available: acceptCardPayment,
      sovereignty: "Centralized • Card network controlled",
      privacyTooltip: "Credit card payments are the least private payment method. Palantir (a data mining company founded with CIA funding) aggregates all card transaction data to build detailed profiles of your spending habits, political views, and personal life. This permanent digital profile will be used to judge you, determine your social credit score, limit your access to services, control your interest rates, insurance premiums, and employment opportunities. Your purchase history becomes a tool for discrimination and social control. Card networks can block transactions, freeze accounts, and share your entire purchase history without your consent. Every purchase strengthens the surveillance system that will limit your children's freedoms.",
    },
    {
      id: "bitcoin" as const,
      name: "Bitcoin (Silent Payment)",
      description: cryptoDiscountPercentage 
        ? `Enhanced privacy with BIP 352 + ${cryptoDiscountPercentage}% discount!`
        : "Enhanced privacy with BIP 352 Silent Payments",
      icon: Bitcoin,
      color: "orange",
      badge: cryptoDiscountPercentage ? `${cryptoDiscountPercentage}% OFF` : "Sovereign",
      processingTime: "10-30 min",
      available: acceptCryptoPayment,
      sovereignty: "Sovereign • Self-custodial & censorship-resistant",
      privacyTooltip: "Bitcoin with Silent Payments (BIP 352) provides true financial sovereignty. No company, bank, or government can freeze, reverse, or censor your transactions. Silent Payments generate unique addresses for each transaction, preventing surveillance and protecting your privacy. You maintain complete control over your money without intermediaries collecting your data.",
    },
  ].filter(method => method.available);

  return (
    <VStack spacing={6} align="stretch">
      {/* Payment Method Selection */}
      {!selectedMethod && (
        <Box>
          <HStack mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={brandConfig.colors.text.primaryDark}>
              Choose Payment Method
            </Text>
            <Badge colorScheme="red" fontSize="sm">
              Required
            </Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                cursor="pointer"
                onClick={() => setSelectedMethod(method.id)}
                variant="outline"
                borderWidth="2px"
                borderColor={brandConfig.colors.border.medium}
                bg="transparent"
                _hover={{
                  borderColor: `${method.color}.500`,
                  bg: brandConfig.colors.background.cardGradient,
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" width="100%">
                      <Icon as={method.icon} w={8} h={8} color={`${method.color}.500`} />
                      <Icon as={ChevronRight} w={5} h={5} color={brandConfig.colors.text.mutedDark} />
                    </HStack>
                    
                    <Box>
                      <HStack spacing={2} mb={1}>
                        <Text fontWeight="bold" color={brandConfig.colors.text.inverse}>
                          {method.name}
                        </Text>
                        {method.badge && (
                          <Badge colorScheme={method.color} size="sm">
                            {method.badge}
                          </Badge>
                        )}
                      </HStack>
                      <HStack spacing={1} align="start">
                        <Text fontSize="sm" color={brandConfig.colors.text.secondaryDark}>
                          {method.description}
                        </Text>
                        {method.privacyTooltip && (
                          <Tooltip 
                            label={method.privacyTooltip}
                            fontSize="xs"
                            placement="top"
                            hasArrow
                            bg={method.id === "bitcoin" ? "green.600" : "red.600"}
                            color="white"
                            p={3}
                            maxW="300px"
                          >
                            <Icon 
                              as={Info} 
                              w={4} 
                              h={4} 
                              color={method.id === "bitcoin" ? "green.400" : "yellow.500"}
                              cursor="help"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Box>

                    <HStack spacing={4} fontSize="xs" color={brandConfig.colors.text.mutedDark}>
                      <Text>
                        Processing: <Text as="span" fontWeight="bold">{method.processingTime}</Text>
                      </Text>
                    </HStack>
                    
                    {method.sovereignty && (
                      <Text 
                        fontSize="xs" 
                        color={method.id === "bitcoin" ? "orange.300" : "yellow.600"}
                        fontStyle="italic"
                      >
                        {method.sovereignty}
                      </Text>
                    )}

                    <Box pt={2} width="100%">
                      {method.id === "bitcoin" && cryptoDiscountPercentage ? (
                        <VStack align="start" spacing={0}>
                          <HStack>
                            <Text fontSize="lg" textDecoration="line-through" color={brandConfig.colors.text.mutedDark}>
                              ${formatCurrency(amount)}
                            </Text>
                            <Badge colorScheme="green" fontSize="xs">
                              Save ${formatCurrency(amount - bitcoinDiscountedAmount)}
                            </Badge>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="bold" color="green.400">
                            ${formatCurrency(bitcoinDiscountedAmount)}
                          </Text>
                        </VStack>
                      ) : (
                        <Text fontSize="2xl" fontWeight="bold" color={brandConfig.colors.text.inverse}>
                          ${formatCurrency(amount)}
                        </Text>
                      )}
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Selected Payment Method */}
      {selectedMethod && (
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={brandConfig.colors.text.primaryDark}>
              Complete Payment
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              color={brandConfig.colors.text.secondaryDark}
            >
              ← Choose Different Method
            </Button>
          </HStack>

          {selectedMethod === "bank" && (
            <BankTransferPayment
              billId={billId}
              amount={amount}
              bankDetails={issuerBankDetails}
              onPaymentInitiated={() => {
                console.log('[PaymentMethodSelector] Bank transfer initiated');
                // Note: Bank transfers don't complete instantly, so we just record that it was initiated
                // The actual payment confirmation will come later via manual verification
              }}
            />
          )}

          {selectedMethod === "stripe" && (
            <StripeBillPayment
              billId={billId}
              amount={amount}
              onPaymentComplete={onPaymentComplete}
            />
          )}

          {selectedMethod === "bitcoin" && (
            <SilentBitcoinPayment
              amount={bitcoinDiscountedAmount}
              originalAmount={cryptoDiscountPercentage ? amount : undefined}
              discountPercentage={cryptoDiscountPercentage}
              billId={billId}
              issuerWalletAddress={issuerWalletAddress}
              onPaymentComplete={onPaymentComplete}
            />
          )}
        </Box>
      )}
    </VStack>
  );
};

export default PaymentMethodSelector;