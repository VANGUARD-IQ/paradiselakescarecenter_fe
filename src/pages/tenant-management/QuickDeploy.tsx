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
    useToast,
    FormControl,
    FormLabel,
    Select,
    Alert,
    AlertIcon,
    SimpleGrid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useColorModeValue,
    useColorMode,
    Spinner
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import tenantManagementModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_TENANTS = gql`
  query GetTenantsForQuickDeploy {
    tenants {
      id
      name
      status
      githubRepo
      githubOwner
      branding {
        siteName
      }
      client {
        id
        fName
        lName
      }
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

const QuickDeploy = () => {
    usePageTitle("Quick Deploy");

    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const toast = useToast();
    const bg = getColor("background.main", colorMode);

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    // Form state
    const [selectedModule, setSelectedModule] = React.useState("");
    const [selectedTenant, setSelectedTenant] = React.useState("");

    // Loading states
    const [isDeploying, setIsDeploying] = React.useState(false);
    const [deploymentLogs, setDeploymentLogs] = React.useState<string[]>([]);
    const [currentDeploymentTenant, setCurrentDeploymentTenant] = React.useState<string>("");
    const [showDeploymentModal, setShowDeploymentModal] = React.useState(false);

    const { data: tenantsData, loading: tenantsLoading } = useQuery(GET_TENANTS);
    const { data: modulesData, loading: modulesLoading } = useQuery(GET_AVAILABLE_MODULES);
    const [deployModuleToTenant] = useMutation(DEPLOY_MODULE_TO_TENANT);
    const [enableModuleForTenant] = useMutation(ENABLE_MODULE_FOR_TENANT);

    const tenants = tenantsData?.tenants || [];

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

    const handleSingleTenantDeployment = async () => {
        if (!selectedTenant || !selectedModule) {
            toast({
                title: "Missing Information",
                description: "Please select both a tenant and a module",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const tenant = tenants.find((t: any) => t.id === selectedTenant);
        if (!tenant) return;

        const tenantName = tenant.branding?.siteName || tenant.name;

        // Initialize deployment modal
        setCurrentDeploymentTenant(tenantName);
        clearDeploymentLogs();
        setShowDeploymentModal(true);
        setIsDeploying(true);

        try {
            addDeploymentLog(`🚀 Starting deployment of ${selectedModule} module to ${tenantName}`);
            addDeploymentLog(`📋 Tenant ID: ${selectedTenant}`);
            addDeploymentLog(`📂 Target Repository: ${tenant.githubOwner}/${tenant.githubRepo}`);
            addDeploymentLog(`📡 Sending deployment request to backend...`);

            const result = await deployModuleToTenant({
                variables: {
                    moduleId: selectedModule,
                    tenantId: selectedTenant
                }
            });

            const deploymentResult = result.data.deployModuleToTenant;

            if (deploymentResult.success) {
                addDeploymentLog(`✅ Backend deployment request successful`);
                addDeploymentLog(`📝 Commit SHA: ${deploymentResult.commitSha || 'Not provided'}`);
                addDeploymentLog(`🎉 Module ${selectedModule} successfully deployed to ${tenantName}!`);
                addDeploymentLog(`📁 Files copied to repository: ${tenant.githubOwner}/${tenant.githubRepo}`);
                addDeploymentLog(`🔄 Repository has been updated with new module files`);

                // Enable the module for the tenant
                addDeploymentLog(`🔧 Enabling module ${selectedModule} for tenant...`);
                try {
                    const moduleVersion = modulesData?.availableModules?.find((m: any) => m.id === selectedModule)?.version || 'latest';

                    await enableModuleForTenant({
                        variables: {
                            tenantId: selectedTenant,
                            moduleId: selectedModule,
                            version: moduleVersion
                        }
                    });

                    addDeploymentLog(`✅ Module ${selectedModule} enabled in tenant configuration`);
                    addDeploymentLog(`📋 Module is now active and accessible on the client site`);
                } catch (enableError) {
                    addDeploymentLog(`⚠️ Warning: Module deployed but failed to enable in tenant config`);
                    addDeploymentLog(`🔧 Error: ${enableError instanceof Error ? enableError.message : 'Unknown enable error'}`);
                    addDeploymentLog(`💡 You may need to manually enable the module in tenant settings`);
                }

                toast({
                    title: "✅ Deployment Successful!",
                    description: `${selectedModule} module deployed and enabled for ${tenantName}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                // Reset form
                setSelectedModule("");
                setSelectedTenant("");
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

    if (tenantsLoading || modulesLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading deployment options...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const selectedTenantData = tenants.find((t: any) => t.id === selectedTenant);
    const selectedModuleData = modulesData?.availableModules?.find((m: any) => m.id === selectedModule);

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
                                    onClick={() => navigate("/tenants/deploy")}
                                    leftIcon={<ArrowBackIcon />}
                                >
                                    Back to Module Deployment
                                </Button>
                            </HStack>
                            <Heading size="lg" color={textPrimary}>⚡ Quick Deploy</Heading>
                            <Text color={textMuted}>Deploy a specific module to a specific tenant quickly</Text>
                        </VStack>
                    </HStack>

                    {/* Quick Deploy Form */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <Heading size="md" color={textPrimary}>Select Deployment Target</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={6} align="stretch">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <FormControl isRequired>
                                        <FormLabel>Select Tenant</FormLabel>
                                        <Select
                                            placeholder="Choose a tenant"
                                            value={selectedTenant}
                                            onChange={(e) => setSelectedTenant(e.target.value)}
                                            size="lg"
                                        >
                                            {tenants.map((tenant: any) => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.branding?.siteName || tenant.name} ({tenant.client?.fName} {tenant.client?.lName})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Select Module</FormLabel>
                                        <Select
                                            placeholder="Choose a module"
                                            value={selectedModule}
                                            onChange={(e) => setSelectedModule(e.target.value)}
                                            size="lg"
                                        >
                                            {modulesData?.availableModules?.map((module: any) => (
                                                <option key={module.id} value={module.id}>
                                                    {module.icon} {module.name} (v{module.version})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                {selectedTenant && selectedModule && (
                                    <Alert status="info" borderRadius="md">
                                        <AlertIcon />
                                        <VStack align="start" spacing={2} flex="1">
                                            <Text fontWeight="bold">
                                                📋 Deployment Preview
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Module:</strong> {selectedModuleData?.name} (v{selectedModuleData?.version})
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Target:</strong> {selectedTenantData?.branding?.siteName || selectedTenantData?.name}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Repository:</strong> {
                                                    selectedTenantData?.githubRepo
                                                        ? `${selectedTenantData?.githubOwner}/${selectedTenantData?.githubRepo}`
                                                        : '⚠️ No repository configured - deployment will fail'
                                                }
                                            </Text>
                                        </VStack>
                                    </Alert>
                                )}

                                <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleSingleTenantDeployment}
                                    leftIcon={<RepeatIcon />}
                                    isDisabled={!selectedTenant || !selectedModule || !selectedTenantData?.githubRepo}
                                    width="full"
                                >
                                    🚀 Deploy Now
                                </Button>

                                {selectedTenant && !selectedTenantData?.githubRepo && (
                                    <Alert status="warning" borderRadius="md">
                                        <AlertIcon />
                                        <Text fontSize="sm">
                                            This tenant does not have a GitHub repository configured. Please set up a repository first.
                                        </Text>
                                    </Alert>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

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

export default QuickDeploy;
