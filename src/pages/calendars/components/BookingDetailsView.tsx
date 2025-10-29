import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Badge,
  Divider,
  Icon,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  useColorMode,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiDollarSign, FiClock, FiCalendar, FiExternalLink, FiFileText, FiCheck, FiFolder } from 'react-icons/fi';
import { format } from 'date-fns';
import { getColor } from '../../../brandConfig';
import { gql, useMutation, useQuery } from '@apollo/client';

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $input: CalendarEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      metadata
    }
  }
`;

const GET_CLIENT_BY_EMAIL = gql`
  query GetClientByEmail($email: String!) {
    clientByEmail(email: $email) {
      id
      fName
      lName
      email
      phoneNumber
    }
  }
`;

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
      }
    }
  }
`;

const GET_PROJECT_BY_ID = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      projectName
    }
  }
`;

interface BookingDetailsViewProps {
  event: any;
  calendarId: string;
  onCancel?: () => void;
  onReschedule?: () => void;
  onSendReminder?: () => void;
  onPaymentStatusUpdate?: () => void;
}

/**
 * BookingDetailsView - Read-only view for public booking events
 * Shows booker information, payment status, custom answers, and booking actions
 */
export const BookingDetailsView: React.FC<BookingDetailsViewProps> = ({
  event,
  calendarId,
  onCancel,
  onReschedule,
  onSendReminder,
  onPaymentStatusUpdate,
}) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const metadata = event.extendedProps?.metadata || event.metadata || {};
  const { isOpen: isProjectModalOpen, onOpen: onProjectModalOpen, onClose: onProjectModalClose } = useDisclosure();

  // Extract booking information from metadata FIRST (before using in queries)
  const bookerName = metadata['X-BOOKER-NAME'] || 'Unknown';
  const bookerEmail = metadata['X-BOOKER-EMAIL'] || '';
  const bookerPhone = metadata['X-BOOKER-PHONE'] || '';
  const bookerTimezone = metadata['X-BOOKER-TIMEZONE'] || 'UTC';
  const bookingStatus = metadata['X-BOOKING-STATUS'] || 'CONFIRMED';
  const paymentStatus = metadata['X-PAYMENT-STATUS'] || 'NOT_REQUIRED';
  const paymentAmount = metadata['X-PAYMENT-AMOUNT'];
  const paymentCurrency = metadata['X-PAYMENT-CURRENCY'] || 'USD';
  const meetingLink = metadata['X-MEETING-LINK'];
  const bookingToken = metadata['X-BOOKING-TOKEN'];
  const existingProjectId = metadata['X-PROJECT-ID'];

  // Local state for payment status
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus);

  // Project form state
  const eventTypeName = event.title?.split(' - ')[0] || 'Booking Session';
  const [projectFormData, setProjectFormData] = useState({
    projectName: eventTypeName,
    projectGoal: `Complete ${eventTypeName} session and deliver outcomes`,
    projectDescription: `Project for ${bookerName}'s ${eventTypeName} booked on ${format(new Date(), 'MMMM d, yyyy')}`,
  });

  // Query to check if client exists
  const { data: clientData, loading: loadingClient } = useQuery(GET_CLIENT_BY_EMAIL, {
    variables: { email: bookerEmail },
    skip: !bookerEmail, // Skip query if no email
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || '',
      },
    },
  });

  const clientExists = !!clientData?.clientByEmail;
  const existingClient = clientData?.clientByEmail;

  // Query to check if project exists
  const { data: projectData, loading: loadingProject, refetch: refetchProject } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id: existingProjectId || '' },
    skip: !existingProjectId,
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || '',
      },
    },
  });

  const projectExists = !!projectData?.project;
  const existingProject = projectData?.project;

  // Mutation to create project
  const [createProject, { loading: creatingProject }] = useMutation(CREATE_PROJECT, {
    onCompleted: async (data) => {
      const createdProjectId = data.createProject.id;
      const createdProjectName = data.createProject.projectName;

      toast({
        title: 'Project Created',
        description: `"${createdProjectName}" has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update event metadata with project ID
      try {
        await updateEvent({
          variables: {
            id: event.id,
            input: {
              calendarId: calendarId,
              title: event.title,
              startTime: event.start || event.startTime,
              endTime: event.end || event.endTime,
              metadata: {
                ...metadata,
                'X-PROJECT-ID': createdProjectId,
                'X-PROJECT-NAME': createdProjectName,
              },
            },
          },
          context: {
            headers: {
              'x-tenant-id': localStorage.getItem('tenantId') || '',
            },
          },
        });

        // Refetch project data
        await refetchProject();

        // Close modal
        onProjectModalClose();

        toast({
          title: 'Booking Updated',
          description: 'Project has been linked to this booking',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error linking project to booking:', error);
        toast({
          title: 'Warning',
          description: 'Project created but failed to link to booking',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error creating project',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Mutation to update event metadata
  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      toast({
        title: 'Payment status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (onPaymentStatusUpdate) {
        onPaymentStatusUpdate();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error updating payment status',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.600';

  // Parse dates from event - handle both FullCalendar format and raw event format
  const startDate = event.start ? new Date(event.start) :
                    event.startTime ? new Date(event.startTime) : null;
  const endDate = event.end ? new Date(event.end) :
                  event.endTime ? new Date(event.endTime) : null;

  console.log('📅 BookingDetailsView - Event data:', {
    event,
    metadata,
    startDate,
    endDate,
    startRaw: event.start,
    startTime: event.startTime,
    endRaw: event.end,
    endTime: event.endTime
  });

  // Handler to update payment status
  const handlePaymentStatusChange = async (newStatus: string) => {
    setLocalPaymentStatus(newStatus);

    try {
      // Update the event metadata
      await updateEvent({
        variables: {
          id: event.id,
          input: {
            calendarId: calendarId, // Use the calendarId prop passed from EventModal
            title: event.title,
            startTime: event.start || event.startTime,
            endTime: event.end || event.endTime,
            metadata: {
              ...metadata,
              'X-PAYMENT-STATUS': newStatus,
            },
          },
        },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || '',
          },
        },
      });

      toast({
        title: 'Payment status updated',
        description: `Status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Call the callback if provided
      if (onPaymentStatusUpdate) {
        onPaymentStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);

      // Revert the local state on error
      setLocalPaymentStatus(paymentStatus);

      toast({
        title: 'Error updating payment status',
        description: error instanceof Error ? error.message : 'Failed to update payment status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler to create a client from booker information
  const handleCreateClient = () => {
    // Split name into first and last
    const nameParts = bookerName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create URL with query parameters to pre-fill the client form
    const clientParams = new URLSearchParams({
      fName: firstName,
      lName: lastName,
      email: bookerEmail,
      phoneNumber: bookerPhone,
      source: 'booking',
      bookingToken: bookingToken || '',
    });

    // Open in new tab
    window.open(`/clients/new?${clientParams.toString()}`, '_blank');
  };

  // Handler to create project from booking
  const handleCreateProject = async () => {
    if (!clientExists) {
      toast({
        title: 'Client required',
        description: 'Please create a client record first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await createProject({
        variables: {
          input: {
            projectName: projectFormData.projectName,
            projectGoal: projectFormData.projectGoal,
            projectDescription: projectFormData.projectDescription,
            billingClient: existingClient.id,
          },
        },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || '',
          },
        },
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Handler to create a bill from this booking
  const handleIssueBill = () => {
    if (!clientExists) {
      toast({
        title: 'Client not found',
        description: 'Please create a client record first using the "Create Client" button',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!projectExists) {
      toast({
        title: 'Project required',
        description: 'Please create a project first using the "Create Project" button',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Get event type name from the title (format: "EventType - BookerName")
    const eventTypeName = event.title?.split(' - ')[0] || 'Booking Session';

    // Calculate amount in dollars (stored as cents in metadata)
    const amountInDollars = paymentAmount ? (paymentAmount / 100).toFixed(2) : '0.00';

    // Create URL with query parameters to pre-fill the bill
    const billParams = new URLSearchParams({
      // Pre-fill line item
      itemName: eventTypeName,
      itemPrice: amountInDollars,
      itemQuantity: '1',
      // Pre-fill client info
      clientEmail: bookerEmail,
      clientName: bookerName,
      clientPhone: bookerPhone,
      // Add currency
      currency: paymentCurrency,
      // Add project ID
      projectId: existingProjectId || '',
      // Add notes
      notes: `Bill for booking on ${startDate ? format(startDate, 'MMMM d, yyyy') : ''} at ${startDate ? format(startDate, 'h:mm a') : ''}. Booking Token: ${bookingToken}. Project: ${existingProject?.projectName || 'N/A'}`
    });

    // Open in new tab
    window.open(`/bills/new?${billParams.toString()}`, '_blank');
  };

  // Extract custom question answers
  const customAnswers: Array<{ question: string; answer: string }> = [];
  Object.keys(metadata).forEach(key => {
    if (key.startsWith('X-BOOKING-QUESTION-')) {
      const index = key.replace('X-BOOKING-QUESTION-', '');
      const answerKey = `X-BOOKING-ANSWER-${index}`;
      if (metadata[answerKey]) {
        customAnswers.push({
          question: metadata[key],
          answer: metadata[answerKey],
        });
      }
    }
  });

  // Payment status badge color
  const getPaymentStatusColor = () => {
    switch (localPaymentStatus) {
      case 'COMPLETED': return 'green';
      case 'PENDING': return 'yellow';
      case 'FAILED': return 'red';
      case 'REFUNDED': return 'orange';
      case 'NOT_REQUIRED': return 'gray';
      default: return 'gray';
    }
  };

  // Booking status badge color
  const getBookingStatusColor = () => {
    switch (bookingStatus) {
      case 'CONFIRMED': return 'green';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      {/* Header Section */}
      <Box>
        <HStack spacing={2} mb={2}>
          <Icon as={FiCalendar} color="blue.500" boxSize={5} />
          <Heading size="md" color={textPrimary}>
            Public Booking Details
          </Heading>
        </HStack>
        <HStack spacing={2}>
          <Badge colorScheme={getBookingStatusColor()} fontSize="sm">
            {bookingStatus}
          </Badge>
          {paymentStatus !== 'NOT_REQUIRED' && (
            <Badge colorScheme={getPaymentStatusColor()} fontSize="sm">
              Payment: {paymentStatus}
            </Badge>
          )}
        </HStack>
      </Box>

      <Divider />

      {/* Booker Information */}
      <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Heading size="sm" color={textPrimary} mb={4}>
            Booker Information
          </Heading>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Icon as={FiUser} color={textSecondary} />
              <Text color={textSecondary} fontSize="sm" width="100px">
                Name:
              </Text>
              <Text color={textPrimary} fontWeight="medium">
                {bookerName}
              </Text>
            </HStack>

            {bookerEmail && (
              <HStack>
                <Icon as={FiMail} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Email:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {bookerEmail}
                </Text>
              </HStack>
            )}

            {bookerPhone && (
              <HStack>
                <Icon as={FiPhone} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Phone:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {bookerPhone}
                </Text>
              </HStack>
            )}

            <HStack>
              <Icon as={FiClock} color={textSecondary} />
              <Text color={textSecondary} fontSize="sm" width="100px">
                Timezone:
              </Text>
              <Text color={textPrimary} fontWeight="medium">
                {bookerTimezone}
              </Text>
            </HStack>

            {/* Client Status and Create Button */}
            <Divider />
            <Box>
              {loadingClient ? (
                <Text fontSize="sm" color={textSecondary}>
                  Checking client status...
                </Text>
              ) : clientExists ? (
                <VStack align="stretch" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiCheck} color="green.500" />
                    <Text fontSize="sm" color="green.600" fontWeight="medium">
                      Client exists in database
                    </Text>
                    <Badge colorScheme="green" fontSize="xs">
                      {existingClient?.fName} {existingClient?.lName}
                    </Badge>
                  </HStack>
                  <Button
                    leftIcon={<Icon as={FiExternalLink} />}
                    colorScheme="green"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/client/${existingClient?.id}`, '_blank')}
                    width="full"
                  >
                    View Client Details
                  </Button>
                </VStack>
              ) : (
                <VStack align="stretch" spacing={2}>
                  <HStack spacing={2}>
                    <Icon as={FiUser} color="orange.500" />
                    <Text fontSize="sm" color="orange.600" fontWeight="medium">
                      Client not found in database
                    </Text>
                  </HStack>
                  <Button
                    leftIcon={<Icon as={FiUser} />}
                    colorScheme="orange"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateClient}
                    width="full"
                  >
                    Create Client Record
                  </Button>
                  <Text fontSize="xs" color={textSecondary}>
                    Opens pre-filled client form in new tab
                  </Text>
                </VStack>
              )}
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Appointment Details */}
      <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Heading size="sm" color={textPrimary} mb={4}>
            Appointment Details
          </Heading>
          <VStack align="stretch" spacing={3}>
            {startDate && (
              <HStack>
                <Icon as={FiCalendar} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Date:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {format(startDate, 'EEEE, MMMM d, yyyy')}
                </Text>
              </HStack>
            )}

            {startDate && endDate && (
              <HStack>
                <Icon as={FiClock} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Time:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </Text>
              </HStack>
            )}

            {event.extendedProps?.location && (
              <HStack align="start">
                <Icon as={FiMapPin} color={textSecondary} mt={1} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Location:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {typeof event.extendedProps.location === 'string'
                    ? event.extendedProps.location
                    : event.extendedProps.location?.name || event.extendedProps.location?.details || 'N/A'}
                </Text>
              </HStack>
            )}

            {meetingLink && (
              <HStack>
                <Icon as={FiExternalLink} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Meeting Link:
                </Text>
                <Button
                  as="a"
                  href={meetingLink}
                  target="_blank"
                  size="sm"
                  colorScheme="blue"
                  variant="link"
                  rightIcon={<FiExternalLink />}
                >
                  Join Meeting
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Payment Information */}
      {paymentStatus !== 'NOT_REQUIRED' && (
        <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="sm" color={textPrimary} mb={4}>
              Payment Information
            </Heading>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FiDollarSign} color={textSecondary} />
                <Text color={textSecondary} fontSize="sm" width="100px">
                  Amount:
                </Text>
                <Text color={textPrimary} fontWeight="medium">
                  {paymentAmount ? `${paymentCurrency} $${(paymentAmount / 100).toFixed(2)}` : 'N/A'}
                </Text>
              </HStack>

              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Text color={textSecondary} fontSize="sm" width="100px">
                    Status:
                  </Text>
                  <Badge colorScheme={getPaymentStatusColor()}>
                    {localPaymentStatus}
                  </Badge>
                </HStack>
                <Box>
                  <Text color={textSecondary} fontSize="xs" mb={1}>
                    Update Payment Status:
                  </Text>
                  <Select
                    value={localPaymentStatus}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                    size="sm"
                    isDisabled={updating}
                  >
                    <option value="NOT_REQUIRED">Not Required</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </Select>
                </Box>
              </VStack>

              {/* Project Management Section */}
              <Divider />
              <Box>
                {loadingProject ? (
                  <Text fontSize="sm" color={textSecondary}>
                    Checking project status...
                  </Text>
                ) : projectExists ? (
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FiCheck} color="green.500" />
                      <Text fontSize="sm" color="green.600" fontWeight="medium">
                        Project linked to booking
                      </Text>
                      <Badge colorScheme="green" fontSize="xs">
                        {existingProject?.projectName}
                      </Badge>
                    </HStack>
                    <Button
                      leftIcon={<Icon as={FiExternalLink} />}
                      colorScheme="green"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/project/${existingProjectId}`, '_blank')}
                      width="full"
                    >
                      View Project
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FiFolder} color="blue.500" />
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        No project linked yet
                      </Text>
                    </HStack>
                    <Button
                      leftIcon={<Icon as={FiFolder} />}
                      colorScheme="blue"
                      variant="solid"
                      size="sm"
                      onClick={onProjectModalOpen}
                      width="full"
                      isDisabled={!clientExists}
                    >
                      Create Project
                    </Button>
                    {!clientExists && (
                      <Text fontSize="xs" color={textSecondary}>
                        Create a client record first before creating a project
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>

              {/* Issue Bill Button */}
              <Divider />
              <Box>
                <Button
                  leftIcon={<Icon as={FiFileText} />}
                  colorScheme={projectExists ? "purple" : "gray"}
                  variant="outline"
                  size="sm"
                  onClick={handleIssueBill}
                  width="full"
                  isDisabled={!projectExists}
                >
                  Issue Bill
                </Button>
                <Text fontSize="xs" color={textSecondary} mt={2}>
                  {projectExists
                    ? 'Create a formal invoice for this booking'
                    : 'Create a project first before issuing a bill'}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Custom Question Answers */}
      {customAnswers.length > 0 && (
        <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="sm" color={textPrimary} mb={4}>
              Additional Information
            </Heading>
            <VStack align="stretch" spacing={3}>
              {customAnswers.map((qa, index) => (
                <Box key={index}>
                  <Text color={textSecondary} fontSize="sm" mb={1}>
                    {qa.question}
                  </Text>
                  <Text color={textPrimary} fontWeight="medium" pl={4}>
                    {qa.answer}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <Divider />
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        {onSendReminder && (
          <Button colorScheme="blue" variant="outline" onClick={onSendReminder}>
            Send Reminder
          </Button>
        )}
        {onReschedule && (
          <Button colorScheme="orange" variant="outline" onClick={onReschedule}>
            Reschedule
          </Button>
        )}
        {onCancel && (
          <Button colorScheme="red" variant="outline" onClick={onCancel}>
            Cancel Booking
          </Button>
        )}
      </SimpleGrid>

      {/* Booking Token (for admin reference) */}
      {bookingToken && (
        <Box pt={2}>
          <Text color={textSecondary} fontSize="xs">
            Booking Token: {bookingToken}
          </Text>
        </Box>
      )}

      {/* Project Creation Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={onProjectModalClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bgCard} borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={textPrimary}>
            <HStack spacing={2}>
              <Icon as={FiFolder} color="blue.500" />
              <Text>Create Project for Booking</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={textSecondary} />

          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box bg={colorMode === 'light' ? 'blue.50' : 'blue.900'} p={3} borderRadius="md">
                <Text fontSize="sm" color={textPrimary}>
                  <strong>Client:</strong> {bookerName} ({bookerEmail})
                </Text>
                <Text fontSize="sm" color={textPrimary}>
                  <strong>Session:</strong> {eventTypeName}
                </Text>
              </Box>

              <FormControl isRequired>
                <FormLabel color={textPrimary} fontSize="sm">
                  Project Name
                </FormLabel>
                <Input
                  value={projectFormData.projectName}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, projectName: e.target.value })
                  }
                  placeholder="Enter project name"
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  borderColor={borderColor}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textPrimary} fontSize="sm">
                  Project Goal (max 17 words)
                </FormLabel>
                <Textarea
                  value={projectFormData.projectGoal}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, projectGoal: e.target.value })
                  }
                  placeholder="Enter project goal"
                  rows={2}
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  borderColor={borderColor}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textPrimary} fontSize="sm">
                  Project Description (max 70 words)
                </FormLabel>
                <Textarea
                  value={projectFormData.projectDescription}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, projectDescription: e.target.value })
                  }
                  placeholder="Enter project description"
                  rows={3}
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  borderColor={borderColor}
                  color={textPrimary}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onProjectModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateProject}
              isLoading={creatingProject}
              leftIcon={<Icon as={FiFolder} />}
            >
              Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
