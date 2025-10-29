import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Grid,
  GridItem,
  useColorMode,
  Divider,
} from '@chakra-ui/react';
import { FiClock, FiDollarSign, FiCalendar, FiVideo, FiMapPin, FiUser } from 'react-icons/fi';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { SunshineBackground } from './SunshineBackground';
import { getColor } from '../../../brandConfig';

// ==================== GRAPHQL QUERIES ====================

const PUBLIC_CALENDAR_QUERY = gql`
  query PublicCalendar($slug: String!) {
    publicCalendar(slug: $slug) {
      id
      name
      description
      color
      bookingPageSlug
      bookingPageTitle
      bookingPageDescription
      bookingPageLogo
    }
  }
`;

const PUBLIC_EVENT_TYPES_QUERY = gql`
  query PublicBookableEventTypes($calendarSlug: String!) {
    publicBookableEventTypes(calendarSlug: $calendarSlug) {
      id
      name
      description
      durationMinutes
      isPaid
      price
      currency
      locationType
      location
      meetingLink
      isActive
    }
  }
`;

const AVAILABLE_TIME_SLOTS_QUERY = gql`
  query AvailableTimeSlots(
    $calendarId: String!
    $eventTypeId: String!
    $startDate: String!
    $endDate: String!
  ) {
    availableTimeSlots(
      calendarId: $calendarId
      eventTypeId: $eventTypeId
      startDate: $startDate
      endDate: $endDate
    ) {
      startTime
      endTime
      available
    }
  }
`;

// ==================== TYPES ====================

interface PublicCalendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  bookingPageSlug: string;
  bookingPageTitle?: string;
  bookingPageDescription?: string;
  bookingPageLogo?: string;
}

interface BookableEventType {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  isPaid: boolean;
  price?: number;
  currency?: string;
  locationType: string;
  location?: string;
  meetingLink?: string;
  isActive: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ==================== COMPONENT ====================

export const PublicBookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  const { colorMode } = useColorMode();

  // Use brandConfig colors
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = colorMode === 'light'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 248, 248, 0.65) 50%, rgba(255, 255, 255, 0.7) 100%)'
    : 'linear-gradient(135deg, rgba(20, 20, 20, 0.7) 0%, rgba(30, 30, 30, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)';
  const cardBorder = colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const highlightBg = colorMode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)';
  const primaryBlue = getColor('primary', colorMode);

  // Query for calendar details
  const { data: calendarData, loading: calendarLoading, error: calendarError } = useQuery(
    PUBLIC_CALENDAR_QUERY,
    {
      variables: { slug },
      skip: !slug,
    }
  );

  // Query for event types
  const { data: eventTypesData, loading: eventTypesLoading, error: eventTypesError } = useQuery(
    PUBLIC_EVENT_TYPES_QUERY,
    {
      variables: { calendarSlug: slug },
      skip: !slug,
    }
  );

  // Debug logging
  React.useEffect(() => {
    console.log('📋 Event Types Query Status:');
    console.log('   Loading:', eventTypesLoading);
    console.log('   Error:', eventTypesError);
    console.log('   Data:', eventTypesData);
    console.log('   Slug:', slug);
  }, [eventTypesLoading, eventTypesError, eventTypesData, slug]);

  // Query for available time slots (only when event type selected)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 6);

  const { data: timeSlotsData, loading: timeSlotsLoading } = useQuery(
    AVAILABLE_TIME_SLOTS_QUERY,
    {
      variables: {
        calendarId: calendarData?.publicCalendar?.id,
        eventTypeId: selectedEventType,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      },
      skip: !calendarData?.publicCalendar?.id || !selectedEventType,
    }
  );

  // ==================== HANDLERS ====================

  const handleEventTypeSelect = (eventTypeId: string) => {
    setSelectedEventType(eventTypeId);
    setSelectedTime(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot);
  };

  const handleBooking = () => {
    if (!selectedEventType || !selectedTime) return;

    // Navigate to booking form with selected details
    navigate(`/book/${slug}/confirm`, {
      state: {
        eventTypeId: selectedEventType,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
      },
    });
  };

  // ==================== LOADING & ERROR STATES ====================

  if (calendarLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading booking page...</Text>
        </VStack>
      </Container>
    );
  }

  if (calendarError || !calendarData?.publicCalendar) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>Calendar Not Found</AlertTitle>
            <AlertDescription>
              This booking page doesn't exist or is no longer accepting bookings.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  const calendar = calendarData.publicCalendar as PublicCalendar;
  const eventTypes = (eventTypesData?.publicBookableEventTypes || []) as BookableEventType[];
  const timeSlots = (timeSlotsData?.availableTimeSlots || []) as TimeSlot[];

  // Group time slots by day
  const slotsByDay: Record<string, TimeSlot[]> = {};
  timeSlots.forEach((slot) => {
    const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    if (!slotsByDay[date]) {
      slotsByDay[date] = [];
    }
    slotsByDay[date].push(slot);
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Find selected event type details
  const selectedEventTypeDetails = eventTypes.find((et) => et.id === selectedEventType);

  // ==================== RENDER ====================

  return (
    <>
      <NavbarWithCallToAction />
      <Box minH="100vh" position="relative" bg={bg}>
        <SunshineBackground />
        <Box position="relative" zIndex={1}>
      {/* Header */}
      <Box bg={cardGradientBg} borderBottom="1px" borderColor={cardBorder} py={{ base: 4, md: 8 }} backdropFilter="blur(10px)">
        <Container maxW="container.xl">
          <VStack spacing={4} align="start">
            <HStack spacing={4} align="start" w="full" flexWrap={{ base: 'wrap', sm: 'nowrap' }}>
              <Avatar
                size={{ base: 'md', md: 'lg' }}
                name={calendar.name}
                bg={calendar.color}
                color="white"
                src={calendar.bookingPageLogo}
              />
              <VStack align="start" spacing={1} flex={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color={textPrimary}>
                  {calendar.bookingPageTitle || calendar.name}
                </Heading>
                <Text color={textSecondary} fontSize={{ base: 'sm', md: 'md' }}>
                  {calendar.bookingPageDescription || calendar.description}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
          {/* Sidebar - Event Type Selection */}
          <GridItem>
            <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
              <CardHeader>
                <Heading size="md" color={textPrimary}>Select Event Type</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {eventTypesLoading ? (
                    <Spinner />
                  ) : eventTypes.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <Text fontSize="sm">No event types available</Text>
                    </Alert>
                  ) : (
                    eventTypes.map((eventType) => (
                      <Card
                        key={eventType.id}
                        variant={selectedEventType === eventType.id ? 'filled' : 'outline'}
                        cursor="pointer"
                        onClick={() => handleEventTypeSelect(eventType.id)}
                        borderColor={
                          selectedEventType === eventType.id
                            ? 'blue.500'
                            : cardBorder
                        }
                        borderWidth={selectedEventType === eventType.id ? '2px' : '1px'}
                        _hover={{ shadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <CardBody p={{ base: 3, md: 4 }}>
                          <VStack align="start" spacing={2}>
                            <Heading size={{ base: 'xs', md: 'sm' }}>{eventType.name}</Heading>
                            {eventType.description && (
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {eventType.description}
                              </Text>
                            )}
                            <HStack spacing={{ base: 2, md: 4 }} fontSize="xs" color="gray.600" flexWrap="wrap">
                              <HStack>
                                <Icon as={FiClock} />
                                <Text>{eventType.durationMinutes} min</Text>
                              </HStack>
                              {eventType.isPaid && (
                                <HStack>
                                  <Icon as={FiDollarSign} />
                                  <Text>
                                    {eventType.price} {eventType.currency}
                                  </Text>
                                </HStack>
                              )}
                              <HStack>
                                <Icon as={eventType.locationType === 'Virtual' ? FiVideo : FiMapPin} />
                                <Text>{eventType.locationType}</Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Main Area - Week View & Time Selection */}
          <GridItem>
            {!selectedEventType ? (
              <Card bg={cardGradientBg} h="full" borderColor={cardBorder} borderWidth="1px" backdropFilter="blur(10px)">
                <CardBody>
                  <VStack spacing={4} justify="center" h="full">
                    <Icon as={FiCalendar} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.600">
                      Select an event type to see availability
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Choose an event type from the left to view available time slots
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Selected Event Type Info */}
                {selectedEventTypeDetails && (
                  <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
                    <CardBody>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Heading size="sm">{selectedEventTypeDetails.name}</Heading>
                          <HStack spacing={4} fontSize="sm" color="gray.600">
                            <HStack>
                              <Icon as={FiClock} />
                              <Text>{selectedEventTypeDetails.durationMinutes} minutes</Text>
                            </HStack>
                            {selectedEventTypeDetails.isPaid && (
                              <Badge colorScheme="green">
                                {selectedEventTypeDetails.price} {selectedEventTypeDetails.currency}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEventType(null)}
                        >
                          Change
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Week Navigation */}
                <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
                  <CardBody p={{ base: 3, md: 4 }}>
                    <VStack spacing={3} mb={4}>
                      <Heading size={{ base: 'xs', md: 'sm' }} textAlign="center">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                      </Heading>
                      <HStack justify="center" spacing={2} w="full">
                        <Button
                          size={{ base: 'sm', md: 'md' }}
                          onClick={() => handleDateSelect(addDays(weekStart, -7))}
                          flex={1}
                          maxW={{ base: '140px', md: '160px' }}
                        >
                          Previous
                        </Button>
                        <Button
                          size={{ base: 'sm', md: 'md' }}
                          onClick={() => handleDateSelect(addDays(weekStart, 7))}
                          flex={1}
                          maxW={{ base: '140px', md: '160px' }}
                        >
                          Next
                        </Button>
                      </HStack>
                    </VStack>

                    <Divider mb={4} />

                    {/* Week Grid */}
                    {timeSlotsLoading ? (
                      <VStack py={8}>
                        <Spinner />
                        <Text>Loading availability...</Text>
                      </VStack>
                    ) : (
                      <Grid templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(7, 1fr)' }} gap={2}>
                        {weekDays.map((day) => {
                          const dateKey = format(day, 'yyyy-MM-dd');
                          const daySlots = slotsByDay[dateKey] || [];
                          const isToday = isSameDay(day, new Date());
                          const isSelected = isSameDay(day, selectedDate);

                          return (
                            <GridItem key={dateKey}>
                              <VStack
                                spacing={2}
                                p={3}
                                borderRadius="md"
                                bg={isSelected ? highlightBg : 'transparent'}
                                borderWidth={isToday ? '2px' : '1px'}
                                borderColor={isToday ? primaryBlue : cardBorder}
                              >
                                <Text fontWeight="bold" fontSize="xs" color={textPrimary}>
                                  {format(day, 'EEE')}
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                                  {format(day, 'd')}
                                </Text>
                                <Divider />
                                {daySlots.length === 0 ? (
                                  <Text fontSize="xs" color="gray.500">
                                    No slots
                                  </Text>
                                ) : (
                                  <VStack spacing={1} w="full">
                                    {daySlots.slice(0, 3).map((slot, idx) => (
                                      <Button
                                        key={idx}
                                        size="xs"
                                        w="full"
                                        variant={
                                          selectedTime?.startTime === slot.startTime
                                            ? 'solid'
                                            : 'outline'
                                        }
                                        colorScheme={
                                          selectedTime?.startTime === slot.startTime
                                            ? 'blue'
                                            : 'gray'
                                        }
                                        onClick={() => {
                                          handleDateSelect(day);
                                          handleTimeSelect(slot);
                                        }}
                                        isDisabled={!slot.available}
                                      >
                                        {format(parseISO(slot.startTime), 'HH:mm')}
                                      </Button>
                                    ))}
                                    {daySlots.length > 3 && (
                                      <Text fontSize="xs" color="blue.500">
                                        +{daySlots.length - 3} more
                                      </Text>
                                    )}
                                  </VStack>
                                )}
                              </VStack>
                            </GridItem>
                          );
                        })}
                      </Grid>
                    )}
                  </CardBody>
                </Card>

                {/* Booking Action - Prominent CTA */}
                {selectedTime && (
                  <Card
                    bg="linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
                    borderColor="blue.700"
                    borderWidth="2px"
                    shadow="2xl"
                    _hover={{ shadow: '3xl', transform: 'translateY(-4px)' }}
                    transition="all 0.3s"
                  >
                    <CardBody py={8}>
                      <VStack spacing={6}>
                        <VStack spacing={2}>
                          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="white" textAlign="center">
                            You've Selected
                          </Text>
                          <Divider borderColor="blue.300" />
                        </VStack>

                        <VStack spacing={3} bg="linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)" p={{ base: 4, md: 6 }} borderRadius="xl" w="full" shadow="xl" backdropFilter="blur(10px)" borderWidth={1} borderColor="whiteAlpha.400">
                          <HStack spacing={3} flexWrap="wrap" justify="center">
                            <Icon as={FiCalendar} boxSize={{ base: 5, md: 6 }} color="blue.600" />
                            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold" color="gray.800" textAlign="center">
                              {format(parseISO(selectedTime.startTime), 'EEEE, MMMM d, yyyy')}
                            </Text>
                          </HStack>
                          <HStack spacing={3} flexWrap="wrap" justify="center">
                            <Icon as={FiClock} boxSize={{ base: 5, md: 6 }} color="blue.600" />
                            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold" color="gray.800" textAlign="center">
                              {format(parseISO(selectedTime.startTime), 'h:mm a')} - {format(parseISO(selectedTime.endTime), 'h:mm a')}
                            </Text>
                          </HStack>
                          {selectedEventTypeDetails && (
                            <HStack spacing={3} pt={2} flexWrap="wrap" justify="center">
                              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                {selectedEventTypeDetails.name}
                              </Badge>
                              {selectedEventTypeDetails.isPaid && (
                                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                                  {selectedEventTypeDetails.price} {selectedEventTypeDetails.currency}
                                </Badge>
                              )}
                            </HStack>
                          )}
                        </VStack>

                        <Button
                          bg="white"
                          color="blue.600"
                          size={{ base: 'lg', md: 'xl' }}
                          fontSize={{ base: 'lg', md: 'xl' }}
                          fontWeight="bold"
                          px={{ base: 6, md: 12 }}
                          py={{ base: 6, md: 8 }}
                          h="auto"
                          w="full"
                          onClick={handleBooking}
                          leftIcon={<Icon as={FiUser} boxSize={{ base: 5, md: 6 }} />}
                          _hover={{
                            bg: 'blue.50',
                            transform: 'scale(1.05)',
                            shadow: '2xl'
                          }}
                          _active={{
                            transform: 'scale(0.98)'
                          }}
                          transition="all 0.2s"
                          shadow="lg"
                        >
                          Continue to Book
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            )}
          </GridItem>
        </Grid>
      </Container>
        </Box>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default PublicBookingPage;
