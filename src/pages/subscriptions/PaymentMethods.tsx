import React, { useState, useRef } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Button,
    HStack,
    VStack,
    Text,
    Badge,
    IconButton,
    useColorModeValue,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Box,
    Flex,
    Grid,
    Select,
    FormControl,
    FormLabel,
    Alert,
    AlertIcon,
    AlertDescription,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    SimpleGrid,
    AlertTitle
} from "@chakra-ui/react";
import { CreditCard, Trash2, Plus, Star } from "lucide-react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_PAYMENT_METHODS, CREATE_SETUP_INTENT, CREATE_PAYMENT_METHOD } from "./utils/subscriptionQueries";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { StripePaymentMethodSetup } from "../../components/stripe/StripePaymentMethodSetup";
import { Client } from "../../generated/graphql";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Add the GET_CLIENTS query from ClientsList
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

// Add query to get tenant's Stripe public key
const GET_TENANT_STRIPE_PUBLIC_KEY = gql`
  query GetTenantStripePublicKey {
    getTenantStripePublicKey
  }
`;

// Add DELETE_PAYMENT_METHOD mutation
const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id)
  }
`;

// Type definitions

interface CardDetails {
    brand?: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

interface PaymentMethod {
    id: string;
    client: Client;
    type: string;
    isDefault: boolean;
    status: string;
    cardDetails?: CardDetails;
    description?: string;
    lastUsedAt?: string;
    createdAt: string;
}

const PaymentMethods = () => {
    usePageTitle("Payment Methods");
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
    const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [setupClientSecret, setSetupClientSecret] = useState<string>("");
    const [isCreatingSetupIntent, setIsCreatingSetupIntent] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Fetch payment methods
    const { data, loading, error, refetch } = useQuery(GET_PAYMENT_METHODS);

    // Fetch clients for dropdown
    const { data: clientsData, loading: clientsLoading, error: clientsError } = useQuery(GET_CLIENTS);

    // Fetch tenant's Stripe public key
    const { data: stripeKeyData, loading: stripeKeyLoading, error: stripeKeyError } = useQuery(GET_TENANT_STRIPE_PUBLIC_KEY);

    const [createSetupIntent] = useMutation(CREATE_SETUP_INTENT, {
        onCompleted: (data) => {
            console.log("✅ Setup intent created successfully:", data.createSetupIntent);
            setSetupClientSecret(data.createSetupIntent);
            onAddModalOpen();
        },
        onError: (error) => {
            console.error("❌ Setup intent creation failed:", error);
            toast({
                title: "Error Creating Setup",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
            setIsCreatingSetupIntent(false);
        }
    });

    const [createPaymentMethod, { loading: creatingPaymentMethod }] = useMutation(CREATE_PAYMENT_METHOD, {
        onCompleted: (data) => {
            const selectedClient = clientsData?.clients?.find((c: Client) => c.id === selectedClientId);
            console.log("✅ Payment method created successfully:", data.createPaymentMethod);

            toast({
                title: "✅ Payment Method Added Successfully!",
                description: `Added ${data.createPaymentMethod.cardDetails?.brand?.toUpperCase()} •••• ${data.createPaymentMethod.cardDetails?.last4} for ${selectedClient?.fName} ${selectedClient?.lName}. You can now use Manual Charging to charge this card.`,
                status: "success",
                duration: 7000,
                isClosable: true
            });

            // Close modal and refresh data
            onAddModalClose();
            setSetupClientSecret("");
            refetch();
        },
        onError: (error) => {
            console.error("❌ Payment method creation failed:", error);
            toast({
                title: "Error Creating Payment Method",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    });

    const [deletePaymentMethod, { loading: deletingPaymentMethod }] = useMutation(DELETE_PAYMENT_METHOD, {
        onCompleted: (data) => {
            if (data.deletePaymentMethod) {
                toast({
                    title: "Payment Method Deleted",
                    description: "The payment method has been removed successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                // Refetch payment methods list
                refetch();
            } else {
                toast({
                    title: "Failed to Delete",
                    description: "Failed to delete payment method",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
            onClose();
        },
        onError: (error) => {
            console.error("❌ Payment method deletion failed:", error);
            toast({
                title: "Error Deleting Payment Method",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true
            });
            onClose();
        }
    });

    const bg = getColor("background.surface");
    const borderColor = getColor("border.light");

    const handleAddPaymentMethod = async () => {
        if (!selectedClientId) {
            toast({
                title: "Client Required",
                description: "Please select a client before adding a payment method",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsCreatingSetupIntent(true);

        try {
            console.log("🔄 Creating setup intent for client:", selectedClientId);
            await createSetupIntent({
                variables: {
                    clientId: selectedClientId
                }
            });
        } catch (error: any) {
            console.error("❌ Setup intent creation error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create setup intent",
                status: "error",
                duration: 5000,
                isClosable: true
            });
            setIsCreatingSetupIntent(false);
        }
    };

    const handleStripeSuccess = async (paymentMethodId: string, customerId?: string) => {
        if (!selectedClientId) {
            toast({
                title: "Error",
                description: "No client selected",
                status: "error",
                duration: 3000
            });
            return;
        }

        console.log("🎉 Stripe setup successful, creating payment method record:", {
            paymentMethodId,
            customerId,
            selectedClientId
        });

        try {
            await createPaymentMethod({
                variables: {
                    input: {
                        clientId: selectedClientId,
                        type: "CARD",
                        stripePaymentMethodId: paymentMethodId, // Real Stripe payment method ID
                        stripeCustomerId: customerId, // Pass the customer ID from setup intent
                        isDefault: false
                        // status is set automatically to "ACTIVE" by the backend
                    }
                }
            });
        } catch (error) {
            console.error("❌ Error creating payment method record:", error);
        }
    };

    const handleStripeError = (error: string) => {
        console.error("❌ Stripe setup error:", error);
        toast({
            title: "Payment Method Setup Failed",
            description: error,
            status: "error",
            duration: 5000,
            isClosable: true
        });
        setIsCreatingSetupIntent(false);
    };

    const handleDeleteClick = (method: PaymentMethod) => {
        setMethodToDelete(method);
        onOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!methodToDelete) return;

        console.log("🗑️ Deleting payment method:", methodToDelete.id);

        try {
            await deletePaymentMethod({
                variables: { id: methodToDelete.id }
            });
        } catch (error) {
            console.error("❌ Error in handleDeleteConfirm:", error);
            // Error handling is done in the mutation's onError callback
        }
    };

    const getCardIcon = (brand?: string) => {
        // You can replace these with actual card brand icons
        return <CreditCard size={20} />;
    };

    const getSelectedClientName = () => {
        if (!selectedClientId || !clientsData?.clients) return "No client selected";
        const client = clientsData.clients.find((c: Client) => c.id === selectedClientId);
        return client ? `${client.fName} ${client.lName}` : "Client not found";
    };

    const handleModalClose = () => {
        onAddModalClose();
        setSetupClientSecret("");
        setIsCreatingSetupIntent(false);
    };

    if (loading || clientsLoading || stripeKeyLoading) return <Text>Loading...</Text>;
    if (error) return <Text color="red.500">Error loading payment methods: {error.message}</Text>;
    if (clientsError) return <Text color="red.500">Error loading clients: {clientsError.message}</Text>;
    if (stripeKeyError) return <Text color="red.500">Error loading Stripe configuration: {stripeKeyError.message}</Text>;

    const stripePublicKey = stripeKeyData?.getTenantStripePublicKey;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.lg" py={12} flex="1">

                {/* Page Explanation */}
                <Alert status="info" mb={6} borderRadius="lg">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>💳 Payment Methods - Store Credit Cards for Future Charges</AlertTitle>
                        <AlertDescription>
                            <VStack align="start" spacing={2} mt={2}>
                                <Text>This page allows you to securely save credit card details for your clients so you can charge them later without asking for card information again.</Text>
                                <Text><strong>How it works:</strong></Text>
                                <Text>1. Select a client from the dropdown below</Text>
                                <Text>2. Click "Add Payment Method" to save their credit card details using secure Stripe Elements</Text>
                                <Text>3. Card details are encrypted by Stripe - we never see full card numbers</Text>
                                <Text>4. Once saved, go to "Manual Charging" to charge any saved payment method</Text>
                                <Text fontSize="sm" color="orange.600">
                                    <strong>🔒 Security:</strong> All card data is processed securely by Stripe. We only store encrypted payment method tokens.
                                </Text>
                            </VStack>
                        </AlertDescription>
                    </Box>
                </Alert>

                {/* Stripe Configuration Status */}
                <Alert
                    status={stripePublicKey ? "success" : "warning"}
                    mb={6}
                    borderRadius="lg"
                >
                    <AlertIcon />
                    <Box>
                        <AlertTitle>
                            {stripePublicKey ? "✅ Stripe Configuration Active" : "⚠️ Stripe Configuration"}
                        </AlertTitle>
                        <AlertDescription>
                            {stripePublicKey ? (
                                <VStack align="start" spacing={1}>
                                    <Text>Stripe is properly configured for this tenant.</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Public Key: {stripePublicKey.substring(0, 20)}...
                                    </Text>
                                </VStack>
                            ) : (
                                <Text>Stripe is not configured. Please contact your administrator to set up payment processing.</Text>
                            )}
                        </AlertDescription>
                    </Box>
                </Alert>

                <Card
                    bg={getColor("background.card")}
                    boxShadow={getComponent("card", "shadow")}
                    border="1px"
                    borderColor={getColor("border.light")}
                >
                    <CardHeader>
                        <HStack justify="space-between">
                            <Heading size="lg" color={getColor("text.primary")}>Payment Methods</Heading>
                            <Button
                                bg={getComponent("button", "primaryBg")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                leftIcon={<Plus size={16} />}
                                onClick={handleAddPaymentMethod}
                                isDisabled={!selectedClientId || !stripePublicKey}
                                isLoading={isCreatingSetupIntent}
                                loadingText="Setting up..."
                            >
                                Add Payment Method
                            </Button>
                        </HStack>
                    </CardHeader>

                    <CardBody>
                        {/* Client Selection Section */}
                        <Card variant="outline" mb={6} borderColor={borderColor}>
                            <CardBody>
                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Select Client
                                    </FormLabel>
                                    <Select
                                        placeholder="Choose a client to manage payment methods"
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        {clientsData?.clients?.map((client: Client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.fName} {client.lName} - {client.email}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {selectedClientId && (
                                    <Alert status="info" mt={3}>
                                        <AlertIcon />
                                        <AlertDescription>
                                            Selected client: <strong>{getSelectedClientName()}</strong>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {!selectedClientId && (
                                    <Alert status="warning" mt={3}>
                                        <AlertIcon />
                                        <AlertDescription>
                                            Please select a client to view and manage their payment methods.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardBody>
                        </Card>

                        {data?.paymentMethods?.length === 0 ? (
                            <Box textAlign="center" py={12}>
                                <CreditCard size={48} style={{ margin: "0 auto 16px" }} />
                                <Text fontSize="lg" fontWeight="medium" mb={2} color={getColor("text.primary")}>
                                    No payment methods found
                                </Text>
                                <Text color={getColor("text.muted")} mb={6}>
                                    {selectedClientId
                                        ? "Add a payment method for the selected client to enable automatic billing"
                                        : "Select a client above to view their payment methods"
                                    }
                                </Text>
                                {selectedClientId && (
                                    <Button
                                        bg={getComponent("button", "primaryBg")}
                                        color={getColor("text.inverse")}
                                        _hover={{ bg: getComponent("button", "primaryHover") }}
                                        onClick={handleAddPaymentMethod}
                                        isDisabled={!stripePublicKey}
                                        isLoading={isCreatingSetupIntent}
                                        loadingText="Setting up..."
                                    >
                                        Add First Payment Method
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                {data?.paymentMethods
                                    ?.filter((method: PaymentMethod) =>
                                        !selectedClientId || method.client.id === selectedClientId
                                    )
                                    ?.map((method: PaymentMethod) => (
                                        <Card
                                            key={method.id}
                                            variant="outline"
                                            borderColor={method.isDefault ? getColor("primary") : borderColor}
                                            bg={getColor("background.card")}
                                            position="relative"
                                        >
                                            <CardBody>
                                                <Flex justify="space-between" align="start" mb={4}>
                                                    <HStack>
                                                        {getCardIcon(method.cardDetails?.brand)}
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="medium" color={getColor("text.primary")}>
                                                                {method.cardDetails?.brand?.toUpperCase() || method.type} •••• {method.cardDetails?.last4 || "****"}
                                                            </Text>
                                                            <Text fontSize="sm" color={getColor("text.muted")}>
                                                                {method.client.fName} {method.client.lName}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>

                                                    <IconButton
                                                        icon={<Trash2 size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(method)}
                                                        isDisabled={method.isDefault}
                                                        aria-label="Delete payment method"
                                                    />
                                                </Flex>

                                                <HStack justify="space-between" align="center">
                                                    <VStack align="start" spacing={0}>
                                                        {method.cardDetails?.expMonth && method.cardDetails?.expYear && (
                                                            <Text fontSize="sm" color={getColor("text.muted")}>
                                                                Expires {method.cardDetails.expMonth.toString().padStart(2, "0")}/{method.cardDetails.expYear}
                                                            </Text>
                                                        )}
                                                        <Text fontSize="xs" color={getColor("text.muted")}>
                                                            Added {new Date(method.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </VStack>

                                                    {method.isDefault && (
                                                        <HStack>
                                                            <Star size={12} />
                                                            <Badge colorScheme="blue">
                                                                Default
                                                            </Badge>
                                                        </HStack>
                                                    )}
                                                </HStack>

                                                {method.description && (
                                                    <Text fontSize="sm" color={getColor("text.secondary")} mt={2}>
                                                        {method.description}
                                                    </Text>
                                                )}
                                            </CardBody>
                                        </Card>
                                    ))}
                            </Grid>
                        )}
                    </CardBody>
                </Card>
            </Container>
            <FooterWithFourColumns />

            {/* Stripe Payment Method Setup Modal */}
            <Modal isOpen={isAddModalOpen} onClose={handleModalClose} size="lg" closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Payment Method - Secure Setup</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {!stripePublicKey ? (
                            <Alert status="error">
                                <AlertIcon />
                                <AlertDescription>
                                    Stripe is not configured for this tenant. Please contact your administrator.
                                </AlertDescription>
                            </Alert>
                        ) : setupClientSecret && stripePublicKey ? (
                            <StripePaymentMethodSetup
                                clientSecret={setupClientSecret}
                                onSuccess={handleStripeSuccess}
                                onError={handleStripeError}
                                clientName={getSelectedClientName()}
                                stripePublicKey={stripePublicKey}
                            />
                        ) : (
                            <VStack spacing={4}>
                                <Alert status="info">
                                    <AlertIcon />
                                    <AlertDescription>
                                        Setting up secure payment form...
                                    </AlertDescription>
                                </Alert>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Payment Method
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text>
                                Are you sure you want to delete this payment method? This action cannot be undone.
                            </Text>
                            {methodToDelete?.isDefault && (
                                <Text mt={2} color="orange.500" fontSize="sm">
                                    Note: You cannot delete the default payment method. Please set another method as default first.
                                </Text>
                            )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                bg={getColor("status.error")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getColor("status.error") }}
                                onClick={handleDeleteConfirm}
                                ml={3}
                                isDisabled={methodToDelete?.isDefault}
                                isLoading={deletingPaymentMethod}
                                loadingText="Deleting..."
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default PaymentMethods;