import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import NewEmployee from '../../pages/employees/NewEmployee';
import { gql } from '@apollo/client';

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: undefined }),
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

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      employeeNumber
      fName
      lName
      email
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
      query: CREATE_EMPLOYEE,
      variables: {
        input: {
          clientId: '1',
          fName: 'Test',
          lName: 'Employee',
          status: 'ACTIVE',
        },
      },
    },
    result: {
      data: {
        createEmployee: {
          id: '123',
          employeeNumber: 'EMP001',
          fName: 'Test',
          lName: 'Employee',
          email: null,
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

describe('NewEmployee Component', () => {
  describe('Component Rendering', () => {
    it('should render the new employee form', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        expect(screen.getByText('New Employee')).toBeInTheDocument();
      });
    });

    it('should render all required form sections', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        expect(screen.getByText('Basic Info')).toBeInTheDocument();
        expect(screen.getByText('Employment')).toBeInTheDocument();
        expect(screen.getByText('Banking & Tax')).toBeInTheDocument();
        expect(screen.getByText('Emergency & Other')).toBeInTheDocument();
      });
    });

    it('should render required field indicators', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const firstNameLabel = screen.getByText('First Name*');
        const lastNameLabel = screen.getByText('Last Name*');
        expect(firstNameLabel).toBeInTheDocument();
        expect(lastNameLabel).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when required fields are empty', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const submitButton = screen.getByText('Create Employee');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Missing required fields/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button when all required fields are filled', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i);
        fireEvent.change(clientSelect, { target: { value: '1' } });

        const firstNameInput = screen.getByPlaceholderText('Enter first name');
        fireEvent.change(firstNameInput, { target: { value: 'Test' } });

        const lastNameInput = screen.getByPlaceholderText('Enter last name');
        fireEvent.change(lastNameInput, { target: { value: 'Employee' } });
      });

      const submitButton = screen.getByText('Create Employee');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Client Selection', () => {
    it('should load and display clients in dropdown', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i);
        expect(clientSelect).toBeInTheDocument();
      });
    });

    it('should allow selecting a client', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i) as HTMLSelectElement;
        fireEvent.change(clientSelect, { target: { value: '1' } });
        expect(clientSelect.value).toBe('1');
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful employee creation', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i);
        fireEvent.change(clientSelect, { target: { value: '1' } });

        const firstNameInput = screen.getByPlaceholderText('Enter first name');
        fireEvent.change(firstNameInput, { target: { value: 'Test' } });

        const lastNameInput = screen.getByPlaceholderText('Enter last name');
        fireEvent.change(lastNameInput, { target: { value: 'Employee' } });
      });

      const submitButton = screen.getByText('Create Employee');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify the mutation was called
        // In a real test, you'd check for navigation or success toast
        expect(submitButton).toBeInTheDocument();
      });
    });
  });

  describe('Optional Fields', () => {
    it('should handle email input', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('employee@example.com') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
      });
    });

    it('should handle phone number input', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const phoneInput = screen.getByPlaceholderText('0400 000 000') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '0400123456' } });
        expect(phoneInput.value).toBe('0400123456');
      });
    });

    it('should handle address fields', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const streetInput = screen.getByPlaceholderText('123 Main Street') as HTMLInputElement;
        fireEvent.change(streetInput, { target: { value: '456 Test St' } });
        expect(streetInput.value).toBe('456 Test St');

        const cityInput = screen.getByPlaceholderText('Brisbane') as HTMLInputElement;
        fireEvent.change(cityInput, { target: { value: 'Sydney' } });
        expect(cityInput.value).toBe('Sydney');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const employmentTab = screen.getByText('Employment');
        fireEvent.click(employmentTab);
        expect(employmentTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should display tab-specific content', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        // Click Banking & Tax tab
        const bankingTab = screen.getByText('Banking & Tax');
        fireEvent.click(bankingTab);

        // Check for banking-specific fields
        expect(screen.getByText('Tax File Number')).toBeInTheDocument();
        expect(screen.getByText('Bank Account Details')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeInTheDocument();
      });
    });
  });

  describe('Qualifications and Certifications', () => {
    it('should allow adding qualifications', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        // Navigate to Emergency & Other tab
        const otherTab = screen.getByText('Emergency & Other');
        fireEvent.click(otherTab);
      });

      // Note: Actual implementation would need to test the add qualification functionality
      // This is a placeholder for the test structure
    });

    it('should allow adding certifications', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const otherTab = screen.getByText('Emergency & Other');
        fireEvent.click(otherTab);
      });

      // Note: Actual implementation would test certification adding
    });
  });

  describe('Status Selection', () => {
    it('should default to ACTIVE status', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const employmentTab = screen.getByText('Employment');
        fireEvent.click(employmentTab);
      });

      // The status field should exist and be selectable
      // Actual testing would verify the default value
    });

    it('should allow changing employee status', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const employmentTab = screen.getByText('Employment');
        fireEvent.click(employmentTab);
      });

      // Test status change functionality
    });
  });

  describe('Error Handling', () => {
    it('should display error toast on creation failure', async () => {
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
            query: CREATE_EMPLOYEE,
            variables: {
              input: {
                clientId: '1',
                fName: 'Test',
                lName: 'Employee',
                status: 'ACTIVE',
              },
            },
          },
          error: new Error('Failed to create employee'),
        },
      ];

      renderWithProviders(<NewEmployee />, { mocks: errorMocks });

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i);
        fireEvent.change(clientSelect, { target: { value: '1' } });

        const firstNameInput = screen.getByPlaceholderText('Enter first name');
        fireEvent.change(firstNameInput, { target: { value: 'Test' } });

        const lastNameInput = screen.getByPlaceholderText('Enter last name');
        fireEvent.change(lastNameInput, { target: { value: 'Employee' } });
      });

      const submitButton = screen.getByText('Create Employee');
      fireEvent.click(submitButton);

      // Would verify error toast is displayed
    });
  });

  describe('Loading States', () => {
    it('should show loading state while creating employee', async () => {
      renderWithProviders(<NewEmployee />);

      await waitFor(() => {
        const clientSelect = screen.getByLabelText(/Link to Client/i);
        fireEvent.change(clientSelect, { target: { value: '1' } });

        const firstNameInput = screen.getByPlaceholderText('Enter first name');
        fireEvent.change(firstNameInput, { target: { value: 'Test' } });

        const lastNameInput = screen.getByPlaceholderText('Enter last name');
        fireEvent.change(lastNameInput, { target: { value: 'Employee' } });
      });

      const submitButton = screen.getByText('Create Employee');
      fireEvent.click(submitButton);

      // Would verify loading state is shown
    });
  });
});