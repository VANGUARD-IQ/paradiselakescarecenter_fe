import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Icon,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiMail, FiPhone, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, brandConfig } from '../../brandConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';

// GraphQL Queries and Mutations
const GET_BOOKING_BY_TOKEN = gql`
  query GetBookingByToken($token: String!) {
    getBookingByToken(token: $token) {
      id
      title
      startTime
      endTime
      metadata
    }
  }
`;

const CANCEL_BOOKING = gql`
  mutation CancelBooking($token: String!, $reason: String!) {
    cancelBooking(token: $token, reason: $reason)
  }
`;

export const ManageBooking = () => {
  usePageTitle('Manage Your Booking');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure();
  const [cancelReason, setCancelReason] = useState('');

  // Query to get booking details
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_BY_TOKEN, {
    variables: { token: token || '' },
    skip: !token,
    fetchPolicy: 'network-only', // Always fetch fresh data from server
  });

  // Mutation to cancel booking
  const [cancelBookingMutation, { loading: cancelling }] = useMutation(CANCEL_BOOKING, {
    onCompleted: (data) => {
      if (data.cancelBooking.success) {
        toast({
          title: 'Booking Cancelled',
          description: 'Your booking has been cancelled successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onCancelModalClose();
        // Refetch to update the booking status
        refetch();
      } else {
        toast({
          title: 'Cancellation Failed',
          description: data.cancelBooking.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for cancellation',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    await cancelBookingMutation({
      variables: {
        token: token || '',
        reason: cancelReason,
      },
    });
  };

  const bg = getColor('background.main');
  const cardGradientBg = getColor('background.cardGradient');
  const cardBorder = getColor('border.darkCard');
  const textPrimary = getColor('text.primaryDark');
  const textSecondary = getColor('text.secondaryDark');
  const textMuted = getColor('text.mutedDark');

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="container.md" py={12} flex="1">
          <VStack spacing={4}>
            <Spinner size="xl" color={textPrimary} />
            <Text color={textSecondary}>Loading your booking...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.getBookingByToken) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="container.md" py={12} flex="1">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Booking Not Found</Text>
              <Text fontSize="sm">
                This booking link is invalid or has expired. Please check your email for the correct link.
              </Text>
            </Box>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const booking = data.getBookingByToken;
  const metadata = booking.metadata || {};

  // Extract booking information from metadata
  const bookerName = metadata['X-BOOKER-NAME'] || 'Unknown';
  const bookerEmail = metadata['X-BOOKER-EMAIL'] || '';
  const bookerPhone = metadata['X-BOOKER-PHONE'] || '';
  const bookerTimezone = metadata['X-BOOKER-TIMEZONE'] || 'UTC';
  const bookingStatus = metadata['X-BOOKING-STATUS'] || 'CONFIRMED';
  const paymentStatus = metadata['X-PAYMENT-STATUS'] || 'NOT_REQUIRED';
  const paymentAmount = metadata['X-PAYMENT-AMOUNT'];
  const paymentCurrency = metadata['X-PAYMENT-CURRENCY'] || 'USD';
  const meetingLink = metadata['X-MEETING-LINK'];

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  // Extract custom question answers
  const customAnswers: Array<{ question: string; answer: string }> = [];
  Object.keys(metadata).forEach(key => {
    if (key.startsWith('X-BOOKING-QUESTION-')) {
      const index = key.replace('X-BOOKING-QUESTION-', '');
      const answerKey = `X-BOOKING-ANSWER-${index}`;
      if (metadata[answerKey]) {
        customAnswers.push({
          question: metadata[key],
          answer: metadata[answerKey],
        });
      }
    }
  });

  const getBookingStatusColor = () => {
    switch (bookingStatus) {
      case 'CONFIRMED': return 'green';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = () => {
    switch (paymentStatus) {
      case 'COMPLETED': return 'green';
      case 'PENDING': return 'yellow';
      case 'FAILED': return 'red';
      case 'NOT_REQUIRED': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={12} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading
              size="xl"
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
              mb={2}
            >
              Manage Your Booking
            </Heading>
            <Text color={textSecondary} fontSize="lg">
              {booking.title}
            </Text>
          </Box>

          {/* Status Badges */}
          <HStack justify="center" spacing={3}>
            <Badge colorScheme={getBookingStatusColor()} fontSize="md" px={3} py={1}>
              {bookingStatus}
            </Badge>
            {paymentStatus !== 'NOT_REQUIRED' && (
              <Badge colorScheme={getPaymentStatusColor()} fontSize="md" px={3} py={1}>
                Payment: {paymentStatus}
              </Badge>
            )}
          </HStack>

          {/* Booking Details Card */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="xl"
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="md" color={textPrimary}>
                Booking Information
              </Heading>
            </CardHeader>

            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Date & Time */}
                <HStack>
                  <Icon as={FiCalendar} color={textSecondary} boxSize={5} />
                  <Box flex="1">
                    <Text color={textMuted} fontSize="sm">Date</Text>
                    <Text color={textPrimary} fontWeight="medium">
                      {format(startDate, 'EEEE, MMMM d, yyyy')}
                    </Text>
                  </Box>
                </HStack>

                <HStack>
                  <Icon as={FiClock} color={textSecondary} boxSize={5} />
                  <Box flex="1">
                    <Text color={textMuted} fontSize="sm">Time</Text>
                    <Text color={textPrimary} fontWeight="medium">
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')} ({bookerTimezone})
                    </Text>
                  </Box>
                </HStack>

                {/* Your Details */}
                <Divider />

                <HStack>
                  <Icon as={FiUser} color={textSecondary} boxSize={5} />
                  <Box flex="1">
                    <Text color={textMuted} fontSize="sm">Name</Text>
                    <Text color={textPrimary} fontWeight="medium">{bookerName}</Text>
                  </Box>
                </HStack>

                <HStack>
                  <Icon as={FiMail} color={textSecondary} boxSize={5} />
                  <Box flex="1">
                    <Text color={textMuted} fontSize="sm">Email</Text>
                    <Text color={textPrimary} fontWeight="medium">{bookerEmail}</Text>
                  </Box>
                </HStack>

                {bookerPhone && (
                  <HStack>
                    <Icon as={FiPhone} color={textSecondary} boxSize={5} />
                    <Box flex="1">
                      <Text color={textMuted} fontSize="sm">Phone</Text>
                      <Text color={textPrimary} fontWeight="medium">{bookerPhone}</Text>
                    </Box>
                  </HStack>
                )}

                {/* Payment Info */}
                {paymentStatus !== 'NOT_REQUIRED' && (
                  <>
                    <Divider />
                    <HStack>
                      <Icon as={FiDollarSign} color={textSecondary} boxSize={5} />
                      <Box flex="1">
                        <Text color={textMuted} fontSize="sm">Amount</Text>
                        <Text color={textPrimary} fontWeight="medium">
                          {paymentAmount ? `${paymentCurrency} $${(paymentAmount / 100).toFixed(2)}` : 'N/A'}
                        </Text>
                      </Box>
                    </HStack>
                  </>
                )}

                {/* Meeting Link */}
                {meetingLink && bookingStatus === 'CONFIRMED' && (
                  <>
                    <Divider />
                    <HStack>
                      <Icon as={FiMapPin} color={textSecondary} boxSize={5} />
                      <Box flex="1">
                        <Text color={textMuted} fontSize="sm">Meeting Link</Text>
                        <Button
                          as="a"
                          href={meetingLink}
                          target="_blank"
                          colorScheme="blue"
                          size="sm"
                          mt={2}
                        >
                          Join Meeting
                        </Button>
                      </Box>
                    </HStack>
                  </>
                )}

                {/* Custom Answers */}
                {customAnswers.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Text color={textMuted} fontSize="sm" mb={2}>Additional Information</Text>
                      <VStack align="stretch" spacing={2}>
                        {customAnswers.map((qa, index) => (
                          <Box key={index}>
                            <Text color={textSecondary} fontSize="sm" fontWeight="medium">
                              {qa.question}
                            </Text>
                            <Text color={textPrimary} pl={4}>
                              {qa.answer}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          {bookingStatus === 'CONFIRMED' && (
            <HStack spacing={4}>
              <Button
                colorScheme="orange"
                variant="outline"
                size="lg"
                flex="1"
                onClick={() => toast({
                  title: 'Coming Soon',
                  description: 'Reschedule functionality will be available soon',
                  status: 'info',
                  duration: 3000,
                })}
              >
                Reschedule
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                size="lg"
                flex="1"
                onClick={onCancelModalOpen}
              >
                Cancel Booking
              </Button>
            </HStack>
          )}

          {bookingStatus === 'CANCELLED' && (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              This booking has been cancelled.
            </Alert>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={onCancelModalClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
          <ModalHeader color={textPrimary}>Cancel Booking</ModalHeader>
          <ModalCloseButton color={textSecondary} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color={textSecondary}>
                Are you sure you want to cancel this booking? The calendar owner will be notified.
              </Text>
              <Box>
                <Text color={textPrimary} mb={2} fontWeight="medium">
                  Reason for cancellation *
                </Text>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  rows={3}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCancelModalClose}>
              Keep Booking
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelBooking}
              isLoading={cancelling}
            >
              Cancel Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ManageBooking;
