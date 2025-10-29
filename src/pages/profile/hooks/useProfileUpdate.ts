import { useMutation } from '@apollo/client';
import { useToast } from '@chakra-ui/react';
import { UPDATE_CLIENT } from '../queries';
import { ClientFormData } from '../types';

/**
 * Custom hook to handle profile updates
 *
 * Features:
 * - Handles client profile mutation
 * - Shows success/error toasts
 * - Provides loading state
 * - Calls refresh callback on success
 *
 * @param userId - The client ID to update
 * @param onSuccess - Optional callback after successful update
 * @returns Update function and loading state
 */
export const useProfileUpdate = (
  userId: string | undefined,
  onSuccess?: () => void
) => {
  const toast = useToast();

  const [updateClient, { loading }] = useMutation(UPDATE_CLIENT, {
    onCompleted: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleUpdate = async (formData: Partial<ClientFormData>) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to update profile.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await updateClient({
      variables: {
        id: userId,
        input: formData,
      },
    });
  };

  return {
    handleUpdate,
    loading,
  };
};
