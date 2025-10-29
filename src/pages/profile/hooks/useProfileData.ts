import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CLIENT } from '../queries';
import { ClientFormData } from '../types';

/**
 * Custom hook to manage profile data fetching and state
 *
 * Features:
 * - Fetches client data via GraphQL
 * - Manages form data state
 * - Handles data initialization
 * - Provides loading states
 *
 * @param userId - The client ID to fetch
 * @returns Profile data, form state, and loading status
 */
export const useProfileData = (userId: string | undefined) => {
  const [formData, setFormData] = useState<ClientFormData>({
    fName: '',
    lName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessRegistrationNumber: '',
    role: 'BUYER',
    profilePhoto: '',
    paymentReceivingDetails: {
      acceptedMethods: [],
      bankAccount: {
        accountName: '',
        bsb: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
      },
      cryptoWallets: [],
      stripeConnect: {
        stripeAccountId: '',
        accountVerified: false,
        verifiedAt: null,
      },
      paypalEmail: '',
      isVerified: false,
      cryptoDiscountPercentage: undefined,
    },
  });

  const { data, loading, refetch, error } = useQuery(GET_CLIENT, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.client) {
        setFormData({
          fName: data.client.fName || '',
          lName: data.client.lName || '',
          email: data.client.email || '',
          phoneNumber: data.client.phoneNumber || '',
          businessName: data.client.businessName || '',
          businessRegistrationNumber: data.client.businessRegistrationNumber || '',
          role: data.client.role || 'BUYER',
          profilePhoto: data.client.profilePhoto || '',
          paymentReceivingDetails: {
            acceptedMethods: data.client.paymentReceivingDetails?.acceptedMethods || [],
            bankAccount: {
              accountName: data.client.paymentReceivingDetails?.bankAccount?.accountName || '',
              bsb: data.client.paymentReceivingDetails?.bankAccount?.bsb || '',
              accountNumber: data.client.paymentReceivingDetails?.bankAccount?.accountNumber || '',
              bankName: data.client.paymentReceivingDetails?.bankAccount?.bankName || '',
              swiftCode: data.client.paymentReceivingDetails?.bankAccount?.swiftCode || '',
            },
            cryptoWallets: data.client.paymentReceivingDetails?.cryptoWallets || [],
            stripeConnect: {
              stripeAccountId: data.client.paymentReceivingDetails?.stripeConnect?.stripeAccountId || '',
              accountVerified: data.client.paymentReceivingDetails?.stripeConnect?.accountVerified || false,
              verifiedAt: data.client.paymentReceivingDetails?.stripeConnect?.verifiedAt || null,
            },
            paypalEmail: data.client.paymentReceivingDetails?.paypalEmail || '',
            isVerified: data.client.paymentReceivingDetails?.isVerified || false,
            cryptoDiscountPercentage: data.client.paymentReceivingDetails?.cryptoDiscountPercentage || undefined,
          },
        });
      }
    },
  });

  return {
    formData,
    setFormData,
    clientData: data?.client,
    loading,
    error,
    refetch,
  };
};
