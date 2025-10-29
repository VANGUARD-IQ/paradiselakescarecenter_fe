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
    Textarea,
    Switch,
    useToast,
    Alert,
    AlertIcon,
    AlertDescription,
    Progress,
    SimpleGrid,
    Badge,
    Divider,
    Spinner,
    useColorModeValue,
    useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, CheckIcon, ExternalLinkIcon, EditIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import tenantManagementModuleConfig from "./moduleConfig";
import { getColor, getComponent } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_TENANT = gql`
  query GetTenant($id: ID!) {
    tenant(id: $id) {
      id
      name
      domain
      websiteUrl
      status
      subscriptionTier
      githubRepo
      githubOwner
      deploymentUrl
      mainBranch
      alphaId
      dedicatedNumber
      useAlphaId
      branding {
        siteName
        tagline
        description
        primaryColor
        secondaryColor
        accentColor
        logo
        favicon
      }
      emailConfig {
        fromEmail
        fromName
        replyToEmail
      }
      smsConfig {
        defaultSender
        defaultSenderType
        defaultTags
        defaultList
      }
      apiKeys {
        postmarkApiKey
        cellcastApiKey
        lemonfoxApiKey
        stripePublicKey
        stripeSecretKey
        stripeWebhookSecret
        twilioAccountSid
        twilioAuthToken
        twilioPhoneNumber
        mobileForwardNumber
        twilioApiKey
        twilioApiSecret
        twilioAppSid
        tollFreeNumber
        smsNumber
        vapiPrivateApiKey
        vapiPublicApiKey
        vapiPhoneNumberId
        vapiAssistantId
        unsplashApplicationId
        unsplashAccessKey
        unsplashSecretKey
      }
      moduleConfig {
        moduleId
        version
        enabled
        enabledAt
      }
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
      client {
        id
        fName
        lName
        email
        businessName
      }
      createdAt
      updatedAt
      trialEndsAt
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      businessName
    }
  }
`;

const GET_AVAILABLE_MODULES = gql`
  query GetAvailableModules {
    availableModules {
      id
      name
      description
      icon
      version
      requiredTier
    }
  }
`;

const UPDATE_TENANT = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      name
      domain
      websiteUrl
      status
      subscriptionTier
      githubRepo
      githubOwner
      deploymentUrl
      mainBranch
      alphaId
      dedicatedNumber
      useAlphaId
      branding {
        siteName
        tagline
        description
        primaryColor
      }
      emailConfig {
        fromEmail
        fromName
      }
      smsConfig {
        defaultSender
        defaultSenderType
      }
      apiKeys {
        postmarkApiKey
        cellcastApiKey
        lemonfoxApiKey
        stripePublicKey
        stripeSecretKey
        stripeWebhookSecret
        twilioAccountSid
        twilioAuthToken
        twilioPhoneNumber
        mobileForwardNumber
        tollFreeNumber
        smsNumber
        vapiPrivateApiKey
        vapiPublicApiKey
        vapiPhoneNumberId
        vapiAssistantId
        unsplashApplicationId
        unsplashAccessKey
        unsplashSecretKey
      }
      updatedAt
    }
  }
`;

const ENABLE_MODULE_FOR_TENANT = gql`
  mutation EnableModuleForTenant($tenantId: ID!, $moduleId: String!, $version: String) {
    enableModuleForTenant(tenantId: $tenantId, moduleId: $moduleId, version: $version) {
      id
      moduleConfig {
        moduleId
        version
        enabled
        enabledAt
      }
    }
  }
`;

const DISABLE_MODULE_FOR_TENANT = gql`
  mutation DisableModuleForTenant($tenantId: ID!, $moduleId: String!) {
    disableModuleForTenant(tenantId: $tenantId, moduleId: $moduleId) {
      id
      moduleConfig {
        moduleId
        version
        enabled
        enabledAt
      }
    }
  }
`;

const EditTenant = () => {
    usePageTitle("Edit Tenant");

    const { colorMode } = useColorMode();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const bg = getColor("background.main", colorMode);

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const infoBg = getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode);

    // Section-specific editing states
    const [editingSections, setEditingSections] = React.useState<{ [key: string]: boolean }>({});
    const [savingSections, setSavingSections] = React.useState<{ [key: string]: boolean }>({});
    const [isEditing, setIsEditing] = React.useState(false); // Keep for global edit
    const [isUpdating, setIsUpdating] = React.useState(false);
    
    // Helper functions for section editing
    const isEditingSection = (section: string) => editingSections[section] || false;
    const isSavingSection = (section: string) => savingSections[section] || false;
    
    const toggleSectionEdit = (section: string) => {
        setEditingSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    
    const setSectionSaving = (section: string, saving: boolean) => {
        setSavingSections(prev => ({ ...prev, [section]: saving }));
    };

    const { data: tenantData, loading: tenantLoading, error: tenantError, refetch: refetchTenant } = useQuery(GET_TENANT, {
        variables: { id },
        skip: !id
    });

    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: modulesData, loading: _modulesLoading } = useQuery(GET_AVAILABLE_MODULES);
    const [updateTenant] = useMutation(UPDATE_TENANT);
    const [enableModuleForTenant] = useMutation(ENABLE_MODULE_FOR_TENANT);
    const [disableModuleForTenant] = useMutation(DISABLE_MODULE_FOR_TENANT);

    const [formData, setFormData] = React.useState({
        name: "",
        domain: "",
        clientId: "",
        subscriptionTier: "BASIC" as "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL",
        siteName: "",
        tagline: "",
        description: "",
        primaryColor: "#3182CE",
        secondaryColor: "",
        accentColor: "",
        logo: "",
        favicon: "",
        fromEmail: "",
        fromName: "",
        replyToEmail: "",
        defaultSender: "",
        defaultSenderType: "ALPHANUMERIC",
        postmarkApiKey: "",
        cellcastApiKey: "",
        lemonfoxApiKey: "",
        stripePublicKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        mobileForwardNumber: "",
        twilioApiKey: "",
        twilioApiSecret: "",
        twilioAppSid: "",
        tollFreeNumber: "",
        smsNumber: "",
        vapiPrivateApiKey: "",
        vapiPublicApiKey: "",
        vapiPhoneNumberId: "",
        vapiAssistantId: "",
        unsplashApplicationId: "",
        unsplashAccessKey: "",
        unsplashSecretKey: "",
        websiteUrl: "",
        githubRepo: "",
        githubOwner: "",
        deploymentUrl: "",
        mainBranch: "main",
        alphaId: "",
        dedicatedNumber: "",
        useAlphaId: false,
        // Company Details
        companyName: "",
        taxId: "",
        billingEmail: "",
        billingPhone: "",
        taxPercentage: 10,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Australia",
        emailInvoices: true,
        autoPayEnabled: false,
        invoiceLanguage: "en",
        taxIncluded: true,
        // Payment Receiving Details
        acceptedMethods: [] as string[],
        bankAccountName: "",
        bankBsb: "",
        bankAccountNumber: "",
        bankName: "",
        bankSwiftCode: "",
        paypalEmail: "",
        cryptoDiscountPercentage: 0
    });

    // Load tenant data when available
    React.useEffect(() => {
        if (tenantData?.tenant) {
            const tenant = tenantData.tenant;
            setFormData({
                name: tenant.name || "",
                domain: tenant.domain || "",
                clientId: tenant.client?.id || "",
                subscriptionTier: tenant.subscriptionTier || "BASIC",
                status: tenant.status || "ACTIVE",
                siteName: tenant.branding?.siteName || "",
                tagline: tenant.branding?.tagline || "",
                description: tenant.branding?.description || "",
                primaryColor: tenant.branding?.primaryColor || "#3182CE",
                secondaryColor: tenant.branding?.secondaryColor || "",
                accentColor: tenant.branding?.accentColor || "",
                logo: tenant.branding?.logo || "",
                favicon: tenant.branding?.favicon || "",
                fromEmail: tenant.emailConfig?.fromEmail || "",
                fromName: tenant.emailConfig?.fromName || "",
                replyToEmail: tenant.emailConfig?.replyToEmail || "",
                defaultSender: tenant.smsConfig?.defaultSender || "",
                defaultSenderType: tenant.smsConfig?.defaultSenderType || "ALPHANUMERIC",
                postmarkApiKey: tenant.apiKeys?.postmarkApiKey || "",
                cellcastApiKey: tenant.apiKeys?.cellcastApiKey || "",
                lemonfoxApiKey: tenant.apiKeys?.lemonfoxApiKey || "",
                stripePublicKey: tenant.apiKeys?.stripePublicKey || "",
                stripeSecretKey: tenant.apiKeys?.stripeSecretKey || "",
                stripeWebhookSecret: tenant.apiKeys?.stripeWebhookSecret || "",
                twilioAccountSid: tenant.apiKeys?.twilioAccountSid || "",
                twilioAuthToken: tenant.apiKeys?.twilioAuthToken || "",
                twilioPhoneNumber: tenant.apiKeys?.twilioPhoneNumber || "",
                mobileForwardNumber: tenant.apiKeys?.mobileForwardNumber || "",
                twilioApiKey: tenant.apiKeys?.twilioApiKey || "",
                twilioApiSecret: tenant.apiKeys?.twilioApiSecret || "",
                twilioAppSid: tenant.apiKeys?.twilioAppSid || "",
                tollFreeNumber: tenant.apiKeys?.tollFreeNumber || "",
                smsNumber: tenant.apiKeys?.smsNumber || "",
                vapiPrivateApiKey: tenant.apiKeys?.vapiPrivateApiKey || "",
                vapiPublicApiKey: tenant.apiKeys?.vapiPublicApiKey || "",
                vapiPhoneNumberId: tenant.apiKeys?.vapiPhoneNumberId || "",
                vapiAssistantId: tenant.apiKeys?.vapiAssistantId || "",
                unsplashApplicationId: tenant.apiKeys?.unsplashApplicationId || "",
                unsplashAccessKey: tenant.apiKeys?.unsplashAccessKey || "",
                unsplashSecretKey: tenant.apiKeys?.unsplashSecretKey || "",
                websiteUrl: tenant.websiteUrl || "",
                githubRepo: tenant.githubRepo || "",
                githubOwner: tenant.githubOwner || "",
                deploymentUrl: tenant.deploymentUrl || "",
                mainBranch: tenant.mainBranch || "main",
                alphaId: tenant.alphaId || "",
                dedicatedNumber: tenant.dedicatedNumber || "",
                useAlphaId: tenant.useAlphaId || false,
                // Company Details
                companyName: tenant.companyDetails?.companyName || "",
                taxId: tenant.companyDetails?.taxId || "",
                billingEmail: tenant.companyDetails?.billingEmail || "",
                billingPhone: tenant.companyDetails?.billingPhone || "",
                taxPercentage: tenant.companyDetails?.taxPercentage ?? 10,
                addressLine1: tenant.companyDetails?.billingAddress?.addressLine1 || "",
                addressLine2: tenant.companyDetails?.billingAddress?.addressLine2 || "",
                city: tenant.companyDetails?.billingAddress?.city || "",
                state: tenant.companyDetails?.billingAddress?.state || "",
                postalCode: tenant.companyDetails?.billingAddress?.postalCode || "",
                country: tenant.companyDetails?.billingAddress?.country || "Australia",
                emailInvoices: tenant.companyDetails?.invoicePreferences?.emailInvoices ?? true,
                autoPayEnabled: tenant.companyDetails?.invoicePreferences?.autoPayEnabled ?? false,
                invoiceLanguage: tenant.companyDetails?.invoicePreferences?.invoiceLanguage || "en",
                taxIncluded: tenant.companyDetails?.invoicePreferences?.taxIncluded ?? true,
                // Payment Receiving Details
                acceptedMethods: tenant.paymentReceivingDetails?.acceptedMethods || [],
                bankAccountName: tenant.paymentReceivingDetails?.bankAccount?.accountName || "",
                bankBsb: tenant.paymentReceivingDetails?.bankAccount?.bsb || "",
                bankAccountNumber: tenant.paymentReceivingDetails?.bankAccount?.accountNumber || "",
                bankName: tenant.paymentReceivingDetails?.bankAccount?.bankName || "",
                bankSwiftCode: tenant.paymentReceivingDetails?.bankAccount?.swiftCode || "",
                paypalEmail: tenant.paymentReceivingDetails?.paypalEmail || "",
                cryptoDiscountPercentage: tenant.paymentReceivingDetails?.cryptoDiscountPercentage || 0
            });
        }
    }, [tenantData]);

    const handleInputChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSection = async (section: string, sectionData: any) => {
        if (!id) return;
        
        setSectionSaving(section, true);
        
        try {
            const input: any = {};
            
            // Map section to appropriate input fields
            switch (section) {
                case 'email':
                    input.emailConfig = {
                        fromEmail: sectionData.fromEmail,
                        fromName: sectionData.fromName,
                        replyToEmail: sectionData.replyToEmail
                    };
                    input.apiKeys = {
                        postmarkApiKey: sectionData.postmarkApiKey || undefined
                    };
                    break;
                case 'sms':
                    input.smsConfig = {
                        defaultSender: sectionData.defaultSender,
                        defaultSenderType: sectionData.defaultSenderType,
                        defaultTags: tenantData?.tenant?.smsConfig?.defaultTags || [],
                        defaultList: tenantData?.tenant?.smsConfig?.defaultList || [],
                    };
                    input.apiKeys = {
                        cellcastApiKey: sectionData.cellcastApiKey || undefined,
                        lemonfoxApiKey: sectionData.lemonfoxApiKey || undefined
                    };
                    input.alphaId = sectionData.alphaId;
                    input.dedicatedNumber = sectionData.dedicatedNumber;
                    input.useAlphaId = sectionData.useAlphaId;
                    break;
                case 'unsplash':
                    input.apiKeys = {
                        unsplashApplicationId: sectionData.unsplashApplicationId || undefined,
                        unsplashAccessKey: sectionData.unsplashAccessKey || undefined,
                        unsplashSecretKey: sectionData.unsplashSecretKey || undefined
                    };
                    break;
                case 'vapi':
                    input.apiKeys = {
                        vapiPrivateApiKey: sectionData.vapiPrivateApiKey || undefined,
                        vapiPublicApiKey: sectionData.vapiPublicApiKey || undefined,
                        vapiPhoneNumberId: sectionData.vapiPhoneNumberId || undefined,
                        vapiAssistantId: sectionData.vapiAssistantId || undefined
                    };
                    break;
                case 'twilio':
                    input.apiKeys = {
                        twilioAccountSid: sectionData.twilioAccountSid || undefined,
                        twilioAuthToken: sectionData.twilioAuthToken || undefined,
                        twilioApiKey: sectionData.twilioApiKey || undefined,
                        twilioApiSecret: sectionData.twilioApiSecret || undefined,
                        twilioAppSid: sectionData.twilioAppSid || undefined,
                        twilioPhoneNumber: sectionData.twilioPhoneNumber || undefined,
                        mobileForwardNumber: sectionData.mobileForwardNumber || undefined,
                        tollFreeNumber: sectionData.tollFreeNumber || undefined,
                        smsNumber: sectionData.smsNumber || undefined
                    };
                    break;
                case 'stripe':
                    input.apiKeys = {
                        stripePublicKey: sectionData.stripePublicKey || undefined,
                        stripeSecretKey: sectionData.stripeSecretKey || undefined,
                        stripeWebhookSecret: sectionData.stripeWebhookSecret || undefined
                    };
                    break;
                case 'github':
                    input.githubRepo = sectionData.githubRepo || undefined;
                    input.githubOwner = sectionData.githubOwner || undefined;
                    input.mainBranch = sectionData.mainBranch || undefined;
                    break;
                case 'company':
                    input.companyDetails = {
                        companyName: sectionData.companyName || undefined,
                        taxId: sectionData.taxId || undefined,
                        billingEmail: sectionData.billingEmail || undefined,
                        billingPhone: sectionData.billingPhone || undefined,
                        taxPercentage: sectionData.taxPercentage,
                        billingAddress: {
                            addressLine1: sectionData.addressLine1,
                            addressLine2: sectionData.addressLine2 || undefined,
                            city: sectionData.city,
                            state: sectionData.state,
                            postalCode: sectionData.postalCode,
                            country: sectionData.country
                        },
                        invoicePreferences: {
                            emailInvoices: sectionData.emailInvoices,
                            autoPayEnabled: sectionData.autoPayEnabled,
                            invoiceLanguage: sectionData.invoiceLanguage,
                            taxIncluded: sectionData.taxIncluded
                        }
                    };
                    break;
                case 'payment':
                    input.paymentReceivingDetails = {
                        acceptedMethods: sectionData.acceptedMethods,
                        bankAccount: {
                            accountName: sectionData.bankAccountName,
                            bsb: sectionData.bankBsb,
                            accountNumber: sectionData.bankAccountNumber,
                            bankName: sectionData.bankName || undefined,
                            swiftCode: sectionData.bankSwiftCode || undefined
                        },
                        cryptoWallets: [],
                        paypalEmail: sectionData.paypalEmail || undefined,
                        isVerified: false,
                        cryptoDiscountPercentage: sectionData.cryptoDiscountPercentage || undefined
                    };
                    break;
                // Add more sections as needed
            }
            
            await updateTenant({
                variables: {
                    id,
                    input
                }
            });
            
            toast({
                title: 'Section Updated',
                description: `${section.charAt(0).toUpperCase() + section.slice(1)} configuration saved successfully`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            await refetchTenant();
            toggleSectionEdit(section);
            
        } catch (error: any) {
            console.error('Error updating section:', error);
            toast({
                title: 'Update Failed',
                description: error?.message || 'Failed to update section',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSectionSaving(section, false);
        }
    };
    
    const handleSubmit = async () => {
        if (!id) return;

        setIsUpdating(true);

        try {
            console.log('📝 Updating tenant with ID:', id);

            await updateTenant({
                variables: {
                    id,
                    input: {
                        name: formData.name,
                        domain: formData.domain || undefined,
                        clientId: formData.clientId,
                        status: formData.status,
                        subscriptionTier: formData.subscriptionTier,
                        websiteUrl: formData.websiteUrl || undefined,
                        githubRepo: formData.githubRepo || undefined,
                        githubOwner: formData.githubOwner || undefined,
                        mainBranch: formData.mainBranch || undefined,
                        alphaId: formData.alphaId || undefined,
                        dedicatedNumber: formData.dedicatedNumber || undefined,
                        useAlphaId: formData.useAlphaId,
                        branding: {
                            siteName: formData.siteName,
                            tagline: formData.tagline || undefined,
                            description: formData.description || undefined,
                            primaryColor: formData.primaryColor,
                            secondaryColor: formData.secondaryColor || undefined,
                            accentColor: formData.accentColor || undefined,
                            logo: formData.logo || undefined,
                            favicon: formData.favicon || undefined,
                        },
                        emailConfig: {
                            fromEmail: formData.fromEmail,
                            fromName: formData.fromName,
                            replyToEmail: formData.replyToEmail || undefined,
                        },
                        smsConfig: {
                            defaultSender: formData.defaultSender,
                            defaultSenderType: formData.defaultSenderType,
                            defaultTags: tenantData?.tenant?.smsConfig?.defaultTags || [],
                            defaultList: tenantData?.tenant?.smsConfig?.defaultList || [],
                        },
                        apiKeys: {
                            postmarkApiKey: formData.postmarkApiKey || undefined,
                            cellcastApiKey: formData.cellcastApiKey || undefined,
                            lemonfoxApiKey: formData.lemonfoxApiKey || undefined,
                            stripePublicKey: formData.stripePublicKey || undefined,
                            stripeSecretKey: formData.stripeSecretKey || undefined,
                            stripeWebhookSecret: formData.stripeWebhookSecret || undefined,
                            twilioAccountSid: formData.twilioAccountSid || undefined,
                            twilioAuthToken: formData.twilioAuthToken || undefined,
                            twilioPhoneNumber: formData.twilioPhoneNumber || undefined,
                            mobileForwardNumber: formData.mobileForwardNumber || undefined,
                            twilioApiKey: formData.twilioApiKey || undefined,
                            twilioApiSecret: formData.twilioApiSecret || undefined,
                            twilioAppSid: formData.twilioAppSid || undefined,
                            tollFreeNumber: formData.tollFreeNumber || undefined,
                            smsNumber: formData.smsNumber || undefined,
                            vapiPrivateApiKey: formData.vapiPrivateApiKey || undefined,
                            vapiPublicApiKey: formData.vapiPublicApiKey || undefined,
                            vapiPhoneNumberId: formData.vapiPhoneNumberId || undefined,
                            vapiAssistantId: formData.vapiAssistantId || undefined,
                            unsplashApplicationId: formData.unsplashApplicationId || undefined,
                            unsplashAccessKey: formData.unsplashAccessKey || undefined,
                            unsplashSecretKey: formData.unsplashSecretKey || undefined,
                        }
                    }
                }
            });

            console.log('✅ Tenant updated successfully');

            toast({
                title: "✅ Tenant Updated!",
                description: `${formData.siteName} has been updated successfully.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsEditing(false);

        } catch (error) {
            console.error("❌ Error updating tenant:", error);
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleModule = async (moduleId: string, currentlyEnabled: boolean) => {
        if (!tenant || !id) return;

        try {
            if (currentlyEnabled) {
                // Disable the module
                await disableModuleForTenant({
                    variables: {
                        tenantId: id,
                        moduleId: moduleId
                    },
                    refetchQueries: ['GetTenant']
                });

                toast({
                    title: "Module Disabled",
                    description: `Successfully disabled ${moduleId} module`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Enable the module  
                const moduleInfo = modulesData?.availableModules?.find((m: any) => m.id === moduleId);
                const version = moduleInfo?.version || 'latest';

                await enableModuleForTenant({
                    variables: {
                        tenantId: id,
                        moduleId: moduleId,
                        version: version
                    },
                    refetchQueries: ['GetTenant']
                });

                toast({
                    title: "Module Enabled",
                    description: `Successfully enabled ${moduleId} module`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("❌ Error toggling module:", error);
            toast({
                title: "Module Toggle Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (tenantLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.md" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading tenant details...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (tenantError || !tenantData?.tenant) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.md" py={12} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        <Box>
                            <Text fontWeight="bold">Error Loading Tenant</Text>
                            <Text>
                                {tenantError?.message || "Tenant not found"}
                            </Text>
                        </Box>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const tenant = tenantData.tenant;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={tenantManagementModuleConfig} />
            <Container maxW="container.lg" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                            <HStack>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/admin/tenants")}
                                    leftIcon={<ArrowBackIcon />}
                                >
                                    Back to Tenants
                                </Button>
                            </HStack>
                            <Heading size="lg" color={textPrimary}>✏️ {tenant.branding?.siteName || tenant.name}</Heading>
                            <HStack spacing={4}>
                                <Badge colorScheme={tenant.status === 'ACTIVE' ? 'green' : 'gray'}>
                                    {tenant.status}
                                </Badge>
                                <Badge colorScheme="blue">{tenant.subscriptionTier}</Badge>
                                {tenant.deploymentUrl && (
                                    <Button
                                        as="a"
                                        href={tenant.deploymentUrl}
                                        target="_blank"
                                        size="sm"
                                        leftIcon={<ExternalLinkIcon />}
                                        variant="outline"
                                    >
                                        View Repository
                                    </Button>
                                )}
                            </HStack>
                        </VStack>

                        {/* Edit Toggle Button */}
                        {isEditing ? (
                            <HStack spacing={2}>
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="outline"
                                    borderColor={getColor("border.medium", colorMode)}
                                    color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)}
                                    _hover={{ bg: getColor("background.overlay", colorMode) }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={isUpdating}
                                    loadingText="Saving..."
                                    bg={getComponent("button", "primaryBg")}
                                    color={getColor("text.inverse", colorMode)}
                                    _hover={{ bg: getComponent("button", "primaryHover") }}
                                    leftIcon={<CheckIcon />}
                                >
                                    Save Changes
                                </Button>
                            </HStack>
                        ) : (
                            <Button
                                onClick={() => setIsEditing(true)}
                                bg={getComponent("button", "primaryBg")}
                                color={getColor("text.inverse", colorMode)}
                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                leftIcon={<EditIcon />}
                            >
                                Edit
                            </Button>
                        )}
                    </HStack>

                    {/* Form Content */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>

                        {/* Basic Information */}
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <Heading size="md" color={textPrimary}>Basic Information</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Site Name</FormLabel>
                                        <Input
                                            value={formData.siteName}
                                            onChange={(e) => handleInputChange("siteName", e.target.value)}
                                            placeholder="Life Essentials Club"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Internal Name</FormLabel>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            placeholder="lifeessentialsclub"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Domain</FormLabel>
                                        <Input
                                            value={formData.domain}
                                            onChange={(e) => handleInputChange("domain", e.target.value)}
                                            placeholder="lifeessentials.club"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Website URL</FormLabel>
                                        <Input
                                            value={formData.websiteUrl}
                                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                                            placeholder="https://lifeessentials.club"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Client Owner</FormLabel>
                                        <Select
                                            value={formData.clientId}
                                            onChange={(e) => handleInputChange("clientId", e.target.value)}
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        >
                                            {clientsData?.clients.map((client: any) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.businessName || `${client.fName} ${client.lName}`} ({client.email})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <SimpleGrid columns={2} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                value={formData.status}
                                                onChange={(e) => handleInputChange("status", e.target.value)}
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="TRIAL">Trial</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="SUSPENDED">Suspended</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Subscription Tier</FormLabel>
                                            <Select
                                                value={formData.subscriptionTier}
                                                onChange={(e) => handleInputChange("subscriptionTier", e.target.value)}
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                            >
                                                <option value="FREE">FREE</option>
                                                <option value="BASIC">BASIC - $297/month</option>
                                                <option value="PREMIUM">PREMIUM - $597/month</option>
                                                <option value="ENTERPRISE">ENTERPRISE - $1,497/month</option>
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Branding */}
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <Heading size="md" color={textPrimary}>Branding</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Tagline</FormLabel>
                                        <Input
                                            value={formData.tagline}
                                            onChange={(e) => handleInputChange("tagline", e.target.value)}
                                            placeholder="Empowering wellness through natural solutions"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Description</FormLabel>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            placeholder="A brief description of what this site offers..."
                                            rows={3}
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Primary Color</FormLabel>
                                        <HStack>
                                            <Input
                                                type="color"
                                                value={formData.primaryColor}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                w="80px"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                            />
                                            <Input
                                                value={formData.primaryColor}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                placeholder="#3182CE"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                            />
                                        </HStack>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Secondary Color</FormLabel>
                                        <Input
                                            value={formData.secondaryColor}
                                            onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                                            placeholder="#39a169"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Logo URL</FormLabel>
                                        <Input
                                            value={formData.logo}
                                            onChange={(e) => handleInputChange("logo", e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    {/* Preview */}
                                    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
                                        <Text fontWeight="bold" mb={2}>Preview:</Text>
                                        <Box p={4} bg={formData.primaryColor} color="white" borderRadius="md">
                                            <Heading size="md" color={textPrimary}>{formData.siteName || "Your Site Name"}</Heading>
                                            <Text>{formData.tagline || "Your tagline here"}</Text>
                                        </Box>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Email Configuration */}
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <HStack justify="space-between">
                                    <Heading size="md" color={textPrimary}>Email Configuration</Heading>
                                    {isEditingSection('email') ? (
                                        <HStack spacing={2}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleSectionEdit('email')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                isLoading={isSavingSection('email')}
                                                onClick={() => handleSaveSection('email', {
                                                    fromEmail: formData.fromEmail,
                                                    fromName: formData.fromName,
                                                    replyToEmail: formData.replyToEmail,
                                                    postmarkApiKey: formData.postmarkApiKey
                                                })}
                                            >
                                                Save
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('email')}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>From Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={formData.fromEmail}
                                            onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                                            placeholder="support@lifeessentials.club"
                                            disabled={!isEditingSection('email') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>From Name</FormLabel>
                                        <Input
                                            value={formData.fromName}
                                            onChange={(e) => handleInputChange("fromName", e.target.value)}
                                            placeholder="Life Essentials Club"
                                            disabled={!isEditingSection('email') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Reply To Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={formData.replyToEmail}
                                            onChange={(e) => handleInputChange("replyToEmail", e.target.value)}
                                            placeholder="noreply@lifeessentials.club"
                                            disabled={!isEditingSection('email') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Postmark API Key</FormLabel>
                                        <Input
                                            value={formData.postmarkApiKey}
                                            onChange={(e) => handleInputChange("postmarkApiKey", e.target.value)}
                                            placeholder="Your Postmark server token"
                                            disabled={!isEditingSection('email') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        {formData.postmarkApiKey && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ API Key configured ({formData.postmarkApiKey.length} characters)
                                            </Text>
                                        )}
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* SMS & API Configuration */}
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <HStack justify="space-between">
                                    <Heading size="md" color={textPrimary}>SMS & API Configuration</Heading>
                                    {isEditingSection('sms') ? (
                                        <HStack spacing={2}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleSectionEdit('sms')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                isLoading={isSavingSection('sms')}
                                                onClick={() => handleSaveSection('sms', {
                                                    defaultSender: formData.defaultSender,
                                                    defaultSenderType: formData.defaultSenderType,
                                                    alphaId: formData.alphaId,
                                                    dedicatedNumber: formData.dedicatedNumber,
                                                    useAlphaId: formData.useAlphaId,
                                                    cellcastApiKey: formData.cellcastApiKey,
                                                    lemonfoxApiKey: formData.lemonfoxApiKey
                                                })}
                                            >
                                                Save
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('sms')}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>SMS Sender Name</FormLabel>
                                        <Input
                                            value={formData.defaultSender}
                                            onChange={(e) => handleInputChange("defaultSender", e.target.value)}
                                            placeholder="YourBusiness"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>SMS Alpha ID (Sender ID)</FormLabel>
                                        <Input
                                            value={formData.alphaId}
                                            onChange={(e) => handleInputChange("alphaId", e.target.value)}
                                            placeholder="e.g., TomMiller"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            Custom business name for SMS sender (e.g., Nike, Uber). Must be registered with carrier.
                                        </Text>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Dedicated SMS Number</FormLabel>
                                        <Input
                                            value={formData.dedicatedNumber}
                                            onChange={(e) => handleInputChange("dedicatedNumber", e.target.value)}
                                            placeholder="e.g., 61481076242"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            Dedicated number for exclusive messaging and brand protection.
                                        </Text>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Use Alpha ID for SMS</FormLabel>
                                        <Switch
                                            isChecked={formData.useAlphaId}
                                            onChange={(e) => handleInputChange("useAlphaId", e.target.checked)}
                                            isDisabled={(!isEditingSection('sms') && !isEditing) || !formData.alphaId || !formData.dedicatedNumber}
                                            colorScheme="blue"
                                            size="lg"
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            {formData.useAlphaId 
                                                ? `SMS will be sent from Alpha ID: ${formData.alphaId || 'Not configured'}`
                                                : `SMS will be sent from: ${formData.dedicatedNumber || 'Not configured'}`
                                            }
                                        </Text>
                                        {(!formData.alphaId || !formData.dedicatedNumber) && (
                                            <Text fontSize="xs" color="orange.400" mt={2}>
                                                ⚠️ Configure both Alpha ID and Dedicated Number to enable this toggle
                                            </Text>
                                        )}
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Cellcast API Key</FormLabel>
                                        <Input
                                            value={formData.cellcastApiKey}
                                            onChange={(e) => handleInputChange("cellcastApiKey", e.target.value)}
                                            placeholder="Your Cellcast API key"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        {formData.cellcastApiKey && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ API Key configured ({formData.cellcastApiKey.length} characters)
                                            </Text>
                                        )}
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Lemonfox API Key</FormLabel>
                                        <Input
                                            value={formData.lemonfoxApiKey}
                                            onChange={(e) => handleInputChange("lemonfoxApiKey", e.target.value)}
                                            placeholder="Your Lemonfox API key"
                                            disabled={!isEditingSection('sms') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        {formData.lemonfoxApiKey && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ API Key configured ({formData.lemonfoxApiKey.length} characters)
                                            </Text>
                                        )}
                                    </FormControl>

                                </VStack>
                            </CardBody>
                        </Card>
                        
                        {/* Unsplash API Configuration */}
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <HStack justify="space-between">
                                    <Heading size="md" color={textPrimary}>🖼️ Unsplash API Configuration</Heading>
                                    {isEditingSection('unsplash') ? (
                                        <HStack spacing={2}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleSectionEdit('unsplash')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                isLoading={isSavingSection('unsplash')}
                                                onClick={() => handleSaveSection('unsplash', {
                                                    unsplashApplicationId: formData.unsplashApplicationId,
                                                    unsplashAccessKey: formData.unsplashAccessKey,
                                                    unsplashSecretKey: formData.unsplashSecretKey
                                                })}
                                            >
                                                Save
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('unsplash')}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <Alert status="info" variant="left-accent">
                                        <AlertIcon />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                Create your Unsplash Application
                                            </Text>
                                            <Text fontSize="sm" mb={2}>
                                                Get your API keys by creating an application at{' '}
                                                <Button
                                                    as="a"
                                                    href="https://unsplash.com/oauth/applications"
                                                    target="_blank"
                                                    size="xs"
                                                    variant="link"
                                                    color={getColor("primary.500", colorMode)}
                                                    textDecoration="underline"
                                                >
                                                    unsplash.com/oauth/applications
                                                </Button>
                                            </Text>
                                        </Box>
                                    </Alert>
                                    
                                    <FormControl>
                                        <FormLabel>Application ID</FormLabel>
                                        <Input
                                            value={formData.unsplashApplicationId}
                                            onChange={(e) => handleInputChange("unsplashApplicationId", e.target.value)}
                                            placeholder="e.g., 795852"
                                            disabled={!isEditingSection('unsplash') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            A numeric ID for your Unsplash application (typically 6 digits)
                                        </Text>
                                    </FormControl>
                                    
                                    <FormControl>
                                        <FormLabel>Access Key</FormLabel>
                                        <Input
                                            value={formData.unsplashAccessKey}
                                            onChange={(e) => handleInputChange("unsplashAccessKey", e.target.value)}
                                            placeholder="Your access key (43 characters)"
                                            disabled={!isEditingSection('unsplash') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            Format: Alphanumeric string with hyphens and underscores (43 chars)
                                        </Text>
                                        {formData.unsplashAccessKey && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ Access Key configured ({formData.unsplashAccessKey.length} characters)
                                            </Text>
                                        )}
                                    </FormControl>
                                    
                                    <FormControl>
                                        <FormLabel>Secret Key</FormLabel>
                                        <Input
                                            type="text"
                                            value={formData.unsplashSecretKey}
                                            onChange={(e) => handleInputChange("unsplashSecretKey", e.target.value)}
                                            placeholder="Your secret key (43 characters)"
                                            disabled={!isEditingSection('unsplash') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            Format: Alphanumeric string with hyphens and underscores (43 chars)
                                        </Text>
                                        {formData.unsplashSecretKey && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ Secret Key configured ({formData.unsplashSecretKey.length} characters)
                                            </Text>
                                        )}
                                    </FormControl>
                                    
                                    <Alert status="warning">
                                        <AlertIcon />
                                        <AlertDescription fontSize="sm">
                                            <strong>Important:</strong> Keep your Access Key and Secret Key confidential. These keys provide access to the Unsplash API for fetching high-quality stock images. Never share them publicly or commit them to version control.
                                        </AlertDescription>
                                    </Alert>
                                </VStack>
                            </CardBody>
                        </Card>

                    </SimpleGrid>

                    {/* Phone Numbers Configuration */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={3} flex="1">
                                    <Heading size="md" color={textPrimary}>📞 Phone Numbers & Twilio Configuration</Heading>
                                <Alert status="info" variant="left-accent">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold">Configure your Twilio account and phone numbers:</Text>
                                        <VStack align="start" spacing={1} fontSize="sm">
                                            <Text>
                                                <strong>🔑 Account Credentials:</strong> Your Twilio Account SID and Auth Token from console.twilio.com
                                            </Text>
                                            <Text>
                                                <strong>📱 Twilio Number:</strong> Your main business number from Twilio (e.g., +61468003978)
                                            </Text>
                                            <Text>
                                                <strong>📲 Mobile Forward:</strong> Your personal mobile where calls will be forwarded
                                            </Text>
                                            <Text>
                                                <strong>☎️ Toll-Free:</strong> Optional 1300/1800 number for customers
                                            </Text>
                                            <Text>
                                                <strong>💬 SMS Number:</strong> Dedicated number for SMS if different from voice
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Alert>
                                </VStack>
                                {isEditingSection('twilio') ? (
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('twilio')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={isSavingSection('twilio')}
                                            onClick={() => handleSaveSection('twilio', {
                                                twilioAccountSid: formData.twilioAccountSid,
                                                twilioAuthToken: formData.twilioAuthToken,
                                                twilioApiKey: formData.twilioApiKey,
                                                twilioApiSecret: formData.twilioApiSecret,
                                                twilioAppSid: formData.twilioAppSid,
                                                twilioPhoneNumber: formData.twilioPhoneNumber,
                                                mobileForwardNumber: formData.mobileForwardNumber,
                                                tollFreeNumber: formData.tollFreeNumber,
                                                smsNumber: formData.smsNumber
                                            })}
                                        >
                                            Save
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleSectionEdit('twilio')}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6}>
                                {/* Twilio Account Credentials */}
                                <Box w="full" pb={4} borderBottom="1px" borderColor={getColor("border.darkCard", colorMode)}>
                                    <Text fontWeight="bold" mb={3}>Twilio Account Credentials</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Twilio Account SID</FormLabel>
                                            <Input
                                                value={formData.twilioAccountSid}
                                                onChange={(e) => handleInputChange("twilioAccountSid", e.target.value)}
                                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                                fontFamily="monospace"
                                                fontSize="sm"
                                            />
                                            {formData.twilioAccountSid && (
                                                <Text fontSize="xs" color="green.600" mt={1}>
                                                    ✅ Account SID configured ({formData.twilioAccountSid.length} characters)
                                                </Text>
                                            )}
                                            <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                                Found in your Twilio Console dashboard. Starts with "AC..."
                                            </Text>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Twilio Auth Token</FormLabel>
                                            <Input
                                                type="text"
                                                value={formData.twilioAuthToken}
                                                onChange={(e) => handleInputChange("twilioAuthToken", e.target.value)}
                                                placeholder="Enter your Twilio Auth Token"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                                fontFamily="monospace"
                                                fontSize="sm"
                                            />
                                            {formData.twilioAuthToken && (
                                                <Text fontSize="xs" color="green.600" mt={1}>
                                                    ✅ Auth Token: {formData.twilioAuthToken}
                                                </Text>
                                            )}
                                            <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                                32-character secret token from your Twilio Console dashboard.
                                            </Text>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                {/* Browser Calling API Keys */}
                                <Box w="full" pb={4} borderBottom="1px" borderColor={getColor("border.darkCard", colorMode)}>
                                    <Text fontWeight="bold" mb={3}>Browser Calling API Keys</Text>
                                    <Alert status="info" variant="left-accent" mb={4}>
                                        <AlertIcon />
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold" fontSize="sm">Browser Calling requires separate API Keys:</Text>
                                            <VStack align="start" spacing={0} fontSize="xs">
                                                <Text>• Create API Keys in Twilio Console → Account → API Keys</Text>
                                                <Text>• Select "Main" for API Key Type</Text>
                                                <Text>• Different from Account SID/Auth Token above</Text>
                                                <Text>• Used for WebRTC browser-to-phone calling</Text>
                                            </VStack>
                                        </VStack>
                                    </Alert>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>
                                                Twilio API Key
                                                <Badge ml={2} colorScheme="purple" fontSize="xs">BROWSER</Badge>
                                            </FormLabel>
                                            <Input
                                                value={formData.twilioApiKey}
                                                onChange={(e) => handleInputChange("twilioApiKey", e.target.value)}
                                                placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                                fontFamily="monospace"
                                                fontSize="sm"
                                            />
                                            {formData.twilioApiKey && (
                                                <Text fontSize="xs" color="green.600" mt={1}>
                                                    ✅ API Key: {formData.twilioApiKey}
                                                </Text>
                                            )}
                                            <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                                API Key SID from Twilio Console. Starts with "SK..."
                                            </Text>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>
                                                Twilio API Secret
                                                <Badge ml={2} colorScheme="purple" fontSize="xs">BROWSER</Badge>
                                            </FormLabel>
                                            <Input
                                                value={formData.twilioApiSecret}
                                                onChange={(e) => handleInputChange("twilioApiSecret", e.target.value)}
                                                placeholder="API Key Secret"
                                                disabled={!isEditingSection('stripe') && !isEditing}
                                                bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                    bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                    borderColor: getColor("border.darkCard", colorMode),
                                                    color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                                }}
                                                fontFamily="monospace"
                                                fontSize="sm"
                                            />
                                            {formData.twilioApiSecret && (
                                                <Text fontSize="xs" color="green.600" mt={1}>
                                                    ✅ API Secret: {formData.twilioApiSecret}
                                                </Text>
                                            )}
                                            <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                                API Key Secret from Twilio Console. Keep this secure!
                                            </Text>
                                        </FormControl>
                                    </SimpleGrid>
                                    
                                    {/* TwiML Application SID */}
                                    <FormControl mt={4}>
                                        <FormLabel>
                                            TwiML Application SID
                                            <Badge ml={2} colorScheme="purple" fontSize="xs">OPTIONAL</Badge>
                                        </FormLabel>
                                        <Input
                                            value={formData.twilioAppSid}
                                            onChange={(e) => handleInputChange("twilioAppSid", e.target.value)}
                                            placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            disabled={!isEditingSection('stripe') && !isEditing}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _hover={{
                                                borderColor: getComponent("form", "fieldHoverBorder")
                                            }}
                                            _focus={{
                                                borderColor: getComponent("form", "focusBorder"),
                                                boxShadow: `0 0 0 1px ${getComponent("form", "focusBorder")}`
                                            }}
                                            fontFamily="monospace"
                                            fontSize="sm"
                                        />
                                        {formData.twilioAppSid && (
                                            <Text fontSize="xs" color="green.600" mt={1}>
                                                ✅ TwiML App: {formData.twilioAppSid}
                                            </Text>
                                        )}
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            TwiML Application SID from Twilio Console (optional - defaults to APcfd470a7b4ba5f1424c8d09d49b72d24)
                                        </Text>
                                    </FormControl>
                                    
                                    {formData.twilioApiKey && formData.twilioApiSecret && (
                                        <Alert status="success" mt={4} borderRadius="md" size="sm">
                                            <AlertIcon />
                                            <Box>
                                                <Text fontSize="sm" fontWeight="semibold">Browser calling ready!</Text>
                                                <Button
                                                    size="xs"
                                                    variant="link"
                                                    colorScheme="green"
                                                    mt={1}
                                                    onClick={() => window.open('/phone-system/browser-call', '_blank')}
                                                    rightIcon={<ExternalLinkIcon boxSize={3} />}
                                                >
                                                    Test browser calling →
                                                </Button>
                                            </Box>
                                        </Alert>
                                    )}
                                </Box>

                                {/* Phone Numbers */}
                                <Box w="full">
                                    <Text fontWeight="bold" mb={3}>Phone Numbers</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl>
                                    <FormLabel>
                                        Twilio Phone Number
                                        <Badge ml={2} colorScheme="blue" fontSize="xs">VOICE</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.twilioPhoneNumber}
                                        onChange={(e) => handleInputChange("twilioPhoneNumber", e.target.value)}
                                        placeholder="+61468003978"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.twilioPhoneNumber && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Business number: {formData.twilioPhoneNumber}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Your Twilio phone number for receiving calls
                                    </Text>
                                    {formData.twilioPhoneNumber && formData.twilioAccountSid && formData.twilioAuthToken && (
                                        <Alert status="success" mt={2} borderRadius="md" size="sm">
                                            <AlertIcon />
                                            <Box>
                                                <Text fontSize="sm" fontWeight="semibold">Ready to test!</Text>
                                                <Button
                                                    size="xs"
                                                    variant="link"
                                                    colorScheme="blue"
                                                    mt={1}
                                                    onClick={() => window.open('/phone-system', '_blank')}
                                                    rightIcon={<ExternalLinkIcon boxSize={3} />}
                                                >
                                                    Test an outbound call from Phone Dashboard →
                                                </Button>
                                            </Box>
                                        </Alert>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Mobile Forward Number
                                        <Badge ml={2} colorScheme="green" fontSize="xs">FORWARD TO</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.mobileForwardNumber}
                                        onChange={(e) => handleInputChange("mobileForwardNumber", e.target.value)}
                                        placeholder="+61 4XX XXX XXX"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.mobileForwardNumber && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Forwarding to: {formData.mobileForwardNumber}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Your mobile number where calls will be forwarded
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Toll-Free Number
                                        <Badge ml={2} colorScheme="purple" fontSize="xs">1300/1800</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.tollFreeNumber}
                                        onChange={(e) => handleInputChange("tollFreeNumber", e.target.value)}
                                        placeholder="1300 XXX XXX or 1800 XXX XXX"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.tollFreeNumber && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Toll-free: {formData.tollFreeNumber}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Optional toll-free number for customers
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        SMS Number
                                        <Badge ml={2} colorScheme="orange" fontSize="xs">SMS</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.smsNumber}
                                        onChange={(e) => handleInputChange("smsNumber", e.target.value)}
                                        placeholder="+61 4XX XXX XXX"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.smsNumber && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ SMS number: {formData.smsNumber}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Dedicated SMS number (if different from voice)
                                    </Text>
                                </FormControl>
                                    </SimpleGrid>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Vapi Voice AI Configuration */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={3} flex="1">
                                    <Heading size="md" color={textPrimary}>Vapi Voice AI Configuration</Heading>
                                <Alert status="info" variant="left-accent">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold">About Vapi Integration:</Text>
                                        <VStack align="start" spacing={1} fontSize="sm">
                                            <Text>
                                                <strong>🔑 Private Key:</strong> Server-side API key for managing assistants and calls
                                            </Text>
                                            <Text>
                                                <strong>🌐 Public Key:</strong> Browser-side key for web-based voice calls
                                            </Text>
                                            <Text>
                                                <strong>📞 Phone Number ID:</strong> Your imported Twilio number's Vapi ID
                                            </Text>
                                            <Text>
                                                <strong>🤖 Assistant ID:</strong> Default AI assistant for voice calls
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Alert>
                                </VStack>
                                {isEditingSection('vapi') ? (
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('vapi')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={isSavingSection('vapi')}
                                            onClick={() => handleSaveSection('vapi', {
                                                vapiPrivateApiKey: formData.vapiPrivateApiKey,
                                                vapiPublicApiKey: formData.vapiPublicApiKey,
                                                vapiPhoneNumberId: formData.vapiPhoneNumberId,
                                                vapiAssistantId: formData.vapiAssistantId
                                            })}
                                        >
                                            Save
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleSectionEdit('vapi')}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <SimpleGrid columns={2} spacing={4}>
                                <FormControl>
                                    <FormLabel>
                                        Vapi Private API Key
                                        <Badge ml={2} colorScheme="red" fontSize="xs">BACKEND</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.vapiPrivateApiKey}
                                        onChange={(e) => handleInputChange("vapiPrivateApiKey", e.target.value)}
                                        placeholder="sk-..."
                                        type="text"
                                        disabled={!isEditingSection('vapi') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.vapiPrivateApiKey && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Private Key configured
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Server-side API key from Vapi dashboard
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Vapi Public API Key
                                        <Badge ml={2} colorScheme="green" fontSize="xs">FRONTEND</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.vapiPublicApiKey}
                                        onChange={(e) => handleInputChange("vapiPublicApiKey", e.target.value)}
                                        placeholder="pk-..."
                                        disabled={!isEditingSection('vapi') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.vapiPublicApiKey && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Public Key configured
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Browser-side key for web calls
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Vapi Phone Number ID
                                        <Badge ml={2} colorScheme="blue" fontSize="xs">PHONE</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.vapiPhoneNumberId}
                                        onChange={(e) => handleInputChange("vapiPhoneNumberId", e.target.value)}
                                        placeholder="c9e3d2b1-84b1-..."
                                        disabled={!isEditingSection('vapi') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.vapiPhoneNumberId && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Phone Number ID: {formData.vapiPhoneNumberId}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        ID from imported Twilio number in Vapi
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Vapi Assistant ID
                                        <Badge ml={2} colorScheme="purple" fontSize="xs">AI</Badge>
                                    </FormLabel>
                                    <Input
                                        value={formData.vapiAssistantId}
                                        onChange={(e) => handleInputChange("vapiAssistantId", e.target.value)}
                                        placeholder="assistant_..."
                                        disabled={!isEditingSection('vapi') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.vapiAssistantId && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Assistant ID: {formData.vapiAssistantId}
                                        </Text>
                                    )}
                                    <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                        Default AI assistant for calls
                                    </Text>
                                </FormControl>
                            </SimpleGrid>

                            {formData.vapiPublicApiKey && formData.vapiAssistantId && (
                                <Alert status="success" mt={4} borderRadius="md" size="sm">
                                    <AlertIcon />
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold">Vapi voice calls ready!</Text>
                                        <Text fontSize="xs" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} mt={1}>
                                            Web-based voice calls can now be initiated from the frontend
                                        </Text>
                                    </Box>
                                </Alert>
                            )}
                        </CardBody>
                    </Card>

                    {/* Stripe Payment Configuration */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={3} flex={1}>
                                    <Heading size="md" color={textPrimary}>Stripe Payment Configuration</Heading>
                                    <Alert status="info" variant="left-accent">
                                        <AlertIcon />
                                        <VStack align="start" spacing={2}>
                                            <Text fontWeight="bold">About Stripe Keys:</Text>
                                            <VStack align="start" spacing={1} fontSize="sm">
                                                <Text>
                                                    <strong>🔑 Public Key (pk_...):</strong> Used by the frontend for client-side operations like creating payment forms. This key is safe to expose publicly.
                                                </Text>
                                                <Text>
                                                    <strong>🔒 Secret Key (sk_...):</strong> Used by the backend for server-side operations like charging payments. This key must be kept secure and never exposed to the frontend.
                                                </Text>
                                                <Text mt={2} color="orange.600">
                                                    <strong>⚠️ For testing:</strong> Use test keys (pk_test_... and sk_test_...). For production, use live keys (pk_live_... and sk_live_...).
                                                </Text>
                                            </VStack>
                                        </VStack>
                                    </Alert>
                                </VStack>
                                {!isEditing && (
                                    <Box>
                                        {!isEditingSection('stripe') ? (
                                            <Button
                                                size="sm"
                                                leftIcon={<EditIcon />}
                                                onClick={() => toggleSectionEdit('stripe')}
                                                colorScheme="blue"
                                                variant="outline"
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <HStack spacing={2}>
                                                <Button
                                                    size="sm"
                                                    leftIcon={<CheckIcon />}
                                                    onClick={handleSubmit}
                                                    colorScheme="green"
                                                    isLoading={isUpdating}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    leftIcon={<CloseIcon />}
                                                    onClick={() => toggleSectionEdit('stripe')}
                                                    variant="outline"
                                                >
                                                    Cancel
                                                </Button>
                                            </HStack>
                                        )}
                                    </Box>
                                )}
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <SimpleGrid columns={1} spacing={4}>
                                <FormControl>
                                    <FormLabel>
                                        Stripe Publishable Key
                                        <Badge ml={2} colorScheme="green" fontSize="xs">FRONTEND</Badge>
                                    </FormLabel>
                                    <Text fontSize="sm" color={textMuted} mb={2}>
                                        Starts with pk_test_ (testing) or pk_live_ (production). Used by the website frontend for payment forms.
                                    </Text>
                                    <Input
                                        value={formData.stripePublicKey}
                                        onChange={(e) => handleInputChange("stripePublicKey", e.target.value)}
                                        placeholder="pk_test_51Rb5IrS6F6UpQ8gsW0GVUSNFsrUf45ep0P0szNEC7TIvS37Yu3lM09jAHhtXmESNvbliMjwnvrNALA28LLSVXksh00sqvTPPIw"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.stripePublicKey && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Public Key configured ({formData.stripePublicKey.length} characters)
                                            {formData.stripePublicKey.startsWith('pk_test_') && ' - TEST MODE'}
                                            {formData.stripePublicKey.startsWith('pk_live_') && ' - LIVE MODE ⚠️'}
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Stripe Secret Key
                                        <Badge ml={2} colorScheme="red" fontSize="xs">BACKEND</Badge>
                                    </FormLabel>
                                    <Text fontSize="sm" color={textMuted} mb={2}>
                                        Starts with sk_test_ (testing) or sk_live_ (production). Used by the backend server to process actual payments.
                                    </Text>
                                    <Input
                                        value={formData.stripeSecretKey}
                                        onChange={(e) => handleInputChange("stripeSecretKey", e.target.value)}
                                        placeholder="sk_test_... (Your Stripe secret key)"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.stripeSecretKey && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Secret Key configured ({formData.stripeSecretKey.length} characters)
                                            {formData.stripeSecretKey.startsWith('sk_test_') && ' - TEST MODE'}
                                            {formData.stripeSecretKey.startsWith('sk_live_') && ' - LIVE MODE ⚠️'}
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Stripe Webhook Secret
                                        <Badge ml={2} colorScheme="purple" fontSize="xs">WEBHOOKS</Badge>
                                    </FormLabel>
                                    <Text fontSize="sm" color={textMuted} mb={2}>
                                        Starts with whsec_. Used to verify webhook signatures from Stripe.
                                    </Text>
                                    <Input
                                        value={formData.stripeWebhookSecret}
                                        onChange={(e) => handleInputChange("stripeWebhookSecret", e.target.value)}
                                        placeholder="whsec_... (Your webhook signing secret)"
                                        disabled={!isEditingSection('stripe') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                    />
                                    {formData.stripeWebhookSecret && (
                                        <Text fontSize="xs" color="green.600" mt={1}>
                                            ✅ Webhook Secret configured ({formData.stripeWebhookSecret.length} characters)
                                        </Text>
                                    )}
                                </FormControl>

                                {/* Current Configuration Status */}
                                <Box p={4} bg={infoBg} borderRadius="md">
                                    <Text fontWeight="bold" mb={2}>Current Configuration Status:</Text>
                                    <HStack spacing={4}>
                                        <Badge
                                            colorScheme={formData.stripePublicKey ? "green" : "red"}
                                            p={2}
                                        >
                                            Public Key: {formData.stripePublicKey ? "✅ Configured" : "❌ Missing"}
                                        </Badge>
                                        <Badge
                                            colorScheme={formData.stripeSecretKey ? "green" : "red"}
                                            p={2}
                                        >
                                            Secret Key: {formData.stripeSecretKey ? "✅ Configured" : "❌ Missing"}
                                        </Badge>
                                        <Badge
                                            colorScheme={formData.stripeWebhookSecret ? "green" : "red"}
                                            p={2}
                                        >
                                            Webhook: {formData.stripeWebhookSecret ? "✅ Configured" : "❌ Missing"}
                                        </Badge>
                                    </HStack>
                                    {formData.stripePublicKey && formData.stripeSecretKey && formData.stripeWebhookSecret && (
                                        <Text fontSize="sm" color="green.600" mt={2}>
                                            ✅ Stripe is fully configured for this tenant. Payment processing and webhooks are enabled.
                                        </Text>
                                    )}
                                    {formData.stripePublicKey && formData.stripeSecretKey && !formData.stripeWebhookSecret && (
                                        <Text fontSize="sm" color="orange.600" mt={2}>
                                            ⚠️ Payment processing enabled but webhook secret missing. Subscription events won't be processed.
                                        </Text>
                                    )}
                                </Box>
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    {/* GitHub Repository Configuration */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between" mb={3}>
                                <Heading size="md" color={textPrimary}>GitHub Repository Configuration</Heading>
                                {isEditingSection('github') ? (
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('github')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={isSavingSection('github')}
                                            onClick={() => handleSaveSection('github', {
                                                githubRepo: formData.githubRepo,
                                                githubOwner: formData.githubOwner,
                                                mainBranch: formData.mainBranch
                                            })}
                                        >
                                            Save
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => toggleSectionEdit('github')}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </HStack>
                            <VStack align="start" spacing={3}>
                                <Alert status="info" variant="left-accent">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold">About GitHub Integration:</Text>
                                        <VStack align="start" spacing={1} fontSize="sm">
                                            <Text>
                                                <strong>📁 Repository:</strong> The name of the GitHub repository (e.g., "business-builder-master-frontend")
                                            </Text>
                                            <Text>
                                                <strong>👤 Owner:</strong> The GitHub username or organization that owns the repository
                                            </Text>
                                            <Text>
                                                <strong>🌿 Main Branch:</strong> The primary branch for deployments (usually "main" or "master")
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Alert>
                            </VStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>GitHub Repository Name</FormLabel>
                                    <Input
                                        value={formData.githubRepo}
                                        onChange={(e) => handleInputChange("githubRepo", e.target.value)}
                                        placeholder="business-builder-master-frontend"
                                        disabled={!isEditingSection('github') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>GitHub Owner/Organization</FormLabel>
                                    <Input
                                        value={formData.githubOwner}
                                        onChange={(e) => handleInputChange("githubOwner", e.target.value)}
                                        placeholder="your-github-username"
                                        disabled={!isEditingSection('github') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Main Branch</FormLabel>
                                    <Input
                                        value={formData.mainBranch}
                                        onChange={(e) => handleInputChange("mainBranch", e.target.value)}
                                        placeholder="main"
                                        disabled={!isEditingSection('github') && !isEditing}
                                        bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                            _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                {/* Current Status & Links */}
                                <Box p={4} bg={infoBg} borderRadius="md">
                                    <Text fontWeight="bold" mb={3}>Current Repository Status:</Text>
                                    <VStack align="start" spacing={2}>
                                        <HStack>
                                            <Text fontWeight="medium">Repository:</Text>
                                            <Text fontFamily="monospace">
                                                {formData.githubRepo || "Not configured"}
                                            </Text>
                                        </HStack>
                                        <HStack>
                                            <Text fontWeight="medium">Owner:</Text>
                                            <Text fontFamily="monospace">
                                                {formData.githubOwner || "Not configured"}
                                            </Text>
                                        </HStack>
                                        <HStack>
                                            <Text fontWeight="medium">Branch:</Text>
                                            <Text fontFamily="monospace">
                                                {formData.mainBranch || "main"}
                                            </Text>
                                        </HStack>
                                        {formData.githubOwner && formData.githubRepo && (
                                            <HStack>
                                                <Text fontWeight="medium">Full URL:</Text>
                                                <Button
                                                    as="a"
                                                    href={`https://github.com/${formData.githubOwner}/${formData.githubRepo}`}
                                                    target="_blank"
                                                    size="sm"
                                                    leftIcon={<ExternalLinkIcon />}
                                                    variant="outline"
                                                    colorScheme="blue"
                                                >
                                                    View on GitHub
                                                </Button>
                                            </HStack>
                                        )}
                                        {tenant.deploymentUrl && (
                                            <HStack>
                                                <Text fontWeight="medium">Deployment:</Text>
                                                <Button
                                                    as="a"
                                                    href={tenant.deploymentUrl}
                                                    target="_blank"
                                                    size="sm"
                                                    leftIcon={<ExternalLinkIcon />}
                                                    variant="outline"
                                                    colorScheme="green"
                                                >
                                                    View Deployment
                                                </Button>
                                            </HStack>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Company Details */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <Heading size="md" color={textPrimary}>🏢 Company Details</Heading>
                                {isEditingSection('company') ? (
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('company')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={isSavingSection('company')}
                                            onClick={() => handleSaveSection('company', {
                                                companyName: formData.companyName,
                                                taxId: formData.taxId,
                                                billingEmail: formData.billingEmail,
                                                billingPhone: formData.billingPhone,
                                                taxPercentage: formData.taxPercentage,
                                                addressLine1: formData.addressLine1,
                                                addressLine2: formData.addressLine2,
                                                city: formData.city,
                                                state: formData.state,
                                                postalCode: formData.postalCode,
                                                country: formData.country,
                                                emailInvoices: formData.emailInvoices,
                                                autoPayEnabled: formData.autoPayEnabled,
                                                invoiceLanguage: formData.invoiceLanguage,
                                                taxIncluded: formData.taxIncluded
                                            })}
                                        >
                                            Save
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleSectionEdit('company')}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                    <FormControl>
                                        <FormLabel>Company Name</FormLabel>
                                        <Input
                                            value={formData.companyName}
                                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                                            placeholder="Acme Corporation Pty Ltd"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Tax ID / ABN</FormLabel>
                                        <Input
                                            value={formData.taxId}
                                            onChange={(e) => handleInputChange("taxId", e.target.value)}
                                            placeholder="ABN 12 345 678 901"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Billing Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={formData.billingEmail}
                                            onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                                            placeholder="billing@company.com"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Billing Phone</FormLabel>
                                        <Input
                                            value={formData.billingPhone}
                                            onChange={(e) => handleInputChange("billingPhone", e.target.value)}
                                            placeholder="+61 2 9876 5432"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Tax/GST Percentage</FormLabel>
                                        <Input
                                            type="number"
                                            value={formData.taxPercentage}
                                            onChange={(e) => handleInputChange("taxPercentage", parseFloat(e.target.value) || 0)}
                                            placeholder="10"
                                            min={0}
                                            max={100}
                                            step={0.1}
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                        <Text fontSize="xs" color={textMuted} mt={1}>
                                            E.g., 10 for 10% GST (Australian standard)
                                        </Text>
                                    </FormControl>
                                </SimpleGrid>

                                <Divider />
                                <Text fontWeight="bold" color={textPrimary}>Billing Address</Text>

                                <FormControl>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <Input
                                        value={formData.addressLine1}
                                        onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                                        placeholder="123 Business Street"
                                        disabled={!isEditingSection('company')}
                                        bg={getComponent("form", "fieldBg")}
                                        color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                        _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Address Line 2</FormLabel>
                                    <Input
                                        value={formData.addressLine2}
                                        onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                                        placeholder="Suite 456"
                                        disabled={!isEditingSection('company')}
                                        bg={getComponent("form", "fieldBg")}
                                        color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                        _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                                    <FormControl>
                                        <FormLabel>City</FormLabel>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                            placeholder="Sydney"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>State</FormLabel>
                                        <Input
                                            value={formData.state}
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                            placeholder="NSW"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Postal Code</FormLabel>
                                        <Input
                                            value={formData.postalCode}
                                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                            placeholder="2000"
                                            disabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                    <FormLabel>Country</FormLabel>
                                    <Input
                                        value={formData.country}
                                        onChange={(e) => handleInputChange("country", e.target.value)}
                                        placeholder="Australia"
                                        disabled={!isEditingSection('company')}
                                        bg={getComponent("form", "fieldBg")}
                                        color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                        _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <Divider />
                                <Text fontWeight="bold" color={textPrimary}>Invoice Preferences</Text>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb="0">Email Invoices</FormLabel>
                                        <Switch
                                            isChecked={formData.emailInvoices}
                                            onChange={(e) => handleInputChange("emailInvoices", e.target.checked)}
                                            isDisabled={!isEditingSection('company')}
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb="0">Auto-Pay Enabled</FormLabel>
                                        <Switch
                                            isChecked={formData.autoPayEnabled}
                                            onChange={(e) => handleInputChange("autoPayEnabled", e.target.checked)}
                                            isDisabled={!isEditingSection('company')}
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb="0">Tax Included</FormLabel>
                                        <Switch
                                            isChecked={formData.taxIncluded}
                                            onChange={(e) => handleInputChange("taxIncluded", e.target.checked)}
                                            isDisabled={!isEditingSection('company')}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Invoice Language</FormLabel>
                                        <Select
                                            value={formData.invoiceLanguage}
                                            onChange={(e) => handleInputChange("invoiceLanguage", e.target.value)}
                                            isDisabled={!isEditingSection('company')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Payment Receiving Details */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <Heading size="md" color={textPrimary}>💳 Payment Receiving Details</Heading>
                                {isEditingSection('payment') ? (
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleSectionEdit('payment')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            isLoading={isSavingSection('payment')}
                                            onClick={() => handleSaveSection('payment', {
                                                acceptedMethods: formData.acceptedMethods,
                                                bankAccountName: formData.bankAccountName,
                                                bankBsb: formData.bankBsb,
                                                bankAccountNumber: formData.bankAccountNumber,
                                                bankName: formData.bankName,
                                                bankSwiftCode: formData.bankSwiftCode,
                                                paypalEmail: formData.paypalEmail,
                                                cryptoDiscountPercentage: formData.cryptoDiscountPercentage
                                            })}
                                        >
                                            Save
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleSectionEdit('payment')}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4}>
                                <Text fontWeight="bold" color={textPrimary}>Bank Account Details</Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                    <FormControl>
                                        <FormLabel>Account Name</FormLabel>
                                        <Input
                                            value={formData.bankAccountName}
                                            onChange={(e) => handleInputChange("bankAccountName", e.target.value)}
                                            placeholder="Business Trading Account"
                                            disabled={!isEditingSection('payment')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>BSB</FormLabel>
                                        <Input
                                            value={formData.bankBsb}
                                            onChange={(e) => handleInputChange("bankBsb", e.target.value)}
                                            placeholder="062-000"
                                            disabled={!isEditingSection('payment')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Account Number</FormLabel>
                                        <Input
                                            value={formData.bankAccountNumber}
                                            onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                                            placeholder="123456789"
                                            disabled={!isEditingSection('payment')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Bank Name (Optional)</FormLabel>
                                        <Input
                                            value={formData.bankName}
                                            onChange={(e) => handleInputChange("bankName", e.target.value)}
                                            placeholder="Commonwealth Bank"
                                            disabled={!isEditingSection('payment')}
                                            bg={getComponent("form", "fieldBg")}
                                            color={textPrimary}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            _placeholder={{ color: textMuted }}
                                            _disabled={{
                                                bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                                borderColor: getColor("border.darkCard", colorMode),
                                                color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                            }}
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                    <FormLabel>SWIFT Code (Optional)</FormLabel>
                                    <Input
                                        value={formData.bankSwiftCode}
                                        onChange={(e) => handleInputChange("bankSwiftCode", e.target.value)}
                                        placeholder="CTBAAU2S"
                                        disabled={!isEditingSection('payment')}
                                        bg={getComponent("form", "fieldBg")}
                                        color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                        _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>

                                <Divider />
                                <Text fontWeight="bold" color={textPrimary}>Other Payment Methods</Text>

                                <FormControl>
                                    <FormLabel>PayPal Email (Optional)</FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.paypalEmail}
                                        onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                                        placeholder="payments@company.com"
                                        disabled={!isEditingSection('payment')}
                                        bg={getComponent("form", "fieldBg")}
                                        color={textPrimary}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        _placeholder={{ color: textMuted }}
                                        _disabled={{
                                            bg: getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode),
                                            borderColor: getColor("border.darkCard", colorMode),
                                            color: getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)
                                        }}
                                    />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Module Configuration (Interactive) */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <VStack align="start" spacing={3}>
                                <Heading size="md" color={textPrimary}>Business Module Configuration</Heading>
                                <Alert status="success" variant="left-accent">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold">About Business Modules:</Text>
                                        <VStack align="start" spacing={1} fontSize="sm">
                                            <Text>
                                                Manage which business modules are enabled for this tenant. Each module represents a feature set like sessions, projects, products, etc.
                                            </Text>
                                            <Text color="green.600">
                                                <strong>✅ Interactive:</strong> You can enable/disable modules using the toggle switches below. Changes take effect immediately.
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Alert>
                            </VStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6} align="stretch">
                                {/* Debug Information */}
                                <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                                    <Text fontWeight="bold" mb={2} color="blue.800">🔍 Debug Information:</Text>
                                    <VStack align="start" spacing={1} fontSize="sm">
                                        <Text><strong>Total Available Modules:</strong> {modulesData?.availableModules?.length || 'Loading...'}</Text>
                                        <Text><strong>Enabled Modules for this Tenant:</strong> {tenant.moduleConfig?.filter((m: any) => m.enabled).length || 0}</Text>
                                        <Text><strong>Total Module Config Entries:</strong> {tenant.moduleConfig?.length || 0}</Text>
                                        <Text><strong>Tenant Subscription Tier:</strong> {tenant.subscriptionTier}</Text>
                                    </VStack>
                                </Box>

                                {/* Enabled Modules */}
                                {tenant.moduleConfig && tenant.moduleConfig.length > 0 ? (
                                    <Box>
                                        <Text fontWeight="bold" mb={3} fontSize="lg">📦 Module Configuration Status:</Text>
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                            {tenant.moduleConfig.map((module: any) => {
                                                const availableModule = modulesData?.availableModules?.find((m: any) => m.id === module.moduleId);
                                                return (
                                                    <VStack key={module.moduleId} align="start" p={4} border="1px" borderColor={cardBorder} borderRadius="md" bg={module.enabled ? (colorMode === 'light' ? "green.50" : "rgba(34, 197, 94, 0.1)") : (colorMode === 'light' ? "gray.50" : "rgba(45, 45, 55, 0.3)")}>
                                                        <HStack justify="space-between" w="100%">
                                                            <Badge colorScheme={module.enabled ? "green" : "gray"} fontSize="sm" p={1}>
                                                                {module.enabled ? "✅ ENABLED" : "❌ DISABLED"}
                                                            </Badge>
                                                            <Text fontSize="xs" color={textMuted}>v{module.version}</Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Text>{availableModule?.icon || "📦"}</Text>
                                                            <Text fontWeight="bold" fontSize="md" color={textPrimary}>
                                                                {availableModule?.name || (module.moduleId.charAt(0).toUpperCase() + module.moduleId.slice(1))}
                                                            </Text>
                                                        </HStack>
                                                        {availableModule?.description && (
                                                            <Text fontSize="xs" color={textMuted}>
                                                                {availableModule.description}
                                                            </Text>
                                                        )}
                                                        {module.enabledAt && (
                                                            <Text fontSize="xs" color={textMuted}>
                                                                Enabled: {new Date(module.enabledAt).toLocaleDateString()}
                                                            </Text>
                                                        )}
                                                        <Text fontSize="xs" color={textMuted}>
                                                            Required Tier: {availableModule?.requiredTier || 'Unknown'}
                                                        </Text>
                                                    </VStack>
                                                );
                                            })}
                                        </SimpleGrid>
                                    </Box>
                                ) : (
                                    <Box p={8} textAlign="center" bg={infoBg} borderRadius="md">
                                        <Text color={textSecondary} fontSize="lg">
                                            📦 No modules configured
                                        </Text>
                                        <Text color={textMuted} fontSize="sm" mt={2}>
                                            Contact your system administrator to enable business modules for this tenant.
                                        </Text>
                                    </Box>
                                )}

                                {/* Available Modules (not enabled) */}
                                {modulesData?.availableModules && (
                                    <Box>
                                        <Text fontWeight="bold" mb={3} fontSize="lg">🔧 Module Configuration (Interactive):</Text>
                                        <Alert status="info" variant="left-accent" mb={4}>
                                            <AlertIcon />
                                            <Text fontSize="sm">
                                                Toggle modules on/off for this tenant. Changes take effect immediately.
                                            </Text>
                                        </Alert>
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                            {modulesData.availableModules.map((module: any) => {
                                                const isEnabled = tenant.moduleConfig?.some((m: any) => m.moduleId === module.id && m.enabled);
                                                const tierHierarchy = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'];
                                                const moduleRequiredTierIndex = tierHierarchy.indexOf(module.requiredTier);
                                                const tenantTierIndex = tierHierarchy.indexOf(tenant.subscriptionTier);
                                                const canEnable = tenantTierIndex >= moduleRequiredTierIndex;
                                                
                                                return (
                                                    <VStack key={module.id} align="start" p={4} border="1px" borderColor={isEnabled ? (colorMode === 'light' ? "green.200" : "rgba(34, 197, 94, 0.3)") : cardBorder} borderRadius="md" bg={isEnabled ? (colorMode === 'light' ? "green.50" : "rgba(34, 197, 94, 0.1)") : (colorMode === 'light' ? "white" : "rgba(45, 45, 55, 0.3)")} spacing={3}>
                                                        <HStack justify="space-between" w="100%">
                                                            <HStack>
                                                                <Text fontSize="lg">{module.icon}</Text>
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="bold" fontSize="sm" color={textPrimary}>
                                                                        {module.name}
                                                                    </Text>
                                                                    <Text fontSize="xs" color={textMuted}>
                                                                        {module.id}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                            <Switch
                                                                isChecked={isEnabled}
                                                                onChange={() => handleToggleModule(module.id, isEnabled)}
                                                                isDisabled={!canEnable && !isEnabled}
                                                                colorScheme="green"
                                                                size="md"
                                                            />
                                                        </HStack>
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {module.description}
                                                        </Text>
                                                        <HStack spacing={2} flexWrap="wrap">
                                                            <Badge size="xs" colorScheme="blue">v{module.version}</Badge>
                                                            <Badge 
                                                                size="xs" 
                                                                colorScheme={canEnable ? "purple" : "red"}
                                                            >
                                                                {module.requiredTier}
                                                                {!canEnable && " ⚠️"}
                                                            </Badge>
                                                            {isEnabled && <Badge colorScheme="green" size="xs">ACTIVE</Badge>}
                                                        </HStack>
                                                        {!canEnable && !isEnabled && (
                                                            <Text fontSize="xs" color={colorMode === 'light' ? "red.500" : "red.300"}>
                                                                Requires {module.requiredTier} tier (current: {tenant.subscriptionTier})
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                );
                                            })}
                                        </SimpleGrid>
                                    </Box>
                                )}

                                {/* Raw Data for Debugging */}
                                <Box p={4} bg="gray.100" borderRadius="md" border="1px" borderColor="gray.300">
                                    <Text fontWeight="bold" mb={2} color="gray.700">🔧 Raw Module Data (for debugging):</Text>
                                    <Text fontSize="xs" fontFamily="monospace" color={textMuted}>
                                        {JSON.stringify(tenant.moduleConfig, null, 2)}
                                    </Text>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Action Buttons - Only show if not editing (editing buttons are in header) */}
                    {!isEditing && (
                        <HStack justify="center">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/admin/tenants")}
                            >
                                Back to Tenants List
                            </Button>
                        </HStack>
                    )}
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default EditTenant; 