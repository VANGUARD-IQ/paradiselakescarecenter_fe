import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FiGitBranch, FiRefreshCw, FiInfo, FiExternalLink } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';
import { gql, useQuery } from "@apollo/client";

interface VapiWorkflowNode {
  id: string;
  name?: string;
  type?: string;
}

interface VapiWorkflow {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  nodes?: VapiWorkflowNode[];
  orgId?: string;
}

const GET_VAPI_WORKFLOWS = gql`
  query GetVapiWorkflows {
    getVapiWorkflows {
      id
      name
      createdAt
      updatedAt
      nodes {
        id
        name
        type
      }
      orgId
    }
  }
`;

export const Workflows: React.FC = () => {
  usePageTitle("Workflows");
  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const accentBlue = getColor("accentBlue");
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<VapiWorkflow | null>(null);
  
  const { data, loading, error, refetch } = useQuery(GET_VAPI_WORKFLOWS, {
    pollInterval: 30000, // Poll every 30 seconds for updates
  });

  // Use real data from API
  const workflows: VapiWorkflow[] = data?.getVapiWorkflows || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getNodeTypeColor = (type?: string) => {
    if (!type) return { bg: "rgba(156, 163, 175, 0.2)", color: "#9CA3AF", border: "rgba(156, 163, 175, 0.3)" };
    
    switch (type.toLowerCase()) {
      case "start":
        return { bg: "rgba(34, 197, 94, 0.2)", color: "#22C55E", border: "rgba(34, 197, 94, 0.3)" };
      case "end":
        return { bg: "rgba(255, 59, 48, 0.2)", color: "#FF3B30", border: "rgba(255, 59, 48, 0.3)" };
      case "condition":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" };
      case "action":
        return { bg: "rgba(251, 191, 36, 0.2)", color: "#FBBF24", border: "rgba(251, 191, 36, 0.3)" };
      default:
        return { bg: "rgba(168, 85, 247, 0.2)", color: "#A855F7", border: "rgba(168, 85, 247, 0.3)" };
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="container.2xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading 
              size="lg" 
              mb={2}
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
            >
              <HStack>
                <FiGitBranch />
                <Text>Workflows</Text>
              </HStack>
            </Heading>
            <Text color={textSecondary}>
              View and manage your Vapi AI workflows
            </Text>
          </Box>

          {/* Workflows List */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
              <HStack justify="space-between">
                <Heading size="md" color={textPrimary}>All Workflows</Heading>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textSecondary}
                    _hover={{
                      borderColor: accentBlue,
                      color: accentBlue
                    }}
                    onClick={() => refetch()}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiExternalLink />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textSecondary}
                    _hover={{
                      borderColor: accentBlue,
                      color: accentBlue
                    }}
                    onClick={() => window.open('https://dashboard.vapi.ai/workflows', '_blank')}
                  >
                    Open in Vapi
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Center py={8}>
                  <Spinner size="lg" color={accentBlue} />
                </Center>
              ) : error ? (
                <Alert 
                  status="error"
                  bg="rgba(255, 59, 48, 0.1)"
                  borderColor="rgba(255, 59, 48, 0.3)"
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <AlertIcon color="#FF3B30" />
                  <Text color={textPrimary}>Failed to load workflows. Please try again.</Text>
                </Alert>
              ) : workflows.length === 0 ? (
                <Alert 
                  status="info"
                  bg="rgba(59, 130, 246, 0.1)"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <AlertIcon color="#3B82F6" />
                  <Text color={textPrimary}>No workflows found. Create workflows in your Vapi dashboard.</Text>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm" sx={{ 'th': { color: textSecondary, borderColor: cardBorder }, 'td': { color: textPrimary, borderColor: cardBorder } }}>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Nodes</Th>
                        <Th>Created</Th>
                        <Th>Updated</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {workflows.map((workflow) => (
                        <Tr key={workflow.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {workflow.name || "Unnamed Workflow"}
                              </Text>
                              <Text fontSize="xs" color={textMuted} fontFamily="monospace">
                                {workflow.id}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              bg="rgba(168, 85, 247, 0.2)"
                              color="#A855F7"
                              borderWidth="1px"
                              borderColor="rgba(168, 85, 247, 0.3)"
                            >
                              {workflow.nodes?.length || 0} nodes
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color={textMuted}>
                              {formatDate(workflow.createdAt)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color={textMuted}>
                              {formatDate(workflow.updatedAt)}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  aria-label="View Details"
                                  icon={<FiInfo />}
                                  color={textSecondary}
                                  _hover={{
                                    color: accentBlue,
                                    bg: "rgba(54, 158, 255, 0.1)"
                                  }}
                                  onClick={() => setSelectedWorkflow(workflow)}
                                />
                              </Tooltip>
                              <Tooltip label="Open in Vapi">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Open in Vapi"
                                  icon={<FiExternalLink />}
                                  color={textSecondary}
                                  _hover={{
                                    color: accentBlue,
                                    bg: "rgba(54, 158, 255, 0.1)"
                                  }}
                                  onClick={() => window.open(`https://dashboard.vapi.ai/workflows/${workflow.id}`, '_blank')}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Workflow Statistics */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>Workflow Statistics</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Total Workflows
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {workflows.length}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Total Nodes
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {workflows.reduce((acc, w) => acc + (w.nodes?.length || 0), 0)}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Avg. Nodes per Workflow
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {workflows.length > 0 
                      ? (workflows.reduce((acc, w) => acc + (w.nodes?.length || 0), 0) / workflows.length).toFixed(1)
                      : 0}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Last Updated
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textPrimary}>
                    {workflows.length > 0 
                      ? new Date(Math.max(...workflows.map(w => new Date(w.updatedAt).getTime()))).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Workflow Details Modal */}
      <Modal 
        isOpen={!!selectedWorkflow} 
        onClose={() => setSelectedWorkflow(null)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textPrimary}>Workflow Details</ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={1}>
                  Workflow Information
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={textPrimary}>
                    <strong>Name:</strong> {selectedWorkflow?.name || "Unnamed Workflow"}
                  </Text>
                  <Text fontSize="sm" color={textMuted} fontFamily="monospace">
                    <strong>ID:</strong> {selectedWorkflow?.id}
                  </Text>
                  <Text fontSize="sm" color={textMuted}>
                    <strong>Created:</strong> {selectedWorkflow && formatDate(selectedWorkflow.createdAt)}
                  </Text>
                  <Text fontSize="sm" color={textMuted}>
                    <strong>Updated:</strong> {selectedWorkflow && formatDate(selectedWorkflow.updatedAt)}
                  </Text>
                </VStack>
              </Box>

              {selectedWorkflow?.nodes && selectedWorkflow.nodes.length > 0 && (
                <Box width="100%">
                  <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={2}>
                    Workflow Nodes ({selectedWorkflow.nodes.length})
                  </Text>
                  <VStack align="start" spacing={2} maxH="300px" overflowY="auto">
                    {selectedWorkflow.nodes.map((node, index) => (
                      <HStack key={node.id} width="100%" p={2} bg="rgba(0, 0, 0, 0.2)" borderRadius="md">
                        <Text fontSize="sm" color={textMuted} minW="30px">
                          {index + 1}.
                        </Text>
                        <VStack align="start" flex="1" spacing={0}>
                          <Text fontSize="sm" color={textPrimary}>
                            {node.name || "Unnamed Node"}
                          </Text>
                          <Text fontSize="xs" color={textMuted} fontFamily="monospace">
                            {node.id}
                          </Text>
                        </VStack>
                        {node.type && (
                          <Badge
                            bg={getNodeTypeColor(node.type).bg}
                            color={getNodeTypeColor(node.type).color}
                            borderWidth="1px"
                            borderColor={getNodeTypeColor(node.type).border}
                            fontSize="xs"
                          >
                            {node.type}
                          </Badge>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              leftIcon={<FiExternalLink />}
              onClick={() => {
                if (selectedWorkflow) {
                  window.open(`https://dashboard.vapi.ai/workflows/${selectedWorkflow.id}`, '_blank');
                }
              }}
              mr={3}
            >
              Open in Vapi
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedWorkflow(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};