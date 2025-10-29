import React, { useMemo, useState } from "react";
import {
    Box,
    Container,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Heading,
    Card,
    CardHeader,
    CardBody,
    Button,
    Skeleton,
    useToast,
    Badge,
    HStack,
    IconButton,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Tooltip,
    VStack,
    Progress,
    Divider,
    useColorMode,
    Select,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ViewIcon, DeleteIcon, AddIcon, ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { FiDollarSign, FiCheckCircle, FiClock, FiCalendar, FiSend, FiFileText, FiTrendingUp, FiTarget } from "react-icons/fi";
import { getColor } from "../../brandConfig";
import { Bill, BillStatus, BillCurrency } from "../../generated/graphql";

const GET_ALL_BILLS = gql`
  query GetAllBills {
    bills {
      id
      status
      isPaid
      issuedBy
      currency
      lineItems {
        id
        description
        amount
        createdAt
        updatedAt
      }
      subtotal
      taxPercentage
      taxAmount
      totalAmount
      createdAt
      updatedAt
      tenantId
    }
  }
`;

const GET_CLIENT_BY_BILL = gql`
  query GetClientDetailsByBillId($billId: ID!) {
    getClientDetailsByBillId(billId: $billId) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const DELETE_BILL = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id)
  }
`;

interface LineItem {
    description: string;
    amount: number;
}


interface GetBillsResponse {
    bills: Bill[];
}

interface ClientInfo {
    id: string;
    fName: string;
    lName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
}

const StatCard = ({
    title,
    stat,
    icon,
    color,
    helpText,
    trend,
    progress,
    goal
}: {
    title: string;
    stat: number | string;
    icon: React.ReactNode;
    color: string;
    helpText?: string;
    trend?: { value: number; isPositive: boolean };
    progress?: number;
    goal?: string;
}) => {
    const { colorMode } = useColorMode();
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    
    return (
        <Box
            p={6}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            position="relative"
        >
            <VStack align="stretch" spacing={3}>
                <HStack spacing={4}>
                    <Box color={color}>
                        {icon}
                    </Box>
                    <Stat flex={1}>
                        <StatLabel color={textMuted} fontSize="md" fontWeight="medium">{title}</StatLabel>
                        <HStack align="baseline" spacing={2}>
                            <StatNumber fontSize="4xl" fontWeight="bold" color={textPrimary}>
                                {stat}
                            </StatNumber>
                            {trend && (
                                <HStack spacing={1} color={trend.isPositive ? "green.400" : "red.400"}>
                                    {trend.isPositive ? <ArrowUpIcon boxSize={3} /> : <ArrowDownIcon boxSize={3} />}
                                    <Text fontSize="sm" fontWeight="medium">
                                        {Math.abs(trend.value)}%
                                    </Text>
                                </HStack>
                            )}
                        </HStack>
                        {helpText && (
                            <StatHelpText color={textMuted} fontSize="sm" fontWeight="medium">
                                {helpText}
                            </StatHelpText>
                        )}
                    </Stat>
                </HStack>
                {progress !== undefined && (
                    <Box>
                        <Progress 
                            value={progress} 
                            size="sm" 
                            colorScheme={progress >= 100 ? "green" : progress >= 50 ? "yellow" : "red"}
                            borderRadius="full"
                        />
                        {goal && (
                            <Text fontSize="xs" color={textMuted} mt={1}>
                                Goal: {goal}
                            </Text>
                        )}
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

// Component to fetch and display client info for each bill
const ClientCell = ({ billId }: { billId: string }) => {
    const { colorMode } = useColorMode();
    const { loading, error, data } = useQuery(GET_CLIENT_BY_BILL, {
        variables: { billId },
        skip: !billId,
    });

    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    
    if (loading) return <Skeleton height="20px" width="120px" />;
    if (error || !data?.getClientDetailsByBillId) return <Text color={textMuted}>-</Text>;

    const client = data.getClientDetailsByBillId;
    return <Text color={textPrimary}>{client.fName} {client.lName}</Text>;
};

const Bills = () => {
    usePageTitle("Bills");
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const { loading, error, data, refetch } = useQuery<GetBillsResponse>(GET_ALL_BILLS);
    const [deleteBill] = useMutation(DELETE_BILL);
    const toast = useToast();

    // Consistent styling from brandConfig with theme support
    const bg = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    React.useEffect(() => {
        if (data) {
            console.log("GET_ALL_BILLS response:", data);
        }
    }, [data]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const formatMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    const getWeekNumber = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    const currentWeekNumber = getWeekNumber(new Date());

    // Filter state - default to showing ALL bills
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL");

    // Month view state - null means show current live metrics
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    // Calculate metrics with time-based filtering
    const billMetrics = useMemo(() => {
        if (!data?.bills) return {
            last7Days: { proposal: 0, draft: 0, sent: 0, paid: 0, proposalValue: 0, draftValue: 0, sentValue: 0, paidValue: 0, paidProposals: 0, paidProposalValue: 0 },
            last30Days: { proposal: 0, draft: 0, sent: 0, paid: 0, proposalValue: 0, draftValue: 0, sentValue: 0, paidValue: 0, paidProposals: 0, paidProposalValue: 0 },
            allTime: { proposal: 0, draft: 0, sent: 0, paid: 0, proposalValue: 0, draftValue: 0, sentValue: 0, paidValue: 0, unpaidValue: 0, paidProposals: 0, paidProposalValue: 0 },
            trends: { proposal: 0, draft: 0, sent: 0, paid: 0, revenue: 0 },
            selectedMonthMetrics: null
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const calculateMetrics = (bills: Bill[]) => {
            return bills.reduce((acc, bill) => {
                // Use totalAmount if available, otherwise fallback to calculating from lineItems
                const total = bill.totalAmount ?? bill.lineItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

                if (bill.status === "PROPOSAL") {
                    acc.proposal++;
                    acc.proposalValue += total || 0;
                    if (bill.isPaid) {
                        // Track paid proposals separately
                        acc.paidProposals = (acc.paidProposals || 0) + 1;
                        acc.paidProposalValue = (acc.paidProposalValue || 0) + (total || 0);
                    }
                } else if (bill.status === "DRAFT") {
                    acc.draft++;
                    acc.draftValue += total || 0;
                } else if (bill.status === "SENT") {
                    acc.sent++;
                    acc.sentValue += total || 0;
                    if (bill.isPaid) {
                        acc.paid++;
                        acc.paidValue += total || 0;
                    } else {
                        acc.unpaidValue = (acc.unpaidValue || 0) + (total || 0);
                    }
                }

                return acc;
            }, { proposal: 0, draft: 0, sent: 0, paid: 0, proposalValue: 0, draftValue: 0, sentValue: 0, paidValue: 0, unpaidValue: 0, paidProposals: 0, paidProposalValue: 0 });
        };

        // Last 7 days - use updatedAt for SENT bills (when they were actually sent)
        const last7DaysBills = data.bills.filter(bill => {
            const dateToCheck = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);
            return dateToCheck >= sevenDaysAgo;
        });
        const last7Days = calculateMetrics(last7DaysBills);

        // Previous 7 days (for trend calculation)
        const prev7DaysBills = data.bills.filter(bill => {
            const dateToCheck = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);
            return dateToCheck >= fourteenDaysAgo && dateToCheck < sevenDaysAgo;
        });
        const prev7Days = calculateMetrics(prev7DaysBills);

        // Last 30 days - use updatedAt for SENT bills
        const last30DaysBills = data.bills.filter(bill => {
            const dateToCheck = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);
            return dateToCheck >= thirtyDaysAgo;
        });
        const last30Days = calculateMetrics(last30DaysBills);

        // All time
        const allTime = calculateMetrics(data.bills);

        // Calculate trends (% change from previous period)
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const trends = {
            proposal: calculateTrend(last7Days.proposal, prev7Days.proposal),
            draft: calculateTrend(last7Days.draft, prev7Days.draft),
            sent: calculateTrend(last7Days.sent, prev7Days.sent),
            paid: calculateTrend(last7Days.paid, prev7Days.paid),
            revenue: calculateTrend(last7Days.paidValue, prev7Days.paidValue)
        };

        // Calculate metrics for selected month if one is chosen
        let selectedMonthMetrics = null;
        if (selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);
            const monthStart = new Date(year, month - 1, 1); // month is 0-indexed
            const monthEnd = new Date(year, month, 0, 23, 59, 59); // last day of month

            const monthBills = data.bills.filter(bill => {
                const billDate = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);
                return billDate >= monthStart && billDate <= monthEnd;
            });

            selectedMonthMetrics = calculateMetrics(monthBills);
        }

        return { last7Days, last30Days, allTime, trends, selectedMonthMetrics };
    }, [data, selectedMonth]);

    // Weekly goal tracking
    const weeklyGoals = {
        proposals: 3, // At least 3 proposals per week
        drafts: 2,    // At least 2 drafts per week
        sent: 2,      // At least 2 bills sent per week
        revenue: 5000 // Target revenue
    };

    const goalProgress = {
        proposals: Math.min(100, (billMetrics.last7Days.proposal / weeklyGoals.proposals) * 100),
        drafts: Math.min(100, (billMetrics.last7Days.draft / weeklyGoals.drafts) * 100),
        sent: Math.min(100, (billMetrics.last7Days.sent / weeklyGoals.sent) * 100),
        revenue: Math.min(100, (billMetrics.last7Days.paidValue / weeklyGoals.revenue) * 100)
    };

    // Generate list of available months from bills data
    const availableMonths = useMemo(() => {
        if (!data?.bills) return [];

        const monthsSet = new Set<string>();
        data.bills.forEach(bill => {
            const billDate = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);
            const monthKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
            monthsSet.add(monthKey);
        });

        // Convert to array and sort descending (newest first)
        return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    }, [data?.bills]);

    // Filter bills based on selected filters
    const filteredBills = useMemo(() => {
        if (!data?.bills) return [];

        const now = new Date();

        // If a specific month is selected, use that for date filtering
        let dateStart: Date | null = null;
        let dateEnd: Date | null = null;

        if (selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);
            dateStart = new Date(year, month - 1, 1); // Start of month
            dateEnd = new Date(year, month, 0, 23, 59, 59); // End of month
        } else {
            // Otherwise use the regular date filter
            switch (dateFilter) {
                case "THIS_WEEK":
                    dateStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "THIS_MONTH":
                    dateStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case "LAST_6_MONTHS":
                    dateStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                    break;
                case "THIS_YEAR":
                    dateStart = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
                    break;
                case "ALL":
                default:
                    break;
            }
        }

        return data.bills.filter(bill => {
            const statusMatch = statusFilter === "ALL" || bill.status === statusFilter;
            const paymentMatch = paymentFilter === "ALL" ||
                (paymentFilter === "PAID" && bill.isPaid) ||
                (paymentFilter === "PENDING" && !bill.isPaid);

            // For date filtering, use updatedAt for SENT bills, createdAt for others
            const billDate = bill.status === "SENT" ? new Date(bill.updatedAt) : new Date(bill.createdAt);

            let dateMatch = true;
            if (dateStart && dateEnd) {
                // Specific month range
                dateMatch = billDate >= dateStart && billDate <= dateEnd;
            } else if (dateStart) {
                // From dateStart onwards
                dateMatch = billDate >= dateStart;
            }

            return statusMatch && paymentMatch && dateMatch;
        });
    }, [data?.bills, statusFilter, paymentFilter, dateFilter, selectedMonth]);

    const handleViewBill = (bill: Bill) => {
        window.open(`/bill/${bill.id}`, '_blank');
    };

    const handleDeleteBill = async (billId: string) => {
        if (window.confirm("Are you sure you want to delete this bill?")) {
            try {
                await deleteBill({
                    variables: { id: billId }
                });
                toast({
                    title: "Bill deleted",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                refetch(); // Refresh the bills list
            } catch (error) {
                toast({
                    title: "Error deleting bill",
                    description: error instanceof Error ? error.message : "Unknown error occurred",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    if (error) {
        toast({
            title: "Error loading bills",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    borderWidth="1px"
                    borderColor={cardBorder}
                    overflow="hidden"
                >
                    <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                        <HStack justify="space-between">
                            <Heading size="lg" color={textPrimary}>💰 Bills</Heading>
                            <Button
                                bg="white"
                                color="black"
                                onClick={() => navigate("/bills/new")}
                                leftIcon={<AddIcon />}
                                _hover={{
                                    bg: "gray.100",
                                    transform: "translateY(-2px)"
                                }}
                            >
                                New Bill
                            </Button>
                        </HStack>
                    </CardHeader>

                    <Box px={6} pb={6}>
                        {/* Month Selector */}
                        <Box mb={6}>
                            <HStack spacing={4} align="center">
                                <Text fontSize="md" fontWeight="medium" color={textMuted}>
                                    View by Month:
                                </Text>
                                <Select
                                    value={selectedMonth || ""}
                                    onChange={(e) => setSelectedMonth(e.target.value || null)}
                                    bg={cardGradientBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    maxW="300px"
                                >
                                    <option value="">Current (Live Metrics)</option>
                                    {availableMonths.map(month => (
                                        <option key={month} value={month}>
                                            {formatMonthName(month)}
                                        </option>
                                    ))}
                                </Select>
                                {selectedMonth && (
                                    <Button
                                        size="sm"
                                        onClick={() => setSelectedMonth(null)}
                                        colorScheme="blue"
                                        variant="outline"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </HStack>
                        </Box>

                        {/* Show either selected month metrics OR current metrics */}
                        {selectedMonth && billMetrics.selectedMonthMetrics ? (
                            <>
                                {/* Selected Month Metrics */}
                                <Text fontSize="xl" fontWeight="bold" color={textPrimary} mb={4}>
                                    📊 {formatMonthName(selectedMonth)}
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                                    <StatCard
                                        title="Bills Sent"
                                        stat={`$${formatCurrency(billMetrics.selectedMonthMetrics.sentValue)}`}
                                        icon={<FiSend size="3em" />}
                                        color="blue.500"
                                        helpText={`${billMetrics.selectedMonthMetrics.sent} bills sent`}
                                    />
                                    <StatCard
                                        title="Paid"
                                        stat={`$${formatCurrency(billMetrics.selectedMonthMetrics.paidValue)}`}
                                        icon={<FiCheckCircle size="3em" />}
                                        color="green.500"
                                        helpText={`${billMetrics.selectedMonthMetrics.paid} bills paid`}
                                    />
                                    <StatCard
                                        title="Outstanding"
                                        stat={`$${formatCurrency(billMetrics.selectedMonthMetrics.sentValue - billMetrics.selectedMonthMetrics.paidValue)}`}
                                        icon={<FiClock size="3em" />}
                                        color="red.500"
                                        helpText={`${billMetrics.selectedMonthMetrics.sent - billMetrics.selectedMonthMetrics.paid} unpaid bills`}
                                    />
                                </SimpleGrid>
                            </>
                        ) : (
                            <>
                        {/* Primary KPIs - Last 7 Days */}
                        <Text fontSize="xl" fontWeight="bold" color={textPrimary} mb={4}>
                            📊 Last 7 Days <Text as="span" fontSize="md" color={textMuted} fontWeight="normal">(Week {currentWeekNumber} of {new Date().getFullYear()})</Text>
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                            <StatCard
                                title="Bills Sent"
                                stat={`$${formatCurrency(billMetrics.last7Days.sentValue)}`}
                                icon={<FiSend size="3em" />}
                                color="blue.500"
                                helpText={`${billMetrics.last7Days.sent} bills sent`}
                            />
                            <StatCard
                                title="Paid"
                                stat={`$${formatCurrency(billMetrics.last7Days.paidValue)}`}
                                icon={<FiCheckCircle size="3em" />}
                                color="green.500"
                                helpText={`${billMetrics.last7Days.paid} bills paid`}
                            />
                            <StatCard
                                title="Outstanding"
                                stat={`$${formatCurrency(billMetrics.last7Days.sentValue - billMetrics.last7Days.paidValue)}`}
                                icon={<FiClock size="3em" />}
                                color="red.500"
                                helpText={`${billMetrics.last7Days.sent - billMetrics.last7Days.paid} unpaid bills`}
                            />
                        </SimpleGrid>

                        <Divider my={4} borderColor={cardBorder} />

                        {/* 30-Day Metrics */}
                        <Text fontSize="xl" fontWeight="bold" color={textPrimary} mb={4}>
                            📈 Last 30 Days
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                            <StatCard
                                title="Bills Sent"
                                stat={`$${formatCurrency(billMetrics.last30Days.sentValue)}`}
                                icon={<FiSend size="3em" />}
                                color="blue.500"
                                helpText={`${billMetrics.last30Days.sent} bills sent`}
                            />
                            <StatCard
                                title="Paid"
                                stat={`$${formatCurrency(billMetrics.last30Days.paidValue)}`}
                                icon={<FiCheckCircle size="3em" />}
                                color="green.500"
                                helpText={`${billMetrics.last30Days.paid} bills paid`}
                            />
                            <StatCard
                                title="Outstanding"
                                stat={`$${formatCurrency(billMetrics.last30Days.sentValue - billMetrics.last30Days.paidValue)}`}
                                icon={<FiClock size="3em" />}
                                color="red.500"
                                helpText={`${billMetrics.last30Days.sent - billMetrics.last30Days.paid} unpaid bills`}
                            />
                        </SimpleGrid>

                        <Divider my={4} borderColor={cardBorder} />

                        {/* All-Time Summary */}
                        <Text fontSize="xl" fontWeight="bold" color={textPrimary} mb={4}>
                            💼 All-Time Summary
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            <StatCard
                                title="Total Revenue"
                                stat={`$${formatCurrency(billMetrics.allTime.paidValue)}`}
                                icon={<FiDollarSign size="3em" />}
                                color="green.500"
                                helpText={`${billMetrics.allTime.paid} bills paid`}
                            />
                            <StatCard
                                title="Outstanding"
                                stat={`$${formatCurrency(billMetrics.allTime.unpaidValue)}`}
                                icon={<FiClock size="3em" />}
                                color="red.500"
                                helpText={`${billMetrics.allTime.sent - billMetrics.allTime.paid} unpaid bills`}
                            />
                            <StatCard
                                title="Total Sent"
                                stat={`$${formatCurrency(billMetrics.allTime.sentValue)}`}
                                icon={<FiSend size="3em" />}
                                color="blue.500"
                                helpText={`${billMetrics.allTime.sent} bills sent`}
                            />
                        </SimpleGrid>
                        </>
                        )}
                    </Box>

                    <CardBody>
                        {/* Filter Controls */}
                        <HStack spacing={4} mb={6} px={6} wrap="wrap">
                            <Box flex={1} minW="200px">
                                <Text fontSize="sm" fontWeight="medium" color={textMuted} mb={2}>
                                    Filter by Status
                                </Text>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    bg={cardGradientBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="DRAFT">Drafts Only</option>
                                    <option value="PROPOSAL">Proposals Only</option>
                                    <option value="SENT">Sent Bills Only</option>
                                </Select>
                            </Box>
                            <Box flex={1} minW="200px">
                                <Text fontSize="sm" fontWeight="medium" color={textMuted} mb={2}>
                                    Filter by Payment
                                </Text>
                                <Select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    bg={cardGradientBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                >
                                    <option value="ALL">All Payments</option>
                                    <option value="PAID">Paid Only</option>
                                    <option value="PENDING">Pending Only</option>
                                </Select>
                            </Box>
                            <Box flex={1} minW="200px">
                                <Text fontSize="sm" fontWeight="medium" color={textMuted} mb={2}>
                                    Filter by Time Period
                                </Text>
                                <Select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    bg={cardGradientBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="THIS_WEEK">This Week (Last 7 Days)</option>
                                    <option value="THIS_MONTH">This Month (Last 30 Days)</option>
                                    <option value="LAST_6_MONTHS">Last 6 Months</option>
                                    <option value="THIS_YEAR">This Year</option>
                                </Select>
                            </Box>
                            <Box flex={1} minW="150px">
                                <Text fontSize="sm" fontWeight="medium" color={textMuted} mb={2}>
                                    Showing Results
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                                    {filteredBills.length} bills
                                </Text>
                            </Box>
                        </HStack>

                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th color={textSecondary}>Bill ID</Th>
                                        <Th color={textSecondary}>Client Name</Th>
                                        <Th color={textSecondary}>Status</Th>
                                        <Th color={textSecondary}>Total Amount</Th>
                                        <Th color={textSecondary}>Items</Th>
                                        <Th color={textSecondary}>Payment Status</Th>
                                        <Th color={textSecondary}>Date</Th>
                                        <Th color={textSecondary}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {loading ? (
                                        [...Array(3)].map((_, index) => (
                                            <Tr key={`skeleton-${index}`}>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                                <Td><Skeleton height="20px" /></Td>
                                            </Tr>
                                        ))
                                    ) : filteredBills.length ? (
                                        filteredBills.map((bill: Bill) => (
                                            <Tr key={bill.id}>
                                                <Td>
                                                    <Text color={textPrimary}>{bill.id}</Text>
                                                </Td>
                                                <Td color={textPrimary}>
                                                    <ClientCell billId={bill.id} />
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        bg={
                                                            bill.status === "SENT" ? "rgba(59, 130, 246, 0.2)" :
                                                            bill.status === "PROPOSAL" ? "rgba(147, 51, 234, 0.2)" :
                                                            "rgba(251, 146, 60, 0.2)"
                                                        }
                                                        color={
                                                            bill.status === "SENT" ? "#3B82F6" :
                                                            bill.status === "PROPOSAL" ? "#9333EA" :
                                                            "#FB923C"
                                                        }
                                                        border="1px solid"
                                                        borderColor={
                                                            bill.status === "SENT" ? "rgba(59, 130, 246, 0.3)" :
                                                            bill.status === "PROPOSAL" ? "rgba(147, 51, 234, 0.3)" :
                                                            "rgba(251, 146, 60, 0.3)"
                                                        }
                                                    >
                                                        {bill.status}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Text color={textPrimary}>
                                                        ${(bill.totalAmount ?? bill.lineItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0).toFixed(2)} {bill.currency || "AUD"}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Text color={textSecondary}>{bill.lineItems?.length || 0} items</Text>
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        bg={bill.isPaid ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 191, 36, 0.2)"}
                                                        color={bill.isPaid ? "#22C55E" : "#FBBF24"}
                                                        border="1px solid"
                                                        borderColor={bill.isPaid ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 191, 36, 0.3)"}
                                                    >
                                                        {bill.isPaid ? "Paid" : "Pending"}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Text color={textSecondary}>{formatDate(bill.createdAt)}</Text>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2}>
                                                        <Tooltip label="View bill details" hasArrow>
                                                            <IconButton
                                                                aria-label="View bill details"
                                                                icon={<ViewIcon />}
                                                                size="sm"
                                                                colorScheme="teal"
                                                                onClick={() => handleViewBill(bill)}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip label="Delete bill" hasArrow>
                                                            <IconButton
                                                                aria-label="Delete bill"
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                onClick={() => handleDeleteBill(bill.id)}
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan={8} textAlign="center" py={8}>
                                                <Text color={textMuted}>No bills found</Text>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default Bills;