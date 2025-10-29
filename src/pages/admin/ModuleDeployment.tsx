import React, { useState } from "react";
import {
    Box,
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Button,
    VStack,
    HStack,
    Text,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    useColorModeValue,
    useColorMode
} from "@chakra-ui/react";
import { gql, useMutation } from "@apollo/client";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Type definitions
interface DeploymentResult {
    tenantId: string;
    tenantName: string;
    success: boolean;
    error?: string;
}

interface DeploymentData {
    newModules: string[];
    deploymentResults: DeploymentResult[];
}

const DEPLOY_MODULES = gql`
  mutation DeployModules {
    deployLatestModules {
      newModules
      deploymentResults {
        tenantId
        tenantName
        success
        error
      }
    }
  }
`;

const ModuleDeployment = () => {
    usePageTitle("Module Deployment");

    const { colorMode } = useColorMode();
    const toast = useToast();
    const [deploymentResults, setDeploymentResults] = useState<DeploymentData | null>(null);

    // Consistent styling from brandConfig
    const bg = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const errorColor = getColor(colorMode === 'light' ? "status.error" : "status.errorDark", colorMode);

    const [deployModules, { loading }] = useMutation(DEPLOY_MODULES, {
        onCompleted: (data) => {
            setDeploymentResults(data.deployLatestModules);
            toast({
                title: "Deployment Complete",
                description: `Deployed ${data.deployLatestModules.newModules.length} modules`,
                status: "success",
                duration: 5000
            });
        },
        onError: (error) => {
            toast({
                title: "Deployment Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });

    const handleDeploy = () => {
        deployModules();
    };

    const successCount = deploymentResults?.deploymentResults?.filter((r: DeploymentResult) => r.success).length || 0;
    const failCount = deploymentResults?.deploymentResults?.filter((r: DeploymentResult) => !r.success).length || 0;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={6} align="stretch">

                    {/* Deployment Controls */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <Heading size="lg" color={textPrimary}>Module Deployment</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <Alert status="info">
                                    <AlertIcon />
                                    <Text>
                                        This will automatically discover all modules in the master frontend repo
                                        and deploy them to all client sites. New modules will appear in their
                                        sidebars automatically.
                                    </Text>
                                </Alert>

                                <HStack>
                                    <Button
                                        colorScheme="blue"
                                        size="lg"
                                        onClick={handleDeploy}
                                        isLoading={loading}
                                        loadingText="Deploying Modules..."
                                    >
                                        🚀 Deploy All Modules to Client Sites
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Results */}
                    {deploymentResults && (
                        <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                            <CardHeader>
                                <HStack justify="space-between">
                                    <Heading size="md" color={textPrimary}>Deployment Results</Heading>
                                    <HStack>
                                        <Badge colorScheme="green">✅ {successCount} Success</Badge>
                                        <Badge colorScheme="red">❌ {failCount} Failed</Badge>
                                    </HStack>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    <Text fontWeight="bold">
                                        Deployed Modules: {deploymentResults.newModules.join(", ")}
                                    </Text>

                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Tenant</Th>
                                                <Th>Status</Th>
                                                <Th>Error</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {deploymentResults.deploymentResults.map((result: DeploymentResult, index: number) => (
                                                <Tr key={index}>
                                                    <Td>{result.tenantName}</Td>
                                                    <Td>
                                                        <Badge colorScheme={result.success ? "green" : "red"}>
                                                            {result.success ? "Success" : "Failed"}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" color={errorColor}>
                                                            {result.error || "N/A"}
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default ModuleDeployment;