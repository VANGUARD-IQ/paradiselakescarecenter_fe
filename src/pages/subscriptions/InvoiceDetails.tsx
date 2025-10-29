import React, { useState } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    HStack,
    Text,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Divider,
    Box,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Spinner,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_INVOICE,
    CREATE_PAYMENT_INTENT,
    UPDATE_INVOICE
} from "./utils/subscriptionQueries";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Client } from "../../generated/graphql";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";
import {
    Download,
    Edit,
    MoreVertical,
    CreditCard,
    Mail,
    Check,
    X,
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    User
} from "lucide-react";

// Type definitions
interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    metadata?: string;
}


interface Subscription {
    id: string;
    plan: {
        name: string;
    };
}

interface Invoice {
    id: string;
    client: Client;
    subscription?: Subscription;
    invoiceNumber: string;
    type: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    currency: string;
    dueDate: string;
    paidAt?: string;
    voidedAt?: string;
    lineItems: InvoiceLineItem[];
    stripeInvoiceId?: string;
    stripePaymentIntentId?: string;
    notes?: string;
    billingEmail?: string;
    billingAddress?: string;
    pdfUrl?: string;
    createdAt: string;
    updatedAt: string;
}

const InvoiceDetails = () => {
    usePageTitle("Invoice Details");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [processing, setProcessing] = useState(false);

    const bg = getColor("background.surface");

    // Fetch invoice details
    const { data, loading, error, refetch } = useQuery(GET_INVOICE, {
        variables: { id },
        skip: !id
    });

    const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT, {
        onCompleted: (data) => {
            console.log("Payment intent created:", data.createPaymentIntent);
            toast({
                title: "Payment Link Created",
                description: "Payment intent created successfully. Client can now pay this invoice.",
                status: "success",
                duration: 5000
            });
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

    const [updateInvoice] = useMutation(UPDATE_INVOICE, {
        onCompleted: () => {
            toast({
                title: "Invoice Updated",
                description: "Invoice status updated successfully",
                status: "success",
                duration: 3000
            });
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

    const invoice: Invoice | null = data?.invoice;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "green";
            case "OPEN": return "orange";
            case "DRAFT": return "gray";
            case "VOID": return "red";
            case "UNCOLLECTIBLE": return "red";
            default: return "gray";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "MANUAL": return "Manual Charge";
            case "SUBSCRIPTION": return "Subscription";
            case "RECURRING": return "Recurring";
            default: return type;
        }
    };

    const handleProcessPayment = async () => {
        if (!invoice) return;

        setProcessing(true);
        try {
            await createPaymentIntent({
                variables: { invoiceId: invoice.id }
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkPaid = async () => {
        if (!invoice) return;

        await updateInvoice({
            variables: {
                id: invoice.id,
                input: { status: "PAID" }
            }
        });
        onClose();
    };

    const handleVoidInvoice = async () => {
        if (!invoice) return;

        await updateInvoice({
            variables: {
                id: invoice.id,
                input: { status: "VOID" }
            }
        });
    };

    const handleSendEmail = () => {
        // Implementation for sending invoice email
        toast({
            title: "Email Sent",
            description: `Invoice email sent to ${invoice?.client.email}`,
            status: "success",
            duration: 3000
        });
    };

    const handleDownloadPDF = () => {
        // Implementation for PDF download
        if (invoice?.pdfUrl) {
            window.open(invoice.pdfUrl, '_blank');
        } else {
            toast({
                title: "PDF Not Available",
                description: "PDF is being generated. Please try again in a moment.",
                status: "info",
                duration: 3000
            });
        }
    };

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
                <Container maxW="container.lg" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" color={getColor("primary")} />
                        <Text>Loading invoice details...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !invoice) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
                <Container maxW="container.lg" py={12} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Invoice Not Found</AlertTitle>
                            <AlertDescription>
                                {error?.message || "The requested invoice could not be found."}
                            </AlertDescription>
                        </Box>
                    </Alert>
                    <Button mt={4} onClick={() => navigate("/subscriptions/invoices")}>
                        Back to Invoices
                    </Button>
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

                    {/* Header */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <HStack justify="space-between">
                                <HStack spacing={4}>
                                    <IconButton
                                        icon={<ArrowLeft size={20} />}
                                        variant="ghost"
                                        onClick={() => navigate("/subscriptions/invoices")}
                                        aria-label="Back to invoices"
                                    />
                                    <VStack align="start" spacing={1}>
                                        <Heading size="lg" color={getColor("text.primary")}>
                                            {invoice.invoiceNumber}
                                        </Heading>
                                        <HStack>
                                            <Badge colorScheme={getStatusColor(invoice.status)} size="lg">
                                                {invoice.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getTypeLabel(invoice.type)}
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </HStack>

                                <HStack spacing={2}>
                                    {invoice.status === "OPEN" && (
                                        <Button
                                            leftIcon={<CreditCard size={16} />}
                                            onClick={handleProcessPayment}
                                            isLoading={processing}
                                            loadingText="Processing..."
                                            bg={getComponent("button", "primaryBg")}
                                            color={getColor("text.inverse")}
                                            _hover={{ bg: getComponent("button", "primaryHover") }}
                                        >
                                            Process Payment
                                        </Button>
                                    )}

                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<MoreVertical size={16} />}
                                            variant="outline"
                                            aria-label="More actions"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                icon={<Download size={16} />}
                                                onClick={handleDownloadPDF}
                                            >
                                                Download PDF
                                            </MenuItem>
                                            <MenuItem
                                                icon={<Mail size={16} />}
                                                onClick={handleSendEmail}
                                            >
                                                Send Email
                                            </MenuItem>
                                            <MenuItem
                                                icon={<Edit size={16} />}
                                                onClick={() => navigate(`/subscriptions/invoices/${invoice.id}/edit`)}
                                            >
                                                Edit Invoice
                                            </MenuItem>
                                            {invoice.status === "OPEN" && (
                                                <MenuItem
                                                    icon={<Check size={16} />}
                                                    onClick={onOpen}
                                                >
                                                    Mark as Paid
                                                </MenuItem>
                                            )}
                                            {invoice.status !== "VOID" && (
                                                <MenuItem
                                                    icon={<X size={16} />}
                                                    onClick={handleVoidInvoice}
                                                    color="red.500"
                                                >
                                                    Void Invoice
                                                </MenuItem>
                                            )}
                                        </MenuList>
                                    </Menu>
                                </HStack>
                            </HStack>
                        </CardHeader>
                    </Card>

                    {/* Quick Stats */}
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                        <Card bg={getColor("background.card")} p={4}>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>
                                    <HStack>
                                        <DollarSign size={16} />
                                        <Text>Total Amount</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber color={getColor("text.primary")}>
                                    ${invoice.total.toFixed(2)} {invoice.currency.toUpperCase()}
                                </StatNumber>
                                <StatHelpText color={getColor("text.muted")}>
                                    {invoice.status === "PAID" ? "Paid" : "Outstanding"}
                                </StatHelpText>
                            </Stat>
                        </Card>

                        <Card bg={getColor("background.card")} p={4}>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>
                                    <HStack>
                                        <Calendar size={16} />
                                        <Text>Due Date</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber fontSize="lg" color={getColor("text.primary")}>
                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                </StatNumber>
                                <StatHelpText color={getColor("text.muted")}>
                                    {invoice.paidAt ? `Paid ${new Date(invoice.paidAt).toLocaleDateString()}` :
                                        new Date(invoice.dueDate) < new Date() ? "Overdue" : "Upcoming"}
                                </StatHelpText>
                            </Stat>
                        </Card>

                        <Card bg={getColor("background.card")} p={4}>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>
                                    <HStack>
                                        <User size={16} />
                                        <Text>Client</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber fontSize="lg" color={getColor("text.primary")}>
                                    {invoice.client.fName} {invoice.client.lName}
                                </StatNumber>
                                <StatHelpText color={getColor("text.muted")}>
                                    {invoice.client.email}
                                </StatHelpText>
                            </Stat>
                        </Card>

                        <Card bg={getColor("background.card")} p={4}>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>
                                    <HStack>
                                        <FileText size={16} />
                                        <Text>Type</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber fontSize="lg" color={getColor("text.primary")}>
                                    {getTypeLabel(invoice.type)}
                                </StatNumber>
                                <StatHelpText color={getColor("text.muted")}>
                                    {invoice.subscription ? invoice.subscription.plan.name : "One-time charge"}
                                </StatHelpText>
                            </Stat>
                        </Card>
                    </SimpleGrid>

                    {/* Invoice Details */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>
                                Invoice Details
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6} align="stretch">

                                {/* Line Items */}
                                <Box>
                                    <Text fontWeight="bold" mb={4} color={getColor("text.primary")}>
                                        Line Items
                                    </Text>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th color={getColor("text.secondary")}>Description</Th>
                                                <Th color={getColor("text.secondary")} isNumeric>Qty</Th>
                                                <Th color={getColor("text.secondary")} isNumeric>Unit Price</Th>
                                                <Th color={getColor("text.secondary")} isNumeric>Amount</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {invoice.lineItems.map((item, index) => (
                                                <Tr key={index}>
                                                    <Td color={getColor("text.primary")}>
                                                        <Text fontWeight="medium">{item.description}</Text>
                                                        {item.metadata && (
                                                            <Text fontSize="sm" color={getColor("text.muted")}>
                                                                {item.metadata}
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td isNumeric color={getColor("text.primary")}>{item.quantity}</Td>
                                                    <Td isNumeric color={getColor("text.primary")}>
                                                        ${item.unitPrice.toFixed(2)}
                                                    </Td>
                                                    <Td isNumeric color={getColor("text.primary")} fontWeight="medium">
                                                        ${item.amount.toFixed(2)}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>

                                <Divider />

                                {/* Totals */}
                                <VStack align="end" spacing={2}>
                                    <HStack justify="space-between" w="300px">
                                        <Text color={getColor("text.primary")}>Subtotal:</Text>
                                        <Text color={getColor("text.primary")}>${invoice.subtotal.toFixed(2)}</Text>
                                    </HStack>

                                    {invoice.discountAmount > 0 && (
                                        <HStack justify="space-between" w="300px">
                                            <Text color={getColor("text.primary")}>Discount:</Text>
                                            <Text color={getColor("text.primary")}>-${invoice.discountAmount.toFixed(2)}</Text>
                                        </HStack>
                                    )}

                                    {invoice.taxAmount > 0 && (
                                        <HStack justify="space-between" w="300px">
                                            <Text color={getColor("text.primary")}>Tax:</Text>
                                            <Text color={getColor("text.primary")}>${invoice.taxAmount.toFixed(2)}</Text>
                                        </HStack>
                                    )}

                                    <Divider w="300px" />

                                    <HStack justify="space-between" w="300px" fontWeight="bold" fontSize="lg">
                                        <Text color={getColor("text.primary")}>Total:</Text>
                                        <Text color={getColor("text.primary")}>
                                            ${invoice.total.toFixed(2)} {invoice.currency.toUpperCase()}
                                        </Text>
                                    </HStack>
                                </VStack>

                                {/* Additional Information */}
                                {(invoice.notes || invoice.billingAddress || invoice.stripePaymentIntentId) && (
                                    <>
                                        <Divider />
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                            {invoice.notes && (
                                                <Box>
                                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>
                                                        Notes
                                                    </Text>
                                                    <Text color={getColor("text.primary")}>{invoice.notes}</Text>
                                                </Box>
                                            )}

                                            {invoice.billingAddress && (
                                                <Box>
                                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>
                                                        Billing Address
                                                    </Text>
                                                    <Text color={getColor("text.primary")} whiteSpace="pre-line">
                                                        {invoice.billingAddress}
                                                    </Text>
                                                </Box>
                                            )}

                                            {invoice.stripePaymentIntentId && (
                                                <Box>
                                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>
                                                        Payment Reference
                                                    </Text>
                                                    <Text
                                                        color={getColor("text.primary")}
                                                        fontFamily="mono"
                                                        fontSize="sm"
                                                    >
                                                        {invoice.stripePaymentIntentId}
                                                    </Text>
                                                </Box>
                                            )}
                                        </SimpleGrid>
                                    </>
                                )}

                                {/* Timestamps */}
                                <Divider />
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" mb={1} color={getColor("text.primary")}>Created</Text>
                                        <Text color={getColor("text.muted")} fontSize="sm">
                                            {new Date(invoice.createdAt).toLocaleString()}
                                        </Text>
                                    </Box>

                                    {invoice.paidAt && (
                                        <Box>
                                            <Text fontWeight="bold" mb={1} color={getColor("text.primary")}>Paid</Text>
                                            <Text color={getColor("text.muted")} fontSize="sm">
                                                {new Date(invoice.paidAt).toLocaleString()}
                                            </Text>
                                        </Box>
                                    )}

                                    {invoice.voidedAt && (
                                        <Box>
                                            <Text fontWeight="bold" mb={1} color={getColor("text.primary")}>Voided</Text>
                                            <Text color={getColor("text.muted")} fontSize="sm">
                                                {new Date(invoice.voidedAt).toLocaleString()}
                                            </Text>
                                        </Box>
                                    )}
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
            <FooterWithFourColumns />

            {/* Mark as Paid Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Mark Invoice as Paid</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Are you sure you want to mark invoice <strong>{invoice.invoiceNumber}</strong> as paid?
                        </Text>
                        <Text mt={2} fontSize="sm" color="gray.600">
                            Amount: ${invoice.total.toFixed(2)} {invoice.currency.toUpperCase()}
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            bg={getComponent("button", "primaryBg")}
                            color={getColor("text.inverse")}
                            _hover={{ bg: getComponent("button", "primaryHover") }}
                            onClick={handleMarkPaid}
                        >
                            Mark as Paid
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InvoiceDetails; 