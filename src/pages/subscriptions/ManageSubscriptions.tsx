import React, { useState, useRef } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    HStack,
    Text,
    useColorModeValue,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Box
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, MoreVertical, Search } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SUBSCRIPTIONS, CANCEL_SUBSCRIPTION } from "./utils/subscriptionQueries";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Client } from "../../generated/graphql";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Type definitions

interface Plan {
    name: string;
    amount: number;
    interval: string;
    tier: string;
}

interface Subscription {
    id: string;
    client: Client;
    plan: Plan;
    status: string;
    nextBillingDate?: string;
    createdAt: string;
}

const ManageSubscriptions = () => {
    usePageTitle("Manage Subscriptions");
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const cancelRef = useRef<HTMLButtonElement>(null);
    
    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");
    const buttonBg = getComponent("button", "bg");
    const buttonHoverBg = getComponent("button", "hoverBg");

    const { data, loading, error, refetch } = useQuery(GET_SUBSCRIPTIONS);
    const [cancelSubscription, { loading: canceling }] = useMutation(CANCEL_SUBSCRIPTION, {
        onCompleted: () => {
            toast({
                title: "Subscription Canceled",
                description: "The subscription has been canceled successfully",
                status: "success",
                duration: 3000
            });
            onClose();
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "green";
            case "CANCELED": return "red";
            case "PAST_DUE": return "orange";
            case "TRIALING": return "blue";
            case "PAUSED": return "yellow";
            default: return "gray";
        }
    };

    const handleCancelClick = (subscription: Subscription) => {
        setSubscriptionToCancel(subscription);
        onOpen();
    };

    const handleCancelConfirm = async () => {
        if (!subscriptionToCancel) return;

        await cancelSubscription({
            variables: {
                id: subscriptionToCancel.id,
                reason: cancelReason || undefined
            }
        });
    };

    // Filter subscriptions
    const filteredSubscriptions = data?.subscriptions?.filter((subscription: Subscription) => {
        const matchesSearch = searchTerm === "" ||
            (subscription.client.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (subscription.client.lName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (subscription.client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            subscription.plan.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || subscription.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    if (loading) return <Text>Loading subscriptions...</Text>;
    if (error) return <Text color="red.500">Error: {error.message}</Text>;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={12} flex="1">
                <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="xl"
                >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                        <HStack justify="space-between" flexDirection={{ base: "column", sm: "row" }} align={{ base: "start", sm: "center" }} spacing={{ base: 4, sm: 0 }}>
                            <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>💳 Manage Subscriptions</Heading>
                            <Button
                                bg={buttonBg}
                                color="white"
                                _hover={{ bg: buttonHoverBg }}
                                onClick={() => navigate("/subscriptions/create")}
                                size={{ base: "sm", md: "md" }}
                                w={{ base: "full", sm: "auto" }}
                                borderRadius="xl"
                            >
                                New Subscription
                            </Button>
                        </HStack>

                        {/* Filters */}
                        <HStack
                            spacing={{ base: 2, md: 4 }}
                            mt={4}
                            flexDirection={{ base: "column", sm: "row" }}
                            align={{ base: "stretch", sm: "center" }}
                        >
                            <InputGroup maxW={{ base: "100%", sm: "300px" }}>
                                <InputLeftElement pointerEvents="none">
                                    <Search size={16} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search clients or plans..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    bg={getComponent("form", "fieldBg")}
                                    border="1px"
                                    borderColor={getComponent("form", "fieldBorder")}
                                    _focus={{
                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                    }}
                                />
                            </InputGroup>

                            <Select
                                placeholder="All Statuses"
                                maxW={{ base: "100%", sm: "200px" }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                bg={getComponent("form", "fieldBg")}
                                border="1px"
                                borderColor={getComponent("form", "fieldBorder")}
                                _focus={{
                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                }}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="CANCELED">Canceled</option>
                                <option value="PAST_DUE">Past Due</option>
                                <option value="TRIALING">Trialing</option>
                                <option value="PAUSED">Paused</option>
                            </Select>
                        </HStack>
                    </CardHeader>

                    <CardBody p={0}>
                        <Box overflowX="auto">
                            <Table variant="simple" minW={{ base: "800px", lg: "100%" }}>
                                <Thead>
                                    <Tr>
                                        <Th color={textSecondary}>Client</Th>
                                        <Th color={textSecondary}>Plan</Th>
                                        <Th color={textSecondary}>Status</Th>
                                        <Th color={textSecondary}>Amount</Th>
                                        <Th color={getColor("text.secondary")} display={{ base: "none", md: "table-cell" }}>Next Billing</Th>
                                        <Th color={getColor("text.secondary")} display={{ base: "none", lg: "table-cell" }}>Created</Th>
                                        <Th color={textSecondary}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredSubscriptions.map((subscription: Subscription) => (
                                        <Tr key={subscription.id}>
                                            <Td>
                                                <Text fontWeight="medium" color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                                                    {subscription.client.fName} {subscription.client.lName}
                                                </Text>
                                                <Text fontSize="xs" color={textMuted}>
                                                    {subscription.client.email}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Text fontWeight="medium" color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                                                    {subscription.plan.name}
                                                </Text>
                                                <Text fontSize="xs" color={textMuted}>
                                                    {subscription.plan.tier}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={getStatusColor(subscription.status)} size={{ base: "sm", md: "md" }}>
                                                    {subscription.status}
                                                </Badge>
                                            </Td>
                                            <Td color={textPrimary}>
                                                <Text fontSize={{ base: "sm", md: "md" }}>
                                                    ${subscription.plan.amount}
                                                </Text>
                                                <Text fontSize="xs" color={textMuted}>
                                                    /{subscription.plan.interval.toLowerCase()}
                                                </Text>
                                            </Td>
                                            <Td color={textPrimary} display={{ base: "none", md: "table-cell" }}>
                                                <Text fontSize="sm">
                                                    {subscription.nextBillingDate ?
                                                        new Date(subscription.nextBillingDate).toLocaleDateString() :
                                                        "N/A"
                                                    }
                                                </Text>
                                            </Td>
                                            <Td color={textPrimary} display={{ base: "none", lg: "table-cell" }}>
                                                <Text fontSize="sm">
                                                    {new Date(subscription.createdAt).toLocaleDateString()}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label="Subscription actions"
                                                    />
                                                    <MenuList>
                                                        <MenuItem
                                                            icon={<EditIcon size={16} />}
                                                            onClick={() => navigate(`/subscriptions/${subscription.id}/edit`)}
                                                        >
                                                            Edit
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<DeleteIcon size={16} />}
                                                            onClick={() => handleCancelClick(subscription)}
                                                            isDisabled={subscription.status === "CANCELED"}
                                                            color="red.500"
                                                        >
                                                            Cancel
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>

                        {filteredSubscriptions.length === 0 && (
                            <Text textAlign="center" py={8} color={textMuted}>
                                {searchTerm || statusFilter ? "No subscriptions match your filters." : "No subscriptions found."}
                            </Text>
                        )}
                    </CardBody>
                </Card>
            </Container>
            <FooterWithFourColumns />

            {/* Cancel Confirmation Dialog */}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Cancel Subscription
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text mb={4}>
                                Are you sure you want to cancel the subscription for{" "}
                                <strong>
                                    {subscriptionToCancel?.client.fName} {subscriptionToCancel?.client.lName}
                                </strong>?
                            </Text>
                            <Text mb={4} fontSize="sm" color="gray.600">
                                Plan: {subscriptionToCancel?.plan.name} (${subscriptionToCancel?.plan.amount}/{subscriptionToCancel?.plan.interval.toLowerCase()})
                            </Text>

                            <Input
                                placeholder="Cancellation reason (optional)"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                bg={getComponent("form", "fieldBg")}
                                border="1px"
                                borderColor={getComponent("form", "fieldBorder")}
                                _focus={{
                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                }}
                            />
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Keep Active
                            </Button>
                            <Button
                                bg={getColor("status.error")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getColor("status.error") }}
                                onClick={handleCancelConfirm}
                                ml={3}
                                isLoading={canceling}
                                loadingText="Canceling..."
                            >
                                Cancel Subscription
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default ManageSubscriptions;