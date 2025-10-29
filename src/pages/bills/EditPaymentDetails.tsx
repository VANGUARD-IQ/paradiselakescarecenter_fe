import React from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Card,
    CardHeader,
    CardBody,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    Alert,
    AlertIcon,
    Spinner,
    Center,
    Checkbox,
    IconButton,
    SimpleGrid,
    Badge,
    Divider,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, CheckIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

const GET_CURRENT_TENANT = gql`
    query GetCurrentTenant {
        currentTenant {
            id
            name
            companyDetails {
                companyName
                taxId
                billingEmail
                billingPhone
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

const UPDATE_TENANT_PAYMENT_DETAILS = gql`
    mutation UpdateTenantPaymentDetails($paymentDetails: PaymentReceivingDetailsInput!) {
        updateTenantPaymentDetails(paymentDetails: $paymentDetails) {
            id
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

const UPDATE_TENANT_COMPANY_DETAILS = gql`
    mutation UpdateTenantCompanyDetails($companyDetails: TenantCompanyDetailsInput!) {
        updateTenantCompanyDetails(companyDetails: $companyDetails) {
            id
            companyDetails {
                companyName
                taxId
                billingEmail
                billingPhone
            }
        }
    }
`;

const GET_TENANT = gql`
    query GetTenant($id: ID!) {
        tenant(id: $id) {
            id
            name
            domain
            websiteUrl
            apiKeys {
                stripePublicKey
                stripeSecretKey
                stripeWebhookSecret
            }
            branding {
                siteName
            }
        }
    }
`;

const UPDATE_TENANT = gql`
    mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
        updateTenant(id: $id, input: $input) {
            id
            apiKeys {
                stripePublicKey
                stripeSecretKey
                stripeWebhookSecret
            }
        }
    }
`;

const EditPaymentDetails = () => {
    usePageTitle("Edit Payment Details");
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const bg = getColor("background.main");
    
    // Consistent styling from brandConfig for dark theme
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");
    const textInverse = getColor("text.inverse");
    const primaryColor = getColor("primary");

    const [tenantFormData, setTenantFormData] = React.useState({
        apiKeys: {
            stripePublicKey: "",
            stripeSecretKey: "",
            stripeWebhookSecret: "",
        },
        branding: {
            siteName: "",
        },
        domain: "",
        websiteUrl: "",
    });

    const [formData, setFormData] = React.useState({
        businessName: "",
        businessRegistrationNumber: "",
        paymentReceivingDetails: {
            acceptedMethods: [] as string[],
            bankAccount: {
                accountName: "",
                bsb: "",
                accountNumber: "",
                bankName: "",
                swiftCode: "",
            },
            cryptoWallets: [] as Array<{
                walletAddress: string;
                network: string;
                memo: string;
            }>,
            stripeConnect: {
                stripeAccountId: "",
                accountVerified: false,
                verifiedAt: null,
            },
            paypalEmail: "",
            isVerified: false,
            cryptoDiscountPercentage: undefined as number | undefined,
        },
    });


    // Fetch the current site tenant (not the user's owned tenant)
    const { data: tenantData, refetch: refetchTenant } = useQuery(GET_TENANT, {
        variables: { id: brandConfig.tenantId },
        skip: !brandConfig.tenantId,
        onCompleted: (data) => {
            if (data?.tenant) {
                setTenantFormData({
                    apiKeys: {
                        stripePublicKey: data.tenant.apiKeys?.stripePublicKey || "",
                        stripeSecretKey: data.tenant.apiKeys?.stripeSecretKey || "",
                        stripeWebhookSecret: data.tenant.apiKeys?.stripeWebhookSecret || "",
                    },
                    branding: {
                        siteName: data.tenant.branding?.siteName || "",
                    },
                    domain: data.tenant.domain || "",
                    websiteUrl: data.tenant.websiteUrl || "",
                });
            }
        }
    });

    const { data, loading: queryLoading } = useQuery(GET_CURRENT_TENANT, {
        onCompleted: (data) => {
            if (data?.currentTenant) {
                setFormData({
                    businessName: data.currentTenant.companyDetails?.companyName || "",
                    businessRegistrationNumber: data.currentTenant.companyDetails?.taxId || "",
                    paymentReceivingDetails: {
                        acceptedMethods: data.currentTenant.paymentReceivingDetails?.acceptedMethods || [],
                        bankAccount: {
                            accountName: data.currentTenant.paymentReceivingDetails?.bankAccount?.accountName || "",
                            bsb: data.currentTenant.paymentReceivingDetails?.bankAccount?.bsb || "",
                            accountNumber: data.currentTenant.paymentReceivingDetails?.bankAccount?.accountNumber || "",
                            bankName: data.currentTenant.paymentReceivingDetails?.bankAccount?.bankName || "",
                            swiftCode: data.currentTenant.paymentReceivingDetails?.bankAccount?.swiftCode || "",
                        },
                        cryptoWallets: data.currentTenant.paymentReceivingDetails?.cryptoWallets || [],
                        stripeConnect: {
                            stripeAccountId: data.currentTenant.paymentReceivingDetails?.stripeConnect?.stripeAccountId || "",
                            accountVerified: data.currentTenant.paymentReceivingDetails?.stripeConnect?.accountVerified || false,
                            verifiedAt: data.currentTenant.paymentReceivingDetails?.stripeConnect?.verifiedAt || null,
                        },
                        paypalEmail: data.currentTenant.paymentReceivingDetails?.paypalEmail || "",
                        isVerified: data.currentTenant.paymentReceivingDetails?.isVerified || false,
                        cryptoDiscountPercentage: data.currentTenant.paymentReceivingDetails?.cryptoDiscountPercentage || undefined,
                    },
                });
            }
        }
    });


    const [updateTenant, { loading: updateTenantLoading }] = useMutation(UPDATE_TENANT, {
        onCompleted: () => {
            toast({
                title: "Stripe Settings Updated",
                description: "Your Stripe API keys have been updated successfully",
                status: "success",
                duration: 3000
            });
            refetchTenant();
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });

    const [updatePaymentDetails, { loading: updatePaymentLoading }] = useMutation(UPDATE_TENANT_PAYMENT_DETAILS, {
        onError: (error) => {
            toast({
                title: "Payment Details Update Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });

    const [updateCompanyDetails, { loading: updateCompanyLoading }] = useMutation(UPDATE_TENANT_COMPANY_DETAILS, {
        onError: (error) => {
            toast({
                title: "Company Details Update Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePaymentDetailsChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            paymentReceivingDetails: {
                ...prev.paymentReceivingDetails,
                [field]: value
            }
        }));
    };

    const handleBankAccountChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            paymentReceivingDetails: {
                ...prev.paymentReceivingDetails,
                bankAccount: {
                    ...prev.paymentReceivingDetails.bankAccount,
                    [field]: value
                }
            }
        }));
    };

    const handleAcceptedMethodsChange = (method: string, checked: boolean) => {
        setFormData(prev => {
            const acceptedMethods = checked
                ? [...prev.paymentReceivingDetails.acceptedMethods, method]
                : prev.paymentReceivingDetails.acceptedMethods.filter(m => m !== method);

            return {
                ...prev,
                paymentReceivingDetails: {
                    ...prev.paymentReceivingDetails,
                    acceptedMethods
                }
            };
        });
    };

    const addCryptoWallet = () => {
        setFormData(prev => ({
            ...prev,
            paymentReceivingDetails: {
                ...prev.paymentReceivingDetails,
                cryptoWallets: [
                    ...prev.paymentReceivingDetails.cryptoWallets,
                    { walletAddress: "", network: "", memo: "" }
                ]
            }
        }));
    };

    const removeCryptoWallet = (index: number) => {
        setFormData(prev => ({
            ...prev,
            paymentReceivingDetails: {
                ...prev.paymentReceivingDetails,
                cryptoWallets: prev.paymentReceivingDetails.cryptoWallets.filter((_, i) => i !== index)
            }
        }));
    };

    const handleTenantApiKeyChange = (field: string, value: string) => {
        setTenantFormData(prev => ({
            ...prev,
            apiKeys: {
                ...prev.apiKeys,
                [field]: value
            }
        }));
    };

    const handleCryptoWalletChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            paymentReceivingDetails: {
                ...prev.paymentReceivingDetails,
                cryptoWallets: prev.paymentReceivingDetails.cryptoWallets.map((wallet, i) =>
                    i === index ? { ...wallet, [field]: value } : wallet
                )
            }
        }));
    };


    const handleSubmit = async () => {
        if (!user?.id) return;

        try {
            // Clean up the input to remove __typename fields and empty strings
            const cleanBankAccount = formData.paymentReceivingDetails.bankAccount ? {
                accountName: formData.paymentReceivingDetails.bankAccount.accountName || undefined,
                bsb: formData.paymentReceivingDetails.bankAccount.bsb || undefined,
                accountNumber: formData.paymentReceivingDetails.bankAccount.accountNumber || undefined,
                bankName: formData.paymentReceivingDetails.bankAccount.bankName || undefined,
                swiftCode: formData.paymentReceivingDetails.bankAccount.swiftCode || undefined
            } : undefined;

            const cleanPaymentDetails = {
                acceptedMethods: formData.paymentReceivingDetails.acceptedMethods,
                cryptoWallets: formData.paymentReceivingDetails.cryptoWallets.map(wallet => ({
                    walletAddress: wallet.walletAddress,
                    network: wallet.network,
                    memo: wallet.memo || undefined
                })),
                bankAccount: cleanBankAccount,
                paypalEmail: formData.paymentReceivingDetails.paypalEmail || undefined,
                stripeConnect: formData.paymentReceivingDetails.stripeConnect ? {
                    stripeAccountId: formData.paymentReceivingDetails.stripeConnect.stripeAccountId || undefined,
                    accountVerified: formData.paymentReceivingDetails.stripeConnect.accountVerified,
                    verifiedAt: formData.paymentReceivingDetails.stripeConnect.verifiedAt || undefined
                } : undefined,
                cryptoDiscountPercentage: formData.paymentReceivingDetails.cryptoDiscountPercentage || undefined
            };

            // Update company details (business name and registration number)
            if (formData.businessName || formData.businessRegistrationNumber) {
                await updateCompanyDetails({
                    variables: {
                        companyDetails: {
                            companyName: formData.businessName || undefined,
                            taxId: formData.businessRegistrationNumber || undefined
                        }
                    }
                });
            }

            // Update tenant payment receiving details
            await updatePaymentDetails({
                variables: {
                    paymentDetails: cleanPaymentDetails
                }
            });

            // Update tenant Stripe keys if Stripe is selected
            if (formData.paymentReceivingDetails.acceptedMethods.includes("STRIPE") && brandConfig.tenantId) {
                await updateTenant({
                    variables: {
                        id: brandConfig.tenantId,
                        input: {
                            apiKeys: tenantFormData.apiKeys
                        }
                    }
                });
            }

            // Show success message and navigate back
            toast({
                title: "Details Updated",
                description: "Your business and payment details have been updated successfully",
                status: "success",
                duration: 3000
            });
            navigate("/bills/payment-details");
        } catch (error) {
            console.error("Error updating details:", error);
        }
    };

    if (queryLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
                <Container maxW="container.xl" py={12} flex="1">
                    <Center h="50vh">
                        <Spinner size="xl" color={getColor("primary")} />
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={billsModuleConfig} />

            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Page Header */}
                    <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={2}>
                            <Heading size="lg" color={textPrimary}>Edit Payment Details</Heading>
                            <Text fontSize="sm" color={textMuted}>
                                Update your business and payment information
                            </Text>
                        </VStack>
                        
                        <Button
                            onClick={() => navigate("/bills/payment-details")}
                            variant="outline"
                            leftIcon={<ArrowBackIcon />}
                            borderColor={cardBorder}
                            color={textSecondary}
                            _hover={{ borderColor: primaryColor, color: textInverse }}
                        >
                            Back to Payment Details
                        </Button>
                    </HStack>

                    {/* Business Information */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textInverse}>Business Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6}>
                                <FormControl>
                                    <FormLabel color={textSecondary}>Business Name</FormLabel>
                                    <Input
                                        value={formData.businessName}
                                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                                        placeholder="Your Business Name"
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textInverse}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 1px ${primaryColor}`
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel color={textSecondary}>Business Registration Number</FormLabel>
                                    <Input
                                        value={formData.businessRegistrationNumber}
                                        onChange={(e) => handleInputChange("businessRegistrationNumber", e.target.value)}
                                        placeholder="ABN or Registration Number"
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textInverse}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 1px ${primaryColor}`
                                        }}
                                    />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Payment Receiving Details */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textInverse}>💳 Payment Receiving Details</Heading>
                            <Text fontSize="sm" color={textMuted}>
                                Configure how you want to receive payments from clients
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={8} align="stretch">
                                {/* Accepted Payment Methods */}
                                <Box>
                                    <Text fontWeight="bold" mb={3} color={textInverse}>Accepted Payment Methods</Text>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Checkbox
                                            isChecked={formData.paymentReceivingDetails.acceptedMethods.includes("BANK_TRANSFER")}
                                            onChange={(e) => handleAcceptedMethodsChange("BANK_TRANSFER", e.target.checked)}
                                            colorScheme="blue"
                                        >
                                            <Text color={textSecondary}>Bank Transfer</Text>
                                        </Checkbox>
                                        <Checkbox
                                            isChecked={formData.paymentReceivingDetails.acceptedMethods.includes("CRYPTO")}
                                            onChange={(e) => handleAcceptedMethodsChange("CRYPTO", e.target.checked)}
                                            colorScheme="blue"
                                        >
                                            <Text color={textSecondary}>Cryptocurrency</Text>
                                        </Checkbox>
                                        <Checkbox
                                            isChecked={formData.paymentReceivingDetails.acceptedMethods.includes("STRIPE")}
                                            onChange={(e) => handleAcceptedMethodsChange("STRIPE", e.target.checked)}
                                            colorScheme="blue"
                                        >
                                            <Text color={textSecondary}>Stripe (Credit Cards)</Text>
                                        </Checkbox>
                                        <Checkbox
                                            isChecked={formData.paymentReceivingDetails.acceptedMethods.includes("PAYPAL")}
                                            onChange={(e) => handleAcceptedMethodsChange("PAYPAL", e.target.checked)}
                                            colorScheme="blue"
                                        >
                                            <Text color={textSecondary}>PayPal</Text>
                                        </Checkbox>
                                    </SimpleGrid>
                                </Box>

                                <Divider borderColor={cardBorder} />

                                {/* Stripe Configuration - Show when Stripe is selected */}
                                {formData.paymentReceivingDetails.acceptedMethods.includes("STRIPE") && (
                                    <Box>
                                        <Text fontWeight="bold" mb={3} color={textInverse}>💳 Stripe Configuration</Text>
                                        <Text fontSize="sm" color={textMuted} mb={4}>
                                            Configure your Stripe API keys to accept credit card payments
                                        </Text>
                                        <Alert status="info" mb={4}>
                                            <AlertIcon />
                                            <Box>
                                                <Text fontWeight="bold">Stripe API Keys for: {tenantFormData.branding.siteName || "Your Business"}</Text>
                                                <Text fontSize="sm">
                                                    These keys will be used for processing credit card payments when clients pay your bills
                                                </Text>
                                            </Box>
                                        </Alert>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>Stripe Public Key</FormLabel>
                                                <Input
                                                    value={tenantFormData.apiKeys.stripePublicKey}
                                                    onChange={(e) => handleTenantApiKeyChange("stripePublicKey", e.target.value)}
                                                    placeholder="pk_live_..."
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                                <Text fontSize="xs" color={textMuted} mt={1}>
                                                    Starts with pk_live_ or pk_test_
                                                </Text>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel color={textSecondary}>Stripe Secret Key</FormLabel>
                                                <Input
                                                    type="text"
                                                    value={tenantFormData.apiKeys.stripeSecretKey}
                                                    onChange={(e) => handleTenantApiKeyChange("stripeSecretKey", e.target.value)}
                                                    placeholder="sk_live_..."
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily="monospace"
                                                    fontSize="sm"
                                                />
                                                <Text fontSize="xs" color={textMuted} mt={1}>
                                                    Starts with sk_live_ or sk_test_
                                                </Text>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel color={textSecondary}>Stripe Webhook Secret</FormLabel>
                                                <Input
                                                    type="text"
                                                    value={tenantFormData.apiKeys.stripeWebhookSecret}
                                                    onChange={(e) => handleTenantApiKeyChange("stripeWebhookSecret", e.target.value)}
                                                    placeholder="whsec_..."
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily="monospace"
                                                    fontSize="sm"
                                                />
                                                <Text fontSize="xs" color={textMuted} mt={1}>
                                                    Starts with whsec_
                                                </Text>
                                            </FormControl>
                                        </SimpleGrid>

                                        <Alert status="warning" mt={4}>
                                            <AlertIcon />
                                            <Box>
                                                <Text fontWeight="bold">Security Notice</Text>
                                                <Text fontSize="sm">
                                                    Your Stripe keys are encrypted and securely stored. Never share your secret keys publicly.
                                                </Text>
                                            </Box>
                                        </Alert>
                                    </Box>
                                )}

                                <Divider borderColor={cardBorder} />

                                {/* Bank Account Details */}
                                <Box>
                                    <Text fontWeight="bold" mb={3} color={textInverse}>🏦 Bank Account Details</Text>
                                    <Text fontSize="sm" color={textMuted} mb={4}>
                                        Add your bank account details to receive payments via bank transfer
                                    </Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel color={textSecondary}>Account Name</FormLabel>
                                            <Input
                                                value={formData.paymentReceivingDetails.bankAccount.accountName}
                                                onChange={(e) => handleBankAccountChange("accountName", e.target.value)}
                                                placeholder="John Doe"
                                                bg="rgba(255, 255, 255, 0.05)"
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textInverse}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textSecondary}>BSB</FormLabel>
                                            <Input
                                                value={formData.paymentReceivingDetails.bankAccount.bsb}
                                                onChange={(e) => handleBankAccountChange("bsb", e.target.value)}
                                                placeholder="123-456"
                                                bg="rgba(255, 255, 255, 0.05)"
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textInverse}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textSecondary}>Account Number</FormLabel>
                                            <Input
                                                value={formData.paymentReceivingDetails.bankAccount.accountNumber}
                                                onChange={(e) => handleBankAccountChange("accountNumber", e.target.value)}
                                                placeholder="123456789"
                                                bg="rgba(255, 255, 255, 0.05)"
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textInverse}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textSecondary}>Bank Name (Optional)</FormLabel>
                                            <Input
                                                value={formData.paymentReceivingDetails.bankAccount.bankName}
                                                onChange={(e) => handleBankAccountChange("bankName", e.target.value)}
                                                placeholder="Commonwealth Bank"
                                                bg="rgba(255, 255, 255, 0.05)"
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textInverse}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textSecondary}>SWIFT Code (Optional)</FormLabel>
                                            <Input
                                                value={formData.paymentReceivingDetails.bankAccount.swiftCode}
                                                onChange={(e) => handleBankAccountChange("swiftCode", e.target.value)}
                                                placeholder="CTBAAU2S"
                                                bg="rgba(255, 255, 255, 0.05)"
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textInverse}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                }}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Divider borderColor={cardBorder} />

                                {/* Crypto Wallets */}
                                <Box>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="bold" color={textInverse}>₿ Cryptocurrency Wallets</Text>
                                        <Button
                                            size="sm"
                                            leftIcon={<AddIcon />}
                                            onClick={addCryptoWallet}
                                            variant="outline"
                                            borderColor={cardBorder}
                                            color={textSecondary}
                                            _hover={{ borderColor: primaryColor, color: textInverse }}
                                        >
                                            Add Wallet
                                        </Button>
                                    </HStack>
                                    <Text fontSize="sm" color={textMuted} mb={4}>
                                        Add cryptocurrency wallet addresses to receive crypto payments
                                    </Text>
                                    
                                    {formData.paymentReceivingDetails.acceptedMethods.includes("CRYPTO") && 
                                     !formData.paymentReceivingDetails.cryptoWallets.some(w => w.network === "BTC") && (
                                        <Alert status="info" mb={4}>
                                            <AlertIcon />
                                            <Box>
                                                <Text fontWeight="bold">Bitcoin Wallet Recommended</Text>
                                                <Text fontSize="sm">
                                                    You've selected cryptocurrency as an accepted payment method. 
                                                    {formData.paymentReceivingDetails.cryptoWallets.length === 0 
                                                        ? " Please add your Bitcoin (BTC) wallet address to receive Bitcoin payments from clients."
                                                        : " Consider adding a Bitcoin (BTC) wallet address to accept Bitcoin payments."}
                                                </Text>
                                            </Box>
                                        </Alert>
                                    )}

                                    {formData.paymentReceivingDetails.cryptoWallets.length > 0 ? (
                                        <VStack spacing={4}>
                                            {formData.paymentReceivingDetails.cryptoWallets.map((wallet, index) => (
                                                <Box key={index} p={4} border="1px" borderColor={cardBorder} borderRadius="md" width="100%">
                                                    <HStack justify="space-between" mb={3}>
                                                        <Text fontWeight="semibold" color={textInverse}>Wallet {index + 1}</Text>
                                                        <IconButton
                                                            aria-label="Remove wallet"
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => removeCryptoWallet(index)}
                                                        />
                                                    </HStack>
                                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel fontSize="sm" color={textSecondary}>Network</FormLabel>
                                                            <Select
                                                                value={wallet.network}
                                                                onChange={(e) => handleCryptoWalletChange(index, "network", e.target.value)}
                                                                placeholder="Select network"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                border="1px"
                                                                borderColor={cardBorder}
                                                                color={textInverse}
                                                                _focus={{
                                                                    borderColor: primaryColor,
                                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                                }}
                                                            >
                                                                <option value="BTC">Bitcoin (BTC)</option>
                                                                <option value="ETH">Ethereum (ETH)</option>
                                                                <option value="BSC">Binance Smart Chain (BSC)</option>
                                                                <option value="MATIC">Polygon (MATIC)</option>
                                                                <option value="ADA">Cardano (ADA)</option>
                                                                <option value="SOL">Solana (SOL)</option>
                                                            </Select>
                                                        </FormControl>

                                                        <FormControl>
                                                            <FormLabel fontSize="sm" color={textSecondary}>Wallet Address</FormLabel>
                                                            <Input
                                                                value={wallet.walletAddress}
                                                                onChange={(e) => handleCryptoWalletChange(index, "walletAddress", e.target.value)}
                                                                placeholder="0x..."
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                border="1px"
                                                                borderColor={cardBorder}
                                                                color={textInverse}
                                                                _focus={{
                                                                    borderColor: primaryColor,
                                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                                }}
                                                            />
                                                        </FormControl>

                                                        <FormControl>
                                                            <FormLabel fontSize="sm" color={textSecondary}>Memo (Optional)</FormLabel>
                                                            <Input
                                                                value={wallet.memo}
                                                                onChange={(e) => handleCryptoWalletChange(index, "memo", e.target.value)}
                                                                placeholder="Memo or tag"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                border="1px"
                                                                borderColor={cardBorder}
                                                                color={textInverse}
                                                                _focus={{
                                                                    borderColor: primaryColor,
                                                                    boxShadow: `0 0 0 1px ${primaryColor}`
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color={textMuted} textAlign="center" py={4}>
                                            No crypto wallets added yet. Click "Add Wallet" to get started.
                                        </Text>
                                    )}
                                </Box>

                                {/* Crypto Discount */}
                                {formData.paymentReceivingDetails.acceptedMethods.includes("CRYPTO") && (
                                    <Box>
                                        <Text fontWeight="bold" mb={3} color={textInverse}>💸 Crypto Payment Discount</Text>
                                        <Text fontSize="sm" color={textMuted} mb={4}>
                                            Offer a discount to customers who pay with cryptocurrency to incentivize crypto payments
                                        </Text>
                                        <FormControl>
                                            <FormLabel color={textSecondary}>Discount Percentage (%)</FormLabel>
                                            <HStack>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.paymentReceivingDetails.cryptoDiscountPercentage || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? Number(e.target.value) : undefined;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            paymentReceivingDetails: {
                                                                ...prev.paymentReceivingDetails,
                                                                cryptoDiscountPercentage: value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder="e.g., 10"
                                                    bg="rgba(255, 255, 255, 0.05)"
                                                    border="1px"
                                                    borderColor={cardBorder}
                                                    color={textInverse}
                                                    _placeholder={{ color: textMuted }}
                                                    _focus={{
                                                        borderColor: primaryColor,
                                                        boxShadow: `0 0 0 1px ${primaryColor}`
                                                    }}
                                                    width="150px"
                                                />
                                                <Text color={textSecondary}>% off for crypto payments</Text>
                                            </HStack>
                                            <Text fontSize="xs" color={textMuted} mt={2}>
                                                {formData.paymentReceivingDetails.cryptoDiscountPercentage 
                                                    ? `Customers will save ${formData.paymentReceivingDetails.cryptoDiscountPercentage}% when paying with cryptocurrency`
                                                    : "No discount currently offered"}
                                            </Text>
                                        </FormControl>
                                    </Box>
                                )}

                                <Divider borderColor={cardBorder} />

                                {/* PayPal */}
                                <Box>
                                    <Text fontWeight="bold" mb={3} color={textInverse}>💰 PayPal</Text>
                                    <Text fontSize="sm" color={textMuted} mb={4}>
                                        Add your PayPal email to receive PayPal payments
                                    </Text>
                                    <FormControl>
                                        <FormLabel color={textSecondary}>PayPal Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={formData.paymentReceivingDetails.paypalEmail}
                                            onChange={(e) => handlePaymentDetailsChange("paypalEmail", e.target.value)}
                                            placeholder="your-paypal@email.com"
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus")
                                            }}
                                        />
                                    </FormControl>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Action Buttons */}
                    <HStack justify="flex-end" spacing={4}>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/bills/payment-details")}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            isLoading={updatePaymentLoading || updateCompanyLoading || updateTenantLoading}
                            loadingText="Saving..."
                            bg={getComponent("button", "primaryBg")}
                            color={getColor("text.inverse")}
                            _hover={{ bg: getComponent("button", "primaryHover") }}
                            leftIcon={<CheckIcon />}
                        >
                            Save Changes
                        </Button>
                    </HStack>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default EditPaymentDetails;