import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MockedProvider } from '@apollo/client/testing';
import { UnifiedLoginModal } from '../../pages/authentication/components/UnifiedLoginModal';

// Wrapper component for providers
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={[]} addTypename={false}>
    <ChakraProvider>
      {children}
    </ChakraProvider>
  </MockedProvider>
);

describe('UnifiedLoginModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('should render phone input form by default', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    expect(screen.getByText(/Country/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Use email instead/i)).toBeInTheDocument();
  });

  it('should switch to email input when clicking "Use email instead"', async () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    const switchLink = screen.getByText(/Use email instead/i);
    fireEvent.click(switchLink);

    await waitFor(() => {
      expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByText(/Use phone instead/i)).toBeInTheDocument();
    });
  });

  it('should switch back to phone input when clicking "Use phone instead"', async () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    // Switch to email first
    const switchToEmailLink = screen.getByText(/Use email instead/i);
    fireEvent.click(switchToEmailLink);

    await waitFor(() => {
      expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
    });

    // Switch back to phone
    const switchToPhoneLink = screen.getByText(/Use phone instead/i);
    fireEvent.click(switchToPhoneLink);

    await waitFor(() => {
      expect(screen.getByText(/Mobile Number/i)).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render "Send Verification Code" button', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    expect(screen.getByText('Send Verification Code')).toBeInTheDocument();
  });

  it('should handle legacy onLoginSuccess prop', () => {
    const mockOnLoginSuccess = jest.fn();

    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onLoginSuccess={mockOnLoginSuccess}
        />
      </AllProviders>
    );

    // Component should render successfully with legacy prop
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should display country selector with default Australia', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    const countrySelector = screen.getByRole('combobox');
    expect(countrySelector).toHaveValue('+61'); // Australia default
  });

  it('should format phone input placeholder for Australia', () => {
    render(
      <AllProviders>
        <UnifiedLoginModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </AllProviders>
    );

    const phoneInput = screen.getByPlaceholderText(/412 345 678/i);
    expect(phoneInput).toBeInTheDocument();
  });
});
