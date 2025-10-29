import React, { useState } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    HStack,
    Button,
    Text,
    useToast,
    Badge,
    Box,
    SimpleGrid,
    Code,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Select,
    FormControl,
    FormLabel,
    Divider,
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { CREATE_SETUP_INTENT, CREATE_PAYMENT_METHOD } from "./utils/subscriptionQueries";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { FaCreditCard, FaRocket, FaCheckCircle } from "react-icons/fa";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Test card configurations
const TEST_CARDS = [
    {
        number: "4242424242424242",
        brand: "Visa",
        description: "Success - Default test card",
        cvc: "123",
        exp: "12/34",
        color: "green"
    },
    {
        number: "4000000000000002",
        brand: "Visa",
        description: "Declined - Generic decline",
        cvc: "123",
        exp: "12/34",
        color: "red"
    },
    {
        number: "4000002760003184",
        brand: "Visa",
        description: "3D Secure - Requires authentication",
        cvc: "123",
        exp: "12/34",
        color: "orange"
    },
    {
        number: "4000000000009995",
        brand: "Visa",
        description: "Insufficient funds",
        cvc: "123",
        exp: "12/34",
        color: "red"
    },
    {
        number: "5555555555554444",
        brand: "Mastercard",
        description: "Success - Mastercard",
        cvc: "123",
        exp: "12/34",
        color: "green"
    }
];

// Mock clients for testing
const MOCK_CLIENTS = [
    { id: "test-client-1", name: "John Doe", email: "john@test.com" },
    { id: "test-client-2", name: "Jane Smith", email: "jane@test.com" },
    { id: "test-client-3", name: "Bob Wilson", email: "bob@test.com" }
];

const TestSetup = () => {
    usePageTitle("Test Setup");
    const navigate = useNavigate();
    const toast = useToast();
    const [selectedClient, setSelectedClient] = useState("");
    const [setupStep, setSetupStep] = useState<"select" | "cards" | "complete">("select");

    const bg = getColor("background.surface");

    const [createSetupIntent] = useMutation(CREATE_SETUP_INTENT);
    const [createPaymentMethod] = useMutation(CREATE_PAYMENT_METHOD);

    const handleQuickSetup = async (card: typeof TEST_CARDS[0]) => {
        if (!selectedClient) {
            toast({
                title: "Select Client",
                description: "Please select a client first",
                status: "warning",
                duration: 3000
            });
            return;
        }

        try {
            // Simulate adding a test payment method
            // In real implementation, this would go through Stripe Elements
            toast({
                title: "Test Card Added!",
                description: `${card.brand} •••• ${card.number.slice(-4)} added for testing`,
                status: "success",
                duration: 5000,
                isClosable: true
            });

            console.log("🧪 Test Setup:", {
                client: selectedClient,
                card: card.number,
                brand: card.brand,
                description: card.description
            });

        } catch (error: any) {
            toast({
                title: "Setup Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleGoToManualCharging = () => {
        navigate("/subscriptions/manual-charging");
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={8} align="stretch">

                    {/* Header */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Heading
                                        size="lg"
                                        color={getColor("text.primary")}
                                        fontFamily={brandConfig.fonts.heading}
                                    >
                                        🧪 Stripe Testing Setup
                                    </Heading>
                                    <Text color={getColor("text.secondary")}>
                                        Quick setup for testing manual charges and payment methods
                                    </Text>
                                </VStack>

                                <Button
                                    leftIcon={<FaRocket />}
                                    onClick={handleGoToManualCharging}
                                    bg={getColor("primary")}
                                    color={getColor("background.white")}
                                    _hover={{ bg: getColor("secondary") }}
                                >
                                    Start Testing Charges
                                </Button>
                            </HStack>
                        </CardHeader>
                    </Card>

                    {/* Webhook Testing Instructions */}
                    <Alert
                        status="info"
                        bg="blue.50"
                        border="1px solid"
                        borderColor="blue.200"
                        borderRadius="lg"
                    >
                        <AlertIcon color="blue.500" />
                        <Box>
                            <AlertTitle color="blue.800">Webhook Testing Active</AlertTitle>
                            <AlertDescription color="blue.700">
                                <VStack align="start" spacing={1}>
                                    <Text><strong>Webhook URL:</strong> https://YOUR-NGROK-URL.ngrok-free.app/webhook/payment</Text>
                                    <Text><strong>Events:</strong> payment_intent.succeeded, setup_intent.succeeded</Text>
                                    <Text><strong>Test Mode:</strong> All charges are simulated - no real money</Text>
                                </VStack>
                            </AlertDescription>
                        </Box>
                    </Alert>

                    {/* Client Selection */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Step 1: Select Test Client
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <FormControl>
                                <FormLabel
                                    color={getComponent("form", "labelColor")}
                                    fontWeight="500"
                                    fontSize="sm"
                                    mb={2}
                                >
                                    Choose a test client for payment method setup
                                </FormLabel>
                                <Select
                                    placeholder="Select test client..."
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    bg={getComponent("form", "fieldBg")}
                                    border="1px"
                                    borderColor={getComponent("form", "fieldBorder")}
                                    borderRadius="lg"
                                    _focus={{
                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                    }}
                                    fontFamily={brandConfig.fonts.body}
                                    size="lg"
                                >
                                    {MOCK_CLIENTS.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardBody>
                    </Card>

                    {/* Test Cards */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Step 2: Add Test Payment Methods
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <Text color={getColor("text.secondary")} mb={6}>
                                Click any test card to quickly add it as a payment method for the selected client.
                            </Text>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                {TEST_CARDS.map((card, index) => (
                                    <Card
                                        key={index}
                                        variant="outline"
                                        borderColor={getColor("border.light")}
                                        _hover={{ borderColor: getColor("border.medium"), transform: "translateY(-2px)" }}
                                        transition="all 0.2s"
                                        cursor={selectedClient ? "pointer" : "not-allowed"}
                                        opacity={selectedClient ? 1 : 0.6}
                                        onClick={() => selectedClient && handleQuickSetup(card)}
                                    >
                                        <CardBody p={4}>
                                            <VStack align="start" spacing={3}>
                                                <HStack justify="space-between" w="full">
                                                    <HStack>
                                                        <FaCreditCard size={20} />
                                                        <Text fontWeight="bold">{card.brand}</Text>
                                                    </HStack>
                                                    <Badge colorScheme={card.color}>
                                                        {card.color === "green" ? "Success" :
                                                            card.color === "red" ? "Fail" : "Special"}
                                                    </Badge>
                                                </HStack>

                                                <Box>
                                                    <Code fontSize="sm" colorScheme="gray">
                                                        {card.number}
                                                    </Code>
                                                    <Text fontSize="xs" color={getColor("text.muted")} mt={1}>
                                                        Exp: {card.exp} • CVC: {card.cvc}
                                                    </Text>
                                                </Box>

                                                <Text fontSize="sm" color={getColor("text.secondary")}>
                                                    {card.description}
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    {/* Testing Workflow */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Step 3: Complete Testing Workflow
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="start" spacing={4}>
                                <Text color={getColor("text.secondary")}>
                                    After setting up test payment methods, follow this workflow:
                                </Text>

                                <VStack align="start" spacing={2} pl={4}>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">1. Go to Manual Charging page</Text>
                                    </HStack>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">2. Select your test client</Text>
                                    </HStack>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">3. Choose the test payment method</Text>
                                    </HStack>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">4. Enter test amount (e.g., $25.00)</Text>
                                    </HStack>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">5. Add description (e.g., "Webhook test")</Text>
                                    </HStack>
                                    <HStack>
                                        <FaCheckCircle color="green" />
                                        <Text fontSize="sm">6. Process charge and check webhook logs</Text>
                                    </HStack>
                                </VStack>

                                <Divider my={4} />

                                <HStack spacing={4}>
                                    <Button
                                        leftIcon={<FaRocket />}
                                        onClick={handleGoToManualCharging}
                                        bg={getColor("primary")}
                                        color={getColor("background.white")}
                                        _hover={{ bg: getColor("secondary") }}
                                        size="lg"
                                    >
                                        Test Manual Charging
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/subscriptions/payment-methods")}
                                        borderColor={getColor("border.medium")}
                                        color={getColor("text.primary")}
                                        _hover={{ bg: getColor("background.overlay") }}
                                        size="lg"
                                    >
                                        Manage Payment Methods
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/subscriptions/invoices")}
                                        borderColor={getColor("border.medium")}
                                        color={getColor("text.primary")}
                                        _hover={{ bg: getColor("background.overlay") }}
                                        size="lg"
                                    >
                                        View Charge History
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Webhook Logs */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Expected Webhook Events
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <Text color={getColor("text.secondary")}>
                                    When testing, you should see these events in your webhook logs:
                                </Text>

                                <Box p={4} bg={getColor("background.light")} borderRadius="lg" w="full">
                                    <Code colorScheme="green" display="block" whiteSpace="pre-wrap">
                                        {`✅ Payment Webhook verified: payment_intent.succeeded
💰 Processing manual charge success
✅ Manual charge success email sent to: test@example.com
📧 Webhook processing complete`}
                                    </Code>
                                </Box>

                                <Text fontSize="sm" color={getColor("text.muted")}>
                                    Check your backend console for these log messages when processing test charges.
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default TestSetup; 