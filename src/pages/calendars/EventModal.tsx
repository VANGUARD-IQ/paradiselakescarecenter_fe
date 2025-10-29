import React, { useState, useEffect, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Stack,
  HStack,
  VStack,
  Switch,
  Text,
  useToast,
  InputGroup,
  InputLeftAddon,
  Badge,
  IconButton,
  Box,
  Divider,
  Link,
  Tooltip,
  Radio,
  RadioGroup,
  FormHelperText,
  Icon,
  useColorMode,
  useBreakpointValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CalendarIcon, BellIcon, InfoIcon, EmailIcon } from '@chakra-ui/icons';
import { FiMapPin, FiUsers, FiRepeat, FiMessageSquare, FiMail, FiCalendar, FiCheckSquare, FiFileText } from 'react-icons/fi';
import { ClientSearchSelector } from '../clients/components/ClientSearchSelector';
import { TagSelector } from './components/TagSelector';
import { getColor } from '../../brandConfig';
import { EventTasksTab } from './components/EventTasksTab';
import { EventNotesTab } from './components/EventNotesTab';
import { BookingDetailsView } from './components/BookingDetailsView';

/**
 * iCALENDAR METADATA STANDARD (RFC 5545 Section 3.8.8.2)
 * 
 * All custom properties in metadata MUST use "X-" prefix for non-standard properties.
 * This ensures compatibility with iCalendar standard and allows for proper synchronization
 * with external calendar systems (Google Calendar, Outlook, etc.)
 * 
 * STANDARD X-PROPERTIES FOR THIS APPLICATION:
 * 
 * Event Classification:
 * - X-EVENT-TYPE: Event type (STANDARD, SMS_BROADCAST, EMAIL_BROADCAST, BOTH_BROADCAST)
 * 
 * SMS Broadcast Properties:
 * - X-SMS-CONTENT: SMS message content (max 160 chars recommended)
 * - X-SMS-RECIPIENT-LIST: ID of the recipient list for SMS
 * - X-SMS-TEMPLATE-ID: Optional SMS template identifier
 * 
 * Email Broadcast Properties:
 * - X-EMAIL-SUBJECT: Email subject line
 * - X-EMAIL-CONTENT: Email body content (HTML supported)
 * - X-EMAIL-RECIPIENT-LIST: ID of the recipient list for email
 * - X-EMAIL-TEMPLATE-ID: Optional email template identifier
 * 
 * Broadcast Scheduling:
 * - X-BROADCAST-SCHEDULED: ISO 8601 datetime for scheduled send
 * - X-BROADCAST-STATUS: Status of broadcast (PENDING, SENT, FAILED)
 * - X-BROADCAST-SENT-COUNT: Number of messages sent
 * 
 * System Properties:
 * - X-CREATED-BY: System identifier (e.g., 'business-builder-calendar')
 * - X-ICAL-VERSION: RFC version compliance (e.g., 'RFC5545')
 * - X-MODULE-TYPE: If linked to another module (e.g., 'SMS_CAMPAIGN')
 * - X-MODULE-REF-ID: Reference ID in the linked module
 * 
 * Example metadata object:
 * {
 *   "X-EVENT-TYPE": "SMS_BROADCAST",
 *   "X-SMS-CONTENT": "Reminder: Your appointment is tomorrow at 9 AM",
 *   "X-SMS-RECIPIENT-LIST": "active-clients-list",
 *   "X-BROADCAST-SCHEDULED": "2025-09-15T09:00:00Z",
 *   "X-BROADCAST-STATUS": "PENDING",
 *   "X-CREATED-BY": "business-builder-calendar",
 *   "X-ICAL-VERSION": "RFC5545"
 * }
 * 
 * CRON JOB QUERIES:
 * Cron jobs can query events using these metadata fields:
 * - Find all SMS broadcasts: { "metadata.X-EVENT-TYPE": "SMS_BROADCAST" }
 * - Find pending broadcasts: { "metadata.X-BROADCAST-STATUS": "PENDING" }
 * - Find scheduled broadcasts: { "metadata.X-BROADCAST-SCHEDULED": { $lte: new Date() } }
 */

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CalendarEventInput!) {
    createEvent(input: $input) {
      id
      title
      startTime
      endTime
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

const CANCEL_EVENT = gql`
  mutation CancelEvent($id: String!, $reason: String) {
    cancelEvent(id: $id, reason: $reason)
  }
`;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  event?: any;
  initialDate?: string;
  initialTimeRange?: { start: string; end: string; isAllDay?: boolean };
  onSuccess: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  calendarId,
  event,
  initialDate,
  initialTimeRange,
  onSuccess
}) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isEdit = !!event && !!event.id;  // Only edit mode if event has an ID

  // Check if this is a public booking event
  const isPublicBooking = event?.extendedProps?.metadata?.['X-EVENT-TYPE'] === 'PUBLIC_BOOKING' ||
                          event?.metadata?.['X-EVENT-TYPE'] === 'PUBLIC_BOOKING';

  // Theme-aware colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
    status: 'CONFIRMED',
    visibility: 'PUBLIC',
    eventType: 'STANDARD', // STANDARD, SMS_BROADCAST, EMAIL_BROADCAST, BOTH_BROADCAST
    broadcastData: {
      smsContent: '',
      emailSubject: '',
      emailContent: '',
      recipientListId: '',
      selectedClientIds: [] as string[],
      recipientCount: 0,
      scheduledSendTime: '',
      useAlphaId: false // Add option to use AlphaId for SMS
    },
    attendees: [] as Array<{ email: string; name: string }>,
    recurrence: {
      enabled: false,
      frequency: 'DAILY',
      interval: 1,
      endDate: ''
    },
    reminders: [
      { minutes: 15, type: 'NOTIFICATION' }
    ],
    attachments: [] as Array<{ name: string; url: string }>,
    metadata: {} as Record<string, any>,
    categories: [] as string[],
    eventNotes: ''
  });

  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeeName, setNewAttendeeName] = useState('');

  useEffect(() => {
    console.log('🎬 EventModal opened');
    console.log('📝 Initial event prop:', event);
    console.log('📅 Calendar ID:', calendarId);
    console.log('📆 Initial Date:', initialDate);
    console.log('⏰ Initial Time Range:', initialTimeRange);
    console.log('✏️ Edit Mode:', isEdit);
    
    if (event && event.id) {
      console.log('🔧 Setting up edit mode with event:', event);
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      
      // Format for datetime-local input (which expects local time)
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      // Debug logging for metadata
      console.log('🔍 Event data loaded:');
      console.log('  Event ID:', event.id);
      console.log('  Full metadata:', event.metadata);
      console.log('  Metadata type:', typeof event.metadata);
      console.log('  X-EVENT-TYPE:', event.metadata?.['X-EVENT-TYPE']);
      console.log('  Event type resolved:', event.metadata?.['X-EVENT-TYPE'] || event.metadata?.eventType || 'STANDARD');
      
      // If metadata is a string, try to parse it
      let parsedMetadata = event.metadata;
      if (typeof event.metadata === 'string') {
        try {
          parsedMetadata = JSON.parse(event.metadata);
          console.log('  Parsed metadata:', parsedMetadata);
        } catch (e) {
          console.error('  Failed to parse metadata:', e);
        }
      }
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startTime: formatDateTimeLocal(startTime),
        endTime: formatDateTimeLocal(endTime),
        allDay: event.isAllDay || event.allDay || false,
        location: event.location?.address || event.location || '',
        status: event.status || 'CONFIRMED',
        visibility: event.visibility || 'PUBLIC',
        eventType: event.metadata?.['X-EVENT-TYPE'] || event.metadata?.eventType || 'STANDARD',
        broadcastData: {
          smsContent: event.metadata?.['X-SMS-CONTENT'] || event.metadata?.broadcastData?.smsContent || '',
          emailSubject: event.metadata?.['X-EMAIL-SUBJECT'] || event.metadata?.broadcastData?.emailSubject || '',
          emailContent: event.metadata?.['X-EMAIL-CONTENT'] || event.metadata?.broadcastData?.emailContent || '',
          recipientListId: event.metadata?.['X-SMS-RECIPIENT-LIST'] || event.metadata?.['X-EMAIL-RECIPIENT-LIST'] || event.metadata?.broadcastData?.recipientListId || '',
          selectedClientIds: event.metadata?.['X-SELECTED-CLIENT-IDS'] || event.metadata?.broadcastData?.selectedClientIds || [],
          recipientCount: event.metadata?.broadcastData?.recipientCount || 0,
          scheduledSendTime: event.metadata?.['X-BROADCAST-SCHEDULED'] || event.metadata?.broadcastData?.scheduledSendTime || '',
          useAlphaId: event.metadata?.['X-USE-ALPHA-ID'] || event.metadata?.broadcastData?.useAlphaId || false
        },
        attendees: event.attendees?.map((a: any) => ({
          clientId: a.clientId,
          email: a.email,
          name: a.name,
          status: a.status,
          role: a.role,
          isOrganizer: a.isOrganizer,
          rsvpRequired: a.rsvpRequired
        })) || [],
        recurrence: {
          enabled: !!event.recurrence,
          frequency: event.recurrence?.frequency || 'DAILY',
          interval: event.recurrence?.interval || 1,
          endDate: event.recurrence?.endDate || ''
        },
        reminders: event.reminders?.map((r: any) => ({
          minutes: r.minutesBefore || r.minutes || 15,
          type: r.method === 'PUSH' ? 'NOTIFICATION' : r.method || 'EMAIL'
        })) || [{ minutes: 15, type: 'NOTIFICATION' }],
        attachments: event.attachments?.map((a: any) => ({
          name: a.name,
          url: a.url
        })) || [],
        metadata: event.metadata || {},
        categories: event.categories || [],
        eventNotes: event.eventNotes || ''
      });
    } else if (initialTimeRange) {
      // Use the time range from drag selection
      console.log('⏰ Setting up create mode with time range:', initialTimeRange);

      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        startTime: initialTimeRange.start,
        endTime: initialTimeRange.end,
        allDay: initialTimeRange.isAllDay || false,  // Use isAllDay flag from selection
        status: 'CONFIRMED',
        visibility: 'PUBLIC',
        eventType: 'STANDARD',
        broadcastData: {
          smsContent: '',
          emailSubject: '',
          emailContent: '',
          recipientListId: '',
          selectedClientIds: [],
          recipientCount: 0,
          scheduledSendTime: '',
          useAlphaId: false
        },
        attendees: [],
        reminders: [{ minutes: 15, type: 'NOTIFICATION' }],
        attachments: [],
        metadata: {},
        categories: []
      }));
    } else if (initialDate) {
      // Set times based on clicked date for new event
      console.log('📅 Setting up create mode with date:', initialDate);
      
      // Create a date from the clicked date string
      // FullCalendar gives us YYYY-MM-DD format
      const [year, month, day] = initialDate.split('-').map(Number);
      
      // Create start time at 9 AM local time on the clicked date
      const start = new Date(year, month - 1, day, 9, 0, 0); // month is 0-indexed
      
      // Create end time 10 minutes later
      const end = new Date(year, month - 1, day, 9, 10, 0);
      
      // Format for datetime-local input (which expects local time in ISO format without timezone)
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      const startTimeFormatted = formatDateTimeLocal(start);
      const endTimeFormatted = formatDateTimeLocal(end);
      
      console.log('📅 Clicked date:', initialDate);
      console.log('⏰ Start time:', start);
      console.log('⏰ End time:', end);
      console.log('📝 Start formatted:', startTimeFormatted);
      console.log('📝 End formatted:', endTimeFormatted);
      
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        allDay: true,  // Default to all day when clicking on a day in month view
        status: 'CONFIRMED',
        visibility: 'PUBLIC',
        eventType: 'STANDARD',
        broadcastData: {
          smsContent: '',
          emailSubject: '',
          emailContent: '',
          recipientListId: '',
          selectedClientIds: [],
          recipientCount: 0,
          scheduledSendTime: '',
          useAlphaId: false
        },
        attendees: [],
        reminders: [{ minutes: 15, type: 'NOTIFICATION' }],
        attachments: [],
        metadata: {},
        categories: []
      }));
    } else {
      // Fallback for new event without specific date
      const now = new Date();
      const start = new Date(now);
      // Round to next hour
      start.setHours(start.getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      // Add 10 minutes for default duration
      end.setMinutes(end.getMinutes() + 10);
      
      setFormData(prev => ({
        ...prev,
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16)
      }));
    }
  }, [event, initialDate, initialTimeRange, isEdit]);

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: (data) => {
      console.log('✅ Event created successfully:', data);
      
      // Check if this was an iCal invite event
      const isICalInvite = formData.eventType === 'ICAL_INVITE';
      const hasAttendees = formData.attendees && formData.attendees.length > 0;
      const hasSelectedClients = formData.broadcastData.selectedClientIds && formData.broadcastData.selectedClientIds.length > 0;
      const recipientCount = (hasAttendees ? formData.attendees.length : 0) + 
                            (hasSelectedClients ? formData.broadcastData.selectedClientIds.length : 0);
      
      if (isICalInvite && recipientCount > 0) {
        toast({
          title: 'Event created and invitations sent',
          description: `Calendar invitations have been sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''}`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Event created',
          status: 'success',
          duration: 3000
        });
      }
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ Error creating event:', error);
      console.error('Error details:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      toast({
        title: 'Error creating event',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: (data) => {
      console.log('✅ Event updated successfully:', data);
      toast({
        title: 'Event updated',
        description: 'Your changes have been saved',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ Error updating event:', error);
      console.error('Error details:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      toast({
        title: 'Error updating event',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const [cancelEvent, { loading: deleting }] = useMutation(CANCEL_EVENT, {
    onCompleted: () => {
      toast({
        title: 'Event cancelled successfully',
        status: 'success',
        duration: 3000
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error cancelling event',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      cancelEvent({ 
        variables: { 
          id: event.id,
          reason: 'Event cancelled by user'
        },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    }
  };

  const handleSubmit = () => {
    console.log('🚀 EventModal - Starting event submission');
    console.log('📝 Form Data:', formData);
    console.log('📅 Calendar ID:', calendarId);
    console.log('✏️ Is Edit Mode:', isEdit);
    console.log('🆔 Event ID (if editing):', event?.id);
    
    const input: any = {
      calendarId,
      title: formData.title,
      description: formData.description || undefined,
      startTime: formData.allDay 
        ? new Date(new Date(formData.startTime).setHours(0, 0, 0, 0)).toISOString()
        : new Date(formData.startTime).toISOString(),
      endTime: formData.allDay
        ? new Date(new Date(formData.endTime).setHours(23, 59, 59, 999)).toISOString()
        : new Date(formData.endTime).toISOString(),
      isAllDay: formData.allDay,
      status: formData.status,
      visibility: formData.visibility,
      categories: formData.categories
    };
    
    // Add metadata following iCalendar X-property standards (RFC 5545 Section 3.8.8.2)
    // X-properties must begin with "X-" prefix for non-standard properties
    if (formData.eventType !== 'STANDARD' || formData.broadcastData.smsContent || formData.broadcastData.emailSubject) {
      input.metadata = {
        // Standard extension for event type
        'X-EVENT-TYPE': formData.eventType,
        
        // For iCal invites, mark that invitations should be sent
        ...(formData.eventType === 'ICAL_INVITE' && {
          'X-SEND-ICAL-INVITES': 'true',
          'X-ICAL-METHOD': 'REQUEST'
        }),
        
        // SMS broadcast properties
        ...(formData.broadcastData.smsContent && {
          'X-SMS-CONTENT': formData.broadcastData.smsContent,
          'X-SMS-RECIPIENT-LIST': formData.broadcastData.recipientListId || '',
          'X-SELECTED-CLIENT-IDS': formData.broadcastData.selectedClientIds,
          'X-USE-ALPHA-ID': formData.broadcastData.useAlphaId
        }),
        
        // Email broadcast properties
        ...(formData.broadcastData.emailSubject && {
          'X-EMAIL-SUBJECT': formData.broadcastData.emailSubject,
          'X-EMAIL-CONTENT': formData.broadcastData.emailContent,
          'X-EMAIL-RECIPIENT-LIST': formData.broadcastData.recipientListId || '',
          'X-SELECTED-CLIENT-IDS': formData.broadcastData.selectedClientIds
        }),
        
        // Broadcast scheduling
        ...(formData.broadcastData.scheduledSendTime && {
          'X-BROADCAST-SCHEDULED': formData.broadcastData.scheduledSendTime
        }),
        
        // Additional custom properties
        'X-CREATED-BY': 'business-builder-calendar',
        'X-ICAL-VERSION': 'RFC5545'
      };
    }
    
    console.log('📊 Base Input Object:', input);

    // Clean and add attendees if present
    if (formData.attendees.length > 0) {
      input.attendees = formData.attendees.map((a: any) => ({
        clientId: a.clientId,
        email: a.email,
        name: a.name,
        role: a.role || 'REQ_PARTICIPANT',
        status: a.status || 'NEEDS_ACTION',
        isOrganizer: a.isOrganizer || false,
        rsvpRequired: a.rsvpRequired !== undefined ? a.rsvpRequired : true
      }));
      console.log('👥 Attendees:', input.attendees);
    }

    // Clean and add attachments if present
    if (formData.attachments && formData.attachments.length > 0) {
      input.attachments = formData.attachments.map((a: any) => ({
        name: a.name,
        url: a.url,
        mimeType: a.mimeType,
        size: a.size
      }));
      console.log('📎 Attachments:', input.attachments);
    }

    // Only add location if it has data
    if (formData.location) {
      // Location is always stored as a string in formData
      input.location = {
        address: formData.location
      };
      console.log('📍 Location:', input.location);
    }

    // Transform reminders to match backend schema
    if (formData.reminders && formData.reminders.length > 0) {
      input.reminders = formData.reminders.map((r: any) => ({
        minutesBefore: r.minutesBefore || r.minutes || 15,
        method: r.method || (r.type === 'NOTIFICATION' ? 'PUSH' : r.type) || 'EMAIL',
        enabled: r.enabled !== undefined ? r.enabled : true
      }));
      console.log('🔔 Reminders:', input.reminders);
    }

    if (formData.recurrence.enabled) {
      input.isRecurring = true;
      input.recurrence = {
        frequency: formData.recurrence.frequency,
        interval: formData.recurrence.interval,
        until: formData.recurrence.endDate ? new Date(formData.recurrence.endDate).toISOString() : null
      };
      console.log('🔄 Recurrence:', input.recurrence);
    }

    console.log('🎯 Final Input Object to send:', JSON.stringify(input, null, 2));

    if (isEdit) {
      if (!event?.id) {
        console.error('❌ ERROR: Trying to update event but no event ID provided!');
        toast({
          title: 'Error',
          description: 'Cannot update event: Event ID is missing',
          status: 'error',
          duration: 5000
        });
        return;
      }
      console.log('📤 Calling updateEvent with ID:', event.id);
      console.log('📤 Variables:', { id: event.id, input });
      updateEvent({ 
        variables: { id: event.id, input },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    } else {
      console.log('📤 Calling createEvent');
      console.log('📤 Variables:', { input });
      createEvent({ 
        variables: { input },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    if (field === 'allDay') {
      if (checked) {
        // When enabling all-day, preserve the end date if it's different from start date
        // Only set end to match start if end is not set or is before start
        setFormData(prev => {
          const startDate = prev.startTime ? prev.startTime.split('T')[0] : '';
          const endDate = prev.endTime ? prev.endTime.split('T')[0] : '';

          // If end date is not set or is before start date, set it to start date
          const newEndTime = (!endDate || endDate < startDate) ? prev.startTime : prev.endTime;

          return {
            ...prev,
            [field]: checked,
            endTime: newEndTime
          };
        });
      } else {
        // When disabling all-day, just update the field
        setFormData(prev => ({ ...prev, [field]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: checked }));
    }
  };

  const handleRecurrenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurrence: { ...prev.recurrence, [field]: value }
    }));
  };

  const addAttendee = () => {
    if (newAttendeeEmail) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, { email: newAttendeeEmail, name: newAttendeeName }]
      }));
      setNewAttendeeEmail('');
      setNewAttendeeName('');
    }
  };

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { minutes: 15, type: 'NOTIFICATION' }]
    }));
  };

  const updateReminder = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const removeReminder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  // Draggable modal state
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      closeOnOverlayClick={false}
      initialFocusRef={titleInputRef}
    >
      <ModalOverlay bg="blackAlpha.300" />
      <ModalContent
        ref={modalRef}
        position="fixed"
        left={`${position.x}px`}
        top={`${position.y}px`}
        margin={0}
        maxW="900px"
        maxH="90vh"
        containerProps={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}
        onMouseDown={handleMouseDown}
        cursor={isDragging ? 'grabbing' : 'default'}
      >
        <ModalCloseButton zIndex={2} />
        <ModalHeader
          borderBottomWidth="1px"
          className="modal-drag-handle"
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          userSelect="none"
        >
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between" pr={8}>
              <HStack>
                <CalendarIcon />
                <Text>{isEdit ? 'Edit Event' : 'Create New Event'}</Text>
                {/* Development: Show Event ID */}
                {isEdit && event?.id && (
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">
                    ID: {event.id}
                  </Text>
                )}
              </HStack>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="This calendar follows the iCalendar (RFC 5545) standard for maximum compatibility">
                <HStack spacing={1}>
                  <InfoIcon boxSize={3} color="gray.500" />
                  <Text fontSize="xs" color="gray.500">iCalendar Standard</Text>
                </HStack>
              </Tooltip>
              <Link
                href="https://datatracker.ietf.org/doc/html/rfc5545"
                isExternal
                fontSize="xs"
                color="blue.500"
                textDecoration="underline"
              >
                RFC 5545
              </Link>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalBody overflowY="auto">
          {/* Event Title & Info Summary */}
          <Box mb={4}>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {formData.title || 'New Event'}
            </Text>
            {isEdit && (
              <HStack spacing={3} wrap="wrap">
                <Badge colorScheme="blue" fontSize="sm">
                  {formData.eventType.replace('_', ' ')}
                </Badge>
                <Badge colorScheme="green" fontSize="sm">
                  {formData.status}
                </Badge>
                {event?.totalTasks > 0 && (
                  <HStack spacing={1}>
                    <FiCheckSquare />
                    <Text fontSize="sm">
                      {event.completedTasks}/{event.totalTasks} tasks completed
                    </Text>
                    {event.taskProgressPercentage > 0 && (
                      <Text fontSize="xs" color="gray.600">
                        ({event.taskProgressPercentage}%)
                      </Text>
                    )}
                  </HStack>
                )}
              </HStack>
            )}
          </Box>

          <Tabs>
            <TabList>
              {isPublicBooking && (
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiUsers} />
                    <Text>Booking Details</Text>
                  </HStack>
                </Tab>
              )}
              <Tab>
                <HStack spacing={2}>
                  <FiCalendar />
                  <Text>Details</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiCheckSquare />
                  <Text>Tasks</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiFileText />
                  <Text>Notes</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Booking Details Tab - Only shown for PUBLIC_BOOKING events */}
              {isPublicBooking && (
                <TabPanel>
                  <BookingDetailsView
                    event={event}
                    calendarId={calendarId}
                    onCancel={() => {
                      // TODO: Implement cancel booking functionality
                      toast({
                        title: 'Cancel Booking',
                        description: 'Cancel booking functionality coming soon',
                        status: 'info',
                        duration: 3000
                      });
                    }}
                    onReschedule={() => {
                      // TODO: Implement reschedule functionality
                      toast({
                        title: 'Reschedule Booking',
                        description: 'Reschedule functionality coming soon',
                        status: 'info',
                        duration: 3000
                      });
                    }}
                    onSendReminder={() => {
                      // TODO: Implement send reminder functionality
                      toast({
                        title: 'Send Reminder',
                        description: 'Send reminder functionality coming soon',
                        status: 'info',
                        duration: 3000
                      });
                    }}
                  />
                </TabPanel>
              )}
              <TabPanel>
                <Stack spacing={4}>
                  {/* Public Booking Notice */}
                  {isPublicBooking && (
                    <Box p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                      <HStack spacing={2}>
                        <Icon as={FiUsers} color="blue.500" />
                        <Text fontSize="sm" color="blue.700" fontWeight="medium">
                          This is a public booking event. Visit the "Booking Details" tab to see full booking information.
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Basic Information */}
            <FormControl isRequired>
              <FormLabel>Event Title</FormLabel>
              <Input
                ref={titleInputRef}
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Team Meeting, Client Call"
                isReadOnly={isPublicBooking}
                bg={isPublicBooking ? formBg : undefined}
              />
              {isPublicBooking && (
                <FormHelperText fontSize="xs" color={textSecondary}>
                  Title is set by the booking system and cannot be edited
                </FormHelperText>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event details and agenda"
                rows={3}
                isReadOnly={isPublicBooking}
                bg={isPublicBooking ? formBg : undefined}
              />
              {isPublicBooking && (
                <FormHelperText fontSize="xs" color={textSecondary}>
                  Description is set by the booking system and cannot be edited
                </FormHelperText>
              )}
            </FormControl>

            {/* Event Type and Color - Hidden for PUBLIC_BOOKING events */}
            {!isPublicBooking && (
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>
                    <HStack>
                      <FiCalendar />
                      <Text>Event Type</Text>
                    </HStack>
                  </FormLabel>
                  <RadioGroup
                    value={formData.eventType}
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        eventType: value
                      }))
                    }}
                  >
                    <Stack direction="column" spacing={2}>
                      <Radio value="STANDARD">
                        <HStack>
                          <Text fontSize="sm">📅</Text>
                          <Text fontSize="sm">Standard Event</Text>
                        </HStack>
                      </Radio>
                      <Radio value="ICAL_INVITE">
                        <HStack>
                          <Text fontSize="sm">📤</Text>
                          <Text fontSize="sm">iCal Email Invite</Text>
                        </HStack>
                      </Radio>
                      <Radio value="SMS_BROADCAST">
                        <HStack>
                          <Text fontSize="sm">💬</Text>
                          <Text fontSize="sm">SMS Broadcast</Text>
                        </HStack>
                      </Radio>
                      <Radio value="EMAIL_BROADCAST">
                        <HStack>
                          <Text fontSize="sm">✉️</Text>
                          <Text fontSize="sm">Email Broadcast</Text>
                        </HStack>
                      </Radio>
                      <Radio value="BOTH_BROADCAST">
                        <HStack>
                          <Text fontSize="sm">📢</Text>
                          <Text fontSize="sm">SMS + Email Broadcast</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                  <FormHelperText fontSize="xs">
                    {formData.eventType === 'ICAL_INVITE' ?
                      'iCal invites will be sent to all attendees when event is created' :
                      'Broadcast events will trigger automated messages at the scheduled time'}
                  </FormHelperText>
                </FormControl>

              </HStack>
            )}

            {/* Broadcast Data Fields (shown only for broadcast events, not for PUBLIC_BOOKING) */}
            {!isPublicBooking && formData.eventType !== 'STANDARD' && formData.eventType !== 'ICAL_INVITE' && (
              <Box p={4} bg={formBg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="bold" fontSize="sm">
                    Broadcast Configuration
                    {formData.eventType === 'BOTH_BROADCAST' && (
                      <Badge ml={2} colorScheme="purple">SMS + Email</Badge>
                    )}
                  </Text>

                  {/* SMS Broadcast Section */}
                  {(formData.eventType === 'SMS_BROADCAST' || formData.eventType === 'BOTH_BROADCAST') && (
                    <Box>
                      {formData.eventType === 'BOTH_BROADCAST' && (
                        <Text fontSize="sm" fontWeight="medium" mb={2} color="blue.600">
                          📱 SMS Configuration
                        </Text>
                      )}
                      <FormControl>
                        <FormLabel fontSize="sm">SMS Message</FormLabel>
                        <Textarea
                          value={formData.broadcastData.smsContent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            broadcastData: { ...prev.broadcastData, smsContent: e.target.value }
                          }))}
                          placeholder="Enter SMS message content (160 characters recommended)"
                          rows={3}
                        />
                        <FormHelperText fontSize="xs">
                          {formData.broadcastData.smsContent.length}/160 characters
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl>
                        <HStack justify="space-between">
                          <FormLabel htmlFor="use-alpha-id" mb="0" fontSize="sm">
                            Use AlphaId for SMS
                          </FormLabel>
                          <Switch
                            id="use-alpha-id"
                            isChecked={formData.broadcastData.useAlphaId}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              broadcastData: { ...prev.broadcastData, useAlphaId: e.target.checked }
                            }))}
                          />
                        </HStack>
                        <FormHelperText fontSize="xs">
                          {formData.broadcastData.useAlphaId 
                            ? "SMS will be sent from your business name (AlphaId)" 
                            : "SMS will be sent from a dedicated phone number"}
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  )}

                  {/* Email Broadcast Section */}
                  {(formData.eventType === 'EMAIL_BROADCAST' || formData.eventType === 'BOTH_BROADCAST') && (
                    <Box>
                      {formData.eventType === 'BOTH_BROADCAST' && (
                        <>
                          <Divider my={3} />
                          <Text fontSize="sm" fontWeight="medium" mb={2} color="green.600">
                            ✉️ Email Configuration
                          </Text>
                        </>
                      )}
                      <FormControl>
                        <FormLabel fontSize="sm">Email Subject</FormLabel>
                        <Input
                          value={formData.broadcastData.emailSubject}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            broadcastData: { ...prev.broadcastData, emailSubject: e.target.value }
                          }))}
                          placeholder="Enter email subject line"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Email Content</FormLabel>
                        <Textarea
                          value={formData.broadcastData.emailContent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            broadcastData: { ...prev.broadcastData, emailContent: e.target.value }
                          }))}
                          placeholder="Enter email message content"
                          rows={5}
                        />
                      </FormControl>
                    </Box>
                  )}

                  {/* Recipients Section - Shown once for all broadcast types */}
                  {formData.eventType === 'BOTH_BROADCAST' && (
                    <Divider my={3} />
                  )}

                  <FormControl>
                    <FormLabel fontSize="sm">
                      Recipients
                      {formData.eventType === 'BOTH_BROADCAST' && (
                        <Text as="span" fontSize="xs" color="gray.600" ml={2}>
                          (will receive both SMS and Email)
                        </Text>
                      )}
                      {formData.eventType === 'SMS_BROADCAST' && (
                        <Text as="span" fontSize="xs" color="gray.600" ml={2}>
                          (will receive SMS only)
                        </Text>
                      )}
                      {formData.eventType === 'EMAIL_BROADCAST' && (
                        <Text as="span" fontSize="xs" color="gray.600" ml={2}>
                          (will receive Email only)
                        </Text>
                      )}
                    </FormLabel>
                    <ClientSearchSelector
                      selectedClients={formData.broadcastData.selectedClientIds}
                      onSelectionChange={(clientIds) => setFormData(prev => ({
                        ...prev,
                        broadcastData: { 
                          ...prev.broadcastData, 
                          selectedClientIds: clientIds,
                          recipientCount: clientIds.length
                        }
                      }))}
                      allowMultiple={true}
                      placeholder="Search for recipients by name, email, phone, or tags..."
                    />
                    <FormHelperText fontSize="xs">
                      Selected recipients: {formData.broadcastData.selectedClientIds.length}
                    </FormHelperText>
                  </FormControl>
                </VStack>
              </Box>
            )}

            {/* Date and Time */}
            {!isPublicBooking && (
              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>All Day Event</FormLabel>
                  <Switch
                    isChecked={formData.allDay}
                    onChange={(e) => handleSwitchChange('allDay')(e.target.checked)}
                  />
                </HStack>
              </FormControl>
            )}

            <VStack align="stretch" spacing={2}>
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Start {formData.allDay ? 'Date' : 'Date & Time'}</FormLabel>
                  <Input
                    type={formData.allDay ? 'date' : 'datetime-local'}
                    isReadOnly={isPublicBooking}
                    bg={isPublicBooking ? formBg : undefined}
                    name="startTime"
                    value={formData.allDay
                      ? formData.startTime.split('T')[0]
                      : formData.startTime}
                    onChange={(e) => {
                      handleChange(e);
                      // If all-day is checked and end date is not set or is before new start,
                      // update end time to match start
                      if (formData.allDay) {
                        const newStartDate = e.target.value.split('T')[0];
                        const currentEndDate = formData.endTime ? formData.endTime.split('T')[0] : '';

                        if (!currentEndDate || currentEndDate < newStartDate) {
                          setFormData(prev => ({ ...prev, endTime: e.target.value }));
                        }
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{formData.allDay ? 'End Date' : 'End Date & Time'}</FormLabel>
                  <Input
                    type={formData.allDay ? "date" : "datetime-local"}
                    name="endTime"
                    value={formData.allDay
                      ? (formData.endTime ? formData.endTime.split('T')[0] : '')
                      : formData.endTime}
                    onChange={handleChange}
                    isReadOnly={isPublicBooking}
                    bg={isPublicBooking ? formBg : undefined}
                  />
                </FormControl>
              </HStack>

              {isPublicBooking && (
                <Text fontSize="xs" color={textSecondary}>
                  Date and time are set by the booking and cannot be edited. Use the "Reschedule" action in Booking Details to change.
                </Text>
              )}
            </VStack>

            {/* Location */}
            <FormControl>
              <FormLabel>
                <HStack>
                  <FiMapPin />
                  <Text>Location</Text>
                </HStack>
              </FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Conference Room, Zoom Link"
              />
            </FormControl>
            
            {/* Tags */}
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <TagSelector
                calendarId={calendarId}
                selectedTags={formData.categories}
                onTagsChange={(tags) => setFormData({ ...formData, categories: tags })}
                placeholder="Add tags to categorize this event"
              />
            </FormControl>

            {/* Status and Visibility */}
            <HStack>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="TENTATIVE">Tentative</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Visibility</FormLabel>
                <Select name="visibility" value={formData.visibility} onChange={handleChange}>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                </Select>
              </FormControl>
            </HStack>

            <Divider />

            {/* Attendees */}
            <Box>
              <FormLabel>
                <HStack>
                  <FiUsers />
                  <Text>Attendees</Text>
                </HStack>
              </FormLabel>
              <Stack spacing={2}>
                {formData.attendees.map((attendee, index) => (
                  <HStack key={index}>
                    <Badge colorScheme="blue" px={2} py={1}>
                      {attendee.name || attendee.email}
                    </Badge>
                    <IconButton
                      aria-label="Remove attendee"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeAttendee(index)}
                    />
                  </HStack>
                ))}
                <HStack>
                  <Input
                    placeholder="Email"
                    value={newAttendeeEmail}
                    onChange={(e) => setNewAttendeeEmail(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={newAttendeeName}
                    onChange={(e) => setNewAttendeeName(e.target.value)}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Add attendee"
                    icon={<AddIcon />}
                    size="sm"
                    onClick={addAttendee}
                    isDisabled={!newAttendeeEmail}
                  />
                </HStack>
              </Stack>
            </Box>

            <Divider />

            {/* Recurrence */}
            <Box>
              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>
                    <HStack>
                      <FiRepeat />
                      <Text>Recurring Event</Text>
                    </HStack>
                  </FormLabel>
                  <Switch
                    isChecked={formData.recurrence.enabled}
                    onChange={(e) => handleRecurrenceChange('enabled', e.target.checked)}
                  />
                </HStack>
              </FormControl>

              {formData.recurrence.enabled && (
                <Stack spacing={2} mt={2}>
                  <HStack>
                    <FormControl>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        value={formData.recurrence.frequency}
                        onChange={(e) => handleRecurrenceChange('frequency', e.target.value)}
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Interval</FormLabel>
                      <InputGroup>
                        <Input
                          type="number"
                          value={formData.recurrence.interval}
                          onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                          min={1}
                        />
                        <InputLeftAddon>
                          {formData.recurrence.frequency.toLowerCase().replace('ly', '(s)')}
                        </InputLeftAddon>
                      </InputGroup>
                    </FormControl>
                  </HStack>
                  <FormControl>
                    <FormLabel>End Date (optional)</FormLabel>
                    <Input
                      type="date"
                      value={formData.recurrence.endDate}
                      onChange={(e) => handleRecurrenceChange('endDate', e.target.value)}
                    />
                  </FormControl>
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Reminders */}
            <Box>
              <FormLabel>
                <HStack>
                  <BellIcon />
                  <Text>Reminders</Text>
                </HStack>
              </FormLabel>
              <Stack spacing={2}>
                {formData.reminders.map((reminder, index) => (
                  <HStack key={index}>
                    <Input
                      type="number"
                      value={reminder.minutes}
                      onChange={(e) => updateReminder(index, 'minutes', parseInt(e.target.value))}
                      min={0}
                      width="100px"
                    />
                    <Select
                      value={reminder.type}
                      onChange={(e) => updateReminder(index, 'type', e.target.value)}
                    >
                      <option value="NOTIFICATION">Notification</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                    </Select>
                    <Text>minutes before</Text>
                    <IconButton
                      aria-label="Remove reminder"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeReminder(index)}
                    />
                  </HStack>
                ))}
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  variant="outline"
                  onClick={addReminder}
                >
                  Add Reminder
                </Button>
              </Stack>
            </Box>
                </Stack>
              </TabPanel>

              {/* Tasks Tab */}
              <TabPanel>
                {isEdit && event?.id ? (
                  <EventTasksTab eventId={event.id} />
                ) : (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Text>Save the event first to add tasks</Text>
                  </Box>
                )}
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel>
                <EventNotesTab
                  eventNotes={formData.eventNotes}
                  onSave={(notes) => {
                    setFormData(prev => ({ ...prev, eventNotes: notes }));
                  }}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" justifyContent={isEdit ? "space-between" : "flex-end"}>
          {isEdit && (
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              variant="outline"
              onClick={handleDelete}
              isLoading={deleting}
              size="sm"
            >
              Cancel Event
            </Button>
          )}
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={creating || updating}
              isDisabled={!formData.title || !formData.startTime || !formData.endTime}
              size="sm"
            >
              {isEdit ? 'Update Event' : 'Create Event'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventModal;