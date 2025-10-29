import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  useToast,
  Icon,
  Flex,
  Tag,
  TagLabel,
  TagLeftIcon,
  Select,
  FormControl,
  FormLabel,
  Code,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
  useColorMode,
} from '@chakra-ui/react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaReply,
  FaTrash,
  FaCopy,
  FaTag,
} from 'react-icons/fa';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { format } from 'date-fns';
import { TagSelector } from './components/TagSelector';
import { getColor } from '../../brandConfig';

const SEND_RSVP_RESPONSE = gql`
  mutation SendRSVPResponse($eventId: String!, $response: String!, $fromEmail: String) {
    sendRSVPResponse(eventId: $eventId, response: $response, fromEmail: $fromEmail) {
      success
      message
      event {
        id
        iCalResponseStatus
      }
    }
  }
`;

const EMAIL_SENDERS_QUERY = gql`
  query GetEmailSenders {
    emailSenders
  }
`;

const USER_EMAIL_ACCOUNTS_QUERY = gql`
  query GetUserEmailAccounts {
    userEmailAccounts {
      id
      email
      provider
      isDefault
      isActive
    }
  }
`;

const CANCEL_EVENT = gql`
  mutation CancelEvent($id: String!, $reason: String) {
    cancelEvent(id: $id, reason: $reason)
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $input: CalendarEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      categories
    }
  }
`;

interface ICalInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
    iCalMethod?: string;
    iCalOrganizerEmail?: string;
    iCalOrganizerName?: string;
    iCalResponseStatus?: string;
    iCalReceivedAt?: string;
    iCalSequence?: number;
    isInboundICalInvite?: boolean;
    categories?: string[];
    calendarId?: string;
    iCalHtmlBody?: string;
    iCalMeetingLink?: string;
    iCalRawEmail?: string;
    iCalData?: string;
  };
  onRefresh?: () => void;
}

export const ICalInviteModal: React.FC<ICalInviteModalProps> = ({
  isOpen,
  onClose,
  event,
  onRefresh,
}) => {
  const { colorMode } = useColorMode();
  // Theme-aware colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const toast = useToast();
  const [isResponding, setIsResponding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFromEmail, setSelectedFromEmail] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(event.categories || []);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [sendRSVP] = useMutation(SEND_RSVP_RESPONSE);
  const [cancelEvent] = useMutation(CANCEL_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  
  // Debug logging
  useEffect(() => {
    console.log('📅 ICalInviteModal event data:', {
      id: event.id,
      title: event.title,
      categories: event.categories,
      calendarId: event.calendarId,
      location: event.location
    });
  }, [event]);
  
  // Update selectedTags when event changes
  useEffect(() => {
    setSelectedTags(event.categories || []);
  }, [event.categories]);
  
  // Query for available email senders
  const { data: sendersData } = useQuery(EMAIL_SENDERS_QUERY, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });
  
  // Set default email when senders are loaded
  useEffect(() => {
    if (sendersData?.emailSenders && sendersData.emailSenders.length > 0 && !selectedFromEmail) {
      setSelectedFromEmail(sendersData.emailSenders[0]);
    }
  }, [sendersData, selectedFromEmail]);

  const handleRSVP = async (response: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    setIsResponding(true);
    
    console.log('📤 Sending RSVP:', {
      eventId: event.id,
      response,
      fromEmail: selectedFromEmail || 'default'
    });
    
    try {
      const result = await sendRSVP({
        variables: {
          eventId: event.id,
          response,
          fromEmail: selectedFromEmail || undefined,
        },
      });

      if (result.data?.sendRSVPResponse?.success) {
        toast({
          title: 'RSVP Sent',
          description: result.data.sendRSVPResponse.message || `Your response has been sent to the organizer`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      } else {
        throw new Error(result.data?.sendRSVPResponse?.message || 'Failed to send RSVP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send RSVP response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResponding(false);
    }
  };

  const getResponseStatusColor = (status?: string) => {
    switch (status) {
      case 'ACCEPTED': return 'green';
      case 'DECLINED': return 'red';
      case 'TENTATIVE': return 'yellow';
      default: return 'gray';
    }
  };

  const getResponseStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACCEPTED': return FaCheckCircle;
      case 'DECLINED': return FaTimesCircle;
      case 'TENTATIVE': return FaQuestionCircle;
      default: return FaReply;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  const isCancelled = event.iCalMethod === 'CANCEL';
  
  const handleSaveTags = async () => {
    setIsSavingTags(true);
    console.log('🏷️ Saving tags:', {
      eventId: event.id,
      selectedTags,
      calendarId: event.calendarId || localStorage.getItem('selectedCalendarId') || ''
    });
    
    try {
      const result = await updateEvent({
        variables: {
          id: event.id,
          input: {
            categories: selectedTags,
            // Include minimal required fields
            title: event.title,
            startTime: event.startDateTime,
            endTime: event.endDateTime,
            calendarId: event.calendarId || localStorage.getItem('selectedCalendarId') || '',
          }
        },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
      
      console.log('✅ Tags save result:', result);
      
      toast({
        title: 'Tags updated',
        status: 'success',
        duration: 2000,
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error updating tags',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSavingTags(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            {/* Event ID with copy button */}
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Text fontSize="xs" color={textMuted}>Event ID:</Text>
                <Code fontSize="xs">{event.id}</Code>
                <Tooltip label="Copy Event ID">
                  <IconButton
                    aria-label="Copy Event ID"
                    icon={<FaCopy />}
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(event.id);
                      toast({
                        title: "Event ID copied",
                        status: "success",
                        duration: 2000,
                      });
                    }}
                  />
                </Tooltip>
              </HStack>
              <Tooltip label="Cancel this event (marks as cancelled, doesn't delete)">
                <IconButton
                  aria-label="Cancel Event"
                  icon={<FaTrash />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  isLoading={isDeleting}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to cancel this event? This will mark it as cancelled in your calendar.')) {
                      setIsDeleting(true);
                      try {
                        const result = await cancelEvent({
                          variables: { 
                            id: event.id,
                            reason: 'User cancelled via iCal invite modal'
                          },
                          context: {
                            headers: {
                              'x-tenant-id': localStorage.getItem('tenantId') || ''
                            }
                          }
                        });
                        
                        if (result.data?.cancelEvent) {
                          toast({
                            title: "Event cancelled",
                            description: "The event has been marked as cancelled",
                            status: "success",
                            duration: 3000,
                          });
                          if (onRefresh) onRefresh();
                          onClose();
                        } else {
                          throw new Error('Failed to cancel event');
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error cancelling event",
                          description: error.message || "Failed to cancel the event",
                          status: "error",
                          duration: 5000,
                        });
                      } finally {
                        setIsDeleting(false);
                      }
                    }
                  }}
                />
              </Tooltip>
            </HStack>
            
            {/* Title and Method Badge */}
            <HStack spacing={3}>
              <Icon as={FaEnvelope} color="blue.500" />
              <Text>Calendar Invitation</Text>
              {event.iCalMethod && (
                <Badge 
                  colorScheme={isCancelled ? 'red' : 'blue'}
                  fontSize="sm"
                >
                  {event.iCalMethod}
                </Badge>
              )}
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalBody>
          <Tabs colorScheme="blue" size="sm">
            <TabList>
              <Tab>Event Details</Tab>
              {event.iCalMeetingLink && <Tab>Meeting Link</Tab>}
              {event.iCalHtmlBody && <Tab>Email Preview</Tab>}
              {(event.iCalRawEmail || event.iCalData) && <Tab>Debug Data</Tab>}
            </TabList>
            
            <TabPanels>
              {/* Main Event Details Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
            {/* Email Sender Selection - only show if multiple accounts */}
            {sendersData?.emailSenders && sendersData.emailSenders.length > 1 && !isCancelled && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  <HStack spacing={1}>
                    <Icon as={FaEnvelope} />
                    <Text>Send RSVP from</Text>
                  </HStack>
                </FormLabel>
                <Select
                  value={selectedFromEmail}
                  onChange={(e) => setSelectedFromEmail(e.target.value)}
                  size="sm"
                  borderRadius="md"
                >
                  {sendersData.emailSenders.map((email: string) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {/* Current Response Status */}
            {event.iCalResponseStatus && (
              <Box 
                p={3} 
                borderRadius="md" 
                bg={`${getResponseStatusColor(event.iCalResponseStatus)}.50`}
                borderWidth={1}
                borderColor={`${getResponseStatusColor(event.iCalResponseStatus)}.200`}
              >
                <HStack>
                  <Icon 
                    as={getResponseStatusIcon(event.iCalResponseStatus)} 
                    color={`${getResponseStatusColor(event.iCalResponseStatus)}.500`}
                  />
                  <Text fontWeight="medium">
                    You have {event.iCalResponseStatus.toLowerCase()} this invitation
                    {selectedFromEmail && ` from ${selectedFromEmail}`}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Event Title */}
            <Box>
              <Text fontSize="xl" fontWeight="bold" color={isCancelled ? 'red.500' : 'inherit'}>
                {isCancelled && '❌ CANCELLED: '}{event.title}
              </Text>
            </Box>

            {/* Organizer Info */}
            {(event.iCalOrganizerName || event.iCalOrganizerEmail) && (
              <Box p={3} bg={formBg} borderRadius="md">
                <HStack spacing={2} mb={1}>
                  <Icon as={FaUser} color={textSecondary} />
                  <Text fontWeight="semibold">Organizer</Text>
                </HStack>
                <Text ml={6}>
                  {event.iCalOrganizerName || 'Unknown'}{' '}
                  {event.iCalOrganizerEmail && (
                    <Text as="span" color={textSecondary}>
                      ({event.iCalOrganizerEmail})
                    </Text>
                  )}
                </Text>
              </Box>
            )}

            <Divider />

            {/* Event Details */}
            <VStack align="stretch" spacing={3}>
              {/* Date & Time */}
              <HStack align="flex-start">
                <Icon as={FaCalendarAlt} color={textSecondary} mt={1} />
                <Box flex={1}>
                  <Text fontWeight="medium">When</Text>
                  <Text fontSize="sm" color={textSecondary}>
                    {formatDateTime(event.startDateTime)}
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    to {formatDateTime(event.endDateTime)}
                  </Text>
                </Box>
              </HStack>

              {/* Location */}
              {event.location && (
                <HStack align="flex-start">
                  <Icon as={FaMapMarkerAlt} color={textSecondary} mt={1} />
                  <Box flex={1}>
                    <Text fontWeight="medium">Where</Text>
                    <Text fontSize="sm" color={textSecondary}>{event.location}</Text>
                  </Box>
                </HStack>
              )}

              {/* Description */}
              {event.description && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Description</Text>
                  <Box 
                    p={3} 
                    bg={formBg} 
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {event.description}
                    </Text>
                  </Box>
                </Box>
              )}
              
              {/* Tags Section */}
              <Box>
                <HStack mb={2}>
                  <Icon as={FaTag} color={textSecondary} />
                  <Text fontWeight="medium">Event Tags</Text>
                </HStack>
                <Box p={3} bg={formBg} borderRadius="md">
                  <TagSelector
                    calendarId={event.calendarId || localStorage.getItem('selectedCalendarId') || ''}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    placeholder="Add tags to categorize this event..."
                  />
                  {selectedTags.length > 0 && selectedTags.join(',') !== (event.categories || []).join(',') && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      mt={3}
                      onClick={handleSaveTags}
                      isLoading={isSavingTags}
                    >
                      Save Tags
                    </Button>
                  )}
                </Box>
              </Box>
            </VStack>

                  {/* Metadata */}
                  {event.iCalReceivedAt && (
                    <HStack spacing={2} fontSize="xs" color={textMuted}>
                      <Text>Received:</Text>
                      <Text>{formatDateTime(event.iCalReceivedAt)}</Text>
                      {event.iCalSequence !== undefined && (
                        <>
                          <Text>•</Text>
                          <Text>Update #{event.iCalSequence}</Text>
                        </>
                      )}
                    </HStack>
                  )}
                </VStack>
              </TabPanel>
              
              {/* Meeting Link Tab */}
              {event.iCalMeetingLink && (
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Box p={4} bg="blue.50" borderRadius="md" borderWidth={1} borderColor="blue.200">
                      <HStack spacing={3}>
                        <Icon as={FaCalendarAlt} color="blue.500" />
                        <Text fontWeight="bold">Join Meeting</Text>
                      </HStack>
                      <Link 
                        href={event.iCalMeetingLink} 
                        color="blue.600" 
                        isExternal 
                        fontSize="lg"
                        fontWeight="medium"
                        mt={3}
                        display="block"
                      >
                        {event.iCalMeetingLink}
                      </Link>
                      <Button
                        as="a"
                        href={event.iCalMeetingLink}
                        target="_blank"
                        colorScheme="blue"
                        size="lg"
                        mt={4}
                        width="full"
                      >
                        Join Meeting Now
                      </Button>
                    </Box>
                  </VStack>
                </TabPanel>
              )}
              
              {/* Email Preview Tab */}
              {event.iCalHtmlBody && (
                <TabPanel>
                  <Box 
                    borderWidth={1} 
                    borderColor="gray.200" 
                    borderRadius="md" 
                    overflow="hidden"
                    bg={cardBg}
                  >
                    <Box 
                      p={4} 
                      maxH="500px" 
                      overflowY="auto"
                      dangerouslySetInnerHTML={{ __html: event.iCalHtmlBody }}
                      sx={{
                        '& a': { color: 'blue.500', textDecoration: 'underline' },
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& table': { width: '100%' }
                      }}
                    />
                  </Box>
                </TabPanel>
              )}
              
              {/* Debug Data Tab */}
              {(event.iCalRawEmail || event.iCalData) && (
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {event.iCalRawEmail && (
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold" fontSize="sm">Raw Email Metadata:</Text>
                          <IconButton
                            icon={<FaCopy />}
                            size="xs"
                            onClick={() => {
                              navigator.clipboard.writeText(event.iCalRawEmail || '');
                              toast({
                                title: 'Copied to clipboard',
                                status: 'success',
                                duration: 2000,
                              });
                            }}
                            aria-label="Copy raw email data"
                          />
                        </HStack>
                        <Code 
                          p={3} 
                          borderRadius="md" 
                          fontSize="xs" 
                          maxH="200px" 
                          overflowY="auto"
                          display="block"
                          whiteSpace="pre-wrap"
                        >
                          {JSON.stringify(JSON.parse(event.iCalRawEmail || '{}'), null, 2)}
                        </Code>
                      </Box>
                    )}
                    
                    {event.iCalData && (
                      <Box>
                        <HStack mb={2}>
                          <Text fontWeight="bold" fontSize="sm">iCal Data:</Text>
                          <IconButton
                            icon={<FaCopy />}
                            size="xs"
                            onClick={() => {
                              navigator.clipboard.writeText(event.iCalData || '');
                              toast({
                                title: 'Copied to clipboard',
                                status: 'success',
                                duration: 2000,
                              });
                            }}
                            aria-label="Copy iCal data"
                          />
                        </HStack>
                        <Code 
                          p={3} 
                          borderRadius="md" 
                          fontSize="xs" 
                          maxH="300px" 
                          overflowY="auto"
                          display="block"
                          whiteSpace="pre"
                        >
                          {event.iCalData}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          {!isCancelled ? (
            <HStack spacing={3} width="full">
              <Button
                leftIcon={<FaCheckCircle />}
                colorScheme="green"
                onClick={() => handleRSVP('ACCEPTED')}
                isLoading={isResponding}
                isDisabled={event.iCalResponseStatus === 'ACCEPTED'}
                flex={1}
              >
                Accept
              </Button>
              <Button
                leftIcon={<FaQuestionCircle />}
                colorScheme="yellow"
                onClick={() => handleRSVP('TENTATIVE')}
                isLoading={isResponding}
                isDisabled={event.iCalResponseStatus === 'TENTATIVE'}
                flex={1}
              >
                Maybe
              </Button>
              <Button
                leftIcon={<FaTimesCircle />}
                colorScheme="red"
                onClick={() => handleRSVP('DECLINED')}
                isLoading={isResponding}
                isDisabled={event.iCalResponseStatus === 'DECLINED'}
                flex={1}
              >
                Decline
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </HStack>
          ) : (
            <HStack spacing={3} width="full">
              <Text flex={1} color="red.500" fontSize="sm">
                This event has been cancelled by the organizer
              </Text>
              <Button onClick={onClose}>
                Close
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};