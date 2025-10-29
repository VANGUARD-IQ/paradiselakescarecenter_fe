import React, { useState } from "react";
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
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack,
    Divider,
    Box
} from "@chakra-ui/react";
import { Download, Eye, MoreVertical, Search, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_INVOICES, GET_INVOICE, CREATE_PAYMENT_INTENT } from "./utils/subscriptionQueries";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent } from "../../brandConfig";
import { Client } from "../../generated/graphql";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Type definitions

interface Plan {
    name: string;
}

interface Subscription {
    id: string;
    plan: Plan;
}

interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface Invoice {
    id: string;
    client: Client;
    subscription?: Subscription;
    invoiceNumber: string;
    status: string;
    type: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    dueDate: string;
    paidAt?: string;
    lineItems: LineItem[];
    createdAt: string;
}

const InvoiceHistory = () => {
    usePageTitle("Invoice History");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data, loading, error } = useQuery(GET_INVOICES);

    const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT, {
        onCompleted: (data) => {
            console.log("Payment intent created:", data.createPaymentIntent);
            // Here you would integrate with Stripe to handle payment
        }
    });

    const bg = getColor("background.surface");

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

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        onOpen();
    };

    const handlePayInvoice = async (invoice: Invoice) => {
        await createPaymentIntent({
            variables: {
                invoiceId: invoice.id
            }
        });
    };

    const filteredInvoices = data?.invoices?.filter((invoice: Invoice) => {
        const matchesSearch = searchTerm === "" ||
            (invoice.client.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (invoice.client.lName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    if (loading) return <Text>Loading invoices...</Text>;
    if (error) return <Text color="red.500">Error: {error.message}</Text>;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={{ base: 6, md: 12 }} px={{ base: 4, md: 6 }} flex="1">
                <Card
                    bg={getColor("background.card")}
                    boxShadow={getComponent("card", "shadow")}
                    border="1px"
                    borderColor={getColor("border.light")}
                >
                    <CardHeader>
                        <HStack justify="space-between" flexDirection={{ base: "column", sm: "row" }} align={{ base: "start", sm: "center" }} spacing={{ base: 4, sm: 0 }}>
                            <Heading size={{ base: "md", md: "lg" }} color={getColor("text.primary")}>Invoice History</Heading>
                            <Button
                                bg={getComponent("button", "primaryBg")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                onClick={() => { }}
                                size={{ base: "sm", md: "md" }}
                                w={{ base: "full", sm: "auto" }}
                            >
                                Create Invoice
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
                                    placeholder="Search invoices..."
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
                                <option value="DRAFT">Draft</option>
                                <option value="OPEN">Open</option>
                                <option value="PAID">Paid</option>
                                <option value="VOID">Void</option>
                                <option value="UNCOLLECTIBLE">Uncollectible</option>
                            </Select>
                        </HStack>
                    </CardHeader>

                    <CardBody p={0}>
                        <Box overflowX="auto">
                            <Table variant="simple" minW={{ base: "800px", lg: "100%" }}>
                                <Thead>
                                    <Tr>
                                        <Th color={getColor("text.secondary")}>Invoice #</Th>
                                        <Th color={getColor("text.secondary")}>Client</Th>
                                        <Th color={getColor("text.secondary")}>Amount</Th>
                                        <Th color={getColor("text.secondary")}>Status</Th>
                                        <Th color={getColor("text.secondary")} display={{ base: "none", md: "table-cell" }}>Due Date</Th>
                                        <Th color={getColor("text.secondary")} display={{ base: "none", lg: "table-cell" }}>Created</Th>
                                        <Th color={getColor("text.secondary")}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredInvoices.map((invoice: Invoice) => (
                                        <Tr key={invoice.id}>
                                            <Td>
                                                <Text fontWeight="medium" color={getColor("text.primary")} fontSize={{ base: "sm", md: "md" }}>
                                                    {invoice.invoiceNumber}
                                                </Text>
                                                {invoice.subscription && (
                                                    <Text fontSize="xs" color={getColor("text.muted")}>
                                                        {invoice.subscription.plan.name}
                                                    </Text>
                                                )}
                                            </Td>
                                            <Td>
                                                <Text fontWeight="medium" color={getColor("text.primary")} fontSize={{ base: "sm", md: "md" }}>
                                                    {invoice.client.fName} {invoice.client.lName}
                                                </Text>
                                                <Text fontSize="xs" color={getColor("text.muted")}>
                                                    {invoice.client.email}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Text fontWeight="bold" color={getColor("text.primary")} fontSize={{ base: "sm", md: "md" }}>
                                                    ${invoice.total.toFixed(2)} {invoice.currency.toUpperCase()}
                                                </Text>
                                                {invoice.subtotal !== invoice.total && (
                                                    <Text fontSize="xs" color={getColor("text.muted")}>
                                                        Subtotal: ${invoice.subtotal.toFixed(2)}
                                                    </Text>
                                                )}
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={getStatusColor(invoice.status)} size={{ base: "sm", md: "md" }}>
                                                    {invoice.status}
                                                </Badge>
                                            </Td>
                                            <Td color={getColor("text.primary")} display={{ base: "none", md: "table-cell" }}>
                                                <Text fontSize="sm">
                                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                                </Text>
                                            </Td>
                                            <Td color={getColor("text.primary")} display={{ base: "none", lg: "table-cell" }}>
                                                <Text fontSize="sm">
                                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label="Invoice actions"
                                                    />
                                                    <MenuList>
                                                        <MenuItem
                                                            icon={<Eye size={16} />}
                                                            onClick={() => handleViewInvoice(invoice)}
                                                        >
                                                            View Details
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<Download size={16} />}
                                                            onClick={() => { }}
                                                        >
                                                            Download PDF
                                                        </MenuItem>
                                                        {invoice.status === "OPEN" && (
                                                            <MenuItem
                                                                icon={<CreditCard size={16} />}
                                                                onClick={() => handlePayInvoice(invoice)}
                                                            >
                                                                Process Payment
                                                            </MenuItem>
                                                        )}
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>

                        {filteredInvoices.length === 0 && (
                            <Text textAlign="center" py={8} color={getColor("text.muted")}>
                                {searchTerm || statusFilter ? "No invoices match your filters." : "No invoices found."}
                            </Text>
                        )}
                    </CardBody>
                </Card>
            </Container>
            <FooterWithFourColumns />

            {/* Invoice Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent bg={getColor("background.card")}>
                    <ModalHeader color={getColor("text.primary")}>
                        Invoice Details - {selectedInvoice?.invoiceNumber}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedInvoice && (
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>Client Information</Text>
                                    <Text color={getColor("text.primary")}>{selectedInvoice.client.fName} {selectedInvoice.client.lName}</Text>
                                    <Text fontSize="sm" color={getColor("text.muted")}>{selectedInvoice.client.email}</Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>Invoice Details</Text>
                                    <HStack justify="space-between">
                                        <Text color={getColor("text.primary")}>Status:</Text>
                                        <Badge colorScheme={getStatusColor(selectedInvoice.status)}>
                                            {selectedInvoice.status}
                                        </Badge>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text color={getColor("text.primary")}>Due Date:</Text>
                                        <Text color={getColor("text.primary")}>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</Text>
                                    </HStack>
                                    {selectedInvoice.paidAt && (
                                        <HStack justify="space-between">
                                            <Text color={getColor("text.primary")}>Paid Date:</Text>
                                            <Text color={getColor("text.primary")}>{new Date(selectedInvoice.paidAt).toLocaleDateString()}</Text>
                                        </HStack>
                                    )}
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2} color={getColor("text.primary")}>Line Items</Text>
                                    {selectedInvoice.lineItems.map((item: LineItem, index: number) => (
                                        <HStack key={index} justify="space-between" py={1}>
                                            <VStack align="start" spacing={0}>
                                                <Text color={getColor("text.primary")}>{item.description}</Text>
                                                <Text fontSize="sm" color={getColor("text.muted")}>
                                                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                                                </Text>
                                            </VStack>
                                            <Text fontWeight="medium" color={getColor("text.primary")}>${item.amount.toFixed(2)}</Text>
                                        </HStack>
                                    ))}
                                </Box>

                                <Divider />

                                <Box>
                                    <HStack justify="space-between">
                                        <Text color={getColor("text.primary")}>Subtotal:</Text>
                                        <Text color={getColor("text.primary")}>${selectedInvoice.subtotal.toFixed(2)}</Text>
                                    </HStack>
                                    {selectedInvoice.taxAmount > 0 && (
                                        <HStack justify="space-between">
                                            <Text color={getColor("text.primary")}>Tax:</Text>
                                            <Text color={getColor("text.primary")}>${selectedInvoice.taxAmount.toFixed(2)}</Text>
                                        </HStack>
                                    )}
                                    <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                                        <Text color={getColor("text.primary")}>Total:</Text>
                                        <Text color={getColor("text.primary")}>${selectedInvoice.total.toFixed(2)} {selectedInvoice.currency.toUpperCase()}</Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                        {selectedInvoice?.status === "OPEN" && (
                            <Button
                                bg={getComponent("button", "primaryBg")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                onClick={() => handlePayInvoice(selectedInvoice)}
                            >
                                Process Payment
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InvoiceHistory;