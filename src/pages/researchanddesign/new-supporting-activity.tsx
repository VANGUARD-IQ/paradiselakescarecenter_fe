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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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

const GET_CORE_ACTIVITIES = gql`
  query GetCoreActivities($projectId: String!) {
    getCoreActivities(projectId: $projectId) {
      id
      activityName
      rdProjectId
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
      linkedCoreActivityId
      dominantPurposeJustification
      directRelationshipExplanation
      percentageForRD
      createdAt
    }
  }
`;

const ResearchAndDesignNewSupportingActivity: React.FC = () => {
  const { colorMode } = useColorMode();
  usePageTitle("New Supporting R&D Activity");
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
    activityType: 'supporting' as const,
    documentationStage: 'preliminary',
    rdProjectId: projectId || '',
    linkedCoreActivityId: '',
    dominantPurposeJustification: '',
    directRelationshipExplanation: '',
    percentageForRD: 80,
    objectives: '',
    methodology: '',
    expectedOutcomes: '',
    resources: '',
    timeline: '',
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

  // Fetch core activities for the selected project
  const { data: coreActivitiesData, loading: coreActivitiesLoading } = useQuery(GET_CORE_ACTIVITIES, {
    variables: { projectId: formData.rdProjectId },
    skip: !formData.rdProjectId,
    errorPolicy: 'all'
  });

  const projects = projectsData?.getRDProjects || [];
  const coreActivities = coreActivitiesData?.getCoreActivities || [];

  const handleInputChange = (field: string, value: string | number) => {
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

    // Validate Supporting Activity specific fields
    if (!formData.linkedCoreActivityId || !formData.dominantPurposeJustification) {
      toast({
        title: 'Missing Supporting Activity fields',
        description: 'Please link to a Core R&D activity and provide dominant purpose justification',
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
        title: 'Supporting R&D Activity created',
        description: 'Your Supporting R&D activity has been created successfully',
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
                New Supporting R&D Activity
              </Heading>
            </HStack>
          </HStack>

          {/* Alert about Supporting Activity requirements */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Supporting R&D activities must be directly related to Core R&D activities and undertaken for the dominant purpose of supporting Core R&D.
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
                        placeholder="e.g., Core Platform Infrastructure Development"
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
                        placeholder="Describe the supporting R&D activity and its role in the project"
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

                {/* Supporting Activity Specific Fields */}
                <Box>
                  <Heading size="md" color={textPrimary} mb={4}>
                    Supporting R&D Requirements
                    <Tooltip label="These fields demonstrate the dominant purpose test for Supporting R&D">
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
                        Link to Core R&D Activity
                        <Tooltip label="Which Core R&D activity does this support?">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <Select
                        value={formData.linkedCoreActivityId}
                        onChange={(e) => handleInputChange('linkedCoreActivityId', e.target.value)}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        disabled={coreActivitiesLoading || !formData.rdProjectId}
                      >
                        <option value="">Select a Core R&D activity to support</option>
                        {coreActivities.map((activity: any) => (
                          <option key={activity.id} value={activity.id}>
                            {activity.activityName}
                          </option>
                        ))}
                      </Select>
                      {formData.rdProjectId && coreActivities.length === 0 && !coreActivitiesLoading && (
                        <FormHelperText color="orange.400">
                          No Core R&D activities found. Please create Core R&D activities first.
                        </FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Dominant Purpose Justification
                        <Tooltip label="Explain why the dominant purpose of this activity is to support Core R&D">
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
                        value={formData.dominantPurposeJustification}
                        onChange={(e) => handleInputChange('dominantPurposeJustification', e.target.value)}
                        placeholder="Explain why this activity's dominant purpose is to support Core R&D rather than commercial purposes"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={4}
                      />
                      <FormHelperText color={textMuted}>
                        Must demonstrate that the activity wouldn't be undertaken without the Core R&D
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Direct Relationship Explanation
                        <Tooltip label="How is this directly related to the Core R&D activity?">
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
                        value={formData.directRelationshipExplanation}
                        onChange={(e) => handleInputChange('directRelationshipExplanation', e.target.value)}
                        placeholder="Explain the direct relationship between this activity and the Core R&D"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                      <FormHelperText color={textMuted}>
                        Example: "This infrastructure is essential for deploying and testing the AI models developed in Core R&D"
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textSecondary}>
                        Percentage for R&D
                        <Tooltip label="What percentage of this activity is for R&D vs commercial purposes?">
                          <IconButton
                            aria-label="Info"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            ml={2}
                          />
                        </Tooltip>
                      </FormLabel>
                      <NumberInput
                        value={formData.percentageForRD}
                        onChange={(_, value) => handleInputChange('percentageForRD', value)}
                        min={0}
                        max={100}
                        bg="rgba(0, 0, 0, 0.2)"
                      >
                        <NumberInputField
                          borderColor="rgba(255, 255, 255, 0.1)"
                          _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                          color={textPrimary}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormHelperText color={textMuted}>
                        Must be majority (51%+) for R&D to pass dominant purpose test
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </Box>

                {/* Activity Details */}
                <Box>
                  <Heading size="md" color={textPrimary} mb={4}>
                    Activity Details
                  </Heading>

                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel color={textSecondary}>Objectives</FormLabel>
                      <Textarea
                        value={formData.objectives}
                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                        placeholder="What are the specific objectives of this supporting activity?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Methodology</FormLabel>
                      <Textarea
                        value={formData.methodology}
                        onChange={(e) => handleInputChange('methodology', e.target.value)}
                        placeholder="How will this activity be conducted? What methods will be used?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Expected Outcomes</FormLabel>
                      <Textarea
                        value={formData.expectedOutcomes}
                        onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                        placeholder="What results or deliverables do you expect from this activity?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Resources Required</FormLabel>
                      <Textarea
                        value={formData.resources}
                        onChange={(e) => handleInputChange('resources', e.target.value)}
                        placeholder="What resources (people, equipment, materials) are needed?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary}>Timeline</FormLabel>
                      <Textarea
                        value={formData.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        placeholder="What is the expected timeline or key milestones?"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                        color={textPrimary}
                        rows={2}
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
                    Create Supporting R&D Activity
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

export default ResearchAndDesignNewSupportingActivity;