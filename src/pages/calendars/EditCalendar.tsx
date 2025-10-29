import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Stack,
  Alert,
  AlertIcon,
  Box,
  HStack,
  Switch,
  Text,
  VStack,
  Divider,
  useToast,
  useBreakpointValue,
  FormHelperText,
  InputGroup,
  InputLeftAddon,
  Badge,
  Spinner,
  Center,
  useColorMode
} from '@chakra-ui/react';
import { ArrowBackIcon, CalendarIcon, CheckIcon } from '@chakra-ui/icons';
import { FiCopy } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getColor, brandConfig } from '../../brandConfig';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';

const GET_CALENDAR = gql`
  query GetCalendar($id: String!) {
    calendar(id: $id) {
      id
      name
      description
      type
      color
      responsibleOwnerId
      ownerType
      visibility
      isPublic
      linkedEmailAddressId
      companyId
      projectId
      settings {
        timezone
        defaultReminderMinutes
        workingHoursStart
        workingHoursEnd
        workingDays
      }
      isActive
      allowPublicBooking
      bookingPageSlug
      bookingPageTitle
      bookingPageDescription
      bookingPageLogo
      requirePaymentUpfront
      sendBookingConfirmations
      sendBookingReminders
    }
  }
`;

const UPDATE_CALENDAR = gql`
  mutation UpdateCalendar($id: String!, $input: BusinessCalendarInput!) {
    updateCalendar(id: $id, input: $input) {
      id
      name
      type
    }
  }
`;

const DELETE_CALENDAR = gql`
  mutation DeleteCalendar($id: String!) {
    deleteCalendar(id: $id)
  }
`;

const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
    }
  }
`;

const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      fName
      lName
      email
    }
  }
`;

const GET_ASSIGNED_EMAIL_ADDRESSES = gql`
  query GetAssignedEmailAddresses {
    emailAddresses {
      email
      name
      type
      associatedClients
    }
  }
`;

const EditCalendar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Brand styling variables
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'BUSINESS',
    color: '#4A90E2',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isShared: false,
    publicRead: false,
    publicWrite: false,
    requireAuth: true,
    allowedUsers: [],
    linkedCompanyId: '',
    linkedEmployeeId: '',
    defaultReminders: true,
    reminderMinutes: 15,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    emailAddress: '',
    allowPublicBooking: false,
    bookingPageSlug: '',
    bookingPageTitle: '',
    bookingPageDescription: '',
    bookingPageLogo: '',
    sendBookingConfirmations: true,
    sendBookingReminders: true
  });

  const { data: calendarData, loading: loadingCalendar } = useQuery(GET_CALENDAR, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      console.log('📥 ========== CALENDAR DATA LOADED ==========');
      console.log('📊 Raw calendar data from backend:', JSON.stringify(data, null, 2));

      if (data?.calendar) {
        const calendar = data.calendar;

        console.log('📅 Public booking fields from backend:');
        console.log('  - allowPublicBooking:', calendar.allowPublicBooking);
        console.log('  - bookingPageSlug:', calendar.bookingPageSlug);
        console.log('  - bookingPageTitle:', calendar.bookingPageTitle);
        console.log('  - bookingPageDescription:', calendar.bookingPageDescription);
        console.log('  - sendBookingConfirmations:', calendar.sendBookingConfirmations);
        console.log('  - sendBookingReminders:', calendar.sendBookingReminders);

        const newFormData = {
          name: calendar.name || '',
          description: calendar.description || '',
          type: calendar.type || 'BUSINESS',
          color: calendar.color || '#4A90E2',
          timezone: calendar.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          isShared: calendar.isPublic || false,
          publicRead: calendar.isPublic || false,
          publicWrite: false,
          requireAuth: true,
          allowedUsers: [],
          linkedCompanyId: '',
          linkedEmployeeId: '',
          defaultReminders: calendar.settings?.defaultReminderMinutes > 0,
          reminderMinutes: calendar.settings?.defaultReminderMinutes || 15,
          workingHoursStart: calendar.settings?.workingHoursStart || '09:00',
          workingHoursEnd: calendar.settings?.workingHoursEnd || '17:00',
          workingDays: calendar.settings?.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          emailAddress: calendar.emailAddress || '',
          allowPublicBooking: calendar.allowPublicBooking || false,
          bookingPageSlug: calendar.bookingPageSlug || '',
          bookingPageTitle: calendar.bookingPageTitle || '',
          bookingPageDescription: calendar.bookingPageDescription || '',
          bookingPageLogo: calendar.bookingPageLogo || '',
          sendBookingConfirmations: calendar.sendBookingConfirmations ?? true,
          sendBookingReminders: calendar.sendBookingReminders ?? true
        };

        console.log('📝 Setting form data:', JSON.stringify(newFormData, null, 2));
        setFormData(newFormData);
      }
    }
  });

  // Update page title
  usePageTitle(calendarData?.calendar?.name ? `Edit ${calendarData.calendar.name}` : 'Edit Calendar');

  const { data: companiesData } = useQuery(GET_COMPANIES);
  const { data: employeesData } = useQuery(GET_EMPLOYEES);
  const { data: emailAddressesData } = useQuery(GET_ASSIGNED_EMAIL_ADDRESSES);

  const [updateCalendar, { loading: updating }] = useMutation(UPDATE_CALENDAR, {
    onCompleted: (data) => {
      console.log('✅ ========== CALENDAR UPDATE SUCCEEDED ==========');
      console.log('📥 Response from backend:', JSON.stringify(data, null, 2));
      console.log('✅ Calendar updated successfully:', data.updateCalendar);

      toast({
        title: 'Calendar updated',
        description: `${data.updateCalendar.name} has been updated successfully`,
        status: 'success',
        duration: 3000
      });
      navigate(`/calendars/${data.updateCalendar.id}`);
    },
    onError: (error) => {
      console.error('❌ ========== CALENDAR UPDATE FAILED ==========');
      console.error('❌ GraphQL Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Network error:', error.networkError);
      console.error('❌ GraphQL errors:', error.graphQLErrors);

      toast({
        title: 'Error updating calendar',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [deleteCalendar, { loading: deleting }] = useMutation(DELETE_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'Calendar deleted',
        description: 'The calendar has been deleted successfully',
        status: 'success',
        duration: 3000
      });
      navigate('/calendars/my');
    },
    onError: (error) => {
      toast({
        title: 'Error deleting calendar',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 ========== CALENDAR UPDATE STARTED ==========');
    console.log('📋 Current form data:', JSON.stringify(formData, null, 2));

    const input: any = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      color: formData.color,
      emailAddress: formData.emailAddress || undefined
    };

    // Set settings object
    input.settings = {
      timezone: formData.timezone,
      defaultReminderMinutes: formData.defaultReminders ? formData.reminderMinutes : 0,
      workingHoursStart: formData.workingHoursStart,
      workingHoursEnd: formData.workingHoursEnd,
      workingDays: formData.workingDays
    };

    // Handle sharing settings
    if (formData.isShared) {
      input.isPublic = formData.publicRead;
    }

    // ✅ PUBLIC BOOKING FIELDS - These were missing!
    console.log('📅 Public Booking - allowPublicBooking:', formData.allowPublicBooking);
    console.log('📅 Public Booking - bookingPageSlug:', formData.bookingPageSlug);

    input.allowPublicBooking = formData.allowPublicBooking;

    if (formData.allowPublicBooking) {
      console.log('✅ Public booking is enabled, adding booking fields to input...');
      input.bookingPageSlug = formData.bookingPageSlug;
      input.bookingPageTitle = formData.bookingPageTitle || undefined;
      input.bookingPageDescription = formData.bookingPageDescription || undefined;
      input.bookingPageLogo = formData.bookingPageLogo || undefined;
      input.sendBookingConfirmations = formData.sendBookingConfirmations;
      input.sendBookingReminders = formData.sendBookingReminders;

      console.log('📝 Booking fields added:', {
        bookingPageSlug: input.bookingPageSlug,
        bookingPageTitle: input.bookingPageTitle,
        bookingPageDescription: input.bookingPageDescription,
        sendBookingConfirmations: input.sendBookingConfirmations,
        sendBookingReminders: input.sendBookingReminders
      });
    } else {
      console.log('❌ Public booking is disabled, clearing booking fields...');
      input.bookingPageSlug = null;
      input.bookingPageTitle = null;
      input.bookingPageDescription = null;
      input.bookingPageLogo = null;
    }

    console.log('📤 Final mutation input being sent to backend:', JSON.stringify(input, null, 2));
    console.log('🎯 Calendar ID:', id);

    updateCalendar({ variables: { id, input } });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleWorkingDaysChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const calendarTypeOptions = [
    { value: 'BUSINESS', label: 'Business Calendar' },
    { value: 'EMAIL', label: 'Email Integration' },
    { value: 'COMPANY', label: 'Company Calendar' },
    { value: 'EMPLOYEE', label: 'Employee Calendar' },
    { value: 'PROJECT', label: 'Project Calendar' },
    { value: 'TEAM', label: 'Team Calendar' }
  ];

  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      deleteCalendar({ variables: { id } });
    }
  };

  if (loadingCalendar) {
    return (
      <Box bg={bgMain} minH="100vh">
        <NavbarWithCallToAction />
        <Center h="50vh">
          <VStack>
            <Spinner size="xl" color={primaryColor} />
            <Text color={colorMode === 'light' ? "gray.900" : textPrimary}>Loading calendar...</Text>
          </VStack>
        </Center>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (!calendarData?.calendar) {
    return (
      <Box bg={bgMain} minH="100vh">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            Calendar not found
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />

      <Container maxW="container.lg" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header with Back Button */}
          <HStack justify="space-between" mb={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowBackIcon />}
                onClick={() => navigate('/calendars/my')}
                variant="ghost"
                color={primaryColor}
                _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
              >
                Back
              </Button>
              <Heading size="lg" color={colorMode === 'light' ? "gray.900" : textPrimary}>
                Edit Calendar
              </Heading>
            </HStack>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              <CalendarIcon mr={2} />
              {formData.type}
            </Badge>
          </HStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg={cardGradientBg}
            border="1px solid"
            borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
            borderRadius="xl"
            p={isMobile ? 4 : 8}
          >
            <Stack spacing={6}>
              {/* Basic Information */}
              <Box>
                <Heading size="md" color={colorMode === 'light' ? "gray.900" : textPrimary} mb={4}>
                  Basic Information
                </Heading>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Calendar Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter calendar name"
                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                      borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                      color={colorMode === 'light' ? "gray.900" : textPrimary}
                      _placeholder={{
                        color: colorMode === 'light' ? "gray.400" : "gray.500"
                      }}
                      _hover={{ borderColor: primaryColor }}
                      _focus={{
                        borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                        boxShadow: `0 0 0 1px ${colorMode === 'light' ? "#007AFF" : "#3B82F6"}`
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe this calendar"
                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                      borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                      color={colorMode === 'light' ? "gray.900" : textPrimary}
                      _placeholder={{
                        color: colorMode === 'light' ? "gray.400" : "gray.500"
                      }}
                      _hover={{ borderColor: primaryColor }}
                      _focus={{
                        borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                        boxShadow: `0 0 0 1px ${colorMode === 'light' ? "#007AFF" : "#3B82F6"}`
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Email Integration</FormLabel>
                    <Select
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="Select an email address to link"
                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                      borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                      color={colorMode === 'light' ? "gray.900" : textPrimary}
                      _hover={{ borderColor: primaryColor }}
                      _focus={{
                        borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                        boxShadow: `0 0 0 1px ${colorMode === 'light' ? "#007AFF" : "#3B82F6"}`
                      }}
                    >
                      <option value="">No email linked</option>
                      {emailAddressesData?.emailAddresses
                        ?.filter((addr: any) => addr.associatedClients?.length > 0)
                        ?.map((addr: any) => (
                          <option key={addr.email} value={addr.email}>
                            {addr.email} 
                            {addr.name && addr.name !== addr.email ? ` (${addr.name})` : ''}
                          </option>
                        ))}
                    </Select>
                    <FormHelperText color={textMuted}>
                      Calendar invites sent to this email will automatically appear in this calendar.
                      Only emails assigned to clients are available for linking.
                    </FormHelperText>
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Type</FormLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                        color={colorMode === 'light' ? "gray.900" : textPrimary}
                        _hover={{ borderColor: primaryColor }}
                      >
                        {calendarTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl flex={1}>
                      <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Color</FormLabel>
                      <Input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        h="38px"
                      />
                    </FormControl>
                  </HStack>
                </Stack>
              </Box>

              <Divider borderColor={colorMode === 'light' ? "gray.300" : cardBorder} />

              {/* Settings */}
              <Box>
                <Heading size="md" color={colorMode === 'light' ? "gray.900" : textPrimary} mb={4}>
                  Calendar Settings
                </Heading>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Timezone</FormLabel>
                    <Select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                      color={colorMode === 'light' ? "gray.900" : textPrimary}
                      _hover={{ borderColor: primaryColor }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Australia/Sydney">Sydney</option>
                      <option value="Australia/Brisbane">Brisbane</option>
                    </Select>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="defaultReminders"
                      isChecked={formData.defaultReminders}
                      onChange={(e) => handleSwitchChange('defaultReminders')(e.target.checked)}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="defaultReminders" mb={0} color={colorMode === 'light' ? "gray.900" : textPrimary}>
                      Enable default reminders
                    </FormLabel>
                  </FormControl>

                  {formData.defaultReminders && (
                    <FormControl>
                      <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Reminder Time</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          name="reminderMinutes"
                          value={formData.reminderMinutes}
                          onChange={handleChange}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                          color={colorMode === 'light' ? "gray.900" : textPrimary}
                          _hover={{ borderColor: primaryColor }}
                        />
                        <InputLeftAddon
                          bg="rgba(255, 255, 255, 0.1)"
                          borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                          color={textSecondary}
                        >
                          minutes before
                        </InputLeftAddon>
                      </InputGroup>
                    </FormControl>
                  )}

                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Working Hours Start</FormLabel>
                      <Input
                        type="time"
                        name="workingHoursStart"
                        value={formData.workingHoursStart}
                        onChange={handleChange}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                        color={colorMode === 'light' ? "gray.900" : textPrimary}
                        _hover={{ borderColor: primaryColor }}
                      />
                    </FormControl>

                    <FormControl flex={1}>
                      <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Working Hours End</FormLabel>
                      <Input
                        type="time"
                        name="workingHoursEnd"
                        value={formData.workingHoursEnd}
                        onChange={handleChange}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                        color={colorMode === 'light' ? "gray.900" : textPrimary}
                        _hover={{ borderColor: primaryColor }}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Working Days</FormLabel>
                    <HStack wrap="wrap" spacing={2}>
                      {weekDays.map(day => (
                        <Button
                          key={day}
                          size="sm"
                          variant={formData.workingDays.includes(day) ? 'solid' : 'outline'}
                          colorScheme={formData.workingDays.includes(day) ? 'blue' : 'gray'}
                          onClick={() => handleWorkingDaysChange(day)}
                          type="button"
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </HStack>
                  </FormControl>
                </Stack>
              </Box>

              <Divider borderColor={colorMode === 'light' ? "gray.300" : cardBorder} />

              {/* Sharing Settings */}
              <Box>
                <Heading size="md" color={colorMode === 'light' ? "gray.900" : textPrimary} mb={4}>
                  Sharing Settings
                </Heading>
                <Stack spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="isShared"
                      isChecked={formData.isShared}
                      onChange={(e) => handleSwitchChange('isShared')(e.target.checked)}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="isShared" mb={0} color={colorMode === 'light' ? "gray.900" : textPrimary}>
                      Make this calendar public
                    </FormLabel>
                  </FormControl>

                  {formData.isShared && (
                    <Alert status="info" bg="rgba(59, 130, 246, 0.1)" borderColor={infoBlue}>
                      <AlertIcon color={infoBlue} />
                      <Text color={colorMode === 'light' ? "gray.900" : textPrimary}>
                        Public calendars can be viewed by anyone with the link
                      </Text>
                    </Alert>
                  )}
                </Stack>
              </Box>

              <Divider borderColor={colorMode === 'light' ? "gray.300" : cardBorder} />

              {/* Public Booking Settings (Calendly-style) */}
              <Box>
                <Heading size="md" color={colorMode === 'light' ? "gray.900" : textPrimary} mb={4}>
                  📅 Public Booking Settings
                </Heading>
                <Stack spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="allowPublicBooking"
                      isChecked={formData.allowPublicBooking}
                      onChange={(e) => handleSwitchChange('allowPublicBooking')(e.target.checked)}
                      colorScheme="purple"
                      mr={3}
                    />
                    <FormLabel htmlFor="allowPublicBooking" mb={0} color={colorMode === 'light' ? "gray.900" : textPrimary}>
                      Allow Public Booking (Calendly-style)
                    </FormLabel>
                  </FormControl>

                  {formData.allowPublicBooking && (
                    <>
                      <Alert status="info" bg="rgba(147, 51, 234, 0.1)" borderColor="purple.500">
                        <AlertIcon color="purple.500" />
                        <Text color={colorMode === 'light' ? "gray.900" : textPrimary}>
                          Enable public booking to let visitors book time with you via a public URL
                        </Text>
                      </Alert>

                      <FormControl isRequired>
                        <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Booking Page Slug</FormLabel>
                        <InputGroup>
                          <InputLeftAddon
                            bg="rgba(255, 255, 255, 0.1)"
                            borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                            color={textSecondary}
                          >
                            /book/
                          </InputLeftAddon>
                          <Input
                            name="bookingPageSlug"
                            placeholder="your-name"
                            value={formData.bookingPageSlug || ''}
                            onChange={handleChange}
                            bg="rgba(255, 255, 255, 0.05)"
                            borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                            color={colorMode === 'light' ? "gray.900" : textPrimary}
                            _hover={{ borderColor: primaryColor }}
                          />
                        </InputGroup>
                        <FormHelperText color={textSecondary}>
                          Example: "john-smith" becomes /book/john-smith
                        </FormHelperText>
                      </FormControl>

                      {/* Copy Booking URL Button */}
                      {formData.bookingPageSlug && (
                        <Box>
                          <Button
                            leftIcon={<FiCopy />}
                            colorScheme="blue"
                            variant="outline"
                            size="md"
                            width="full"
                            onClick={() => {
                              const bookingUrl = `${window.location.origin}/book/${formData.bookingPageSlug}`;
                              navigator.clipboard.writeText(bookingUrl).then(() => {
                                toast({
                                  title: 'Booking URL copied!',
                                  description: `Copied: ${bookingUrl}`,
                                  status: 'success',
                                  duration: 3000,
                                  isClosable: true,
                                });
                              }).catch((err) => {
                                console.error('Failed to copy:', err);
                                toast({
                                  title: 'Failed to copy',
                                  description: 'Please try again',
                                  status: 'error',
                                  duration: 3000,
                                  isClosable: true,
                                });
                              });
                            }}
                          >
                            📋 Copy Booking URL
                          </Button>
                          <Text fontSize="xs" color={textSecondary} mt={2} textAlign="center">
                            {window.location.origin}/book/{formData.bookingPageSlug}
                          </Text>
                        </Box>
                      )}

                      <FormControl>
                        <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Booking Page Title</FormLabel>
                        <Input
                          name="bookingPageTitle"
                          placeholder="Book time with John Smith"
                          value={formData.bookingPageTitle || ''}
                          onChange={handleChange}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                          color={colorMode === 'light' ? "gray.900" : textPrimary}
                          _hover={{ borderColor: primaryColor }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={colorMode === 'light' ? "gray.900" : textPrimary}>Booking Page Description</FormLabel>
                        <Textarea
                          name="bookingPageDescription"
                          placeholder="Choose a time that works for you..."
                          value={formData.bookingPageDescription || ''}
                          onChange={handleChange}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                          color={colorMode === 'light' ? "gray.900" : textPrimary}
                          _hover={{ borderColor: primaryColor }}
                          rows={3}
                        />
                      </FormControl>

                      <HStack spacing={4}>
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="sendBookingConfirmations"
                            isChecked={formData.sendBookingConfirmations ?? true}
                            onChange={(e) => handleSwitchChange('sendBookingConfirmations')(e.target.checked)}
                            colorScheme="purple"
                            mr={3}
                          />
                          <FormLabel htmlFor="sendBookingConfirmations" mb={0} color={colorMode === 'light' ? "gray.900" : textPrimary}>
                            Send confirmation emails
                          </FormLabel>
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <Switch
                            id="sendBookingReminders"
                            isChecked={formData.sendBookingReminders ?? true}
                            onChange={(e) => handleSwitchChange('sendBookingReminders')(e.target.checked)}
                            colorScheme="purple"
                            mr={3}
                          />
                          <FormLabel htmlFor="sendBookingReminders" mb={0} color={colorMode === 'light' ? "gray.900" : textPrimary}>
                            Send reminder emails
                          </FormLabel>
                        </FormControl>
                      </HStack>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Action Buttons */}
              <HStack justify="space-between" pt={4}>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={handleDelete}
                  isLoading={deleting}
                  loadingText="Deleting..."
                >
                  Delete Calendar
                </Button>
                <HStack>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/calendars/${id}`)}
                    color={textSecondary}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    bg={primaryColor}
                    _hover={{ bg: primaryHover }}
                    isLoading={updating}
                    loadingText="Updating..."
                    leftIcon={<CheckIcon />}
                  >
                    Update Calendar
                  </Button>
                </HStack>
              </HStack>
            </Stack>
          </Box>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default EditCalendar;