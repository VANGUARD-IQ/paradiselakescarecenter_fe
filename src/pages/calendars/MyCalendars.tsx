import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardHeader,
    CardBody,
    Button,
    Spinner,
    Center,
    Badge,
    useColorModeValue,
    Divider,
    Icon,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Flex,
    IconButton,
    Tooltip,
    useToast,
    useColorMode,
    Checkbox
} from '@chakra-ui/react';
import { brandConfig, getColor } from "../../brandConfig";
import {
    FiCalendar,
    FiUser,
    FiMail,
    FiExternalLink,
    FiStar,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiEye,
    FiSquare,
    FiCheckSquare,
    FiCopy
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { calendarsModuleConfig } from "./moduleConfig";

// Query to get current user's details
const ME_QUERY = gql`
    query Me {
        me {
            id
            fName
            lName
            email
        }
    }
`;

// Query to get calendars accessible to the current user
const MY_CALENDARS_QUERY = gql`
    query MyCalendars {
        myCalendars {
            id
            name
            type
            description
            responsibleOwnerId
            linkedEmailAddressId
            createdAt
            updatedAt
            lastEventAt
            eventCount
            allowPublicBooking
            bookingPageSlug
        }
    }
`;

const MyCalendars: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(new Set());

    // Brand styling from brandConfig
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const primaryColor = getColor("primary", colorMode);
    const primaryHover = getColor("primaryHover", colorMode);
    const successGreen = getColor("status.success", colorMode);
    const secondaryGreen = getColor("secondary", colorMode);

    // Fetch current user
    const { data: meData } = useQuery(ME_QUERY);
    const currentUser = meData?.me;

    // Fetch calendars
    const { loading, error, data, refetch } = useQuery(MY_CALENDARS_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    // Determine if a calendar is primary (owned by current user)
    // Update page title
    usePageTitle('My Calendars');

    const isPrimaryCalendar = (calendar: any) => {
        return calendar.responsibleOwnerId === currentUser?.id;
    };

    // Get calendar type badge color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PERSONAL':
                return 'purple';
            case 'TEAM':
                return 'blue';
            case 'CLIENT':
                return 'green';
            case 'SHARED':
                return 'orange';
            default:
                return 'gray';
        }
    };

    // Format last event date
    const getLastEventText = (lastEventAt: string | null) => {
        if (!lastEventAt) {
            return 'No events yet';
        }
        const lastEvent = new Date(lastEventAt);
        const daysAgo = Math.floor((Date.now() - lastEvent.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo === 0) {
            return 'Event today';
        } else if (daysAgo === 1) {
            return 'Event yesterday';
        } else if (daysAgo < 7) {
            return `Last event ${daysAgo} days ago`;
        } else if (daysAgo < 30) {
            const weeksAgo = Math.floor(daysAgo / 7);
            return `Last event ${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
        } else {
            const monthsAgo = Math.floor(daysAgo / 30);
            return `Last event ${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
        }
    };

    // Toggle calendar selection
    const toggleCalendarSelection = (calendarId: string) => {
        setSelectedCalendarIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(calendarId)) {
                newSet.delete(calendarId);
            } else {
                newSet.add(calendarId);
            }
            return newSet;
        });
    };

    // Clear all selections
    const clearSelections = () => {
        setSelectedCalendarIds(new Set());
    };

    // Open selected calendars in new tab
    const openMultipleCalendars = () => {
        if (selectedCalendarIds.size === 0) {
            toast({
                title: 'No calendars selected',
                description: 'Please select at least one calendar to view',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const calendarIds = Array.from(selectedCalendarIds).join(',');
        const url = `/calendars/view?calendars=${calendarIds}`;
        window.open(url, '_blank');

        // Clear selection after opening
        setSelectedCalendarIds(new Set());
    };

    // Copy booking URL to clipboard
    const copyBookingUrl = (bookingPageSlug: string) => {
        const bookingUrl = `${window.location.origin}/book/${bookingPageSlug}`;

        navigator.clipboard.writeText(bookingUrl).then(() => {
            toast({
                title: 'Booking URL copied!',
                description: `Copied: ${bookingUrl}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }).catch((err) => {
            console.error('Failed to copy:', err);
            toast({
                title: 'Failed to copy',
                description: 'Please try again',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        });
    };

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <VStack spacing={4}>
                            <Spinner size="xl" color={primaryColor} />
                            <Text color={textSecondary}>Loading calendars...</Text>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <VStack spacing={4}>
                            <Text color="red.500">Error loading calendars</Text>
                            <Button onClick={() => refetch()} colorScheme="blue">
                                Try Again
                            </Button>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const calendars = data?.myCalendars || [];
    const primaryCalendars = calendars.filter((cal: any) => isPrimaryCalendar(cal));
    const sharedCalendars = calendars.filter((cal: any) => !isPrimaryCalendar(cal));

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(20px)"
                        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                        border="1px solid"
                        borderColor={cardBorder}
                        borderRadius="xl"
                    >
                        <CardBody p={8}>
                            <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                                <VStack align="start" spacing={3}>
                                    <Heading
                                        size="2xl"
                                        color={textPrimary}
                                        fontFamily={brandConfig.fonts.heading}
                                        fontWeight="bold"
                                        letterSpacing="tight"
                                    >
                                        My Calendars
                                    </Heading>
                                    <Text
                                        color={textSecondary}
                                        fontSize="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        Manage your personal and shared calendars
                                    </Text>
                                </VStack>
                                {selectedCalendarIds.size > 0 && (
                                    <VStack align="end" spacing={2}>
                                        <Button
                                            leftIcon={<FiEye />}
                                            colorScheme="purple"
                                            onClick={openMultipleCalendars}
                                            size="lg"
                                        >
                                            View {selectedCalendarIds.size} Calendar{selectedCalendarIds.size !== 1 ? 's' : ''}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={clearSelections}
                                            color={textSecondary}
                                        >
                                            Clear Selection
                                        </Button>
                                    </VStack>
                                )}
                            </Flex>
                        </CardBody>
                    </Card>

                    {/* Stats */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(20px)"
                        boxShadow="0 4px 16px 0 rgba(31, 38, 135, 0.2)"
                        border="1px solid"
                        borderColor={cardBorder}
                        borderRadius="xl"
                    >
                        <CardBody p={6}>
                            <StatGroup>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize="sm" fontWeight="medium">Total Calendars</StatLabel>
                                    <StatNumber color={textPrimary} fontSize="3xl" fontWeight="bold">{calendars.length}</StatNumber>
                                </Stat>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize="sm" fontWeight="medium">Primary Calendars</StatLabel>
                                    <StatNumber color={primaryColor} fontSize="3xl" fontWeight="bold">{primaryCalendars.length}</StatNumber>
                                </Stat>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize="sm" fontWeight="medium">Shared With Me</StatLabel>
                                    <StatNumber color={successGreen} fontSize="3xl" fontWeight="bold">{sharedCalendars.length}</StatNumber>
                                </Stat>
                            </StatGroup>
                        </CardBody>
                    </Card>

                    {/* Primary Calendars Section */}
                    {primaryCalendars.length > 0 && (
                        <Box>
                            <Heading
                                size="lg"
                                color={textPrimary}
                                mb={4}
                                fontFamily={brandConfig.fonts.heading}
                                fontWeight="semibold"
                            >
                                <HStack spacing={3}>
                                    <Icon as={FiStar} color={primaryColor} boxSize={6} />
                                    <Text>My Primary Calendars</Text>
                                </HStack>
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                {primaryCalendars.map((calendar: any) => {
                                    return (
                                        <Card
                                            key={calendar.id}
                                            bg={cardGradientBg}
                                            backdropFilter="blur(20px)"
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            borderRadius="xl"
                                            boxShadow="0 4px 16px 0 rgba(31, 38, 135, 0.15)"
                                            _hover={{
                                                transform: 'translateY(-4px) scale(1.01)',
                                                boxShadow: '0 10px 30px rgba(31, 38, 135, 0.3)',
                                                cursor: 'pointer',
                                                borderColor: primaryColor
                                            }}
                                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            position="relative"
                                        >
                                            <Box
                                                position="absolute"
                                                top={3}
                                                left={3}
                                                zIndex={2}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    isChecked={selectedCalendarIds.has(calendar.id)}
                                                    onChange={() => toggleCalendarSelection(calendar.id)}
                                                    colorScheme="purple"
                                                    size="lg"
                                                    bg={cardGradientBg}
                                                    borderRadius="md"
                                                    p={1}
                                                />
                                            </Box>
                                            <Box onClick={() => window.open(`/calendars/${calendar.id}/view`, '_blank')} cursor="pointer">
                                            <CardHeader pb={2} pl={14}>
                                                <Flex justify="space-between" align="start">
                                                    <VStack align="start" spacing={1}>
                                                        <Heading size="sm" color={textPrimary}>
                                                            {calendar.name}
                                                        </Heading>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme={getTypeColor(calendar.type)}>
                                                                {calendar.type}
                                                            </Badge>
                                                            <Badge colorScheme="blue" variant="outline">
                                                                PRIMARY
                                                            </Badge>
                                                            {calendar.allowPublicBooking && (
                                                                <Badge colorScheme="green" variant="solid">
                                                                    📅 PUBLIC BOOKING
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                    </VStack>
                                                    <Tooltip label="Open Calendar">
                                                        <IconButton
                                                            aria-label="Open Calendar"
                                                            icon={<FiExternalLink />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color={textSecondary}
                                                            _hover={{
                                                                bg: 'rgba(255, 255, 255, 0.1)',
                                                                color: primaryColor
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/calendars/${calendar.id}/view`, '_blank');
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Flex>
                                            </CardHeader>
                                            <CardBody pt={2}>
                                                <VStack align="start" spacing={3}>
                                                    {calendar.description && (
                                                        <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                                            {calendar.description}
                                                        </Text>
                                                    )}

                                                    <VStack align="start" spacing={2} w="full">
                                                        {/* Event Count */}
                                                        <HStack>
                                                            <Icon as={FiCalendar} color={textSecondary} boxSize={4} />
                                                            <Text fontSize="sm" color={textSecondary}>
                                                                {calendar.eventCount || 0} events
                                                            </Text>
                                                        </HStack>

                                                        {/* Last Event */}
                                                        <HStack>
                                                            <Icon as={FiClock} color={textSecondary} boxSize={4} />
                                                            <Text fontSize="sm" color={textSecondary}>
                                                                {getLastEventText(calendar.lastEventAt)}
                                                            </Text>
                                                        </HStack>

                                                        {/* Accepted Emails - Temporarily disabled, linkedEmailAddressId needs to be resolved */}
                                                        {/* {calendar.acceptedEmailAddresses?.length > 0 && (
                                                            <Box w="full">
                                                                <HStack mb={1}>
                                                                    <Icon as={FiMail} color={textSecondary} boxSize={4} />
                                                                    <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                                                                        Accepts emails:
                                                                    </Text>
                                                                </HStack>
                                                                <Box pl={6}>
                                                                    {calendar.acceptedEmailAddresses.slice(0, 2).map((email: string) => (
                                                                        <Text key={email} fontSize="xs" color={textSecondary} noOfLines={1}>
                                                                            {email}
                                                                        </Text>
                                                                    ))}
                                                                    {calendar.acceptedEmailAddresses.length > 2 && (
                                                                        <Text fontSize="xs" color={textSecondary}>
                                                                            +{calendar.acceptedEmailAddresses.length - 2} more
                                                                        </Text>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        )} */}
                                                    </VStack>

                                                    {/* Action Buttons */}
                                                    <Divider my={2} />
                                                    <HStack spacing={2} w="full">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            colorScheme="blue"
                                                            flex={1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/calendars/${calendar.id}/edit`);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        {calendar.allowPublicBooking && (
                                                            <Button
                                                                size="sm"
                                                                colorScheme="purple"
                                                                flex={1}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/calendars/${calendar.id}/event-types`);
                                                                }}
                                                            >
                                                                Event Types
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                    {calendar.allowPublicBooking && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="green"
                                                                w="full"
                                                                leftIcon={<FiClock />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/calendars/${calendar.id}/availability`);
                                                                }}
                                                            >
                                                                ⏰ Set Availability
                                                            </Button>
                                                            {calendar.bookingPageSlug && (
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    w="full"
                                                                    leftIcon={<FiCopy />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyBookingUrl(calendar.bookingPageSlug);
                                                                    }}
                                                                >
                                                                    📋 Copy Booking URL
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </VStack>
                                            </CardBody>
                                            </Box>
                                        </Card>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>
                    )}

                    {/* Shared Calendars Section */}
                    {sharedCalendars.length > 0 && (
                        <Box>
                            <Heading
                                size="lg"
                                color={textPrimary}
                                mb={4}
                                fontFamily={brandConfig.fonts.heading}
                                fontWeight="semibold"
                            >
                                <HStack spacing={3}>
                                    <Icon as={FiUser} color={secondaryGreen} boxSize={6} />
                                    <Text>Shared With Me</Text>
                                </HStack>
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                {sharedCalendars.map((calendar: any) => {
                                    return (
                                        <Card
                                            key={calendar.id}
                                            bg={cardGradientBg}
                                            backdropFilter="blur(20px)"
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            borderRadius="xl"
                                            boxShadow="0 4px 16px 0 rgba(31, 38, 135, 0.15)"
                                            _hover={{
                                                transform: 'translateY(-4px) scale(1.01)',
                                                boxShadow: '0 10px 30px rgba(31, 38, 135, 0.3)',
                                                cursor: 'pointer',
                                                borderColor: primaryColor
                                            }}
                                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            position="relative"
                                        >
                                            <Box
                                                position="absolute"
                                                top={3}
                                                left={3}
                                                zIndex={2}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    isChecked={selectedCalendarIds.has(calendar.id)}
                                                    onChange={() => toggleCalendarSelection(calendar.id)}
                                                    colorScheme="purple"
                                                    size="lg"
                                                    bg={cardGradientBg}
                                                    borderRadius="md"
                                                    p={1}
                                                />
                                            </Box>
                                            <Box onClick={() => window.open(`/calendars/${calendar.id}/view`, '_blank')} cursor="pointer">
                                            <CardHeader pb={2} pl={14}>
                                                <Flex justify="space-between" align="start">
                                                    <VStack align="start" spacing={1}>
                                                        <Heading size="sm" color={textPrimary}>
                                                            {calendar.name}
                                                        </Heading>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme={getTypeColor(calendar.type)}>
                                                                {calendar.type}
                                                            </Badge>
                                                            <Badge colorScheme="orange" variant="outline">
                                                                SHARED
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                    <Tooltip label="Open Calendar">
                                                        <IconButton
                                                            aria-label="Open Calendar"
                                                            icon={<FiExternalLink />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color={textSecondary}
                                                            _hover={{
                                                                bg: 'rgba(255, 255, 255, 0.1)',
                                                                color: primaryColor
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/calendars/${calendar.id}/view`, '_blank');
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Flex>
                                            </CardHeader>
                                            <CardBody pt={2}>
                                                <VStack align="start" spacing={3}>
                                                    {calendar.description && (
                                                        <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                                            {calendar.description}
                                                        </Text>
                                                    )}

                                                    <VStack align="start" spacing={2} w="full">
                                                        {/* Event Count */}
                                                        <HStack>
                                                            <Icon as={FiCalendar} color={textSecondary} boxSize={4} />
                                                            <Text fontSize="sm" color={textSecondary}>
                                                                {calendar.eventCount || 0} events
                                                            </Text>
                                                        </HStack>

                                                        {/* Last Event */}
                                                        <HStack>
                                                            <Icon as={FiClock} color={textSecondary} boxSize={4} />
                                                            <Text fontSize="sm" color={textSecondary}>
                                                                {getLastEventText(calendar.lastEventAt)}
                                                            </Text>
                                                        </HStack>

                                                        {/* Accepted Email Addresses - Temporarily disabled, linkedEmailAddressId needs to be resolved */}
                                                        {/* {calendar.acceptedEmailAddresses?.length > 0 && (
                                                            <Box w="full">
                                                                <HStack mb={1}>
                                                                    <Icon as={FiMail} color={textSecondary} boxSize={4} />
                                                                    <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                                                                        Accepts emails from:
                                                                    </Text>
                                                                </HStack>
                                                                <Box pl={6}>
                                                                    {calendar.acceptedEmailAddresses.slice(0, 2).map((email: string) => (
                                                                        <Text key={email} fontSize="xs" color={textSecondary} noOfLines={1}>
                                                                            {email}
                                                                        </Text>
                                                                    ))}
                                                                    {calendar.acceptedEmailAddresses.length > 2 && (
                                                                        <Text fontSize="xs" color={textSecondary}>
                                                                            +{calendar.acceptedEmailAddresses.length - 2} more
                                                                        </Text>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        )} */}
                                                    </VStack>

                                                    {/* Action Buttons */}
                                                    <Divider my={2} />
                                                    <HStack spacing={2} w="full">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            colorScheme="blue"
                                                            flex={1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/calendars/${calendar.id}/edit`);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        {calendar.allowPublicBooking && (
                                                            <Button
                                                                size="sm"
                                                                colorScheme="purple"
                                                                flex={1}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/calendars/${calendar.id}/event-types`);
                                                                }}
                                                            >
                                                                Event Types
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                    {calendar.allowPublicBooking && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="green"
                                                                w="full"
                                                                leftIcon={<FiClock />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/calendars/${calendar.id}/availability`);
                                                                }}
                                                            >
                                                                ⏰ Set Availability
                                                            </Button>
                                                            {calendar.bookingPageSlug && (
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    w="full"
                                                                    leftIcon={<FiCopy />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyBookingUrl(calendar.bookingPageSlug);
                                                                    }}
                                                                >
                                                                    📋 Copy Booking URL
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </VStack>
                                            </CardBody>
                                            </Box>
                                        </Card>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>
                    )}

                    {/* Empty State */}
                    {calendars.length === 0 && (
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(20px)"
                            boxShadow="0 4px 16px 0 rgba(31, 38, 135, 0.2)"
                            border="1px solid"
                            borderColor={cardBorder}
                            borderRadius="xl"
                        >
                            <CardBody>
                                <Center py={12}>
                                    <VStack spacing={4}>
                                        <Icon as={FiCalendar} boxSize={12} color={textSecondary} />
                                        <Text fontSize="lg" color={textSecondary}>
                                            No calendars found
                                        </Text>
                                        <Text fontSize="sm" color={textSecondary} textAlign="center">
                                            You don't have any calendars assigned to you yet.
                                        </Text>
                                        <Button
                                            bg={primaryColor}
                                            color="white"
                                            _hover={{ bg: primaryHover }}
                                            leftIcon={<FiCalendar />}
                                            onClick={() => navigate('/calendars/admin')}
                                            size="lg"
                                            borderRadius="md"
                                            fontWeight="medium"
                                            px={6}
                                        >
                                            Manage Calendars
                                        </Button>
                                    </VStack>
                                </Center>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default MyCalendars;