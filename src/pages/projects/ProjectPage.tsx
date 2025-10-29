import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { FORMAT_SPEC_CONTENT, BILL_TEMPLATE_CONTENT, downloadMarkdownFile } from "./markdownTemplates";
import {
    Box,
    Container,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    Skeleton,
    SimpleGrid,
    Avatar,
    Icon,
    Button,
    Input,
    Textarea,
    IconButton,
    useToast,
    Select,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Progress,
    Stack,
    Center,
    Spinner,
    Flex,
    Tooltip,
    Divider,
} from "@chakra-ui/react";
import { keyframes } from '@emotion/react';
import { motion } from "framer-motion";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import projectsModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { FiUsers, FiCheckCircle, FiLock, FiHome, FiAlertCircle, FiArrowUp, FiArrowDown, FiClock, FiPlus, FiInfo } from "react-icons/fi";
import { EditIcon, CheckIcon, DeleteIcon, DownloadIcon, ViewIcon } from "@chakra-ui/icons";
import { TaskModal } from "./TaskModal";
import { AddMemberModal } from "./AddMemberModal";
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdf.js worker for react-pdf v10 with Create React App
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { useAuth } from "../../contexts/AuthContext";
import { LoginWithSmsModal } from "../authentication";
import { normalizeMediaUrl } from "../../helpers";
import { Bill, Project, ProjectTask, TaskStatus } from "../../generated/graphql";

// Define pulse animation for checkbox
const pulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
`;

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      projectName
      projectGoal
      projectDescription
      progress
      createdAt
      updatedAt
      billingClient {
        id
        fName
        lName
        email
      }
      members {
        id
        fName
        lName
        email
      }
      tasks {
        id
        description
        status
        order
        assignedTo {
          id
          fName
          lName
          email
          profilePhoto
        }
        media {
          url
          description
          fileType
        }
        billed
        billable
      }
      bills {
        id
      }
    }
  }
`;

const PUBLIC_GET_PROJECT = gql`
  query PublicGetProject($id: ID!) {
    publicProject(id: $id) {
      id
      projectName
      projectGoal
      projectDescription
      progress
      createdAt
      updatedAt
      billingClient {
        id
        fName
        lName
        email
      }
      members {
        id
        fName
        lName
        email
      }
      tasks {
        id
        description
        status
        order
        assignedTo {
          id
          fName
          lName
          email
          profilePhoto
        }
        media {
          url
          description
          fileType
        }
        billed
        billable
      }
      bills {
        id
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectUpdateInput!) {
    updateProject(id: $id, input: $input) {
      id
      projectName
      projectGoal
      members {
        id
        fName
        lName
        email
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: TaskStatus!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      id
      description
      status
      assignedTo {
        id
        email
      }
    }
  }
`;

const DELETE_PHOTO = gql`
  mutation DeleteFile($url: String!) {
    deleteFromPinata(url: $url)
  }
`;

const CREATE_DRAFT_BILL_WITH_TASKS = gql`
  mutation CreateDraftBillWithTasks($projectId: ID!) {
    createDraftBillWithTasks(projectId: $projectId) {
      id
      lineItems {
        id
        description
        amount
 
      }
      service {
        id
        client {
          id
          fName
          lName
        }
      }
   
      isPaid
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const UPDATE_PROJECT_PROGRESS = gql`
  mutation UpdateProjectProgress($id: ID!, $input: UpdateProjectProgressInput!) {
    updateProjectProgress(id: $id, input: $input) {
      id
      progress
      projectName
      projectGoal
    }
  }
`;

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

const UPDATE_TASK_ORDER = gql`
  mutation UpdateTaskOrder($taskId: ID!, $order: Int!) {
    updateTaskOrder(taskId: $taskId, order: $order) {
      id
      order
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


const DELETE_TASK_MEDIA = gql`
  mutation DeleteTaskMedia($taskId: ID!, $photoUrl: String!) {
    deleteTaskMedia(taskId: $taskId, photoUrl: $photoUrl)
  }
`;

const EXPORT_PROJECT_TASKS_TO_MARKDOWN = gql`
  query ExportProjectTasksToMarkdown($projectId: ID!) {
    exportProjectTasksToMarkdown(projectId: $projectId)
  }
`;

const IMPORT_TASKS_FROM_MARKDOWN = gql`
  mutation ImportTasksFromMarkdown($projectId: ID!, $markdown: String!) {
    importTasksFromMarkdown(projectId: $projectId, markdown: $markdown) {
      id
      projectName
    }
  }
`;

const APPEND_TASKS_FROM_MARKDOWN = gql`
  mutation AppendTasksFromMarkdown($projectId: ID!, $markdown: String!) {
    appendTasksFromMarkdown(projectId: $projectId, markdown: $markdown) {
      id
      projectName
    }
  }
`;

interface Member {
    id: string;
    fName: string;
    lName: string;
    email: string;
}


const ProjectPage = () => {
    usePageTitle("Project Details");
    const { id } = useParams<{ id: string }>();
    const { loading: authLoading, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // State declarations (moved before their use in hooks)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; description?: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
interface Task {
        id: string;
        description: string;
        status: string;
        order?: number;
        media?: any[];
        assignedTo?: { id: string; fName: string; lName: string }[];
        billable?: boolean;
        billed?: boolean;
    }

    const [editedName, setEditedName] = useState("");
    const [editedGoal, setEditedGoal] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [tempOrder, setTempOrder] = useState<{ [key: string]: number }>({});
    const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isImprovingGoal, setIsImprovingGoal] = useState(false);
    const [isImprovingDescription, setIsImprovingDescription] = useState(false);

    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    // Use public query when not authenticated
    const projectQuery = isAuthenticated ? GET_PROJECT : PUBLIC_GET_PROJECT;

    // GraphQL queries
    const { loading, error, data, refetch } = useQuery(projectQuery, {
        variables: { id },
        onCompleted: (data) => {
            console.log("Project data loaded:", data);
            // Get project from either authenticated or public query
            const project = data?.project || data?.publicProject;
            if (project?.tasks) {
                // Sort tasks by order and store them in state
                setOrderedTasks([...project.tasks].sort((a, b) => a.order - b.order));
            }
        },
        onError: (error) => {
            console.error("Project data error:", error);
        }
    });

    // Get clients for member selection
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);

    // Replace isAuthorized with proper admin check
    const isAdmin = user?.permissions?.includes("PROJECTS_ADMIN");

    // Export to markdown - lazy query
    const [exportProjectTasks, { loading: exportingTasks }] = useLazyQuery(EXPORT_PROJECT_TASKS_TO_MARKDOWN, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.exportProjectTasksToMarkdown) {
                const markdown = data.exportProjectTasksToMarkdown;
                const projectName = project?.projectName || 'project';
                const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tasks.md`;

                // Create blob and download
                const blob = new Blob([markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({
                    title: 'Tasks exported',
                    description: `Downloaded ${fileName}`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
        },
        onError: (error) => {
            toast({
                title: 'Export failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    // Import from markdown - file input refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const appendFileInputRef = useRef<HTMLInputElement>(null);
    const [importingFile, setImportingFile] = useState(false);
    const [appendingFile, setAppendingFile] = useState(false);

    // Import mutation (replaces all tasks)
    const [importTasksFromMarkdown] = useMutation(IMPORT_TASKS_FROM_MARKDOWN, {
        onCompleted: () => {
            toast({
                title: 'Tasks imported successfully',
                description: 'All tasks have been replaced with imported data',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setImportingFile(false);
            // Refetch project data
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Import failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setImportingFile(false);
        }
    });

    // Append mutation (adds tasks without deleting existing ones)
    const [appendTasksFromMarkdown] = useMutation(APPEND_TASKS_FROM_MARKDOWN, {
        onCompleted: () => {
            toast({
                title: 'Tasks appended successfully',
                description: 'Additional tasks added to project (existing tasks preserved)',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setAppendingFile(false);
            // Refetch project data
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Append failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setAppendingFile(false);
        }
    });

    // Handle file import (replaces tasks)
    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.md')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a .md (markdown) file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setImportingFile(true);

        try {
            // Read file content
            const reader = new FileReader();
            reader.onload = async (e) => {
                const markdown = e.target?.result as string;

                // Import to project
                await importTasksFromMarkdown({
                    variables: {
                        projectId: id,
                        markdown
                    }
                });
            };
            reader.readAsText(file);
        } catch (error: any) {
            toast({
                title: 'Error reading file',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setImportingFile(false);
        }

        // Reset file input
        event.target.value = '';
    };

    // Handle file append (adds tasks without deleting)
    const handleFileAppend = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.md')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a .md (markdown) file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setAppendingFile(true);

        try {
            // Read file content
            const reader = new FileReader();
            reader.onload = async (e) => {
                const markdown = e.target?.result as string;

                // Append to project
                await appendTasksFromMarkdown({
                    variables: {
                        projectId: id,
                        markdown
                    }
                });
            };
            reader.readAsText(file);
        } catch (error: any) {
            toast({
                title: 'Error reading file',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setAppendingFile(false);
        }

        // Reset file input
        event.target.value = '';
    };

    // Mutations
    const [updateProject] = useMutation(UPDATE_PROJECT);
    const [improveDescription] = useMutation(IMPROVE_DESCRIPTION);
    const [improveTagline] = useMutation(IMPROVE_TAGLINE);
    const [deleteTaskMedia] = useMutation(DELETE_TASK_MEDIA, {
        onCompleted: (data) => console.log("Task media deleted:", data),
        onError: (error) => console.error("Task media deletion error:", error)
    });
    const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
        onCompleted: (data) => console.log("Task status updated:", data),
        onError: (error) => console.error("Task status update error:", error),
        // Update the cache to reflect the change immediately
        update: (cache, { data }) => {
            if (data?.updateTaskStatus) {
                const updatedTask = data.updateTaskStatus;
                
                // Update the task in the project query cache
                try {
                    const existingData: any = cache.readQuery({
                        query: GET_PROJECT,
                        variables: { id }
                    });
                    
                    if (existingData?.project) {
                        const updatedTasks = existingData.project.tasks.map((task: any) => 
                            task.id === updatedTask.id 
                                ? { ...task, status: updatedTask.status }
                                : task
                        );
                        
                        cache.writeQuery({
                            query: GET_PROJECT,
                            variables: { id },
                            data: {
                                project: {
                                    ...existingData.project,
                                    tasks: updatedTasks
                                }
                            }
                        });
                        
                        // Also update orderedTasks state immediately
                        setOrderedTasks(prevTasks => 
                            prevTasks.map(task => 
                                task.id === updatedTask.id 
                                    ? { ...task, status: updatedTask.status }
                                    : task
                            )
                        );
                    }
                } catch (error) {
                    console.error("Error updating cache:", error);
                }
            }
        }
    });
    const [createDraftBill] = useMutation(CREATE_DRAFT_BILL_WITH_TASKS);
    const [deleteTask] = useMutation(DELETE_TASK);
    const [updateProjectProgress] = useMutation(UPDATE_PROJECT_PROGRESS, {
        onCompleted: () => {
            toast({
                title: "Progress Updated",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        },
        onError: (error) => {
            toast({
                title: "Error updating progress",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    });
    const [updateTaskOrder] = useMutation(UPDATE_TASK_ORDER);

    // Effects
    // Log modal state changes
    useEffect(() => {
        console.log("Add task modal state:", isTaskModalOpen);
        console.log("Selected image:", selectedImage);
    }, [isTaskModalOpen, selectedImage]);

    // Log state changes
    useEffect(() => {
        console.log("Project ID:", id);
        console.log("Loading state:", loading);
        console.log("Current project data:", data?.project);
        if (error) console.error("Query error:", error);
    }, [id, loading, data, error]);

    // Show login modal if not authenticated - COMMENTED OUT FOR TESTING
    // useEffect(() => {
    //     if (!authLoading && !isAuthenticated) {
    //         setIsLoginModalOpen(true);
    //     }
    // }, [isAuthenticated, authLoading]);

    // Update the values when data is loaded
    useEffect(() => {
        const project = data?.project || data?.publicProject;
        if (project) {
            setEditedName(project.projectName);
            setEditedGoal(project.projectGoal);
            setEditedDescription(project.projectDescription || "");
            // Sort tasks by order and store them in state
            if (project.tasks) {
                setOrderedTasks([...project.tasks].sort((a, b) => a.order - b.order));
            }
        }
    }, [data?.project, data?.publicProject]);

    const handleLoginModalClose = () => {
        setIsLoginModalOpen(false);
        if (!isAuthenticated) {
            navigate("/");
        }
    };

    const handleLoginSuccess = () => {
        // On successful login, just close the modal and stay on current page
        setIsLoginModalOpen(false);
        // Don't redirect - let the user stay on the project page
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

    // Generate AI contexts
    const getProjectGoalContext = (goal: string, projectName: string) => {
        return `Please create a single, concise project goal for "${projectName || 'this project'}" in maximum 17 words. Focus on the key outcome or value proposition. Return ONLY the improved goal without any preamble, explanation, or quotes. Current goal: "${goal}"`;
    };

    const getProjectDescriptionContext = (description: string, projectName: string) => {
        return `Please create a compelling project description for "${projectName || 'this project'}" in maximum 70 words. This should expand on the goal to explain what the project does, who it's for, and what makes it unique. Be specific and value-focused. Return ONLY the improved description without any preamble, explanation, or quotes. Current description: "${description}"`;
    };

    const handleImproveProjectGoal = async () => {
        if (!editedGoal.trim()) {
            toast({
                title: "Please enter a project goal first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingGoal(true);
        try {
            const context = getProjectGoalContext(editedGoal, editedName);
            const { data } = await improveTagline({
                variables: { text: editedGoal, context }
            });
            if (data?.improveTagline) {
                setEditedGoal(cleanAIResponse(data.improveTagline));
                toast({
                    title: "✨ Project goal improved!",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving project goal:', error);
            toast({
                title: "Failed to improve project goal",
                description: error instanceof Error ? error.message : "Please try again",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingGoal(false);
        }
    };

    const handleImproveProjectDescription = async () => {
        if (!editedDescription.trim() && !editedName.trim()) {
            toast({
                title: "Please enter a project name or description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingDescription(true);
        try {
            const context = getProjectDescriptionContext(editedDescription || editedName, editedName);
            const { data } = await improveDescription({
                variables: { text: editedDescription || editedName, context }
            });
            if (data?.improveDescription) {
                setEditedDescription(cleanAIResponse(data.improveDescription));
                toast({
                    title: "✨ Project description improved!",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving project description:', error);
            toast({
                title: "Failed to improve project description",
                description: error instanceof Error ? error.message : "Please try again",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingDescription(false);
        }
    };

    const handleSave = async () => {
        try {
            await updateProject({
                variables: {
                    id,
                    input: {
                        projectName: editedName,
                        projectGoal: editedGoal,
                        projectDescription: editedDescription,
                    },
                },
            });
            setIsEditing(false);
            refetch(); // Refresh project data
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const handleAddMember = async () => {
        if (!selectedClientId) {
            toast({
                title: "Please select a client",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Check if client is already a member
        const isAlreadyMember = project.members?.some((member: any) => member.id === selectedClientId);
        if (isAlreadyMember) {
            toast({
                title: "Client is already a member",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const currentMemberIds = project.members?.map((member: any) => member.id) || [];
            const updatedMemberIds = [...currentMemberIds, selectedClientId];

            await updateProject({
                variables: {
                    id,
                    input: {
                        members: updatedMemberIds,
                    },
                },
            });

            setSelectedClientId("");
            setIsAddingMember(false);
            refetch(); // Refresh project data

            toast({
                title: "Member added successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error adding member:", error);
            toast({
                title: "Error adding member",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (window.confirm("Are you sure you want to remove this member from the project?")) {
            try {
                const currentMemberIds = project.members?.map((member: any) => member.id) || [];
                const updatedMemberIds = currentMemberIds.filter((id: string) => id !== memberId);

                await updateProject({
                    variables: {
                        id,
                        input: {
                            members: updatedMemberIds,
                        },
                    },
                });

                refetch(); // Refresh project data

                toast({
                    title: "Member removed successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error removing member:", error);
                toast({
                    title: "Error removing member",
                    description: error instanceof Error ? error.message : "Unknown error occurred",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleCreateBill = async () => {
        // Add confirmation dialog
        if (window.confirm("Are you sure you want to create a bill for the completed tasks?")) {
            try {
                const { data } = await createDraftBill({
                    variables: { projectId: id }
                });

                toast({
                    title: "Bill Created",
                    description: "Draft bill has been created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Navigate to the bill details page
                navigate(`/bill/${data.createDraftBillWithTasks.id}`);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to create bill",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    // Functions to move tasks up and down
    const moveTaskUp = async (taskId: string, currentIndex: number) => {
        if (currentIndex <= 0) return; // Already at the top

        const newOrderedTasks = [...orderedTasks];
        const currentTask = newOrderedTasks[currentIndex];
        const prevTask = newOrderedTasks[currentIndex - 1];

        // Get order values
        const currentOrder = currentTask.order;
        const prevOrder = prevTask.order;

        // Create new task objects with updated orders
        const updatedCurrentTask = { ...currentTask };
        const updatedPrevTask = { ...prevTask };

        // Swap positions in array (but keep original objects for now)
        newOrderedTasks[currentIndex - 1] = updatedCurrentTask;
        newOrderedTasks[currentIndex] = updatedPrevTask;

        // Update state first for responsive UI
        setOrderedTasks(newOrderedTasks);

        // Update in database
        try {
            await updateTaskOrder({
                variables: {
                    taskId: currentTask.id,
                    order: prevOrder
                }
            });

            await updateTaskOrder({
                variables: {
                    taskId: prevTask.id,
                    order: currentOrder
                }
            });

            toast({
                title: "Task moved up",
                status: "success",
                duration: 1000,
                isClosable: true,
            });

        } catch (error) {
            toast({
                title: "Error moving task",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            // Restore original order
            const project = data?.project || data?.publicProject;
            if (project?.tasks) {
                setOrderedTasks([...project.tasks].sort((a, b) => a.order - b.order));
            }
        }
    };

    const moveTaskDown = async (taskId: string, currentIndex: number) => {
        if (currentIndex >= orderedTasks.length - 1) return; // Already at the bottom

        const newOrderedTasks = [...orderedTasks];
        const currentTask = newOrderedTasks[currentIndex];
        const nextTask = newOrderedTasks[currentIndex + 1];

        // Get order values
        const currentOrder = currentTask.order;
        const nextOrder = nextTask.order;

        // Create new task objects with updated orders
        const updatedCurrentTask = { ...currentTask };
        const updatedNextTask = { ...nextTask };

        // Swap positions in array (but keep original objects for now)
        newOrderedTasks[currentIndex] = updatedNextTask;
        newOrderedTasks[currentIndex + 1] = updatedCurrentTask;

        // Update state first for responsive UI
        setOrderedTasks(newOrderedTasks);

        // Update in database
        try {
            await updateTaskOrder({
                variables: {
                    taskId: currentTask.id,
                    order: nextOrder
                }
            });

            await updateTaskOrder({
                variables: {
                    taskId: nextTask.id,
                    order: currentOrder
                }
            });

            toast({
                title: "Task moved down",
                status: "success",
                duration: 1000,
                isClosable: true,
            });

        } catch (error) {
            toast({
                title: "Error moving task",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            // Restore original order
            const project = data?.project || data?.publicProject;
            if (project?.tasks) {
                setOrderedTasks([...project.tasks].sort((a, b) => a.order - b.order));
            }
        }
    };

    // Loading state for both auth and data
    if (authLoading || loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center h="50vh">
                        <VStack spacing={6}>
                            <Spinner size="xl" color="blue.500" thickness="4px" />
                            <Text>Loading project data...</Text>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    // Not authenticated state - COMMENTED OUT FOR TESTING
    // if (!isAuthenticated) {
    //     return (
    //         <>
    //             <NavbarWithCallToAction />
    //             <Box minH="100vh" bg="gray.50" py={12}>
    //                 <Container maxW="md">
    //                     <VStack spacing={8}>
    //                         <Box bg="white" p={8} rounded="xl" shadow="lg" w="full">
    //                             <VStack spacing={4}>
    //                                 <Icon as={FiLock} boxSize={12} color="blue.500" />
    //                                 <Heading size="lg">Authentication Required</Heading>
    //                                 <Text textAlign="center">Please log in to view this project.</Text>
    //                                 <Button
    //                                     colorScheme="blue"
    //                                     onClick={() => setIsLoginModalOpen(true)}
    //                                     leftIcon={<FiLock />>
    //                                 >
    //                                     Log In
    //                                 </Button>
    //                             </VStack>
    //                         </Box>
    //                     </VStack>
    //                 </Container>
    //             </Box>
    //             <LoginWithSmsModal
    //                 isOpen={isLoginModalOpen}
    //                 onClose={handleLoginModalClose}
    //                 onLoginSuccess={handleLoginSuccess}
    //             />
    //             <FooterWithFourColumns />
    //         </>
    //     );
    // }

    if (error) {
        console.error("GraphQL Error:", error);
        return <Text>Error: {error.message}</Text>;
    }

    const project = data?.project || data?.publicProject;
    if (!project) {
        return <Text>Project not found</Text>;
    }

    // Check if the user is a member of the project or the client - COMMENTED OUT FOR TESTING
    // const isProjectMember = project.members?.some((member: any) => member.id === user?.id);
    // const isProjectClient = project.billingClient?.id === user?.id;

    // User needs to be admin, project member, or the client to view the project - COMMENTED OUT FOR TESTING
    // const hasProjectAccess = isAdmin || isProjectMember || isProjectClient;

    // No project access state - COMMENTED OUT FOR TESTING
    // if (!hasProjectAccess) {
    //     return (
    //         <>
    //             <NavbarWithCallToAction />
    //             <Box minH="100vh" bg="gray.50" py={12}>
    //                 <Container maxW="md">
    //                     <VStack spacing={8}>
    //                         <Box bg="white" p={8} rounded="xl" shadow="lg" w="full">
    //                             <VStack spacing={4}>
    //                                 <Icon as={FiAlertCircle} boxSize={12} color="red.500" />
    //                                 <Heading size="lg" color="red.500">Access Denied</Heading>
    //                                 <Text textAlign="center">You do not have permission to view this project.</Text>
    //                                 <Button
    //                                     colorScheme="blue"
    //                                     onClick={() => navigate("/")}
    //                                     leftIcon={<FiHome />>
    //                                 >
    //                                     Return to Home
    //                                 </Button>
    //                             </VStack>
    //                         </Box>
    //                     </VStack>
    //                 </Container>
    //             </Box>
    //             <FooterWithFourColumns />
    //         </>
    //     );
    // }

    return (
        <>
            <style>
                {`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                {/* Access badge commented out for testing */}
                {/* <Badge
                    mb={4}
                    colorScheme={isAdmin ? "green" : "blue"}
                    p={2}
                    borderRadius="md"
                    fontSize="sm"
                >
                    {isAdmin ? "Admin Access" : isProjectMember ? "Team Member Access" : "Client Access"}
                </Badge> */}
                <HStack justify="space-between" mb={4} wrap="wrap" spacing={4}>
                    <Box></Box> {/* Empty spacer to push buttons to the right */}
                    <HStack spacing={4}>
                        <Button
                            as={Link}
                            to={`/project/${id}/timeline`}
                            bg={getColor("status.info")}
                            color={getColor("text.inverse")}
                            _hover={{ bg: getColor("secondary") }}
                            leftIcon={<FiClock />}
                            fontFamily={brandConfig.fonts.body}
                        >
                            Timeline View
                        </Button>
                    </HStack>
                </HStack>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <VStack spacing={8} align="stretch">
                        {/* Project Overview Card */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="xl"
                            overflow="hidden"
                        >
                            <CardHeader bg="rgba(0, 0, 0, 0.2)" borderBottom="1px" borderColor={cardBorder}>
                                <VStack align="start" spacing={4}>
                                    <HStack justify="space-between" width="full">
                                        {isEditing ? (
                                            <Input
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                size="lg"
                                                variant="unstyled"
                                                fontWeight="bold"
                                                fontSize={{ base: "xl", md: "2xl" }}
                                                width="full"
                                                color={textPrimary}
                                                fontFamily={brandConfig.fonts.heading}
                                            />
                                        ) : (
                                            <Heading
                                                size={{ base: "md", md: "lg" }}
                                                wordBreak="break-word"
                                                pr={{ base: 2, md: 4 }}
                                                color={textPrimary}
                                                fontFamily={brandConfig.fonts.heading}
                                            >
                                                {project.projectName}
                                            </Heading>
                                        )}
                                        {isAdmin && (
                                            <IconButton
                                                aria-label="Edit project"
                                                icon={isEditing ? <CheckIcon /> : <EditIcon />}
                                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                                variant="ghost"
                                                flexShrink={0}
                                                color={textPrimary}
                                                _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                            />
                                        )}
                                    </HStack>
                                    <HStack spacing={4} flexWrap="wrap" gap={2}>
                                        <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                                            Project #{id}
                                        </Badge>
                                        <Text
                                            color={textSecondary}
                                            fontSize={{ base: "sm", md: "md" }}
                                            whiteSpace={{ base: "normal", md: "nowrap" }}
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            Created: {new Date(project.createdAt).toLocaleDateString()}
                                        </Text>
                                        {isAdmin && (
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => window.open(`/bills/new?projectId=${id}`, '_blank')}
                                                leftIcon={<Text>💰</Text>}
                                            >
                                                Create New Bill
                                            </Button>
                                        )}
                                    </HStack>
                                </VStack>
                            </CardHeader>
                            <CardBody p={8}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    {/* Left Column */}
                                    <VStack align="stretch" spacing={6}>
                                        <Box>
                                            <HStack justify="space-between" align="center" mb={2}>
                                                <Text fontWeight="bold" color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.body}>
                                                    Project Goal
                                                </Text>
                                                {isEditing && (
                                                    <HStack spacing={2}>
                                                        <Tooltip 
                                                            label={
                                                                <Box p={2} maxW="500px">
                                                                    <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                                    <Text fontSize="xs" whiteSpace="pre-wrap">
                                                                        {getProjectGoalContext(editedGoal || "[your project goal]", editedName)}
                                                                    </Text>
                                                                </Box>
                                                            }
                                                            placement="top"
                                                            hasArrow
                                                            bg="gray.700"
                                                            color="white"
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="purple"
                                                                isDisabled={!editedGoal.trim()}
                                                                isLoading={isImprovingGoal}
                                                                onClick={handleImproveProjectGoal}
                                                                leftIcon={<Text>✨</Text>}
                                                            >
                                                                AI Improve
                                                            </Button>
                                                        </Tooltip>
                                                        <IconButton
                                                            aria-label="Copy AI context"
                                                            icon={<Text>📋</Text>}
                                                            size="sm"
                                                            variant="ghost"
                                                            isDisabled={!editedGoal.trim()}
                                                            onClick={() => {
                                                                if (editedGoal.trim()) {
                                                                    navigator.clipboard.writeText(getProjectGoalContext(editedGoal, editedName));
                                                                    toast({
                                                                        title: "AI context copied!",
                                                                        description: "The project goal context has been copied to your clipboard",
                                                                        status: "success",
                                                                        duration: 2000,
                                                                    });
                                                                }
                                                            }}
                                                            title="Copy AI context to clipboard"
                                                        />
                                                    </HStack>
                                                )}
                                            </HStack>
                                            {isEditing ? (
                                                <Textarea
                                                    value={editedGoal}
                                                    onChange={(e) => setEditedGoal(e.target.value)}
                                                    size="sm"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    borderRadius="lg"
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily={brandConfig.fonts.body}
                                                    placeholder="Project goal (max 17 words)"
                                                    rows={2}
                                                />
                                            ) : (
                                                <Text color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.body}>
                                                    {project.projectGoal}
                                                </Text>
                                            )}
                                        </Box>
                                        <Box>
                                            <HStack justify="space-between" align="center" mb={2}>
                                                <Text fontWeight="bold" color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.body}>
                                                    Project Description
                                                </Text>
                                                {isEditing && (
                                                    <HStack spacing={2}>
                                                        <Tooltip 
                                                            label={
                                                                <Box p={2} maxW="600px">
                                                                    <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                                    <Text fontSize="xs" whiteSpace="pre-wrap">
                                                                        {getProjectDescriptionContext(editedDescription || "[your project description]", editedName)}
                                                                    </Text>
                                                                </Box>
                                                            }
                                                            placement="top"
                                                            hasArrow
                                                            bg="gray.700"
                                                            color="white"
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="purple"
                                                                isDisabled={!editedDescription.trim() && !editedName.trim()}
                                                                isLoading={isImprovingDescription}
                                                                onClick={handleImproveProjectDescription}
                                                                leftIcon={<Text>✨</Text>}
                                                            >
                                                                AI Improve
                                                            </Button>
                                                        </Tooltip>
                                                        <IconButton
                                                            aria-label="Copy AI context"
                                                            icon={<Text>📋</Text>}
                                                            size="sm"
                                                            variant="ghost"
                                                            isDisabled={!editedDescription.trim() && !editedName.trim()}
                                                            onClick={() => {
                                                                if (editedDescription.trim() || editedName.trim()) {
                                                                    navigator.clipboard.writeText(getProjectDescriptionContext(editedDescription || editedName, editedName));
                                                                    toast({
                                                                        title: "AI context copied!",
                                                                        description: "The project description context has been copied to your clipboard",
                                                                        status: "success",
                                                                        duration: 2000,
                                                                    });
                                                                }
                                                            }}
                                                            title="Copy AI context to clipboard"
                                                        />
                                                    </HStack>
                                                )}
                                            </HStack>
                                            {isEditing ? (
                                                <Textarea
                                                    value={editedDescription}
                                                    onChange={(e) => setEditedDescription(e.target.value)}
                                                    size="sm"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    borderRadius="lg"
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                    fontFamily={brandConfig.fonts.body}
                                                    placeholder="Project description (max 70 words)"
                                                    rows={3}
                                                />
                                            ) : (
                                                <Text color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.body}>
                                                    {project.projectDescription || "No description provided"}
                                                </Text>
                                            )}
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" mb={2} color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                                Client
                                            </Text>
                                            {isAdmin && isEditing ? (
                                                <Select
                                                    value={project.billingClient.id}
                                                    onChange={async (e) => {
                                                        const newClientId = e.target.value;
                                                        try {
                                                            await updateProject({
                                                                variables: {
                                                                    id,
                                                                    input: {
                                                                        billingClient: newClientId,
                                                                    },
                                                                },
                                                            });
                                                            refetch();
                                                            toast({
                                                                title: "Client updated successfully",
                                                                status: "success",
                                                                duration: 3000,
                                                                isClosable: true,
                                                            });
                                                        } catch (error) {
                                                            console.error("Error updating client:", error);
                                                            toast({
                                                                title: "Error updating client",
                                                                description: error instanceof Error ? error.message : "Unknown error",
                                                                status: "error",
                                                                duration: 5000,
                                                                isClosable: true,
                                                            });
                                                        }
                                                    }}
                                                    size="sm"
                                                    bg="rgba(20, 20, 20, 0.95)"
                                                    color="#FFFFFF"
                                                    borderColor={cardBorder}
                                                    _hover={{ borderColor: getColor("primary") }}
                                                    _focus={{ borderColor: getColor("primary"), bg: "rgba(20, 20, 20, 0.95)" }}
                                                    sx={{
                                                        option: {
                                                            backgroundColor: '#2a2a2a',
                                                            color: '#E5E5E5',
                                                            _hover: {
                                                                backgroundColor: '#3a3a3a',
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {clientsData?.clients?.map((client: any) => (
                                                        <option key={client.id} value={client.id} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                                                            {client.fName} {client.lName} ({client.email})
                                                        </option>
                                                    ))}
                                                </Select>
                                            ) : (
                                                <HStack>
                                                    <Avatar
                                                        size="sm"
                                                        name={`${project.billingClient.fName} ${project.billingClient.lName}`}
                                                        bg={getColor("primary")}
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                                            {project.billingClient.fName} {project.billingClient.lName}
                                                        </Text>
                                                        <Text fontSize="sm" color={textSecondary} fontFamily={brandConfig.fonts.body}>
                                                            {project.billingClient.email}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            )}
                                        </Box>

                                        {/* Project Members Section */}
                                        <Box>
                                            <HStack justify="space-between" mb={2}>
                                                <Text fontWeight="bold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                                    Team Members ({project.members.length + 1})
                                                </Text>
                                                {isAdmin && (
                                                    <HStack spacing={2}>
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            variant="outline"
                                                            onClick={() => setIsAddingMember(true)}
                                                            leftIcon={<FiUsers />}
                                                        >
                                                            Add Existing
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            colorScheme="green"
                                                            variant="outline"
                                                            onClick={() => setIsAddMemberModalOpen(true)}
                                                            leftIcon={<FiUsers />}
                                                        >
                                                            Create New Member
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </HStack>

                                            {/* Current Members */}
                                            <VStack align="stretch" spacing={2}>
                                                {/* Client as first team member */}
                                                <HStack
                                                    p={3}
                                                    bg="rgba(0, 122, 255, 0.1)"
                                                    backdropFilter="blur(10px)"
                                                    borderRadius="md"
                                                    border="2px"
                                                    borderColor="rgba(0, 122, 255, 0.3)"
                                                    justify="space-between"
                                                    transition="all 0.3s"
                                                    _hover={{ 
                                                        bg: "rgba(0, 122, 255, 0.15)",
                                                        borderColor: getColor("primary")
                                                    }}
                                                >
                                                    <HStack>
                                                        <Avatar
                                                            size="sm"
                                                            name={`${project.billingClient.fName} ${project.billingClient.lName}`}
                                                            bg={getColor("primary")}
                                                        />
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                                                                {project.billingClient.fName} {project.billingClient.lName}
                                                                {/* {project.billingClient.id === user?.id && " (You)"} */}
                                                                <Badge ml={2} colorScheme="blue" size="sm">Client</Badge>
                                                            </Text>
                                                            <Text fontSize="xs" color={textSecondary}>
                                                                {project.billingClient.email}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </HStack>
                                                {project.members.map((member: any) => (
                                                    <HStack
                                                        key={member.id}
                                                        p={3}
                                                        bg="rgba(255, 255, 255, 0.02)"
                                                        backdropFilter="blur(10px)"
                                                        borderRadius="md"
                                                        border="1px"
                                                        borderColor={cardBorder}
                                                        justify="space-between"
                                                        transition="all 0.3s"
                                                        _hover={{ 
                                                            bg: "rgba(255, 255, 255, 0.05)",
                                                            borderColor: textSecondary
                                                        }}
                                                    >
                                                        <HStack>
                                                            <Avatar
                                                                size="sm"
                                                                name={`${member.fName} ${member.lName}`}
                                                                bg={getColor("primary")}
                                                            />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                                                                    {member.fName} {member.lName}
                                                                    {/* {member.id === user?.id && " (You)"} */}
                                                                </Text>
                                                                <Text fontSize="xs" color={textSecondary}>
                                                                    {member.email}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                        {isAdmin && (
                                                            <IconButton
                                                                aria-label="Remove member"
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                title={member.id === user?.id ? "Remove yourself from project" : "Remove member from project"}
                                                            />
                                                        )}
                                                    </HStack>
                                                ))}

                                                {/* Add Member Form */}
                                                {isAdmin && isAddingMember && (
                                                    <VStack
                                                        p={4}
                                                        bg="rgba(255, 255, 255, 0.03)"
                                                        backdropFilter="blur(10px)"
                                                        borderRadius="md"
                                                        border="1px"
                                                        borderColor={cardBorder}
                                                        spacing={3}
                                                    >
                                                        <HStack width="full" spacing={3}>
                                                            <Select
                                                                value={selectedClientId}
                                                                onChange={(e) => setSelectedClientId(e.target.value)}
                                                                placeholder="Select client to add"
                                                                isDisabled={clientsLoading}
                                                                bg={getComponent("form", "fieldBg")}
                                                                color={textPrimary}
                                                                border="1px"
                                                                borderColor={getComponent("form", "fieldBorder")}
                                                                borderRadius="lg"
                                                                _focus={{
                                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                                }}
                                                                _placeholder={{
                                                                    color: textSecondary
                                                                }}
                                                                size="sm"
                                                                flex={1}
                                                                sx={{
                                                                    option: {
                                                                        backgroundColor: '#2a2a2a',
                                                                        color: '#E5E5E5',
                                                                        _hover: {
                                                                            backgroundColor: '#3a3a3a',
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {clientsData?.clients?.map((client: any) => (
                                                                    <option key={client.id} value={client.id} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                                                                        {client.businessName ? `${client.businessName} - ` : ""}
                                                                        {client.fName} {client.lName} ({client.email})
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="green"
                                                                onClick={handleAddMember}
                                                                isDisabled={!selectedClientId}
                                                            >
                                                                Add
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setIsAddingMember(false);
                                                                    setSelectedClientId("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </HStack>
                                                    </VStack>
                                                )}

                                                {project.members.length === 0 && (
                                                    <Text fontSize="sm" color={textMuted} textAlign="center" py={4}>
                                                        No team members assigned to this project
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Box>
                                    </VStack>

                                    {/* Right Column - Compact Stats */}
                                    <VStack align="stretch" spacing={3}>
                                        <HStack 
                                            justify="space-between" 
                                            p={4} 
                                            bg="linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.03) 100%)"
                                            backdropFilter="blur(10px)"
                                            borderRadius="lg" 
                                            border="2px" 
                                            borderColor="rgba(0, 122, 255, 0.2)"
                                            transition="all 0.3s"
                                            _hover={{ 
                                                borderColor: "rgba(0, 122, 255, 0.4)",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 12px rgba(0, 122, 255, 0.1)"
                                            }}
                                        >
                                            <HStack spacing={3}>
                                                <Box p={2} bg="rgba(0, 122, 255, 0.2)" borderRadius="md">
                                                    <Icon as={FiUsers} boxSize={4} color={getColor("primary")} />
                                                </Box>
                                                <Text fontSize="sm" color={textSecondary} fontFamily={brandConfig.fonts.body}>Team Size</Text>
                                            </HStack>
                                            <VStack spacing={0} align="end">
                                                <Text fontWeight="bold" fontSize="2xl" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                                    {project.members.length + 1}
                                                </Text>
                                                <Text fontSize="xs" color={textMuted}>members</Text>
                                            </VStack>
                                        </HStack>
                                        
                                        <HStack 
                                            justify="space-between" 
                                            p={4} 
                                            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)"
                                            backdropFilter="blur(10px)"
                                            borderRadius="lg" 
                                            border="2px" 
                                            borderColor="rgba(34, 197, 94, 0.2)"
                                            transition="all 0.3s"
                                            _hover={{ 
                                                borderColor: "rgba(34, 197, 94, 0.4)",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.1)"
                                            }}
                                        >
                                            <HStack spacing={3}>
                                                <Box p={2} bg="rgba(34, 197, 94, 0.2)" borderRadius="md">
                                                    <Icon as={FiCheckCircle} boxSize={4} color="green.400" />
                                                </Box>
                                                <Text fontSize="sm" color={textSecondary} fontFamily={brandConfig.fonts.body}>Progress</Text>
                                            </HStack>
                                            <VStack spacing={0} align="end">
                                                <Text fontWeight="bold" fontSize="2xl" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                                    {project.tasks.filter((t: Task) => t.status === "COMPLETED").length}/{project.tasks.length}
                                                </Text>
                                                <Text fontSize="xs" color={textMuted}>tasks done</Text>
                                            </VStack>
                                        </HStack>
                                    </VStack>
                                </SimpleGrid>

                                <Box mt={4} p={4}>
                                    <HStack mb={2} justify="space-between">
                                        <Text fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                                            Overall Progress
                                        </Text>
                                        {isAdmin && (
                                            <Select
                                                size="sm"
                                                value={project.progress || 0}
                                                onChange={async (e) => {
                                                    const newProgress = parseInt(e.target.value);
                                                    try {
                                                        await updateProjectProgress({
                                                            variables: {
                                                                id,
                                                                input: { progress: newProgress }
                                                            }
                                                        });
                                                    } catch (error) {
                                                        console.error("Error updating progress:", error);
                                                    }
                                                }}
                                                width="100px"
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                borderRadius="lg"
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                                fontFamily={brandConfig.fonts.body}
                                            >
                                                {Array.from({ length: 11 }, (_, i) => i * 10).map(value => (
                                                    <option key={value} value={value}>{value}%</option>
                                                ))}
                                            </Select>
                                        )}
                                    </HStack>
                                    <Progress
                                        value={project.progress || 0}
                                        size="lg"
                                        borderRadius="full"
                                        colorScheme="green"
                                        hasStripe
                                        isAnimated
                                    />
                                    <Text mt={2} fontSize="sm" color={textSecondary} textAlign="right" fontFamily={brandConfig.fonts.body}>
                                        {project.progress || 0}% Complete
                                    </Text>
                                </Box>
                            </CardBody>
                        </Card>

                        {/* Add Task Button for Admins - More prominent and inviting */}
                        {isAdmin && (
                            <Box
                                textAlign="center"
                                py={8}
                                px={4}
                                position="relative"
                                bg="linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(90, 200, 250, 0.05) 100%)"
                                borderRadius="xl"
                                border="2px dashed"
                                borderColor="rgba(0, 122, 255, 0.3)"
                                transition="all 0.3s"
                                _hover={{
                                    borderColor: "rgba(0, 122, 255, 0.5)",
                                    bg: "linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(90, 200, 250, 0.08) 100%)",
                                    transform: "scale(1.02)"
                                }}
                            >
                                <VStack spacing={3}>
                                    <Text fontSize="2xl" color={getColor("primary")}>➕</Text>
                                    <Button
                                        bg={getComponent("button", "primaryBg")}
                                        color={getColor("text.inverse")}
                                        _hover={{ 
                                            bg: getComponent("button", "primaryHover"),
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 8px 24px rgba(0, 122, 255, 0.4)"
                                        }}
                                        size="lg"
                                        width={{ base: "full", md: "60%" }}
                                        height="65px"
                                        fontSize="xl"
                                        fontWeight="bold"
                                        leftIcon={<FiCheckCircle size={24} />}
                                        onClick={() => {
                                            setSelectedTask(null);
                                            setIsTaskModalOpen(true);
                                        }}
                                        boxShadow="0 4px 16px rgba(0, 122, 255, 0.3)"
                                        fontFamily={brandConfig.fonts.body}
                                        transition="all 0.3s"
                                    >
                                        Add Your First Task
                                    </Button>
                                    <Text 
                                        fontSize="md" 
                                        color={textPrimary} 
                                        fontFamily={brandConfig.fonts.body}
                                        fontWeight="medium"
                                    >
                                        Break down your project into actionable steps
                                    </Text>
                                    <Text 
                                        fontSize="sm" 
                                        color={textSecondary} 
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        Each task can have its own status, media attachments, and progress tracking
                                    </Text>
                                </VStack>
                            </Box>
                        )}

                        {/* Tasks Section - Enhanced visual hierarchy */}
                        <Card 
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="xl"
                            overflow="hidden"
                        >
                            <CardHeader 
                                borderBottom="2px" 
                                borderColor={cardBorder}
                                bg="rgba(0, 122, 255, 0.05)"
                                py={5}
                            >
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <HStack spacing={3}>
                                            <Text fontSize="2xl">📋</Text>
                                            <VStack align="start" spacing={0}>
                                                <Heading size="lg" color={textPrimary}>Project Tasks</Heading>
                                                <Text fontSize="sm" color={textSecondary}>Track your progress and manage deliverables</Text>
                                            </VStack>
                                        </HStack>
                                        {isAdmin && orderedTasks.length > 0 && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    bg="rgba(0, 122, 255, 0.2)"
                                                    color={getColor("primary")}
                                                    border="1px"
                                                    borderColor="rgba(0, 122, 255, 0.3)"
                                                    _hover={{
                                                        bg: "rgba(0, 122, 255, 0.3)",
                                                        borderColor: getColor("primary")
                                                    }}
                                                    leftIcon={<FiPlus />}
                                                    onClick={() => {
                                                        setSelectedTask(null);
                                                        setIsTaskModalOpen(true);
                                                    }}
                                                >
                                                    Add Task
                                                </Button>
                                                <Tooltip label="Export all tasks to markdown file for bulk editing">
                                                    <Button
                                                        size="sm"
                                                        bg="rgba(168, 85, 247, 0.2)"
                                                        color="purple.400"
                                                        border="1px"
                                                        borderColor="rgba(168, 85, 247, 0.3)"
                                                        _hover={{
                                                            bg: "rgba(168, 85, 247, 0.3)",
                                                            borderColor: "purple.400"
                                                        }}
                                                        leftIcon={<DownloadIcon />}
                                                        onClick={() => exportProjectTasks({ variables: { projectId: id } })}
                                                        isLoading={exportingTasks}
                                                    >
                                                        Export Tasks (.md)
                                                    </Button>
                                                </Tooltip>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileImport}
                                                    accept=".md"
                                                    style={{ display: 'none' }}
                                                />
                                                <Tooltip label="Import tasks from markdown file (REPLACES all existing tasks)">
                                                    <Button
                                                        size="sm"
                                                        bg="rgba(168, 85, 247, 0.2)"
                                                        color="purple.400"
                                                        border="1px"
                                                        borderColor="rgba(168, 85, 247, 0.3)"
                                                        _hover={{
                                                            bg: "rgba(168, 85, 247, 0.3)",
                                                            borderColor: "purple.400"
                                                        }}
                                                        leftIcon={<DownloadIcon transform="rotate(180deg)" />}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        isLoading={importingFile}
                                                    >
                                                        Import (.md)
                                                    </Button>
                                                </Tooltip>
                                                <input
                                                    type="file"
                                                    ref={appendFileInputRef}
                                                    onChange={handleFileAppend}
                                                    accept=".md"
                                                    style={{ display: 'none' }}
                                                />
                                                <Tooltip label="Import additional tasks from markdown file (ADDS to existing tasks)">
                                                    <Button
                                                        size="sm"
                                                        bg="rgba(59, 130, 246, 0.2)"
                                                        color="blue.400"
                                                        border="1px"
                                                        borderColor="rgba(59, 130, 246, 0.3)"
                                                        _hover={{
                                                            bg: "rgba(59, 130, 246, 0.3)",
                                                            borderColor: "blue.400"
                                                        }}
                                                        leftIcon={<FiPlus />}
                                                        onClick={() => appendFileInputRef.current?.click()}
                                                        isLoading={appendingFile}
                                                    >
                                                        Import Additional (.md)
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label="Download markdown format specification guide">
                                                    <Button
                                                        size="sm"
                                                        bg="rgba(168, 85, 247, 0.2)"
                                                        color="purple.400"
                                                        border="1px"
                                                        borderColor="rgba(168, 85, 247, 0.3)"
                                                        _hover={{
                                                            bg: "rgba(168, 85, 247, 0.3)",
                                                            borderColor: "purple.400"
                                                        }}
                                                        leftIcon={<ViewIcon />}
                                                        onClick={() => {
                                                            downloadMarkdownFile(FORMAT_SPEC_CONTENT, 'FORMAT_SPEC.md');
                                                            toast({
                                                                title: 'Format guide downloaded',
                                                                description: 'Downloaded FORMAT_SPEC.md',
                                                                status: 'success',
                                                                duration: 3000,
                                                                isClosable: true,
                                                            });
                                                        }}
                                                    >
                                                        Format Guide
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label="Download blank markdown template">
                                                    <Button
                                                        size="sm"
                                                        bg="rgba(168, 85, 247, 0.2)"
                                                        color="purple.400"
                                                        border="1px"
                                                        borderColor="rgba(168, 85, 247, 0.3)"
                                                        _hover={{
                                                            bg: "rgba(168, 85, 247, 0.3)",
                                                            borderColor: "purple.400"
                                                        }}
                                                        leftIcon={<DownloadIcon />}
                                                        onClick={() => {
                                                            downloadMarkdownFile(BILL_TEMPLATE_CONTENT, 'bill_template.md');
                                                            toast({
                                                                title: 'Template downloaded',
                                                                description: 'Downloaded bill_template.md',
                                                                status: 'success',
                                                                duration: 3000,
                                                                isClosable: true,
                                                            });
                                                        }}
                                                    >
                                                        Template
                                                    </Button>
                                                </Tooltip>
                                            </>
                                        )}
                                    </HStack>
                                    {isAdmin && orderedTasks.length > 0 && (
                                        <HStack 
                                            fontSize="xs" 
                                            color={textMuted}
                                            bg="rgba(255, 255, 255, 0.05)"
                                            px={3}
                                            py={2}
                                            borderRadius="md"
                                        >
                                            <Icon as={FiInfo} />
                                            <Text>Tip: Use the arrow buttons to reorder tasks by priority</Text>
                                        </HStack>
                                    )}
                                </VStack>
                            </CardHeader>
                            <CardBody p={6}>
                                <VStack spacing={5} align="stretch">
                                    {/* Empty state when no tasks */}
                                    {orderedTasks.length === 0 && (
                                        <Box 
                                            textAlign="center" 
                                            py={12}
                                            bg="rgba(0, 122, 255, 0.02)"
                                            borderRadius="xl"
                                            border="1px dashed"
                                            borderColor="rgba(0, 122, 255, 0.2)"
                                        >
                                            <VStack spacing={4}>
                                                <Text fontSize="4xl" opacity={0.5}>📝</Text>
                                                <Heading size="md" color={textPrimary}>No tasks yet</Heading>
                                                <Text color={textSecondary}>Start by adding your first task to get organized</Text>
                                                {isAdmin && (
                                                    <Button
                                                        bg={getComponent("button", "primaryBg")}
                                                        color="white"
                                                        _hover={{ 
                                                            bg: getComponent("button", "primaryHover"),
                                                            transform: "translateY(-2px)"
                                                        }}
                                                        size="lg"
                                                        leftIcon={<FiPlus />}
                                                        onClick={() => {
                                                            setSelectedTask(null);
                                                            setIsTaskModalOpen(true);
                                                        }}
                                                        boxShadow="0 4px 12px rgba(0, 122, 255, 0.2)"
                                                    >
                                                        Create First Task
                                                    </Button>
                                                )}
                                            </VStack>
                                        </Box>
                                    )}
                                    
                                    {/* Progress indicators for tasks */}
                                    {orderedTasks.length > 0 && (
                                        <HStack 
                                            spacing={4} 
                                            p={4} 
                                            bg="rgba(0, 122, 255, 0.05)"
                                            borderRadius="lg"
                                            border="1px"
                                            borderColor="rgba(0, 122, 255, 0.1)"
                                        >
                                            <VStack flex={1} align="center">
                                                <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                                                    {orderedTasks.filter(t => t.status === "PENDING").length}
                                                </Text>
                                                <Text fontSize="sm" color={textSecondary}>To Do</Text>
                                            </VStack>
                                            <Divider orientation="vertical" height="50px" borderColor={cardBorder} />
                                            <VStack flex={1} align="center">
                                                <Text fontSize="2xl" fontWeight="bold" color={getColor("primary")}>
                                                    {orderedTasks.filter(t => t.status === "IN_PROGRESS").length}
                                                </Text>
                                                <Text fontSize="sm" color={textSecondary}>In Progress</Text>
                                            </VStack>
                                            <Divider orientation="vertical" height="50px" borderColor={cardBorder} />
                                            <VStack flex={1} align="center">
                                                <Text fontSize="2xl" fontWeight="bold" color="green.400">
                                                    {orderedTasks.filter(t => t.status === "COMPLETED").length}
                                                </Text>
                                                <Text fontSize="sm" color={textSecondary}>Completed</Text>
                                            </VStack>
                                        </HStack>
                                    )}
                                    
                                    {/* Task cards */}
                                    {orderedTasks.map((task, index) => (
                                        <Card
                                            key={task.id}
                                            p={{ base: 5, md: 6 }}
                                            variant="outline"
                                            borderLeft="5px"
                                            borderLeftColor={
                                                task.status === "COMPLETED" ? "green.400" :
                                                    task.status === "IN_PROGRESS" ? getColor("primary") : "gray.400"
                                            }
                                            bg={
                                                task.status === "COMPLETED" ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)" :
                                                    task.status === "IN_PROGRESS" ? "linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.05) 100%)" : 
                                                    "rgba(255, 255, 255, 0.02)"
                                            }
                                            position="relative"
                                            border="1px"
                                            borderColor={
                                                task.status === "IN_PROGRESS" ? "rgba(0, 122, 255, 0.3)" : 
                                                task.status === "COMPLETED" ? "rgba(34, 197, 94, 0.2)" : 
                                                cardBorder
                                            }
                                            boxShadow={
                                                task.status === "IN_PROGRESS" ? "0 4px 20px rgba(0, 122, 255, 0.15)" : 
                                                task.status === "COMPLETED" ? "0 2px 8px rgba(34, 197, 94, 0.1)" : 
                                                "0 2px 8px rgba(0, 0, 0, 0.1)"
                                            }
                                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            _hover={{ 
                                                boxShadow: 
                                                    task.status === "IN_PROGRESS" ? "0 8px 30px rgba(0, 122, 255, 0.25)" : 
                                                    task.status === "COMPLETED" ? "0 4px 16px rgba(34, 197, 94, 0.15)" : 
                                                    "0 4px 16px rgba(255, 255, 255, 0.05)",
                                                transform: "translateY(-3px) scale(1.01)",
                                                borderColor: 
                                                    task.status === "IN_PROGRESS" ? getColor("primary") :
                                                    task.status === "COMPLETED" ? "green.400" : 
                                                    textSecondary,
                                                bg: 
                                                    task.status === "IN_PROGRESS" ? "linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%)" :
                                                    task.status === "COMPLETED" ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)" :
                                                    "rgba(255, 255, 255, 0.04)"
                                            }}
                                            _before={{
                                                content: '""',
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: "3px",
                                                bg: task.status === "IN_PROGRESS" ? 
                                                    "linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.5), transparent)" : 
                                                    "transparent",
                                                animation: task.status === "IN_PROGRESS" ? "shimmer 2s infinite" : "none"
                                            }}
                                        >
                                            {isAdmin && (
                                                <Flex
                                                    position="absolute"
                                                    left={{ base: 1, md: 2 }}
                                                    top={{ base: 2, md: 4 }}
                                                    direction="column"
                                                    bg="rgba(0, 0, 0, 0.3)"
                                                    backdropFilter="blur(10px)"
                                                    borderRadius="md"
                                                    border="1px"
                                                    borderColor={cardBorder}
                                                    p={{ base: 0.5, md: 1 }}
                                                    zIndex={2}
                                                    display={{ base: "none", sm: "flex" }}
                                                >
                                                    <IconButton
                                                        aria-label="Move task up"
                                                        icon={<FiArrowUp />}
                                                        size="xs"
                                                        variant="ghost"
                                                        color={textPrimary}
                                                        _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                                                        isDisabled={index === 0}
                                                        onClick={() => moveTaskUp(task.id, index)}
                                                        mb={1}
                                                    />
                                                    <IconButton
                                                        aria-label="Move task down"
                                                        icon={<FiArrowDown />}
                                                        size="xs"
                                                        variant="ghost"
                                                        color={textPrimary}
                                                        _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                                                        isDisabled={index === orderedTasks.length - 1}
                                                        onClick={() => moveTaskDown(task.id, index)}
                                                    />
                                                </Flex>
                                            )}
                                            <VStack align="stretch" spacing={4} pl={{ base: isAdmin ? 8 : 0, md: isAdmin ? 12 : 0 }}>
                                                <HStack spacing={{ base: 2, md: 4 }} align="start" justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
                                                    <VStack align="start" spacing={3} flex={1} minW={0} w="full">
                                                        {/* Task Description with better typography */}
                                                        <HStack align="start" spacing={3} w="full">
                                                            {task.status === "COMPLETED" && (
                                                                <Icon 
                                                                    as={FiCheckCircle} 
                                                                    color="green.400" 
                                                                    boxSize={{ base: 5, md: 6 }}
                                                                    mt={1}
                                                                    flexShrink={0}
                                                                />
                                                            )}
                                                            <Text
                                                                fontSize={{ base: "md", md: "xl" }}
                                                                fontWeight={task.status === "COMPLETED" ? "medium" : "semibold"}
                                                                color={
                                                                    task.status === "COMPLETED" ? textSecondary :
                                                                        task.status === "IN_PROGRESS" ? getColor("primary") : textPrimary
                                                                }
                                                                lineHeight="tall"
                                                                opacity={task.status === "COMPLETED" ? 0.85 : 1}
                                                                transition="all 0.3s"
                                                                wordBreak="break-word"
                                                                overflowWrap="anywhere"
                                                            >
                                                                {task.description}
                                                            </Text>
                                                        </HStack>
                                                        <HStack spacing={3} flexWrap="wrap" width="full">
                                                            {/* Edit and Delete buttons - moved here */}
                                                            {isAdmin && (
                                                                <>
                                                                    <IconButton
                                                                        aria-label="Edit task"
                                                                        icon={<EditIcon />}
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSelectedTask(task);
                                                                            setIsTaskModalOpen(true);
                                                                        }}
                                                                    />
                                                                    <IconButton
                                                                        aria-label="Delete task"
                                                                        icon={<DeleteIcon />}
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={async () => {
                                                                            if (window.confirm("Are you sure you want to delete this task?")) {
                                                                                try {
                                                                                    await deleteTask({
                                                                                        variables: { id: task.id },
                                                                                        refetchQueries: [{ query: GET_PROJECT, variables: { id } }]
                                                                                    });

                                                                                    toast({
                                                                                        title: "Task deleted",
                                                                                        status: "success",
                                                                                        duration: 3000,
                                                                                        isClosable: true,
                                                                                    });
                                                                                } catch (error) {
                                                                                    toast({
                                                                                        title: "Error deleting task",
                                                                                        description: error instanceof Error ? error.message : "Unknown error occurred",
                                                                                        status: "error",
                                                                                        duration: 5000,
                                                                                        isClosable: true,
                                                                                    });
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                </>
                                                            )}
                                                            
                                                            {/* Status dropdown - smaller and more subtle */}
                                                            {isAdmin ? (
                                                                <Select
                                                                    size="sm"
                                                                    value={task.status}
                                                                    onChange={async (e) => {
                                                                        try {
                                                                            await updateTaskStatus({
                                                                                variables: {
                                                                                    taskId: task.id,
                                                                                    status: e.target.value
                                                                                }
                                                                            });
                                                                            // No need to refetch - cache is updated automatically
                                                                        } catch (error) {
                                                                            toast({
                                                                                title: "Error updating status",
                                                                                description: error instanceof Error ? error.message : "Unknown error",
                                                                                status: "error",
                                                                                duration: 3000,
                                                                            });
                                                                        }
                                                                    }}
                                                                    width="140px"
                                                                    variant="filled"
                                                                    bg="rgba(0, 0, 0, 0.3)"
                                                                    color={textPrimary}
                                                                    border="1px"
                                                                    borderColor={
                                                                        task.status === "COMPLETED" ? "green.400" :
                                                                            task.status === "IN_PROGRESS" ? getColor("primary") : cardBorder
                                                                    }
                                                                    fontSize="sm"
                                                                    _hover={{ borderColor: textSecondary }}
                                                                >
                                                                    <option value="PENDING" style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>⏳ Pending</option>
                                                                    <option value="IN_PROGRESS" style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>🚀 In Progress</option>
                                                                    <option value="COMPLETED" style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>✅ Completed</option>
                                                                </Select>
                                                            ) : (
                                                                <Badge
                                                                    px={3}
                                                                    py={1}
                                                                    borderRadius="full"
                                                                    colorScheme={
                                                                        task.status === "COMPLETED" ? "green" :
                                                                            task.status === "IN_PROGRESS" ? "blue" : "gray"
                                                                    }
                                                                    fontSize="sm"
                                                                >
                                                                    {task.status === "COMPLETED" ? "✅ Completed" :
                                                                        task.status === "IN_PROGRESS" ? "🚀 In Progress" : "⏳ Pending"}
                                                                </Badge>
                                                            )}
                                                            
                                                            {/* Billing badges */}
                                                            {task.billable === false ? (
                                                                <Badge 
                                                                    colorScheme="gray" 
                                                                    px={3} 
                                                                    py={1} 
                                                                    borderRadius="full" 
                                                                    fontSize="sm"
                                                                    bg="rgba(107, 114, 128, 0.2)"
                                                                    color="gray.400"
                                                                    border="1px dashed"
                                                                    borderColor="gray.500"
                                                                >
                                                                    🚫 Non-Billable
                                                                </Badge>
                                                            ) : task.billed ? (
                                                                <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="sm">
                                                                    💰 Billed
                                                                </Badge>
                                                            ) : (
                                                                <Badge 
                                                                    colorScheme="green" 
                                                                    px={3} 
                                                                    py={1} 
                                                                    borderRadius="full" 
                                                                    fontSize="sm"
                                                                    variant="outline"
                                                                >
                                                                    💵 Billable
                                                                </Badge>
                                                            )}
                                                            {task.media && task.media.length > 0 && (
                                                                <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="sm">
                                                                    📸 {task.media.length} {task.media.length === 1 ? 'file' : 'files'}
                                                                </Badge>
                                                            )}
                                                            {task.assignedTo?.[0] && (
                                                                <HStack spacing={2}>
                                                                    <Avatar
                                                                        size="xs"
                                                                        name={`${task.assignedTo[0].fName} ${task.assignedTo[0].lName}`}
                                                                        src={(task.assignedTo[0] as any).profilePhoto ? normalizeMediaUrl((task.assignedTo[0] as any).profilePhoto) : undefined}
                                                                        bg={getColor("primary")}
                                                                    />
                                                                    <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                                                                        {task.assignedTo[0].fName} {task.assignedTo[0].lName}
                                                                    </Badge>
                                                                </HStack>
                                                            )}
                                                        </HStack>
                                                    </VStack>
                                                    
                                                    {/* Enhanced Checkbox with 3D effect - Admin only */}
                                                    <Box
                                                        role="group"
                                                        as={isAdmin ? "button" : "div"}
                                                        onClick={isAdmin ? async () => {
                                                            try {
                                                                const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
                                                                await updateTaskStatus({
                                                                    variables: {
                                                                        taskId: task.id,
                                                                        status: newStatus
                                                                    }
                                                                });
                                                                // No need to refetch - cache is updated automatically
                                                                toast({
                                                                    title: newStatus === "COMPLETED" ? "Task completed! 🎉" : "Task marked as pending 📋",
                                                                    status: "success",
                                                                    duration: 2000,
                                                                    isClosable: true,
                                                                });
                                                            } catch (error) {
                                                                toast({
                                                                    title: "Error updating status",
                                                                    description: error instanceof Error ? error.message : "Unknown error",
                                                                    status: "error",
                                                                    duration: 3000,
                                                                });
                                                            }
                                                        } : undefined}
                                                        position="relative"
                                                        width={{ base: "48px", md: "56px" }}
                                                        height={{ base: "48px", md: "56px" }}
                                                        minWidth={{ base: "48px", md: "56px" }}
                                                        borderRadius="12px"
                                                        border="3px solid"
                                                        borderColor={task.status === "COMPLETED" ? "green.400" : getColor("border.darkCard")}
                                                        bg={task.status === "COMPLETED" 
                                                            ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" 
                                                            : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"}
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        cursor={isAdmin ? "pointer" : "not-allowed"}
                                                        opacity={isAdmin ? 1 : 0.7}
                                                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                                        boxShadow={task.status === "COMPLETED" 
                                                            ? "0 8px 25px rgba(72, 187, 120, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.1)" 
                                                            : "0 4px 15px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.1)"}
                                                        _hover={isAdmin ? {
                                                            borderColor: task.status === "COMPLETED" ? "green.500" : getColor("primary"),
                                                            transform: "translateY(-3px) scale(1.1)",
                                                            boxShadow: task.status === "COMPLETED"
                                                                ? "0 12px 35px rgba(72, 187, 120, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.4)"
                                                                : "0 8px 25px rgba(102, 126, 234, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                                                            bg: task.status === "COMPLETED"
                                                                ? "linear-gradient(135deg, #68d391 0%, #48bb78 100%)"
                                                                : "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%)"
                                                        } : {}}
                                                        _active={isAdmin ? {
                                                            transform: "translateY(1px) scale(0.98)",
                                                            boxShadow: task.status === "COMPLETED"
                                                                ? "0 2px 10px rgba(72, 187, 120, 0.4), inset 0 1px 0 rgba(0, 0, 0, 0.1)"
                                                                : "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(0, 0, 0, 0.05)"
                                                        } : {}}
                                                        _before={{
                                                            content: '""',
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "50%",
                                                            transform: "translate(-50%, -50%)",
                                                            width: task.status === "COMPLETED" ? "100%" : "0%",
                                                            height: task.status === "COMPLETED" ? "100%" : "0%",
                                                            borderRadius: "12px",
                                                            bg: "rgba(255, 255, 255, 0.1)",
                                                            animation: task.status === "COMPLETED" ? `${pulse} 2s infinite` : "none",
                                                            pointerEvents: "none"
                                                        }}
                                                        flexShrink={0}
                                                        alignSelf={{ base: "center", md: "flex-start" }}
                                                        mt={{ base: 2, md: 1 }}
                                                        ml={{ base: 2, md: 0 }}
                                                    >
                                                        {task.status === "COMPLETED" ? (
                                                            <Icon 
                                                                as={FiCheckCircle} 
                                                                boxSize={8} 
                                                                color="white"
                                                                filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
                                                            />
                                                        ) : isAdmin ? (
                                                            <Box
                                                                width="24px"
                                                                height="24px"
                                                                borderRadius="6px"
                                                                border="2px dashed"
                                                                borderColor={getColor("text.mutedDark")}
                                                                opacity={0.4}
                                                                transition="all 0.2s"
                                                                _groupHover={{ 
                                                                    opacity: 0.6,
                                                                    borderColor: getColor("primary")
                                                                }}
                                                            />
                                                        ) : (
                                                            <Icon
                                                                as={FiLock}
                                                                boxSize={5}
                                                                color={getColor("text.mutedDark")}
                                                                opacity={0.5}
                                                            />
                                                        )}
                                                    </Box>
                                                </HStack>

                                                {task.media && task.media.length > 0 && (
                                                    <Box>
                                                        <Text fontWeight="bold" mb={2}>
                                                            Task Evidence ({task.media.length})
                                                        </Text>
                                                        {(() => {
                                                            console.log("Task media:", {
                                                                taskId: task.id,
                                                                media: task.media.map(m => ({
                                                                    url: m.url,
                                                                    fileType: m.fileType,
                                                                    isPDF: m.fileType === "application/pdf" || m.url.toLowerCase().includes("pdf"),
                                                                    isVideo: m.fileType === "video/mp4" || m.url.endsWith(".mp4")
                                                                }))
                                                            });
                                                            return null;
                                                        })()}
                                                        <SimpleGrid
                                                            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                                                            spacing={{ base: 2, md: 4 }}
                                                        >
                                                            {task.media.map((media, index) => {
                                                                console.log("Rendering media item:", {
                                                                    index,
                                                                    url: media.url,
                                                                    fileType: media.fileType,
                                                                    isPDF: media.fileType === "application/pdf" || media.url.toLowerCase().includes("pdf"),
                                                                    isVideo: media.fileType === "video/mp4" || media.url.endsWith(".mp4")
                                                                });

                                                                return (
                                                                    <Box
                                                                        key={index}
                                                                        position="relative"
                                                                        cursor="pointer"
                                                                        borderRadius="md"
                                                                        overflow="hidden"
                                                                        boxShadow="sm"
                                                                        border="1px solid"
                                                                        borderColor={task.status === "COMPLETED" ? "green.200" : "gray.200"}
                                                                    >
                                                                        {(media.fileType === "application/pdf" || media.url.toLowerCase().includes("pdf")) ? (
                                                                            <Box maxH="150px" overflow="hidden" position="relative">
                                                                                <Document 
                                                                                    file={normalizeMediaUrl(media.url)}
                                                                                    onLoadSuccess={({ numPages }) => {
                                                                                        console.log("ProjectPage PDF loaded successfully:", { 
                                                                                            url: media.url, 
                                                                                            normalizedUrl: normalizeMediaUrl(media.url),
                                                                                            numPages 
                                                                                        });
                                                                                    }}
                                                                                    onLoadError={(error) => {
                                                                                        console.error("ProjectPage PDF load error:", error, {
                                                                                            originalUrl: media.url,
                                                                                            normalizedUrl: normalizeMediaUrl(media.url),
                                                                                            fileType: media.fileType
                                                                                        });
                                                                                    }}
                                                                                    loading={
                                                                                        <Box display="flex" alignItems="center" justifyContent="center" height="150px">
                                                                                            <Spinner size="md" color="blue.500" />
                                                                                            <Text ml={2} fontSize="sm">Loading PDF...</Text>
                                                                                        </Box>
                                                                                    }
                                                                                    error={
                                                                                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="150px" bg="red.50" p={4}>
                                                                                            <Text fontSize="sm" color="red.600" textAlign="center">
                                                                                                Failed to load PDF
                                                                                            </Text>
                                                                                            <Button 
                                                                                                size="sm" 
                                                                                                mt={2} 
                                                                                                colorScheme="blue" 
                                                                                                variant="outline"
                                                                                                onClick={() => window.open(normalizeMediaUrl(media.url), "_blank")}
                                                                                            >
                                                                                                Open Direct
                                                                                            </Button>
                                                                                        </Box>
                                                                                    }
                                                                                >
                                                                                    <Page pageNumber={1} width={200} />
                                                                                </Document>
                                                                                <Button
                                                                                    position="absolute"
                                                                                    bottom={2}
                                                                                    right={2}
                                                                                    size="sm"
                                                                                    onClick={() => window.open(normalizeMediaUrl(media.url), "_blank")}
                                                                                >
                                                                                    Download PDF
                                                                                </Button>
                                                                            </Box>
                                                                        ) : (media.fileType === "video/mp4" || media.url.endsWith(".mp4")) ? (
                                                                            <Box maxH="150px" overflow="hidden">
                                                                                {(() => {
                                                                                    console.log("Rendering video:", normalizeMediaUrl(media.url));
                                                                                    return null;
                                                                                })()}
                                                                                <video
                                                                                    src={normalizeMediaUrl(media.url)}
                                                                                    controls
                                                                                    style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    Your browser does not support the video tag.
                                                                                </video>
                                                                            </Box>
                                                                        ) : (
                                                                            <>
                                                                                {(() => {
                                                                                    console.log("Rendering image:", normalizeMediaUrl(media.url));
                                                                                    return null;
                                                                                })()}
                                                                                <Image
                                                                                    src={normalizeMediaUrl(media.url)}
                                                                                    alt={media.description || `Evidence ${index + 1}`}
                                                                                    height="150px"
                                                                                    width="100%"
                                                                                    objectFit="cover"
                                                                                    onClick={() => setSelectedImage({ ...media, url: normalizeMediaUrl(media.url) })}
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Badge
                                                                            position="absolute"
                                                                            top={2}
                                                                            left={2}
                                                                            colorScheme={task.status === "COMPLETED" ? "green" : "gray"}
                                                                            fontSize="xs"
                                                                        >
                                                                            {media.description ? "Proof of Work" : "Screenshot"}
                                                                        </Badge>
                                                                        {isAdmin && (
                                                                            <IconButton
                                                                                aria-label="Delete evidence"
                                                                                icon={<DeleteIcon />}
                                                                                size="sm"
                                                                                position="absolute"
                                                                                right={2}
                                                                                top={2}
                                                                                zIndex={2}
                                                                                colorScheme="red"
                                                                                opacity={0.7}
                                                                                _hover={{ opacity: 1 }}
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    try {
                                                                                        await deleteTaskMedia({
                                                                                            variables: {
                                                                                                taskId: task.id,
                                                                                                photoUrl: media.url
                                                                                            }
                                                                                        });
                                                                                        toast({
                                                                                            title: "Media deleted",
                                                                                        status: "success",
                                                                                        duration: 3000,
                                                                                        isClosable: true,
                                                                                    });
                                                                                    refetch();
                                                                                } catch (error) {
                                                                                    toast({
                                                                                        title: "Error deleting photo",
                                                                                        description: error instanceof Error ? error.message : "Unknown error occurred",
                                                                                        status: "error",
                                                                                        duration: 5000,
                                                                                        isClosable: true,
                                                                                    });
                                                                                }
                                                                            }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                );
                                                            })}
                                                        </SimpleGrid>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </Card>
                                    ))}

                                    {/* Magical Surprise - Only shows when all tasks are complete */}
                                    {orderedTasks.length > 0 && (
                                        <Card
                                            p={{ base: 5, md: 6 }}
                                            bg={
                                                orderedTasks.every(task => task.status === "COMPLETED")
                                                    ? "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 184, 0, 0.1) 50%, rgba(255, 215, 0, 0.15) 100%)"
                                                    : cardGradientBg
                                            }
                                            backdropFilter="blur(10px)"
                                            borderWidth="2px"
                                            borderStyle="dashed"
                                            borderColor={
                                                orderedTasks.every(task => task.status === "COMPLETED")
                                                    ? "gold"
                                                    : "rgba(255, 215, 0, 0.2)"
                                            }
                                            borderRadius="xl"
                                            boxShadow={
                                                orderedTasks.every(task => task.status === "COMPLETED")
                                                    ? "0 10px 40px rgba(255, 215, 0, 0.3), inset 0 0 60px rgba(255, 215, 0, 0.1)"
                                                    : "0 4px 20px 0 rgba(0, 0, 0, 0.1)"
                                            }
                                            position="relative"
                                            overflow="hidden"
                                            transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                            _before={{
                                                content: '""',
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: orderedTasks.every(task => task.status === "COMPLETED")
                                                    ? "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 70%)"
                                                    : "none",
                                                animation: orderedTasks.every(task => task.status === "COMPLETED")
                                                    ? `${pulse} 3s infinite`
                                                    : "none",
                                                pointerEvents: "none"
                                            }}
                                        >
                                            <VStack spacing={4} align="center" position="relative">
                                                {orderedTasks.every(task => task.status === "COMPLETED") ? (
                                                    <>
                                                        <Text fontSize="4xl" textAlign="center">
                                                            🏆✨💰
                                                        </Text>
                                                        <Heading 
                                                            size="lg" 
                                                            color="gold"
                                                            textAlign="center"
                                                            textShadow="0 2px 10px rgba(255, 215, 0, 0.5)"
                                                        >
                                                            Congratulations! You've Found the Treasure!
                                                        </Heading>
                                                        <Text 
                                                            color={textPrimary} 
                                                            fontSize="lg"
                                                            textAlign="center"
                                                            fontWeight="semibold"
                                                        >
                                                            All tasks completed! Your dedication has unlocked the golden achievement.
                                                        </Text>
                                                        <HStack spacing={4} mt={4}>
                                                            <Badge 
                                                                colorScheme="yellow" 
                                                                fontSize="md" 
                                                                px={4} 
                                                                py={2}
                                                                borderRadius="full"
                                                                boxShadow="0 4px 20px rgba(255, 215, 0, 0.4)"
                                                            >
                                                                🌟 Project Champion
                                                            </Badge>
                                                            <Badge 
                                                                colorScheme="green" 
                                                                fontSize="md" 
                                                                px={4} 
                                                                py={2}
                                                                borderRadius="full"
                                                                boxShadow="0 4px 20px rgba(72, 187, 120, 0.4)"
                                                            >
                                                                💎 100% Complete
                                                            </Badge>
                                                        </HStack>
                                                        {isAdmin && (
                                                            <Button
                                                                size="lg"
                                                                colorScheme="yellow"
                                                                mt={4}
                                                                onClick={() => window.open(`/bills/new?projectId=${id}`, '_blank')}
                                                                leftIcon={<Text>🎉</Text>}
                                                                rightIcon={<Text>💰</Text>}
                                                                boxShadow="0 6px 30px rgba(255, 215, 0, 0.4)"
                                                                _hover={{
                                                                    transform: "translateY(-2px)",
                                                                    boxShadow: "0 8px 40px rgba(255, 215, 0, 0.5)"
                                                                }}
                                                            >
                                                                Create Victory Bill
                                                            </Button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text 
                                                            fontSize="3xl" 
                                                            opacity={0.3}
                                                            filter="grayscale(100%)"
                                                        >
                                                            🏆
                                                        </Text>
                                                        <Heading 
                                                            size="md" 
                                                            color={textSecondary}
                                                            opacity={0.6}
                                                            textAlign="center"
                                                        >
                                                            A Mystery Awaits...
                                                        </Heading>
                                                        <Text 
                                                            color={textMuted} 
                                                            fontSize="sm"
                                                            textAlign="center"
                                                            fontStyle="italic"
                                                        >
                                                            Complete all tasks to reveal the golden treasure
                                                        </Text>
                                                        <Progress 
                                                            value={(orderedTasks.filter(t => t.status === "COMPLETED").length / orderedTasks.length) * 100}
                                                            colorScheme="yellow"
                                                            size="sm"
                                                            width="full"
                                                            borderRadius="full"
                                                            bg="rgba(255, 215, 0, 0.1)"
                                                            mt={2}
                                                        />
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {orderedTasks.filter(t => t.status === "COMPLETED").length} of {orderedTasks.length} tasks completed
                                                        </Text>
                                                    </>
                                                )}
                                            </VStack>
                                        </Card>
                                    )}

                                    {/* Empty state when no tasks */}
                                    {orderedTasks.length === 0 && (
                                        <Box
                                            textAlign="center"
                                            py={10}
                                            px={6}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            borderStyle="dashed"
                                            borderColor="gray.300"
                                        >
                                            <Icon as={FiCheckCircle} boxSize={12} color="blue.500" mb={4} />
                                            <Heading as="h4" size="md" mb={2}>
                                                No tasks yet
                                            </Heading>
                                            <Text color="gray.500" mb={4}>
                                                Start adding tasks to break down your project work
                                            </Text>
                                            {isAdmin && (
                                                <Button
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                        setSelectedTask(null);
                                                        setIsTaskModalOpen(true);
                                                    }}
                                                >
                                                    Add First Task
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    </VStack>
                </motion.div>
            </Container>
            <FooterWithFourColumns />
            {
                id && <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setSelectedTask(null);
                    }}
                    projectId={id}
                    existingTask={selectedTask ? {
                        id: selectedTask.id,
                        description: selectedTask.description,
                        status: selectedTask.status,
                        assignedTo: selectedTask.assignedTo,
                        media: selectedTask.media,
                        billed: selectedTask.billed || false,
                        billable: selectedTask.billable
                    } : undefined}
                    onTaskUpdated={() => {
                        refetch();
                    }}
                />
            }
            <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} size="6xl">
                <ModalOverlay onClick={() => setSelectedImage(null)} />
                <ModalContent>
                    <ModalCloseButton zIndex="popover" />
                    <ModalBody p={0}>
                        <Image
                            src={selectedImage?.url ? normalizeMediaUrl(selectedImage.url) : ''}
                            alt={selectedImage?.description || "Task evidence"}
                            width="100%"
                            height="auto"
                            maxH="90vh"
                            objectFit="contain"
                            cursor="pointer"
                            onClick={() => setSelectedImage(null)}
                        />
                        {selectedImage?.description && (
                            <Text p={4} textAlign="center">
                                {selectedImage.description}
                            </Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
            
            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                projectId={id || ""}
                onMemberAdded={() => {
                    refetch(); // Refresh project data to show new member
                    toast({
                        title: "Member added successfully",
                        description: "New team member has been created and added to the project",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                }}
            />
        </Box>
        </>
    );
};

export default ProjectPage;