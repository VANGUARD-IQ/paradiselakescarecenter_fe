import React, { useState } from 'react';
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
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  IconButton,
  Tooltip,
  Select,
  Flex,
  Divider,
  Center,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  ArrowBackIcon,
  WarningIcon,
  CheckCircleIcon,
  InfoIcon,
  TimeIcon,
  AttachmentIcon,
  AddIcon,
  ViewIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
      status
      projectType
      createdAt
      updatedAt
    }
  }
`;

const GET_RD_ACTIVITIES = gql`
  query GetRDActivities($projectId: String) {
    getRDActivities(projectId: $projectId) {
      id
      activityName
      rdProjectId
      activityType
      documentationStage
    }
  }
`;

const GET_RD_TIME_ENTRIES = gql`
  query GetRDTimeEntries($projectId: String) {
    getRDTimeEntries(projectId: $projectId) {
      id
      rdProjectId
      rdActivityId
      userId
      date
      hours
      description
      timeType
      status
      isUnallocated
    }
  }
`;

const GET_RD_EVIDENCE = gql`
  query GetRDEvidence($projectId: String) {
    getRDEvidence(projectId: $projectId) {
      id
      rdProjectId
      rdActivityId
      evidenceType
      title
      description
      fileUrl
      content
      captureDate
      source
      participants
      metadata
    }
  }
`;

const ResearchAndDesignGapAnalysis: React.FC = () => {
  usePageTitle("R&D Gap Analysis");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);
  const [selectedProject, setSelectedProject] = useState(projectId || 'all');

  // GraphQL queries
  const { data: projectsData, loading: projectsLoading, refetch: refetchProjects } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });
  const { data: activitiesData, loading: activitiesLoading, refetch: refetchActivities } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: selectedProject === 'all' ? undefined : selectedProject },
    skip: false, // Always fetch all activities for gap analysis
    errorPolicy: 'all'
  });
  const { data: timeEntriesData, loading: timeEntriesLoading, refetch: refetchTimeEntries } = useQuery(GET_RD_TIME_ENTRIES, {
    variables: { projectId: selectedProject === 'all' ? undefined : selectedProject },
    skip: false, // Always fetch all time entries for gap analysis
    errorPolicy: 'all'
  });
  const { data: evidenceData, loading: evidenceLoading, refetch: refetchEvidence } = useQuery(GET_RD_EVIDENCE, {
    variables: { projectId: selectedProject === 'all' ? undefined : selectedProject },
    skip: false, // Always fetch all evidence for gap analysis
    errorPolicy: 'all'
  });

  // Extract data from queries
  const projects = projectsData?.getRDProjects || [];
  const activities = activitiesData?.getRDActivities || [];
  const timeEntries = timeEntriesData?.getRDTimeEntries || [];
  const evidence = evidenceData?.getRDEvidence || [];

  // Calculate real gap analysis from actual data
  const calculateGapAnalysis = () => {
    const projectAnalysis = projects.map((project: any) => {
      const projectActivities = activities.filter((a: any) => a.rdProjectId === project.id);
      const projectTimeEntries = timeEntries.filter((t: any) => t.rdProjectId === project.id);
      const projectEvidence = evidence.filter((e: any) => e.rdProjectId === project.id);

      // Calculate activities with and without evidence
      const activitiesWithEvidence = projectActivities.filter((activity: any) =>
        projectEvidence.some((ev: any) => ev.rdActivityId === activity.id)
      );
      const activitiesWithoutEvidence = projectActivities.filter((activity: any) =>
        !projectEvidence.some((ev: any) => ev.rdActivityId === activity.id)
      );

      // Calculate activities with and without time entries
      const activitiesWithTime = projectActivities.filter((activity: any) =>
        projectTimeEntries.some((time: any) => time.rdActivityId === activity.id)
      );
      const activitiesWithoutTime = projectActivities.filter((activity: any) =>
        !projectTimeEntries.some((time: any) => time.rdActivityId === activity.id)
      );

      // Calculate evidence by type
      const evidenceByType = projectEvidence.reduce((acc: any, ev: any) => {
        acc[ev.evidenceType] = (acc[ev.evidenceType] || 0) + 1;
        return acc;
      }, {});

      // Calculate total hours
      const totalHours = projectTimeEntries.reduce((sum: number, entry: any) => 
        sum + (parseFloat(entry.hours) || 0), 0
      );

      // Calculate unapproved entries (assuming status !== 'approved')
      const unapprovedEntries = projectTimeEntries.filter((entry: any) => 
        entry.status !== 'approved'
      ).length;

      // Calculate compliance score (simplified)
      const hasActivities = projectActivities.length > 0;
      const hasEvidence = projectEvidence.length > 0;
      const hasTimeEntries = projectTimeEntries.length > 0;
      const evidenceCoverage = projectActivities.length > 0 
        ? (activitiesWithEvidence.length / projectActivities.length) * 100
        : 0;
      const timeCoverage = projectActivities.length > 0
        ? (activitiesWithTime.length / projectActivities.length) * 100
        : 0;

      const complianceScore = Math.round(
        (hasActivities ? 20 : 0) +
        (hasEvidence ? 20 : 0) +
        (hasTimeEntries ? 20 : 0) +
        (evidenceCoverage * 0.2) +
        (timeCoverage * 0.2)
      );

      const status = complianceScore >= 80 ? 'good' : 
                    complianceScore >= 60 ? 'warning' : 'critical';

      return {
        id: project.id,
        name: project.projectName,
        complianceScore,
        status,
        gaps: {
          project: {
            missingFields: [], // We don't have detailed project field info
            completeness: hasActivities && hasEvidence && hasTimeEntries ? 90 : 
                         hasActivities && hasEvidence ? 70 :
                         hasActivities ? 50 : 20
          },
          stages: {
            preliminary: { 
              hasActivities: projectActivities.length > 0, 
              hasEvidence: projectEvidence.length > 0, 
              score: projectActivities.length > 0 && projectEvidence.length > 0 ? 100 : 
                     projectActivities.length > 0 ? 50 : 0 
            },
            hypothesis_design: { hasActivities: false, hasEvidence: false, score: 0 },
            experiments_trials: { hasActivities: false, hasEvidence: false, score: 0 },
            analysis: { hasActivities: false, hasEvidence: false, score: 0 },
            outcome: { hasActivities: false, hasEvidence: false, score: 0 }
          },
          activities: {
            coreCount: projectActivities.filter((a: any) => a.activityType === 'core').length,
            supportingCount: projectActivities.filter((a: any) => a.activityType === 'supporting').length,
            supportingWithoutCore: [],
            activitiesWithoutEvidence: activitiesWithoutEvidence.map((a: any) => a.id),
            activitiesWithoutTime: activitiesWithoutTime.map((a: any) => a.id)
          },
          evidence: {
            totalCount: projectEvidence.length,
            byType: evidenceByType,
            missingTypes: [],
            activitiesWithoutEvidence: activitiesWithoutEvidence.map((a: any) => a.id)
          },
          timeTracking: {
            totalHours: Math.round(totalHours * 10) / 10,
            activitiesWithoutTime: activitiesWithoutTime.map((a: any) => a.id),
            unapprovedEntries
          }
        }
      };
    });

    // Calculate overall statistics
    const totalProjects = projects.length;
    const compliantProjects = projectAnalysis.filter((p: any) => p.status === 'good').length;
    const overallScore = totalProjects > 0 
      ? Math.round(projectAnalysis.reduce((sum: number, p: any) => sum + p.complianceScore, 0) / totalProjects)
      : 0;
    
    const criticalGaps = projectAnalysis.reduce((sum: number, p: any) => 
      sum + p.gaps.activities.activitiesWithoutEvidence.length + 
      (p.gaps.project.missingFields?.length || 0), 0
    );
    
    const warningGaps = projectAnalysis.reduce((sum: number, p: any) => 
      sum + p.gaps.activities.activitiesWithoutTime.length + p.gaps.timeTracking.unapprovedEntries, 0
    );
    
    const completedItems = projectAnalysis.reduce((sum: number, p: any) => 
      sum + p.gaps.evidence.totalCount + (p.gaps.activities.coreCount + p.gaps.activities.supportingCount), 0
    );

    return {
      overall: {
        totalProjects,
        compliantProjects,
        overallScore,
        criticalGaps,
        warningGaps,
        completedItems
      },
      projects: projectAnalysis
    };
  };

  const gapAnalysisData = calculateGapAnalysis();

  // Loading state
  const isLoading = projectsLoading || activitiesLoading || timeEntriesLoading || evidenceLoading;

  // Refresh function
  const handleRefresh = () => {
    refetchProjects();
    refetchActivities();
    refetchTimeEntries();
    refetchEvidence();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
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

  const getSelectedProjectData = () => {
    if (selectedProject === 'all') return null;
    return gapAnalysisData.projects.find((p: any) => p.id === selectedProject);
  };

  const selectedProjectData = getSelectedProjectData();

  if (isLoading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px" mx="auto" flex="1" w="100%">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <Center py={20}>
            <VStack spacing={4}>
              <CircularProgress isIndeterminate color={getColor("primary", colorMode)} size="60px" />
              <Text color={textSecondary}>Analyzing R&D compliance gaps...</Text>
            </VStack>
          </Center>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px" mx="auto" flex="1" w="100%">
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            borderColor={cardBorder}
            color={textPrimary}
            bg="rgba(0, 0, 0, 0.2)"
            _hover={{
              borderColor: textSecondary,
              bg: "rgba(255, 255, 255, 0.05)"
            }}
            onClick={() => navigate('/researchanddesign')}
            size={{ base: "sm", md: "md" }}
          >
            Back to Dashboard
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <Flex 
            justify="space-between" 
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <VStack align="start" spacing={1} flex="1">
              <Heading size={{ base: "lg", md: "xl" }} color={textPrimary}>
                📊 R&D Compliance Gap Analysis
              </Heading>
              <Text color={textSecondary} fontSize={{ base: "sm", md: "md" }}>
                Identify missing documentation and improve R&D tax incentive compliance
              </Text>
            </VStack>
            
            <HStack spacing={3} w={{ base: "full", md: "auto" }}>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                w={{ base: "full", md: "300px" }}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                size={{ base: "md", md: "lg" }}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{ borderColor: textSecondary }}
                _focus={{
                  borderColor: textSecondary,
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
              >
                <option value="all" style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>All Projects Overview</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                    {project.projectName} {project.projectCode && `(${project.projectCode})`}
                  </option>
                ))}
              </Select>
              <Button 
                leftIcon={<RepeatIcon />} 
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                onClick={handleRefresh}
                isLoading={isLoading}
                size={{ base: "sm", md: "md" }}
              >
                <Text display={{ base: "none", sm: "inline" }}>Refresh Analysis</Text>
                <Text display={{ base: "inline", sm: "none" }}>Refresh</Text>
              </Button>
            </HStack>
          </Flex>

          {/* Overall Compliance Score */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Overall Compliance Status</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(auto-fit, minmax(180px, 1fr))" }} gap={{ base: 4, md: 6 }}>
                <VStack>
                  <CircularProgress
                    value={gapAnalysisData.overall.overallScore}
                    size="120px"
                    color={getScoreColor(gapAnalysisData.overall.overallScore)}
                  >
                    <CircularProgressLabel color={textPrimary}>
                      {gapAnalysisData.overall.overallScore}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontWeight="semibold" color={textPrimary}>Overall Compliance</Text>
                </VStack>

                <Stat>
                  <StatLabel color={textSecondary}>Projects</StatLabel>
                  <StatNumber color={textPrimary}>{gapAnalysisData.overall.compliantProjects}/{gapAnalysisData.overall.totalProjects}</StatNumber>
                  <StatHelpText color={textMuted}>Compliant projects</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color={textSecondary}>Critical Gaps</StatLabel>
                  <StatNumber color="red.400">{gapAnalysisData.overall.criticalGaps}</StatNumber>
                  <StatHelpText color={textMuted}>Require immediate attention</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color={textSecondary}>Warning Gaps</StatLabel>
                  <StatNumber color="orange.400">{gapAnalysisData.overall.warningGaps}</StatNumber>
                  <StatHelpText color={textMuted}>Should be addressed</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color={textSecondary}>Completed</StatLabel>
                  <StatNumber color="green.400">{gapAnalysisData.overall.completedItems}</StatNumber>
                  <StatHelpText color={textMuted}>Items documented</StatHelpText>
                </Stat>
              </Grid>
            </CardBody>
          </Card>

          {selectedProject === 'all' ? (
            /* All Projects Overview */
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Project Compliance Overview</Heading>
              </CardHeader>
              <CardBody p={0}>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="rgba(0, 0, 0, 0.2)">
                      <Tr>
                        <Th color={textSecondary} borderColor={cardBorder}>Project</Th>
                        <Th color={textSecondary} borderColor={cardBorder}>Compliance Score</Th>
                        <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>Status</Th>
                        <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>Critical Gaps</Th>
                        <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>Activities</Th>
                        <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>Evidence</Th>
                        <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {gapAnalysisData.projects.map((project: any) => (
                        <Tr key={project.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                          <Td borderColor={cardBorder}>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color={textPrimary} fontSize={{ base: "sm", md: "md" }}>{project.name}</Text>
                              <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>
                                {projects.find((p: any) => p.id === project.id)?.projectCode || 'No code'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td borderColor={cardBorder}>
                            <HStack>
                              <CircularProgress
                                value={project.complianceScore}
                                size="40px"
                                color={getScoreColor(project.complianceScore)}
                              >
                                <CircularProgressLabel fontSize="xs" color={textPrimary}>
                                  {project.complianceScore}%
                                </CircularProgressLabel>
                              </CircularProgress>
                            </HStack>
                          </Td>
                          <Td borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>
                            <Badge colorScheme={getStatusColor(project.status)}>
                              {project.status.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color={textPrimary}>
                                {project.gaps.project.missingFields.length} project fields
                              </Text>
                              <Text fontSize="sm" color={textPrimary}>
                                {project.gaps.activities.activitiesWithoutEvidence.length} activities missing evidence
                              </Text>
                            </VStack>
                          </Td>
                          <Td borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>
                            <Text fontSize="sm" color={textPrimary}>
                              {project.gaps.activities.coreCount} core, {project.gaps.activities.supportingCount} supporting
                            </Text>
                          </Td>
                          <Td borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>
                            <Text fontSize="sm" color={textPrimary}>
                              {project.gaps.evidence.totalCount} items
                            </Text>
                          </Td>
                          <Td borderColor={cardBorder}>
                            <HStack spacing={1}>
                              <Tooltip label="View detailed analysis">
                                <IconButton
                                  aria-label="View details"
                                  icon={<ViewIcon />}
                                  size="sm"
                                  variant="ghost"
                                  color={textSecondary}
                                  _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                                  onClick={() => setSelectedProject(project.id)}
                                />
                              </Tooltip>
                              <Tooltip label="View project">
                                <IconButton
                                  aria-label="View project"
                                  icon={<InfoIcon />}
                                  size="sm"
                                  variant="ghost"
                                  color={textSecondary}
                                  _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                                  onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          ) : selectedProjectData && (
            /* Detailed Project Analysis */
            <VStack spacing={6} align="stretch">
              {/* Project Header */}
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardBody>
                  <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }} gap={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>{selectedProjectData.name}</Heading>
                      <Badge colorScheme={getStatusColor(selectedProjectData.status)} fontSize="md">
                        {selectedProjectData.status.toUpperCase()}
                      </Badge>
                    </VStack>
                    
                    <VStack>
                      <CircularProgress
                        value={selectedProjectData.complianceScore}
                        size="80px"
                        color={getScoreColor(selectedProjectData.complianceScore)}
                      >
                        <CircularProgressLabel color={textPrimary}>
                          {selectedProjectData.complianceScore}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text fontSize="sm" color={textSecondary}>
                        Compliance Score
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              {/* Critical Issues Alert */}
              {selectedProjectData.gaps.project.missingFields.length > 0 && (
                <Alert 
                  status="error"
                  bg="rgba(239, 68, 68, 0.1)"
                  borderColor="rgba(239, 68, 68, 0.3)"
                  borderWidth="1px"
                >
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Critical Project Information Missing!</AlertTitle>
                    <AlertDescription>
                      Missing required fields: {selectedProjectData.gaps.project.missingFields.join(', ')}
                    </AlertDescription>
                  </Box>
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    onClick={() => navigate(`/researchanddesign/projects/${selectedProjectData.id}/edit`)}
                  >
                    Fix Now
                  </Button>
                </Alert>
              )}

              <Tabs>
                <TabList bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder} overflowX="auto">
                  <Tab color={textSecondary} _selected={{ color: textPrimary, borderColor: textPrimary }} fontSize={{ base: "sm", md: "md" }}>Documentation Stages</Tab>
                  <Tab color={textSecondary} _selected={{ color: textPrimary, borderColor: textPrimary }} fontSize={{ base: "sm", md: "md" }}>Activities & Evidence</Tab>
                  <Tab color={textSecondary} _selected={{ color: textPrimary, borderColor: textPrimary }} fontSize={{ base: "sm", md: "md" }}>Time Tracking</Tab>
                  <Tab color={textSecondary} _selected={{ color: textPrimary, borderColor: textPrimary }} fontSize={{ base: "sm", md: "md" }}>Action Plan</Tab>
                </TabList>

                <TabPanels>
                  {/* Documentation Stages Tab */}
                  <TabPanel px={0}>
                    <Card 
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                    >
                      <CardHeader borderBottom="1px" borderColor={cardBorder}>
                        <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>5-Stage Documentation Progress</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {Object.entries(selectedProjectData.gaps.stages).map(([stage, data]: [string, any]) => (
                            <Box key={stage} p={4} borderRadius="md" border="1px" borderColor={cardBorder} bg="rgba(0, 0, 0, 0.2)">
                              <HStack justify="space-between" mb={3} flexWrap={{ base: "wrap", sm: "nowrap" }}>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" color={textPrimary}>{getStageLabel(stage)}</Text>
                                  <Text fontSize="sm" color={textSecondary}>
                                    Stage {Object.keys(selectedProjectData.gaps.stages).indexOf(stage) + 1} of 5
                                  </Text>
                                </VStack>
                                
                                <HStack>
                                  <CircularProgress
                                    value={data.score}
                                    size="60px"
                                    color={getScoreColor(data.score)}
                                  >
                                    <CircularProgressLabel fontSize="xs" color={textPrimary}>
                                      {data.score}%
                                    </CircularProgressLabel>
                                  </CircularProgress>
                                </HStack>
                              </HStack>

                              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
                                <HStack>
                                  {data.hasActivities ? (
                                    <CheckCircleIcon color="green.400" />
                                  ) : (
                                    <WarningIcon color="red.400" />
                                  )}
                                  <Text fontSize="sm" color={textPrimary}>
                                    Activities {data.hasActivities ? 'documented' : 'missing'}
                                  </Text>
                                </HStack>
                                
                                <HStack>
                                  {data.hasEvidence ? (
                                    <CheckCircleIcon color="green.400" />
                                  ) : (
                                    <WarningIcon color="red.400" />
                                  )}
                                  <Text fontSize="sm" color={textPrimary}>
                                    Evidence {data.hasEvidence ? 'provided' : 'missing'}
                                  </Text>
                                </HStack>
                              </Grid>

                              {(!data.hasActivities || !data.hasEvidence) && (
                                <HStack spacing={2} mt={3}>
                                  {!data.hasActivities && (
                                    <Button
                                      size="xs"
                                      leftIcon={<AddIcon />}
                                      onClick={() => navigate(`/researchanddesign/activities/new?project=${selectedProjectData.id}&stage=${stage}`)}
                                    >
                                      Add Activity
                                    </Button>
                                  )}
                                  {!data.hasEvidence && (
                                    <Button
                                      size="xs"
                                      leftIcon={<AttachmentIcon />}
                                      variant="outline"
                                      onClick={() => navigate(`/researchanddesign/evidence?project=${selectedProjectData.id}`)}
                                    >
                                      Upload Evidence
                                    </Button>
                                  )}
                                </HStack>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Activities & Evidence Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Card 
                          bg={cardGradientBg}
                          backdropFilter="blur(10px)"
                          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                          border="1px"
                          borderColor={cardBorder}
                        >
                          <CardHeader>
                            <Heading size="sm" color={textPrimary}>Activity Analysis</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text color={textSecondary}>Core Activities:</Text>
                                <Badge colorScheme="blue">{selectedProjectData.gaps.activities.coreCount}</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text color={textSecondary}>Supporting Activities:</Text>
                                <Badge colorScheme="gray">{selectedProjectData.gaps.activities.supportingCount}</Badge>
                              </HStack>
                              
                              {selectedProjectData.gaps.activities.supportingWithoutCore.length > 0 && (
                                <Alert status="warning" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    {selectedProjectData.gaps.activities.supportingWithoutCore.length} supporting activities without core linkage
                                  </Text>
                                </Alert>
                              )}

                              {selectedProjectData.gaps.activities.activitiesWithoutEvidence.length > 0 && (
                                <Alert status="error" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    {selectedProjectData.gaps.activities.activitiesWithoutEvidence.length} activities missing evidence
                                  </Text>
                                </Alert>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card 
                          bg={cardGradientBg}
                          backdropFilter="blur(10px)"
                          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                          border="1px"
                          borderColor={cardBorder}
                        >
                          <CardHeader>
                            <Heading size="sm" color={textPrimary}>Evidence Analysis</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text color={textSecondary}>Total Evidence:</Text>
                                <Badge colorScheme="green">{selectedProjectData.gaps.evidence.totalCount}</Badge>
                              </HStack>
                              
                              <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>Evidence Types:</Text>
                              <VStack align="stretch" spacing={1}>
                                {Object.entries(selectedProjectData.gaps.evidence.byType).map(([type, count]: [string, any]) => (
                                  <HStack key={type} justify="space-between">
                                    <Text fontSize="sm" textTransform="capitalize">{type}:</Text>
                                    <Text fontSize="sm">{count}</Text>
                                  </HStack>
                                ))}
                              </VStack>

                              {selectedProjectData.gaps.evidence.missingTypes && (
                                <Alert status="info" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    Consider adding: {selectedProjectData.gaps.evidence.missingTypes.join(', ')}
                                  </Text>
                                </Alert>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </Grid>
                    </VStack>
                  </TabPanel>

                  {/* Time Tracking Tab */}
                  <TabPanel px={0}>
                    <Card 
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                    >
                      <CardHeader>
                        <Heading size="sm" color={textPrimary}>Time Tracking Compliance</Heading>
                      </CardHeader>
                      <CardBody>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                          <Stat>
                            <StatLabel>Total Hours</StatLabel>
                            <StatNumber>{selectedProjectData.gaps.timeTracking.totalHours}h</StatNumber>
                            <StatHelpText>All logged time</StatHelpText>
                          </Stat>

                          <Stat>
                            <StatLabel>Activities Without Time</StatLabel>
                            <StatNumber color={selectedProjectData.gaps.timeTracking.activitiesWithoutTime.length > 0 ? "red.500" : "green.500"}>
                              {selectedProjectData.gaps.timeTracking.activitiesWithoutTime.length}
                            </StatNumber>
                            <StatHelpText>Need time entries</StatHelpText>
                          </Stat>

                          <Stat>
                            <StatLabel>Unapproved Entries</StatLabel>
                            <StatNumber color={selectedProjectData.gaps.timeTracking.unapprovedEntries > 0 ? "orange.500" : "green.500"}>
                              {selectedProjectData.gaps.timeTracking.unapprovedEntries}
                            </StatNumber>
                            <StatHelpText>Need approval</StatHelpText>
                          </Stat>
                        </Grid>

                        {(selectedProjectData.gaps.timeTracking.activitiesWithoutTime.length > 0 || 
                          selectedProjectData.gaps.timeTracking.unapprovedEntries > 0) && (
                          <VStack align="stretch" spacing={3} mt={6}>
                            <Divider />
                            <Text fontWeight="semibold">Actions Required:</Text>
                            
                            {selectedProjectData.gaps.timeTracking.activitiesWithoutTime.length > 0 && (
                              <Alert status="warning">
                                <AlertIcon />
                                <Box flex="1">
                                  <Text fontSize="sm">
                                    {selectedProjectData.gaps.timeTracking.activitiesWithoutTime.length} activities need time entries
                                  </Text>
                                </Box>
                                <Button
                                  size="sm"
                                  leftIcon={<TimeIcon />}
                                  onClick={() => navigate(`/researchanddesign/timesheet?project=${selectedProjectData.id}`)}
                                >
                                  Log Time
                                </Button>
                              </Alert>
                            )}

                            {selectedProjectData.gaps.timeTracking.unapprovedEntries > 0 && (
                              <Alert status="info">
                                <AlertIcon />
                                <Box flex="1">
                                  <Text fontSize="sm">
                                    {selectedProjectData.gaps.timeTracking.unapprovedEntries} time entries need approval
                                  </Text>
                                </Box>
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/researchanddesign/timesheet?project=${selectedProjectData.id}`)}
                                >
                                  Review Entries
                                </Button>
                              </Alert>
                            )}
                          </VStack>
                        )}
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Action Plan Tab */}
                  <TabPanel px={0}>
                    <Card 
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                    >
                      <CardHeader>
                        <Heading size="sm" color={textPrimary}>Recommended Action Plan</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" mb={3} color="red.500">🚨 High Priority Actions</Text>
                            <List spacing={2}>
                              {selectedProjectData.gaps.project.missingFields.map((field: any) => (
                                <ListItem key={field}>
                                  <ListIcon as={WarningIcon} color="red.500" />
                                  <Text as="span">Complete missing project field: {field}</Text>
                                  <Button
                                    size="xs"
                                    ml={2}
                                    onClick={() => navigate(`/researchanddesign/projects/${selectedProjectData.id}/edit`)}
                                  >
                                    Fix
                                  </Button>
                                </ListItem>
                              ))}
                              
                              {selectedProjectData.gaps.activities.activitiesWithoutEvidence.map((activityId: any, index: number) => (
                                <ListItem key={activityId}>
                                  <ListIcon as={AttachmentIcon} color="red.500" />
                                  <Text as="span">Upload evidence for activity #{index + 1}</Text>
                                  <Button
                                    size="xs"
                                    ml={2}
                                    onClick={() => navigate(`/researchanddesign/evidence?project=${selectedProjectData.id}`)}
                                  >
                                    Upload
                                  </Button>
                                </ListItem>
                              ))}
                            </List>
                          </Box>

                          <Box>
                            <Text fontWeight="semibold" mb={3} color="orange.500">⚠️ Medium Priority Actions</Text>
                            <List spacing={2}>
                              {selectedProjectData.gaps.timeTracking.activitiesWithoutTime.map((activityId: any, index: number) => (
                                <ListItem key={activityId}>
                                  <ListIcon as={TimeIcon} color="orange.500" />
                                  <Text as="span">Log time for activity #{index + 1}</Text>
                                  <Button
                                    size="xs"
                                    ml={2}
                                    onClick={() => navigate(`/researchanddesign/timesheet?project=${selectedProjectData.id}`)}
                                  >
                                    Log Time
                                  </Button>
                                </ListItem>
                              ))}
                              
                              {selectedProjectData.gaps.activities.supportingWithoutCore.map((activityId: any, index: number) => (
                                <ListItem key={activityId}>
                                  <ListIcon as={InfoIcon} color="orange.500" />
                                  <Text as="span">Link supporting activity #{index + 1} to core activity</Text>
                                  <Button
                                    size="xs"
                                    ml={2}
                                    onClick={() => navigate(`/researchanddesign/activities/${activityId}/edit`)}
                                  >
                                    Fix
                                  </Button>
                                </ListItem>
                              ))}
                            </List>
                          </Box>

                          <Box>
                            <Text fontWeight="semibold" mb={3} color="blue.500">💡 Improvement Suggestions</Text>
                            <List spacing={2}>
                              <ListItem>
                                <ListIcon as={CheckCircleIcon} color="blue.500" />
                                Add more diverse evidence types for stronger documentation
                              </ListItem>
                              <ListItem>
                                <ListIcon as={CheckCircleIcon} color="blue.500" />
                                Document quantitative outcomes for analysis stage
                              </ListItem>
                              <ListItem>
                                <ListIcon as={CheckCircleIcon} color="blue.500" />
                                Create milestone documentation for project outcome stage
                              </ListItem>
                            </List>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          )}
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignGapAnalysis;