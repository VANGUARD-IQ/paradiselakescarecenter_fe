import React, { useState } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    FormControl,
    FormLabel,
    Select,
    Input,
    Textarea,
    Button,
    VStack,
    HStack,
    NumberInput,
    NumberInputField,
    useToast,
    Text,
    Divider,
    Box,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Badge,
    Icon,
    SimpleGrid,
    Skeleton
} from "@chakra-ui/react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { CREATE_SUBSCRIPTION, GET_SUBSCRIPTIONS, GET_PAYMENT_METHODS_BY_CLIENT } from "./utils/subscriptionQueries";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { FaCreditCard, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { Client } from "../../generated/graphql";
import { useColorMode } from "@chakra-ui/react";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GET_CLIENTS query - imported from clients module pattern
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

// Type definitions for GraphQL data

interface PaymentMethod {
    id: string;
    type: string;
    isDefault: boolean;
    status: string;
    cardDetails?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    description?: string;
}

// Type definition for predefined plans
interface PredefinedPlan {
    name: string;
    description: string;
    amount: number;
    interval: string;
    tier: string;
    modules: string[];
}

const CreateSubscription = () => {
    usePageTitle("New Subscription");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const [formData, setFormData] = useState({
        clientId: "",
        planName: "",
        planDescription: "",
        amount: 0,
        interval: "MONTHLY",
        tier: "BASIC",
        includedModules: ["clients", "sessions"],
        trialEndsAt: "",
        notes: ""
    });

    // Theme-aware colors
    const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
    const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    // Queries
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
    const { data: paymentMethodsData, loading: paymentMethodsLoading } = useQuery(GET_PAYMENT_METHODS_BY_CLIENT, {
        variables: { clientId: formData.clientId },
        skip: !formData.clientId // Only run query when client is selected
    });

    const [createSubscription, { loading }] = useMutation(CREATE_SUBSCRIPTION, {
        onCompleted: () => {
            toast({
                title: "Subscription Created",
                description: "New subscription has been created successfully",
                status: "success",
                duration: 3000
            });
            navigate("/subscriptions/manage");
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        },
        refetchQueries: [{ query: GET_SUBSCRIPTIONS }]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast({
                title: "Client Required",
                description: "Please select a client for this subscription",
                status: "error",
                duration: 3000
            });
            return;
        }

        await createSubscription({
            variables: {
                input: {
                    clientId: formData.clientId,
                    plan: {
                        name: formData.planName,
                        description: formData.planDescription,
                        amount: formData.amount,
                        interval: formData.interval,
                        tier: formData.tier,
                        includedModules: formData.includedModules
                    },
                    trialEndsAt: formData.trialEndsAt || undefined,
                    notes: formData.notes || undefined
                }
            }
        });
    };

    const predefinedPlans: PredefinedPlan[] = [
        {
            name: "Basic Business",
            description: "Perfect for getting started",
            amount: 297,
            interval: "MONTHLY",
            tier: "BASIC",
            modules: ["clients", "sessions"]
        },
        {
            name: "Business Pro",
            description: "Complete business management",
            amount: 597,
            interval: "MONTHLY",
            tier: "PREMIUM",
            modules: ["clients", "sessions", "products", "projects", "bills"]
        },
        {
            name: "Enterprise",
            description: "Full suite with SMS campaigns",
            amount: 1497,
            interval: "MONTHLY",
            tier: "ENTERPRISE",
            modules: ["clients", "sessions", "products", "projects", "bills", "sms-campaigns"]
        }
    ];

    const selectPredefinedPlan = (plan: PredefinedPlan) => {
        setFormData({
            ...formData,
            planName: plan.name,
            planDescription: plan.description,
            amount: plan.amount,
            interval: plan.interval,
            tier: plan.tier,
            includedModules: plan.modules
        });
    };

    const selectedClient = clientsData?.clients?.find((client: Client) => client.id === formData.clientId);
    const paymentMethods = paymentMethodsData?.paymentMethodsByClient || [];

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.md" py={12} flex="1">
                <Card
                    bg={getColor("background.card")}
                    boxShadow={getComponent("card", "shadow")}
                    border="1px"
                    borderColor={getColor("border.light")}
                    borderRadius="xl"
                    overflow="hidden"
                >
                    <CardHeader bg={getColor("background.light")} borderBottom="1px" borderColor={getColor("border.light")}>
                        <VStack align="start" spacing={2}>
                            <Heading
                                size="lg"
                                color={getColor("text.primary")}
                                fontFamily={brandConfig.fonts.heading}
                                fontWeight="600"
                            >
                                Create New Subscription
                            </Heading>
                            <Text fontSize="sm" color={getColor("text.secondary")}>
                                Set up recurring billing plans for your clients. Payment methods are managed separately in the Payment Methods section.
                            </Text>
                        </VStack>
                    </CardHeader>
                    <CardBody p={8}>
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
                                        Client
                                    </FormLabel>
                                    {clientsLoading ? (
                                        <Skeleton height="48px" borderRadius="lg" />
                                    ) : (
                                        <Select
                                            placeholder="Select client"
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            {clientsData?.clients?.map((client: Client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.fName} {client.lName} ({client.email})
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                </FormControl>

                                {/* Payment Methods Display for Selected Client */}
                                {formData.clientId && (
                                    <Box
                                        p={4}
                                        bg={getColor("background.light")}
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor={getColor("border.light")}
                                    >
                                        <HStack justify="space-between" mb={3}>
                                            <Text fontWeight="600" color={getColor("text.primary")}>
                                                Client Payment Methods
                                            </Text>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                leftIcon={<Icon as={FaPlus} />}
                                                onClick={() => navigate("/subscriptions/payment-methods")}
                                                borderColor={getColor("primary")}
                                                color={getColor("primary")}
                                                _hover={{ bg: getColor("background.overlay") }}
                                            >
                                                Add Payment Method
                                            </Button>
                                        </HStack>

                                        {paymentMethodsLoading ? (
                                            <VStack spacing={2}>
                                                <Skeleton height="60px" />
                                                <Skeleton height="60px" />
                                            </VStack>
                                        ) : paymentMethods.length > 0 ? (
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                                {paymentMethods.map((method: PaymentMethod) => (
                                                    <Box
                                                        key={method.id}
                                                        p={3}
                                                        bg={getColor("background.card")}
                                                        borderRadius="md"
                                                        border="1px"
                                                        borderColor={method.isDefault ? getColor("primary") : getColor("border.light")}
                                                    >
                                                        <HStack justify="space-between">
                                                            <HStack>
                                                                <Icon as={FaCreditCard} color={getColor("text.secondary")} />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontSize="sm" fontWeight="500">
                                                                        {method.cardDetails?.brand?.toUpperCase()} •••• {method.cardDetails?.last4}
                                                                    </Text>
                                                                    <Text fontSize="xs" color={getColor("text.secondary")}>
                                                                        Expires {method.cardDetails?.expMonth}/{method.cardDetails?.expYear}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                            {method.isDefault && (
                                                                <Badge colorScheme="blue" size="sm">Default</Badge>
                                                            )}
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </SimpleGrid>
                                        ) : (
                                            <Alert status="warning" borderRadius="md">
                                                <AlertIcon as={FaExclamationTriangle} />
                                                <Box>
                                                    <AlertTitle fontSize="sm">No Payment Methods Found</AlertTitle>
                                                    <AlertDescription fontSize="xs">
                                                        {selectedClient?.fName} {selectedClient?.lName} doesn't have any saved payment methods.
                                                        Add one in the Payment Methods section for automatic billing.
                                                    </AlertDescription>
                                                </Box>
                                            </Alert>
                                        )}
                                    </Box>
                                )}

                                <Divider />
                                <Text fontWeight="bold" color={getColor("text.primary")}>Quick Plans</Text>
                                <HStack spacing={4} wrap="wrap">
                                    {predefinedPlans.map((plan) => (
                                        <Button
                                            key={plan.name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => selectPredefinedPlan(plan)}
                                            borderColor={getColor("border.medium")}
                                            color={getColor("text.primary")}
                                            _hover={{
                                                bg: getColor("background.overlay"),
                                                borderColor: getColor("primary")
                                            }}
                                        >
                                            {plan.name} - ${plan.amount}/mo
                                        </Button>
                                    ))}
                                </HStack>

                                <Divider />

                                {/* Plan Details */}
                                <FormControl isRequired>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Plan Name
                                    </FormLabel>
                                    <Input
                                        value={formData.planName}
                                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                        placeholder="e.g., Basic Business Plan"
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Plan Description
                                    </FormLabel>
                                    <Textarea
                                        value={formData.planDescription}
                                        onChange={(e) => setFormData({ ...formData, planDescription: e.target.value })}
                                        placeholder="Description of what's included..."
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

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
                                        >
                                            <NumberInputField
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                borderRadius="lg"
                                                boxShadow={getComponent("form", "fieldShadow")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus"),
                                                    outline: "none"
                                                }}
                                                _hover={{
                                                    borderColor: getColor("border.medium")
                                                }}
                                                fontFamily={brandConfig.fonts.body}
                                                height="48px"
                                            />
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Billing Interval
                                        </FormLabel>
                                        <Select
                                            value={formData.interval}
                                            onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="YEARLY">Yearly</option>
                                            <option value="ONE_TIME">One Time</option>
                                        </Select>
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Subscription Tier
                                    </FormLabel>
                                    <Select
                                        value={formData.tier}
                                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        <option value="FREE">Free</option>
                                        <option value="BASIC">Basic</option>
                                        <option value="PREMIUM">Premium</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Trial End Date (Optional)
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={formData.trialEndsAt}
                                        onChange={(e) => setFormData({ ...formData, trialEndsAt: e.target.value })}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Notes
                                    </FormLabel>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Additional notes..."
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <HStack spacing={4} pt={4}>
                                    <Button
                                        type="submit"
                                        bg={getComponent("button", "primaryBg")}
                                        color={getColor("text.inverse")}
                                        _hover={{ bg: getComponent("button", "primaryHover") }}
                                        _active={{ transform: "translateY(1px)" }}
                                        isLoading={loading}
                                        loadingText="Creating..."
                                        size="lg"
                                        borderRadius="lg"
                                        fontWeight="600"
                                        boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        Create Subscription
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
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default CreateSubscription;