import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Input,
    FormControl,
    FormLabel,
    useToast,
    Select,
    Textarea,
    HStack,
    Badge,
    Avatar,
    Text,
    useColorModeValue,
    Box,
    Icon,
    FormHelperText,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { FiCalendar, FiUser, FiFlag, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { getColor } from "../../brandConfig";

const CREATE_COMMUNICATION_TASK = gql`
    mutation CreateCommunicationTask($input: CommunicationTaskInput!) {
        createCommunicationTask(input: $input) {
            id
            title
            description
            status
            priority
            dueDate
            assignedTo {
                id
                fName
                lName
                email
            }
            notes
            communicationId
            communicationType
            createdAt
        }
    }
`;

const UPDATE_COMMUNICATION_TASK = gql`
    mutation UpdateCommunicationTask($id: ID!, $input: UpdateCommunicationTaskInput!) {
        updateCommunicationTask(id: $id, input: $input) {
            id
            title
            description
            status
            priority
            dueDate
            assignedTo {
                id
                fName
                lName
                email
            }
            notes
            completedAt
        }
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

interface CommunicationTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    communicationId: string;
    communicationType: "INBOUND_EMAIL" | "OUTBOUND_EMAIL" | "SMS" | "PHONE_CALL" | "MEETING" | "OTHER";
    onTaskCreated?: () => void;
    existingTask?: {
        id: string;
        title: string;
        description?: string;
        status: string;
        priority: string;
        dueDate?: string;
        assignedTo?: { id: string }[];
        notes?: string;
    };
}

const CommunicationTaskModal: React.FC<CommunicationTaskModalProps> = ({
    isOpen,
    onClose,
    communicationId,
    communicationType,
    onTaskCreated,
    existingTask,
}) => {
    const toast = useToast();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [assignedToIds, setAssignedToIds] = useState<string[]>([]);
    const [notes, setNotes] = useState("");

    // Theme colors from brandConfig
    const bg = getColor("background.cardGradient");
    const borderColor = getColor("border.darkCard");
    const textColor = getColor("text.primaryDark");
    const mutedText = getColor("text.mutedDark");
    const modalBg = getColor("background.main");
    const inputBg = getColor("background.main");

    const { data: clientsData } = useQuery(GET_CLIENTS);

    const [createTask, { loading: creating }] = useMutation(CREATE_COMMUNICATION_TASK, {
        onCompleted: () => {
            toast({
                title: "Task created",
                description: "The task has been created successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onTaskCreated?.();
            handleClose();
        },
        onError: (error) => {
            toast({
                title: "Error creating task",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const [updateTask, { loading: updating }] = useMutation(UPDATE_COMMUNICATION_TASK, {
        onCompleted: () => {
            toast({
                title: "Task updated",
                description: "The task has been updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onTaskCreated?.();
            handleClose();
        },
        onError: (error) => {
            toast({
                title: "Error updating task",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    useEffect(() => {
        if (existingTask) {
            setTitle(existingTask.title);
            setDescription(existingTask.description || "");
            setStatus(existingTask.status);
            setPriority(existingTask.priority);
            
            // Format the date for the datetime-local input
            if (existingTask.dueDate) {
                const date = new Date(existingTask.dueDate);
                // Format as YYYY-MM-DDTHH:mm for datetime-local input
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
            } else {
                setDueDate("");
            }
            
            setAssignedToIds(existingTask.assignedTo?.map((a) => a.id) || []);
            setNotes(existingTask.notes || "");
        }
    }, [existingTask]);

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("MEDIUM");
        setDueDate("");
        setAssignedToIds([]);
        setNotes("");
        onClose();
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast({
                title: "Title required",
                description: "Please enter a task title",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Format the date properly for GraphQL DateTime scalar
        let formattedDueDate;
        if (dueDate) {
            // If the date string doesn't include seconds, add them
            if (dueDate.length === 16) { // Format: "2025-08-28T18:42"
                formattedDueDate = new Date(dueDate + ":00").toISOString();
            } else {
                formattedDueDate = new Date(dueDate).toISOString();
            }
        }

        const input: any = {
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            dueDate: formattedDueDate || undefined,
            assignedTo: assignedToIds.length > 0 ? assignedToIds : undefined,
            notes: notes.trim() || undefined,
        };

        if (existingTask) {
            await updateTask({
                variables: { id: existingTask.id, input },
            });
        } else {
            await createTask({
                variables: {
                    input: {
                        ...input,
                        communicationId,
                        communicationType,
                    },
                },
            });
        }
    };

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

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
            <ModalContent 
                bg={modalBg} 
                border="1px solid" 
                borderColor={borderColor}
                color={textColor}
            >
                <ModalHeader color={textColor} borderBottom="1px solid" borderColor={borderColor}>
                    {existingTask ? "Edit Task" : "Create Task"}
                </ModalHeader>
                <ModalCloseButton color={textColor} />
                <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel color={textColor}>Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title"
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                _placeholder={{ color: mutedText }}
                                _hover={{ borderColor: getColor("primaryBlue") }}
                                _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                            />
                            <FormHelperText color={mutedText}>Brief title describing the task</FormHelperText>
                        </FormControl>

                        <FormControl>
                            <FormLabel color={textColor}>Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed description of the task"
                                rows={3}
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                _placeholder={{ color: mutedText }}
                                _hover={{ borderColor: getColor("primaryBlue") }}
                                _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                            />
                        </FormControl>

                        <HStack spacing={4}>
                            <FormControl flex={1}>
                                <FormLabel color={textColor}>
                                    <HStack spacing={2}>
                                        <Icon as={getStatusIcon(status)} color={textColor} />
                                        <Text>Status</Text>
                                    </HStack>
                                </FormLabel>
                                <Select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    _hover={{ borderColor: getColor("primaryBlue") }}
                                    _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </Select>
                            </FormControl>

                            <FormControl flex={1}>
                                <FormLabel color={textColor}>
                                    <HStack spacing={2}>
                                        <Icon as={FiFlag} color={textColor} />
                                        <Text>Priority</Text>
                                    </HStack>
                                </FormLabel>
                                <Select 
                                    value={priority} 
                                    onChange={(e) => setPriority(e.target.value)}
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    _hover={{ borderColor: getColor("primaryBlue") }}
                                    _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </Select>
                            </FormControl>
                        </HStack>

                        <HStack spacing={4}>
                            <FormControl flex={1}>
                                <FormLabel color={textColor}>
                                    <HStack spacing={2}>
                                        <Icon as={FiCalendar} color={textColor} />
                                        <Text>Due Date</Text>
                                    </HStack>
                                </FormLabel>
                                <Input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    _hover={{ borderColor: getColor("primaryBlue") }}
                                    _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                                />
                            </FormControl>

                            <FormControl flex={1}>
                                <FormLabel color={textColor}>
                                    <HStack spacing={2}>
                                        <Icon as={FiUser} color={textColor} />
                                        <Text>Assign To</Text>
                                    </HStack>
                                </FormLabel>
                                <Select
                                    value={assignedToIds[0] || ""}
                                    onChange={(e) => setAssignedToIds(e.target.value ? [e.target.value] : [])}
                                    placeholder="Select assignee"
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    color={textColor}
                                    _placeholder={{ color: mutedText }}
                                    _hover={{ borderColor: getColor("primaryBlue") }}
                                    _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                                >
                                    {clientsData?.clients?.map((client: any) => (
                                        <option key={client.id} value={client.id}>
                                            {client.fName} {client.lName} - {client.email}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </HStack>

                        <FormControl>
                            <FormLabel color={textColor}>Notes</FormLabel>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional notes or context"
                                rows={2}
                                bg={inputBg}
                                borderColor={borderColor}
                                color={textColor}
                                _placeholder={{ color: mutedText }}
                                _hover={{ borderColor: getColor("primaryBlue") }}
                                _focus={{ borderColor: getColor("primaryBlue"), boxShadow: "none" }}
                            />
                        </FormControl>

                        {/* Status and Priority Preview */}
                        <Box p={3} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                            <HStack spacing={4}>
                                <Badge colorScheme={getStatusColor(status)} px={2} py={1}>
                                    <HStack spacing={1}>
                                        <Icon as={getStatusIcon(status)} />
                                        <Text>{status.replace("_", " ")}</Text>
                                    </HStack>
                                </Badge>
                                <Badge colorScheme={getPriorityColor(priority)} px={2} py={1}>
                                    <HStack spacing={1}>
                                        <Icon as={FiFlag} />
                                        <Text>{priority}</Text>
                                    </HStack>
                                </Badge>
                                {dueDate && (
                                    <Badge colorScheme="purple" px={2} py={1}>
                                        <HStack spacing={1}>
                                            <Icon as={FiCalendar} />
                                            <Text>Due: {new Date(dueDate).toLocaleDateString()}</Text>
                                        </HStack>
                                    </Badge>
                                )}
                            </HStack>
                        </Box>

                        <HStack justify="flex-end" spacing={3}>
                            <Button 
                                variant="ghost" 
                                onClick={handleClose}
                                color={textColor}
                                _hover={{ bg: getColor("background.cardGradient") }}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleSubmit}
                                isLoading={creating || updating}
                                loadingText={existingTask ? "Updating..." : "Creating..."}
                            >
                                {existingTask ? "Update Task" : "Create Task"}
                            </Button>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CommunicationTaskModal;