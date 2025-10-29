import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    SimpleGrid,
    List,
    ListItem,
    ListIcon,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useColorMode,
} from "@chakra-ui/react";
import { CheckIcon, StarIcon } from "@chakra-ui/icons";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

// GraphQL Queries and Mutations
const GET_CLIENT_SUBSCRIPTIONS = gql`
    query GetClientSubscriptions {
        mySubscriptions {
            id
            planId
            status
            nextBillingDate
            canceledAt
            stripeSubscriptionId
        }
    }
`;

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

const CREATE_SUBSCRIPTION = gql`
    mutation CreateSubscription($input: SubscriptionInput!) {
        createSubscription(input: $input) {
            id
            status
            stripeSubscriptionId
            clientSecret
            stripeCustomerId
            nextBillingDate
            client {
                id
                email
            }
            plan {
                name
                amount
                interval
            }
        }
    }
`;

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = [
    {
        id: "foundation",
        name: "🌱 Foundation",
        price: "$97",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Entry point - Get started with professional hosting",
        features: [
            "Basic website hosting (up to 5GB)",
            "SSL certificate included",
            "Daily automated backups",
            "Basic email support",
            "Monthly uptime reports",
            "99.9% uptime guarantee"
        ],
        recommended: false,
        color: "green",
        badge: "Start Here"
    },
    {
        id: "growth",
        name: "🚀 Growth",
        price: "$297",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Managed hosting with premium features",
        features: [
            "Everything in Foundation",
            "Fully managed hosting (we handle updates)",
            "Weekly security scans",
            "CDN integration for speed",
            "Priority email support",
            "Basic analytics dashboard",
            "10GB storage"
        ],
        recommended: false,
        color: "blue",
        badge: "Save 5+ hrs/month"
    },
    {
        id: "professional",
        name: "💼 Professional",
        price: "$597",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Complete business essentials package",
        features: [
            "Everything in Growth",
            "Business email setup (5 accounts)",
            "Basic CRM integration",
            "Monthly performance optimization",
            "Twice-weekly backups",
            "Phone support (business hours)",
            "25GB storage",
            "3 automation workflows"
        ],
        recommended: true,
        color: "purple",
        badge: "Most Popular"
    },
    {
        id: "communications",
        name: "📞 Communications",
        price: "$897",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Add voice & unified communications",
        features: [
            "Everything in Professional",
            "VoIP phone number included",
            "Smart call routing & voicemail",
            "SMS capabilities",
            "Basic IVR setup",
            "Call recording (30 days)",
            "Team messaging platform",
            "Video conferencing (10 users)"
        ],
        recommended: false,
        color: "teal",
        badge: "Never Miss a Lead"
    },
    {
        id: "intelligence",
        name: "🤖 Intelligence",
        price: "$1,497",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "AI-powered automation & intelligence",
        features: [
            "Everything in Communications",
            "AI meeting transcription",
            "Call summarization & insights",
            "Automated follow-ups",
            "Smart scheduling assistant",
            "10 custom automation workflows",
            "Basic process mapping",
            "Monthly optimization review",
            "Predictive analytics"
        ],
        recommended: false,
        color: "orange",
        badge: "10+ hrs/week saved"
    },
    {
        id: "enterprise",
        name: "🏢 Enterprise",
        price: "$2,997",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Full business transformation suite",
        features: [
            "Everything in Intelligence",
            "Complete process mapping",
            "Custom workflow design",
            "Unlimited automation workflows",
            "2 custom AI agents",
            "Dedicated account manager",
            "Weekly strategy calls",
            "Priority 24/7 support",
            "Custom integrations",
            "White-label options"
        ],
        recommended: false,
        color: "red",
        badge: "10x Efficiency"
    },
    {
        id: "dominance",
        name: "👑 Dominance",
        price: "$5,997",
        interval: "per month",
        priceId: "", // Will be set from Stripe
        description: "Market leadership package",
        features: [
            "Everything in Enterprise",
            "Competitor analysis & monitoring",
            "Market automation strategies",
            "Custom AI model training",
            "Blockchain integration",
            "Supply chain tracking",
            "Multi-location support",
            "Industry-specific solutions",
            "Quarterly executive sessions",
            "M&A technology support"
        ],
        recommended: false,
        color: "pink",
        badge: "Industry Leader"
    }
];

// Add-on Services Configuration
const ADDON_SERVICES = [
    {
        category: "Communication",
        items: [
            { name: "Additional Phone Numbers", price: "$10/month each", id: "phone_number" },
            { name: "International Calling", price: "$50/month", id: "intl_calling" },
            { name: "Premium Transcription", price: "$30/month", id: "transcription" },
            { name: "Video Recording Storage", price: "$20/month (100GB)", id: "video_storage" }
        ]
    },
    {
        category: "AI & Automation",
        items: [
            { name: "Custom AI Agent", price: "$500/month each", id: "ai_agent" },
            { name: "Advanced Analytics Dashboard", price: "$150/month", id: "analytics" },
            { name: "Sentiment Analysis", price: "$100/month", id: "sentiment" },
            { name: "Predictive Analytics", price: "$200/month", id: "predictive" }
        ]
    },
    {
        category: "Process & Compliance",
        items: [
            { name: "Process Mapping Session", price: "$500 one-time", id: "process_map" },
            { name: "Compliance Monitoring", price: "$300/month", id: "compliance" },
            { name: "Audit Trail System", price: "$150/month", id: "audit" },
            { name: "Document Management", price: "$100/month", id: "docs" }
        ]
    },
    {
        category: "Technical",
        items: [
            { name: "Additional Storage", price: "$10/month per 10GB", id: "storage" },
            { name: "Dedicated Server", price: "$200/month", id: "server" },
            { name: "Load Balancing", price: "$150/month", id: "load_balance" },
            { name: "DDoS Protection", price: "$100/month", id: "ddos" }
        ]
    },
    {
        category: "Support",
        items: [
            { name: "24/7 Support", price: "$300/month", id: "support_247" },
            { name: "Dedicated Slack Channel", price: "$150/month", id: "slack" },
            { name: "Weekly Check-ins", price: "$200/month", id: "checkins" },
            { name: "Emergency Response SLA", price: "$500/month", id: "sla" }
        ]
    }
];

// Payment Form Component
const CheckoutForm = ({ 
    plan, 
    onSuccess, 
    onCancel,
    setDebugInfo 
}: { 
    plan: any; 
    onSuccess: () => void; 
    onCancel: () => void;
    setDebugInfo?: (info: any) => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) return;

            // Create payment method
            setDebugInfo?.({ status: 'Creating payment method...' });
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (pmError) {
                setDebugInfo?.({ status: 'Payment method error', error: pmError.message });
                toast({
                    title: "Payment Method Error",
                    description: pmError.message,
                    status: "error",
                    duration: 5000,
                });
                setIsProcessing(false);
                return;
            }

            setDebugInfo?.({ status: 'Payment method created', paymentMethodId: paymentMethod.id });

            // Create subscription with payment method
            console.log('Creating subscription with plan:', plan);
            console.log('Payment method ID:', paymentMethod.id);
            
            setDebugInfo?.({ status: 'Creating subscription...', paymentMethodId: paymentMethod.id });
            const { data } = await createSubscription({
                variables: {
                    input: {
                        clientId: "current", // Backend will use context.user.id
                        plan: {
                            name: plan.name,
                            description: plan.description,
                            amount: parseInt(plan.price.replace(/[^0-9]/g, '')) * 100, // Convert to cents
                            interval: plan.interval.includes("day") ? "DAILY" : 
                                      plan.interval.includes("week") ? "WEEKLY" : "MONTHLY",
                            tier: "BASIC" // Default tier for subscriptions
                        },
                        paymentMethodId: paymentMethod.id // Send the payment method ID
                    }
                }
            });

            console.log('Subscription created:', data);
            console.log('Full subscription response:', JSON.stringify(data, null, 2));
            console.log('Client secret:', data?.createSubscription?.clientSecret);
            console.log('Stripe subscription ID:', data?.createSubscription?.stripeSubscriptionId);

            setDebugInfo?.({ 
                status: 'Subscription created',
                subscriptionId: data?.createSubscription?.id,
                stripeSubscriptionId: data?.createSubscription?.stripeSubscriptionId,
                hasClientSecret: !!data?.createSubscription?.clientSecret,
                clientSecretLength: data?.createSubscription?.clientSecret?.length
            });

            // Show status to user
            toast({
                title: "Subscription Created",
                description: `Subscription ID: ${data?.createSubscription?.id || 'unknown'}`,
                status: "info",
                duration: 3000,
            });

            if (data?.createSubscription?.clientSecret) {
                // Confirm the subscription
                console.log('Confirming payment with client secret...');
                const { error: confirmError } = await stripe.confirmCardPayment(
                    data.createSubscription.clientSecret
                );

                if (confirmError) {
                    console.error('Payment confirmation error:', confirmError);
                    toast({
                        title: "Payment Error",
                        description: confirmError.message || "Failed to confirm payment",
                        status: "error",
                        duration: 8000,
                    });
                } else {
                    console.log('Payment confirmed successfully!');
                    toast({
                        title: "Success!",
                        description: `You're now subscribed to ${plan.name}. Your card will be charged ${plan.price} ${plan.interval}.`,
                        status: "success",
                        duration: 8000,
                    });
                    onSuccess();
                }
            } else {
                console.error('No client secret received from backend');
                toast({
                    title: "Setup Error",
                    description: "Subscription created but payment setup failed. Please contact support.",
                    status: "warning",
                    duration: 8000,
                });
            }
        } catch (error) {
            console.error("Subscription error:", error);
            toast({
                title: "Subscription Failed",
                description: "Unable to create subscription. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <Box w="100%" p={4} borderWidth="1px" borderColor={brandConfig.colors.border.darkCard} borderRadius="md" bg={brandConfig.colors.background.main}>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#ffffff',
                                    backgroundColor: 'transparent',
                                    '::placeholder': {
                                        color: getColor("text.muted"),
                                    },
                                },
                                invalid: {
                                    color: getColor("status.error"),
                                },
                            },
                        }}
                    />
                </Box>
                
                <Text fontSize="sm" color={brandConfig.colors.text.mutedDark}>
                    Your card will be charged {plan.price} {plan.interval} starting today.
                </Text>

                <HStack spacing={3} w="100%">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        flex={1}
                        isDisabled={isProcessing}
                        borderColor={brandConfig.colors.border.darkCard}
                        color={brandConfig.colors.text.secondaryDark}
                        _hover={{ bg: brandConfig.colors.background.main }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        bg={brandConfig.colors.primary}
                        color="white"
                        _hover={{ bg: brandConfig.colors.primaryHover }}
                        isLoading={isProcessing}
                        loadingText="Processing..."
                        flex={1}
                        isDisabled={!stripe || isProcessing}
                    >
                        Subscribe Now
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};

// Main Component
const SubscriptionOffers = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    
    const bg = brandConfig.colors.background.main;
    const cardBg = brandConfig.colors.background.cardGradient;
    const borderColor = brandConfig.colors.border.darkCard;
    const textPrimary = brandConfig.colors.text.inverse;
    const textSecondary = brandConfig.colors.text.secondaryDark;
    const textMuted = brandConfig.colors.text.mutedDark;
    const currentTenantId = brandConfig.tenantId || "684d0930cc7a27bb01ac83ce";

    // Fetch tenant Stripe configuration
    const { data: tenantData, loading: tenantLoading, error: tenantError } = useQuery(GET_TENANT_CONFIG, {
        variables: { id: currentTenantId }
    });
    
    // Debug logging
    console.log('Tenant ID:', currentTenantId);
    console.log('Tenant Data:', tenantData);
    console.log('Stripe Public Key:', tenantData?.tenant?.apiKeys?.stripePublicKey);
    console.log('Tenant Error:', tenantError);
    
    // Debug state for showing in UI
    const [showDebug, setShowDebug] = useState(true);
    const [debugInfo, setDebugInfo] = useState<any>({});

    // Fetch user's current subscriptions
    const { data: subsData, loading: subsLoading, refetch } = useQuery(GET_CLIENT_SUBSCRIPTIONS);

    const stripePromise = tenantData?.tenant?.apiKeys?.stripePublicKey 
        ? loadStripe(tenantData.tenant.apiKeys.stripePublicKey)
        : null;

    const handleSelectPlan = (plan: any) => {
        // Check if already subscribed
        const existingSubscription = subsData?.mySubscriptions?.find(
            (sub: any) => sub.planId === plan.id && sub.status === 'ACTIVE'
        );

        if (existingSubscription) {
            toast({
                title: "Already Subscribed",
                description: `You already have an active ${plan.name} subscription.`,
                status: "info",
                duration: 5000,
            });
            return;
        }

        setSelectedPlan(plan);
        onOpen();
    };

    const handleSubscriptionSuccess = () => {
        onClose();
        refetch();
        // Optionally navigate to a success page
        setTimeout(() => {
            navigate('/profile/subscriptions');
        }, 2000);
    };

    if (tenantLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.lg" py={12} flex="1">
                    <VStack spacing={4}>
                        <Spinner size="xl" />
                        <Text>Loading payment configuration...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (tenantError) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.lg" py={12} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        <VStack align="start">
                            <Text fontWeight="bold">Error loading payment configuration</Text>
                            <Text fontSize="sm">{tenantError.message}</Text>
                            <Text fontSize="xs">Tenant ID: {currentTenantId}</Text>
                        </VStack>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (!stripePromise || !tenantData?.tenant?.apiKeys?.stripePublicKey) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.lg" py={12} flex="1">
                    <Alert status="warning">
                        <AlertIcon />
                        <VStack align="start">
                            <Text fontWeight="bold">Stripe not configured</Text>
                            <Text>The Stripe public key is not configured for this tenant.</Text>
                            <Text fontSize="sm">Tenant ID: {currentTenantId}</Text>
                            <Text fontSize="sm">Has key: {tenantData?.tenant?.apiKeys?.stripePublicKey ? 'Yes' : 'No'}</Text>
                        </VStack>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <VStack spacing={3} textAlign="center">
                        <Heading size="2xl" color={textPrimary}>
                            Progressive Business Growth Plans
                        </Heading>
                        <Text fontSize="lg" color={textSecondary}>
                            Start with Foundation and scale as you grow. Each tier builds on the previous.
                        </Text>
                        <Text fontSize="md" color={textMuted}>
                            All plans are month-to-month. Upgrade or downgrade anytime.
                        </Text>
                    </VStack>

                    {/* Current Subscriptions Alert */}
                    {subsData?.mySubscriptions?.length > 0 && (
                        <Alert status="info" bg={cardBg} borderColor={borderColor}>
                            <AlertIcon />
                            <Box>
                                <Text fontWeight="bold" color={textPrimary}>You have active subscriptions</Text>
                                <Text fontSize="sm" color={textSecondary}>
                                    View and manage them in your{" "}
                                    <Button
                                        as="a"
                                        href="/profile/subscriptions"
                                        variant="link"
                                        size="sm"
                                        color={brandConfig.colors.primary}
                                    >
                                        subscription dashboard
                                    </Button>
                                </Text>
                            </Box>
                        </Alert>
                    )}

                    {/* Subscription Plans */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                        {SUBSCRIPTION_PLANS.map((plan) => {
                            const isSubscribed = subsData?.mySubscriptions?.some(
                                (sub: any) => sub.planId === plan.id && sub.status === 'ACTIVE'
                            );

                            return (
                                <Card
                                    key={plan.id}
                                    position="relative"
                                    overflow="hidden"
                                    borderWidth={plan.recommended ? "2px" : "1px"}
                                    borderColor={plan.recommended ? brandConfig.colors.primary : borderColor}
                                    bg={cardBg}
                                    backdropFilter="blur(10px)"
                                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                    _hover={{
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {/* Badge */}
                                    {plan.badge && (
                                        <Box
                                            position="absolute"
                                            top="0"
                                            right="0"
                                            bg={plan.recommended ? brandConfig.colors.primary : `${plan.color}.500`}
                                            color="white"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                            fontWeight="bold"
                                            borderBottomLeftRadius="md"
                                        >
                                            {plan.badge}
                                        </Box>
                                    )}

                                    <CardHeader pb={3}>
                                        <VStack align="start" spacing={2}>
                                            <Heading size="md" color={textPrimary}>
                                                {plan.name}
                                            </Heading>
                                            <HStack>
                                                <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                                                    {plan.price}
                                                </Text>
                                                <Text fontSize="sm" color={textMuted}>
                                                    {plan.interval}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="xs" color={textSecondary}>
                                                {plan.description}
                                            </Text>
                                        </VStack>
                                    </CardHeader>

                                    <CardBody py={4}>
                                        <List spacing={2}>
                                            {plan.features.slice(0, 6).map((feature, idx) => (
                                                <ListItem key={idx} fontSize="xs">
                                                    <HStack align="start" spacing={1}>
                                                        <ListIcon
                                                            as={CheckIcon}
                                                            color={`${plan.color}.500`}
                                                            mt={0.5}
                                                            minW="16px"
                                                        />
                                                        <Text color={textPrimary}>
                                                            {feature}
                                                        </Text>
                                                    </HStack>
                                                </ListItem>
                                            ))}
                                            {plan.features.length > 6 && (
                                                <Text fontSize="xs" color={textMuted} pl={6}>
                                                    +{plan.features.length - 6} more features
                                                </Text>
                                            )}
                                        </List>
                                    </CardBody>

                                    <CardFooter>
                                        {isSubscribed ? (
                                            <Button
                                                w="100%"
                                                variant="outline"
                                                isDisabled
                                                size="sm"
                                            >
                                                Currently Active
                                            </Button>
                                        ) : (
                                            <Button
                                                w="100%"
                                                size="sm"
                                                bg={plan.recommended ? brandConfig.colors.primary : "transparent"}
                                                color={plan.recommended ? "white" : textPrimary}
                                                borderWidth={plan.recommended ? "0" : "1px"}
                                                borderColor={borderColor}
                                                _hover={{
                                                    bg: plan.recommended ? brandConfig.colors.primaryHover : brandConfig.colors.background.main,
                                                    transform: "scale(1.02)"
                                                }}
                                                onClick={() => handleSelectPlan(plan)}
                                            >
                                                Get Started
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </SimpleGrid>

                    {/* Add-on Services Section */}
                    <Box mt={12}>
                        <VStack spacing={6} align="stretch">
                            <VStack spacing={2} textAlign="center">
                                <Heading size="xl" color={textPrimary}>
                                    Power-Up with Add-Ons
                                </Heading>
                                <Text fontSize="md" color={textSecondary}>
                                    Enhance any plan with these additional services
                                </Text>
                            </VStack>

                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {ADDON_SERVICES.map((category) => (
                                    <Card
                                        key={category.category}
                                        bg={cardBg}
                                        borderColor={borderColor}
                                        borderWidth="1px"
                                    >
                                        <CardHeader>
                                            <Heading size="sm" color={textPrimary}>
                                                {category.category}
                                            </Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <List spacing={3}>
                                                {category.items.map((item) => (
                                                    <ListItem key={item.id}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" color={textPrimary}>
                                                                {item.name}
                                                            </Text>
                                                            <Text fontSize="xs" color={brandConfig.colors.primary} fontWeight="bold">
                                                                {item.price}
                                                            </Text>
                                                        </VStack>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </VStack>
                    </Box>

                    {/* Test Mode Notice */}
                    {tenantData?.tenant?.apiKeys?.stripePublicKey?.includes('test') && (
                        <Alert status="info" variant="left-accent" bg={cardBg} borderColor={borderColor}>
                            <AlertIcon />
                            <Box>
                                <Text fontWeight="bold" color={textPrimary}>Test Mode Active</Text>
                                <Text fontSize="sm" color={textSecondary}>
                                    Use card number 4242 4242 4242 4242 with any future expiry date and CVC for testing.
                                </Text>
                            </Box>
                        </Alert>
                    )}
                </VStack>
            </Container>

            {/* Checkout Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <ModalHeader color={textPrimary}>
                        Subscribe to {selectedPlan?.name}
                    </ModalHeader>
                    <ModalCloseButton color={textSecondary} />
                    <ModalBody>
                        <Elements stripe={stripePromise}>
                            {selectedPlan && (
                                <>
                                    <CheckoutForm
                                        plan={selectedPlan}
                                        onSuccess={handleSubscriptionSuccess}
                                        onCancel={onClose}
                                        setDebugInfo={setDebugInfo}
                                    />
                                    
                                    {/* Debug Panel */}
                                    {showDebug && debugInfo && Object.keys(debugInfo).length > 0 && (
                                        <Box mt={4} p={3} bg="gray.100" borderRadius="md">
                                            <Text fontSize="xs" fontWeight="bold" mb={2}>Debug Info:</Text>
                                            <VStack align="start" spacing={1}>
                                                {Object.entries(debugInfo).map(([key, value]) => (
                                                    <Text key={key} fontSize="xs">
                                                        <strong>{key}:</strong> {JSON.stringify(value)}
                                                    </Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Elements>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default SubscriptionOffers;