// ============================================================================
// IMPORTANT: CALENDAR SCROLL BEHAVIOR DOCUMENTATION
// ============================================================================
// This calendar has specific scroll behavior that must be preserved:
//
// 1. AUTO-SCROLL TO CURRENT TIME:
//    - Happens when: Switching to Week/Day view, pressing Today button
//    - Shows current time at ~40% from top of viewport
//
// 2. PRESERVE SCROLL POSITION:
//    - Happens when: Creating or editing events
//    - User stays at exact same position after modal closes
//    - Controlled by: isPreservingView flag
//
// 3. KEY IMPLEMENTATION:
//    - isPreservingView flag prevents auto-scroll after save
//    - useEffect at line ~450 checks this flag
//    - onSuccess handlers set this flag before refreshing
//
// DO NOT MODIFY SCROLL BEHAVIOR WITHOUT UNDERSTANDING THESE INTERACTIONS
// ============================================================================

import React, { useState, createRef, useMemo, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Button,
  Badge,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Flex,
  Checkbox,
  Progress,
  Divider,
  SimpleGrid,
  Icon,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ArrowBackIcon, StarIcon, TimeIcon, AddIcon } from "@chakra-ui/icons";
import { FiTarget, FiEye, FiEyeOff, FiClock, FiUser } from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import { useEffect } from 'react'
import { EventInput, EventContentArg } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { calendarsModuleConfig } from "./moduleConfig";
import { brandConfig, getColor } from "../../brandConfig";
import EventModal from "./EventModal";
import GoalsModal from "./GoalsModal";
import { ICalInviteModal } from "./ICalInviteModal";
import { FloatingEventFilter } from "./FloatingEventFilter";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useCalendarScroll } from "./hooks/useCalendarScroll";
import { useCalendarFilters } from "./hooks/useCalendarFilters";
import { useCalendarModals } from "./hooks/useCalendarModals";
import { useCalendarEventHandlers } from "./hooks/useCalendarEventHandlers";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { CalendarEventContent } from "./components/CalendarEventContent";
import { CalendarHeader } from "./components/CalendarHeader";
import { MonthlyGoalsCard } from "./components/MonthlyGoalsCard";
import { CalendarToolbar } from "./components/CalendarToolbar";
import {
  getMonthYearDisplay,
  getTimeInSecondaryTimezone,
  getTimezoneName,
  generateSecondaryTimezoneLabels,
} from "./utils/timezoneHelpers";

// GraphQL Queries
const GET_CALENDARS_BY_IDS = gql`
  query GetCalendarsByIds($ids: [String!]!) {
    getCalendarsByIds(ids: $ids) {
      id
      name
      description
      type
      color
      responsibleOwnerId
      settings {
        timezone
        workingHoursStart
        workingHoursEnd
        workingDays
      }
      isActive
    }
  }
`;

const GET_CALENDAR = gql`
  query GetCalendar($id: String!) {
    calendar(id: $id) {
      id
      name
      description
      type
      color
      responsibleOwnerId
      settings {
        timezone
        workingHoursStart
        workingHoursEnd
        workingDays
      }
      isActive
    }
  }
`;

const GET_LINKED_EMAIL = gql`
  query GetLinkedEmailForCalendar($calendarId: String!, $tenantId: String) {
    getLinkedEmailForCalendar(calendarId: $calendarId, tenantId: $tenantId)
  }
`;

const GET_MULTI_CALENDAR_EVENTS = gql`
  query GetMultiCalendarEvents($calendarIds: [String!]!, $startDate: String, $endDate: String) {
    multiCalendarEvents(calendarIds: $calendarIds, startDate: $startDate, endDate: $endDate) {
      id
      calendarId
      title
      description
      startTime
      endTime
      isAllDay
      status
      color
      categories
      location {
        name
        address
      }
      attendees {
        clientId
        email
        name
        status
      }
      isCancelled
      isInboundICalInvite
      iCalMethod
      iCalResponseStatus
      iCalOrganizerName
      iCalOrganizerEmail
      metadata
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
      categories
      location {
        name
        address
      }
      attendees {
        clientId
        email
        name
        status
      }
      isCancelled
      isInboundICalInvite
      iCalMethod
      iCalResponseStatus
      iCalOrganizerName
      iCalOrganizerEmail
      metadata
    }
  }
`;

const GET_CURRENT_MONTH_GOALS = gql`
  query GetCurrentMonthGoals($calendarId: String!) {
    currentMonthGoals(calendarId: $calendarId) {
      id
      title
      description
      category
      progressPercentage
      currentValue
      targetValue
      checkpoints {
        id
        title
        completed
      }
      color
      parentGoalId
      assignedTo
    }
  }
`;

const GET_CLIENTS_FOR_GOALS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      businessName
    }
  }
`;

const GET_EXTERNAL_CALENDARS = gql`
  query GetExternalCalendars {
    getExternalCalendars {
      id
      name
      type
      iCalUrl
      color
      sharedFromName
      sharedFromEmail
      isActive
    }
  }
`;

const UPDATE_CHECKPOINT = gql`
  mutation UpdateGoalCheckpoint($input: UpdateGoalCheckpointInput!) {
    updateGoalCheckpoint(input: $input) {
      id
      progressPercentage
      checkpoints {
        id
        completed
      }
    }
  }
`;

const GET_CALENDAR_TAGS = gql`
  query GetCalendarTags($calendarId: String!) {
    calendarTags(calendarId: $calendarId) {
      id
      name
      color
      description
      usageCount
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $input: CalendarEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      startTime
      endTime
    }
  }
`;

const CalendarView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const calendarRef = createRef<FullCalendar>();

  // Parse calendar IDs from URL (support both single and multiple)
  const calendarIds = useMemo(() => {
    const calendarParam = searchParams.get('calendars');
    if (calendarParam) {
      // Multiple calendars from URL parameter
      return calendarParam.split(',').filter(Boolean);
    } else if (id) {
      // Single calendar from route parameter
      return [id];
    }
    return [];
  }, [id, searchParams]);

  const isMultiCalendar = calendarIds.length > 1;

  // Brand colors
  const bgMain = getColor('background.main', colorMode);
  const cardGradientBg = getColor('background.cardGradient', colorMode);
  const cardBorder = getColor('border.darkCard', colorMode);
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const primaryColor = getColor('primary', colorMode);
  const primaryHover = getColor('primaryHover', colorMode);
  
  // Get initial values from URL parameters
  const getInitialView = (): string => {
    const viewParam = searchParams.get('view');
    const validViews = ['dayGridMonth', 'timeGridWeek', 'timeGridDay'];
    return validViews.includes(viewParam || '') ? viewParam! : 'dayGridMonth';
  };
  
  const getInitialDate = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  };
  
  const getInitial24HourView = () => {
    const hoursParam = searchParams.get('hours');
    // Default to 24-hour view if no parameter is set
    if (!hoursParam) return true;
    return hoursParam === '24';
  };
  
  const [currentView, setCurrentView] = useState(getInitialView());
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [is24HourView, setIs24HourView] = useState(getInitial24HourView());
  const [localGoals, setLocalGoals] = useState<any[]>([]);
  const [showGoals, setShowGoals] = useState(false); // Hide goals by default
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Modal state management hook
  const {
    selectedEvent,
    setSelectedEvent,
    isEventModalOpen,
    setIsEventModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    newEventDate,
    setNewEventDate,
    selectedTimeRange,
    setSelectedTimeRange,
    isICalModalOpen,
    setIsICalModalOpen,
    selectedICalInvite,
    setSelectedICalInvite,
    isGoalsModalOpen,
    setIsGoalsModalOpen,
    openCreateModal,
    openEditModal,
    openICalModal,
  } = useCalendarModals();

  // CRITICAL: DO NOT REMOVE OR MODIFY THIS FLAG
  // This preserves the user's exact scroll position and view after creating/editing events
  // Without this, the calendar would jump to current time after every save, disorienting users
  // Works in conjunction with the useEffect hook that checks this flag before auto-scrolling
  const [isPreservingView, setIsPreservingView] = useState(false); // Flag to prevent view reset during save
  const [secondaryTimezone, setSecondaryTimezone] = useState<string | null>(null);
  const [visibleExternalCalendars, setVisibleExternalCalendars] = useState<Set<string>>(new Set());
  const [calendarColorMap, setCalendarColorMap] = useState<Map<string, string>>(new Map());

  // Scroll behavior hook
  const { isManualScrollRef, handleScrollToNow } = useCalendarScroll({
    calendarId: id,
    currentView,
    isPreservingView,
    calendarRef,
  });

  // Calculate date range for query (6 months window for safety)
  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString();
  }, []);
  
  const endDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString();
  }, []);
  
  // Fetch calendar details (multiple or single)
  const { loading: calendarsLoading, error: calendarsError, data: calendarsData } = useQuery(
    isMultiCalendar ? GET_CALENDARS_BY_IDS : GET_CALENDAR,
    {
      variables: isMultiCalendar ? { ids: calendarIds } : { id: calendarIds[0] },
      skip: calendarIds.length === 0,
      context: {
        headers: {
          'x-tenant-id': localStorage.getItem('tenantId') || ''
        }
      },
      onCompleted: (data) => {
        // Build color map for calendars
        const colorMap = new Map<string, string>();
        const calendars = isMultiCalendar ? data.getCalendarsByIds : [data.calendar];
        
        // Define distinct colors for multiple calendars
        const colors = [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Amber
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#14B8A6', // Teal
          '#F97316'  // Orange
        ];
        
        calendars?.forEach((calendar: any, index: number) => {
          if (calendar) {
            colorMap.set(calendar.id, calendar.color || colors[index % colors.length]);
          }
        });
        
        setCalendarColorMap(colorMap);
      }
    }
  );
  
  // For backwards compatibility with single calendar references
  const calendarLoading = calendarsLoading;
  const calendarError = calendarsError;
  const calendarData = calendarsData;
  const calendar = isMultiCalendar ? calendarsData?.getCalendarsByIds?.[0] : calendarsData?.calendar;

  // Update document title based on calendar name
  useDocumentTitle(
    calendarsModuleConfig,
    calendar?.name ? `${calendar.name} - Calendar` : isMultiCalendar ? 'Multi-Calendar View' : undefined
  );

  // Fetch calendar tags (for single calendar only, multi-calendar tags would be complex)
  const { data: tagsData, refetch: refetchTags } = useQuery(GET_CALENDAR_TAGS, {
    variables: { calendarId: calendarIds[0] },
    skip: calendarIds.length === 0 || isMultiCalendar,
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    },
    fetchPolicy: 'cache-and-network' // Ensure we get fresh data
  });
  
  // Fetch calendar events (multiple or single)
  const { loading: eventsLoading, error: eventsError, data: eventsData, refetch: refetchEvents } = useQuery(
    isMultiCalendar ? GET_MULTI_CALENDAR_EVENTS : GET_CALENDAR_EVENTS,
    {
      variables: isMultiCalendar 
        ? {
            calendarIds: calendarIds,
            startDate: startDate,
            endDate: endDate
          }
        : {
            calendarId: calendarIds[0],
            startDate: startDate,
            endDate: endDate
          },
      skip: calendarIds.length === 0,
      context: {
        headers: {
          'x-tenant-id': localStorage.getItem('tenantId') || ''
        }
      }
    }
  );
  
  // Fetch linked email address (for single calendar only)
  const { data: linkedEmailData } = useQuery(GET_LINKED_EMAIL, {
    variables: {
      calendarId: calendarIds[0],
      tenantId: localStorage.getItem('tenantId') || ''
    },
    skip: calendarIds.length === 0 || isMultiCalendar,
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch current month goals (for single calendar only)
  const { data: goalsData, refetch: refetchGoals } = useQuery(GET_CURRENT_MONTH_GOALS, {
    variables: { calendarId: calendarIds[0] },
    skip: calendarIds.length === 0 || isMultiCalendar,
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch clients data for goal assignments
  const { data: clientsData } = useQuery(GET_CLIENTS_FOR_GOALS, {
    skip: calendarIds.length === 0 || isMultiCalendar,
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch external calendars
  const { data: externalCalendarsData, refetch: refetchExternalCalendars } = useQuery(GET_EXTERNAL_CALENDARS, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Update checkpoint mutation
  const [updateCheckpoint] = useMutation(UPDATE_CHECKPOINT, {
    onCompleted: () => {
      refetchGoals();
    },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Update event mutation for drag and drop
  const [updateEvent] = useMutation(UPDATE_EVENT, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    },
    onCompleted: () => {
      // Don't refetch - let the optimistic UI handle it
      console.log('✅ Event updated successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to update event:', error);
      alert('Failed to move event. Please try again.');
      // Only refetch on error to restore the original position
      refetchEvents();
    }
  });

  // Event filtering hook (after queries are defined)
  const {
    activeEventFilters,
    setActiveEventFilters,
    activeTagFilters,
    setActiveTagFilters,
    filteredEvents,
  } = useCalendarFilters({
    eventsData,
    tagsData,
    isMultiCalendar,
    calendarColorMap,
  });

  // Event handlers hook (after queries and modals are defined)
  const {
    handleDatesSet: handleDatesSetFromHook,
    handleDateClick: handleDateClickFromHook,
    handleSelect: handleSelectFromHook,
    handleEventDrop: handleEventDropFromHook,
    handleEventResize: handleEventResizeFromHook,
    handleEventClick: handleEventClickFromHook,
  } = useCalendarEventHandlers({
    currentView,
    calendarRef,
    eventsData,
    isMultiCalendar,
    calendarIds,
    updateEvent,
    setNewEventDate,
    setSelectedTimeRange,
    setIsCreateModalOpen,
    setSelectedEvent,
    setIsEventModalOpen,
    setSelectedICalInvite,
    setIsICalModalOpen,
  });

  // Calculate progress percentage based on completed checkpoints
  const calculateProgress = (checkpoints: any[]) => {
    if (!checkpoints || checkpoints.length === 0) return 0;
    const completed = checkpoints.filter(cp => cp.completed).length;
    return Math.round((completed / checkpoints.length) * 100);
  };

  // Handle toggling checkpoint
  const handleToggleCheckpoint = (goalId: string, checkpointId: string, completed: boolean) => {
    // Optimistically update the local state
    setLocalGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id === goalId) {
          const updatedCheckpoints = goal.checkpoints.map((cp: any) => 
            cp.id === checkpointId ? { ...cp, completed } : cp
          );
          return {
            ...goal,
            checkpoints: updatedCheckpoints,
            progressPercentage: calculateProgress(updatedCheckpoints)
          };
        }
        return goal;
      })
    );

    updateCheckpoint({
      variables: {
        input: {
          goalId,
          checkpointId,
          completed
        }
      }
    });
  };
  
  // Sync local goals with fetched data and calculate progress
  useEffect(() => {
    if (goalsData?.currentMonthGoals) {
      // Recalculate progress for each goal based on actual checkpoint completion
      const goalsWithCalculatedProgress = goalsData.currentMonthGoals.map((goal: any) => ({
        ...goal,
        progressPercentage: calculateProgress(goal.checkpoints || [])
      }));
      setLocalGoals(goalsWithCalculatedProgress);
    }
  }, [goalsData]);

  // Initialize calendar with URL parameters on mount
  useEffect(() => {
    // Skip initialization if we're preserving view after save
    if (isPreservingView) return;
    
    const calendarApi = calendarRef.current?.getApi();
    const calendar = calendarData?.calendar;
    if (calendarApi && calendar) {
      // Set the initial view from URL
      const viewParam = searchParams.get('view');
      if (viewParam && ['dayGridMonth', 'timeGridWeek', 'timeGridDay'].includes(viewParam)) {
        calendarApi.changeView(viewParam);
        
        // Auto-scroll to current time for week/day views
        if (viewParam === 'timeGridWeek' || viewParam === 'timeGridDay') {
          const now = new Date();

          setTimeout(() => {
            // Calculate time offset to position current time at ~40% from top
            const scrollTime = new Date(now.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before current time
            calendarApi.scrollToTime(scrollTime.toTimeString().slice(0, 8));
          }, 200);
        }
      }
      
      // Set the initial date from URL
      const dateParam = searchParams.get('date');
      if (dateParam) {
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          calendarApi.gotoDate(parsedDate);
        }
      }
    }
  }, [calendarData, isPreservingView]); // Re-run when calendar data loads, skip when preserving view

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Refetch tags periodically to catch any updates from tag manager
  useEffect(() => {
    // Set up a focus listener to refetch tags when window regains focus
    const handleFocus = () => {
      console.log('🔄 Window focused, refetching tags...');
      if (refetchTags) {
        refetchTags();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also refetch tags every 30 seconds to catch updates
    const interval = setInterval(() => {
      console.log('🔄 Periodic tag refresh...');
      if (refetchTags) {
        refetchTags();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [refetchTags]);

  // ============================================================================
  // NOTE: Auto-scroll behavior now handled by useCalendarScroll hook
  // See hooks/useCalendarScroll.ts for implementation
  // NOTE: Event filtering and transformation now handled by useCalendarFilters hook
  // See hooks/useCalendarFilters.ts for implementation
  // ============================================================================
  
  // Helper function to update URL parameters
  const updateUrlParams = (updates: { view?: string; date?: string; hours?: string }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.view !== undefined) {
      newParams.set('view', updates.view);
    }
    
    if (updates.date !== undefined) {
      newParams.set('date', updates.date);
    }
    
    if (updates.hours !== undefined) {
      if (updates.hours === 'business') {
        newParams.delete('hours'); // Default is business hours
      } else {
        newParams.set('hours', updates.hours);
      }
    }
    
    setSearchParams(newParams);
  };

  // Navigation hook (for prev/next/today/view changes) - must be after updateUrlParams declaration
  const {
    handlePrevious,
    handleNext,
    handleToday,
    handleViewChange,
  } = useCalendarNavigation({
    currentView,
    calendarRef,
    setCurrentDate,
    setCurrentView,
    updateUrlParams,
    is24HourView,
  });

  // Render event content (now using separate component)
  const renderEventContent = (eventContent: EventContentArg) => (
    <CalendarEventContent
      eventContent={eventContent}
      isMultiCalendar={isMultiCalendar}
      calendarsData={calendarsData}
    />
  );
  
  if (calendarLoading || eventsLoading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        {!showGoals && <NavbarWithCallToAction />}
        {!showGoals && <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />}
        <Container maxW="container.xl" py={8} flex="1">
          <VStack spacing={4} align="center" justify="center" minH="400px">
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading calendar{isMultiCalendar ? 's' : ''}...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }
  
  if (calendarError || eventsError || (!isMultiCalendar && !calendarData?.calendar) || (isMultiCalendar && (!calendarsData?.getCalendarsByIds || calendarsData.getCalendarsByIds.length === 0))) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        {!showGoals && <NavbarWithCallToAction />}
        {!showGoals && <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />}
        <Container maxW="container.xl" py={8} flex="1">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>
              {calendarError?.message || eventsError?.message || 'Calendar(s) not found'}
            </Text>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }
  
  // Log events for debugging
  console.log('📊 Calendar(s) loaded:', isMultiCalendar ? calendarsData?.getCalendarsByIds?.length : 1);
  console.log('📅 Events loaded:', filteredEvents.length);
  
  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      {!showGoals && <NavbarWithCallToAction />}
      {!showGoals && <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />}
      <Container maxW="100%" py={{ base: 1, md: 2 }} px={{ base: 2, md: 4 }} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header Controls - Compact */}
          <CalendarHeader
            currentDate={currentDate}
            secondaryTimezone={secondaryTimezone}
            getTimeInSecondaryTimezone={getTimeInSecondaryTimezone}
            showGoals={showGoals}
            setShowGoals={setShowGoals}
            setSelectedEvent={setSelectedEvent}
            setIsEventModalOpen={setIsEventModalOpen}
            cardGradientBg={cardGradientBg}
            cardBorder={cardBorder}
            textSecondary={textSecondary}
            primaryColor={primaryColor}
          />
          
          {/* Monthly Goals Section - Sticky when visible */}
          {showGoals && (
            <MonthlyGoalsCard
              currentDate={currentDate}
              localGoals={localGoals}
              clientsData={clientsData}
              selectedGoalId={selectedGoalId}
              setSelectedGoalId={setSelectedGoalId}
              setIsGoalsModalOpen={setIsGoalsModalOpen}
              handleToggleCheckpoint={handleToggleCheckpoint}
              cardGradientBg={cardGradientBg}
              cardBorder={cardBorder}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              primaryColor={primaryColor}
            />
          )}

          {/* Calendar Controls */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={cardBorder}
          >
            <CardBody>
              <VStack spacing={4}>
                <CalendarToolbar
                  currentView={currentView}
                  currentDate={currentDate}
                  isMultiCalendar={isMultiCalendar}
                  calendarIds={calendarIds}
                  calendar={calendar}
                  calendarsData={calendarsData}
                  linkedEmailData={linkedEmailData}
                  filteredEvents={filteredEvents}
                  calendarColorMap={calendarColorMap}
                  is24HourView={is24HourView}
                  handleToday={handleToday}
                  handleScrollToNow={handleScrollToNow}
                  handlePrevious={handlePrevious}
                  handleNext={handleNext}
                  handleViewChange={handleViewChange}
                  setIs24HourView={setIs24HourView}
                  updateUrlParams={updateUrlParams}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  primaryColor={primaryColor}
                  primaryHover={primaryHover}
                  cardBorder={cardBorder}
                />

                {/* Calendar Component with Secondary Timezone */}
                <HStack align="stretch" spacing={0} width="100%">
                  {/* Secondary Timezone Column */}
                  {secondaryTimezone && (currentView === 'timeGridWeek' || currentView === 'timeGridDay') && (
                    <Box
                      bg="rgba(0, 0, 0, 0.3)"
                      borderRadius="lg 0 0 lg"
                      borderRight="2px solid"
                      borderColor="rgba(54, 158, 255, 0.2)"
                      minW="80px"
                      position="relative"
                    >
                      {/* Timezone Header */}
                      <Box
                        height="40px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderBottom="1px solid"
                        borderColor="rgba(54, 158, 255, 0.2)"
                        bg="rgba(54, 158, 255, 0.1)"
                      >
                        <Text fontSize="xs" fontWeight="600" color="cyan.400">
                          {getTimezoneName(secondaryTimezone)}
                        </Text>
                      </Box>
                      
                      {/* Time Labels */}
                      <Box mt="60px">
                        {generateSecondaryTimezoneLabels(secondaryTimezone, calendar, is24HourView)}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Main Calendar */}
                  <Box
                    flex="1"
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius={secondaryTimezone && (currentView === 'timeGridWeek' || currentView === 'timeGridDay') ? "0 lg lg 0" : "lg"}
                    p={{ base: 2, md: 4 }}
                    overflow="visible"
                  sx={{
                    '.fc': {
                      fontFamily: brandConfig.fonts.body,
                    },
                    '.fc-toolbar-title': {
                      color: textPrimary,
                      fontSize: { base: 'md', md: 'xl' },
                      fontWeight: 'bold',
                    },
                    // Mobile styles for all views
                    '@media (max-width: 768px)': {
                      // Month view mobile styles
                      '.fc-daygrid-day-frame': {
                        minHeight: '50px',
                      },
                      '.fc-daygrid-event': {
                        fontSize: '0.65rem',
                        padding: '0px 2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      '.fc-daygrid-day-number': {
                        fontSize: '0.7rem',
                        padding: '2px',
                      },
                      '.fc-daygrid-more-link': {
                        fontSize: '0.65rem',
                      },
                      
                      // Week view mobile styles
                      '.fc-timegrid': {
                        fontSize: '0.75rem',
                      },
                      '.fc-timegrid-slot-label': {
                        fontSize: '0.75rem',
                        padding: '2px 4px',
                        fontWeight: '500',
                      },
                      '.fc-timegrid-slot-label-cushion': {
                        fontSize: '0.75rem',
                      },
                      '.fc-timegrid-event': {
                        fontSize: '0.7rem',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      },
                      '.fc-timegrid-event .fc-event-title': {
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      },
                      '.fc-timegrid-event .fc-event-time': {
                        fontSize: '0.65rem',
                        display: 'block',
                        marginBottom: '2px',
                      },
                      '.fc-timegrid-event-harness': {
                        marginRight: '1px',
                        marginLeft: '1px',
                      },
                      '.fc-timegrid-axis': {
                        width: '45px',
                      },
                      '.fc-timegrid-axis-cushion': {
                        fontSize: '0.7rem',
                        padding: '0 2px',
                      },
                      '.fc-timeGridWeek-view .fc-col-header-cell-cushion': {
                        fontSize: '0.7rem',
                        padding: '4px 2px',
                        fontWeight: '600',
                      },
                      '.fc-timeGridWeek-view .fc-daygrid-day-top': {
                        fontSize: '0.75rem',
                      },
                      '.fc-timeGridWeek-view .fc-timegrid-col': {
                        minWidth: '50px',
                      },
                      '.fc-timeGridWeek-view .fc-timegrid-now-indicator-arrow': {
                        display: 'none',
                      },
                      '.fc-timeGridWeek-view .fc-timegrid-slots': {
                        fontSize: '0.75rem',
                      },
                      '.fc-timeGridWeek-view .fc-timegrid-slot': {
                        height: '40px',
                      },
                      
                      // Day view mobile styles
                      '.fc-timeGridDay-view .fc-timegrid-slot-label': {
                        fontSize: '0.7rem',
                      },
                      '.fc-timeGridDay-view .fc-timegrid-event': {
                        fontSize: '0.75rem',
                        padding: '4px',
                      },
                      '.fc-timeGridDay-view .fc-timegrid-axis': {
                        width: '40px',
                      },
                      '.fc-timeGridDay-view .fc-col-header': {
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      },
                      '.fc-timeGridDay-view .fc-timegrid-col': {
                        minWidth: 'auto',
                      },
                      '.fc-timeGridDay-view .fc-event-title': {
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      },
                      '.fc-timeGridDay-view .fc-event-time': {
                        fontSize: '0.65rem',
                      },
                      
                      // Common mobile styles
                      '.fc-event': {
                        fontSize: '0.7rem',
                        borderRadius: '2px',
                      },
                      '.fc-event-title': {
                        fontWeight: 'normal',
                      },
                      '.fc-col-header-cell': {
                        fontSize: '0.7rem',
                        padding: '4px 2px',
                        fontWeight: '600',
                      },
                      '.fc-scrollgrid': {
                        fontSize: '0.85rem',
                      },
                      '.fc-more-popover': {
                        fontSize: '0.75rem',
                        maxWidth: '200px',
                      },
                      '.fc-now-indicator': {
                        borderWidth: '1px',
                      },
                    },
                    '.fc-col-header-cell': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#000000',
                      fontWeight: '600',
                      borderColor: cardBorder,
                    },
                    '.fc-col-header-cell-cushion': {
                      color: '#000000',
                      fontWeight: '600',
                    },
                    '.fc-daygrid-day': {
                      backgroundColor: 'transparent',
                      borderColor: cardBorder,
                    },
                    '.fc-daygrid-day-number': {
                      color: textPrimary,
                    },
                    '.fc-daygrid-day.fc-day-today': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '2px solid',
                      borderColor: primaryColor,
                    },
                    '.fc-daygrid-day.fc-day-today .fc-daygrid-day-number': {
                      backgroundColor: primaryColor,
                      color: 'white',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      margin: '2px',
                    },
                    '.fc-daygrid-event': {
                      borderRadius: '4px',
                      padding: '2px 4px',
                    },
                    '.fc-timegrid-slot': {
                      borderColor: cardBorder,
                    },
                    '.fc-timegrid-slot-label': {
                      color: textSecondary,
                    },
                    '.fc-event': {
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    },
                    '.fc-event:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                    '.fc-button': {
                      display: 'none',
                    },
                    '.fc-toolbar': {
                      display: 'none',
                    },
                    '.fc-scrollgrid': {
                      borderColor: cardBorder,
                    },
                    '.fc-theme-standard td, .fc-theme-standard th': {
                      borderColor: cardBorder,
                    },
                    // Selection highlight styles
                    '.fc-highlight': {
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '2px solid rgba(59, 130, 246, 0.5)',
                    },
                    // 24-hour view specific styles
                    ...(is24HourView && {
                      '.fc-timegrid-slot': {
                        height: '25px !important',
                        minHeight: '25px !important',
                      },
                      '.fc-timegrid-slot-lane': {
                        height: '25px !important',
                      },
                      '.fc-timegrid-col.fc-day': {
                        minHeight: '600px !important',
                      },
                      // Night hours styling (highlight non-business hours)
                      '.fc-timegrid-slot[data-time^="00:"], .fc-timegrid-slot[data-time^="01:"], .fc-timegrid-slot[data-time^="02:"], .fc-timegrid-slot[data-time^="03:"], .fc-timegrid-slot[data-time^="04:"], .fc-timegrid-slot[data-time^="05:"], .fc-timegrid-slot[data-time^="06:"], .fc-timegrid-slot[data-time^="21:"], .fc-timegrid-slot[data-time^="22:"], .fc-timegrid-slot[data-time^="23:"]': {
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      },
                    }),
                  }}
                >
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={currentView}
                    initialDate={currentDate.toISOString().split('T')[0]}
                    headerToolbar={false}
                    events={filteredEvents}
                    eventClick={handleEventClickFromHook}
                    dateClick={handleDateClickFromHook}
                    datesSet={handleDatesSetFromHook}
                    eventContent={renderEventContent}
                    height="auto"
                    slotMinTime={is24HourView ? "00:00" : (isMobile ? "07:00" : (calendar?.settings?.workingHoursStart || "08:00"))}
                    slotMaxTime={is24HourView ? "24:00" : (isMobile ? "20:00" : (calendar?.settings?.workingHoursEnd || "18:00"))}
                    firstDay={1} // Monday as first day
                    nowIndicator={true}
                    eventDisplay="block"
                    dayMaxEvents={isMobile ? 2 : 3}
                    moreLinkText={isMobile ? "+" : "more"}
                    slotDuration={currentView === 'timeGridDay' || currentView === 'timeGridWeek' ? "00:10:00" : "00:30:00"}
                    slotLabelInterval={isMobile ? "02:00" : "01:00"}
                    snapDuration="00:10:00"
                    selectable={currentView === 'timeGridWeek' || currentView === 'timeGridDay'}
                    selectMirror={true}
                    select={handleSelectFromHook}
                    unselectAuto={false}
                    editable={true}  // Enable drag and drop
                    droppable={true} // Allow external dragging
                    eventDrop={handleEventDropFromHook} // Handle event drop
                    eventResize={handleEventResizeFromHook} // Handle event resize
                    eventResizableFromStart={true} // Allow resize from start
                    slotLabelFormat={{
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: isMobile ? false : true
                    }}
                    expandRows={true}
                    stickyHeaderDates={!isMobile}
                    allDaySlot={!isMobile || currentView !== 'timeGridWeek'}
                    eventMinHeight={isMobile ? 25 : 20}
                    slotEventOverlap={true} // Allow visual overlapping of events
                    eventOverlap={true} // Allow events to be dragged to overlap
                    eventMaxStack={isMultiCalendar ? 4 : 2} // Stack more events when multi-calendar
                    businessHours={{
                      daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                      startTime: calendar?.settings?.workingHoursStart || '09:00',
                      endTime: calendar?.settings?.workingHoursEnd || '17:00',
                    }}
                  />
                  </Box>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      
      {/* Floating Event Filter */}
      <FloatingEventFilter 
        events={filteredEvents}
        calendarId={calendarIds[0] || ''}
        onFilterChange={setActiveEventFilters}
        onTimezoneChange={setSecondaryTimezone}
        onTagFilterChange={setActiveTagFilters}
      />
      
      {/* Event Modal for Editing */}
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={async () => {
            // CRITICAL: Set flag to prevent auto-scroll - keeps user at their current position
            // DO NOT REMOVE - This prevents the calendar from jumping after save
            setIsPreservingView(true);
            
            // Store current view state AND both scroll positions before any updates
            const calendarApi = calendarRef.current?.getApi();
            const preservedView = calendarApi?.view.type || currentView;
            const preservedDate = calendarApi?.getDate() || currentDate;
            const preserved24Hour = is24HourView;
            
            // Store the browser window scroll position
            const preservedWindowScrollY = window.scrollY;
            const preservedWindowScrollX = window.scrollX;
            
            // Store the calendar's internal scroll position for time grid views
            let preservedScrollTime: string | null = null;
            if (preservedView === 'timeGridWeek' || preservedView === 'timeGridDay') {
              const scrollContainer = document.querySelector('.fc-scroller-liquid-absolute');
              if (scrollContainer) {
                const scrollTop = scrollContainer.scrollTop;
                // Calculate approximate time based on scroll position
                const hoursFromTop = Math.floor(scrollTop / 60);
                const minutesFromTop = Math.floor((scrollTop % 60) * 60 / 60);
                preservedScrollTime = `${String(hoursFromTop).padStart(2, '0')}:${String(minutesFromTop).padStart(2, '0')}:00`;
              }
            }
            
            setIsEventModalOpen(false);
            setSelectedEvent(null);
            
            // Refresh events without reloading the page
            await refetchEvents();
            
            // Force restore the view after refetch completes
            setTimeout(() => {
              const api = calendarRef.current?.getApi();
              if (api) {
                api.changeView(preservedView);
                api.gotoDate(preservedDate);
                setCurrentView(preservedView);
                setCurrentDate(preservedDate);
                setIs24HourView(preserved24Hour);
                
                // Restore calendar's internal scroll position if we captured it
                if (preservedScrollTime && (preservedView === 'timeGridWeek' || preservedView === 'timeGridDay')) {
                  api.scrollToTime(preservedScrollTime);
                }
                
                // Restore browser window scroll position
                window.scrollTo(preservedWindowScrollX, preservedWindowScrollY);
              }
              
              // Clear the flag after restoration
              setTimeout(() => setIsPreservingView(false), 500);
            }, 200);
          }}
          calendarId={calendarIds[0] || ''}
          event={selectedEvent}
        />
      )}
      
      {/* Event Modal for Creating */}
      {isCreateModalOpen && (
        <EventModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewEventDate('');
            setSelectedTimeRange(null);
          }}
          onSuccess={async () => {
            // CRITICAL: Set flag to prevent auto-scroll - keeps user at their current position
            // DO NOT REMOVE - This prevents the calendar from jumping after save
            setIsPreservingView(true);
            
            // Store current view state AND both scroll positions before any updates
            const calendarApi = calendarRef.current?.getApi();
            const preservedView = calendarApi?.view.type || currentView;
            const preservedDate = calendarApi?.getDate() || currentDate;
            const preserved24Hour = is24HourView;
            
            // Store the browser window scroll position
            const preservedWindowScrollY = window.scrollY;
            const preservedWindowScrollX = window.scrollX;
            
            // Store the calendar's internal scroll position for time grid views
            let preservedScrollTime: string | null = null;
            if (preservedView === 'timeGridWeek' || preservedView === 'timeGridDay') {
              const scrollContainer = document.querySelector('.fc-scroller-liquid-absolute');
              if (scrollContainer) {
                const scrollTop = scrollContainer.scrollTop;
                // Calculate approximate time based on scroll position
                const hoursFromTop = Math.floor(scrollTop / 60);
                const minutesFromTop = Math.floor((scrollTop % 60) * 60 / 60);
                preservedScrollTime = `${String(hoursFromTop).padStart(2, '0')}:${String(minutesFromTop).padStart(2, '0')}:00`;
              }
            }
            
            setIsCreateModalOpen(false);
            setNewEventDate('');
            setSelectedTimeRange(null);
            
            // Refresh events without reloading the page
            await refetchEvents();
            
            // Force restore the view after refetch completes
            setTimeout(() => {
              const api = calendarRef.current?.getApi();
              if (api) {
                api.changeView(preservedView);
                api.gotoDate(preservedDate);
                setCurrentView(preservedView);
                setCurrentDate(preservedDate);
                setIs24HourView(preserved24Hour);
                
                // Restore calendar's internal scroll position if we captured it
                if (preservedScrollTime && (preservedView === 'timeGridWeek' || preservedView === 'timeGridDay')) {
                  api.scrollToTime(preservedScrollTime);
                }
                
                // Restore browser window scroll position
                window.scrollTo(preservedWindowScrollX, preservedWindowScrollY);
              }
              
              // Clear the flag after restoration
              setTimeout(() => setIsPreservingView(false), 500);
            }, 200);
          }}
          calendarId={calendarIds[0] || ''}
          initialDate={newEventDate}
          initialTimeRange={selectedTimeRange || undefined}
        />
      )}
      
      {/* Goals Modal */}
      {isGoalsModalOpen && (
        <GoalsModal
          isOpen={isGoalsModalOpen}
          onClose={() => {
            setIsGoalsModalOpen(false);
            setSelectedGoalId(null);
            refetchGoals();
          }}
          calendarId={calendarIds[0] || ''}
          currentMonth={currentDate}
          initialGoalId={selectedGoalId}
        />
      )}
      
      {/* iCal Invite Modal */}
      {isICalModalOpen && selectedICalInvite && (
        <ICalInviteModal
          isOpen={isICalModalOpen}
          onClose={() => {
            setIsICalModalOpen(false);
            setSelectedICalInvite(null);
          }}
          event={selectedICalInvite}
          onRefresh={() => {
            refetchEvents();
          }}
        />
      )}

    </Box>
  );
};

export default CalendarView;