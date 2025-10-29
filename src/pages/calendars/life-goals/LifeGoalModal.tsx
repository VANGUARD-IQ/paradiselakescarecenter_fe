import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useColorMode,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { FiTarget, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { getColor } from '../../../brandConfig';
import { OpportunityLinker } from './OpportunityLinker';

interface LifeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: any;
  initialDates?: {
    startDate: string;
    endDate: string;
  };
  onSave: (goal: any) => void;
  onDelete?: (goal: any) => void;
}

const GOAL_TYPES = [
  { value: 'CAREER', label: 'Career', color: '#3B82F6' },
  { value: 'FINANCIAL', label: 'Financial', color: '#10B981' },
  { value: 'HEALTH', label: 'Health', color: '#EF4444' },
  { value: 'RELATIONSHIP', label: 'Relationship', color: '#EC4899' },
  { value: 'LEARNING', label: 'Learning', color: '#8B5CF6' },
  { value: 'LEGACY', label: 'Legacy', color: '#F59E0B' },
];

export const LifeGoalModal: React.FC<LifeGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  initialDates,
  onSave,
  onDelete,
}) => {
  const { colorMode } = useColorMode();

  // Theme colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalType: 'FINANCIAL',
    startDate: '',
    endDate: '',
    financialTarget: 0,
    linkedOpportunities: [] as string[],
    parentGoalId: null as string | null,
    dependencies: [] as string[],
  });

  // Opportunity calculations
  const [opportunityStats, setOpportunityStats] = useState({
    totalValue: 0,
    closedValue: 0,
    remainingNeeded: 0,
    opportunitiesNeeded: 0,
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        goalType: goal.metadata?.['X-LIFE-GOAL-TYPE'] || 'FINANCIAL',
        startDate: goal.startTime ? new Date(goal.startTime).toISOString().split('T')[0] : '',
        endDate: goal.endTime ? new Date(goal.endTime).toISOString().split('T')[0] : '',
        financialTarget: goal.metadata?.['X-FINANCIAL-TARGET'] || 0,
        linkedOpportunities: goal.metadata?.['X-OPPORTUNITY-IDS'] || [],
        parentGoalId: goal.metadata?.['X-PARENT-GOAL-ID'] || null,
        dependencies: goal.metadata?.['X-DEPENDENCIES'] || [],
      });
    } else if (initialDates) {
      // For new goals created by dragging, set the dates
      setFormData(prev => ({
        ...prev,
        startDate: initialDates.startDate,
        endDate: initialDates.endDate,
      }));
    }
  }, [goal, initialDates]);

  // Calculate opportunity stats when opportunities change
  useEffect(() => {
    calculateOpportunityStats();
  }, [formData.linkedOpportunities, formData.financialTarget]);

  const calculateOpportunityStats = () => {
    // TODO: Fetch actual opportunity data from GraphQL
    // For now, mock calculation
    const totalValue = formData.linkedOpportunities.length * 50000; // Mock: $50k per opportunity
    const closedValue = totalValue * 0.3; // Mock: 30% closed
    const remainingNeeded = formData.financialTarget - closedValue;
    const opportunitiesNeeded = remainingNeeded > 0 ? Math.ceil(remainingNeeded / 50000) : 0;

    setOpportunityStats({
      totalValue,
      closedValue,
      remainingNeeded: Math.max(0, remainingNeeded),
      opportunitiesNeeded,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Build life goal data
    const lifeGoalData = {
      id: goal?.id,
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate, // Pass the date string directly
      endDate: formData.endDate, // Pass the date string directly
      goalType: formData.goalType,
      financialTarget: formData.financialTarget,
      opportunityIds: formData.linkedOpportunities,
      parentGoalId: formData.parentGoalId,
      dependencies: formData.dependencies,
    };

    onSave(lifeGoalData);
  };

  const handleDelete = () => {
    if (goal && onDelete) {
      onDelete(goal);
      onClose();
    }
  };

  const progressPercentage = formData.financialTarget > 0
    ? Math.min(100, (opportunityStats.closedValue / formData.financialTarget) * 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent bg={cardBg} color={textPrimary}>
        <ModalHeader>
          <HStack>
            <FiTarget />
            <Text>{goal ? 'Edit' : 'Create'} Life Goal</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Basic Info */}
            <FormControl isRequired>
              <FormLabel color={textPrimary}>Goal Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Get approved for house loan"
                bg={formBg}
                color={textPrimary}
                borderColor={cardBorder}
                _placeholder={{ color: textMuted }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={textPrimary}>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your long-term goal and why it matters..."
                rows={3}
                bg={formBg}
                color={textPrimary}
                borderColor={cardBorder}
                _placeholder={{ color: textMuted }}
              />
            </FormControl>

            {/* Goal Type */}
            <FormControl isRequired>
              <FormLabel color={textPrimary}>Goal Type</FormLabel>
              <Select
                value={formData.goalType}
                onChange={(e) => handleInputChange('goalType', e.target.value)}
                bg={formBg}
                color={textPrimary}
                borderColor={cardBorder}
              >
                {GOAL_TYPES.map(type => (
                  <option key={type.value} value={type.value} style={{
                    backgroundColor: colorMode === 'light' ? '#FFFFFF' : '#1A202C',
                    color: colorMode === 'light' ? '#1A202C' : '#FFFFFF'
                  }}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Timeline */}
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textPrimary}>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  bg={formBg}
                  color={textPrimary}
                  borderColor={cardBorder}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textPrimary}>Target Date</FormLabel>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  bg={formBg}
                  color={textPrimary}
                  borderColor={cardBorder}
                />
              </FormControl>
            </HStack>

            {/* Financial Target (for financial goals) */}
            {formData.goalType === 'FINANCIAL' && (
              <>
                <Divider borderColor={cardBorder} />
                <FormControl>
                  <FormLabel color={textPrimary}>
                    <HStack>
                      <FiDollarSign />
                      <Text>Financial Target</Text>
                    </HStack>
                  </FormLabel>
                  <NumberInput
                    value={formData.financialTarget}
                    onChange={(_, value) => handleInputChange('financialTarget', value)}
                    min={0}
                  >
                    <NumberInputField
                      bg={formBg}
                      color={textPrimary}
                      borderColor={cardBorder}
                      placeholder="e.g., 160000 for down payment"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color={textMuted} mt={1}>
                    Amount needed to achieve this goal
                  </Text>
                </FormControl>

                {/* Opportunity Progress */}
                {formData.financialTarget > 0 && (
                  <Box p={4} bg={formBg} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color={textPrimary}>
                          Progress Tracker
                        </Text>
                        <Badge colorScheme={progressPercentage >= 100 ? 'green' : 'blue'}>
                          {progressPercentage.toFixed(0)}%
                        </Badge>
                      </HStack>

                      <Progress
                        value={progressPercentage}
                        colorScheme={progressPercentage >= 100 ? 'green' : 'blue'}
                        size="lg"
                        borderRadius="md"
                      />

                      <VStack align="stretch" spacing={1} fontSize="sm">
                        <HStack justify="space-between">
                          <Text color={textSecondary}>Target:</Text>
                          <Text color={textPrimary} fontWeight="medium">
                            ${formData.financialTarget.toLocaleString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color={textSecondary}>Closed Value:</Text>
                          <Text color="green.500" fontWeight="medium">
                            ${opportunityStats.closedValue.toLocaleString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color={textSecondary}>Remaining:</Text>
                          <Text color={opportunityStats.remainingNeeded > 0 ? "orange.500" : "green.500"} fontWeight="medium">
                            ${opportunityStats.remainingNeeded.toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>

                      {opportunityStats.opportunitiesNeeded > 0 && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Text fontSize="sm">
                            You need to close <strong>{opportunityStats.opportunitiesNeeded} more opportunities</strong> to reach this goal
                          </Text>
                        </Alert>
                      )}
                    </VStack>
                  </Box>
                )}
              </>
            )}

            {/* Opportunity Linker */}
            <Divider />
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton bg={formBg} borderRadius="md" _expanded={{ bg: formBg }}>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <FiTrendingUp />
                      <Text fontWeight="medium" color={textPrimary}>
                        Link Opportunities
                      </Text>
                      <Badge colorScheme="blue">
                        {formData.linkedOpportunities.length}
                      </Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <OpportunityLinker
                    selectedOpportunities={formData.linkedOpportunities}
                    onOpportunitiesChange={(opportunities) =>
                      handleInputChange('linkedOpportunities', opportunities)
                    }
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Goal Dependencies */}
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton bg={formBg} borderRadius="md" _expanded={{ bg: formBg }}>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <InfoIcon />
                      <Text fontWeight="medium" color={textPrimary}>
                        Dependencies & Parent Goals
                      </Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={3}>
                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="sm">
                        Parent Goal
                      </FormLabel>
                      <Select
                        value={formData.parentGoalId || ''}
                        onChange={(e) => handleInputChange('parentGoalId', e.target.value || null)}
                        bg={formBg}
                        color={textPrimary}
                        borderColor={cardBorder}
                        placeholder="Select parent goal (optional)"
                      >
                        {/* TODO: Load available life goals */}
                        <option value="" style={{
                          backgroundColor: colorMode === 'light' ? '#FFFFFF' : '#1A202C',
                          color: colorMode === 'light' ? '#1A202C' : '#FFFFFF'
                        }}>None - This is a top-level goal</option>
                      </Select>
                      <Text fontSize="xs" color={textMuted} mt={1}>
                        Break down larger goals into sub-goals
                      </Text>
                    </FormControl>

                    <Text fontSize="sm" color={textSecondary}>
                      Goal dependencies will be added in the next phase
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          {goal && onDelete ? (
            <Button colorScheme="red" variant="outline" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <Box />
          )}
          <HStack>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={!formData.title || !formData.startDate || !formData.endDate}
            >
              {goal ? 'Update' : 'Create'} Goal
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};