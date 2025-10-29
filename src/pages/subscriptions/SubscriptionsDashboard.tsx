import React from "react";
import {
    Box,
    Container,
    Heading,
    Grid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Button,
    HStack,
    useColorModeValue
} from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { GET_SUBSCRIPTIONS, GET_INVOICES } from "./utils/subscriptionQueries";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Type definitions
interface Subscription {
    id: string;
    status: string;
    plan: {
        amount: number;
        interval: string;
    };
}

interface Invoice {
    id: string;
    status: string;
    amount: number;
}

const SubscriptionsDashboard = () => {
    usePageTitle("Subscriptions Dashboard");
    const navigate = useNavigate();
    const { data: subscriptionsData, loading: subscriptionsLoading } = useQuery(GET_SUBSCRIPTIONS);
    const { data: invoicesData, loading: invoicesLoading } = useQuery(GET_INVOICES);

    const bg = getColor("background.surface");

    // Calculate stats
    const activeSubscriptions = subscriptionsData?.subscriptions?.filter((s: Subscription) => s.status === "ACTIVE").length || 0;
    const monthlyRevenue = subscriptionsData?.subscriptions?.reduce((sum: number, s: Subscription) => {
        if (s.status === "ACTIVE" && s.plan.interval === "MONTHLY") {
            return sum + s.plan.amount;
        }
        return sum;
    }, 0) || 0;

    const unpaidInvoices = invoicesData?.invoices?.filter((i: Invoice) => i.status === "OPEN").length || 0;
    const totalUnpaidAmount = invoicesData?.invoices?.reduce((sum: number, i: Invoice) => {
        if (i.status === "OPEN") {
            return sum + i.amount;
        }
        return sum;
    }, 0) || 0;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={12} flex="1">
                <HStack justify="space-between" mb={8}>
                    <Heading size="lg" color={getColor("text.primary")}>Billing Analytics</Heading>
                    <Button
                        bg={getComponent("button", "primaryBg")}
                        color={getColor("text.inverse")}
                        _hover={{ bg: getComponent("button", "primaryHover") }}
                        onClick={() => navigate("/subscriptions/manage")}
                    >
                        Manage Subscriptions
                    </Button>
                </HStack>

                {/* Stats Grid */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardBody>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>Active Subscriptions</StatLabel>
                                <StatNumber color={getColor("text.primary")}>{activeSubscriptions}</StatNumber>
                                <StatHelpText color={getColor("text.muted")}>Currently billing</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardBody>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>Monthly Revenue</StatLabel>
                                <StatNumber color={getColor("text.primary")}>${monthlyRevenue.toFixed(2)}</StatNumber>
                                <StatHelpText color={getColor("text.muted")}>Recurring monthly</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardBody>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>Unpaid Invoices</StatLabel>
                                <StatNumber color={getColor("text.primary")}>{unpaidInvoices}</StatNumber>
                                <StatHelpText color={getColor("text.muted")}>Requires attention</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardBody>
                            <Stat>
                                <StatLabel color={getColor("text.secondary")}>Outstanding Balance</StatLabel>
                                <StatNumber color={getColor("text.primary")}>${totalUnpaidAmount.toFixed(2)}</StatNumber>
                                <StatHelpText color={getColor("text.muted")}>Total unpaid amount</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default SubscriptionsDashboard;