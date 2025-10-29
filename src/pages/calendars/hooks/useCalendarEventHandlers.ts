// ============================================================================
// HOOK: useCalendarEventHandlers
// ============================================================================

interface UseCalendarEventHandlersParams {
  currentView: string;
  calendarRef: React.RefObject<any>;
  eventsData: any;
  isMultiCalendar: boolean;
  calendarIds: string[];
  updateEvent: any;
  setNewEventDate: (date: string) => void;
  setSelectedTimeRange: (range: { start: string; end: string; isAllDay?: boolean } | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setSelectedEvent: (event: any) => void;
  setIsEventModalOpen: (open: boolean) => void;
  setSelectedICalInvite: (data: any) => void;
  setIsICalModalOpen: (open: boolean) => void;
}

interface UseCalendarEventHandlersReturn {
  handleDatesSet: (dateInfo: any) => void;
  handleDateClick: (info: any) => void;
  handleSelect: (info: any) => void;
  handleEventDrop: (info: any) => Promise<void>;
  handleEventResize: (info: any) => Promise<void>;
  handleEventClick: (info: any) => void;
}

/**
 * Custom hook to manage calendar event interaction handlers
 *
 * Features:
 * - Date and time selection handling
 * - Event drag & drop (move events)
 * - Event resize handling
 * - Event click to view/edit
 * - iCal invite detection and handling
 */
export const useCalendarEventHandlers = ({
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
}: UseCalendarEventHandlersParams): UseCalendarEventHandlersReturn => {

  // Handle view changes from FullCalendar directly (e.g., toolbar buttons)
  const handleDatesSet = (dateInfo: any) => {
    // This is a no-op handler - view changes are controlled by parent component
    // Kept for FullCalendar compatibility
  };

  const handleDateClick = (info: any) => {
    // Only handle date click in month view (for day selection)
    if (currentView === 'dayGridMonth') {
      const clickedDate = info.dateStr || info.date.toISOString();
      setNewEventDate(clickedDate);
      setSelectedTimeRange(null); // Clear any time range selection
      setIsCreateModalOpen(true);
      console.log('📅 Date clicked for new event:', clickedDate);
    }
    // In week/day view, clicking is handled by select
  };

  const handleSelect = (info: any) => {
    // This is triggered when user drags to select a time range
    console.log('⏰ Time range selected:', {
      start: info.start,
      end: info.end,
      view: info.view.type,
      allDay: info.allDay
    });

    // Check if this is an all-day selection
    const isAllDaySelection = info.allDay === true;

    // Format the dates for the modal
    const formatDateTimeLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setSelectedTimeRange({
      start: formatDateTimeLocal(info.start),
      end: formatDateTimeLocal(info.end),
      isAllDay: isAllDaySelection
    });
    setNewEventDate(''); // Clear date-only selection
    setIsCreateModalOpen(true);

    // Clear the selection visually
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.unselect();
    }
  };

  const handleEventDrop = async (info: any) => {
    console.log('📅 Event dropped:', {
      event: info.event.title,
      newStart: info.event.start,
      newEnd: info.event.end,
      oldEvent: info.oldEvent,
      allDay: info.event.allDay
    });

    // Get the full event data
    const eventsList = isMultiCalendar ? eventsData?.multiCalendarEvents : eventsData?.calendarEvents;
    const fullEvent = eventsList?.find((e: any) => e.id === info.event.id);

    if (!fullEvent) {
      console.error('Event not found in data');
      info.revert();
      return;
    }

    // Prepare the update input - include calendarId and proper attendee fields
    const updateInput: any = {
      calendarId: fullEvent.calendarId || calendarIds[0], // Include the calendar ID
      title: fullEvent.title,
      description: fullEvent.description,
      startTime: info.event.start.toISOString(),
      endTime: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
      isAllDay: info.event.allDay,
      location: fullEvent.location?.address || fullEvent.location?.name,
      status: fullEvent.status,
      visibility: fullEvent.visibility,
      categories: fullEvent.categories || [],
      attendees: fullEvent.attendees?.map((a: any) => ({
        clientId: a.clientId,
        email: a.email,
        name: a.name,
        role: a.role || 'REQ_PARTICIPANT', // Use correct enum value with underscore
        status: a.status || 'NEEDS_ACTION', // Use correct enum value with underscore
        isOrganizer: a.isOrganizer || false,
        rsvpRequired: a.rsvpRequired || false
      })) || [],
      reminders: fullEvent.reminders || [],
      metadata: fullEvent.metadata || {}
    };

    try {
      await updateEvent({
        variables: {
          id: info.event.id,
          input: updateInput
        }
      });
      console.log('✅ Event moved successfully');
    } catch (error) {
      console.error('❌ Failed to update event:', error);
      info.revert(); // Revert the change in the UI
    }
  };

  const handleEventResize = async (info: any) => {
    console.log('📅 Event resized:', {
      event: info.event.title,
      newStart: info.event.start,
      newEnd: info.event.end,
      oldEvent: info.oldEvent
    });

    // Get the full event data
    const eventsList = isMultiCalendar ? eventsData?.multiCalendarEvents : eventsData?.calendarEvents;
    const fullEvent = eventsList?.find((e: any) => e.id === info.event.id);

    if (!fullEvent) {
      console.error('Event not found in data');
      info.revert();
      return;
    }

    // Prepare the update input - include calendarId and proper attendee fields
    const updateInput: any = {
      calendarId: fullEvent.calendarId || calendarIds[0], // Include the calendar ID
      title: fullEvent.title,
      description: fullEvent.description,
      startTime: info.event.start.toISOString(),
      endTime: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
      isAllDay: info.event.allDay,
      location: fullEvent.location?.address || fullEvent.location?.name,
      status: fullEvent.status,
      visibility: fullEvent.visibility,
      categories: fullEvent.categories || [],
      attendees: fullEvent.attendees?.map((a: any) => ({
        clientId: a.clientId,
        email: a.email,
        name: a.name,
        role: a.role || 'REQ_PARTICIPANT', // Use correct enum value with underscore
        status: a.status || 'NEEDS_ACTION', // Use correct enum value with underscore
        isOrganizer: a.isOrganizer || false,
        rsvpRequired: a.rsvpRequired || false
      })) || [],
      reminders: fullEvent.reminders || [],
      metadata: fullEvent.metadata || {}
    };

    try {
      await updateEvent({
        variables: {
          id: info.event.id,
          input: updateInput
        }
      });
      console.log('✅ Event resized successfully');
    } catch (error) {
      console.error('❌ Failed to resize event:', error);
      info.revert(); // Revert the change in the UI
    }
  };

  const handleEventClick = (info: any) => {
    const event = info.event;

    // Log for developers
    console.log('📅 Calendar event clicked:', {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.extendedProps.description,
      isInboundICalInvite: event.extendedProps.isInboundICalInvite,
      iCalMethod: event.extendedProps.iCalMethod
    });

    // Find the full event data from eventsData
    const fullEvent = eventsData?.calendarEvents?.find((e: any) => e.id === event.id);

    console.log('🔍 Full event data from query:', fullEvent);

    if (fullEvent) {
      // Check if this is an iCal invite event
      if (fullEvent.isInboundICalInvite) {
        // Use the iCal invite modal
        const iCalEventData = {
          id: fullEvent.id,
          title: fullEvent.title,
          description: fullEvent.description,
          startDateTime: fullEvent.startTime,
          endDateTime: fullEvent.endTime,
          location: fullEvent.location?.address || fullEvent.location?.name,
          iCalMethod: fullEvent.iCalMethod,
          iCalOrganizerEmail: fullEvent.iCalOrganizerEmail,
          iCalOrganizerName: fullEvent.iCalOrganizerName,
          iCalResponseStatus: fullEvent.iCalResponseStatus,
          iCalReceivedAt: fullEvent.iCalReceivedAt,
          iCalSequence: fullEvent.iCalSequence,
          isInboundICalInvite: fullEvent.isInboundICalInvite,
          categories: fullEvent.categories || [],
          calendarId: fullEvent.calendarId || calendarIds[0]
        };

        setSelectedICalInvite(iCalEventData);
        setIsICalModalOpen(true);
      } else {
        // Use the regular event modal
        const eventForModal = {
          id: fullEvent.id,
          title: fullEvent.title,
          description: fullEvent.description,
          startTime: fullEvent.startTime,
          endTime: fullEvent.endTime,
          allDay: fullEvent.isAllDay,
          location: fullEvent.location?.name || '',
          status: fullEvent.status,
          color: fullEvent.color,
          attendees: fullEvent.attendees || [],
          metadata: fullEvent.metadata,  // Include metadata!
          visibility: fullEvent.visibility,
          reminders: fullEvent.reminders,
          categories: fullEvent.categories || []  // Include categories!
        };

        setSelectedEvent(eventForModal);
        setIsEventModalOpen(true);
      }
    }
  };

  return {
    handleDatesSet,
    handleDateClick,
    handleSelect,
    handleEventDrop,
    handleEventResize,
    handleEventClick,
  };
};
