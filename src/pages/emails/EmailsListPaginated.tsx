import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Button,
    Badge,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    VStack,
    Text,
    Spinner,
    Card,
    CardBody,
    Icon,
    Center,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Collapse,
    useDisclosure,
    Flex,
    IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { 
    FiMail, FiInbox, FiSend, FiEdit, FiSearch, FiFilter, 
    FiCalendar, FiChevronDown, FiRefreshCw 
} from 'react-icons/fi';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { UnifiedEmailCard } from './components/UnifiedEmailCard';

// GraphQL Queries
const HAS_ASSIGNED_EMAIL_QUERY = gql`
    query HasAssignedEmailAddress {
        hasAssignedEmailAddress
    }
`;

const MY_EMAIL_ADDRESSES_QUERY = gql`
    query MyEmailAddresses {
        myEmailAddresses {
            id
            email
            name
            type
            isVerified
        }
    }
`;

// GraphQL Queries with Pagination
const PAGINATED_INBOUND_EMAILS_QUERY = gql`
    query GetPaginatedInboundEmails($page: Int!, $limit: Int!, $filters: EmailFilterInput) {
        paginatedInboundEmails(page: $page, limit: $limit, filters: $filters) {
            emails {
                id
                subject
                from
                fromFull
                to
                date
                textBody
                htmlBody
                isRead
                isStarred
                folder
                attachments {
                    name
                }
            }
            totalCount
            hasMore
            currentPage
            totalPages
        }
    }
`;

const PAGINATED_OUTBOUND_EMAILS_QUERY = gql`
    query GetPaginatedOutboundEmails($page: Int!, $limit: Int!, $filters: OutboundEmailFilterInput) {
        paginatedEmails(page: $page, limit: $limit, filters: $filters) {
            emails {
                id
                subject
                to
                from
                status
                createdAt
                sentAt
                opens
                clicks
                attachments {
                    name
                }
            }
            totalCount
            hasMore
            currentPage
            totalPages
        }
    }
`;

const UNREAD_COUNT_QUERY = gql`
    query GetUnreadCount {
        unreadInboundEmailCount
    }
`;

interface EmailFilters {
    searchTerm?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    status?: string;
    folder?: string;
    isRead?: boolean;
    isStarred?: boolean;
}

const EmailsListPaginated: React.FC = () => {
    usePageTitle("Emails List");
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
    
    // Pagination states
    const [inboxPage, setInboxPage] = useState(1);
    const [sentPage, setSentPage] = useState(1);
    const [draftsPage, setDraftsPage] = useState(1);
    const [allEmailsPage, setAllEmailsPage] = useState(1);
    
    // Email data states
    const [inboxEmails, setInboxEmails] = useState<any[]>([]);
    const [sentEmails, setSentEmails] = useState<any[]>([]);
    const [draftEmails, setDraftEmails] = useState<any[]>([]);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    
    const ITEMS_PER_PAGE = 20; // Reduced from 50 to better debug pagination

    // Check if user has any assigned email addresses
    const { data: hasEmailData, loading: checkingEmail } = useQuery(HAS_ASSIGNED_EMAIL_QUERY);
    const { data: myEmailsData } = useQuery(MY_EMAIL_ADDRESSES_QUERY);

    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");
    
    // Build filters object
    const buildFilters = (): EmailFilters => {
        const filters: EmailFilters = {};

        if (searchTerm) {
            filters.searchTerm = searchTerm;
        }

        // Handle date filters
        if (dateFilter !== 'all') {
            const now = new Date();

            switch (dateFilter) {
                case 'today':
                    filters.dateFrom = new Date(now.setHours(0, 0, 0, 0));
                    filters.dateTo = new Date();
                    break;
                case 'last7Days':
                    filters.dateFrom = subDays(now, 7);
                    filters.dateTo = new Date();
                    break;
                case 'last30Days':
                    filters.dateFrom = subDays(now, 30);
                    filters.dateTo = new Date();
                    break;
                case 'custom':
                    if (customStartDate && customEndDate) {
                        filters.dateFrom = new Date(customStartDate);
                        filters.dateTo = new Date(customEndDate);
                    }
                    break;
            }
        }

        console.log('[EMAIL DEBUG] Building filters:', {
            searchTerm,
            dateFilter,
            filters
        });

        return filters;
    };
    
    // Query hooks with pagination
    const {
        data: inboxData,
        loading: loadingInbox,
        fetchMore: fetchMoreInbox,
        refetch: refetchInbox,
        error: inboxError
    } = useQuery(PAGINATED_INBOUND_EMAILS_QUERY, {
        variables: {
            page: inboxPage,
            limit: ITEMS_PER_PAGE,
            filters: buildFilters()
        },
        notifyOnNetworkStatusChange: true,
        onCompleted: (data) => {
            console.log('[EMAIL DEBUG] Query completed:', {
                emailCount: data?.paginatedInboundEmails?.emails?.length || 0,
                totalCount: data?.paginatedInboundEmails?.totalCount || 0,
                hasMore: data?.paginatedInboundEmails?.hasMore
            });
        },
        onError: (error) => {
            console.error('[EMAIL DEBUG] Query error:', error);
        }
    });
    
    const { 
        data: sentData, 
        loading: loadingSent,
        fetchMore: fetchMoreSent,
        refetch: refetchSent
    } = useQuery(PAGINATED_OUTBOUND_EMAILS_QUERY, {
        variables: {
            page: sentPage,
            limit: ITEMS_PER_PAGE,
            filters: { ...buildFilters(), status: 'SENT' }
        },
        skip: true, // Only load when tab is selected
    });
    
    const { 
        data: draftsData,
        loading: loadingDrafts,
        fetchMore: fetchMoreDrafts,
        refetch: refetchDrafts
    } = useQuery(PAGINATED_OUTBOUND_EMAILS_QUERY, {
        variables: {
            page: draftsPage,
            limit: ITEMS_PER_PAGE,
            filters: { ...buildFilters(), status: 'DRAFT' }
        },
        skip: true, // Only load when tab is selected
    });
    
    const { data: unreadCount } = useQuery(UNREAD_COUNT_QUERY);
    
    // Update email lists when data changes
    useEffect(() => {
        console.log('[EMAIL DEBUG] Inbox data changed:', {
            hasData: !!inboxData?.paginatedInboundEmails,
            emailCount: inboxData?.paginatedInboundEmails?.emails?.length || 0,
            totalCount: inboxData?.paginatedInboundEmails?.totalCount || 0,
            currentPage: inboxPage,
            hasMore: inboxData?.paginatedInboundEmails?.hasMore,
            emails: inboxData?.paginatedInboundEmails?.emails
        });

        if (inboxData?.paginatedInboundEmails) {
            const emails = inboxData.paginatedInboundEmails.emails;
            console.log('[EMAIL DEBUG] Processing emails:', emails.map((e: any) => ({
                id: e.id,
                subject: e.subject,
                from: e.from,
                isRead: e.isRead,
                date: e.date
            })));

            if (inboxPage === 1) {
                console.log('[EMAIL DEBUG] Setting inbox emails (page 1):', emails.length);
                setInboxEmails(emails);
            } else {
                console.log('[EMAIL DEBUG] Appending emails to inbox:', emails.length);
                setInboxEmails(prev => [...prev, ...emails]);
            }
        }
    }, [inboxData, inboxPage]);
    
    useEffect(() => {
        if (sentData?.paginatedEmails) {
            if (sentPage === 1) {
                setSentEmails(sentData.paginatedEmails.emails);
            } else {
                setSentEmails(prev => [...prev, ...sentData.paginatedEmails.emails]);
            }
        }
    }, [sentData, sentPage]);
    
    useEffect(() => {
        if (draftsData?.paginatedEmails) {
            if (draftsPage === 1) {
                setDraftEmails(draftsData.paginatedEmails.emails);
            } else {
                setDraftEmails(prev => [...prev, ...draftsData.paginatedEmails.emails]);
            }
        }
    }, [draftsData, draftsPage]);
    
    // Load more functions
    const loadMoreInbox = () => {
        if (inboxData?.paginatedInboundEmails?.hasMore) {
            setInboxPage(prev => prev + 1);
        }
    };
    
    const loadMoreSent = () => {
        if (sentData?.paginatedEmails?.hasMore) {
            setSentPage(prev => prev + 1);
        }
    };
    
    const loadMoreDrafts = () => {
        if (draftsData?.paginatedEmails?.hasMore) {
            setDraftsPage(prev => prev + 1);
        }
    };
    
    // Reset and refetch when filters change
    const handleFilterChange = () => {
        setInboxPage(1);
        setSentPage(1);
        setDraftsPage(1);
        setAllEmailsPage(1);
        
        setInboxEmails([]);
        setSentEmails([]);
        setDraftEmails([]);
        
        refetchInbox();
        refetchSent();
        refetchDrafts();
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange();
        }, 500); // Debounce search
        
        return () => clearTimeout(timer);
    }, [searchTerm, dateFilter, customStartDate, customEndDate]);
    
    // Infinite scroll handler
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>, loadMore: () => void) => {
        const element = e.currentTarget;
        const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
        
        if (scrolledToBottom) {
            loadMore();
        }
    }, []);
    
    return (
        <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={8} align="stretch">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="2xl" color={textPrimary}>
                                Email Marketing
                            </Heading>
                            <Text color={textMuted}>
                                {hasEmailData?.hasAssignedEmailAddress === false
                                    ? "Email access not configured - Please contact your administrator"
                                    : "Compose and send branded emails to your clients"}
                            </Text>
                            {myEmailsData?.myEmailAddresses && myEmailsData.myEmailAddresses.length > 0 && (
                                <HStack spacing={2} flexWrap="wrap">
                                    <Text color={textMuted} fontSize="sm">Your email:</Text>
                                    {myEmailsData.myEmailAddresses.map((email: any) => (
                                        <Badge key={email.id} colorScheme="blue" variant="subtle">
                                            {email.email}
                                        </Badge>
                                    ))}
                                </HStack>
                            )}
                        </VStack>
                        <Button
                            colorScheme="blue"
                            onClick={() => navigate('/emails/new')}
                            size="lg"
                            bg={getColor('primaryBlue')}
                            _hover={{ bg: getColor('primaryBlueHover') }}
                            isDisabled={hasEmailData?.hasAssignedEmailAddress === false}
                        >
                            Compose Email
                        </Button>
                    </HStack>

                    {/* Search and Filter Bar */}
                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody>
                            <VStack spacing={4}>
                                <HStack width="100%" spacing={4}>
                                    <InputGroup flex={1}>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiSearch} color={textMuted} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search emails by subject, sender, recipient, or content..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            bg={bg}
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _hover={{ borderColor: getColor('primaryBlue') }}
                                            _focus={{ borderColor: getColor('primaryBlue'), boxShadow: `0 0 0 1px ${getColor('primaryBlue')}` }}
                                        />
                                    </InputGroup>
                                    
                                    <Select
                                        width="200px"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        bg={bg}
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ borderColor: getColor('primaryBlue') }}
                                        _focus={{ borderColor: getColor('primaryBlue'), boxShadow: `0 0 0 1px ${getColor('primaryBlue')}` }}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="last7Days">Last 7 Days</option>
                                        <option value="last30Days">Last 30 Days</option>
                                        <option value="custom">Custom Range</option>
                                    </Select>
                                    
                                    <IconButton
                                        aria-label="Refresh"
                                        icon={<FiRefreshCw />}
                                        variant="outline"
                                        onClick={handleFilterChange}
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ bg: cardGradientBg }}
                                    />
                                </HStack>
                                
                                <Collapse in={dateFilter === 'custom'} animateOpacity>
                                    <HStack spacing={4} width="100%">
                                        <InputGroup size="md">
                                            <InputLeftElement pointerEvents="none">
                                                <Icon as={FiCalendar} color={textMuted} />
                                            </InputLeftElement>
                                            <Input
                                                type="date"
                                                placeholder="Start Date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                bg={bg}
                                                border="1px solid"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                            />
                                        </InputGroup>
                                        
                                        <Text color={textMuted}>to</Text>
                                        
                                        <InputGroup size="md">
                                            <InputLeftElement pointerEvents="none">
                                                <Icon as={FiCalendar} color={textMuted} />
                                            </InputLeftElement>
                                            <Input
                                                type="date"
                                                placeholder="End Date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                bg={bg}
                                                border="1px solid"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                            />
                                        </InputGroup>
                                    </HStack>
                                </Collapse>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Tabs variant="soft-rounded" colorScheme="blue" defaultIndex={0}>
                        <TabList bg={cardGradientBg} p={2} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }}>
                                Inbox
                                {unreadCount?.unreadInboundEmailCount > 0 && (
                                    <Badge ml={2} colorScheme="red" borderRadius="full">
                                        {unreadCount.unreadInboundEmailCount}
                                    </Badge>
                                )}
                            </Tab>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }}>Sent</Tab>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }}>Drafts</Tab>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }}>All Emails</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Inbox Panel */}
                            <TabPanel px={0}>
                                {inboxError && (
                                    <Card bg={cardGradientBg} border="1px solid" borderColor="red.500" mb={4}>
                                        <CardBody>
                                            <Text color="red.500">
                                                Error loading emails: {inboxError.message}
                                            </Text>
                                        </CardBody>
                                    </Card>
                                )}
                                <Box 
                                    maxH="600px" 
                                    overflowY="auto" 
                                    onScroll={(e) => handleScroll(e, loadMoreInbox)}
                                    css={{
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: cardGradientBg,
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: getColor('primaryBlue'),
                                            borderRadius: '4px',
                                        },
                                    }}
                                >
                                    <VStack spacing={4} align="stretch">
                                        {console.log('[EMAIL DEBUG] Rendering inbox emails:', {
                                            count: inboxEmails.length,
                                            emails: inboxEmails.map((e: any) => ({ id: e.id, subject: e.subject }))
                                        })}
                                        {inboxEmails.map((email: any) => (
                                            <UnifiedEmailCard
                                                key={email.id}
                                                email={email}
                                                isInbound={true}
                                            />
                                        ))}
                                        
                                        {loadingInbox && (
                                            <Center py={4}>
                                                <Spinner size="lg" color={getColor('primaryBlue')} />
                                            </Center>
                                        )}
                                        
                                        {inboxData?.paginatedInboundEmails?.hasMore && !loadingInbox && (
                                            <Center py={4}>
                                                <Button
                                                    onClick={loadMoreInbox}
                                                    variant="outline"
                                                    leftIcon={<FiChevronDown />}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    _hover={{ bg: cardGradientBg }}
                                                >
                                                    Load More ({inboxData.paginatedInboundEmails.totalCount - inboxEmails.length} remaining)
                                                </Button>
                                            </Center>
                                        )}
                                        
                                        {!loadingInbox && !checkingEmail && inboxEmails.length === 0 && (
                                            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                <CardBody>
                                                    <Center py={10}>
                                                        <VStack spacing={4}>
                                                            <Icon as={FiInbox} boxSize={12} color={textMuted} />
                                                            {hasEmailData?.hasAssignedEmailAddress === false ? (
                                                                <>
                                                                    <Text color={textMuted} fontSize="lg" fontWeight="bold">
                                                                        No Email Address Assigned
                                                                    </Text>
                                                                    <Text color={textMuted} fontSize="md" textAlign="center" maxW="md">
                                                                        Your account hasn't been assigned an email address yet.
                                                                        Please contact your administrator to set up email access.
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No incoming emails found.
                                                                    </Text>
                                                                    {myEmailsData?.myEmailAddresses && myEmailsData.myEmailAddresses.length > 0 && (
                                                                        <VStack spacing={1} mt={2}>
                                                                            <Text color={textMuted} fontSize="sm">
                                                                                Monitoring emails for:
                                                                            </Text>
                                                                            {myEmailsData.myEmailAddresses.map((email: any) => (
                                                                                <Text key={email.id} color={textSecondary} fontSize="sm">
                                                                                    {email.email}
                                                                                </Text>
                                                                            ))}
                                                                        </VStack>
                                                                    )}
                                                                </>
                                                            )}
                                                        </VStack>
                                                    </Center>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </VStack>
                                </Box>
                                
                                {inboxData?.paginatedInboundEmails && (
                                    <HStack justify="space-between" mt={4}>
                                        <Text fontSize="sm" color={textMuted}>
                                            Showing {inboxEmails.length} of {inboxData.paginatedInboundEmails.totalCount} emails
                                        </Text>
                                        <Text fontSize="sm" color={textMuted}>
                                            Page {inboxData.paginatedInboundEmails.currentPage} of {inboxData.paginatedInboundEmails.totalPages}
                                        </Text>
                                    </HStack>
                                )}
                            </TabPanel>

                            {/* Sent Panel */}
                            <TabPanel px={0}>
                                <Box 
                                    maxH="600px" 
                                    overflowY="auto" 
                                    onScroll={(e) => handleScroll(e, loadMoreSent)}
                                    css={{
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: cardGradientBg,
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: getColor('primaryBlue'),
                                            borderRadius: '4px',
                                        },
                                    }}
                                >
                                    <VStack spacing={4} align="stretch">
                                        {sentEmails.map((email: any) => (
                                            <UnifiedEmailCard
                                                key={email.id}
                                                email={email}
                                                isInbound={false}
                                            />
                                        ))}
                                        
                                        {loadingSent && (
                                            <Center py={4}>
                                                <Spinner size="lg" color={getColor('primaryBlue')} />
                                            </Center>
                                        )}
                                        
                                        {sentData?.paginatedEmails?.hasMore && !loadingSent && (
                                            <Center py={4}>
                                                <Button
                                                    onClick={loadMoreSent}
                                                    variant="outline"
                                                    leftIcon={<FiChevronDown />}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    _hover={{ bg: cardGradientBg }}
                                                >
                                                    Load More
                                                </Button>
                                            </Center>
                                        )}
                                        
                                        {!loadingSent && sentEmails.length === 0 && (
                                            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                <CardBody>
                                                    <Center py={10}>
                                                        <VStack spacing={4}>
                                                            <Icon as={FiSend} boxSize={12} color={textMuted} />
                                                            <Text color={textMuted} fontSize="lg">
                                                                No sent emails found.
                                                            </Text>
                                                        </VStack>
                                                    </Center>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </VStack>
                                </Box>
                            </TabPanel>

                            {/* Drafts Panel */}
                            <TabPanel px={0}>
                                <Box 
                                    maxH="600px" 
                                    overflowY="auto" 
                                    onScroll={(e) => handleScroll(e, loadMoreDrafts)}
                                    css={{
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: cardGradientBg,
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: getColor('primaryBlue'),
                                            borderRadius: '4px',
                                        },
                                    }}
                                >
                                    <VStack spacing={4} align="stretch">
                                        {draftEmails.map((email: any) => (
                                            <UnifiedEmailCard
                                                key={email.id}
                                                email={email}
                                                isInbound={false}
                                            />
                                        ))}
                                        
                                        {loadingDrafts && (
                                            <Center py={4}>
                                                <Spinner size="lg" color={getColor('primaryBlue')} />
                                            </Center>
                                        )}
                                        
                                        {draftsData?.paginatedEmails?.hasMore && !loadingDrafts && (
                                            <Center py={4}>
                                                <Button
                                                    onClick={loadMoreDrafts}
                                                    variant="outline"
                                                    leftIcon={<FiChevronDown />}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    _hover={{ bg: cardGradientBg }}
                                                >
                                                    Load More
                                                </Button>
                                            </Center>
                                        )}
                                        
                                        {!loadingDrafts && draftEmails.length === 0 && (
                                            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                <CardBody>
                                                    <Center py={10}>
                                                        <VStack spacing={4}>
                                                            <Icon as={FiEdit} boxSize={12} color={textMuted} />
                                                            <Text color={textMuted} fontSize="lg">
                                                                No draft emails found.
                                                            </Text>
                                                        </VStack>
                                                    </Center>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </VStack>
                                </Box>
                            </TabPanel>

                            {/* All Emails Panel - Combine both queries */}
                            <TabPanel px={0}>
                                <Center py={10}>
                                    <Text color={textMuted}>
                                        Combined view coming soon - use individual tabs for now
                                    </Text>
                                </Center>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default EmailsListPaginated;