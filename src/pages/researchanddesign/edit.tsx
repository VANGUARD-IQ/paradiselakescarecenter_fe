import React, { useState, useEffect } from 'react';
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
  Text,
  useToast,
  useColorModeValue,
  useColorMode,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Collapse,
  useBoolean,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon, CheckIcon, InfoIcon, ViewIcon, EditIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { MarkdownRenderer } from './components/MarkdownRenderer';

// GraphQL query to fetch project details
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

// GraphQL mutation to update project
const UPDATE_RD_PROJECT = gql`
  mutation UpdateRDProject($id: String!, $input: RDProjectInput!) {
    updateRDProject(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

// GraphQL mutations for AI improvement
const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const ResearchAndDesignProjectEdit: React.FC = () => {
  usePageTitle("Edit R&D Project");
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

  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    status: 'potential',
    projectType: 'undetermined',
    executiveSummary: '',
    technicalObjective: '',
    hypothesis: '',
    systematicExperimentationApproach: '',
    variables: '',
    successCriteria: '',
    technicalUncertainty: '',
    industryKnowledge: '',
    knowledgeLimitations: '',
    startDate: '',
    endDate: '',
    financialYear: '2025-26',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownGuide, setShowMarkdownGuide] = useBoolean(false);

  // AI improvement state
  const [isImprovingExecutiveSummary, setIsImprovingExecutiveSummary] = useState(false);
  const [isImprovingTechnicalObjective, setIsImprovingTechnicalObjective] = useState(false);
  const [isImprovingTechnicalUncertainty, setIsImprovingTechnicalUncertainty] = useState(false);
  const [isImprovingIndustryKnowledge, setIsImprovingIndustryKnowledge] = useState(false);
  const [isImprovingHypothesis, setIsImprovingHypothesis] = useState(false);
  const [isImprovingSuccessCriteria, setIsImprovingSuccessCriteria] = useState(false);
  const [isImprovingKnowledgeLimitations, setIsImprovingKnowledgeLimitations] = useState(false);

  // Modal state for AI context
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [contextModalData, setContextModalData] = useState({ field: '', context: '' });

  // Fetch project data
  const { data, loading, error } = useQuery(GET_RD_PROJECT, {
    variables: { id: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Update mutation
  const [updateRDProject] = useMutation(UPDATE_RD_PROJECT);
  const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);

  // Populate form data when project is loaded
  useEffect(() => {
    if (data?.getRDProject) {
      const project = data.getRDProject;
      setFormData({
        projectName: project.projectName || '',
        projectCode: project.projectCode || '',
        status: project.status || 'potential',
        projectType: project.projectType || 'undetermined',
        executiveSummary: project.executiveSummary || '',
        technicalObjective: project.technicalObjective || '',
        hypothesis: project.hypothesis || '',
        systematicExperimentationApproach: project.systematicExperimentationApproach || '',
        variables: project.variables || '',
        successCriteria: project.successCriteria || '',
        technicalUncertainty: project.technicalUncertainty || '',
        industryKnowledge: project.industryKnowledge || '',
        knowledgeLimitations: project.knowledgeLimitations || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        financialYear: project.financialYear || '2025-26',
      });
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Function to show AI context in modal
  const showContext = (field: string, value: string, contextDescription: string) => {
    const context = `${contextDescription} Return ONLY the improved text without any preamble, explanation, or quotes. Original text: "${value}"`;
    setContextModalData({ field, context });
    onOpen();
  };

  // AI improvement handlers
  const handleImproveExecutiveSummary = async () => {
    const value = formData.executiveSummary;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter an executive summary first",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setIsImprovingExecutiveSummary(true);
    try {
      const context = `Please improve this executive summary to be clear, concise, and suitable for high-level stakeholders. Focus on the business value and strategic importance of this R&D project. Return ONLY the improved text without any preamble, explanation, or quotes. Original summary: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('executiveSummary', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Executive summary improved!",
          description: "Claude has enhanced your executive summary",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving executive summary:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve executive summary. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingExecutiveSummary(false);
    }
  };

  const handleImproveTechnicalObjective = async () => {
    const value = formData.technicalObjective;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter a technical objective first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingTechnicalObjective(true);
    try {
      const context = `Please improve the clarity and professional tone of this R&D technical objective while keeping all specific technical details and goals exactly the same. Focus on making it more precise and professionally written for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original objective: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('technicalObjective', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Technical objective improved!",
          description: "Claude has enhanced your technical objective",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving technical objective:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve technical objective. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingTechnicalObjective(false);
    }
  };

  const handleImproveTechnicalUncertainty = async () => {
    const value = formData.technicalUncertainty;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter technical uncertainty first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingTechnicalUncertainty(true);
    try {
      const context = `Please improve the clarity and professional tone of this R&D technical uncertainty description while keeping all specific technical challenges and unknowns exactly the same. Focus on making it clear why this is uncertain and requires experimentation, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original uncertainty: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('technicalUncertainty', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Technical uncertainty improved!",
          description: "Claude has enhanced your technical uncertainty description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving technical uncertainty:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve technical uncertainty. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingTechnicalUncertainty(false);
    }
  };

  const handleImproveIndustryKnowledge = async () => {
    const value = formData.industryKnowledge;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter industry knowledge first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingIndustryKnowledge(true);
    try {
      const context = `Please improve the clarity and professional tone of this R&D industry knowledge description while keeping all specific details about existing solutions and their limitations exactly the same. Focus on making it clear what is already known in the industry and why it's insufficient, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original industry knowledge: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('industryKnowledge', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Industry knowledge improved!",
          description: "Claude has enhanced your industry knowledge description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving industry knowledge:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve industry knowledge. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingIndustryKnowledge(false);
    }
  };

  const handleImproveHypothesis = async () => {
    const value = formData.hypothesis;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter a hypothesis first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingHypothesis(true);
    try {
      const context = `Please improve the clarity and professional tone of this R&D hypothesis while keeping the core technical approach and reasoning exactly the same. Focus on making it more scientifically precise and suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original hypothesis: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('hypothesis', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Hypothesis improved!",
          description: "Claude has enhanced your hypothesis",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving hypothesis:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve hypothesis. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingHypothesis(false);
    }
  };

  const handleImproveSuccessCriteria = async () => {
    const value = formData.successCriteria;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter success criteria first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingSuccessCriteria(true);
    try {
      const context = `Please improve the clarity and professional tone of these R&D success criteria while keeping all specific metrics, targets, and measurements exactly the same. Focus on making them more precise and measurable, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original success criteria: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('successCriteria', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Success criteria improved!",
          description: "Claude has enhanced your success criteria",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving success criteria:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve success criteria. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingSuccessCriteria(false);
    }
  };

  const handleImproveKnowledgeLimitations = async () => {
    const value = formData.knowledgeLimitations;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter knowledge limitations first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingKnowledgeLimitations(true);
    try {
      const context = `Please improve the clarity and professional tone of this R&D knowledge limitations description while keeping all specific limitations and gaps exactly the same. Focus on making it clear what knowledge gaps exist and why they require R&D to resolve, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original knowledge limitations: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('knowledgeLimitations', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Knowledge limitations improved!",
          description: "Claude has enhanced your knowledge limitations description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving knowledge limitations:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve knowledge limitations. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingKnowledgeLimitations(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const input = {
        projectName: formData.projectName,
        projectCode: formData.projectCode || undefined,
        status: formData.status,
        projectType: formData.projectType,
        executiveSummary: formData.executiveSummary || undefined,
        technicalObjective: formData.technicalObjective || undefined,
        hypothesis: formData.hypothesis || undefined,
        systematicExperimentationApproach: formData.systematicExperimentationApproach || undefined,
        variables: formData.variables || undefined,
        successCriteria: formData.successCriteria || undefined,
        technicalUncertainty: formData.technicalUncertainty || undefined,
        industryKnowledge: formData.industryKnowledge || undefined,
        knowledgeLimitations: formData.knowledgeLimitations || undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        financialYear: formData.financialYear,
      };

      // Remove undefined values
      Object.keys(input).forEach(key => {
        if (input[key as keyof typeof input] === undefined) {
          delete input[key as keyof typeof input];
        }
      });

      await updateRDProject({
        variables: { id: id!, input }
      });

      toast({
        title: 'Project Updated',
        description: `${formData.projectName} has been updated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate(`/researchanddesign/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error updating project',
        description: error instanceof Error ? error.message : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <>
        <NavbarWithCallToAction />
        <Center p={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color={getColor("primary", colorMode)} />
            <Text color={textSecondary}>Loading project data...</Text>
          </VStack>
        </Center>
        <FooterWithFourColumns />
      </>
    );
  }

  // Handle error state
  if (error) {
    console.error('Error fetching project:', error);
    return (
      <>
        <NavbarWithCallToAction />
        <Box p={8}>
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error Loading Project</AlertTitle>
              <AlertDescription>
                {error.message || 'Failed to fetch project data. Please try again.'}
              </AlertDescription>
            </Box>
          </Alert>
          <Button 
            mt={4} 
            onClick={() => navigate('/researchanddesign/projects')}
            colorScheme="blue"
          >
            Back to Projects
          </Button>
        </Box>
        <FooterWithFourColumns />
      </>
    );
  }

  // Handle no data
  if (!data?.getRDProject) {
    return (
      <>
        <NavbarWithCallToAction />
        <Box p={8}>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Project Not Found</AlertTitle>
              <AlertDescription>
                The project you're looking for doesn't exist or you don't have permission to view it.
              </AlertDescription>
            </Box>
          </Alert>
          <Button 
            mt={4} 
            onClick={() => navigate('/researchanddesign/projects')}
            colorScheme="blue"
          >
            Back to Projects
          </Button>
        </Box>
        <FooterWithFourColumns />
      </>
    );
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1200px" mx="auto" flex="1" w="100%">
        {/* Header */}
        <HStack mb={{ base: 4, md: 6, lg: 8 }}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate(`/researchanddesign/projects/${id}`)}
          >
            Back to Project
          </Button>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            <Heading size={{ base: "xl", md: "2xl" }} color={textPrimary}>
              Edit R&D Project
            </Heading>

            {/* Basic Details */}
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Basic Details</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel color={textPrimary} fontSize="md">Project Name</FormLabel>
                    <Input
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="Enter project name"
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
                    <FormLabel color={textPrimary} fontSize="md">Project Code</FormLabel>
                    <Input
                      value={formData.projectCode}
                      onChange={(e) => handleInputChange('projectCode', e.target.value)}
                      placeholder="Internal reference code (optional)"
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

                  <HStack spacing={4} flexDirection={{ base: "column", md: "row" }} alignItems="stretch">
                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Status</FormLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
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
                        <option value="potential" style={{ backgroundColor: '#1a1a1a' }}>Potential</option>
                        <option value="eligible" style={{ backgroundColor: '#1a1a1a' }}>Eligible</option>
                        <option value="in-progress" style={{ backgroundColor: '#1a1a1a' }}>In Progress</option>
                        <option value="documenting" style={{ backgroundColor: '#1a1a1a' }}>Documenting</option>
                        <option value="submitted" style={{ backgroundColor: '#1a1a1a' }}>Submitted</option>
                        <option value="approved" style={{ backgroundColor: '#1a1a1a' }}>Approved</option>
                        <option value="rejected" style={{ backgroundColor: '#1a1a1a' }}>Rejected</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Project Type</FormLabel>
                      <Select
                        value={formData.projectType}
                        onChange={(e) => handleInputChange('projectType', e.target.value)}
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
                        <option value="undetermined" style={{ backgroundColor: '#1a1a1a' }}>Undetermined</option>
                        <option value="core" style={{ backgroundColor: '#1a1a1a' }}>Core</option>
                        <option value="supporting" style={{ backgroundColor: '#1a1a1a' }}>Supporting</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} flexDirection={{ base: "column", md: "row" }} alignItems="stretch">
                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Start Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        size="lg"
                        fontSize="md"
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
                      <FormLabel color={textPrimary} fontSize="md">End Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        size="lg"
                        fontSize="md"
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
                      <FormLabel color={textPrimary} fontSize="md">Financial Year</FormLabel>
                      <Select
                        value={formData.financialYear}
                        onChange={(e) => handleInputChange('financialYear', e.target.value)}
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
                        <option value="2023-24" style={{ backgroundColor: '#1a1a1a' }}>2023-24</option>
                        <option value="2024-25" style={{ backgroundColor: '#1a1a1a' }}>2024-25</option>
                        <option value="2025-26" style={{ backgroundColor: '#1a1a1a' }}>2025-26</option>
                      </Select>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Markdown Guide */}
            <Card
              bg="rgba(139, 92, 246, 0.05)"
              borderColor="rgba(139, 92, 246, 0.3)"
              borderWidth="1px"
            >
              <CardHeader 
                py={3} 
                cursor="pointer" 
                onClick={setShowMarkdownGuide.toggle}
                _hover={{ bg: "rgba(139, 92, 246, 0.1)" }}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold" color="purple.400">
                      ✨ Markdown Formatting Guide
                    </Text>
                    <Badge colorScheme="purple">All fields support markdown</Badge>
                  </HStack>
                  <IconButton
                    aria-label="Toggle markdown guide"
                    icon={showMarkdownGuide ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    size="sm"
                    variant="ghost"
                    color="purple.400"
                  />
                </HStack>
              </CardHeader>
              <Collapse in={showMarkdownGuide}>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Text Formatting</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code>**Bold text**</Code>
                          <Code>*Italic text*</Code>
                          <Code>***Bold & italic***</Code>
                          <Code>~~Strikethrough~~</Code>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Lists</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code>- Bullet item</Code>
                          <Code>* Also bullet</Code>
                          <Code>1. Numbered item</Code>
                          <Code>   - Nested item</Code>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Headers</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code># Main Title</Code>
                          <Code>## Section</Code>
                          <Code>### Subsection</Code>
                          <Code>#### Small Header</Code>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Links & Code</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code>[Link text](url)</Code>
                          <Code>`inline code`</Code>
                          <Code>```code block```</Code>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Blockquotes</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code>&gt; Quote text</Code>
                          <Code>&gt; Multiple lines</Code>
                          <Code>---</Code>
                          <Text fontSize="xs">(horizontal rule)</Text>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={textPrimary} mb={2}>Tables</Text>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <Code>| Col 1 | Col 2 |</Code>
                          <Code>|-------|-------|</Code>
                          <Code>| Data  | Data  |</Code>
                        </VStack>
                      </Box>
                    </SimpleGrid>
                    
                    <Alert status="success" variant="subtle" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Tip: Use markdown to create well-structured R&D documentation that's easy to read and professional
                      </Text>
                    </Alert>
                  </VStack>
                </CardBody>
              </Collapse>
            </Card>

            {/* Technical Details */}
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Hypothesis & Technical Uncertainty</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Executive Summary</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Executive Summary',
                              formData.executiveSummary,
                              'Please improve this executive summary to be clear, concise, and suitable for high-level stakeholders. Focus on the business value and strategic importance of this R&D project.'
                            )}
                            isDisabled={!formData.executiveSummary.trim()}
                          />
                        </Tooltip>
                        <Button
                          size="sm"
                          variant="outline"
                          bg={getColor("primary", colorMode)}
                          color="white"
                          borderColor={getColor("primary", colorMode)}
                          _hover={{ 
                            bg: getColor("primaryHover", colorMode),
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                          }}
                          isDisabled={!formData.executiveSummary.trim()}
                          isLoading={isImprovingExecutiveSummary}
                          onClick={handleImproveExecutiveSummary}
                          leftIcon={<Text>✨</Text>}
                        >
                          AI Improve
                        </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.executiveSummary}
                      onChange={(e) => handleInputChange('executiveSummary', e.target.value)}
                      placeholder="Provide a high-level overview of the project and its strategic goals"
                      rows={4}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _placeholder={{ color: textMuted }}
                      _hover={{ borderColor: getColor("primaryHover", colorMode) }}
                      _focus={{ borderColor: getColor("primary", colorMode), boxShadow: "0 0 0 1px " + getColor("primary", colorMode) }}
                      transition="all 0.3s"
                    />
                  </FormControl>
                  <FormControl>
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Technical Objective</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Technical Objective',
                              formData.technicalObjective,
                              'Please improve the clarity and professional tone of this R&D technical objective while keeping the core technical goals exactly the same. Focus on making it more precise and suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.technicalObjective.trim()}
                          />
                        </Tooltip>
                        <Button
                          size="sm"
                          variant="outline"
                          bg={getColor("primary", colorMode)}
                          color="white"
                          borderColor={getColor("primary", colorMode)}
                          _hover={{ 
                            bg: getColor("primaryHover", colorMode),
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                          }}
                          isDisabled={!formData.technicalObjective.trim()}
                          isLoading={isImprovingTechnicalObjective}
                          onClick={handleImproveTechnicalObjective}
                          leftIcon={<Text>✨</Text>}
                        >
                          AI Improve
                        </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.technicalObjective}
                      onChange={(e) => handleInputChange('technicalObjective', e.target.value)}
                      placeholder="What are you trying to achieve technically?"
                      rows={4}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Hypothesis</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Hypothesis',
                              formData.hypothesis,
                              'Please improve the clarity and professional tone of this R&D hypothesis while keeping the core technical approach and reasoning exactly the same. Focus on making it more scientifically precise and suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.hypothesis.trim()}
                          />
                        </Tooltip>
                        <Button
                        size="sm"
                        variant="outline"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        borderColor={getColor("primary", colorMode)}
                        _hover={{ 
                          bg: getColor("primaryHover", colorMode),
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                        }}
                        isDisabled={!formData.hypothesis.trim()}
                        isLoading={isImprovingHypothesis}
                        onClick={handleImproveHypothesis}
                        leftIcon={<Text>✨</Text>}
                      >
                        AI Improve
                      </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.hypothesis}
                      onChange={(e) => handleInputChange('hypothesis', e.target.value)}
                      placeholder="What do you think will work and why?"
                      rows={3}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                    <FormLabel color={textPrimary} fontSize="md">Systematic Experimentation Approach</FormLabel>
                    <Textarea
                      value={formData.systematicExperimentationApproach}
                      onChange={(e) => handleInputChange('systematicExperimentationApproach', e.target.value)}
                      placeholder="Describe your systematic approach to experimentation. How will you methodically test different variables to resolve the technical uncertainty? What specific experiments will you conduct?"
                      rows={4}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Technical Uncertainty</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Technical Uncertainty',
                              formData.technicalUncertainty,
                              'Please improve the clarity and professional tone of this R&D technical uncertainty description while keeping all specific technical challenges and unknowns exactly the same. Focus on clearly articulating why this cannot be resolved through routine engineering or standard practice, suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.technicalUncertainty.trim()}
                          />
                        </Tooltip>
                        <Button
                        size="sm"
                        variant="outline"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        borderColor={getColor("primary", colorMode)}
                        _hover={{ 
                          bg: getColor("primaryHover", colorMode),
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                        }}
                        isDisabled={!formData.technicalUncertainty.trim()}
                        isLoading={isImprovingTechnicalUncertainty}
                        onClick={handleImproveTechnicalUncertainty}
                        leftIcon={<Text>✨</Text>}
                      >
                        AI Improve
                      </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.technicalUncertainty}
                      onChange={(e) => handleInputChange('technicalUncertainty', e.target.value)}
                      placeholder="What is unknown or uncertain that requires experimentation?"
                      rows={5}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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

                </VStack>
              </CardBody>
            </Card>

            {/* Industry Knowledge & Limitations */}
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
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Existing Industry Knowledge</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Industry Knowledge',
                              formData.industryKnowledge,
                              'Please improve the clarity and professional tone of this R&D industry knowledge description while keeping all specific references to existing solutions, competitors, and industry practices exactly the same. Focus on clearly articulating what is already known in the industry and why it is insufficient, suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.industryKnowledge.trim()}
                          />
                        </Tooltip>
                        <Button
                        size="sm"
                        variant="outline"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        borderColor={getColor("primary", colorMode)}
                        _hover={{ 
                          bg: getColor("primaryHover", colorMode),
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                        }}
                        isDisabled={!formData.industryKnowledge.trim()}
                        isLoading={isImprovingIndustryKnowledge}
                        onClick={handleImproveIndustryKnowledge}
                        leftIcon={<Text>✨</Text>}
                      >
                        AI Improve
                      </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.industryKnowledge}
                      onChange={(e) => handleInputChange('industryKnowledge', e.target.value)}
                      placeholder="What existing knowledge or solutions are available?"
                      rows={5}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Knowledge Limitations</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Knowledge Limitations',
                              formData.knowledgeLimitations,
                              'Please improve the clarity and professional tone of this R&D knowledge limitations description while keeping all specific limitations and gaps exactly the same. Focus on making it clear what knowledge gaps exist and why they require R&D to resolve, suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.knowledgeLimitations.trim()}
                          />
                        </Tooltip>
                        <Button
                        size="sm"
                        variant="outline"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        borderColor={getColor("primary", colorMode)}
                        _hover={{ 
                          bg: getColor("primaryHover", colorMode),
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                        }}
                        isDisabled={!formData.knowledgeLimitations.trim()}
                        isLoading={isImprovingKnowledgeLimitations}
                        onClick={handleImproveKnowledgeLimitations}
                        leftIcon={<Text>✨</Text>}
                      >
                        AI Improve
                      </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.knowledgeLimitations}
                      onChange={(e) => handleInputChange('knowledgeLimitations', e.target.value)}
                      placeholder="What are the current limitations of existing solutions or knowledge?"
                      rows={5}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                </VStack>
              </CardBody>
            </Card>

            {/* Systematic Experimentation Approach */}
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Systematic Experimentation Approach</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel color={textPrimary} fontSize="md">Variables to Test</FormLabel>
                    <Textarea
                      value={formData.variables}
                      onChange={(e) => handleInputChange('variables', e.target.value)}
                      placeholder="What specific variables will you systematically test? e.g., algorithm parameters, material properties, design configurations, process conditions"
                      rows={3}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                    <HStack justify="space-between" align="center" mb={2}>
                      <FormLabel mb={0} color={textPrimary} fontSize="md">Success Criteria</FormLabel>
                      <HStack spacing={2}>
                        <Tooltip label="View AI context" placement="top">
                          <IconButton
                            aria-label="View context"
                            icon={<InfoIcon />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => showContext(
                              'Success Criteria',
                              formData.successCriteria,
                              'Please improve the clarity and professional tone of these R&D success criteria while keeping all specific metrics, targets, and measurements exactly the same. Focus on making them more precise and measurable, suitable for R&D tax incentive documentation.'
                            )}
                            isDisabled={!formData.successCriteria.trim()}
                          />
                        </Tooltip>
                        <Button
                        size="sm"
                        variant="outline"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        borderColor={getColor("primary", colorMode)}
                        _hover={{ 
                          bg: getColor("primaryHover", colorMode),
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
                        }}
                        isDisabled={!formData.successCriteria.trim()}
                        isLoading={isImprovingSuccessCriteria}
                        onClick={handleImproveSuccessCriteria}
                        leftIcon={<Text>✨</Text>}
                      >
                        AI Improve
                      </Button>
                      </HStack>
                    </HStack>
                    <Textarea
                      value={formData.successCriteria}
                      onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                      placeholder="How will you measure success? What quantitative or qualitative metrics will determine if the experimentation has resolved the technical uncertainty?"
                      rows={4}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
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
                </VStack>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <HStack justify="space-between" flexDirection={{ base: "column-reverse", sm: "row" }} gap={{ base: 3, sm: 0 }} w="100%">
              <Button
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                onClick={() => navigate(`/researchanddesign/projects/${id}`)}
                isDisabled={isSubmitting}
                w={{ base: "100%", sm: "auto" }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                bg="white"
                color="black"
                _hover={{ 
                  bg: "gray.100",
                  transform: "translateY(-2px)"
                }}
                leftIcon={<CheckIcon />}
                isLoading={isSubmitting}
                loadingText="Updating..."
                boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                w={{ base: "100%", sm: "auto" }}
              >
                Update Project
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
      <FooterWithFourColumns />
      
      {/* AI Context Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent 
          bg={cardGradientBg}
          borderColor={cardBorder}
          border="1px solid"
        >
          <ModalHeader color={textPrimary} borderBottom="1px solid" borderColor={cardBorder}>
            AI Context for {contextModalData.field}
          </ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <Text fontSize="sm" mb={3} color={textSecondary}>
              This is the context that will be sent to Claude when you click "AI Improve":
            </Text>
            <Code 
              display="block" 
              whiteSpace="pre-wrap" 
              p={4} 
              borderRadius="md"
              fontSize="sm"
              bg="rgba(0, 0, 0, 0.4)"
              color={textPrimary}
              border="1px solid"
              borderColor={cardBorder}
            >
              {contextModalData.context}
            </Code>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={cardBorder}>
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
              Close
            </Button>
            <Button
              bg={getColor("primary", colorMode)}
              color="white"
              _hover={{ 
                bg: getColor("primaryHover", colorMode),
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)"
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)"
              }}
              onClick={() => {
                navigator.clipboard.writeText(contextModalData.context);
                toast({
                  title: "✨ Context copied!",
                  description: "The AI context has been copied to your clipboard.",
                  status: "success",
                  duration: 2000,
                });
              }}
              boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Copy Context
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResearchAndDesignProjectEdit;