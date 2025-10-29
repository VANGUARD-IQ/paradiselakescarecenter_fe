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
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Select,
    Input,
    Checkbox,
    CheckboxGroup,
    Stack,
    Alert,
    AlertIcon,
    Progress,
    IconButton,
    Tooltip,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    useColorModeValue,
    useColorMode,
    Divider,
    Spinner
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, RepeatIcon, AddIcon, ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import tenantManagementModuleConfig from "./moduleConfig";
import { getColor, getComponent } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_TENANTS_DEPLOYMENT_STATUS = gql`
  query GetTenantsDeploymentStatus {
    tenants {
      id
      name
      status
      subscriptionTier
      githubRepo
      githubOwner
      deploymentUrl
      lastDeployment
      moduleConfig {
        moduleId
        version
        enabled
        enabledAt
      }
      branding {
        siteName
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

const DEPLOY_MODULE_TO_TENANTS = gql`
  mutation DeployModuleToTenants($moduleId: String!, $tenantIds: [ID!]!) {
    deployModuleToTenants(moduleId: $moduleId, tenantIds: $tenantIds) {
      moduleId
      totalTenants
      successfulDeployments
      failedDeployments
      results {
        tenantId
        tenantName
        repoName
        success
        error
        commitSha
      }
    }
  }
`;

const CREATE_CLIENT_REPO = gql`
  mutation CreateClientRepo($clientRepoName: String!, $clientGithubOwner: String!, $clientGithubToken: String!) {
    createClientRepo(clientRepoName: $clientRepoName, clientGithubOwner: $clientGithubOwner, clientGithubToken: $clientGithubToken)
  }
`;

const UPDATE_TENANT_GITHUB_INFO = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      githubRepo
      githubOwner
      deploymentUrl
      lastDeployment
    }
  }
`;

const DEPLOY_MODULE_TO_TENANT = gql`
  mutation DeployModuleToTenant($moduleId: String!, $tenantId: String!) {
    deployModuleToTenant(moduleId: $moduleId, tenantId: $tenantId) {
      tenantId
      tenantName
      success
      error
      commitSha
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

// Available modules will be fetched from GraphQL

const ModuleDeployment = () => {
    usePageTitle("Module Deployment");

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
  const infoBg = getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode);

    // State for modals
    const { isOpen: isDeployOpen, onOpen: onDeployOpen, onClose: onDeployClose } = useDisclosure();
    const { isOpen: isRepoOpen, onOpen: onRepoOpen, onClose: onRepoClose } = useDisclosure();

    // Form state
    const [selectedModule, setSelectedModule] = React.useState("");
    const [selectedTenants, setSelectedTenants] = React.useState<string[]>([]);
    const [repoName, setRepoName] = React.useState("");
    const [githubOwner, setGithubOwner] = React.useState("tommycp3");
    const [githubToken, setGithubToken] = React.useState("");
    const [selectedTenantForRepo, setSelectedTenantForRepo] = React.useState<any>(null);

    // Loading states
    const [isDeploying, setIsDeploying] = React.useState(false);
    const [isCreatingRepo, setIsCreatingRepo] = React.useState(false);
    const [deploymentLogs, setDeploymentLogs] = React.useState<string[]>([]);
    const [currentDeploymentTenant, setCurrentDeploymentTenant] = React.useState<string>("");
    const [showDeploymentModal, setShowDeploymentModal] = React.useState(false);

    const { data, loading, error, refetch } = useQuery(GET_TENANTS_DEPLOYMENT_STATUS);
    const { data: modulesData, loading: modulesLoading } = useQuery(GET_AVAILABLE_MODULES);
    const [deployModuleToTenants] = useMutation(DEPLOY_MODULE_TO_TENANTS);
    const [deployModuleToTenant] = useMutation(DEPLOY_MODULE_TO_TENANT);
    const [enableModuleForTenant] = useMutation(ENABLE_MODULE_FOR_TENANT);
    const [createClientRepo] = useMutation(CREATE_CLIENT_REPO);
    const [updateTenant] = useMutation(UPDATE_TENANT_GITHUB_INFO);

    const tenants = data?.tenants || [];

    // Function to add logs with timestamp
    const addDeploymentLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        setDeploymentLogs(prev => [...prev, logMessage]);
        console.log(`🚀 DEPLOYMENT: ${logMessage}`);
    };

    // Function to clear logs
    const clearDeploymentLogs = () => {
        setDeploymentLogs([]);
    };

    const handleModuleDeployment = async () => {
        if (!selectedModule || selectedTenants.length === 0) {
            toast({
                title: "Missing Information",
                description: "Please select a module and at least one tenant",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsDeploying(true);

        try {
            const result = await deployModuleToTenants({
                variables: {
                    moduleId: selectedModule,
                    tenantIds: selectedTenants
                }
            });

            const deploymentResult = result.data.deployModuleToTenants;

            toast({
                title: "Deployment Complete",
                description: `${deploymentResult.successfulDeployments}/${deploymentResult.totalTenants} deployments successful`,
                status: deploymentResult.failedDeployments === 0 ? "success" : "warning",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setSelectedModule("");
            setSelectedTenants([]);
            onDeployClose();
            refetch();

        } catch (error) {
            toast({
                title: "Deployment Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const handleSingleTenantDeployment = async (tenantId: string, moduleId: string, tenantName: string) => {
        // Initialize deployment modal
        setCurrentDeploymentTenant(tenantName);
        clearDeploymentLogs();
        setShowDeploymentModal(true);
        setIsDeploying(true);

        try {
            addDeploymentLog(`🚀 Starting deployment of ${moduleId} module to ${tenantName}`);
            addDeploymentLog(`📋 Tenant ID: ${tenantId}`);
            
            const tenant = tenants.find((t: any) => t.id === tenantId);
            if (tenant) {
                addDeploymentLog(`📂 Target Repository: ${tenant.githubOwner}/${tenant.githubRepo}`);
                addDeploymentLog(`🌐 Deployment URL: ${tenant.deploymentUrl || 'Not configured'}`);
            }

            addDeploymentLog(`📡 Sending deployment request to backend...`);

            const result = await deployModuleToTenant({
                variables: {
                    moduleId,
                    tenantId
                }
            });

            const deploymentResult = result.data.deployModuleToTenant;

            if (deploymentResult.success) {
                addDeploymentLog(`✅ Backend deployment request successful`);
                addDeploymentLog(`📝 Commit SHA: ${deploymentResult.commitSha || 'Not provided'}`);
                addDeploymentLog(`🎉 Module ${moduleId} successfully deployed to ${tenantName}!`);
                addDeploymentLog(`📁 Files copied to repository: ${tenant?.githubOwner}/${tenant?.githubRepo}`);
                addDeploymentLog(`🔄 Repository has been updated with new module files`);

                // Enable the module for the tenant
                addDeploymentLog(`🔧 Enabling module ${moduleId} for tenant...`);
                try {
                    const moduleVersion = modulesData?.availableModules?.find((m: any) => m.id === moduleId)?.version || 'latest';
                    
                    await enableModuleForTenant({
                        variables: {
                            tenantId: tenantId,
                            moduleId: moduleId,
                            version: moduleVersion
                        }
                    });

                    addDeploymentLog(`✅ Module ${moduleId} enabled in tenant configuration`);
                    addDeploymentLog(`📋 Module is now active and accessible on the client site`);
                } catch (enableError) {
                    addDeploymentLog(`⚠️ Warning: Module deployed but failed to enable in tenant config`);
                    addDeploymentLog(`🔧 Error: ${enableError instanceof Error ? enableError.message : 'Unknown enable error'}`);
                    addDeploymentLog(`💡 You may need to manually enable the module in tenant settings`);
                }

                toast({
                    title: "✅ Deployment Successful!",
                    description: `${moduleId} module deployed and enabled for ${tenantName}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                addDeploymentLog(`❌ Deployment failed: ${deploymentResult.error || 'Unknown error'}`);
                addDeploymentLog(`💡 Check the error details above for troubleshooting`);

                toast({
                    title: "❌ Deployment Failed",
                    description: deploymentResult.error || "Unknown error occurred",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }

            addDeploymentLog(`🔄 Refreshing tenant data...`);
            refetch();
            addDeploymentLog(`✅ Deployment process completed`);

        } catch (error) {
            addDeploymentLog(`💥 Deployment error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
            addDeploymentLog(`❌ Deployment failed with exception`);

            toast({
                title: "Deployment Error",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const handleCreateRepo = async () => {
        if (!repoName || !githubOwner || !githubToken || !selectedTenantForRepo) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsCreatingRepo(true);

        try {
            const result = await createClientRepo({
                variables: {
                    clientRepoName: repoName,
                    clientGithubOwner: githubOwner,
                    clientGithubToken: githubToken
                }
            });

            // Update tenant with GitHub info
            await updateTenant({
                variables: {
                    id: selectedTenantForRepo.id,
                    input: {
                        githubRepo: repoName,
                        deploymentUrl: `https://github.com/${githubOwner}/${repoName}`
                    }
                }
            });

            toast({
                title: "Repository Created",
                description: `Successfully created ${githubOwner}/${repoName}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setRepoName("");
            setGithubOwner("tommycp3");
            setGithubToken("");
            setSelectedTenantForRepo(null);
            onRepoClose();
            refetch();

        } catch (error) {
            toast({
                title: "Repository Creation Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsCreatingRepo(false);
        }
    };

    const openRepoCreation = (tenant: any) => {
        setSelectedTenantForRepo(tenant);
        setRepoName(tenant.name ? `${tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-frontend` : "");
        onRepoOpen();
    };

    const getRepoStatus = (tenant: any) => {
        if (!tenant.githubRepo) {
            return { status: "No Repo", color: "red", icon: "❌" };
        }
        if (!tenant.lastDeployment) {
            return { status: "Never Deployed", color: "orange", icon: "⚠️" };
        }

        const daysSince = Math.floor((Date.now() - new Date(tenant.lastDeployment).getTime()) / (1000 * 60 * 60 * 24));

        if (daysSince === 0) {
            return { status: "Updated Today", color: "green", icon: "✅" };
        } else if (daysSince < 7) {
            return { status: `${daysSince}d ago`, color: "yellow", icon: "🟡" };
        } else {
            return { status: `${daysSince}d ago`, color: "orange", icon: "⚠️" };
        }
    };

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading tenant deployment status...</Text>
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
                    <Alert status="error">
                        <AlertIcon />
                        <Text>Error loading deployment status: {error.message}</Text>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const tenantsWithRepos = tenants.filter((t: any) => t.githubRepo);
    const tenantsWithoutRepos = tenants.filter((t: any) => !t.githubRepo);
    const recentDeployments = tenants.filter((t: any) => t.lastDeployment);

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={tenantManagementModuleConfig} />
            <Container maxW="container.xl" py={12} flex="1">
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
                            <Heading size="lg" color={textPrimary}>📦 Module Deployment</Heading>
                            <Text color={textMuted}>Deploy and manage modules across all tenant sites</Text>
                        </VStack>
                        <HStack spacing={3}>
                            <Button
                                colorScheme="blue"
                                onClick={() => navigate("/tenants/quick-deploy")}
                                leftIcon={<RepeatIcon />}
                            >
                                ⚡ Quick Deploy
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={() => navigate("/admin/tenants/new")}
                                leftIcon={<AddIcon />}
                            >
                                Create New Site
                            </Button>
                        </HStack>
                    </HStack>

                    {/* Stats Cards */}
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Total Tenants</StatLabel>
                                    <StatNumber fontSize="2xl">{tenants.length}</StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>With Repositories</StatLabel>
                                    <StatNumber fontSize="2xl" color="green.500">
                                        {tenantsWithRepos.length}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Need Repository</StatLabel>
                                    <StatNumber fontSize="2xl" color="red.500">
                                        {tenantsWithoutRepos.length}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Recent Deployments</StatLabel>
                                    <StatNumber fontSize="2xl" color="blue.500">
                                        {recentDeployments.length}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Available Modules Reference */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <VStack align="start" spacing={2}>
                                <Heading size="md" color={textPrimary}>📚 Available Business Modules Reference</Heading>
                                <Text color={textMuted} fontSize="sm">
                                    Complete list of all available modules in the system with their requirements
                                </Text>
                            </VStack>
                        </CardHeader>
                        <CardBody>
                            {modulesLoading ? (
                                <VStack spacing={4}>
                                    <Spinner />
                                    <Text>Loading available modules...</Text>
                                </VStack>
                            ) : modulesData?.availableModules ? (
                                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                                    {modulesData.availableModules.map((module: any) => (
                                        <VStack key={module.id} align="start" p={4} border="1px" borderColor={cardBorder} borderRadius="md" bg={infoBg} spacing={3}>
                                            <HStack spacing={3}>
                                                <Text fontSize="xl">{module.icon}</Text>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" fontSize="md">
                                                        {module.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {module.id}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Text fontSize="sm" color={textMuted} lineHeight="short">
                                                {module.description}
                                            </Text>
                                            <HStack spacing={2}>
                                                <Badge size="sm" colorScheme="blue">
                                                    v{module.version}
                                                </Badge>
                                                <Badge 
                                                    size="sm" 
                                                    colorScheme={
                                                        module.requiredTier === 'FREE' ? 'green' :
                                                        module.requiredTier === 'BASIC' ? 'blue' :
                                                        module.requiredTier === 'PREMIUM' ? 'purple' :
                                                        'orange'
                                                    }
                                                >
                                                    {module.requiredTier}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Alert status="warning">
                                    <AlertIcon />
                                    <Text>No modules available or failed to load</Text>
                                </Alert>
                            )}
                        </CardBody>
                    </Card>

                    {/* Tenants Table */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <Heading size="md" color={textPrimary}>Tenant Deployment Status</Heading>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => refetch()}
                                    leftIcon={<RepeatIcon />}
                                >
                                    Refresh
                                </Button>
                            </HStack>
                        </CardHeader>
                        <CardBody p={0}>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Site Name</Th>
                                            <Th>Client</Th>
                                            <Th>Repository Status</Th>
                                            <Th>Last Deployment</Th>
                                            <Th>Enabled Modules</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {tenants.map((tenant: any) => {
                                            const repoStatus = getRepoStatus(tenant);
                                            const enabledModules = tenant.moduleConfig?.filter((m: any) => m.enabled) || [];

                                            return (
                                                <Tr key={tenant.id}>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="bold">
                                                                {tenant.branding?.siteName || tenant.name}
                                                            </Text>
                                                            <Badge colorScheme={tenant.status === 'ACTIVE' ? 'green' : 'gray'}>
                                                                {tenant.status}
                                                            </Badge>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontSize="sm">
                                                                {tenant.client?.businessName ||
                                                                    `${tenant.client?.fName} ${tenant.client?.lName}`}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {tenant.client?.email}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <HStack>
                                                                <Text>{repoStatus.icon}</Text>
                                                                <Badge colorScheme={repoStatus.color}>
                                                                    {repoStatus.status}
                                                                </Badge>
                                                            </HStack>
                                                            {tenant.githubRepo && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {tenant.githubOwner}/{tenant.githubRepo}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        {tenant.lastDeployment ? (
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="sm">
                                                                    {new Date(tenant.lastDeployment).toLocaleDateString()}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {new Date(tenant.lastDeployment).toLocaleTimeString()}
                                                                </Text>
                                                            </VStack>
                                                        ) : (
                                                            <Text fontSize="sm" color="gray.500">
                                                                Never deployed
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={2} maxW="300px">
                                                            <HStack spacing={1} flexWrap="wrap">
                                                                {enabledModules.length > 0 ? (
                                                                    enabledModules.map((module: any) => {
                                                                        const moduleInfo = modulesData?.availableModules?.find((m: any) => m.id === module.moduleId);
                                                                        return (
                                                                            <Badge 
                                                                                key={module.moduleId} 
                                                                                size="sm" 
                                                                                colorScheme="green"
                                                                                title={`${moduleInfo?.name || module.moduleId} - v${module.version} (${moduleInfo?.requiredTier || 'Unknown'})`}
                                                                            >
                                                                                {moduleInfo?.icon || "📦"} {moduleInfo?.name || module.moduleId}
                                                                            </Badge>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <Badge size="sm" colorScheme="gray">
                                                                        No modules enabled
                                                                    </Badge>
                                                                )}
                                                            </HStack>
                                                            {enabledModules.length > 0 && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {enabledModules.length} module{enabledModules.length !== 1 ? 's' : ''} enabled
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            {!tenant.githubRepo ? (
                                                                <Tooltip label="Create GitHub Repository">
                                                                    <IconButton
                                                                        aria-label="Create repo"
                                                                        icon={<AddIcon />}
                                                                        size="sm"
                                                                        colorScheme="green"
                                                                        onClick={() => openRepoCreation(tenant)}
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <>
                                                                    <Tooltip label="Deploy Modules">
                                                                        <IconButton
                                                                            aria-label="Deploy modules"
                                                                            icon={<RepeatIcon />}
                                                                            size="sm"
                                                                            colorScheme="blue"
                                                                            onClick={() => {
                                                                                setSelectedTenants([tenant.id]);
                                                                                onDeployOpen();
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                    {tenant.deploymentUrl && (
                                                                        <Tooltip label="View Repository">
                                                                            <IconButton
                                                                                as="a"
                                                                                href={tenant.deploymentUrl}
                                                                                target="_blank"
                                                                                aria-label="View repo"
                                                                                icon={<ExternalLinkIcon />}
                                                                                size="sm"
                                                                                variant="outline"
                                                                            />
                                                                        </Tooltip>
                                                                    )}
                                                                </>
                                                            )}
                                                            <Tooltip label="Edit Tenant">
                                                                <IconButton
                                                                    aria-label="Edit tenant"
                                                                    icon={<SettingsIcon />}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
                                                                />
                                                            </Tooltip>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* Module Deployment Modal */}
            <Modal isOpen={isDeployOpen} onClose={onDeployClose} size="xl">
                <ModalOverlay />
                <ModalContent bg={cardGradientBg} color={textPrimary} borderColor={cardBorder} borderWidth="1px">
                    <ModalHeader color={textPrimary}>Deploy Module to Tenants</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            <FormControl>
                                <FormLabel>Select Module</FormLabel>
                                <Select
                                    placeholder="Choose a module to deploy"
                                    value={selectedModule}
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    disabled={modulesLoading}
                                >
                                    {modulesData?.availableModules?.map((module: any) => (
                                        <option key={module.id} value={module.id}>
                                            {module.icon} {module.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Select Tenants</FormLabel>
                                <Box maxHeight="300px" overflowY="auto" border="1px" borderColor={cardBorder} borderRadius="md" p={4}>
                                    <CheckboxGroup
                                        value={selectedTenants}
                                        onChange={(values) => setSelectedTenants(values as string[])}
                                    >
                                        <Stack spacing={3}>
                                            {tenants
                                                .map((tenant: any) => (
                                                    <Checkbox key={tenant.id} value={tenant.id}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold">
                                                                {tenant.branding?.siteName || tenant.name}
                                                            </Text>
                                                            <Text fontSize="sm" color="gray.500">
                                                                {tenant.githubRepo ? `${tenant.githubOwner}/${tenant.githubRepo}` : 'No repository yet'}
                                                            </Text>
                                                        </VStack>
                                                    </Checkbox>
                                                ))}
                                        </Stack>
                                    </CheckboxGroup>
                                </Box>
                            </FormControl>

                            {isDeploying && (
                                <Alert status="info">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2} w="full">
                                        <Text>Deploying {selectedModule} to {selectedTenants.length} tenant(s)...</Text>
                                        <Progress size="sm" isIndeterminate w="full" />
                                    </VStack>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeployClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleModuleDeployment}
                            isLoading={isDeploying}
                            loadingText="Deploying..."
                            isDisabled={!selectedModule || selectedTenants.length === 0}
                        >
                            Deploy to {selectedTenants.length} Tenant{selectedTenants.length !== 1 ? 's' : ''}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Create Repository Modal */}
            <Modal isOpen={isRepoOpen} onClose={onRepoClose} size="lg">
                <ModalOverlay />
                <ModalContent bg={cardGradientBg} color={textPrimary} borderColor={cardBorder} borderWidth="1px">
                    <ModalHeader color={textPrimary}>Create GitHub Repository</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            {selectedTenantForRepo && (
                                <Alert status="info">
                                    <AlertIcon />
                                    <Text>
                                        Creating repository for: <strong>{selectedTenantForRepo.branding?.siteName || selectedTenantForRepo.name}</strong>
                                    </Text>
                                </Alert>
                            )}

                            <FormControl isRequired>
                                <FormLabel>Repository Name</FormLabel>
                                <Input
                                    value={repoName}
                                    onChange={(e) => setRepoName(e.target.value)}
                                    placeholder="client-business-frontend"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>GitHub Owner</FormLabel>
                                <Input
                                    value={githubOwner}
                                    onChange={(e) => setGithubOwner(e.target.value)}
                                    placeholder="tommycp3"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>GitHub Personal Access Token</FormLabel>
                                <Input
                                    type="password"
                                    value={githubToken}
                                    onChange={(e) => setGithubToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                />
                                <Text fontSize="sm" color="gray.500" mt={1}>
                                    Requires 'repo' permissions to create repositories
                                </Text>
                            </FormControl>

                            {!selectedTenantForRepo?.id && (
                                <FormControl>
                                    <FormLabel>Select Tenant (Optional)</FormLabel>
                                    <Select
                                        placeholder="Choose tenant to link repository"
                                        onChange={(e) => {
                                            const tenant = tenants.find((t: any) => t.id === e.target.value);
                                            setSelectedTenantForRepo(tenant || {});
                                        }}
                                    >
                                        {tenants
                                            .filter((t: any) => !t.githubRepo) // Only show tenants without repos
                                            .map((tenant: any) => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.branding?.siteName || tenant.name}
                                                </option>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}

                            {isCreatingRepo && (
                                <Alert status="info">
                                    <AlertIcon />
                                    <VStack align="start" spacing={2} w="full">
                                        <Text>Creating repository {githubOwner}/{repoName}...</Text>
                                        <Progress size="sm" isIndeterminate w="full" />
                                    </VStack>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onRepoClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleCreateRepo}
                            isLoading={isCreatingRepo}
                            loadingText="Creating..."
                            isDisabled={!repoName || !githubOwner || !githubToken}
                        >
                            Create Repository
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Deployment Progress Modal */}
            <Modal isOpen={showDeploymentModal} onClose={() => setShowDeploymentModal(false)} size="xl">
                <ModalOverlay />
                <ModalContent bg={cardGradientBg} color={textPrimary} borderColor={cardBorder} borderWidth="1px">
                    <ModalHeader color={textPrimary}>
                        <HStack>
                            <Text>🚀 Deploying to {currentDeploymentTenant}</Text>
                            {isDeploying && <Spinner size="sm" />}
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Alert status={isDeploying ? "info" : "success"}>
                                <AlertIcon />
                                <Text>
                                    {isDeploying 
                                        ? "Deployment in progress... Please wait" 
                                        : "Deployment completed! Check the logs below for details."
                                    }
                                </Text>
                            </Alert>

                            <Box>
                                <Text fontWeight="bold" mb={2}>📋 Deployment Logs:</Text>
                                <Box
                                    bg="gray.900"
                                    color="green.300"
                                    p={4}
                                    borderRadius="md"
                                    fontFamily="mono"
                                    fontSize="sm"
                                    maxHeight="400px"
                                    overflowY="auto"
                                    border="1px solid"
                                    borderColor="gray.600"
                                >
                                    {deploymentLogs.length > 0 ? (
                                        deploymentLogs.map((log, index) => (
                                            <Box key={index} mb={1}>
                                                {log}
                                            </Box>
                                        ))
                                    ) : (
                                        <Text color="gray.500">No logs yet...</Text>
                                    )}
                                    {isDeploying && (
                                        <Box>
                                            <Text color="yellow.300">⏳ Waiting for deployment to complete...</Text>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            {!isDeploying && (
                                <Alert status="success">
                                    <AlertIcon />
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold">Deployment Summary:</Text>
                                        <Text fontSize="sm">
                                            • Module files have been copied to the target repository
                                        </Text>
                                        <Text fontSize="sm">
                                            • Repository has been updated with the latest changes
                                        </Text>
                                        <Text fontSize="sm">
                                            • You can now access the deployed module on the client site
                                        </Text>
                                    </VStack>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            mr={3}
                            onClick={() => {
                                navigator.clipboard.writeText(deploymentLogs.join('\n'));
                                toast({
                                    title: "Logs copied to clipboard",
                                    status: "success",
                                    duration: 2000,
                                });
                            }}
                        >
                            📋 Copy Logs
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={() => setShowDeploymentModal(false)}
                            isDisabled={isDeploying}
                        >
                            {isDeploying ? "Please wait..." : "Close"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default ModuleDeployment; 