import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorMode,
  useToast,
  Spinner,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiCheck } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { SunshineBackground } from './SunshineBackground';
import { getColor } from '../../../brandConfig';

// ==================== GRAPHQL MUTATIONS ====================

const CREATE_PUBLIC_BOOKING = gql`
  mutation CreatePublicBooking($input: CreatePublicBookingInput!) {
    createPublicBooking(input: $input) {
      booking {
        id
        title
        startTime
        endTime
      }
      bookingToken
      requiresPayment
      paymentAmount
      paymentCurrency
      stripeCheckoutUrl
    }
  }
`;

// ==================== TYPES ====================

interface LocationState {
  eventTypeId: string;
  eventTypeName?: string;
  startTime: string;
  endTime: string;
  calendarId?: string;
  calendarName?: string;
}

// ==================== COMPONENT ====================

export const PublicBookingConfirmPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const state = location.state as LocationState;

  // Form state
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const { colorMode } = useColorMode();

  // Use brandConfig colors
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = colorMode === 'light'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 248, 248, 0.65) 50%, rgba(255, 255, 255, 0.7) 100%)'
    : 'linear-gradient(135deg, rgba(20, 20, 20, 0.7) 0%, rgba(30, 30, 30, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)';
  const cardBorder = colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);

  // Mutation
  const [createBooking, { loading: creating }] = useMutation(CREATE_PUBLIC_BOOKING, {
    onCompleted: (data) => {
      if (data.createPublicBooking.requiresPayment && data.createPublicBooking.stripeCheckoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.createPublicBooking.stripeCheckoutUrl;
      } else {
        // Show success message
        toast({
          title: 'Booking Confirmed!',
          description: 'Your appointment has been scheduled. Check your email for confirmation.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Navigate to success page
        navigate(`/book/${slug}/success`, {
          state: {
            booking: data.createPublicBooking.booking,
            bookingToken: data.createPublicBooking.bookingToken,
          },
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Booking Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // ==================== HANDLERS ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state?.eventTypeId || !state?.startTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a time slot first.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/book/${slug}`);
      return;
    }

    try {
      await createBooking({
        variables: {
          input: {
            calendarSlug: slug,
            eventTypeId: state.eventTypeId,
            startTime: state.startTime,
            bookerName,
            bookerEmail,
            bookerPhone,
            bookerTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            answers: notes ? { notes } : {},
          },
        },
      });
    } catch (err) {
      // Error handled by onError callback
      console.error('Booking error:', err);
    }
  };

  // ==================== VALIDATION ====================

  if (!state?.eventTypeId || !state?.startTime) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>Invalid Booking Link</AlertTitle>
            <AlertDescription>
              Please start from the beginning and select a time slot.
            </AlertDescription>
          </Box>
        </Alert>
        <Button mt={4} onClick={() => navigate(`/book/${slug}`)}>
          Go to Booking Page
        </Button>
      </Container>
    );
  }

  // ==================== RENDER ====================

  return (
    <>
      <NavbarWithCallToAction />
      <Box minH="100vh" position="relative" bg={bg}>
        <SunshineBackground />
        <Box position="relative" zIndex={1}>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiCalendar} boxSize={6} color="blue.500" />
                  <Heading size="lg">Confirm Your Booking</Heading>
                </HStack>
                <Text color="gray.600">
                  Please provide your details to complete the booking.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Booking Summary */}
          <Card bg="linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(229, 236, 255, 0.7) 100%)" borderColor="blue.500" borderWidth="2px" backdropFilter="blur(10px)">
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md">Booking Details</Heading>
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text fontWeight="medium">
                    {format(parseISO(state.startTime), 'EEEE, MMMM d, yyyy')}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FiClock} />
                  <Text fontWeight="medium">
                    {format(parseISO(state.startTime), 'h:mm a')} -{' '}
                    {format(parseISO(state.endTime), 'h:mm a')}
                  </Text>
                </HStack>
                {state.eventTypeName && (
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                    {state.eventTypeName}
                  </Badge>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Booking Form */}
          <Card bg={cardGradientBg} backdropFilter="blur(10px)" borderColor={cardBorder} borderWidth="1px">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>
                      <HStack>
                        <Icon as={FiUser} />
                        <Text>Full Name</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="text"
                      value={bookerName}
                      onChange={(e) => setBookerName(e.target.value)}
                      placeholder="John Smith"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>
                      <HStack>
                        <Icon as={FiMail} />
                        <Text>Email Address</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="email"
                      value={bookerEmail}
                      onChange={(e) => setBookerEmail(e.target.value)}
                      placeholder="john@example.com"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <HStack>
                        <Icon as={FiPhone} />
                        <Text>Phone Number</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="tel"
                      value={bookerPhone}
                      onChange={(e) => setBookerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Additional Notes</FormLabel>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything else you'd like us to know..."
                      rows={4}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    leftIcon={creating ? <Spinner size="sm" /> : <Icon as={FiCheck} />}
                    isLoading={creating}
                    mt={4}
                  >
                    Confirm Booking
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    width="full"
                    onClick={() => navigate(-1)}
                    isDisabled={creating}
                  >
                    Go Back
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
        </Box>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default PublicBookingConfirmPage;
