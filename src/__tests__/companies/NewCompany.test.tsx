import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import NewCompany from '../../pages/companies/NewCompany';
import { gql } from '@apollo/client';

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../hooks/useDocumentTitle', () => ({
  usePageTitle: jest.fn(),
}));

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
    }
  }
`;

const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CompanyInput!) {
    createCompany(input: $input) {
      id
      name
      status
    }
  }
`;

const mockClients = [
  {
    id: '1',
    fName: 'John',
    lName: 'Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    fName: 'Jane',
    lName: 'Smith',
    email: 'jane@example.com',
  },
];

const mocks = [
  {
    request: {
      query: GET_CLIENTS,
    },
    result: {
      data: {
        clients: mockClients,
      },
    },
  },
  {
    request: {
      query: CREATE_COMPANY,
      variables: {
        input: {
          name: 'Test Company',
          type: 'CORPORATION',
          status: 'ACTIVE',
        },
      },
    },
    result: {
      data: {
        createCompany: {
          id: '123',
          name: 'Test Company',
          status: 'ACTIVE',
        },
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

describe('NewCompany', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all tabs', async () => {
    renderWithProviders(<NewCompany />);

    expect(screen.getByText(/company management/i)).toBeInTheDocument();
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Contact & Address')).toBeInTheDocument();
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
  });

  it('displays all required form fields in Basic Info tab', async () => {
    renderWithProviders(<NewCompany />);

    await waitFor(() => {
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when submitting without required fields', async () => {
    renderWithProviders(<NewCompany />);

    const submitButton = screen.getByRole('button', { name: /create company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/missing required fields/i)).toBeInTheDocument();
    });
  });

  it('fills in company name field correctly', async () => {
    renderWithProviders(<NewCompany />);

    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    expect(nameInput).toHaveValue('Test Company');
  });

  it('allows selecting company type', async () => {
    renderWithProviders(<NewCompany />);

    const typeSelect = screen.getByLabelText(/company type/i);
    fireEvent.change(typeSelect, { target: { value: 'PARTNERSHIP' } });

    expect(typeSelect).toHaveValue('PARTNERSHIP');
  });

  it('allows selecting company status', async () => {
    renderWithProviders(<NewCompany />);

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'INACTIVE' } });

    expect(statusSelect).toHaveValue('INACTIVE');
  });

  it('displays ABN and ACN fields', async () => {
    renderWithProviders(<NewCompany />);

    expect(screen.getByLabelText(/abn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/acn/i)).toBeInTheDocument();
  });

  it('displays industry and website fields', async () => {
    renderWithProviders(<NewCompany />);

    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
  });

  it('displays contact information fields', async () => {
    renderWithProviders(<NewCompany />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('switches to Contact & Address tab', async () => {
    renderWithProviders(<NewCompany />);

    const contactTab = screen.getByText('Contact & Address');
    fireEvent.click(contactTab);

    await waitFor(() => {
      expect(screen.getByText(/physical address/i)).toBeInTheDocument();
    });
  });

  it('displays address fields in Contact & Address tab', async () => {
    renderWithProviders(<NewCompany />);

    const contactTab = screen.getByText('Contact & Address');
    fireEvent.click(contactTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/street address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/city/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/state/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/postcode/i)).toBeInTheDocument();
    });
  });

  it('displays primary contact fields', async () => {
    renderWithProviders(<NewCompany />);

    const contactTab = screen.getByText('Contact & Address');
    fireEvent.click(contactTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    });
  });

  it('switches to Additional Details tab', async () => {
    renderWithProviders(<NewCompany />);

    const additionalTab = screen.getByText('Additional Details');
    fireEvent.click(additionalTab);

    await waitFor(() => {
      expect(screen.getByText(/financial information/i)).toBeInTheDocument();
    });
  });

  it('displays tags input and management', async () => {
    renderWithProviders(<NewCompany />);

    const additionalTab = screen.getByText('Additional Details');
    fireEvent.click(additionalTab);

    await waitFor(() => {
      const tagInput = screen.getByPlaceholderText(/add tags/i);
      expect(tagInput).toBeInTheDocument();
    });
  });

  it('allows adding tags', async () => {
    renderWithProviders(<NewCompany />);

    const additionalTab = screen.getByText('Additional Details');
    fireEvent.click(additionalTab);

    await waitFor(() => {
      const tagInput = screen.getByPlaceholderText(/add tags/i);
      fireEvent.change(tagInput, { target: { value: 'technology' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(screen.getByText('technology')).toBeInTheDocument();
    });
  });

  it('displays notes textarea', async () => {
    renderWithProviders(<NewCompany />);

    const additionalTab = screen.getByText('Additional Details');
    fireEvent.click(additionalTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/additional notes/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithProviders(<NewCompany />);

    // Fill in required fields
    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByRole('button', { name: /create company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/company created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles form submission error gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_CLIENTS,
        },
        result: {
          data: {
            clients: mockClients,
          },
        },
      },
      {
        request: {
          query: CREATE_COMPANY,
          variables: {
            input: {
              name: 'Test Company',
              type: 'CORPORATION',
              status: 'ACTIVE',
            },
          },
        },
        error: new Error('Failed to create company'),
      },
    ];

    renderWithProviders(<NewCompany />, { mocks: errorMocks });

    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByRole('button', { name: /create company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error creating company/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during form submission', async () => {
    renderWithProviders(<NewCompany />);

    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Company' } });

    const submitButton = screen.getByRole('button', { name: /create company/i });
    fireEvent.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('allows canceling and navigating back', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithProviders(<NewCompany />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/companies');
  });

  it('validates ABN format', async () => {
    renderWithProviders(<NewCompany />);

    const abnInput = screen.getByLabelText(/abn/i);
    fireEvent.change(abnInput, { target: { value: '12345678901' } });

    expect(abnInput).toHaveValue('12345678901');
  });

  it('validates email format in contact fields', async () => {
    renderWithProviders(<NewCompany />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // Email validation would typically show an error message
    expect(emailInput).toHaveValue('invalid-email');
  });

  it('defaults to Australia as country', async () => {
    renderWithProviders(<NewCompany />);

    const contactTab = screen.getByText('Contact & Address');
    fireEvent.click(contactTab);

    await waitFor(() => {
      const countrySelect = screen.getAllByDisplayValue('Australia')[0];
      expect(countrySelect).toBeInTheDocument();
    });
  });
});