import React, { useState } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Select,
    NumberInput,
    NumberInputField,
    Input,
    Button,
    Text,
    useToast,
    Badge,
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Icon,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Checkbox,
    Textarea,
} from "@chakra-ui/react";
import { useMutation, useQuery, gql } from "@apollo/client";
import {
    CHARGE_PAYMENT_METHOD,
    GET_PAYMENT_METHODS_BY_CLIENT,
    GET_CHARGES
} from "./utils/subscriptionQueries";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { FaCreditCard, FaDollarSign, FaReceipt, FaEnvelope } from "react-icons/fa";
import { Client } from "../../generated/graphql";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Add GET_CLIENTS query
const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
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

// Type definitions for GraphQL data

interface PaymentMethod {
    id: string;
    cardDetails?: {
        brand?: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    isDefault: boolean;
    status: string;
}

interface Charge {
    id: string;
    client: {
        id: string;
        fName: string;
        lName: string;
        email: string;
    };
    total: number;
    currency: string;
    lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }>;
    status: string;
    stripePaymentIntentId: string;
    invoiceNumber: string;
    createdAt: string;
}

interface ChargeFormData {
    clientId: string;
    paymentMethodId: string;
    amount: number;
    description: string;
    currency: string;
    sendConfirmationEmail: boolean;
    emailMessage: string;
}

const ManualCharging = () => {
    usePageTitle("Manual Charging");
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState<ChargeFormData>({
        clientId: "",
        paymentMethodId: "",
        amount: 0,
        description: "",
        currency: "USD",
        sendConfirmationEmail: false,
        emailMessage: ""
    });

    const bg = getColor("background.surface");

    // Get current tenant ID from brandConfig
    const currentTenantId = brandConfig.tenantId || "684d0930cc7a27bb01ac83ce"; // Fallback to your current tenant

    // Debug tenant configuration
    console.log('🏢 Current Tenant ID:', currentTenantId);
    console.log('🏢 Brand Config:', brandConfig);

    // Fetch real clients from backend
    const { data: clientsData, loading: clientsLoading, error: clientsError } = useQuery(GET_CLIENTS);

    // Fetch tenant configuration for Stripe keys
    const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT_CONFIG, {
        variables: { id: currentTenantId }
    });

    // Get payment methods for selected client
    const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError, refetch: refetchPaymentMethods } = useQuery(
        GET_PAYMENT_METHODS_BY_CLIENT,
        {
            variables: { clientId: formData.clientId },
            skip: !formData.clientId,
            fetchPolicy: 'cache-and-network', // Always try to fetch fresh data
            onCompleted: (data) => {
                console.log('🔍 Payment methods loaded for client:', formData.clientId);
                console.log('📋 Payment methods data:', data);
                console.log('💳 Number of payment methods:', data?.paymentMethodsByClient?.length || 0);
                console.log('📋 Raw paymentMethodsByClient:', data?.paymentMethodsByClient);
            },
            onError: (error) => {
                console.error('❌ Error loading payment methods:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    graphQLErrors: error.graphQLErrors,
                    networkError: error.networkError
                });
            }
        }
    );

    // Get recent charges for dashboard
    const { data: chargesData, loading: chargesLoading, refetch: refetchCharges } = useQuery(GET_CHARGES);

    const [chargePaymentMethod, { loading: charging }] = useMutation(CHARGE_PAYMENT_METHOD, {
        onCompleted: (data) => {
            const selectedClient = clientsData?.clients?.find((c: Client) => c.id === formData.clientId);

            // The mutation returns a string (invoice ID), not an object
            const invoiceId = data.chargePaymentMethod;

            let successMessage = `💳 Charged $${formData.amount} successfully!`;

            if (invoiceId) {
                successMessage += ` Invoice ID: ${invoiceId}`;
            }

            if (formData.sendConfirmationEmail && selectedClient) {
                successMessage += ` Confirmation email sent to ${selectedClient.email}.`;
            }

            toast({
                title: "Payment Successful!",
                description: successMessage,
                status: "success",
                duration: 7000,
                isClosable: true
            });

            // Reset form
            setFormData({
                clientId: "",
                paymentMethodId: "",
                amount: 0,
                description: "",
                currency: "USD",
                sendConfirmationEmail: false,
                emailMessage: ""
            });

            // Refresh charges list
            refetchCharges();
        },
        onError: (error) => {
            toast({
                title: "Payment Failed",
                description: error.message,
                status: "error",
                duration: 7000,
                isClosable: true
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId || !formData.paymentMethodId || !formData.amount || !formData.description) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        await chargePaymentMethod({
            variables: {
                paymentMethodId: formData.paymentMethodId,
                amount: formData.amount,
                description: formData.description,
                clientId: formData.clientId,
                currency: formData.currency
            }
        });
    };

    const selectedClient = clientsData?.clients?.find((c: Client) => c.id === formData.clientId);
    const selectedPaymentMethod = paymentMethodsData?.paymentMethodsByClient?.find(
        (pm: PaymentMethod) => pm.id === formData.paymentMethodId
    );

    // Calculate stats from recent charges
    const todayCharges = chargesData?.charges?.filter((charge: Charge) => {
        const today = new Date().toDateString();
        const chargeDate = new Date(charge.createdAt).toDateString();
        return chargeDate === today && charge.status === "PAID";
    }) || [];

    const todayRevenue = todayCharges.reduce((sum: number, charge: Charge) => sum + charge.total, 0);

    // Show loading state
    if (clientsLoading || tenantLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <VStack spacing={8}>
                        <Text>Loading configuration...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    // Show error state
    if (clientsError) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Error Loading Clients</AlertTitle>
                            <AlertDescription>{clientsError.message}</AlertDescription>
                        </Box>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={8} align="stretch">

                    {/* Page Explanation */}
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>⚡ Manual Charging - Charge Saved Payment Methods</AlertTitle>
                            <AlertDescription>
                                <VStack align="start" spacing={2} mt={2}>
                                    <Text>This page allows you to charge clients using their previously saved credit card details without asking them for card information again.</Text>
                                    <Text><strong>How it works:</strong></Text>
                                    <Text>1. Select a client from the dropdown</Text>
                                    <Text>2. Choose one of their saved payment methods</Text>
                                    <Text>3. Enter the amount and description for the charge</Text>
                                    <Text>4. Optionally send a confirmation email to the client</Text>
                                    <Text>5. Click "Charge" to process the payment instantly</Text>
                                    <Text fontSize="sm" color="orange.600">
                                        <strong>💡 Tip:</strong> If a client doesn't have saved payment methods, go to "Payment Methods" first to add their card details.
                                    </Text>
                                </VStack>
                            </AlertDescription>
                        </Box>
                    </Alert>

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
                                        Manual Charging
                                    </Heading>
                                    <Text color={getColor("text.secondary")}>
                                        Charge clients using their saved payment methods
                                    </Text>
                                    {tenantData?.tenant && (
                                        <Text fontSize="sm" color={getColor("text.muted")}>
                                            Tenant: {tenantData.tenant.branding?.siteName || tenantData.tenant.name}
                                        </Text>
                                    )}
                                </VStack>

                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/subscriptions/payment-methods")}
                                    borderColor={getColor("border.medium")}
                                    color={getColor("text.primary")}
                                    _hover={{ bg: getColor("background.overlay") }}
                                >
                                    Manage Payment Methods
                                </Button>
                            </HStack>
                        </CardHeader>
                    </Card>

                    {/* Stats Dashboard */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card
                            bg={getColor("background.card")}
                            boxShadow={getComponent("card", "shadow")}
                            border="1px"
                            borderColor={getColor("border.light")}
                        >
                            <CardBody>
                                <Stat>
                                    <StatLabel color={getColor("text.secondary")}>
                                        <HStack>
                                            <Icon as={FaDollarSign} />
                                            <Text>Today's Revenue</Text>
                                        </HStack>
                                    </StatLabel>
                                    <StatNumber color={getColor("text.primary")}>
                                        ${todayRevenue.toFixed(2)}
                                    </StatNumber>
                                    <StatHelpText color={getColor("text.muted")}>
                                        {todayCharges.length} successful charges
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card
                            bg={getColor("background.card")}
                            boxShadow={getComponent("card", "shadow")}
                            border="1px"
                            borderColor={getColor("border.light")}
                        >
                            <CardBody>
                                <Stat>
                                    <StatLabel color={getColor("text.secondary")}>
                                        <HStack>
                                            <Icon as={FaReceipt} />
                                            <Text>Total Charges</Text>
                                        </HStack>
                                    </StatLabel>
                                    <StatNumber color={getColor("text.primary")}>
                                        {chargesData?.charges?.length || 0}
                                    </StatNumber>
                                    <StatHelpText color={getColor("text.muted")}>
                                        All time transactions
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card
                            bg={getColor("background.card")}
                            boxShadow={getComponent("card", "shadow")}
                            border="1px"
                            borderColor={getColor("border.light")}
                        >
                            <CardBody>
                                <Stat>
                                    <StatLabel color={getColor("text.secondary")}>
                                        <HStack>
                                            <Icon as={FaCreditCard} />
                                            <Text>Available Methods</Text>
                                        </HStack>
                                    </StatLabel>
                                    <StatNumber color={getColor("text.primary")}>
                                        {formData.clientId ? (paymentMethodsData?.paymentMethodsByClient?.length || 0) : 0}
                                    </StatNumber>
                                    <StatHelpText color={getColor("text.muted")}>
                                        For selected client
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Stripe Test Mode Alert */}
                    <Alert
                        status="info"
                        bg="blue.50"
                        border="1px solid"
                        borderColor="blue.200"
                        borderRadius="lg"
                    >
                        <AlertIcon color="blue.500" />
                        <Box>
                            <AlertTitle color="blue.800">Testing Mode Active</AlertTitle>
                            <AlertDescription color="blue.700">
                                Use test card: <strong>4242 4242 4242 4242</strong> (any CVC, future expiry).
                                No real charges will be made.
                                {tenantData?.tenant?.apiKeys?.stripePublicKey && (
                                    <Text mt={2} fontSize="sm">
                                        Stripe Public Key: <code>{tenantData.tenant.apiKeys.stripePublicKey.substring(0, 20)}...</code>
                                    </Text>
                                )}
                            </AlertDescription>
                        </Box>
                    </Alert>

                    {/* Charging Form */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Create New Charge
                            </Heading>
                        </CardHeader>

                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={6} align="stretch">

                                    {/* Client Selection */}
                                    <FormControl isRequired>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Select Client
                                        </FormLabel>
                                        <Select
                                            placeholder="Choose a client..."
                                            value={formData.clientId}
                                            onChange={(e) => {
                                                const newClientId = e.target.value;
                                                console.log('👤 Client selected:', newClientId);
                                                const selectedClient = clientsData?.clients?.find((c: Client) => c.id === newClientId);
                                                console.log('👤 Selected client details:', selectedClient);

                                                setFormData({
                                                    ...formData,
                                                    clientId: newClientId,
                                                    paymentMethodId: "" // Reset payment method when client changes
                                                });
                                            }}
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
                                            {clientsData?.clients?.map((client: Client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.fName} {client.lName} ({client.email})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Payment Method Selection */}
                                    {formData.clientId && (
                                        <FormControl isRequired>
                                            <FormLabel
                                                color={getComponent("form", "labelColor")}
                                                fontWeight="500"
                                                fontSize="sm"
                                                mb={2}
                                            >
                                                Select Payment Method
                                            </FormLabel>
                                            {paymentMethodsLoading ? (
                                                <Text>Loading payment methods...</Text>
                                            ) : paymentMethodsError ? (
                                                <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
                                                    <Text color="red.600" fontSize="sm" fontWeight="medium">
                                                        ❌ Error loading payment methods:
                                                    </Text>
                                                    <Text color="red.500" fontSize="sm" mt={1}>
                                                        {paymentMethodsError.message}
                                                    </Text>
                                                    <Text color="red.400" fontSize="xs" mt={2}>
                                                        Check the browser console for more details.
                                                    </Text>
                                                </Box>
                                            ) : paymentMethodsData?.paymentMethodsByClient?.length > 0 ? (
                                                <Select
                                                    placeholder="Choose payment method..."
                                                    value={formData.paymentMethodId}
                                                    onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
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
                                                    {paymentMethodsData.paymentMethodsByClient.map((method: PaymentMethod) => (
                                                        <option key={method.id} value={method.id}>
                                                            {method.cardDetails?.brand?.toUpperCase()} •••• {method.cardDetails?.last4}
                                                            {method.isDefault && " (Default)"}
                                                        </option>
                                                    ))}
                                                </Select>
                                            ) : (
                                                <Box p={4} bg={getColor("background.light")} borderRadius="lg">
                                                    <Text color={getColor("text.secondary")} mb={2}>
                                                        No payment methods found for this client.
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500" mb={2}>
                                                        Debug info: Client ID: {formData.clientId}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500" mb={3}>
                                                        Query response: {JSON.stringify(paymentMethodsData, null, 2)}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => navigate("/subscriptions/payment-methods")}
                                                            bg={getColor("primary")}
                                                            color={getColor("background.white")}
                                                            _hover={{ bg: getColor("secondary") }}
                                                        >
                                                            Add Payment Method
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                console.log('🔄 Manual refresh payment methods for client:', formData.clientId);
                                                                refetchPaymentMethods();
                                                            }}
                                                            borderColor={getColor("border.medium")}
                                                            color={getColor("text.primary")}
                                                            _hover={{ bg: getColor("background.overlay") }}
                                                        >
                                                            🔄 Refresh
                                                        </Button>
                                                    </HStack>
                                                </Box>
                                            )}
                                        </FormControl>
                                    )}

                                    {/* Amount and Currency */}
                                    <HStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel
                                                color={getComponent("form", "labelColor")}
                                                fontWeight="500"
                                                fontSize="sm"
                                                mb={2}
                                            >
                                                Amount
                                            </FormLabel>
                                            <NumberInput
                                                value={formData.amount}
                                                onChange={(value) => setFormData({ ...formData, amount: Number(value) })}
                                                min={0.50}
                                                precision={2}
                                            >
                                                <NumberInputField
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    borderRadius="lg"
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily={brandConfig.fonts.body}
                                                    height="48px"
                                                />
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel
                                                color={getComponent("form", "labelColor")}
                                                fontWeight="500"
                                                fontSize="sm"
                                                mb={2}
                                            >
                                                Currency
                                            </FormLabel>
                                            <Select
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="AUD">AUD</option>
                                            </Select>
                                        </FormControl>
                                    </HStack>

                                    {/* Description */}
                                    <FormControl isRequired>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Description
                                        </FormLabel>
                                        <Input
                                            placeholder="e.g., Consulting services for Q1 2024"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                        />
                                    </FormControl>

                                    {/* Email Confirmation Option */}
                                    <Box>
                                        <Checkbox
                                            isChecked={formData.sendConfirmationEmail}
                                            onChange={(e) => setFormData({ ...formData, sendConfirmationEmail: e.target.checked })}
                                            colorScheme="blue"
                                            size="lg"
                                        >
                                            <HStack>
                                                <Icon as={FaEnvelope} />
                                                <Text>Send confirmation email to client</Text>
                                            </HStack>
                                        </Checkbox>

                                        {formData.sendConfirmationEmail && (
                                            <Box mt={4}>
                                                <FormLabel
                                                    color={getComponent("form", "labelColor")}
                                                    fontWeight="500"
                                                    fontSize="sm"
                                                    mb={2}
                                                >
                                                    Email Message (Optional)
                                                </FormLabel>
                                                <Textarea
                                                    placeholder="Add a personal message to include in the confirmation email..."
                                                    value={formData.emailMessage}
                                                    onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    borderRadius="lg"
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily={brandConfig.fonts.body}
                                                    rows={3}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Charge Preview */}
                                    {selectedClient && selectedPaymentMethod && formData.amount > 0 && (
                                        <Box
                                            p={4}
                                            bg={getColor("background.light")}
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor={getColor("border.light")}
                                        >
                                            <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>Charge Preview:</Text>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm">
                                                    <strong>Client:</strong> {selectedClient.fName} {selectedClient.lName}
                                                </Text>
                                                <Text fontSize="sm">
                                                    <strong>Card:</strong> {selectedPaymentMethod.cardDetails?.brand?.toUpperCase()} •••• {selectedPaymentMethod.cardDetails?.last4}
                                                </Text>
                                                <Text fontSize="sm">
                                                    <strong>Amount:</strong> ${formData.amount.toFixed(2)} {formData.currency}
                                                </Text>
                                                <Text fontSize="sm">
                                                    <strong>Description:</strong> {formData.description}
                                                </Text>
                                                {formData.sendConfirmationEmail && (
                                                    <Text fontSize="sm" color="blue.600">
                                                        <strong>📧 Confirmation email will be sent to:</strong> {selectedClient.email}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Submit Button */}
                                    <HStack spacing={4} pt={4}>
                                        <Button
                                            type="submit"
                                            bg={getComponent("button", "primaryBg")}
                                            color={getColor("text.inverse")}
                                            _hover={{ bg: getComponent("button", "primaryHover") }}
                                            _active={{ transform: "translateY(1px)" }}
                                            isLoading={charging}
                                            loadingText="Processing..."
                                            size="lg"
                                            borderRadius="lg"
                                            fontWeight="600"
                                            boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                                            fontFamily={brandConfig.fonts.body}
                                            leftIcon={<FaCreditCard />}
                                        >
                                            Charge ${formData.amount.toFixed(2)}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate("/subscriptions")}
                                            color={getColor("text.primary")}
                                            _hover={{ bg: getColor("background.overlay") }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            Cancel
                                        </Button>
                                    </HStack>
                                </VStack>
                            </form>
                        </CardBody>
                    </Card>

                    {/* Recent Charges */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <HStack justify="space-between">
                                <Heading size="md" color={getColor("text.primary")}>
                                    Recent Charges
                                </Heading>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/subscriptions/invoices")}
                                    color={getColor("text.primary")}
                                    _hover={{ bg: getColor("background.overlay") }}
                                >
                                    View All
                                </Button>
                            </HStack>
                        </CardHeader>

                        <CardBody>
                            {chargesLoading ? (
                                <Text>Loading charges...</Text>
                            ) : chargesData?.charges?.length > 0 ? (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th color={getColor("text.secondary")}>Client</Th>
                                            <Th color={getColor("text.secondary")}>Amount</Th>
                                            <Th color={getColor("text.secondary")}>Description</Th>
                                            <Th color={getColor("text.secondary")}>Status</Th>
                                            <Th color={getColor("text.secondary")}>Date</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {chargesData.charges.slice(0, 5).map((charge: any) => (
                                            <Tr key={charge.id}>
                                                <Td>
                                                    <Text fontWeight="medium" color={getColor("text.primary")}>
                                                        {charge.client.fName} {charge.client.lName}
                                                    </Text>
                                                </Td>
                                                <Td color={getColor("text.primary")}>
                                                    ${charge.total.toFixed(2)} {charge.currency.toUpperCase()}
                                                </Td>
                                                <Td color={getColor("text.primary")}>
                                                    {charge.lineItems?.[0]?.description || "Manual charge"}
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={charge.status === "PAID" ? "green" : "red"}
                                                    >
                                                        {charge.status}
                                                    </Badge>
                                                </Td>
                                                <Td color={getColor("text.primary")}>
                                                    {new Date(charge.createdAt).toLocaleDateString()}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            ) : (
                                <Text textAlign="center" py={8} color={getColor("text.muted")}>
                                    No charges found. Create your first charge above.
                                </Text>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default ManualCharging;