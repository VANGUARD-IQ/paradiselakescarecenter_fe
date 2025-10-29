import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  useColorMode,
} from '@chakra-ui/react';
import { FiCheckCircle, FiCalendar, FiClock, FiMail, FiHome } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { SunshineBackground } from './SunshineBackground';
import { getColor } from '../../../brandConfig';

// ==================== TYPES ====================

interface LocationState {
  booking?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  };
  bookingToken?: string;
}

// ==================== COMPONENT ====================

export const PublicBookingSuccessPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const state = location.state as LocationState;

  // Use brandConfig colors
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = colorMode === 'light'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 248, 248, 0.65) 50%, rgba(255, 255, 255, 0.7) 100%)'
    : 'linear-gradient(135deg, rgba(20, 20, 20, 0.7) 0%, rgba(30, 30, 30, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)';
  const cardBorder = colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const successGreen = getColor('status.success', colorMode);

  // ==================== RENDER ====================

  return (
    <>
      <NavbarWithCallToAction />
      <Box minH="100vh" position="relative" bg={bg}>
        <SunshineBackground />
        <Box position="relative" zIndex={1}>
          <Container maxW="container.md" py={16}>
            <VStack spacing={8} align="stretch">
              {/* Success Icon */}
              <VStack spacing={4}>
                <Box
                  bg={successGreen}
                  borderRadius="full"
                  p={6}
                  boxShadow="0 0 40px rgba(48, 209, 88, 0.3)"
                >
                  <Icon as={FiCheckCircle} boxSize={16} color="white" />
                </Box>
                <Heading size="2xl" color={textPrimary} textAlign="center">
                  Booking Confirmed!
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center">
                  Your appointment has been successfully scheduled
                </Text>
              </VStack>

              {/* Booking Details Card */}
              {state?.booking && (
                <Box
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  borderColor={cardBorder}
                  borderWidth="1px"
                  borderRadius="xl"
                  p={8}
                  shadow="xl"
                >
                  <VStack spacing={6} align="start">
                    <Heading size="md" color={textPrimary}>
                      Appointment Details
                    </Heading>

                    <VStack spacing={4} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={FiCalendar} boxSize={5} color={successGreen} />
                        <Text color={textPrimary} fontSize="lg">
                          {format(parseISO(state.booking.startTime), 'EEEE, MMMM d, yyyy')}
                        </Text>
                      </HStack>

                      <HStack spacing={3}>
                        <Icon as={FiClock} boxSize={5} color={successGreen} />
                        <Text color={textPrimary} fontSize="lg">
                          {format(parseISO(state.booking.startTime), 'h:mm a')} -{' '}
                          {format(parseISO(state.booking.endTime), 'h:mm a')}
                        </Text>
                      </HStack>

                      <HStack spacing={3}>
                        <Icon as={FiMail} boxSize={5} color={successGreen} />
                        <Text color={textSecondary}>
                          A confirmation email has been sent to your inbox
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              )}

              {/* Next Steps Card */}
              <Box
                bg="linear-gradient(135deg, rgba(48, 209, 88, 0.1) 0%, rgba(48, 209, 88, 0.05) 100%)"
                backdropFilter="blur(10px)"
                borderColor="rgba(48, 209, 88, 0.3)"
                borderWidth="1px"
                borderRadius="xl"
                p={6}
                shadow="lg"
              >
                <VStack spacing={4} align="start">
                  <Heading size="sm" color={textPrimary}>
                    What's Next?
                  </Heading>
                  <VStack spacing={2} align="start" pl={4}>
                    <Text color={textSecondary}>
                      • Check your email for the confirmation and calendar invite
                    </Text>
                    <Text color={textSecondary}>
                      • Add the appointment to your calendar
                    </Text>
                    <Text color={textSecondary}>
                      • You'll receive a reminder before the meeting
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* Actions */}
              <VStack spacing={3}>
                <Button
                  size="lg"
                  colorScheme="green"
                  leftIcon={<Icon as={FiHome} />}
                  onClick={() => navigate(`/book/${slug}`)}
                  w="full"
                >
                  Book Another Appointment
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  w="full"
                >
                  Return to Home
                </Button>
              </VStack>
            </VStack>
          </Container>
        </Box>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default PublicBookingSuccessPage;
