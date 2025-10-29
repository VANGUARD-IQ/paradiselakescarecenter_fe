import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    CardHeader,
    FormControl,
    FormLabel,
    Input,
    Select,
    Switch,
    useToast,
    Divider,
    SimpleGrid,
    useColorMode,
    Spinner,
    Center,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { FiCreditCard, FiSave } from "react-icons/fi";
import { gql, useQuery, useMutation } from "@apollo/client";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { getColor, brandConfig } from "../../brandConfig";
import { Bill, BillStatus, BillCurrency } from "../../generated/graphql";

interface CompanyDetails {
    companyName: string;
    taxId: string;
    billingEmail: string;
    billingPhone: string;
    taxPercentage: number;
    billingAddress: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    invoicePreferences: {
        emailInvoices: boolean;
        autoPayEnabled: boolean;
        invoiceLanguage: string;
        taxIncluded: boolean;
    };
}

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
                taxPercentage
                billingAddress {
                    addressLine1
                    addressLine2
                    city
                    state
                    postalCode
                    country
                }
                invoicePreferences {
                    emailInvoices
                    autoPayEnabled
                    invoiceLanguage
                    taxIncluded
                }
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
                taxPercentage
                billingAddress {
                    addressLine1
                    addressLine2
                    city
                    state
                    postalCode
                    country
                }
                invoicePreferences {
                    emailInvoices
                    autoPayEnabled
                    invoiceLanguage
                    taxIncluded
                }
            }
        }
    }
`;

const CompanyDetails: React.FC = () => {
    usePageTitle("Company Details");
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { colorMode } = useColorMode();

    // Consistent styling from brandConfig
    const bg = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    // GraphQL query and mutation
    const { data, loading, error } = useQuery(GET_CURRENT_TENANT);
    const [updateCompanyDetails] = useMutation(UPDATE_TENANT_COMPANY_DETAILS);

    // Local state for form
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
        companyName: "",
        taxId: "",
        billingEmail: "",
        billingPhone: "",
        taxPercentage: 10,
        billingAddress: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Australia",
        },
        invoicePreferences: {
            emailInvoices: true,
            autoPayEnabled: false,
            invoiceLanguage: "en",
            taxIncluded: true,
        },
    });

    // Update form when data loads
    useEffect(() => {
        if (data?.currentTenant?.companyDetails) {
            const details = data.currentTenant.companyDetails;
            setCompanyDetails({
                companyName: details.companyName || "",
                taxId: details.taxId || "",
                billingEmail: details.billingEmail || "",
                billingPhone: details.billingPhone || "",
                taxPercentage: details.taxPercentage ?? 10,
                billingAddress: {
                    addressLine1: details.billingAddress?.addressLine1 || "",
                    addressLine2: details.billingAddress?.addressLine2 || "",
                    city: details.billingAddress?.city || "",
                    state: details.billingAddress?.state || "",
                    postalCode: details.billingAddress?.postalCode || "",
                    country: details.billingAddress?.country || "Australia",
                },
                invoicePreferences: {
                    emailInvoices: details.invoicePreferences?.emailInvoices ?? true,
                    autoPayEnabled: details.invoicePreferences?.autoPayEnabled ?? false,
                    invoiceLanguage: details.invoicePreferences?.invoiceLanguage || "en",
                    taxIncluded: details.invoicePreferences?.taxIncluded ?? true,
                },
            });
        }
    }, [data]);

    const handleInputChange = (section: keyof CompanyDetails, field: string, value: string | boolean | number) => {
        if (section === "billingAddress" || section === "invoicePreferences") {
            setCompanyDetails({
                ...companyDetails,
                [section]: {
                    ...companyDetails[section],
                    [field]: value,
                },
            });
        } else {
            setCompanyDetails({
                ...companyDetails,
                [field]: value,
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateCompanyDetails({
                variables: {
                    companyDetails: {
                        companyName: companyDetails.companyName,
                        taxId: companyDetails.taxId,
                        billingEmail: companyDetails.billingEmail,
                        billingPhone: companyDetails.billingPhone,
                        taxPercentage: companyDetails.taxPercentage,
                        billingAddress: {
                            addressLine1: companyDetails.billingAddress.addressLine1,
                            addressLine2: companyDetails.billingAddress.addressLine2 || null,
                            city: companyDetails.billingAddress.city,
                            state: companyDetails.billingAddress.state,
                            postalCode: companyDetails.billingAddress.postalCode,
                            country: companyDetails.billingAddress.country,
                        },
                        invoicePreferences: {
                            emailInvoices: companyDetails.invoicePreferences.emailInvoices,
                            autoPayEnabled: companyDetails.invoicePreferences.autoPayEnabled,
                            invoiceLanguage: companyDetails.invoicePreferences.invoiceLanguage,
                            taxIncluded: companyDetails.invoicePreferences.taxIncluded,
                        },
                    },
                },
            });

            toast({
                title: "Company details updated",
                description: "Your company information has been saved successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error updating company details:", error);
            toast({
                title: "Error updating company details",
                description: "Please try again later.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
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

    if (error) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
                <Container maxW="container.xl" py={12} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        Error loading company details. Please try again.
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
            <Container maxW="container.lg" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                    <Box>
                        <Heading size="lg" color={textPrimary} mb={2}>
                            🏢 Company Details
                        </Heading>
                        <Text color={textSecondary}>
                            Manage your company information, business address, and invoice preferences.
                        </Text>
                    </Box>

                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        {/* Company Information */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                        >
                            <CardHeader borderBottom="1px" borderColor={cardBorder}>
                                <Heading size="md" color={textPrimary}>Company Information</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Company Name</FormLabel>
                                        <Input
                                            value={companyDetails.companyName}
                                            onChange={(e) => handleInputChange("companyName" as keyof CompanyDetails, "companyName", e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Tax ID / ABN</FormLabel>
                                        <Input
                                            value={companyDetails.taxId}
                                            onChange={(e) => handleInputChange("taxId" as keyof CompanyDetails, "taxId", e.target.value)}
                                            placeholder="ABN 12 345 678 901"
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Billing Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={companyDetails.billingEmail}
                                            onChange={(e) => handleInputChange("billingEmail" as keyof CompanyDetails, "billingEmail", e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Billing Phone</FormLabel>
                                        <Input
                                            type="tel"
                                            value={companyDetails.billingPhone}
                                            onChange={(e) => handleInputChange("billingPhone" as keyof CompanyDetails, "billingPhone", e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Tax/GST Percentage</FormLabel>
                                        <Input
                                            type="number"
                                            value={companyDetails.taxPercentage}
                                            onChange={(e) => handleInputChange("taxPercentage" as keyof CompanyDetails, "taxPercentage", parseFloat(e.target.value) || 0)}
                                            placeholder="10"
                                            min={0}
                                            max={100}
                                            step={0.1}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                        <Text fontSize="xs" color={textMuted} mt={1}>
                                            E.g., 10 for 10% GST (Australian standard). This will be applied to all bills.
                                        </Text>
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Billing Address */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                        >
                            <CardHeader borderBottom="1px" borderColor={cardBorder}>
                                <Heading size="md" color={textPrimary}>Billing Address</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Address Line 1</FormLabel>
                                        <Input
                                            value={companyDetails.billingAddress.addressLine1}
                                            onChange={(e) => handleInputChange("billingAddress", "addressLine1", e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Address Line 2</FormLabel>
                                        <Input
                                            value={companyDetails.billingAddress.addressLine2 || ""}
                                            onChange={(e) => handleInputChange("billingAddress", "addressLine2", e.target.value)}
                                            placeholder="Suite, apartment, etc. (optional)"
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                        />
                                    </FormControl>

                                    <HStack width="100%">
                                        <FormControl>
                                            <FormLabel color={textPrimary}>City</FormLabel>
                                            <Input
                                                value={companyDetails.billingAddress.city}
                                                onChange={(e) => handleInputChange("billingAddress", "city", e.target.value)}
                                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: textSecondary,
                                                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: textSecondary
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textPrimary}>State</FormLabel>
                                            <Select
                                                value={companyDetails.billingAddress.state}
                                                onChange={(e) => handleInputChange("billingAddress", "state", e.target.value)}
                                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                _hover={{ borderColor: textSecondary }}
                                                _focus={{
                                                    borderColor: textSecondary,
                                                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                                }}
                                            >
                                                {colorMode === 'light' ? (
                                                    <>
                                                        <option value="NSW">NSW</option>
                                                        <option value="VIC">VIC</option>
                                                        <option value="QLD">QLD</option>
                                                        <option value="WA">WA</option>
                                                        <option value="SA">SA</option>
                                                        <option value="TAS">TAS</option>
                                                        <option value="ACT">ACT</option>
                                                        <option value="NT">NT</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="NSW" style={{ backgroundColor: '#1a1a1a' }}>NSW</option>
                                                        <option value="VIC" style={{ backgroundColor: '#1a1a1a' }}>VIC</option>
                                                        <option value="QLD" style={{ backgroundColor: '#1a1a1a' }}>QLD</option>
                                                        <option value="WA" style={{ backgroundColor: '#1a1a1a' }}>WA</option>
                                                        <option value="SA" style={{ backgroundColor: '#1a1a1a' }}>SA</option>
                                                        <option value="TAS" style={{ backgroundColor: '#1a1a1a' }}>TAS</option>
                                                        <option value="ACT" style={{ backgroundColor: '#1a1a1a' }}>ACT</option>
                                                        <option value="NT" style={{ backgroundColor: '#1a1a1a' }}>NT</option>
                                                    </>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </HStack>

                                    <HStack width="100%">
                                        <FormControl>
                                            <FormLabel color={textPrimary}>Postal Code</FormLabel>
                                            <Input
                                                value={companyDetails.billingAddress.postalCode}
                                                onChange={(e) => handleInputChange("billingAddress", "postalCode", e.target.value)}
                                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                _placeholder={{ color: textMuted }}
                                                _focus={{
                                                    borderColor: textSecondary,
                                                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: textSecondary
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color={textPrimary}>Country</FormLabel>
                                            <Select
                                                value={companyDetails.billingAddress.country}
                                                onChange={(e) => handleInputChange("billingAddress", "country", e.target.value)}
                                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                                border="1px"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                _hover={{ borderColor: textSecondary }}
                                                _focus={{
                                                    borderColor: textSecondary,
                                                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                                }}
                                            >
                                                {colorMode === 'light' ? (
                                                    <>
                                                        <option value="Australia">Australia</option>
                                                        <option value="New Zealand">New Zealand</option>
                                                        <option value="United States">United States</option>
                                                        <option value="Canada">Canada</option>
                                                        <option value="United Kingdom">United Kingdom</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Australia" style={{ backgroundColor: '#1a1a1a' }}>Australia</option>
                                                        <option value="New Zealand" style={{ backgroundColor: '#1a1a1a' }}>New Zealand</option>
                                                        <option value="United States" style={{ backgroundColor: '#1a1a1a' }}>United States</option>
                                                        <option value="Canada" style={{ backgroundColor: '#1a1a1a' }}>Canada</option>
                                                        <option value="United Kingdom" style={{ backgroundColor: '#1a1a1a' }}>United Kingdom</option>
                                                    </>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Invoice Preferences */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                    >
                        <CardHeader borderBottom="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textPrimary}>Invoice Preferences</Heading>
                            <Text fontSize="sm" color={textMuted} mt={2}>
                                Configure how invoices are generated and delivered to your clients
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6} align="stretch">
                                {/* Email Invoices */}
                                <Box>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <Box flex="1" mr={4}>
                                            <FormLabel htmlFor="email-invoices" mb="1" color={textPrimary} fontWeight="semibold">
                                                Email Invoices
                                            </FormLabel>
                                            <Text fontSize="sm" color={textMuted}>
                                                Automatically send invoice PDFs to clients via email when a bill is marked as "Sent"
                                            </Text>
                                        </Box>
                                        <Switch
                                            id="email-invoices"
                                            isChecked={companyDetails.invoicePreferences.emailInvoices}
                                            onChange={(e) => handleInputChange("invoicePreferences", "emailInvoices", e.target.checked)}
                                            colorScheme="blue"
                                            size="lg"
                                        />
                                    </FormControl>
                                </Box>

                                <Divider />

                                {/* Auto-Pay Enabled */}
                                <Box>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <Box flex="1" mr={4}>
                                            <FormLabel htmlFor="auto-pay" mb="1" color={textPrimary} fontWeight="semibold">
                                                Auto-Pay Enabled
                                            </FormLabel>
                                            <Text fontSize="sm" color={textMuted}>
                                                Allow clients to set up automatic payment methods. When enabled, bills will be charged automatically on the due date.
                                            </Text>
                                        </Box>
                                        <Switch
                                            id="auto-pay"
                                            isChecked={companyDetails.invoicePreferences.autoPayEnabled}
                                            onChange={(e) => handleInputChange("invoicePreferences", "autoPayEnabled", e.target.checked)}
                                            colorScheme="blue"
                                            size="lg"
                                        />
                                    </FormControl>
                                </Box>

                                <Divider />

                                {/* Tax Included */}
                                <Box>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <Box flex="1" mr={4}>
                                            <FormLabel htmlFor="tax-included" mb="1" color={textPrimary} fontWeight="semibold">
                                                Tax Included in Display
                                            </FormLabel>
                                            <Text fontSize="sm" color={textMuted}>
                                                Show prices with GST/tax already included. When disabled, tax is shown separately as a line item.
                                            </Text>
                                        </Box>
                                        <Switch
                                            id="tax-included"
                                            isChecked={companyDetails.invoicePreferences.taxIncluded}
                                            onChange={(e) => handleInputChange("invoicePreferences", "taxIncluded", e.target.checked)}
                                            colorScheme="blue"
                                            size="lg"
                                        />
                                    </FormControl>
                                </Box>

                                <Divider />

                                {/* Invoice Language */}
                                <Box>
                                    <FormControl>
                                        <FormLabel color={textPrimary} fontWeight="semibold">Invoice Language</FormLabel>
                                        <Text fontSize="sm" color={textMuted} mb={3}>
                                            Default language for invoice templates, email notifications, and PDF generation
                                        </Text>
                                        <Select
                                            value={companyDetails.invoicePreferences.invoiceLanguage}
                                            onChange={(e) => handleInputChange("invoicePreferences", "invoiceLanguage", e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _hover={{ borderColor: textSecondary }}
                                            _focus={{
                                                borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                                            }}
                                        >
                                            {colorMode === 'light' ? (
                                                <>
                                                    <option value="en">English</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="fr">French</option>
                                                    <option value="de">German</option>
                                                    <option value="zh">Chinese</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="en" style={{ backgroundColor: '#1a1a1a' }}>English</option>
                                                    <option value="es" style={{ backgroundColor: '#1a1a1a' }}>Spanish</option>
                                                    <option value="fr" style={{ backgroundColor: '#1a1a1a' }}>French</option>
                                                    <option value="de" style={{ backgroundColor: '#1a1a1a' }}>German</option>
                                                    <option value="zh" style={{ backgroundColor: '#1a1a1a' }}>Chinese</option>
                                                </>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Divider borderColor={cardBorder} />

                    {/* Save Button */}
                    <HStack justify="flex-end">
                        <Button
                            leftIcon={<FiSave />}
                            bg="white"
                            color="black"
                            _hover={{ 
                                bg: "gray.100",
                                transform: "translateY(-2px)"
                            }}
                            onClick={handleSave}
                            isLoading={isSaving}
                            loadingText="Saving..."
                            size="lg"
                            boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                        >
                            Save Company Details
                        </Button>
                    </HStack>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyDetails;