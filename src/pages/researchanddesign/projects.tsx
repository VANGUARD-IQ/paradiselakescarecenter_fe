import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Center,
  HStack,
  VStack,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Card,
  CardBody,
  Progress,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  AddIcon, 
  ChevronDownIcon, 
  SearchIcon,
  EditIcon,
  ViewIcon,
  DeleteIcon,
  TimeIcon,
  AttachmentIcon 
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

// GraphQL query to fetch R&D projects
const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
      status
      projectType
      technicalObjective
      hypothesis
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

// GraphQL mutation to delete an R&D project
const DELETE_RD_PROJECT = gql`
  mutation DeleteRDProject($id: String!) {
    deleteRDProject(id: $id)
  }
`;

const ResearchAndDesignProjectsList: React.FC = () => {
  usePageTitle("R&D Projects");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  // Fetch R&D projects from GraphQL API
  const { data, loading, error, refetch } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });

  // Delete mutation
  const [deleteRDProject] = useMutation(DELETE_RD_PROJECT);

  // Handle GraphQL errors
  if (error) {
    console.error('Error fetching R&D projects:', error);
    toast({
      title: 'Error loading projects',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  // Use only real projects from the database
  const projects = (data?.getRDProjects || []).map((project: any) => ({
    ...project,
    // Add calculated fields that might not be in the basic project data
    totalHours: project.totalHours || 0,
    activitiesCount: 0, // TODO: Add field resolver for activity count
    evidenceCount: 0,   // TODO: Add field resolver for evidence count
    lastActivity: 'Recently',
    completionPercentage: 25, // TODO: Calculate based on activities
    estimatedValue: project.estimatedValue || 0
  }));

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

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technicalObjective?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProject = async (id: string, projectName: string) => {
    console.log('=== FRONTEND DELETE PROJECT ===');
    console.log('Project ID:', id);
    console.log('Project Name:', projectName);
    
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      console.log('User confirmed deletion');
      setIsDeleting(true);
      
      try {
        console.log('Calling deleteRDProject mutation with ID:', id);
        
        const result = await deleteRDProject({
          variables: { id }
        });
        
        console.log('Mutation result:', result);
        console.log('Delete success:', result.data?.deleteRDProject);
        
        if (result.data?.deleteRDProject) {
          toast({
            title: 'Project deleted',
            description: `${projectName} has been deleted successfully.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          console.log('Refetching projects list...');
          // Refresh the projects list
          refetch();
        } else {
          console.error('Delete returned false, project may not exist or tenant mismatch');
          throw new Error('Failed to delete project - project not found or permission denied');
        }
      } catch (error: any) {
        console.error('❌ Error deleting project:', error);
        console.error('Error details:', {
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError
        });
        
        toast({
          title: 'Error deleting project',
          description: error.message || 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    } else {
      console.log('User cancelled deletion');
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={8} flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="2xl" color={textPrimary}>
              📊 R&D Projects
            </Heading>
            <Text color={textSecondary} fontSize="lg">
              Manage and track all Research & Development projects
            </Text>
          </VStack>
          
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
            size="md"
            fontWeight="semibold"
            boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            New R&D Project
          </Button>
        </HStack>

        {/* Filters and Search */}
        <Card 
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
          mb={6}
        >
          <CardBody>
            <Flex gap={4} align="end" wrap="wrap">
              <Box flex={1} minW="300px">
                <Text mb={2} fontSize="md" fontWeight="600" color={textPrimary}>
                  Search Projects
                </Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color={textSecondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name, code, or objective..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    size="lg"
                    fontSize="md"
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                </InputGroup>
              </Box>
              
              <Box minW="200px">
                <Text mb={2} fontSize="md" fontWeight="600" color={textPrimary}>
                  Filter by Status
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  size="lg"
                  fontSize="md"
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: textSecondary,
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <option value="all" style={{ backgroundColor: '#1a1a1a' }}>All Statuses</option>
                  <option value="potential" style={{ backgroundColor: '#1a1a1a' }}>Potential</option>
                  <option value="eligible" style={{ backgroundColor: '#1a1a1a' }}>Eligible</option>
                  <option value="in-progress" style={{ backgroundColor: '#1a1a1a' }}>In Progress</option>
                  <option value="documenting" style={{ backgroundColor: '#1a1a1a' }}>Documenting</option>
                  <option value="submitted" style={{ backgroundColor: '#1a1a1a' }}>Submitted</option>
                  <option value="approved" style={{ backgroundColor: '#1a1a1a' }}>Approved</option>
                  <option value="rejected" style={{ backgroundColor: '#1a1a1a' }}>Rejected</option>
                </Select>
              </Box>

              <Button
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Projects Table */}
        <Card 
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
        >
          <CardBody p={0}>
            {loading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={textPrimary} />
                  <Text color={textSecondary}>Loading projects...</Text>
                </VStack>
              </Center>
            ) : filteredProjects.length === 0 ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Text fontSize="lg" color={textSecondary}>
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No projects match your search criteria'
                      : 'No R&D projects found'
                    }
                  </Text>
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
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Create Your First Project
                  </Button>
                </VStack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder}>
                    <Tr>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Project Details</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Status</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Progress</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Hours</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Value</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Last Activity</Th>
                      <Th fontSize="md" color={textSecondary} borderColor={cardBorder}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProjects.map((project: any) => (
                      <Tr key={project.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                        <Td borderColor={cardBorder}>
                          <VStack align="start" spacing={1}>
                            <Text 
                              fontWeight="semibold" 
                              fontSize="lg"
                              color={textPrimary}
                              cursor="pointer"
                              onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {project.projectName}
                            </Text>
                            <Text fontSize="md" color={textSecondary}>
                              {project.projectCode}
                            </Text>
                            <Text fontSize="md" color={textMuted}>
                              {project.technicalObjective?.substring(0, 60)}...
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                          <Badge 
                            bg={`rgba(${getStatusColor(project.status) === 'blue' ? '59, 130, 246' : getStatusColor(project.status) === 'green' ? '34, 197, 94' : getStatusColor(project.status) === 'orange' ? '251, 146, 60' : getStatusColor(project.status) === 'red' ? '239, 68, 68' : getStatusColor(project.status) === 'purple' ? '168, 85, 247' : '156, 163, 175'}, 0.2)`}
                            color={getStatusColor(project.status) === 'blue' ? '#3B82F6' : getStatusColor(project.status) === 'green' ? '#22C55E' : getStatusColor(project.status) === 'orange' ? '#FB923C' : getStatusColor(project.status) === 'red' ? '#EF4444' : getStatusColor(project.status) === 'purple' ? '#A855F7' : '#9CA3AF'}
                            border="1px solid"
                            borderColor={`rgba(${getStatusColor(project.status) === 'blue' ? '59, 130, 246' : getStatusColor(project.status) === 'green' ? '34, 197, 94' : getStatusColor(project.status) === 'orange' ? '251, 146, 60' : getStatusColor(project.status) === 'red' ? '239, 68, 68' : getStatusColor(project.status) === 'purple' ? '168, 85, 247' : '156, 163, 175'}, 0.3)`}
                          >
                            {getStatusLabel(project.status)}
                          </Badge>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="600" color={textPrimary}>
                              {project.completionPercentage}%
                            </Text>
                            <Progress 
                              value={project.completionPercentage} 
                              size="sm" 
                              colorScheme="green"
                              w="80px"
                              bg="rgba(0, 0, 0, 0.2)"
                            />
                            <Text fontSize="md" color={textSecondary}>
                              {project.activitiesCount} activities
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="md" color={textPrimary}>
                              {project.totalHours}h
                            </Text>
                            <Text fontSize="sm" color={textSecondary}>
                              {project.evidenceCount} evidence items
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                  <Text fontWeight="medium" fontSize="md" color={getColor("badges.green.color", colorMode)}>
                            ${(project.estimatedValue || 0).toLocaleString()}
                          </Text>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                          <Text fontSize="sm" color={textSecondary}>
                            {project.lastActivity}
                          </Text>
                        </Td>
                        
                        <Td borderColor={cardBorder}>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="View project"
                              icon={<ViewIcon />}
                              size="sm"
                            bg={getColor("badges.blue.bg", colorMode)}
                            color={getColor("badges.blue.color", colorMode)}
                            border="1px solid"
                            borderColor={getColor("badges.blue.border", colorMode)}
                              _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                              onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                            />
                            <IconButton
                              aria-label="Log time"
                              icon={<TimeIcon />}
                              size="sm"
                              bg={getColor("badges.purple.bg", colorMode)}
                              color={getColor("badges.purple.color", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.purple.border", colorMode)}
                              _hover={{ bg: "rgba(168, 85, 247, 0.3)" }}
                              onClick={() => navigate(`/researchanddesign/timesheet?project=${project.id}`)}
                            />
                            <IconButton
                              aria-label="Upload evidence"
                              icon={<AttachmentIcon />}
                              size="sm"
                              bg={getColor("badges.green.bg", colorMode)}
                              color={getColor("badges.green.color", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.green.border", colorMode)}
                              _hover={{ bg: "rgba(34, 197, 94, 0.3)" }}
                              onClick={() => navigate(`/researchanddesign/evidence?project=${project.id}`)}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<ChevronDownIcon />}
                                size="sm"
                                bg={getColor("badges.gray.bg", colorMode)}
                                color={getColor("badges.gray.color", colorMode)}
                                border="1px solid"
                                borderColor={getColor("badges.gray.border", colorMode)}
                                _hover={{ bg: "rgba(156, 163, 175, 0.3)" }}
                              />
                              <MenuList 
                                bg={getComponent("menu", "bg")}
                                backdropFilter="blur(20px)"
                                borderColor={getComponent("menu", "borderColor")}
                                border="1px solid"
                                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
                              >
                                <MenuItem 
                                  icon={<EditIcon />}
                                  onClick={() => navigate(`/researchanddesign/projects/${project.id}/edit`)}
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
                                  Edit Project
                                </MenuItem>
                                <MenuItem 
                                  icon={<DeleteIcon />}
                                  onClick={() => handleDeleteProject(project.id, project.projectName)}
                                  bg={getComponent("menu", "itemBg")}
                                  color="#EF4444"
                                  _hover={{ 
                                    bg: "rgba(239, 68, 68, 0.2)", 
                                    color: "#EF4444" 
                                  }}
                                  _focus={{ 
                                    bg: "rgba(239, 68, 68, 0.2)", 
                                    color: "#EF4444" 
                                  }}
                                >
                                  Delete Project
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
            )}
          </CardBody>
        </Card>

        {/* Summary Stats */}
        <HStack spacing={6} mt={6} justify="center">
          <VStack 
            p={4}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            border="1px"
            borderColor={cardBorder}
          >
            <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
              {filteredProjects.length}
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              Projects Found
            </Text>
          </VStack>
          <VStack 
            p={4}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            border="1px"
            borderColor={cardBorder}
          >
            <Text fontSize="2xl" fontWeight="bold" color="#A855F7">
              {filteredProjects.reduce((sum: number, p: any) => sum + (p.totalHours || 0), 0).toFixed(1)}h
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              Total Hours
            </Text>
          </VStack>
          <VStack 
            p={4}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            border="1px"
            borderColor={cardBorder}
          >
            <Text fontSize="2xl" fontWeight="bold" color="#22C55E">
              ${filteredProjects.reduce((sum: number, p: any) => sum + (p.estimatedValue || 0), 0).toLocaleString()}
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              Total Value
            </Text>
          </VStack>
        </HStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignProjectsList;