import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from '../moduleConfig';
import { usePageTitle } from '../../../hooks/useDocumentTitle';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorMode,
  Flex,
  Badge,
  Switch,
  useToast,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { AddIcon, TimeIcon } from '@chakra-ui/icons';
import { FiZoomIn, FiZoomOut, FiTarget, FiCalendar } from 'react-icons/fi';
import { getColor } from '../../../brandConfig';
import { LifeGoalModal } from './LifeGoalModal';
import { LifeGoalCard } from './LifeGoalCard';
import { TimelineRuler } from './components/TimelineRuler';

// GraphQL Mutations and Queries
const CREATE_LIFE_GOAL = gql`
  mutation CreateLifeGoal($input: CalendarEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      startTime
      endTime
      metadata
      calendarId
    }
  }
`;

const UPDATE_LIFE_GOAL = gql`
  mutation UpdateLifeGoal($id: String!, $input: CalendarEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      startTime
      endTime
      metadata
      calendarId
    }
  }
`;

const DELETE_LIFE_GOAL = gql`
  mutation DeleteLifeGoal($id: String!) {
    deleteEvent(id: $id) {
      success
      message
    }
  }
`;

const GET_LIFE_GOALS = gql`
  query GetLifeGoals($calendarId: String!, $startDate: String!, $endDate: String!) {
    calendarEvents(
      calendarId: $calendarId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      title
      description
      startTime
      endTime
      metadata
      calendarId
      organizerId
    }
  }
`;

const GET_MY_CALENDARS = gql`
  query GetMyCalendars {
    myCalendars {
      id
      name
      type
    }
  }
`;

export type ZoomLevel =
  | '120years' | '80years' | '40years' | '20years' | '10years'
  | '5years' | '1year' | '6months' | '3months'
  | '1month' | '1week' | '1day';

interface ZoomConfig {
  level: ZoomLevel;
  label: string;
  pixelsPerDay: number;
  rulerUnit: 'decade' | 'year' | 'quarter' | 'month' | 'week' | 'day';
  displayUnit: string;
}

const ZOOM_LEVELS: ZoomConfig[] = [
  { level: '120years', label: '120 Years', pixelsPerDay: 0.008, rulerUnit: 'decade', displayUnit: 'Decades' },
  { level: '80years', label: '80 Years', pixelsPerDay: 0.012, rulerUnit: 'decade', displayUnit: 'Decades' },
  { level: '40years', label: '40 Years', pixelsPerDay: 0.025, rulerUnit: 'decade', displayUnit: 'Decades' },
  { level: '20years', label: '20 Years', pixelsPerDay: 0.05, rulerUnit: 'year', displayUnit: 'Years' },
  { level: '10years', label: '10 Years', pixelsPerDay: 0.1, rulerUnit: 'year', displayUnit: 'Years' },
  { level: '5years', label: '5 Years', pixelsPerDay: 0.2, rulerUnit: 'year', displayUnit: 'Years' },
  { level: '1year', label: '1 Year', pixelsPerDay: 1, rulerUnit: 'quarter', displayUnit: 'Quarters' },
  { level: '6months', label: '6 Months', pixelsPerDay: 2, rulerUnit: 'month', displayUnit: 'Months' },
  { level: '3months', label: '3 Months', pixelsPerDay: 4, rulerUnit: 'month', displayUnit: 'Months' },
  { level: '1month', label: '1 Month', pixelsPerDay: 10, rulerUnit: 'week', displayUnit: 'Weeks' },
  { level: '1week', label: '1 Week', pixelsPerDay: 50, rulerUnit: 'day', displayUnit: 'Days' },
  { level: '1day', label: '1 Day', pixelsPerDay: 100, rulerUnit: 'day', displayUnit: 'Hours' },
];

const LifeGoalsTimeline: React.FC = () => {
  const { colorMode } = useColorMode();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Life Goals Timeline');

  // Theme colors
  const bg = getColor("background.main", colorMode);
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  // State
  const [zoomIndex, setZoomIndex] = useState(4); // Start at 10 years (index 4 now with 120years added)
  const [showRegularEvents, setShowRegularEvents] = useState(false);
  const [showLifeGoals, setShowLifeGoals] = useState(true);
  const [lifeGoals, setLifeGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [lifeGoalsCalendarId, setLifeGoalsCalendarId] = useState<string | null>(null);

  // Drag-to-create state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ y: number; date: Date } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ y: number; date: Date } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ top: number; height: number } | null>(null);

  // Load birthdate from localStorage or use default
  const [birthDateStr, setBirthDateStr] = useState<string>(() => {
    const saved = localStorage.getItem('lifeGoalsBirthDate');
    if (saved) return saved;
    // Default to March 14, 1986 as suggested
    return '1986-03-14';
  });

  const timelineRef = useRef<HTMLDivElement>(null);
  const currentZoom = ZOOM_LEVELS[zoomIndex];

  // Calculate timeline dimensions
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  const endDate = new Date(birthDate.getFullYear() + 120, 11, 31); // 120 years from birth
  const totalDays = Math.floor((endDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const timelineHeight = totalDays * currentZoom.pixelsPerDay;

  // GraphQL hooks
  const [createLifeGoalMutation] = useMutation(CREATE_LIFE_GOAL);
  const [updateLifeGoalMutation] = useMutation(UPDATE_LIFE_GOAL);
  const [deleteLifeGoalMutation] = useMutation(DELETE_LIFE_GOAL);

  // Get user's calendars to find or create Life Goals calendar
  const { data: calendarsData, loading: calendarsLoading } = useQuery(GET_MY_CALENDARS);

  // Get life goals for the calendar
  const { data: goalsData, loading: goalsLoading, refetch: refetchGoals } = useQuery(GET_LIFE_GOALS, {
    variables: {
      calendarId: lifeGoalsCalendarId || '',
      startDate: birthDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    skip: !lifeGoalsCalendarId,
  });

  // Zoom controls
  const zoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const zoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  const handleZoomSlider = (value: number) => {
    setZoomIndex(value);
  };

  const handleScrollToNow = () => {
    console.log('🕐 Scroll to Now button clicked');

    // Calculate position of today on the timeline
    const daysSinceBirth = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const scrollPosition = daysSinceBirth * currentZoom.pixelsPerDay;

    // Scroll the whole page to show today's position
    // Add offset for header and controls
    const headerOffset = 300; // Approximate height of header and controls
    window.scrollTo({
      top: scrollPosition + headerOffset - 200,
      behavior: 'smooth'
    });

    toast({
      title: '🕐 Scrolled to today',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Find or create Life Goals calendar
  useEffect(() => {
    if (calendarsData?.myCalendars) {
      console.log('🔍 Looking for Life Goals calendar in:', calendarsData.myCalendars);
      const lifeGoalsCalendar = calendarsData.myCalendars.find(
        (cal: any) => cal.name === 'Life Goals' || cal.name === 'Life Goals Timeline'
      );
      if (lifeGoalsCalendar) {
        console.log('✅ Found Life Goals calendar:', lifeGoalsCalendar.id);
        setLifeGoalsCalendarId(lifeGoalsCalendar.id);
      } else {
        // Use the first calendar for now, or show a message to create one
        const firstCalendar = calendarsData.myCalendars[0];
        if (firstCalendar) {
          console.log('⚠️ Using first calendar as fallback:', firstCalendar.id);
          setLifeGoalsCalendarId(firstCalendar.id);
          toast({
            title: 'Using default calendar',
            description: 'Create a "Life Goals" calendar for better organization',
            status: 'info',
            duration: 5000,
          });
        }
      }
    }
  }, [calendarsData, toast]);

  // Load life goals from backend
  useEffect(() => {
    if (goalsData?.calendarEvents) {
      console.log('📅 Loaded calendar events:', goalsData.calendarEvents);
      // Filter for life goal events (check metadata for X-GOAL-TIER = LIFE)
      const lifeGoalEvents = goalsData.calendarEvents.filter((event: any) => {
        return event.metadata && event.metadata['X-GOAL-TIER'] === 'LIFE';
      });
      console.log('🎯 Filtered life goals:', lifeGoalEvents);
      setLifeGoals(lifeGoalEvents);
    }
  }, [goalsData]);

  // Scroll to today on mount (only once on initial load)
  useEffect(() => {
    // Calculate position of today on the timeline
    const daysSinceBirth = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const scrollPosition = daysSinceBirth * currentZoom.pixelsPerDay;

    // Scroll the whole page to show today's position
    // Add offset for header and controls
    const headerOffset = 300; // Approximate height of header and controls
    window.scrollTo({
      top: scrollPosition + headerOffset - 200,
      behavior: 'smooth'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on initial mount, not on zoom changes

  const handleAddGoal = () => {
    setSelectedGoal(null);
    onModalOpen();
  };

  const handleEditGoal = (goal: any) => {
    console.log('🖊️ Editing goal:', goal);
    setSelectedGoal(goal);
    onModalOpen();
  };

  const handleResizeGoal = async (goal: any, newStartDate: Date, newEndDate: Date) => {
    console.log('📏 Resizing goal:', goal.title, {
      oldStart: goal.startTime,
      oldEnd: goal.endTime,
      newStart: newStartDate.toISOString(),
      newEnd: newEndDate.toISOString(),
    });

    try {
      // Prepare the updated goal data
      const eventInput = {
        calendarId: lifeGoalsCalendarId!,
        title: goal.title,
        description: goal.description || '',
        startTime: newStartDate.toISOString(),
        endTime: newEndDate.toISOString(),
        isAllDay: true,
        type: 'EVENT',
        status: 'CONFIRMED',
        visibility: 'PRIVATE',
        metadata: goal.metadata,
        categories: goal.categories || ['LIFE_GOAL'],
      };

      // Update the goal via GraphQL
      const { data } = await updateLifeGoalMutation({
        variables: {
          id: goal.id,
          input: eventInput,
        },
      });

      console.log('✅ Goal resized:', data.updateEvent);

      // Refetch goals to update the display
      await refetchGoals();

      toast({
        title: 'Goal updated',
        description: `"${goal.title}" dates have been adjusted`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error resizing goal:', error);
      toast({
        title: 'Error resizing goal',
        description: 'Failed to update goal dates',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteGoal = async (goal: any) => {
    console.log('🗑️ Deleting goal:', goal.title);

    try {
      // Delete the goal via GraphQL
      await deleteLifeGoalMutation({
        variables: {
          id: goal.id,
        },
      });

      console.log('✅ Goal deleted');

      // Refetch goals to update the display
      await refetchGoals();

      toast({
        title: 'Goal deleted',
        description: `"${goal.title}" has been removed`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      toast({
        title: 'Error deleting goal',
        description: 'Failed to delete goal',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Convert Y position to date based on timeline
  const yPositionToDate = (yPos: number): Date => {
    const daysFromBirth = Math.floor(yPos / currentZoom.pixelsPerDay);
    const date = new Date(birthDate);
    date.setDate(date.getDate() + daysFromBirth);
    return date;
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start drag if clicking on empty space (not on an existing goal)
    const target = e.target as HTMLElement;
    if (target.closest('.life-goal-card')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
    const startDate = yPositionToDate(y);

    setIsDragging(true);
    setDragStart({ y, date: startDate });
    setSelectionBox({ top: y, height: 0 });
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
    const endDate = yPositionToDate(y);

    setDragEnd({ y, date: endDate });

    // Update selection box visualization
    const top = Math.min(dragStart.y, y);
    const height = Math.abs(y - dragStart.y);
    setSelectionBox({ top, height });
  };

  // Handle mouse up to complete drag
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      // Reset state
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setSelectionBox(null);
      return;
    }

    // Calculate the date range
    const startDate = dragStart.date < dragEnd.date ? dragStart.date : dragEnd.date;
    const endDate = dragStart.date < dragEnd.date ? dragEnd.date : dragStart.date;

    // Minimum duration check (at least 1 day)
    const duration = Math.abs(endDate.getTime() - startDate.getTime());
    if (duration < 24 * 60 * 60 * 1000) {
      // Reset state
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setSelectionBox(null);
      return;
    }

    // Open modal with pre-filled dates (not a real goal, just dates)
    setSelectedGoal(null); // Clear any selected goal
    // Store the dates separately to pass to modal
    const draggedDates = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    // Open modal with the dragged dates
    setSelectedGoal(draggedDates);
    onModalOpen();

    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setSelectionBox(null);
  };

  const handleSaveGoal = async (goalData: any) => {
    if (!lifeGoalsCalendarId) {
      toast({
        title: 'No calendar available',
        description: 'Please create a calendar first',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    console.log('💾 Saving life goal with data:', goalData);
    console.log('📝 Is editing?', !!goalData.id, 'Goal ID:', goalData.id);

    try {
      // Prepare metadata following iCal X-property standard
      const metadata = {
        'X-GOAL-TIER': 'LIFE',
        'X-LIFE-GOAL-TYPE': goalData.goalType,
        'X-FINANCIAL-TARGET': goalData.financialTarget || 0,
        'X-OPPORTUNITY-IDS': goalData.opportunityIds || [],
        'X-PARENT-GOAL-ID': goalData.parentGoalId || null,
        'X-DEPENDENCIES': goalData.dependencies || [],
        'X-COMPLETION-PERCENTAGE': 0,
        'X-CREATED-BY': 'life-goals-timeline',
        'X-ICAL-VERSION': 'RFC5545',
      };

      // Ensure dates are valid
      const startDate = goalData.startDate ? new Date(goalData.startDate) : new Date();
      const endDate = goalData.endDate ? new Date(goalData.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      // Build categories array without null values
      const categories = ['LIFE_GOAL'];
      if (goalData.goalType) {
        categories.push(goalData.goalType);
      }

      const eventInput = {
        calendarId: lifeGoalsCalendarId,
        title: goalData.title || 'Untitled Goal',
        description: goalData.description || '',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        isAllDay: true,
        type: 'EVENT',
        status: 'CONFIRMED',
        visibility: 'PRIVATE',
        metadata,
        categories,
      };

      console.log('📤 Sending GraphQL mutation with input:', eventInput);

      if (goalData.id) {
        // Update existing goal - make sure ID is provided
        console.log('🔄 Updating goal with ID:', goalData.id);
        const { data } = await updateLifeGoalMutation({
          variables: {
            id: goalData.id,
            input: eventInput,
          },
        });
        console.log('✅ Goal updated:', data.updateEvent);
        toast({
          title: 'Life goal updated',
          description: `"${goalData.title}" has been updated`,
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new goal
        console.log('➕ Creating new goal');
        const { data } = await createLifeGoalMutation({
          variables: {
            input: eventInput,
          },
        });
        console.log('✅ Goal created:', data.createEvent);
        toast({
          title: 'Life goal created',
          description: `"${goalData.title}" has been added to your timeline`,
          status: 'success',
          duration: 3000,
        });
      }

      // Clear selected goal after save
      setSelectedGoal(null);

      // Refetch goals to update the display
      await refetchGoals();
      onModalClose();
    } catch (error) {
      console.error('❌ Error saving life goal:', error);
      toast({
        title: 'Error saving goal',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />

      {/* Sticky Header and Controls */}
      <Box
        position="sticky"
        top="0"
        zIndex={100}
        bg={bg}
        borderBottom="1px solid"
        borderColor={cardBorder}
        boxShadow="sm"
      >
        <Box px={4} py={3}>
          <VStack spacing={3} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <HStack>
                  <FiTarget size={24} color={textPrimary} />
                  <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                    Life Goals Timeline
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textSecondary}>
                  Plan your life from years to days. Link goals to opportunities.
                </Text>
              </VStack>

              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddGoal}
              >
                Add Life Goal
              </Button>
            </Flex>

            {/* Controls Panel */}
            <Box
              p={3}
              bg={cardBg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={cardBorder}
            >
            <VStack spacing={3} align="stretch">
              {/* Zoom Controls */}
              <HStack spacing={4} flexWrap="wrap">
                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                  Zoom Level:
                </Text>
                <Badge colorScheme="blue" fontSize="sm">
                  {currentZoom.label}
                </Badge>
                <IconButton
                  aria-label="Zoom out"
                  icon={<FiZoomOut />}
                  size="sm"
                  onClick={zoomOut}
                  isDisabled={zoomIndex === 0}
                />
                <Slider
                  value={zoomIndex}
                  min={0}
                  max={ZOOM_LEVELS.length - 1}
                  step={1}
                  onChange={handleZoomSlider}
                  flex="1"
                  maxW="300px"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <IconButton
                  aria-label="Zoom in"
                  icon={<FiZoomIn />}
                  size="sm"
                  onClick={zoomIn}
                  isDisabled={zoomIndex === ZOOM_LEVELS.length - 1}
                />
                <Button
                  onClick={handleScrollToNow}
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<TimeIcon />}
                  size="sm"
                  fontWeight="medium"
                  title="Scroll to today"
                >
                  Now
                </Button>
              </HStack>

              {/* Display Toggles */}
              <HStack spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="show-life-goals" mb="0" fontSize="sm" color={textPrimary}>
                    Show Life Goals
                  </FormLabel>
                  <Switch
                    id="show-life-goals"
                    isChecked={showLifeGoals}
                    onChange={(e) => setShowLifeGoals(e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="show-events" mb="0" fontSize="sm" color={textPrimary}>
                    Show Calendar Events
                  </FormLabel>
                  <Switch
                    id="show-events"
                    isChecked={showRegularEvents}
                    onChange={(e) => setShowRegularEvents(e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
              </HStack>

              {/* Birthdate Selector */}
              <HStack spacing={4}>
                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                  Your Birthdate:
                </Text>
                <InputGroup maxW="200px">
                  <InputLeftElement pointerEvents="none">
                    <FiCalendar color={textSecondary} />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={birthDateStr}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setBirthDateStr(newDate);
                      localStorage.setItem('lifeGoalsBirthDate', newDate);
                    }}
                    size="sm"
                    bg={cardBg}
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: getColor("primary.500", colorMode) }}
                    _focus={{ borderColor: getColor("primary.500", colorMode), boxShadow: "0 0 0 1px " + getColor("primary.500", colorMode) }}
                  />
                </InputGroup>
                <Text fontSize="xs" color={textSecondary}>
                  Timeline spans 120 years from birth
                </Text>
              </HStack>

              {/* Stats and Instructions */}
              <HStack spacing={4} fontSize="xs" color={textSecondary}>
                <Text>Timeline: {currentZoom.displayUnit}</Text>
                <Text>•</Text>
                <Text>Total: {totalDays.toLocaleString()} days</Text>
                <Text>•</Text>
                <Text>Height: {Math.round(timelineHeight)}px</Text>
                <Text>•</Text>
                <Text fontWeight="medium" color={getColor("primary.500", colorMode)}>
                  💡 Click and drag on timeline to create a goal
                </Text>
              </HStack>
            </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Timeline Container */}
      <Box px={4} py={4}>
        <VStack spacing={4} align="stretch">
          <Box
            ref={timelineRef}
            position="relative"
            bg={cardBg}
            borderRadius="md"
            borderWidth="1px"
            borderColor={cardBorder}
          >
            {/* Timeline Content */}
            <Flex>
              {/* Time Ruler */}
              <TimelineRuler
                birthDate={birthDate}
                endDate={endDate}
                zoomConfig={currentZoom}
                totalHeight={timelineHeight}
              />

              {/* Goals Lane */}
              <Box
                flex="1"
                position="relative"
                minH={`${timelineHeight}px`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                cursor={isDragging ? 'grabbing' : 'crosshair'}
                userSelect="none"
              >
                {/* Today Indicator */}
                <Box
                  position="absolute"
                  top={`${Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) * currentZoom.pixelsPerDay}px`}
                  left="0"
                  right="0"
                  h="2px"
                  bg="red.500"
                  zIndex={100}
                >
                  <Badge
                    position="absolute"
                    left="10px"
                    top="-12px"
                    colorScheme="red"
                    fontSize="xs"
                  >
                    TODAY
                  </Badge>
                </Box>

                {/* Selection Box (while dragging) */}
                {selectionBox && (
                  <Box
                    position="absolute"
                    top={`${selectionBox.top}px`}
                    left="0"
                    right="0"
                    height={`${selectionBox.height}px`}
                    bg="blue.500"
                    opacity={0.2}
                    borderWidth="2px"
                    borderColor="blue.500"
                    borderRadius="md"
                    pointerEvents="none"
                    zIndex={50}
                  />
                )}

                {/* Life Goals */}
                {showLifeGoals && lifeGoals.map((goal) => (
                  <Box className="life-goal-card" key={goal.id}>
                    <LifeGoalCard
                      goal={goal}
                      birthDate={birthDate}
                      zoomConfig={currentZoom}
                      onEdit={handleEditGoal}
                      onResize={handleResizeGoal}
                      onDelete={handleDeleteGoal}
                    />
                  </Box>
                ))}

                {/* Regular Events (as small markers) */}
                {showRegularEvents && (
                  <Text
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    color={textSecondary}
                    fontSize="sm"
                  >
                    Regular events display coming soon...
                  </Text>
                )}

                {/* Empty State or Loading */}
                {calendarsLoading || goalsLoading ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100%"
                    color={textSecondary}
                  >
                    <Text fontSize="lg">Loading your life goals...</Text>
                  </Flex>
                ) : lifeGoals.length === 0 && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100%"
                    color={textSecondary}
                  >
                    <FiTarget size={48} />
                    <Text mt={4} fontSize="lg" fontWeight="medium">
                      No life goals yet
                    </Text>
                    <Text fontSize="sm" mt={2}>
                      Start by adding your first long-term goal
                    </Text>
                    <Button
                      mt={4}
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={handleAddGoal}
                    >
                      Add Your First Goal
                    </Button>
                  </Flex>
                )}
              </Box>
            </Flex>
          </Box>
        </VStack>
      </Box>
      <FooterWithFourColumns />

      {/* Life Goal Modal */}
      <LifeGoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedGoal(null);
          onModalClose();
        }}
        goal={selectedGoal && selectedGoal.id ? selectedGoal : null}
        initialDates={selectedGoal && !selectedGoal.id ? {
          startDate: selectedGoal.startDate,
          endDate: selectedGoal.endDate
        } : undefined}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
    </Box>
  );
};

export default LifeGoalsTimeline;