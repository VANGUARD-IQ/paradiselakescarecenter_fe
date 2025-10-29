import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Collapse,
  Portal,
  Checkbox,
  Badge,
  Icon,
  Tooltip,
  Select,
  Divider,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  useColorMode,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { 
  FiFilter, 
  FiX,
  FiCalendar,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiUsers,
  FiClock,
  FiBell,
  FiGlobe,
  FiTag,
} from 'react-icons/fi';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { getColor } from '../../brandConfig';

// GraphQL query for calendar tags
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

// Animations
const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(54, 158, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(54, 158, 255, 0.8), 0 0 40px rgba(54, 158, 255, 0.4); }
  100% { box-shadow: 0 0 5px rgba(54, 158, 255, 0.5); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

interface EventType {
  id: string;
  label: string;
  icon: any;
  color: string;
  count?: number;
  description?: string;
}

interface FloatingEventFilterProps {
  events: any[];
  calendarId: string;
  onFilterChange: (filters: Set<string>) => void;
  onTimezoneChange?: (timezone: string | null) => void;
  onTagFilterChange?: (tags: Set<string>) => void;
}

export const FloatingEventFilter: React.FC<FloatingEventFilterProps> = ({ events, calendarId, onFilterChange, onTimezoneChange, onTagFilterChange }) => {
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  
  // Fetch calendar tags
  const { data: tagsData } = useQuery(GET_CALENDAR_TAGS, {
    variables: { calendarId },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });
  
  const calendarTags = tagsData?.calendarTags || [];
  
  // Popular timezones for quick selection
  const timezones = [
    { value: '', label: 'No secondary timezone', offset: '' },
    { value: 'Europe/London', label: 'London', offset: 'GMT' },
    { value: 'Europe/Paris', label: 'Paris', offset: 'CET' },
    { value: 'America/New_York', label: 'New York', offset: 'EST' },
    { value: 'America/Los_Angeles', label: 'Los Angeles', offset: 'PST' },
    { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'JST' },
    { value: 'Asia/Singapore', label: 'Singapore', offset: 'SGT' },
    { value: 'Asia/Dubai', label: 'Dubai', offset: 'GST' },
    { value: 'Australia/Sydney', label: 'Sydney', offset: 'AEDT' },
    { value: 'Pacific/Auckland', label: 'Auckland', offset: 'NZDT' },
  ];

  // Define event types with their icons and colors
  const eventTypes: EventType[] = [
    {
      id: 'standard',
      label: 'Standard Events',
      icon: FiCalendar,
      color: 'blue',
      description: 'Regular calendar events'
    },
    {
      id: 'ical_inbound',
      label: 'Inbound iCal',
      icon: FiMail,
      color: 'green',
      description: 'Invites received from others'
    },
    {
      id: 'ical_outbound',
      label: 'Outbound iCal',
      icon: FiSend,
      color: 'purple',
      description: 'Invites you sent'
    },
    {
      id: 'sms_broadcast',
      label: 'SMS Events',
      icon: FiMessageSquare,
      color: 'orange',
      description: 'Events with SMS reminders'
    },
    {
      id: 'meeting',
      label: 'Meetings',
      icon: FiUsers,
      color: 'teal',
      description: 'Events with multiple attendees'
    },
    {
      id: 'reminder',
      label: 'With Reminders',
      icon: FiBell,
      color: 'yellow',
      description: 'Events with notifications'
    },
    {
      id: 'all_day',
      label: 'All Day Events',
      icon: FiClock,
      color: 'pink',
      description: 'Full day events'
    },
  ];

  // Count events by type and tags
  const getEventTypeCounts = () => {
    const counts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    
    events.forEach(event => {
      // Standard events (default)
      if (!event.extendedProps?.isInboundICalInvite && 
          !event.extendedProps?.metadata?.['X-EVENT-TYPE']) {
        counts.standard = (counts.standard || 0) + 1;
      }
      
      // Inbound iCal
      if (event.extendedProps?.isInboundICalInvite) {
        counts.ical_inbound = (counts.ical_inbound || 0) + 1;
      }
      
      // Outbound iCal
      if (event.extendedProps?.metadata?.['X-EVENT-TYPE'] === 'ICAL_INVITE') {
        counts.ical_outbound = (counts.ical_outbound || 0) + 1;
      }
      
      // SMS Broadcast
      if (event.extendedProps?.metadata?.['X-EVENT-TYPE'] === 'SMS_BROADCAST') {
        counts.sms_broadcast = (counts.sms_broadcast || 0) + 1;
      }
      
      // Meetings (events with attendees)
      if (event.extendedProps?.attendees?.length > 0) {
        counts.meeting = (counts.meeting || 0) + 1;
      }
      
      // Events with reminders
      if (event.extendedProps?.reminders?.length > 0) {
        counts.reminder = (counts.reminder || 0) + 1;
      }
      
      // All day events
      if (event.allDay) {
        counts.all_day = (counts.all_day || 0) + 1;
      }
      
      // Count tags
      if (event.extendedProps?.categories?.length > 0) {
        event.extendedProps.categories.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return { eventCounts: counts, tagCounts };
  };

  const { eventCounts, tagCounts } = getEventTypeCounts();


  // Initialize with all event type filters active, but no tag filters
  useEffect(() => {
    const allTypeIds = eventTypes.map(type => type.id);
    setActiveFilters(new Set(allTypeIds));
    onFilterChange(new Set(allTypeIds));
  }, []);
  
  // When tags are loaded, don't select any by default
  useEffect(() => {
    // Keep tags unselected by default - empty set means show all events
    if (onTagFilterChange) {
      onTagFilterChange(new Set());
    }
  }, [calendarTags]);

  // Handle filter toggle
  const handleFilterToggle = (typeId: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(typeId)) {
      newFilters.delete(typeId);
    } else {
      newFilters.add(typeId);
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Toggle all filters
  const toggleAllFilters = () => {
    if (activeFilters.size === eventTypes.length) {
      // All are selected, deselect all
      setActiveFilters(new Set());
      onFilterChange(new Set());
    } else {
      // Some or none are selected, select all
      const allTypeIds = eventTypes.map(type => type.id);
      setActiveFilters(new Set(allTypeIds));
      onFilterChange(new Set(allTypeIds));
    }
  };
  
  // Handle tag toggle
  const handleTagToggle = (tagName: string) => {
    const newTags = new Set(activeTags);
    if (newTags.has(tagName)) {
      newTags.delete(tagName);
    } else {
      newTags.add(tagName);
    }
    setActiveTags(newTags);
    if (onTagFilterChange) {
      onTagFilterChange(newTags);
    }
  };
  
  // Toggle all tags
  const toggleAllTags = () => {
    if (activeTags.size === calendarTags.length) {
      // All are selected, deselect all
      setActiveTags(new Set());
      if (onTagFilterChange) {
        onTagFilterChange(new Set());
      }
    } else {
      // Some or none are selected, select all
      const allTagNames = calendarTags.map((tag: any) => tag.name);
      setActiveTags(new Set(allTagNames));
      if (onTagFilterChange) {
        onTagFilterChange(new Set(allTagNames));
      }
    }
  };
  
  // Handle timezone change
  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    if (onTimezoneChange) {
      onTimezoneChange(timezone || null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isExpanded && !target.closest('.floating-event-filter-container')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return (
    <Portal>
      <Box
        className="floating-event-filter-container"
        position="fixed"
        right="20px"
        top="60%"
        transform="translateY(-50%)"
        zIndex={997}
      >
        {/* Expanded Filter Panel */}
        <Collapse in={isExpanded} animateOpacity>
          <Box
            bg={cardBg}
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor={cardBorder}
            p={4}
            mb={4}
            minW="280px"
            maxW="320px"
            maxH="60vh"
            overflowY="auto"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(54, 158, 255, 0.1)"
            animation={`${slideIn} 0.3s ease-out`}
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(54, 158, 255, 0.3)',
                borderRadius: '2px',
              },
            }}
          >
            {/* Header */}
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Icon as={FiFilter} color="blue.400" />
                <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                  Calendar Settings
                </Text>
              </HStack>
              <Badge 
                colorScheme="blue" 
                fontSize="xs"
                borderRadius="full"
              >
                {activeFilters.size}/{eventTypes.length}
              </Badge>
            </HStack>
            
            {/* Timezone Selector */}
            <Box
              mb={4}
              p={3}
              bg={formBg}
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorder}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={FiGlobe} color="blue.400" boxSize={4} />
                <Text fontSize="xs" fontWeight="600" color={textSecondary}>
                  Secondary Timezone
                </Text>
              </HStack>
              <Select
                size="sm"
                value={selectedTimezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                bg={formBg}
                borderColor={cardBorder}
                color={textPrimary}
                fontSize="xs"
                _hover={{
                  borderColor: cardBorder,
                }}
                _focus={{
                  borderColor: cardBorder,
                  boxShadow: `0 0 0 1px ${cardBorder}`,
                }}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value} style={{ background: '#1a1a2e' }}>
                    {tz.label} {tz.offset && `(${tz.offset})`}
                  </option>
                ))}
              </Select>
              {selectedTimezone && (
                <Text fontSize="xs" color={textMuted} mt={2}>
                  Times will show in both local and {timezones.find(tz => tz.value === selectedTimezone)?.label} time
                </Text>
              )}
            </Box>
            
            <Divider borderColor={cardBorder} mb={4} />
            
            {/* Event Filters Header */}
            <HStack spacing={2} mb={3}>
              <Icon as={FiCalendar} color="blue.400" boxSize={4} />
              <Text fontSize="xs" fontWeight="600" color={textSecondary}>
                Event Types
              </Text>
            </HStack>

            {/* Select/Deselect All */}
            <Box
              mb={3}
              p={2}
              bg={formBg}
              borderRadius="md"
              border="1px solid"
              borderColor={cardBorder}
            >
              <Checkbox
                isChecked={activeFilters.size === eventTypes.length}
                isIndeterminate={activeFilters.size > 0 && activeFilters.size < eventTypes.length}
                onChange={toggleAllFilters}
                colorScheme="blue"
                size="sm"
              >
                <Text fontSize="xs" fontWeight="500" color={textSecondary}>
                  Select All
                </Text>
              </Checkbox>
            </Box>

            {/* Event Type Filters */}
            <VStack spacing={2} align="stretch">
              {eventTypes.map((type) => {
                const count = eventCounts[type.id] || 0;
                const isActive = activeFilters.has(type.id);
                
                return (
                  <Box
                    key={type.id}
                    p={2}
                    bg={isActive ? formBg : 'transparent'}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={isActive ? cardBorder : 'transparent'}
                    transition="all 0.2s"
                    _hover={{
                      bg: formBg,
                      borderColor: cardBorder,
                    }}
                  >
                    <HStack justify="space-between">
                      <Checkbox
                        isChecked={isActive}
                        onChange={() => handleFilterToggle(type.id)}
                        colorScheme={type.color}
                        size="sm"
                      >
                        <HStack spacing={2}>
                          <Icon 
                            as={type.icon} 
                            color={`${type.color}.400`}
                            boxSize={4}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={textPrimary}>
                              {type.label}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>
                              {type.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </Checkbox>
                      <Badge
                        colorScheme={type.color}
                        fontSize="xs"
                        variant={isActive ? 'solid' : 'subtle'}
                      >
                        {count}
                      </Badge>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            {/* Custom Tags Section */}
            {calendarTags.length > 0 && (
              <>
                <Divider borderColor={cardBorder} my={4} />
                
                {/* Tags Header */}
                <HStack spacing={2} mb={3}>
                  <Tooltip
                    label="Filter events by tags. When no tags are selected, all events are shown. Select one or more tags to show only events with those tags."
                    placement="left"
                    hasArrow
                    bg="gray.700"
                    color="white"
                    fontSize="xs"
                    px={3}
                    py={2}
                    borderRadius="md"
                    maxW="250px"
                    openDelay={200}
                  >
                    <Box display="inline-flex">
                      <Icon as={FiTag} color="blue.400" boxSize={4} cursor="help" />
                    </Box>
                  </Tooltip>
                  <Text fontSize="xs" fontWeight="600" color={textSecondary}>
                    Custom Tags
                  </Text>
                </HStack>
                
                {/* Select/Deselect All Tags */}
                <Box
                  mb={3}
                  p={2}
                  bg={formBg}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={cardBorder}
                >
                  <Checkbox
                    isChecked={activeTags.size === calendarTags.length}
                    isIndeterminate={activeTags.size > 0 && activeTags.size < calendarTags.length}
                    onChange={toggleAllTags}
                    colorScheme="blue"
                    size="sm"
                  >
                    <Text fontSize="xs" fontWeight="500" color={textSecondary}>
                      Select All Tags
                    </Text>
                  </Checkbox>
                </Box>
                
                {/* Tag Filters */}
                <Wrap spacing={2}>
                  {calendarTags.map((tag: any) => {
                    const count = tagCounts[tag.name] || 0;
                    const isActive = activeTags.has(tag.name);
                    
                    return (
                      <WrapItem key={tag.id}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant={isActive ? "solid" : "outline"}
                          backgroundColor={isActive ? tag.color : 'transparent'}
                          borderColor={tag.color}
                          color={isActive ? 'gray.800' : textPrimary}
                          cursor="pointer"
                          onClick={() => handleTagToggle(tag.name)}
                          _hover={{
                            transform: 'scale(1.05)',
                            boxShadow: `0 0 10px ${tag.color}40`,
                          }}
                          transition="all 0.2s"
                        >
                          <TagLabel>
                            {tag.name}
                            {count > 0 && (
                              <Badge
                                ml={2}
                                colorScheme={isActive ? "blackAlpha" : "gray"}
                                fontSize="xs"
                                variant="solid"
                              >
                                {count}
                              </Badge>
                            )}
                          </TagLabel>
                        </Tag>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </>
            )}

            {/* Summary */}
            <Box
              mt={4}
              p={3}
              bg={formBg}
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorder}
            >
              <Text fontSize="xs" color={textMuted} textAlign="center">
                Showing {activeFilters.size > 0 ?
                  `${Object.values(eventCounts).reduce((a, b) => a + b, 0)} events` :
                  'No events'}
              </Text>
            </Box>
          </Box>
        </Collapse>

        {/* Floating Filter Button */}
        <Tooltip 
          label={isExpanded ? "Close filters" : "Filter events"} 
          placement="left"
          hasArrow
        >
          <IconButton
            aria-label="Toggle event filters"
            icon={isExpanded ? <FiX /> : <FiFilter />}
            size="lg"
            borderRadius="full"
            bg={cardBg}
            color={textPrimary}
            border="2px solid"
            borderColor={cardBorder}
            boxShadow="0 10px 40px rgba(0, 0, 0, 0.8), 0 0 60px rgba(54, 158, 255, 0.2)"
            onClick={() => setIsExpanded(!isExpanded)}
            position="relative"
            _hover={{
              transform: 'scale(1.1)',
              borderColor: cardBorder,
              animation: `${glow} 2s ease infinite`,
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            animation={!isExpanded ? `${float} 3s ease-in-out infinite` : undefined}
            _before={!isExpanded ? {
              content: '""',
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              bottom: '-2px',
              left: '-2px',
              background: 'linear-gradient(45deg, #369eff, #147fd6, #369eff)',
              borderRadius: 'full',
              opacity: 0.3,
              filter: 'blur(10px)',
              animation: `${glow} 3s ease infinite`,
              zIndex: -1,
            } : undefined}
          >
            {/* Show badge with active filter count */}
            {activeFilters.size < eventTypes.length && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {activeFilters.size}
              </Badge>
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Portal>
  );
};