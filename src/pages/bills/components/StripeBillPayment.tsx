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
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { brandConfig } from "../../../brandConfig";
import { useNavigate } from "react-router-dom";

// GraphQL Queries and Mutations
const GET_TENANT_CONFIG = gql`
  query GetTenantConfig($id: ID!) {
    tenant(id: $id) {
      id
      apiKeys {
        stripePublicKey
      }
    }
  }
`;

const CREATE_BILL_PAYMENT = gql`
  mutation CreateBillPayment($billId: ID!, $paymentMethodId: String!) {
    createBillPayment(billId: $billId, paymentMethodId: $paymentMethodId) {
      success
      requiresAction
      clientSecret
      paymentIntentId
      message
    }
  }
`;

interface StripeBillPaymentProps {
  billId: string;
  amount: number;
  onPaymentComplete?: () => void;
}

// Payment Form Component
const CheckoutForm: React.FC<{
  billId: string;
  amount: number;
  onSuccess: () => void;
}> = ({ billId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const [createBillPayment] = useMutation(CREATE_BILL_PAYMENT);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('[StripeBillPayment] Starting payment submission');
    console.log('[StripeBillPayment] Bill ID:', billId);
    console.log('[StripeBillPayment] Amount:', amount);

    if (!stripe || !elements) {
      console.error('[StripeBillPayment] Stripe or Elements not loaded');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      console.log("[StripeBillPayment] Created payment method:", paymentMethod.id);

      // Call the backend mutation
      const { data } = await createBillPayment({
        variables: {
          billId,
          paymentMethodId: paymentMethod.id,
        },
      });

      const response = data.createBillPayment;

      // Handle 3D Secure if required
      if (response.requiresAction && response.clientSecret) {
        console.log("[StripeBillPayment] Payment requires 3D Secure authentication");
        
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          response.clientSecret
        );

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent?.status === "succeeded") {
          toast({
            title: "Payment Successful!",
            description: `Your payment of $${amount.toFixed(2)} has been processed.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onSuccess();
          // Navigate to success page
          navigate(`/bill/${billId}/payment-success`);
        }
      } else if (response.success) {
        // Payment succeeded immediately
        toast({
          title: "Payment Successful!",
          description: `Your payment of $${amount.toFixed(2)} has been processed.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onSuccess();
        // Navigate to success page
        navigate(`/bill/${billId}/payment-success`);
      } else {
        throw new Error(response.message || "Payment failed");
      }
    } catch (err) {
      console.error("[StripeBillPayment] Payment error:", err);
      const errorMessage = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={brandConfig.colors.border.darkCard}
          bg={brandConfig.colors.background.main}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: brandConfig.colors.text.inverse,
                  "::placeholder": {
                    color: brandConfig.colors.text.mutedDark,
                  },
                },
              },
            }}
          />
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          isDisabled={!stripe || isProcessing}
          isLoading={isProcessing}
          loadingText="Processing Payment..."
        >
          Pay ${amount.toFixed(2)} AUD with Card
        </Button>

        <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} textAlign="center">
          Your payment information is secure and encrypted. We use Stripe for payment processing.
        </Text>
      </VStack>
    </form>
  );
};

// Main Component
export const StripeBillPayment: React.FC<StripeBillPaymentProps> = ({
  billId,
  amount,
  onPaymentComplete,
}) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const toast = useToast();

  // Get tenant configuration
  const tenantId = localStorage.getItem("tenantId") || "";
  const { data: tenantData, loading: tenantLoading, error: tenantError } = useQuery(
    GET_TENANT_CONFIG,
    {
      variables: { id: tenantId },
      skip: !tenantId,
    }
  );

  useEffect(() => {
    if (tenantData?.tenant?.apiKeys?.stripePublicKey) {
      console.log("[StripeBillPayment] Loading Stripe with tenant key:", tenantData.tenant.apiKeys.stripePublicKey.substring(0, 10) + "...");
      setStripePromise(loadStripe(tenantData.tenant.apiKeys.stripePublicKey));
    } else if (!tenantLoading && !tenantError) {
      // Fallback to environment variable if tenant doesn't have Stripe configured
      const envStripeKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
      if (envStripeKey) {
        console.log("[StripeBillPayment] Loading Stripe with environment key:", envStripeKey.substring(0, 10) + "...");
        setStripePromise(loadStripe(envStripeKey));
      } else {
        console.error("[StripeBillPayment] No Stripe key found in tenant config or environment");
      }
    }
  }, [tenantData, tenantLoading, tenantError]);

  const handlePaymentSuccess = () => {
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  if (tenantLoading) {
    return (
      <Card
        bg={brandConfig.colors.background.cardGradient}
        borderColor={brandConfig.colors.border.darkCard}
        borderWidth="1px"
      >
        <CardBody>
          <VStack spacing={4}>
            <Spinner size="xl" color={brandConfig.colors.primary} />
            <Text color={brandConfig.colors.text.secondaryDark}>
              Loading payment options...
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (!stripePromise) {
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
              <Text fontWeight="bold">Payment Not Available</Text>
              <Text fontSize="sm">
                Stripe payment is not configured for this account. Please contact support.
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
            💳 Pay with Credit/Debit Card
          </Text>
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
            Secure Payment
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
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
                Amount to Pay
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color={brandConfig.colors.text.inverse}>
                ${amount.toFixed(2)}
              </Text>
              <Text fontSize="xs" color={brandConfig.colors.text.mutedDark}>
                AUD
              </Text>
            </VStack>
          </Box>

          <Divider />

          {/* Stripe Elements Provider */}
          <Elements stripe={stripePromise}>
            <CheckoutForm
              billId={billId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>

          {/* Security Badge */}
          <HStack justify="center" spacing={4} pt={2}>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="subtle">
                🔒 SSL Encrypted
              </Badge>
              <Badge colorScheme="purple" variant="subtle">
                Powered by Stripe
              </Badge>
            </HStack>
          </HStack>

          {/* Accepted Cards */}
          <Box textAlign="center" pt={2}>
            <Text fontSize="xs" color={brandConfig.colors.text.mutedDark} mb={2}>
              We accept:
            </Text>
            <HStack justify="center" spacing={3}>
              <Badge>Visa</Badge>
              <Badge>Mastercard</Badge>
              <Badge>American Express</Badge>
              <Badge>Discover</Badge>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default StripeBillPayment;