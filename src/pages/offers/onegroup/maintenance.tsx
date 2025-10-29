import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Badge,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Icon,
  IconButton,
  Flex,
  Center,
  chakra,
} from '@chakra-ui/react';
import { 
  FiCheck, 
  FiGlobe, 
  FiMail, 
  FiPhone, 
  FiMonitor,
  FiCpu,
  FiUsers,
  FiDollarSign,
  FiHeadphones,
  FiArrowRight,
  FiShield,
  FiZap,
  FiTrendingUp
} from 'react-icons/fi';
import { FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getColor } from '../../../brandConfig';
import { gql, useMutation } from '@apollo/client';
import { LoginWithSmsModal, CaptureUserDetailsModal } from '../../authentication';
import { useAuth } from '../../../contexts/AuthContext';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';

const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: SubscriptionInput!) {
    createSubscription(input: $input) {
      id
      name
      amount
      interval
      status
    }
  }
`;

export const MaintenanceOffer: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isCaptureDetailsOpen, onOpen: onCaptureDetailsOpen, onClose: onCaptureDetailsClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  
  const [needsDetails, setNeedsDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTodo, setShowTodo] = useState(false); // TODO is done - hiding it now

  // Brand colors
  const bg = getColor("background.main");
  const cardBg = "rgba(255, 255, 255, 0.02)";
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const accentColor = "#3B82F6";
  const successColor = "#10B981";

  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);

  const features = [
    {
      icon: FiGlobe,
      title: "Professional Domain",
      description: "Your own .com domain registered and managed",
      value: "$15/month value"
    },
    {
      icon: FiMail,
      title: "Business Email",
      description: "Professional email addresses @yourdomain.com",
      value: "$10/month value"
    },
    {
      icon: FiPhone,
      title: "Business Phone Number",
      description: "Dedicated business line with AI receptionist",
      value: "$30/month value"
    },
    {
      icon: FiMonitor,
      title: "Starter Website",
      description: "Professional website with your branding",
      value: "$50/month value"
    },
    {
      icon: FiCpu,
      title: "AI-Powered Call Actions",
      description: "Convert calls into tasks and projects automatically",
      value: "$40/month value"
    },
    {
      icon: FiUsers,
      title: "Project Collaboration",
      description: "Manage projects and collaborate with your team",
      value: "$20/month value"
    },
    {
      icon: FiDollarSign,
      title: "Billing System",
      description: "Send invoices and manage payments",
      value: "$30/month value"
    },
    {
      icon: FiHeadphones,
      title: "Monthly Consulting Call",
      description: "1-on-1 strategy session every month",
      value: "$150/month value"
    }
  ];

  // Check if user needs to capture details on mount and after login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has all required details
      if (!user.email || !user.fName || !user.lName) {
        setNeedsDetails(true);
        onCaptureDetailsOpen();
      }
    }
  }, [isAuthenticated, user, onCaptureDetailsOpen]);


  const handleGetStarted = () => {
    if (!isAuthenticated) {
      // Open login modal for non-authenticated users
      onLoginOpen();
    } else if (needsDetails) {
      // Open capture details modal if user needs to complete profile
      onCaptureDetailsOpen();
    } else {
      // User is authenticated with complete profile, show confirmation
      onConfirmOpen();
    }
  };

  const handleLoginSuccess = () => {
    onLoginClose();
    // Check if user needs to capture details after login
    if (!user?.email || !user?.fName || !user?.lName) {
      setNeedsDetails(true);
      onCaptureDetailsOpen();
    } else {
      // User has complete profile, show confirmation
      onConfirmOpen();
    }
  };

  const handleDetailsComplete = () => {
    onCaptureDetailsClose();
    setNeedsDetails(false);
    // Show confirmation modal after details are captured
    onConfirmOpen();
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your subscription.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Add stripePriceId once created in Stripe Dashboard
      // The price ID should be something like "price_1XXXXXXXXXXXXX"
      // Create the product in Stripe with:
      // - Name: "Business Maintenance Package"
      // - Price: $97.00 USD
      // - Billing: Monthly recurring
      
      // Create subscription for the authenticated user
      const subscriptionResult = await createSubscription({
        variables: {
          input: {
            clientId: user.id,
            plan: {
              name: "Business Maintenance Package",
              description: "Complete business infrastructure - domain, email, phone, website, AI assistant",
              amount: 97,
              interval: "MONTHLY",
              currency: "USD"
            },
            // paymentMethodId will be added when Stripe Elements is integrated
          }
        }
      });

      toast({
        title: "Welcome aboard! 🚀",
        description: "Your business maintenance subscription has been activated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to payment or dashboard
      navigate('/profile/payment-methods');
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "There was an issue creating your subscription. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const GlowingCard = chakra(Card, {
    baseStyle: {
      background: cardBg,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      _hover: {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.5)",
        borderColor: "rgba(59, 130, 246, 0.5)",
      },
      transition: "all 0.3s ease",
    }
  });

  return (
    <Box 
      bg={bg} 
      minHeight="100vh"
      bgImage="radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
    >
      <NavbarWithCallToAction />
      
      {/* Hero Section */}
      <Container maxW="7xl" pt={20} pb={10}>
        <VStack spacing={8} textAlign="center">
          <Badge 
            colorScheme="blue" 
            px={4} 
            py={2} 
            borderRadius="full"
            fontSize="sm"
            textTransform="none"
          >
            Limited Time Offer - Save $248/month
          </Badge>
          
          <Heading 
            size="3xl" 
            color={textPrimary}
            fontWeight="bold"
            lineHeight="1.2"
          >
            Everything Your Business Needs
            <Text as="span" color={accentColor}> In One Package</Text>
          </Heading>
          
          <Text 
            fontSize="xl" 
            color={textSecondary}
            maxW="3xl"
          >
            Get your domain, email, phone number, website, AI assistant, project management, 
            billing system, and monthly consulting - all for one simple price.
          </Text>

          <HStack spacing={8} pt={4}>
            <VStack>
              <Text fontSize="4xl" fontWeight="bold" color={textPrimary}>
                $97<Text as="span" fontSize="lg" color={textSecondary}>/month</Text>
              </Text>
              <Text fontSize="sm" color={successColor}>
                Worth $345/month
              </Text>
            </VStack>
            <Divider orientation="vertical" h="60px" />
            <VStack align="start">
              <HStack>
                <Icon as={FiCheck} color={successColor} />
                <Text color={textSecondary}>No setup fees</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheck} color={successColor} />
                <Text color={textSecondary}>Cancel anytime</Text>
              </HStack>
            </VStack>
          </HStack>

          <Button
            size="lg"
            bg={accentColor}
            color="white"
            px={8}
            py={6}
            fontSize="lg"
            rightIcon={<FiArrowRight />}
            _hover={{
              bg: "#2563EB",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
            }}
            onClick={handleGetStarted}
          >
            Start Your Business Today
          </Button>
        </VStack>
      </Container>

      {/* Features Grid */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color={textPrimary}>
              What You Get Every Month
            </Heading>
            <Text color={textSecondary} fontSize="lg">
              A complete business infrastructure that normally costs $345/month
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {features.map((feature, index) => (
              <GlowingCard key={index}>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Flex
                      w={12}
                      h={12}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg={`rgba(59, 130, 246, 0.1)`}
                    >
                      <Icon as={feature.icon} w={6} h={6} color={accentColor} />
                    </Flex>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color={textPrimary}>
                        {feature.title}
                      </Text>
                      <Text fontSize="sm" color={textSecondary}>
                        {feature.description}
                      </Text>
                      <Badge colorScheme="green" variant="subtle">
                        {feature.value}
                      </Badge>
                    </VStack>
                  </VStack>
                </CardBody>
              </GlowingCard>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Benefits Section */}
      <Box bg="rgba(59, 130, 246, 0.05)" py={20}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <VStack>
              <Icon as={FiZap} w={10} h={10} color={accentColor} />
              <Text fontWeight="bold" fontSize="xl" color={textPrimary}>
                Launch in 24 Hours
              </Text>
              <Text textAlign="center" color={textSecondary}>
                Get your complete business infrastructure up and running in less than a day
              </Text>
            </VStack>
            <VStack>
              <Icon as={FiShield} w={10} h={10} color={accentColor} />
              <Text fontWeight="bold" fontSize="xl" color={textPrimary}>
                Fully Managed
              </Text>
              <Text textAlign="center" color={textSecondary}>
                We handle all the technical details so you can focus on growing your business
              </Text>
            </VStack>
            <VStack>
              <Icon as={FiTrendingUp} w={10} h={10} color={accentColor} />
              <Text fontWeight="bold" fontSize="xl" color={textPrimary}>
                Scale With You
              </Text>
              <Text textAlign="center" color={textSecondary}>
                Add more features and capacity as your business grows
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Container maxW="2xl" py={20}>
        <Card
          bg={cardBg}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        >
          <CardBody p={8}>
            <VStack spacing={6}>
              <Icon as={FaRocket} w={12} h={12} color={accentColor} />
              <Heading size="lg" color={textPrimary} textAlign="center">
                Ready to Transform Your Business?
              </Heading>
              
              <Text color={textSecondary} textAlign="center" fontSize="lg">
                Join hundreds of businesses already saving time and money with our all-in-one solution.
              </Text>

              <List spacing={3} w="full">
                <ListItem>
                  <HStack>
                    <ListIcon as={FiCheck} color="green.400" />
                    <Text color={textSecondary}>30-day money-back guarantee</Text>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack>
                    <ListIcon as={FiCheck} color="green.400" />
                    <Text color={textSecondary}>No setup fees or hidden costs</Text>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack>
                    <ListIcon as={FiCheck} color="green.400" />
                    <Text color={textSecondary}>Cancel anytime, no questions asked</Text>
                  </HStack>
                </ListItem>
              </List>

              <Button
                size="lg"
                bg={accentColor}
                color="white"
                w="full"
                py={8}
                fontSize="xl"
                rightIcon={<FaRocket />}
                onClick={handleGetStarted}
                _hover={{
                  bg: "#2563EB",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                }}
              >
                Get Started for $97/month
              </Button>

              <Text fontSize="sm" color={textSecondary} textAlign="center">
                {isAuthenticated 
                  ? "Click to proceed with your subscription" 
                  : "You'll be asked to sign in or create an account"}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {/* Trust Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={8}>
          <Heading size="lg" color={textPrimary} textAlign="center">
            Join Hundreds of Growing Businesses
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>500+</Text>
              <Text color={textSecondary}>Active Businesses</Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>24/7</Text>
              <Text color={textSecondary}>Support Available</Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>99.9%</Text>
              <Text color={textSecondary}>Uptime Guaranteed</Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>30-Day</Text>
              <Text color={textSecondary}>Money Back Guarantee</Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* FAQ Section */}
      <Box py={20} bg="rgba(0, 0, 0, 0.2)">
        <Container maxW="4xl">
          <VStack spacing={8}>
            <Heading size="lg" color={textPrimary}>
              Frequently Asked Questions
            </Heading>
            <VStack spacing={4} w="full">
              <Card bg={cardBg} w="full">
                <CardBody>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    How quickly can I get started?
                  </Text>
                  <Text color={textSecondary}>
                    Most businesses are fully set up within 24 hours. Your domain, email, and phone number 
                    are activated immediately, and we'll have your website ready within a day.
                  </Text>
                </CardBody>
              </Card>
              <Card bg={cardBg} w="full">
                <CardBody>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    Can I cancel anytime?
                  </Text>
                  <Text color={textSecondary}>
                    Yes! There are no contracts or cancellation fees. You can cancel your subscription 
                    at any time and keep using the service until the end of your billing period.
                  </Text>
                </CardBody>
              </Card>
              <Card bg={cardBg} w="full">
                <CardBody>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    What happens to my domain if I cancel?
                  </Text>
                  <Text color={textSecondary}>
                    Your domain belongs to you. If you cancel, we'll help you transfer it to any 
                    registrar of your choice at no additional cost.
                  </Text>
                </CardBody>
              </Card>
              <Card bg={cardBg} w="full">
                <CardBody>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    How does the monthly consulting call work?
                  </Text>
                  <Text color={textSecondary}>
                    Each month, you get a 30-minute one-on-one strategy call with our business experts. 
                    We'll help you optimize your setup, plan growth strategies, and solve any challenges.
                  </Text>
                </CardBody>
              </Card>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Container maxW="4xl" py={20}>
        <Card
          bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)"
          border="1px solid"
          borderColor="rgba(59, 130, 246, 0.3)"
        >
          <CardBody p={12}>
            <VStack spacing={6}>
              <Icon as={FaRocket} w={12} h={12} color={accentColor} />
              <Heading size="lg" color={textPrimary} textAlign="center">
                Ready to Transform Your Business?
              </Heading>
              <Text color={textSecondary} textAlign="center" fontSize="lg">
                Join hundreds of successful businesses already using our all-in-one platform
              </Text>
              <Button
                size="lg"
                bg={accentColor}
                color="white"
                px={8}
                py={6}
                fontSize="lg"
                rightIcon={<FiArrowRight />}
                _hover={{
                  bg: "#2563EB",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                }}
                onClick={() => {
                  const formSection = document.getElementById('signup-form');
                  formSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started for $97/month
              </Button>
              <Text fontSize="sm" color={textSecondary}>
                No setup fees • Cancel anytime • 30-day money back guarantee
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {/* Authentication Modals */}
      <LoginWithSmsModal 
        isOpen={isLoginOpen} 
        onClose={onLoginClose}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <CaptureUserDetailsModal
        isOpen={isCaptureDetailsOpen}
        onClose={onCaptureDetailsClose}
        userId={user?.id}
        onUpdateSuccess={handleDetailsComplete}
        currentUserData={user}
      />

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent 
          bg="linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="rgba(59, 130, 246, 0.3)"
          boxShadow="0 20px 50px 0 rgba(0, 0, 0, 0.8)"
        >
          <ModalHeader color={textPrimary}>Confirm Your Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text color={textSecondary}>
                You're about to activate your Business Maintenance subscription:
              </Text>
              <Box p={4} bg="rgba(59, 130, 246, 0.1)" borderRadius="md" w="full">
                <VStack align="start" spacing={2}>
                  {user?.company && (
                    <Text color={textPrimary} fontWeight="bold">
                      {user.company}
                    </Text>
                  )}
                  <Text color={textSecondary}>
                    {user?.fName} {user?.lName}
                  </Text>
                  <Text color={textSecondary}>{user?.email}</Text>
                  <Text color={textSecondary}>{user?.phoneNumber}</Text>
                </VStack>
              </Box>
              <Divider />
              <HStack justify="space-between" w="full">
                <Text color={textSecondary}>Monthly subscription:</Text>
                <Text color={textPrimary} fontWeight="bold">$97/month</Text>
              </HStack>
              <Text fontSize="sm" color={textSecondary}>
                Your subscription will begin immediately. You'll receive setup instructions 
                via email and SMS within minutes.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose} color={textSecondary}>
              Cancel
            </Button>
            <Button
              bg={accentColor}
              color="white"
              onClick={handleSubscribe}
              isLoading={loading}
              loadingText="Processing..."
              _hover={{
                bg: "#2563EB"
              }}
            >
              Confirm & Start Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />

      {/* Floating TODO Card - Always Visible */}
      {showTodo && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          maxW="400px"
          zIndex={1000}
          bg={cardBg}
          backdropFilter="blur(10px)"
          border="2px solid"
          borderColor="yellow.400"
          borderRadius="lg"
          boxShadow="0 8px 32px 0 rgba(255, 193, 7, 0.37)"
          p={4}
        >
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <HStack>
                <Icon as={FiShield} color="yellow.400" />
                <Text color="yellow.400" fontWeight="bold">⚠️ TODO: Stripe Setup</Text>
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<Icon as={FiArrowRight} />}
                size="sm"
                variant="ghost"
                onClick={() => setShowTodo(false)}
              />
            </HStack>
            
            <Text color={textSecondary} fontSize="sm">
              This subscription needs Stripe configuration:
            </Text>
            
            <List spacing={1} fontSize="sm">
              <ListItem>
                <HStack>
                  <ListIcon as={FiCheck} color="green.400" />
                  <Text color={textSecondary}>Create product: "Business Maintenance"</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiCheck} color="green.400" />
                  <Text color={textSecondary}>Price: $97 USD/month</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiCheck} color="green.400" />
                  <Text color={textSecondary}>Add price ID to backend</Text>
                </HStack>
              </ListItem>
            </List>
            
            <Button
              as="a"
              href="https://dashboard.stripe.com/products/create"
              target="_blank"
              size="sm"
              w="full"
              leftIcon={<FiArrowRight />}
              bg="yellow.400"
              color="black"
              _hover={{
                bg: "yellow.500",
                transform: "translateY(-2px)"
              }}
            >
              Setup in Stripe →
            </Button>
          </VStack>
        </Box>
      )}

      {/* Removed the modal version - keeping the detailed instructions as comments for reference:
      TODO Setup Instructions:
      1. Create Product in Stripe Dashboard:
         - Name: "Business Maintenance Package"
         - Description: "Complete business infrastructure - domain, email, phone, website, AI assistant"
      2. Create Recurring Price:
         - Amount: $97.00 USD
         - Billing Period: Monthly
         - Currency: USD
      3. Update Backend:
         - Add the Stripe Price ID to your subscription resolver
         - Update createSubscription mutation to use: price_XXXXX
      */}
    </Box>
  );
};