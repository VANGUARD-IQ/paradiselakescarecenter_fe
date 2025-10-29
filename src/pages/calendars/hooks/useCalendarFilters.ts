import { useState, useMemo } from 'react';
import { EventInput } from '@fullcalendar/core';

// ============================================================================
// HOOK: useCalendarFilters
// ============================================================================

interface UseCalendarFiltersParams {
  eventsData: any;
  tagsData: any;
  isMultiCalendar: boolean;
  calendarColorMap: Map<string, string>;
}

interface UseCalendarFiltersReturn {
  activeEventFilters: Set<string>;
  setActiveEventFilters: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeTagFilters: Set<string>;
  setActiveTagFilters: React.Dispatch<React.SetStateAction<Set<string>>>;
  filteredEvents: EventInput[];
}

/**
 * Custom hook to manage calendar event filtering
 *
 * Features:
 * - Event type filtering (standard, iCal, SMS broadcast, meetings, reminders, all-day)
 * - Tag-based filtering
 * - Transforms events with colors and metadata
 * - Handles multi-calendar color mapping
 */
export const useCalendarFilters = ({
  eventsData,
  tagsData,
  isMultiCalendar,
  calendarColorMap,
}: UseCalendarFiltersParams): UseCalendarFiltersReturn => {
  const [activeEventFilters, setActiveEventFilters] = useState<Set<string>>(new Set());
  const [activeTagFilters, setActiveTagFilters] = useState<Set<string>>(new Set());

  // Transform and filter events for FullCalendar
  const filteredEvents: EventInput[] = useMemo(() => {
    const eventsList = isMultiCalendar ? eventsData?.multiCalendarEvents : eventsData?.calendarEvents;
    if (!eventsList) return [];

    console.log('📅 Transforming events:', eventsList.length);
    console.log('📊 Active filters:', Array.from(activeEventFilters));
    console.log('🏷️ Active tag filters:', Array.from(activeTagFilters));
    console.log('🎨 Available tags:', tagsData?.calendarTags);

    // Create a map of tag names to colors for quick lookup
    const tagColorMap = new Map();
    if (tagsData?.calendarTags) {
      tagsData.calendarTags.forEach((tag: any) => {
        tagColorMap.set(tag.name, tag.color);
      });
    }
    console.log('🎨 Tag color map:', Object.fromEntries(tagColorMap));

    const allEvents = eventsList
      .filter((event: any) => !event.isCancelled)
      .map((event: any) => {
        // Determine event color: first by calendar (if multi), then by tags, then default
        let eventColor = event.color || '#3B82F6'; // Default color

        // In multi-calendar mode, use calendar's color
        if (isMultiCalendar && event.calendarId) {
          eventColor = calendarColorMap.get(event.calendarId) || eventColor;
        }

        // If event has categories (tags), use the first tag's color
        if (event.categories && event.categories.length > 0) {
          const firstTagName = event.categories[0];
          const tagColor = tagColorMap.get(firstTagName);
          if (tagColor) {
            eventColor = tagColor;
            console.log(`🎨 Event "${event.title}" with tag "${firstTagName}" gets color: ${tagColor}`);
          } else {
            console.log(`⚠️ Event "${event.title}" has tag "${firstTagName}" but no color found in map`);
          }
        }

        return {
          id: event.id,
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          allDay: event.isAllDay,
          backgroundColor: eventColor,
          borderColor: eventColor,
          extendedProps: {
            description: event.description,
            status: event.status,
            location: event.location,
            attendees: event.attendees,
            isInboundICalInvite: event.isInboundICalInvite,
            iCalMethod: event.iCalMethod,
            iCalResponseStatus: event.iCalResponseStatus,
            iCalOrganizerName: event.iCalOrganizerName,
            iCalOrganizerEmail: event.iCalOrganizerEmail,
            metadata: event.metadata,
            reminders: event.reminders,
            categories: event.categories || [],
            calendarId: event.calendarId // Important: Include calendarId for multi-calendar display
          }
        };
      });

    // Filter events based on active filters
    // If no event type filters are active, show all events (changed behavior)
    const shouldFilterByType = activeEventFilters.size > 0;

    return allEvents.filter((event: any) => {
      // Check each filter type
      const eventType = event.extendedProps?.metadata?.['X-EVENT-TYPE'];
      const isStandard = !event.extendedProps?.isInboundICalInvite &&
                         (!eventType || eventType === 'PUBLIC_BOOKING'); // Include PUBLIC_BOOKING as standard
      const isInboundICal = event.extendedProps?.isInboundICalInvite;
      const isOutboundICal = eventType === 'ICAL_INVITE';
      const isSMSBroadcast = eventType === 'SMS_BROADCAST';
      const isMeeting = event.extendedProps?.attendees?.length > 0;
      const hasReminders = event.extendedProps?.reminders?.length > 0;
      const isAllDay = event.allDay;

      // Debug logging for each event
      console.log(`🔍 Filtering event "${event.title}":`, {
        isStandard,
        isInboundICal,
        isOutboundICal,
        isSMSBroadcast,
        isMeeting,
        hasReminders,
        isAllDay,
        metadata: event.extendedProps?.metadata,
        activeFilters: Array.from(activeEventFilters),
        shouldFilterByType
      });

      // Check event type filters (optional - if no filters active, show all)
      const passesTypeFilter = !shouldFilterByType || (
        (isStandard && activeEventFilters.has('standard')) ||
        (isInboundICal && activeEventFilters.has('ical_inbound')) ||
        (isOutboundICal && activeEventFilters.has('ical_outbound')) ||
        (isSMSBroadcast && activeEventFilters.has('sms_broadcast')) ||
        (isMeeting && activeEventFilters.has('meeting')) ||
        (hasReminders && activeEventFilters.has('reminder')) ||
        (isAllDay && activeEventFilters.has('all_day'))
      );

      console.log(`  → passesTypeFilter: ${passesTypeFilter}`);

      // Check tag filters (optional - if no tags selected, show all)
      const eventTags = event.extendedProps?.categories || [];
      const passesTagFilter = activeTagFilters.size === 0 ||
        eventTags.some((tag: string) => activeTagFilters.has(tag));

      // Debug log for tag filtering
      if (activeTagFilters.size > 0 && event.title?.includes('poker')) {
        console.log('🎯 Debug poker event:', {
          title: event.title,
          eventTags,
          activeTagFilters: Array.from(activeTagFilters),
          passesTagFilter,
          passesTypeFilter
        });
      }

      // Event must pass type filter (if any filters active) and tag filter (if tags selected)
      return passesTypeFilter && passesTagFilter;
    });
  }, [eventsData, activeEventFilters, activeTagFilters, tagsData, isMultiCalendar, calendarColorMap]);

  return {
    activeEventFilters,
    setActiveEventFilters,
    activeTagFilters,
    setActiveTagFilters,
    filteredEvents,
  };
};
