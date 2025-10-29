import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Badge,
    IconButton,
    useToast,
    Divider,
    Link,
    Icon,
    useColorMode
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CopyIcon, ExternalLinkIcon, LockIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { UnifiedLoginModal } from "../authentication";
import { CaptureUserDetailsModal } from "../authentication/components/CaptureUserDetailsModal";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { Password } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const PUBLIC_PASSWORD_ACCESS = gql`
    query PublicPasswordAccess($input: PublicPasswordAccessInput!) {
        publicPasswordAccess(input: $input) {
            id
            serviceName
            loginUrl
            dashboardUrl
            username
            email
            password
            twoFactorSecret
            twoFactorBackupCodes
            notes
            expiresAt
            issuedTo {
                id
                fName
                lName
            }
        }
    }
`;

interface PublicPasswordAccessInput {
    passwordId: string;
    mobileNumber: string;
    verificationCode: string;
}

const PublicPasswordAccess: React.FC = () => {
    usePageTitle("Password Access");
    const { id: passwordId } = useParams<{ id: string }>();
    const toast = useToast();
    const { user } = useAuth();
    const { colorMode } = useColorMode();
    const authLoading = false; // AuthContext doesn't have isLoading
    
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [verificationData, setVerificationData] = useState<PublicPasswordAccessInput | null>(null);
    const [userId, setUserId] = useState<string>("");
    
    // Brand styling
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const primaryColor = getColor("primary", colorMode);
    const primaryHover = getColor("primaryHover", colorMode);
    const successGreen = getColor("successGreen", colorMode);
    const errorRed = getColor("status.error", colorMode);
    const infoBlue = getColor("status.info", colorMode);

    const [getPassword, { data, loading, error }] = useLazyQuery(PUBLIC_PASSWORD_ACCESS);

    useEffect(() => {
        // Check if user is authenticated
        if (!authLoading && !user && !showLoginModal && !showDetailsModal) {
            setShowLoginModal(true);
        }
    }, [authLoading, user, showLoginModal, showDetailsModal]);

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        
        // After successful login, check if user needs to provide details
        if (user && (!user.firstName || !user.lastName)) {
            setUserId(user.id || "");
            setShowDetailsModal(true);
        } else if (user && passwordId) {
            // User is fully authenticated, fetch the password
            // Note: We'll need to get the verification code from somewhere
            // For now, just close the modal and let them access
            if (passwordId) {
                const input: PublicPasswordAccessInput = {
                    passwordId,
                    mobileNumber: user.mobileNumber || "",
                    verificationCode: "verified" // This would come from SMS verification
                };
                setVerificationData(input);
                getPassword({
                    variables: { input }
                });
            }
        }
    };

    const handleDetailsUpdateSuccess = () => {
        setShowDetailsModal(false);
        // Now fetch the password with the stored verification data
        if (verificationData) {
            getPassword({
                variables: {
                    input: verificationData
                }
            });
        }
    };

    const fetchPassword = (mobileNumber: string, verificationCode: string) => {
        if (!passwordId) return;
        
        const input: PublicPasswordAccessInput = {
            passwordId,
            mobileNumber,
            verificationCode
        };
        
        setVerificationData(input);
        
        getPassword({
            variables: { input }
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} copied to clipboard`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    const isExpired = (expiresAt?: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    if (authLoading || loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text color={textPrimary}>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box bg={bgMain} minH="100vh" display="flex" alignItems="center" justifyContent="center" py={8}>
            <Container maxW="container.md">
                {/* Login Modal */}
                <UnifiedLoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />

                {/* Capture Details Modal */}
                <CaptureUserDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    userId={userId}
                    onUpdateSuccess={handleDetailsUpdateSuccess}
                />

                {/* Error State */}
                {error && (
                    <Alert 
                        status="error" 
                        borderRadius="lg"
                        bg={errorRed}
                        color="white"
                    >
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Access Denied</AlertTitle>
                            <AlertDescription>
                                {error.message}
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}

                {/* Success State - Password Display */}
                {data?.publicPasswordAccess && (
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <VStack spacing={6} align="stretch">
                                {/* Header */}
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Heading 
                                            size="lg" 
                                            color={textPrimary}
                                            fontFamily={brandConfig.fonts.heading}
                                        >
                                            <Icon as={LockIcon} mr={2} />
                                            {data.publicPasswordAccess.serviceName}
                                        </Heading>
                                        {data.publicPasswordAccess.expiresAt && (
                                            <Badge 
                                                colorScheme={isExpired(data.publicPasswordAccess.expiresAt) ? "red" : "green"}
                                                fontSize="sm"
                                                px={3}
                                                py={1}
                                            >
                                                {isExpired(data.publicPasswordAccess.expiresAt) 
                                                    ? "Expired" 
                                                    : `Expires ${format(new Date(data.publicPasswordAccess.expiresAt), "MMM dd, yyyy")}`}
                                            </Badge>
                                        )}
                                    </HStack>
                                    <Text color={textMuted} fontSize="sm">
                                        Issued to: {data.publicPasswordAccess.issuedTo.name}
                                    </Text>
                                </Box>

                                <Divider borderColor={cardBorder} />

                                {/* Login URLs */}
                                <VStack align="stretch" spacing={3}>
                                    <Box>
                                        <Text color={textMuted} fontSize="sm" mb={2}>Login URL</Text>
                                        <HStack>
                                            <Link 
                                                href={data.publicPasswordAccess.loginUrl}
                                                isExternal
                                                color={infoBlue}
                                                fontSize="sm"
                                            >
                                                {data.publicPasswordAccess.loginUrl}
                                            </Link>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Open login page"
                                                icon={<ExternalLinkIcon />}
                                                onClick={() => window.open(data.publicPasswordAccess.loginUrl, '_blank')}
                                            />
                                        </HStack>
                                    </Box>

                                    {data.publicPasswordAccess.dashboardUrl && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Dashboard URL (after login)</Text>
                                            <HStack>
                                                <Link 
                                                    href={data.publicPasswordAccess.dashboardUrl}
                                                    isExternal
                                                    color={successGreen}
                                                    fontSize="sm"
                                                >
                                                    {data.publicPasswordAccess.dashboardUrl}
                                                </Link>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Open dashboard"
                                                    icon={<ExternalLinkIcon />}
                                                    onClick={() => window.open(data.publicPasswordAccess.dashboardUrl, '_blank')}
                                                />
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>

                                <Divider borderColor={cardBorder} />

                                {/* Credentials */}
                                <VStack align="stretch" spacing={4}>
                                    {data.publicPasswordAccess.email && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Email</Text>
                                            <HStack>
                                                <Text color={textPrimary} fontFamily="mono">
                                                    {data.publicPasswordAccess.email}
                                                </Text>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy email"
                                                    icon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(data.publicPasswordAccess.email!, "Email")}
                                                />
                                            </HStack>
                                        </Box>
                                    )}

                                    {data.publicPasswordAccess.username && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Username</Text>
                                            <HStack>
                                                <Text color={textPrimary} fontFamily="mono">
                                                    {data.publicPasswordAccess.username}
                                                </Text>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy username"
                                                    icon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(data.publicPasswordAccess.username!, "Username")}
                                                />
                                            </HStack>
                                        </Box>
                                    )}

                                    <Box>
                                        <Text color={textMuted} fontSize="sm" mb={2}>Password</Text>
                                        <HStack>
                                            <Text color={textPrimary} fontFamily="mono" fontSize="lg">
                                                {showPassword 
                                                    ? data.publicPasswordAccess.password 
                                                    : "••••••••••••"}
                                            </Text>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Toggle password"
                                                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Copy password"
                                                icon={<CopyIcon />}
                                                onClick={() => copyToClipboard(data.publicPasswordAccess.password, "Password")}
                                            />
                                        </HStack>
                                    </Box>

                                    {data.publicPasswordAccess.twoFactorSecret && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>2FA Secret Key</Text>
                                            <HStack>
                                                <Text color={textPrimary} fontFamily="mono">
                                                    {show2FA 
                                                        ? data.publicPasswordAccess.twoFactorSecret 
                                                        : "••••••••••••••••"}
                                                </Text>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Toggle 2FA"
                                                    icon={show2FA ? <ViewOffIcon /> : <ViewIcon />}
                                                    onClick={() => setShow2FA(!show2FA)}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy 2FA"
                                                    icon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(data.publicPasswordAccess.twoFactorSecret!, "2FA Secret")}
                                                />
                                            </HStack>
                                            <Text color={textMuted} fontSize="xs" mt={1}>
                                                Add this to your authenticator app (Google Authenticator, Authy, etc.)
                                            </Text>
                                        </Box>
                                    )}

                                    {data.publicPasswordAccess.twoFactorBackupCodes && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Backup Codes</Text>
                                            <Card bg="rgba(0, 0, 0, 0.2)" p={3}>
                                                <Text color={textPrimary} fontFamily="mono" fontSize="sm" whiteSpace="pre">
                                                    {data.publicPasswordAccess.twoFactorBackupCodes}
                                                </Text>
                                            </Card>
                                            <Text color={errorRed} fontSize="xs" mt={1}>
                                                ⚠️ Save these codes securely. Each can only be used once.
                                            </Text>
                                        </Box>
                                    )}

                                    {data.publicPasswordAccess.notes && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Notes</Text>
                                            <Card bg="rgba(0, 0, 0, 0.2)" p={3}>
                                                <Text color={textPrimary} whiteSpace="pre-wrap">
                                                    {data.publicPasswordAccess.notes}
                                                </Text>
                                            </Card>
                                        </Box>
                                    )}
                                </VStack>

                                <Divider borderColor={cardBorder} />

                                {/* Action Buttons */}
                                <HStack justify="center" spacing={4}>
                                    <Button
                                        bg={primaryColor}
                                        color="white"
                                        _hover={{ bg: primaryHover }}
                                        leftIcon={<ExternalLinkIcon />}
                                        onClick={() => window.open(data.publicPasswordAccess.loginUrl, '_blank')}
                                    >
                                        Go to Login Page
                                    </Button>
                                    <Button
                                        variant="outline"
                                        borderColor={primaryColor}
                                        color={primaryColor}
                                        onClick={() => window.location.href = '/passwords'}
                                    >
                                        View All My Passwords
                                    </Button>
                                </HStack>

                                {/* Security Notice */}
                                <Alert status="warning" borderRadius="md" bg="rgba(251, 146, 60, 0.1)" borderColor="orange.500" border="1px">
                                    <AlertIcon color="orange.500" />
                                    <Text fontSize="sm" color={textPrimary}>
                                        This password information is sensitive. Do not share this page or leave it open on shared devices.
                                    </Text>
                                </Alert>
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                {/* Not authenticated state */}
                {!user && !showLoginModal && !showDetailsModal && (
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <VStack spacing={4}>
                                <Icon as={LockIcon} boxSize={12} color={primaryColor} />
                                <Heading size="md" color={textPrimary}>
                                    Authentication Required
                                </Heading>
                                <Text color={textSecondary} textAlign="center">
                                    You need to verify your identity to access this password.
                                </Text>
                                <Button
                                    bg={primaryColor}
                                    color="white"
                                    _hover={{ bg: primaryHover }}
                                    onClick={() => setShowLoginModal(true)}
                                >
                                    Verify with SMS
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                )}
            </Container>
        </Box>
    );
};

export default PublicPasswordAccess;