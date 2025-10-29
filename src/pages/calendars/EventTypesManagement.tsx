import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  Select,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Divider,
  Card,
  CardBody,
  Stack,
  useColorMode,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import { getColor, brandConfig } from '../../brandConfig';

// GraphQL Queries and Mutations
const BOOKABLE_EVENT_TYPES_QUERY = gql`
  query BookableEventTypes($calendarId: String!) {
    bookableEventTypes(calendarId: $calendarId) {
      id
      calendarId
      name
      description
      color
      icon
      durationMinutes
      isPaid
      price
      currency
      stripePriceId
      isActive
      maxBookingsPerDay
      minNoticeHours
      maxFutureDays
      bufferBeforeMinutes
      bufferAfterMinutes
      locationType
      location
      meetingLink
      autoGenerateMeetingLink
      questions {
        id
        question
        required
        type
        options
      }
      confirmationMessage
      reminderHoursBefore
      displayOrder
      totalBookings
      lastBookedAt
      createdAt
    }
  }
`;

const CREATE_BOOKABLE_EVENT_TYPE = gql`
  mutation CreateBookableEventType($input: CreateBusinessCalendarBookableEventTypeInput!) {
    createBookableEventType(input: $input) {
      id
      name
      durationMinutes
      isPaid
      price
      isActive
    }
  }
`;

const UPDATE_BOOKABLE_EVENT_TYPE = gql`
  mutation UpdateBookableEventType($id: String!, $input: UpdateBusinessCalendarBookableEventTypeInput!) {
    updateBookableEventType(id: $id, input: $input) {
      id
      name
      durationMinutes
      isPaid
      price
      isActive
    }
  }
`;

const DELETE_BOOKABLE_EVENT_TYPE = gql`
  mutation DeleteBookableEventType($id: String!) {
    deleteBookableEventType(id: $id)
  }
`;

const TOGGLE_EVENT_TYPE_STATUS = gql`
  mutation ToggleBookableEventTypeStatus($id: String!) {
    toggleBookableEventTypeStatus(id: $id) {
      id
      isActive
    }
  }
`;

interface CustomQuestion {
  id?: string;
  question: string;
  required: boolean;
  type: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX';
  options?: string[];
}

interface EventTypeFormData {
  name: string;
  description: string;
  durationMinutes: number;
  isPaid: boolean;
  price: number;
  currency: string;
  color: string;
  minNoticeHours: number;
  maxFutureDays: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  locationType: string;
  location: string;
  meetingLink: string;
  confirmationMessage: string;
  questions: CustomQuestion[];
}

const defaultFormData: EventTypeFormData = {
  name: '',
  description: '',
  durationMinutes: 30,
  isPaid: false,
  price: 0,
  currency: 'USD',
  color: '#4A90E2',
  minNoticeHours: 24,
  maxFutureDays: 60,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  locationType: 'Virtual',
  location: '',
  meetingLink: '',
  confirmationMessage: '',
  questions: [],
};

export const EventTypesManagement: React.FC = () => {
  const { id: calendarId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Brand styling
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);

  // Page title
  usePageTitle('Event Types Management');

  const [formData, setFormData] = useState<EventTypeFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Queries and Mutations
  const { data, loading, error, refetch } = useQuery(BOOKABLE_EVENT_TYPES_QUERY, {
    variables: { calendarId },
    skip: !calendarId,
  });

  const [createEventType, { loading: creating }] = useMutation(CREATE_BOOKABLE_EVENT_TYPE, {
    onCompleted: () => {
      toast({
        title: 'Event type created',
        status: 'success',
        duration: 3000,
      });
      refetch();
      handleCloseModal();
    },
    onError: (err) => {
      toast({
        title: 'Error creating event type',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [updateEventType, { loading: updating }] = useMutation(UPDATE_BOOKABLE_EVENT_TYPE, {
    onCompleted: () => {
      toast({
        title: 'Event type updated',
        status: 'success',
        duration: 3000,
      });
      refetch();
      handleCloseModal();
    },
    onError: (err) => {
      toast({
        title: 'Error updating event type',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [deleteEventType] = useMutation(DELETE_BOOKABLE_EVENT_TYPE, {
    onCompleted: () => {
      toast({
        title: 'Event type deleted',
        status: 'success',
        duration: 3000,
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: 'Error deleting event type',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [toggleStatus] = useMutation(TOGGLE_EVENT_TYPE_STATUS, {
    onCompleted: () => {
      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
      });
      refetch();
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    onOpen();
  };

  const handleOpenEdit = (eventType: any) => {
    setFormData({
      name: eventType.name,
      description: eventType.description || '',
      durationMinutes: eventType.durationMinutes,
      isPaid: eventType.isPaid,
      price: eventType.price ? eventType.price / 100 : 0, // Convert cents to dollars
      currency: eventType.currency || 'USD',
      color: eventType.color || '#4A90E2',
      minNoticeHours: eventType.minNoticeHours,
      maxFutureDays: eventType.maxFutureDays,
      bufferBeforeMinutes: eventType.bufferBeforeMinutes,
      bufferAfterMinutes: eventType.bufferAfterMinutes,
      locationType: eventType.locationType || 'Virtual',
      location: eventType.location || '',
      meetingLink: eventType.meetingLink || '',
      confirmationMessage: eventType.confirmationMessage || '',
      questions: eventType.questions || [],
    });
    setEditingId(eventType.id);
    onOpen();
  };

  const handleCloseModal = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.durationMinutes) {
      toast({
        title: 'Please fill in required fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const input: any = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      durationMinutes: formData.durationMinutes,
      isPaid: formData.isPaid,
      currency: formData.currency,
      minNoticeHours: formData.minNoticeHours,
      maxFutureDays: formData.maxFutureDays,
      bufferBeforeMinutes: formData.bufferBeforeMinutes,
      bufferAfterMinutes: formData.bufferAfterMinutes,
      locationType: formData.locationType,
      location: formData.location,
      meetingLink: formData.meetingLink,
      confirmationMessage: formData.confirmationMessage,
      questions: formData.questions.map(q => ({
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, // Ensure every question has an ID
        question: q.question,
        required: q.required,
        type: q.type,
        options: q.options || [],
      })),
    };

    // Only include price if it's a paid event
    if (formData.isPaid) {
      input.price = formData.price * 100; // Convert to cents
    }

    if (editingId) {
      // Update - don't include calendarId
      await updateEventType({
        variables: { id: editingId, input },
      });
    } else {
      // Create - include calendarId
      await createEventType({
        variables: { input: { ...input, calendarId } },
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      await deleteEventType({ variables: { id } });
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatus({ variables: { id } });
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    const symbol = currency === 'USD' ? '$' : currency === 'AUD' ? 'A$' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh">
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading event types...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgMain} minH="100vh">
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <Text color={textPrimary}>Error loading event types: {error.message}</Text>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const eventTypes = data?.bookableEventTypes || [];

  return (
    <Box bg={bgMain} minH="100vh">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />

      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={4}>
              <IconButton
                aria-label="Back to my calendars"
                icon={<ArrowBackIcon />}
                onClick={() => navigate('/calendars/my')}
                bg={cardGradientBg}
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{ bg: primaryHover }}
              />
              <Box>
                <Heading size="lg" color={textPrimary}>Event Types</Heading>
                <Text color={textSecondary}>Manage bookable event types for your calendar</Text>
              </Box>
            </HStack>
            <HStack>
              <Button
                variant="outline"
                borderColor={primaryColor}
                color={primaryColor}
                onClick={() => navigate(`/calendars/${calendarId}/availability`)}
                _hover={{ bg: primaryHover, color: 'white' }}
              >
                ⏰ Set Availability
              </Button>
              <Button
                leftIcon={<AddIcon />}
                bg={primaryColor}
                color="white"
                onClick={handleOpenCreate}
                _hover={{ bg: primaryHover }}
              >
                Create Event Type
              </Button>
            </HStack>
          </HStack>

          {/* Empty State */}
          {eventTypes.length === 0 && (
            <Card bg={cardGradientBg} borderColor={cardBorder}>
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Text fontSize="lg" color={textPrimary}>
                    No event types yet
                  </Text>
                  <Text color={textSecondary}>
                    Create your first bookable event type to allow visitors to book time with you
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    bg={primaryColor}
                    color="white"
                    onClick={handleOpenCreate}
                    _hover={{ bg: primaryHover }}
                  >
                    Create Event Type
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Event Types Grid */}
          {eventTypes.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {eventTypes.map((eventType: any) => (
                <Card
                  key={eventType.id}
                  opacity={eventType.isActive ? 1 : 0.6}
                  borderLeft="4px solid"
                  borderLeftColor={eventType.color || 'blue.500'}
                  bg={cardGradientBg}
                  borderColor={cardBorder}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {/* Header */}
                      <HStack justify="space-between">
                        <Heading size="md" color={textPrimary}>{eventType.name}</Heading>
                        <HStack>
                          <IconButton
                            aria-label="Edit"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleOpenEdit(eventType)}
                            bg={cardGradientBg}
                            color={textPrimary}
                            _hover={{ bg: primaryHover }}
                          />
                          <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(eventType.id)}
                          />
                        </HStack>
                      </HStack>

                      {/* Description */}
                      {eventType.description && (
                        <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                          {eventType.description}
                        </Text>
                      )}

                      <Divider />

                      {/* Details */}
                      <VStack align="stretch" spacing={2} fontSize="sm">
                        <HStack justify="space-between">
                          <Text color={textSecondary}>Duration:</Text>
                          <Text fontWeight="medium" color={textPrimary}>{eventType.durationMinutes} min</Text>
                        </HStack>

                        {eventType.isPaid && (
                          <HStack justify="space-between">
                            <Text color={textSecondary}>Price:</Text>
                            <Badge colorScheme="green">
                              {formatPrice(eventType.price, eventType.currency)}
                            </Badge>
                          </HStack>
                        )}

                        <HStack justify="space-between">
                          <Text color={textSecondary}>Location:</Text>
                          <Text fontWeight="medium" color={textPrimary}>{eventType.locationType}</Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text color={textSecondary}>Bookings:</Text>
                          <Text fontWeight="medium" color={textPrimary}>{eventType.totalBookings || 0}</Text>
                        </HStack>
                      </VStack>

                      <Divider />

                      {/* Status Toggle */}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textSecondary}>Active</Text>
                        <Switch
                          isChecked={eventType.isActive}
                          onChange={() => handleToggleStatus(eventType.id)}
                          colorScheme="green"
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>

        {/* Create/Edit Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent bg={cardGradientBg} borderColor={cardBorder} maxH="90vh">
            <ModalHeader color={textPrimary}>
              {editingId ? 'Edit Event Type' : 'Create Event Type'}
            </ModalHeader>
            <ModalCloseButton color={textPrimary} />
            <ModalBody>
              <VStack spacing={4}>
                {/* Basic Info */}
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Name</FormLabel>
                  <Input
                    placeholder="30min Consultation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    color={textPrimary}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary}>Description</FormLabel>
                  <Textarea
                    placeholder="A quick consultation to discuss your needs"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    color={textPrimary}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Duration (minutes)</FormLabel>
                  <NumberInput
                    value={formData.durationMinutes}
                    onChange={(_, val) => setFormData({ ...formData, durationMinutes: val })}
                    min={5}
                    step={5}
                  >
                    <NumberInputField color={textPrimary} />
                  </NumberInput>
                </FormControl>

                {/* Pricing */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0" color={textPrimary}>Paid Event</FormLabel>
                  <Switch
                    isChecked={formData.isPaid}
                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  />
                </FormControl>

                {formData.isPaid && (
                  <HStack w="full">
                    <FormControl>
                      <FormLabel color={textPrimary}>Price</FormLabel>
                      <NumberInput
                        value={formData.price}
                        onChange={(_, val) => setFormData({ ...formData, price: val })}
                        min={0}
                        step={1}
                      >
                        <NumberInputField color={textPrimary} />
                      </NumberInput>
                    </FormControl>
                    <FormControl w="200px">
                      <FormLabel color={textPrimary}>Currency</FormLabel>
                      <Select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        color={textPrimary}
                      >
                        <option value="USD">USD</option>
                        <option value="AUD">AUD</option>
                      </Select>
                    </FormControl>
                  </HStack>
                )}

                {/* Location */}
                <FormControl>
                  <FormLabel color={textPrimary}>Location Type</FormLabel>
                  <Select
                    value={formData.locationType}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    color={textPrimary}
                  >
                    <option value="Virtual">Virtual</option>
                    <option value="Physical">Physical</option>
                    <option value="Phone">Phone</option>
                  </Select>
                </FormControl>

                {formData.locationType === 'Virtual' && (
                  <FormControl>
                    <FormLabel color={textPrimary}>Meeting Link (optional)</FormLabel>
                    <Input
                      placeholder="https://zoom.us/j/123456789"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      color={textPrimary}
                    />
                  </FormControl>
                )}

                {formData.locationType === 'Physical' && (
                  <FormControl>
                    <FormLabel color={textPrimary}>Location Address</FormLabel>
                    <Input
                      placeholder="123 Main St, City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      color={textPrimary}
                    />
                  </FormControl>
                )}

                {/* Booking Constraints */}
                <Stack direction={{ base: 'column', md: 'row' }} w="full">
                  <FormControl>
                    <FormLabel color={textPrimary}>Min Notice (hours)</FormLabel>
                    <NumberInput
                      value={formData.minNoticeHours}
                      onChange={(_, val) => setFormData({ ...formData, minNoticeHours: val })}
                      min={0}
                    >
                      <NumberInputField color={textPrimary} />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textPrimary}>Max Future Days</FormLabel>
                    <NumberInput
                      value={formData.maxFutureDays}
                      onChange={(_, val) => setFormData({ ...formData, maxFutureDays: val })}
                      min={1}
                    >
                      <NumberInputField color={textPrimary} />
                    </NumberInput>
                  </FormControl>
                </Stack>

                {/* Buffers */}
                <Stack direction={{ base: 'column', md: 'row' }} w="full">
                  <FormControl>
                    <FormLabel color={textPrimary}>Buffer Before (min)</FormLabel>
                    <NumberInput
                      value={formData.bufferBeforeMinutes}
                      onChange={(_, val) => setFormData({ ...formData, bufferBeforeMinutes: val })}
                      min={0}
                    >
                      <NumberInputField color={textPrimary} />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textPrimary}>Buffer After (min)</FormLabel>
                    <NumberInput
                      value={formData.bufferAfterMinutes}
                      onChange={(_, val) => setFormData({ ...formData, bufferAfterMinutes: val })}
                      min={0}
                    >
                      <NumberInputField color={textPrimary} />
                    </NumberInput>
                  </FormControl>
                </Stack>

                {/* Color */}
                <FormControl>
                  <FormLabel color={textPrimary}>Color</FormLabel>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </FormControl>

                <Divider my={4} />

                {/* Custom Questions */}
                <Box w="full">
                  <HStack justify="space-between" mb={3}>
                    <Box>
                      <FormLabel color={textPrimary} mb={0}>Custom Questions</FormLabel>
                      <Text fontSize="sm" color={textSecondary}>Ask visitors custom questions when they book</Text>
                    </Box>
                    <Button
                      size="sm"
                      leftIcon={<AddIcon />}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          questions: [...formData.questions, {
                            id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, // Generate unique ID
                            question: '',
                            required: false,
                            type: 'TEXT',
                            options: [],
                          }]
                        });
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Add Question
                    </Button>
                  </HStack>

                  {formData.questions.length === 0 && (
                    <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="md" textAlign="center">
                      <Text fontSize="sm" color={textSecondary}>
                        No custom questions yet. Click "Add Question" to create one.
                      </Text>
                    </Box>
                  )}

                  <VStack spacing={4} align="stretch">
                    {formData.questions.map((question, index) => (
                      <Card key={index} bg="rgba(255,255,255,0.05)" borderColor={cardBorder}>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontWeight="bold" color={textPrimary}>Question {index + 1}</Text>
                              <IconButton
                                aria-label="Delete question"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions.splice(index, 1);
                                  setFormData({ ...formData, questions: newQuestions });
                                }}
                              />
                            </HStack>

                            <FormControl isRequired>
                              <FormLabel fontSize="sm" color={textPrimary}>Question Text</FormLabel>
                              <Input
                                placeholder="e.g., What would you like to discuss?"
                                value={question.question}
                                onChange={(e) => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions[index].question = e.target.value;
                                  setFormData({ ...formData, questions: newQuestions });
                                }}
                                color={textPrimary}
                                size="sm"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color={textPrimary}>Answer Type</FormLabel>
                              <Select
                                value={question.type}
                                onChange={(e) => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions[index].type = e.target.value as any;
                                  setFormData({ ...formData, questions: newQuestions });
                                }}
                                color={textPrimary}
                                size="sm"
                              >
                                <option value="TEXT">Short Text</option>
                                <option value="TEXTAREA">Long Text (Textarea)</option>
                                <option value="SELECT">Dropdown (Select)</option>
                                <option value="RADIO">Radio Buttons</option>
                                <option value="CHECKBOX">Checkboxes</option>
                              </Select>
                            </FormControl>

                            {['SELECT', 'RADIO', 'CHECKBOX'].includes(question.type) && (
                              <FormControl>
                                <FormLabel fontSize="sm" color={textPrimary}>
                                  Options (comma-separated)
                                </FormLabel>
                                <Input
                                  placeholder="e.g., 1-10, 11-50, 51-100, 100+"
                                  value={question.options?.join(', ') || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...formData.questions];
                                    newQuestions[index].options = e.target.value
                                      .split(',')
                                      .map(opt => opt.trim())
                                      .filter(opt => opt.length > 0);
                                    setFormData({ ...formData, questions: newQuestions });
                                  }}
                                  color={textPrimary}
                                  size="sm"
                                />
                              </FormControl>
                            )}

                            <FormControl display="flex" alignItems="center">
                              <Switch
                                isChecked={question.required}
                                onChange={(e) => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions[index].required = e.target.checked;
                                  setFormData({ ...formData, questions: newQuestions });
                                }}
                                size="sm"
                              />
                              <FormLabel mb="0" ml={2} fontSize="sm" color={textPrimary}>
                                Required
                              </FormLabel>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal} color={textPrimary}>
                Cancel
              </Button>
              <Button
                bg={primaryColor}
                color="white"
                onClick={handleSubmit}
                isLoading={creating || updating}
                _hover={{ bg: primaryHover }}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default EventTypesManagement;
