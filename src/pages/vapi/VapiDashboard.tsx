import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FiPhone, FiPhoneCall, FiSettings, FiActivity, FiClock, FiGitBranch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';
import { VapiConfigForm } from "./VapiConfigForm";
import { useColorMode } from "@chakra-ui/react";

const GET_VAPI_CONFIG = gql`
  query GetVapiConfig {
    getVapiConfig {
      publicApiKey
      assistantId
      phoneNumberId
      isConfigured
    }
  }
`;

export const VapiDashboard: React.FC = () => {
  usePageTitle("VAPI Dashboard");
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_VAPI_CONFIG);
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
  const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const handleConfigured = () => {
    // Refetch the configuration after it's been updated
    refetch();
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="container.lg" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color={textPrimary} mb={2}>
              🤖 Vapi Voice AI Dashboard
            </Heading>
            <Text color={textSecondary}>
              Manage AI-powered voice calls and assistants
            </Text>
          </Box>

          {/* Configuration Status */}
          {loading ? (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <HStack justify="center">
                  <Spinner color={textPrimary} />
                  <Text color={textPrimary}>Loading configuration...</Text>
                </HStack>
              </CardBody>
            </Card>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              Error loading Vapi configuration: {error.message}
            </Alert>
          ) : !data?.getVapiConfig?.isConfigured ? (
            <>
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Vapi is not configured</Text>
                  <Text fontSize="sm">
                    Please configure your Vapi API keys below to enable voice calling features.
                  </Text>
                </Box>
              </Alert>
              
              {/* Configuration Form */}
              <VapiConfigForm onConfigured={handleConfigured} />
            </>
          ) : (
            <>
              {/* Configuration Success */}
              <Alert status="success" variant="subtle">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Vapi is configured and ready</Text>
                  <Text fontSize="sm">
                    Assistant ID: {data.getVapiConfig.assistantId || "Not set"}
                  </Text>
                </Box>
              </Alert>

              {/* Stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Card
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody>
                    <Stat>
                      <StatLabel color={textSecondary}>Total Calls Today</StatLabel>
                      <StatNumber color={textPrimary}>0</StatNumber>
                      <StatHelpText color={textMuted}>
                        <Icon as={FiActivity} mr={1} />
                        No calls yet
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody>
                    <Stat>
                      <StatLabel color={textSecondary}>Active Calls</StatLabel>
                      <StatNumber color={textPrimary}>0</StatNumber>
                      <StatHelpText color={textMuted}>
                        <Icon as={FiPhoneCall} mr={1} />
                        No active calls
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody>
                    <Stat>
                      <StatLabel color={textSecondary}>Average Duration</StatLabel>
                      <StatNumber color={textPrimary}>0:00</StatNumber>
                      <StatHelpText color={textMuted}>
                        <Icon as={FiClock} mr={1} />
                        No data available
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Quick Actions */}
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="md" color={textPrimary}>Quick Actions</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    <Button
                      leftIcon={<FiPhone />}
                      colorScheme="blue"
                      size="lg"
                      onClick={() => navigate("/vapi/web-call")}
                      isDisabled={!data?.getVapiConfig?.isConfigured}
                    >
                      Start Web Call
                    </Button>

                    <Button
                      leftIcon={<FiActivity />}
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/vapi/call-logs")}
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.5)"
                      }}
                    >
                      View Call Logs
                    </Button>

                    <Button
                      leftIcon={<FiGitBranch />}
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/vapi/workflows")}
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.5)"
                      }}
                    >
                      View Workflows
                    </Button>

                    <Button
                      leftIcon={<FiSettings />}
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/admin/tenants")}
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.5)"
                      }}
                    >
                      Configure Settings
                    </Button>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Features */}
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="md" color={textPrimary}>Available Features</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text fontWeight="semibold" color={textPrimary}>Web-Based Voice Calls</Text>
                      </HStack>
                      <Text fontSize="sm" color={textMuted}>
                        Make and receive calls directly from your browser using AI assistants
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FiPhoneCall} color="green.500" />
                        <Text fontWeight="semibold" color={textPrimary}>Intelligent Call Handling</Text>
                      </HStack>
                      <Text fontSize="sm" color={textMuted}>
                        AI-powered assistants handle calls with natural conversation flow
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FiActivity} color="purple.500" />
                        <Text fontWeight="semibold" color={textPrimary}>Real-Time Transcription</Text>
                      </HStack>
                      <Text fontSize="sm" color={textMuted}>
                        Live transcription and analysis of all conversations
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FiClock} color="orange.500" />
                        <Text fontWeight="semibold" color={textPrimary}>Call Analytics</Text>
                      </HStack>
                      <Text fontSize="sm" color={textMuted}>
                        Detailed metrics and insights from your voice interactions
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};