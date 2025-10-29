import React from 'react';
import { Box, Text, HStack, Badge } from '@chakra-ui/react';
import { EventContentArg } from '@fullcalendar/core';

interface CalendarEventContentProps {
  eventContent: EventContentArg;
  isMultiCalendar: boolean;
  calendarsData?: any;
}

/**
 * Component to render custom event content in FullCalendar
 *
 * Features:
 * - iCal invite badges (inbound/outbound)
 * - Event type icons (SMS, email, standard)
 * - Response status indicators
 * - Multi-calendar name display
 * - Time display in week/day views
 */
export const CalendarEventContent: React.FC<CalendarEventContentProps> = ({
  eventContent,
  isMultiCalendar,
  calendarsData,
}) => {
  const isInboundICalInvite = eventContent.event.extendedProps?.isInboundICalInvite;
  const iCalMethod = eventContent.event.extendedProps?.iCalMethod;
  const responseStatus = eventContent.event.extendedProps?.iCalResponseStatus;

  // Get calendar name if multi-calendar mode
  const getCalendarName = () => {
    if (!isMultiCalendar) return null;
    const calendarId = eventContent.event.extendedProps?.calendarId ||
                      eventContent.event._def?.extendedProps?.calendarId;
    if (!calendarId) return null;

    const calendars = calendarsData?.getCalendarsByIds || [];
    const calendar = calendars.find((cal: any) => cal.id === calendarId);
    return calendar?.name || null;
  };

  // Check if this is an outbound iCal invite (created with ICAL_INVITE type)
  const metadata = eventContent.event.extendedProps?.metadata;
  const isOutboundICalInvite = metadata?.['X-EVENT-TYPE'] === 'ICAL_INVITE';
  const eventType = metadata?.['X-EVENT-TYPE'] || 'STANDARD';

  // Determine the event type icon
  const getEventTypeIcon = () => {
    if (isInboundICalInvite) return '📨';
    if (isOutboundICalInvite) return '📤';

    switch(eventType) {
      case 'SMS_BROADCAST':
        return '💬';
      case 'EMAIL_BROADCAST':
        return '✉️';
      case 'BOTH_BROADCAST':
        return '📢';
      case 'ICAL_INVITE':
        return '📤';
      default:
        return '📅'; // Standard calendar event
    }
  };

  // Determine if we should show an iCal badge
  const showICalBadge = isInboundICalInvite || isOutboundICalInvite;

  return (
    <Box p={1} cursor="pointer" position="relative">
      {/* iCal Badge for both inbound and outbound */}
      {showICalBadge && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          colorScheme={
            isOutboundICalInvite ? 'purple' :  // Outbound invites are purple
            iCalMethod === 'CANCEL' ? 'red' :
            responseStatus === 'ACCEPTED' ? 'green' :
            responseStatus === 'DECLINED' ? 'red' :
            responseStatus === 'TENTATIVE' ? 'yellow' :
            'blue'
          }
          fontSize="9px"
          px={1}
          borderRadius="full"
          zIndex={2}
        >
          {isOutboundICalInvite ? '📤' :  // Outbound icon
           iCalMethod === 'CANCEL' ? '❌' :
           iCalMethod === 'REPLY' ? '💬' :
           iCalMethod === 'COUNTER' ? '🔀' :
           '📨'} iCal
        </Badge>
      )}

      <HStack spacing={1} align="flex-start">
        <Text fontSize="xs" flexShrink={0}>
          {getEventTypeIcon()}
        </Text>
        <Text fontSize="xs" fontWeight="bold" noOfLines={1} color="white" flex={1}>
          {eventContent.event.title}
        </Text>
      </HStack>

      {/* Show organizer for inbound iCal invites */}
      {isInboundICalInvite && eventContent.event.extendedProps?.iCalOrganizerName && (
        <Text fontSize="9px" opacity={0.8} color="white" noOfLines={1}>
          from {eventContent.event.extendedProps.iCalOrganizerName}
        </Text>
      )}

      {/* Show "sent by you" for outbound iCal invites */}
      {isOutboundICalInvite && (
        <Text fontSize="9px" opacity={0.8} color="white" noOfLines={1}>
          sent by you
        </Text>
      )}

      {/* Show time in week/day view */}
      {eventContent.view.type === 'timeGridWeek' && !eventContent.event.allDay && (
        <Text fontSize="xs" opacity={0.9} color="white">
          {eventContent.timeText}
        </Text>
      )}

      {/* Show calendar name in multi-calendar mode */}
      {isMultiCalendar && getCalendarName() && (
        <Text fontSize="9px" opacity={0.7} color="white" noOfLines={1} fontStyle="italic">
          {getCalendarName()}
        </Text>
      )}
    </Box>
  );
};
