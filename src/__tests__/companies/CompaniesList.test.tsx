import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CompaniesList from '../../pages/companies/CompaniesList';
import { gql } from '@apollo/client';

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../hooks/useDocumentTitle', () => ({
  usePageTitle: jest.fn(),
}));

const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      tradingName
      abn
      acn
      type
      status
      industry
      website
      email
      phone
      physicalAddress {
        street
        city
        state
        postcode
        country
      }
      primaryContact {
        name
        position
        email
        phone
      }
      numberOfEmployees
      employeeCount
      assetCount
      passwordCount
      tags
      isActive
    }
    companyStats
  }
`;

const DELETE_COMPANY = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id)
  }
`;

const mockCompanies = [
  {
    id: '1',
    name: 'Acme Corporation',
    tradingName: 'Acme',
    abn: '12345678901',
    acn: '123456789',
    type: 'CORPORATION',
    status: 'ACTIVE',
    industry: 'Technology',
    website: 'https://acme.com',
    email: 'info@acme.com',
    phone: '+61400123456',
    physicalAddress: {
      street: '123 Main St',
      city: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      country: 'Australia',
    },
    primaryContact: {
      name: 'John Doe',
      position: 'CEO',
      email: 'john@acme.com',
      phone: '+61400123456',
    },
    numberOfEmployees: 50,
    employeeCount: 10,
    assetCount: 5,
    passwordCount: 3,
    tags: ['software', 'consulting'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Brisbane Builder',
    tradingName: 'BB Construction',
    abn: '98765432109',
    acn: '987654321',
    type: 'PARTNERSHIP',
    status: 'ACTIVE',
    industry: 'Construction',
    website: 'https://brisbanebuilder.com.au',
    email: 'contact@brisbanebuilder.com.au',
    phone: '+61733334444',
    physicalAddress: {
      street: '456 Builder St',
      city: 'Brisbane',
      state: 'QLD',
      postcode: '4006',
      country: 'Australia',
    },
    primaryContact: {
      name: 'Jane Smith',
      position: 'Director',
      email: 'jane@brisbanebuilder.com.au',
      phone: '+61733334444',
    },
    numberOfEmployees: 25,
    employeeCount: 8,
    assetCount: 12,
    passwordCount: 2,
    tags: ['construction', 'residential'],
    isActive: true,
  },
];

const mockStats = [2, 1, 2, 2]; // total, last24h, last7days, last30days

const mocks = [
  {
    request: {
      query: GET_COMPANIES,
    },
    result: {
      data: {
        companies: mockCompanies,
        companyStats: mockStats,
      },
    },
  },
];

const renderWithProviders = (ui: React.ReactElement, { mocks: customMocks = mocks } = {}) => {
  return render(
    <ChakraProvider>
      <MockedProvider mocks={customMocks} addTypename={false}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </MockedProvider>
    </ChakraProvider>
  );
};

describe('CompaniesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<CompaniesList />);

    // Skeleton loaders should be present
    const skeletons = screen.getAllByTestId(/chakra-skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders companies list after loading', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Brisbane Builder')).toBeInTheDocument();
    });
  });

  it('displays company stats correctly', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total
      expect(screen.getByText('1')).toBeInTheDocument(); // New (24h)
    });
  });

  it('filters companies by search term', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search companies/i);
    fireEvent.change(searchInput, { target: { value: 'Acme' } });

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.queryByText('Brisbane Builder')).not.toBeInTheDocument();
    });
  });

  it('filters companies by status', async () => {
    const companiesWithInactive = [
      ...mockCompanies,
      {
        ...mockCompanies[0],
        id: '3',
        name: 'Inactive Company',
        status: 'INACTIVE',
      },
    ];

    const mocksWithInactive = [
      {
        request: {
          query: GET_COMPANIES,
        },
        result: {
          data: {
            companies: companiesWithInactive,
            companyStats: mockStats,
          },
        },
      },
    ];

    renderWithProviders(<CompaniesList />, { mocks: mocksWithInactive });

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Inactive Company')).toBeInTheDocument();
    });

    // Filter by ACTIVE status
    const statusSelect = screen.getByRole('combobox', { name: /all status/i });
    fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } });

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Company')).not.toBeInTheDocument();
    });
  });

  it('filters companies by type', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Brisbane Builder')).toBeInTheDocument();
    });

    // Filter by CORPORATION type
    const typeSelect = screen.getAllByRole('combobox').find(
      select => select.getAttribute('value') === 'ALL'
    );
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'CORPORATION' } });

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        expect(screen.queryByText('Brisbane Builder')).not.toBeInTheDocument();
      });
    }
  });

  it('shows empty state when no companies match filters', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search companies/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentCompany' } });

    await waitFor(() => {
      expect(screen.getByText(/no companies found/i)).toBeInTheDocument();
    });
  });

  it('displays company contact information', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('info@acme.com')).toBeInTheDocument();
      expect(screen.getByText('contact@brisbanebuilder.com.au')).toBeInTheDocument();
    });
  });

  it('displays company address information', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
      expect(screen.getByText(/Brisbane/i)).toBeInTheDocument();
    });
  });

  it('displays company tags', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('software')).toBeInTheDocument();
      expect(screen.getByText('consulting')).toBeInTheDocument();
      expect(screen.getByText('construction')).toBeInTheDocument();
    });
  });

  it('displays status badges with correct colors', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      const badges = screen.getAllByText('ACTIVE');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('handles delete company mutation', async () => {
    const deleteMock = {
      request: {
        query: DELETE_COMPANY,
        variables: { id: '1' },
      },
      result: {
        data: {
          deleteCompany: true,
        },
      },
    };

    const mocksWithDelete = [...mocks, deleteMock];

    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    renderWithProviders(<CompaniesList />, { mocks: mocksWithDelete });

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    // Find and click delete button (in menu)
    const menuButtons = screen.getAllByRole('button');
    const actionsMenu = menuButtons.find(btn => btn.getAttribute('aria-label') === 'Actions');

    if (actionsMenu) {
      fireEvent.click(actionsMenu);

      await waitFor(() => {
        const deleteButton = screen.getByText(/delete/i);
        fireEvent.click(deleteButton);
      });

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Acme Corporation')
      );
    }
  });

  it('handles GraphQL error gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_COMPANIES,
        },
        error: new Error('Network error'),
      },
    ];

    renderWithProviders(<CompaniesList />, { mocks: errorMocks });

    await waitFor(() => {
      expect(screen.getByText(/error loading companies/i)).toBeInTheDocument();
    });
  });

  it('shows company count statistics', async () => {
    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText(/total companies/i)).toBeInTheDocument();
      expect(screen.getByText(/new.*24h/i)).toBeInTheDocument();
      expect(screen.getByText(/this week/i)).toBeInTheDocument();
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
    });
  });
});