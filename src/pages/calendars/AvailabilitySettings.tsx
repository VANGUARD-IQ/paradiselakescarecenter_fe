import React, { useState, useEffect } from 'react';
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
  IconButton,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useColorMode,
  Badge,
  Input,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import { getColor } from '../../brandConfig';

// GraphQL Queries and Mutations
const GET_CALENDAR_AVAILABILITY = gql`
  query CalendarAvailability($calendarId: String!) {
    calendarAvailability(calendarId: $calendarId) {
      id
      calendarId
      slots {
        dayOfWeek
        startTime
        endTime
      }
      blockedDates
      extraAvailableDates
      timezone
    }
  }
`;

const CREATE_AVAILABILITY = gql`
  mutation CreateBusinessCalendarAvailability($input: CreateBusinessCalendarAvailabilityInput!) {
    createBusinessCalendarAvailability(input: $input) {
      id
      calendarId
      slots {
        dayOfWeek
        startTime
        endTime
      }
      blockedDates
      timezone
    }
  }
`;

const UPDATE_AVAILABILITY = gql`
  mutation UpdateBusinessCalendarAvailability($calendarId: String!, $input: UpdateBusinessCalendarAvailabilityInput!) {
    updateBusinessCalendarAvailability(calendarId: $calendarId, input: $input) {
      id
      calendarId
      slots {
        dayOfWeek
        startTime
        endTime
      }
      blockedDates
      timezone
    }
  }
`;

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityData {
  slots: TimeSlot[];
  blockedDates: string[];
  timezone: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Pacific/Auckland',
];

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const AvailabilitySettings: React.FC = () => {
  const { id: calendarId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Brand styling
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor("text.muted", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);

  usePageTitle('Availability Settings');

  // State
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({
    slots: [],
    blockedDates: [],
    timezone: 'Australia/Sydney',
  });
  const [selectedDays, setSelectedDays] = useState<{ [key: number]: boolean }>({});
  const [dayTimeRanges, setDayTimeRanges] = useState<{ [key: number]: { start: string; end: string; }[] }>({});
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Queries and Mutations
  const { data, loading, error } = useQuery(GET_CALENDAR_AVAILABILITY, {
    variables: { calendarId },
    skip: !calendarId,
  });

  const [createAvailability, { loading: creating }] = useMutation(CREATE_AVAILABILITY, {
    onCompleted: () => {
      toast({
        title: 'Availability created',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (err) => {
      toast({
        title: 'Error creating availability',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [updateAvailability, { loading: updating }] = useMutation(UPDATE_AVAILABILITY, {
    onCompleted: () => {
      toast({
        title: 'Availability updated',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (err) => {
      toast({
        title: 'Error updating availability',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Load existing availability
  useEffect(() => {
    if (data?.calendarAvailability) {
      const availability = data.calendarAvailability;
      setAvailabilityData({
        slots: availability.slots || [],
        blockedDates: availability.blockedDates || [],
        timezone: availability.timezone || 'Australia/Sydney',
      });

      // Group slots by day
      const groupedSlots: { [key: number]: { start: string; end: string; }[] } = {};
      const days: { [key: number]: boolean } = {};

      (availability.slots || []).forEach((slot: TimeSlot) => {
        if (!groupedSlots[slot.dayOfWeek]) {
          groupedSlots[slot.dayOfWeek] = [];
        }
        groupedSlots[slot.dayOfWeek].push({
          start: slot.startTime,
          end: slot.endTime,
        });
        days[slot.dayOfWeek] = true;
      });

      setDayTimeRanges(groupedSlots);
      setSelectedDays(days);
    }
  }, [data]);

  // Toggle day selection
  const toggleDay = (dayOfWeek: number) => {
    setSelectedDays(prev => {
      const newSelected = { ...prev, [dayOfWeek]: !prev[dayOfWeek] };

      // If enabling a day, add default time range
      if (newSelected[dayOfWeek] && !dayTimeRanges[dayOfWeek]) {
        setDayTimeRanges(prevRanges => ({
          ...prevRanges,
          [dayOfWeek]: [{ start: '09:00', end: '17:00' }]
        }));
      }

      return newSelected;
    });
  };

  // Add time range to a day
  const addTimeRange = (dayOfWeek: number) => {
    setDayTimeRanges(prev => ({
      ...prev,
      [dayOfWeek]: [...(prev[dayOfWeek] || []), { start: '09:00', end: '17:00' }]
    }));
  };

  // Remove time range from a day
  const removeTimeRange = (dayOfWeek: number, index: number) => {
    setDayTimeRanges(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index)
    }));
  };

  // Update time range
  const updateTimeRange = (dayOfWeek: number, index: number, field: 'start' | 'end', value: string) => {
    setDayTimeRanges(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].map((range, i) =>
        i === index ? { ...range, [field]: value } : range
      )
    }));
  };

  // Add blocked date
  const addBlockedDate = () => {
    if (!newBlockedDate) return;

    if (!availabilityData.blockedDates.includes(newBlockedDate)) {
      setAvailabilityData(prev => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDate]
      }));
      setNewBlockedDate('');
    }
  };

  // Remove blocked date
  const removeBlockedDate = (date: string) => {
    setAvailabilityData(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter(d => d !== date)
    }));
  };

  // Save availability
  const handleSave = async () => {
    // Build slots array from dayTimeRanges
    const slots: TimeSlot[] = [];
    Object.entries(dayTimeRanges).forEach(([day, ranges]) => {
      const dayOfWeek = parseInt(day);
      if (selectedDays[dayOfWeek]) {
        ranges.forEach(range => {
          slots.push({
            dayOfWeek,
            startTime: range.start,
            endTime: range.end,
          });
        });
      }
    });

    const input = {
      slots,
      blockedDates: availabilityData.blockedDates.map(date => new Date(date)),
      timezone: availabilityData.timezone,
    };

    if (data?.calendarAvailability) {
      // Update existing
      await updateAvailability({
        variables: { calendarId, input },
      });
    } else {
      // Create new
      await createAvailability({
        variables: { input: { ...input, calendarId } },
      });
    }
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh">
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading availability...</Text>
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
            <Text color={textPrimary}>Error loading availability: {error.message}</Text>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

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
                aria-label="Back to event types"
                icon={<ArrowBackIcon />}
                onClick={() => navigate(`/calendars/${calendarId}/event-types`)}
                bg={cardGradientBg}
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{ bg: primaryHover }}
              />
              <Box>
                <Heading size="lg" color={textPrimary}>Availability Settings</Heading>
                <Text color={textSecondary}>Define when you're available for bookings</Text>
              </Box>
            </HStack>
            <Button
              bg={primaryColor}
              color="white"
              onClick={handleSave}
              isLoading={creating || updating}
              _hover={{ bg: primaryHover }}
            >
              Save Availability
            </Button>
          </HStack>

          {/* Timezone Selector */}
          <Card bg={cardGradientBg} borderColor={cardBorder}>
            <CardHeader>
              <Heading size="md" color={textPrimary}>Timezone</Heading>
            </CardHeader>
            <CardBody>
              <FormControl>
                <FormLabel color={textPrimary}>Your Timezone</FormLabel>
                <Select
                  value={availabilityData.timezone}
                  onChange={(e) => setAvailabilityData({ ...availabilityData, timezone: e.target.value })}
                  color={textPrimary}
                  bg="rgba(255,255,255,0.05)"
                  borderColor={cardBorder}
                >
                  {COMMON_TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </Select>
                <Text fontSize="sm" color={textMuted} mt={2}>
                  All availability times are in this timezone
                </Text>
              </FormControl>
            </CardBody>
          </Card>

          {/* Weekly Schedule */}
          <Card bg={cardGradientBg} borderColor={cardBorder}>
            <CardHeader>
              <Heading size="md" color={textPrimary}>Weekly Schedule</Heading>
              <Text fontSize="sm" color={textSecondary}>Select days and set your available hours</Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {DAYS_OF_WEEK.map(day => (
                  <Box key={day.value}>
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Switch
                          isChecked={selectedDays[day.value] || false}
                          onChange={() => toggleDay(day.value)}
                          colorScheme="green"
                        />
                        <Text fontWeight="bold" color={textPrimary} minW="100px">
                          {day.label}
                        </Text>
                      </HStack>
                      {selectedDays[day.value] && (
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          onClick={() => addTimeRange(day.value)}
                          variant="ghost"
                          colorScheme="blue"
                        >
                          Add Time Range
                        </Button>
                      )}
                    </HStack>

                    {selectedDays[day.value] && dayTimeRanges[day.value] && (
                      <VStack spacing={2} pl={10} align="stretch">
                        {dayTimeRanges[day.value].map((range, index) => (
                          <HStack key={index}>
                            <Select
                              value={range.start}
                              onChange={(e) => updateTimeRange(day.value, index, 'start', e.target.value)}
                              size="sm"
                              color={textPrimary}
                              bg="rgba(255,255,255,0.05)"
                              maxW="150px"
                            >
                              {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </Select>
                            <Text color={textSecondary}>to</Text>
                            <Select
                              value={range.end}
                              onChange={(e) => updateTimeRange(day.value, index, 'end', e.target.value)}
                              size="sm"
                              color={textPrimary}
                              bg="rgba(255,255,255,0.05)"
                              maxW="150px"
                            >
                              {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </Select>
                            <IconButton
                              aria-label="Remove time range"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeTimeRange(day.value, index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    )}

                    {day.value < 6 && <Divider mt={4} />}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Blocked Dates */}
          <Card bg={cardGradientBg} borderColor={cardBorder}>
            <CardHeader>
              <Heading size="md" color={textPrimary}>Blocked Dates</Heading>
              <Text fontSize="sm" color={textSecondary}>Add dates when you're not available (holidays, vacations)</Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    color={textPrimary}
                    bg="rgba(255,255,255,0.05)"
                    borderColor={cardBorder}
                  />
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={addBlockedDate}
                    colorScheme="red"
                    variant="outline"
                  >
                    Block Date
                  </Button>
                </HStack>

                {availabilityData.blockedDates.length === 0 && (
                  <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="md" textAlign="center">
                    <Text fontSize="sm" color={textMuted}>
                      No blocked dates. Add holidays or vacation days here.
                    </Text>
                  </Box>
                )}

                {availabilityData.blockedDates.length > 0 && (
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                    {availabilityData.blockedDates.map(date => (
                      <HStack key={date} justify="space-between" p={2} bg="rgba(255,0,0,0.1)" borderRadius="md">
                        <Badge colorScheme="red">{new Date(date).toLocaleDateString()}</Badge>
                        <IconButton
                          aria-label="Remove blocked date"
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeBlockedDate(date)}
                        />
                      </HStack>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Setup Buttons */}
          <Card bg={cardGradientBg} borderColor={cardBorder}>
            <CardHeader>
              <Heading size="md" color={textPrimary}>Quick Setup</Heading>
            </CardHeader>
            <CardBody>
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  size="sm"
                  onClick={() => {
                    // Set Mon-Fri 9am-5pm
                    const newSelected: { [key: number]: boolean } = {};
                    const newRanges: { [key: number]: { start: string; end: string; }[] } = {};
                    [1, 2, 3, 4, 5].forEach(day => {
                      newSelected[day] = true;
                      newRanges[day] = [{ start: '09:00', end: '17:00' }];
                    });
                    setSelectedDays(newSelected);
                    setDayTimeRanges(newRanges);
                  }}
                  colorScheme="blue"
                  variant="outline"
                >
                  Mon-Fri 9am-5pm
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Set Mon-Fri 9am-12pm, 1pm-5pm
                    const newSelected: { [key: number]: boolean } = {};
                    const newRanges: { [key: number]: { start: string; end: string; }[] } = {};
                    [1, 2, 3, 4, 5].forEach(day => {
                      newSelected[day] = true;
                      newRanges[day] = [
                        { start: '09:00', end: '12:00' },
                        { start: '13:00', end: '17:00' }
                      ];
                    });
                    setSelectedDays(newSelected);
                    setDayTimeRanges(newRanges);
                  }}
                  colorScheme="green"
                  variant="outline"
                >
                  Mon-Fri 9am-5pm (w/ lunch)
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDays({});
                    setDayTimeRanges({});
                  }}
                  colorScheme="red"
                  variant="outline"
                >
                  Clear All
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default AvailabilitySettings;
