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
  Alert,
  AlertIcon,
  useToast,
  Text,
  Tooltip,
  IconButton,
  FormHelperText,
  useColorMode} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
    }
  }
`;

const CREATE_RD_ACTIVITY = gql`
  mutation CreateRDActivity($input: RDActivityInput!) {
    createRDActivity(input: $input) {
      id
      activityName
      description
      activityType
      documentationStage
      rdProjectId
      technicalUncertainty
      hypothesis
      systematicExperimentation
      successCriteria
      knowledgeGapEvidence
      createdAt
    }
  }
`;

const ResearchAndDesignNewCoreActivity: React.FC = () => {
  const { colorMode } = useColorMode();
  usePageTitle("New Core R&D Activity");
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

  const [formData, setFormData] = useState({
    activityName: '',
    description: '',
    activityType: 'core' as const,
    documentationStage: 'preliminary',
    rdProjectId: projectId || '',
    technicalUncertainty: '',
    hypothesis: '',
    systematicExperimentation: '',
    successCriteria: '',
    knowledgeGapEvidence: '',
    variablesTested: '',
    proposedDesign: '',
    startDate: '',
    endDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create activity mutation
  const [createActivityMutation] = useMutation(CREATE_RD_ACTIVITY);

  // Fetch projects for dropdown
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS, {
    errorPolicy: 'all'
  });

  const projects = projectsData?.getRDProjects || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.activityName || !formData.rdProjectId) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in activity name and select a project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate Core R&D specific fields
    if (!formData.technicalUncertainty || !formData.hypothesis || !formData.systematicExperimentation) {
      toast({
        title: 'Missing Core R&D fields',
        description: 'Technical uncertainty, hypothesis, and systematic experimentation are required for Core R&D activities',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      await createActivityMutation({
        variables: { input },
      });

      toast({
        title: 'Core R&D Activity created',
        description: 'Your Core R&D activity has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/researchanddesign/projects/${formData.rdProjectId}`);
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: 'Error creating activity',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <NavbarWithCallToAction />
      
      <Box pt={24} pb={8} px={8}>
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
          {/* Header */}
          <HStack justify="space-between" align="center" mb={4}>
            <HStack spacing={4}>
              <IconButton
                aria-label="Back"
                icon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                size="sm"
                variant="ghost"
              />
              <Heading size="lg" color={textPrimary}>
                New Core R&D Activity
              </Heading>
            </HStack>
          </HStack>

          {/* Alert about Core R&D requirements */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Core R&D activities must demonstrate genuine technical uncertainty that cannot be resolved by a competent professional using existing knowledge.
            </Text>
          </Alert>

          {/* Main Form */}
          <Card
            bg={cardGradientBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
          >
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading size="md" color={textPrimary} mb={4}>
                    Basic Information
                  </Heading>
                  
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>Activity Name</FormLabel>
                      <Input
                        value={formData.activityName}
                        onChange={(e) => handleInputChange('activityName', e.target.value)}
                        placeholder="e.g., Development of Quantum-Inspired Optimization Algorithm"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>Project</FormLabel>
                      <Select
                        value={formData.rdProjectId}
                        onChange={(e) => handleInputChange('rdProjectId', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        disabled={projectsLoading}
                      >
                        <option value="">Select a project</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.projectName} {project.projectCode && `(${project.projectCode})`}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Description</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the core R&D activity and its objectives"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={4}
                      />
                    </FormControl>

                    <HStack width="100%" spacing={4}>
                      <FormControl>
                        <FormLabel color={textSecondary}>Start Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          bg="rgba(0, 0, 0, 0.2)"
                          borderColor="rgba(255, 255, 255, 0.1)"
                          _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                          color={textPrimary}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={textSecondary}>End Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          bg="rgba(0, 0, 0, 0.2)"
                          borderColor="rgba(255, 255, 255, 0.1)"
                          _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                          color={textPrimary}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel color={textSecondary}>Documentation Stage</FormLabel>
                      <Select
                        value={formData.documentationStage}
                        onChange={(e) => handleInputChange('documentationStage', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                      >
                        <option value="preliminary">Preliminary Research</option>
                        <option value="hypothesis_design">Hypothesis & Design</option>
                        <option value="experiments_trials">Experiments & Trials</option>
                        <option value="analysis">Analysis</option>
                        <option value="outcome">Outcome</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </Box>

                {/* Core R&D Specific Fields */}
                <Box>
                  <Heading size="md" color={textPrimary} mb={4}>
                    Core R&D Requirements
                    <Tooltip label="These fields are essential for demonstrating R&D eligibility">
                      <IconButton
                        aria-label="Info"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                        ml={2}
                      />
                    </Tooltip>
                  </Heading>

                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Technical Uncertainty
                        <Tooltip label="What technical knowledge gap exists that cannot be resolved by a competent professional?">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Textarea
                        value={formData.technicalUncertainty}
                        onChange={(e) => handleInputChange('technicalUncertainty', e.target.value)}
                        placeholder="Describe the technical uncertainty that requires experimentation to resolve. What is unknown and why can't it be solved with existing knowledge?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={4}
                      />
                      <FormHelperText color={textMuted}>
                        Example: "No existing algorithm can optimize care allocation across 13 AN-ACC classes while maintaining real-time compliance constraints"
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Hypothesis
                        <Tooltip label="Your testable hypothesis to resolve the uncertainty">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Textarea
                        value={formData.hypothesis}
                        onChange={(e) => handleInputChange('hypothesis', e.target.value)}
                        placeholder="State your hypothesis - what do you believe will solve the technical uncertainty?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                      <FormHelperText color={textMuted}>
                        Example: "Quantum-inspired tensor network methods can find near-optimal solutions in polynomial time"
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Systematic Experimentation Approach
                        <Tooltip label="How will you systematically test your hypothesis?">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Textarea
                        value={formData.systematicExperimentation}
                        onChange={(e) => handleInputChange('systematicExperimentation', e.target.value)}
                        placeholder="Describe your systematic approach to experimentation. What experiments will you conduct and how?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={4}
                      />
                      <FormHelperText color={textMuted}>
                        Include: experimental design, control variables, testing protocols, iterations planned
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Success Criteria
                        <Tooltip label="Measurable criteria to determine if the hypothesis is validated">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Textarea
                        value={formData.successCriteria}
                        onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                        placeholder="Define specific, measurable success criteria for your experiments"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                      <FormHelperText color={textMuted}>
                        Example: "Solve 1000+ variable problems in &lt;5 minutes with 95% accuracy"
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Knowledge Gap Evidence
                        <Tooltip label="Evidence that this knowledge doesn't exist globally">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Textarea
                        value={formData.knowledgeGapEvidence}
                        onChange={(e) => handleInputChange('knowledgeGapEvidence', e.target.value)}
                        placeholder="Provide evidence of global knowledge search - literature reviews, patent searches, expert consultations"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                      <FormHelperText color={textMuted}>
                        Include: databases searched, experts consulted, papers reviewed, patents analyzed
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Variables Being Tested</FormLabel>
                      <Textarea
                        value={formData.variablesTested}
                        onChange={(e) => handleInputChange('variablesTested', e.target.value)}
                        placeholder="List the key variables you will test in your experiments"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={2}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Experimental Design</FormLabel>
                      <Textarea
                        value={formData.proposedDesign}
                        onChange={(e) => handleInputChange('proposedDesign', e.target.value)}
                        placeholder="Describe your experimental design and methodology"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={4}
                      />
                    </FormControl>
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4} pt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                  >
                    Create Core R&D Activity
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignNewCoreActivity;