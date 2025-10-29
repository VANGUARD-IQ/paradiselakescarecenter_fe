import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
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
    useToast,
    Button,
    Center,
    Spinner,
    useDisclosure,
} from "@chakra-ui/react";
import { ArrowBackIcon, DownloadIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { useAuth } from "../../contexts/AuthContext";
import { pdf } from '@react-pdf/renderer';
import { BillPDF } from './components/BillPDF';
import { LoginWithSmsModal } from "../authentication";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

// Authenticated queries
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
      issuedBy
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      totalAmount
      tenantId
      createdAt
      updatedAt
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

// Public queries (no authentication required)
const PUBLIC_GET_BILL = gql`
  query PublicGetBillById($id: ID!) {
    publicBill(id: $id) {
      id
      isPaid
      status
      paymentMethod
      currency
      acceptCardPayment
      acceptCryptoPayment
      projectId
      issuedBy
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      totalAmount
      tenantId
      createdAt
      updatedAt
    }
  }
`;

const PUBLIC_GET_CLIENT_BY_BILL = gql`
  query PublicGetClientDetailsByBillId($billId: ID!) {
    publicGetClientDetailsByBillId(billId: $billId) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const PUBLIC_GET_BILL_ISSUER = gql`
  query PublicGetBillIssuerDetails($billId: ID!) {
    publicGetBillIssuerDetails(billId: $billId) {
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

const BillPDFPreview = () => {
    usePageTitle("Bill PDF Preview");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const toast = useToast();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [pdfHeight, setPdfHeight] = useState<number>(800); // Default height
    const { isOpen: isLoginModalOpen, onOpen: openLoginModal, onClose: closeLoginModal } = useDisclosure();

    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = `linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(20, 20, 20, 0.8) 100%)`;
    const cardBorder = "rgba(255, 255, 255, 0.1)";
    const textPrimary = brandConfig.colors.text.inverse || "#FFFFFF";
    const textSecondary = brandConfig.colors.text.secondaryDark || "#B0B0B0";
    const textMuted = brandConfig.colors.text.mutedDark || "#888888";

    // Rule: Display only the first 4 digits of the MongoDB ID for invoice ID
    const getDisplayBillId = (fullId: string) => {
        return fullId.substring(0, 4);
    };

    // Use public queries when not authenticated, authenticated queries otherwise
    const billQuery = isAuthenticated ? GET_BILL : PUBLIC_GET_BILL;
    const clientQuery = isAuthenticated ? GET_CLIENT_BY_BILL : PUBLIC_GET_CLIENT_BY_BILL;
    const issuerQuery = isAuthenticated ? GET_BILL_ISSUER : PUBLIC_GET_BILL_ISSUER;

    console.log('🔍 BillPDFPreview Debug:', {
        isAuthenticated,
        user,
        billId: id,
        usingPublicQuery: !isAuthenticated,
        queryName: isAuthenticated ? 'Authenticated queries' : 'Public queries'
    });

    const { loading, error, data } = useQuery(billQuery, {
        variables: { id },
        onCompleted: (data) => {
            console.log('✅ Bill query completed:', {
                hasData: !!data,
                billData: data?.bill || data?.publicBill,
                dataKeys: Object.keys(data || {})
            });
        },
        onError: (err) => {
            console.error('❌ Bill query error:', err);
        }
    });

    const { data: clientData, loading: clientLoading } = useQuery(clientQuery, {
        variables: { billId: id },
        onCompleted: (data) => {
            console.log('✅ Client query completed:', data);
        },
        onError: (err) => {
            console.error('❌ Client query error:', err);
        }
    });

    const { data: issuerData, loading: issuerLoading } = useQuery(issuerQuery, {
        variables: { billId: id },
        onCompleted: (data) => {
            console.log('✅ Issuer query completed:', data);
        },
        onError: (err) => {
            console.error('❌ Issuer query error:', err);
        }
    });

    // Generate PDF when data is loaded
    useEffect(() => {
        const generatePDF = async () => {
            // Get bill data from either authenticated or public query
            const billData = data?.bill || data?.publicBill;
            if (billData && !loading && !clientLoading && !issuerLoading) {
                try {
                    setIsGenerating(true);
                    const doc = <BillPDF bill={billData} clientData={clientData} issuerData={issuerData} />;

                    // Generate PDF and get document info
                    const pdfDoc = pdf(doc);
                    const pdfBlob = await pdfDoc.toBlob();

                    // Calculate the height needed for the PDF
                    // A4 page is 794 points wide and 1123 points tall at 72 DPI
                    // Convert to pixels: 1123 points = ~1500px height per page
                    // For our single-page bill, we'll calculate based on content
                    const estimatedHeight = calculatePDFHeight(billData);
                    setPdfHeight(estimatedHeight);

                    const url = URL.createObjectURL(pdfBlob);
                    setPdfUrl(url);
                } catch (error) {
                    toast({
                        title: "Error generating PDF preview",
                        description: error instanceof Error ? error.message : "Unknown error occurred",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                } finally {
                    setIsGenerating(false);
                }
            }
        };

        generatePDF();

        // Cleanup function
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [data, clientData, issuerData, loading, clientLoading, issuerLoading, toast]);

    // Calculate estimated PDF height based on content
    const calculatePDFHeight = (bill: any) => {
        let height = 200; // Header section

        // Bill info sections
        height += 200; // From/To information

        // Line items - approximately 40px per item + header
        const lineItemsCount = bill.lineItems?.length || 0;
        height += 60 + (lineItemsCount * 45); // Header + rows

        // Total and payment info
        height += 100;

        // Payment details section (if available)
        if (issuerData?.getBillIssuerDetails?.paymentReceivingDetails) {
            const paymentDetails = issuerData.getBillIssuerDetails.paymentReceivingDetails;

            // Add height for bank account details
            if (paymentDetails.bankAccount) {
                height += 120;
            }

            // Add height for crypto wallets
            if (paymentDetails.cryptoWallets?.length > 0) {
                height += 80 + (paymentDetails.cryptoWallets.length * 60);
            }

            // Add height for other payment methods
            if (paymentDetails.paypalEmail || paymentDetails.stripeConnect) {
                height += 100;
            }

            // Base payment info section
            height += 80;
        }

        // Footer and padding
        height += 100;

        // Add some extra padding to avoid any cutting off
        height += 50;

        // Minimum height
        return Math.max(height, 600);
    };

    const handleDownloadPDF = async () => {
        const billData = data?.bill || data?.publicBill;
        if (!billData) return;

        try {
            const doc = <BillPDF bill={billData} clientData={clientData} issuerData={issuerData} />;
            const pdfBlob = await pdf(doc).toBlob();

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice_${getDisplayBillId(billData.id)}_${new Date().toISOString().split('T')[0]}.pdf`;
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
                title: "Error downloading PDF",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleBackToDetails = () => {
        if (isAuthenticated) {
            navigate(`/bill/${id}`);
        } else {
            openLoginModal();
        }
    };

    const handleLoginSuccess = () => {
        closeLoginModal();
        navigate(`/bill/${id}`);
    };

    if (loading || clientLoading || issuerLoading) {
        return (
            <>
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
                <Container maxW="container.xl" py={8}>
                    <VStack spacing={6}>
                        <Skeleton height="60px" width="100%" />
                        <Skeleton height="200px" width="100%" />
                        <Skeleton height="100%" width="100%" />
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
                        Error loading bill: {error.message}
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </>
        );
    }

    const bill = data?.bill || data?.publicBill;
    if (!bill) {
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
                <FooterWithFourColumns />
            </>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
            <Container maxW="container.xl" py={8}>
                <VStack spacing={6} align="stretch">
                    <Box
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        borderRadius="lg"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden"
                    >
                        <Box p={6} borderBottom="1px solid" borderColor={cardBorder}>
                            <VStack spacing={4} width="100%">
                                <HStack justify="space-between" width="100%">
                                    <VStack align="start" spacing={2}>
                                        <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>📄 Bill PDF Preview</Heading>
                                        <Text color={textMuted} fontSize={{ base: "sm", md: "md" }}>
                                            Invoice ID: {getDisplayBillId(bill.id)}
                                        </Text>
                                    </VStack>
                                    <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                                        <Button
                                            size={{ base: "sm", md: "md" }}
                                            onClick={handleBackToDetails}
                                            leftIcon={<ArrowBackIcon />}
                                            bg="rgba(255, 255, 255, 0.1)"
                                            color={textPrimary}
                                            borderWidth="1px"
                                            borderColor="rgba(255, 255, 255, 0.2)"
                                            _hover={{
                                                bg: "rgba(255, 255, 255, 0.15)",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
                                            }}
                                        >
                                            Back to Details
                                        </Button>
                                        <Button
                                            size={{ base: "sm", md: "md" }}
                                            onClick={handleDownloadPDF}
                                            leftIcon={<DownloadIcon />}
                                            bg="white"
                                            color="black"
                                            _hover={{
                                                bg: "gray.100",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 8px 30px rgba(54, 158, 255, 0.25)"
                                            }}
                                        >
                                            Download PDF
                                        </Button>
                                        <Badge
                                            fontSize={{ base: "md", md: "lg" }}
                                            p={2}
                                            borderRadius="md"
                                            bg={bill.status === "SENT" ? "rgba(54, 158, 255, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                                            color={bill.status === "SENT" ? "#369EFF" : "#6B7280"}
                                            border="1px solid"
                                            borderColor={bill.status === "SENT" ? "rgba(54, 158, 255, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                                        >
                                            {bill.status}
                                        </Badge>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </Box>

                        <Box p={6}>
                            <Box>
                                {isGenerating ? (
                                    <Center h={`${pdfHeight}px`}>
                                        <VStack spacing={4}>
                                            <Spinner size="xl" color={getColor("primary")} thickness="4px" />
                                            <Text color={textPrimary}>Generating PDF preview...</Text>
                                        </VStack>
                                    </Center>
                                ) : pdfUrl ? (
                                    <Box
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        borderRadius="md"
                                        overflow="hidden"
                                        bg="rgba(255, 255, 255, 0.95)"
                                        boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                                    >
                                        <iframe
                                            src={pdfUrl}
                                            width="100%"
                                            height={`${pdfHeight}px`}
                                            title="Bill PDF Preview"
                                            style={{ border: 'none' }}
                                        />
                                    </Box>
                                ) : (
                                    <Center h={`${pdfHeight}px`}>
                                        <Alert status="error">
                                            <AlertIcon />
                                            Failed to generate PDF preview
                                        </Alert>
                                    </Center>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </VStack>
            </Container>
            <FooterWithFourColumns />
            <LoginWithSmsModal 
                isOpen={isLoginModalOpen} 
                onClose={closeLoginModal} 
                onLoginSuccess={handleLoginSuccess}
            />
        </Box>
    );
};

export default BillPDFPreview; 