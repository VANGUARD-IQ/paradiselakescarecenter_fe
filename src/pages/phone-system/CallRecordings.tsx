import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  IconButton,
  useToast,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Input,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { 
  DownloadIcon, 
  DeleteIcon, 
  ViewIcon,
  RepeatIcon,
  TriangleUpIcon,
  EditIcon
} from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import phoneSystemModuleConfig from './moduleConfig';

// GraphQL Queries and Mutations
const GET_CALL_RECORDINGS = gql`
  query GetCallRecordings($filter: CallRecordingFilterInput, $page: Int, $limit: Int) {
    callRecordings(filter: $filter, page: $page, limit: $limit) {
      items {
        id
        recordingSid
        callSid
        from
        to
        duration
        direction
        status
        recordingUrl
        pinataUrl
        transcriptionStatus
        transcriptionText
        transcriptionConfidence
        recordedAt
        phoneNumber {
          id
          phoneNumber
          friendlyName
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const TRANSCRIBE_RECORDING = gql`
  mutation TranscribeRecording($recordingSid: String!) {
    transcribeRecording(recordingSid: $recordingSid) {
      id
      transcriptionStatus
      transcriptionText
    }
  }
`;

const DOWNLOAD_RECORDING_URL = gql`
  mutation DownloadRecordingUrl($recordingSid: String!) {
    downloadRecordingUrl(recordingSid: $recordingSid)
  }
`;

const DELETE_RECORDING = gql`
  mutation DeleteRecording($id: ID!) {
    deleteRecording(id: $id)
  }
`;

const SYNC_CALL_RECORDINGS = gql`
  mutation SyncCallRecordings($phoneNumberId: ID, $days: Int) {
    syncCallRecordings(phoneNumberId: $phoneNumberId, days: $days)
  }
`;

const TRANSCRIBE_ALL_RECORDINGS = gql`
  mutation TranscribeAllRecordings {
    transcribeAllRecordings
  }
`;

export const CallRecordings: React.FC = () => {
  usePageTitle("Call Recordings");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  // Brand colors and styling
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);
  const successGreen = getColor("successGreen", colorMode);
  const errorRed = getColor("status.error", colorMode);
  const infoBlue = getColor("status.info", colorMode);
  const warningColor = getColor("status.warning", colorMode);
  const purpleAccent = getColor("purpleAccent", colorMode);
  
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [filter, setFilter] = useState({
    from: "",
    to: "",
    direction: "",
    transcriptionStatus: "",
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  // Queries
  const { data, loading, refetch } = useQuery(GET_CALL_RECORDINGS, {
    variables: {
      filter: Object.keys(filter).reduce((acc: any, key) => {
        if (filter[key as keyof typeof filter]) {
          acc[key] = filter[key as keyof typeof filter];
        }
        return acc;
      }, {}),
      page,
      limit,
    },
  });

  // Mutations
  const [transcribeRecording] = useMutation(TRANSCRIBE_RECORDING, {
    onCompleted: () => {
      toast({
        title: "Transcription started",
        description: "The recording is being transcribed. This may take a few minutes.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to transcribe recording",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [downloadRecordingUrl] = useMutation(DOWNLOAD_RECORDING_URL, {
    onCompleted: (data) => {
      window.open(data.downloadRecordingUrl, "_blank");
    },
    onError: (error) => {
      toast({
        title: "Failed to download recording",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteRecording] = useMutation(DELETE_RECORDING, {
    onCompleted: () => {
      toast({
        title: "Recording deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete recording",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [syncCallRecordings, { loading: syncLoading }] = useMutation(SYNC_CALL_RECORDINGS, {
    onCompleted: (data) => {
      toast({
        title: "Sync Complete",
        description: `Synced ${data.syncCallRecordings} new recordings from Twilio`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to sync recordings",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [transcribeAllRecordings, { loading: transcribeLoading }] = useMutation(TRANSCRIBE_ALL_RECORDINGS, {
    onCompleted: (data) => {
      toast({
        title: "Transcription Complete",
        description: `Successfully transcribed ${data.transcribeAllRecordings} recordings`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to transcribe recordings",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPhoneNumber = (number: string) => {
    if (number.startsWith("+61")) {
      return number.replace(/(\+61)(\d)(\d{4})(\d{4})/, "$1 $2 $3 $4");
    }
    return number;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "IN_PROGRESS":
        return "blue";
      case "PENDING":
        return "yellow";
      case "FAILED":
        return "red";
      case "NOT_REQUESTED":
        return "gray";
      default:
        return "gray";
    }
  };

  const handleTranscribe = (recordingSid: string) => {
    transcribeRecording({
      variables: { recordingSid },
    });
  };

  const handleDownload = (recordingSid: string) => {
    downloadRecordingUrl({
      variables: { recordingSid },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      deleteRecording({
        variables: { id },
      });
    }
  };

  const handleViewTranscription = (recording: any) => {
    setSelectedRecording(recording);
    onOpen();
  };

  const handlePlay = (recording: any) => {
    // If we have a pinataUrl, use that, otherwise try to get download URL
    if (recording.pinataUrl) {
      window.open(recording.pinataUrl, "_blank");
    } else if (recording.recordingUrl) {
      // For Twilio recordings, we need to get the authenticated URL
      downloadRecordingUrl({
        variables: { recordingSid: recording.recordingSid },
      });
    }
  };

  const handleSync = () => {
    syncCallRecordings({
      variables: { days: 30 },
    });
  };

  const handleTranscribeAll = () => {
    transcribeAllRecordings();
  };

  if (loading) {
    return (
      <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />
        <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
          <VStack spacing={8}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading call recordings...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const recordings = data?.callRecordings?.items || [];
  const totalCount = data?.callRecordings?.totalCount || 0;
  const hasNextPage = data?.callRecordings?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = data?.callRecordings?.pageInfo?.hasPreviousPage || false;

  return (
    <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />

      <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          {/* Header */}
          <VStack align="start" spacing={2}>
            <Heading size={{ base: "md", md: "lg" }} color={textPrimary} fontFamily={brandConfig.fonts.heading}>🎙️ Call Recordings</Heading>
            <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>View and manage your call recordings and transcriptions</Text>
          </VStack>

          {/* Information Alert */}
          <Alert 
            status="info"
            bg="rgba(59, 130, 246, 0.1)"
            borderColor="rgba(59, 130, 246, 0.3)"
            border="1px solid"
          >
            <AlertIcon color={infoBlue} />
            <Box>
              <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={textPrimary}>Automatic Call Recording Enabled</Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>
                All incoming and outgoing calls are automatically recorded. New recordings will appear here after calls complete.
                Use "Sync from Twilio" to import older recordings from your Twilio account.
              </Text>
            </Box>
          </Alert>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 2, md: 4 }}>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Total Recordings</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>{totalCount}</Text>
                </VStack>
              </CardBody>
            </Card>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Transcribed</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {recordings.filter((r: any) => r.transcriptionStatus === "COMPLETED").length}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Total Duration</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {formatDuration(recordings.reduce((sum: number, r: any) => sum + r.duration, 0))}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>This Month</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {recordings.filter((r: any) => {
                      const recordedDate = new Date(r.recordedAt);
                      const now = new Date();
                      return recordedDate.getMonth() === now.getMonth() && 
                             recordedDate.getFullYear() === now.getFullYear();
                    }).length}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 2, md: 4 }}>
                <Input
                  placeholder="Filter by from number"
                  value={filter.from}
                  onChange={(e) => setFilter({ ...filter, from: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{ 
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                />
                <Input
                  placeholder="Filter by to number"
                  value={filter.to}
                  onChange={(e) => setFilter({ ...filter, to: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{ 
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                />
                <Select
                  placeholder="Direction"
                  value={filter.direction}
                  onChange={(e) => setFilter({ ...filter, direction: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{ 
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                >
                  <option value="">All</option>
                  <option value="INBOUND">Inbound</option>
                  <option value="OUTBOUND">Outbound</option>
                </Select>
                <Select
                  placeholder="Transcription Status"
                  value={filter.transcriptionStatus}
                  onChange={(e) => setFilter({ ...filter, transcriptionStatus: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{ 
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                >
                  <option value="">All</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="NOT_REQUESTED">Not Requested</option>
                </Select>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Recordings Table */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardHeader>
              <VStack align="stretch" spacing={{ base: 3, md: 0 }}>
                <Heading size={{ base: "sm", md: "md" }} color={textPrimary} fontFamily={brandConfig.fonts.heading}>Recordings</Heading>
                <HStack 
                  spacing={{ base: 2, md: 2 }}
                  direction={{ base: "column", md: "row" }}
                  justify={{ base: "stretch", md: "flex-end" }}
                  align="stretch"
                  width="100%"
                  mt={{ base: 3, md: 0 }}
                >
                  <Button 
                    leftIcon={<EditIcon />} 
                    onClick={handleTranscribeAll}
                    isLoading={transcribeLoading}
                    loadingText="Transcribing..."
                    bg={successGreen}
                    color="white"
                    _hover={{ bg: successGreen, opacity: 0.9, transform: "translateY(-2px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    width={{ base: "100%", md: "auto" }}
                    minW={{ md: "160px" }}
                    size={{ base: "sm", md: "md" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    isDisabled={recordings.filter((r: any) => r.transcriptionStatus === "NOT_REQUESTED" || r.transcriptionStatus === "FAILED").length === 0}
                  >
                    Transcribe All ({recordings.filter((r: any) => r.transcriptionStatus === "NOT_REQUESTED" || r.transcriptionStatus === "FAILED").length})
                  </Button>
                  <Button 
                    leftIcon={<DownloadIcon />} 
                    onClick={handleSync}
                    isLoading={syncLoading}
                    loadingText="Syncing..."
                    bg={purpleAccent}
                    color="white"
                    _hover={{ bg: purpleAccent, opacity: 0.9, transform: "translateY(-2px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    width={{ base: "100%", md: "auto" }}
                    minW={{ md: "140px" }}
                    size={{ base: "sm", md: "md" }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Sync from Twilio
                  </Button>
                  <Button 
                    leftIcon={<RepeatIcon />} 
                    onClick={() => refetch()}
                    bg={primaryColor}
                    color="white"
                    _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    width={{ base: "100%", md: "auto" }}
                    minW={{ md: "100px" }}
                    size={{ base: "sm", md: "md" }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Refresh
                  </Button>
                </HStack>
              </VStack>
            </CardHeader>
            <CardBody>
              {recordings.length > 0 ? (
                <>
                  <Box overflowX="auto" width="100%">
                    <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth={{ base: "600px", md: "100%" }}>
                    <Thead>
                      <Tr>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>Date</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Phone Number</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>From</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>To</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", sm: "table-cell" }}>Duration</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Direction</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Transcription</Th>
                        <Th color={textMuted} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recordings.map((recording: any) => (
                        <Tr key={recording.id}>
                          <Td color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 4 }}>{new Date(recording.recordedAt).toLocaleDateString()}</Td>
                          <Td color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }} px={{ base: 2, md: 4 }}>{recording.phoneNumber?.friendlyName || recording.phoneNumber?.phoneNumber || "-"}</Td>
                          <Td fontFamily="monospace" color={textPrimary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} noOfLines={1} px={{ base: 2, md: 4 }}>{formatPhoneNumber(recording.from)}</Td>
                          <Td fontFamily="monospace" color={textPrimary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} noOfLines={1} px={{ base: 2, md: 4 }}>{formatPhoneNumber(recording.to)}</Td>
                          <Td color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", sm: "table-cell" }} px={{ base: 2, md: 4 }}>{formatDuration(recording.duration)}</Td>
                          <Td borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }} px={{ base: 2, md: 4 }}>
                            <Badge 
                              bg={recording.direction === "INBOUND" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)"}
                              color={recording.direction === "INBOUND" ? infoBlue : successGreen}
                              border="1px solid"
                              borderColor={recording.direction === "INBOUND" ? "rgba(59, 130, 246, 0.3)" : "rgba(34, 197, 94, 0.3)"}
                            >
                              {recording.direction}
                            </Badge>
                          </Td>
                          <Td borderColor={cardBorder} display={{ base: "none", lg: "table-cell" }} px={{ base: 2, md: 4 }}>
                            <Badge 
                              bg={`rgba(${getStatusColor(recording.transcriptionStatus) === "green" ? "34, 197, 94" : getStatusColor(recording.transcriptionStatus) === "blue" ? "59, 130, 246" : getStatusColor(recording.transcriptionStatus) === "yellow" ? "251, 191, 36" : getStatusColor(recording.transcriptionStatus) === "red" ? "239, 68, 68" : "107, 114, 128"}, 0.2)`}
                              color={getStatusColor(recording.transcriptionStatus) === "green" ? successGreen : getStatusColor(recording.transcriptionStatus) === "blue" ? infoBlue : getStatusColor(recording.transcriptionStatus) === "yellow" ? warningColor : getStatusColor(recording.transcriptionStatus) === "red" ? errorRed : textMuted}
                              border="1px solid"
                              borderColor={`rgba(${getStatusColor(recording.transcriptionStatus) === "green" ? "34, 197, 94" : getStatusColor(recording.transcriptionStatus) === "blue" ? "59, 130, 246" : getStatusColor(recording.transcriptionStatus) === "yellow" ? "251, 191, 36" : getStatusColor(recording.transcriptionStatus) === "red" ? "239, 68, 68" : "107, 114, 128"}, 0.3)`}
                            >
                              {recording.transcriptionStatus.replace("_", " ")}
                            </Badge>
                          </Td>
                          <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                            <HStack spacing={{ base: 1, md: 2 }} flexWrap={{ base: "wrap", xl: "nowrap" }} justify={{ base: "flex-start", md: "flex-start" }}>
                              <IconButton
                                aria-label="Play"
                                icon={<TriangleUpIcon transform="rotate(90deg)" />}
                                size={{ base: "xs", md: "sm" }}
                                onClick={() => handlePlay(recording)}
                                bg="rgba(255, 255, 255, 0.1)"
                                color={textPrimary}
                                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                              />
                              <IconButton
                                aria-label="Download"
                                icon={<DownloadIcon />}
                                size={{ base: "xs", md: "sm" }}
                                onClick={() => handleDownload(recording.recordingSid)}
                                bg="rgba(255, 255, 255, 0.1)"
                                color={textPrimary}
                                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                              />
                              {recording.transcriptionStatus === "NOT_REQUESTED" && (
                                <Button
                                  size={{ base: "xs", md: "sm" }}
                                  onClick={() => handleTranscribe(recording.recordingSid)}
                                  bg={primaryColor}
                                  color="white"
                                  _hover={{ bg: primaryHover }}
                                  fontWeight="semibold"
                                  fontSize={{ base: "xs", md: "sm" }}
                                >
                                  Transcribe
                                </Button>
                              )}
                              {recording.transcriptionStatus === "COMPLETED" && (
                                <IconButton
                                  aria-label="View Transcription"
                                  icon={<ViewIcon />}
                                  size={{ base: "xs", md: "sm" }}
                                  onClick={() => handleViewTranscription(recording)}
                                  bg="rgba(255, 255, 255, 0.1)"
                                  color={textPrimary}
                                  _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                                />
                              )}
                              <IconButton
                                aria-label="Delete"
                                icon={<DeleteIcon />}
                                size={{ base: "xs", md: "sm" }}
                                onClick={() => handleDelete(recording.id)}
                                bg={errorRed}
                                color="white"
                                _hover={{ bg: errorRed, opacity: 0.8 }}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    </Table>
                  </Box>

                  {/* Pagination */}
                  <HStack justify="center" mt={4} spacing={{ base: 2, md: 4 }}>
                    <Button
                      onClick={() => setPage(page - 1)}
                      isDisabled={!hasPreviousPage}
                      bg="rgba(255, 255, 255, 0.1)"
                      color={textPrimary}
                      _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                      _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                      size={{ base: "sm", md: "md" }}
                    >
                      Previous
                    </Button>
                    <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }}>Page {page}</Text>
                    <Button
                      onClick={() => setPage(page + 1)}
                      isDisabled={!hasNextPage}
                      bg="rgba(255, 255, 255, 0.1)"
                      color={textPrimary}
                      _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                      _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                      size={{ base: "sm", md: "md" }}
                    >
                      Next
                    </Button>
                  </HStack>
                </>
              ) : (
                <Alert 
                  status="info"
                  bg="rgba(59, 130, 246, 0.1)"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  border="1px solid"
                >
                  <AlertIcon color={infoBlue} />
                  <VStack align="start" spacing={2}>
                    <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }}>No recordings yet</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>Call recordings will appear here once calls are made to your phone numbers.</Text>
                  </VStack>
                </Alert>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Transcription Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
          <ModalHeader color={textPrimary} fontFamily={brandConfig.fonts.heading}>Call Transcription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecording && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color={textPrimary}>From:</Text>
                    <Text color={textSecondary}>{formatPhoneNumber(selectedRecording.from)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textPrimary}>To:</Text>
                    <Text color={textSecondary}>{formatPhoneNumber(selectedRecording.to)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textPrimary}>Date:</Text>
                    <Text color={textSecondary}>{new Date(selectedRecording.recordedAt).toLocaleString()}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textPrimary}>Duration:</Text>
                    <Text color={textSecondary}>{formatDuration(selectedRecording.duration)}</Text>
                  </Box>
                  {selectedRecording.transcriptionConfidence && (
                    <Box>
                      <Text fontWeight="bold" color={textPrimary}>Confidence:</Text>
                      <Text color={textSecondary}>{(selectedRecording.transcriptionConfidence * 100).toFixed(1)}%</Text>
                    </Box>
                  )}
                </SimpleGrid>
                
                <Box>
                  <Text fontWeight="bold" mb={2} color={textPrimary}>Transcription:</Text>
                  <Textarea
                    value={selectedRecording.transcriptionText || "No transcription available"}
                    readOnly
                    minH="300px"
                    resize="vertical"
                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              onClick={onClose}
              bg="rgba(255, 255, 255, 0.1)"
              color={textPrimary}
              _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};