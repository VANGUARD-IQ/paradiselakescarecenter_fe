import React from 'react';
import {
  Flex,
  HStack,
  VStack,
  Button,
  IconButton,
  Heading,
  Text,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Icon,
  Tooltip,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getMonthYearDisplay } from '../utils/timezoneHelpers';

interface CalendarToolbarProps {
  currentView: string;
  currentDate: Date;
  isMultiCalendar: boolean;
  calendarIds: string[];
  calendar: any;
  calendarsData: any;
  linkedEmailData: any;
  filteredEvents: any[];
  calendarColorMap: Map<string, string>;
  is24HourView: boolean;
  handleToday: () => void;
  handleScrollToNow: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleViewChange: (view: string) => void;
  setIs24HourView: (value: boolean) => void;
  updateUrlParams: (params: any) => void;
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
  primaryHover: string;
  cardBorder: string;
}

/**
 * Component to render the calendar toolbar controls (single Flex row)
 *
 * Features:
 * - Navigation controls (Today, Previous, Next)
 * - Scroll to Now button (week/day views)
 * - Month/Year display
 * - Calendar information display
 * - Multi-calendar badges
 * - Email listening status alert
 * - View switcher (Month/Week/Day)
 * - Business/24h hours toggle
 */
export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentView,
  currentDate,
  isMultiCalendar,
  calendarIds,
  calendar,
  calendarsData,
  linkedEmailData,
  filteredEvents,
  calendarColorMap,
  is24HourView,
  handleToday,
  handleScrollToNow,
  handlePrevious,
  handleNext,
  handleViewChange,
  setIs24HourView,
  updateUrlParams,
  textPrimary,
  textSecondary,
  primaryColor,
  primaryHover,
  cardBorder,
}) => {
  const navigate = useNavigate();

  return (
    <Flex
        width="100%"
        align="center"
        justify="space-between"
        flexWrap={{ base: "wrap", md: "nowrap" }}
        gap={4}
      >
        {/* Left side: Navigation, Month/Year, and Calendar Info */}
        <HStack spacing={{ base: 2, md: 4 }} flex="1" align="center">
          <Button
            onClick={handleToday}
            variant="outline"
            borderColor={primaryColor}
            color={primaryColor}
            _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
            size={{ base: "sm", md: "md" }}
            fontWeight="medium"
          >
            Today
          </Button>

          {/* Scroll to Now button - only show in week/day views */}
          {(currentView === 'timeGridWeek' || currentView === 'timeGridDay') && (
            <Button
              onClick={handleScrollToNow}
              variant="ghost"
              colorScheme="blue"
              leftIcon={<TimeIcon />}
              size={{ base: "sm", md: "md" }}
              fontWeight="medium"
              title="Scroll to current time"
            >
              <Text display={{ base: "none", md: "block" }}>Now</Text>
            </Button>
          )}

          <HStack spacing={1}>
            <IconButton
              aria-label="Previous month"
              icon={<ChevronLeftIcon />}
              onClick={handlePrevious}
              variant="ghost"
              color={textPrimary}
              _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
              size={{ base: "xs", md: "sm" }}
            />
            <IconButton
              aria-label="Next month"
              icon={<ChevronRightIcon />}
              onClick={handleNext}
              variant="ghost"
              color={textPrimary}
              _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
              size={{ base: "xs", md: "sm" }}
            />
          </HStack>

          <Heading size={{ base: "sm", md: "md" }} color={textPrimary} fontWeight="semibold">
            {getMonthYearDisplay(currentDate)}
          </Heading>

          <Divider orientation="vertical" height="20px" borderColor={cardBorder} />

          {/* Calendar Info Inline */}
          <VStack align="start" spacing={0}>
            {/* Email Listening Status - Show for single calendar only */}
            {!isMultiCalendar && (
              <>
                {linkedEmailData?.getLinkedEmailForCalendar ? (
                  <Alert status="info" variant="subtle" bg="rgba(59, 130, 246, 0.1)" borderRadius="md" py={1} px={3} mb={2}>
                    <AlertIcon boxSize="14px" color={primaryColor} />
                    <Text fontSize="xs" color={textPrimary}>
                      📧 Listening for calendar invites on <strong>{linkedEmailData.getLinkedEmailForCalendar}</strong>
                    </Text>
                    <Tooltip
                      label={
                        <VStack align="start" spacing={2} p={1}>
                          <Text fontSize="xs" fontWeight="semibold">How Email-to-Calendar Linking Works:</Text>
                          <Text fontSize="xs">
                            Email addresses can have a <strong>primary calendar</strong> and <strong>additional linked calendars</strong>.
                          </Text>
                          <Text fontSize="xs">
                            When calendar invites (.ics files) are sent to an email address, they automatically appear on all linked calendars.
                          </Text>
                          <ChakraLink
                            href="/emails/admin/accounts"
                            color="blue.300"
                            textDecoration="underline"
                            fontSize="xs"
                            fontWeight="semibold"
                          >
                            Manage Email Accounts →
                          </ChakraLink>
                        </VStack>
                      }
                      placement="bottom"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      borderRadius="md"
                      p={3}
                      maxW="350px"
                    >
                      <IconButton
                        aria-label="Email linking info"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                        color={primaryColor}
                        ml={2}
                        _hover={{ bg: 'rgba(59, 130, 246, 0.2)' }}
                      />
                    </Tooltip>
                  </Alert>
                ) : (
                  <Alert status="warning" variant="subtle" bg="rgba(251, 191, 36, 0.1)" borderRadius="md" py={1} px={3} mb={2}>
                    <AlertIcon boxSize="14px" color="orange.400" />
                    <Text fontSize="xs" color={textPrimary}>
                      This calendar is not listening on any emails.
                    </Text>
                    <Tooltip
                      label={
                        <VStack align="start" spacing={2} p={1}>
                          <Text fontSize="xs" fontWeight="semibold">Set Up Email Listening:</Text>
                          <Text fontSize="xs">
                            To receive calendar invites via email, link this calendar to an email address.
                          </Text>
                          <Text fontSize="xs">
                            You can set it as the <strong>primary calendar</strong> for an email address, or add it as an <strong>additional linked calendar</strong>.
                          </Text>
                          <ChakraLink
                            href="/emails/admin/accounts"
                            color="blue.300"
                            textDecoration="underline"
                            fontSize="xs"
                            fontWeight="semibold"
                          >
                            Manage Email Accounts →
                          </ChakraLink>
                        </VStack>
                      }
                      placement="bottom"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      borderRadius="md"
                      p={3}
                      maxW="350px"
                    >
                      <IconButton
                        aria-label="Email linking info"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                        color="orange.400"
                        ml={2}
                        _hover={{ bg: 'rgba(251, 191, 36, 0.2)' }}
                      />
                    </Tooltip>
                  </Alert>
                )}
              </>
            )}
            {isMultiCalendar ? (
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <CalendarIcon color={primaryColor} boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>
                    Multi-Calendar View ({calendarIds.length} calendars)
                  </Text>
                  <Badge colorScheme="green" size="sm">
                    {filteredEvents.length} Events
                  </Badge>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {calendarsData?.getCalendarsByIds?.map((cal: any) => (
                    <Badge
                      key={cal.id}
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={calendarColorMap.get(cal.id) || '#3B82F6'}
                      color="white"
                      fontSize="xs"
                      cursor="pointer"
                      _hover={{
                        opacity: 0.8,
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => window.open(`/calendars/${cal.id}/view`, '_blank')}
                    >
                      {cal.name}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            ) : (
              <HStack spacing={2}>
                <CalendarIcon color={primaryColor} boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>
                  {calendar?.name}
                </Text>
                <Badge colorScheme="blue" size="sm">{calendar?.type}</Badge>
                {calendar?.type === 'PERSONAL' && (
                  <Badge colorScheme="purple" size="sm">Personal</Badge>
                )}
                <Badge colorScheme="green" size="sm">
                  {filteredEvents.length} Events
                </Badge>
                <Button
                  size="xs"
                  variant="ghost"
                  color={primaryColor}
                  onClick={() => navigate(`/calendars/${calendar?.id}`)}
                  _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                >
                  Settings
                </Button>
              </HStack>
            )}
            {!isMultiCalendar && calendar?.description && (
              <Text fontSize="xs" color={textSecondary} pl={6}>
                {calendar.description}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Right side: View switcher */}
        <HStack spacing={{ base: 1, md: 2 }}>
          <Button
            size={{ base: "xs", md: "sm" }}
            onClick={() => handleViewChange('dayGridMonth')}
            bg={currentView === 'dayGridMonth' ? primaryColor : 'transparent'}
            color={currentView === 'dayGridMonth' ? 'white' : textPrimary}
            _hover={{ bg: currentView === 'dayGridMonth' ? primaryHover : "rgba(59, 130, 246, 0.1)" }}
            borderRadius="md"
            px={{ base: 2, md: 4 }}
          >
            Month
          </Button>
          <Button
            size={{ base: "xs", md: "sm" }}
            onClick={() => handleViewChange('timeGridWeek')}
            bg={currentView === 'timeGridWeek' ? primaryColor : 'transparent'}
            color={currentView === 'timeGridWeek' ? 'white' : textPrimary}
            _hover={{ bg: currentView === 'timeGridWeek' ? primaryHover : "rgba(59, 130, 246, 0.1)" }}
            borderRadius="md"
            px={{ base: 2, md: 4 }}
          >
            Week
          </Button>
          <Button
            size={{ base: "xs", md: "sm" }}
            onClick={() => handleViewChange('timeGridDay')}
            bg={currentView === 'timeGridDay' ? primaryColor : 'transparent'}
            color={currentView === 'timeGridDay' ? 'white' : textPrimary}
            _hover={{ bg: currentView === 'timeGridDay' ? primaryHover : "rgba(59, 130, 246, 0.1)" }}
            borderRadius="md"
            px={{ base: 2, md: 4 }}
          >
            Day
          </Button>
          {(currentView === 'timeGridWeek' || currentView === 'timeGridDay') && (
            <>
              <Divider orientation="vertical" height="20px" borderColor={textSecondary} opacity={0.3} />
              <Button
                size={{ base: "xs", md: "sm" }}
                onClick={() => {
                  const new24HourView = !is24HourView;
                  setIs24HourView(new24HourView);
                  // Update URL with hours parameter
                  updateUrlParams({ hours: new24HourView ? '24' : 'business' });
                }}
                bg={is24HourView ? primaryColor : 'transparent'}
                color={is24HourView ? 'white' : textPrimary}
                _hover={{ bg: is24HourView ? primaryHover : "rgba(59, 130, 246, 0.1)" }}
                borderRadius="md"
                px={{ base: 2, md: 4 }}
                leftIcon={<Icon as={TimeIcon} boxSize={{ base: 3, md: 4 }} />}
              >
                {is24HourView ? "Business" : "24h"}
              </Button>
            </>
          )}
        </HStack>
      </Flex>
  );
};
