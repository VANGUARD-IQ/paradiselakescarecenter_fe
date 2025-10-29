import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    Spinner,
    Center,
    useColorMode,
} from '@chakra-ui/react';
import { brandConfig, getColor } from "../../brandConfig";
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { calendarsModuleConfig } from "./moduleConfig";

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
        }
    }
`;

const BirdsEyeView: React.FC = () => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();

    // Brand styling from brandConfig
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const primaryColor = getColor("primary", colorMode);

    // Update page title
    usePageTitle("Bird's Eye View - Calendars");

    // Fetch calendars
    const { loading, error, data } = useQuery(MY_CALENDARS_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    // Auto-select all calendars and navigate to view
    useEffect(() => {
        if (data?.myCalendars && data.myCalendars.length > 0) {
            const calendarIds = data.myCalendars.map((cal: any) => cal.id).join(',');
            navigate(`/calendars/view?calendars=${calendarIds}`, { replace: true });
        }
    }, [data, navigate]);

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <VStack spacing={4}>
                            <Spinner size="xl" color={primaryColor} />
                            <Text color={textSecondary}>Loading all calendars...</Text>
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
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (!data?.myCalendars || data.myCalendars.length === 0) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(20px)"
                        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                        border="1px solid"
                        borderColor={cardBorder}
                        borderRadius="xl"
                    >
                        <CardBody p={8}>
                            <Center>
                                <VStack spacing={3}>
                                    <Heading
                                        size="xl"
                                        color={textPrimary}
                                        fontFamily={brandConfig.fonts.heading}
                                        fontWeight="bold"
                                    >
                                        No Calendars Available
                                    </Heading>
                                    <Text
                                        color={textSecondary}
                                        fontSize="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        You don't have any calendars to display yet.
                                    </Text>
                                </VStack>
                            </Center>
                        </CardBody>
                    </Card>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    // If we have calendars, the useEffect will redirect
    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <Center py={20}>
                    <VStack spacing={4}>
                        <Spinner size="xl" color={primaryColor} />
                        <Text color={textSecondary}>Redirecting to calendar view...</Text>
                    </VStack>
                </Center>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default BirdsEyeView;