import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CompanyDetails from '../../pages/companies/CompanyDetails';
import { gql } from '@apollo/client';

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' }),
}));

jest.mock('../../hooks/useDocumentTitle', () => ({
  usePageTitle: jest.fn(),
}));

const GET_COMPANY = gql`
  query GetCompany($id: ID!) {
    company(id: $id) {
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
      fax
      physicalAddress {
        street
        city
        state
        postcode
        country
      }
      postalAddress {
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
        mobile
      }
      employees
      employeeDetails {
        id
        fName
        lName
        email
        phoneNumber
      }
      employeeCount
      assetCount
      passwordCount
      numberOfEmployees
      annualRevenue
      establishedDate
      financialYearEnd
      billingEmail
      taxNumber
      notes
      tags
      isActive
      createdAt
      updatedAt
    }
  }
`;

const DELETE_COMPANY = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id)
  }
`;

const mockCompany = {
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
  fax: '+61733334444',
  physicalAddress: {
    street: '123 Main St',
    city: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    country: 'Australia',
  },
  postalAddress: {
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
    mobile: '+61411123456',
  },
  employees: ['emp1', 'emp2'],
  employeeDetails: [
    {
      id: 'emp1',
      fName: 'Jane',
      lName: 'Smith',
      email: 'jane@acme.com',
      phoneNumber: '+61400222333',
    },
    {
      id: 'emp2',
      fName: 'Bob',
      lName: 'Johnson',
      email: 'bob@acme.com',
      phoneNumber: '+61400444555',
    },
  ],
  employeeCount: 2,
  assetCount: 5,
  passwordCount: 3,
  numberOfEmployees: 50,
  annualRevenue: 5000000,
  establishedDate: '2020-01-15',
  financialYearEnd: '30 June',
  billingEmail: 'billing@acme.com',
  taxNumber: 'TAX123456789',
  notes: 'Important client',
  tags: ['software', 'consulting'],
  isActive: true,
  createdAt: '2020-01-15T00:00:00Z',
  updatedAt: '2024-09-30T00:00:00Z',
};

const mocks = [
  {
    request: {
      query: GET_COMPANY,
      variables: { id: '1' },
    },
    result: {
      data: {
        company: mockCompany,
      },
    },
  },
];

const renderWithProviders = (ui: React.ReactElement, { mocks: customMocks = mocks } = {}) => {
  return render(
    <ChakraProvider>
      <MockedProvider mocks={customMocks} addTypename={false}>
        <MemoryRouter initialEntries={['/companies/1']}>
          <Routes>
            <Route path="/companies/:id" element={ui} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </ChakraProvider>
  );
};

describe('CompanyDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<CompanyDetails />);

    const skeletons = screen.getAllByTestId(/chakra-skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders company details after loading', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Acme')).toBeInTheDocument();
    });
  });

  it('displays company status badge', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('displays company type', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('CORPORATION')).toBeInTheDocument();
    });
  });

  it('displays company ABN and ACN', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('12345678901')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();
    });
  });

  it('displays company industry', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('displays company contact information', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('info@acme.com')).toBeInTheDocument();
      expect(screen.getByText('+61400123456')).toBeInTheDocument();
    });
  });

  it('displays company website as a link', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      const websiteLink = screen.getByText('https://acme.com');
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink.closest('a')).toHaveAttribute('href', 'https://acme.com');
    });
  });

  it('displays physical address', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
      expect(screen.getByText(/Brisbane/i)).toBeInTheDocument();
      expect(screen.getByText(/QLD/i)).toBeInTheDocument();
      expect(screen.getByText(/4000/i)).toBeInTheDocument();
    });
  });

  it('displays primary contact information', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
      expect(screen.getByText('john@acme.com')).toBeInTheDocument();
    });
  });

  it('displays company statistics', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Employee count
      expect(screen.getByText('5')).toBeInTheDocument(); // Asset count
      expect(screen.getByText('3')).toBeInTheDocument(); // Password count
    });
  });

  it('displays employee list', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('displays employee email addresses', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('jane@acme.com')).toBeInTheDocument();
      expect(screen.getByText('bob@acme.com')).toBeInTheDocument();
    });
  });

  it('displays company tags', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('software')).toBeInTheDocument();
      expect(screen.getByText('consulting')).toBeInTheDocument();
    });
  });

  it('displays company notes', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('Important client')).toBeInTheDocument();
    });
  });

  it('displays financial information', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText(/5,000,000/i)).toBeInTheDocument(); // Annual revenue
      expect(screen.getByText('30 June')).toBeInTheDocument(); // Financial year end
    });
  });

  it('has edit button that navigates to edit page', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      expect(mockNavigate).toHaveBeenCalledWith('/companies/edit/1');
    });
  });

  it('has back button that navigates to companies list', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/companies');
    });
  });

  it('has delete button that requires confirmation', async () => {
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

    global.confirm = jest.fn(() => true);

    renderWithProviders(<CompanyDetails />, { mocks: mocksWithDelete });

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Acme Corporation')
      );
    });
  });

  it('handles GraphQL error gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_COMPANY,
          variables: { id: '1' },
        },
        error: new Error('Network error'),
      },
    ];

    renderWithProviders(<CompanyDetails />, { mocks: errorMocks });

    await waitFor(() => {
      expect(screen.getByText(/error loading company/i)).toBeInTheDocument();
    });
  });

  it('displays established date', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText(/2020-01-15/i)).toBeInTheDocument();
    });
  });

  it('displays billing email', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('billing@acme.com')).toBeInTheDocument();
    });
  });

  it('shows empty state when no employees', async () => {
    const companyWithoutEmployees = {
      ...mockCompany,
      employeeDetails: [],
      employeeCount: 0,
    };

    const mocksNoEmployees = [
      {
        request: {
          query: GET_COMPANY,
          variables: { id: '1' },
        },
        result: {
          data: {
            company: companyWithoutEmployees,
          },
        },
      },
    ];

    renderWithProviders(<CompanyDetails />, { mocks: mocksNoEmployees });

    await waitFor(() => {
      expect(screen.getByText(/no employees/i)).toBeInTheDocument();
    });
  });

  it('displays all tabs', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Employees')).toBeInTheDocument();
      expect(screen.getByText('Financial')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    renderWithProviders(<CompanyDetails />);

    await waitFor(() => {
      const employeesTab = screen.getByText('Employees');
      fireEvent.click(employeesTab);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});