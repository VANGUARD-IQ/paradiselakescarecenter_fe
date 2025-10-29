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
    Image,
    Center,
    useDisclosure,
    Checkbox,
    IconButton,
    SimpleGrid,
    Badge,
    Divider,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, CheckIcon, EditIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { 
    EmailChangeModal,
    PhoneChangeModal
} from "../authentication";
import { getColor, getComponent } from "../../brandConfig";

const GET_CLIENT = gql`
    query GetClient($id: ID!) {
        client(id: $id) {
            id
            fName
            lName
            email
            phoneNumber
            businessName
            businessRegistrationNumber
            role
            isVerifiedSeller
            profilePhoto
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

const UPDATE_CLIENT = gql`
    mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
        updateClient(id: $id, input: $input) {
            id
            fName
            lName
            email
            phoneNumber
            businessName
            businessRegistrationNumber
            role
            isVerifiedSeller
            profilePhoto
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

const GET_TENANT_BY_CURRENT_CLIENT = gql`
    query TenantByCurrentClient {
        tenantByCurrentClient {
            id
            name
            domain
            websiteUrl
            status
            subscriptionTier
            apiKeys {
                postmarkApiKey
                cellcastApiKey
                stripePublicKey
                stripeSecretKey
                stripeWebhookSecret
            }
            branding {
                siteName
                tagline
                description
                logo
                favicon
                primaryColor
                secondaryColor
                accentColor
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
            createdAt
            updatedAt
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
            apiKeys {
                postmarkApiKey
                cellcastApiKey
                stripePublicKey
                stripeSecretKey
                stripeWebhookSecret
            }
            branding {
                siteName
                tagline
                description
                logo
                favicon
                primaryColor
                secondaryColor
                accentColor
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
            updatedAt
        }
    }
`;

const UPLOAD_UNENCRYPTED_FILE = gql`
    mutation UploadUnencrypted($file: Upload!) {
        uploadUnencryptedFile(file: $file)
    }
`;

const EditProfile = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, refreshAuth } = useAuth();
    const bg = getColor("background.main");
    
    // Consistent styling from brandConfig for dark theme
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark"); // White text
    const textSecondary = getColor("text.secondaryDark"); // 70% white
    const textMuted = getColor("text.mutedDark"); // 50% white
    const textInverse = getColor("text.inverse"); // Pure white
    const accentBlue = getColor("accentBlue");
    const primaryColor = getColor("primary");
    const primaryHover = getColor("primaryHover");

    // Modal controls
    const { isOpen: isEmailModalOpen, onOpen: onEmailModalOpen, onClose: onEmailModalClose } = useDisclosure();
    const { isOpen: isSmsModalOpen, onOpen: onSmsModalOpen, onClose: onSmsModalClose } = useDisclosure();

    const [formData, setFormData] = React.useState({
        fName: "",
        lName: "",
        email: "",
        phoneNumber: "",
        businessName: "",
        businessRegistrationNumber: "",
        role: "BUYER",
        profilePhoto: "",
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

    const [pendingChanges, setPendingChanges] = React.useState({
        email: "",
        phoneNumber: "",
    });

    const [tenantFormData, setTenantFormData] = React.useState({
        id: "",
        name: "",
        domain: "",
        websiteUrl: "",
        apiKeys: {
            postmarkApiKey: "",
            cellcastApiKey: "",
            stripePublicKey: "",
            stripeSecretKey: "",
            stripeWebhookSecret: "",
        },
        branding: {
            siteName: "",
            tagline: "",
            description: "",
            logo: "",
            favicon: "",
            primaryColor: "",
            secondaryColor: "",
            accentColor: "",
        },
        emailConfig: {
            fromEmail: "",
            fromName: "",
            replyToEmail: "",
        },
    });

    const { data, loading: queryLoading, refetch } = useQuery(GET_CLIENT, {
        variables: { id: user?.id },
        skip: !user?.id,
        onCompleted: (data) => {
            if (data?.client) {
                setFormData({
                    fName: data.client.fName || "",
                    lName: data.client.lName || "",
                    email: data.client.email || "",
                    phoneNumber: data.client.phoneNumber || "",
                    businessName: data.client.businessName || "",
                    businessRegistrationNumber: data.client.businessRegistrationNumber || "",
                    role: data.client.role || "BUYER",
                    profilePhoto: data.client.profilePhoto || "",
                    paymentReceivingDetails: {
                        acceptedMethods: data.client.paymentReceivingDetails?.acceptedMethods || [],
                        bankAccount: {
                            accountName: data.client.paymentReceivingDetails?.bankAccount?.accountName || "",
                            bsb: data.client.paymentReceivingDetails?.bankAccount?.bsb || "",
                            accountNumber: data.client.paymentReceivingDetails?.bankAccount?.accountNumber || "",
                            bankName: data.client.paymentReceivingDetails?.bankAccount?.bankName || "",
                            swiftCode: data.client.paymentReceivingDetails?.bankAccount?.swiftCode || "",
                        },
                        cryptoWallets: data.client.paymentReceivingDetails?.cryptoWallets || [],
                        stripeConnect: {
                            stripeAccountId: data.client.paymentReceivingDetails?.stripeConnect?.stripeAccountId || "",
                            accountVerified: data.client.paymentReceivingDetails?.stripeConnect?.accountVerified || false,
                            verifiedAt: data.client.paymentReceivingDetails?.stripeConnect?.verifiedAt || null,
                        },
                        paypalEmail: data.client.paymentReceivingDetails?.paypalEmail || "",
                        isVerified: data.client.paymentReceivingDetails?.isVerified || false,
                        cryptoDiscountPercentage: data.client.paymentReceivingDetails?.cryptoDiscountPercentage || undefined,
                    },
                });
            }
        }
    });

    const { data: tenantData, loading: tenantLoading, refetch: refetchTenant } = useQuery(GET_TENANT_BY_CURRENT_CLIENT, {
        skip: !user?.id,
        onCompleted: (data) => {
            if (data?.tenantByCurrentClient) {
                setTenantFormData({
                    id: data.tenantByCurrentClient.id,
                    name: data.tenantByCurrentClient.name || "",
                    domain: data.tenantByCurrentClient.domain || "",
                    websiteUrl: data.tenantByCurrentClient.websiteUrl || "",
                    apiKeys: {
                        postmarkApiKey: data.tenantByCurrentClient.apiKeys?.postmarkApiKey || "",
                        cellcastApiKey: data.tenantByCurrentClient.apiKeys?.cellcastApiKey || "",
                        stripePublicKey: data.tenantByCurrentClient.apiKeys?.stripePublicKey || "",
                        stripeSecretKey: data.tenantByCurrentClient.apiKeys?.stripeSecretKey || "",
                        stripeWebhookSecret: data.tenantByCurrentClient.apiKeys?.stripeWebhookSecret || "",
                    },
                    branding: {
                        siteName: data.tenantByCurrentClient.branding?.siteName || "",
                        tagline: data.tenantByCurrentClient.branding?.tagline || "",
                        description: data.tenantByCurrentClient.branding?.description || "",
                        logo: data.tenantByCurrentClient.branding?.logo || "",
                        favicon: data.tenantByCurrentClient.branding?.favicon || "",
                        primaryColor: data.tenantByCurrentClient.branding?.primaryColor || "",
                        secondaryColor: data.tenantByCurrentClient.branding?.secondaryColor || "",
                        accentColor: data.tenantByCurrentClient.branding?.accentColor || "",
                    },
                    emailConfig: {
                        fromEmail: data.tenantByCurrentClient.emailConfig?.fromEmail || "",
                        fromName: data.tenantByCurrentClient.emailConfig?.fromName || "",
                        replyToEmail: data.tenantByCurrentClient.emailConfig?.replyToEmail || "",
                    },
                });
            }
        }
    });

    const [updateClient, { loading: updateLoading }] = useMutation(UPDATE_CLIENT, {
        onCompleted: () => {
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully",
                status: "success",
                duration: 3000
            });
            // Refresh auth context if email or phone changed
            if (pendingChanges.email || pendingChanges.phoneNumber) {
                refreshAuth();
            }
            navigate("/profile");
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

    const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);

    const [updateTenant, { loading: updateTenantLoading }] = useMutation(UPDATE_TENANT, {
        onCompleted: () => {
            toast({
                title: "Website Settings Updated",
                description: "Your website settings have been updated successfully",
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

    const handleTenantInputChange = (field: string, value: string) => {
        setTenantFormData(prev => ({
            ...prev,
            [field]: value
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

    const handleTenantBrandingChange = (field: string, value: string) => {
        setTenantFormData(prev => ({
            ...prev,
            branding: {
                ...prev.branding,
                [field]: value
            }
        }));
    };

    const handleTenantEmailConfigChange = (field: string, value: string) => {
        setTenantFormData(prev => ({
            ...prev,
            emailConfig: {
                ...prev.emailConfig,
                [field]: value
            }
        }));
    };

    const handleEmailChange = () => {
        if (formData.email !== data?.client?.email) {
            setPendingChanges(prev => ({ ...prev, email: formData.email }));
            onEmailModalOpen();
        }
    };

    const handlePhoneChange = () => {
        if (formData.phoneNumber !== data?.client?.phoneNumber) {
            setPendingChanges(prev => ({ ...prev, phoneNumber: formData.phoneNumber }));
            onSmsModalOpen();
        }
    };

    const handleEmailVerificationSuccess = async () => {
        onEmailModalClose();
        toast({
            title: "Email Verified",
            description: "Your email has been verified and updated",
            status: "success",
            duration: 3000
        });
        
        // Clean up the input to remove __typename fields
        const cleanInput = {
            ...formData,
            email: pendingChanges.email,
            paymentReceivingDetails: {
                ...formData.paymentReceivingDetails,
                cryptoWallets: formData.paymentReceivingDetails.cryptoWallets.map(wallet => ({
                    walletAddress: wallet.walletAddress,
                    network: wallet.network,
                    memo: wallet.memo
                })),
                bankAccount: formData.paymentReceivingDetails.bankAccount ? {
                    accountName: formData.paymentReceivingDetails.bankAccount.accountName,
                    bsb: formData.paymentReceivingDetails.bankAccount.bsb,
                    accountNumber: formData.paymentReceivingDetails.bankAccount.accountNumber,
                    bankName: formData.paymentReceivingDetails.bankAccount.bankName,
                    swiftCode: formData.paymentReceivingDetails.bankAccount.swiftCode
                } : undefined,
                stripeConnect: formData.paymentReceivingDetails.stripeConnect ? {
                    stripeAccountId: formData.paymentReceivingDetails.stripeConnect.stripeAccountId,
                    accountVerified: formData.paymentReceivingDetails.stripeConnect.accountVerified,
                    verifiedAt: formData.paymentReceivingDetails.stripeConnect.verifiedAt
                } : undefined,
                cryptoDiscountPercentage: formData.paymentReceivingDetails.cryptoDiscountPercentage
            }
        };
        
        // Update the client with new email
        await updateClient({
            variables: {
                id: user?.id,
                input: cleanInput
            }
        });
        setPendingChanges(prev => ({ ...prev, email: "" }));
    };

    const handleSmsVerificationSuccess = async () => {
        onSmsModalClose();
        toast({
            title: "Phone Number Verified",
            description: "Your phone number has been verified and updated",
            status: "success",
            duration: 3000
        });
        
        // Clean up the input to remove __typename fields
        const cleanInput = {
            ...formData,
            phoneNumber: pendingChanges.phoneNumber,
            paymentReceivingDetails: {
                ...formData.paymentReceivingDetails,
                cryptoWallets: formData.paymentReceivingDetails.cryptoWallets.map(wallet => ({
                    walletAddress: wallet.walletAddress,
                    network: wallet.network,
                    memo: wallet.memo
                })),
                bankAccount: formData.paymentReceivingDetails.bankAccount ? {
                    accountName: formData.paymentReceivingDetails.bankAccount.accountName,
                    bsb: formData.paymentReceivingDetails.bankAccount.bsb,
                    accountNumber: formData.paymentReceivingDetails.bankAccount.accountNumber,
                    bankName: formData.paymentReceivingDetails.bankAccount.bankName,
                    swiftCode: formData.paymentReceivingDetails.bankAccount.swiftCode
                } : undefined,
                stripeConnect: formData.paymentReceivingDetails.stripeConnect ? {
                    stripeAccountId: formData.paymentReceivingDetails.stripeConnect.stripeAccountId,
                    accountVerified: formData.paymentReceivingDetails.stripeConnect.accountVerified,
                    verifiedAt: formData.paymentReceivingDetails.stripeConnect.verifiedAt
                } : undefined,
                cryptoDiscountPercentage: formData.paymentReceivingDetails.cryptoDiscountPercentage
            }
        };
        
        // Update the client with new phone number
        await updateClient({
            variables: {
                id: user?.id,
                input: cleanInput
            }
        });
        setPendingChanges(prev => ({ ...prev, phoneNumber: "" }));
    };

    const handleSave = async () => {
        if (!user?.id) return;

        // Check if email or phone changed
        const emailChanged = formData.email !== data?.client?.email;
        const phoneChanged = formData.phoneNumber !== data?.client?.phoneNumber;

        if (emailChanged) {
            handleEmailChange();
            return;
        }

        if (phoneChanged) {
            handlePhoneChange();
            return;
        }

        try {
            // Clean up the input to remove __typename fields
            const cleanInput = {
                ...formData,
                paymentReceivingDetails: {
                    ...formData.paymentReceivingDetails,
                    cryptoWallets: formData.paymentReceivingDetails.cryptoWallets.map(wallet => ({
                        walletAddress: wallet.walletAddress,
                        network: wallet.network,
                        memo: wallet.memo
                    })),
                    bankAccount: formData.paymentReceivingDetails.bankAccount ? {
                        accountName: formData.paymentReceivingDetails.bankAccount.accountName,
                        bsb: formData.paymentReceivingDetails.bankAccount.bsb,
                        accountNumber: formData.paymentReceivingDetails.bankAccount.accountNumber,
                        bankName: formData.paymentReceivingDetails.bankAccount.bankName,
                        swiftCode: formData.paymentReceivingDetails.bankAccount.swiftCode
                    } : undefined,
                    stripeConnect: formData.paymentReceivingDetails.stripeConnect ? {
                        stripeAccountId: formData.paymentReceivingDetails.stripeConnect.stripeAccountId,
                        accountVerified: formData.paymentReceivingDetails.stripeConnect.accountVerified,
                        verifiedAt: formData.paymentReceivingDetails.stripeConnect.verifiedAt
                    } : undefined,
                    cryptoDiscountPercentage: formData.paymentReceivingDetails.cryptoDiscountPercentage
                }
            };

            // Update client profile
            await updateClient({
                variables: {
                    id: user.id,
                    input: cleanInput
                }
            });

            // Update tenant if it exists
            if (tenantFormData.id) {
                await updateTenant({
                    variables: {
                        id: tenantFormData.id,
                        input: {
                            name: tenantFormData.name,
                            domain: tenantFormData.domain,
                            websiteUrl: tenantFormData.websiteUrl,
                            apiKeys: tenantFormData.apiKeys,
                            branding: tenantFormData.branding,
                            emailConfig: tenantFormData.emailConfig,
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            const file = e.target.files[0];
            const { data } = await uploadFile({
                variables: { file },
                context: {
                    headers: {
                        "apollo-require-preflight": "true",
                        "x-apollo-operation-name": "UploadUnencryptedFile"
                    }
                }
            });

            const hash = data.uploadUnencryptedFile;
            const newPhotoUrl = `https://gateway.lighthouse.storage/ipfs/${hash}`;

            setFormData(prev => ({
                ...prev,
                profilePhoto: newPhotoUrl
            }));

            toast({
                title: "Photo uploaded successfully",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        }
    };

    if (queryLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading profile details...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const emailChanged = formData.email !== data?.client?.email;
    const phoneChanged = formData.phoneNumber !== data?.client?.phoneNumber;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/profile")}
                                leftIcon={<ArrowBackIcon />}
                            >
                                Back to Profile
                            </Button>
                            <Heading size="lg" color={textInverse}>✏️ Edit Profile</Heading>
                            <Text color={textSecondary}>Update your personal and business information</Text>
                            {user?.id && (
                                <Text fontSize="sm" color={textMuted}>
                                    Client ID: <Text as="span" fontFamily="mono" color={textSecondary}>{user.id}</Text>
                                </Text>
                            )}
                        </VStack>
                    </HStack>

                    {(emailChanged || phoneChanged) && (
                        <Alert status="warning">
                            <AlertIcon />
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">Verification Required</Text>
                                <Text>
                                    {emailChanged && "Email changes require verification via email. "}
                                    {phoneChanged && "Phone number changes require SMS verification. "}
                                    Click "Save Changes" to start the verification process.
                                </Text>
                            </VStack>
                        </Alert>
                    )}

                    {/* Profile Photo Card */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textInverse}>Profile Photo</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6} align="center">
                                <Box
                                    position="relative"
                                    width="200px"
                                    height="200px"
                                    borderRadius="full"
                                    overflow="hidden"
                                    border="3px solid"
                                    borderColor={accentBlue}
                                >
                                    {formData.profilePhoto ? (
                                        <Image
                                            src={formData.profilePhoto}
                                            alt={`${formData.fName} ${formData.lName}`}
                                            width="100%"
                                            height="100%"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <Center
                                            width="100%"
                                            height="100%"
                                            bg="rgba(59, 130, 246, 0.1)"
                                        >
                                            <Text fontSize="6xl" color={textInverse}>
                                                {formData.fName?.[0]?.toUpperCase() || ""}
                                                {formData.lName?.[0]?.toUpperCase() || ""}
                                            </Text>
                                        </Center>
                                    )}
                                </Box>

                                <FormControl>
                                    <FormLabel
                                        color={textSecondary}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Upload New Photo
                                    </FormLabel>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                        }}
                                    />
                                    <Text fontSize="sm" color={textMuted} mt={1}>
                                        Upload a square photo for best results
                                    </Text>
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Personal Information */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textInverse}>Personal Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6}>
                                <FormControl>
                                    <FormLabel color={textSecondary}>First Name</FormLabel>
                                    <Input
                                        value={formData.fName}
                                        onChange={(e) => handleInputChange("fName", e.target.value)}
                                        placeholder="John"
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
                                    <FormLabel color={textSecondary}>Last Name</FormLabel>
                                    <Input
                                        value={formData.lName}
                                        onChange={(e) => handleInputChange("lName", e.target.value)}
                                        placeholder="Doe"
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
                                    <FormLabel color={textSecondary}>
                                        Email Address
                                        {emailChanged && (
                                            <Text as="span" color="orange.500" fontSize="sm" ml={2}>
                                                (Verification required)
                                            </Text>
                                        )}
                                    </FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="john@example.com"
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px"
                                        borderColor={emailChanged ? "orange.300" : cardBorder}
                                        color={textInverse}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 1px ${primaryColor}`
                                        }}
                                    />
                                    {emailChanged && (
                                        <Text fontSize="sm" color="orange.600" mt={1}>
                                            Email verification will be required to save this change
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel color={textSecondary}>
                                        Phone Number
                                        {phoneChanged && (
                                            <Text as="span" color="orange.500" fontSize="sm" ml={2}>
                                                (SMS verification required)
                                            </Text>
                                        )}
                                    </FormLabel>
                                    <Input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="+61412345678"
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px"
                                        borderColor={phoneChanged ? "orange.300" : cardBorder}
                                        color={textInverse}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 1px ${primaryColor}`
                                        }}
                                    />
                                    {phoneChanged && (
                                        <Text fontSize="sm" color="orange.600" mt={1}>
                                            SMS verification will be required to save this change
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel color={textSecondary}>Role</FormLabel>
                                    <Select
                                        value={formData.role}
                                        onChange={(e) => handleInputChange("role", e.target.value)}
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textInverse}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: primaryColor,
                                            boxShadow: `0 0 0 1px ${primaryColor}`
                                        }}
                                    >
                                        <option value="BUYER">Buyer</option>
                                        <option value="SELLER">Seller</option>
                                        <option value="BOTH">Both</option>
                                    </Select>
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Action Buttons */}
                    <HStack justify="flex-end" spacing={4}>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/profile")}
                            borderColor={cardBorder}
                            color={textSecondary}
                            _hover={{ borderColor: primaryColor, color: textInverse }}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleSave}
                            isLoading={updateLoading}
                            loadingText="Saving..."
                            bg={primaryColor}
                            _hover={{ bg: accentBlue }}
                        >
                            Save Changes
                        </Button>
                    </HStack>
                </VStack>
            </Container>
            <FooterWithFourColumns />

            {/* Email Verification Modal */}
            <EmailChangeModal
                isOpen={isEmailModalOpen}
                onClose={() => {
                    onEmailModalClose();
                    // Reset email to original value if they cancel
                    setFormData(prev => ({ ...prev, email: data?.client?.email || "" }));
                    setPendingChanges(prev => ({ ...prev, email: "" }));
                }}
                clientId={user?.id || ""}
                newEmail={pendingChanges.email || formData.email}
                onSuccess={handleEmailVerificationSuccess}
            />

            {/* Phone Verification Modal */}
            <PhoneChangeModal
                isOpen={isSmsModalOpen}
                onClose={() => {
                    onSmsModalClose();
                    // Reset phone to original value if they cancel
                    setFormData(prev => ({ ...prev, phoneNumber: data?.client?.phoneNumber || "" }));
                    setPendingChanges(prev => ({ ...prev, phoneNumber: "" }));
                }}
                clientId={user?.id || ""}
                newPhoneNumber={pendingChanges.phoneNumber || formData.phoneNumber}
                onSuccess={handleSmsVerificationSuccess}
            />
        </Box>
    );
};

export default EditProfile; 