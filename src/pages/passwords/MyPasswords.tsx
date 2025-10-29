import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Card,
    CardBody,
    Spinner,
    Alert,
    AlertIcon,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    HStack,
    VStack,
    Badge,
    IconButton,
    useToast,
    Tooltip,
    useClipboard,
    Icon,
    useColorMode
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, ViewOffIcon, CopyIcon, ExternalLinkIcon, LockIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import passwordsModuleConfig from "./moduleConfig";
import { format } from "date-fns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { Password } from "../../generated/graphql";

const GET_MY_PASSWORDS = gql`
    query GetMyPasswords {
        myPasswords {
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
            isActive
            expiresAt
            createdAt
            createdBy {
                id
                fName
                lName
            }
            company {
                id
                name
            }
            sharedWithEmployees
            sharedWithExternal
        }
    }
`;


const MyPasswords: React.FC = () => {
    usePageTitle("My Passwords");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const [searchTerm, setSearchTerm] = useState("");
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    
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
    const warningColor = getColor("status.warning", colorMode);

    const { data, loading, error } = useQuery(GET_MY_PASSWORDS);

    const togglePasswordVisibility = (passwordId: string) => {
        setShowPasswords(prev => ({
            ...prev,
            [passwordId]: !prev[passwordId]
        }));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} copied`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    const openPasswordDetails = (passwordId: string) => {
        navigate(`/passwords/${passwordId}`);
    };

    const filteredPasswords = data?.myPasswords?.filter((password: Password) =>
        password.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isExpired = (expiresAt?: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />

            <Container maxW={{ base: "container.sm", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <VStack spacing={4} align="stretch">
                        <VStack align="start" spacing={2}>
                            <Heading 
                                color={textPrimary} 
                                fontFamily={brandConfig.fonts.heading}
                                size={{ base: "md", md: "lg" }}
                            >
                                My Passwords
                            </Heading>
                            <Badge 
                                colorScheme="purple" 
                                fontSize={{ base: "sm", md: "md" }}
                                px={3} 
                                py={1}
                                borderRadius="md"
                            >
                                {filteredPasswords?.length || 0} Passwords
                            </Badge>
                        </VStack>
                    </VStack>

                    <InputGroup maxW={{ base: "100%", md: "400px" }}>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color={textMuted} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search passwords..."
                            bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                            borderColor={cardBorder}
                            color={textPrimary}
                            _placeholder={{ color: textMuted }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    {loading && (
                        <Box textAlign="center" py={8}>
                            <Spinner size="xl" color={primaryColor} />
                        </Box>
                    )}

                    {error && (
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            Error loading passwords: {error.message}
                        </Alert>
                    )}
                    
                    {data && (
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                            overflow="hidden"
                        >
                            <CardBody p={0}>
                                <Box overflowX="auto" width="100%">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth="800px">
                                        <Thead position="sticky" top={0} bg={cardGradientBg}>
                                            <Tr borderBottom="1px" borderColor={cardBorder}>
                                                <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Service</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Login Info</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="120px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Password</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="100px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Status</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="100px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredPasswords?.map((password: Password) => (
                                                <Tr 
                                                    key={password.id}
                                                    _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
                                                    borderBottom="1px"
                                                    borderColor={cardBorder}
                                                >
                                                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                        <VStack align="start" spacing={1}>
                                                            <Text color={textPrimary} fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
                                                                {password.serviceName}
                                                            </Text>
                                                            <HStack spacing={1}>
                                                                <Tooltip label="Go to login page">
                                                                    <IconButton
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        aria-label="Login"
                                                                        icon={<ExternalLinkIcon />}
                                                                        onClick={() => window.open(password.loginUrl || '', '_blank')}
                                                                        color={primaryColor}
                                                                        minW="32px"
                                                                        minH="32px"
                                                                    />
                                                                </Tooltip>
                                                                {password.dashboardUrl && (
                                                                    <Tooltip label="Go to dashboard">
                                                                        <IconButton
                                                                            size="xs"
                                                                            variant="ghost"
                                                                            aria-label="Dashboard"
                                                                            icon={<Icon as={ExternalLinkIcon} />}
                                                                            onClick={() => window.open(password.dashboardUrl || '', '_blank')}
                                                                            color={successGreen}
                                                                            minW="32px"
                                                                            minH="32px"
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </HStack>
                                                        </VStack>
                                                    </Td>
                                                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                                                        <VStack align="start" spacing={1}>
                                                            {password.email && (
                                                                <HStack>
                                                                    <Text color={textSecondary} fontSize="xs" noOfLines={1}>
                                                                        {password.email}
                                                                    </Text>
                                                                    <IconButton
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        aria-label="Copy email"
                                                                        icon={<CopyIcon />}
                                                                        onClick={() => copyToClipboard(password.email!, "Email")}
                                                                        minW="32px"
                                                                        minH="32px"
                                                                    />
                                                                </HStack>
                                                            )}
                                                            {password.username && (
                                                                <HStack>
                                                                    <Text color={textSecondary} fontSize="xs" noOfLines={1}>
                                                                        {password.username}
                                                                    </Text>
                                                                    <IconButton
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        aria-label="Copy username"
                                                                        icon={<CopyIcon />}
                                                                        onClick={() => copyToClipboard(password.username!, "Username")}
                                                                        minW="32px"
                                                                        minH="32px"
                                                                    />
                                                                </HStack>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                        <VStack spacing={1}>
                                                            <Text color={textPrimary} fontFamily="mono" fontSize={{ base: "xs", md: "sm" }}>
                                                                {showPasswords[password.id] 
                                                                    ? password.password 
                                                                    : "••••••••"}
                                                            </Text>
                                                            <HStack spacing={1}>
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Toggle password"
                                                                    icon={showPasswords[password.id] ? <ViewOffIcon /> : <ViewIcon />}
                                                                    onClick={() => togglePasswordVisibility(password.id)}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Copy password"
                                                                    icon={<CopyIcon />}
                                                                    onClick={() => copyToClipboard(password.password, "Password")}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                            </HStack>
                                                        </VStack>
                                                    </Td>
                                                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", lg: "table-cell" }}>
                                                        <VStack align="start" spacing={1}>
                                                            {password.expiresAt && (
                                                                <Badge 
                                                                    colorScheme={isExpired(password.expiresAt) ? "red" : "green"}
                                                                    fontSize="xs"
                                                                >
                                                                    {isExpired(password.expiresAt) 
                                                                        ? "Expired" 
                                                                        : `Expires ${format(new Date(password.expiresAt), "MMM dd, yyyy")}`}
                                                                </Badge>
                                                            )}
                                                            {password.twoFactorSecret && (
                                                                <Badge colorScheme="blue" fontSize="xs">
                                                                    2FA Enabled
                                                                </Badge>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                        <Button
                                                            size={{ base: "xs", md: "sm" }}
                                                            bg={primaryColor}
                                                            color="white"
                                                            _hover={{ bg: primaryHover }}
                                                            onClick={() => openPasswordDetails(password.id)}
                                                            leftIcon={<LockIcon />}
                                                            width={{ base: "100%", md: "auto" }}
                                                            minW={{ md: "100px" }}
                                                            fontSize={{ base: "xs", md: "sm" }}
                                                        >
                                                            Details
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                                {filteredPasswords?.length === 0 && (
                                    <Box textAlign="center" py={8}>
                                        <Text color={textMuted}>No passwords found</Text>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default MyPasswords;