import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Radio,
  RadioGroup,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  HStack,
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { getColor, brandConfig } from '../../brandConfig';

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      projectName
      projectDescription
      projectGoal
      progress
      billingClient {
        id
        fName
        lName
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      description
      projectId
    }
  }
`;

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskText: string;
  assigneeName?: string;
  dueDate?: string;
  priority?: string;
}

export const AddToProjectModal: React.FC<AddToProjectModalProps> = ({
  isOpen,
  onClose,
  taskText,
  assigneeName,
  dueDate,
  priority = 'MEDIUM',
}) => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const textColor = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const mutedTextColor = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const bg = getColor(colorMode === 'light' ? "background.lightCard" : "background.main", colorMode);
  const cardBg = getColor(colorMode === 'light' ? "white" : "background.cardGradient", colorMode);

  // Debug authentication
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("auth_token");
      console.log('Debug - Modal opened:');
      console.log('- Auth token present:', !!token);
      console.log('- Tenant ID:', brandConfig.tenantId);
      if (!token) {
        console.warn('No auth token found - user may need to log in');
      }
    }
  }, [isOpen]);

  const { data, loading, error } = useQuery(GET_PROJECTS, {
    fetchPolicy: 'cache-and-network',
    skip: !isOpen, // Only fetch when modal is open
    onError: (err) => {
      console.error('Error fetching projects:', err);
      console.error('GraphQL errors:', err.graphQLErrors);
      console.error('Network error:', err.networkError);
    },
  });

  const [createTask] = useMutation(CREATE_TASK);

  const handleAddToProject = async () => {
    if (!selectedProjectId) return;

    setIsAdding(true);
    try {
      const taskInput: any = {
        projectId: selectedProjectId,
        description: taskText,
        status: 'PENDING',
      };

      const result = await createTask({
        variables: {
          input: taskInput,
        },
      });

      if (result.data?.createTask) {
        // Open project in new tab
        const projectUrl = `/project/${selectedProjectId}`;
        window.open(projectUrl, '_blank');
        
        onClose();
      }
    } catch (error) {
      console.error('Error adding task to project:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'blue';
    if (progress >= 20) return 'yellow';
    return 'gray';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} borderColor={colorMode === 'light' ? "gray.200" : "rgba(255, 255, 255, 0.1)"} border="1px solid">
        <ModalHeader color={textColor}>Add Task to Project</ModalHeader>
        <ModalCloseButton color={textColor} />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box p={3} bg={bg} borderRadius="md">
              <Text fontSize="sm" color={mutedTextColor} mb={1}>Task:</Text>
              <Text color={textColor}>{taskText}</Text>
              {assigneeName && (
                <>
                  <Text fontSize="sm" color={mutedTextColor} mt={2} mb={1}>Assignee:</Text>
                  <Text color={textColor}>{assigneeName}</Text>
                </>
              )}
              {dueDate && (
                <>
                  <Text fontSize="sm" color={mutedTextColor} mt={2} mb={1}>Due Date:</Text>
                  <Text color={textColor}>{dueDate}</Text>
                </>
              )}
            </Box>

            <Text color={textColor} fontWeight="semibold">Select a Project:</Text>

            {loading && (
              <VStack py={4}>
                <Spinner color={textColor} />
                <Text color={mutedTextColor}>Loading projects...</Text>
              </VStack>
            )}

            {error && (
              <Alert status="error">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text>Error loading projects: {error.message}</Text>
                  {error.graphQLErrors?.map((e: any, i: number) => (
                    <Text key={i} fontSize="sm">{e.message}</Text>
                  ))}
                  {error.networkError && (
                    <Text fontSize="sm">Network: {(error.networkError as any)?.result?.errors?.[0]?.message || error.networkError.message}</Text>
                  )}
                </VStack>
              </Alert>
            )}

            {data?.projects && (
              <RadioGroup value={selectedProjectId} onChange={setSelectedProjectId}>
                <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                  {data.projects.map((project: any) => (
                    <Box
                      key={project.id}
                      p={3}
                      bg={selectedProjectId === project.id ? (colorMode === 'light' ? 'blue.50' : 'rgba(0, 122, 255, 0.1)') : bg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={selectedProjectId === project.id ? (colorMode === 'light' ? 'blue.300' : 'rgba(0, 122, 255, 0.3)') : 'transparent'}
                      cursor="pointer"
                      onClick={() => setSelectedProjectId(project.id)}
                      _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <Radio value={project.id} colorScheme="blue">
                        <VStack align="start" spacing={1} ml={2}>
                          <HStack>
                            <Text color={textColor} fontWeight="semibold">
                              {project.projectName}
                            </Text>
                            {project.progress !== undefined && project.progress !== null && (
                              <Badge colorScheme={getProgressColor(project.progress)} size="sm">
                                {project.progress}%
                              </Badge>
                            )}
                          </HStack>
                          {project.projectDescription && (
                            <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                              {project.projectDescription}
                            </Text>
                          )}
                          {project.billingClient && (
                            <Text fontSize="xs" color={mutedTextColor}>
                              Client: {project.billingClient.fName} {project.billingClient.lName}
                            </Text>
                          )}
                        </VStack>
                      </Radio>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>
            )}

            {data?.projects?.length === 0 && (
              <Alert status="info">
                <AlertIcon />
                No projects found. Please create a project first.
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} color={textColor}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAddToProject}
            isLoading={isAdding}
            isDisabled={!selectedProjectId}
          >
            Add to Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};