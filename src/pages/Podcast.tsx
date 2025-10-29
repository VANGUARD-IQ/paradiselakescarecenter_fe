import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Image,
  useColorModeValue,
  Divider,
  HStack,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { FaPodcast, FaLock, FaPlay, FaMicrophone, FaHeadphones, FaUserPlus } from "react-icons/fa";
import { NavbarWithCallToAction } from "../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getBrandValue } from "../brandConfig";
import { UnifiedLoginModal } from "./authentication";
import { CaptureUserDetailsModal } from "./authentication/components/CaptureUserDetailsModal";
import { useAuth } from "../contexts/AuthContext";

const Podcast: React.FC = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCaptureDetailsModal, setShowCaptureDetailsModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Check if user has completed profile using user data from AuthContext
  const hasCompletedProfile = user && 
    user.email && 
    user.email.trim() !== '' &&
    user.fName &&
    user.lName;

  // Debug logging
  useEffect(() => {
    console.log('🖔 Auth loading?', authLoading);
    console.log('🔑 Authenticated?', isAuthenticated);
    if (user) {
      console.log('🔍 User data from AuthContext:', user);
      console.log('📧 Has email?', !!user?.email);
      console.log('👤 Has name?', !!user?.fName, !!user?.lName);
      console.log('✅ Profile complete?', hasCompletedProfile);
    } else {
      console.log('⚠️ No user data available yet');
    }
  }, [user, hasCompletedProfile, authLoading, isAuthenticated]);

  useEffect(() => {
    // Wait for auth to finish loading before checking profile
    if (isAuthenticated && !authLoading && !hasCheckedProfile) {
      setHasCheckedProfile(true);
      
      // Check if profile is complete using user data
      if (user && !hasCompletedProfile) {
        console.log('🚫 Showing profile modal - profile incomplete');
        console.log('User data:', user);
        setShowCaptureDetailsModal(true);
      } else if (hasCompletedProfile) {
        console.log('✅ Profile is complete, not showing modal');
        setShowCaptureDetailsModal(false);
      } else if (!user) {
        console.log('⏳ Waiting for user data to load...');
      }
    }
  }, [isAuthenticated, hasCompletedProfile, authLoading, user, hasCheckedProfile]);

  const handleDetailsCapture = () => {
    setShowCaptureDetailsModal(false);
    setHasCheckedProfile(false); // Reset so we can check again
    // Auth context will automatically refresh
  };

  const handleSignUpClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else if (!hasCompletedProfile) {
      setShowCaptureDetailsModal(true);
    }
  };

  // Gradient background for cards
  const cardGradientBg = `linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(20, 20, 20, 0.8) 100%)`;
  const cardBorder = "rgba(255, 255, 255, 0.1)";
  const textPrimary = "#FFFFFF";
  const textSecondary = "rgba(255, 255, 255, 0.7)";
  const textMuted = "rgba(255, 255, 255, 0.5)";
  const accentPurple = "#9333EA";

  return (
    <Box minH="100vh" bg={getColor("background.main")} display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      
      <Container maxW="7xl" py={16} flex="1">
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center">
            <Badge 
              bg={`${accentPurple}20`}
              color={accentPurple}
              fontSize="sm" 
              px={4} 
              py={2}
              borderRadius="full"
              fontWeight="500"
              border="1px solid"
              borderColor={`${accentPurple}40`}
              mb={4}
            >
              Exclusive Content
            </Badge>
            <Heading 
              as="h1" 
              size="2xl" 
              mb={4}
              color={textPrimary}
              fontFamily={getBrandValue("fonts.heading")}
            >
              The Tom Miller Services Podcast
            </Heading>
            <Text 
              fontSize="xl" 
              color={textSecondary}
              maxW="800px" 
              mx="auto"
              mb={8}
            >
              Deep dives into blockchain technology, business automation, and the future of decentralized systems
            </Text>
          </Box>

          {/* Authentication Gate - Show loading while checking profile */}
          {authLoading && isAuthenticated ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Spinner size="xl" color={accentPurple} thickness="4px" />
                <Text color={textSecondary}>Loading your profile...</Text>
              </VStack>
            </Center>
          ) : !isAuthenticated || (!authLoading && !hasCompletedProfile) ? (
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={cardBorder}
              overflow="hidden"
            >
              <CardBody p={12}>
                <VStack spacing={8}>
                  <Icon as={FaLock} w={20} h={20} color={accentPurple} />
                  
                  <VStack spacing={4}>
                    <Heading size="lg" color={textPrimary}>
                      Sign Up to Access Exclusive Podcast Content
                    </Heading>
                    <Text fontSize="lg" color={textSecondary} textAlign="center" maxW="600px">
                      Join our community to get early access to podcast episodes, exclusive content, 
                      and insights into blockchain and business innovation.
                    </Text>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" maxW="600px">
                    <VStack>
                      <Icon as={FaMicrophone} w={10} h={10} color={accentPurple} />
                      <Text fontWeight="bold" color={textPrimary}>Expert Interviews</Text>
                      <Text fontSize="sm" color={textMuted} textAlign="center">
                        Industry leaders share insights
                      </Text>
                    </VStack>
                    <VStack>
                      <Icon as={FaPodcast} w={10} h={10} color={accentPurple} />
                      <Text fontWeight="bold" color={textPrimary}>Weekly Episodes</Text>
                      <Text fontSize="sm" color={textMuted} textAlign="center">
                        New content every week
                      </Text>
                    </VStack>
                    <VStack>
                      <Icon as={FaHeadphones} w={10} h={10} color={accentPurple} />
                      <Text fontWeight="bold" color={textPrimary}>Early Access</Text>
                      <Text fontSize="sm" color={textMuted} textAlign="center">
                        Episodes before public release
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  <Button
                    size="lg"
                    bg={accentPurple}
                    color="white"
                    leftIcon={<Icon as={FaUserPlus} />}
                    _hover={{
                      bg: "#7C3AED",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    onClick={handleSignUpClick}
                    px={8}
                    py={6}
                    fontSize="lg"
                  >
                    Sign Up for Free Access
                  </Button>

                  <Text fontSize="sm" color={textMuted}>
                    No credit card required • Instant access • Cancel anytime
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            /* Authenticated Content */
            <>
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
                borderRadius="xl"
                bg={`${accentPurple}10`}
                borderWidth="1px"
                borderColor={`${accentPurple}40`}
              >
                <AlertIcon boxSize="40px" mr={0} color={accentPurple} />
                <AlertTitle mt={4} mb={1} fontSize="lg" color={textPrimary}>
                  Welcome {user?.fName || 'back'}!
                </AlertTitle>
                <AlertDescription maxWidth="sm" color={textSecondary}>
                  You now have exclusive access to our podcast content.
                </AlertDescription>
              </Alert>

              {/* Episode 1 */}
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={cardBorder}
                overflow="hidden"
                transition="all 0.3s ease"
                _hover={{
                  borderColor: `${accentPurple}40`,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px 0 rgba(147, 51, 234, 0.2)"
                }}
              >
                <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme="purple">Episode 1</Badge>
                      <Heading size="lg" color={textPrimary}>
                        The Future of Business: Blockchain, AI, and Human Connection
                      </Heading>
                      <Text color={textSecondary}>
                        Duration: 45 minutes • Released: Coming Soon
                      </Text>
                    </VStack>
                    <Icon as={FaPodcast} w={12} h={12} color={accentPurple} />
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Text fontSize="lg" color={textSecondary}>
                      In this inaugural episode, Tom Miller explores how blockchain technology and AI 
                      are transforming business while emphasizing the importance of maintaining human 
                      connection in an increasingly digital world.
                    </Text>

                    <Box>
                      <Text fontWeight="bold" color={textPrimary} mb={2}>
                        Topics Covered:
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <HStack>
                          <Box w="2" h="2" bg={accentPurple} borderRadius="full" />
                          <Text color={textSecondary}>The philosophy behind decentralized systems</Text>
                        </HStack>
                        <HStack>
                          <Box w="2" h="2" bg={accentPurple} borderRadius="full" />
                          <Text color={textSecondary}>Building trust through transparency</Text>
                        </HStack>
                        <HStack>
                          <Box w="2" h="2" bg={accentPurple} borderRadius="full" />
                          <Text color={textSecondary}>AI as a tool for enhancement, not replacement</Text>
                        </HStack>
                        <HStack>
                          <Box w="2" h="2" bg={accentPurple} borderRadius="full" />
                          <Text color={textSecondary}>Real-world blockchain applications</Text>
                        </HStack>
                      </SimpleGrid>
                    </Box>

                    <Divider borderColor={cardBorder} />

                    {/* Podcast Player Placeholder */}
                    <Box
                      bg="rgba(147, 51, 234, 0.1)"
                      backdropFilter="blur(10px)"
                      borderWidth="1px"
                      borderColor="rgba(147, 51, 234, 0.3)"
                      p={8}
                      borderRadius="xl"
                      textAlign="center"
                    >
                      <VStack spacing={4}>
                        <Icon as={FaPlay} w={16} h={16} color={accentPurple} />
                        <Text fontWeight="bold" fontSize="xl" color={textPrimary}>
                          Episode Coming Soon
                        </Text>
                        <Text color={textSecondary}>
                          We're putting the finishing touches on our first episode. 
                          You'll be notified as soon as it's available.
                        </Text>
                        <Badge 
                          bg={`${accentPurple}20`}
                          color={accentPurple}
                          fontSize="sm" 
                          px={4} 
                          py={2}
                        >
                          Expected Release: January 2025
                        </Badge>
                      </VStack>
                    </Box>

                    <Alert status="info" borderRadius="lg" bg="rgba(59, 130, 246, 0.1)" borderColor="rgba(59, 130, 246, 0.3)">
                      <AlertIcon color="#3B82F6" />
                      <Box>
                        <AlertTitle color={textPrimary}>You're on the list!</AlertTitle>
                        <AlertDescription color={textSecondary}>
                          We'll send you an email and SMS notification when Episode 1 is released.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>

              {/* Future Episodes Preview */}
              <Box>
                <Heading size="lg" mb={6} color={textPrimary}>
                  Upcoming Episodes
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    borderWidth="1px"
                    borderColor={cardBorder}
                    opacity={0.7}
                  >
                    <CardBody>
                      <Badge colorScheme="gray" mb={2}>Episode 2</Badge>
                      <Heading size="md" color={textPrimary} mb={2}>
                        Smart Contracts in Business
                      </Heading>
                      <Text color={textMuted}>
                        Deep dive into practical smart contract applications for everyday business operations.
                      </Text>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    borderWidth="1px"
                    borderColor={cardBorder}
                    opacity={0.7}
                  >
                    <CardBody>
                      <Badge colorScheme="gray" mb={2}>Episode 3</Badge>
                      <Heading size="md" color={textPrimary} mb={2}>
                        Building AI Agents for Business
                      </Heading>
                      <Text color={textMuted}>
                        How to create and deploy AI agents that actually solve business problems.
                      </Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </Box>
            </>
          )}
        </VStack>
      </Container>

      <FooterWithFourColumns />

      {/* Modals */}
      <UnifiedLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // After SMS login, show capture details modal
          if (!hasCompletedProfile) {
            setShowCaptureDetailsModal(true);
          }
        }}
      />

      <CaptureUserDetailsModal
        isOpen={showCaptureDetailsModal}
        onClose={() => setShowCaptureDetailsModal(false)}
        userId={user?.id || ""}
        onUpdateSuccess={handleDetailsCapture}
        currentUserData={{
          fName: user?.fName || "",
          lName: user?.lName || "",
          email: user?.email || ""
        }}
      />
    </Box>
  );
};

export default Podcast;