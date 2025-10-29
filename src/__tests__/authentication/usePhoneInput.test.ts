import { renderHook, act } from '@testing-library/react';
import { usePhoneInput } from '../../pages/authentication/hooks/usePhoneInput';
import { COUNTRY_CODES } from '../../pages/authentication/types';

describe('usePhoneInput hook', () => {
  it('should format and update phone number for Australia', () => {
    let localPhoneNumber = '';
    let phoneNumber = '';
    const setLocalPhoneNumber = jest.fn((value: string) => { localPhoneNumber = value; });
    const setPhoneNumber = jest.fn((value: string) => { phoneNumber = value; });

    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;

    const { result } = renderHook(() =>
      usePhoneInput(australiaCountry, setLocalPhoneNumber, setPhoneNumber)
    );

    act(() => {
      result.current.handlePhoneInput('0412345678');
    });

    expect(setLocalPhoneNumber).toHaveBeenCalledWith('0412 345 678');
    expect(setPhoneNumber).toHaveBeenCalledWith('+61412345678');
  });

  it('should remove leading zero for Australian numbers in international format', () => {
    let localPhoneNumber = '';
    let phoneNumber = '';
    const setLocalPhoneNumber = jest.fn((value: string) => { localPhoneNumber = value; });
    const setPhoneNumber = jest.fn((value: string) => { phoneNumber = value; });

    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;

    const { result } = renderHook(() =>
      usePhoneInput(australiaCountry, setLocalPhoneNumber, setPhoneNumber)
    );

    act(() => {
      result.current.handlePhoneInput('0412345678');
    });

    // International format should not have leading 0
    expect(setPhoneNumber).toHaveBeenCalledWith('+61412345678');
  });

  it('should format US numbers correctly', () => {
    let localPhoneNumber = '';
    let phoneNumber = '';
    const setLocalPhoneNumber = jest.fn((value: string) => { localPhoneNumber = value; });
    const setPhoneNumber = jest.fn((value: string) => { phoneNumber = value; });

    const usCountry = COUNTRY_CODES.find(c => c.code === '+1')!;

    const { result } = renderHook(() =>
      usePhoneInput(usCountry, setLocalPhoneNumber, setPhoneNumber)
    );

    act(() => {
      result.current.handlePhoneInput('5551234567');
    });

    expect(setLocalPhoneNumber).toHaveBeenCalledWith('555 123 4567');
    expect(setPhoneNumber).toHaveBeenCalledWith('+15551234567');
  });

  it('should handle empty input', () => {
    let localPhoneNumber = '';
    let phoneNumber = '';
    const setLocalPhoneNumber = jest.fn((value: string) => { localPhoneNumber = value; });
    const setPhoneNumber = jest.fn((value: string) => { phoneNumber = value; });

    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;

    const { result } = renderHook(() =>
      usePhoneInput(australiaCountry, setLocalPhoneNumber, setPhoneNumber)
    );

    act(() => {
      result.current.handlePhoneInput('');
    });

    expect(setLocalPhoneNumber).toHaveBeenCalledWith('');
    expect(setPhoneNumber).toHaveBeenCalledWith('+61');
  });

  it('should handle input with non-digit characters', () => {
    let localPhoneNumber = '';
    let phoneNumber = '';
    const setLocalPhoneNumber = jest.fn((value: string) => { localPhoneNumber = value; });
    const setPhoneNumber = jest.fn((value: string) => { phoneNumber = value; });

    const australiaCountry = COUNTRY_CODES.find(c => c.code === '+61')!;

    const { result } = renderHook(() =>
      usePhoneInput(australiaCountry, setLocalPhoneNumber, setPhoneNumber)
    );

    act(() => {
      result.current.handlePhoneInput('0412-345-678');
    });

    expect(setLocalPhoneNumber).toHaveBeenCalledWith('0412 345 678');
    expect(setPhoneNumber).toHaveBeenCalledWith('+61412345678');
  });
});
