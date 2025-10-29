import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Checkbox,
  HStack,
  VStack,
  Text,
  Input,
  IconButton,
  Progress,
  Badge,
  Collapse,
  useToast,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  GET_EVENT_TASKS,
  CREATE_EVENT_TASK,
  UPDATE_EVENT_TASK,
  DELETE_EVENT_TASK,
  ADD_CHECKLIST_ITEM,
  UPDATE_CHECKLIST_ITEM,
  REMOVE_CHECKLIST_ITEM,
  TOGGLE_TASK_COMPLETION,
} from '../graphql/eventTasks.graphql';
import { v4 as uuidv4 } from 'uuid';

interface EventTasksTabProps {
  eventId: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  checklistItems: ChecklistItem[];
  progressPercentage: number;
  totalChecklistItems: number;
  completedChecklistItems: number;
}

export const EventTasksTab: React.FC<EventTasksTabProps> = ({ eventId }) => {
  const toast = useToast();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newChecklistItems, setNewChecklistItems] = useState<{ [taskId: string]: string }>({});

  const { data, loading, refetch } = useQuery(GET_EVENT_TASKS, {
    variables: { calendarEventId: eventId },
    skip: !eventId,
  });

  const [createTask] = useMutation(CREATE_EVENT_TASK, {
    onCompleted: () => {
      toast({ title: 'Task created', status: 'success', duration: 2000 });
      setNewTaskTitle('');
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error creating task', description: error.message, status: 'error', duration: 3000 });
    },
  });

  const [updateTask] = useMutation(UPDATE_EVENT_TASK, {
    onCompleted: () => {
      toast({ title: 'Task updated', status: 'success', duration: 2000 });
      refetch();
    },
  });

  const [deleteTask] = useMutation(DELETE_EVENT_TASK, {
    onCompleted: () => {
      toast({ title: 'Task deleted', status: 'success', duration: 2000 });
      refetch();
    },
  });

  const [toggleCompletion] = useMutation(TOGGLE_TASK_COMPLETION, {
    onCompleted: () => {
      refetch();
    },
  });

  const [addChecklistItem] = useMutation(ADD_CHECKLIST_ITEM, {
    onCompleted: () => {
      refetch();
    },
  });

  const [updateChecklistItem] = useMutation(UPDATE_CHECKLIST_ITEM, {
    onCompleted: () => {
      refetch();
    },
  });

  const [removeChecklistItem] = useMutation(REMOVE_CHECKLIST_ITEM, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    await createTask({
      variables: {
        input: {
          calendarEventId: eventId,
          title: newTaskTitle,
          checklistItems: [],
        },
      },
    });
  };

  const handleToggleTask = (taskId: string) => {
    toggleCompletion({ variables: { id: taskId } });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask({ variables: { id: taskId } });
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddChecklistItem = (taskId: string) => {
    const title = newChecklistItems[taskId];
    if (!title?.trim()) return;

    addChecklistItem({
      variables: {
        taskId,
        item: {
          id: uuidv4(),
          title,
          completed: false,
          order: 0,
        },
      },
    });

    setNewChecklistItems({ ...newChecklistItems, [taskId]: '' });
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string, currentStatus: boolean) => {
    updateChecklistItem({
      variables: {
        input: {
          taskId,
          checklistItemId: itemId,
          completed: !currentStatus,
        },
      },
    });
  };

  const handleRemoveChecklistItem = (taskId: string, itemId: string) => {
    removeChecklistItem({
      variables: {
        taskId,
        checklistItemId: itemId,
      },
    });
  };

  const tasks: Task[] = data?.calendarEventTasks || [];

  if (loading) {
    return <Text>Loading tasks...</Text>;
  }

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="bold">
        Event Tasks
      </Text>

      {/* Add New Task */}
      <HStack>
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
        />
        <IconButton
          aria-label="Add task"
          icon={<AddIcon />}
          onClick={handleCreateTask}
          colorScheme="blue"
          isDisabled={!newTaskTitle.trim()}
        />
      </HStack>

      {/* Task List */}
      <VStack align="stretch" spacing={3}>
        {tasks.map((task) => (
          <Box key={task.id} borderWidth={1} borderRadius="md" p={3}>
            <HStack justify="space-between" mb={2}>
              <HStack flex={1} spacing={3}>
                <Checkbox
                  isChecked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  size="lg"
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text
                    fontWeight="medium"
                    textDecoration={task.completed ? 'line-through' : 'none'}
                    opacity={task.completed ? 0.6 : 1}
                  >
                    {task.title}
                  </Text>
                  {task.checklistItems.length > 0 && (
                    <HStack spacing={2} fontSize="sm">
                      <Text color="gray.600">
                        {task.completedChecklistItems}/{task.totalChecklistItems} completed
                      </Text>
                      <Progress
                        value={task.progressPercentage}
                        size="sm"
                        width="100px"
                        colorScheme="green"
                        borderRadius="full"
                      />
                    </HStack>
                  )}
                </VStack>
              </HStack>
              <HStack>
                <IconButton
                  aria-label="Toggle checklist"
                  icon={expandedTasks.has(task.id) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleTaskExpansion(task.id)}
                />
                <IconButton
                  aria-label="Delete task"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.id)}
                />
              </HStack>
            </HStack>

            {/* Checklist Items */}
            <Collapse in={expandedTasks.has(task.id)} animateOpacity>
              <VStack align="stretch" spacing={2} mt={3} pl={8}>
                <Divider />
                {task.checklistItems.map((item) => (
                  <HStack key={item.id} spacing={2}>
                    <Checkbox
                      isChecked={item.completed}
                      onChange={() => handleToggleChecklistItem(task.id, item.id, item.completed)}
                      size="sm"
                    />
                    <Text
                      flex={1}
                      fontSize="sm"
                      textDecoration={item.completed ? 'line-through' : 'none'}
                      opacity={item.completed ? 0.6 : 1}
                    >
                      {item.title}
                    </Text>
                    <IconButton
                      aria-label="Remove item"
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => handleRemoveChecklistItem(task.id, item.id)}
                    />
                  </HStack>
                ))}

                {/* Add Checklist Item */}
                <HStack mt={2}>
                  <Input
                    placeholder="Add checklist item..."
                    value={newChecklistItems[task.id] || ''}
                    onChange={(e) =>
                      setNewChecklistItems({ ...newChecklistItems, [task.id]: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem(task.id)}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Add item"
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() => handleAddChecklistItem(task.id)}
                    isDisabled={!newChecklistItems[task.id]?.trim()}
                  />
                </HStack>
              </VStack>
            </Collapse>
          </Box>
        ))}
      </VStack>

      {tasks.length === 0 && (
        <Box textAlign="center" py={8} color="gray.500">
          <Text>No tasks yet. Add your first task above!</Text>
        </Box>
      )}
    </VStack>
  );
};
