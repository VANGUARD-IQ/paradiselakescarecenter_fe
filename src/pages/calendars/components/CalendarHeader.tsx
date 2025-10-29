import React from 'react';
import { Card, CardBody, HStack, Text, Icon, Button } from '@chakra-ui/react';
import { FiClock, FiEye, FiEyeOff } from 'react-icons/fi';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface CalendarHeaderProps {
  currentDate: Date;
  secondaryTimezone: string | null;
  getTimeInSecondaryTimezone: (date: Date, timezone: string) => string;
  showGoals: boolean;
  setShowGoals: (show: boolean) => void;
  setSelectedEvent: (event: any) => void;
  setIsEventModalOpen: (open: boolean) => void;
  cardGradientBg: string;
  cardBorder: string;
  textSecondary: string;
  primaryColor: string;
}

/**
 * Component to render the compact calendar header controls
 *
 * Features:
 * - Current date/time display
 * - Secondary timezone display
 * - Show/Hide Goals toggle
 * - Back navigation button
 * - New Event button
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  secondaryTimezone,
  getTimeInSecondaryTimezone,
  showGoals,
  setShowGoals,
  setSelectedEvent,
  setIsEventModalOpen,
  cardGradientBg,
  cardBorder,
  textSecondary,
  primaryColor,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px solid"
      borderColor={cardBorder}
    >
      <CardBody py={2} px={3}>
        <HStack
          justify="space-between"
          align="center"
        >
          <HStack spacing={3}>
            <Text fontSize="xs" color={textSecondary}>
              {currentDate.toLocaleDateString()}
            </Text>
            <HStack spacing={1}>
              <Icon as={FiClock} color={primaryColor} boxSize={3} />
              <Text fontSize="xs" color={textSecondary}>
                {new Date().toLocaleTimeString()}
              </Text>
            </HStack>
            {secondaryTimezone && (
              <>
                <Text fontSize="xs" color={textSecondary}>|</Text>
                <HStack spacing={1}>
                  <Text fontSize="xs" color="cyan.400">
                    {secondaryTimezone.split('/').pop()?.replace('_', ' ')}:
                  </Text>
                  <Text fontSize="xs" color="cyan.300">
                    {getTimeInSecondaryTimezone(new Date(), secondaryTimezone)}
                  </Text>
                </HStack>
              </>
            )}
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<Icon as={showGoals ? FiEyeOff : FiEye} boxSize={3} />}
              variant="ghost"
              onClick={() => setShowGoals(!showGoals)}
              color={primaryColor}
              size="xs"
              fontSize="xs"
              height="24px"
              px={2}
              _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
            >
              {showGoals ? "Hide" : "Show"} Goals
            </Button>
            <Button
              leftIcon={<ArrowBackIcon boxSize={3} />}
              variant="ghost"
              onClick={() => navigate('/calendars')}
              color={primaryColor}
              size="xs"
              fontSize="xs"
              height="24px"
              px={2}
              _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
            >
              Back
            </Button>
            <Button
              leftIcon={<AddIcon boxSize={3} />}
              colorScheme="blue"
              onClick={() => {
                setSelectedEvent(null);
                setIsEventModalOpen(true);
              }}
              size="xs"
              fontSize="xs"
              height="24px"
              px={2}
            >
              New Event
            </Button>
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
};
