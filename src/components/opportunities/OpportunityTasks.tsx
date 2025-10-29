import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Spinner,
} from '@chakra-ui/react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { getColor } from "../../brandConfig";

// GraphQL Queries and Mutations
const GET_OPPORTUNITY_TASKS = gql`
  query GetOpportunityTasks($opportunityId: String!) {
    opportunityTasks(opportunityId: $opportunityId) {
      id
      title
      description
      type
      priority
      status
      dueDate
      assignedTo
      assignedToName
      notes
      isBlocking
      createdAt
      updatedAt
    }
  }
`;

const CREATE_OPPORTUNITY_TASK = gql`
  mutation CreateOpportunityTask($input: OpportunityTaskInput!) {
    createOpportunityTask(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_OPPORTUNITY_TASK = gql`
  mutation UpdateOpportunityTask($id: String!, $input: OpportunityTaskUpdateInput!) {
    updateOpportunityTask(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const DELETE_OPPORTUNITY_TASK = gql`
  mutation DeleteOpportunityTask($id: String!) {
    deleteOpportunityTask(id: $id)
  }
`;

interface OpportunityTasksProps {
  opportunityId: string;
}

export const OpportunityTasks: React.FC<OpportunityTasksProps> = ({ opportunityId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'OTHER',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: '',
    notes: '',
    isBlocking: false,
  });

  const toast = useToast();

  // Color scheme
  const primaryColor = getColor("blue.500");
  const cardBorder = "rgba(255, 255, 255, 0.1)";
  const textPrimary = "white";
  const textMuted = "gray.400";
  const cardGradientBg = "linear-gradient(135deg, rgba(31, 37, 89, 0.8) 0%, rgba(17, 21, 51, 0.8) 100%)";

  // Queries
  const { loading, data, refetch } = useQuery(GET_OPPORTUNITY_TASKS, {
    variables: { opportunityId },
  });

  // Mutations
  const [createTask] = useMutation(CREATE_OPPORTUNITY_TASK, {
    onCompleted: () => {
      toast({
        title: 'Task created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error creating task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateTask] = useMutation(UPDATE_OPPORTUNITY_TASK, {
    onCompleted: () => {
      toast({
        title: 'Task updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteTask] = useMutation(DELETE_OPPORTUNITY_TASK, {
    onCompleted: () => {
      toast({
        title: 'Task deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleOpenModal = (task?: any) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo || '',
        notes: task.notes || '',
        isBlocking: task.isBlocking || false,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        type: 'OTHER',
        priority: 'MEDIUM',
        dueDate: '',
        assignedTo: '',
        notes: '',
        isBlocking: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    const input: any = {
      ...formData,
      opportunityId,
    };

    if (formData.dueDate) {
      input.dueDate = new Date(formData.dueDate);
    }

    if (editingTask) {
      await updateTask({
        variables: {
          id: editingTask.id,
          input: {
            ...formData,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          },
        },
      });
    } else {
      await createTask({
        variables: { input },
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask({
        variables: { id: taskId },
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask({
      variables: {
        id: taskId,
        input: { status: newStatus },
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'IN_PROGRESS': return 'blue';
      case 'PENDING': return 'gray';
      case 'CANCELLED': return 'red';
      case 'DEFERRED': return 'purple';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="xl" color={primaryColor} />
      </Box>
    );
  }

  const tasks = data?.opportunityTasks || [];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
          Tasks ({tasks.length})
        </Text>
        <Button
          leftIcon={<FiPlus />}
          onClick={() => handleOpenModal()}
          size="sm"
          bg={primaryColor}
          color="white"
          _hover={{ opacity: 0.8 }}
        >
          Add Task
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        {tasks.length === 0 ? (
          <Text color={textMuted} textAlign="center" py={4}>
            No tasks yet. Create your first task to track activities for this opportunity.
          </Text>
        ) : (
          tasks.map((task: any) => (
            <Box
              key={task.id}
              p={4}
              bg={cardGradientBg}
              borderRadius="md"
              border="1px"
              borderColor={cardBorder}
            >
              <HStack justify="space-between" mb={2}>
                <HStack spacing={3}>
                  <IconButton
                    aria-label="Complete task"
                    icon={<FiCheck />}
                    size="sm"
                    variant={task.status === 'COMPLETED' ? 'solid' : 'outline'}
                    colorScheme={task.status === 'COMPLETED' ? 'green' : 'gray'}
                    onClick={() => handleStatusChange(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color={textPrimary}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text fontSize="sm" color={textMuted}>
                        {task.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
                <HStack>
                  <IconButton
                    aria-label="Edit task"
                    icon={<FiEdit />}
                    size="sm"
                    variant="ghost"
                    color={textMuted}
                    onClick={() => handleOpenModal(task)}
                  />
                  <IconButton
                    aria-label="Delete task"
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    onClick={() => handleDeleteTask(task.id)}
                  />
                </HStack>
              </HStack>

              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                  {task.priority}
                </Badge>
                <Badge colorScheme={getStatusColor(task.status)} size="sm">
                  {task.status}
                </Badge>
                <Badge colorScheme="purple" size="sm">
                  {task.type}
                </Badge>
                {task.isBlocking && (
                  <Badge colorScheme="red" size="sm">
                    <FiAlertCircle style={{ marginRight: '4px' }} />
                    BLOCKING
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge colorScheme="blue" size="sm">
                    <FiCalendar style={{ marginRight: '4px' }} />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </Badge>
                )}
                {task.assignedToName && (
                  <Badge colorScheme="cyan" size="sm">
                    Assigned to: {task.assignedToName}
                  </Badge>
                )}
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>
            {editingTask ? 'Edit Task' : 'New Task'}
          </ModalHeader>
          <ModalCloseButton color={textMuted} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textMuted}>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textMuted}>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel color={textMuted}>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="DEMO">Demo</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="RESEARCH">Research</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textMuted}>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color={textMuted}>Due Date</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textMuted}>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={formData.isBlocking}
                  onChange={(e) => setFormData({ ...formData, isBlocking: e.target.checked })}
                  colorScheme="blue"
                  color={textMuted}
                >
                  This task blocks opportunity progression
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal} color={textMuted}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveTask}
              bg={primaryColor}
            >
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};