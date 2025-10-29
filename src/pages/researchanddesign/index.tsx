import React from 'react';
import {
  Box,
  Button,
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  useColorMode,
  Icon,
  Divider,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  AddIcon, 
  TimeIcon, 
  AttachmentIcon, 
  WarningIcon,
  CheckCircleIcon,
  ViewIcon,
  ExternalLinkIcon 
} from '@chakra-ui/icons';
import { FaMicrophone } from 'react-icons/fa';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getBrandValue, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

// Helper function to get relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
};

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
  query GetRDActivities {
    getRDActivities {
      id
      activityName
      rdProjectId
      activityType
      documentationStage
    }
  }
`;

const GET_RD_TIME_ENTRIES = gql`
  query GetRDTimeEntries {
    getRDTimeEntries {
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
  query GetRDEvidence {
    getRDEvidence {
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

const ResearchAndDesignDashboard: React.FC = () => {
  usePageTitle("R&D Dashboard");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  // GraphQL queries
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });
  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_RD_ACTIVITIES, {
    errorPolicy: 'all'
  });
  const { data: timeEntriesData, loading: timeEntriesLoading } = useQuery(GET_RD_TIME_ENTRIES, {
    errorPolicy: 'all'
  });
  const { data: evidenceData, loading: evidenceLoading } = useQuery(GET_RD_EVIDENCE, {
    errorPolicy: 'all'
  });

  // Extract data from queries
  const projects = projectsData?.getRDProjects || [];
  const activities = activitiesData?.getRDActivities || [];
  const timeEntries = timeEntriesData?.getRDTimeEntries || [];
  const evidence = evidenceData?.getRDEvidence || [];

  // Calculate statistics from real data
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => 
    p.status === 'in-progress' || p.status === 'active'
  ).length;
  
  const totalHours = timeEntries.reduce((sum: number, entry: any) => 
    sum + (parseFloat(entry.hours) || 0), 0
  );
  
  // Estimate R&D value based on hours (rough calculation)
  const estimatedValue = Math.round(totalHours * 150); // $150/hour estimate
  
  // Calculate documentation progress
  const activitiesWithEvidence = activities.filter((activity: any) =>
    evidence.some((ev: any) => ev.rdActivityId === activity.id)
  ).length;
  const totalActivities = activities.length;
  const missingEvidence = Math.max(0, totalActivities - activitiesWithEvidence);
  
  // Get recent projects (sorted by updatedAt)
  const recentProjects = [...projects]
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map((project: any) => {
      const projectHours = timeEntries
        .filter((entry: any) => entry.rdProjectId === project.id)
        .reduce((sum: number, entry: any) => sum + (parseFloat(entry.hours) || 0), 0);
      
      const lastActivity = project.updatedAt 
        ? getRelativeTime(new Date(project.updatedAt))
        : 'No recent activity';
      
      return {
        id: project.id,
        name: project.projectName,
        status: project.status || 'active',
        stage: 'active', // Default since we don't have stage data in project
        hours: projectHours,
        lastActivity
      };
    });

  const stats = {
    totalProjects,
    activeProjects,
    totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    estimatedValue,
    completedStages: activitiesWithEvidence,
    missingEvidence
  };

  // Show loading state
  const isLoading = projectsLoading || activitiesLoading || timeEntriesLoading || evidenceLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'blue';
      case 'documenting': return 'orange';
      case 'potential': return 'gray';
      case 'submitted': return 'purple';
      case 'approved': return 'green';
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

  if (isLoading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} flex="1">
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color={getColor("accentBlue", colorMode)} />
              <Text color={textSecondary} fontSize="lg">Loading R&D Dashboard...</Text>
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
      <Box p={{ base: 4, md: 6, lg: 8 }} flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack 
          justify="space-between" 
          mb={6}
          flexDirection={{ base: "column", xl: "row" }}
          align={{ base: "stretch", xl: "center" }}
          gap={{ base: 4, xl: 0 }}
        >
          <VStack align="start" spacing={1}>
            <Heading size={{ base: "xl", md: "2xl" }} color={textPrimary}>
              🔬 Research & Development
            </Heading>
            <Text color={textSecondary} fontSize={{ base: "md", md: "lg" }}>
              Track and document R&D activities for tax incentives
            </Text>
          </VStack>
          
          <HStack 
            spacing={{ base: 2, md: 3 }}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            w={{ base: "100%", xl: "auto" }}
            justify={{ base: "stretch", xl: "flex-end" }}
          >
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
              onClick={() => navigate('/researchanddesign/timesheet')}
              size={{ base: "sm", md: "md", lg: "lg" }}
              fontSize={{ base: "sm", md: "md" }}
              flex={{ base: 1, md: "initial" }}
              minW={{ base: "auto", md: "auto" }}
            >
              Log Time
            </Button>
            <Button
              leftIcon={<ExternalLinkIcon />}
              variant="outline"
              borderColor={cardBorder}
              color={textPrimary}
              bg="rgba(0, 0, 0, 0.2)"
              _hover={{
                borderColor: textSecondary,
                bg: "rgba(255, 255, 255, 0.05)"
              }}
              onClick={() => window.open('/researchanddesign/docs', '_blank')}
              size={{ base: "sm", md: "md", lg: "lg" }}
              fontSize={{ base: "sm", md: "md" }}
              flex={{ base: 1, md: "initial" }}
              minW={{ base: "auto", md: "auto" }}
              display={{ base: "none", sm: "flex" }}
            >
              RDTI Guide
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
              onClick={() => navigate('/researchanddesign/evidence')}
              size={{ base: "sm", md: "md", lg: "lg" }}
              fontSize={{ base: "sm", md: "md" }}
              flex={{ base: 1, md: "initial" }}
              minW={{ base: "auto", md: "auto" }}
              display={{ base: "none", sm: "flex" }}
            >
              Upload Evidence
            </Button>
            <Button
              leftIcon={<Icon as={FaMicrophone} />}
              variant="outline"
              borderColor={cardBorder}
              color={textPrimary}
              bg="rgba(0, 0, 0, 0.2)"
              _hover={{
                borderColor: textSecondary,
                bg: "rgba(255, 255, 255, 0.05)"
              }}
              onClick={() => navigate('/researchanddesign/transcribe')}
              size={{ base: "sm", md: "md", lg: "lg" }}
              fontSize={{ base: "sm", md: "md" }}
              flex={{ base: 1, md: "initial" }}
              minW={{ base: "auto", md: "auto" }}
              display={{ base: "none", sm: "flex" }}
            >
              Transcribe
            </Button>
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
              onClick={() => navigate('/researchanddesign/projects/new')}
              boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
              size={{ base: "sm", md: "md", lg: "lg" }}
              fontSize={{ base: "sm", md: "md" }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              flex={{ base: 1, sm: "initial" }}
              minW={{ base: "auto", md: "auto" }}
            >
              New R&D Project
            </Button>
          </HStack>
        </HStack>

        {/* Alerts */}
        {stats.missingEvidence > 0 && (
          <Alert 
            status="warning" 
            mb={6} 
            borderRadius="md"
            bg="rgba(251, 146, 60, 0.1)"
            borderColor="rgba(251, 146, 60, 0.3)"
            borderWidth="1px"
          >
            <AlertIcon color={getColor("badges.orange.color", colorMode)} />
            <Box>
              <AlertTitle color={textPrimary} fontSize="lg">Documentation Required!</AlertTitle>
              <AlertDescription color={textSecondary} fontSize="md">
                You have {stats.missingEvidence} activities missing evidence documentation.{' '}
                <Button
                  variant="link"
                  color={getColor("badges.orange.color", colorMode)}
                  onClick={() => navigate('/researchanddesign/gaps')}
                >
                  View Gap Analysis
                </Button>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Total R&D Projects</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{stats.totalProjects}</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">{stats.activeProjects} active</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Total Hours Logged</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{stats.totalHours}h</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Across all projects</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Estimated R&D Value</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">
                    ${stats.estimatedValue.toLocaleString()}
                  </StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Tax incentive estimate</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Documentation Progress</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">
                    {(stats.completedStages + stats.missingEvidence) > 0 
                      ? Math.round((stats.completedStages / (stats.completedStages + stats.missingEvidence)) * 100)
                      : 0}%
                  </StatNumber>
                  <Progress 
                    value={(stats.completedStages + stats.missingEvidence) > 0 
                      ? (stats.completedStages / (stats.completedStages + stats.missingEvidence)) * 100
                      : 0}
                    colorScheme="green"
                    size="sm"
                    mt={2}
                    bg="rgba(0, 0, 0, 0.2)"
                  />
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Recent Projects */}
        <Card 
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
        >
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="lg" color={textPrimary}>
                Recent Projects
              </Heading>
                <Button 
                variant="link" 
                color={getColor("badges.blue.color", colorMode)}
                onClick={() => navigate('/researchanddesign/projects')}
              >
                View All Projects
              </Button>
            </HStack>
            
            <VStack spacing={4} align="stretch">
              {recentProjects.map((project: any) => (
                <Box key={project.id}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Text 
                          fontWeight="semibold" 
                          color={textPrimary}
                          fontSize="lg"
                          cursor="pointer"
                          onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          {project.name}
                        </Text>
                        <Badge 
                          bg={`rgba(${getStatusColor(project.status) === 'blue' ? '59, 130, 246' : getStatusColor(project.status) === 'orange' ? '251, 146, 60' : getStatusColor(project.status) === 'green' ? '34, 197, 94' : getStatusColor(project.status) === 'purple' ? '168, 85, 247' : '107, 114, 128'}, 0.2)`}
                          color={getStatusColor(project.status) === 'blue' ? '#3B82F6' : getStatusColor(project.status) === 'orange' ? '#FB923C' : getStatusColor(project.status) === 'green' ? '#22C55E' : getStatusColor(project.status) === 'purple' ? '#A855F7' : '#6B7280'}
                          border="1px solid"
                          borderColor={`rgba(${getStatusColor(project.status) === 'blue' ? '59, 130, 246' : getStatusColor(project.status) === 'orange' ? '251, 146, 60' : getStatusColor(project.status) === 'green' ? '34, 197, 94' : getStatusColor(project.status) === 'purple' ? '168, 85, 247' : '107, 114, 128'}, 0.3)`}
                          fontSize="sm"
                        >
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </HStack>
                      <Text fontSize="md" color={textSecondary}>
                        Stage: {getStageLabel(project.stage)} • {project.hours}h logged
                      </Text>
                    </VStack>
                    
                    <VStack align="end" spacing={1}>
                      <Text fontSize="md" color={textSecondary}>
                        {project.lastActivity}
                      </Text>
                <Button
                        size="sm"
                        variant="outline"
                        borderColor={cardBorder}
                        color={textPrimary}
                        bg="rgba(0, 0, 0, 0.2)"
                        fontSize="sm"
                        _hover={{
                          borderColor: textSecondary,
                          bg: "rgba(255, 255, 255, 0.05)"
                        }}
                        onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                    </VStack>
                  </HStack>
                  
                  {project !== recentProjects[recentProjects.length - 1] && (
                    <Divider mt={4} borderColor={cardBorder} />
                  )}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} mt={8}>
          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              cursor="pointer"
              onClick={() => navigate('/researchanddesign/gaps')}
              _hover={{ 
                borderColor: textSecondary,
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)"
              }}
              transition="all 0.3s"
            >
              <CardBody>
                       <HStack>
                   <Icon as={WarningIcon} color={getColor("badges.orange.color", colorMode)} boxSize={6} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold" color={textPrimary} fontSize="lg">
                      Gap Analysis
                    </Text>
                    <Text fontSize="md" color={textSecondary}>
                      Identify missing documentation and improve compliance
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              cursor="pointer"
              onClick={() => navigate('/researchanddesign/reports')}
              _hover={{ 
                borderColor: textSecondary,
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)"
              }}
              transition="all 0.3s"
            >
              <CardBody>
                <HStack>
                  <Icon as={CheckCircleIcon} color={getColor("badges.green.color", colorMode)} boxSize={6} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold" color={textPrimary} fontSize="lg">
                      Generate Reports
                    </Text>
                    <Text fontSize="md" color={textSecondary}>
                      Create submission packages and compliance reports
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignDashboard;