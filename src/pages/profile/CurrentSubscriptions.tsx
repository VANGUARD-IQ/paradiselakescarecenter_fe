import React from "react";
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
    SimpleGrid,
    Badge,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

// GraphQL Queries and Mutations
const GET_MY_SUBSCRIPTIONS = gql`
    query GetMySubscriptions {
        mySubscriptions {
            id
            plan {
                name
                description
                amount
                interval
                tier
            }
            status
            nextBillingDate
            canceledAt
            pausedAt
            createdAt
            stripeSubscriptionId
        }
    }
`;

const CANCEL_SUBSCRIPTION = gql`
    mutation CancelSubscription($subscriptionId: ID!, $reason: String) {
        cancelSubscription(subscriptionId: $subscriptionId, reason: $reason) {
            id
            status
            canceledAt
        }
    }
`;

const PAUSE_SUBSCRIPTION = gql`
    mutation PauseSubscription($subscriptionId: ID!) {
        pauseSubscription(subscriptionId: $subscriptionId) {
            id
            status
            pausedAt
        }
    }
`;

const RESUME_SUBSCRIPTION = gql`
    mutation ResumeSubscription($subscriptionId: ID!) {
        resumeSubscription(subscriptionId: $subscriptionId) {
            id
            status
            pausedAt
        }
    }
`;

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const colorScheme = {
        ACTIVE: "green",
        PAUSED: "yellow",
        CANCELED: "red",
        PAST_DUE: "orange",
        TRIALING: "blue",
        INCOMPLETE: "gray"
    }[status] || "gray";

    return (
        <Badge colorScheme={colorScheme} px={2} py={1} borderRadius="md">
            {status}
        </Badge>
    );
};

// Main Component
const CurrentSubscriptions = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedSubscription, setSelectedSubscription] = React.useState<any>(null);
    const [actionType, setActionType] = React.useState<'cancel' | 'pause' | 'resume'>('cancel');
    
    const bg = brandConfig.colors.background.main;
    const cardBg = brandConfig.colors.background.cardGradient;
    const borderColor = brandConfig.colors.border.darkCard;
    const textPrimary = brandConfig.colors.text.inverse;
    const textSecondary = brandConfig.colors.text.secondaryDark;
    const textMuted = brandConfig.colors.text.mutedDark;

    // Fetch subscriptions
    const { data, loading, error, refetch } = useQuery(GET_MY_SUBSCRIPTIONS);
    const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);
    const [pauseSubscription] = useMutation(PAUSE_SUBSCRIPTION);
    const [resumeSubscription] = useMutation(RESUME_SUBSCRIPTION);

    const handleAction = (subscription: any, action: 'cancel' | 'pause' | 'resume') => {
        setSelectedSubscription(subscription);
        setActionType(action);
        onOpen();
    };

    const confirmAction = async () => {
        if (!selectedSubscription) return;

        try {
            switch (actionType) {
                case 'cancel':
                    await cancelSubscription({
                        variables: {
                            subscriptionId: selectedSubscription.id,
                            reason: "Customer requested cancellation"
                        }
                    });
                    toast({
                        title: "Subscription Canceled",
                        description: "Your subscription has been canceled successfully.",
                        status: "success",
                        duration: 5000,
                    });
                    break;

                case 'pause':
                    await pauseSubscription({
                        variables: { subscriptionId: selectedSubscription.id }
                    });
                    toast({
                        title: "Subscription Paused",
                        description: "Your subscription has been paused.",
                        status: "success",
                        duration: 5000,
                    });
                    break;

                case 'resume':
                    await resumeSubscription({
                        variables: { subscriptionId: selectedSubscription.id }
                    });
                    toast({
                        title: "Subscription Resumed",
                        description: "Your subscription has been resumed.",
                        status: "success",
                        duration: 5000,
                    });
                    break;
            }

            refetch();
            onClose();
        } catch (error) {
            console.error("Action error:", error);
            toast({
                title: "Action Failed",
                description: "Unable to perform the requested action. Please try again.",
                status: "error",
                duration: 5000,
            });
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount / 100);
    };

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.lg" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" color={brandConfig.colors.primary} />
                        <Text color={textPrimary}>Loading your subscriptions...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.lg" py={12} flex="1">
                    <Alert status="error" bg={cardBg} borderColor={borderColor}>
                        <AlertIcon />
                        <Text color={textPrimary}>Error loading subscriptions. Please try again later.</Text>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const subscriptions = data?.mySubscriptions || [];
    const activeSubscriptions = subscriptions.filter((sub: any) => 
        ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(sub.status)
    );
    const inactiveSubscriptions = subscriptions.filter((sub: any) => 
        ['CANCELED', 'PAUSED', 'INCOMPLETE'].includes(sub.status)
    );

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <VStack spacing={4}>
                        <VStack align="start" spacing={2} width="100%">
                            <Heading size="lg" color={textPrimary}>
                                My Subscriptions
                            </Heading>
                            <Text color={textSecondary}>
                                Manage your active subscriptions and billing
                            </Text>
                        </VStack>
                        <Box width="100%" display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                            <Button
                                leftIcon={<AddIcon />}
                                bg={brandConfig.colors.primary}
                                color="white"
                                _hover={{ bg: brandConfig.colors.primaryHover }}
                                onClick={() => navigate('/profile/subscription-offers')}
                                width={{ base: "100%", md: "auto" }}
                                minW={{ md: "180px" }}
                                flexShrink={0}
                            >
                                Add Subscription
                            </Button>
                        </Box>
                    </VStack>

                    {/* Active Subscriptions */}
                    {activeSubscriptions.length > 0 && (
                        <Card 
                            bg={cardBg}
                            borderColor={borderColor}
                            borderWidth="1px"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            backdropFilter="blur(10px)"
                        >
                            <CardHeader>
                                <Heading size="md" color={textPrimary}>
                                    Active Subscriptions
                                </Heading>
                            </CardHeader>
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                    <Thead>
                                        <Tr>
                                            <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Plan</Th>
                                            <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                                            <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", sm: "table-cell" }}>Amount</Th>
                                            <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Next Billing</Th>
                                            <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {activeSubscriptions.map((subscription: any) => (
                                            <Tr key={subscription.id}>
                                                <Td>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontWeight="bold" color={textPrimary} fontSize={{ base: "sm", md: "md" }} noOfLines={1}>
                                                            {subscription.plan?.name || 'Subscription'}
                                                        </Text>
                                                        <Text fontSize={{ base: "2xs", md: "xs" }} color={textMuted}>
                                                            Started {formatDate(subscription.createdAt)}
                                                        </Text>
                                                    </VStack>
                                                </Td>
                                                <Td>
                                                    <StatusBadge status={subscription.status} />
                                                </Td>
                                                <Td display={{ base: "none", sm: "table-cell" }}>
                                                    <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                                                        {subscription.plan?.amount ? formatAmount(subscription.plan.amount, 'AUD') : '-'}
                                                    </Text>
                                                    <Text fontSize="xs" color={textMuted}>
                                                        /{subscription.plan?.interval?.toLowerCase() || 'month'}
                                                    </Text>
                                                </Td>
                                                <Td display={{ base: "none", md: "table-cell" }}>
                                                    <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                                                        {subscription.nextBillingDate 
                                                            ? formatDate(subscription.nextBillingDate)
                                                            : '-'
                                                        }
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2} flexWrap={{ base: "wrap", lg: "nowrap" }}>
                                                        {subscription.status === 'PAUSED' ? (
                                                            <Button
                                                                size="sm"
                                                                colorScheme="green"
                                                                onClick={() => handleAction(subscription, 'resume')}
                                                            >
                                                                Resume
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                borderColor={borderColor}
                                                                color={textSecondary}
                                                                _hover={{ bg: brandConfig.colors.background.main }}
                                                                onClick={() => handleAction(subscription, 'pause')}
                                                            >
                                                                Pause
                                                            </Button>
                                                        )}
                                                        <IconButton
                                                            size="sm"
                                                            icon={<DeleteIcon />}
                                                            aria-label="Cancel subscription"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => handleAction(subscription, 'cancel')}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    )}

                    {/* No Active Subscriptions */}
                    {activeSubscriptions.length === 0 && (
                        <Card 
                            bg={cardBg}
                            borderColor={borderColor}
                            borderWidth="1px"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            backdropFilter="blur(10px)"
                        >
                            <CardBody>
                                <VStack spacing={4} py={8}>
                                    <Text fontSize="lg" color={textMuted}>
                                        You don't have any active subscriptions
                                    </Text>
                                    <Button
                                        leftIcon={<AddIcon />}
                                        bg={brandConfig.colors.primary}
                                        color="white"
                                        _hover={{ bg: brandConfig.colors.primaryHover }}
                                        onClick={() => navigate('/profile/subscription-offers')}
                                    >
                                        Browse Subscription Plans
                                    </Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    {/* Inactive Subscriptions */}
                    {inactiveSubscriptions.length > 0 && (
                        <Card 
                            bg={cardBg}
                            borderColor={borderColor}
                            borderWidth="1px"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            backdropFilter="blur(10px)"
                        >
                            <CardHeader>
                                <Heading size="md" color={textPrimary}>
                                    Inactive Subscriptions
                                </Heading>
                            </CardHeader>
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th color={textSecondary}>Plan</Th>
                                                <Th color={textSecondary}>Status</Th>
                                                <Th color={textSecondary}>Ended</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {inactiveSubscriptions.map((subscription: any) => (
                                                <Tr key={subscription.id}>
                                                    <Td color={textPrimary}>{subscription.plan?.name || 'Subscription'}</Td>
                                                    <Td><StatusBadge status={subscription.status} /></Td>
                                                    <Td color={textPrimary}>
                                                        {subscription.canceledAt 
                                                            ? formatDate(subscription.canceledAt)
                                                            : '-'
                                                        }
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "md" }}>
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <ModalHeader color={textPrimary}>
                        Confirm {actionType === 'cancel' ? 'Cancellation' : actionType === 'pause' ? 'Pause' : 'Resume'}
                    </ModalHeader>
                    <ModalCloseButton color={textSecondary} />
                    <ModalBody>
                        <Text color={textPrimary}>
                            Are you sure you want to {actionType} your{' '}
                            <strong>{selectedSubscription?.plan?.name || 'your'}</strong> subscription?
                        </Text>
                        {actionType === 'cancel' && (
                            <Alert status="warning" mt={4} bg={brandConfig.colors.background.main} borderColor={borderColor}>
                                <AlertIcon />
                                <Text fontSize="sm" color={textPrimary}>
                                    This action cannot be undone. You'll lose access at the end of your billing period.
                                </Text>
                            </Alert>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="ghost" 
                            mr={3} 
                            onClick={onClose}
                            color={textSecondary}
                            _hover={{ bg: brandConfig.colors.background.main }}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme={actionType === 'cancel' ? 'red' : 'blue'}
                            onClick={confirmAction}
                        >
                            {actionType === 'cancel' ? 'Cancel Subscription' : 
                             actionType === 'pause' ? 'Pause Subscription' : 'Resume Subscription'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CurrentSubscriptions;