import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Select,
    Stack,
    Textarea,
    useToast,
    VStack,
    HStack,
    Text,
    Tooltip,
    IconButton,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import projectsModuleConfig from "./moduleConfig";
import { Project, ProjectTask, ProjectInput } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Query to get all clients for the dropdown
const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
    }
  }
`;

// Mutation to create a new project
const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      projectName
      projectGoal
      projectDescription
      billingClient {
        id
        fName
        lName
        email
      }
      members {
        id
      }
      tasks {
        id
        description
        status
        assignedTo {
          id
        }
        media {
          url
          description
        }
        billed
      }
      createdAt
      updatedAt
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

interface FormData {
    projectName: string;
    projectGoal: string;
    projectDescription: string;
    clientId: string;
}

const NewProject = () => {
    usePageTitle("New Project");
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get("clientId");

    // Modify initial form data to include clientId from URL
    const initialFormData: FormData = {
        projectName: "",
        projectGoal: "",
        projectDescription: "",
        clientId: clientId || "", // Pre-select client if ID exists
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const navigate = useNavigate();
    const toast = useToast();

    // AI improvement state
    const [isImprovingProjectName, setIsImprovingProjectName] = useState(false);
    const [isImprovingProjectGoal, setIsImprovingProjectGoal] = useState(false);
    const [isImprovingProjectDescription, setIsImprovingProjectDescription] = useState(false);

    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    // Get clients for dropdown
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);

    // AI improvement mutations
    const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);
    const [improveTaglineMutation] = useMutation(IMPROVE_TAGLINE);

    // Create project mutation
    const [createProject, { loading: createLoading }] = useMutation(CREATE_PROJECT, {
        onCompleted: (data) => {
            console.log("Mutation completed successfully:", data);
            toast({
                title: "Project Created",
                description: "New project has been created successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`/project/${data.createProject.id}`);
        },
        onError: (error) => {
            console.error("Detailed mutation error:", {
                message: error.message,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError,
                extraInfo: error.extraInfo,
                clientErrors: error.clientErrors
            });

            // More user-friendly error message
            const errorMessage = error.graphQLErrors?.[0]?.extensions?.validationErrors
                ? JSON.stringify(error.graphQLErrors[0].extensions.validationErrors, null, 2)
                : error.message;

            toast({
                title: "Error creating project",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    // Add useEffect to set client when data loads
    useEffect(() => {
        if (clientId && clientsData?.clients) {
            setFormData(prev => ({
                ...prev,
                clientId: clientId
            }));
        }
    }, [clientId, clientsData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
    const getProjectNameContext = (value: string) => {
        return `Please improve this project name to be more professional, clear, and descriptive while keeping the core intent. Make it suitable for business project documentation. Return ONLY the improved project name without any preamble, explanation, or quotes. Original name: "${value}"`;
    };

    const getProjectGoalContext = (value: string) => {
        const projectName = formData.projectName ? ` for the project "${formData.projectName}"` : '';
        return `Please create a single, concise project goal${projectName} in maximum 17 words. Make it clear, specific, and actionable. Focus on the main objective. Return ONLY the improved goal without any preamble, explanation, or quotes. Original goal: "${value}"`;
    };

    const getProjectDescriptionContext = (value: string) => {
        return `Please create a concise, professional project description in one paragraph with maximum 70 words. The description should be clear and explain what the project is about, its purpose, and what it aims to achieve. Make it suitable for business documentation. DO NOT include the project name or title in the description - just provide the descriptive content. Return ONLY the improved description without any preamble, explanation, quotes, or project name. Original input: "${value}"`;
    };

    // AI improvement handlers
    const handleImproveProjectName = async () => {
        const value = formData.projectName;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a project name first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingProjectName(true);
        try {
            const context = getProjectNameContext(value);
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });
            if (data?.improveDescription) {
                setFormData(prev => ({ ...prev, projectName: cleanAIResponse(data.improveDescription) }));
                toast({
                    title: "✨ Project name improved!",
                    description: "Claude has enhanced your project name",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving project name:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve project name. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingProjectName(false);
        }
    };

    const handleImproveProjectDescription = async () => {
        const value = formData.projectDescription;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a project description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingProjectDescription(true);
        try {
            const context = getProjectDescriptionContext(value);
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });
            if (data?.improveDescription) {
                setFormData(prev => ({ ...prev, projectDescription: cleanAIResponse(data.improveDescription) }));
                toast({
                    title: "✨ Project description improved!",
                    description: "Claude has enhanced your project description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving project description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve project description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingProjectDescription(false);
        }
    };

    const handleImproveProjectGoal = async () => {
        const value = formData.projectGoal;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a project goal first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingProjectGoal(true);
        try {
            const context = getProjectGoalContext(value);
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });
            if (data?.improveDescription) {
                setFormData(prev => ({ ...prev, projectGoal: cleanAIResponse(data.improveDescription) }));
                toast({
                    title: "✨ Project goal improved!",
                    description: "Claude has enhanced your project goal",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving project goal:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve project goal. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingProjectGoal(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast({
                title: "Error",
                description: "Please select a client",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Enhanced logging before submission
        console.log("=== Project Submission ===");
        console.log("Form Data:", {
            raw: formData,
            processed: {
                projectName: formData.projectName,
                projectGoal: formData.projectGoal,
                projectDescription: formData.projectDescription,
                billingClient: formData.clientId,
            }
        });

        try {
            const mutationInput = {
                projectName: formData.projectName,
                projectGoal: formData.projectGoal,
                projectDescription: formData.projectDescription,
                billingClient: formData.clientId,
            };

            console.log("Mutation Input:", mutationInput);

            const response = await createProject({
                variables: {
                    input: mutationInput
                },
            });

            console.log("Mutation Response:", response);

        } catch (error: any) {
            console.error("Error creating project:", {
                error,
                formData,
                errorType: error.constructor.name,
                errorStack: error.stack
            });
        }
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
            <Container maxW="container.md" py={12} flex="1">
                <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="xl"
                    overflow="hidden"
                >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                        <VStack align="start" spacing={2}>
                            <Heading
                                size="lg"
                                color={textPrimary}
                                fontFamily={brandConfig.fonts.heading}
                                fontWeight="600"
                            >
                                📁 Create New Project
                            </Heading>
                        </VStack>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={6}>
                                <FormControl isRequired>
                                    <FormLabel
                                        color={textPrimary}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Client
                                    </FormLabel>
                                    <Stack direction="row" spacing={4}>
                                        <Select
                                            name="clientId"
                                            value={formData.clientId}
                                            onChange={handleChange}
                                            placeholder="Select client"
                                            isDisabled={clientsLoading}
                                            bg="rgba(0, 0, 0, 0.2)"
                                            border="1px"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            borderRadius="lg"
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: textSecondary,
                                                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                            flex="1"
                                        >
                                            {clientsData?.clients?.map((client: any) => (
                                                <option key={client.id} value={client.id} style={{ backgroundColor: '#1a1a1a' }}>
                                                    {client.fName} {client.lName} ({client.email})
                                                </option>
                                            ))}
                                        </Select>
                                        <Button
                                            bg="white"
                                            color="black"
                                            _hover={{ 
                                                bg: "gray.100",
                                                transform: "translateY(-2px)"
                                            }}
                                            onClick={() => navigate("/newclient")}
                                            size="lg"
                                            flexShrink={0}
                                            boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                                        >
                                            New Client
                                        </Button>
                                    </Stack>
                                </FormControl>

                                <FormControl isRequired>
                                    <HStack justify="space-between" align="center" mb={2}>
                                        <FormLabel
                                            color={textPrimary}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={0}
                                        >
                                            Project Name
                                        </FormLabel>
                                        <HStack spacing={2}>
                                            <Tooltip 
                                                label={
                                                    <Box p={2} maxW="500px">
                                                        <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                        <Text fontSize="xs" whiteSpace="pre-wrap">
                                                            {getProjectNameContext(formData.projectName || "[your text here]")}
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
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    bg="rgba(0, 0, 0, 0.2)"
                                                    _hover={{
                                                        borderColor: textSecondary,
                                                        bg: "rgba(255, 255, 255, 0.05)"
                                                    }}
                                                    isDisabled={!formData.projectName.trim()}
                                                    isLoading={isImprovingProjectName}
                                                    onClick={handleImproveProjectName}
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
                                                isDisabled={!formData.projectName.trim()}
                                                onClick={() => {
                                                    if (formData.projectName.trim()) {
                                                        navigator.clipboard.writeText(getProjectNameContext(formData.projectName));
                                                        toast({
                                                            title: "AI context copied!",
                                                            description: "The project name context has been copied to your clipboard",
                                                            status: "success",
                                                            duration: 2000,
                                                        });
                                                    }
                                                }}
                                                title="Copy AI context to clipboard"
                                            />
                                        </HStack>
                                    </HStack>
                                    <Input
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        borderRadius="lg"
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <HStack justify="space-between" align="center" mb={2}>
                                        <FormLabel
                                            color={textPrimary}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={0}
                                        >
                                            Project Goal
                                        </FormLabel>
                                        <HStack spacing={2}>
                                            <Tooltip 
                                                label={
                                                    <Box p={2} maxW="500px">
                                                        <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                        <Text fontSize="xs" whiteSpace="pre-wrap">
                                                            {getProjectGoalContext(formData.projectGoal || "[your text here]")}
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
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    bg="rgba(0, 0, 0, 0.2)"
                                                    _hover={{
                                                        borderColor: textSecondary,
                                                        bg: "rgba(255, 255, 255, 0.05)"
                                                    }}
                                                    isDisabled={!formData.projectGoal.trim()}
                                                    isLoading={isImprovingProjectGoal}
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
                                                isDisabled={!formData.projectGoal.trim()}
                                                onClick={() => {
                                                    if (formData.projectGoal.trim()) {
                                                        navigator.clipboard.writeText(getProjectGoalContext(formData.projectGoal));
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
                                    </HStack>
                                    <Textarea
                                        name="projectGoal"
                                        value={formData.projectGoal}
                                        onChange={handleChange}
                                        placeholder="Enter a concise project goal (max 17 words)..."
                                        rows={2}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        borderRadius="lg"
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <HStack justify="space-between" align="center" mb={2}>
                                        <FormLabel
                                            color={textPrimary}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={0}
                                        >
                                            Project Description
                                        </FormLabel>
                                        <HStack spacing={2}>
                                            <Tooltip 
                                                label={
                                                    <Box p={2} maxW="600px">
                                                        <Text fontWeight="bold" fontSize="sm" mb={2}>AI Context:</Text>
                                                        <Text fontSize="xs" whiteSpace="pre-wrap">
                                                            {getProjectDescriptionContext(formData.projectDescription || "[your text here]")}
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
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    bg="rgba(0, 0, 0, 0.2)"
                                                    _hover={{
                                                        borderColor: textSecondary,
                                                        bg: "rgba(255, 255, 255, 0.05)"
                                                    }}
                                                    isDisabled={!formData.projectDescription.trim()}
                                                    isLoading={isImprovingProjectDescription}
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
                                                isDisabled={!formData.projectDescription.trim()}
                                                onClick={() => {
                                                    if (formData.projectDescription.trim()) {
                                                        navigator.clipboard.writeText(getProjectDescriptionContext(formData.projectDescription));
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
                                    </HStack>
                                    <Textarea
                                        name="projectDescription"
                                        value={formData.projectDescription}
                                        onChange={handleChange}
                                        placeholder="Provide a brief description of what this project involves (max 70 words)..."
                                        rows={4}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        borderRadius="lg"
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <Button
                                    type="submit"
                                    bg="white"
                                    color="black"
                                    _hover={{ 
                                        bg: "gray.100",
                                        transform: "translateY(-2px)"
                                    }}
                                    _active={{ transform: "translateY(1px)" }}
                                    isLoading={createLoading}
                                    size="lg"
                                    width="full"
                                    borderRadius="lg"
                                    fontWeight="600"
                                    boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                                    fontFamily={brandConfig.fonts.body}
                                >
                                    Create Project
                                </Button>
                            </Stack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default NewProject; 