import React, { useState } from "react";
import {
    VStack,
    HStack,
    Box,
    Text,
    IconButton,
    Badge,
    Button,
    Checkbox,
    Avatar,
    Tooltip,
    useColorModeValue,
    Card,
    CardBody,
    Divider,
    Progress,
    Flex,
    Icon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
} from "@chakra-ui/react";
import { gql, useMutation } from "@apollo/client";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiXCircle,
    FiFlag,
    FiCalendar,
    FiUser,
    FiMoreVertical,
    FiCheck,
    FiX,
} from "react-icons/fi";
import CommunicationTaskModal from "./CommunicationTaskModal";
import { getColor } from "../../brandConfig";
import { CommunicationTask } from "../../generated/graphql";

const TOGGLE_TASK_STATUS = gql`
    mutation ToggleCommunicationTaskStatus($id: ID!) {
        toggleCommunicationTaskStatus(id: $id) {
            id
            status
            completedAt
        }
    }
`;

const DELETE_TASK = gql`
    mutation DeleteCommunicationTask($id: ID!) {
        deleteCommunicationTask(id: $id)
    }
`;

interface CommunicationTaskListProps {
    tasks: CommunicationTask[];
    communicationId: string;
    communicationType: "INBOUND_EMAIL" | "OUTBOUND_EMAIL" | "SMS" | "PHONE_CALL" | "MEETING" | "OTHER";
    onTasksUpdated: () => void;
    allowEdit?: boolean;
}

const CommunicationTaskList: React.FC<CommunicationTaskListProps> = ({
    tasks,
    communicationId,
    communicationType,
    onTasksUpdated,
    allowEdit = true,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CommunicationTask | null>(null);
    const toast = useToast();

    // Theme colors from brandConfig
    const bg = getColor("background.cardGradient");
    const borderColor = getColor("border.darkCard");
    const textColor = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const mutedText = getColor("text.mutedDark");
    const cardBg = getColor("taskCardBg");

    const [toggleStatus] = useMutation(TOGGLE_TASK_STATUS, {
        onCompleted: () => {
            onTasksUpdated();
        },
        onError: (error) => {
            toast({
                title: "Error updating task",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        },
    });

    const [deleteTask] = useMutation(DELETE_TASK, {
        onCompleted: () => {
            toast({
                title: "Task deleted",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
            onTasksUpdated();
        },
        onError: (error) => {
            toast({
                title: "Error deleting task",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        },
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "TODO":
                return FiClock;
            case "IN_PROGRESS":
                return FiAlertCircle;
            case "COMPLETED":
                return FiCheckCircle;
            case "CANCELLED":
                return FiXCircle;
            default:
                return FiClock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "TODO":
                return "gray";
            case "IN_PROGRESS":
                return "blue";
            case "COMPLETED":
                return "green";
            case "CANCELLED":
                return "red";
            default:
                return "gray";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW":
                return "gray";
            case "MEDIUM":
                return "yellow";
            case "HIGH":
                return "orange";
            case "URGENT":
                return "red";
            default:
                return "gray";
        }
    };

    const handleEditTask = (task: CommunicationTask) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (taskId: string) => {
        await toggleStatus({ variables: { id: taskId } });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            await deleteTask({ variables: { id: taskId } });
        }
    };

    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // DEBUG: Log task data
    console.log('📋 [CommunicationTaskList] Tasks prop:', tasks);
    console.log('📋 [CommunicationTaskList] Tasks length:', tasks.length);
    console.log('📋 [CommunicationTaskList] Completed tasks:', completedTasks);

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Tomorrow";
        if (diffInDays === -1) return "Yesterday";
        if (diffInDays > 0 && diffInDays <= 7) return `In ${diffInDays} days`;
        if (diffInDays < 0) return `${Math.abs(diffInDays)} days overdue`;
        return date.toLocaleDateString();
    };

    return (
        <Card bg={bg} borderColor={borderColor} variant="outline">
            <CardBody>
                <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                                Tasks
                            </Text>
                            <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>
                                    {completedTasks} of {tasks.length} completed
                                </Text>
                                {tasks.length > 0 && (
                                    <Badge colorScheme={completionPercentage === 100 ? "green" : "blue"}>
                                        {Math.round(completionPercentage)}%
                                    </Badge>
                                )}
                            </HStack>
                        </VStack>
                        {allowEdit && (
                            <Button
                                leftIcon={<FiPlus />}
                                colorScheme="blue"
                                size="sm"
                                onClick={handleCreateTask}
                            >
                                Add Task
                            </Button>
                        )}
                    </HStack>

                    {/* Progress Bar */}
                    {tasks.length > 0 && (
                        <Progress
                            value={completionPercentage}
                            size="sm"
                            colorScheme={completionPercentage === 100 ? "green" : "blue"}
                            borderRadius="full"
                        />
                    )}

                    <Divider />

                    {/* Task List */}
                    {tasks.length === 0 ? (
                        <Box py={8} textAlign="center">
                            <Icon as={FiCheckCircle} boxSize={12} color={mutedText} mb={3} />
                            <Text color={mutedText}>No tasks yet</Text>
                            {allowEdit && (
                                <Button
                                    mt={3}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={handleCreateTask}
                                >
                                    Create your first task
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <VStack align="stretch" spacing={2}>
                            {tasks.map((task) => (
                                <Box
                                    key={task.id}
                                    p={3}
                                    bg={cardBg}
                                    borderRadius="md"
                                    borderWidth={1}
                                    borderColor={borderColor}
                                    opacity={task.status === "COMPLETED" ? 0.7 : 1}
                                    _hover={{ shadow: "sm" }}
                                >
                                    <HStack justify="space-between" align="start">
                                        <HStack align="start" spacing={3} flex={1}>
                                            {/* Checkbox */}
                                            {allowEdit && (
                                                <Checkbox
                                                    isChecked={task.status === "COMPLETED"}
                                                    onChange={() => handleToggleStatus(task.id)}
                                                    colorScheme="green"
                                                    mt={1}
                                                />
                                            )}

                                            {/* Task Content */}
                                            <VStack align="start" spacing={1} flex={1}>
                                                <Text
                                                    fontWeight="medium"
                                                    color={textColor}
                                                    textDecoration={task.status === "COMPLETED" ? "line-through" : "none"}
                                                >
                                                    {task.title}
                                                </Text>
                                                {task.description && (
                                                    <Text fontSize="sm" color={textSecondary}>
                                                        {task.description}
                                                    </Text>
                                                )}
                                                
                                                {/* Metadata */}
                                                <HStack spacing={3} flexWrap="wrap">
                                                    <Badge colorScheme={getStatusColor(task.status)} size="sm">
                                                        <HStack spacing={1}>
                                                            <Icon as={getStatusIcon(task.status)} boxSize={3} />
                                                            <Text fontSize="xs">{task.status.replace("_", " ")}</Text>
                                                        </HStack>
                                                    </Badge>
                                                    
                                                    <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                                                        <HStack spacing={1}>
                                                            <Icon as={FiFlag} boxSize={3} />
                                                            <Text fontSize="xs">{task.priority}</Text>
                                                        </HStack>
                                                    </Badge>
                                                    
                                                    {task.dueDate && (
                                                        <Badge
                                                            colorScheme={isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "red" : "purple"}
                                                            size="sm"
                                                        >
                                                            <HStack spacing={1}>
                                                                <Icon as={FiCalendar} boxSize={3} />
                                                                <Text fontSize="xs">{formatDueDate(task.dueDate)}</Text>
                                                            </HStack>
                                                        </Badge>
                                                    )}
                                                    
                                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                                        <HStack spacing={1}>
                                                            <Icon as={FiUser} boxSize={3} color={mutedText} />
                                                            <Text fontSize="xs" color={mutedText}>
                                                                {task.assignedTo[0].fName} {task.assignedTo[0].lName}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {/* Actions */}
                                        {allowEdit && (
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<FiMoreVertical />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        icon={<FiEdit2 />}
                                                        onClick={() => handleEditTask(task)}
                                                    >
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<FiTrash2 />}
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        color="red.500"
                                                    >
                                                        Delete
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        )}
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </CardBody>

            {/* Task Modal */}
            <CommunicationTaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
                communicationId={communicationId}
                communicationType={communicationType}
                onTaskCreated={onTasksUpdated}
                existingTask={selectedTask ? {
                    id: selectedTask.id,
                    title: selectedTask.title,
                    description: selectedTask.description || undefined,
                    status: selectedTask.status,
                    priority: selectedTask.priority,
                    dueDate: selectedTask.dueDate || undefined,
                    assignedTo: selectedTask.assignedTo?.map(a => ({ id: a.id })) || undefined,
                    notes: selectedTask.notes || undefined
                } : undefined}
            />
        </Card>
    );
};

export default CommunicationTaskList;