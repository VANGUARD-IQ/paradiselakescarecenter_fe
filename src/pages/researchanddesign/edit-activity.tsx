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
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
  useColorMode,
  Text,
  Center,
  Spinner,
  Tooltip,
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
} from '@chakra-ui/react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

// GraphQL queries and mutations
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

const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
    }
  }
`;

const UPDATE_RD_ACTIVITY = gql`
  mutation UpdateRDActivity($id: String!, $input: RDActivityInput!) {
    updateRDActivity(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const ResearchAndDesignEditActivity: React.FC = () => {
  usePageTitle("Edit R&D Activity");
  const { colorMode } = useColorMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);
  const codeBg = "rgba(0, 0, 0, 0.3)";

  const [formData, setFormData] = useState({
    activityName: '',
    description: '',
    activityType: 'core',
    documentationStage: 'preliminary',
    rdProjectId: '',
    objectives: '',
    methodology: '',
    expectedOutcomes: '',
    resources: '',
    timeline: '',
    startDate: '',
    endDate: '',
    hypothesis: '',
    proposedDesign: '',
    successCriteria: '',
    variablesTested: '',
    trialScope: '',
    trialObjective: '',
    trialLocation: '',
    initialObservations: '',
    challenges: '',
    solutions: '',
    outcomes: '',
    quantitativeOutcomes: '',
    learnings: '',
    linkageDescription: '',
    linkedCoreActivityId: '',
    milestones: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImprovingActivityName, setIsImprovingActivityName] = useState(false);
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  const [isImprovingObjectives, setIsImprovingObjectives] = useState(false);
  const [isImprovingMethodology, setIsImprovingMethodology] = useState(false);
  const [isImprovingOutcomes, setIsImprovingOutcomes] = useState(false);
  const [isImprovingResources, setIsImprovingResources] = useState(false);
  const [isImprovingTimeline, setIsImprovingTimeline] = useState(false);

  // Modal state for showing AI context
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [contextModalData, setContextModalData] = useState({ field: '', context: '' });

  // Fetch activity data
  const { data: activityData, loading: activityLoading, error } = useQuery(GET_RD_ACTIVITY, {
    variables: { id: id! },
    skip: !id,
    errorPolicy: 'all'
  });

  // Fetch projects for dropdown
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });

  // Mutations
  const [updateActivityMutation] = useMutation(UPDATE_RD_ACTIVITY);
  const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);

  const projects = projectsData?.getRDProjects || [];
  const activity = activityData?.getRDActivity;

  // Handler to show AI context in modal
  const handleShowContext = (field: string) => {
    const value = formData[field as keyof typeof formData];
    const context = getAIContext(field, value);
    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
    setContextModalData({ field: fieldLabel, context });
    onOpen();
  };

  // Helper function to get AI context for each field
  const getAIContext = (field: string, value: string) => {
    switch (field) {
      case 'activityName':
        return `Please improve this R&D activity name to be more specific, clear, and professional for R&D tax incentive documentation. The name should clearly indicate the technical nature of the work being performed. Keep it concise (3-8 words) while maintaining all technical accuracy. Return ONLY the improved name without any preamble, explanation, or quotes. Original name: "${value}"`;
      case 'description':
        return `Please improve this R&D activity description to clearly explain the technical work being performed, the problem being solved, and the innovative approach being taken. Make it more precise and professionally written for R&D tax incentive documentation while keeping all specific technical details exactly the same. Focus on demonstrating the technical uncertainty and experimental nature of the work. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      case 'objectives':
        return `Please improve these R&D activity objectives to be more specific, measurable, and technically focused. Each objective should clearly state what technical advancement or knowledge will be achieved. Make them suitable for R&D tax incentive documentation by emphasizing the experimental development and technical goals. Keep all specific goals exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      case 'methodology':
        return `Please improve this R&D methodology description to clearly outline the systematic experimental approach, testing procedures, and technical methods that will be used. Emphasize the scientific rigor, experimental design, and iterative testing process. Make it suitable for R&D tax incentive documentation by highlighting how the methodology addresses technical uncertainties. Keep all specific technical approaches exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      case 'expectedOutcomes':
        return `Please improve these expected R&D outcomes to clearly describe the technical advancements, new knowledge, or innovations that will result from this activity. Emphasize measurable technical achievements, prototypes, algorithms, or other tangible R&D deliverables. Make it suitable for R&D tax incentive documentation by focusing on how these outcomes represent technical progress beyond current industry knowledge. Keep all specific results exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      case 'resources':
        return `Please improve this R&D resources description to clearly identify the technical expertise, specialized equipment, software tools, and materials required for the experimental work. Emphasize resources that are specifically needed for R&D activities (not routine operations). Make it suitable for R&D tax incentive documentation by highlighting resources that demonstrate the technical complexity of the work. Keep all specific requirements exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      case 'timeline':
        return `Please improve this R&D timeline to clearly show the experimental phases, iteration cycles, and key technical milestones. Emphasize how the timeline reflects the systematic experimental approach with testing, analysis, and refinement phases. Make it suitable for R&D tax incentive documentation by highlighting milestones that represent technical progress checkpoints. Keep all specific dates and milestones exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      default:
        return '';
    }
  };

  // Populate form data when activity loads
  useEffect(() => {
    if (activity) {
      setFormData({
        activityName: activity.activityName || '',
        description: activity.description || '',
        activityType: activity.activityType || 'core',
        documentationStage: activity.documentationStage || 'preliminary',
        rdProjectId: activity.rdProjectId || '',
        objectives: activity.objectives || '',
        methodology: activity.methodology || '',
        expectedOutcomes: activity.expectedOutcomes || '',
        resources: activity.resources || '',
        timeline: activity.timeline || '',
        startDate: activity.startDate || '',
        endDate: activity.endDate || '',
        hypothesis: activity.hypothesis || '',
        proposedDesign: activity.proposedDesign || '',
        successCriteria: activity.successCriteria || '',
        variablesTested: activity.variablesTested || '',
        trialScope: activity.trialScope || '',
        trialObjective: activity.trialObjective || '',
        trialLocation: activity.trialLocation || '',
        initialObservations: activity.initialObservations || '',
        challenges: activity.challenges || '',
        solutions: activity.solutions || '',
        outcomes: activity.outcomes || '',
        quantitativeOutcomes: activity.quantitativeOutcomes || '',
        learnings: activity.learnings || '',
        linkageDescription: activity.linkageDescription || '',
        linkedCoreActivityId: activity.linkedCoreActivityId || '',
        milestones: activity.milestones || '',
      });
    }
  }, [activity]);

  // Helper function to clean AI responses
  const cleanAIResponse = (text: string): string => {
    let cleaned = text;
    
    // Remove common prefixes
    const prefixes = [
      'Here is the improved',
      'Here\'s the improved',
      'Improved version:',
      'Here is an improved',
      'Here\'s an improved'
    ];
    
    for (const prefix of prefixes) {
      if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleaned = cleaned.substring(prefix.length).trim();
        if (cleaned.startsWith(':')) cleaned = cleaned.substring(1).trim();
        break;
      }
    }
    
    // Remove quotes if the entire text is wrapped in them
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    return cleaned.trim();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AI improvement handlers
  const handleImproveActivityName = async () => {
    const value = formData.activityName;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter an activity name first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingActivityName(true);
    try {
      const context = `Please improve this R&D activity name to be more specific, clear, and professional for R&D tax incentive documentation. The name should clearly indicate the technical nature of the work being performed. Keep it concise (3-8 words) while maintaining all technical accuracy. Return ONLY the improved name without any preamble, explanation, or quotes. Original name: "${value}"`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('activityName', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Activity name improved!",
          description: "Claude has enhanced your activity name",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve activity name. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingActivityName(false);
    }
  };

  const handleImproveDescription = async () => {
    const value = formData.description;
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
      const context = `Please improve this R&D activity description to clearly explain the technical work being performed, the problem being solved, and the innovative approach being taken. Make it more precise and professionally written for R&D tax incentive documentation while keeping all specific technical details exactly the same. Focus on demonstrating the technical uncertainty and experimental nature of the work. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('description', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Description improved!",
          description: "Claude has enhanced your activity description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve description. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingDescription(false);
    }
  };

  const handleImproveObjectives = async () => {
    const value = formData.objectives;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter objectives first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingObjectives(true);
    try {
      const context = `Please improve these R&D activity objectives to be more specific, measurable, and technically focused. Each objective should clearly state what technical advancement or knowledge will be achieved. Make them suitable for R&D tax incentive documentation by emphasizing the experimental development and technical goals. Keep all specific goals exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('objectives', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Objectives improved!",
          description: "Claude has enhanced your activity objectives",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve objectives. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingObjectives(false);
    }
  };

  const handleImproveMethodology = async () => {
    const value = formData.methodology;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter methodology first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingMethodology(true);
    try {
      const context = `Please improve this R&D methodology description to clearly outline the systematic experimental approach, testing procedures, and technical methods that will be used. Emphasize the scientific rigor, experimental design, and iterative testing process. Make it suitable for R&D tax incentive documentation by highlighting how the methodology addresses technical uncertainties. Keep all specific technical approaches exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('methodology', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Methodology improved!",
          description: "Claude has enhanced your methodology description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve methodology. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingMethodology(false);
    }
  };

  const handleImproveOutcomes = async () => {
    const value = formData.expectedOutcomes;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter expected outcomes first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingOutcomes(true);
    try {
      const context = `Please improve these expected R&D outcomes to clearly describe the technical advancements, new knowledge, or innovations that will result from this activity. Emphasize measurable technical achievements, prototypes, algorithms, or other tangible R&D deliverables. Make it suitable for R&D tax incentive documentation by focusing on how these outcomes represent technical progress beyond current industry knowledge. Keep all specific results exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('expectedOutcomes', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Expected outcomes improved!",
          description: "Claude has enhanced your expected outcomes",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve expected outcomes. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingOutcomes(false);
    }
  };

  const handleImproveResources = async () => {
    const value = formData.resources;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter resources first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingResources(true);
    try {
      const context = `Please improve this R&D resources description to clearly identify the technical expertise, specialized equipment, software tools, and materials required for the experimental work. Emphasize resources that are specifically needed for R&D activities (not routine operations). Make it suitable for R&D tax incentive documentation by highlighting resources that demonstrate the technical complexity of the work. Keep all specific requirements exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('resources', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Resources improved!",
          description: "Claude has enhanced your resources description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve resources. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingResources(false);
    }
  };

  const handleImproveTimeline = async () => {
    const value = formData.timeline;
    if (!value.trim()) {
      toast({
        title: "No text to improve",
        description: "Please enter timeline first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsImprovingTimeline(true);
    try {
      const context = `Please improve this R&D timeline to clearly show the experimental phases, iteration cycles, and key technical milestones. Emphasize how the timeline reflects the systematic experimental approach with testing, analysis, and refinement phases. Make it suitable for R&D tax incentive documentation by highlighting milestones that represent technical progress checkpoints. Keep all specific dates and milestones exactly the same but make them clearer and more professional. Return ONLY the improved text without any preamble, explanation, or quotes.`;
      const { data } = await improveDescriptionMutation({
        variables: { text: value, context }
      });
      if (data?.improveDescription) {
        handleInputChange('timeline', cleanAIResponse(data.improveDescription));
        toast({
          title: "✨ Timeline improved!",
          description: "Claude has enhanced your timeline description",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Failed to improve timeline. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImprovingTimeline(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.activityName.trim()) {
      toast({
        title: 'Activity name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.rdProjectId) {
      toast({
        title: 'Please select a project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the input
      const input: any = {
        rdProjectId: String(formData.rdProjectId).trim(),
        activityName: formData.activityName.trim(),
        activityType: formData.activityType as 'core' | 'supporting',
        documentationStage: formData.documentationStage as 'preliminary' | 'hypothesis_design' | 'experiments_trials' | 'analysis' | 'outcome',
      };

      // Add all optional fields (send them even if empty so they can be cleared)
      input.description = formData.description.trim();
      input.objectives = formData.objectives.trim();
      input.methodology = formData.methodology.trim();
      input.expectedOutcomes = formData.expectedOutcomes.trim();
      input.resources = formData.resources.trim();
      input.timeline = formData.timeline.trim();
      input.hypothesis = formData.hypothesis.trim();
      input.proposedDesign = formData.proposedDesign.trim();
      input.successCriteria = formData.successCriteria.trim();
      input.variablesTested = formData.variablesTested.trim();
      input.trialScope = formData.trialScope.trim();
      input.trialObjective = formData.trialObjective.trim();
      input.trialLocation = formData.trialLocation.trim();
      input.initialObservations = formData.initialObservations.trim();
      input.challenges = formData.challenges.trim();
      input.solutions = formData.solutions.trim();
      input.outcomes = formData.outcomes.trim();
      input.quantitativeOutcomes = formData.quantitativeOutcomes.trim();
      input.learnings = formData.learnings.trim();
      input.linkageDescription = formData.linkageDescription.trim();
      input.linkedCoreActivityId = formData.linkedCoreActivityId.trim();
      input.milestones = formData.milestones.trim();
      
      // Add dates if they have values
      if (formData.startDate) {
        input.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        input.endDate = new Date(formData.endDate);
      }

      console.log('=== UPDATE ACTIVITY DEBUG ===');
      console.log('Activity ID:', id);
      console.log('Tenant ID from localStorage:', localStorage.getItem('tenantId'));
      console.log('Update input:', JSON.stringify(input, null, 2));
      console.log('Full variables being sent:', JSON.stringify({ id: id!, input }, null, 2));
      console.log('GraphQL Mutation:');
      console.log(UPDATE_RD_ACTIVITY.loc?.source?.body || 'Query text not available');
      console.log('🚀 About to call updateActivityMutation...');

      // Update the activity using GraphQL mutation
      const result = await updateActivityMutation({
        variables: { id: id!, input },
        errorPolicy: 'all',
        refetchQueries: [
          {
            query: GET_RD_ACTIVITY,
            variables: { id: id! }
          }
        ],
        awaitRefetchQueries: true
      });
      
      console.log('🎉 Mutation completed!');
      console.log('GraphQL Response:', JSON.stringify(result, null, 2));
      const { data } = result;
      
      if (result.errors && result.errors.length > 0) {
        console.log('❌ GraphQL Errors found:', result.errors);
      }
      
      if (data?.updateRDActivity) {
        toast({
          title: 'Activity Updated Successfully!',
          description: `"${data.updateRDActivity.activityName}" has been updated.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Navigate back to activity details
        navigate(`/researchanddesign/activities/${id}`);
      } else {
        throw new Error('Activity update failed');
      }
    } catch (error: any) {
      console.error('Error updating activity:', error);
      
      let errorMessage = 'Please try again later.';
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        if (graphQLError.extensions?.validationErrors) {
          const validationErrors = graphQLError.extensions.validationErrors;
          errorMessage = `Validation error: ${validationErrors.map((ve: any) => ve.constraints ? Object.values(ve.constraints).join(', ') : 'Invalid field').join('; ')}`;
        } else {
          errorMessage = graphQLError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error updating activity',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypes = [
    { value: 'core', label: 'Core R&D Activity', description: 'Direct research and development work' },
    { value: 'supporting', label: 'Supporting Activity', description: 'Activities that support core R&D work' }
  ];

  const documentationStages = [
    { value: 'preliminary', label: 'Preliminary', description: 'Initial research and planning' },
    { value: 'hypothesis_design', label: 'Hypothesis & Design', description: 'Hypothesis formation and experimental design' },
    { value: 'experiments_trials', label: 'Experiments & Trials', description: 'Conducting experiments and trials' },
    { value: 'analysis', label: 'Analysis', description: 'Data analysis and interpretation' },
    { value: 'outcome', label: 'Outcome', description: 'Final results and conclusions' }
  ];

  if (activityLoading || projectsLoading) {
    return (
      <>
        <NavbarWithCallToAction />
        <Box p={{ base: 4, md: 6, lg: 8 }}>
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color={getColor("primary", colorMode)} />
              <Text color={getColor("text.secondary", colorMode)}>Loading activity...</Text>
            </VStack>
          </Center>
        </Box>
        <FooterWithFourColumns />
      </>
    );
  }

  if (error || !activity) {
    return (
      <>
        <NavbarWithCallToAction />
        <Box p={{ base: 4, md: 6, lg: 8 }} textAlign="center">
          <Alert status="error" maxW="md" mx="auto">
            <AlertIcon />
            {error ? `Error: ${error.message}` : 'Activity not found'}
          </Alert>
          <Button mt={4} onClick={() => navigate('/researchanddesign')}>
            Back to Dashboard
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
        <HStack mb={{ base: 4, md: 6 }}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate(`/researchanddesign/activities/${id}`)}
            fontSize="md"
          >
            Back to Activity
          </Button>
        </HStack>

        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Heading size={{ base: "lg", md: "xl" }} color={textPrimary}>
            Edit R&D Activity
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              {/* Basic Information */}
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Basic Information</Heading>
                    
                    <FormControl isRequired>
                      <HStack justify="space-between" align="center" mb={2}>
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Activity Name</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('activityName')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.activityName.trim()}
                            isLoading={isImprovingActivityName}
                            onClick={handleImproveActivityName}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Input
                        value={formData.activityName}
                        onChange={(e) => handleInputChange('activityName', e.target.value)}
                        placeholder="Enter a clear, descriptive name for this activity"
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
                        _hover={{ borderColor: textSecondary }}
                      />
                    </FormControl>

                    <FormControl>
                      <HStack justify="space-between" align="center" mb={2}>
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Description</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('description')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            isDisabled={!formData.description.trim()}
                            isLoading={isImprovingDescription}
                            onClick={handleImproveDescription}
                            leftIcon={<Text>✨</Text>}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Provide a detailed description of what this activity involves"
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

                    <FormControl isRequired>
                      <FormLabel color={textPrimary} fontSize="md">Project</FormLabel>
                      <Select
                        value={formData.rdProjectId}
                        onChange={(e) => handleInputChange('rdProjectId', e.target.value)}
                        placeholder="Select the R&D project this activity belongs to"
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        fontSize="md"
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                        _hover={{ borderColor: textSecondary }}
                      >
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.projectName} ({project.projectCode})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Classification */}
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Classification</Heading>
                    
                    <FormControl isRequired>
                       <FormLabel color={textPrimary} fontSize="md">Activity Type</FormLabel>
                      <Select
                        value={formData.activityType}
                        onChange={(e) => handleInputChange('activityType', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        fontSize="md"
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                        _hover={{ borderColor: textSecondary }}
                      >
                        {activityTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="sm" color={textSecondary} mt={1}>
                        {activityTypes.find(t => t.value === formData.activityType)?.description}
                      </Text>
                    </FormControl>

                    <FormControl isRequired>
                       <FormLabel color={textPrimary} fontSize="md">Documentation Stage</FormLabel>
                      <Select
                        value={formData.documentationStage}
                        onChange={(e) => handleInputChange('documentationStage', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        fontSize="md"
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                        _hover={{ borderColor: textSecondary }}
                      >
                        {documentationStages.map(stage => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="sm" color={textSecondary} mt={1}>
                        {documentationStages.find(s => s.value === formData.documentationStage)?.description}
                      </Text>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Detailed Planning */}
              <Card 
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>Detailed Planning</Heading>
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        These fields help you plan your R&D activity. Currently saved locally for your reference.
                      </Text>
                    </Alert>
                    
                    <FormControl>
                      <HStack justify="space-between" align="center" mb={2}>
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Objectives</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('objectives')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.objectives.trim()}
                            isLoading={isImprovingObjectives}
                            onClick={handleImproveObjectives}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.objectives}
                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                        placeholder="What are the specific objectives of this activity?"
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
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Methodology</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('methodology')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.methodology.trim()}
                            isLoading={isImprovingMethodology}
                            onClick={handleImproveMethodology}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.methodology}
                        onChange={(e) => handleInputChange('methodology', e.target.value)}
                        placeholder="How will this activity be conducted? What methods will be used?"
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
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Expected Outcomes</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('expectedOutcomes')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.expectedOutcomes.trim()}
                            isLoading={isImprovingOutcomes}
                            onClick={handleImproveOutcomes}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.expectedOutcomes}
                        onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                        placeholder="What results or deliverables do you expect from this activity?"
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
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Resources Required</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('resources')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.resources.trim()}
                            isLoading={isImprovingResources}
                            onClick={handleImproveResources}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.resources}
                        onChange={(e) => handleInputChange('resources', e.target.value)}
                        placeholder="What resources (people, equipment, materials) are needed?"
                        rows={2}
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
                        <FormLabel mb={0} color={textPrimary} fontSize="md">Timeline</FormLabel>
                        <HStack spacing={2}>
                          <Tooltip label="Click to view AI context" fontSize="sm" hasArrow>
                            <IconButton
                              aria-label="Show AI context"
                              icon={<InfoIcon />}
                              size="sm"
                              variant="ghost"
                              color={getColor("text.secondary", colorMode)}
                              _hover={{ bg: "rgba(255,255,255,0.06)" }}
                              onClick={() => handleShowContext('timeline')}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="solid"
                            bg={getColor("primary", colorMode)}
                            color="white"
                            _hover={{ 
                              bg: getColor("primaryHover", colorMode),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(107, 70, 193, 0.3)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 2px 6px rgba(107, 70, 193, 0.2)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            isDisabled={!formData.timeline.trim()}
                            isLoading={isImprovingTimeline}
                            onClick={handleImproveTimeline}
                            leftIcon={<Text>✨</Text>}
                          >
                            AI Improve
                          </Button>
                        </HStack>
                      </HStack>
                      <Textarea
                        value={formData.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        placeholder="What is the expected timeline or key milestones?"
                        rows={2}
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

              {/* Actions */}
              <HStack spacing={4} justify="end" flexDirection={{ base: "column-reverse", sm: "row" }} w="100%">
                <Button
                  variant="outline"
                  borderColor={cardBorder}
                  color={textPrimary}
                  bg="rgba(0, 0, 0, 0.2)"
                  _hover={{ borderColor: textSecondary, bg: "rgba(255, 255, 255, 0.05)" }}
                  onClick={() => navigate(`/researchanddesign/activities/${id}`)}
                  fontSize="md"
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
                  isLoading={isSubmitting}
                  loadingText="Updating Activity..."
                  boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                  fontSize="md"
                  fontWeight="semibold"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Update Activity
                </Button>
              </HStack>
            </VStack>
          </form>
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

export default ResearchAndDesignEditActivity;