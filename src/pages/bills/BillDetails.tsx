import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery, useApolloClient, useMutation } from "@apollo/client";
import { FORMAT_SPEC_CONTENT, BILL_TEMPLATE_CONTENT, downloadMarkdownFile } from "./markdownTemplates";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
  Switch,
  useToast,
  useClipboard,
  IconButton,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  FormControl,
  FormLabel,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Textarea,
  Tooltip,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { EditIcon, DownloadIcon, ViewIcon, DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../../contexts/AuthContext";
import { pdf } from '@react-pdf/renderer';
import { BillPDF } from './components/BillPDF';
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { ClientSearchSelector } from "../clients/components/ClientSearchSelector";
// import { LoginModal } from '../authentication';

enum BillStatus {
  PROPOSAL = "PROPOSAL",
  DRAFT = "DRAFT",
  SENT = "SENT"
}

const GET_BILL = gql`
  query GetBillById($id: ID!) {
    bill(id: $id) {
      id
      isPaid
      status
      paymentMethod
      currency
      acceptCardPayment
      acceptCryptoPayment
      projectId
      clientId
      issuedBy
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      subtotal
      taxPercentage
      taxAmount
      totalAmount
      tenantId
      createdAt
      updatedAt
    }
  }
`;

const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      fName
      lName
      email
      businessName
      phoneNumber
    }
  }
`;

const TOGGLE_BILL_PAYMENT_STATUS = gql`
  mutation ToggleBillPaymentStatus($id: ID!) {
    toggleBillPaymentStatus(id: $id) {
      id
      isPaid
    }
  }
`;

const TOGGLE_BILL_DRAFT_STATUS = gql`
  mutation ToggleBillDraftStatus($id: ID!) {
    toggleBillDraftStatus(id: $id) {
      id
      status
    }
  }
`;

const UPDATE_BILL_STATUS = gql`
  mutation UpdateBillStatus($id: ID!, $status: BillStatus!) {
    updateBillStatus(id: $id, status: $status) {
      id
      status
      lineItems {
        id
        description
        amount
      }
      isPaid
      totalAmount
      paymentMethod
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_LINE_ITEM = gql`
  mutation UpdateLineItem($billId: ID!, $lineItemId: ID!, $amount: Float, $description: String) {
    updateLineItem(
      billId: $billId
      lineItemId: $lineItemId
      amount: $amount
      description: $description
    ) {
      id
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      status
      totalAmount
      isPaid
      updatedAt
    }
  }
`;

const DELETE_LINE_ITEM = gql`
  mutation DeleteLineItem($billId: ID!, $lineItemId: ID!) {
    deleteLineItem(billId: $billId, lineItemId: $lineItemId) {
      id
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      status
      totalAmount
      isPaid
      updatedAt
    }
  }
`;

const UPDATE_BILL_PAYMENT_METHODS = gql`
  mutation UpdateBill($id: ID!, $input: BillInput!) {
    updateBill(id: $id, input: $input) {
      id
      acceptCardPayment
      acceptCryptoPayment
    }
  }
`;

const DUPLICATE_BILL_WITH_PERCENTAGE = gql`
  mutation DuplicateBillWithPercentage($id: ID!, $percentage: Float!, $paymentTerms: String) {
    duplicateBillWithPercentage(id: $id, percentage: $percentage, paymentTerms: $paymentTerms) {
      id
      isPaid
      status
      currency
      lineItems {
        id
        description
        amount
      }
      totalAmount
      percentageOfTotal
      paymentTerms
    }
  }
`;

const GET_CLIENT_BY_BILL = gql`
  query GetClientDetailsByBillId($billId: ID!) {
    getClientDetailsByBillId(billId: $billId) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const CHANGE_BILL_CLIENT = gql`
  mutation ChangeBillClient($billId: ID!, $newClientId: ID!) {
    changeBillClient(billId: $billId, newClientId: $newClientId)
  }
`;

const GET_BILL_ISSUER = gql`
  query GetBillIssuerDetails($billId: ID!) {
    getBillIssuerDetails(billId: $billId) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
      businessRegistrationNumber
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
          swiftCode
        }
        cryptoWallets {
          walletAddress
          network
          memo
        }
        stripeConnect {
          stripeAccountId
          accountVerified
          verifiedAt
        }
        paypalEmail
        isVerified
        cryptoDiscountPercentage
      }
    }
  }
`;

const IMPORT_LINE_ITEMS_FROM_MARKDOWN = gql`
  mutation ImportLineItemsFromMarkdown($billId: ID!, $markdown: String!) {
    importLineItemsFromMarkdown(billId: $billId, markdown: $markdown) {
      id
      lineItems {
        id
        description
        amount
      }
      totalAmount
      status
      isPaid
      updatedAt
    }
  }
`;

const GET_CURRENT_TENANT_DETAILS = gql`
  query GetCurrentTenantDetails {
    currentTenant {
      id
      name
      companyDetails {
        companyName
        taxId
        billingEmail
        billingPhone
        billingAddress {
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
        }
      }
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
          swiftCode
        }
        cryptoWallets {
          walletAddress
          network
          memo
        }
        paypalEmail
        cryptoDiscountPercentage
      }
    }
  }
`;

const BillDetails = () => {
  usePageTitle("Bill Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { colorMode } = useColorMode();

  // Brand colors setup
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primary");
  const textSecondary = getColor("text.secondary");
  const textMuted = getColor("text.muted");
  const statusSuccess = getColor("status.success");

  // Check if user has admin permissions
  const isAdmin = user?.permissions?.includes("ADMIN") || user?.permissions?.includes("admin");

  // Rule: Display only the first 4 digits of the MongoDB ID for invoice ID
  const getDisplayBillId = (fullId: string) => {
    return fullId.substring(0, 4);
  };

  // Allow public access to bills - no redirect needed
  // Bills can be viewed by anyone with the link (especially PROPOSAL status bills for client review)
  // React.useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     navigate(`/bill/${id}/preview`);
  //   }
  // }, [authLoading, isAuthenticated, navigate, id]);

  const { loading, error, data } = useQuery(GET_BILL, {
    variables: { id },
  });

  // Fetch client details if bill has a clientId
  const { data: clientData, loading: clientLoading, error: clientError } = useQuery(GET_CLIENT, {
    variables: { id: data?.bill?.clientId },
    skip: !data?.bill?.clientId, // Only fetch if clientId exists
  });

  // Debug logging with useEffect
  React.useEffect(() => {
    if (data?.bill) {
      console.log('📋 Bill data loaded:', {
        billId: data.bill.id,
        clientId: data.bill.clientId,
        hasClientId: !!data.bill.clientId,
        projectId: data.bill.projectId
      });
    }
  }, [data]);

  // Log client query status
  React.useEffect(() => {
    console.log('🔍 Client query status:', {
      loading: clientLoading,
      hasData: !!clientData,
      hasClient: !!clientData?.client,
      hasError: !!clientError,
      skip: !data?.bill?.clientId,
      clientId: data?.bill?.clientId
    });
  }, [clientLoading, clientData, clientError, data?.bill?.clientId]);

  React.useEffect(() => {
    if (clientData?.client) {
      console.log('👤 Client data loaded:', {
        clientId: clientData.client.id,
        name: `${clientData.client.fName} ${clientData.client.lName}`,
        email: clientData.client.email
      });
    }
    if (clientError) {
      console.error('❌ Error loading client:', clientError);
    }
  }, [clientData, clientError]);

  const { data: issuerData, loading: issuerLoading } = useQuery(GET_BILL_ISSUER, {
    variables: { billId: id },
  });

  // Fetch tenant details as fallback for old bills
  const { data: tenantData, loading: tenantLoading } = useQuery(GET_CURRENT_TENANT_DETAILS, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  // Use tenant data as fallback if issuer data is not available
  const effectiveIssuerData = issuerData?.getBillIssuerDetails || {
    businessName: tenantData?.currentTenant?.companyDetails?.companyName,
    email: tenantData?.currentTenant?.companyDetails?.billingEmail,
    phoneNumber: tenantData?.currentTenant?.companyDetails?.billingPhone,
    paymentReceivingDetails: tenantData?.currentTenant?.paymentReceivingDetails,
    fName: "",
    lName: "",
  };

  console.log("Raw data:", data);
  console.log("Bill:", data?.bill);
  console.log("Line Items:", data?.bill?.lineItems);
  console.log("[BillDetails] Issuer crypto wallets:", effectiveIssuerData?.paymentReceivingDetails?.cryptoWallets);
  console.log("[BillDetails] Bitcoin wallet found:", effectiveIssuerData?.paymentReceivingDetails?.cryptoWallets?.find(
    (wallet: any) => wallet.network === "BTC"
  ));

  const client = useApolloClient();
  const toast = useToast();

  const [updateBillStatus] = useMutation(UPDATE_BILL_STATUS);
  const [updateLineItem] = useMutation(UPDATE_LINE_ITEM);
  const [deleteLineItem] = useMutation(DELETE_LINE_ITEM);
  const [updateBillPaymentMethods] = useMutation(UPDATE_BILL_PAYMENT_METHODS);
  const [duplicateBillWithPercentage] = useMutation(DUPLICATE_BILL_WITH_PERCENTAGE);
  const [toggleBillDraftStatus] = useMutation(TOGGLE_BILL_DRAFT_STATUS);
  const [changeBillClient] = useMutation(CHANGE_BILL_CLIENT);
  const [importLineItemsFromMarkdown] = useMutation(IMPORT_LINE_ITEMS_FROM_MARKDOWN);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<{
    description: string;
    amount: number;
  }>({ description: "", amount: 0 });

  // Duplicate bill modal state
  const { isOpen: isDuplicateModalOpen, onOpen: openDuplicateModal, onClose: closeDuplicateModal } = useDisclosure();
  const { isOpen: isChangeClientModalOpen, onOpen: openChangeClientModal, onClose: closeChangeClientModal } = useDisclosure();
  const { isOpen: isImportModalOpen, onOpen: openImportModal, onClose: closeImportModal } = useDisclosure();
  const [duplicatePercentage, setDuplicatePercentage] = React.useState(50);
  const [duplicatePaymentTerms, setDuplicatePaymentTerms] = React.useState("");
  const [importingFile, setImportingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedNewClientId, setSelectedNewClientId] = React.useState<string[]>([]);

  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // React.useEffect(() => {
  //   const authToken = localStorage.getItem('auth_token');
  //   if (!authToken) {
  //     onOpen();
  //   } else {
  //     setIsAuthenticated(true);
  //   }
  // }, [onOpen]);

  const handleTogglePayment = async (billId: string) => {
    try {
      await client.mutate({
        mutation: TOGGLE_BILL_PAYMENT_STATUS,
        variables: { id: billId },
        refetchQueries: [{ query: GET_BILL, variables: { id: billId } }]
      });

      toast({
        title: `Bill marked as ${data?.bill.isPaid ? "unpaid" : "paid"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error toggling payment status:", error);
      toast({
        title: "Error updating payment status",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateBillStatus({
        variables: { 
          id: data?.bill.id,
          status: newStatus
        },
        refetchQueries: [{ query: GET_BILL, variables: { id: data?.bill.id } }]
      });

      toast({
        title: `Bill marked as ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating bill status:", error);
      toast({
        title: "Error updating bill status",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePaymentMethods = async (acceptCard: boolean, acceptCrypto: boolean) => {
    try {
      await updateBillPaymentMethods({
        variables: {
          id: data.bill.id,
          input: {
            acceptCardPayment: acceptCard,
            acceptCryptoPayment: acceptCrypto,
            projectId: data.bill.projectId,
            isPaid: data.bill.isPaid,
            currency: data.bill.currency || "AUD"
          }
        },
        refetchQueries: [{ query: GET_BILL, variables: { id: data.bill.id } }]
      });

      toast({
        title: "Payment methods updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating payment methods:", error);
      toast({
        title: "Error updating payment methods",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDuplicateBill = async () => {
    try {
      const paymentTermsText = duplicatePaymentTerms || `${duplicatePercentage}% upfront payment`;

      const { data: duplicateData } = await duplicateBillWithPercentage({
        variables: {
          id: data.bill.id,
          percentage: duplicatePercentage,
          paymentTerms: paymentTermsText
        }
      });

      toast({
        title: "Bill duplicated successfully",
        description: `Created ${duplicatePercentage}% partial bill`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      closeDuplicateModal();

      // Navigate to the new bill
      navigate(`/bill/${duplicateData.duplicateBillWithPercentage.id}`);
    } catch (error) {
      console.error("Error duplicating bill:", error);
      toast({
        title: "Error duplicating bill",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChangeClient = async () => {
    if (selectedNewClientId.length === 0) {
      toast({
        title: "No client selected",
        description: "Please select a client to change to",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await changeBillClient({
        variables: {
          billId: id,
          newClientId: selectedNewClientId[0]
        }
      });

      toast({
        title: "Client changed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refetch client data
      await client.refetchQueries({
        include: [GET_CLIENT_BY_BILL]
      });

      closeChangeClientModal();
      setSelectedNewClientId([]);
    } catch (error) {
      console.error("Error changing client:", error);
      toast({
        title: "Error changing client",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendBill = async () => {
    try {
      await updateBillStatus({
        variables: {
          id: data.bill.id,
          status: BillStatus.SENT
        },
        refetchQueries: [{ query: GET_BILL, variables: { id: data.bill.id } }]
      });

      toast({
        title: "Bill sent successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error sending bill",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = <BillPDF bill={bill} clientData={clientData} issuerData={issuerData} />;
      const pdfBlob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${getDisplayBillId(bill.id)}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePreviewPDF = () => {
    navigate(`/bill/${id}/preview`);
  };

  // Show loading while data is loading
  if (loading || authLoading) {
    return (
      <>
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6}>
            <Skeleton height="60px" width="100%" />
            <Skeleton height="200px" width="100%" />
            <Skeleton height="300px" width="100%" />
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            Error loading bill details: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  const bill = data?.bill;

  console.log('[RENDER CHECK 1] About to check if bill exists', { bill: !!bill });

  if (!bill) {
    console.log('[RENDER CHECK 2] Bill not found, showing error');
    return (
      <>
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
        <Container maxW="container.xl" py={8}>
          <Alert status="info">
            <AlertIcon />
            Bill not found
          </Alert>
        </Container>
      </>
    );
  }

  console.log('[RENDER CHECK 3] Bill found, preparing to render');
  console.log('[RENDER CHECK 4] isAuthenticated:', isAuthenticated);
  console.log('[RENDER CHECK 5] user:', user);
  console.log('[RENDER CHECK 6] isAdmin:', isAdmin);

  const formatDate = (dateString: string | { $date: string }) => {
    const date = dateString instanceof Object ? dateString.$date : dateString;
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return "0.00";
    }
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a .md (markdown) file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setImportingFile(true);

    try {
      // Read file content
      const markdown = await file.text();

      // Call mutation
      await importLineItemsFromMarkdown({
        variables: {
          billId: id,
          markdown
        },
        refetchQueries: [{ query: GET_BILL, variables: { id } }]
      });

      toast({
        title: 'Line items imported',
        description: `Successfully imported line items from ${file.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      closeImportModal();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import line items',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setImportingFile(false);
    }
  };

  console.log('[RENDER CHECK 7] About to return main component');

  return (
    <Box minH="100vh" bg={bg}>
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
      {/* {!isAuthenticated ? (
        <>
          <Container maxW="container.xl" py={8}>
            <Alert status="warning">
              <AlertIcon />
              Please log in to view bill details
            </Alert>
          </Container>
          <LoginModal 
            isOpen={isOpen} 
            onClose={() => {
              onClose();
              const authToken = localStorage.getItem('auth_token');
              if (authToken) {
                setIsAuthenticated(true);
              }
            }} 
          />
        </>
      ) : ( */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Card
            bg={cardGradientBg}
            borderColor={cardBorder}
            borderWidth="1px"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            backdropFilter="blur(10px)">
            <CardHeader>
              <VStack spacing={4} width="100%">
                <HStack justify="space-between" width="100%">
                  <VStack align="start" spacing={2}>
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Bill Details</Heading>
                    <Text color={textMuted} fontSize={{ base: "sm", md: "md" }}>Invoice ID: {getDisplayBillId(bill.id)}</Text>
                  </VStack>
                  <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                    {(bill.status === BillStatus.DRAFT || bill.status === BillStatus.PROPOSAL) && isAdmin && (
                      <Button
                        colorScheme="blue"
                        size={{ base: "sm", md: "md" }}
                        onClick={() => {
                          setDuplicatePaymentTerms(`${duplicatePercentage}% upfront payment`);
                          openDuplicateModal();
                        }}
                      >
                        Duplicate (Partial)
                      </Button>
                    )}
                    <Button
                      colorScheme="purple"
                      size={{ base: "sm", md: "md" }}
                      onClick={handlePreviewPDF}
                      leftIcon={<ViewIcon />}
                    >
                      Preview PDF
                    </Button>
                    <Button
                      colorScheme="green"
                      size={{ base: "sm", md: "md" }}
                      onClick={handleDownloadPDF}
                      leftIcon={<DownloadIcon />}
                    >
                      Download PDF
                    </Button>
                    {isAdmin && (
                      <Button
                        colorScheme="blue"
                        size={{ base: "sm", md: "md" }}
                        onClick={handleSendBill}
                        isDisabled={bill.status === BillStatus.SENT}
                      >
                        Send Bill
                      </Button>
                    )}
                    <Badge
                      fontSize={{ base: "md", md: "lg" }}
                      colorScheme={bill.status === BillStatus.SENT ? "blue" : "gray"}
                      p={2}
                      borderRadius="md"
                    >
                      {bill.status}
                    </Badge>
                  </HStack>
                </HStack>

                <Card p={6} width="100%" bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px" borderRadius="lg">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <VStack align="start" spacing={4}>
                      <VStack spacing={4} align="stretch">
                        <Tooltip 
                          label="Toggle the payment status of this bill. Use this when payment has been received or to mark as unpaid." 
                          placement="top"
                          hasArrow
                        >
                          <HStack justify="flex-start" spacing={4} flexWrap="wrap">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textPrimary}>Payment Status:</Text>
                            <Switch
                              size="lg"
                              isChecked={bill.isPaid}
                              onChange={() => handleTogglePayment(bill.id)}
                              colorScheme="green"
                              sx={{
                                "span.chakra-switch__track": {
                                  w: "4rem",
                                  h: "2rem",
                                },
                                "span.chakra-switch__thumb": {
                                  w: "1.75rem",
                                  h: "1.75rem",
                                }
                              }}
                            />
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={bill.isPaid ? statusSuccess : textMuted}>
                              {bill.isPaid ? "PAID" : "UNPAID"}
                            </Text>
                          </HStack>
                        </Tooltip>

                        <Divider />

                        <VStack align="stretch" spacing={2}>
                          <HStack justify="flex-start" spacing={4} flexWrap="wrap" align="center">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textPrimary}>Bill Status:</Text>
                            {isAdmin ? (
                              <Select
                                value={bill.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                width="200px"
                                size="lg"
                                bg={
                                  colorMode === 'light'
                                    ? (bill.status === BillStatus.PROPOSAL ? "purple.50" :
                                       bill.status === BillStatus.DRAFT ? "orange.50" : "blue.50")
                                    : (bill.status === BillStatus.PROPOSAL ? "purple.900" :
                                       bill.status === BillStatus.DRAFT ? "orange.900" : "blue.900")
                                }
                                borderColor={
                                  bill.status === BillStatus.PROPOSAL ? "purple.500" :
                                  bill.status === BillStatus.DRAFT ? "orange.500" : "blue.500"
                                }
                                fontWeight="bold"
                                _hover={{
                                  borderColor: "gray.400"
                                }}
                              >
                                <option value={BillStatus.PROPOSAL}>PROPOSAL</option>
                                <option value={BillStatus.DRAFT}>DRAFT</option>
                                <option value={BillStatus.SENT}>SENT</option>
                              </Select>
                            ) : (
                              <Badge
                                colorScheme={
                                  bill.status === BillStatus.PROPOSAL ? "purple" :
                                  bill.status === BillStatus.DRAFT ? "orange" : "blue"
                                }
                                fontSize="lg"
                                px={4}
                                py={2}
                              >
                                {bill.status}
                              </Badge>
                            )}
                            <Tooltip
                              label={
                                bill.status === BillStatus.PROPOSAL ? "This is a proposal/quote - not counted in billing metrics" :
                                bill.status === BillStatus.DRAFT ? "This bill is in draft status - not sent to client yet" :
                                "This bill has been marked as sent to the client"
                              }
                              hasArrow
                            >
                              <Badge
                                colorScheme={
                                  bill.status === BillStatus.PROPOSAL ? "purple" :
                                  bill.status === BillStatus.DRAFT ? "orange" : "blue"
                                }
                                fontSize="sm"
                                px={3}
                                py={1}
                              >
                                {bill.status === BillStatus.PROPOSAL ? "Quote - Not in metrics" :
                                 bill.status === BillStatus.DRAFT ? "Not sent" : "Sent to client"}
                              </Badge>
                            </Tooltip>
                          </HStack>
                          {bill.status === BillStatus.DRAFT && isAdmin && (
                            <Text fontSize="sm" color={textMuted} pl={2}>
                              💡 Use "Send Bill to Client" button below to email this bill
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    </VStack>
                  </SimpleGrid>
                </Card>
              </VStack>
            </CardHeader>

            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" mb={4} color={textPrimary}>Bill Information</Heading>
                  <Card variant="outline" bg={cardGradientBg} borderColor={cardBorder}>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Created Date</Text>
                          <Text color={textPrimary}>{formatDate(bill.createdAt)}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Last Updated</Text>
                          <Text color={textPrimary}>{formatDate(bill.updatedAt)}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Payment Method</Text>
                          <Text color={textPrimary}>{bill.paymentMethod || "Not specified"}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Total Amount</Text>
                          <Text color={textPrimary}>
                            ${(bill.totalAmount && bill.totalAmount > 0) ?
                              formatCurrency(bill.totalAmount) :
                              formatCurrency(bill.lineItems?.reduce((total: number, item: any) => total + Number(item.amount), 0) || 0)} {bill.currency || "AUD"}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Tenant ID</Text>
                          <Text color={textPrimary}>{bill.tenantId}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textSecondary}>Project ID</Text>
                          {bill.projectId ? (
                            <Text
                              color="blue.500"
                              textDecoration="underline"
                              cursor="pointer"
                              _hover={{ color: "blue.700" }}
                              onClick={() => window.open(`/project/${bill.projectId}`, '_blank')}
                            >
                              {bill.projectId}
                            </Text>
                          ) : (
                            <Text color={textPrimary}>Not associated with a project</Text>
                          )}
                        </Box>
                      </SimpleGrid>
                      
                      {/* Payment Method Toggles - Only visible for DRAFT bills */}
                      {bill.status === BillStatus.DRAFT && isAdmin && (
                        <>
                          <Divider my={4} borderColor={cardBorder} />
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" color={textPrimary} mb={3}>
                              Payment Methods Available to Customer
                            </Text>
                            <VStack align="stretch" spacing={3}>
                              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                <FormLabel htmlFor="card-payment-edit" mb="0" color={textSecondary}>
                                  Accept Card Payments (Stripe)
                                </FormLabel>
                                <Switch
                                  id="card-payment-edit"
                                  isChecked={bill.acceptCardPayment ?? true}
                                  onChange={(e) => handleUpdatePaymentMethods(e.target.checked, bill.acceptCryptoPayment ?? false)}
                                  colorScheme="blue"
                                />
                              </FormControl>

                              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                <FormLabel htmlFor="crypto-payment-edit" mb="0" color={textSecondary}>
                                  Accept Crypto Payments (Bitcoin)
                                </FormLabel>
                                <Switch
                                  id="crypto-payment-edit"
                                  isChecked={bill.acceptCryptoPayment ?? false}
                                  onChange={(e) => handleUpdatePaymentMethods(bill.acceptCardPayment ?? true, e.target.checked)}
                                  colorScheme="blue"
                                />
                              </FormControl>
                            </VStack>
                            <Text fontSize="xs" color={textMuted} mt={2}>
                              These options can only be changed while the bill is in DRAFT status
                            </Text>
                          </Box>
                        </>
                      )}

                      {/* Display payment methods for non-draft bills */}
                      {bill.status !== BillStatus.DRAFT && (
                        <Box mt={4}>
                          <Text fontSize="sm" fontWeight="bold" color={textPrimary} mb={2}>
                            Available Payment Methods:
                          </Text>
                          <HStack spacing={3}>
                            {(bill.acceptCardPayment ?? true) && (
                              <Badge colorScheme="blue">Card Payment</Badge>
                            )}
                            {bill.acceptCryptoPayment && (
                              <Badge colorScheme="orange">Crypto Payment</Badge>
                            )}
                            {!bill.acceptCardPayment && !bill.acceptCryptoPayment && (
                              <Text fontSize="sm" color={textMuted}>Bank Transfer Only</Text>
                            )}
                          </HStack>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                </Box>

                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md" color={textPrimary}>Client Information</Heading>
                    {isAdmin && (
                      <Button
                        size="sm"
                        leftIcon={<EditIcon />}
                        onClick={openChangeClientModal}
                        colorScheme="blue"
                        variant="outline"
                      >
                        Change Client
                      </Button>
                    )}
                  </HStack>
                  <Card variant="outline" bg={cardGradientBg} borderColor={cardBorder}>
                    <CardBody>
                      {clientLoading ? (
                        <Skeleton height="100px" />
                      ) : clientData?.client ? (
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontWeight="bold" color={textSecondary}>Name</Text>
                            <Text color={textPrimary}>{clientData.client.fName} {clientData.client.lName}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color={textSecondary}>Email</Text>
                            <Text color={textPrimary}>{clientData.client.email}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color={textSecondary}>Phone</Text>
                            <Text color={textPrimary}>{clientData.client.phoneNumber || "Not provided"}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color={textSecondary}>Business Name</Text>
                            <Text color={textPrimary}>{clientData.client.businessName || "Not provided"}</Text>
                          </Box>
                        </SimpleGrid>
                      ) : (
                        <Text color={textMuted}>No client information available</Text>
                      )}
                    </CardBody>
                  </Card>
                </Box>

                <Box>
                  <Heading size="md" mb={4} color={textPrimary}>Bill Issued By</Heading>
                  <Card variant="outline" bg={cardGradientBg} borderColor={cardBorder}>
                    <CardBody>
                      {(issuerLoading || tenantLoading) ? (
                        <Skeleton height="200px" />
                      ) : effectiveIssuerData ? (
                        <VStack spacing={6} align="stretch">
                          {/* Business Information */}
                          <Box>
                            <Text fontWeight="bold" fontSize="lg" mb={3} color={textPrimary}>Business Information</Text>
                            <SimpleGrid columns={2} spacing={4}>
                              <Box>
                                <Text fontWeight="bold" color={textSecondary}>Business Name</Text>
                                <Text color={textPrimary}>
                                  {brandConfig.contact.businessName || effectiveIssuerData.businessName || "Not provided"}
                                </Text>
                              </Box>
                              {effectiveIssuerData.businessRegistrationNumber && (
                                <Box>
                                  <Text fontWeight="bold" color={textSecondary}>Registration Number</Text>
                                  <Text color={textPrimary}>{effectiveIssuerData.businessRegistrationNumber}</Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="bold" color={textSecondary}>Contact Person</Text>
                                <Text color={textPrimary}>
                                  {brandConfig.contact.contactName || `${effectiveIssuerData.fName} ${effectiveIssuerData.lName}`}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" color={textSecondary}>Email</Text>
                                <Text color={textPrimary}>
                                  {brandConfig.contact.email || effectiveIssuerData.email}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" color={textSecondary}>Phone</Text>
                                <Text color={textPrimary}>
                                  {brandConfig.contact.phone || effectiveIssuerData.phoneNumber || "Not provided"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </Box>

                          {/* Payment Information - Hidden by default for cleaner UI */}
                          {false && effectiveIssuerData.paymentReceivingDetails && (
                            <Box>
                              <Text fontWeight="bold" fontSize="lg" mb={3} color={textPrimary}>Payment Information</Text>

                              {/* Bank Account Details */}
                              {effectiveIssuerData.paymentReceivingDetails.bankAccount && (
                                <Box p={4} bg={cardGradientBg} borderRadius="md" mb={4} border="1px" borderColor={cardBorder}>
                                  <Text fontWeight="bold" mb={2} color={textPrimary}>🏦 Bank Account Details</Text>
                                  <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                      <Text fontWeight="semibold" color={textSecondary}>Account Name</Text>
                                      <HStack>
                                        <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.bankAccount.accountName}</Text>
                                        <Button size="xs" onClick={() => navigator.clipboard.writeText(effectiveIssuerData.paymentReceivingDetails.bankAccount.accountName)}>
                                          Copy
                                        </Button>
                                      </HStack>
                                    </Box>
                                    <Box>
                                      <Text fontWeight="semibold" color={textSecondary}>BSB</Text>
                                      <HStack>
                                        <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.bankAccount.bsb}</Text>
                                        <Button size="xs" onClick={() => navigator.clipboard.writeText(effectiveIssuerData.paymentReceivingDetails.bankAccount.bsb)}>
                                          Copy
                                        </Button>
                                      </HStack>
                                    </Box>
                                    <Box>
                                      <Text fontWeight="semibold" color={textSecondary}>Account Number</Text>
                                      <HStack>
                                        <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.bankAccount.accountNumber}</Text>
                                        <Button size="xs" onClick={() => navigator.clipboard.writeText(effectiveIssuerData.paymentReceivingDetails.bankAccount.accountNumber)}>
                                          Copy
                                        </Button>
                                      </HStack>
                                    </Box>
                                    {effectiveIssuerData.paymentReceivingDetails.bankAccount.bankName && (
                                      <Box>
                                        <Text fontWeight="semibold" color={textSecondary}>Bank Name</Text>
                                        <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.bankAccount.bankName}</Text>
                                      </Box>
                                    )}
                                    {effectiveIssuerData.paymentReceivingDetails.bankAccount.swiftCode && (
                                      <Box>
                                        <Text fontWeight="semibold" color={textSecondary}>SWIFT Code</Text>
                                        <HStack>
                                          <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.bankAccount.swiftCode}</Text>
                                          <Button size="xs" onClick={() => navigator.clipboard.writeText(effectiveIssuerData.paymentReceivingDetails.bankAccount.swiftCode)}>
                                            Copy
                                          </Button>
                                        </HStack>
                                      </Box>
                                    )}
                                  </SimpleGrid>
                                </Box>
                              )}

                              {/* Crypto Wallets */}
                              {effectiveIssuerData.paymentReceivingDetails.cryptoWallets?.length > 0 && (
                                <Box p={4} bg={cardGradientBg} borderRadius="md" mb={4} border="1px" borderColor={cardBorder}>
                                  <Text fontWeight="bold" mb={2} color={textPrimary}>₿ Cryptocurrency Wallets</Text>
                                  <VStack spacing={3}>
                                    {effectiveIssuerData.paymentReceivingDetails.cryptoWallets.map((wallet: any, index: number) => (
                                      <Box key={index} p={3} bg={cardGradientBg} borderRadius="md" border="1px" borderColor={cardBorder} width="100%">
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                          <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Network</Text>
                                            <Badge colorScheme="purple">{wallet.network}</Badge>
                                          </Box>
                                          <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Wallet Address</Text>
                                            <HStack>
                                              <Text fontSize="sm" fontFamily="mono" color={textPrimary}>{wallet.walletAddress}</Text>
                                              <Button size="xs" onClick={() => navigator.clipboard.writeText(wallet.walletAddress)}>
                                                Copy
                                              </Button>
                                            </HStack>
                                          </Box>
                                          {wallet.memo && (
                                            <Box>
                                              <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Memo</Text>
                                              <Text fontSize="sm" color={textPrimary}>{wallet.memo}</Text>
                                            </Box>
                                          )}
                                        </SimpleGrid>
                                      </Box>
                                    ))}
                                  </VStack>
                                </Box>
                              )}

                              {/* PayPal */}
                              {effectiveIssuerData.paymentReceivingDetails.paypalEmail && (
                                <Box p={4} bg={cardGradientBg} borderRadius="md" mb={4} border="1px" borderColor={cardBorder}>
                                  <Text fontWeight="bold" mb={2} color={textPrimary}>💰 PayPal</Text>
                                  <HStack>
                                    <Text color={textPrimary}>{effectiveIssuerData.paymentReceivingDetails.paypalEmail}</Text>
                                    <Button size="xs" onClick={() => navigator.clipboard.writeText(effectiveIssuerData.paymentReceivingDetails.paypalEmail)}>
                                      Copy
                                    </Button>
                                  </HStack>
                                </Box>
                              )}

                              {/* Stripe Connect */}
                              {effectiveIssuerData.paymentReceivingDetails.stripeConnect && (
                                <Box p={4} bg={cardGradientBg} borderRadius="md" mb={4} border="1px" borderColor={cardBorder}>
                                  <Text fontWeight="bold" mb={2} color={textPrimary}>💳 Stripe Connect</Text>
                                  <HStack spacing={4}>
                                    <Badge colorScheme={effectiveIssuerData.paymentReceivingDetails.stripeConnect.accountVerified ? "green" : "yellow"}>
                                      {effectiveIssuerData.paymentReceivingDetails.stripeConnect.accountVerified ? "✅ Verified" : "⏳ Pending Verification"}
                                    </Badge>
                                    <Text fontSize="sm" color={textSecondary}>
                                      Available for credit card payments
                                    </Text>
                                  </HStack>
                                </Box>
                              )}

                              {/* Accepted Payment Methods */}
                              <Box>
                                <Text fontWeight="semibold" mb={2} color={textPrimary}>Accepted Payment Methods</Text>
                                <HStack spacing={2} flexWrap="wrap">
                                  {effectiveIssuerData.paymentReceivingDetails.acceptedMethods?.map((method: string) => (
                                    <Badge key={method} colorScheme="blue" variant="solid">
                                      {method === "BANK_TRANSFER" ? "🏦 Bank Transfer" :
                                        method === "CRYPTO" ? "₿ Cryptocurrency" :
                                          method === "STRIPE" ? "💳 Credit Cards" :
                                            method === "PAYPAL" ? "💰 PayPal" : method}
                                    </Badge>
                                  ))}
                                </HStack>
                              </Box>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <Text color={textMuted}>No issuer information available</Text>
                      )}
                    </CardBody>
                  </Card>
                </Box>

                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md" color={textPrimary}>Line Items</Heading>
                    {isAdmin && (
                      <HStack spacing={2}>
                        <Tooltip label="Delete all line items">
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<DeleteIcon />}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete all ${bill.lineItems?.length || 0} line items? This cannot be undone.`)) {
                                // Delete all line items one by one
                                const deletePromises = bill.lineItems?.map((item: any) =>
                                  deleteLineItem({
                                    variables: {
                                      billId: bill.id,
                                      lineItemId: item.id
                                    }
                                  })
                                );

                                Promise.all(deletePromises || [])
                                  .then(() => {
                                    toast({
                                      title: 'All line items deleted',
                                      status: 'success',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                    client.refetchQueries({
                                      include: [GET_BILL]
                                    });
                                  })
                                  .catch((error) => {
                                    toast({
                                      title: 'Error deleting line items',
                                      description: error.message,
                                      status: 'error',
                                      duration: 5000,
                                      isClosable: true,
                                    });
                                  });
                              }
                            }}
                            isDisabled={!bill.lineItems || bill.lineItems.length === 0}
                          >
                            Delete All
                          </Button>
                        </Tooltip>
                        <Tooltip label="Export line items to markdown file">
                          <Button
                            size="sm"
                            bg="rgba(168, 85, 247, 0.2)"
                            color="purple.400"
                            border="1px"
                            borderColor="rgba(168, 85, 247, 0.3)"
                            _hover={{
                              bg: "rgba(168, 85, 247, 0.3)",
                              borderColor: "purple.400"
                            }}
                            leftIcon={<DownloadIcon />}
                            onClick={() => {
                              // Generate markdown from bill line items
                              let markdown = `# ${bill.projectId?.projectName || 'Bill'}\n\n`;

                              markdown += `## Project Information\n`;
                              markdown += `**Project Name:** ${bill.projectId?.projectName || 'N/A'}\n`;
                              if (bill.projectId?.projectGoal) {
                                markdown += `**Project Goal:** ${bill.projectId.projectGoal}\n`;
                              }
                              if (bill.projectId?.projectDescription) {
                                markdown += `**Project Description:** ${bill.projectId.projectDescription}\n`;
                              }
                              markdown += `\n`;

                              markdown += `## Bill Information\n`;
                              markdown += `**Currency:** ${bill.currency || 'AUD'}\n`;
                              markdown += `**Payment Method:** ${bill.paymentMethod || 'AUD_TRANSFER'}\n`;
                              markdown += `**Status:** ${bill.status || 'PROPOSAL'}\n`;
                              markdown += `\n`;

                              markdown += `## Line Items\n\n`;
                              bill.lineItems?.forEach((item: any, index: number) => {
                                markdown += `### ${index + 1}. ${item.description}\n`;
                                markdown += `**Price:** $${item.amount.toFixed(2)}\n`;
                                markdown += `**Billable:** Yes\n`;
                                markdown += `**Status:** PENDING\n`;
                                markdown += `**Assignee:** Unassigned\n`;
                                markdown += `\n`;
                              });

                              markdown += `## Agreement\n\n`;
                              markdown += `[Add your agreement text here, or leave this section empty]\n`;

                              // Download file
                              const blob = new Blob([markdown], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              const fileName = `bill_${bill.id.substring(0, 8)}_line_items.md`;
                              link.download = fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);

                              toast({
                                title: 'Line items exported',
                                description: `Downloaded ${fileName}`,
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            Export (.md)
                          </Button>
                        </Tooltip>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileImport}
                          accept=".md"
                          style={{ display: 'none' }}
                        />
                        <Tooltip label="Import line items from markdown file">
                          <Button
                            size="sm"
                            bg="rgba(168, 85, 247, 0.2)"
                            color="purple.400"
                            border="1px"
                            borderColor="rgba(168, 85, 247, 0.3)"
                            _hover={{
                              bg: "rgba(168, 85, 247, 0.3)",
                              borderColor: "purple.400"
                            }}
                            leftIcon={<DownloadIcon transform="rotate(180deg)" />}
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={importingFile}
                          >
                            Import (.md)
                          </Button>
                        </Tooltip>
                        <Tooltip label="Download markdown format specification guide">
                          <Button
                            size="sm"
                            bg="rgba(168, 85, 247, 0.2)"
                            color="purple.400"
                            border="1px"
                            borderColor="rgba(168, 85, 247, 0.3)"
                            _hover={{
                              bg: "rgba(168, 85, 247, 0.3)",
                              borderColor: "purple.400"
                            }}
                            leftIcon={<ViewIcon />}
                            onClick={() => {
                              downloadMarkdownFile(FORMAT_SPEC_CONTENT, 'FORMAT_SPEC.md');
                              toast({
                                title: 'Format guide downloaded',
                                description: 'Downloaded FORMAT_SPEC.md',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            Format Guide
                          </Button>
                        </Tooltip>
                        <Tooltip label="Download blank markdown template">
                          <Button
                            size="sm"
                            bg="rgba(168, 85, 247, 0.2)"
                            color="purple.400"
                            border="1px"
                            borderColor="rgba(168, 85, 247, 0.3)"
                            _hover={{
                              bg: "rgba(168, 85, 247, 0.3)",
                              borderColor: "purple.400"
                            }}
                            leftIcon={<DownloadIcon />}
                            onClick={() => {
                              downloadMarkdownFile(BILL_TEMPLATE_CONTENT, 'bill_template.md');
                              toast({
                                title: 'Template downloaded',
                                description: 'Downloaded bill_template.md',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            Template
                          </Button>
                        </Tooltip>
                      </HStack>
                    )}
                  </HStack>
                  <Card variant="outline" bg={cardGradientBg} borderColor={cardBorder}>
                    <CardBody>
                      <Box overflowX="auto" width="100%">
                        <Table variant="simple" size={{ base: "sm", md: "md" }}>
                          <Thead>
                            <Tr>
                              <Th color={textSecondary}>Description</Th>
                              <Th isNumeric color={textSecondary}>Amount ({bill.currency || "AUD"})</Th>
                              <Th color={textSecondary}>{isAdmin ? "Actions" : ""}</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {bill.lineItems && bill.lineItems.map((item: any) => {
                              const isEditing = editingId === (item.id);

                              const handleEdit = () => {
                                console.log("Setting edit ID to:", item.id);
                                setEditingId(item.id);
                                setEditValues({
                                  description: item.description,
                                  amount: item.amount
                                });
                              };

                              const handleSave = async () => {
                                try {
                                  await updateLineItem({
                                    variables: {
                                      billId: bill.id,
                                      lineItemId: item.id,
                                      description: editValues.description,
                                      amount: parseFloat(editValues.amount.toString())
                                    },
                                    refetchQueries: [{ query: GET_BILL, variables: { id: bill.id } }]
                                  });

                                  setEditingId(null);
                                  toast({
                                    title: "Line item updated",
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true,
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error updating line item",
                                    description: error instanceof Error ? error.message : "Unknown error occurred",
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                  });
                                }
                              };

                              const handleDelete = async () => {
                                if (!window.confirm('Are you sure you want to delete this line item?')) {
                                  return;
                                }

                                try {
                                  await deleteLineItem({
                                    variables: {
                                      billId: bill.id,
                                      lineItemId: item.id
                                    },
                                    refetchQueries: [{ query: GET_BILL, variables: { id: bill.id } }]
                                  });

                                  toast({
                                    title: "Line item deleted",
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true,
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error deleting line item",
                                    description: error instanceof Error ? error.message : "Unknown error occurred",
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                  });
                                }
                              };

                              return (
                                <Tr key={item.id}>
                                  <Td maxW={{ base: "150px", md: "300px" }} overflow="hidden" textOverflow="ellipsis">
                                    {isEditing ? (
                                      <Input
                                        value={editValues.description}
                                        onChange={(e) => setEditValues(prev => ({
                                          ...prev,
                                          description: e.target.value
                                        }))}
                                        size={{ base: "sm", md: "md" }}
                                        bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                        color={textPrimary}
                                        borderColor={cardBorder}
                                        _focus={{
                                          borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                          boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                        }}
                                      />
                                    ) : (
                                      <Text color={textPrimary}>{item.description}</Text>
                                    )}
                                  </Td>
                                  <Td isNumeric>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        value={editValues.amount}
                                        onChange={(e) => setEditValues(prev => ({
                                          ...prev,
                                          amount: parseFloat(e.target.value)
                                        }))}
                                        textAlign="right"
                                        size={{ base: "sm", md: "md" }}
                                        bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                        color={textPrimary}
                                        borderColor={cardBorder}
                                        _focus={{
                                          borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                          boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                        }}
                                      />
                                    ) : (
                                      <Text color={textPrimary}>${formatCurrency(Number(item.amount))}</Text>
                                    )}
                                  </Td>
                                  <Td>
                                    {isAdmin ? (
                                      <HStack spacing={2}>
                                        {isEditing ? (
                                          <>
                                            <Button
                                              size="sm"
                                              colorScheme="green"
                                              onClick={handleSave}
                                              px={{ base: 2, md: 4 }}
                                            >
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => setEditingId(null)}
                                              px={{ base: 2, md: 4 }}
                                            >
                                              Cancel
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <IconButton
                                              aria-label="Edit line item"
                                              icon={<EditIcon />}
                                              size="sm"
                                              colorScheme="blue"
                                              onClick={handleEdit}
                                            />
                                            <IconButton
                                              aria-label="Delete line item"
                                              icon={<DeleteIcon />}
                                              size="sm"
                                              colorScheme="red"
                                              onClick={handleDelete}
                                            />
                                          </>
                                        )}
                                      </HStack>
                                    ) : (
                                      <Text color={textMuted} fontSize="sm">-</Text>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>

                        {/* Total Summary with GST Breakdown */}
                        <VStack align="stretch" mt={6} bg={cardGradientBg} p={4} borderRadius="md" border="1px" borderColor={cardBorder} spacing={2}>
                          {/* Subtotal */}
                          <HStack justify="space-between">
                            <Text fontSize="md" color={textSecondary}>Subtotal:</Text>
                            <Text fontSize="md" color={textPrimary}>
                              ${bill.subtotal !== undefined ? formatCurrency(bill.subtotal) : formatCurrency(bill.lineItems?.reduce((total: number, item: any) => total + Number(item.amount), 0) || 0)} {bill.currency || "AUD"}
                            </Text>
                          </HStack>

                          {/* GST/Tax */}
                          {bill.taxPercentage !== undefined && bill.taxPercentage > 0 && (
                            <HStack justify="space-between">
                              <Text fontSize="md" color={textSecondary}>GST ({bill.taxPercentage}%):</Text>
                              <Text fontSize="md" color={textPrimary}>
                                ${bill.taxAmount !== undefined ? formatCurrency(bill.taxAmount) : '0.00'} {bill.currency || "AUD"}
                              </Text>
                            </HStack>
                          )}

                          {/* Divider */}
                          <Divider />

                          {/* Total */}
                          <HStack justify="space-between">
                            <Text fontWeight="bold" fontSize="lg" color={textPrimary}>Total:</Text>
                            <Text fontWeight="bold" fontSize="lg" color={textPrimary}>
                              ${(bill.totalAmount && bill.totalAmount > 0) ?
                                formatCurrency(bill.totalAmount) :
                                formatCurrency(bill.lineItems?.reduce((total: number, item: any) => total + Number(item.amount), 0) || 0)} {bill.currency || "AUD"}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </CardBody>
                  </Card>
                </Box>

                {/* Payment Options - Placed after all bill details */}
                {!bill.isPaid && (
                  <Box>
                    <Card
                      variant="outline"
                      borderColor="blue.500"
                      borderWidth="2px"
                      bg={cardGradientBg}
                      boxShadow="0 4px 20px 0 rgba(59, 130, 246, 0.15)"
                    >
                      <CardBody>
                        <PaymentMethodSelector
                          billId={bill.id}
                          amount={
                            (bill.totalAmount && bill.totalAmount > 0)
                              ? bill.totalAmount
                              : (bill.lineItems?.reduce((total: number, item: any) => total + Number(item.amount), 0) || 0)
                          }
                          acceptCardPayment={bill.acceptCardPayment ?? true}
                          acceptCryptoPayment={bill.acceptCryptoPayment ?? false}
                          issuerBankDetails={
                            effectiveIssuerData?.paymentReceivingDetails?.bankAccount
                          }
                          issuerWalletAddress={
                            effectiveIssuerData?.paymentReceivingDetails?.cryptoWallets?.find(
                              (wallet: any) => wallet.network === "BTC"
                            )?.walletAddress
                          }
                          cryptoDiscountPercentage={
                            effectiveIssuerData?.paymentReceivingDetails?.cryptoDiscountPercentage
                          }
                          onPaymentComplete={() => {
                            console.log('[BillDetails] Payment completed, refreshing bill data');
                            // Refresh the bill data to update payment status
                            client.refetchQueries({
                              include: [GET_BILL],
                            });
                            toast({
                              title: "Payment Successful",
                              description: "Your payment has been processed successfully.",
                              status: "success",
                              duration: 5000,
                              isClosable: true,
                            });
                          }}
                        />
                      </CardBody>
                    </Card>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      {/* )} */}
      
      {/* Duplicate Bill Modal */}
      <Modal isOpen={isDuplicateModalOpen} onClose={closeDuplicateModal} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textPrimary}>Create Partial Bill</ModalHeader>
          <ModalCloseButton color={textPrimary} />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <FormLabel color={textPrimary} mb={3}>
                  Percentage of Total
                </FormLabel>
                <HStack spacing={4} align="start">
                  <Box flex={1}>
                    <Slider
                      value={duplicatePercentage > 10 ? duplicatePercentage : 10}
                      onChange={setDuplicatePercentage}
                      min={10}
                      max={100}
                      step={1}
                      colorScheme="blue"
                    >
                      <SliderTrack bg="gray.600">
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color={textMuted}>10%</Text>
                      <Text fontSize="sm" color={textMuted}>50%</Text>
                      <Text fontSize="sm" color={textMuted}>100%</Text>
                    </HStack>
                    <Text fontSize="xs" color={textMuted} mt={1}>
                      Use slider for rough percentages (10-100%), or type exact decimal in the input →
                    </Text>
                  </Box>
                  <Box width="140px">
                    <InputGroup size="md">
                      <Input
                        type="number"
                        value={duplicatePercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0.01 && val <= 100) {
                            setDuplicatePercentage(val);
                          }
                        }}
                        min={0.01}
                        max={100}
                        step="any"
                        bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                        borderColor={cardBorder}
                        color={textPrimary}
                        textAlign="right"
                      />
                      <InputRightAddon bg={colorMode === 'light' ? "gray.100" : "gray.700"} color={textPrimary}>
                        %
                      </InputRightAddon>
                    </InputGroup>
                    <Text fontSize="xs" color={textMuted} mt={1} textAlign="center">
                      Any % (e.g., 11.90688813)
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <Box>
                <FormLabel color={textPrimary}>Payment Terms (Optional)</FormLabel>
                <Textarea
                  placeholder={`${duplicatePercentage}% upfront payment`}
                  value={duplicatePaymentTerms}
                  onChange={(e) => setDuplicatePaymentTerms(e.target.value)}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                  }}
                  rows={2}
                />
              </Box>

              <Box p={4} bg={colorMode === 'light' ? "gray.50" : "rgba(0, 0, 0, 0.3)"} borderRadius="md">
                <Text color={textPrimary} fontWeight="bold" mb={3}>
                  New Bill Preview:
                </Text>
                <VStack align="stretch" spacing={2}>
                  {bill?.lineItems?.map((item: any, index: number) => (
                    <HStack key={index} justify="space-between">
                      <Text color={textSecondary} fontSize="sm" noOfLines={1}>
                        {item.description}
                      </Text>
                      <Text color={textPrimary} fontWeight="bold">
                        ${formatCurrency((item.amount * duplicatePercentage) / 100)}
                      </Text>
                    </HStack>
                  ))}
                  <Divider borderColor={cardBorder} />
                  <HStack justify="space-between">
                    <Text color={textPrimary} fontWeight="bold">Total:</Text>
                    <Text color={textPrimary} fontWeight="bold" fontSize="lg">
                      ${(() => {
                        // Calculate total from line items if totalAmount is not available
                        const originalTotal = bill?.totalAmount && bill.totalAmount > 0
                          ? bill.totalAmount
                          : bill?.lineItems?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;
                        return formatCurrency(originalTotal * duplicatePercentage / 100);
                      })()} {bill?.currency || 'AUD'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeDuplicateModal} color={textPrimary}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleDuplicateBill}>
              Create {duplicatePercentage}% Bill
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Client Modal */}
      <Modal isOpen={isChangeClientModalOpen} onClose={closeChangeClientModal} size="xl">
        <ModalOverlay />
        <ModalContent bg={bg} color={textPrimary}>
          <ModalHeader>Change Bill Client</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color={textSecondary}>
                Select a new client for this bill. This will update the billing information.
              </Text>

              {clientData?.getClientDetailsByBillId && (
                <Box p={4} borderRadius="md" bg={colorMode === 'dark' ? 'rgba(30, 30, 35, 0.8)' : 'gray.50'}>
                  <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={2}>
                    Current Client:
                  </Text>
                  <Text color={textPrimary}>
                    {clientData.getClientDetailsByBillId.fName} {clientData.getClientDetailsByBillId.lName}
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    {clientData.getClientDetailsByBillId.email}
                  </Text>
                </Box>
              )}

              <Divider />

              <Box>
                <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                  Select New Client:
                </Text>
                <ClientSearchSelector
                  selectedClients={selectedNewClientId}
                  onSelectionChange={setSelectedNewClientId}
                  allowMultiple={false}
                  placeholder="Search for a client..."
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeChangeClientModal} color={textPrimary}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleChangeClient}
              isDisabled={selectedNewClientId.length === 0}
            >
              Change Client
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};

export default BillDetails; 