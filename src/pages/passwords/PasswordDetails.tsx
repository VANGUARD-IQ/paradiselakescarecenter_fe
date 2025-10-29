import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    useColorMode,
    VStack,
    HStack,
    Card,
    CardBody,
    CardHeader,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    InputGroup,
    InputRightElement,
    IconButton,
    Badge,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    useToast,
    Divider,
    Button,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import passwordsModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { IPFSVideoPlayer } from "../../components/IPFSVideoPlayer";

const GET_PASSWORD = gql`
    query GetPassword($id: ID!) {
        password(id: $id) {
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
            company {
                id
                name
                tradingName
            }
            createdBy {
                id
                fName
                lName
                email
            }
            isActive
            expiresAt
            instructionalVideos {
                ipfsHash
                title
                description
                ipfsUrl
            }
            createdAt
            updatedAt
        }
    }
`;

const PasswordDetails: React.FC = () => {
    usePageTitle("Password Details");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const [showPassword, setShowPassword] = useState(false);
    const [showTwoFactor, setShowTwoFactor] = useState(false);

    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const { data, loading, error } = useQuery(GET_PASSWORD, {
        variables: { id },
        skip: !id,
    });

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} copied`,
            status: "success",
            duration: 2000,
        });
    };

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <Spinner size="xl" />
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !data?.password) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        {error?.message || "Password not found"}
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const password = data.password;
    const isExpired = password.expiresAt && new Date(password.expiresAt) < new Date();

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />

            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                                {password.serviceName}
                            </Heading>
                            <HStack>
                                <Badge colorScheme={password.isActive ? "green" : "red"}>
                                    {password.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {isExpired && (
                                    <Badge colorScheme="orange">Expired</Badge>
                                )}
                            </HStack>
                        </VStack>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/passwords/admin")}
                        >
                            Back to Passwords
                        </Button>
                    </HStack>

                    {/* Password Information Card */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardHeader>
                            <Heading size="md" color={textPrimary}>Login Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                {password.loginUrl && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Login URL</FormLabel>
                                        <HStack>
                                            <Input
                                                value={password.loginUrl}
                                                isReadOnly
                                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                color={textPrimary}
                                            />
                                            <IconButton
                                                aria-label="Open URL"
                                                icon={<ExternalLinkIcon />}
                                                onClick={() => window.open(password.loginUrl, '_blank')}
                                            />
                                        </HStack>
                                    </FormControl>
                                )}

                                {password.dashboardUrl && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Dashboard URL</FormLabel>
                                        <HStack>
                                            <Input
                                                value={password.dashboardUrl}
                                                isReadOnly
                                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                color={textPrimary}
                                            />
                                            <IconButton
                                                aria-label="Open URL"
                                                icon={<ExternalLinkIcon />}
                                                onClick={() => window.open(password.dashboardUrl, '_blank')}
                                            />
                                        </HStack>
                                    </FormControl>
                                )}

                                {password.username && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Username</FormLabel>
                                        <InputGroup>
                                            <Input
                                                value={password.username}
                                                isReadOnly
                                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                color={textPrimary}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy username"
                                                    icon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(password.username, "Username")}
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                )}

                                {password.email && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Email</FormLabel>
                                        <InputGroup>
                                            <Input
                                                value={password.email}
                                                isReadOnly
                                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                color={textPrimary}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy email"
                                                    icon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(password.email, "Email")}
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                )}

                                <FormControl>
                                    <FormLabel color={textPrimary}>Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password.password}
                                            isReadOnly
                                            bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                            color={textPrimary}
                                            fontFamily="mono"
                                        />
                                        <InputRightElement width="4.5rem">
                                            <HStack spacing={1}>
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
                                                    onClick={() => copyToClipboard(password.password, "Password")}
                                                />
                                            </HStack>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                {password.twoFactorSecret && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>2FA Secret</FormLabel>
                                        <InputGroup>
                                            <Input
                                                type={showTwoFactor ? "text" : "password"}
                                                value={password.twoFactorSecret}
                                                isReadOnly
                                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                color={textPrimary}
                                                fontFamily="mono"
                                            />
                                            <InputRightElement width="4.5rem">
                                                <HStack spacing={1}>
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="Toggle 2FA"
                                                        icon={showTwoFactor ? <ViewOffIcon /> : <ViewIcon />}
                                                        onClick={() => setShowTwoFactor(!showTwoFactor)}
                                                    />
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="Copy 2FA"
                                                        icon={<CopyIcon />}
                                                        onClick={() => copyToClipboard(password.twoFactorSecret, "2FA Secret")}
                                                    />
                                                </HStack>
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                )}

                                {password.notes && (
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Notes</FormLabel>
                                        <Textarea
                                            value={password.notes}
                                            isReadOnly
                                            bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                            color={textPrimary}
                                            rows={4}
                                        />
                                    </FormControl>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Instructional Videos */}
                    {password.instructionalVideos && password.instructionalVideos.length > 0 && (
                        <Box>
                            <Heading size="md" color={textPrimary} mb={4}>
                                Instructional Videos
                            </Heading>
                            <IPFSVideoPlayer videos={password.instructionalVideos} autoplay={false} />
                        </Box>
                    )}
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default PasswordDetails;