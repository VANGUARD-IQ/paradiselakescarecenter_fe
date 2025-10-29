import React from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Center,
  Spinner,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTarget,
  FiPercent,
  FiAlertCircle,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiRefreshCw,
  FiSend,
  FiPhone,
  FiMail,
  FiCalendar,
  FiFileText
} from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import opportunitiesModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Queries
const GET_PIPELINE_METRICS = gql`
  query GetPipelineMetrics {
    pipelineMetrics {
      totalOpportunities
      totalValue
      averageDealSize
      conversionRate
      averageSalesCycle
      expectedRevenue
      stageMetrics {
        stageName
        count
        value
        conversionToNext
        averageTimeInStage
      }
      monthlyTrend {
        month
        created
        won
        lost
        value
      }
      healthScore
      suggestedActions {
        type
        title
        description
        priority
      }
    }
  }
`;

const GET_REVENUE_TARGETS = gql`
  query GetRevenueTargets {
    revenueTargets {
      monthly
      quarterly
      yearly
      currentMonthProgress
      currentQuarterProgress
      currentYearProgress
      requiredOpportunities {
        monthly
        quarterly
        yearly
      }
    }
  }
`;

const CREATE_OPPORTUNITY_TASK = gql`
  mutation CreateOpportunityTask($input: OpportunityTaskInput!) {
    createOpportunityTask(input: $input) {
      id
      title
      description
      priority
      dueDate
    }
  }
`;

interface TaskTemplate {
  icon: any;
  title: string;
  description: string;
  priority: string;
  category: string;
}

const taskTemplates: TaskTemplate[] = [
  {
    icon: FiSend,
    title: "Send initial proposal",
    description: "Draft and send a proposal to the client outlining your solution",
    priority: "HIGH",
    category: "proposal"
  },
  {
    icon: FiPhone,
    title: "Schedule discovery call",
    description: "Book a call to understand client needs and pain points",
    priority: "HIGH",
    category: "discovery"
  },
  {
    icon: FiMail,
    title: "Send follow-up email",
    description: "Follow up on your last interaction with the client",
    priority: "MEDIUM",
    category: "followup"
  },
  {
    icon: FiCalendar,
    title: "Schedule product demo",
    description: "Book a demo to showcase your solution to the client",
    priority: "HIGH",
    category: "demo"
  },
  {
    icon: FiFileText,
    title: "Prepare contract",
    description: "Draft the contract terms and pricing for client review",
    priority: "HIGH",
    category: "closing"
  },
  {
    icon: FiDollarSign,
    title: "Send quote",
    description: "Provide detailed pricing and payment terms",
    priority: "HIGH",
    category: "pricing"
  }
];

const PipelineHealthIndicator: React.FC<{ score: number }> = ({ score }) => {
  const { colorMode } = useColorMode();
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
    >
      <CardBody>
        <VStack spacing={3}>
          <Text fontSize="sm" fontWeight="bold" color={textPrimary}>
            Pipeline Health
          </Text>
          <Box position="relative" width="120px" height="120px">
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={`var(--chakra-colors-${getHealthColor(score)}-500)`}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${Math.PI * 100}`}
                strokeDashoffset={`${Math.PI * 100 * (1 - score / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <Center position="absolute" top="0" left="0" width="120px" height="120px">
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={`${getHealthColor(score)}.500`}>
                  {score}%
                </Text>
                <Text fontSize="xs" color={textMuted}>
                  {getHealthLabel(score)}
                </Text>
              </VStack>
            </Center>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

const ConversionFunnel: React.FC<{ stageMetrics: any[] }> = ({ stageMetrics }) => {
  const maxValue = Math.max(...stageMetrics.map(s => s.value));
  const { colorMode } = useColorMode();
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
    >
      <CardHeader>
        <Text fontWeight="bold" color={textPrimary}>Conversion Funnel</Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={2} align="stretch">
          {stageMetrics.map((stage) => (
            <Box key={stage.stageName}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                  {stage.stageName}
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="blue" bg={colorMode === 'light' ? 'blue.100' : 'rgba(56, 178, 255, 0.2)'} color={colorMode === 'light' ? 'blue.800' : 'white'}>{stage.count} deals</Badge>
                  <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                    ${stage.value >= 1000
                      ? `${(stage.value / 1000).toFixed(1)}k`
                      : stage.value.toFixed(0)}
                  </Text>
                </HStack>
              </HStack>
              <Progress
                value={(stage.value / maxValue) * 100}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
              />
              {stage.conversionToNext > 0 && (
                <Text fontSize="xs" color={textMuted} mt={1}>
                  {stage.conversionToNext}% convert to next stage
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

const TaskSuggestions: React.FC<{ onCreateTask: (template: TaskTemplate) => void }> = ({ onCreateTask }) => {
  const { colorMode } = useColorMode();
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
    >
      <CardHeader>
        <HStack justify="space-between">
          <Text fontWeight="bold" color={textPrimary}>Suggested Actions</Text>
          <Tooltip label="Create tasks to move deals forward">
            <Icon as={FiAlertCircle} color={textMuted} />
          </Tooltip>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {taskTemplates.slice(0, 4).map((template, index) => (
            <HStack
              key={index}
              p={3}
              borderWidth="1px"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderRadius="md"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}
              onClick={() => onCreateTask(template)}
            >
              <Icon as={template.icon} color={getColor('primary', colorMode)} boxSize={5} />
              <VStack align="start" flex="1" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                  {template.title}
                </Text>
                <Text fontSize="xs" color={textMuted}>
                  {template.description}
                </Text>
              </VStack>
              <IconButton
                icon={<FiPlus />}
                aria-label="Create task"
                size="sm"
                variant="ghost"
              />
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

const OpportunityDashboard: React.FC = () => {
  usePageTitle("Opportunity Dashboard");

  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const { data: metricsData, loading: loadingMetrics, error: metricsError, refetch } = useQuery(GET_PIPELINE_METRICS, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  const { data: targetsData, loading: loadingTargets, error: targetsError } = useQuery(GET_REVENUE_TARGETS, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  // Log errors for debugging
  if (metricsError) {
    console.error('Pipeline Metrics Error:', metricsError);
  }
  if (targetsError) {
    console.error('Revenue Targets Error:', targetsError);
  }
  const [createTask] = useMutation(CREATE_OPPORTUNITY_TASK);

  const metrics = metricsData?.pipelineMetrics;
  const targets = targetsData?.revenueTargets;

  // Brand styling variables
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const buttonBg = getColor("button.bg", colorMode);
  const buttonHoverBg = getColor("button.hoverBg", colorMode);

  const handleCreateTask = async (template: TaskTemplate) => {
    try {
      await createTask({
        variables: {
          input: {
            title: template.title,
            description: template.description,
            priority: template.priority,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
          }
        }
      });

      toast({
        title: 'Task created',
        description: `"${template.title}" has been added to your tasks`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to create task',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loadingMetrics || loadingTargets) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />
        <Box maxW="100%" px={{ base: 4, md: 8 }} py={8} flex="1">
          <Center>
            <Spinner size="xl" />
          </Center>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const hasOpportunities = metrics?.totalOpportunities > 0;

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />

      <Box maxW="100%" px={{ base: 4, md: 8 }} py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color={textPrimary}>Opportunity Pipeline</Heading>
              <Text color={textMuted} fontSize={{ base: 'sm', md: 'md' }}>
                Track your sales pipeline health and conversion metrics
              </Text>
            </VStack>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                size={{ base: 'sm', md: 'md' }}
                borderColor={colorMode === 'light' ? 'gray.300' : 'rgba(255, 255, 255, 0.3)'}
                color={textPrimary}
                _hover={{ bg: colorMode === 'light' ? 'gray.50' : cardGradientBg }}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                size={{ base: 'sm', md: 'md' }}
                bg={buttonBg}
                color="white"
                _hover={{ bg: buttonHoverBg }}
                onClick={() => navigate('/opportunities/new')}
              >
                New Opportunity
              </Button>
            </HStack>
          </VStack>

          {/* No Opportunities Alert */}
          {!hasOpportunities && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>No opportunities in your pipeline!</AlertTitle>
                <AlertDescription>
                  Start by creating your first opportunity to track potential deals.
                </AlertDescription>
              </Box>
              <Button
                ml="auto"
                colorScheme="orange"
                size="sm"
                leftIcon={<FiPlus />}
                onClick={() => navigate('/opportunities/new')}
              >
                Create First Opportunity
              </Button>
            </Alert>
          )}

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Pipeline Value</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    ${(metrics?.totalValue || 0).toLocaleString()}
                  </StatNumber>
                  <StatHelpText color={textMuted}>
                    <StatArrow type="increase" />
                    {metrics?.totalOpportunities || 0} opportunities
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
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Expected Revenue</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    ${(metrics?.expectedRevenue || 0).toLocaleString()}
                  </StatNumber>
                  <StatHelpText color={textMuted}>
                    Based on probability
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
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Conversion Rate</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    {metrics?.conversionRate || 0}%
                  </StatNumber>
                  <StatHelpText color={textMuted}>
                    Won / Total Closed
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
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Avg Deal Size</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    ${(metrics?.averageDealSize || 0).toLocaleString()}
                  </StatNumber>
                  <StatHelpText color={textMuted}>
                    {metrics?.averageSalesCycle || 0} day cycle
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Revenue Targets */}
          {targets && (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardHeader>
                <Text fontWeight="bold" color={textPrimary}>Revenue Targets & Progress</Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color={textPrimary} fontWeight="medium" mb={2}>
                      Monthly Target: ${(targets.monthly || 0).toLocaleString()}
                    </Text>
                    <Progress
                      value={targets.currentMonthProgress || 0}
                      colorScheme="green"
                      size="sm"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color={textSecondary} mt={1}>
                      {targets.currentMonthProgress || 0}% achieved
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      Need {targets.requiredOpportunities?.monthly || 0} more opportunities
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={textPrimary} fontWeight="medium" mb={2}>
                      Quarterly Target: ${(targets.quarterly || 0).toLocaleString()}
                    </Text>
                    <Progress
                      value={targets.currentQuarterProgress || 0}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color={textSecondary} mt={1}>
                      {targets.currentQuarterProgress || 0}% achieved
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      Need {targets.requiredOpportunities?.quarterly || 0} more opportunities
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={textPrimary} fontWeight="medium" mb={2}>
                      Yearly Target: ${(targets.yearly || 0).toLocaleString()}
                    </Text>
                    <Progress
                      value={targets.currentYearProgress || 0}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color={textSecondary} mt={1}>
                      {targets.currentYearProgress || 0}% achieved
                    </Text>
                    <Text fontSize="xs" color={textMuted}>
                      Need {targets.requiredOpportunities?.yearly || 0} more opportunities
                    </Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Main Dashboard Grid */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            {/* Pipeline Health */}
            <PipelineHealthIndicator score={metrics?.healthScore || 0} />

            {/* Conversion Funnel */}
            {metrics?.stageMetrics && (
              <ConversionFunnel stageMetrics={metrics.stageMetrics} />
            )}

            {/* Task Suggestions */}
            <TaskSuggestions onCreateTask={handleCreateTask} />
          </SimpleGrid>

          {/* Suggested Actions Alert */}
          {metrics?.suggestedActions && metrics.suggestedActions.length > 0 && (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardHeader>
                <HStack>
                  <Icon as={FiTarget} color="#FFA500" />
                  <Text fontWeight="bold" color={textPrimary}>Recommended Actions</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {metrics.suggestedActions.map((action: any, index: number) => (
                    <HStack key={index} align="start" spacing={3}>
                      <Icon
                        as={action.priority === 'HIGH' ? FiAlertCircle : FiCheckCircle}
                        color={action.priority === 'HIGH' ? 'red.500' : 'green.500'}
                        mt={1}
                      />
                      <VStack align="start" spacing={0} flex="1">
                        <Text fontWeight="medium" color={textPrimary}>{action.title}</Text>
                        <Text fontSize="sm" color={textMuted}>
                          {action.description}
                        </Text>
                      </VStack>
                      <Badge colorScheme={action.priority === 'HIGH' ? 'red' : 'yellow'}>
                        {action.priority}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>

      <FooterWithFourColumns />
    </Box>
  );
};

export default OpportunityDashboard;