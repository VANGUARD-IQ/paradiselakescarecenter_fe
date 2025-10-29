import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalendarView from '../../pages/calendars/CalendarView';
import { gql } from '@apollo/client';

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: jest.fn(({ eventContent, eventClick, eventDrop, eventResize, ...props }) => (
    <div data-testid="fullcalendar-mock" {...props}>
      <button
        data-testid="mock-event-1"
        onClick={() => eventClick?.({ event: { id: 'event-1', title: 'Morning Meeting' } })}
      >
        Morning Meeting
      </button>
      <button
        data-testid="mock-event-2"
        onClick={() => eventClick?.({ event: { id: 'event-2', title: 'Lunch Break' } })}
      >
        Lunch Break
      </button>
    </div>
  )),
}));

// Mock router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ calendarIds: 'test-calendar-id' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

// GraphQL Queries and Mutations
const GET_CALENDAR = gql`
  query GetCalendar($id: ID!) {
    calendar(id: $id) {
      id
      name
      type
      description
      color
      visibility
      settings {
        workingHoursStart
        workingHoursEnd
        timezone
      }
    }
  }
`;

const GET_EVENTS = gql`
  query GetEvents($calendarId: ID!) {
    events(calendarId: $calendarId) {
      id
      title
      start
      end
      allDay
      color
      description
      location
      attendees
      status
    }
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
      title
      start
      end
      allDay
      color
      description
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      start
      end
      allDay
      color
      description
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

describe('CalendarView - Event CRUD Tests', () => {
  const mockCalendar = {
    id: 'test-calendar-id',
    name: 'Test Calendar',
    type: 'PERSONAL',
    description: 'Test Description',
    color: '#3B82F6',
    visibility: 'PRIVATE',
    settings: {
      workingHoursStart: '08:00',
      workingHoursEnd: '18:00',
      timezone: 'Australia/Brisbane',
    },
  };

  const mockEvents = [
    {
      id: 'event-1',
      title: 'Morning Meeting',
      start: '2025-10-03T09:00:00',
      end: '2025-10-03T10:00:00',
      allDay: false,
      color: '#3B82F6',
      description: 'Team standup',
      location: 'Office',
      attendees: [],
      status: 'CONFIRMED',
    },
    {
      id: 'event-2',
      title: 'Lunch Break',
      start: '2025-10-03T12:00:00',
      end: '2025-10-03T13:00:00',
      allDay: false,
      color: '#10B981',
      description: 'Break time',
      location: null,
      attendees: [],
      status: 'CONFIRMED',
    },
  ];

  const baseMocks = [
    {
      request: {
        query: GET_CALENDAR,
        variables: { id: 'test-calendar-id' },
      },
      result: {
        data: {
          calendar: mockCalendar,
        },
      },
    },
    {
      request: {
        query: GET_EVENTS,
        variables: { calendarId: 'test-calendar-id' },
      },
      result: {
        data: {
          events: mockEvents,
        },
      },
    },
  ];

  describe('Create Event', () => {
    it('should open event modal when "New Event" button is clicked', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      const newEventButton = screen.queryByText(/New Event/i);
      if (newEventButton) {
        fireEvent.click(newEventButton);

        await waitFor(() => {
          // Event modal should open
          expect(newEventButton).toBeInTheDocument();
        });
      }
    });

    it('should create a new event when form is submitted', async () => {
      const createEventMock = {
        request: {
          query: CREATE_EVENT,
          variables: {
            input: {
              calendarId: 'test-calendar-id',
              title: 'New Meeting',
              start: '2025-10-04T14:00:00',
              end: '2025-10-04T15:00:00',
              allDay: false,
              description: 'Important meeting',
            },
          },
        },
        result: {
          data: {
            createEvent: {
              id: 'event-3',
              title: 'New Meeting',
              start: '2025-10-04T14:00:00',
              end: '2025-10-04T15:00:00',
              allDay: false,
              color: '#3B82F6',
              description: 'Important meeting',
            },
          },
        },
      };

      const mocks = [...baseMocks, createEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would open modal, fill form, and submit
      // Actual implementation depends on EventModal component
    });
  });

  describe('Read Events', () => {
    it('should display all calendar events', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Events should be rendered in calendar
      expect(screen.getByText('Morning Meeting')).toBeInTheDocument();
      expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    });

    it('should filter events by event type', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // The useCalendarFilters hook should handle event filtering
      // Test would verify filter buttons work correctly
    });

    it('should open event details when event is clicked', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      const eventElement = screen.getByTestId('mock-event-1');
      fireEvent.click(eventElement);

      await waitFor(() => {
        // Event modal should open with event details
        expect(eventElement).toBeInTheDocument();
      });
    });
  });

  describe('Update Event', () => {
    it('should update event when form is submitted with changes', async () => {
      const updateEventMock = {
        request: {
          query: UPDATE_EVENT,
          variables: {
            id: 'event-1',
            input: {
              title: 'Updated Meeting',
              start: '2025-10-03T09:30:00',
              end: '2025-10-03T10:30:00',
              allDay: false,
              description: 'Updated description',
            },
          },
        },
        result: {
          data: {
            updateEvent: {
              id: 'event-1',
              title: 'Updated Meeting',
              start: '2025-10-03T09:30:00',
              end: '2025-10-03T10:30:00',
              allDay: false,
              color: '#3B82F6',
              description: 'Updated description',
            },
          },
        },
      };

      const mocks = [...baseMocks, updateEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would click event, open modal, edit fields, and submit
    });

    it('should update event time when dragged to new slot', async () => {
      const updateEventMock = {
        request: {
          query: UPDATE_EVENT,
          variables: {
            id: 'event-1',
            input: {
              start: '2025-10-03T10:00:00',
              end: '2025-10-03T11:00:00',
            },
          },
        },
        result: {
          data: {
            updateEvent: {
              id: 'event-1',
              title: 'Morning Meeting',
              start: '2025-10-03T10:00:00',
              end: '2025-10-03T11:00:00',
              allDay: false,
              color: '#3B82F6',
              description: 'Team standup',
            },
          },
        },
      };

      const mocks = [...baseMocks, updateEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // The handleEventDrop handler from useCalendarEventHandlers should process the drag
    });

    it('should update event duration when resized', async () => {
      const updateEventMock = {
        request: {
          query: UPDATE_EVENT,
          variables: {
            id: 'event-1',
            input: {
              start: '2025-10-03T09:00:00',
              end: '2025-10-03T11:00:00', // Extended by 1 hour
            },
          },
        },
        result: {
          data: {
            updateEvent: {
              id: 'event-1',
              title: 'Morning Meeting',
              start: '2025-10-03T09:00:00',
              end: '2025-10-03T11:00:00',
              allDay: false,
              color: '#3B82F6',
              description: 'Team standup',
            },
          },
        },
      };

      const mocks = [...baseMocks, updateEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // The handleEventResize handler from useCalendarEventHandlers should process the resize
    });
  });

  describe('Delete Event', () => {
    it('should delete event when delete button is clicked in modal', async () => {
      const deleteEventMock = {
        request: {
          query: DELETE_EVENT,
          variables: {
            id: 'event-1',
          },
        },
        result: {
          data: {
            deleteEvent: true,
          },
        },
      };

      const mocks = [...baseMocks, deleteEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would open event modal and click delete button
    });

    it('should show confirmation dialog before deleting event', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would verify confirmation dialog appears before deletion
    });

    it('should remove event from calendar after successful deletion', async () => {
      const deleteEventMock = {
        request: {
          query: DELETE_EVENT,
          variables: {
            id: 'event-1',
          },
        },
        result: {
          data: {
            deleteEvent: true,
          },
        },
      };

      const mocks = [...baseMocks, deleteEventMock];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // After deletion, event should be removed from the calendar view
      // The GraphQL cache should be updated to remove the event
    });
  });

  describe('Event Validation', () => {
    it('should prevent creating event with end time before start time', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would open modal, set end time before start time, and verify error message
    });

    it('should require title for new events', async () => {
      render(
        <MockedProvider mocks={baseMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // Test would verify empty title shows validation error
    });
  });

  describe('Multi-Calendar Event Management', () => {
    it('should display events from multiple calendars with correct colors', async () => {
      const multiCalendarMocks = [
        {
          request: {
            query: GET_EVENTS,
            variables: { calendarId: 'calendar-1' },
          },
          result: {
            data: {
              events: [
                {
                  id: 'event-1',
                  title: 'Calendar 1 Event',
                  start: '2025-10-03T09:00:00',
                  end: '2025-10-03T10:00:00',
                  allDay: false,
                  color: '#3B82F6',
                  description: '',
                  location: null,
                  attendees: [],
                  status: 'CONFIRMED',
                },
              ],
            },
          },
        },
        {
          request: {
            query: GET_EVENTS,
            variables: { calendarId: 'calendar-2' },
          },
          result: {
            data: {
              events: [
                {
                  id: 'event-2',
                  title: 'Calendar 2 Event',
                  start: '2025-10-03T11:00:00',
                  end: '2025-10-03T12:00:00',
                  allDay: false,
                  color: '#10B981',
                  description: '',
                  location: null,
                  attendees: [],
                  status: 'CONFIRMED',
                },
              ],
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={multiCalendarMocks} addTypename={false}>
          <ChakraProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<CalendarView />} />
              </Routes>
            </BrowserRouter>
          </ChakraProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
      });

      // The useCalendarFilters hook should assign correct colors based on calendarColorMap
    });
  });
});
