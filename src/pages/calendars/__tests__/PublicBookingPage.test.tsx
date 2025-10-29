import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { gql } from '@apollo/client';
import PublicBookingPage from '../booking/PublicBookingPage';

// Mock components that aren't critical for these tests
jest.mock('../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction', () => ({
  NavbarWithCallToAction: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('../../components/chakra/FooterWithFourColumns/FooterWithFourColumns', () => ({
  FooterWithFourColumns: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('../../booking/SunshineBackground', () => ({
  SunshineBackground: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sunshine-bg">{children}</div>
  ),
}));

// GraphQL Queries
const PUBLIC_CALENDAR_QUERY = gql`
  query PublicCalendar($slug: String!) {
    publicCalendar(slug: $slug) {
      id
      name
      description
      color
      bookingPageSlug
      bookingPageTitle
      bookingPageDescription
      bookingPageLogo
    }
  }
`;

const PUBLIC_EVENT_TYPES_QUERY = gql`
  query PublicBookableEventTypes($calendarSlug: String!) {
    publicBookableEventTypes(calendarSlug: $calendarSlug) {
      id
      name
      description
      durationMinutes
      isPaid
      price
      currency
      locationType
      location
      meetingLink
      isActive
    }
  }
`;

// Test data
const mockCalendar = {
  id: 'cal-123',
  name: 'Tom Miller',
  description: 'Book time with Tom',
  color: '#3B82F6',
  bookingPageSlug: 'tom-miller',
  bookingPageTitle: 'Book Time With Tom',
  bookingPageDescription: 'Choose a meeting type to get started',
  bookingPageLogo: null,
};

const mockEventTypes = [
  {
    id: 'evt-1',
    name: '30min Consultation',
    description: 'Quick consultation meeting',
    durationMinutes: 30,
    isPaid: false,
    price: 0,
    currency: 'USD',
    locationType: 'virtual',
    location: null,
    meetingLink: 'https://zoom.us/j/123',
    isActive: true,
  },
  {
    id: 'evt-2',
    name: '1hr Strategy Session',
    description: 'Deep dive strategy session',
    durationMinutes: 60,
    isPaid: true,
    price: 150,
    currency: 'USD',
    locationType: 'virtual',
    location: null,
    meetingLink: 'https://zoom.us/j/456',
    isActive: true,
  },
  {
    id: 'evt-3',
    name: 'Inactive Event',
    description: 'This should not appear',
    durationMinutes: 45,
    isPaid: false,
    price: 0,
    currency: 'USD',
    locationType: 'virtual',
    location: null,
    meetingLink: null,
    isActive: false,
  },
];

// Helper to render component with all providers
const renderWithProviders = (slug: string, mocks: any[] = []) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChakraProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/book/:slug" element={<PublicBookingPage />} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </MockedProvider>,
    { wrapper: ({ children }) => {
      // Mock useParams by navigating to the route
      window.history.pushState({}, '', `/book/${slug}`);
      return <>{children}</>;
    }}
  );
};

describe('PublicBookingPage', () => {
  describe('Rendering and Layout', () => {
    const successMocks = [
      {
        request: {
          query: PUBLIC_CALENDAR_QUERY,
          variables: { slug: 'tom-miller' },
        },
        result: {
          data: {
            publicCalendar: mockCalendar,
          },
        },
      },
      {
        request: {
          query: PUBLIC_EVENT_TYPES_QUERY,
          variables: { calendarSlug: 'tom-miller' },
        },
        result: {
          data: {
            publicBookableEventTypes: mockEventTypes,
          },
        },
      },
    ];

    it('should render without authentication', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('Book Time With Tom')).toBeInTheDocument();
      });

      // No login/auth UI should be present
      expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });

    it('should display calendar owner information', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('Book Time With Tom')).toBeInTheDocument();
      });

      expect(screen.getByText('Choose a meeting type to get started')).toBeInTheDocument();
    });

    it('should display navbar and footer', async () => {
      renderWithProviders('tom-miller', successMocks);

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Event Types Display', () => {
    const successMocks = [
      {
        request: {
          query: PUBLIC_CALENDAR_QUERY,
          variables: { slug: 'tom-miller' },
        },
        result: {
          data: {
            publicCalendar: mockCalendar,
          },
        },
      },
      {
        request: {
          query: PUBLIC_EVENT_TYPES_QUERY,
          variables: { calendarSlug: 'tom-miller' },
        },
        result: {
          data: {
            publicBookableEventTypes: mockEventTypes,
          },
        },
      },
    ];

    it('should list all active event types', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      expect(screen.getByText('1hr Strategy Session')).toBeInTheDocument();
    });

    it('should hide inactive event types', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      expect(screen.queryByText('Inactive Event')).not.toBeInTheDocument();
    });

    it('should show event type details', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      // Check for duration
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();

      // Check for description
      expect(screen.getByText('Quick consultation meeting')).toBeInTheDocument();
      expect(screen.getByText('Deep dive strategy session')).toBeInTheDocument();
    });

    it('should display pricing correctly', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      // Free event
      expect(screen.getByText('Free')).toBeInTheDocument();

      // Paid event
      expect(screen.getByText('$150')).toBeInTheDocument();
    });

    it('should show location type', async () => {
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      // Virtual location indicators
      const virtualIcons = screen.getAllByTestId(/video-icon|location-icon/i);
      expect(virtualIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      const loadingMocks = [
        {
          request: {
            query: PUBLIC_CALENDAR_QUERY,
            variables: { slug: 'tom-miller' },
          },
          result: {
            data: {
              publicCalendar: mockCalendar,
            },
          },
          delay: 100,
        },
      ];

      renderWithProviders('tom-miller', loadingMocks);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle invalid slug', async () => {
      const errorMocks = [
        {
          request: {
            query: PUBLIC_CALENDAR_QUERY,
            variables: { slug: 'invalid-slug' },
          },
          result: {
            data: {
              publicCalendar: null,
            },
          },
        },
      ];

      renderWithProviders('invalid-slug', errorMocks);

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const networkErrorMocks = [
        {
          request: {
            query: PUBLIC_CALENDAR_QUERY,
            variables: { slug: 'tom-miller' },
          },
          error: new Error('Network error'),
        },
      ];

      renderWithProviders('tom-miller', networkErrorMocks);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no event types', async () => {
      const emptyMocks = [
        {
          request: {
            query: PUBLIC_CALENDAR_QUERY,
            variables: { slug: 'tom-miller' },
          },
          result: {
            data: {
              publicCalendar: mockCalendar,
            },
          },
        },
        {
          request: {
            query: PUBLIC_EVENT_TYPES_QUERY,
            variables: { calendarSlug: 'tom-miller' },
          },
          result: {
            data: {
              publicBookableEventTypes: [],
            },
          },
        },
      ];

      renderWithProviders('tom-miller', emptyMocks);

      await waitFor(() => {
        expect(screen.getByText(/no event types available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Event Type Selection', () => {
    const successMocks = [
      {
        request: {
          query: PUBLIC_CALENDAR_QUERY,
          variables: { slug: 'tom-miller' },
        },
        result: {
          data: {
            publicCalendar: mockCalendar,
          },
        },
      },
      {
        request: {
          query: PUBLIC_EVENT_TYPES_QUERY,
          variables: { calendarSlug: 'tom-miller' },
        },
        result: {
          data: {
            publicBookableEventTypes: mockEventTypes,
          },
        },
      },
    ];

    it('should allow selecting an event type', async () => {
      const user = userEvent.setup();
      renderWithProviders('tom-miller', successMocks);

      await waitFor(() => {
        expect(screen.getByText('30min Consultation')).toBeInTheDocument();
      });

      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      await user.click(selectButton);

      // Week view or next step should appear
      await waitFor(() => {
        expect(screen.getByText(/select a time/i)).toBeInTheDocument();
      });
    });
  });
});
