import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  Icon,
  IconButton,
  useToast,
  Spinner,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Textarea,
  Flex,
} from "@chakra-ui/react";
import {
  FiPhone,
  FiClock,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiExternalLink,
  FiPlay,
  FiDownload,
} from "react-icons/fi";
import { gql, useQuery } from "@apollo/client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';

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
      endedReason
      summary
      rawWebhookData
      clientId
    }
  }
`;

export const CallDetails: React.FC = () => {
  usePageTitle("Call Details");
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { data, loading, error } = useQuery(GET_VAPI_CALL_LOG, {
    variables: { callId },
    skip: !callId,
  });

  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");

  // Date formatting helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCost = (cost: number) => {
    if (!cost) return "$0.00";
    return `$${cost.toFixed(4)}`;
  };

  const handleOpenInNewTab = () => {
    window.open(`/vapi/call/${callId}`, '_blank');
  };

  const handlePlayRecording = () => {
    if (data?.getVapiCallLog?.recordingUrl) {
      window.open(data.getVapiCallLog.recordingUrl, '_blank');
    } else {
      toast({
        title: "No Recording Available",
        description: "This call does not have a recording.",
        status: "warning",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <HStack justify="center">
                <Spinner />
                <Text>Loading call details...</Text>
              </HStack>
            </CardBody>
          </Card>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.getVapiCallLog) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error loading call details</Text>
              <Text fontSize="sm">
                {error?.message || "Call not found"}
              </Text>
            </Box>
          </Alert>
          <Button
            mt={4}
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate("/vapi/call-logs")}
          >
            Back to Call Logs
          </Button>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const call = data.getVapiCallLog;

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="container.xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header with navigation */}
          <HStack justify="space-between">
            <HStack>
              <IconButton
                aria-label="Back"
                icon={<FiArrowLeft />}
                onClick={() => navigate("/vapi/call-logs")}
                variant="ghost"
              />
              <Heading size="lg" color={textPrimary}>
                Call Details
              </Heading>
            </HStack>
            <Button
              size="sm"
              rightIcon={<FiExternalLink />}
              onClick={handleOpenInNewTab}
              variant="outline"
            >
              Open in New Tab
            </Button>
          </HStack>

          {/* Call Overview Card */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiPhone} color="blue.400" />
                  <Heading size="md" color={textPrimary}>
                    {call.assistantName || "Voice Assistant"}
                  </Heading>
                </HStack>
                <Badge
                  colorScheme={
                    call.status === "completed" ? "green" :
                    call.status === "failed" ? "red" :
                    "yellow"
                  }
                >
                  {call.status}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Stat>
                  <StatLabel color={textMuted}>
                    <HStack>
                      <Icon as={FiUser} />
                      <Text>Customer</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textPrimary} fontSize="md">
                    {call.customerNumber || "Unknown"}
                  </StatNumber>
                  {call.clientId && (
                    <StatHelpText color={textSecondary}>
                      Client ID: {call.clientId}
                    </StatHelpText>
                  )}
                </Stat>

                <Stat>
                  <StatLabel color={textMuted}>
                    <HStack>
                      <Icon as={FiClock} />
                      <Text>Duration</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textPrimary} fontSize="md">
                    {formatDuration(call.duration)}
                  </StatNumber>
                  <StatHelpText color={textSecondary}>
                    {call.direction}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color={textMuted}>
                    <HStack>
                      <Icon as={FiCalendar} />
                      <Text>Date & Time</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textPrimary} fontSize="md">
                    {formatDate(call.startedAt)}
                  </StatNumber>
                  <StatHelpText color={textSecondary}>
                    {formatTime(call.startedAt)}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color={textMuted}>
                    <HStack>
                      <Icon as={FiDollarSign} />
                      <Text>Cost</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color={textPrimary} fontSize="md">
                    {formatCost(call.cost)}
                  </StatNumber>
                  <StatHelpText color={textSecondary}>
                    USD
                  </StatHelpText>
                </Stat>
              </SimpleGrid>

              {call.endedReason && (
                <Box mt={4} p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md">
                  <Text fontSize="sm" color={textMuted}>
                    <strong>End Reason:</strong> {call.endedReason}
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Recording Card */}
          {call.recordingUrl && (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size="md" color={textPrimary}>
                  Call Recording
                </Heading>
              </CardHeader>
              <CardBody>
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiPlay />}
                    bg={getColor("primary")}
                    color="white"
                    _hover={{
                      bg: getColor("secondary"),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(54, 158, 255, 0.3)"
                    }}
                    onClick={handlePlayRecording}
                  >
                    Play Recording
                  </Button>
                  <Button
                    as="a"
                    href={call.recordingUrl}
                    download
                    leftIcon={<FiDownload />}
                    variant="outline"
                    color={textPrimary}
                    borderColor={cardBorder}
                    _hover={{
                      borderColor: getColor("primary"),
                      color: getColor("primary"),
                      bg: "rgba(54, 158, 255, 0.1)"
                    }}
                  >
                    Download
                  </Button>
                  <Text fontSize="sm" color={textMuted}>
                    Duration: {formatDuration(call.duration)}
                  </Text>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Summary Card */}
          {call.summary && (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size="md" color={textPrimary}>
                  Call Summary
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color={textSecondary} whiteSpace="pre-wrap">
                  {call.summary}
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Transcript Card */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>
                Transcript
              </Heading>
            </CardHeader>
            <CardBody>
              {call.transcript ? (
                <Textarea
                  value={call.transcript}
                  readOnly
                  minH="300px"
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textSecondary}
                  fontFamily="monospace"
                  fontSize="sm"
                  resize="vertical"
                />
              ) : (
                <Text color={textMuted} fontStyle="italic">
                  No transcript available for this call
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Call Metadata Card */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>
                Technical Details
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text color={textMuted}>Call ID:</Text>
                  <Text color={textSecondary} fontFamily="monospace" fontSize="sm">
                    {call.callId}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text color={textMuted}>Assistant ID:</Text>
                  <Text color={textSecondary} fontFamily="monospace" fontSize="sm">
                    {call.assistantId || "N/A"}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text color={textMuted}>Phone Number:</Text>
                  <Text color={textSecondary}>
                    {call.phoneNumber || "N/A"}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text color={textMuted}>Started At:</Text>
                  <Text color={textSecondary}>
                    {formatDateTime(call.startedAt)}
                  </Text>
                </HStack>
                {call.endedAt && (
                  <>
                    <Divider />
                    <HStack justify="space-between">
                      <Text color={textMuted}>Ended At:</Text>
                      <Text color={textSecondary}>
                        {formatDateTime(call.endedAt)}
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};