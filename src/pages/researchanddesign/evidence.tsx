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
  Select,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Badge,
  IconButton,
  useToast,
  useColorModeValue,
  useColorMode,
  Text,
  Divider,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  ArrowBackIcon,
  AddIcon,
  AttachmentIcon,
  ViewIcon,
  DownloadIcon,
  DeleteIcon,
  EditIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { FaMicrophone } from 'react-icons/fa';

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
      activityType
      rdProjectId
    }
  }
`;

const GET_RD_EVIDENCE = gql`
  query GetRDEvidence($projectId: String, $activityId: String) {
    getRDEvidence(projectId: $projectId, activityId: $activityId) {
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

const DELETE_RD_EVIDENCE = gql`
  mutation DeleteRDEvidence($id: String!) {
    deleteRDEvidence(id: $id)
  }
`;

const ResearchAndDesignEvidence: React.FC = () => {
  usePageTitle("R&D Evidence");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real data from GraphQL
  const { data: evidenceData, loading: evidenceLoading, refetch: refetchEvidence } = useQuery(GET_RD_EVIDENCE, {
    variables: { projectId: projectId || undefined },
    // Don't skip - fetch all evidence when no project is selected
  });

  // Delete mutation
  const [deleteRDEvidence] = useMutation(DELETE_RD_EVIDENCE);

  // Delete handler
  const handleDelete = async (evidenceId: string, evidenceTitle: string) => {
    console.log('=== FRONTEND DELETE DEBUG ===');
    console.log('Delete button clicked for evidence:', { evidenceId, evidenceTitle });
    
    if (window.confirm(`Are you sure you want to delete "${evidenceTitle}"? This action cannot be undone.`)) {
      console.log('User confirmed deletion, proceeding...');
      
      try {
        console.log('Calling deleteRDEvidence mutation with ID:', evidenceId);
        
        const result = await deleteRDEvidence({
          variables: { id: evidenceId }
        });
        
        console.log('Delete mutation result:', result);
        
        toast({
          title: 'Evidence deleted',
          description: `"${evidenceTitle}" has been removed from the project`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        console.log('Refetching evidence list...');
        // Refetch the evidence list to update the UI
        refetchEvidence();
      } catch (error: any) {
        console.error('❌ Frontend delete error:', error);
        console.error('Error details:', {
          message: error.message,
          networkError: error.networkError,
          graphQLErrors: error.graphQLErrors
        });
        
        toast({
          title: 'Delete failed',
          description: error.message || 'Could not delete evidence. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.log('User cancelled deletion');
    }
  };

  // Get data from queries
  const evidence = evidenceData?.getRDEvidence || [];

  const evidenceTypes = [
    { value: 'document', label: 'Document', icon: '📄', description: 'PDFs, Word docs, spreadsheets' },
    { value: 'screenshot', label: 'Screenshot', icon: '📸', description: 'Screen captures, UI mockups' },
    { value: 'photo', label: 'Photo', icon: '📷', description: 'Physical photos, whiteboard sessions' },
    { value: 'audio', label: 'Audio Recording', icon: '🎤', description: 'Audio recordings, meetings' },
    { value: 'meeting', label: 'Meeting Audio', icon: '🏢', description: 'Meeting recordings with transcription' },
    { value: 'meeting-notes', label: 'Upload Meeting Notes from Audio', icon: '📝', description: 'Upload audio and auto-generate meeting notes' },
    { value: 'code', label: 'Code', icon: '💻', description: 'Source code, scripts, configs' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email communications' },
    { value: 'chat', label: 'Chat', icon: '💬', description: 'Chat logs, messaging' },
    { value: 'other', label: 'Other', icon: '📎', description: 'Other file types' },
  ];


  const getEvidenceIcon = (type: string) => {
    const evidenceType = evidenceTypes.find(et => et.value === type);
    return evidenceType ? evidenceType.icon : '📎';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'preliminary': return 'purple';
      case 'hypothesis_design': return 'blue';
      case 'experiments_trials': return 'orange';
      case 'analysis': return 'green';
      case 'outcome': return 'teal';
      default: return 'gray';
    }
  };


  const filteredEvidence = evidence.filter((item: any) => {
    const title = item.title || '';
    const description = item.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.evidenceType === filterType;
    const matchesProject = !projectId || item.rdProjectId === projectId;
    return matchesSearch && matchesType && matchesProject;
  });


  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box 
        p={{ base: 4, md: 6, lg: 8 }} 
        maxW="1400px" 
        mx="auto" 
        flex="1"
        w="100%"
      >
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate('/researchanddesign')}
          >
            Back to Dashboard
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <HStack 
            justify="space-between" 
            align={{ base: "stretch", md: "center" }}
            flexDirection={{ base: "column", lg: "row" }}
            gap={{ base: 4, lg: 0 }}
          >
            <VStack align="start" spacing={2}>
              <Heading size={{ base: "lg", md: "xl" }} color={textPrimary}>
                📎 R&D Evidence Management
              </Heading>
              <Text color={textSecondary} fontSize={{ base: "md", md: "lg" }}>
                Upload and manage documentation, screenshots, and other evidence
              </Text>
            </VStack>
            
            <HStack 
              spacing={3} 
              flexWrap={{ base: "wrap", sm: "nowrap" }}
              w={{ base: "100%", lg: "auto" }}
              justify={{ base: "stretch", lg: "flex-end" }}
            >
              <Button
                leftIcon={<FaMicrophone />}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                onClick={() => navigate(`/researchanddesign/record-audio${projectId ? `?project=${projectId}` : ''}`)}
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, sm: "initial" }}
              >
                Record Audio
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
                onClick={() => navigate(`/researchanddesign/evidence/upload${projectId ? `?project=${projectId}` : ''}`)}
                boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, sm: "initial" }}
              >
                Upload Evidence
              </Button>
            </HStack>
          </HStack>

          {/* Filters */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                <FormControl>
                  <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Search Evidence</FormLabel>
                  <Input
                    placeholder="Search by title or description..."
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
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Filter by Type</FormLabel>
                  <Select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
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
                    <option value="all" style={{ backgroundColor: '#1a1a1a' }}>All Types</option>
                    {evidenceTypes.map(type => (
                      <option key={type.value} value={type.value} style={{ backgroundColor: '#1a1a1a' }}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Project Filter</FormLabel>
                  <Text fontSize="md" color={textSecondary}>
                    {projectId ? 'Project Evidence' : 'All Projects'}
                  </Text>
                </FormControl>
              </Grid>
            </CardBody>
          </Card>

          {/* Evidence Type Guide */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>Evidence Types Guide</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
                {evidenceTypes.map(type => (
                  <HStack 
                    key={type.value} 
                    spacing={3} 
                    p={4} 
                    borderRadius="md" 
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Text fontSize="2xl">{type.icon}</Text>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="md" color={textPrimary}>{type.label}</Text>
                      <Text fontSize="sm" color={textSecondary}>{type.description}</Text>
                    </VStack>
                  </HStack>
                ))}
              </Grid>
            </CardBody>
          </Card>

          {/* Evidence Gallery */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <HStack justify="space-between">
                <Heading size="lg" color={textPrimary}>Evidence Items ({filteredEvidence.length})</Heading>
                <Text fontSize="md" color={textSecondary}>
                  Total: {evidence.length} items
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              {evidenceLoading ? (
                <Center py={10}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color={textPrimary} />
                    <Text color={textSecondary}>Loading evidence...</Text>
                  </VStack>
                </Center>
              ) : filteredEvidence.length === 0 ? (
                <Center py={10}>
                  <VStack spacing={4}>
                    <Text fontSize="lg" color={textSecondary}>
                      {searchTerm || filterType !== 'all' 
                        ? 'No evidence matches your search criteria'
                        : projectId ? 'No evidence uploaded for this project yet' : 'Select a project to view evidence'
                      }
                    </Text>
                    {projectId && (
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
                        onClick={() => navigate(`/researchanddesign/evidence/upload${projectId ? `?project=${projectId}` : ''}`)}
                        boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        Upload First Evidence
                      </Button>
                    )}
                  </VStack>
                </Center>
              ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                  {filteredEvidence.map((item: any) => (
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
                              <Text fontSize="2xl" flexShrink={0}>{getEvidenceIcon(item.evidenceType)}</Text>
                              <VStack align="start" spacing={0} minW="0">
                                <Text fontWeight="semibold" fontSize="md" color={textPrimary} noOfLines={1}>
                                  {item.title}
                                </Text>
                                <Text fontSize="sm" color={textSecondary}>
                                  {item.captureDate ? new Date(item.captureDate).toLocaleDateString() : 'No date'}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge 
                              bg={getColor("badges.blue.bg", colorMode)}
                              color={getColor("badges.blue.color", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.blue.border", colorMode)}
                            >
                              {item.evidenceType}
                            </Badge>
                          </HStack>

                          <Text fontSize="md" color={textSecondary} noOfLines={2}>
                            {item.description}
                          </Text>

                          <VStack align="start" spacing={2} w="full">
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color={textMuted}>Project:</Text>
                              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                                {item.rdProjectId || 'No Project'}
                              </Text>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color={textMuted}>Activity:</Text>
                              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                                {item.rdActivityId || 'Unassigned'}
                              </Text>
                            </HStack>

                            {item.source && (
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" color={textMuted}>Source:</Text>
                                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                                  {item.source}
                                </Text>
                              </HStack>
                            )}

                            {item.participants && (
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" color={textMuted}>People:</Text>
                                <Text fontSize="sm" noOfLines={1} color={textPrimary}>{item.participants}</Text>
                              </HStack>
                            )}
                          </VStack>

                          <Divider borderColor={cardBorder} />

                          <HStack spacing={2} w="full" flexWrap={{ base: "wrap", sm: "nowrap" }}>
                            <Button 
                              size="sm" 
                              leftIcon={<ViewIcon />} 
                              flex={1}
                              bg="rgba(59, 130, 246, 0.2)"
                              color="#3B82F6"
                              border="1px solid"
                              borderColor="rgba(59, 130, 246, 0.3)"
                              _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                              onClick={() => navigate(`/researchanddesign/evidence/${item.id}${projectId ? `?project=${projectId}` : ''}`)}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              leftIcon={<DownloadIcon />}
                              bg={getColor("badges.green.bg", colorMode)}
                              color={getColor("badges.green.color", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.green.border", colorMode)}
                              _hover={{ bg: "rgba(34, 197, 94, 0.3)" }}
                            >
                              Download
                            </Button>
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="sm"
                              bg={getColor("badges.orange.bg", colorMode)}
                              color={getColor("badges.orange.color", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.orange.border", colorMode)}
                              _hover={{ bg: "rgba(251, 146, 60, 0.3)" }}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              size="sm"
                              bg={getColor("badges.yellow.bg", colorMode)}
                              color={getColor("status.error", colorMode)}
                              border="1px solid"
                              borderColor={getColor("badges.yellow.border", colorMode)}
                              _hover={{ bg: "rgba(239, 68, 68, 0.3)" }}
                              onClick={() => handleDelete(item.id, item.title)}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              )}
            </CardBody>
          </Card>
        </VStack>

      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignEvidence;