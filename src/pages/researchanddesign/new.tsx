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
  Text,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useToast,
  useColorModeValue,
  useColorMode,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Code,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon, CheckIcon, InfoIcon, DownloadIcon } from '@chakra-ui/icons';
import { gql, useMutation } from '@apollo/client';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { exampleProjectContent } from './example-content';
import { MarkdownEditor } from './components/MarkdownEditor';

// GraphQL mutations for AI improvement
const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const IMPROVE_TAGLINE = gql`
  mutation ImproveTagline($text: String!, $context: String) {
    improveTagline(text: $text, context: $context)
  }
`;

// GraphQL mutation for creating R&D project
const CREATE_RD_PROJECT = gql`
  mutation CreateRDProject($input: RDProjectInput!) {
    createRDProject(input: $input) {
      id
      projectName
      projectCode
      status
      projectType
      executiveSummary
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
      createdAt
    }
  }
`;

const ResearchAndDesignProjectWizard: React.FC = () => {
  usePageTitle("New R&D Project");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  const steps = [
    { title: 'Project Details', description: 'Basic information' },
    { title: 'Eligibility Check', description: 'R&D qualification' },
    { title: 'Technical Info', description: 'Objectives & uncertainty' },
    { title: 'Review & Create', description: 'Confirm and save' },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [formData, setFormData] = useState({
    // Step 1: Project Details
    projectName: '',
    projectCode: '',
    startDate: '',
    endDate: '',
    financialYear: '2023-24',
    
    // Step 2: Eligibility
    projectType: 'undetermined',
    status: 'potential',
    
    // Step 3: Technical Information
    executiveSummary: '',
    technicalObjective: '',
    hypothesis: '',
    variables: '',
    successCriteria: '',
    technicalUncertainty: '',
    industryKnowledge: '',
    knowledgeLimitations: '',
  });

  const [projectId, setProjectId] = useState<string | null>(null);

  const [eligibilityResults, setEligibilityResults] = useState({
    isEligible: null as boolean | null,
    reasons: [] as string[],
    recommendations: [] as string[],
  });

  // Function to load example content
  const loadExampleContent = () => {
    const currentDate = new Date();
    const oneYearLater = new Date(currentDate);
    oneYearLater.setFullYear(currentDate.getFullYear() + 1);
    
    setFormData({
      projectName: exampleProjectContent.projectName,
      projectCode: exampleProjectContent.projectCode,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: oneYearLater.toISOString().split('T')[0],
      financialYear: '2024-25',
      projectType: exampleProjectContent.projectType === 'Core R&D' ? 'core' : 'supporting',
      status: exampleProjectContent.status === 'In Progress' ? 'in_progress' : 'potential',
      executiveSummary: exampleProjectContent.executiveSummary,
      technicalObjective: exampleProjectContent.technicalObjective,
      hypothesis: exampleProjectContent.hypothesis,
      variables: exampleProjectContent.variablesBeingTested,
      successCriteria: exampleProjectContent.successCriteria,
      technicalUncertainty: exampleProjectContent.technicalUncertainty,
      industryKnowledge: exampleProjectContent.industryKnowledge,
      knowledgeLimitations: exampleProjectContent.knowledgeLimitations,
    });
    
    toast({
      title: 'Example Content Loaded',
      description: 'The form has been populated with comprehensive R&D project example content.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  // AI improvement state
  const [isImprovingProjectName, setIsImprovingProjectName] = useState(false);
  const [isImprovingTechnicalObjective, setIsImprovingTechnicalObjective] = useState(false);
  const [isImprovingTechnicalUncertainty, setIsImprovingTechnicalUncertainty] = useState(false);
  const [isImprovingIndustryKnowledge, setIsImprovingIndustryKnowledge] = useState(false);
  const [isImprovingHypothesis, setIsImprovingHypothesis] = useState(false);
  const [isImprovingSuccessCriteria, setIsImprovingSuccessCriteria] = useState(false);
  const [isImprovingKnowledgeLimitations, setIsImprovingKnowledgeLimitations] = useState(false);

  // Context viewer state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [contextModalData, setContextModalData] = useState<{ field: string; context: string }>({ field: '', context: '' });
  const codeBg = 'rgba(0, 0, 0, 0.3)';

  const buildContextForField = (field: string): string => {
    switch (field) {
      case 'projectName':
        return `Please improve this R&D project name to be more specific, professional, and clearly indicate it's a research and development initiative. Make it suitable for R&D tax incentive documentation while keeping the core intent. Return ONLY the improved project name without any preamble, explanation, or quotes. Original name: "${formData.projectName}"`;
      case 'technicalObjective':
        return `Please improve the clarity and professional tone of this R&D technical objective while keeping all specific technical details and goals exactly the same. Focus on making it more precise and professionally written for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original objective: "${formData.technicalObjective}"`;
      case 'technicalUncertainty':
        return `Please improve the clarity and professional tone of this R&D technical uncertainty description while keeping all specific technical challenges and unknowns exactly the same. Focus on making it clear why this is uncertain and requires experimentation, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original uncertainty: "${formData.technicalUncertainty}"`;
      case 'industryKnowledge':
        return `Please improve the clarity and professional tone of this R&D industry knowledge description while keeping all specific details about existing solutions and their limitations exactly the same. Focus on making it clear what is already known in the industry and why it's insufficient, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original industry knowledge: "${formData.industryKnowledge}"`;
      case 'hypothesis':
        return `Please improve the clarity and professional tone of this R&D hypothesis while keeping the core technical approach and reasoning exactly the same. Focus on making it more scientifically precise and suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original hypothesis: "${formData.hypothesis}"`;
      case 'successCriteria':
        return `Please improve the clarity and professional tone of these R&D success criteria while keeping all specific metrics, targets, and measurements exactly the same. Focus on making them more precise and measurable, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original success criteria: "${formData.successCriteria}"`;
      case 'knowledgeLimitations':
        return `Please improve the clarity and professional tone of this R&D knowledge limitations description while keeping all specific limitations and gaps exactly the same. Focus on making it clear what knowledge gaps exist and why they require R&D to resolve, suitable for R&D tax incentive documentation. Return ONLY the improved text without any preamble, explanation, or quotes. Original knowledge limitations: "${formData.knowledgeLimitations}"`;
      default:
        return '';
    }
  };

  const handleShowContext = (field: string) => {
    const ctx = buildContextForField(field);
    setContextModalData({ field, context: ctx });
    onOpen();
  };

  // AI improvement mutations
  const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);
  const [improveTaglineMutation] = useMutation(IMPROVE_TAGLINE);
  
  // Project creation and update mutations
  const [createRDProject] = useMutation(CREATE_RD_PROJECT);
  const [updateRDProject] = useMutation(gql`
    mutation UpdateRDProject($id: String!, $input: RDProjectInput!) {
      updateRDProject(id: $id, input: $input) {
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
        updatedAt
      }
    }
  `);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to clean AI responses
  const cleanAIResponse = (text: string): string => {
    // Remove surrounding quotes if present
    let cleaned = text.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Remove any preamble text like "Here is the improved..."
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

  // AI improvement handlers
  const handleImproveProjectName = async () => {
    const value = formData.projectName;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter a project name first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingProjectName(true);
    try {
      const context = buildContextForField('projectName');
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('projectName', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Project name improved!",
          description: "Claude has enhanced your project name",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error improving project name:', error);
      toast({
        title: "Improvement failed",
        description: error instanceof Error ? error.message : "Failed to improve project name. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingProjectName(false);
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
      const context = buildContextForField('technicalObjective');
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
      const context = buildContextForField('technicalUncertainty');
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
      const context = buildContextForField('industryKnowledge');
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
      const context = buildContextForField('hypothesis');
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

  const checkEligibility = () => {
    const reasons = [];
    const recommendations = [];
    let isEligible = true;

    // Basic eligibility checks
    if (!formData.technicalObjective) {
      isEligible = false;
      reasons.push('Technical objective not defined');
      recommendations.push('Define clear technical objectives for your project');
    }

    if (!formData.technicalUncertainty) {
      isEligible = false;
      reasons.push('Technical uncertainty not identified');
      recommendations.push('Identify specific technical uncertainties that need to be resolved');
    }

    // Positive indicators
    if (formData.technicalObjective.toLowerCase().includes('develop') || 
        formData.technicalObjective.toLowerCase().includes('research') ||
        formData.technicalObjective.toLowerCase().includes('improve')) {
      reasons.push('Contains development/research objectives');
    }

    if (formData.technicalUncertainty.toLowerCase().includes('unknown') ||
        formData.technicalUncertainty.toLowerCase().includes('uncertain') ||
        formData.technicalUncertainty.toLowerCase().includes('challenge')) {
      reasons.push('Clear technical uncertainty identified');
    }

    if (isEligible && reasons.length === 0) {
      reasons.push('Basic eligibility criteria appear to be met');
      recommendations.push('Consider adding more specific technical details');
      recommendations.push('Document your experimental methodology');
    }

    setEligibilityResults({ isEligible, reasons, recommendations });
    
    if (isEligible) {
      setFormData(prev => ({ ...prev, projectType: 'core', status: 'eligible' }));
    }
  };

  const saveOrUpdateProject = async () => {
    try {
      // Prepare the input object
      const input = {
        projectName: formData.projectName,
        projectCode: formData.projectCode || undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        financialYear: formData.financialYear,
        status: formData.status,
        projectType: formData.projectType,
        technicalObjective: formData.technicalObjective || undefined,
        hypothesis: formData.hypothesis || undefined,
        variables: formData.variables || undefined,
        successCriteria: formData.successCriteria || undefined,
        technicalUncertainty: formData.technicalUncertainty || undefined,
        industryKnowledge: formData.industryKnowledge || undefined,
        knowledgeLimitations: formData.knowledgeLimitations || undefined,
      };
      
      // Remove undefined values
      Object.keys(input).forEach(key => {
        if (input[key as keyof typeof input] === undefined) {
          delete input[key as keyof typeof input];
        }
      });

      if (projectId) {
        // Update existing project
        console.log('Updating project:', projectId, input);
        await updateRDProject({
          variables: { id: projectId, input }
        });
        console.log('Project updated successfully');
      } else {
        // Create new project
        console.log('Creating new project:', input);
        const { data } = await createRDProject({
          variables: { input }
        });
        
        if (data?.createRDProject) {
          setProjectId(data.createRDProject.id);
          console.log('Project created with ID:', data.createRDProject.id);
          
          toast({
            title: 'Project Saved',
            description: `${formData.projectName} has been saved. You can continue adding details.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error saving project',
        description: error instanceof Error ? error.message : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const handleNext = async () => {
    try {
      // Save/update project on each step
      if (activeStep === 0 && formData.projectName) {
        // Save project after step 1 if we have a project name
        await saveOrUpdateProject();
      } else if (projectId) {
        // Update existing project with current data
        await saveOrUpdateProject();
      }

      if (activeStep === 1) {
        checkEligibility();
      }
      
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      }
    } catch (error) {
      // Don't proceed to next step if save failed
      console.error('Failed to save project, staying on current step');
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save final updates
      await saveOrUpdateProject();
      
      toast({
        title: 'R&D Project Completed',
        description: `${formData.projectName} has been saved successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/researchanddesign/projects');
    } catch (error) {
      console.error('Error finalizing R&D project:', error);
      toast({
        title: 'Error finalizing project',
        description: error instanceof Error ? error.message : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch" w="100%" h="100%">
            {/* Load Example Button */}
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold" color={textPrimary}>
                Project Information
              </Text>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="purple"
                variant="outline"
                size="sm"
                onClick={loadExampleContent}
                _hover={{
                  bg: 'purple.50',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md',
                }}
                transition="all 0.2s"
              >
                Load Example Content
              </Button>
            </HStack>
            <Divider borderColor={cardBorder} />
            
            <FormControl>
              <HStack justify="space-between" align="center" mb={2}>
                <FormLabel mb={0} color={textPrimary}>Project Name *</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('projectName')}
                      isDisabled={!formData.projectName.trim()}
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
                  isDisabled={!formData.projectName.trim()}
                  isLoading={isImprovingProjectName}
                  onClick={handleImproveProjectName}
                  leftIcon={<Text>✨</Text>}
                >
                  AI Improve
                </Button>
                </HStack>
              </HStack>
              <Input
                placeholder="e.g., AI-Powered Analytics Engine"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
              <FormLabel color={textPrimary}>Project Code</FormLabel>
              <Input
                placeholder="e.g., AI-2024-001 (optional internal reference)"
                value={formData.projectCode}
                onChange={(e) => handleInputChange('projectCode', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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

            <HStack spacing={4}>
              <FormControl>
                <FormLabel color={textPrimary}>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
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
                <FormLabel color={textPrimary}>End Date (if known)</FormLabel>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
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
            </HStack>

            <FormControl>
              <FormLabel color={textPrimary}>Financial Year</FormLabel>
              <Select
                value={formData.financialYear}
                onChange={(e) => handleInputChange('financialYear', e.target.value)}
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
                <option value="2023-24" style={{ backgroundColor: '#1a1a1a' }}>2023-24</option>
                <option value="2024-25" style={{ backgroundColor: '#1a1a1a' }}>2024-25</option>
                <option value="2025-26" style={{ backgroundColor: '#1a1a1a' }}>2025-26</option>
              </Select>
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch" w="100%" h="100%">
            <Alert 
              status="info"
              bg="rgba(59, 130, 246, 0.1)"
              borderColor="rgba(59, 130, 246, 0.3)"
              borderWidth="1px"
            >
              <AlertIcon color="#3B82F6" />
              <Box>
                <AlertTitle color={textPrimary}>R&D Eligibility Assessment</AlertTitle>
                <AlertDescription color={textSecondary}>
                  We'll help determine if your project qualifies for R&D tax incentives.
                  All questions are optional but help improve accuracy.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <HStack justify="space-between" align="center" mb={2}>
                <FormLabel mb={0} color={textPrimary}>What is the main technical objective of this project?</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('technicalObjective')}
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
                placeholder="Describe what you're trying to achieve technically..."
                rows={4}
                value={formData.technicalObjective}
                onChange={(e) => handleInputChange('technicalObjective', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
                <FormLabel mb={0} color={textPrimary}>What technical uncertainties need to be resolved?</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('technicalUncertainty')}
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
                placeholder="Describe what is unknown or uncertain that requires experimentation..."
                rows={4}
                value={formData.technicalUncertainty}
                onChange={(e) => handleInputChange('technicalUncertainty', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
                <FormLabel mb={0} color={textPrimary}>What existing knowledge or solutions are available?</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('industryKnowledge')}
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
                placeholder="Describe what industry knowledge exists and why it's not sufficient..."
                rows={4}
                value={formData.industryKnowledge}
                onChange={(e) => handleInputChange('industryKnowledge', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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

            {eligibilityResults.isEligible !== null && (
              <Alert 
                status={eligibilityResults.isEligible ? 'success' : 'warning'}
                bg={eligibilityResults.isEligible ? "rgba(34, 197, 94, 0.1)" : "rgba(251, 146, 60, 0.1)"}
                borderColor={eligibilityResults.isEligible ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 146, 60, 0.3)"}
                borderWidth="1px"
              >
                <AlertIcon color={eligibilityResults.isEligible ? "#22C55E" : "#FB923C"} />
                <Box>
                  <AlertTitle color={textPrimary}>
                    {eligibilityResults.isEligible ? 'Potentially Eligible!' : 'May Need More Information'}
                  </AlertTitle>
                  <AlertDescription color={textSecondary}>
                    <VStack align="start" spacing={2} mt={2}>
                      {eligibilityResults.reasons.map((reason, index) => (
                        <Text key={index} fontSize="sm" color={textSecondary}>• {reason}</Text>
                      ))}
                      {eligibilityResults.recommendations.length > 0 && (
                        <>
                          <Text fontWeight="semibold" mt={2} color={textPrimary}>Recommendations:</Text>
                          {eligibilityResults.recommendations.map((rec, index) => (
                            <Text key={index} fontSize="sm" color={textSecondary}>• {rec}</Text>
                          ))}
                        </>
                      )}
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch" w="100%" h="100%">
            <Alert status="info" bg="rgba(59, 130, 246, 0.1)" borderColor="rgba(59, 130, 246, 0.3)" borderWidth="1px">
              <AlertIcon color="#3B82F6" />
              <Box>
                <AlertTitle color={textPrimary}>Technical Details (All Optional)</AlertTitle>
                <AlertDescription color={textSecondary}>
                  Add as much detail as you have now. You can always update this later.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <HStack justify="space-between" align="center" mb={2}>
                <FormLabel mb={0} color={textPrimary}>Hypothesis</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('hypothesis')}
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
                placeholder="What do you think will work and why?"
                rows={4}
                value={formData.hypothesis}
                onChange={(e) => handleInputChange('hypothesis', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
              <FormLabel color={textPrimary}>Variables to Test</FormLabel>
              <Input
                placeholder="e.g., algorithm parameters, material properties, design configurations"
                value={formData.variables}
                onChange={(e) => handleInputChange('variables', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
                <FormLabel mb={0} color={textPrimary}>Success Criteria</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('successCriteria')}
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
                placeholder="How will you know if the project is successful?"
                rows={4}
                value={formData.successCriteria}
                onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
                <FormLabel mb={0} color={textPrimary}>Knowledge Limitations</FormLabel>
                <HStack>
                  <Tooltip label="View AI context" placement="top">
                    <IconButton
                      aria-label="View context"
                      icon={<InfoIcon />}
                      size="sm"
                      variant="ghost"
                      color={textSecondary}
                      _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => handleShowContext('knowledgeLimitations')}
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
                placeholder="What are the current limitations of existing solutions or knowledge?"
                rows={4}
                value={formData.knowledgeLimitations}
                onChange={(e) => handleInputChange('knowledgeLimitations', e.target.value)}
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
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
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch" w="100%" h="100%">
            <Alert 
              status="success"
              bg="rgba(34, 197, 94, 0.1)"
              borderColor="rgba(34, 197, 94, 0.3)"
              borderWidth="1px"
            >
              <AlertIcon color="#22C55E" />
              <Box>
                <AlertTitle color={textPrimary}>Ready to Create Project</AlertTitle>
                <AlertDescription color={textSecondary}>
                  Review your project details below and click "Create Project" to save.
                </AlertDescription>
              </Box>
            </Alert>

            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size="md" color={textPrimary}>Project Summary</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color={textPrimary}>Project Name:</Text>
                    <Text color={textSecondary}>{formData.projectName || 'Not specified'}</Text>
                  </HStack>
                  
                  {formData.projectCode && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold" color={textPrimary}>Project Code:</Text>
                      <Text color={textSecondary}>{formData.projectCode}</Text>
                    </HStack>
                  )}

                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color={textPrimary}>Status:</Text>
                    <Badge 
                      bg={formData.status === 'eligible' ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                      color={formData.status === 'eligible' ? "#22C55E" : "#6B7280"}
                      border="1px solid"
                      borderColor={formData.status === 'eligible' ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                    >
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color={textPrimary}>Type:</Text>
                    <Badge colorScheme={formData.projectType === 'core' ? 'blue' : 'gray'}>
                      {formData.projectType.charAt(0).toUpperCase() + formData.projectType.slice(1)}
                    </Badge>
                  </HStack>

                  {formData.technicalObjective && (
                    <>
                      <Text fontWeight="semibold" color={textPrimary}>Technical Objective:</Text>
                      <Text fontSize="sm" color={textSecondary}>
                        {formData.technicalObjective}
                      </Text>
                    </>
                  )}

                  {formData.technicalUncertainty && (
                    <>
                      <Text fontWeight="semibold" color={textPrimary}>Technical Uncertainty:</Text>
                      <Text fontSize="sm" color={getColor("text.secondary", colorMode)}>
                        {formData.technicalUncertainty}
                      </Text>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Alert status="info" bg="rgba(59, 130, 246, 0.1)" borderColor="rgba(59, 130, 246, 0.3)" borderWidth="1px">
              <AlertIcon color="#3B82F6" />
              <Box>
                <AlertDescription color={textSecondary}>
                  After creating the project, you can add activities, log time, and upload evidence
                  to build a comprehensive R&D documentation package.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={8} maxW="1200px" mx="auto" flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack mb={8}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate('/researchanddesign/projects')}
          >
            Back to Projects
          </Button>
        </HStack>

        <VStack spacing={8} align="stretch">
          <VStack spacing={2} align="start">
            <Heading size="lg" color={textPrimary}>
              🔬 Create New R&D Project
            </Heading>
            {projectId && (
              <Text fontSize="sm" color={textSecondary}>
                ✅ Project saved - ID: {projectId.substring(0, 8)}...
              </Text>
            )}
          </VStack>

          {/* Stepper */}
          <Stepper index={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator
                  bg={activeStep === index ? "white" : activeStep > index ? "#22C55E" : "rgba(255, 255, 255, 0.2)"}
                  color={activeStep === index ? "black" : activeStep > index ? "white" : textMuted}
                  borderColor={activeStep === index ? "white" : cardBorder}
                  borderWidth="2px"
                >
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>
                    <Text 
                      color={activeStep === index ? textPrimary : activeStep > index ? textPrimary : textSecondary}
                      fontWeight={activeStep === index ? "bold" : "normal"}
                    >
                      {step.title}
                    </Text>
                  </StepTitle>
                  <StepDescription>
                    <Text color={textMuted} fontSize="sm">
                      {step.description}
                    </Text>
                  </StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            minH="600px"
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>{steps[activeStep].title}</Heading>
            </CardHeader>
            <CardBody minH="500px">
              {renderStepContent()}
            </CardBody>
          </Card>

          {/* Navigation Buttons */}
          <HStack justify="space-between">
            <Button
              variant="outline"
              borderColor={getColor("primary", colorMode)}
              color={textPrimary}
              bg="transparent"
              _hover={{
                bg: "rgba(107, 70, 193, 0.1)",
                borderColor: getColor("primaryHover", colorMode),
                transform: "translateY(-2px)",
                boxShadow: "0 4px 15px rgba(107, 70, 193, 0.2)",
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "0 2px 8px rgba(107, 70, 193, 0.15)",
              }}
              onClick={handlePrevious}
              isDisabled={activeStep === 0}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Previous
            </Button>

            <HStack>
              <Text fontSize="sm" color={textSecondary}>
                Step {activeStep + 1} of {steps.length}
              </Text>
            </HStack>

            {activeStep === steps.length - 1 ? (
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
                onClick={handleSubmit}
                isDisabled={!formData.projectName}
                boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Create Project
              </Button>
            ) : (
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
                onClick={handleNext}
                boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Next
              </Button>
            )}
          </HStack>
        </VStack>
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
          <ModalHeader color={textPrimary}>AI Context for {contextModalData.field}</ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <Text fontSize="sm" mb={3} color={textSecondary}>
              This is the exact prompt that will be sent to Claude when you click "AI Improve":
            </Text>
            <Code 
              display="block" 
              whiteSpace="pre-wrap" 
              p={4} 
              borderRadius="md"
              fontSize="sm"
              bg={codeBg}
              color={textPrimary}
              border="1px solid"
              borderColor={cardBorder}
            >
              {contextModalData.context}
            </Code>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color={textSecondary}
              _hover={{ 
                bg: "rgba(255, 255, 255, 0.05)",
                color: textPrimary 
              }}
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
                  title: "📋 Context copied!",
                  description: "The AI context has been copied to your clipboard.",
                  status: "success",
                  duration: 2000,
                });
              }}
            >
              Copy Context
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResearchAndDesignProjectWizard;