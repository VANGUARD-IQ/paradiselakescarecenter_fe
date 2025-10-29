import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import {
    Box,
    Button,
    Container,
    VStack,
    Heading,
    Text,
    Spinner,
    Badge,
    Grid,
    GridItem,
    Card,
    CardHeader,
    CardBody,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Divider,
    useToast,
    Image,
    useDisclosure,
    Circle,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { FiPackage, FiClock, FiCheck, FiTruck, FiCreditCard } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import productsModuleConfig from './moduleConfig';
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ShippingAddressModal } from "./components/ShippingAddressModal";
import { useSteps } from "@chakra-ui/stepper";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Product, ProductOrder } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_ORDER = gql`
  query GetOrder($orderId: ID!) {
    productOrder(id: $orderId) {
      id
      client {
        id
        email
        fName
        lName
        phoneNumber
        businessName
        businessRegistrationNumber
        isVerifiedSeller
        billingAddresses {
          name
          phone
          address {
            street
            city
            state
            postcode
            country
          }
          isDefault
          instructions
        }
        shippingAddresses {
          name
          phone
          address {
            street
            city
            state
            postcode
            country
          }
          isDefault
          instructions
        }
      
      }
      items {
        product {
          id
          name
          price
          images
        }
        quantity
        priceAtTime
        selectedVariantId
      }
      totalAmount
      status
      payment {
        status
        method
      }
      createdAt
      updatedAt
    }
  }
`;

// In your frontend component file
const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntentForProductOrder($orderId: String!) {
    createPaymentIntentForProductOrder(orderId: $orderId)
  }
`;

const UPDATE_ORDER_PAYMENT = gql`
  mutation UpdateOrderPayment($orderId: ID!, $status: PaymentStatus!, $stripePaymentIntentId: String!) {
    updateOrderPayment(
      orderId: $orderId
      status: $status
      stripePaymentIntentId: $stripePaymentIntentId
    ) {
      id
      payment {
        status
        method
        stripePaymentIntentId
      }
      status
    }
  }
`;

// Add subscription query at the top with other queries
const ORDER_SUBSCRIPTION = gql`
  subscription OnOrderUpdated($orderId: String!) {
    orderUpdated(orderId: $orderId) {
      id
      status
      payment {
        status
        method
        paidAt
        amountPaid
      }
    }
  }
`;

// Add GET_TENANT_CONFIG query to fetch Stripe configuration
const GET_TENANT_CONFIG = gql`
  query GetTenantConfig($id: ID!) {
    tenant(id: $id) {
      id
      name
      apiKeys {
        stripePublicKey
      }
      branding {
        siteName
      }
    }
  }
`;

// Initialize Stripe conditionally with tenant configuration
let stripePromise: Promise<any> | null = null;

const getStripePromise = (stripePublicKey?: string) => {
    if (!stripePromise && stripePublicKey) {
        console.log('🔑 Creating Stripe instance with tenant key:', stripePublicKey.substring(0, 20) + '...');
        stripePromise = loadStripe(stripePublicKey);
    }
    return stripePromise;
};

// Add interface for subscription data
interface OrderUpdatedData {
    orderUpdated: {
        id: string;
        status: string;
        payment: {
            status: string;
            method: string;
            paidAt: string;
            amountPaid: number;
        };
    };
}

// Payment form component
const PaymentForm = ({
    clientSecret,
    orderId,
    onPaymentSuccess
}: {
    clientSecret: string;
    orderId: string;
    onPaymentSuccess: (paymentIntentId: string) => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                setError(error.message || "Payment failed");
                toast({
                    title: "Payment Failed",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
            } else if (paymentIntent.status === "succeeded") {
                toast({
                    title: "Payment Successful",
                    description: "Your order has been paid for successfully!",
                    status: "success",
                    duration: 5000,
                });
                onPaymentSuccess(paymentIntent.id);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            toast({
                title: "Error",
                description: "An unexpected error occurred during payment.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg">
            <VStack spacing={4}>
                <Box w="100%" p={4} borderWidth="1px" borderColor={getColor("border.light")} borderRadius="md">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "16px",
                                    color: "#424770",
                                    "::placeholder": {
                                        color: "#aab7c4",
                                    },
                                },
                                invalid: {
                                    color: "#9e2146",
                                },
                            },
                        }}
                    />
                </Box>

                {error && (
                    <Text color={getColor("status.error")} fontSize="sm" fontFamily={brandConfig.fonts.body}>
                        {error}
                    </Text>
                )}

                <Button
                    type="submit"
                    bg={getComponent("button", "primaryBg")}
                    color={getColor("text.inverse")}
                    _hover={{ bg: getComponent("button", "primaryHover") }}
                    isLoading={isProcessing}
                    loadingText="Processing Payment..."
                    disabled={!stripe || isProcessing}
                    w="100%"
                    size="lg"
                    fontFamily={brandConfig.fonts.body}
                >
                    Pay Now
                </Button>
            </VStack>
        </Box>
    );
};

// Add a query for checking payment status
const GET_ORDER_PAYMENT_STATUS = gql`
  query GetOrderPaymentStatus($orderId: ID!) {
    productOrder(id: $orderId) {
      id
      payment {
        status
      }
      status
    }
  }
`;

const OrderDetails = () => {
    usePageTitle("Order Details");
    const { id } = useParams();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const toast = useToast();
    const navigate = useNavigate();
    const [isPolling, setIsPolling] = useState(false);
    const { isOpen: isShippingModalOpen, onOpen: onShippingModalOpen, onClose: onShippingModalClose } = useDisclosure();

    const bg = getColor("background.surface");

    // Get current tenant ID from brandConfig
    const currentTenantId = brandConfig.tenantId || "684d0930cc7a27bb01ac83ce"; // Fallback

    // Fetch tenant configuration for Stripe keys
    const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT_CONFIG, {
        variables: { id: currentTenantId }
    });

    const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
    const [updateOrderPayment] = useMutation(UPDATE_ORDER_PAYMENT);

    const { loading, error, data, refetch } = useQuery(GET_ORDER, {
        variables: { orderId: id },
        context: {
            headers: {
                "x-apollo-operation-name": "GetOrder",
                "apollo-require-preflight": "true",
                "content-type": "application/json"
            }
        },
        onCompleted: (data) => {
            console.group("GetOrder Response");
            console.log("Full Response:", data);
            console.log("Order Details:", data?.productOrder);
            console.log("Payment Status:", data?.productOrder?.payment?.status);
            console.log("Order Status:", data?.productOrder?.status);
            console.groupEnd();
        }
    });

    React.useEffect(() => {
        if (data?.productOrder?.payment?.status === "PAID" && !isPolling) {
            console.group("Order Status Check");
            console.log("Payment Status:", data.productOrder.payment.status);
            console.log("Order Status:", data.productOrder.status);
            console.log("Full Order Data:", data.productOrder);
            console.groupEnd();

            // Optional: Start polling if you want to keep checking for updates
            setIsPolling(true);
            startPolling(5000);
        }
    }, [data?.productOrder]);

    React.useEffect(() => {
        if (data?.productOrder?.client) {
            console.group("Client Details");
            console.log("Basic Info:", {
                id: data.productOrder.client.id,
                email: data.productOrder.client.email,
                firstName: data.productOrder.client.fName,
                lastName: data.productOrder.client.lName,
                phone: data.productOrder.client.phoneNumber,
                business: {
                    name: data.productOrder.client.businessName,
                    regNumber: data.productOrder.client.businessRegistrationNumber
                },
                isVerifiedSeller: data.productOrder.client.isVerifiedSeller
            });

            console.log("Billing Addresses:",
                data.productOrder.client.billingAddresses || "No billing addresses found"
            );

            console.log("Shipping Addresses:",
                data.productOrder.client.shippingAddresses || "No shipping addresses found"
            );

            console.log("Payment Receiving Details:",
                data.productOrder.client.paymentReceivingDetails || "No payment details found"
            );
            console.groupEnd();
        } else {
            console.log("No client data available");
        }
    }, [data]);

    // Update subscription usage with proper typing
    useSubscription<OrderUpdatedData>(ORDER_SUBSCRIPTION, {
        variables: { orderId: id },
        onData: ({ data: { data } }) => {
            if (data?.orderUpdated) {
                toast({
                    title: "Order Updated",
                    description: `Payment status: ${data.orderUpdated.payment.status}`,
                    status: "info",
                    duration: 5000,
                });
                refetch(); // Refetch the order details to ensure UI is in sync
            }
        },
    });

    const { startPolling, stopPolling } = useQuery(GET_ORDER_PAYMENT_STATUS, {
        variables: { orderId: id },
        skip: !isPolling,
        pollInterval: 5000,
        onCompleted: (pollingData) => {
            console.group("Polling Response");
            console.log("Polling Data:", pollingData);
            console.log("Payment Status:", pollingData?.productOrder?.payment?.status);
            console.log("Order Status:", pollingData?.productOrder?.status);
            console.groupEnd();

            if (pollingData?.productOrder?.payment?.status === "COMPLETED") {
                stopPolling();
                setIsPolling(false);
                refetch(); // Refetch main order details
                toast({
                    title: "Payment Completed",
                    description: "Your payment has been processed successfully!",
                    status: "success",
                    duration: 5000,
                });
            }
        }
    });

    // Add this effect to check for shipping address
    React.useEffect(() => {
        if (data?.productOrder?.client &&
            (!data.productOrder.client.shippingAddresses ||
                data.productOrder.client.shippingAddresses.length === 0)) {
            onShippingModalOpen();
        }
    }, [data]);

    // Add this handler
    const handleAddressAdded = () => {
        refetch(); // Refetch the order data to get the new shipping address
    };

    // Helper function to determine step index based on order status
    const getStepIndex = (orderStatus: string, paymentStatus: string) => {
        if (paymentStatus === "COMPLETED" || orderStatus === "PAID") {
            return 0; // First step complete
        }
        if (orderStatus === "PROCESSING") {
            return 1;
        }
        if (orderStatus === "SHIPPED") {
            return 2;
        }
        if (orderStatus === "DELIVERED") {
            return 3;
        }
        return -1; // No steps complete
    };

    const steps = [
        {
            title: "Order Placed",
            description: "Your order has been received",
            icon: FiPackage,
            isActive: data?.productOrder?.payment?.status === "COMPLETED" ||
                data?.productOrder?.status === "PAID"
        },
        {
            title: "Processing",
            description: "Order is being processed",
            icon: FiClock,
            isActive: data?.productOrder?.status === "PROCESSING"
        },
        {
            title: "Shipped",
            description: "Your order is on its way",
            icon: FiTruck,
            isActive: data?.productOrder?.status === "SHIPPED"
        },
        {
            title: "Delivered",
            description: "Order has been delivered",
            icon: FiCheck,
            isActive: data?.productOrder?.status === "DELIVERED"
        }
    ];

    // Add debugging logs
    console.log("Payment Status:", data?.productOrder?.payment?.status);
    console.log("Order Status:", data?.productOrder?.status);

    const stepIndex = (data?.productOrder?.payment?.status === "COMPLETED" ||
        data?.productOrder?.status === "PAID") ? 0 : -1;

    console.log("Step Index:", stepIndex);

    const { activeStep } = useSteps({
        index: (data?.productOrder?.payment?.status === "COMPLETED" ||
            data?.productOrder?.status === "PAID") ? 0 : -1,
        count: steps.length,
    });

    // In the render, let's also verify the activeStep value
    console.log("Active Step:", activeStep);

    if (loading || tenantLoading) return <Box bg={bg} minHeight="100vh" display="flex" alignItems="center" justifyContent="center"><Spinner size="xl" /></Box>;
    if (error) return <Box p={4}>Error: {error.message}</Box>;

    const order = data.productOrder;

    const handleInitiatePayment = async () => {
        console.log('🚀 Starting payment initiation...');
        console.log('📦 Order ID:', id);
        try {
            console.log('🔄 Calling createPaymentIntent mutation...');
            const { data } = await createPaymentIntent({
                variables: { orderId: id },
                context: {
                    headers: {
                        "x-apollo-operation-name": "CreatePaymentIntentForProductOrder",
                        "apollo-require-preflight": "true",
                        "content-type": "application/json"
                    }
                }
            });
            console.log('✅ Payment intent response:', data);
            // The client secret is returned from createPaymentIntentForProductOrder
            console.log('🔑 Setting client secret from:', data.createPaymentIntentForProductOrder);
            setClientSecret(data.createPaymentIntentForProductOrder);
        } catch (err) {
            console.error("Error creating payment intent:", err);
            toast({
                title: "Error",
                description: "Could not initiate payment. Please try again.",
                status: "error",
                duration: 5000,
            });
        }
    };
    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            // Start polling for payment status
            setIsPolling(true);
            startPolling(5000);

            toast({
                title: "Processing Payment",
                description: "Please wait while we confirm your payment...",
                status: "info",
                duration: 5000,
            });
        } catch (err) {
            setIsPolling(false);
            stopPolling();
            toast({
                title: "Error",
                description: "Failed to update order status. Please contact support.",
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={productsModuleConfig} />

            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                        borderRadius="xl"
                        overflow="hidden"
                    >
                        <CardHeader bg={getColor("background.light")} borderBottom="1px" borderColor={getColor("border.light")}>
                            <HStack justify="space-between" align="center" wrap="wrap">
                                <VStack align="start" spacing={2}>
                                    <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                        Order #{order.id}
                                    </Text>
                                    <Heading size="lg" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        Order Details
                                    </Heading>
                                </VStack>
                                <Badge
                                    colorScheme={order.status === "COMPLETED" ? "green" : "blue"}
                                    p={2}
                                    borderRadius="lg"
                                >
                                    {order.status}
                                </Badge>
                            </HStack>
                        </CardHeader>

                        <CardBody p={8}>
                            <VStack spacing={8}>
                                <Box w="full">
                                    <VStack spacing={4} align="stretch" w="full">
                                        {steps.map((step, index) => (
                                            <VStack key={index} align="stretch" spacing={2}>
                                                <HStack spacing={4}>
                                                    <Circle
                                                        size="40px"
                                                        bg={step.isActive ? getColor("primary") : getColor("background.light")}
                                                        color={step.isActive ? getColor("text.inverse") : getColor("text.muted")}
                                                    >
                                                        <Box as={step.icon} size="20px" />
                                                    </Circle>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                            {step.title}
                                                        </Text>
                                                        <Text color={getColor("text.secondary")} fontSize="sm" fontFamily={brandConfig.fonts.body}>
                                                            {step.description}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                {index < steps.length - 1 && (
                                                    <Box pl="20px">
                                                        <Divider orientation="vertical" height="20px" borderColor={getColor("border.light")} />
                                                    </Box>
                                                )}
                                            </VStack>
                                        ))}
                                    </VStack>
                                </Box>

                                <Divider borderColor={getColor("border.light")} />

                                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4} w="full">
                                    <GridItem>
                                        <Box overflowX="auto" mx={-4} px={4}>
                                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                                <Thead>
                                                    <Tr>
                                                        <Th color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Product</Th>
                                                        <Th color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Qty</Th>
                                                        <Th display={{ base: "none", md: "table-cell" }} color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Price</Th>
                                                        <Th color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Total</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {order.items.map((item: any) => (
                                                        <Tr key={item.product.id}>
                                                            <Td>
                                                                <HStack spacing={2}>
                                                                    {item.product.images?.[0] && (
                                                                        <Image
                                                                            src={item.product.images[0]}
                                                                            alt={item.product.name}
                                                                            boxSize={{ base: "40px", md: "50px" }}
                                                                            objectFit="cover"
                                                                            borderRadius="md"
                                                                        />
                                                                    )}
                                                                    <Text
                                                                        fontWeight="medium"
                                                                        fontSize={{ base: "sm", md: "md" }}
                                                                        color={getColor("text.primary")}
                                                                        fontFamily={brandConfig.fonts.body}
                                                                    >
                                                                        {item.product.name}
                                                                        <Text
                                                                            display={{ base: "block", md: "none" }}
                                                                            fontSize="xs"
                                                                            color={getColor("text.secondary")}
                                                                            mt={1}
                                                                            fontFamily={brandConfig.fonts.body}
                                                                        >
                                                                            ${item.priceAtTime}
                                                                        </Text>
                                                                    </Text>
                                                                </HStack>
                                                            </Td>
                                                            <Td color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>{item.quantity}</Td>
                                                            <Td display={{ base: "none", md: "table-cell" }} color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                                ${item.priceAtTime}
                                                            </Td>
                                                            <Td fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                                ${(item.quantity * item.priceAtTime).toFixed(2)}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    </GridItem>

                                    <GridItem>
                                        <Card variant="filled" bg={getColor("background.light")} border="1px" borderColor={getColor("border.light")}>
                                            <CardBody p={{ base: 4, md: 6 }}>
                                                <VStack spacing={4} align="stretch">
                                                    <Box>
                                                        <Text fontWeight="bold" mb={2} color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                                            Customer Details
                                                        </Text>
                                                        <Text color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                            {order.client.fName} {order.client.lName}
                                                        </Text>
                                                        <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                                            {order.client.email}
                                                        </Text>
                                                    </Box>

                                                    <Divider borderColor={getColor("border.light")} />

                                                    <Box>
                                                        <Text fontWeight="bold" mb={2} color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                                            Payment Details
                                                        </Text>
                                                        <HStack justify="space-between">
                                                            <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>Status:</Text>
                                                            <Badge colorScheme={
                                                                order.payment.status === "PAID" ? "green" :
                                                                    order.payment.status === "PENDING" ? "yellow" : "red"
                                                            }>
                                                                {order.payment.status}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>Method:</Text>
                                                            <Text color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>{order.payment.method}</Text>
                                                        </HStack>
                                                    </Box>

                                                    <Divider borderColor={getColor("border.light")} />

                                                    <Box>
                                                        <HStack justify="space-between">
                                                            <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>Total Amount:</Text>
                                                            <Text fontSize="xl" fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                                                ${order.totalAmount}
                                                            </Text>
                                                        </HStack>
                                                    </Box>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    </GridItem>
                                </Grid>
                            </VStack>
                        </CardBody>
                    </Card>

                    {order.payment.status === "PENDING" && (
                        <>
                            {/* Stripe Configuration Alert */}
                            <Alert
                                status="info"
                                bg="blue.50"
                                border="1px solid"
                                borderColor="blue.200"
                                borderRadius="lg"
                            >
                                <AlertIcon color="blue.500" />
                                <Box>
                                    <AlertTitle color="blue.800">Payment Configuration</AlertTitle>
                                    <AlertDescription color="blue.700">
                                        {tenantData?.tenant?.apiKeys?.stripePublicKey ? (
                                            <>
                                                Stripe is configured and ready for payments.
                                                {tenantData.tenant.apiKeys.stripePublicKey.includes('test') && (
                                                    <>
                                                        <br />Use test card: <strong>4242 4242 4242 4242</strong> (any CVC, future expiry).
                                                        No real charges will be made.
                                                    </>
                                                )}
                                                <Text mt={2} fontSize="sm">
                                                    Stripe Key: <code>{tenantData.tenant.apiKeys.stripePublicKey.substring(0, 20)}...</code>
                                                </Text>
                                            </>
                                        ) : (
                                            "Stripe configuration not found. Please contact support."
                                        )}
                                    </AlertDescription>
                                </Box>
                            </Alert>

                            <Card bg={getColor("background.card")} boxShadow={getComponent("card", "shadow")} border="1px" borderColor={getColor("border.light")}>
                                <CardHeader>
                                    <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>Payment</Heading>
                                </CardHeader>
                                <CardBody>
                                    {isPolling ? (
                                        <VStack spacing={4}>
                                            <Spinner size="xl" />
                                            <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>Processing your payment...</Text>
                                        </VStack>
                                    ) : !clientSecret ? (
                                        <VStack spacing={4}>
                                            <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>Ready to complete your purchase?</Text>
                                            <Button
                                                bg={getComponent("button", "primaryBg")}
                                                color={getColor("text.inverse")}
                                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                                onClick={handleInitiatePayment}
                                                size="lg"
                                                leftIcon={<FiCreditCard />}
                                                fontFamily={brandConfig.fonts.body}
                                            >
                                                Proceed to Payment
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <Elements stripe={getStripePromise(tenantData?.tenant?.apiKeys?.stripePublicKey)}>
                                            <PaymentForm
                                                clientSecret={clientSecret}
                                                orderId={order.id}
                                                onPaymentSuccess={handlePaymentSuccess}
                                            />
                                        </Elements>
                                    )}
                                </CardBody>
                            </Card>
                        </>
                    )}
                </VStack>
            </Container>

            <FooterWithFourColumns />

            <ShippingAddressModal
                isOpen={isShippingModalOpen}
                onClose={onShippingModalClose}
                clientData={data?.productOrder?.client}
                onAddressAdded={handleAddressAdded}
            />
        </Box>
    );
};

export default OrderDetails; 