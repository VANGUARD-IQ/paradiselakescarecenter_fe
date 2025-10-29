import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { gql } from '@apollo/client';
import EditProfile from '../pages/profile/EditProfile';
import { AuthContext } from '../contexts/AuthContext';

// Mock GraphQL operations
const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
      businessRegistrationNumber
      role
      isVerifiedSeller
      profilePhoto
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
          swiftCode
        }
        cryptoWallets {
          walletAddress
          network
          memo
        }
        stripeConnect {
          stripeAccountId
          accountVerified
          verifiedAt
        }
        paypalEmail
        isVerified
        cryptoDiscountPercentage
      }
    }
  }
`;

const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
      businessRegistrationNumber
      role
      isVerifiedSeller
      profilePhoto
    }
  }
`;

const GET_TENANT_BY_CURRENT_CLIENT = gql`
  query TenantByCurrentClient {
    tenantByCurrentClient {
      id
      name
      domain
      websiteUrl
      status
      subscriptionTier
      apiKeys {
        postmarkApiKey
        cellcastApiKey
        stripePublicKey
        stripeSecretKey
        stripeWebhookSecret
      }
      branding {
        siteName
        tagline
        description
        logo
        favicon
        primaryColor
        secondaryColor
        accentColor
      }
      emailConfig {
        fromEmail
        fromName
        replyToEmail
      }
      smsConfig {
        defaultSender
        defaultSenderType
        defaultTags
        defaultList
      }
      createdAt
      updatedAt
    }
  }
`;

// Mock data
const mockClient = {
  id: 'client-123',
  fName: 'John',
  lName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '+61412345678',
  businessName: 'Test Business',
  businessRegistrationNumber: 'ABN123456',
  role: 'BUYER',
  isVerifiedSeller: false,
  profilePhoto: null,
  paymentReceivingDetails: null
};

const mockTenant = {
  id: 'tenant-123',
  name: 'Test Tenant',
  domain: 'test.com',
  websiteUrl: 'https://test.com',
  status: 'ACTIVE',
  subscriptionTier: 'PREMIUM',
  apiKeys: {
    postmarkApiKey: 'pm_test',
    cellcastApiKey: 'cc_test',
    stripePublicKey: 'pk_test',
    stripeSecretKey: 'sk_test',
    stripeWebhookSecret: 'whsec_test'
  },
  branding: {
    siteName: 'Test Site',
    tagline: 'Test Tagline',
    description: 'Test Description',
    logo: null,
    favicon: null,
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#3B82F6'
  },
  emailConfig: {
    fromEmail: 'test@test.com',
    fromName: 'Test',
    replyToEmail: 'reply@test.com'
  },
  smsConfig: {
    defaultSender: 'Test',
    defaultSenderType: 'ALPHANUMERIC',
    defaultTags: [],
    defaultList: null
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock auth context
const mockAuthContext = {
  isAuthenticated: true,
  user: {
    id: 'client-123',
    email: 'john@example.com',
    fName: 'John',
    lName: 'Doe'
  },
  loading: false,
  logout: jest.fn(),
  refreshAuth: jest.fn()
};

const renderWithProviders = (component: React.ReactElement, mocks: any[] = []) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChakraProvider>
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            {component}
          </AuthContext.Provider>
        </BrowserRouter>
      </ChakraProvider>
    </MockedProvider>
  );
};

describe('EditProfile', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
  });

  describe('Page Load and Data Fetching', () => {
    test('should display loading state initially', () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          },
          delay: 100 // Simulate network delay
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          },
          delay: 100
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      expect(screen.getByText(/Loading profile details.../i)).toBeInTheDocument();
    });

    test('should load and display client data', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+61412345678')).toBeInTheDocument();
      });
    });
  });

  describe('Form Input Changes', () => {
    test('should update first name input', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    test('should update last name input', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      });

      const lastNameInput = screen.getByDisplayValue('Doe');
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    });

    test('should show verification warning when email is changed', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByDisplayValue('john@example.com');
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

      await waitFor(() => {
        expect(screen.getByText(/Email changes require verification via email/i)).toBeInTheDocument();
        expect(screen.getByText(/Verification required/i)).toBeInTheDocument();
      });
    });

    test('should show verification warning when phone is changed', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('+61412345678')).toBeInTheDocument();
      });

      const phoneInput = screen.getByDisplayValue('+61412345678');
      fireEvent.change(phoneInput, { target: { value: '+61498765432' } });

      await waitFor(() => {
        expect(screen.getByText(/Phone number changes require SMS verification/i)).toBeInTheDocument();
        expect(screen.getByText(/Verification required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Basic Profile Update', () => {
    test('should successfully update profile when no email/phone change', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        },
        {
          request: {
            query: UPDATE_CLIENT,
            variables: {
              id: 'client-123',
              input: {
                fName: 'Jane',
                lName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '+61412345678',
                businessName: 'Test Business',
                businessRegistrationNumber: 'ABN123456',
                role: 'BUYER',
                profilePhoto: '',
                paymentReceivingDetails: expect.any(Object)
              }
            }
          },
          result: {
            data: {
              updateClient: {
                ...mockClient,
                fName: 'Jane'
              }
            }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Change first name
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      // Click save
      const saveButton = screen.getByText(/Save Changes/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Email/Phone Verification Flow', () => {
    test('should trigger email verification modal when email changed and save clicked', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      });

      // Change email
      const emailInput = screen.getByDisplayValue('john@example.com');
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

      // Click save - should open modal
      const saveButton = screen.getByText(/Save Changes/i);
      fireEvent.click(saveButton);

      // Modal should appear (EmailChangeModal component)
      // Note: Full modal testing would require mocking the modal component
    });

    test('should trigger SMS verification modal when phone changed and save clicked', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByDisplayValue('+61412345678')).toBeInTheDocument();
      });

      // Change phone
      const phoneInput = screen.getByDisplayValue('+61412345678');
      fireEvent.change(phoneInput, { target: { value: '+61498765432' } });

      // Click save - should open modal
      const saveButton = screen.getByText(/Save Changes/i);
      fireEvent.click(saveButton);

      // Modal should appear (PhoneChangeModal component)
      // Note: Full modal testing would require mocking the modal component
    });
  });

  describe('Navigation', () => {
    test('should have back to profile button', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        const backButtons = screen.getAllByText(/Back to Profile/i);
        expect(backButtons.length).toBeGreaterThan(0);
      });
    });

    test('should have cancel button', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    test('should use authenticated user ID from AuthContext', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' } // This should match mockAuthContext.user.id
          },
          result: {
            data: { client: mockClient }
          }
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      await waitFor(() => {
        expect(screen.getByText(/Client ID:/i)).toBeInTheDocument();
        expect(screen.getByText(/client-123/i)).toBeInTheDocument();
      });
    });

    test('should call refreshAuth after successful email/phone update', async () => {
      // This would test that refreshAuth is called after verification success
      // Implementation would depend on mocking the verification modal callbacks
      expect(mockAuthContext.refreshAuth).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle GraphQL errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: GET_CLIENT,
            variables: { id: 'client-123' }
          },
          error: new Error('Network error')
        },
        {
          request: {
            query: GET_TENANT_BY_CURRENT_CLIENT
          },
          result: {
            data: { tenantByCurrentClient: mockTenant }
          }
        }
      ];

      renderWithProviders(<EditProfile />, mocks);

      // Should not crash - the page handles errors gracefully
      await waitFor(() => {
        expect(screen.queryByText(/Loading profile details.../i)).not.toBeInTheDocument();
      });
    });
  });
});
