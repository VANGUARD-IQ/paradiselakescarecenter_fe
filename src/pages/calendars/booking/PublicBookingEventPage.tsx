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
  Icon,
  Grid,
  GridItem,
  useColorMode,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiVideo,
  FiMapPin,
  FiUser,
  FiChevronRight,
  FiArrowLeft,
} from 'react-icons/fi';
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
    }
  }
`;

const PUBLIC_EVENT_TYPE_QUERY = gql`
  query PublicEventType($calendarSlug: String!) {
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

/**
 * PublicBookingEventPage - Direct booking page with pre-selected event type
 *
 * This page is used when someone shares a direct link to a specific event type.
 * Example: /book/tom-miller/68abc123def456...
 *
 * It shows ONLY the calendar for the selected event type, jumping straight
 * to time selection without requiring the user to pick an event type first.
 */
export const PublicBookingEventPage: React.FC = () => {
  const { slug, eventTypeId } = useParams<{ slug: string; eventTypeId: string }>();
  const navigate = useNavigate();

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

  // Query for event types (to find the specific event type)
  const { data: eventTypesData, loading: eventTypesLoading } = useQuery(
    PUBLIC_EVENT_TYPE_QUERY,
    {
      variables: { calendarSlug: slug },
      skip: !slug,
    }
  );

  // Query for available time slots
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 6);

  const { data: timeSlotsData, loading: timeSlotsLoading } = useQuery(
    AVAILABLE_TIME_SLOTS_QUERY,
    {
      variables: {
        calendarId: calendarData?.publicCalendar?.id,
        eventTypeId: eventTypeId,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      },
      skip: !calendarData?.publicCalendar?.id || !eventTypeId,
    }
  );

  // ==================== HANDLERS ====================

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot);
  };

  const handleBooking = () => {
    if (!eventTypeId || !selectedTime) return;

    // Navigate to booking form with selected details
    navigate(`/book/${slug}/confirm`, {
      state: {
        eventTypeId: eventTypeId,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
      },
    });
  };

  // ==================== LOADING & ERROR STATES ====================

  if (calendarLoading || eventTypesLoading) {
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
  const allEventTypes = (eventTypesData?.publicBookableEventTypes || []) as BookableEventType[];
  const eventType = allEventTypes.find((et) => et.id === eventTypeId);

  if (!eventType) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>Event Type Not Found</AlertTitle>
            <AlertDescription>
              This event type is no longer available for booking.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

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

  // ==================== RENDER ====================

  return (
    <>
      <NavbarWithCallToAction />
      <Box minH="100vh" position="relative" bg={bg}>
        <SunshineBackground />
        <Box position="relative" zIndex={1}>
      {/* Header */}
      <Box bg={cardGradientBg} borderBottom="1px" borderColor={cardBorder} py={6} backdropFilter="blur(10px)">
        <Container maxW="container.xl">
          <VStack spacing={4} align="start">
            {/* Breadcrumb Navigation */}
            <Breadcrumb spacing="8px" separator={<Icon as={FiChevronRight} color="gray.500" />}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate(`/book/${slug}`)}
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  <HStack>
                    <Icon as={FiArrowLeft} />
                    <Text>All Event Types</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color="gray.600">{eventType.name}</Text>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Calendar Owner Info */}
            <HStack spacing={4}>
              <Avatar
                size="lg"
                name={calendar.name}
                bg={calendar.color}
                color="white"
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  {calendar.bookingPageTitle || calendar.name}
                </Text>
                <Heading size="lg">{eventType.name}</Heading>
              </VStack>
            </HStack>

            {/* Event Type Details Card */}
            <Card w="full" bg={cardGradientBg} borderWidth="1px" borderColor={cardBorder} backdropFilter="blur(10px)">
              <CardBody>
                <VStack align="start" spacing={3}>
                  {eventType.description && (
                    <Text color="gray.700">{eventType.description}</Text>
                  )}
                  <HStack spacing={6} flexWrap="wrap">
                    <HStack>
                      <Icon as={FiClock} color="gray.600" />
                      <Text fontSize="sm" color="gray.700">
                        {eventType.durationMinutes} minutes
                      </Text>
                    </HStack>
                    {eventType.isPaid && (
                      <HStack>
                        <Icon as={FiDollarSign} color="green.600" />
                        <Badge colorScheme="green" fontSize="sm">
                          {eventType.price} {eventType.currency}
                        </Badge>
                      </HStack>
                    )}
                    <HStack>
                      <Icon
                        as={eventType.locationType === 'Virtual' ? FiVideo : FiMapPin}
                        color="gray.600"
                      />
                      <Text fontSize="sm" color="gray.700">
                        {eventType.locationType}
                        {eventType.location && ` - ${eventType.location}`}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Main Content - Week View */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Week Navigation */}
          <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <Button
                  size="sm"
                  onClick={() => handleDateSelect(addDays(weekStart, -7))}
                  leftIcon={<Icon as={FiArrowLeft} />}
                >
                  Previous
                </Button>
                <Heading size="md">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </Heading>
                <Button
                  size="sm"
                  onClick={() => handleDateSelect(addDays(weekStart, 7))}
                  rightIcon={<Icon as={FiChevronRight} />}
                >
                  Next
                </Button>
              </HStack>

              <Divider mb={6} />

              {/* Week Grid */}
              {timeSlotsLoading ? (
                <VStack py={8}>
                  <Spinner />
                  <Text>Loading availability...</Text>
                </VStack>
              ) : (
                <Grid templateColumns="repeat(7, 1fr)" gap={3}>
                  {weekDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const daySlots = slotsByDay[dateKey] || [];
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <GridItem key={dateKey}>
                        <VStack
                          spacing={2}
                          p={4}
                          borderRadius="lg"
                          bg={isSelected ? highlightBg : 'transparent'}
                          borderWidth="2px"
                          borderColor={
                            isToday
                              ? primaryBlue
                              : isSelected
                              ? primaryBlue
                              : cardBorder
                          }
                          transition="all 0.2s"
                        >
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={isToday ? primaryBlue : textPrimary}
                          >
                            {format(day, 'EEE')}
                          </Text>
                          <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color={isToday ? primaryBlue : textPrimary}
                          >
                            {format(day, 'd')}
                          </Text>
                          <Divider />
                          {daySlots.length === 0 ? (
                            <Box py={4}>
                              <Text fontSize="xs" color="gray.500" textAlign="center">
                                No availability
                              </Text>
                            </Box>
                          ) : (
                            <VStack spacing={2} w="full" maxH="300px" overflowY="auto">
                              {daySlots.map((slot, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
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
                                  _hover={{
                                    transform: slot.available ? 'translateY(-2px)' : 'none',
                                    shadow: slot.available ? 'md' : 'none',
                                  }}
                                  transition="all 0.2s"
                                >
                                  {format(parseISO(slot.startTime), 'h:mm a')}
                                </Button>
                              ))}
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
              bg="blue.600"
              borderColor="blue.700"
              borderWidth="2px"
              shadow="2xl"
              _hover={{ shadow: '3xl', transform: 'translateY(-4px)' }}
              transition="all 0.3s"
            >
              <CardBody py={8}>
                <VStack spacing={6}>
                  <VStack spacing={2}>
                    <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
                      You've Selected
                    </Text>
                    <Divider borderColor="blue.400" />
                  </VStack>

                  <VStack
                    spacing={3}
                    bg="linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)"
                    p={6}
                    borderRadius="xl"
                    w="full"
                    shadow="xl"
                    backdropFilter="blur(10px)"
                    borderWidth={1}
                    borderColor="whiteAlpha.400"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCalendar} boxSize={6} color="blue.600" />
                      <Text fontSize="xl" fontWeight="bold" color="gray.800">
                        {format(parseISO(selectedTime.startTime), 'EEEE, MMMM d, yyyy')}
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiClock} boxSize={6} color="blue.600" />
                      <Text fontSize="xl" fontWeight="bold" color="gray.800">
                        {format(parseISO(selectedTime.startTime), 'h:mm a')} - {format(parseISO(selectedTime.endTime), 'h:mm a')}
                      </Text>
                    </HStack>
                    <HStack spacing={3} pt={2}>
                      <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                        {eventType.name}
                      </Badge>
                      {eventType.isPaid && (
                        <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                          {eventType.price} {eventType.currency}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>

                  <Button
                    colorScheme="whiteAlpha"
                    bg="white"
                    color="blue.600"
                    size="xl"
                    fontSize="xl"
                    fontWeight="bold"
                    px={12}
                    py={8}
                    h="auto"
                    onClick={handleBooking}
                    leftIcon={<Icon as={FiUser} boxSize={6} />}
                    _hover={{
                      bg: 'blue.50',
                      transform: 'scale(1.05)',
                      shadow: 'xl'
                    }}
                    transition="all 0.2s"
                  >
                    Continue to Book
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
        </Box>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default PublicBookingEventPage;
