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
    Box,
    Select,
    Textarea,
    HStack,
    Image,
    IconButton,
    SimpleGrid,
    Switch,
    FormHelperText,
    Stack,
    Progress,
    Text,
    Tooltip,
    useClipboard,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { CloseIcon } from "@chakra-ui/icons";
import { Document, Page, pdfjs } from "react-pdf";
import { useAuth } from "../../contexts/AuthContext";
import { normalizeMediaUrl } from "../../helpers";
import { ProjectTask, TaskStatus } from "../../generated/graphql";

enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}

// Configure pdf.js worker for react-pdf v10 with Create React App
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PhotoUpload {
    url: string;
    description?: string;
    fileType?: string;
}


const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      description
      status
      projectId
      assignedTo {
        id
        email
      }
      media {
        url
        description
        fileType
      }
      billed
      billable
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      description
      status
      projectId
      assignedTo {
        id
        email
      }
      media {
        url
        description
        fileType
      }
      billed
      billable
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadToPinata(file: $file)
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

// GraphQL mutations for AI improvement
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

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onTaskUpdated?: () => void;
    existingTask?: {
        id: string;
        description: string;
        status: string;
        assignedTo?: { id: string }[];
        media?: {  // Changed from photos to media
            url: string;
            description?: string;
            fileType: string;  // Add this field
        }[];
        billed: boolean;
        billable?: boolean;
    };
}

const isPDF = (url: string): boolean => {
    return url.endsWith(".pdf") ||
        url.includes("application/pdf") ||
        url.includes("%2Fpdf") ||  // URL encoded /pdf
        url.toLowerCase().includes("pdf");
};

export const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    projectId,
    onTaskUpdated,
    existingTask
}) => {
    // Add console log to debug initial state
    console.log("TaskModal initialization:", {
        existingTask,
        isNewTask: !existingTask
    });

    // Get the current user from auth context
    const { user } = useAuth();

    const defaultClientId = "6760ec476be9cc253e78285c";
    const [assignedToIds, setAssignedToIds] = useState<string[]>(() => {
        if (existingTask?.assignedTo) {
            return existingTask.assignedTo.map(user => user.id);
        }
        // If no existing task (new task mode), use current user's ID if available, otherwise use default
        return user?.id ? [user.id] : [defaultClientId];
    });

    const [description, setDescription] = useState(existingTask?.description || "");
    const [status, setStatus] = useState(existingTask?.status || "PENDING");
    const [photos, setPhotos] = useState<PhotoUpload[]>(
        existingTask?.media?.map(media => ({
            url: normalizeMediaUrl(media.url), // Normalize URLs when loading existing task
            description: media.description || "",
            fileType: media.fileType || "image/*"
        })) || []
    );
    const [billed, setBilled] = useState(existingTask?.billed || false);
    const [billable, setBillable] = useState(existingTask?.billable !== undefined ? existingTask.billable : true);
    const [isImprovingDescription, setIsImprovingDescription] = useState(false);
    const [improvingFileDescription, setImprovingFileDescription] = useState<number | null>(null);
    const toast = useToast();

    const [createTask, { loading: createLoading }] = useMutation(CREATE_TASK);
    const [updateTask, { loading: updateLoading }] = useMutation(UPDATE_TASK);
    const [uploadFile] = useMutation(UPLOAD_FILE);
    const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);
    const [improveTaglineMutation] = useMutation(IMPROVE_TAGLINE);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Get clients for dropdown
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);

    // Add state for PDF preview
    const [selectedPDF, setSelectedPDF] = useState<PhotoUpload | null>(null);

    // Reset form when modal opens/closes or when existingTask changes
    useEffect(() => {
        if (existingTask) {
            setDescription(existingTask.description);
            setStatus(existingTask.status);
            setAssignedToIds(existingTask.assignedTo?.map(user => user.id) || []);
            setPhotos(existingTask.media?.map(media => ({
                url: normalizeMediaUrl(media.url), // Normalize URLs when setting photos
                description: media.description || "",
                fileType: media.fileType || "image/*"
            })) || []);
            setBilled(existingTask.billed);
            setBillable(existingTask.billable !== undefined ? existingTask.billable : true);
        } else {
            setDescription("");
            setStatus("PENDING");
            // For new tasks, use current user's ID if available
            setAssignedToIds(user?.id ? [user.id] : [defaultClientId]);
            setPhotos([]);
            setBilled(false);
            setBillable(true);
        }
        setSelectedPDF(null);
    }, [existingTask, isOpen, user]);

    // Add logging for component lifecycle and state changes
    useEffect(() => {
        console.log("TaskModal - Component mounted or updated");
        console.log("Current photos:", photos);
        console.log("Existing task:", existingTask);
    }, [photos, existingTask]);

    const handleSubmit = async () => {
        try {
            const input = {
                description: description.trim(),
                projectId,
                status: status as TaskStatus,
                assignedTo: assignedToIds.length > 0 ? assignedToIds : undefined,
                media: photos.length > 0 ? photos.map(photo => ({
                    url: photo.url, // Keep the normalized URL
                    description: photo.description || undefined,
                    fileType: photo.fileType || "image/*"
                })) : undefined,
                billed: billed || undefined,
                billable: billable
            };

            console.log(`${existingTask ? "Updating" : "Creating"} task with input:`, input);

            const { data } = existingTask
                ? await updateTask({
                    variables: {
                        id: existingTask.id,
                        input
                    }
                })
                : await createTask({
                    variables: { input }
                });

            toast({
                title: `Task ${existingTask ? "updated" : "created"}`,
                status: "success",
                duration: 3000,
            });
            onTaskUpdated?.();
            handleClose();
        } catch (error) {
            console.error(`${existingTask ? "Update" : "Create"} task error:`, error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to ${existingTask ? "update" : "create"} task`,
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleClose = () => {
        setDescription("");
        setStatus("PENDING");
        setAssignedToIds([]);
        setPhotos([]);
        setBilled(false);
        setBillable(true);
        setSelectedPDF(null); // Reset PDF preview
        setIsImprovingDescription(false);
        setImprovingFileDescription(null);
        onClose();
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

    // Generate AI context for task description
    const getDescriptionContext = (value: string) => {
        return `Please improve this task description to be an actionable, professional task in maximum 30 words. Start with action verbs like "Build", "Configure", "Implement", "Develop", "Create", "Setup", etc. Focus on WHAT needs to be done, not WHY. This is a specific task description that will be shown to the client to demonstrate concrete work being completed. Make it sound technical, specific, and valuable. Return ONLY the improved task description without any preamble, explanation, or quotes. Original description: "${value}"`;
    };

    // AI improvement handler for task description
    const handleImproveDescription = async () => {
        const value = description;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a task description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingDescription(true);
        try {
            const context = getDescriptionContext(value);
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });
            if (data?.improveDescription) {
                setDescription(cleanAIResponse(data.improveDescription));
                toast({
                    title: "✨ Task description improved!",
                    description: "Claude has enhanced your task description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving task description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve task description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingDescription(false);
        }
    };

    // Generate AI context for file description
    const getFileDescriptionContext = (value: string) => {
        return `Please improve this file description to be concise and descriptive in maximum 10 words. This describes evidence/proof of work for a task. Make it clear what the file shows. Return ONLY the improved description without any preamble, explanation, or quotes. Original description: "${value}"`;
    };

    // AI improvement handler for file description
    const handleImproveFileDescription = async (index: number) => {
        const currentDescription = photos[index].description || "";
        if (!currentDescription.trim()) {
            toast({
                title: "No description to improve",
                description: "Please enter a file description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setImprovingFileDescription(index);
        try {
            const context = getFileDescriptionContext(currentDescription);
            const { data } = await improveDescriptionMutation({
                variables: { text: currentDescription, context }
            });
            if (data?.improveDescription) {
                const newPhotos = [...photos];
                newPhotos[index].description = cleanAIResponse(data.improveDescription);
                setPhotos(newPhotos);
                toast({
                    title: "✨ File description improved!",
                    description: "Claude has enhanced your file description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving file description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve file description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setImprovingFileDescription(null);
        }
    };

    // Add logging to file upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "video/mp4"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image, PDF, or MP4 file",
                status: "error",
                duration: 3000,
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 100);

            const { data } = await uploadFile({
                variables: { file }
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (data.uploadToPinata) {
                const newPhoto = {
                    url: normalizeMediaUrl(data.uploadToPinata), // Normalize the uploaded URL immediately
                    description: "",
                    fileType: file.type
                };
                setPhotos([...photos, newPhoto]);
                toast({
                    title: "File uploaded",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("File upload error:", error);
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload file",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handlePhotoDescriptionChange = (index: number, description: string) => {
        const newPhotos = [...photos];
        newPhotos[index].description = description;
        setPhotos(newPhotos);
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    // Add detailed logging for media rendering
    const renderFilePreview = (photo: PhotoUpload, index: number) => {
        // Comprehensive logging for debugging
        console.log("🎨 === MEDIA RENDERING DEBUG ===", {
            index,
            photo: {
                url: photo.url,
                fileType: photo.fileType,
                description: photo.description
            },
            normalizedUrl: normalizeMediaUrl(photo.url),
            urlAnalysis: {
                isPDF: photo.fileType === "application/pdf" || photo.url.toLowerCase().includes("pdf"),
                isVideo: photo.fileType === "video/mp4" || photo.url.endsWith(".mp4"),
                isImage: photo.fileType?.startsWith("image/"),
                hasFileType: !!photo.fileType,
                fileTypeValue: photo.fileType || "NO_FILETYPE_SET"
            },
            urlPatterns: {
                endsWithPDF: photo.url.endsWith(".pdf"),
                endsWithMP4: photo.url.endsWith(".mp4"),
                endsWithJPG: photo.url.endsWith(".jpg") || photo.url.endsWith(".jpeg"),
                endsWithPNG: photo.url.endsWith(".png"),
                endsWithGIF: photo.url.endsWith(".gif"),
                containsIPFS: photo.url.includes("ipfs"),
                containsGateway: photo.url.includes("gateway")
            }
        });

        // Use normalized URL for all media rendering
        const normalizedUrl = normalizeMediaUrl(photo.url);

        // PDF handling
        if (photo.fileType === "application/pdf" || photo.url.toLowerCase().includes("pdf")) {
            console.log("📄 Rendering as PDF:", { normalizedUrl, fileType: photo.fileType });
            return (
                <Box
                    maxH="100px"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => setSelectedPDF({ ...photo, url: normalizedUrl })}
                >
                    <Document
                        file={normalizedUrl}
                        onLoadSuccess={({ numPages }) => {
                            console.log("✅ PDF loaded successfully:", {
                                url: normalizedUrl,
                                numPages,
                                index
                            });
                        }}
                        onLoadError={(error) => {
                            console.error("❌ PDF load error:", {
                                error,
                                url: normalizedUrl,
                                index,
                                errorMessage: error?.message || "Unknown error"
                            });
                        }}
                    >
                        <Page pageNumber={1} height={100} scale={0.5} />
                    </Document>
                </Box>
            );
        }

        // Video handling
        if (photo.fileType === "video/mp4" || photo.url.endsWith(".mp4")) {
            console.log("🎥 Rendering as VIDEO:", { normalizedUrl, fileType: photo.fileType });
            return (
                <Box maxH="100px" overflow="hidden">
                    <video
                        src={normalizedUrl}
                        controls
                        style={{ width: "100%", maxHeight: "100px", objectFit: "contain" }}
                        onLoadStart={() => console.log("🎥 Video load started:", { normalizedUrl, index })}
                        onLoadedData={() => console.log("✅ Video data loaded:", { normalizedUrl, index })}
                        onError={(e) => {
                            console.error("❌ Video load error:", {
                                event: e,
                                url: normalizedUrl,
                                index,
                                target: e.currentTarget.src
                            });
                        }}
                    >
                        Your browser does not support the video tag.
                    </video>
                </Box>
            );
        }

        // Default to image handling
        console.log("🖼️ Rendering as IMAGE (default):", {
            normalizedUrl,
            fileType: photo.fileType || "UNDEFINED",
            willRenderAs: "Image component"
        });

        return (
            <Box maxH="100px" overflow="hidden">
                <Image
                    src={normalizedUrl}
                    alt={`Upload ${index + 1}`}
                    maxH="100px"
                    objectFit="contain"
                    onLoad={() => {
                        console.log("✅ Image loaded successfully:", {
                            url: normalizedUrl,
                            index,
                            fileType: photo.fileType
                        });
                    }}
                    onError={(e) => {
                        const imgElement = e.currentTarget as HTMLImageElement;
                        console.error("❌ IMAGE LOAD ERROR:", {
                            url: normalizedUrl,
                            originalUrl: photo.url,
                            index,
                            fileType: photo.fileType || "NO_FILETYPE",
                            imgSrc: imgElement.src,
                            imgComplete: imgElement.complete,
                            imgNaturalWidth: imgElement.naturalWidth,
                            imgNaturalHeight: imgElement.naturalHeight,
                            error: e,
                            suggestions: [
                                "Check if URL is accessible",
                                "Check CORS settings",
                                "Check if normalizeMediaUrl is working",
                                "Check network tab for 404/403 errors",
                                "Check if file actually exists at URL"
                            ]
                        });
                    }}
                />
            </Box>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{existingTask ? "Edit Task" : "Add New Task"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <HStack justify="space-between" align="center" mb={2}>
                                <FormLabel mb={0}>Description*</FormLabel>
                                <HStack spacing={2}>
                                    <Tooltip 
                                        label={
                                            <Box p={2} maxW="600px">
                                                <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                <Text fontSize="xs" whiteSpace="pre-wrap">
                                                    {getDescriptionContext(description || "[your task description]")}
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
                                            isDisabled={!description.trim()}
                                            isLoading={isImprovingDescription}
                                            onClick={handleImproveDescription}
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
                                        isDisabled={!description.trim()}
                                        onClick={() => {
                                            if (description.trim()) {
                                                navigator.clipboard.writeText(getDescriptionContext(description));
                                                toast({
                                                    title: "AI context copied!",
                                                    description: "The full context has been copied to your clipboard",
                                                    status: "success",
                                                    duration: 2000,
                                                });
                                            }
                                        }}
                                        title="Copy AI context to clipboard"
                                    />
                                </HStack>
                            </HStack>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter task description (e.g., 'Build user login system') - AI will make it professional..."
                                rows={4}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                bg={
                                    status === "COMPLETED" ? "green.50" :
                                        status === "IN_PROGRESS" ? "green.50" : "orange.50"
                                }
                                borderColor={
                                    status === "COMPLETED" ? "green.400" :
                                        status === "IN_PROGRESS" ? "green.400" : "orange.400"
                                }
                            >
                                <option value="PENDING" style={{ backgroundColor: "var(--chakra-colors-orange-50)" }}>Pending</option>
                                <option value="IN_PROGRESS" style={{ backgroundColor: "var(--chakra-colors-green-50)" }}>In Progress</option>
                                <option value="COMPLETED" style={{ backgroundColor: "var(--chakra-colors-green-50)" }}>Completed</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Assign To</FormLabel>
                            <Select
                                value={assignedToIds[0] || ""}
                                onChange={(e) => setAssignedToIds(e.target.value ? [e.target.value] : [])}
                                placeholder="Select client"
                                isDisabled={clientsLoading}
                            >
                                {clientsData?.clients?.map((client: any) => (
                                    <option key={client.id} value={client.id}>
                                        {client.businessName ? `${client.businessName} - ` : ""}
                                        {client.fName} {client.lName} ({client.email})
                                        {client.id === user?.id ? " (You)" : ""}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Task Evidence</FormLabel>
                            <Input
                                type="file"
                                accept="image/*,video/mp4,application/pdf"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <FormHelperText>
                                Upload images, videos, or PDFs as proof of work (screenshots, recordings, documents, etc.)
                            </FormHelperText>
                            {isUploading && (
                                <Box mt={2}>
                                    <Text>Uploading... {uploadProgress.toFixed(2)}%</Text>
                                    <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                                </Box>
                            )}
                        </FormControl>

                        {photos.length > 0 && (
                            <SimpleGrid columns={2} spacing={4} w="full">
                                {photos.map((photo, index) => (
                                    <Box key={index} borderWidth={1} p={2} borderRadius="md" position="relative">
                                        {renderFilePreview(photo, index)}
                                        <VStack spacing={2} mt={2} align="stretch">
                                            <HStack spacing={2} align="flex-start">
                                                <Textarea
                                                    size="sm"
                                                    placeholder="File description (max 10 words)"
                                                    value={photo.description}
                                                    onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
                                                    flex={1}
                                                    rows={2}
                                                    resize="vertical"
                                                />
                                                <VStack spacing={1}>
                                                    <Tooltip 
                                                        label={
                                                            <Box p={2} maxW="500px">
                                                                <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                                <Text fontSize="xs" whiteSpace="pre-wrap">
                                                                    {getFileDescriptionContext(photo.description || "[your file description]")}
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
                                                            isDisabled={!photo.description?.trim()}
                                                            isLoading={improvingFileDescription === index}
                                                            onClick={() => handleImproveFileDescription(index)}
                                                            minW="auto"
                                                            px={2}
                                                        >
                                                            ✨
                                                        </Button>
                                                    </Tooltip>
                                                    <IconButton
                                                        aria-label="Copy AI context"
                                                        icon={<Text fontSize="xs">📋</Text>}
                                                        size="xs"
                                                        variant="ghost"
                                                        isDisabled={!photo.description?.trim()}
                                                        onClick={() => {
                                                            if (photo.description?.trim()) {
                                                                navigator.clipboard.writeText(getFileDescriptionContext(photo.description));
                                                                toast({
                                                                    title: "AI context copied!",
                                                                    description: "The file description context has been copied",
                                                                    status: "success",
                                                                    duration: 2000,
                                                                });
                                                            }
                                                        }}
                                                        title="Copy AI context"
                                                    />
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                        <IconButton
                                            aria-label="Remove file"
                                            icon={<CloseIcon />}
                                            size="sm"
                                            position="absolute"
                                            right={2}
                                            top={2}
                                            onClick={() => removePhoto(index)}
                                            bg="red.500"
                                            color="white"
                                            _hover={{ bg: "red.600" }}
                                        />
                                    </Box>
                                ))}
                            </SimpleGrid>
                        )}

                        <HStack spacing={6} width="full">
                            <FormControl flex={1}>
                                <FormLabel>Billable</FormLabel>
                                <Switch
                                    isChecked={billable}
                                    onChange={(e) => {
                                        setBillable(e.target.checked);
                                        // If marking as non-billable, also mark as not billed
                                        if (!e.target.checked) {
                                            setBilled(false);
                                        }
                                    }}
                                    colorScheme="green"
                                />
                                <FormHelperText>Is this task billable?</FormHelperText>
                            </FormControl>
                            
                            <FormControl flex={1}>
                                <FormLabel>Billed</FormLabel>
                                <Switch
                                    isChecked={billed}
                                    onChange={(e) => setBilled(e.target.checked)}
                                    isDisabled={!billable}
                                    colorScheme="purple"
                                />
                                <FormHelperText>
                                    {!billable ? "Non-billable task" : "Mark if this task has been billed"}
                                </FormHelperText>
                            </FormControl>
                        </HStack>

                        <HStack spacing={4} width="full" justify="flex-end">
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleSubmit}
                                isLoading={createLoading || updateLoading}
                                disabled={!description}
                            >
                                {existingTask ? "Update Task" : "Create Task"}
                            </Button>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
            {selectedPDF && (
                <Modal isOpen={!!selectedPDF} onClose={() => setSelectedPDF(null)} size="6xl">
                    <ModalOverlay />
                    <ModalContent maxW="90vw" maxH="90vh">
                        <ModalCloseButton zIndex="popover" />
                        <ModalBody p={0}>
                            <Box height="85vh" overflow="auto">
                                <Document file={normalizeMediaUrl(selectedPDF.url)}>
                                    <Page
                                        pageNumber={1}
                                        width={window.innerWidth * 0.8}
                                    />
                                </Document>
                            </Box>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </Modal>
    );
}; 