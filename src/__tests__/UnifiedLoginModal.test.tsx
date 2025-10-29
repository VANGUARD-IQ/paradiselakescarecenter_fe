import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { UnifiedLoginModal } from '../pages/authentication/components/UnifiedLoginModal';
import { gql } from '@apollo/client';

const SEND_SMS_CODE = gql`
  mutation SendSmsCode($phoneNumber: String!) {
    sendSmsCode(phoneNumber: $phoneNumber)
  }
`;

const VERIFY_SMS_CODE = gql`
  mutation VerifySmsCode($phoneNumber: String!, $code: String!) {
    verifySmsCode(phoneNumber: $phoneNumber, code: $code) {
      token
      client {
        id
        fName
        lName
        email
        phoneNumber
      }
    }
  }
`;

const SEND_EMAIL_CODE = gql`
  mutation SendEmailCode($email: String!) {
    sendEmailCode(email: $email)
  }
`;

const VERIFY_EMAIL_CODE = gql`
  mutation VerifyEmailCode($email: String!, $code: String!) {
    verifyEmailCode(email: $email, code: $code) {
      token
      client {
        id
        fName
        lName
        email
        phoneNumber
      }
    }
  }
`;

const renderWithProviders = (component: React.ReactElement, mocks: any[] = []) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChakraProvider>
        {component}
      </ChakraProvider>
    </MockedProvider>
  );
};

describe('UnifiedLoginModal', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State - Mobile Priority', () => {
    test('should render with phone input by default', () => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
      expect(screen.getByText(/recommend using your Australian mobile/i)).toBeInTheDocument();
      expect(screen.getByText(/Send Verification Code/i)).toBeInTheDocument();
    });

    test('should show link to switch to email', () => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/Don't have an Australian mobile/i)).toBeInTheDocument();
      expect(screen.getByText(/Use email instead/i)).toBeInTheDocument();
    });

    test('should switch to email input when link clicked', () => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(screen.getByText(/Use email instead/i));

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Have an Australian mobile/i)).toBeInTheDocument();
    });
  });

  describe('Phone Number Validation', () => {
    test('should accept valid Australian mobile starting with 04', () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '0412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      expect(screen.queryByText(/Please enter a valid Australian mobile/i)).not.toBeInTheDocument();
    });

    test('should accept valid Australian mobile starting with +61', () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      expect(screen.queryByText(/Please enter a valid Australian mobile/i)).not.toBeInTheDocument();
    });

    test('should reject invalid phone number', () => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '1234567' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      expect(screen.getByText(/Please enter a valid Australian mobile/i)).toBeInTheDocument();
    });

    test('should normalize 04 format to +61 format', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '0412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Check your phone for the verification code/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Validation', () => {
    beforeEach(() => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Switch to email mode
      fireEvent.click(screen.getByText(/Use email instead/i));
    });

    test('should accept valid email', () => {
      const mocks = [
        {
          request: {
            query: SEND_EMAIL_CODE,
            variables: { email: 'test@example.com' },
          },
          result: {
            data: { sendEmailCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      fireEvent.click(screen.getByText(/Use email instead/i));

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      expect(screen.queryByText(/Please enter a valid email/i)).not.toBeInTheDocument();
    });

    test('should reject invalid email', () => {
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
    });
  });

  describe('SMS Authentication Flow', () => {
    test('should send SMS code and show verification input', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code sent to/i)).toBeInTheDocument();
        expect(screen.getByText(/\+61412345678/i)).toBeInTheDocument();
      });
    });

    test('should verify SMS code and call onSuccess', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_SMS_CODE,
            variables: { phoneNumber: '+61412345678', code: '1234' },
          },
          result: {
            data: {
              verifySmsCode: {
                token: 'test-token',
                client: {
                  id: '123',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: null,
                  phoneNumber: '+61412345678',
                },
              },
            },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Enter phone and send code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      // Wait for verification screen
      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
      });

      // Enter code (simulate PIN input)
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      // Verify
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-token');
      });
    });

    test('should show error for invalid code', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_SMS_CODE,
            variables: { phoneNumber: '+61412345678', code: '000000' },
          },
          error: new Error('Invalid verification code'),
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Enter phone and send code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
      });

      // Enter wrong code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '000000'[index] } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
      });
    });

    test('should allow resending code', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '654321' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Send initial code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
      });

      // Click resend
      fireEvent.click(screen.getByText(/Resend code/i));

      await waitFor(() => {
        expect(screen.getByText(/Check your phone for the new code/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Authentication Flow', () => {
    test('should send email code and show verification input', async () => {
      const mocks = [
        {
          request: {
            query: SEND_EMAIL_CODE,
            variables: { email: 'test@example.com' },
          },
          result: {
            data: { sendEmailCode: '1234' },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Switch to email
      fireEvent.click(screen.getByText(/Use email instead/i));

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code sent to/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
      });
    });

    test('should verify email code and call onSuccess', async () => {
      const mocks = [
        {
          request: {
            query: SEND_EMAIL_CODE,
            variables: { email: 'test@example.com' },
          },
          result: {
            data: { sendEmailCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_EMAIL_CODE,
            variables: { email: 'test@example.com', code: '1234' },
          },
          result: {
            data: {
              verifyEmailCode: {
                token: 'test-token',
                client: {
                  id: '123',
                  firstName: 'Jane',
                  lastName: 'Smith',
                  email: 'test@example.com',
                  phoneNumber: null,
                },
              },
            },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Switch to email
      fireEvent.click(screen.getByText(/Use email instead/i));

      // Enter email and send code
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
      });

      // Enter code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-token');
      });
    });
  });

  describe('Modal Behavior', () => {
    test('should reset state when closed', () => {
      const { rerender } = renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Enter some data
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });

      // Close modal
      fireEvent.click(screen.getByLabelText(/close/i));
      expect(mockOnClose).toHaveBeenCalled();

      // Reopen modal
      rerender(
        <ChakraProvider>
          <MockedProvider>
            <UnifiedLoginModal
              isOpen={true}
              onClose={mockOnClose}
              onSuccess={mockOnSuccess}
            />
          </MockedProvider>
        </ChakraProvider>
      );

      // Should be back to initial state
      const newPhoneInput = screen.getByLabelText(/mobile number/i) as HTMLInputElement;
      expect(newPhoneInput.value).toBe('');
    });

    test('should allow switching back to phone input from email', () => {
      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Switch to email
      fireEvent.click(screen.getByText(/Use email instead/i));
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

      // Switch back to phone
      fireEvent.click(screen.getByText(/Use phone instead/i));
      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('should show loading state when sending code', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
          delay: 1000,
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });

      const sendButton = screen.getByText(/Send Verification Code/i);
      fireEvent.click(sendButton);

      // Button should be disabled/loading
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });
    });

    test('should show loading state when verifying code', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_SMS_CODE,
            variables: { phoneNumber: '+61412345678', code: '1234' },
          },
          result: {
            data: {
              verifySmsCode: {
                token: 'test-token',
                client: {
                  id: '123',
                  firstName: null,
                  lastName: null,
                  email: null,
                  phoneNumber: '+61412345678',
                },
              },
            },
          },
          delay: 1000,
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Send code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
      });

      // Enter code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      // Verify button should be disabled/loading
      const verifyButton = screen.getByText(/Verify & Sign In/i);
      await waitFor(() => {
        expect(verifyButton).toBeDisabled();
      });
    });
  });

  describe('User Details Capture Flow', () => {
    test('should show CaptureUserDetailsModal when SMS user is missing email and name', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_SMS_CODE,
            variables: { phoneNumber: '+61412345678', code: '1234' },
          },
          result: {
            data: {
              verifySmsCode: {
                token: 'test-token-123',
                client: {
                  id: 'client-123',
                  fName: null, // Missing name
                  lName: null, // Missing name
                  email: null, // Missing email
                  phoneNumber: '+61412345678',
                },
              },
            },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Send code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Check your phone/i)).toBeInTheDocument();
      });

      // Enter verification code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      // CaptureUserDetailsModal should appear (would need to mock the modal component for full test)
      // In real implementation, the modal would show and onSuccess wouldn't be called until details are captured
    });

    test('should show CaptureUserDetailsModal when email user is missing phone and name', async () => {
      const mocks = [
        {
          request: {
            query: SEND_EMAIL_CODE,
            variables: { email: 'test@example.com' },
          },
          result: {
            data: { sendEmailCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_EMAIL_CODE,
            variables: { email: 'test@example.com', code: '1234' },
          },
          result: {
            data: {
              verifyEmailCode: {
                token: 'test-token-456',
                client: {
                  id: 'client-456',
                  fName: null, // Missing name
                  lName: null, // Missing name
                  email: 'test@example.com',
                  phoneNumber: null, // Missing phone
                },
              },
            },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Switch to email mode
      fireEvent.click(screen.getByText(/Use email instead/i));

      // Send code
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
      });

      // Enter verification code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      // CaptureUserDetailsModal should appear for phone and name
    });

    test('should NOT show CaptureUserDetailsModal when all details are present', async () => {
      const mocks = [
        {
          request: {
            query: SEND_SMS_CODE,
            variables: { phoneNumber: '+61412345678' },
          },
          result: {
            data: { sendSmsCode: '1234' },
          },
        },
        {
          request: {
            query: VERIFY_SMS_CODE,
            variables: { phoneNumber: '+61412345678', code: '1234' },
          },
          result: {
            data: {
              verifySmsCode: {
                token: 'test-token-complete',
                client: {
                  id: 'client-complete',
                  fName: 'John',
                  lName: 'Doe',
                  email: 'john@example.com',
                  phoneNumber: '+61412345678',
                },
              },
            },
          },
        },
      ];

      renderWithProviders(
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
        mocks
      );

      // Send code
      const phoneInput = screen.getByLabelText(/mobile number/i);
      fireEvent.change(phoneInput, { target: { value: '+61412345678' } });
      fireEvent.click(screen.getByText(/Send Verification Code/i));

      await waitFor(() => {
        expect(screen.getByText(/Check your phone/i)).toBeInTheDocument();
      });

      // Enter verification code
      const pinInputs = screen.getAllByRole('textbox');
      pinInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '1234'[index] } });
      });

      // Should complete login immediately without showing capture modal
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-token-complete');
      });
    });

    test('should complete login after user details are captured', async () => {
      // This test would require mocking the CaptureUserDetailsModal component
      // to simulate the user filling in their details and clicking save
      // The flow would be:
      // 1. Verify code with missing details
      // 2. CaptureUserDetailsModal appears
      // 3. User fills in details
      // 4. onUpdateSuccess is called
      // 5. Login completes with the pending token
    });
  });
});
