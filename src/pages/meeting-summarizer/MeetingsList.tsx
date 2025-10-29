import React, { useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Card,
  CardBody,
  Heading,
  useToast,
  Badge,
  SimpleGrid,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  useColorMode,
} from '@chakra-ui/react';
import { FiPlus, FiMic, FiCalendar, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { gql, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import meetingSummarizerModule from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';

const GET_MY_MEETINGS = gql`
  query GetMyMeetings {
    myMeetings {
      id
      title
      description
      date
      location
      attendees
      audioUrl
      status
      transcription
      summary
      createdAt
    }
  }
`;

const MeetingsList: React.FC = () => {
  usePageTitle('Meetings');
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Theme-aware styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.lightCard" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const buttonBg = getColor("primary", colorMode);
  const buttonHoverBg = getColor("secondary", colorMode);

  const { data, loading, error, refetch } = useQuery(GET_MY_MEETINGS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000, // Poll every 5 seconds to get status updates
  });

  // Refetch on mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Transcribed';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <VStack spacing={4}>
            <Spinner size="xl" color={textPrimary} />
            <Text color={textPrimary}>Loading meetings...</Text>
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
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <Alert status="error">
            <AlertIcon />
            Error loading meetings: {error.message}
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const meetings = data?.myMeetings || [];

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />

      <Container maxW="container.xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                Meeting Summaries
              </Heading>
              <Text color={textMuted}>
                Record, transcribe, and summarize your meetings
              </Text>
            </VStack>
            <HStack spacing={2}>
              <Button
                variant="outline"
                leftIcon={<FiRefreshCw />}
                onClick={() => refetch()}
                color={textPrimary}
                borderColor={cardBorder}
                _hover={{ bg: cardGradientBg }}
                borderRadius="xl"
              >
                Refresh
              </Button>
              <Button
                bg={buttonBg}
                color="white"
                _hover={{ bg: buttonHoverBg }}
                leftIcon={<FiPlus />}
                onClick={() => navigate('/meeting-summarizer/new')}
                borderRadius="xl"
              >
                New Meeting
              </Button>
            </HStack>
          </HStack>

          {meetings.length === 0 ? (
            <Card
              bg={colorMode === 'light' ? 'white' : cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="xl"
            >
              <CardBody>
                <VStack spacing={4} py={8}>
                  <FiMic size={48} color={textMuted} />
                  <Text color={textPrimary} fontSize="lg">No meetings yet</Text>
                  <Text color={textMuted}>Create your first meeting summary</Text>
                  <Button
                    bg={buttonBg}
                    color="white"
                    _hover={{ bg: buttonHoverBg }}
                    leftIcon={<FiPlus />}
                    onClick={() => navigate('/meeting-summarizer/new')}
                    borderRadius="xl"
                  >
                    Create Meeting
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {meetings.map((meeting: any) => (
                <Card
                  key={meeting.id}
                  bg={colorMode === 'light' ? 'white' : cardGradientBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="xl"
                  cursor="pointer"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    borderColor: buttonBg
                  }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/meeting-summarizer/${meeting.id}`)}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Heading size="sm" color={textPrimary} noOfLines={1}>
                          {meeting.title}
                        </Heading>
                        <Badge colorScheme={getStatusColor(meeting.status)}>
                          {getStatusText(meeting.status)}
                        </Badge>
                      </HStack>
                      
                      {meeting.description && (
                        <Text color={textMuted} fontSize="sm" noOfLines={2}>
                          {meeting.description}
                        </Text>
                      )}

                      <VStack align="start" spacing={1}>
                        {meeting.date && (
                          <HStack spacing={2}>
                            <FiCalendar size={14} color={textMuted} />
                            <Text color={textMuted} fontSize="xs">
                              {formatDate(meeting.date)}
                            </Text>
                          </HStack>
                        )}
                        
                        {meeting.location && (
                          <HStack spacing={2}>
                            <FiMapPin size={14} color={textMuted} />
                            <Text color={textMuted} fontSize="xs" noOfLines={1}>
                              {meeting.location}
                            </Text>
                          </HStack>
                        )}
                      </VStack>

                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <Text color={textMuted} fontSize="xs">
                          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                        </Text>
                      )}

                      {meeting.summary && (
                        <Box>
                          <Text color={textPrimary} fontSize="xs" fontWeight="semibold" mb={1}>
                            Summary:
                          </Text>
                          <Text color={textMuted} fontSize="xs" noOfLines={3}>
                            {meeting.summary}
                          </Text>
                        </Box>
                      )}

                      <HStack justify="space-between" pt={2}>
                        <Text color={textMuted} fontSize="xs">
                          {formatDate(meeting.createdAt)}
                        </Text>
                        {meeting.audioUrl && (
                          <FiMic size={14} color={buttonBg} />
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default MeetingsList;