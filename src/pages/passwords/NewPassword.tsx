import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Card,
    CardBody,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Textarea,
    Select,
    Button,
    useToast,
    Alert,
    AlertIcon,
    AlertDescription,
    Divider,
    Text,
    Switch,
    InputGroup,
    InputRightElement,
    IconButton,
    Badge,
    Tooltip,
    Grid,
    GridItem,
    useColorMode,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CopyIcon, RepeatIcon, InfoIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import passwordsModuleConfig from "./moduleConfig";
import { Client } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_CLIENTS = gql`
    query GetClients {
        clients {
            id
            fName
            lName
            email
            phoneNumber
        }
    }
`;

const GET_COMPANIES = gql`
    query GetCompanies {
        companies {
            id
            name
            tradingName
            abn
        }
    }
`;

const GET_MY_IPFS_VIDEOS = gql`
    query MyIPFSVideos {
        myIPFSVideos {
            id
            title
            description
            ipfsHash
        }
    }
`;

const CREATE_PASSWORD = gql`
    mutation CreatePassword($input: PasswordInput!) {
        createPassword(input: $input) {
            id
            serviceName
            loginUrl
            company {
                id
                name
            }
            createdBy {
                id
                fName
                lName
                email
            }
            sharedWithEmployees
            sharedWithExternal
            instructionalVideos {
                ipfsHash
                title
                description
            }
        }
    }
`;


const NewPassword: React.FC = () => {
    usePageTitle("New Password");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    
    // Brand styling
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const primaryColor = getColor("primary");
    const primaryHover = getColor("primaryHover");
    const successGreen = getColor("successGreen");
    const errorRed = getColor("status.error");
    const warningColor = getColor("status.warning");

    // Form state
    const [serviceName, setServiceName] = useState("");
    const [loginUrl, setLoginUrl] = useState("");
    const [dashboardUrl, setDashboardUrl] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState("");
    const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState("");
    const [notes, setNotes] = useState("");
    const [company, setCompany] = useState("");
    const [sharedWith, setSharedWith] = useState<string[]>([]);
    const [hasExpiration, setHasExpiration] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    const [has2FA, setHas2FA] = useState(false);
    const [instructionalVideos, setInstructionalVideos] = useState<Array<{ipfsHash: string, title: string, description?: string}>>([]);

    // Queries and mutations
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
    const { data: companiesData, loading: companiesLoading } = useQuery(GET_COMPANIES);
    const { data: ipfsVideosData, loading: ipfsVideosLoading } = useQuery(GET_MY_IPFS_VIDEOS);
    const [createPassword, { loading: creating }] = useMutation(CREATE_PASSWORD, {
        onCompleted: (data) => {
            const sharedCount = (data.createPassword.sharedWithEmployees?.length || 0) + (data.createPassword.sharedWithExternal?.length || 0);
            toast({
                title: "Password created successfully",
                description: `Password for ${data.createPassword.serviceName} has been created${sharedCount > 0 ? ' and shared' : ''}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/passwords/admin");
        },
        onError: (error) => {
            toast({
                title: "Error creating password",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    // Generate a random secure password
    const generatePassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
        let newPassword = "";
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(newPassword);
        toast({
            title: "Password generated",
            status: "info",
            duration: 2000,
        });
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} copied`,
            status: "success",
            duration: 2000,
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation - only serviceName and password are required now
        if (!serviceName || !password) {
            toast({
                title: "Missing required fields",
                description: "Please fill in service name and password",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const input: any = {
            serviceName,
            password,
        };

        // Add loginUrl only if provided
        if (loginUrl) input.loginUrl = loginUrl;

        // Add optional fields
        if (dashboardUrl) input.dashboardUrl = dashboardUrl;
        if (username) input.username = username;
        if (email) input.email = email;
        if (notes) input.notes = notes;
        if (company) input.company = company;
        if (has2FA && twoFactorSecret) {
            input.twoFactorSecret = twoFactorSecret;
            if (twoFactorBackupCodes) input.twoFactorBackupCodes = twoFactorBackupCodes;
        }
        // For now, send all shared users as external (can be enhanced later to distinguish employees)
        if (sharedWith.length > 0) input.sharedWithExternal = sharedWith;
        if (hasExpiration && expiresAt) {
            input.expiresAt = new Date(expiresAt).toISOString();
        }
        if (instructionalVideos.length > 0) input.instructionalVideos = instructionalVideos;

        await createPassword({ variables: { input } });
    };

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />

            <Container maxW={{ base: "container.sm", lg: "container.lg" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                        Create New Password
                    </Heading>
                    
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                                    {/* Service Information */}
                                    <Box>
                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={4}>
                                            Service Information
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                            <GridItem colSpan={{ base: 2, md: 1 }}>
                                                <FormControl isRequired>
                                                    <FormLabel color={textPrimary}>Service Name</FormLabel>
                                                    <Input
                                                        placeholder="e.g., Company Gmail, AWS Console"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={serviceName}
                                                        onChange={(e) => setServiceName(e.target.value)}
                                                    />
                                                    <FormHelperText color={textMuted}>
                                                        Name of the service, application, or device (e.g., Company Laptop)
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={{ base: 2, md: 1 }}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Company (Optional)</FormLabel>
                                                    <Select
                                                        placeholder="Select company"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        value={company}
                                                        onChange={(e) => setCompany(e.target.value)}
                                                        disabled={companiesLoading}
                                                    >
                                                        {companiesData?.companies?.map((company: any) => (
                                                            <option key={company.id} value={company.id}>
                                                                {company.tradingName || company.name} {company.abn ? `(ABN: ${company.abn})` : ''}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText color={textMuted}>
                                                        Link this password to a company
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={2}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Share With (Optional)</FormLabel>
                                                    <Select
                                                        placeholder="Select users to share with"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        onChange={(e) => {
                                                            if (e.target.value && !sharedWith.includes(e.target.value)) {
                                                                setSharedWith([...sharedWith, e.target.value]);
                                                            }
                                                        }}
                                                        disabled={clientsLoading}
                                                    >
                                                        {clientsData?.clients
                                                            ?.filter((client: Client) => !sharedWith.includes(client.id))
                                                            .map((client: Client) => (
                                                                <option key={client.id} value={client.id}>
                                                                    {client.fName} {client.lName} ({client.email})
                                                                </option>
                                                            ))}
                                                    </Select>
                                                    <HStack mt={2} wrap="wrap" spacing={2}>
                                                        {sharedWith.map((clientId) => {
                                                            const client = clientsData?.clients?.find((c: Client) => c.id === clientId);
                                                            return (
                                                                <Badge
                                                                    key={clientId}
                                                                    colorScheme="purple"
                                                                    px={2}
                                                                    py={1}
                                                                    borderRadius="md"
                                                                    cursor="pointer"
                                                                    onClick={() => setSharedWith(sharedWith.filter(id => id !== clientId))}
                                                                >
                                                                    {client?.fName} {client?.lName} ✕
                                                                </Badge>
                                                            );
                                                        })}
                                                    </HStack>
                                                    <FormHelperText color={textMuted}>
                                                        Users who can access and manage this password
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={2}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Login URL (Optional)</FormLabel>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/login or leave blank for devices"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={loginUrl}
                                                        onChange={(e) => setLoginUrl(e.target.value)}
                                                    />
                                                    <FormHelperText color={textMuted}>
                                                        URL where the user logs in (leave blank for devices like laptops)
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={3}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Dashboard URL (Optional)</FormLabel>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/dashboard"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={dashboardUrl}
                                                        onChange={(e) => setDashboardUrl(e.target.value)}
                                                    />
                                                    <FormHelperText color={textMuted}>
                                                        URL to access after logging in
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>
                                        </Grid>
                                    </Box>

                                    <Divider borderColor={cardBorder} />

                                    {/* Login Credentials */}
                                    <Box>
                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={4}>
                                            Login Credentials
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                            <GridItem colSpan={{ base: 2, md: 1 }}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Username (Optional)</FormLabel>
                                                    <Input
                                                        placeholder="username"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                    />
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={{ base: 2, md: 1 }}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Email (Optional)</FormLabel>
                                                    <Input
                                                        type="email"
                                                        placeholder="user@example.com"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={2}>
                                                <FormControl isRequired>
                                                    <FormLabel color={textPrimary}>Password</FormLabel>
                                                    <InputGroup>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter password"
                                                            bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            fontFamily="mono"
                                                        />
                                                        <InputRightElement width={{ base: "4rem", md: "6rem" }}>
                                                            <HStack spacing={1}>
                                                                <IconButton
                                                                    size={{ base: "xs", md: "sm" }}
                                                                    variant="ghost"
                                                                    aria-label="Toggle password"
                                                                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                    display={{ base: "none", sm: "flex" }}
                                                                />
                                                                <IconButton
                                                                    size={{ base: "xs", md: "sm" }}
                                                                    variant="ghost"
                                                                    aria-label="Generate password"
                                                                    icon={<RepeatIcon />}
                                                                    onClick={generatePassword}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                                {password && (
                                                                    <IconButton
                                                                        size={{ base: "xs", md: "sm" }}
                                                                        variant="ghost"
                                                                        aria-label="Copy password"
                                                                        icon={<CopyIcon />}
                                                                        onClick={() => copyToClipboard(password, "Password")}
                                                                        minW="32px"
                                                                        minH="32px"
                                                                        display={{ base: "none", sm: "flex" }}
                                                                    />
                                                                )}
                                                            </HStack>
                                                        </InputRightElement>
                                                    </InputGroup>
                                                    <FormHelperText color={textMuted}>
                                                        Use the generate button for a secure password
                                                    </FormHelperText>
                                                </FormControl>
                                            </GridItem>
                                        </Grid>
                                    </Box>

                                    <Divider borderColor={cardBorder} />

                                    {/* Two-Factor Authentication */}
                                    <Box>
                                        <VStack spacing={4} align="stretch" mb={4}>
                                            <HStack justify="space-between">
                                                <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                                                    Two-Factor Authentication
                                                </Text>
                                                <Switch
                                                    isChecked={has2FA}
                                                    onChange={(e) => setHas2FA(e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </HStack>
                                        </VStack>
                                        {has2FA && (
                                            <Grid templateColumns="repeat(1, 1fr)" gap={4}>
                                                <FormControl>
                                                    <FormLabel color={textPrimary}>2FA Secret Key</FormLabel>
                                                    <InputGroup>
                                                        <Input
                                                            placeholder="JBSWY3DPEHPK3PXP..."
                                                            bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                            value={twoFactorSecret}
                                                            onChange={(e) => setTwoFactorSecret(e.target.value)}
                                                            fontFamily="mono"
                                                        />
                                                        {twoFactorSecret && (
                                                            <InputRightElement>
                                                                <IconButton
                                                                    size={{ base: "xs", md: "sm" }}
                                                                    variant="ghost"
                                                                    aria-label="Copy 2FA"
                                                                    icon={<CopyIcon />}
                                                                    onClick={() => copyToClipboard(twoFactorSecret, "2FA Secret")}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                            </InputRightElement>
                                                        )}
                                                    </InputGroup>
                                                    <FormHelperText color={textMuted}>
                                                        TOTP secret for authenticator apps
                                                    </FormHelperText>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Backup Codes</FormLabel>
                                                    <Textarea
                                                        placeholder="Enter backup codes, one per line or comma-separated"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={twoFactorBackupCodes}
                                                        onChange={(e) => setTwoFactorBackupCodes(e.target.value)}
                                                        rows={3}
                                                    />
                                                    <FormHelperText color={textMuted}>
                                                        One-time use backup codes
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid>
                                        )}
                                    </Box>

                                    <Divider borderColor={cardBorder} />

                                    {/* Additional Settings */}
                                    <Box>
                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={4}>
                                            Additional Settings
                                        </Text>
                                        <VStack spacing={4} align="stretch">
                                            <FormControl>
                                                <FormLabel color={textPrimary}>Notes (Optional)</FormLabel>
                                                <Textarea
                                                    placeholder="Any special instructions or notes..."
                                                    bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    _placeholder={{ color: textMuted }}
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    rows={4}
                                                />
                                                <FormHelperText color={textMuted}>
                                                    Additional information or instructions
                                                </FormHelperText>
                                            </FormControl>

                                            <FormControl>
                                                <VStack spacing={2} align="stretch">
                                                    <HStack justify="space-between">
                                                        <FormLabel color={textPrimary} mb={0}>Password Expiration</FormLabel>
                                                        <Switch
                                                            isChecked={hasExpiration}
                                                            onChange={(e) => setHasExpiration(e.target.checked)}
                                                            colorScheme="orange"
                                                        />
                                                    </HStack>
                                                </VStack>
                                                {hasExpiration && (
                                                    <Input
                                                        type="datetime-local"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        value={expiresAt}
                                                        onChange={(e) => setExpiresAt(e.target.value)}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                    />
                                                )}
                                                <FormHelperText color={textMuted}>
                                                    Set an expiration date for this password
                                                </FormHelperText>
                                            </FormControl>

                                            <Divider borderColor={cardBorder} />

                                            {/* Instructional Videos */}
                                            <FormControl>
                                                <FormLabel color={textPrimary}>Instructional Videos (Optional)</FormLabel>
                                                <VStack spacing={3} align="stretch">
                                                    <Select
                                                        placeholder="Select a video to add"
                                                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        onChange={(e) => {
                                                            const selectedVideo = ipfsVideosData?.myIPFSVideos?.find((v: any) => v.id === e.target.value);
                                                            if (selectedVideo && !instructionalVideos.find(v => v.ipfsHash === selectedVideo.ipfsHash)) {
                                                                setInstructionalVideos([
                                                                    ...instructionalVideos,
                                                                    {
                                                                        ipfsHash: selectedVideo.ipfsHash,
                                                                        title: selectedVideo.title,
                                                                        description: selectedVideo.description
                                                                    }
                                                                ]);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        disabled={ipfsVideosLoading}
                                                    >
                                                        {ipfsVideosData?.myIPFSVideos
                                                            ?.filter((video: any) => !instructionalVideos.find(v => v.ipfsHash === video.ipfsHash))
                                                            .map((video: any) => (
                                                                <option key={video.id} value={video.id}>
                                                                    {video.title}
                                                                </option>
                                                            ))}
                                                    </Select>

                                                    {instructionalVideos.length > 0 && (
                                                        <VStack spacing={2} align="stretch">
                                                            {instructionalVideos.map((video, index) => (
                                                                <HStack
                                                                    key={video.ipfsHash}
                                                                    p={3}
                                                                    bg={colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.05)'}
                                                                    borderRadius="md"
                                                                    borderWidth="1px"
                                                                    borderColor={cardBorder}
                                                                    justify="space-between"
                                                                >
                                                                    <VStack align="start" spacing={0} flex={1}>
                                                                        <Text color={textPrimary} fontWeight="medium" fontSize="sm">
                                                                            {index + 1}. {video.title}
                                                                        </Text>
                                                                        {video.description && (
                                                                            <Text color={textMuted} fontSize="xs" noOfLines={1}>
                                                                                {video.description}
                                                                            </Text>
                                                                        )}
                                                                    </VStack>
                                                                    <IconButton
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        aria-label="Remove video"
                                                                        icon={<CloseIcon />}
                                                                        onClick={() => {
                                                                            setInstructionalVideos(
                                                                                instructionalVideos.filter(v => v.ipfsHash !== video.ipfsHash)
                                                                            );
                                                                        }}
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    )}
                                                </VStack>
                                                <FormHelperText color={textMuted}>
                                                    Add IPFS videos to show users how to use this password (e.g., login process, 2FA setup)
                                                </FormHelperText>
                                            </FormControl>
                                        </VStack>
                                    </Box>

                                    <Divider borderColor={cardBorder} />

                                    {/* Submit Buttons */}
                                    <VStack spacing={4} align="stretch" direction={{ base: "column", md: "row" }} justify={{ base: "stretch", md: "flex-end" }}>
                                        <Button
                                            variant="outline"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            onClick={() => navigate("/passwords/admin")}
                                            width={{ base: "100%", md: "auto" }}
                                            minW={{ md: "120px" }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            bg={primaryColor}
                                            color="white"
                                            _hover={{ bg: primaryHover }}
                                            isLoading={creating}
                                            loadingText="Issuing..."
                                            leftIcon={<AddIcon />}
                                            width={{ base: "100%", md: "auto" }}
                                            minW={{ md: "150px" }}
                                        >
                                            Create Password
                                        </Button>
                                    </VStack>

                                    {/* Security Notice */}
                                    <Alert status="info" borderRadius="md" bg="rgba(59, 130, 246, 0.1)" borderColor="blue.500" border="1px">
                                        <AlertIcon color="blue.500" />
                                        <AlertDescription color={textPrimary}>
                                            <Text fontSize="sm">
                                                This password will be saved securely. Users you share it with will receive an email notification
                                                and can access it from their dashboard.
                                            </Text>
                                        </AlertDescription>
                                    </Alert>
                                </VStack>
                            </form>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default NewPassword;