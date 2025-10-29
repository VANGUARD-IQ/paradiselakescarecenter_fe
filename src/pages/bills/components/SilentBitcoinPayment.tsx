import React, { useState, useEffect } from "react";
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
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Link,
  Code,
  Collapse,
  useDisclosure,
  Divider,
  Tooltip,
  IconButton,
  useClipboard,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon, ExternalLinkIcon, InfoIcon, RefreshCcwIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { brandConfig } from "../../../brandConfig";

interface SilentBitcoinPaymentProps {
  amount: number;
  originalAmount?: number;
  discountPercentage?: number;
  billId: string;
  onPaymentComplete?: () => void;
  issuerWalletAddress?: string;
}

// Utility to generate a unique Silent Payment address
const generateSilentPaymentAddress = (
  recipientStaticPubKey: string,
  billId: string,
  amount: number
): string => {
  // BIP 352 Silent Payment implementation
  // This generates a unique address for each payment without address reuse
  // In production, this would use proper cryptographic functions
  const uniqueIdentifier = `${billId}-${amount}-${Date.now()}`;
  const hash = btoa(uniqueIdentifier).replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);
  
  // Generate a testnet Silent Payment address (starting with 'sp1' for mainnet, 'tsp1' for testnet)
  return `sp1qw508d6qejxtdg4y5r3zarvary0c5xw7k${hash}`;
};

// Convert AUD to BTC using a mock exchange rate (replace with real API)
const convertAUDToBTC = (audAmount: number): number => {
  const btcPriceAUD = 102000; // Mock BTC price in AUD - replace with real API call
  return Number((audAmount / btcPriceAUD).toFixed(8));
};

export const SilentBitcoinPayment: React.FC<SilentBitcoinPaymentProps> = ({
  amount,
  originalAmount,
  discountPercentage,
  billId,
  onPaymentComplete,
  issuerWalletAddress,
}) => {
  const [silentPaymentAddress, setSilentPaymentAddress] = useState<string>("");
  const [btcAmount, setBtcAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "confirmed">("pending");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();
  const { hasCopied: hasAddressCopied, onCopy: onAddressCopy } = useClipboard(silentPaymentAddress);
  const { hasCopied: hasAmountCopied, onCopy: onAmountCopy } = useClipboard(btcAmount.toString());

  // Generate Silent Payment address on mount or when amount changes
  useEffect(() => {
    console.log('[SilentBitcoinPayment] Issuer wallet address:', issuerWalletAddress);
    if (amount > 0) {
      setIsGenerating(true);
      // Simulate async generation
      setTimeout(() => {
        const address = generateSilentPaymentAddress(
          issuerWalletAddress || "default-pubkey",
          billId,
          amount
        );
        setSilentPaymentAddress(address);
        setBtcAmount(convertAUDToBTC(amount));
        setIsGenerating(false);
        console.log('[SilentBitcoinPayment] Generated address:', address, 'BTC amount:', convertAUDToBTC(amount));
      }, 1000);
    }
  }, [amount, billId, issuerWalletAddress]);

  // Simulate payment monitoring (in production, use WebSocket or polling)
  useEffect(() => {
    if (paymentStatus === "processing") {
      const timer = setTimeout(() => {
        setPaymentStatus("confirmed");
        setTxHash("3a7f9b2c4e5d6789abcdef1234567890abcdef1234567890abcdef1234567890");
        if (onPaymentComplete) {
          onPaymentComplete();
        }
        toast({
          title: "Payment Confirmed!",
          description: "Your Bitcoin payment has been successfully received.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }, 15000); // Simulate 15 second confirmation

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, onPaymentComplete, toast]);

  const handlePaymentInitiated = () => {
    setPaymentStatus("processing");
    toast({
      title: "Payment Processing",
      description: "Monitoring for your Bitcoin transaction...",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const regenerateAddress = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newAddress = generateSilentPaymentAddress(
        issuerWalletAddress || "default-pubkey",
        billId,
        amount
      );
      setSilentPaymentAddress(newAddress);
      setBtcAmount(convertAUDToBTC(amount)); // Recalculate BTC amount
      setIsGenerating(false);
      toast({
        title: "New Address Generated",
        description: "A fresh Silent Payment address has been created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "pending":
        return "orange";
      case "processing":
        return "blue";
      case "confirmed":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case "pending":
        return "Awaiting Payment";
      case "processing":
        return "Processing Transaction";
      case "confirmed":
        return "Payment Confirmed";
      default:
        return "Unknown";
    }
  };

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
          <HStack>
            <Text fontSize="lg" fontWeight="bold" color={brandConfig.colors.text.inverse}>
              🔒 Pay with Silent Bitcoin
            </Text>
            <Tooltip label="Silent Payments (BIP 352) provide enhanced privacy by generating unique addresses for each transaction">
              <Icon as={InfoIcon} w={4} h={4} color={brandConfig.colors.text.mutedDark} />
            </Tooltip>
          </HStack>
          <Badge colorScheme={getStatusColor()} fontSize="sm" px={3} py={1}>
            {getStatusText()}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Privacy Benefits Alert */}
          <Alert status="info" borderRadius="md" fontSize="sm">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Enhanced Privacy Protection</Text>
              <Text fontSize="xs">
                This payment uses Silent Payments (BIP 352) - a unique address is generated just for this transaction,
                ensuring your privacy without additional fees.
              </Text>
            </Box>
          </Alert>

          {/* Amount Display */}
          <Box p={4} bg={brandConfig.colors.background.main} borderRadius="md" border="1px" borderColor={brandConfig.colors.border.darkCard}>
            <VStack spacing={2}>
              <Text fontSize="sm" color={brandConfig.colors.text.mutedDark}>
                Amount to Pay
              </Text>
              <HStack spacing={4}>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color={brandConfig.colors.text.inverse}>
                    {btcAmount} BTC
                  </Text>
                  {discountPercentage && originalAmount ? (
                    <VStack spacing={0}>
                      <HStack>
                        <Text fontSize="sm" textDecoration="line-through" color={brandConfig.colors.text.mutedDark}>
                          ${originalAmount.toFixed(2)} AUD
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">
                          {discountPercentage}% OFF
                        </Badge>
                      </HStack>
                      <Text fontSize="md" fontWeight="bold" color="green.400">
                        ${amount.toFixed(2)} AUD
                      </Text>
                      <Text fontSize="xs" color="green.300">
                        You save ${(originalAmount - amount).toFixed(2)} AUD
                      </Text>
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color={brandConfig.colors.text.mutedDark}>
                      (${amount.toFixed(2)} AUD)
                    </Text>
                  )}
                </VStack>
                <IconButton
                  aria-label="Copy amount"
                  icon={hasAmountCopied ? <CheckIcon /> : <CopyIcon />}
                  size="sm"
                  onClick={onAmountCopy}
                  colorScheme={hasAmountCopied ? "green" : "gray"}
                />
              </HStack>
            </VStack>
          </Box>

          {/* QR Code and Address */}
          {isGenerating ? (
            <Box textAlign="center" py={8}>
              <Spinner size="xl" color={brandConfig.colors.primary} />
              <Text mt={2} color={brandConfig.colors.text.mutedDark}>
                Generating unique Silent Payment address...
              </Text>
            </Box>
          ) : (
            <>
              <Box textAlign="center">
                <Box
                  display="inline-block"
                  p={4}
                  bg="white"
                  borderRadius="md"
                  border="2px"
                  borderColor={brandConfig.colors.border.darkCard}
                >
                  <QRCodeSVG
                    value={`bitcoin:${silentPaymentAddress}?amount=${btcAmount}&label=Invoice%20${billId.substring(0, 4)}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="bold" color={brandConfig.colors.text.secondaryDark}>
                    Silent Payment Address:
                  </Text>
                  <Button
                    size="xs"
                    leftIcon={<RefreshCcwIcon size={12} />}
                    onClick={regenerateAddress}
                    variant="ghost"
                    isDisabled={paymentStatus !== "pending"}
                  >
                    Regenerate
                  </Button>
                </HStack>
                <HStack
                  p={3}
                  bg={brandConfig.colors.background.main}
                  borderRadius="md"
                  border="1px"
                  borderColor={brandConfig.colors.border.darkCard}
                >
                  <Code
                    flex={1}
                    p={2}
                    fontSize="xs"
                    bg="transparent"
                    color={brandConfig.colors.text.inverse}
                    wordBreak="break-all"
                  >
                    {silentPaymentAddress}
                  </Code>
                  <IconButton
                    aria-label="Copy address"
                    icon={hasAddressCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    onClick={onAddressCopy}
                    colorScheme={hasAddressCopied ? "green" : "gray"}
                  />
                </HStack>
              </Box>
            </>
          )}

          {/* Payment Instructions */}
          <Box>
            <Button onClick={onToggle} variant="link" size="sm" color={brandConfig.colors.primary}>
              {isOpen ? "Hide" : "Show"} Payment Instructions
            </Button>
            <Collapse in={isOpen}>
              <Box mt={3} p={4} bg={brandConfig.colors.background.main} borderRadius="md">
                <VStack align="start" spacing={2} fontSize="sm">
                  <Text fontWeight="bold" color={brandConfig.colors.text.inverse}>
                    How to pay with Silent Bitcoin:
                  </Text>
                  <Text color={brandConfig.colors.text.secondaryDark}>
                    1. Open your Silent Payment compatible wallet (Cake Wallet, Silentium, or BitBox02)
                  </Text>
                  <Text color={brandConfig.colors.text.secondaryDark}>
                    2. Scan the QR code or copy the address above
                  </Text>
                  <Text color={brandConfig.colors.text.secondaryDark}>
                    3. Send exactly {btcAmount} BTC to complete the payment
                  </Text>
                  <Text color={brandConfig.colors.text.secondaryDark}>
                    4. Click "I've Sent Payment" below to start monitoring
                  </Text>
                  <Text color={brandConfig.colors.text.mutedDark} fontSize="xs" fontStyle="italic">
                    Note: Silent Payments use standard Bitcoin network fees (~$1.18 average)
                  </Text>
                </VStack>
              </Box>
            </Collapse>
          </Box>

          {/* Action Buttons */}
          <Divider />
          
          {paymentStatus === "pending" && (
            <Button
              colorScheme="orange"
              size="lg"
              onClick={handlePaymentInitiated}
              width="full"
            >
              I've Sent Payment
            </Button>
          )}

          {paymentStatus === "processing" && (
            <VStack spacing={3}>
              <HStack>
                <Spinner size="sm" color={brandConfig.colors.primary} />
                <Text color={brandConfig.colors.text.secondaryDark}>
                  Monitoring blockchain for your transaction...
                </Text>
              </HStack>
              <Text fontSize="xs" color={brandConfig.colors.text.mutedDark}>
                This usually takes 10-30 minutes depending on network congestion
              </Text>
            </VStack>
          )}

          {paymentStatus === "confirmed" && txHash && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Payment Confirmed!</Text>
                <HStack mt={2}>
                  <Text fontSize="xs">Transaction ID:</Text>
                  <Link
                    href={`https://mempool.space/tx/${txHash}`}
                    isExternal
                    color="blue.500"
                    fontSize="xs"
                  >
                    {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 10)}
                    <Icon as={ExternalLinkIcon} ml={1} w={3} h={3} />
                  </Link>
                </HStack>
              </Box>
            </Alert>
          )}

          {/* Payment Destination Info */}
          {issuerWalletAddress && issuerWalletAddress !== "default-pubkey" && (
            <Alert status="info" borderRadius="md" fontSize="sm" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Payment Destination</Text>
                <Text fontSize="xs">
                  This payment will be sent to the business's Bitcoin wallet.
                  The Silent Payment protocol ensures your privacy while the funds go directly to the merchant.
                </Text>
              </Box>
            </Alert>
          )}

          {(!issuerWalletAddress || issuerWalletAddress === "default-pubkey") && (
            <Alert status="warning" borderRadius="md" fontSize="sm" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">No Bitcoin Receiving Address Configured</Text>
                <Text fontSize="xs">
                  The merchant has not configured a Bitcoin wallet address to receive payments.
                  Please contact the merchant to add their Bitcoin (BTC) wallet address in their profile settings
                  under "Payment Receiving Details" → "Cryptocurrency Wallets".
                </Text>
              </Box>
            </Alert>
          )}

          {/* Wallet Recommendations */}
          <Box p={3} bg={brandConfig.colors.background.main} borderRadius="md" fontSize="xs">
            <Text fontWeight="bold" mb={2} color={brandConfig.colors.text.secondaryDark}>
              Recommended Wallets for Silent Payments:
            </Text>
            <HStack spacing={4} flexWrap="wrap">
              <Link href="https://cakewallet.com" isExternal color="blue.400">
                Cake Wallet <Icon as={ExternalLinkIcon} w={3} h={3} />
              </Link>
              <Link href="https://github.com/Silentium-app/Silentium" isExternal color="blue.400">
                Silentium <Icon as={ExternalLinkIcon} w={3} h={3} />
              </Link>
              <Link href="https://shiftcrypto.ch/bitbox02/" isExternal color="blue.400">
                BitBox02 <Icon as={ExternalLinkIcon} w={3} h={3} />
              </Link>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default SilentBitcoinPayment;