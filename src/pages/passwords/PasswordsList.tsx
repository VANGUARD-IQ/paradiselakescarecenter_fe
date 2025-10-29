import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
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
    useDisclosure,
    useColorMode,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Select,
    Tooltip,
    Avatar,
    AvatarGroup,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Icon,
} from "@chakra-ui/react";
import { 
    SearchIcon, 
    ViewIcon, 
    ViewOffIcon, 
    CopyIcon, 
    ExternalLinkIcon, 
    LockIcon,
    ChevronDownIcon,
    EditIcon,
    DeleteIcon,
    TimeIcon,
    WarningIcon,
    AddIcon,
    RepeatIcon,
    InfoOutlineIcon
} from "@chakra-ui/icons";
import { FaShare } from "react-icons/fa";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import passwordsModuleConfig from "./moduleConfig";
import { format } from "date-fns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { Password } from "../../generated/graphql";

const GET_ALL_PASSWORDS = gql`
    query GetAllPasswords {
        passwords {
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
            updatedAt
            createdBy {
                id
                fName
                lName
                email
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

const GET_PASSWORD_ACCESS_LOGS = gql`
    query GetPasswordAccessLogs($passwordId: ID!) {
        passwordAccessLogs(passwordId: $passwordId) {
            id
            passwordId
            accessedBy {
                id
                fName
                lName
                email
            }
            accessedAt
            ipAddress
            userAgent
        }
    }
`;

const DEACTIVATE_PASSWORD = gql`
    mutation DeactivatePassword($id: ID!) {
        deactivatePassword(id: $id)
    }
`;

const SHARE_PASSWORD = gql`
    mutation SharePassword($id: ID!, $clientIds: [ID!]!) {
        sharePassword(id: $id, clientIds: $clientIds) {
            id
            sharedWithEmployees
            sharedWithExternal
        }
    }
`;

const GENERATE_PASSWORD_LINK = gql`
    mutation GeneratePasswordLink($passwordId: ID!, $expiresInHours: Float!) {
        generatePasswordLink(passwordId: $passwordId, expiresInHours: $expiresInHours)
    }
`;

const UPDATE_PASSWORD = gql`
    mutation UpdatePassword($id: ID!, $input: PasswordUpdateInput!) {
        updatePassword(id: $id, input: $input) {
            id
            company {
                id
                name
            }
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


interface AccessLog {
    id: string;
    passwordId: string;
    accessedBy: {
        id: string;
        fName?: string;
        lName?: string;
        email: string;
    };
    accessedAt: string;
    ipAddress?: string;
    userAgent?: string;
}

const PasswordsList: React.FC = () => {
    usePageTitle("Passwords");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
    const { isOpen: isLogsOpen, onOpen: onLogsOpen, onClose: onLogsClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = React.useRef<any>();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
    const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [linkExpiryHours, setLinkExpiryHours] = useState(24);
    const [editingCompany, setEditingCompany] = useState<{ [key: string]: boolean }>({});
    const [tempCompanyId, setTempCompanyId] = useState<{ [key: string]: string }>({});
    
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
    const infoBlue = getColor("status.info", colorMode);

    // Queries and Mutations
    const { data, loading, error, refetch } = useQuery(GET_ALL_PASSWORDS);
    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: companiesData } = useQuery(GET_COMPANIES);
    const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useQuery(GET_PASSWORD_ACCESS_LOGS, {
        variables: { passwordId: selectedPassword?.id || "" },
        skip: !selectedPassword?.id
    });
    
    const [deactivatePassword] = useMutation(DEACTIVATE_PASSWORD, {
        onCompleted: () => {
            toast({
                title: "Password deactivated",
                status: "success",
                duration: 3000,
            });
            refetch();
            onDeleteClose();
        },
        onError: (error) => {
            toast({
                title: "Error deactivating password",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    });

    const [sharePassword] = useMutation(SHARE_PASSWORD, {
        onCompleted: () => {
            toast({
                title: "Password shared successfully",
                status: "success",
                duration: 3000,
            });
            refetch();
            onShareClose();
            setSelectedClients([]);
        }
    });

    const [updatePassword] = useMutation(UPDATE_PASSWORD, {
        onCompleted: () => {
            toast({
                title: "Password updated",
                status: "success",
                duration: 3000,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Error updating password",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    });

    const [generatePasswordLink] = useMutation(GENERATE_PASSWORD_LINK, {
        onCompleted: (data) => {
            navigator.clipboard.writeText(data.generatePasswordLink);
            toast({
                title: "Secure link generated and copied",
                description: `Link expires in ${linkExpiryHours} hours`,
                status: "success",
                duration: 5000,
            });
        }
    });

    // Filter passwords
    const filteredPasswords = data?.passwords?.filter((password: Password) => {
        const matchesSearch = password.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            password.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${password.createdBy?.fName || ''} ${password.createdBy?.lName || ''}`.trim().toLowerCase().includes(searchTerm.toLowerCase());
        
        const isExpired = password.expiresAt ? new Date(password.expiresAt) < new Date() : false;
        const matchesStatus = 
            filterStatus === "all" ||
            (filterStatus === "active" && password.isActive && !isExpired) ||
            (filterStatus === "expired" && (isExpired || !password.isActive));
        
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalPasswords = data?.passwords?.length || 0;
    const activePasswords = data?.passwords?.filter((p: Password) => 
        p.isActive && (!p.expiresAt || new Date(p.expiresAt) > new Date())
    ).length || 0;
    const expiredPasswords = data?.passwords?.filter((p: Password) => 
        p.expiresAt && new Date(p.expiresAt) < new Date()
    ).length || 0;
    const sharedPasswords = data?.passwords?.filter((p: Password) =>
        (p.sharedWithEmployees && p.sharedWithEmployees.length > 0) ||
        (p.sharedWithExternal && p.sharedWithExternal.length > 0)
    ).length || 0;

    // Helper functions
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
        });
    };

    const openPasswordDetails = (password: Password) => {
        setSelectedPassword(password);
        onDetailsOpen();
    };

    const openShareModal = (password: Password) => {
        setSelectedPassword(password);
        // Combine both employee and external shares
        const allShared = [
            ...(password.sharedWithEmployees || []),
            ...(password.sharedWithExternal || [])
        ];
        setSelectedClients(allShared);
        onShareOpen();
    };

    const openAccessLogs = (password: Password) => {
        setSelectedPassword(password);
        refetchLogs();
        onLogsOpen();
    };

    const confirmDelete = (password: Password) => {
        setSelectedPassword(password);
        onDeleteOpen();
    };

    const handleDeactivate = async () => {
        if (selectedPassword) {
            await deactivatePassword({ variables: { id: selectedPassword.id } });
        }
    };

    const handleShare = async () => {
        if (selectedPassword && selectedClients.length > 0) {
            await sharePassword({ 
                variables: { 
                    id: selectedPassword.id, 
                    clientIds: selectedClients 
                } 
            });
        }
    };

    const generateLink = async (password: Password) => {
        await generatePasswordLink({ 
            variables: { 
                passwordId: password.id, 
                expiresInHours: linkExpiryHours 
            } 
        });
    };

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
                    {/* Header */}
                    <VStack spacing={4} align="stretch">
                        <VStack align="start" spacing={2}>
                            <Heading 
                                color={textPrimary} 
                                fontFamily={brandConfig.fonts.heading}
                                size={{ base: "md", md: "lg" }}
                            >
                                Password Management (Admin)
                            </Heading>
                        </VStack>
                        <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                            <Button
                                bg={primaryColor}
                                color="white"
                                _hover={{ bg: primaryHover }}
                                leftIcon={<AddIcon />}
                                onClick={() => navigate("/passwords/new")}
                                width={{ base: "100%", md: "auto" }}
                                minW={{ md: "180px" }}
                            >
                                Issue New Password
                            </Button>
                        </Box>
                    </VStack>

                    {/* Stats Cards */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 4, md: 6 }}>
                        <Card bg={cardGradientBg} borderColor={cardBorder} border="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Total Passwords</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "lg", md: "2xl" }}>{totalPasswords}</StatNumber>
                                    <StatHelpText color={textMuted}>All issued passwords</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} border="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Active</StatLabel>
                                    <StatNumber color={successGreen} fontSize={{ base: "lg", md: "2xl" }}>{activePasswords}</StatNumber>
                                    <StatHelpText color={textMuted}>Currently valid</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} border="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Expired</StatLabel>
                                    <StatNumber color={errorRed} fontSize={{ base: "lg", md: "2xl" }}>{expiredPasswords}</StatNumber>
                                    <StatHelpText color={textMuted}>Need renewal</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} border="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Shared</StatLabel>
                                    <StatNumber color={infoBlue} fontSize={{ base: "lg", md: "2xl" }}>{sharedPasswords}</StatNumber>
                                    <StatHelpText color={textMuted}>Team access</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Filters */}
                    <VStack spacing={4} align="stretch">
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
                        <HStack spacing={4} direction={{ base: "column", md: "row" }} width={{ base: "100%", md: "auto" }}>
                            <Select
                                maxW={{ base: "100%", md: "200px" }}
                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                borderColor={cardBorder}
                                color={textPrimary}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="expired">Expired/Inactive</option>
                            </Select>
                            <Button
                                variant="outline"
                                borderColor={cardBorder}
                                color={textPrimary}
                                leftIcon={<RepeatIcon />}
                                onClick={() => refetch()}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Refresh
                            </Button>
                        </HStack>
                    </VStack>

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
                    
                    {/* Passwords Table */}
                    {data && (
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                            overflow="visible"
                        >
                            <CardBody p={0} minH="400px">
                                <Box overflowX="auto" overflowY="visible" width="100%">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth="1000px">
                                        <Thead position="sticky" top={0} bg={cardGradientBg}>
                                            <Tr borderBottom="1px" borderColor={cardBorder}>
                                                <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Service</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="160px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Company</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Credentials</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="100px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="100px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Sharing</Th>
                                                <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                        {filteredPasswords?.map((password: Password) => (
                                            <Tr
                                                key={password.id}
                                                borderBottom="1px"
                                                borderColor={cardBorder}
                                            >
                                                <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text color={textPrimary} fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
                                                            {password.serviceName}
                                                        </Text>
                                                        <Text color={textMuted} fontSize="xs">
                                                            Created {format(new Date(password.createdAt), "MMM dd, yyyy")}
                                                        </Text>
                                                        {/* Show company/shared info on mobile */}
                                                        <Box display={{ base: "block", md: "none" }}>
                                                            {password.company && (
                                                                <Text color={textPrimary} fontSize="xs">Company: {password.company.name}</Text>
                                                            )}
                                                            {((password.sharedWithEmployees?.length || 0) + (password.sharedWithExternal?.length || 0)) > 0 && (
                                                                <Text color={textMuted} fontSize="xs">
                                                                    Shared with {(password.sharedWithEmployees?.length || 0) + (password.sharedWithExternal?.length || 0)} users
                                                                </Text>
                                                            )}
                                                        </Box>
                                                    </VStack>
                                                </Td>
                                                <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                                                    <VStack align="start" spacing={1}>
                                                        {editingCompany[password.id] ? (
                                                            <HStack spacing={2}>
                                                                <Select
                                                                    size="sm"
                                                                    bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    value={tempCompanyId[password.id] || password.company?.id || ''}
                                                                    onChange={(e) => setTempCompanyId({ ...tempCompanyId, [password.id]: e.target.value })}
                                                                    width="140px"
                                                                >
                                                                    <option value="">No company</option>
                                                                    {companiesData?.companies?.map((company: any) => (
                                                                        <option key={company.id} value={company.id}>
                                                                            {company.tradingName || company.name}
                                                                        </option>
                                                                    ))}
                                                                </Select>
                                                                <IconButton
                                                                    size="xs"
                                                                    colorScheme="green"
                                                                    aria-label="Save"
                                                                    icon={<Icon viewBox="0 0 24 24">
                                                                        <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                                                                    </Icon>}
                                                                    onClick={async () => {
                                                                        const newCompanyId = tempCompanyId[password.id] || '';
                                                                        await updatePassword({
                                                                            variables: {
                                                                                id: password.id,
                                                                                input: {
                                                                                    company: newCompanyId || null
                                                                                }
                                                                            }
                                                                        });
                                                                        setEditingCompany({ ...editingCompany, [password.id]: false });
                                                                        delete tempCompanyId[password.id];
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Cancel"
                                                                    icon={<Icon viewBox="0 0 24 24">
                                                                        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                                                    </Icon>}
                                                                    onClick={() => {
                                                                        setEditingCompany({ ...editingCompany, [password.id]: false });
                                                                        delete tempCompanyId[password.id];
                                                                    }}
                                                                />
                                                            </HStack>
                                                        ) : (
                                                            <HStack spacing={2}>
                                                                <Text
                                                                    color={password.company ? textPrimary : textMuted}
                                                                    fontSize="sm"
                                                                    cursor="pointer"
                                                                    onClick={() => {
                                                                        setEditingCompany({ ...editingCompany, [password.id]: true });
                                                                        setTempCompanyId({ ...tempCompanyId, [password.id]: password.company?.id || '' });
                                                                    }}
                                                                    _hover={{ textDecoration: 'underline' }}
                                                                >
                                                                    {password.company?.name || "No company"}
                                                                </Text>
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Edit company"
                                                                    icon={<EditIcon />}
                                                                    onClick={() => {
                                                                        setEditingCompany({ ...editingCompany, [password.id]: true });
                                                                        setTempCompanyId({ ...tempCompanyId, [password.id]: password.company?.id || '' });
                                                                    }}
                                                                />
                                                            </HStack>
                                                        )}
                                                        {((password.sharedWithEmployees?.length || 0) + (password.sharedWithExternal?.length || 0)) > 0 && (
                                                            <Badge colorScheme="purple" size="sm">
                                                                {(password.sharedWithEmployees?.length || 0) + (password.sharedWithExternal?.length || 0)} users
                                                            </Badge>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                    <VStack align="start" spacing={1}>
                                                        {password.email && (
                                                            <HStack>
                                                                <Text color={textSecondary} fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                                                    {password.email}
                                                                </Text>
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Copy"
                                                                    icon={<CopyIcon />}
                                                                    onClick={() => copyToClipboard(password.email!, "Email")}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                            </HStack>
                                                        )}
                                                        <HStack>
                                                            <Text color={textPrimary} fontFamily="mono" fontSize={{ base: "xs", md: "sm" }}>
                                                                {showPasswords[password.id] 
                                                                    ? password.password.substring(0, 20) + "..."
                                                                    : "••••••••"}
                                                            </Text>
                                                            <IconButton
                                                                size="xs"
                                                                variant="ghost"
                                                                aria-label="Toggle"
                                                                icon={showPasswords[password.id] ? <ViewOffIcon /> : <ViewIcon />}
                                                                onClick={() => togglePasswordVisibility(password.id)}
                                                                minW="32px"
                                                                minH="32px"
                                                            />
                                                        </HStack>
                                                    </VStack>
                                                </Td>
                                                <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                                                    <VStack align="start" spacing={1}>
                                                        {!password.isActive ? (
                                                            <Badge colorScheme="red" fontSize={{ base: "xs", md: "sm" }}>Inactive</Badge>
                                                        ) : password.expiresAt && isExpired(password.expiresAt) ? (
                                                            <Badge colorScheme="orange" fontSize={{ base: "xs", md: "sm" }}>Expired</Badge>
                                                        ) : (
                                                            <Badge colorScheme="green" fontSize={{ base: "xs", md: "sm" }}>Active</Badge>
                                                        )}
                                                        {password.expiresAt && !isExpired(password.expiresAt) && (
                                                            <Text color={textMuted} fontSize="xs">
                                                                Expires {format(new Date(password.expiresAt), "MMM dd")}
                                                            </Text>
                                                        )}
                                                        {password.twoFactorSecret && (
                                                            <Badge colorScheme="blue" size="sm" fontSize="xs">2FA</Badge>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", lg: "table-cell" }}>
                                                    {(() => {
                                                        const allShared = [
                                                            ...(password.sharedWithEmployees || []),
                                                            ...(password.sharedWithExternal || [])
                                                        ];
                                                        return allShared.length > 0 ? (
                                                            <AvatarGroup size="xs" max={3}>
                                                                {allShared.map((clientId: string) => {
                                                                    const client = clientsData?.clients?.find((c: any) => c.id === clientId);
                                                                    return (
                                                                        <Tooltip key={clientId} label={client?.name || "Unknown"}>
                                                                            <Avatar name={client?.name} size="xs" />
                                                                        </Tooltip>
                                                                    );
                                                                })}
                                                            </AvatarGroup>
                                                        ) : (
                                                            <Text color={textMuted} fontSize="xs">Not shared</Text>
                                                        );
                                                    })()}
                                                </Td>
                                                <Td borderColor={cardBorder} px={{ base: 1, md: 4 }}>
                                                    <VStack spacing={1}>
                                                        <HStack spacing={1}>
                                                            <Tooltip label="View Details">
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Details"
                                                                    icon={<ViewIcon />}
                                                                    onClick={() => openPasswordDetails(password)}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                            </Tooltip>
                                                            <Tooltip label="Share">
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Share"
                                                                    icon={<Icon as={FaShare} />}
                                                                    onClick={() => openShareModal(password)}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                    display={{ base: "none", md: "flex" }}
                                                                />
                                                            </Tooltip>
                                                            <Menu>
                                                                <MenuButton
                                                                    as={IconButton}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    icon={<ChevronDownIcon />}
                                                                    minW="32px"
                                                                    minH="32px"
                                                                />
                                                                <MenuList bg={cardGradientBg} borderColor={cardBorder} zIndex={1000} position="relative">
                                                                    <MenuItem 
                                                                        icon={<Icon as={FaShare} />}
                                                                        onClick={() => openShareModal(password)}
                                                                        bg={cardGradientBg}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                                                        color={textPrimary}
                                                                        display={{ base: "flex", md: "none" }}
                                                                    >
                                                                        Share
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<TimeIcon />}
                                                                        onClick={() => openAccessLogs(password)}
                                                                        bg={cardGradientBg}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        <Box>
                                                                            <Text>Access Logs</Text>
                                                                            <Text fontSize="xs" color={textMuted}>View who accessed this password</Text>
                                                                        </Box>
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<ExternalLinkIcon />}
                                                                        onClick={() => generateLink(password)}
                                                                        bg={cardGradientBg}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        <Box>
                                                                            <Text>Generate Access Link</Text>
                                                                            <Text fontSize="xs" color={textMuted}>Create a secure link for SMS sharing</Text>
                                                                        </Box>
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<EditIcon />}
                                                                        onClick={() => navigate(`/password/${password.id}/edit`)}
                                                                        bg={cardGradientBg}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        <Box>
                                                                            <Text>Edit</Text>
                                                                            <Text fontSize="xs" color={textMuted}>Update password details</Text>
                                                                        </Box>
                                                                    </MenuItem>
                                                                    <MenuDivider borderColor={cardBorder} />
                                                                    <MenuItem
                                                                        icon={<DeleteIcon />}
                                                                        onClick={() => confirmDelete(password)}
                                                                        bg={cardGradientBg}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                                                        color={errorRed}
                                                                    >
                                                                        <Box>
                                                                            <Text color={errorRed}>Deactivate</Text>
                                                                            <Text fontSize="xs" color={textMuted}>Remove this password</Text>
                                                                        </Box>
                                                                    </MenuItem>
                                                                </MenuList>
                                                            </Menu>
                                                        </HStack>
                                                    </VStack>
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

            {/* Password Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size={{ base: "full", md: "xl" }}>
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
                <ModalContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
                    <ModalHeader color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                        {selectedPassword?.serviceName}
                    </ModalHeader>
                    <ModalCloseButton color={textPrimary} />
                    <ModalBody>
                        {selectedPassword && (
                            <VStack spacing={4} align="stretch">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box>
                                        <Text color={textMuted} fontSize="sm">Company</Text>
                                        <Text color={textPrimary}>{selectedPassword.company?.name || "No company"}</Text>
                                    </Box>
                                    <Box>
                                        <Text color={textMuted} fontSize="sm">Created By</Text>
                                        <Text color={textPrimary}>{`${selectedPassword.createdBy?.fName || ''} ${selectedPassword.createdBy?.lName || ''}`.trim() || "System"}</Text>
                                    </Box>
                                    <Box>
                                        <Text color={textMuted} fontSize="sm">Created</Text>
                                        <Text color={textPrimary}>{format(new Date(selectedPassword.createdAt), "MMM dd, yyyy HH:mm")}</Text>
                                    </Box>
                                    <Box>
                                        <Text color={textMuted} fontSize="sm">Last Updated</Text>
                                        <Text color={textPrimary}>{format(new Date(selectedPassword.updatedAt), "MMM dd, yyyy HH:mm")}</Text>
                                    </Box>
                                </SimpleGrid>

                                <Divider borderColor={cardBorder} />

                                <Box>
                                    <Text color={textMuted} fontSize="sm" mb={1}>Login URL</Text>
                                    <HStack>
                                        <Text color={textPrimary}>{selectedPassword.loginUrl}</Text>
                                        <IconButton
                                            size="sm"
                                            variant="ghost"
                                            aria-label="Open"
                                            icon={<ExternalLinkIcon />}
                                            onClick={() => selectedPassword.loginUrl && window.open(selectedPassword.loginUrl, '_blank')}
                                        />
                                    </HStack>
                                </Box>

                                {selectedPassword.dashboardUrl && (
                                    <Box>
                                        <Text color={textMuted} fontSize="sm" mb={1}>Dashboard URL</Text>
                                        <HStack>
                                            <Text color={textPrimary}>{selectedPassword.dashboardUrl}</Text>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Open"
                                                icon={<ExternalLinkIcon />}
                                                onClick={() => selectedPassword.dashboardUrl && window.open(selectedPassword.dashboardUrl, '_blank')}
                                            />
                                        </HStack>
                                    </Box>
                                )}

                                {selectedPassword.notes && (
                                    <Box>
                                        <Text color={textMuted} fontSize="sm" mb={1}>Notes</Text>
                                        <Text color={textPrimary} whiteSpace="pre-wrap">{selectedPassword.notes}</Text>
                                    </Box>
                                )}

                                {(() => {
                                    const allShared = [
                                        ...(selectedPassword.sharedWithEmployees || []),
                                        ...(selectedPassword.sharedWithExternal || [])
                                    ];
                                    return allShared.length > 0 && (
                                        <Box>
                                            <Text color={textMuted} fontSize="sm" mb={2}>Shared With</Text>
                                            <HStack wrap="wrap" spacing={2}>
                                                {allShared.map((clientId: string) => {
                                                    const client = clientsData?.clients?.find((c: any) => c.id === clientId);
                                                    return (
                                                        <Badge key={clientId} colorScheme="purple" px={2} py={1}>
                                                        {client?.name || "Unknown User"}
                                                    </Badge>
                                                );
                                            })}
                                        </HStack>
                                    </Box>
                                    );
                                })()}
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onDetailsClose} color={textPrimary}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Share Password Modal */}
            <Modal isOpen={isShareOpen} onClose={onShareClose} size={{ base: "full", md: "md" }}>
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
                <ModalContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
                    <ModalHeader color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                        Share Password: {selectedPassword?.serviceName}
                    </ModalHeader>
                    <ModalCloseButton color={textPrimary} />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text color={textSecondary}>
                                Select users who should have access to this password:
                            </Text>
                            <Select
                                placeholder="Add user..."
                                bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                borderColor={cardBorder}
                                color={textPrimary}
                                onChange={(e) => {
                                    if (e.target.value && !selectedClients.includes(e.target.value)) {
                                        setSelectedClients([...selectedClients, e.target.value]);
                                    }
                                }}
                            >
                                {clientsData?.clients
                                    ?.filter((client: any) => {
                                        const allShared = [
                                            ...(selectedPassword?.sharedWithEmployees || []),
                                            ...(selectedPassword?.sharedWithExternal || [])
                                        ];
                                        return client.id !== selectedPassword?.createdBy?.id &&
                                            !allShared.includes(client.id) &&
                                            !selectedClients.includes(client.id);
                                    })
                                    .map((client: any) => (
                                        <option key={client.id} value={client.id}>
                                            {client.fName} {client.lName} ({client.email})
                                        </option>
                                    ))}
                            </Select>
                            <VStack align="stretch" spacing={2}>
                                {selectedClients.map((clientId) => {
                                    const client = clientsData?.clients?.find((c: any) => c.id === clientId);
                                    const clientName = client ? `${client.fName} ${client.lName}` : 'Unknown User';
                                    return (
                                        <HStack key={clientId} justify="space-between" p={2} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                                            <Text color={textPrimary}>{clientName}</Text>
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Remove from sharing"
                                                icon={<DeleteIcon />}
                                                colorScheme="red"
                                                onClick={() => setSelectedClients(selectedClients.filter(id => id !== clientId))}
                                            />
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onShareClose} color={textPrimary}>
                            Cancel
                        </Button>
                        <Button 
                            bg={primaryColor} 
                            color="white" 
                            onClick={handleShare}
                            isDisabled={selectedClients.length === 0}
                            _hover={{ bg: primaryHover }}
                        >
                            Share Password
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Access Logs Modal */}
            <Modal isOpen={isLogsOpen} onClose={onLogsClose} size={{ base: "full", md: "xl" }}>
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
                <ModalContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
                    <ModalHeader color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                        Access Logs: {selectedPassword?.serviceName}
                    </ModalHeader>
                    <ModalCloseButton color={textPrimary} />
                    <ModalBody>
                        {logsLoading ? (
                            <Spinner />
                        ) : logsData?.passwordAccessLogs?.length > 0 ? (
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th color={textMuted}>User</Th>
                                        <Th color={textMuted}>Accessed At</Th>
                                        <Th color={textMuted}>IP Address</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {logsData.passwordAccessLogs.map((log: AccessLog) => (
                                        <Tr key={log.id}>
                                            <Td color={textPrimary}>
                                                {log.accessedBy.fName} {log.accessedBy.lName}
                                                <Text color={textMuted} fontSize="xs">
                                                    {log.accessedBy.email}
                                                </Text>
                                            </Td>
                                            <Td color={textPrimary}>
                                                {format(new Date(log.accessedAt), "MMM dd, yyyy HH:mm")}
                                            </Td>
                                            <Td color={textPrimary}>
                                                {log.ipAddress || "Unknown"}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        ) : (
                            <Text color={textMuted}>No access logs yet</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onLogsClose} color={textPrimary}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)">
                    <AlertDialogContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textPrimary}>
                            Deactivate Password
                        </AlertDialogHeader>
                        <AlertDialogBody color={textSecondary}>
                            Are you sure you want to deactivate the password for "{selectedPassword?.serviceName}"? 
                            This will prevent the user from accessing it.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose} variant="ghost" color={textPrimary}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeactivate} ml={3}>
                                Deactivate
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <FooterWithFourColumns />
        </Box>
    );
};

export default PasswordsList;