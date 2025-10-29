import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
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
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  IconButton,
  useToast,
  Box,
  Text,
  Badge,
  Progress,
  Checkbox,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorMode
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  EditIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiUsers, 
  FiDollarSign,
  FiPackage,
  FiUser,
  FiSettings,
  FiHash
} from 'react-icons/fi';
import { getColor } from '../../brandConfig';

// GraphQL Queries and Mutations
const GET_CALENDAR_GOALS = gql`
  query GetCalendarGoals($calendarId: String!, $period: String) {
    calendarGoals(calendarId: $calendarId, period: $period) {
      id
      title
      description
      category
      period
      status
      startDate
      endDate
      progressPercentage
      currentValue
      targetValue
      currentNumericValue
      targetNumericValue
      checkpoints {
        id
        title
        description
        completed
        completedAt
        dueDate
        order
        weight
        notes
      }
      color
      icon
      displayOrder
      kpiMetric
      kpiUnit
      notes
      tags
      parentGoalId
      assignedTo
    }
  }
`;

const CREATE_GOAL = gql`
  mutation CreateCalendarGoal($input: CalendarGoalInput!) {
    createCalendarGoal(input: $input) {
      id
      title
      progressPercentage
    }
  }
`;

const UPDATE_GOAL = gql`
  mutation UpdateCalendarGoal($id: String!, $input: CalendarGoalInput!) {
    updateCalendarGoal(id: $id, input: $input) {
      id
      title
      progressPercentage
    }
  }
`;

const DELETE_GOAL = gql`
  mutation DeleteCalendarGoal($id: String!) {
    deleteCalendarGoal(id: $id)
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      businessName
    }
  }
`;

const UPDATE_CHECKPOINT = gql`
  mutation UpdateGoalCheckpoint($input: UpdateGoalCheckpointInput!) {
    updateGoalCheckpoint(input: $input) {
      id
      progressPercentage
      checkpoints {
        id
        completed
      }
    }
  }
`;

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  currentMonth: Date;
  initialGoalId?: string | null;
}

interface Goal {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  currentValue: string;
  targetValue: string;
  progressPercentage: number;
  checkpoints: Checkpoint[];
  color: string;
  icon: string;
  displayOrder: number;
  parentGoalId?: string | null;
  assignedTo?: string | null;
}

interface Checkpoint {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  order: number;
  weight?: number;
  notes?: string | null;
}

const categoryIcons: Record<string, any> = {
  MARKETING: FiTrendingUp,
  GROWTH: FiTarget,
  OPERATIONS: FiSettings,
  TEAM: FiUsers,
  FINANCE: FiDollarSign,
  PRODUCT: FiPackage,
  CUSTOMER: FiUser,
  OTHER: FiHash
};

const categoryColors: Record<string, string> = {
  MARKETING: '#9333EA', // Purple
  GROWTH: '#10B981',   // Green
  OPERATIONS: '#F59E0B', // Yellow
  TEAM: '#3B82F6',     // Blue
  FINANCE: '#EF4444',  // Red
  PRODUCT: '#8B5CF6',  // Violet
  CUSTOMER: '#EC4899', // Pink
  OTHER: '#6B7280'     // Gray
};

const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, calendarId, currentMonth, initialGoalId }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for View, 1 for Manage

  // Theme-aware colors
  const bg = getColor("background.main", colorMode);
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  // Get month and year for display
  const getMonthYearDisplay = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  // Fetch goals
  const { loading, data, refetch } = useQuery(GET_CALENDAR_GOALS, {
    variables: {
      calendarId,
      period: 'MONTHLY'
    },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch clients for assignment
  const { data: clientsData } = useQuery(GET_CLIENTS, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  useEffect(() => {
    if (data?.calendarGoals) {
      // Create a deep copy to avoid read-only object issues
      const goalsCopy = data.calendarGoals.map((goal: any) => ({
        ...goal,
        checkpoints: goal.checkpoints ? goal.checkpoints.map((cp: any) => ({...cp})) : []
      }));
      setGoals(goalsCopy);
    }
  }, [data]);

  // Handle initial goal selection
  useEffect(() => {
    if (initialGoalId && goals.length > 0) {
      const goalToEdit = goals.find(g => g.id === initialGoalId);
      if (goalToEdit) {
        setEditingGoal(goalToEdit);
        setActiveTab(1); // Switch to Manage tab
      }
    }
  }, [initialGoalId, goals]);

  // Mutations
  const [createGoal] = useMutation(CREATE_GOAL, {
    onCompleted: () => {
      toast({
        title: 'Goal created',
        status: 'success',
        duration: 3000
      });
      refetch();
      setIsAddingGoal(false);
      setEditingGoal(null);
    },
    onError: (error) => {
      toast({
        title: 'Error creating goal',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [updateGoal] = useMutation(UPDATE_GOAL, {
    onCompleted: () => {
      toast({
        title: 'Goal updated',
        status: 'success',
        duration: 3000
      });
      refetch();
      setEditingGoal(null);
    }
  });

  const [deleteGoal] = useMutation(DELETE_GOAL, {
    onCompleted: () => {
      toast({
        title: 'Goal deleted',
        status: 'success',
        duration: 3000
      });
      refetch();
    }
  });

  const [updateCheckpoint] = useMutation(UPDATE_CHECKPOINT, {
    onCompleted: () => {
      refetch();
    }
  });

  // Handle saving a goal
  const handleSaveGoal = () => {
    if (!editingGoal) return;

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Clean checkpoints to remove __typename and other Apollo-added fields
    const cleanCheckpoints = editingGoal.checkpoints.map(cp => ({
      id: cp.id,
      title: cp.title,
      description: cp.description || '',
      completed: cp.completed || false,
      completedAt: cp.completedAt || null,
      dueDate: cp.dueDate || null,
      order: cp.order || 0,
      weight: cp.weight || 1,
      notes: cp.notes || null
    }));

    const input = {
      calendarId,
      title: editingGoal.title,
      description: editingGoal.description,
      category: editingGoal.category,
      period: 'MONTHLY',
      status: editingGoal.status || 'NOT_STARTED',
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      currentValue: editingGoal.currentValue,
      targetValue: editingGoal.targetValue,
      progressPercentage: editingGoal.progressPercentage,
      checkpoints: cleanCheckpoints,
      parentGoalId: editingGoal.parentGoalId || null,
      assignedTo: editingGoal.assignedTo || null,
      color: editingGoal.color || categoryColors[editingGoal.category],
      icon: editingGoal.icon,
      displayOrder: editingGoal.displayOrder
    };

    if (editingGoal.id) {
      updateGoal({
        variables: { id: editingGoal.id, input },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    } else {
      createGoal({
        variables: { input },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal({
        variables: { id: goalId },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    }
  };

  // Handle toggling checkpoint
  const handleToggleCheckpoint = (goalId: string, checkpointId: string, completed: boolean) => {
    updateCheckpoint({
      variables: {
        input: {
          goalId,
          checkpointId,
          completed
        }
      },
      context: {
        headers: {
          'x-tenant-id': localStorage.getItem('tenantId') || ''
        }
      }
    });
  };

  // Add new goal
  const handleAddGoal = () => {
    setEditingGoal({
      title: '',
      description: '',
      category: 'OTHER',
      status: 'NOT_STARTED',
      currentValue: '',
      targetValue: '',
      progressPercentage: 0,
      checkpoints: [],
      color: categoryColors.OTHER,
      icon: '',
      displayOrder: goals.length
    });
    setIsAddingGoal(true);
  };

  // Generate a simple ID for checkpoints
  const generateId = () => {
    return `checkpoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add checkpoint to editing goal
  const handleAddCheckpoint = () => {
    if (!editingGoal) return;
    
    const newCheckpoint: Checkpoint = {
      id: generateId(),
      title: '',
      description: '',
      completed: false,
      order: editingGoal.checkpoints.length,
      weight: 1
    };
    
    setEditingGoal({
      ...editingGoal,
      checkpoints: [...editingGoal.checkpoints, newCheckpoint]
    });
  };

  // Group goals by category
  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, typeof goals>);

  // Calculate overall statistics
  const calculateStats = () => {
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;
    
    goals.forEach(goal => {
      totalCheckpoints += goal.checkpoints.length;
      completedCheckpoints += goal.checkpoints.filter(cp => cp.completed).length;
    });

    const overallProgress = totalCheckpoints > 0 
      ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
      : 0;

    return {
      totalGoals: goals.length,
      totalCheckpoints,
      completedCheckpoints,
      overallProgress
    };
  };

  const stats = calculateStats();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "4xl", lg: "6xl" }}>
      <ModalOverlay />
      <ModalContent
        maxH={{ base: "100vh", md: "90vh" }}
        m={{ base: 0, md: 4 }}
        bg={cardBg}
        color={textPrimary}
      >
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <HStack>
              <Icon as={CalendarIcon} />
              <Text fontSize={{ base: "lg", md: "xl" }}>{getMonthYearDisplay()} Goals</Text>
            </HStack>
            <HStack flexWrap="wrap" spacing={2}>
              <Badge colorScheme="blue" fontSize={{ base: "xs", md: "md" }} p={{ base: 1, md: 2 }}>
                {stats.completedCheckpoints} / {stats.totalCheckpoints} tasks
              </Badge>
              <Badge colorScheme="green" fontSize={{ base: "xs", md: "md" }} p={{ base: 1, md: 2 }}>
                Overall: {stats.overallProgress}%
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody overflowY="auto">
          {loading ? (
            <Text color={textPrimary}>Loading goals...</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Add/Edit Goal Form */}
              {(isAddingGoal || editingGoal) && (
                <Box p={4} borderWidth={1} borderRadius="md" bg={formBg} borderColor={cardBorder}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel color={textPrimary}>Goal Title</FormLabel>
                      <Input
                        value={editingGoal?.title || ''}
                        onChange={(e) => setEditingGoal(prev => prev ? {...prev, title: e.target.value} : null)}
                        placeholder="Enter goal title"
                        bg={cardBg}
                        color={textPrimary}
                        borderColor={cardBorder}
                        _placeholder={{ color: textMuted }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary}>Assigned To (Optional)</FormLabel>
                      <Select
                        value={editingGoal?.assignedTo || ''}
                        onChange={(e) => setEditingGoal(prev => prev ? {...prev, assignedTo: e.target.value || null} : null)}
                        placeholder="Select a client to assign this goal to"
                        bg={cardBg}
                        color={textPrimary}
                        borderColor={cardBorder}
                      >
                        <option value="">Not assigned</option>
                        {clientsData?.clients?.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.fName} {client.lName}
                            {client.businessName && ` (${client.businessName})`}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary}>Depends On (Optional)</FormLabel>
                      <Select
                        value={editingGoal?.parentGoalId || ''}
                        onChange={(e) => setEditingGoal(prev => prev ? {...prev, parentGoalId: e.target.value || null} : null)}
                        placeholder="Select a goal this depends on"
                        bg={cardBg}
                        color={textPrimary}
                        borderColor={cardBorder}
                      >
                        <option value="">No dependency</option>
                        {goals?.filter((g: any) => g.id !== editingGoal?.id).map((goal: any) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.title} ({goal.progressPercentage}% complete)
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="xs" color={textMuted} mt={1}>
                        This goal will be marked as blocked until the selected goal is 100% complete
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary}>Description</FormLabel>
                      <Textarea
                        value={editingGoal?.description || ''}
                        onChange={(e) => setEditingGoal(prev => prev ? {...prev, description: e.target.value} : null)}
                        placeholder="Enter goal description"
                        bg={cardBg}
                        color={textPrimary}
                        borderColor={cardBorder}
                        _placeholder={{ color: textMuted }}
                      />
                    </FormControl>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                      <FormControl>
                        <FormLabel color={textPrimary}>Category</FormLabel>
                        <Select
                          value={editingGoal?.category || 'OTHER'}
                          onChange={(e) => setEditingGoal(prev => prev ? {
                            ...prev,
                            category: e.target.value,
                            color: categoryColors[e.target.value]
                          } : null)}
                          bg={cardBg}
                          color={textPrimary}
                          borderColor={cardBorder}
                        >
                          <option value="MARKETING">Marketing</option>
                          <option value="GROWTH">Growth</option>
                          <option value="OPERATIONS">Operations</option>
                          <option value="TEAM">Team</option>
                          <option value="FINANCE">Finance</option>
                          <option value="PRODUCT">Product</option>
                          <option value="CUSTOMER">Customer</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={textPrimary}>Status</FormLabel>
                        <Select
                          value={editingGoal?.status || 'NOT_STARTED'}
                          onChange={(e) => setEditingGoal(prev => prev ? {...prev, status: e.target.value} : null)}
                          bg={cardBg}
                          color={textPrimary}
                          borderColor={cardBorder}
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="AT_RISK">At Risk</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="ON_HOLD">On Hold</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                      <FormControl>
                        <FormLabel color={textPrimary}>Current Value</FormLabel>
                        <Input
                          value={editingGoal?.currentValue || ''}
                          onChange={(e) => setEditingGoal(prev => prev ? {...prev, currentValue: e.target.value} : null)}
                          placeholder="e.g., 18 Clients"
                          bg={cardBg}
                          color={textPrimary}
                          borderColor={cardBorder}
                          _placeholder={{ color: textMuted }}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={textPrimary}>Target Value</FormLabel>
                        <Input
                          value={editingGoal?.targetValue || ''}
                          onChange={(e) => setEditingGoal(prev => prev ? {...prev, targetValue: e.target.value} : null)}
                          placeholder="e.g., 25 New Clients"
                          bg={cardBg}
                          color={textPrimary}
                          borderColor={cardBorder}
                          _placeholder={{ color: textMuted }}
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    {/* Checkpoints */}
                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" color={textPrimary}>Checkpoints / Tasks</Text>
                        <Button size="sm" leftIcon={<AddIcon />} onClick={handleAddCheckpoint}>
                          Add Task
                        </Button>
                      </HStack>
                      
                      <VStack spacing={2} align="stretch">
                        {editingGoal?.checkpoints.map((checkpoint, index) => (
                          <HStack key={index} spacing={2}>
                            <Input
                              value={checkpoint.title}
                              onChange={(e) => {
                                if (!editingGoal) return;
                                const newCheckpoints = editingGoal.checkpoints.map((cp, i) =>
                                  i === index ? { ...cp, title: e.target.value } : { ...cp }
                                );
                                setEditingGoal({...editingGoal, checkpoints: newCheckpoints});
                              }}
                              placeholder="Task title"
                              bg={cardBg}
                              color={textPrimary}
                              borderColor={cardBorder}
                              _placeholder={{ color: textMuted }}
                            />
                            <IconButton
                              aria-label="Remove task"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => {
                                if (!editingGoal) return;
                                const newCheckpoints = editingGoal.checkpoints.filter((_, i) => i !== index);
                                setEditingGoal({...editingGoal, checkpoints: newCheckpoints});
                              }}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                    
                    <HStack w="full" justify="flex-end">
                      <Button variant="ghost" onClick={() => {
                        setEditingGoal(null);
                        setIsAddingGoal(false);
                      }}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" onClick={handleSaveGoal}>
                        {editingGoal?.id ? 'Update' : 'Create'} Goal
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}
              
              {/* Goals by Category */}
              <Tabs>
                <TabList>
                  <Tab>All Goals</Tab>
                  {Object.keys(goalsByCategory).map(category => (
                    <Tab key={category}>
                      <HStack>
                        <Icon as={categoryIcons[category]} />
                        <Text>{category.charAt(0) + category.slice(1).toLowerCase()}</Text>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    {/* All Goals */}
                    <VStack spacing={4} align="stretch">
                      {goals.map(goal => (
                        <Box
                          key={goal.id}
                          p={4}
                          borderWidth={1}
                          borderRadius="md"
                          borderLeftWidth={4}
                          borderLeftColor={goal.color || categoryColors[goal.category]}
                        >
                          <HStack justify="space-between" mb={2}>
                            <HStack>
                              <Icon as={categoryIcons[goal.category]} color={goal.color} />
                              <Text fontWeight="bold" fontSize="lg" color={textPrimary}>{goal.title}</Text>
                            </HStack>
                            <HStack>
                              <IconButton
                                aria-label="Edit goal"
                                icon={<EditIcon />}
                                size="sm"
                                onClick={() => setEditingGoal({
                                  ...goal,
                                  checkpoints: goal.checkpoints.map(cp => ({...cp}))
                                })}
                              />
                              <IconButton
                                aria-label="Delete goal"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => goal.id && handleDeleteGoal(goal.id)}
                              />
                            </HStack>
                          </HStack>
                          
                          {goal.description && (
                            <Text color={textSecondary} mb={2}>{goal.description}</Text>
                          )}
                          
                          <HStack spacing={4} mb={2}>
                            <Text fontSize="sm" color={textPrimary}>
                              <strong>Current:</strong> {goal.currentValue}
                            </Text>
                            <Icon as={ChevronRightIcon} color={textMuted} />
                            <Text fontSize="sm" color={textPrimary}>
                              <strong>Target:</strong> {goal.targetValue}
                            </Text>
                          </HStack>
                          
                          <Progress
                            value={goal.progressPercentage}
                            size="sm"
                            colorScheme={goal.progressPercentage >= 75 ? 'green' : goal.progressPercentage >= 50 ? 'yellow' : 'red'}
                            mb={2}
                          />
                          
                          <Text fontSize="sm" color={textSecondary} mb={2}>
                            Progress: {goal.progressPercentage}%
                          </Text>
                          
                          {goal.checkpoints.length > 0 && (
                            <Accordion allowToggle>
                              <AccordionItem border="none">
                                <AccordionButton px={0}>
                                  <Box flex="1" textAlign="left">
                                    <Text fontSize="sm" color={textPrimary}>
                                      {goal.checkpoints.filter(cp => cp.completed).length} of {goal.checkpoints.length} tasks completed
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel px={0}>
                                  <VStack align="stretch" spacing={1}>
                                    {goal.checkpoints.map(checkpoint => (
                                      <HStack key={checkpoint.id} spacing={2}>
                                        <Checkbox
                                          isChecked={checkpoint.completed}
                                          onChange={(e) => goal.id && checkpoint.id && 
                                            handleToggleCheckpoint(goal.id, checkpoint.id, e.target.checked)
                                          }
                                        />
                                        <Text
                                          fontSize="sm"
                                          textDecoration={checkpoint.completed ? 'line-through' : 'none'}
                                          color={checkpoint.completed ? textMuted : textPrimary}
                                        >
                                          {checkpoint.title}
                                        </Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                  
                  {/* Category-specific tabs */}
                  {Object.entries(goalsByCategory).map(([category, categoryGoals]) => (
                    <TabPanel key={category}>
                      <VStack spacing={4} align="stretch">
                        {categoryGoals.map(goal => (
                          <Box
                            key={goal.id}
                            p={4}
                            borderWidth={1}
                            borderRadius="md"
                            borderLeftWidth={4}
                            borderLeftColor={goal.color || categoryColors[category]}
                          >
                            {/* Same goal display as above */}
                            <Text fontWeight="bold" color={textPrimary}>{goal.title}</Text>
                            <Progress value={goal.progressPercentage} size="sm" mt={2} />
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </VStack>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleAddGoal}>
            Add New Goal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GoalsModal;