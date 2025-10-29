import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  Container,
  Heading,
  Button,
  Stack,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Text,
  Spinner,
  useToast,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Checkbox,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  CalendarIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronDownIcon,
  DownloadIcon,
  LinkIcon,
  BellIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import EventModal from './EventModal';
import { brandConfig } from '../../brandConfig';
import { getColor } from '../../brandConfig';
import { TagManager } from './components/TagManager';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from './moduleConfig';

const GET_CALENDAR = gql`
  query GetCalendar($id: String!) {
    calendar(id: $id) {
      id
      name
      description
      type
      color
      responsibleOwnerId
      visibility
      isPublic
      publicUrl
      linkedEmailAddressId
      settings {
        timezone
        emailNotifications
        smsNotifications
        defaultReminderMinutes
        workingHoursStart
        workingHoursEnd
        workingDays
      }
      totalEvents
      upcomingEvents
      lastEventAt
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_CALENDAR_EVENTS = gql`
  query GetCalendarEvents($calendarId: String!, $startDate: String, $endDate: String) {
    calendarEvents(calendarId: $calendarId, startDate: $startDate, endDate: $endDate) {
      id
      calendarId
      title
      description
      startTime
      endTime
      isAllDay
      status
      color
      location {
        name
        address
        latitude
        longitude
        room
        floor
        instructions
      }
      recurrence {
        frequency
        interval
        count
        until
        byDay
        byMonth
        byMonthDay
        rruleString
      }
      attendees {
        clientId
        email
        name
        status
      }
      reminders {
        method
        minutesBefore
      }
      isCancelled
      cancellationReason
      metadata
    }
  }
`;

const CANCEL_EVENT = gql`
  mutation CancelEvent($id: String!, $reason: String) {
    cancelEvent(id: $id, reason: $reason)
  }
`;

const EXPORT_CALENDAR = gql`
  mutation ExportCalendar($calendarId: String!) {
    exportCalendar(calendarId: $calendarId) {
      fileName
      icalData
    }
  }
`;

const DELETE_CALENDAR = gql`
  mutation DeleteCalendar($id: String!) {
    deleteCalendar(id: $id)
  }
`;

const SHARE_CALENDAR = gql`
  mutation ShareCalendar($id: String!, $sharedWithEmail: String!, $permissions: [CalendarPermission!]!) {
    shareCalendar(id: $id, sharedWithEmail: $sharedWithEmail, permissions: $permissions) {
      id
      calendarName
      invitationType
      recipientEmail
      recipientPhone
      shareLink
      notificationSent
      status
      permissions
      expiresAt
    }
  }
`;

const CalendarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Brand styling variables - comprehensive from checklist
  const bgMain = getColor('background.main', colorMode);
  const cardGradientBg = getColor('background.cardGradient', colorMode);
  const cardBorder = getColor('border.darkCard', colorMode);
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const textMuted = getColor(colorMode === 'light' ? 'text.muted' : 'text.mutedDark', colorMode);
  const primaryColor = getColor('primary', colorMode);
  const primaryHover = getColor('primaryHover', colorMode);
  const successGreen = getColor('successGreen', colorMode);
  const errorRed = getColor('status.error', colorMode);
  const infoBlue = getColor('status.info', colorMode);
  const warningColor = getColor('status.warning', colorMode);
  const purpleAccent = getColor('purpleAccent', colorMode);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermissions, setSharePermissions] = useState(['VIEW']);
  const [dateRange] = useState({
    // Fetch events from 6 months ago to 1 year in the future
    start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
  });

  // Add detailed logging
  useEffect(() => {
    console.log('📅 CalendarDetails - Calendar ID from URL:', id);
    console.log('👤 Current user:', user);
    console.log('🏢 Tenant ID from localStorage:', localStorage.getItem('tenantId'));
    console.log('🔑 Auth token exists:', !!localStorage.getItem('authToken'));
  }, [id, user]);

  const { loading, error, data, refetch } = useQuery(GET_CALENDAR, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      console.log('✅ Calendar query completed:', data);
      if (data?.calendar) {
        console.log('📊 Calendar found:', {
          name: data.calendar.name,
          id: data.calendar.id,
          type: data.calendar.type,
          responsibleOwnerId: data.calendar.responsibleOwnerId,
          totalEvents: data.calendar.totalEvents
        });
      } else {
        console.warn('⚠️ Query succeeded but no calendar in response');
      }
    },
    onError: (error) => {
      console.error('❌ Calendar query error:', error);
      console.error('Error details:', {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors
      });
    },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Update page title
  usePageTitle(data?.calendar?.name ? `${data.calendar.name} - Settings` : 'Calendar Settings');

  const { data: eventsData, refetch: refetchEvents, loading: eventsLoading, error: eventsError } = useQuery(GET_CALENDAR_EVENTS, {
    variables: {
      calendarId: id,
      startDate: dateRange.start,
      endDate: dateRange.end
    },
    skip: !id,
    onCompleted: (data) => {
      console.log('✅ Calendar events query completed:', data);
      if (data?.calendarEvents) {
        console.log('📊 Events found:', data.calendarEvents.length);
        console.log('📅 Events data:', data.calendarEvents);
      } else {
        console.warn('⚠️ No calendarEvents in response');
      }
    },
    onError: (error) => {
      console.error('❌ Calendar events query error:', error);
    },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  const [deleteCalendar] = useMutation(DELETE_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'Calendar deleted successfully',
        status: 'success',
        duration: 3000
      });
      navigate('/calendars');
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete calendar',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [cancelEvent, { loading: cancellingEvent }] = useMutation(CANCEL_EVENT, {
    onCompleted: () => {
      toast({
        title: 'Event deleted successfully',
        status: 'success',
        duration: 3000
      });
      refetchEvents();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete event',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [shareCalendar, { loading: sharing }] = useMutation(SHARE_CALENDAR, {
    onCompleted: (data) => {
      const invitation = data.shareCalendar;
      const method = invitation.invitationType === 'SMS' ? 'SMS' : 'EMAIL';
      const recipient = invitation.recipientPhone || invitation.recipientEmail;
      
      toast({
        title: invitation.notificationSent ? 'Invitation sent! 🎉' : 'Invitation created',
        description: invitation.notificationSent 
          ? `${method} sent to ${recipient}` 
          : `Invitation created for ${recipient} (notification pending)`,
        status: 'success',
        duration: 4000
      });
      
      setShareEmail('');
      setSharePermissions(['VIEW']);
      refetch(); // Refresh calendar data to show new shares
    },
    onError: (error) => {
      const isPhone = !shareEmail.includes('@');
      toast({
        title: 'Failed to send invitation',
        description: error.message || `Could not send ${isPhone ? 'SMS' : 'email'}`,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [exportCalendar] = useMutation(EXPORT_CALENDAR, {
    onCompleted: (data) => {
      const blob = new Blob([data.exportCalendar.icalData], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.exportCalendar.fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Calendar exported',
        description: 'Your calendar has been downloaded as an .ics file',
        status: 'success',
        duration: 3000
      });
    }
  });

  useEffect(() => {
    if (id) {
      refetch();
      refetchEvents();
    }
  }, [id, refetch, refetchEvents]);

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || 
           user?.permissions?.includes('ADMIN') || 
           user?.permissions?.includes('TENANT_ADMIN');
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleDeleteCalendar = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this calendar? This will delete all events and cannot be undone.');
    if (confirmed) {
      try {
        await deleteCalendar({
          variables: { id }
        });
      } catch (error) {
        console.error('Error deleting calendar:', error);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (confirmed) {
      try {
        await cancelEvent({ 
          variables: { 
            id: eventId,
            reason: 'Deleted by user'
          } 
        });
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleExport = () => {
    exportCalendar({ variables: { calendarId: id } });
  };

  const handleShareCalendar = () => {
    if (!shareEmail) {
      toast({
        title: 'Recipient required',
        description: 'Please enter an email or phone number',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    // Validate if it's email or phone
    const isEmail = shareEmail.includes('@');
    const isPhone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(shareEmail.replace(/\s/g, ''));
    
    if (!isEmail && !isPhone) {
      toast({
        title: 'Invalid format',
        description: 'Please enter a valid email address or phone number',
        status: 'error',
        duration: 3000
      });
      return;
    }

    // Show sending message
    const method = isPhone ? 'SMS' : 'email';
    toast({
      title: `Sending invitation via ${method}...`,
      status: 'info',
      duration: 2000
    });

    shareCalendar({
      variables: {
        id,
        sharedWithEmail: shareEmail,
        permissions: sharePermissions
      }
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return successGreen;
      case 'TENTATIVE': return warningColor;
      case 'CANCELLED': return errorRed;
      default: return textSecondary;
    }
  };

  const formatEventTime = (start: string, end: string, isAllDay: boolean) => {
    if (isAllDay) return 'All Day';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Stack align="center" justify="center" minH="200px">
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading calendar...</Text>
          </Stack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.calendar) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Alert 
            status="error"
            bg="rgba(239, 68, 68, 0.1)"
            borderColor="rgba(239, 68, 68, 0.3)"
            border="1px solid"
            borderRadius="md"
          >
            <AlertIcon color={errorRed} />
            <Text color={textPrimary}>
              {error ? `Error loading calendar: ${error.message}` : 'Calendar not found'}
            </Text>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const calendar = data.calendar;
  const events = eventsData?.calendarEvents || [];
  
  // Debug logging
  console.log('📊 Raw eventsData object:', eventsData);
  console.log('📆 Events array extracted:', events);
  console.log('📅 Date range being used:', dateRange);
  console.log('🔍 Events loading state:', eventsLoading);
  console.log('❌ Events error state:', eventsError);
  console.log('📋 Calendar totalEvents:', calendar.totalEvents);
  console.log('🆔 Calendar ID:', id);

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />

      <Container maxW="container.xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          
          {/* Header Section */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardHeader>
              <HStack justify="space-between" align="center" flexWrap="wrap">
                <VStack align="start" spacing={3}>
                  <Heading 
                    size="lg"
                    color={textPrimary}
                    fontFamily={brandConfig.fonts.heading}
                  >
                    <HStack spacing={3}>
                      <CalendarIcon color={primaryColor} boxSize={6} />
                      <Text>{calendar.name}</Text>
                    </HStack>
                  </Heading>
                  
                  <HStack spacing={2}>
                    <Badge 
                      bg={calendar.type === 'BUSINESS' ? "rgba(59, 130, 246, 0.2)" : "rgba(139, 92, 246, 0.2)"}
                      color={calendar.type === 'BUSINESS' ? primaryColor : purpleAccent}
                      border="1px solid"
                      borderColor={calendar.type === 'BUSINESS' ? "rgba(59, 130, 246, 0.3)" : "rgba(139, 92, 246, 0.3)"}
                      px={3}
                      py={1}
                      borderRadius="md"
                    >
                      {calendar.type}
                    </Badge>
                    <Badge
                      bg={calendar.isPublic ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                      color={calendar.isPublic ? successGreen : textSecondary}
                      border="1px solid"
                      borderColor={calendar.isPublic ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                      px={3}
                      py={1}
                      borderRadius="md"
                    >
                      {calendar.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </HStack>
                  
                  {calendar.description && (
                    <Text color={textSecondary} fontFamily={brandConfig.fonts.body}>
                      {calendar.description}
                    </Text>
                  )}
                </VStack>
                
                <HStack spacing={3}>
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="outline"
                    onClick={() => navigate('/calendars')}
                    borderColor={primaryColor}
                    color={primaryColor}
                    _hover={{ 
                      bg: "rgba(59, 130, 246, 0.1)",
                      transform: "translateY(-2px)"
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                  >
                    Back
                  </Button>
                  
                  <Button
                    leftIcon={<CalendarIcon />}
                    bg={primaryColor}
                    color="white"
                    _hover={{ 
                      bg: primaryHover,
                      transform: "translateY(-2px)"
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    onClick={() => {
                      // Open in week view with 24 hours by default
                      const today = new Date().toISOString().split('T')[0];
                      window.open(`/calendars/${id}/view?view=timeGridWeek&date=${today}&hours=24`, '_blank');
                    }}
                  >
                    View Calendar
                  </Button>
                  
                  <Menu isLazy placement="bottom-end">
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      variant="outline"
                      borderColor={primaryColor}
                      color={primaryColor}
                      _hover={{ 
                        bg: "rgba(59, 130, 246, 0.1)",
                        transform: "translateY(-2px)"
                      }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.2s"
                      fontWeight="semibold"
                    >
                      Actions
                    </MenuButton>
                    <Portal>
                      <MenuList 
                        bg="rgba(26, 32, 44, 0.98)"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
                        zIndex={9999}
                      >
                        <MenuItem 
                        icon={<EditIcon color="white" />} 
                        onClick={() => navigate(`/calendars/${id}/edit`)}
                        color="white"
                        bg="transparent"
                        _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                      >
                        Edit Calendar
                      </MenuItem>
                      <MenuItem 
                        icon={<DownloadIcon color="white" />} 
                        onClick={handleExport}
                        color="white"
                        bg="transparent"
                        _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                      >
                        Export Calendar
                      </MenuItem>
                      <MenuItem 
                        icon={<LinkIcon color="white" />}
                        onClick={() => setActiveTab(2)}
                        color="white"
                        bg="transparent"
                        _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                      >
                        Share Calendar
                      </MenuItem>
                      <MenuItem 
                        icon={<DeleteIcon />}
                        color="red.400"
                        bg="transparent"
                        _hover={{ bg: "rgba(239, 68, 68, 0.2)" }}
                        onClick={handleDeleteCalendar}
                      >
                        Delete Calendar
                      </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </HStack>
              </HStack>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {[
              { label: 'Total Events', value: calendar.totalEvents || 0 },
              { label: 'Upcoming', value: calendar.upcomingEvents || 0 },
              { label: 'Timezone', value: calendar.settings?.timezone || 'UTC' },
              { label: 'Working Hours', value: `${calendar.settings?.workingHoursStart || '09:00'} - ${calendar.settings?.workingHoursEnd || '17:00'}` }
            ].map((stat) => (
              <Card
                key={stat.label}
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 4px 16px 0 rgba(0, 0, 0, 0.2)"
                border="1px solid"
                borderColor={cardBorder}
                borderRadius="lg"
                p={4}
                position="relative"
                zIndex={1}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                <Stat>
                  <StatLabel color={textSecondary} fontSize="sm">{stat.label}</StatLabel>
                  <StatNumber color={textPrimary} fontSize="xl">{stat.value}</StatNumber>
                </Stat>
              </Card>
            ))}
          </SimpleGrid>

          {/* Main Content Tabs */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <Tabs variant="soft-rounded" colorScheme="brand" index={activeTab} onChange={setActiveTab}>
                <TabList mb={4}>
                  <Tab
                    _selected={{ 
                      bg: primaryColor, 
                      color: 'white' 
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)"
                    }}
                    color={textSecondary}
                  >
                    Events
                  </Tab>
                  <Tab
                    _selected={{ 
                      bg: primaryColor, 
                      color: 'white' 
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)"
                    }}
                    color={textSecondary}
                  >
                    Settings
                  </Tab>
                  <Tab
                    _selected={{
                      bg: primaryColor,
                      color: 'white'
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)"
                    }}
                    color={textSecondary}
                  >
                    Sharing
                  </Tab>
                  {/* Email Integration Tab - DISABLED: emailAddress and acceptedEmailAddresses fields not in schema */}
                  {/* <Tab
                    _selected={{
                      bg: primaryColor,
                      color: 'white'
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)"
                    }}
                    color={textSecondary}
                  >
                    Email Integration
                  </Tab> */}
                </TabList>

                <TabPanels>
                  {/* Events Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                          Calendar Events
                        </Text>
                        {hasPermission('CALENDAR_MANAGER') && (
                          <Button
                            leftIcon={<AddIcon />}
                            size="md"
                            onClick={() => {
                              setSelectedEvent(null);
                              onOpen();
                            }}
                            bg={primaryColor}
                            color="white"
                            _hover={{ 
                              bg: primaryHover,
                              transform: "translateY(-2px)"
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                            fontWeight="semibold"
                          >
                            Add Event
                          </Button>
                        )}
                      </HStack>

                      {events.length > 0 ? (
                        <Box 
                          overflowX="auto"
                          bg="rgba(255, 255, 255, 0.02)"
                          borderRadius="md"
                          border="1px solid"
                          borderColor={cardBorder}
                        >
                          <Table variant="simple" size="md">
                            <Thead>
                              <Tr>
                                <Th color={textMuted} borderColor={cardBorder}>Title</Th>
                                <Th color={textMuted} borderColor={cardBorder}>Date</Th>
                                <Th color={textMuted} borderColor={cardBorder}>Time</Th>
                                <Th color={textMuted} borderColor={cardBorder}>Status</Th>
                                <Th color={textMuted} borderColor={cardBorder}>Actions</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {events.map((event: any) => (
                                <Tr key={event.id} opacity={event.isCancelled ? 0.5 : 1}>
                                  <Td color={textPrimary} borderColor={cardBorder}>
                                    <Text 
                                      textDecoration={event.isCancelled ? "line-through" : "none"}
                                      cursor="pointer"
                                      _hover={{ color: primaryColor, textDecoration: "underline" }}
                                      onClick={() => {
                                        console.log('📅 Event clicked:', {
                                          id: event.id,
                                          title: event.title,
                                          calendarId: event.calendarId,
                                          startTime: event.startTime,
                                          endTime: event.endTime,
                                          fullEvent: event
                                        });
                                        // Also copy ID to clipboard for convenience
                                        navigator.clipboard.writeText(event.id).then(() => {
                                          toast({
                                            title: 'Event ID copied!',
                                            description: `ID: ${event.id}`,
                                            status: 'info',
                                            duration: 2000,
                                            position: 'bottom-right'
                                          });
                                        });
                                      }}
                                    >
                                      {event.title}
                                    </Text>
                                  </Td>
                                  <Td color={textSecondary} borderColor={cardBorder}>
                                    {formatEventDate(event.startTime)}
                                  </Td>
                                  <Td color={textSecondary} borderColor={cardBorder}>
                                    {formatEventTime(event.startTime, event.endTime, event.isAllDay)}
                                  </Td>
                                  <Td borderColor={cardBorder}>
                                    <Badge
                                      bg={`${getEventStatusColor(event.status)}20`}
                                      color={getEventStatusColor(event.status)}
                                      border="1px solid"
                                      borderColor={`${getEventStatusColor(event.status)}30`}
                                    >
                                      {event.status}
                                    </Badge>
                                  </Td>
                                  <Td borderColor={cardBorder}>
                                    <HStack spacing={2}>
                                      <Tooltip label="View in calendar" placement="top">
                                        <IconButton
                                          aria-label="View in calendar"
                                          icon={<CalendarIcon />}
                                          size="sm"
                                          bg="rgba(255, 255, 255, 0.1)"
                                          color={primaryColor}
                                          _hover={{ bg: "rgba(59, 130, 246, 0.2)" }}
                                          onClick={() => {
                      // Open in week view with 24 hours by default
                      const today = new Date().toISOString().split('T')[0];
                      window.open(`/calendars/${id}/view?view=timeGridWeek&date=${today}&hours=24`, '_blank');
                    }}
                                        />
                                      </Tooltip>
                                      <IconButton
                                        aria-label="Edit event"
                                        icon={<EditIcon />}
                                        size="sm"
                                        bg="rgba(255, 255, 255, 0.1)"
                                        color={primaryColor}
                                        _hover={{ bg: "rgba(59, 130, 246, 0.2)" }}
                                        onClick={() => handleEditEvent(event)}
                                      />
                                      <IconButton
                                        aria-label="Delete event"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        bg="rgba(255, 255, 255, 0.1)"
                                        color={errorRed}
                                        _hover={{ bg: "rgba(239, 68, 68, 0.2)" }}
                                        onClick={() => handleDeleteEvent(event.id)}
                                        isLoading={cancellingEvent}
                                        isDisabled={event.isCancelled}
                                      />
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      ) : (
                        <Alert 
                          status="info"
                          bg="rgba(59, 130, 246, 0.1)"
                          borderColor="rgba(59, 130, 246, 0.3)"
                          border="1px solid"
                          borderRadius="md"
                        >
                          <AlertIcon color={infoBlue} />
                          <VStack align="start" spacing={2}>
                            <Text color={textPrimary}>No events scheduled</Text>
                            <Text color={textSecondary} fontSize="sm">
                              Create your first event to get started
                            </Text>
                          </VStack>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Settings Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        Calendar Settings
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textSecondary}>
                            Default Reminders
                          </Text>
                          {calendar.settings?.defaultReminderMinutes ? (
                            <HStack>
                              <BellIcon color={primaryColor} />
                              <Text color={textPrimary}>
                                {calendar.settings.defaultReminderMinutes} minutes before
                              </Text>
                            </HStack>
                          ) : (
                            <Text color={textMuted}>No default reminders set</Text>
                          )}
                        </Box>
                        
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textSecondary}>
                            Email Notifications
                          </Text>
                          <Badge
                            bg={calendar.settings?.emailNotifications ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                            color={calendar.settings?.emailNotifications ? successGreen : textMuted}
                            border="1px solid"
                            borderColor={calendar.settings?.emailNotifications ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                          >
                            {calendar.settings?.emailNotifications ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textSecondary}>
                            SMS Notifications
                          </Text>
                          <Badge
                            bg={calendar.settings?.smsNotifications ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                            color={calendar.settings?.smsNotifications ? successGreen : textMuted}
                            border="1px solid"
                            borderColor={calendar.settings?.smsNotifications ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                          >
                            {calendar.settings?.smsNotifications ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      {/* Tag Management Section */}
                      <Box
                        mt={6}
                        p={4}
                        bg="rgba(255, 255, 255, 0.03)"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={cardBorder}
                      >
                        <TagManager calendarId={id || ''} />
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Sharing Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Share New User Section */}
                      <Box
                        p={6}
                        bg="rgba(255, 255, 255, 0.03)"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={cardBorder}
                      >
                        <Heading size="md" color={textPrimary} mb={4}>
                          Share Calendar
                        </Heading>
                        
                        <VStack spacing={4}>
                          <FormControl>
                            <FormLabel color={textSecondary}>Email Address</FormLabel>
                            <Input
                              placeholder="Enter email to share with"
                              value={shareEmail}
                              onChange={(e) => setShareEmail(e.target.value)}
                              bg="rgba(255, 255, 255, 0.05)"
                              borderColor={cardBorder}
                              color={textPrimary}
                              _hover={{ borderColor: primaryColor }}
                              _focus={{
                                borderColor: primaryColor,
                                boxShadow: `0 0 0 1px ${primaryColor}`
                              }}
                            />
                            <FormHelperText color={textMuted}>
                              Enter the email address of the person you want to share this calendar with
                            </FormHelperText>
                          </FormControl>

                          <FormControl>
                            <FormLabel color={textSecondary}>Permissions</FormLabel>
                            <Stack spacing={3}>
                              <Checkbox
                                isChecked={sharePermissions.includes('VIEW')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSharePermissions([...sharePermissions, 'VIEW']);
                                  } else {
                                    setSharePermissions(sharePermissions.filter(p => p !== 'VIEW'));
                                  }
                                }}
                                colorScheme="blue"
                              >
                                <Text color={textPrimary}>View Events</Text>
                              </Checkbox>
                              <Checkbox
                                isChecked={sharePermissions.includes('CREATE')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSharePermissions([...sharePermissions, 'CREATE']);
                                  } else {
                                    setSharePermissions(sharePermissions.filter(p => p !== 'CREATE'));
                                  }
                                }}
                                colorScheme="blue"
                              >
                                <Text color={textPrimary}>Create Events</Text>
                              </Checkbox>
                              <Checkbox
                                isChecked={sharePermissions.includes('EDIT')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSharePermissions([...sharePermissions, 'EDIT']);
                                  } else {
                                    setSharePermissions(sharePermissions.filter(p => p !== 'EDIT'));
                                  }
                                }}
                                colorScheme="blue"
                              >
                                <Text color={textPrimary}>Edit Events</Text>
                              </Checkbox>
                              <Checkbox
                                isChecked={sharePermissions.includes('DELETE')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSharePermissions([...sharePermissions, 'DELETE']);
                                  } else {
                                    setSharePermissions(sharePermissions.filter(p => p !== 'DELETE'));
                                  }
                                }}
                                colorScheme="blue"
                              >
                                <Text color={textPrimary}>Delete Events</Text>
                              </Checkbox>
                            </Stack>
                          </FormControl>

                          <Button
                            leftIcon={<LinkIcon />}
                            bg={primaryColor}
                            color="white"
                            _hover={{ bg: primaryHover }}
                            onClick={handleShareCalendar}
                            isLoading={sharing}
                            loadingText="Sharing..."
                            width="full"
                          >
                            Share Calendar
                          </Button>
                        </VStack>
                      </Box>

                      {/* Current Shares Section - DISABLED: shares field not in schema */}

                      {/* Public Access Section */}
                      <Box>
                        <Heading size="md" color={textPrimary} mb={4}>
                          Public Access
                        </Heading>
                        <HStack spacing={4}>
                          <Badge
                            bg={calendar.isPublic ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                            color={calendar.isPublic ? successGreen : textMuted}
                            border="1px solid"
                            borderColor={calendar.isPublic ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                            px={3}
                            py={1}
                          >
                            {calendar.isPublic ? 'Public Calendar' : 'Private Calendar'}
                          </Badge>
                          {calendar.publicUrl && (
                            <Text color={textSecondary} fontSize="sm">
                              Public URL: {calendar.publicUrl}
                            </Text>
                          )}
                        </HStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

        </VStack>
      </Container>
      
      {/* Event Modal */}
      <EventModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedEvent(null);
        }}
        calendarId={id!}
        event={selectedEvent}
        onSuccess={() => {
          refetchEvents();
          onClose();
          setSelectedEvent(null);
        }}
      />
      
      <FooterWithFourColumns />
    </Box>
  );
};

export default CalendarDetails;