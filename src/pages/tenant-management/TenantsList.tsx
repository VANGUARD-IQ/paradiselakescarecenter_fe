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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Spinner,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Switch,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Checkbox,
    Wrap,
    WrapItem,
    Tooltip,
    Collapse,
    useBoolean,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Alert,
    AlertIcon,
    useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AddIcon, EditIcon, DeleteIcon, ExternalLinkIcon, SettingsIcon, RepeatIcon, SearchIcon, CheckCircleIcon, WarningIcon, InfoIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import tenantManagementModuleConfig from "./moduleConfig";
import { FiUsers, FiGlobe, FiDollarSign } from "react-icons/fi";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_TENANTS = gql`
  query GetTenants {
    tenants {
      id
      name
      domain
      websiteUrl
      status
      subscriptionTier
      githubRepo
      githubOwner
      deploymentUrl
      moduleConfig {
        moduleId
        version
        enabled
        enabledAt
      }
      branding {
        siteName
        primaryColor
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
      lastDeployment
    }
  }
`;

const DELETE_TENANT = gql`
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
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
      }
    }
  }
`;

// Available modules
const AVAILABLE_MODULES = [
    { id: "clients", name: "Client Management", icon: "👥" },
    { id: "sessions", name: "Session Booking", icon: "📅" },
    { id: "bills", name: "Billing & Invoicing", icon: "💳" },
    { id: "projects", name: "Project Management", icon: "📊" },
    { id: "products", name: "E-commerce", icon: "🛒" },
    { id: "sms-campaigns", name: "SMS Marketing", icon: "📱" },
    { id: "websites", name: "Website Builder", icon: "🌐" },
];

const TenantsList = () => {
    usePageTitle("Tenants");

    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const toast = useToast();
    const bg = getColor("background.main", colorMode);

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const labelColor = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const accentBlue = getColor("accentBlue", colorMode);

    // Delete tenant modal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [tenantToDelete, setTenantToDelete] = React.useState<any>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    // Module management modal
    const { isOpen: isModuleOpen, onOpen: onModuleOpen, onClose: onModuleClose } = useDisclosure();
    const [selectedTenant, setSelectedTenant] = React.useState<any>(null);

    // Filter state
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [tierFilter, setTierFilter] = React.useState("");
    const [clientFilter, setClientFilter] = React.useState("");
    const [domainFilter, setDomainFilter] = React.useState(""); // "has_domain", "no_domain", ""
    const [showFilters, setShowFilters] = useBoolean(false);
    const [showActionItems, setShowActionItems] = useBoolean(true);

    const { data, loading, error, refetch } = useQuery(GET_TENANTS);
    const [deleteTenant] = useMutation(DELETE_TENANT, {
        onCompleted: () => {
            toast({
                title: "Tenant Deleted",
                description: "The tenant has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Delete Failed",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            onClose();
        }
    });

    const [enableModule] = useMutation(ENABLE_MODULE_FOR_TENANT);
    const [disableModule] = useMutation(DISABLE_MODULE_FOR_TENANT);

    const handleDeleteClick = (tenant: any) => {
        setTenantToDelete(tenant);
        onOpen();
    };

    const handleDeleteConfirm = () => {
        if (tenantToDelete) {
            deleteTenant({
                variables: { id: tenantToDelete.id }
            });
        }
    };

    const handleModuleToggle = async (tenantId: string, moduleId: string, enabled: boolean) => {
        try {
            if (enabled) {
                await disableModule({ variables: { tenantId, moduleId } });
                toast({
                    title: "Module Disabled",
                    description: `${moduleId} has been disabled for this tenant`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                await enableModule({ variables: { tenantId, moduleId, version: "latest" } });
                toast({
                    title: "Module Enabled",
                    description: `${moduleId} has been enabled for this tenant`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
            refetch();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update module",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const openModuleManager = (tenant: any) => {
        setSelectedTenant(tenant);
        onModuleOpen();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: "rgba(34, 197, 94, 0.2)", color: "#22C55E", border: "rgba(34, 197, 94, 0.3)" };
            case 'TRIAL': return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" };
            case 'INACTIVE': return { bg: "rgba(107, 114, 128, 0.2)", color: "#6B7280", border: "rgba(107, 114, 128, 0.3)" };
            case 'SUSPENDED': return { bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "rgba(239, 68, 68, 0.3)" };
            default: return { bg: "rgba(107, 114, 128, 0.2)", color: "#6B7280", border: "rgba(107, 114, 128, 0.3)" };
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'FREE': return { bg: "rgba(107, 114, 128, 0.2)", color: "#6B7280", border: "rgba(107, 114, 128, 0.3)" };
            case 'BASIC': return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" };
            case 'PREMIUM': return { bg: "rgba(168, 85, 247, 0.2)", color: "#A855F7", border: "rgba(168, 85, 247, 0.3)" };
            case 'ENTERPRISE': return { bg: "rgba(251, 146, 60, 0.2)", color: "#FB923C", border: "rgba(251, 146, 60, 0.3)" };
            default: return { bg: "rgba(107, 114, 128, 0.2)", color: "#6B7280", border: "rgba(107, 114, 128, 0.3)" };
        }
    };

    const StatCard = ({ title, stat, icon, color }: any) => (
        <Box
            p={6}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="lg"
            border="1px"
            borderColor={cardBorder}>
            <HStack spacing={4}>
                <Box color={color}>{React.createElement(icon, { size: "2em" })}</Box>
                <Stat>
                    <StatLabel color={textSecondary}>{title}</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color={textPrimary}>{stat}</StatNumber>
                </Stat>
            </HStack>
        </Box>
    );

    // Action item analysis function
    const analyzeActionItems = (tenant: any) => {
        const items: Array<{type: 'critical' | 'warning' | 'info'; message: string; action?: string}> = [];
        
        // Critical items
        if (!tenant.domain) {
            items.push({ type: 'critical', message: 'No domain configured', action: 'Set up custom domain' });
        }
        if (tenant.status === 'TRIAL' && tenant.trialEndsAt) {
            const daysLeft = Math.ceil((new Date(tenant.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) {
                items.push({ type: 'critical', message: `Trial expires in ${daysLeft} days`, action: 'Upgrade subscription' });
            }
        }
        if (!tenant.githubRepo) {
            items.push({ type: 'critical', message: 'No repository configured', action: 'Set up GitHub repo' });
        }

        // Warning items
        const enabledModules = tenant.moduleConfig?.filter((m: any) => m.enabled)?.length || 0;
        if (enabledModules < 2) {
            items.push({ type: 'warning', message: 'Only basic modules enabled', action: 'Enable more features' });
        }
        if (!tenant.branding?.primaryColor) {
            items.push({ type: 'warning', message: 'No brand colors set', action: 'Complete branding' });
        }
        if (tenant.subscriptionTier === 'FREE') {
            items.push({ type: 'warning', message: 'Free tier - upgrade for more features', action: 'Discuss upgrade' });
        }

        // Info items  
        if (!tenant.lastDeployment) {
            items.push({ type: 'info', message: 'Never deployed', action: 'Deploy initial version' });
        }
        if (tenant.websiteUrl && !tenant.domain) {
            items.push({ type: 'info', message: 'Using generic URL', action: 'Add custom domain' });
        }

        return items;
    };

    // Filtering function
    const filteredTenants = React.useMemo(() => {
        if (!data?.tenants) return [];
        
        return data.tenants.filter((tenant: any) => {
            // Search term filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    tenant.name?.toLowerCase().includes(searchLower) ||
                    tenant.branding?.siteName?.toLowerCase().includes(searchLower) ||
                    tenant.domain?.toLowerCase().includes(searchLower) ||
                    tenant.client?.fName?.toLowerCase().includes(searchLower) ||
                    tenant.client?.lName?.toLowerCase().includes(searchLower) ||
                    tenant.client?.email?.toLowerCase().includes(searchLower) ||
                    tenant.client?.businessName?.toLowerCase().includes(searchLower);
                
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter && tenant.status !== statusFilter) return false;

            // Tier filter
            if (tierFilter && tenant.subscriptionTier !== tierFilter) return false;

            // Client filter
            if (clientFilter && tenant.client?.id !== clientFilter) return false;

            // Domain filter
            if (domainFilter === 'has_domain' && !tenant.domain) return false;
            if (domainFilter === 'no_domain' && tenant.domain) return false;

            return true;
        });
    }, [data?.tenants, searchTerm, statusFilter, tierFilter, clientFilter, domainFilter]);

    // Get unique clients for filter dropdown
    const uniqueClients = React.useMemo(() => {
        if (!data?.tenants) return [];
        const clients = data.tenants.map((t: any) => t.client).filter(Boolean);
        const unique = Array.from(new Map(clients.map((c: any) => [c.id, c])).values());
        return unique;
    }, [data?.tenants]);

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setTierFilter("");
        setClientFilter("");
        setDomainFilter("");
    };

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" color={textPrimary} />
                        <Text color={textPrimary}>Loading tenants...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <Text color="red.500">Error loading tenants: {error.message}</Text>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={tenantManagementModuleConfig} />
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between" flexWrap="wrap" spacing={4}>
                        <VStack align="start" spacing={2}>
                            <Heading size="lg" color={textPrimary}>🏢 Tenant Management</Heading>
                            <Text color={textMuted}>
                                Manage all client websites and configurations
                            </Text>
                        </VStack>
                        <HStack spacing={3} flexWrap="wrap">
                            <Button
                                colorScheme="green"
                                onClick={() => navigate("/admin/tenants/new")}
                                leftIcon={<AddIcon />}
                                size={{ base: "sm", md: "md" }}
                            >
                                Create New Site
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={() => navigate("/admin/deploy")}
                                leftIcon={<SettingsIcon />}
                                size={{ base: "sm", md: "md" }}
                            >
                                Deploy Updates
                            </Button>
                            <Button
                                colorScheme="purple"
                                onClick={() => navigate("/admin/tenant-deployment")}
                                leftIcon={<RepeatIcon />}
                                size={{ base: "sm", md: "md" }}
                            >
                                Tenant Deployment
                            </Button>
                        </HStack>
                    </HStack>

                    {/* Search and Filter Controls */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                {/* Search Bar */}
                                <HStack spacing={4} flexWrap="wrap">
                                    <InputGroup maxW="400px" flex="1">
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon color="gray.300" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search tenants, clients, domains..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            bg="whiteAlpha.100"
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: "gray.500" }}
                                            _hover={{ borderColor: accentBlue }}
                                            _focus={{ borderColor: accentBlue, boxShadow: "0 0 0 1px " + accentBlue }}
                                        />
                                    </InputGroup>
                                    <Button
                                        leftIcon={showFilters ? <RepeatIcon /> : <SettingsIcon />}
                                        onClick={setShowFilters.toggle}
                                        variant="outline"
                                        size="sm"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{
                                            borderColor: accentBlue,
                                            bg: 'rgba(59, 130, 246, 0.1)'
                                        }}
                                    >
                                        {showFilters ? 'Hide' : 'Show'} Filters
                                    </Button>
                                    {(searchTerm || statusFilter || tierFilter || clientFilter || domainFilter) && (
                                        <Button
                                            onClick={clearFilters}
                                            variant="ghost"
                                            size="sm"
                                            color="#EF4444"
                                            _hover={{
                                                bg: 'rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </HStack>

                                {/* Advanced Filters */}
                                <Collapse in={showFilters}>
                                    <Box p={4} border="1px" borderColor={cardBorder} borderRadius="md" bg="whiteAlpha.50">
                                        <Wrap spacing={4}>
                                            <WrapItem>
                                                <VStack align="start" spacing={2}>
                                                    <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Status</Text>
                                                    <Select
                                                        placeholder="All statuses"
                                                        value={statusFilter}
                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                        size="sm"
                                                        minW="150px"
                                                        bg="whiteAlpha.100"
                                                        border="1px solid"
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _hover={{ borderColor: accentBlue }}
                                                    >
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="TRIAL">Trial</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                        <option value="SUSPENDED">Suspended</option>
                                                    </Select>
                                                </VStack>
                                            </WrapItem>
                                            <WrapItem>
                                                <VStack align="start" spacing={2}>
                                                    <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Tier</Text>
                                                    <Select
                                                        placeholder="All tiers"
                                                        value={tierFilter}
                                                        onChange={(e) => setTierFilter(e.target.value)}
                                                        size="sm"
                                                        minW="150px"
                                                        bg="whiteAlpha.100"
                                                        border="1px solid"
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _hover={{ borderColor: accentBlue }}
                                                    >
                                                        <option value="FREE">Free</option>
                                                        <option value="BASIC">Basic</option>
                                                        <option value="PREMIUM">Premium</option>
                                                        <option value="ENTERPRISE">Enterprise</option>
                                                    </Select>
                                                </VStack>
                                            </WrapItem>
                                            <WrapItem>
                                                <VStack align="start" spacing={2}>
                                                    <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Domain</Text>
                                                    <Select
                                                        placeholder="All domains"
                                                        value={domainFilter}
                                                        onChange={(e) => setDomainFilter(e.target.value)}
                                                        size="sm"
                                                        minW="150px"
                                                        bg="whiteAlpha.100"
                                                        border="1px solid"
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _hover={{ borderColor: accentBlue }}
                                                    >
                                                        <option value="has_domain">Has Domain</option>
                                                        <option value="no_domain">No Domain</option>
                                                    </Select>
                                                </VStack>
                                            </WrapItem>
                                            <WrapItem>
                                                <VStack align="start" spacing={2}>
                                                    <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Client</Text>
                                                    <Select
                                                        placeholder="All clients"
                                                        value={clientFilter}
                                                        onChange={(e) => setClientFilter(e.target.value)}
                                                        size="sm"
                                                        minW="200px"
                                                        bg="whiteAlpha.100"
                                                        border="1px solid"
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _hover={{ borderColor: accentBlue }}
                                                    >
                                                        {uniqueClients.map((client: any) => (
                                                            <option key={client.id} value={client.id}>
                                                                {client.businessName || `${client.fName} ${client.lName}`}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </VStack>
                                            </WrapItem>
                                        </Wrap>
                                    </Box>
                                </Collapse>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Enhanced Stats Cards */}
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
                        <StatCard
                            title="Showing / Total"
                            stat={`${filteredTenants.length} / ${data?.tenants?.length || 0}`}
                            icon={FiUsers}
                            color="blue.500"
                        />
                        <StatCard
                            title="Active Sites"
                            stat={filteredTenants.filter((t: any) => t.status === 'ACTIVE').length}
                            icon={FiGlobe}
                            color="green.500"
                        />
                        <StatCard
                            title="Need Domains"
                            stat={filteredTenants.filter((t: any) => !t.domain).length}
                            icon={WarningIcon}
                            color="orange.500"
                        />
                        <StatCard
                            title="Premium+"
                            stat={filteredTenants.filter((t: any) => ['PREMIUM', 'ENTERPRISE'].includes(t.subscriptionTier)).length}
                            icon={FiDollarSign}
                            color="purple.500"
                        />
                    </SimpleGrid>

                    {/* Action Items Toggle */}
                    <HStack spacing={3}>
                        <Checkbox
                            isChecked={showActionItems}
                            onChange={setShowActionItems.toggle}
                            colorScheme="blue"
                        >
                            <Text color={textPrimary}>Show Action Items</Text>
                        </Checkbox>
                        {filteredTenants.length !== (data?.tenants?.length || 0) && (
                            <Badge 
                                bg="rgba(59, 130, 246, 0.2)" 
                                color="#3B82F6" 
                                border="1px solid" 
                                borderColor="rgba(59, 130, 246, 0.3)">
                                Filtered: {filteredTenants.length} of {data?.tenants?.length || 0} tenants
                            </Badge>
                        )}
                    </HStack>

                    {/* Tenants Table */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                            <Heading size="md" color={textPrimary}>Client Sites</Heading>
                        </CardHeader>
                        <CardBody p={0}>
                            <Box overflowX="auto">
                                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                    <Thead>
                                        <Tr>
                                            <Th minW="80px" color={labelColor}>ID</Th>
                                            <Th minW="200px" color={labelColor}>Site Name</Th>
                                            <Th minW="180px" display={{ base: "none", md: "table-cell" }} color={labelColor}>Client</Th>
                                            <Th minW="100px" color={labelColor}>Status</Th>
                                            <Th minW="100px" display={{ base: "none", lg: "table-cell" }} color={labelColor}>Tier</Th>
                                            <Th minW="120px" display={{ base: "none", lg: "table-cell" }} color={labelColor}>Modules</Th>
                                            {showActionItems && (
                                                <Th minW="200px" display={{ base: "none", xl: "table-cell" }} color={labelColor}>Next Actions</Th>
                                            )}
                                            <Th minW="150px" display={{ base: "none", xl: "table-cell" }} color={labelColor}>Domain</Th>
                                            <Th minW="120px" display={{ base: "none", xl: "table-cell" }} color={labelColor}>Repository</Th>
                                            <Th minW="100px" display={{ base: "none", lg: "table-cell" }} color={labelColor}>Created</Th>
                                            <Th minW="140px" color={labelColor}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTenants.map((tenant: any) => {
                                            const actionItems = analyzeActionItems(tenant);
                                            return (
                                            <Tr
                                                key={tenant.id}
                                                cursor="pointer"
                                                _hover={{
                                                    transform: "translateY(-1px)",
                                                    boxShadow: "sm"
                                                }}
                                                transition="all 0.2s ease"
                                                onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
                                            >
                                                <Td>
                                                    <Text fontSize="xs" fontFamily="mono" color={textMuted}>
                                                        {tenant.id.slice(0, 8)}...
                                                    </Text>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text 
                                                            fontWeight="bold" 
                                                            color={accentBlue} 
                                                            fontSize={{ base: "sm", md: "md" }}
                                                            cursor="pointer"
                                                            _hover={{ textDecoration: "underline" }}
                                                            onClick={() => window.open(`/admin/tenants/${tenant.id}/edit`, '_blank')}
                                                        >
                                                            {tenant.branding?.siteName || tenant.name}
                                                        </Text>
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {tenant.name}
                                                        </Text>
                                                        {tenant.branding?.primaryColor && (
                                                            <HStack spacing={2}>
                                                                <Box
                                                                    w={3}
                                                                    h={3}
                                                                    bg={tenant.branding.primaryColor}
                                                                    borderRadius="full"
                                                                    border="1px"
                                                                    borderColor={cardBorder}
                                                                />
                                                                <Text fontSize="xs" color={textMuted}>
                                                                    {tenant.branding.primaryColor}
                                                                </Text>
                                                            </HStack>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", md: "table-cell" }}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontWeight="medium" fontSize="sm" color={textPrimary}>
                                                            {tenant.client?.businessName ||
                                                                `${tenant.client?.fName} ${tenant.client?.lName}`}
                                                        </Text>
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {tenant.client?.email}
                                                        </Text>
                                                    </VStack>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()}>
                                                    <VStack align="start" spacing={1}>
                                                        <Badge 
                                                            bg={getStatusColor(tenant.status).bg}
                                                            color={getStatusColor(tenant.status).color}
                                                            border="1px solid"
                                                            borderColor={getStatusColor(tenant.status).border}
                                                            size="sm">
                                                            {tenant.status}
                                                        </Badge>
                                                        {tenant.trialEndsAt && (
                                                            <Text fontSize="xs" color={textMuted}>
                                                                Trial: {new Date(tenant.trialEndsAt).toLocaleDateString()}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", lg: "table-cell" }}>
                                                    <Badge 
                                                        bg={getTierColor(tenant.subscriptionTier).bg}
                                                        color={getTierColor(tenant.subscriptionTier).color}
                                                        border="1px solid"
                                                        borderColor={getTierColor(tenant.subscriptionTier).border}
                                                        size="sm">
                                                        {tenant.subscriptionTier}
                                                    </Badge>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", lg: "table-cell" }}>
                                                    <HStack spacing={1} flexWrap="wrap">
                                                        {tenant.moduleConfig
                                                            ?.filter((m: any) => m.enabled)
                                                            ?.slice(0, 2)
                                                            ?.map((module: any) => (
                                                                <Badge key={module.moduleId} size="xs" 
                                                                    bg="rgba(59, 130, 246, 0.2)" 
                                                                    color="#3B82F6" 
                                                                    border="1px solid" 
                                                                    borderColor="rgba(59, 130, 246, 0.3)">
                                                                    {module.moduleId}
                                                                </Badge>
                                                            ))}
                                                        {(tenant.moduleConfig?.filter((m: any) => m.enabled)?.length || 0) > 2 && (
                                                            <Badge size="xs" 
                                                                bg="rgba(107, 114, 128, 0.2)" 
                                                                color="#6B7280" 
                                                                border="1px solid" 
                                                                borderColor="rgba(107, 114, 128, 0.3)">
                                                                +{(tenant.moduleConfig?.filter((m: any) => m.enabled)?.length || 0) - 2}
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                </Td>
                                                {showActionItems && (
                                                    <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", xl: "table-cell" }}>
                                                        <VStack align="start" spacing={1} maxW="200px">
                                                            {actionItems.slice(0, 2).map((item, index) => (
                                                                <Tooltip key={index} label={item.action} hasArrow>
                                                                    <HStack spacing={2} cursor="help">
                                                                        {item.type === 'critical' && <WarningIcon color="red.500" boxSize={3} />}
                                                                        {item.type === 'warning' && <InfoIcon color="orange.500" boxSize={3} />}
                                                                        {item.type === 'info' && <CheckCircleIcon color="blue.500" boxSize={3} />}
                                                                        <Text fontSize="xs" color={
                                                                            item.type === 'critical' ? 'red.600' :
                                                                            item.type === 'warning' ? 'orange.600' : 'blue.600'
                                                                        }>
                                                                            {item.message}
                                                                        </Text>
                                                                    </HStack>
                                                                </Tooltip>
                                                            ))}
                                                            {actionItems.length > 2 && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    +{actionItems.length - 2} more
                                                                </Text>
                                                            )}
                                                            {actionItems.length === 0 && (
                                                                <HStack spacing={2}>
                                                                    <CheckCircleIcon color="green.500" boxSize={3} />
                                                                    <Text fontSize="xs" color="green.600">All set!</Text>
                                                                </HStack>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                )}
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", xl: "table-cell" }}>
                                                    {tenant.domain ? (
                                                        <Button
                                                            as="a"
                                                            href={`https://${tenant.domain}`}
                                                            target="_blank"
                                                            size="xs"
                                                            variant="link"
                                                            color={accentBlue}
                                                            rightIcon={<ExternalLinkIcon />}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {tenant.domain}
                                                        </Button>
                                                    ) : (
                                                        <Text color={textMuted} fontSize="sm">No domain</Text>
                                                    )}
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", xl: "table-cell" }}>
                                                    {tenant.githubRepo ? (
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="xs" fontWeight="medium" color={textPrimary}>
                                                                {tenant.githubRepo}
                                                            </Text>
                                                            {tenant.githubOwner && (
                                                                <Text fontSize="xs" color={textMuted}>
                                                                    {tenant.githubOwner}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    ) : (
                                                        <Text fontSize="sm" color={textMuted}>
                                                            No repo
                                                        </Text>
                                                    )}
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()} display={{ base: "none", lg: "table-cell" }}>
                                                    <Text fontSize="xs" color={textSecondary}>
                                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </Td>
                                                <Td onClick={(e) => e.stopPropagation()}>
                                                    <HStack spacing={1} flexWrap="wrap">
                                                        <IconButton
                                                            aria-label="Manage modules"
                                                            icon={<SettingsIcon />}
                                                            size="sm"
                                                            bg="rgba(59, 130, 246, 0.2)"
                                                            color="#3B82F6"
                                                            border="1px solid"
                                                            borderColor="rgba(59, 130, 246, 0.3)"
                                                            _hover={{
                                                                bg: "rgba(59, 130, 246, 0.3)",
                                                                transform: "translateY(-1px)"
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openModuleManager(tenant);
                                                            }}
                                                        />
                                                        <IconButton
                                                            aria-label="Edit tenant"
                                                            icon={<EditIcon />}
                                                            size="sm"
                                                            bg="rgba(34, 197, 94, 0.2)"
                                                            color="#22C55E"
                                                            border="1px solid"
                                                            borderColor="rgba(34, 197, 94, 0.3)"
                                                            _hover={{
                                                                bg: "rgba(34, 197, 94, 0.3)",
                                                                transform: "translateY(-1px)"
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/admin/tenants/${tenant.id}/edit`);
                                                            }}
                                                        />
                                                        {tenant.deploymentUrl && (
                                                            <IconButton
                                                                as="a"
                                                                href={tenant.deploymentUrl}
                                                                target="_blank"
                                                                aria-label="View repository"
                                                                icon={<ExternalLinkIcon />}
                                                                size="sm"
                                                                variant="outline"
                                                                borderColor="rgba(255, 255, 255, 0.1)"
                                                                color="white"
                                                                _hover={{
                                                                    borderColor: "rgba(59, 130, 246, 0.5)",
                                                                    transform: "translateY(-1px)"
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        )}
                                                        <IconButton
                                                            aria-label="Delete tenant"
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            bg="rgba(239, 68, 68, 0.2)"
                                                            color="#EF4444"
                                                            border="1px solid"
                                                            borderColor="rgba(239, 68, 68, 0.3)"
                                                            _hover={{
                                                                bg: "rgba(239, 68, 68, 0.3)",
                                                                transform: "translateY(-1px)"
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(tenant);
                                                            }}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>

                            {filteredTenants.length === 0 && (
                                <VStack py={8} spacing={4}>
                                    {data?.tenants?.length === 0 ? (
                                        <>
                                            <Text color="rgba(255, 255, 255, 0.5)">No tenants found</Text>
                                            <Button
                                                onClick={() => navigate("/admin/tenants/new")}
                                                leftIcon={<AddIcon />}
                                                bg="white"
                                                color="black"
                                                _hover={{
                                                    bg: "gray.100",
                                                    transform: "translateY(-2px)"
                                                }}
                                            >
                                                Create Your First Tenant
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Text color="rgba(255, 255, 255, 0.5)">No tenants match your current filters</Text>
                                            <Button
                                                onClick={clearFilters}
                                                variant="outline"
                                                leftIcon={<RepeatIcon />}
                                                borderColor="rgba(255, 255, 255, 0.1)"
                                                color="white"
                                                _hover={{
                                                    borderColor: "rgba(59, 130, 246, 0.5)",
                                                    transform: "translateY(-2px)"
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        </>
                                    )}
                                </VStack>
                            )}
                        </CardBody>
                    </Card>

                    {/* Growth Insights */}
                    {data?.tenants && data.tenants.length > 0 && (
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            borderWidth="1px"
                            borderColor={cardBorder}
                            overflow="hidden">
                            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                                <Heading size="md" color={textPrimary}>📈 Growth Insights & Recommendations</Heading>
                            </CardHeader>
                            <CardBody>
                                <Accordion allowToggle>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left">
                                                <HStack spacing={3}>
                                                    <WarningIcon color="orange.500" />
                                                    <Text fontWeight="medium" color={textPrimary}>Business Optimization Opportunities</Text>
                                                    <Badge bg="rgba(251, 146, 60, 0.2)" color="#FB923C" border="1px solid" borderColor="rgba(251, 146, 60, 0.3)">
                                                        {data.tenants.filter((t: any) => !t.domain || t.subscriptionTier === 'FREE' || !t.githubRepo).length} sites need attention
                                                    </Badge>
                                                </HStack>
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel pb={4}>
                                            <VStack align="start" spacing={3}>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="100%">
                                                    <Card variant="outline" size="sm">
                                                        <CardBody>
                                                            <VStack align="start" spacing={2}>
                                                                <Text fontWeight="bold" color="orange.600">Domain Setup</Text>
                                                                <Text fontSize="sm">
                                                                    {data.tenants.filter((t: any) => !t.domain).length} sites need custom domains
                                                                </Text>
                                                                <Text fontSize="xs" color={textMuted}>
                                                                    Priority: Set up domains to improve professionalism and SEO
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                    <Card variant="outline" size="sm">
                                                        <CardBody>
                                                            <VStack align="start" spacing={2}>
                                                                <Text fontWeight="bold" color="purple.600">Upgrade Opportunities</Text>
                                                                <Text fontSize="sm">
                                                                    {data.tenants.filter((t: any) => t.subscriptionTier === 'FREE').length} free tier clients
                                                                </Text>
                                                                <Text fontSize="xs" color={textMuted}>
                                                                    Target: Convert to paid plans for increased revenue
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                    <Card variant="outline" size="sm">
                                                        <CardBody>
                                                            <VStack align="start" spacing={2}>
                                                                <Text fontWeight="bold" color="red.600">Technical Issues</Text>
                                                                <Text fontSize="sm">
                                                                    {data.tenants.filter((t: any) => !t.githubRepo).length} sites missing repos
                                                                </Text>
                                                                <Text fontSize="xs" color={textMuted}>
                                                                    Action: Set up repositories for deployment capability
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                </SimpleGrid>
                                            </VStack>
                                        </AccordionPanel>
                                    </AccordionItem>
                                    
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left">
                                                <HStack spacing={3}>
                                                    <InfoIcon color="blue.500" />
                                                    <Text fontWeight="medium" color={textPrimary}>Client Acquisition Strategy</Text>
                                                    <Badge bg="rgba(59, 130, 246, 0.2)" color="#3B82F6" border="1px solid" borderColor="rgba(59, 130, 246, 0.3)">
                                                        {uniqueClients.length} clients total
                                                    </Badge>
                                                </HStack>
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel pb={4}>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <Alert status="info" variant="left-accent">
                                                    <AlertIcon />
                                                    <VStack align="start" spacing={2}>
                                                        <Text fontWeight="bold">Current Portfolio Health</Text>
                                                        <VStack align="start" spacing={1} fontSize="sm">
                                                            <Text>• {data.tenants.filter((t: any) => t.status === 'ACTIVE').length} active sites generating revenue</Text>
                                                            <Text>• {data.tenants.filter((t: any) => ['PREMIUM', 'ENTERPRISE'].includes(t.subscriptionTier)).length} high-value clients</Text>
                                                            <Text>• Average {Math.round((data.tenants.reduce((acc: number, t: any) => acc + (t.moduleConfig?.filter((m: any) => m.enabled)?.length || 0), 0) / data.tenants.length) || 0)} modules per site</Text>
                                                        </VStack>
                                                    </VStack>
                                                </Alert>
                                                <Alert status="success" variant="left-accent">
                                                    <AlertIcon />
                                                    <VStack align="start" spacing={2}>
                                                        <Text fontWeight="bold">Growth Opportunities</Text>
                                                        <VStack align="start" spacing={1} fontSize="sm">
                                                            <Text>• Target: 5+ new clients per month</Text>
                                                            <Text>• Focus: B2B service businesses needing websites</Text>
                                                            <Text>• Strategy: Showcase existing success stories</Text>
                                                            <Text>• Upsell: Additional modules to existing clients</Text>
                                                        </VStack>
                                                    </VStack>
                                                </Alert>
                                            </SimpleGrid>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>

            {/* Module Management Modal */}
            <Modal isOpen={isModuleOpen} onClose={onModuleClose} size="xl">
                <ModalOverlay />
                <ModalContent
                    bg={cardGradientBg}
                    color={textPrimary}
                    borderColor={cardBorder}
                    borderWidth="1px"
                >
                    <ModalHeader color={textPrimary}>
                        Manage Modules: {selectedTenant?.branding?.siteName || selectedTenant?.name}
                    </ModalHeader>
                    <ModalCloseButton color={textPrimary} />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Text color={textMuted}>
                                Enable or disable modules for this client site. Changes will be deployed automatically.
                            </Text>

                            {AVAILABLE_MODULES.map((module) => {
                                const tenantModule = selectedTenant?.moduleConfig?.find((m: any) => m.moduleId === module.id);
                                const isEnabled = tenantModule?.enabled || false;

                                return (
                                    <Card
                                        key={module.id}
                                        variant="outline"
                                        bg={cardGradientBg}
                                        borderColor={cardBorder}
                                    >
                                        <CardBody>
                                            <HStack justify="space-between">
                                                <HStack spacing={3}>
                                                    <Text fontSize="2xl">{module.icon}</Text>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontWeight="bold" color={textPrimary}>{module.name}</Text>
                                                        <Text fontSize="sm" color={textMuted}>
                                                            {tenantModule ? `v${tenantModule.version}` : "Not installed"}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <Switch
                                                    isChecked={isEnabled}
                                                    onChange={() => handleModuleToggle(
                                                        selectedTenant.id,
                                                        module.id,
                                                        isEnabled
                                                    )}
                                                    colorScheme="blue"
                                                    size="lg"
                                                />
                                            </HStack>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay />
                <AlertDialogContent
                    bg={cardGradientBg}
                    color={textPrimary}
                    borderColor={cardBorder}
                    borderWidth="1px"
                >
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textPrimary}>
                        Delete Tenant
                    </AlertDialogHeader>

                    <AlertDialogBody color={textSecondary}>
                        Are you sure you want to delete "{tenantToDelete?.branding?.siteName || tenantToDelete?.name}"?
                        This action cannot be undone and will remove all associated data.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <FooterWithFourColumns />
        </Box>
    );
};

export default TenantsList; 