import { renderHook, act } from '@testing-library/react';
import { useAuthState } from '../../pages/authentication/hooks/useAuthState';
import { COUNTRY_CODES } from '../../pages/authentication/types';

describe('useAuthState hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthState());

    expect(result.current.authMethod).toBe('phone');
    expect(result.current.authStep).toBe('input');
    expect(result.current.selectedCountry).toEqual(COUNTRY_CODES[0]); // Australia
    expect(result.current.phoneNumber).toBe('');
    expect(result.current.localPhoneNumber).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.code).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.showCaptureDetails).toBe(false);
    expect(result.current.verifiedUserId).toBeNull();
    expect(result.current.pendingToken).toBeNull();
  });

  it('should update auth method', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setAuthMethod('email');
    });

    expect(result.current.authMethod).toBe('email');
  });

  it('should update auth step', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setAuthStep('verify');
    });

    expect(result.current.authStep).toBe('verify');
  });

  it('should update phone number values', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setLocalPhoneNumber('0412 345 678');
      result.current.setPhoneNumber('+61412345678');
    });

    expect(result.current.localPhoneNumber).toBe('0412 345 678');
    expect(result.current.phoneNumber).toBe('+61412345678');
  });

  it('should update email', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setEmail('test@example.com');
    });

    expect(result.current.email).toBe('test@example.com');
  });

  it('should update code', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setCode('1234');
    });

    expect(result.current.code).toBe('1234');
  });

  it('should update error', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setError('Invalid phone number');
    });

    expect(result.current.error).toBe('Invalid phone number');
  });

  it('should switch to email and reset error', () => {
    const { result } = renderHook(() => useAuthState());

    // Set up initial state
    act(() => {
      result.current.setAuthMethod('phone');
      result.current.setAuthStep('verify');
      result.current.setError('Some error');
    });

    // Switch to email
    act(() => {
      result.current.switchToEmail();
    });

    expect(result.current.authMethod).toBe('email');
    expect(result.current.authStep).toBe('input');
    expect(result.current.error).toBe('');
  });

  it('should switch to phone and reset error', () => {
    const { result } = renderHook(() => useAuthState());

    // Set up initial state
    act(() => {
      result.current.setAuthMethod('email');
      result.current.setAuthStep('verify');
      result.current.setError('Some error');
    });

    // Switch to phone
    act(() => {
      result.current.switchToPhone();
    });

    expect(result.current.authMethod).toBe('phone');
    expect(result.current.authStep).toBe('input');
    expect(result.current.error).toBe('');
  });

  it('should reset all state', () => {
    const { result } = renderHook(() => useAuthState());

    // Modify state
    act(() => {
      result.current.setAuthMethod('email');
      result.current.setAuthStep('verify');
      result.current.setEmail('test@example.com');
      result.current.setCode('1234');
      result.current.setError('Some error');
      result.current.setPhoneNumber('+61412345678');
      result.current.setLocalPhoneNumber('0412 345 678');
    });

    // Reset
    act(() => {
      result.current.resetState();
    });

    // Verify all reset to defaults
    expect(result.current.authMethod).toBe('phone');
    expect(result.current.authStep).toBe('input');
    expect(result.current.selectedCountry).toEqual(COUNTRY_CODES[0]);
    expect(result.current.phoneNumber).toBe('');
    expect(result.current.localPhoneNumber).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.code).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should update user details capture state', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setShowCaptureDetails(true);
      result.current.setVerifiedUserId('user123');
      result.current.setVerifiedUserData({ id: 'user123', email: 'test@example.com' });
      result.current.setPendingToken('token123');
    });

    expect(result.current.showCaptureDetails).toBe(true);
    expect(result.current.verifiedUserId).toBe('user123');
    expect(result.current.verifiedUserData).toEqual({ id: 'user123', email: 'test@example.com' });
    expect(result.current.pendingToken).toBe('token123');
  });
});
