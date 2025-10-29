import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  Tooltip,
  Divider,
  Grid,
  GridItem,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { FiPhone, FiDownload, FiPlay, FiFileText, FiInfo, FiExternalLink } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

interface VapiCallLog {
  id: string;
  callId: string;
  phoneNumber?: string;
  customerNumber?: string;
  direction: string;
  status: string;
  duration: number;
  startedAt: string;
  endedAt?: string;
  transcript?: string;
  recordingUrl?: string;
  assistantId?: string;
  assistantName?: string;
  cost?: number;
  leadName?: string;
  leadEmail?: string;
  leadBusinessName?: string;
  requirements?: string;
  budget?: string;
  timeline?: string;
  interestedTier?: string;
  callbackTime?: string;
  notes?: string;
  clientId?: string;
  endedReason?: string;
  summary?: string;
  rawWebhookData?: string;
}

const GET_VAPI_CALL_LOGS = gql`
  query GetVapiCallLogs {
    getVapiCallLogs {
      id
      callId
      phoneNumber
      customerNumber
      direction
      status
      duration
      startedAt
      endedAt
      transcript
      recordingUrl
      assistantId
      assistantName
      cost
      leadName
      leadEmail
      leadBusinessName
      requirements
      budget
      timeline
      interestedTier
      callbackTime
      notes
      clientId
      endedReason
      summary
    }
  }
`;

const GET_VAPI_CALL_LOG = gql`
  query GetVapiCallLog($callId: String!) {
    getVapiCallLog(callId: $callId) {
      id
      callId
      phoneNumber
      customerNumber
      direction
      status
      duration
      startedAt
      endedAt
      transcript
      recordingUrl
      assistantId
      assistantName
      cost
      leadName
      leadEmail
      leadBusinessName
      requirements
      budget
      timeline
      interestedTier
      callbackTime
      notes
      clientId
      endedReason
      summary
      rawWebhookData
    }
  }
`;

export const CallLogs: React.FC = () => {
  usePageTitle("Call Logs");
  const navigate = useNavigate();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const accentBlue = getColor("accentBlue");
  
  const [selectedTranscript, setSelectedTranscript] = useState<VapiCallLog | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<VapiCallLog | null>(null);
  const [selectedCallDetails, setSelectedCallDetails] = useState<VapiCallLog | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const { data, loading, error, refetch } = useQuery(GET_VAPI_CALL_LOGS, {
    pollInterval: 10000, // Poll every 10 seconds for new calls
  });

  const [getCallDetails, { loading: loadingDetails }] = useLazyQuery(GET_VAPI_CALL_LOG, {
    onCompleted: (data) => {
      if (data?.getVapiCallLog) {
        setSelectedCallDetails(data.getVapiCallLog);
        setIsDetailsModalOpen(true);
      }
    },
    onError: (error) => {
      console.error('Error fetching call details:', error);
    }
  });

  const handleRowClick = (callLog: VapiCallLog) => {
    // Open call details in a new tab
    window.open(`/vapi/call/${callLog.callId}`, '_blank');
  };

  // Use real data from API
  const callLogs: VapiCallLog[] = data?.getVapiCallLogs || [];

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "ended":
        return { bg: "rgba(34, 197, 94, 0.2)", color: "#22C55E", border: "rgba(34, 197, 94, 0.3)" };
      case "failed":
      case "error":
        return { bg: "rgba(255, 59, 48, 0.2)", color: "#FF3B30", border: "rgba(255, 59, 48, 0.3)" };
      case "queued":
      case "ringing":
        return { bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" };
      default:
        return { bg: "rgba(251, 191, 36, 0.2)", color: "#FBBF24", border: "rgba(251, 191, 36, 0.3)" };
    }
  };

  const formatEndedReason = (reason?: string) => {
    if (!reason) return "N/A";
    // Convert snake_case or kebab-case to readable format
    return reason
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .substring(0, 30);
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="container.2xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading 
              size="lg" 
              mb={2}
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
            >
              📞 Call Logs
            </Heading>
            <Text color={textSecondary}>
              View and manage your Vapi voice call history
            </Text>
          </Box>

          {/* Filters */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
              <HStack justify="space-between">
                <Heading size="md" color={textPrimary}>Recent Calls</Heading>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor={cardBorder}
                    color={textSecondary}
                    _hover={{
                      borderColor: accentBlue,
                      color: accentBlue
                    }}
                    onClick={() => refetch()}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiDownload />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textSecondary}
                    _hover={{
                      borderColor: accentBlue,
                      color: accentBlue
                    }}
                    onClick={() => {
                      // Export to CSV
                      const csv = [
                        ['Date', 'Time', 'Direction', 'Phone', 'Assistant', 'Duration', 'Cost', 'Status', 'Ended Reason'],
                        ...callLogs.map(log => [
                          new Date(log.startedAt).toLocaleDateString(),
                          new Date(log.startedAt).toLocaleTimeString(),
                          log.direction,
                          log.customerNumber || log.phoneNumber || '',
                          log.assistantName || 'Default',
                          formatDuration(log.duration || 0),
                          `$${(log.cost || 0).toFixed(3)}`,
                          log.status,
                          log.endedReason || 'N/A'
                        ])
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `vapi-call-logs-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                    }}
                  >
                    Export CSV
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Center py={8}>
                  <Spinner size="lg" color={accentBlue} />
                </Center>
              ) : error ? (
                <Alert 
                  status="error"
                  bg="rgba(255, 59, 48, 0.1)"
                  borderColor="rgba(255, 59, 48, 0.3)"
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <AlertIcon color="#FF3B30" />
                  <Text color={textPrimary}>Failed to load call logs. Please try again.</Text>
                </Alert>
              ) : callLogs.length === 0 ? (
                <Alert 
                  status="info"
                  bg="rgba(59, 130, 246, 0.1)"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <AlertIcon color="#3B82F6" />
                  <Text color={textPrimary}>No call logs available yet. Calls made through Vapi will appear here.</Text>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm" sx={{ 'th': { color: textSecondary, borderColor: cardBorder }, 'td': { color: textPrimary, borderColor: cardBorder } }}>
                    <Thead>
                      <Tr>
                        <Th>Date & Time</Th>
                        <Th>Type</Th>
                        <Th>Phone</Th>
                        <Th>Assistant</Th>
                        <Th>Duration</Th>
                        <Th>Cost</Th>
                        <Th>Status</Th>
                        <Th>Ended</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {callLogs.map((log) => (
                        <Tr 
                          key={log.id}
                          cursor="pointer"
                          _hover={{
                            bg: "rgba(54, 158, 255, 0.05)",
                            transition: "all 0.2s"
                          }}
                          onClick={() => handleRowClick(log)}
                        >
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm">
                                {new Date(log.startedAt).toLocaleDateString()}
                              </Text>
                              <Text fontSize="xs" color={textMuted}>
                                {new Date(log.startedAt).toLocaleTimeString()}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              bg={log.direction === "inbound" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)"}
                              color={log.direction === "inbound" ? "#3B82F6" : "#22C55E"}
                              borderWidth="1px"
                              borderColor={log.direction === "inbound" ? "rgba(59, 130, 246, 0.3)" : "rgba(34, 197, 94, 0.3)"}
                            >
                              {log.direction}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontFamily="monospace">
                              {log.customerNumber || log.phoneNumber || "Unknown"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" maxW="150px" isTruncated>
                              {log.assistantName || "Default Assistant"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatDuration(log.duration || 0)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">
                              ${(log.cost || 0).toFixed(3)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              bg={getStatusColor(log.status).bg}
                              color={getStatusColor(log.status).color}
                              borderWidth="1px"
                              borderColor={getStatusColor(log.status).border}
                            >
                              {log.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Tooltip label={log.endedReason || "N/A"}>
                              <Text fontSize="xs" color={textMuted} maxW="100px" isTruncated>
                                {formatEndedReason(log.endedReason)}
                              </Text>
                            </Tooltip>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Tooltip label="Open in New Tab">
                                <IconButton
                                  aria-label="Open in new tab"
                                  icon={<FiExternalLink />}
                                  size="xs"
                                  variant="ghost"
                                  color={textSecondary}
                                  _hover={{
                                    color: accentBlue,
                                    bg: "rgba(54, 158, 255, 0.1)"
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/vapi/call/${log.callId}`, '_blank');
                                  }}
                                />
                              </Tooltip>
                              {log.recordingUrl && (
                                <Tooltip label="Play Recording">
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    color={textSecondary}
                                    _hover={{
                                      color: accentBlue,
                                      bg: "rgba(54, 158, 255, 0.1)"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(log.recordingUrl, '_blank');
                                    }}
                                  >
                                    <FiPlay />
                                  </Button>
                                </Tooltip>
                              )}
                              {log.transcript && (
                                <Tooltip label="View Transcript">
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    color={textSecondary}
                                    _hover={{
                                      color: accentBlue,
                                      bg: "rgba(54, 158, 255, 0.1)"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTranscript(log);
                                    }}
                                  >
                                    <FiFileText />
                                  </Button>
                                </Tooltip>
                              )}
                              {log.summary && (
                                <Tooltip label="View Summary">
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    color={textSecondary}
                                    _hover={{
                                      color: accentBlue,
                                      bg: "rgba(54, 158, 255, 0.1)"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSummary(log);
                                    }}
                                  >
                                    <FiInfo />
                                  </Button>
                                </Tooltip>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Call Statistics */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>Call Statistics</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Total Calls
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {callLogs.length}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Total Duration
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {formatDuration(callLogs.reduce((acc, log) => acc + (log.duration || 0), 0))}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Inbound
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {callLogs.filter(log => log.direction === "inbound").length}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Outbound
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    {callLogs.filter(log => log.direction === "outbound").length}
                  </Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color={textMuted}>
                    Total Cost
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    ${callLogs.reduce((acc, log) => acc + (log.cost || 0), 0).toFixed(2)}
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Transcript Modal */}
      <Modal 
        isOpen={!!selectedTranscript} 
        onClose={() => setSelectedTranscript(null)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textPrimary}>Call Transcript</ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <VStack align="start" spacing={2} mb={4}>
              <Text fontSize="sm" color={textMuted}>
                Call ID: {selectedTranscript?.callId}
              </Text>
              <Text fontSize="sm" color={textMuted}>
                Date: {selectedTranscript && new Date(selectedTranscript.startedAt).toLocaleString()}
              </Text>
            </VStack>
            <Textarea
              value={selectedTranscript?.transcript || "No transcript available"}
              readOnly
              minH="300px"
              bg="rgba(0, 0, 0, 0.2)"
              borderColor={cardBorder}
              color={textPrimary}
              fontFamily="monospace"
              fontSize="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => {
                if (selectedTranscript?.transcript) {
                  const blob = new Blob([selectedTranscript.transcript], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `transcript-${selectedTranscript.callId}.txt`;
                  a.click();
                }
              }}
              mr={3}
            >
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTranscript(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Summary Modal */}
      <Modal 
        isOpen={!!selectedSummary} 
        onClose={() => setSelectedSummary(null)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textPrimary}>Call Summary</ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={1}>
                  Call Details
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  ID: {selectedSummary?.callId}
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  Date: {selectedSummary && new Date(selectedSummary.startedAt).toLocaleString()}
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  Duration: {formatDuration(selectedSummary?.duration || 0)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={1}>
                  Summary
                </Text>
                <Text color={textPrimary} whiteSpace="pre-wrap">
                  {selectedSummary?.summary || "No summary available"}
                </Text>
              </Box>
              {selectedSummary?.leadName && (
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={1}>
                    Lead Information
                  </Text>
                  <Text fontSize="sm" color={textPrimary}>
                    Name: {selectedSummary.leadName}
                  </Text>
                  {selectedSummary.leadEmail && (
                    <Text fontSize="sm" color={textPrimary}>
                      Email: {selectedSummary.leadEmail}
                    </Text>
                  )}
                  {selectedSummary.leadBusinessName && (
                    <Text fontSize="sm" color={textPrimary}>
                      Business: {selectedSummary.leadBusinessName}
                    </Text>
                  )}
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSummary(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detailed Call View Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCallDetails(null);
        }}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px" maxW="90vw">
          <ModalHeader color={textPrimary}>
            <HStack justify="space-between">
              <Text>Call Details</Text>
              {loadingDetails && <Spinner size="sm" color={accentBlue} />}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody maxH="70vh" overflowY="auto">
            {selectedCallDetails && (
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                {/* Basic Information */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                      Basic Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Call ID</Text>
                        <Text fontSize="sm" color={textPrimary} fontFamily="monospace">
                          {selectedCallDetails.callId}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Status</Text>
                        <Badge
                          bg={getStatusColor(selectedCallDetails.status).bg}
                          color={getStatusColor(selectedCallDetails.status).color}
                          borderWidth="1px"
                          borderColor={getStatusColor(selectedCallDetails.status).border}
                        >
                          {selectedCallDetails.status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Direction</Text>
                        <Badge
                          bg={selectedCallDetails.direction === "inbound" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)"}
                          color={selectedCallDetails.direction === "inbound" ? "#3B82F6" : "#22C55E"}
                          borderWidth="1px"
                          borderColor={selectedCallDetails.direction === "inbound" ? "rgba(59, 130, 246, 0.3)" : "rgba(34, 197, 94, 0.3)"}
                        >
                          {selectedCallDetails.direction}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Duration</Text>
                        <Text fontSize="sm" color={textPrimary}>
                          {formatDuration(selectedCallDetails.duration || 0)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Cost</Text>
                        <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                          ${(selectedCallDetails.cost || 0).toFixed(4)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Ended Reason</Text>
                        <Text fontSize="sm" color={textPrimary}>
                          {selectedCallDetails.endedReason || "N/A"}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </GridItem>

                <Divider gridColumn="span 2" borderColor={cardBorder} />

                {/* Time Information */}
                <GridItem>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                      Time Information
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Started At</Text>
                        <Text fontSize="sm" color={textPrimary}>
                          {new Date(selectedCallDetails.startedAt).toLocaleString()}
                        </Text>
                      </Box>
                      {selectedCallDetails.endedAt && (
                        <Box>
                          <Text fontSize="xs" color={textMuted}>Ended At</Text>
                          <Text fontSize="sm" color={textPrimary}>
                            {new Date(selectedCallDetails.endedAt).toLocaleString()}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </GridItem>

                {/* Contact Information */}
                <GridItem>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                      Contact Information
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Phone Number</Text>
                        <Text fontSize="sm" color={textPrimary} fontFamily="monospace">
                          {selectedCallDetails.phoneNumber || "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Customer Number</Text>
                        <Text fontSize="sm" color={textPrimary} fontFamily="monospace">
                          {selectedCallDetails.customerNumber || "N/A"}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </GridItem>

                <Divider gridColumn="span 2" borderColor={cardBorder} />

                {/* Assistant Information */}
                <GridItem>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                      Assistant Information
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      <Box>
                        <Text fontSize="xs" color={textMuted}>Assistant Name</Text>
                        <Text fontSize="sm" color={textPrimary}>
                          {selectedCallDetails.assistantName || "Default Assistant"}
                        </Text>
                      </Box>
                      {selectedCallDetails.assistantId && (
                        <Box>
                          <Text fontSize="xs" color={textMuted}>Assistant ID</Text>
                          <Text fontSize="sm" color={textPrimary} fontFamily="monospace">
                            {selectedCallDetails.assistantId}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </GridItem>

                {/* Lead Information */}
                {(selectedCallDetails.leadName || selectedCallDetails.leadEmail || selectedCallDetails.leadBusinessName) && (
                  <GridItem>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                        Lead Information
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        {selectedCallDetails.leadName && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Name</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.leadName}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.leadEmail && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Email</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.leadEmail}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.leadBusinessName && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Business</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.leadBusinessName}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  </GridItem>
                )}

                {/* Call Summary */}
                {selectedCallDetails.summary && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                        Call Summary
                      </Text>
                      <Box
                        p={3}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={cardBorder}
                      >
                        <Text fontSize="sm" color={textPrimary} whiteSpace="pre-wrap">
                          {selectedCallDetails.summary}
                        </Text>
                      </Box>
                    </Box>
                  </GridItem>
                )}

                {/* Business Details */}
                {(selectedCallDetails.requirements || selectedCallDetails.budget || selectedCallDetails.timeline) && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                        Business Details
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {selectedCallDetails.requirements && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Requirements</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.requirements}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.budget && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Budget</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.budget}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.timeline && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Timeline</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.timeline}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  </GridItem>
                )}

                {/* Additional Details */}
                {(selectedCallDetails.interestedTier || selectedCallDetails.callbackTime || selectedCallDetails.notes) && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                        Additional Details
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {selectedCallDetails.interestedTier && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Interested Tier</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.interestedTier}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.callbackTime && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Callback Time</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.callbackTime}
                            </Text>
                          </Box>
                        )}
                        {selectedCallDetails.notes && (
                          <Box>
                            <Text fontSize="xs" color={textMuted}>Notes</Text>
                            <Text fontSize="sm" color={textPrimary}>
                              {selectedCallDetails.notes}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  </GridItem>
                )}

                {/* Transcript */}
                {selectedCallDetails.transcript && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="sm" fontWeight="bold" color={textSecondary}>
                          Call Transcript
                        </Text>
                        <Button
                          size="xs"
                          leftIcon={<FiDownload />}
                          variant="ghost"
                          color={textSecondary}
                          _hover={{ color: accentBlue }}
                          onClick={() => {
                            const blob = new Blob([selectedCallDetails.transcript!], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `transcript-${selectedCallDetails.callId}.txt`;
                            a.click();
                          }}
                        >
                          Download
                        </Button>
                      </HStack>
                      <Textarea
                        value={selectedCallDetails.transcript}
                        readOnly
                        minH="200px"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        fontFamily="monospace"
                        fontSize="xs"
                      />
                    </Box>
                  </GridItem>
                )}

                {/* Recording */}
                {selectedCallDetails.recordingUrl && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={3}>
                        Call Recording
                      </Text>
                      <Link
                        href={selectedCallDetails.recordingUrl}
                        isExternal
                        color={accentBlue}
                        fontSize="sm"
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                      >
                        <FiPlay />
                        Play Recording
                        <FiExternalLink size={12} />
                      </Link>
                    </Box>
                  </GridItem>
                )}

                {/* Raw Data (for debugging) */}
                {selectedCallDetails.rawWebhookData && (
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider borderColor={cardBorder} mb={4} />
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="sm" fontWeight="bold" color={textSecondary}>
                          Raw API Response (Debug)
                        </Text>
                        <Button
                          size="xs"
                          leftIcon={<FiDownload />}
                          variant="ghost"
                          color={textSecondary}
                          _hover={{ color: accentBlue }}
                          onClick={() => {
                            try {
                              const data = JSON.parse(selectedCallDetails.rawWebhookData!);
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `call-data-${selectedCallDetails.callId}.json`;
                              a.click();
                            } catch (e) {
                              console.error('Failed to parse raw data:', e);
                            }
                          }}
                        >
                          Download JSON
                        </Button>
                      </HStack>
                      <Textarea
                        value={(() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedCallDetails.rawWebhookData), null, 2);
                          } catch {
                            return selectedCallDetails.rawWebhookData;
                          }
                        })()}
                        readOnly
                        minH="200px"
                        maxH="400px"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        fontFamily="monospace"
                        fontSize="xs"
                      />
                    </Box>
                  </GridItem>
                )}
              </Grid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedCallDetails(null);
              }}
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