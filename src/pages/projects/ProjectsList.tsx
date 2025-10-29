import React, { useEffect } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Avatar,
  Icon,
  Button,
  Skeleton,
  useToast,
  Progress,
  Center,
  useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { FiUsers, FiCheckCircle, FiDollarSign, FiTrash2, FiLock } from "react-icons/fi";
import projectsModuleConfig from "./moduleConfig";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { useAuth } from "../../contexts/AuthContext";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_ALL_PROJECTS = gql`
  query GetAllProjects {
    projects {
      id
      projectName
      projectGoal
      progress
      billingClient {
        id
        fName
        lName
        email
        businessName
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
        assignedTo {
          id
          fName
          lName
        }
        billed
      }
      bills {
        id
        lineItems {
          id
          amount
        }
        isPaid
        status
      }
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

const ProjectCard = ({ project, onDelete }: { project: any, onDelete: () => void }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // Consistent styling from brandConfig
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const handleClick = (e: React.MouseEvent, action: "view" | "delete") => {
    e.stopPropagation();
    if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this project?")) {
        onDelete();
      }
    } else {
      navigate(`/project/${project.id}`);
    }
  };

  // Debug logging
  console.log(`Project ${project.projectName}:`, {
    tasks: project.tasks,
    taskCount: project.tasks?.length || 0,
    bills: project.bills,
    members: project.members
  });

  const completedTasks = project.tasks.filter((t: any) => t.status === "COMPLETED").length;
  const billedTasks = project.tasks.filter((t: any) => t.billed).length;
  
  // Count bills that are either SENT or marked as PAID (regardless of status)
  // This ensures we include all actual bills, not drafts/proposals that haven't been sent
  const actualBills = project.bills.filter((b: any) => b.status === "SENT" || b.isPaid);
  const totalBilled = actualBills.reduce((sum: number, bill: any) =>
    sum + (bill.lineItems?.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0) || 0),
    0);
  const paidBills = actualBills.filter((b: any) => b.isPaid).length;
  
  // Debug logging for billing
  console.log(`Project ${project.projectName} billing:`, {
    allBills: project.bills.length,
    actualBills: actualBills.length,
    sentBills: project.bills.filter((b: any) => b.status === "SENT").length,
    paidBills: project.bills.filter((b: any) => b.isPaid).length,
    draftBills: project.bills.filter((b: any) => b.status === "DRAFT" && !b.isPaid).length,
    proposalBills: project.bills.filter((b: any) => b.status === "PROPOSAL" && !b.isPaid).length,
    totalBilled
  });

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
      cursor="pointer"
      onClick={(e) => handleClick(e, "view")}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
        borderColor: textSecondary,
        transition: "all 0.2s"
      }}
      transition="all 0.2s"
    >
      <CardHeader>
        <HStack justify="space-between" width="full">
          <VStack align="start" spacing={2}>
            <Heading size="md" color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              {project.projectName}
            </Heading>
            <HStack spacing={2} flexWrap="wrap">
              {project.billingClient.businessName && (
                <Badge 
                  bg="rgba(59, 130, 246, 0.2)"
                  color="#3B82F6"
                  border="1px solid"
                  borderColor="rgba(59, 130, 246, 0.3)"
                >{project.billingClient.businessName}</Badge>
              )}
              <Badge 
                bg="rgba(251, 146, 60, 0.2)"
                color="#FB923C"
                border="1px solid"
                borderColor="rgba(251, 146, 60, 0.3)"
                fontSize="sm" px={2} py={1}>
                {project.tasks?.length || 0} Total Tasks
              </Badge>
              <Badge 
                bg="rgba(34, 197, 94, 0.2)"
                color="#22C55E"
                border="1px solid"
                borderColor="rgba(34, 197, 94, 0.3)"
                fontSize="sm" px={2} py={1}>
                {completedTasks} Completed
              </Badge>
              <Badge 
                bg="rgba(168, 85, 247, 0.2)"
                color="#A855F7"
                border="1px solid"
                borderColor="rgba(168, 85, 247, 0.3)"
                fontSize="sm" px={2} py={1}>
                ${totalBilled.toLocaleString()} Billed
              </Badge>
            </HStack>
          </VStack>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleClick(e, "delete")}
            color="#EF4444"
            _hover={{ bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444" }}
          >
            <Icon as={FiTrash2} />
          </Button>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack align="start" spacing={4}>
          <Text noOfLines={2} color={textSecondary} fontFamily={brandConfig.fonts.body}>
            {project.projectGoal}
          </Text>

          <Box width="full">
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Project Progress</Text>
              <Text fontSize="sm" color={textSecondary}>{project.progress || 0}%</Text>
            </HStack>
            <Progress
              value={project.progress || 0}
              size="sm"
              colorScheme={
                (project.progress || 0) >= 100 ? "green" :
                  (project.progress || 0) >= 50 ? "blue" : "yellow"
              }
              borderRadius="full"
              hasStripe
              isAnimated
            />
          </Box>

          <SimpleGrid columns={4} spacing={4} width="full">
            <VStack>
              <Icon as={FiUsers} color="#3B82F6" boxSize={5} />
              <Text fontWeight="bold" color={textPrimary}>{project.members.length}</Text>
              <Text fontSize="sm" color={textMuted}>Members</Text>
            </VStack>

            <VStack>
              <Icon as={FiCheckCircle} color="#22C55E" boxSize={5} />
              <Text fontWeight="bold" color={textPrimary}>{completedTasks}/{project.tasks.length}</Text>
              <Text fontSize="sm" color={textMuted}>Tasks Done</Text>
            </VStack>

            <VStack>
              <Icon as={FiDollarSign} color="#A855F7" boxSize={5} />
              <Text fontWeight="bold" color={textPrimary}>${totalBilled}</Text>
              <Text fontSize="sm" color={textMuted}>Billed</Text>
            </VStack>

            <VStack>
              <Icon as={FiCheckCircle} color="#14B8A6" boxSize={5} />
              <Text fontWeight="bold" color={textPrimary}>{billedTasks}/{project.tasks.length}</Text>
              <Text fontSize="sm" color={textMuted}>Tasks Billed</Text>
            </VStack>
          </SimpleGrid>

          <HStack spacing={2} wrap="wrap">
            {project.members.slice(0, 3).map((member: any) => (
              <Avatar
                key={member.id}
                size="sm"
                name={`${member.fName} ${member.lName}`}
                title={`${member.fName} ${member.lName}`}
                bg="#3B82F6"
              />
            ))}
            {project.members.length > 3 && (
              <Avatar
                size="sm"
                name={`+${project.members.length - 3}`}
                bg={textMuted}
              />
            )}
          </HStack>

          {actualBills.length > 0 && (
            <HStack spacing={2}>
              <Badge 
                bg={paidBills === actualBills.length ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 191, 36, 0.2)"}
                color={paidBills === actualBills.length ? "#22C55E" : "#FBBF24"}
                border="1px solid"
                borderColor={paidBills === actualBills.length ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 191, 36, 0.3)"}
              >
                {paidBills}/{actualBills.length} Bills Paid
              </Badge>
              <Badge 
                bg="rgba(59, 130, 246, 0.2)"
                color="#3B82F6"
                border="1px solid"
                borderColor="rgba(59, 130, 246, 0.3)"
              >
                {billedTasks}/{project.tasks.length} Tasks Billed
              </Badge>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const ProjectsList = () => {
  usePageTitle("Projects");
  const toast = useToast();
  const navigate = useNavigate();
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_ALL_PROJECTS, {
    skip: !isAuthenticated || !user?.permissions?.includes("PROJECTS_ADMIN"),
  });
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access projects",
        status: "warning",
        duration: 3000,
      });
      navigate("/");
    } else if (!authLoading && isAuthenticated && !user?.permissions?.includes("PROJECTS_ADMIN")) {
      // User is authenticated but doesn't have the required permission
      // Don't redirect, just show access denied
    }
  }, [authLoading, isAuthenticated, user, navigate, toast]);

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      toast({
        title: "Project deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch(); // Refresh the projects list
    },
    onError: (error) => {
      toast({
        title: "Error deleting project",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject({
        variables: { id: projectId },
      });
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (error) {
    console.error("GraphQL Error:", error);
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
      <Container maxW="container.xl" py={12} flex="1">
        {/* Show access denied if user doesn't have permission */}
        {!authLoading && isAuthenticated && !user?.permissions?.includes("PROJECTS_ADMIN") ? (
          <Center minH="50vh">
            <VStack spacing={6}>
              <Icon as={FiLock} boxSize={16} color={textMuted} />
              <Heading size="lg" color={textPrimary}>
                Access Denied
              </Heading>
              <Text color={textMuted} textAlign="center" maxW="md">
                You need PROJECTS_ADMIN permission to access this page. Please contact your administrator to request access.
              </Text>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
              >
                Go to Home
              </Button>
            </VStack>
          </Center>
        ) : (
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg" color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              📂 Projects
            </Heading>
            <Button
              bg="white"
              color="black"
              _hover={{ 
                bg: "gray.100",
                transform: "translateY(-2px)"
              }}
              _active={{ transform: "translateY(1px)" }}
              onClick={() => navigate("/projects/new")}
              size="lg"
              fontFamily={brandConfig.fonts.body}
              boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
            >
              New Project
            </Button>
          </HStack>

          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="300px" borderRadius="lg" />
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {data?.projects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </SimpleGrid>
          )}

          {/* Empty state */}
          {!loading && data?.projects?.length === 0 && (
            <Box
              textAlign="center"
              py={12}
              px={6}
              borderWidth="1px"
              borderRadius="lg"
              borderStyle="dashed"
              borderColor={cardBorder}
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
            >
              <Icon as={FiCheckCircle} boxSize={12} color="#3B82F6" mb={4} />
              <Heading as="h4" size="md" mb={2} color={textPrimary}>
                No projects yet
              </Heading>
              <Text color={textMuted} mb={4}>
                Start by creating your first project to organize your work
              </Text>
              <Button
                bg="white"
                color="black"
                _hover={{ 
                  bg: "gray.100",
                  transform: "translateY(-2px)"
                }}
                onClick={() => navigate("/projects/new")}
              >
                Create First Project
              </Button>
            </Box>
          )}
        </VStack>
        )}
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ProjectsList; 