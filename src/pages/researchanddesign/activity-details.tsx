import React from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  useColorModeValue,
  useColorMode,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Alert,
  AlertIcon,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  ArrowBackIcon,
  EditIcon,
  TimeIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

const GET_RD_ACTIVITY = gql`
  query GetRDActivity($id: String!) {
    getRDActivity(id: $id) {
      id
      activityName
      description
      activityType
      documentationStage
      rdProjectId
      objectives
      methodology
      expectedOutcomes
      resources
      timeline
      startDate
      endDate
      hypothesis
      proposedDesign
      successCriteria
      variablesTested
      trialScope
      trialObjective
      trialLocation
      initialObservations
      challenges
      solutions
      outcomes
      quantitativeOutcomes
      learnings
      linkageDescription
      linkedCoreActivityId
      milestones
      createdAt
      updatedAt
    }
  }
`;

const GET_RD_PROJECT = gql`
  query GetRDProject($id: String!) {
    getRDProject(id: $id) {
      id
      projectName
      projectCode
    }
  }
`;

const GET_RD_TIME_ENTRIES = gql`
  query GetRDTimeEntries($activityId: String!) {
    getRDTimeEntries(activityId: $activityId) {
      id
      hours
      date
      description
    }
  }
`;

const GET_RD_EVIDENCE = gql`
  query GetRDEvidence($activityId: String!) {
    getRDEvidence(activityId: $activityId) {
      id
      title
      evidenceType
      captureDate
    }
  }
`;

const ResearchAndDesignActivityDetails: React.FC = () => {
  usePageTitle("R&D Activity Details");
  const { colorMode } = useColorMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  // Fetch activity data
  const { data: activityData, loading: activityLoading, error } = useQuery(GET_RD_ACTIVITY, {
    variables: { id: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Fetch project data
  const { data: projectData } = useQuery(GET_RD_PROJECT, {
    variables: { id: activityData?.getRDActivity?.rdProjectId },
    skip: !activityData?.getRDActivity?.rdProjectId,
    errorPolicy: 'all'
  });

  // Fetch time entries
  const { data: timeEntriesData } = useQuery(GET_RD_TIME_ENTRIES, {
    variables: { activityId: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Fetch evidence
  const { data: evidenceData } = useQuery(GET_RD_EVIDENCE, {
    variables: { activityId: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  if (activityLoading) {
    const bg = getColor("background.main", colorMode);
    const textSecondary = getColor("text.secondaryDark", colorMode);
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="#3B82F6" />
              <Text color={textSecondary} fontSize="lg">Loading activity...</Text>
            </VStack>
          </Center>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !activityData?.getRDActivity) {
    const bg = getColor("background.main", colorMode);
    const textPrimary = getColor("text.primaryDark", colorMode);
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} textAlign="center" flex="1">
          <Alert status="error" maxW="md" mx="auto">
            <AlertIcon />
            {error ? `Error: ${error.message}` : 'Activity not found'}
          </Alert>
          <Button 
            mt={4} 
            onClick={() => navigate('/researchanddesign')}
            bg="white"
            color="black"
            _hover={{ bg: "gray.100" }}
            fontSize="md"
          >
            Back to Dashboard
          </Button>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const activity = activityData.getRDActivity;
  const project = projectData?.getRDProject;
  const timeEntries = timeEntriesData?.getRDTimeEntries || [];
  const evidence = evidenceData?.getRDEvidence || [];

  const totalHours = timeEntries.reduce((sum: number, entry: any) => 
    sum + (parseFloat(entry.hours) || 0), 0
  );

  const getActivityTypeColor = (type: string) => {
    return type === 'core' ? 'blue' : 'gray';
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'preliminary': return 'Preliminary';
      case 'hypothesis_design': return 'Hypothesis & Design';
      case 'experiments_trials': return 'Experiments & Trials';
      case 'analysis': return 'Analysis';
      case 'outcome': return 'Outcome';
      default: return stage;
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={8} maxW="1200px" mx="auto" flex="1">
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate(project ? `/researchanddesign/projects/${project.id}` : '/researchanddesign')}
            fontSize="md"
          >
            Back to {project ? 'Project' : 'Dashboard'}
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          {/* Activity Header */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2}>
                  <Heading size="xl" color={textPrimary}>
                    {activity.activityName}
                  </Heading>
                  <HStack spacing={3}>
                    <Badge 
                      bg="rgba(59, 130, 246, 0.2)"
                      color="#3B82F6"
                      border="1px solid"
                      borderColor="rgba(59, 130, 246, 0.3)"
                      fontSize="md"
                    >
                      {getStageLabel(activity.documentationStage)}
                    </Badge>
                    <Badge 
                      bg={activity.activityType === 'core' ? "rgba(59, 130, 246, 0.2)" : "rgba(156, 163, 175, 0.2)"}
                      color={activity.activityType === 'core' ? "#3B82F6" : "#9CA3AF"}
                      border="1px solid"
                      borderColor={activity.activityType === 'core' ? "rgba(59, 130, 246, 0.3)" : "rgba(156, 163, 175, 0.3)"}
                      fontSize="md"
                    >
                      {activity.activityType.toUpperCase()}
                    </Badge>
                  </HStack>
                  {project && (
                    <Text color={textSecondary} fontSize="lg">
                      Project: {project.projectName} ({project.projectCode})
                    </Text>
                  )}
                </VStack>
                
                <HStack>
                  <Button
                    leftIcon={<TimeIcon />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textPrimary}
                    bg="rgba(0, 0, 0, 0.2)"
                    _hover={{
                      borderColor: textSecondary,
                      bg: "rgba(255, 255, 255, 0.05)"
                    }}
                    onClick={() => navigate(`/researchanddesign/timesheet?project=${activity.rdProjectId}&activity=${activity.id}`)}
                    fontSize="md"
                  >
                    Log Time
                  </Button>
                  <Button
                    leftIcon={<AttachmentIcon />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textPrimary}
                    bg="rgba(0, 0, 0, 0.2)"
                    _hover={{
                      borderColor: textSecondary,
                      bg: "rgba(255, 255, 255, 0.05)"
                    }}
                    onClick={() => navigate(`/researchanddesign/evidence/upload?project=${activity.rdProjectId}&activity=${activity.id}`)}
                    fontSize="md"
                  >
                    Add Evidence
                  </Button>
                  <Button
                    leftIcon={<EditIcon />}
                    bg="white"
                    color="black"
                    _hover={{ 
                      bg: "gray.100",
                      transform: "translateY(-2px)"
                    }}
                    onClick={() => navigate(`/researchanddesign/activities/${activity.id}/edit`)}
                    boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                    fontSize="md"
                    fontWeight="semibold"
                  >
                    Edit Activity
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
            {activity.description && (
              <CardBody pt={0}>
                <Text color={textPrimary} fontSize="lg">
                  {activity.description}
                </Text>
              </CardBody>
            )}
          </Card>

          {/* Quick Stats */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Hours Logged</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{totalHours.toFixed(1)}h</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">{timeEntries.length} entries</StatHelpText>
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
                  <StatLabel color={textSecondary} fontSize="md">Evidence Items</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{evidence.length}</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Supporting documentation</StatHelpText>
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
                  <StatLabel color={textSecondary} fontSize="md">Created</StatLabel>
                  <StatNumber color={textPrimary} fontSize="lg">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">
                    Updated: {new Date(activity.updatedAt).toLocaleDateString()}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
            {/* Objectives */}
            {activity.objectives && (
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="lg" color={textPrimary}>Objectives</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color={textPrimary} whiteSpace="pre-wrap" fontSize="md">
                    {activity.objectives}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Methodology */}
            {activity.methodology && (
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="lg" color={textPrimary}>Methodology</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color={textPrimary} whiteSpace="pre-wrap" fontSize="md">
                    {activity.methodology}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Expected Outcomes */}
            {activity.expectedOutcomes && (
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="lg" color={textPrimary}>Expected Outcomes</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color={textPrimary} whiteSpace="pre-wrap" fontSize="md">
                    {activity.expectedOutcomes}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Resources */}
            {activity.resources && (
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="lg" color={textPrimary}>Resources Required</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color={textPrimary} whiteSpace="pre-wrap" fontSize="md">
                    {activity.resources}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Timeline */}
            {activity.timeline && (
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardHeader borderBottom="1px" borderColor={cardBorder}>
                  <Heading size="lg" color={textPrimary}>Timeline</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color={textPrimary} whiteSpace="pre-wrap" fontSize="md">
                    {activity.timeline}
                  </Text>
                </CardBody>
              </Card>
            )}
          </Grid>
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignActivityDetails;