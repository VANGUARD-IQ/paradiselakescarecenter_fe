import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Center,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  ArrowBackIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  TimeIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

// Type definitions
interface Project {
  id: string;
  name: string;
  code: string;
}

interface Activity {
  id: string;
  name: string;
  projectId: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  activityId: string;
  date: string;
  hours: number;
  description: string;
  timeType: string;
  status: string;
  isUnallocated: boolean;
}

// GraphQL mutations for AI improvement
const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

// GraphQL mutation for creating time entries
const CREATE_RD_TIME_ENTRY = gql`
  mutation CreateRDTimeEntry($input: RDTimeEntryInput!) {
    createRDTimeEntry(input: $input) {
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

// GraphQL mutation for updating time entries
const UPDATE_RD_TIME_ENTRY = gql`
  mutation UpdateRDTimeEntry($id: String!, $input: RDTimeEntryInput!) {
    updateRDTimeEntry(id: $id, input: $input) {
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

// GraphQL mutation for deleting time entries
const DELETE_RD_TIME_ENTRY = gql`
  mutation DeleteRDTimeEntry($id: String!) {
    deleteRDTimeEntry(id: $id)
  }
`;

// GraphQL queries
const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
      status
      projectType
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

const ResearchAndDesignTimesheet: React.FC = () => {
  const { colorMode } = useColorMode();
  usePageTitle("R&D Timesheet");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  // GraphQL hooks
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId);
  
  const { data: activitiesData, refetch: refetchActivities } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: selectedProjectId },
    skip: !selectedProjectId,
    errorPolicy: 'all'
  });

  const { data: timeEntriesData, loading: timeEntriesLoading } = useQuery(GET_RD_TIME_ENTRIES, {
    variables: { projectId },
    errorPolicy: 'all'
  });

  const [newEntry, setNewEntry] = useState({
    projectId: projectId || '',
    activityId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 1,
    description: '',
    timeType: 'development',
    isUnallocated: false,
  });
  
  // Update selectedProjectId when newEntry.projectId changes (for initial load)
  React.useEffect(() => {
    if (newEntry.projectId && newEntry.projectId !== selectedProjectId) {
      setSelectedProjectId(newEntry.projectId);
    }
  }, [newEntry.projectId]);

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  // AI improvement state
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  
  // AI improvement mutation
  const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);
  
  // Time entry mutations
  const [createRDTimeEntry] = useMutation(CREATE_RD_TIME_ENTRY, {
    refetchQueries: ['GetRDTimeEntries'],
    awaitRefetchQueries: true,
  });
  
  const [updateRDTimeEntry] = useMutation(UPDATE_RD_TIME_ENTRY, {
    refetchQueries: ['GetRDTimeEntries'],
    awaitRefetchQueries: true,
  });
  
  const [deleteRDTimeEntry] = useMutation(DELETE_RD_TIME_ENTRY, {
    refetchQueries: ['GetRDTimeEntries'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: 'Time entry deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Transform GraphQL data
  const projects: Project[] = (projectsData?.getRDProjects || []).map((project: any): Project => ({
    id: project.id,
    name: project.projectName,
    code: project.projectCode || ''
  }));

  const activities: Activity[] = (activitiesData?.getRDActivities || []).map((activity: any): Activity => ({
    id: activity.id,
    name: activity.activityName,
    projectId: activity.rdProjectId
  }));

  const timeEntries: TimeEntry[] = (timeEntriesData?.getRDTimeEntries || []).map((entry: any): TimeEntry => ({
    id: entry.id,
    projectId: entry.rdProjectId || '',
    activityId: entry.rdActivityId || '',
    date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : '',
    hours: entry.hours || 0,
    description: entry.description || '',
    timeType: entry.timeType || 'development',
    status: entry.status || 'draft',
    isUnallocated: entry.isUnallocated || false
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'submitted': return 'blue';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const getTimeTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'purple';
      case 'development': return 'blue';
      case 'testing': return 'orange';
      case 'documentation': return 'teal';
      case 'meeting': return 'pink';
      default: return 'gray';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: Project) => p.id === projectId);
    return project ? `${project.name} (${project.code})` : 'Unallocated';
  };

  const getActivityName = (activityId: string) => {
    const activity = activities.find((a: Activity) => a.id === activityId);
    return activity ? activity.name : 'Unallocated';
  };

  const getFilteredActivities = (): Activity[] => {
    if (!newEntry.projectId) return [];
    // Use selectedProjectId to ensure we're filtering with the latest selection
    return activities.filter((a: Activity) => a.projectId === newEntry.projectId);
  };

  // Helper function to clean AI responses
  const cleanAIResponse = (text: string): string => {
    let cleaned = text.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    const patterns = [
      /^Here is the improved [^:]*:\s*/i,
      /^Improved [^:]*:\s*/i,
      /^The improved [^:]*:\s*/i
    ];
    
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    return cleaned.trim();
  };

  // AI improvement handler
  const handleImproveDescription = async () => {
    const value = newEntry.description;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter a description first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingDescription(true);
    try {
      const selectedProject = projects.find(p => p.id === newEntry.projectId);
      const selectedActivity = activities.find(a => a.id === newEntry.activityId);
      
      const context = `Please improve this R&D time entry description to be more professional and suitable for R&D tax incentive documentation. Focus on making it clear what specific R&D work was performed, what technical challenges were addressed, or what experiments/research activities took place. Keep the core work details but make it more suitable for official R&D documentation. Context: Project - "${selectedProject?.name || 'R&D Project'}", Activity - "${selectedActivity?.name || 'General R&D work'}", Time Type - "${newEntry.timeType}". Return ONLY the improved description without any preamble, explanation, or quotes. Original description: "${value}"`;
      
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      
      if (data?.improveDescription) {
        setNewEntry({...newEntry, description: cleanAIResponse(data.improveDescription)});
        toast({
          title: "✨ Description improved!",
          description: "Claude has enhanced your time entry description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving description:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve description. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingDescription(false);
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    onEditOpen();
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;
    
    try {
      console.log('Updating time entry:', editingEntry);
      
      // Prepare the input for GraphQL mutation
      const input = {
        rdProjectId: editingEntry.isUnallocated ? undefined : (editingEntry.projectId || undefined),
        rdActivityId: editingEntry.isUnallocated ? undefined : (editingEntry.activityId || undefined),
        date: new Date(editingEntry.date),
        hours: editingEntry.hours,
        description: editingEntry.description || undefined,
        timeType: editingEntry.timeType,
        isUnallocated: editingEntry.isUnallocated,
      };

      // Remove undefined values to avoid GraphQL issues
      Object.keys(input).forEach(key => {
        if (input[key as keyof typeof input] === undefined) {
          delete input[key as keyof typeof input];
        }
      });

      console.log('GraphQL update input:', input);

      const { data } = await updateRDTimeEntry({
        variables: { id: editingEntry.id, input }
      });

      console.log('Time entry updated:', data);
      
      toast({
        title: 'Time Entry Updated',
        description: `${editingEntry.hours} hours updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setEditingEntry(null);
      onEditClose();
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error updating time entry',
        description: error instanceof Error ? error.message : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this time entry? This action cannot be undone.')) {
      try {
        console.log('Deleting time entry:', entryId);
        await deleteRDTimeEntry({
          variables: { id: entryId }
        });
        console.log('Time entry deleted successfully');
      } catch (error) {
        console.error('Error deleting time entry:', error);
      }
    }
  };

  const handleCreateEntry = async () => {
    try {
      console.log('Creating time entry:', newEntry);
      
      // Prepare the input for GraphQL mutation
      const input = {
        rdProjectId: newEntry.isUnallocated ? undefined : (newEntry.projectId || undefined),
        rdActivityId: newEntry.isUnallocated ? undefined : (newEntry.activityId || undefined),
        date: new Date(newEntry.date),
        hours: newEntry.hours,
        description: newEntry.description || undefined,
        timeType: newEntry.timeType,
        isUnallocated: newEntry.isUnallocated,
      };

      // Remove undefined values to avoid GraphQL issues
      Object.keys(input).forEach(key => {
        if (input[key as keyof typeof input] === undefined) {
          delete input[key as keyof typeof input];
        }
      });

      console.log('GraphQL input:', input);

      const { data } = await createRDTimeEntry({
        variables: { input }
      });

      console.log('Time entry created:', data);
      
      toast({
        title: 'Time Entry Created',
        description: `${newEntry.hours} hours logged successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setNewEntry({
        projectId: projectId || '',
        activityId: '',
        date: new Date().toISOString().split('T')[0],
        hours: 1,
        description: '',
        timeType: 'development',
        isUnallocated: false,
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error creating time entry',
        description: error instanceof Error ? error.message : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmitEntries = async () => {
    if (selectedEntries.length === 0) {
      toast({
        title: 'No entries selected',
        description: 'Please select entries to submit.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // TODO: Implement bulk submit mutation
      toast({
        title: 'Entries Submitted',
        description: `${selectedEntries.length} entries submitted for review.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setSelectedEntries([]);
    } catch (error) {
      toast({
        title: 'Error submitting entries',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const totalHours = timeEntries.reduce((sum: number, entry: TimeEntry) => sum + entry.hours, 0);
  const totalThisWeek = timeEntries
    .filter((entry: TimeEntry) => new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum: number, entry: TimeEntry) => sum + entry.hours, 0);
  const pendingApproval = timeEntries.filter((entry: TimeEntry) => entry.status === 'submitted').length;

  // Handle loading state
  if (projectsLoading || timeEntriesLoading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box p={8} flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color={getColor("accentBlue", colorMode)} />
              <Text color={textSecondary} fontSize="lg">Loading timesheet...</Text>
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
            size="lg"
            fontSize="md"
          >
            Back to Dashboard
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }} gap={4}>
            <VStack align="start" spacing={1} flex="1">
              <Heading size={{ base: "xl", md: "2xl" }} color={textPrimary}>
                ⏱️ R&D Time Tracking
              </Heading>
              <Text color={textSecondary} fontSize={{ base: "md", md: "lg" }}>
                Log and manage your R&D time entries
                {projectId && projects.length > 0 && (
                  <>
                    {' • '}
                    <Text as="span" fontWeight="medium" color={getColor("accentBlue", colorMode)}>
                      {projects.find((p: Project) => p.id === projectId)?.name || 'Unknown Project'}
                    </Text>
                  </>
                )}
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                size={{ base: "md", lg: "lg" }}
                fontSize="md"
                display={{ base: "none", sm: "flex" }}
              >
                Export
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
                onClick={onOpen}
                boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                size={{ base: "md", lg: "lg" }}
                fontSize="md"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Log Time
              </Button>
            </HStack>
          </HStack>

          {/* Quick Stats */}
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(auto-fit, minmax(250px, 1fr))" }} gap={{ base: 4, md: 6 }} mb={8}>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary} fontSize="md">Total Hours</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{totalHours.toFixed(1)}h</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">All time entries</StatHelpText>
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
                  <StatLabel color={textSecondary} fontSize="md">This Week</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{totalThisWeek.toFixed(1)}h</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Last 7 days</StatHelpText>
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
                  <StatLabel color={textSecondary} fontSize="md">Pending Approval</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{pendingApproval}</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Entries submitted</StatHelpText>
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
                  <StatLabel color={textSecondary} fontSize="md">Unallocated</StatLabel>
                  <StatNumber color={textPrimary} fontSize="3xl">{timeEntries.filter((e: TimeEntry) => e.isUnallocated).length}</StatNumber>
                  <StatHelpText color={textMuted} fontSize="sm">Need allocation</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Unallocated Time Alert */}
          {timeEntries.some((e: TimeEntry) => e.isUnallocated) && (
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
                <Text fontWeight="semibold" color={textPrimary}>Unallocated Time Found</Text>
                <Text fontSize="sm" color={textSecondary}>
                  You have {timeEntries.filter((e: TimeEntry) => e.isUnallocated).length} unallocated time entries that need to be assigned to specific projects.
                </Text>
              </Box>
            </Alert>
          )}

          {/* Time Entries Table */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader>
              <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={2}>
                <Heading size="md" color={textPrimary}>Time Entries</Heading>
                <HStack spacing={2}>
                  {selectedEntries.length > 0 && (
                    <Button
                      size="sm"
                      bg={getColor("accentBlue", colorMode)}
                      color="white"
                      _hover={{ bg: getColor("components.button.whiteHover", colorMode) }}
                      onClick={handleSubmitEntries}
                    >
                      Submit Selected ({selectedEntries.length})
                    </Button>
                  )}
                  <Tabs size="sm" variant="enclosed" display={{ base: "none", md: "block" }}>
                    <TabList>
                      <Tab color={textSecondary} _selected={{ color: textPrimary, bg: "rgba(255,255,255,0.1)" }}>Daily</Tab>
                      <Tab color={textSecondary} _selected={{ color: textPrimary, bg: "rgba(255,255,255,0.1)" }}>Weekly</Tab>
                      <Tab color={textSecondary} _selected={{ color: textPrimary, bg: "rgba(255,255,255,0.1)" }}>Monthly</Tab>
                    </TabList>
                  </Tabs>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody p={0}>
              <Box overflowX="auto" bg="rgba(0, 0, 0, 0.3)" borderBottomRadius="md" minH="200px">
                <Table variant="simple">
                  <Thead bg="rgba(0, 0, 0, 0.2)">
                    <Tr>
                      <Th borderColor={cardBorder}>
                        <Checkbox
                          isChecked={selectedEntries.length === timeEntries.length}
                          isIndeterminate={selectedEntries.length > 0 && selectedEntries.length < timeEntries.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries(timeEntries.map((entry: TimeEntry) => entry.id));
                            } else {
                              setSelectedEntries([]);
                            }
                          }}
                        />
                      </Th>
                      <Th color={textSecondary} borderColor={cardBorder}>Date</Th>
                      <Th color={textSecondary} borderColor={cardBorder}>Project</Th>
                      <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>Activity</Th>
                      <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>Description</Th>
                      <Th color={textSecondary} borderColor={cardBorder}>Type</Th>
                      <Th color={textSecondary} borderColor={cardBorder}>Hours</Th>
                      <Th color={textSecondary} borderColor={cardBorder} display={{ base: "none", sm: "table-cell" }}>Status</Th>
                      <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {timeEntries.map((entry: TimeEntry) => (
                      <Tr key={entry.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                        <Td borderColor={cardBorder}>
                          <Checkbox
                            isChecked={selectedEntries.includes(entry.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEntries([...selectedEntries, entry.id]);
                              } else {
                                setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                              }
                            }}
                          />
                        </Td>
                        <Td color={textPrimary} borderColor={cardBorder}>{entry.date}</Td>
                        <Td borderColor={cardBorder}>
                          {entry.isUnallocated ? (
                            <Badge colorScheme="orange">Unallocated</Badge>
                          ) : (
                            <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                              {getProjectName(entry.projectId)}
                            </Text>
                          )}
                        </Td>
                        <Td borderColor={cardBorder} display={{ base: "none", md: "table-cell" }}>
                          <Text fontSize="sm" color={textPrimary}>
                            {entry.isUnallocated ? '-' : getActivityName(entry.activityId)}
                          </Text>
                        </Td>
                        <Td borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }}>
                          <Text fontSize="sm" maxW="200px" isTruncated color={textPrimary}>
                            {entry.description}
                          </Text>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <Badge colorScheme={getTimeTypeColor(entry.timeType)} size="sm">
                            {entry.timeType}
                          </Badge>
                        </Td>
                        <Td fontWeight="medium" color={textPrimary} borderColor={cardBorder}>{entry.hours}h</Td>
                        <Td borderColor={cardBorder} display={{ base: "none", sm: "table-cell" }}>
                          <Badge colorScheme={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit entry"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              color={textSecondary}
                              _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                              onClick={() => handleEditEntry(entry)}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<ChevronDownIcon />}
                                variant="ghost"
                                size="sm"
                                color={textSecondary}
                                _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                              />
                              <MenuList 
                                bg={getComponent("menu", "bg")}
                                backdropFilter="blur(20px)"
                                borderColor={getComponent("menu", "borderColor")}
                                border="1px solid"
                                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
                              >
                                <MenuItem 
                                  bg={getComponent("menu", "itemBg")}
                                  color={getComponent("menu", "itemColor")}
                                  _hover={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: getComponent("menu", "itemHoverColor") 
                                  }}
                                  _focus={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: getComponent("menu", "itemHoverColor") 
                                  }}
                                >
                                  Duplicate Entry
                                </MenuItem>
                                <MenuItem 
                                  bg={getComponent("menu", "itemBg")}
                                  color={getComponent("menu", "itemColor")}
                                  _hover={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: getComponent("menu", "itemHoverColor") 
                                  }}
                                  _focus={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: getComponent("menu", "itemHoverColor") 
                                  }}
                                >
                                  Allocate to Project
                                </MenuItem>
                                <MenuItem 
                                  bg={getComponent("menu", "itemBg")}
                                  color="red.400" 
                                  icon={<DeleteIcon />} 
                                  _hover={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: "red.300" 
                                  }}
                                  _focus={{ 
                                    bg: getComponent("menu", "itemHoverBg"), 
                                    color: "red.300" 
                                  }}
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  Delete Entry
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>

        {/* New Time Entry Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
          <ModalContent 
            bg="rgba(30, 30, 30, 0.98)"
            backdropFilter="blur(20px)"
            borderColor={cardBorder}
            border="1px solid"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
          >
            <ModalHeader color={textPrimary}>Log Time Entry</ModalHeader>
            <ModalCloseButton 
              color={textSecondary}
              _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}
            />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl>
                    <FormLabel color={textSecondary}>Date</FormLabel>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ borderColor: textSecondary }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textSecondary}>Hours</FormLabel>
                    <NumberInput
                      value={newEntry.hours}
                      onChange={(valueString) => setNewEntry({...newEntry, hours: parseFloat(valueString) || 0})}
                      min={0.25}
                      max={24}
                      step={0.25}
                    >
                      <NumberInputField 
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      />
                      <NumberInputStepper borderColor={cardBorder}>
                        <NumberIncrementStepper color={textSecondary} />
                        <NumberDecrementStepper color={textSecondary} />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Grid>

                <Checkbox
                  isChecked={newEntry.isUnallocated}
                  onChange={(e) => setNewEntry({...newEntry, isUnallocated: e.target.checked})}
                  color={textSecondary}
                >
                  Log as unallocated time (to be assigned later)
                </Checkbox>

                {!newEntry.isUnallocated && (
                  <>
                    <FormControl>
                      <FormLabel color={textSecondary}>Project</FormLabel>
                      <Select
                        value={newEntry.projectId}
                        onChange={(e) => {
                          const projectId = e.target.value;
                          setNewEntry({...newEntry, projectId: projectId, activityId: ''});
                          setSelectedProjectId(projectId);
                          if (projectId) {
                            refetchActivities();
                          }
                        }}
                        placeholder="Select project..."
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        {projects.map((project: Project) => (
                          <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                            {project.name} ({project.code})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Activity (optional)</FormLabel>
                      <Select
                        value={newEntry.activityId}
                        onChange={(e) => setNewEntry({...newEntry, activityId: e.target.value})}
                        placeholder="Select activity..."
                        isDisabled={!newEntry.projectId}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        {getFilteredActivities().map((activity: Activity) => (
                          <option key={activity.id} value={activity.id} style={{ backgroundColor: '#1a1a1a' }}>
                            {activity.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                <FormControl>
                  <FormLabel color={textSecondary}>Time Type</FormLabel>
                  <Select
                    value={newEntry.timeType}
                    onChange={(e) => setNewEntry({...newEntry, timeType: e.target.value})}
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <option value="research" style={{ backgroundColor: '#1a1a1a' }}>Research</option>
                    <option value="development" style={{ backgroundColor: '#1a1a1a' }}>Development</option>
                    <option value="testing" style={{ backgroundColor: '#1a1a1a' }}>Testing</option>
                    <option value="documentation" style={{ backgroundColor: '#1a1a1a' }}>Documentation</option>
                    <option value="meeting" style={{ backgroundColor: '#1a1a1a' }}>Meeting</option>
                    <option value="other" style={{ backgroundColor: '#1a1a1a' }}>Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" align="center" mb={2}>
                    <FormLabel mb={0} color={textSecondary}>Description</FormLabel>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={cardBorder}
                      bg="rgba(0, 0, 0, 0.2)"
                      color={textPrimary}
                      _hover={{ 
                        bg: "rgba(255, 255, 255, 0.05)",
                        borderColor: textSecondary
                      }}
                      isDisabled={!newEntry.description.trim()}
                      isLoading={isImprovingDescription}
                      onClick={handleImproveDescription}
                      leftIcon={<Text>✨</Text>}
                    >
                      AI Improve
                    </Button>
                  </HStack>
                  <Textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Describe what work was performed..."
                    rows={3}
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _placeholder={{ color: textMuted }}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button 
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                mr={3} 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
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
                onClick={handleCreateEntry}
                isDisabled={!newEntry.description || newEntry.hours <= 0}
                boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Log Time
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Time Entry Modal */}
        {editingEntry && (
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
            <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
            <ModalContent 
              bg="rgba(30, 30, 30, 0.98)"
              backdropFilter="blur(20px)"
              borderColor={cardBorder}
              border="1px solid"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
            >
              <ModalHeader color={textPrimary}>Edit Time Entry</ModalHeader>
              <ModalCloseButton 
                color={textSecondary}
                _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}
              />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl>
                      <FormLabel color={textSecondary}>Date</FormLabel>
                      <Input
                        type="date"
                        value={editingEntry.date}
                        onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Hours</FormLabel>
                      <NumberInput
                        value={editingEntry.hours}
                        onChange={(valueString) => setEditingEntry({...editingEntry, hours: parseFloat(valueString) || 0})}
                        min={0.25}
                        max={24}
                        step={0.25}
                      >
                        <NumberInputField 
                          bg="rgba(0, 0, 0, 0.2)"
                          border="1px"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: textSecondary,
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                          }}
                        />
                        <NumberInputStepper borderColor={cardBorder}>
                          <NumberIncrementStepper color={textSecondary} />
                          <NumberDecrementStepper color={textSecondary} />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Grid>

                  <Checkbox
                    isChecked={editingEntry.isUnallocated}
                    onChange={(e) => setEditingEntry({...editingEntry, isUnallocated: e.target.checked})}
                    color={textSecondary}
                  >
                    Log as unallocated time (to be assigned later)
                  </Checkbox>

                  {!editingEntry.isUnallocated && (
                    <>
                      <FormControl>
                        <FormLabel color={textSecondary}>Project</FormLabel>
                        <Select
                          value={editingEntry.projectId}
                          onChange={(e) => {
                            const projectId = e.target.value;
                            setEditingEntry({...editingEntry, projectId: projectId, activityId: ''});
                            setSelectedProjectId(projectId);
                            if (projectId) {
                              refetchActivities();
                            }
                          }}
                          placeholder="Select project..."
                          bg="rgba(0, 0, 0, 0.2)"
                          border="1px"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: textSecondary,
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {projects.map((project: Project) => (
                            <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                              {project.name} ({project.code})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color={textSecondary}>Activity (optional)</FormLabel>
                        <Select
                          value={editingEntry.activityId}
                          onChange={(e) => setEditingEntry({...editingEntry, activityId: e.target.value})}
                          placeholder="Select activity..."
                          isDisabled={!editingEntry.projectId}
                          bg="rgba(0, 0, 0, 0.2)"
                          border="1px"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: textSecondary,
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {activities.filter((a: Activity) => a.projectId === editingEntry.projectId).map((activity: Activity) => (
                            <option key={activity.id} value={activity.id} style={{ backgroundColor: '#1a1a1a' }}>
                              {activity.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  <FormControl>
                    <FormLabel color={textSecondary}>Time Type</FormLabel>
                    <Select
                      value={editingEntry.timeType}
                      onChange={(e) => setEditingEntry({...editingEntry, timeType: e.target.value})}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ borderColor: textSecondary }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <option value="research" style={{ backgroundColor: '#1a1a1a' }}>Research</option>
                      <option value="development" style={{ backgroundColor: '#1a1a1a' }}>Development</option>
                      <option value="testing" style={{ backgroundColor: '#1a1a1a' }}>Testing</option>
                      <option value="documentation" style={{ backgroundColor: '#1a1a1a' }}>Documentation</option>
                      <option value="meeting" style={{ backgroundColor: '#1a1a1a' }}>Meeting</option>
                      <option value="other" style={{ backgroundColor: '#1a1a1a' }}>Other</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textSecondary}>Description</FormLabel>
                    <Textarea
                      value={editingEntry.description}
                      onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})}
                      placeholder="Describe what work was performed..."
                      rows={3}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ borderColor: textSecondary }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      _placeholder={{ color: textMuted }}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button 
                  variant="outline"
                  borderColor={cardBorder}
                  color={textPrimary}
                  bg="rgba(0, 0, 0, 0.2)"
                  _hover={{
                    borderColor: textSecondary,
                    bg: "rgba(255, 255, 255, 0.05)"
                  }}
                  mr={3} 
                  onClick={onEditClose}
                >
                  Cancel
                </Button>
                <Button
                  bg={getColor("components.button.primaryBg", colorMode)}
                  color="white"
                  _hover={{ 
                    bg: getColor("components.button.primaryHover", colorMode),
                    transform: "translateY(-2px)"
                  }}
                  onClick={handleUpdateEntry}
                  isDisabled={!editingEntry.description || editingEntry.hours <= 0}
                >
                  Update Entry
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignTimesheet;