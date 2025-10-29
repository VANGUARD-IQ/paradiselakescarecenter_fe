import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Button,
  useDisclosure,
  HStack,
  Icon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginWithSmsModal } from '../authentication';
import { CaptureUserDetailsModal } from '../authentication';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { getColor } from '../../brandConfig';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';

interface ProtectedResearchDesignWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
  pageDescription?: string;
  previewContent?: React.ReactNode;
  autoOpenLogin?: boolean; // New prop to control auto-opening login modal
}

const ProtectedResearchDesignWrapper: React.FC<ProtectedResearchDesignWrapperProps> = ({ 
  children, 
  pageTitle,
  pageDescription,
  previewContent,
  autoOpenLogin = true // Default to true for backward compatibility
}) => {
  const { isAuthenticated, user, loading, refreshAuth } = useAuth();
  const [hasCompletedDetails, setHasCompletedDetails] = useState(false);
  const [isAuthComplete, setIsAuthComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  
  // Modal controls
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();

  // Check if user has completed details
  useEffect(() => {
    if (user) {
      // Check if user has first name, last name, and email in database
      const hasDetails = !!(user.fName && user.lName && user.email);
      setHasCompletedDetails(hasDetails);
      
      // If authenticated but missing details, open details modal
      if (!hasDetails && isAuthenticated) {
        onDetailsOpen();
      }
      
      // Mark auth as complete if user has all details
      if (hasDetails && isAuthenticated) {
        setIsAuthComplete(true);
      }
    }
  }, [user, isAuthenticated, onDetailsOpen]);

  // Auto-open login modal when component mounts if not authenticated (and autoOpenLogin is true)
  useEffect(() => {
    if (!loading && !isAuthenticated && autoOpenLogin) {
      onLoginOpen();
    }
  }, [loading, isAuthenticated, onLoginOpen, autoOpenLogin]);

  const handleLoginSuccess = async () => {
    onLoginClose();
    // Refresh auth to get latest user data
    await refreshAuth();
    // The useEffect above will handle opening details modal if needed
    // Don't set isAuthComplete here - let the useEffect handle it
  };

  const handleDetailsSuccess = async () => {
    onDetailsClose();
    setHasCompletedDetails(true);
    setIsAuthComplete(true);
    // Refresh auth to get updated user data
    await refreshAuth();
  };

  // Show loading state
  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Center flex="1" py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color={getColor('primary')} thickness="4px" />
            <Text color={textSecondary}>Checking authentication...</Text>
          </VStack>
        </Center>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Show login required state
  if (!isAuthenticated) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8} flex="1">
          <VStack spacing={8} align="stretch">
            <Box>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                size="sm"
                mb={4}
                onClick={() => navigate('/researchanddesign')}
                borderColor={getColor('primary')}
                color={getColor('primary')}
                _hover={{
                  bg: `${getColor('primary')}20`,
                  transform: 'translateX(-2px)'
                }}
              >
                Back to Research & Development
              </Button>
            </Box>

            <Center py={20}>
              <VStack spacing={6} maxW="2xl" textAlign="center">
                <Icon as={FaLock} boxSize={16} color={getColor('primary')} />
                <Heading size="lg" color={textPrimary}>
                  Authentication Required
                </Heading>
                <Text color={textSecondary} fontSize="lg">
                  {pageDescription || `Access to ${pageTitle} requires authentication. Please log in to view this proprietary R&D content.`}
                </Text>
                
                {/* Show preview content if provided */}
                {previewContent && (
                  <Box 
                    bg={bgColor} 
                    p={6} 
                    borderRadius="lg" 
                    border="1px solid" 
                    borderColor={borderColor}
                    textAlign="left"
                    w="full"
                  >
                    {previewContent}
                  </Box>
                )}
                
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={onLoginOpen}
                  bg={getColor('primary')}
                  _hover={{ bg: getColor('secondary') }}
                >
                  Log In to Continue
                </Button>
              </VStack>
            </Center>
          </VStack>
        </Container>
        
        {/* Login Modal */}
        <LoginWithSmsModal
          isOpen={isLoginOpen}
          onClose={onLoginClose}
          onLoginSuccess={handleLoginSuccess}
        />
        
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Show details required state
  if (isAuthenticated && !hasCompletedDetails) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8} flex="1">
          <VStack spacing={8} align="stretch">
            <Box>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                size="sm"
                mb={4}
                onClick={() => navigate('/researchanddesign')}
                borderColor={getColor('primary')}
                color={getColor('primary')}
                _hover={{
                  bg: `${getColor('primary')}20`,
                  transform: 'translateX(-2px)'
                }}
              >
                Back to Research & Development
              </Button>
            </Box>

            <Center py={20}>
              <VStack spacing={6} maxW="md" textAlign="center">
                <Icon as={FaLock} boxSize={16} color="orange.500" />
                <Heading size="lg" color={textPrimary}>
                  Complete Your Profile
                </Heading>
                <Text color={textSecondary} fontSize="lg">
                  Please provide your details to access {pageTitle}.
                </Text>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    We need your information to track access to proprietary content and ensure compliance with our terms of service.
                  </Text>
                </Alert>
                <Button
                  colorScheme="orange"
                  size="lg"
                  onClick={onDetailsOpen}
                >
                  Complete Profile
                </Button>
              </VStack>
            </Center>
          </VStack>
        </Container>
        
        {/* Details Capture Modal */}
        <CaptureUserDetailsModal
          isOpen={isDetailsOpen}
          onClose={onDetailsClose}
          userId={user?._id || ''}
          onUpdateSuccess={handleDetailsSuccess}
          currentUserData={user}
        />
        
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Only show content if fully authenticated with complete details
  if (isAuthenticated && hasCompletedDetails) {
    return <>{children}</>;
  }

  // This should not happen, but just in case
  return null;
};

export default ProtectedResearchDesignWrapper;