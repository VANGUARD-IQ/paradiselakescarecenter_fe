import React, { useState } from 'react';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
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
  Progress,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useColorModeValue,
  useColorMode,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Divider,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
  Flex,
  Image,
  Portal,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  ArrowBackIcon,
  EditIcon,
  AddIcon,
  TimeIcon,
  AttachmentIcon,
  WarningIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DownloadIcon,
  ViewIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

// GraphQL queries
const GET_RD_PROJECT = gql`
  query GetRDProject($id: String!) {
    getRDProject(id: $id) {
      id
      projectName
      projectCode
      status
      projectType
      executiveSummary
      technicalObjective
      hypothesis
      systematicExperimentationApproach
      variables
      successCriteria
      technicalUncertainty
      industryKnowledge
      knowledgeLimitations
      startDate
      endDate
      financialYear
      totalHours
      estimatedValue
      createdAt
      updatedAt
    }
  }
`;

const GET_RD_ACTIVITIES = gql`
  query GetRDActivities($projectId: String!) {
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
  query GetRDTimeEntries($projectId: String!) {
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
  query GetRDEvidence($projectId: String!) {
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

const ResearchAndDesignProjectDetail: React.FC = () => {
  usePageTitle("R&D Project Details");
  const { colorMode } = useColorMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  // Fetch project data from GraphQL
  const { data, loading, error } = useQuery(GET_RD_PROJECT, {
    variables: { id: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Fetch activities data
  const { data: activitiesData, loading: activitiesLoading, error: activitiesError } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: id! },
    skip: !id,
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log('=== ACTIVITIES QUERY DEBUG ===');
      console.log('Project ID:', id);
      console.log('Activities data:', data);
      console.log('Activities array:', data?.getRDActivities);
      console.log('Activities count:', data?.getRDActivities?.length);
    },
    onError: (error) => {
      console.log('Activities query error:', error);
    }
  });

  // Fetch time entries data
  const { data: timeEntriesData, loading: timeEntriesLoading } = useQuery(GET_RD_TIME_ENTRIES, {
    variables: { projectId: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Fetch evidence data
  const { data: evidenceData, loading: evidenceLoading } = useQuery(GET_RD_EVIDENCE, {
    variables: { projectId: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Handle loading state
  const isLoading = loading || activitiesLoading || timeEntriesLoading || evidenceLoading;
  
  if (isLoading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} textAlign="center" flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <VStack spacing={4}>
            <Text color={textSecondary} fontSize="lg">Loading project...</Text>
          </VStack>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Handle error state
  if (error || !data?.getRDProject) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} textAlign="center" flex="1">
          <Text color={getColor("status.error", colorMode)} fontSize="lg">
            {error ? `Error: ${error.message}` : 'Project not found'}
          </Text>
          <Button 
            mt={4} 
            onClick={() => navigate('/researchanddesign/projects')}
            bg="white"
            color="black"
            _hover={{ 
              bg: "gray.100",
              transform: "translateY(-2px)"
            }}
            boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
          >
            Back to Projects
          </Button>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const project = data.getRDProject;

  // Extract real data from GraphQL queries
  const activities = activitiesData?.getRDActivities || [];
  const evidence = evidenceData?.getRDEvidence || [];
  const timeEntries = timeEntriesData?.getRDTimeEntries || [];
  
  console.log('=== PROJECT DATA DEBUG ===');
  console.log('Raw activities from GraphQL:', activities);
  console.log('Activities length:', activities.length);
  console.log('Evidence length:', evidence.length);
  console.log('Time entries length:', timeEntries.length);
  console.log('Activities loading:', activitiesLoading);
  console.log('Activities error:', activitiesError);

  // Calculate derived data for display
  const activitiesWithStats = activities.map((activity: any) => {
    // Calculate hours for this activity
    const activityTimeEntries = timeEntries.filter((t: any) => t.rdActivityId === activity.id);
    const hours = activityTimeEntries.reduce((sum: number, entry: any) => 
      sum + (parseFloat(entry.hours) || 0), 0
    );
    
    // Count evidence for this activity
    const evidenceCount = evidence.filter((e: any) => e.rdActivityId === activity.id).length;
    
    // Determine status based on activity and evidence
    const status = evidenceCount > 0 && hours > 0 ? 'completed' : 
                  hours > 0 ? 'in-progress' : 'planned';
    
    return {
      ...activity,
      hours: Math.round(hours * 10) / 10,
      evidenceCount,
      status,
      description: activity.activityName // Use name as description for now
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'blue';
      case 'documenting': return 'orange';
      case 'potential': return 'gray';
      case 'eligible': return 'green';
      case 'submitted': return 'purple';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'planned': return 'gray';
      default: return 'gray';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'preliminary': return 'Preliminary';
      case 'hypothesis_design': return 'Hypothesis & Design';
      case 'experiments_trials': return 'Experiments & Trials';
      case 'analysis': return 'Analysis';
      case 'outcome': return 'Outcome';
      default: return 'Unknown';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'screenshot': return '📸';
      case 'code': return '💻';
      case 'photo': return '📷';
      case 'email': return '📧';
      case 'chat': return '💬';
      default: return '📎';
    }
  };

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
            onClick={() => navigate('/researchanddesign/projects')}
            size={{ base: "sm", md: "md" }}
          >
            Back to Projects
          </Button>
        </HStack>

        {/* Project Header */}
        <Card 
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
          mb={6}
        >
          <CardBody>
            <HStack justify="space-between" align="start" flexWrap={{ base: "wrap", lg: "nowrap" }} gap={4}>
              <VStack align="start" spacing={3} flex={1}>
                <HStack flexWrap="wrap" gap={2}>
                  <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color={textPrimary}>
                    {project.projectName}
                  </Heading>
                  <Badge 
                    bg={`rgba(${getStatusColor(project.status || 'potential') === 'blue' ? '59, 130, 246' : getStatusColor(project.status || 'potential') === 'green' ? '34, 197, 94' : getStatusColor(project.status || 'potential') === 'orange' ? '251, 146, 60' : getStatusColor(project.status || 'potential') === 'red' ? '239, 68, 68' : getStatusColor(project.status || 'potential') === 'purple' ? '168, 85, 247' : '156, 163, 175'}, 0.2)`}
                    color={getStatusColor(project.status || 'potential') === 'blue' ? '#3B82F6' : getStatusColor(project.status || 'potential') === 'green' ? '#22C55E' : getStatusColor(project.status || 'potential') === 'orange' ? '#FB923C' : getStatusColor(project.status || 'potential') === 'red' ? '#EF4444' : getStatusColor(project.status || 'potential') === 'purple' ? '#A855F7' : '#9CA3AF'}
                    border="1px solid"
                    borderColor={`rgba(${getStatusColor(project.status || 'potential') === 'blue' ? '59, 130, 246' : getStatusColor(project.status || 'potential') === 'green' ? '34, 197, 94' : getStatusColor(project.status || 'potential') === 'orange' ? '251, 146, 60' : getStatusColor(project.status || 'potential') === 'red' ? '239, 68, 68' : getStatusColor(project.status || 'potential') === 'purple' ? '168, 85, 247' : '156, 163, 175'}, 0.3)`}
                    fontSize="md"
                  >
                    {(project.status || 'potential').replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline"
                    borderColor={cardBorder}
                    color={textSecondary}
                  >
                    {(project.projectType || 'undetermined').toUpperCase()}
                  </Badge>
                </HStack>
                
                <Text color={textSecondary} fontSize={{ base: "md", md: "lg", lg: "xl" }}>
                  {project.projectCode} • {project.financialYear}
                </Text>
                
                <Box>
                  <MarkdownRenderer 
                    content={project.executiveSummary || '*Executive summary not available yet. Please edit the project to add one.*'}
                    fontSize="lg"
                    color={textPrimary}
                  />
                </Box>

                <HStack spacing={{ base: 3, md: 6 }} flexWrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>Start Date</Text>
                    <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }} color={textPrimary}>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>Total Hours</Text>
                    <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }} color={textPrimary}>{project.totalHours || 0}h</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>Estimated Value</Text>
                    <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }} color={getColor("badges.green.color", colorMode)}>
                      ${(project.estimatedValue || 0).toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <VStack w={{ base: "full", lg: "auto" }}>
                 <Menu isLazy placement="bottom-end">
                     <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                     bg={getColor("primary", colorMode)}
                     color="white"
                    _hover={{ 
                       bg: getColor("primaryHover", colorMode),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)",
                    }}
                    boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="semibold"
                    w={{ base: "full", lg: "auto" }}
                  >
                    Actions
                  </MenuButton>
                  <Portal>
                    <MenuList 
                      bg={getComponent("menu", "bg")}
                      backdropFilter="blur(20px)"
                      borderColor={getComponent("menu", "borderColor")}
                      border="1px solid"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
                    >
                      <MenuItem 
                      icon={<EditIcon />} 
                      onClick={() => navigate(`/researchanddesign/projects/${id}/edit`)} 
                      bg={getComponent("menu", "itemBg")}
                      color={getComponent("menu", "itemColor")}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                      _focus={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                    >
                      Edit Project
                    </MenuItem>
                    <MenuItem 
                      icon={<AddIcon />} 
                      onClick={() => navigate(`/researchanddesign/activities/new?project=${id}`)} 
                      bg={getComponent("menu", "itemBg")}
                      color={getComponent("menu", "itemColor")}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                      _focus={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                    >
                      Add Activity
                    </MenuItem>
                    <MenuItem 
                      icon={<TimeIcon />} 
                      onClick={() => navigate(`/researchanddesign/timesheet?project=${id}`)} 
                      bg={getComponent("menu", "itemBg")}
                      color={getComponent("menu", "itemColor")}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                      _focus={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                    >
                      Log Time
                    </MenuItem>
                    <MenuItem 
                      icon={<AttachmentIcon />} 
                      onClick={() => navigate(`/researchanddesign/evidence?project=${id}`)} 
                      bg={getComponent("menu", "itemBg")}
                      color={getComponent("menu", "itemColor")}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                      _focus={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                    >
                      Upload Evidence
                    </MenuItem>
                    <MenuItem 
                      icon={<DownloadIcon />} 
                      bg={getComponent("menu", "itemBg")}
                      color={getComponent("menu", "itemColor")}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                      _focus={{ 
                        bg: getComponent("menu", "itemHoverBg"), 
                        color: getComponent("menu", "itemHoverColor") 
                      }}
                    >
                      Generate Report
                    </MenuItem>
                  </MenuList>
                </Portal>
                </Menu>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(auto-fit, minmax(200px, 1fr))" }} gap={{ base: 3, md: 4 }} mb={6}>
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <Stat>
                <StatLabel color={textSecondary} fontSize="md">Activities</StatLabel>
                <StatNumber color={textPrimary} fontSize="3xl">{activitiesWithStats.length}</StatNumber>
                <StatHelpText color={textMuted} fontSize="sm">{activitiesWithStats.filter((a: any) => a.status === 'completed').length} completed</StatHelpText>
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
                <StatHelpText color={textMuted} fontSize="sm">Across all activities</StatHelpText>
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
                <StatLabel color={textSecondary} fontSize="md">Time Entries</StatLabel>
                <StatNumber color={textPrimary} fontSize="3xl">{timeEntries.length}</StatNumber>
                <StatHelpText color={textMuted} fontSize="sm">{timeEntries.filter((t: any) => t.status === 'approved').length} approved</StatHelpText>
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
                <StatLabel color={textSecondary} fontSize="md">Documentation</StatLabel>
                <StatNumber color={textPrimary} fontSize="3xl">75%</StatNumber>
                <Progress value={75} colorScheme="green" size="sm" mt={2} bg="rgba(0, 0, 0, 0.2)" />
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Content Tabs */}
        <Tabs>
          <TabList bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder} overflowX="auto" overflowY="hidden">
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Overview
            </Tab>
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Core Activities ({activitiesWithStats.filter((a: any) => a.activityType === 'core').length})
            </Tab>
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Supporting Activities ({activitiesWithStats.filter((a: any) => a.activityType === 'supporting').length})
            </Tab>
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Evidence ({evidence.length})
            </Tab>
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Time Tracking ({timeEntries.length})
            </Tab>
            <Tab 
              color={textSecondary} 
              _selected={{ color: textPrimary, borderColor: textPrimary }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              whiteSpace="nowrap"
            >
              Compliance
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Technical Details */}
                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardHeader borderBottom="1px" borderColor={cardBorder}>
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Technical Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      {project.executiveSummary && (
                        <Box>
                          <Text fontWeight="semibold" mb={2} fontSize={{ base: "md", md: "lg" }} color={textPrimary}>Executive Summary</Text>
                          <Box fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
                            <MarkdownRenderer content={project.executiveSummary}/>
                          </Box>
                        </Box>
                      )}
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize={{ base: "md", md: "lg" }} color={textPrimary}>Technical Objective</Text>
                        <Box fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
                          <MarkdownRenderer content={project.technicalObjective || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Hypothesis</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.hypothesis || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Systematic Experimentation Approach</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.systematicExperimentationApproach || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Technical Uncertainty</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.technicalUncertainty || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Variables Being Tested</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.variables || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Success Criteria</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.successCriteria || '*Not specified*'}/>
                        </Box>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Industry Knowledge */}
                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardHeader borderBottom="1px" borderColor={cardBorder}>
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Industry Knowledge & Limitations</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Existing Industry Knowledge</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.industryKnowledge || '*Not specified*'}/>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2} fontSize="lg" color={textPrimary}>Knowledge Limitations</Text>
                        <Box fontSize="md" color={textSecondary}>
                          <MarkdownRenderer content={project.knowledgeLimitations || '*Not specified*'}/>
                        </Box>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Core Activities Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={2}>
                  <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Core R&D Activities</Heading>
                  <Button
                    leftIcon={<AddIcon />}
                    bg={getColor("primary", colorMode)}
                    color="white"
                    _hover={{ 
                      bg: getColor("primaryHover", colorMode),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)",
                    }}
                    onClick={() => navigate(`/researchanddesign/activities/new-core?project=${id}`)}
                    boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                    size={{ base: "sm", md: "md" }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Add Core Activity
                  </Button>
                </HStack>

                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody p={0} overflowX="auto">
                    <Table variant="simple">
                      <Thead bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder}>
                        <Tr>
                          <Th color={textSecondary} borderColor={cardBorder}>Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Type</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Stage</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Hours</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Evidence</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Status</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activitiesWithStats.map((activity: any) => (
                          <Tr key={activity.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                            <Td borderColor={cardBorder}>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold" fontSize="md" color={textPrimary}>{activity.activityName}</Text>
                                <Text fontSize="md" color={textSecondary}>
                                  {activity.description ? activity.description.substring(0, 50) + '...' : 'No description'}
                                </Text>
                              </VStack>
                            </Td>
                            <Td borderColor={cardBorder}>
                               <Badge 
                                 bg={activity.activityType === 'core' ? getColor("badges.blue.bg", colorMode) : getColor("badges.gray.bg", colorMode)}
                                 color={activity.activityType === 'core' ? getColor("badges.blue.color", colorMode) : getColor("badges.gray.color", colorMode)}
                                 border="1px solid"
                                 borderColor={activity.activityType === 'core' ? getColor("badges.blue.border", colorMode) : getColor("badges.gray.border", colorMode)}
                              >
                                {activity.activityType}
                              </Badge>
                            </Td>
                            <Td borderColor={cardBorder}>
                              {activity.documentationStage ? (
                                <Tag 
                                  size="sm"
                                  bg={getColor("badges.purple.bg", colorMode)}
                                  color={getColor("badges.purple.color", colorMode)}
                                  border="1px solid"
                                  borderColor={getColor("badges.purple.border", colorMode)}
                                >
                                  <TagLabel>{getStageLabel(activity.documentationStage)}</TagLabel>
                                </Tag>
                              ) : (
                                <Text color={textSecondary}>-</Text>
                              )}
                            </Td>
                            <Td borderColor={cardBorder} color={textPrimary}>{activity.hours}h</Td>
                            <Td borderColor={cardBorder} color={textPrimary}>{activity.evidenceCount}</Td>
                            <Td borderColor={cardBorder}>
                               <Badge 
                                 bg={getActivityStatusColor(activity.status) === 'green' ? getColor("badges.green.bg", colorMode) : getActivityStatusColor(activity.status) === 'blue' ? getColor("badges.blue.bg", colorMode) : getColor("badges.gray.bg", colorMode)}
                                 color={getActivityStatusColor(activity.status) === 'green' ? getColor("badges.green.color", colorMode) : getActivityStatusColor(activity.status) === 'blue' ? getColor("badges.blue.color", colorMode) : getColor("badges.gray.color", colorMode)}
                                 border="1px solid"
                                 borderColor={getActivityStatusColor(activity.status) === 'green' ? getColor("badges.green.border", colorMode) : getActivityStatusColor(activity.status) === 'blue' ? getColor("badges.blue.border", colorMode) : getColor("badges.gray.border", colorMode)}
                              >
                                {activity.status.replace('-', ' ')}
                              </Badge>
                            </Td>
                            <Td borderColor={cardBorder}>
                              <HStack spacing={1}>
                                 <IconButton
                                  aria-label="View activity"
                                  icon={<ViewIcon />}
                                  size="sm"
                                   bg={getColor("badges.blue.bg", colorMode)}
                                   color={getColor("badges.blue.color", colorMode)}
                                   border="1px solid"
                                   borderColor={getColor("badges.blue.border", colorMode)}
                                   _hover={{ bg: getColor("badges.blue.bg", colorMode) }}
                                  onClick={() => navigate(`/researchanddesign/activities/${activity.id}`)}
                                />
                                 <IconButton
                                  aria-label="Edit activity"
                                  icon={<EditIcon />}
                                  size="sm"
                                   bg={getColor("badges.orange.bg", colorMode)}
                                   color={getColor("badges.orange.color", colorMode)}
                                   border="1px solid"
                                   borderColor={getColor("badges.orange.border", colorMode)}
                                   _hover={{ bg: getColor("badges.orange.bg", colorMode) }}
                                  onClick={() => navigate(`/researchanddesign/activities/${activity.id}/edit`)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                        {activitiesWithStats.filter((a: any) => a.activityType === 'core').length === 0 && (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={8} borderColor={cardBorder}>
                              <VStack spacing={3}>
                                <Text color={textSecondary}>No Core R&D activities yet</Text>
                                <Text fontSize="sm" color={textMuted}>Core activities involve systematic experimentation to resolve technical uncertainties</Text>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => navigate(`/researchanddesign/activities/new-core?project=${id}`)}
                                >
                                  Create First Core Activity
                                </Button>
                              </VStack>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Supporting Activities Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={2}>
                  <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Supporting R&D Activities</Heading>
                  <Button
                    leftIcon={<AddIcon />}
                    bg={getColor("secondary", colorMode)}
                    color="white"
                    _hover={{ 
                      bg: getColor("secondaryHover", colorMode),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)",
                    }}
                    onClick={() => navigate(`/researchanddesign/activities/new-supporting?project=${id}`)}
                    boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                    size={{ base: "sm", md: "md" }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    isDisabled={activitiesWithStats.filter((a: any) => a.activityType === 'core').length === 0}
                  >
                    Add Supporting Activity
                  </Button>
                </HStack>

                {activitiesWithStats.filter((a: any) => a.activityType === 'core').length === 0 && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      You must create at least one Core R&D activity before adding Supporting activities.
                    </Text>
                  </Alert>
                )}

                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody p={0} overflowX="auto">
                    <Table variant="simple">
                      <Thead bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder}>
                        <Tr>
                          <Th color={textSecondary} borderColor={cardBorder}>Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Linked Core Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Stage</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>R&D %</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Hours</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Evidence</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activitiesWithStats.filter((a: any) => a.activityType === 'supporting').map((activity: any) => {
                          const linkedCore = activitiesWithStats.find((a: any) => a.id === activity.linkedCoreActivityId);
                          return (
                            <Tr key={activity.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                              <Td borderColor={cardBorder}>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold" fontSize="md" color={textPrimary}>{activity.activityName}</Text>
                                  <Text fontSize="sm" color={textSecondary}>
                                    {activity.description ? activity.description.substring(0, 50) + '...' : 'No description'}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td borderColor={cardBorder}>
                                {linkedCore ? (
                                  <Text fontSize="sm" color={textSecondary}>{linkedCore.activityName}</Text>
                                ) : (
                                  <Text fontSize="sm" color={textMuted}>Not linked</Text>
                                )}
                              </Td>
                              <Td borderColor={cardBorder}>
                                {activity.documentationStage ? (
                                  <Tag 
                                    size="sm"
                                    bg={getColor("badges.purple.bg", colorMode)}
                                    color={getColor("badges.purple.color", colorMode)}
                                    border="1px solid"
                                    borderColor={getColor("badges.purple.border", colorMode)}
                                  >
                                    <TagLabel>{getStageLabel(activity.documentationStage)}</TagLabel>
                                  </Tag>
                                ) : (
                                  <Text color={textSecondary}>-</Text>
                                )}
                              </Td>
                              <Td borderColor={cardBorder}>
                                <Badge 
                                  bg={activity.percentageForRD >= 51 ? getColor("badges.green.bg", colorMode) : getColor("badges.orange.bg", colorMode)}
                                  color={activity.percentageForRD >= 51 ? getColor("badges.green.color", colorMode) : getColor("badges.orange.color", colorMode)}
                                  border="1px solid"
                                  borderColor={activity.percentageForRD >= 51 ? getColor("badges.green.border", colorMode) : getColor("badges.orange.border", colorMode)}
                                >
                                  {activity.percentageForRD || 0}%
                                </Badge>
                              </Td>
                              <Td borderColor={cardBorder} color={textPrimary}>{activity.hours}h</Td>
                              <Td borderColor={cardBorder} color={textPrimary}>{activity.evidenceCount}</Td>
                              <Td borderColor={cardBorder}>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="View activity"
                                    icon={<ViewIcon />}
                                    size="sm"
                                    bg={getColor("badges.blue.bg", colorMode)}
                                    color={getColor("badges.blue.color", colorMode)}
                                    border="1px solid"
                                    borderColor={getColor("badges.blue.border", colorMode)}
                                    _hover={{ bg: getColor("badges.blue.bg", colorMode) }}
                                    onClick={() => navigate(`/researchanddesign/activities/${activity.id}`)}
                                  />
                                  <IconButton
                                    aria-label="Edit activity"
                                    icon={<EditIcon />}
                                    size="sm"
                                    bg={getColor("badges.orange.bg", colorMode)}
                                    color={getColor("badges.orange.color", colorMode)}
                                    border="1px solid"
                                    borderColor={getColor("badges.orange.border", colorMode)}
                                    _hover={{ bg: getColor("badges.orange.bg", colorMode) }}
                                    onClick={() => navigate(`/researchanddesign/activities/${activity.id}/edit`)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                        {activitiesWithStats.filter((a: any) => a.activityType === 'supporting').length === 0 && (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={8} borderColor={cardBorder}>
                              <VStack spacing={3}>
                                <Text color={textSecondary}>No Supporting R&D activities yet</Text>
                                <Text fontSize="sm" color={textMuted}>Supporting activities directly support Core R&D and must pass the dominant purpose test</Text>
                                {activitiesWithStats.filter((a: any) => a.activityType === 'core').length > 0 && (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => navigate(`/researchanddesign/activities/new-supporting?project=${id}`)}
                                  >
                                    Create Supporting Activity
                                  </Button>
                                )}
                              </VStack>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Evidence Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={2}>
                  <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Evidence Documentation</Heading>
                  <Button
                    leftIcon={<AttachmentIcon />}
                    bg={getColor("primary", colorMode)}
                    color="white"
                    _hover={{ 
                      bg: getColor("primaryHover", colorMode),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)",
                    }}
                    onClick={() => navigate(`/researchanddesign/evidence?project=${id}`)}
                    boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                    size={{ base: "sm", md: "md" }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Upload Evidence
                  </Button>
                </HStack>

                <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fill, minmax(350px, 1fr))" }} gap={{ base: 4, md: 6 }}>
                  {evidence.map((item: any) => (
                    <Card 
                      key={item.id} 
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 4px 16px 0 rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      _hover={{ 
                        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                        transform: "translateY(-2px)"
                      }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
                            <HStack flex="1" minW="0">
                              <Text fontSize="xl">{getEvidenceIcon(item.evidenceType)}</Text>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold" fontSize="sm" color={textPrimary}>
                                  {item.title}
                                </Text>
                                <Text fontSize="xs" color={textSecondary}>
                                  {item.captureDate ? new Date(item.captureDate).toLocaleDateString() : 'No date'}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge bg={getColor("components.button.primaryBg", colorMode)} color="white" flexShrink={0}>{item.evidenceType}</Badge>
                          </HStack>

                          <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                            {item.description}
                          </Text>

                          <VStack align="start" spacing={2} w="full">
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color={textSecondary}>Activity:</Text>
                              <Text fontSize="xs" fontWeight="medium" color={textPrimary}>
                                {activities.find((a: any) => a.id === item.rdActivityId)?.activityName || 'Unassigned'}
                              </Text>
                            </HStack>

                            {item.source && (
                              <HStack justify="space-between" w="full">
                                <Text fontSize="xs" color={textSecondary}>Source:</Text>
                                <Text fontSize="xs" fontWeight="medium" color={textPrimary}>
                                  {item.source}
                                </Text>
                              </HStack>
                            )}

                            {item.participants && (
                              <HStack justify="space-between" w="full">
                                <Text fontSize="xs" color={textSecondary}>People:</Text>
                                <Text fontSize="xs" noOfLines={1} color={textPrimary}>{item.participants}</Text>
                              </HStack>
                            )}
                          </VStack>

                          <Divider borderColor={cardBorder} />

                          <HStack spacing={2} w="full">
                            <Button 
                              size="xs" 
                              leftIcon={<ViewIcon />} 
                              flex={1}
                              onClick={() => navigate(`/researchanddesign/evidence/${item.id}?project=${id}`)}
                            >
                              View
                            </Button>
                            <Button size="xs" leftIcon={<DownloadIcon />} variant="outline">
                              Download
                            </Button>
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="xs"
                              variant="outline"
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              size="xs"
                              variant="outline"
                              borderColor="red.500"
                              color="red.500"
                              _hover={{ bg: "red.50" }}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              </VStack>
            </TabPanel>

            {/* Time Tracking Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="lg" color={textPrimary}>Time Entries</Heading>
                  <Button
                    leftIcon={<TimeIcon />}
                    bg={getColor("primary", colorMode)}
                    color="white"
                    _hover={{ bg: getColor("primaryHover", colorMode) }}
                    onClick={() => navigate(`/researchanddesign/timesheet?project=${id}`)}
                  >
                    Log Time
                  </Button>
                </HStack>

                <Card bg={cardGradientBg} borderColor={cardBorder}>
                  <CardBody p={0}>
                    <Table variant="simple">
                      <Thead bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder}>
                        <Tr>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Date</Th>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Description</Th>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Type</Th>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Hours</Th>
                          <Th color={textSecondary} borderColor={cardBorder} fontSize="md">Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {timeEntries.map((entry: any) => (
                          <Tr key={entry.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                            <Td borderColor={cardBorder} fontSize="md" color={textPrimary}>{entry.date}</Td>
                            <Td borderColor={cardBorder} fontSize="md" color={textPrimary}>{entry.description}</Td>
                            <Td borderColor={cardBorder}>
                              <Text fontSize="md" color={textPrimary}>
                                {activities.find((a: any) => a.id === entry.rdActivityId)?.activityName || 'Unallocated'}
                              </Text>
                            </Td>
                            <Td borderColor={cardBorder}>
                              <Badge size="md" fontSize="sm">{entry.timeType}</Badge>
                            </Td>
                            <Td borderColor={cardBorder} fontSize="md" color={textPrimary}>{entry.hours}h</Td>
                            <Td borderColor={cardBorder}>
                              <Badge 
                                colorScheme={
                                  entry.status === 'approved' ? 'green' :
                                  entry.status === 'submitted' ? 'blue' : 'gray'
                                }
                                fontSize="sm"
                                size="md"
                              >
                                {entry.status}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Compliance Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Alert 
                  status="warning"
                  bg="rgba(245, 158, 11, 0.1)"
                  borderColor="rgba(245, 158, 11, 0.3)"
                  border="1px solid"
                >
                  <AlertIcon color={getColor("status.warning", colorMode)} />
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg" color={textPrimary}>Documentation Gaps Identified</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Some activities are missing required evidence or documentation.
                    </Text>
                  </Box>
                </Alert>

                <Card bg={cardGradientBg} borderColor={cardBorder}>
                  <CardHeader>
                    <Heading size="lg" color={textPrimary}>Compliance Checklist</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text fontSize="md" color={textPrimary}>Technical objective clearly defined</Text>
                      </HStack>
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text fontSize="md" color={textPrimary}>Technical uncertainty identified</Text>
                      </HStack>
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text fontSize="md" color={textPrimary}>Core activities documented</Text>
                      </HStack>
                      <HStack>
                        <WarningIcon color="orange.500" />
                        <Text fontSize="md" color={textPrimary}>Supporting activities need core linkage verification</Text>
                      </HStack>
                      <HStack>
                        <WarningIcon color="orange.500" />
                        <Text fontSize="md" color={textPrimary}>Missing trial records for experiments</Text>
                      </HStack>
                      <HStack>
                        <WarningIcon color="orange.500" />
                        <Text fontSize="md" color={textPrimary}>Need quantitative outcome documentation</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Button
                  bg={getColor("primary", colorMode)}
                  color="white"
                  _hover={{ bg: getColor("primaryHover", colorMode) }}
                  onClick={() => navigate(`/researchanddesign/gaps?project=${id}`)}
                >
                  View Detailed Gap Analysis
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignProjectDetail;