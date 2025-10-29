import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Wait for auth to load
  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      user?.permissions?.includes(permission)
    );

    if (!hasPermission) {
      return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
          <VStack spacing={4} textAlign="center" p={8}>
            <Heading size="lg" color="red.500">Access Denied</Heading>
            <Text color="gray.600">
              You don't have permission to access this page.
            </Text>
            <Text fontSize="sm" color="gray.500">
              Required permissions: {requiredPermissions.join(', ')}
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={() => navigate('/')}
              mt={4}
            >
              Go to Home
            </Button>
          </VStack>
        </Box>
      );
    }
  }

  return <>{children}</>;
};