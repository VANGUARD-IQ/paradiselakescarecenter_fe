import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Image,
  Divider,
  Spinner,
  SimpleGrid,
  Button,
  Icon,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FiClock, FiCalendar, FiChevronLeft, FiMaximize, FiPlayCircle, FiFileText } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { useAuth } from "../../contexts/AuthContext";
import projectsModuleConfig from "./moduleConfig";
import { format } from "date-fns";
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdf.js worker for react-pdf v10 with Create React App
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { normalizeMediaUrl } from "../../helpers";
import { LoginWithSmsModal } from "../authentication";
import { ProjectTask } from "../../generated/graphql";

// Query to get project details with tasks and their media
const GET_PROJECT_TIMELINE = gql`
  query GetProjectTimeline($id: ID!) {
    project(id: $id) {
      id
      projectName
      projectGoal
      createdAt
      tasks {
        id
        description
        status
        order
        createdAt
        updatedAt
        media {
          url
          description
          fileType
        }
      }
    }
  }
`;

// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    console.log(`Attempting to format date: ${dateString}`);
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.log(`Invalid date created from: ${dateString}`);
      return dateString;
    }

    console.log(`Parsed date: ${date.toString()}`);
    return format(date, "MMMM d, yyyy, h:mm a");
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
};

// Interface for timeline item
interface TimelineItem {
  id: string;
  type: "task" | "media";
  taskId?: string;
  taskDescription?: string;
  taskStatus?: string;
  url?: string;
  fileType?: string;
  description?: string;
  createdAt: string;
}

const TimelineView = () => {
  usePageTitle("Project Timeline");
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  
  // Dark glassmorphic theme colors
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const cardBg = cardGradientBg;
  const borderColor = cardBorder;

  // For modal image/video viewing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);

  // For lazy loading
  const [visibleItems, setVisibleItems] = useState<number>(10);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Timeline items state
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  
  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // GraphQL query - authentication check commented out for testing
  const { loading, error, data } = useQuery(GET_PROJECT_TIMELINE, {
    variables: { id },
    // skip: !isAuthenticated, // COMMENTED OUT FOR TESTING
    onCompleted: (receivedData) => {
      console.log("GraphQL query completed, data:", receivedData);
      if (receivedData?.project?.tasks) {
        console.log(`Project has ${receivedData.project.tasks.length} tasks`);
      } else {
        console.log("No tasks found in the response or tasks array is empty");
      }
    },
    onError: (err) => {
      console.error("GraphQL query error:", err.message);
    }
  });

  // Process data into chronological timeline
  useEffect(() => {
    if (data?.project) {
      console.log("Project data received:", data.project);
      console.log("Tasks array:", data.project.tasks);

      const items: TimelineItem[] = [];

      // Add tasks to timeline
      if (Array.isArray(data.project.tasks)) {
        data.project.tasks.forEach((task: any) => {
          console.log("Processing task:", task);

          // Skip adding task creation items - we only want media/evidence

          // Add task media
          if (task && task.id && task.media && Array.isArray(task.media) && task.media.length > 0) {
            console.log(`Task ${task.id} has ${task.media.length} media items`);
            task.media.forEach((media: any, index: number) => {
              if (media && media.url) {
                items.push({
                  id: `media-${task.id}-${index}`,
                  type: "media",
                  taskId: task.id,
                  taskDescription: task.description || "Unknown task",
                  url: media.url,
                  fileType: media.fileType || "image/jpeg",
                  description: media.description || "",
                  // Media items don't have createdAt in our schema, so use task's updatedAt
                  createdAt: task.updatedAt || task.createdAt || data.project.createdAt || new Date().toISOString(),
                });
              }
            });
          }
        });
      } else {
        console.warn("Project tasks is not an array:", data.project.tasks);
      }

      // Sort by date
      items.sort((a, b) => {
        // Safely parse dates, using current time as fallback
        const getTime = (dateStr: string): number => {
          try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? Date.now() : date.getTime();
          } catch (e) {
            return Date.now();
          }
        };

        const dateA = getTime(a.createdAt);
        const dateB = getTime(b.createdAt);
        return dateB - dateA; // Most recent first
      });

      console.log("Final timeline items:", items);

      setTimelineItems(items);
      setHasMore(items.length > visibleItems);
    } else {
      console.log("No project data received or project is undefined");
    }
  }, [data, visibleItems]);

  // Intersection observer for lazy loading
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleItems(prev => prev + 10);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle media click
  const handleMediaClick = (url: string, fileType: string) => {
    setSelectedMedia({ url, type: fileType });
    onOpen();
  };

  // Check authentication on mount - COMMENTED OUT FOR TESTING
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     setIsLoginModalOpen(true);
  //   }
  // }, [isAuthenticated]);

  // Handle login modal close
  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    // If user closes modal without logging in, they can't see the timeline
    if (!isAuthenticated) {
      // Don't redirect - let them see the login required state
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    // User stays on timeline page after successful login
  };

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
        <Container maxW="container.xl" py={10} flex="1">
          <VStack spacing={8} align="center">
            <Spinner size="xl" color={getColor("primary")} thickness="4px" />
            <Text color={textPrimary} fontFamily={brandConfig.fonts.body}>
              Loading project timeline...
            </Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
        <Container maxW="container.xl" py={10} flex="1">
          <VStack spacing={6} align="start">
            <Heading size="lg" color={getColor("status.error")} fontFamily={brandConfig.fonts.heading}>
              Error Loading Timeline
            </Heading>
            <Text color={textSecondary} fontFamily={brandConfig.fonts.body}>
              {error.message}
            </Text>
            <Button
              as={Link}
              to={`/project/${id}`}
              bg={getComponent("button", "primaryBg")}
              color="white"
              _hover={{ bg: getComponent("button", "primaryHover") }}
              fontFamily={brandConfig.fonts.body}
            >
              <Icon as={FiChevronLeft} mr={2} />
              Back to Project
            </Button>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (!data || !data.project) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
        <Container maxW="container.xl" py={10} flex="1">
          <VStack spacing={6} align="start">
            <Heading size="lg" color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              Project Not Found
            </Heading>
            <Button
              as={Link}
              to="/projects"
              bg={getComponent("button", "primaryBg")}
              color="white"
              _hover={{ bg: getComponent("button", "primaryHover") }}
              fontFamily={brandConfig.fonts.body}
            >
              <Icon as={FiChevronLeft} mr={2} />
              Back to Projects
            </Button>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Show authentication required state if not logged in - COMMENTED OUT FOR TESTING
  // if (!isAuthenticated) {
  //   return (
  //     <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
  //       <NavbarWithCallToAction />
  //       <Container maxW="container.xl" py={10} flex="1">
  //         <VStack spacing={8} align="center">
  //           <Heading size="xl" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
  //             Authentication Required
  //           </Heading>
  //           <Text fontSize="lg" color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
  //             Please log in to view the project timeline
  //           </Text>
  //           <Button
  //             size="lg"
  //             bg={getComponent("button", "primaryBg")}
  //             color={getColor("text.inverse")}
  //             _hover={{ bg: getComponent("button", "primaryHover") }}
  //             onClick={() => setIsLoginModalOpen(true)}
  //             fontFamily={brandConfig.fonts.body}
  //           >
  //             Log In to Continue
  //           </Button>
  //         </VStack>
  //       </Container>
  //       <FooterWithFourColumns />
  //       <LoginWithSmsModal
  //         isOpen={isLoginModalOpen}
  //         onClose={handleLoginModalClose}
  //         onLoginSuccess={handleLoginSuccess}
  //       />
  //     </Box>
  //   );
  // }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={projectsModuleConfig} />
      <Container maxW="container.xl" py={10} flex="1">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.heading}>
                {data.project.projectName} - Evidence Timeline
              </Heading>
              <Text color={brandConfig.colors.text.inverse} fontFamily={brandConfig.fonts.body}>
                Project started on {formatDate(data.project.createdAt)}
              </Text>
            </VStack>
            <Button
              as={Link}
              to={`/project/${id}`}
              bg={getComponent("button", "secondaryBg")}
              color={brandConfig.colors.text.inverse}
              borderColor={borderColor}
              _hover={{ 
                bg: getComponent("button", "secondaryHover"),
                borderColor: getColor("primary")
              }}
              variant="outline"
              fontFamily={brandConfig.fonts.body}
            >
              <Icon as={FiChevronLeft} mr={2} color={brandConfig.colors.text.inverse} />
              Back to Project
            </Button>
          </HStack>

          <Divider borderColor={borderColor} />

          <Box p={4} bg={getColor("status.info")} borderRadius="md" mb={6}>
            <Text color={getColor("text.inverse")} fontFamily={brandConfig.fonts.body}>
              This timeline shows all evidence files uploaded for this project. Media uploads are displayed in chronological order. Scroll down to load more items.
            </Text>
          </Box>

          {/* Timeline content */}
          <VStack spacing={8} align="stretch" position="relative">
            {/* Timeline line */}
            <Box
              position="absolute"
              left="24px"
              top={0}
              bottom={0}
              width="2px"
              bg={getColor("primary")}
              zIndex={1}
            />

            {timelineItems.slice(0, visibleItems).map((item, index) => (
              <Box
                key={item.id}
                ref={index === visibleItems - 1 ? lastItemRef : null}
                position="relative"
                pl={{ base: 10, md: 16 }}
                ml={2}
              >
                {/* Timeline dot */}
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  width="12px"
                  height="12px"
                  borderRadius="full"
                  bg={getColor("secondary")}
                  border="2px solid"
                  borderColor={getColor("primary")}
                  zIndex={2}
                  mt={2}
                />

                {/* Timeline content */}
                <VStack align="start" spacing={3}>
                  {/* Date indicator */}
                  <HStack>
                    <Icon as={FiCalendar} color={getColor("text.muted")} />
                    <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </HStack>

                  {/* Content card */}
                  <Box
                    bg={cardBg}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={4}
                    shadow="md"
                    width="full"
                  >
                    {item.type === "task" ? (
                      // Task item - should never show now
                      <VStack align="start" spacing={2}>
                        <Badge colorScheme="green" px={2} py={1}>Task Created</Badge>
                        <Text fontSize="lg" fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                          {item.taskDescription}
                        </Text>
                        <Badge
                          colorScheme={
                            item.taskStatus === "COMPLETED" ? "green" :
                              item.taskStatus === "IN_PROGRESS" ? "yellow" : "gray"
                          }
                        >
                          {item.taskStatus === "COMPLETED" ? "Completed" :
                            item.taskStatus === "IN_PROGRESS" ? "In Progress" : "Pending"}
                        </Badge>
                      </VStack>
                    ) : (
                      // Media item
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Badge colorScheme="purple" px={2} py={1}>
                            Evidence File
                          </Badge>
                          <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                            for task: {item.taskDescription}
                          </Text>
                        </HStack>

                        {item.description && (
                          <Text color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                            {item.description}
                          </Text>
                        )}

                        {/* Media preview */}
                        <Box width="full" position="relative">
                          {item.url && (
                            <>
                              {(item.fileType === "application/pdf" || item.url.toLowerCase().includes("pdf")) ? (
                                // PDF preview - consistent with ProjectPage and TaskModal
                                <Box
                                  maxH="300px"
                                  overflow="hidden"
                                  position="relative"
                                  cursor="pointer"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  onClick={() => window.open(normalizeMediaUrl(item.url!), "_blank")}
                                >
                                  <Document
                                    file={normalizeMediaUrl(item.url!)}
                                    onLoadSuccess={({ numPages }) => {
                                      console.log("Timeline PDF loaded successfully:", { url: item.url, numPages });
                                    }}
                                    onLoadError={(error) => {
                                      console.error("Timeline PDF load error:", error, "URL:", item.url);
                                    }}
                                  >
                                    <Page pageNumber={1} width={300} />
                                  </Document>
                                  <Button
                                    position="absolute"
                                    bottom={2}
                                    right={2}
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(normalizeMediaUrl(item.url!), "_blank");
                                    }}
                                  >
                                    Open PDF
                                  </Button>
                                </Box>
                              ) : (item.fileType === "video/mp4" || item.url.toLowerCase().includes(".mp4")) ? (
                                // Video preview - consistent with ProjectPage
                                <Box
                                  position="relative"
                                  borderRadius="md"
                                  overflow="hidden"
                                  maxH="300px"
                                  border="1px solid"
                                  borderColor={borderColor}
                                >
                                  <video
                                    src={normalizeMediaUrl(item.url)}
                                    controls
                                    style={{
                                      width: "100%",
                                      maxHeight: "300px",
                                      objectFit: "cover"
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Badge
                                    position="absolute"
                                    top={2}
                                    left={2}
                                    colorScheme="blue"
                                    fontSize="xs"
                                  >
                                    Video
                                  </Badge>
                                  <IconButton
                                    aria-label="View full screen"
                                    icon={<FiMaximize />}
                                    size="sm"
                                    position="absolute"
                                    bottom={2}
                                    right={2}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMediaClick(normalizeMediaUrl(item.url!), item.fileType!);
                                    }}
                                    bg="blackAlpha.600"
                                    color="white"
                                    _hover={{ bg: "blackAlpha.800" }}
                                  />
                                </Box>
                              ) : (
                                // Image preview - consistent with ProjectPage
                                <Box
                                  position="relative"
                                  borderRadius="md"
                                  overflow="hidden"
                                  maxH="300px"
                                  cursor="pointer"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  onClick={() => handleMediaClick(normalizeMediaUrl(item.url!), item.fileType || "image")}
                                >
                                  <Image
                                    src={normalizeMediaUrl(item.url)}
                                    alt={item.description || "Project evidence"}
                                    width="100%"
                                    maxH="300px"
                                    objectFit="cover"
                                    onError={(e) => {
                                      console.error("Timeline image load error:", e, "URL:", normalizeMediaUrl(item.url));
                                    }}
                                  />
                                  <Badge
                                    position="absolute"
                                    top={2}
                                    left={2}
                                    colorScheme="purple"
                                    fontSize="xs"
                                  >
                                    {item.description ? "Proof of Work" : "Evidence"}
                                  </Badge>
                                  <IconButton
                                    aria-label="View full size"
                                    icon={<FiMaximize />}
                                    size="sm"
                                    position="absolute"
                                    bottom={2}
                                    right={2}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMediaClick(normalizeMediaUrl(item.url!), item.fileType || "image");
                                    }}
                                    bg="blackAlpha.600"
                                    color="white"
                                    _hover={{ bg: "blackAlpha.800" }}
                                  />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </Box>
            ))}

            {/* Loader at the bottom */}
            {hasMore && (
              <Box ref={loaderRef} textAlign="center" py={8}>
                <Spinner size="md" />
              </Box>
            )}

            {!hasMore && timelineItems.length > 0 && (
              <Box textAlign="center" py={8}>
                <Text color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                  End of timeline
                </Text>
              </Box>
            )}

            {timelineItems.length === 0 && (
              <Box textAlign="center" py={12}>
                <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                  No evidence files available
                </Heading>
                <Text mt={2} color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                  This project doesn&apos;t have any uploaded evidence files yet.
                </Text>
              </Box>
            )}
          </VStack>
        </VStack>
      </Container>
      <FooterWithFourColumns />

      {/* Media modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none" maxW="90vw">
          <ModalCloseButton color="white" bg="blackAlpha.600" _hover={{ bg: "blackAlpha.800" }} />
          <ModalBody p={0}>
            {selectedMedia && (
              selectedMedia.type === "video/mp4" || selectedMedia.url.toLowerCase().includes(".mp4") ? (
                <Box maxH="90vh" display="flex" justifyContent="center" alignItems="center">
                  <video
                    src={normalizeMediaUrl(selectedMedia.url)}
                    controls
                    autoPlay
                    style={{ maxHeight: "90vh", maxWidth: "100%", margin: "0 auto" }}
                  />
                </Box>
              ) : (
                <Image
                  src={normalizeMediaUrl(selectedMedia.url)}
                  alt="Full size view"
                  maxH="90vh"
                  margin="0 auto"
                  objectFit="contain"
                />
              )
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Login Modal for unauthenticated users */}
      <LoginWithSmsModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </Box>
  );
};

export default TimelineView; 