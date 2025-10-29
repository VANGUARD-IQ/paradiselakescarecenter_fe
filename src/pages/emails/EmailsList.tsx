import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Badge,
    IconButton,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    VStack,
    Text,
    useColorModeValue,
    useColorMode,
    Spinner,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Card,
    CardBody,
    SimpleGrid,
    Icon,
    Center,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Collapse,
    Divider,
    Tooltip,
    Progress,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Checkbox,
    ButtonGroup
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiEdit, FiTrash2, FiSend, FiCopy, FiMoreVertical, FiEye, FiMail, FiClock, FiCheckCircle, FiInbox, FiStar, FiPaperclip, FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight, FiArchive, FiAlertCircle, FiTag } from 'react-icons/fi';
import { formatDistanceToNow, subDays, subWeeks, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import { useEmailAccounts } from "./hooks/useEmailAccounts";
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// GraphQL query to check user's personal email
const ME_WITH_EMAIL_QUERY = gql`
    query GetMeWithEmail {
        me {
            id
            fName
            lName
        }
    }
`;

// Query to get all accessible email addresses
const MY_EMAIL_ADDRESSES_QUERY = gql`
    query GetMyAccessibleEmailAddresses {
        myAccessibleEmailAddresses {
            email
            displayName
            type
            unreadCount
            totalCount
            isDefault
            recordId
        }
    }
`;

// Updated query with email address filter - using InboundEmail fields
const INBOUND_EMAILS_BY_ADDRESS_QUERY = gql`
    query GetInboundEmailsByAddress($emailAddress: String, $limit: Int, $offset: Int) {
        emailInboxPaginated(emailAddress: $emailAddress, limit: $limit, offset: $offset) {
            emails {
                id
                from
                fromName
                fromFull
                to
                toFull
                subject
                date
                textBody
                htmlBody
                isRead
                isStarred
                isSpam
                attachments {
                    name
                    contentType
                    contentLength
                    ipfsUrl
                }
                labels
                folder
                isAssigned
                assignedClients
                isArchived
                tasks {
                    id
                    status
                    priority
                    dueDate
                }
            }
            totalCount
            hasMore
            currentPage
            totalPages
        }
    }
`;

// Split into separate queries for better performance
const INBOUND_EMAILS_ONLY_QUERY = gql`
    query GetInboundEmailsOnly {
        inboundEmails {
            id
            from
            fromName
            fromFull
            to
            toFull
            subject
            date
            textBody
            htmlBody
            isRead
            isStarred
            isSpam
            attachments {
                name
                contentType
                contentLength
                ipfsUrl
            }
            labels
            folder
            isAssigned
            assignedClients
            isArchived
            tasks {
                id
                status
                priority
                dueDate
            }
        }
    }
`;

// Only load outbound emails when specifically needed
const OUTBOUND_EMAILS_ONLY_QUERY = gql`
    query GetOutboundEmailsOnly {
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
    }
`;

const DRAFT_EMAILS_QUERY = gql`
    query GetDraftEmails {
        emailsDraft {
            id
            subject
            to
            from
            status
            createdAt
            attachments {
                name
            }
        }
    }
`;

const SENT_EMAILS_QUERY = gql`
    query GetSentEmails {
        emailsSent {
            id
            subject
            to
            from
            status
            sentAt
            opens
            clicks
            messageId
            attachments {
                name
            }
        }
    }
`;

const INBOUND_EMAILS_QUERY = gql`
    query GetInboundEmails($folder: String) {
        inboundEmails(folder: $folder) {
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
            labels
            attachments {
                name
            }
            tasks {
                id
                status
                priority
                dueDate
            }
        }
    }
`;

const UNREAD_COUNT_QUERY = gql`
    query GetUnreadCount {
        unreadInboundEmailCount
    }
`;

const ADD_EMAIL_LABEL_MUTATION = gql`
    mutation AddInboundEmailLabel($emailId: String!, $label: String!) {
        addInboundEmailLabel(emailId: $emailId, label: $label) {
            id
            labels
        }
    }
`;

const REMOVE_EMAIL_LABEL_MUTATION = gql`
    mutation RemoveInboundEmailLabel($emailId: String!, $label: String!) {
        removeInboundEmailLabel(emailId: $emailId, label: $label) {
            id
            labels
        }
    }
`;

const AVAILABLE_LABELS_QUERY = gql`
    query AvailableInboundEmailLabels {
        availableInboundEmailLabels
    }
`;

const DELETE_EMAIL_MUTATION = gql`
    mutation DeleteEmail($id: ID!) {
        deleteEmail(id: $id)
    }
`;

const DUPLICATE_EMAIL_MUTATION = gql`
    mutation DuplicateEmail($id: ID!) {
        duplicateEmail(id: $id) {
            id
        }
    }
`;

const ARCHIVE_INBOUND_EMAIL_MUTATION = gql`
    mutation ArchiveInboundEmail($id: ID!) {
        moveInboundEmailToFolder(id: $id, folder: "Archived") {
            id
            folder
        }
    }
`;

const UNARCHIVE_INBOUND_EMAIL_MUTATION = gql`
    mutation UnarchiveInboundEmail($id: ID!) {
        moveInboundEmailToFolder(id: $id, folder: "Inbox") {
            id
            folder
        }
    }
`;

const ARCHIVE_MULTIPLE_EMAILS_MUTATION = gql`
    mutation ArchiveMultipleEmails($ids: [String!]!) {
        archiveMultipleInboundEmails(ids: $ids)
    }
`;

const UNARCHIVE_MULTIPLE_EMAILS_MUTATION = gql`
    mutation UnarchiveMultipleEmails($ids: [String!]!) {
        unarchiveMultipleInboundEmails(ids: $ids)
    }
`;

const InboundEmailCard = ({ email, onArchive, onManageTags, isSelected, onSelectChange }: {
    email: any;
    onArchive?: (id: string) => void;
    onManageTags?: (email: any) => void;
    isSelected?: boolean;
    onSelectChange?: (id: string, selected: boolean) => void;
}) => {
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click navigation
        if (onArchive) {
            onArchive(email.id);
        }
    };
    
    const handleTagClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click navigation
        if (onManageTags) {
            onManageTags(email);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onSelectChange) {
            onSelectChange(email.id, e.target.checked);
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on checkbox or its label
        const target = e.target as HTMLElement;
        if (target.closest('.checkbox-wrapper')) {
            return;
        }
        navigate(`/inbox/${email.id}`);
    };

    const selectedBg = useColorModeValue('blue.50', 'blue.900');

    return (
        <Card
            bg={isSelected ? selectedBg : cardGradientBg}
            border="1px solid"
            borderColor={isSelected ? getColor('primaryBlue') : (email.isRead ? cardBorder : getColor('primaryBlue'))}
            borderRadius="xl"
            overflow="hidden"
            mx={{ base: 0, md: 0 }}
            transition="all 0.3s ease"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: getComponent('card', 'hoverShadow'),
                borderColor: getColor('primaryBlue'),
            }}
            cursor="pointer"
            onClick={handleCardClick}
            opacity={email.isRead ? 0.8 : 1}
            position="relative"
        >
            <CardBody p={{ base: 3, md: 4 }}>
                <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                    <HStack justify="space-between">
                        <HStack spacing={3} align="start">
                            <Box className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    isChecked={isSelected}
                                    onChange={handleCheckboxChange}
                                    size="lg"
                                    colorScheme="blue"
                                />
                            </Box>
                            <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                                {!email.isRead && (
                                    <Badge colorScheme="blue" size="sm">NEW</Badge>
                                )}
                                {email.isStarred && (
                                    <Icon as={FiStar} color={getColor('starYellow')} />
                                )}
                                {email.attachments && email.attachments.length > 0 && (
                                    <HStack spacing={1}>
                                        <Icon as={FiPaperclip} color={textMuted} boxSize={4} />
                                        <Text fontSize="xs" color={textMuted}>
                                            {email.attachments.length}
                                        </Text>
                                    </HStack>
                                )}
                                {(() => {
                                    if (!email.tasks || email.tasks.length === 0) {
                                        return (
                                            <Tooltip 
                                                label="No tasks assigned"
                                                placement="top"
                                            >
                                                <Badge 
                                                    variant="subtle" 
                                                    colorScheme="gray"
                                                    fontSize="xs"
                                                >
                                                    0/0
                                                </Badge>
                                            </Tooltip>
                                        );
                                    } else {
                                        const totalTasks = email.tasks.length;
                                        const completedTasks = email.tasks.filter((t: any) => t.status === 'COMPLETED').length;
                                        const hasPendingTasks = completedTasks < totalTasks;
                                        const hasUrgentTasks = email.tasks.some((t: any) => t.priority === 'URGENT' && t.status !== 'COMPLETED');
                                        const hasOverdueTasks = email.tasks.some((t: any) => 
                                            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
                                        );
                                        
                                        return (
                                            <Tooltip 
                                                label={`${completedTasks}/${totalTasks} tasks completed${hasOverdueTasks ? ' (overdue!)' : ''}`}
                                                placement="top"
                                            >
                                                <HStack spacing={1}>
                                                    <Icon 
                                                        as={hasPendingTasks ? FiAlertCircle : FiCheckCircle} 
                                                        color={hasOverdueTasks ? 'red.500' : (hasPendingTasks ? (hasUrgentTasks ? 'orange.500' : 'yellow.500') : 'green.500')} 
                                                        boxSize={4} 
                                                    />
                                                    <Text 
                                                        fontSize="xs" 
                                                        color={hasOverdueTasks ? 'red.500' : (hasPendingTasks ? (hasUrgentTasks ? 'orange.500' : 'yellow.500') : 'green.500')}
                                                        fontWeight="bold"
                                                    >
                                                        {completedTasks}/{totalTasks}
                                                    </Text>
                                                </HStack>
                                            </Tooltip>
                                        );
                                    }
                                })()}
                                <Heading size={{ base: "sm", md: "md" }} color={textPrimary} noOfLines={1} fontWeight={email.isRead ? "normal" : "bold"}>
                                    {email.subject}
                                </Heading>
                            </HStack>
                            {email.labels && email.labels.length > 0 && (
                                <Wrap spacing={1} mt={1}>
                                    {email.labels.map((label: string) => (
                                        <WrapItem key={label}>
                                            <Tag
                                                size="sm"
                                                bg="rgba(168, 85, 247, 0.2)"
                                                color="#A855F7"
                                                border="1px solid"
                                                borderColor="rgba(168, 85, 247, 0.3)"
                                            >
                                                <TagLabel fontSize="xs">{label}</TagLabel>
                                            </Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            )}
                            <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted} noOfLines={1}>
                                From: {email.fromFull || email.from}
                            </Text>
                            <Text fontSize={{ base: "xs", md: "xs" }} color={textMuted} noOfLines={1}>
                                To: {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                            </Text>
                        </VStack>
                        </HStack>
                        <VStack align="end" spacing={2} display={{ base: "none", md: "flex" }}>
                            <Text fontSize="xs" color={textMuted}>
                                {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                            </Text>
                            <HStack spacing={1}>
                                <Tooltip 
                                    label="Manage tags"
                                    placement="left"
                                    bg={getColor('primaryBlue')}
                                    color="white"
                                    fontSize="sm"
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    hasArrow
                                >
                                    <IconButton
                                        aria-label="Manage tags"
                                        icon={<FiTag />}
                                        size="sm"
                                        variant="ghost"
                                        color={textMuted}
                                        _hover={{ 
                                            bg: cardGradientBg, 
                                            color: getColor('primaryBlue'),
                                            transform: "scale(1.1)"
                                        }}
                                        onClick={handleTagClick}
                                    />
                                </Tooltip>
                                <Tooltip 
                                    label={email.folder === 'Archived' 
                                        ? "Move back to Inbox if tasks are not completed" 
                                        : "Archive email when all tasks are done"} 
                                    placement="left"
                                    bg={getColor('primaryBlue')}
                                    color="white"
                                    fontSize="sm"
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    hasArrow
                                >
                                    <IconButton
                                        aria-label={email.folder === 'Archived' ? "Unarchive" : "Archive"}
                                        icon={<FiArchive />}
                                        size="sm"
                                        variant="ghost"
                                        color={email.folder === 'Archived' ? getColor('primaryBlue') : textMuted}
                                        _hover={{ 
                                            bg: cardGradientBg, 
                                            color: getColor('primaryBlue'),
                                            transform: "scale(1.1)"
                                        }}
                                        onClick={handleArchive}
                                    />
                                </Tooltip>
                            </HStack>
                        </VStack>
                    </HStack>

                    {email.textBody && (
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} noOfLines={2}>
                            {email.textBody}
                        </Text>
                    )}
                    
                    {/* Task Progress Bar - Only show if there are tasks */}
                    {email.tasks && email.tasks.length > 0 && (() => {
                        const totalTasks = email.tasks.length;
                        const completedTasks = email.tasks.filter((t: any) => t.status === 'COMPLETED').length;
                        const progressPercentage = (completedTasks / totalTasks) * 100;
                        const hasOverdueTasks = email.tasks.some((t: any) => 
                            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
                        );
                        
                        return (
                            <Box mt={{ base: 2, md: 3 }}>
                                <HStack justify="space-between" mb={1}>
                                    <Text fontSize="xs" color={textMuted} fontWeight="medium" display={{ base: "none", sm: "block" }}>
                                        Task Progress
                                    </Text>
                                    <Text fontSize="xs" color={hasOverdueTasks ? 'red.500' : textMuted}>
                                        {completedTasks} of {totalTasks} complete
                                        {hasOverdueTasks && ' ⚠️'}
                                    </Text>
                                </HStack>
                                <Progress 
                                    value={progressPercentage} 
                                    size="xs" 
                                    colorScheme={hasOverdueTasks ? 'red' : (progressPercentage === 100 ? 'green' : 'blue')}
                                    borderRadius="full"
                                    bg={cardBorder}
                                />
                            </Box>
                        );
                    })()}
                </VStack>
            </CardBody>
        </Card>
    );
};

const UnifiedEmailCard = ({ email, isInbound = false, isSelected = false, onSelect }: {
    email: any;
    isInbound?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}) => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const handleClick = () => {
        if (onSelect) {
            onSelect(email.id);
        }
        if (isInbound) {
            navigate(`/inbox/${email.id}`);
        } else {
            navigate(`/email/${email.id}`);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: getColor('status.draft'),
            SENT: getColor('status.sent'),
            FAILED: getColor('status.failed'),
            SCHEDULED: getColor('status.scheduled'),
            INBOUND: getColor('status.inbound')
        };
        return colors[status] || getColor('status.draft');
    };

    const emailDate = isInbound ? email.date : (email.sentAt || email.createdAt);
    const emailStatus = isInbound ? 'INBOUND' : email.status;

    // Use subtle brand colors for selection
    const selectedBg = useColorModeValue(
        `${getColor('primaryBlue')}10`,
        `${getColor('primaryBlue')}15`
    );
    const selectedHoverBg = useColorModeValue(
        `${getColor('primaryBlue')}15`,
        `${getColor('primaryBlue')}20`
    );

    return (
        <Card
            bg={isSelected ? selectedBg : cardGradientBg}
            border="2px solid"
            borderColor={isSelected ? getColor('primaryBlue') : (isInbound && !email.isRead ? getColor('primaryBlue') : cardBorder)}
            borderRadius="xl"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: getComponent('card', 'hoverShadow'),
                borderColor: getColor('primaryBlue'),
                bg: isSelected ? selectedHoverBg : `${getColor('primaryBlue')}05`
            }}
            cursor="pointer"
            onClick={handleClick}
            opacity={isInbound && email.isRead && !isSelected ? 0.8 : 1}
            width="100%"
        >
            <CardBody p={{ base: 3, md: 4 }}>
                <HStack spacing={{ base: 3, md: 4 }} align="start">
                    {/* Left side - Icon/Status */}
                    <VStack spacing={1}>
                        <Icon 
                            as={isInbound ? FiInbox : FiSend} 
                            color={isInbound && !email.isRead ? getColor('primaryBlue') : textMuted}
                            boxSize={{ base: 5, md: 6 }}
                        />
                        <Badge 
                            size="sm"
                            bg={`${getStatusColor(emailStatus)}20`}
                            color={getStatusColor(emailStatus)}
                            border="1px solid"
                            borderColor={`${getStatusColor(emailStatus)}30`}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                        >
                            {emailStatus}
                        </Badge>
                    </VStack>

                    {/* Middle - Content */}
                    <VStack align="start" spacing={{ base: 1, md: 2 }} flex={1}>
                        <HStack width="100%" justify="space-between">
                            <VStack align="start" spacing={0} flex={1}>
                                <HStack>
                                    {isInbound && !email.isRead && (
                                        <Badge colorScheme="blue" size="sm">NEW</Badge>
                                    )}
                                    {isInbound && email.isStarred && (
                                        <Icon as={FiStar} color={getColor('starYellow')} boxSize={4} />
                                    )}
                                    {email.attachments && email.attachments.length > 0 && (
                                        <HStack spacing={1}>
                                            <Icon as={FiPaperclip} color={textMuted} boxSize={3} />
                                            <Text fontSize="xs" color={textMuted}>
                                                {email.attachments.length}
                                            </Text>
                                        </HStack>
                                    )}
                                    <Heading 
                                        size={{ base: "sm", md: "md" }} 
                                        color={textPrimary} 
                                        noOfLines={1}
                                        fontWeight={isInbound && !email.isRead ? "bold" : "normal"}
                                    >
                                        {email.subject}
                                    </Heading>
                                </HStack>
                                {email.labels && email.labels.length > 0 && (
                                    <Wrap spacing={1} mt={1}>
                                        {email.labels.map((label: string) => (
                                            <WrapItem key={label}>
                                                <Tag
                                                    size="sm"
                                                    bg="rgba(168, 85, 247, 0.2)"
                                                    color="#A855F7"
                                                    border="1px solid"
                                                    borderColor="rgba(168, 85, 247, 0.3)"
                                                >
                                                    <TagLabel fontSize="xs">{label}</TagLabel>
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                )}
                                <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted} noOfLines={1}>
                                    {isInbound ? `From: ${email.fromFull || email.from}` : `To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`}
                                </Text>
                            </VStack>
                            <Text fontSize="xs" color={textMuted} display={{ base: "none", md: "block" }}>
                                {formatDistanceToNow(new Date(emailDate), { addSuffix: true })}
                            </Text>
                        </HStack>
                        
                        {/* Email preview */}
                        {(email.textBody || email.htmlBody) && (
                            <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} noOfLines={{ base: 1, md: 2 }}>
                                {email.textBody || email.htmlBody?.replace(/<[^>]*>/g, '')}
                            </Text>
                        )}

                        {/* Mobile date */}
                        <Text fontSize="xs" color={textMuted} display={{ base: "block", md: "none" }}>
                            {formatDistanceToNow(new Date(emailDate), { addSuffix: true })}
                        </Text>
                        
                        {/* Task Progress Bar - Only show if there are tasks */}
                        {isInbound && email.tasks && email.tasks.length > 0 && (() => {
                            const totalTasks = email.tasks.length;
                            const completedTasks = email.tasks.filter((t: any) => t.status === 'COMPLETED').length;
                            const progressPercentage = (completedTasks / totalTasks) * 100;
                            const hasOverdueTasks = email.tasks.some((t: any) => 
                                t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
                            );
                            
                            return (
                                <Box mt={{ base: 2, md: 3 }} width="100%">
                                    <HStack justify="space-between" mb={1}>
                                        <Text fontSize="xs" color={textMuted} fontWeight="medium">
                                            Tasks
                                        </Text>
                                        <Text fontSize="xs" color={hasOverdueTasks ? 'red.500' : textMuted}>
                                            {completedTasks}/{totalTasks}
                                            {hasOverdueTasks && ' ⚠️'}
                                        </Text>
                                    </HStack>
                                    <Progress 
                                        value={progressPercentage} 
                                        size="xs" 
                                        colorScheme={hasOverdueTasks ? 'red' : (progressPercentage === 100 ? 'green' : 'blue')}
                                        borderRadius="full"
                                        bg={cardBorder}
                                    />
                                </Box>
                            );
                        })()}
                    </VStack>

                    {/* Right side - Stats (for sent emails) */}
                    {!isInbound && email.status === 'SENT' && (
                        <HStack spacing={3} display={{ base: "none", lg: "flex" }}>
                            <VStack spacing={0}>
                                <Icon as={FiEye} color={getColor("successGreen")} boxSize={4} />
                                <Text fontWeight="bold" fontSize="sm" color={textPrimary}>{email.opens || 0}</Text>
                                <Text fontSize="xs" color={textMuted}>Opens</Text>
                            </VStack>
                            <VStack spacing={0}>
                                <Icon as={FiCheckCircle} color={getColor('purpleAccent')} boxSize={4} />
                                <Text fontWeight="bold" fontSize="sm" color={textPrimary}>{email.clicks || 0}</Text>
                                <Text fontSize="xs" color={textMuted}>Clicks</Text>
                            </VStack>
                        </HStack>
                    )}
                </HStack>
            </CardBody>
        </Card>
    );
};

const EmailsList: React.FC = () => {
    usePageTitle("Emails");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
    const [deleteEmailId, setDeleteEmailId] = useState<string | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    // State for managing multiple inboxes
    const [selectedEmailAddress, setSelectedEmailAddress] = useState<string | null>(null);
    const [activeInboxTab, setActiveInboxTab] = useState(0);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    // State for multi-select functionality
    const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());

    // State for main tab navigation
    const [activeMainTab, setActiveMainTab] = useState(0);

    // Check if user has email accounts
    const { hasEmailAccounts, loading: loadingEmailAccounts } = useEmailAccounts();

    // Fetch all accessible email addresses
    const { data: emailAddressesData, loading: loadingEmailAddresses, refetch: refetchEmailAddresses, error: emailAddressesError } = useQuery(MY_EMAIL_ADDRESSES_QUERY);

    // Debug logging for email addresses query
    if (emailAddressesData?.myAccessibleEmailAddresses) {
        console.log('📧 [MY_EMAIL_ADDRESSES_QUERY] Full data structure:', JSON.stringify(emailAddressesData.myAccessibleEmailAddresses, null, 2));
    }
    console.log('📧 [MY_EMAIL_ADDRESSES_QUERY] Result:', {
        loading: loadingEmailAddresses,
        error: emailAddressesError,
        data: emailAddressesData,
        addresses: emailAddressesData?.myAccessibleEmailAddresses,
        firstAddress: emailAddressesData?.myAccessibleEmailAddresses?.[0],
        secondAddress: emailAddressesData?.myAccessibleEmailAddresses?.[1]
    });

    // Check for personal email
    const { data: meData, loading: loadingMe, refetch: refetchMe } = useQuery(ME_WITH_EMAIL_QUERY);

    // Set default email on load - prioritize personal inbox, then shared
    useEffect(() => {
        if (emailAddressesData?.myAccessibleEmailAddresses && emailAddressesData.myAccessibleEmailAddresses.length > 0 && !selectedEmailAddress) {
            // Find personal email first
            const personalEmail = emailAddressesData.myAccessibleEmailAddresses.find((e: any) => e.type === 'PERSONAL');

            if (personalEmail) {
                // Set personal email as default
                setSelectedEmailAddress(personalEmail.email);
                const index = emailAddressesData.myAccessibleEmailAddresses.indexOf(personalEmail);
                setActiveInboxTab(index);
                console.log('📧 [AUTO-SELECT] Selected personal inbox by default:', personalEmail.email);
            } else {
                // No personal email, select first shared inbox
                const firstEmail = emailAddressesData.myAccessibleEmailAddresses[0];
                setSelectedEmailAddress(firstEmail.email);
                setActiveInboxTab(0);
                console.log('📧 [AUTO-SELECT] Selected first shared inbox by default:', firstEmail.email);
            }
        }
    }, [emailAddressesData, selectedEmailAddress]);

    // Get tenant domain for display
    const domain = window.location.hostname.replace('localhost', 'tommillerservices.com');

    // Debug logging for personal email
    React.useEffect(() => {
        if (!loadingMe && meData) {
            console.log('📧 [EmailsList] ME_WITH_EMAIL query result:', {
                hasData: !!meData.me,
                user: meData.me ? {
                    id: meData.me.id,
                    email: meData.me.email,
                    personalEmail: meData.me.personalEmail || 'NOT SET',
                    fName: meData.me.fName,
                    lName: meData.me.lName
                } : 'NO USER'
            });
        }
    }, [meData, loadingMe]);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(20); // Default to 20 items per page
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [currentEmailForLabeling, setCurrentEmailForLabeling] = useState<any | null>(null);
    const { isOpen: isLabelPopoverOpen, onOpen: onLabelPopoverOpen, onClose: onLabelPopoverClose } = useDisclosure();

    // Pagination states - moved here to be available for queries
    const [currentPages, setCurrentPages] = useState({
        inbox: 1,
        sent: 1,
        drafts: 1,
        all: 1,
        archived: 1
    });

    // Consistent styling from brandConfig
    const bg = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    // Load inbound emails based on selected email address
    console.log('📧 [EMAIL FILTERING] Selected email address:', selectedEmailAddress);
    console.log('📧 [EMAIL FILTERING] Always using paginated query for performance');

    const { data: inboundEmailsData, loading: loadingInboundOnly, refetch: refetchInboundOnly, error: inboundError } = useQuery(
        INBOUND_EMAILS_BY_ADDRESS_QUERY,
        {
            variables: {
                emailAddress: selectedEmailAddress || null,
                limit: itemsPerPage,
                offset: (currentPages.inbox - 1) * itemsPerPage
            },
            skip: false, // Always load emails, even when no specific address is selected
            fetchPolicy: 'cache-and-network', // Show cached data while fetching new
            onCompleted: (data) => {
                console.log('✅ [EMAIL FILTERING] Query completed successfully');
                const emails = data?.emailInboxPaginated?.emails || [];
                const totalCount = data?.emailInboxPaginated?.totalCount || 0;
                console.log(`📊 [EMAIL FILTERING] Loaded ${emails.length} of ${totalCount} emails for ${selectedEmailAddress || 'all inboxes'}`);
                if (data?.emailInboxPaginated) {
                    console.log('📄 [EMAIL FILTERING] Pagination info:', {
                        currentPage: data.emailInboxPaginated.currentPage,
                        totalPages: data.emailInboxPaginated.totalPages,
                        totalCount: data.emailInboxPaginated.totalCount,
                        hasMore: data.emailInboxPaginated.hasMore
                    });
                }
            },
            onError: (error) => {
                console.error('❌ [EMAIL FILTERING] Query error:', error);
                console.error('❌ [EMAIL FILTERING] Error details:', error.graphQLErrors);
            }
        }
    );

    // Log any errors
    if (inboundError) {
        console.error('❌ [EMAIL FILTERING] Inbound query error:', inboundError);
    }
    
    // Only load outbound emails when 'All' tab is selected
    const [shouldLoadOutbound, setShouldLoadOutbound] = useState(false);
    const { data: outboundEmailsData, loading: loadingOutbound, refetch: refetchOutbound } = useQuery(OUTBOUND_EMAILS_ONLY_QUERY, {
        skip: !shouldLoadOutbound, // Only load when needed
        fetchPolicy: 'cache-and-network'
    });
    
    // Combine data for 'All' tab
    const allEmails = useMemo(() => {
        if (!inboundEmailsData && !outboundEmailsData) return null;
        // Always use the paginated query result
        const inboundEmails = inboundEmailsData?.emailInboxPaginated?.emails || [];
        return {
            emails: outboundEmailsData?.emails || [],
            inboundEmails: inboundEmails
        };
    }, [inboundEmailsData, outboundEmailsData]);
    
    const loadingAll = loadingInboundOnly || (shouldLoadOutbound && loadingOutbound);
    const refetchAll = () => {
        refetchInboundOnly();
        if (shouldLoadOutbound) refetchOutbound();
    };
    const { data: draftEmails, loading: loadingDrafts, refetch: refetchDrafts } = useQuery(DRAFT_EMAILS_QUERY, {
        skip: !selectedEmailAddress // Only load when an inbox is selected
    });
    const { data: sentEmails, loading: loadingSent, refetch: refetchSent } = useQuery(SENT_EMAILS_QUERY, {
        skip: !selectedEmailAddress // Only load when an inbox is selected
    });
    const { data: inboundEmails, loading: loadingInbound, refetch: refetchInbound } = useQuery(INBOUND_EMAILS_QUERY, {
        variables: { folder: 'Inbox' }, // Get only Inbox emails
        fetchPolicy: 'network-only', // Always fetch fresh data
        skip: true // Not needed - we use inboundEmailsData instead
    });
    const { data: archivedEmails, loading: loadingArchived, refetch: refetchArchived } = useQuery(INBOUND_EMAILS_QUERY, {
        variables: { folder: 'Archived' },
        skip: activeMainTab !== 3 // Only load when archived tab is active (index 3)
    });
    const { data: unreadCount } = useQuery(UNREAD_COUNT_QUERY, {
        skip: !selectedEmailAddress // Only load when an inbox is selected
    });
    const { data: availableLabelsData } = useQuery(AVAILABLE_LABELS_QUERY);

    const [addLabel] = useMutation(ADD_EMAIL_LABEL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Label added',
                status: 'success',
                duration: 2000,
            });
            refetchInbound();
            refetchAll();
            setNewLabel('');
        },
    });

    const [removeLabel] = useMutation(REMOVE_EMAIL_LABEL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Label removed',
                status: 'success',
                duration: 2000,
            });
            refetchInbound();
            refetchAll();
        },
    });

    const [deleteEmail] = useMutation(DELETE_EMAIL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Email deleted',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            refetchAll();
            refetchDrafts();
            onClose();
        },
        onError: (error) => {
            toast({
                title: 'Error deleting email',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const [archiveMultipleEmails] = useMutation(ARCHIVE_MULTIPLE_EMAILS_MUTATION, {
        onCompleted: (data) => {
            toast({
                title: `Archived ${data.archiveMultipleInboundEmails} emails`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            refetchInboundOnly(); // Refetch the correct query
            setSelectedEmailIds(new Set());
        },
        onError: (error) => {
            toast({
                title: 'Error archiving emails',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const [unarchiveMultipleEmails] = useMutation(UNARCHIVE_MULTIPLE_EMAILS_MUTATION, {
        onCompleted: (data) => {
            toast({
                title: `Unarchived ${data.unarchiveMultipleInboundEmails} emails`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            refetchArchived();
            setSelectedEmailIds(new Set());
        },
        onError: (error) => {
            toast({
                title: 'Error unarchiving emails',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const [duplicateEmail] = useMutation(DUPLICATE_EMAIL_MUTATION, {
        onCompleted: (data) => {
            toast({
                title: 'Email duplicated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            refetchAll();
            refetchDrafts();
            navigate(`/email/${data.duplicateEmail.id}`);
        },
        onError: (error) => {
            toast({
                title: 'Error duplicating email',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const handleManageTags = (email: any) => {
        setCurrentEmailForLabeling(email);
        onLabelPopoverOpen();
    };

    const handleAddLabel = async () => {
        if (newLabel && currentEmailForLabeling) {
            await addLabel({
                variables: {
                    emailId: currentEmailForLabeling.id,
                    label: newLabel
                }
            });
            setNewLabel('');
        }
    };

    const handleRemoveLabel = async (label: string) => {
        if (currentEmailForLabeling) {
            await removeLabel({
                variables: {
                    emailId: currentEmailForLabeling.id,
                    label: label
                }
            });
        }
    };

    const [archiveEmail] = useMutation(ARCHIVE_INBOUND_EMAIL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Email archived',
                description: 'Email has been moved to archive',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            refetchInbound();
            refetchArchived();
            refetchInboundOnly();
            refetchEmailAddresses(); // Refresh unread counts
        },
        onError: (error) => {
            toast({
                title: 'Error archiving email',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const [unarchiveEmail] = useMutation(UNARCHIVE_INBOUND_EMAIL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Email restored',
                description: 'Email has been moved back to inbox',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            refetchInbound();
            refetchArchived();
            refetchInboundOnly();
            refetchEmailAddresses(); // Refresh unread counts
        },
        onError: (error) => {
            toast({
                title: 'Error restoring email',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });


    const handleDelete = () => {
        if (deleteEmailId) {
            deleteEmail({ variables: { id: deleteEmailId } });
        }
    };

    const _confirmDelete = (id: string) => {
        setDeleteEmailId(id);
        onOpen();
    };

    // Filter emails based on search and date filters
    const filterEmails = (emails: any[]) => {
        if (!emails) return [];
        
        let filtered = [...emails];
        
        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(email => {
                const subject = (email.subject || '').toLowerCase();
                const from = (email.from || '').toLowerCase();
                const fromFull = (email.fromFull || '').toLowerCase();
                const to = Array.isArray(email.to) ? email.to.join(' ').toLowerCase() : (email.to || '').toLowerCase();
                const body = (email.textBody || '').toLowerCase() + (email.htmlBody || '').toLowerCase();
                
                return subject.includes(search) || 
                       from.includes(search) || 
                       fromFull.includes(search) ||
                       to.includes(search) ||
                       body.includes(search);
            });
        }

        // Apply label filter
        if (selectedLabels.length > 0) {
            filtered = filtered.filter(email => 
                email.labels && selectedLabels.some(label => email.labels.includes(label))
            );
        }
        
        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date;
            let endDate: Date = now;
            
            switch (dateFilter) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'yesterday':
                    startDate = new Date(now.setDate(now.getDate() - 1));
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'lastWeek':
                    startDate = subWeeks(now, 1);
                    break;
                case 'last7Days':
                    startDate = subDays(now, 7);
                    break;
                case 'last30Days':
                    startDate = subDays(now, 30);
                    break;
                case 'thisMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'lastMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
                case 'custom':
                    if (customStartDate && customEndDate) {
                        startDate = new Date(customStartDate);
                        endDate = new Date(customEndDate);
                        endDate.setHours(23, 59, 59, 999);
                    } else {
                        return filtered;
                    }
                    break;
                default:
                    return filtered;
            }
            
            filtered = filtered.filter(email => {
                const emailDate = new Date(email.date || email.sentAt || email.createdAt);
                return isWithinInterval(emailDate, { start: startDate, end: endDate });
            });
        }
        
        return filtered;
    };

    // Paginate emails
    const paginateEmails = (emails: any[], page: number) => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            paginatedEmails: emails.slice(startIndex, endIndex),
            totalCount: emails.length,
            totalPages: Math.ceil(emails.length / itemsPerPage),
            hasMore: endIndex < emails.length,
            currentPage: page
        };
    };

    // Reset pagination when filters or items per page change
    const resetPagination = () => {
        setCurrentPages({
            inbox: 1,
            sent: 1,
            drafts: 1,
            all: 1,
            archived: 1
        });
    };

    // Handle archive/unarchive
    const handleArchiveEmail = (emailId: string, isArchived: boolean = false) => {
        if (isArchived) {
            unarchiveEmail({ variables: { id: emailId } });
        } else {
            archiveEmail({ variables: { id: emailId } });
        }
    };

    // Handle email selection
    const handleEmailSelectionChange = (emailId: string, selected: boolean) => {
        const newSelection = new Set(selectedEmailIds);
        if (selected) {
            newSelection.add(emailId);
        } else {
            newSelection.delete(emailId);
        }
        setSelectedEmailIds(newSelection);
    };

    // Handle select all/unselect all
    const handleSelectAll = (emails: any[]) => {
        const allIds = new Set(emails.map(e => e.id));
        setSelectedEmailIds(allIds);
    };

    const handleUnselectAll = () => {
        setSelectedEmailIds(new Set());
    };

    // Handle mass archive
    const handleMassArchive = () => {
        if (selectedEmailIds.size > 0) {
            archiveMultipleEmails({
                variables: { ids: Array.from(selectedEmailIds) }
            });
        }
    };

    // Handle mass unarchive
    const handleMassUnarchive = () => {
        if (selectedEmailIds.size > 0) {
            unarchiveMultipleEmails({
                variables: { ids: Array.from(selectedEmailIds) }
            });
        }
    };

    return (
        <Box minH="100vh" bg={bg} display="flex" flexDirection="column" overflowX="hidden">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
            
            <Container maxW={{ base: "100%", md: "container.md", lg: "container.xl" }} px={{ base: 3, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                    <VStack align="stretch" spacing={{ base: 3, md: 0 }}>
                        <VStack align="start" spacing={1}>
                            <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color={textPrimary}>
                                Email
                            </Heading>
                            <Text fontSize={{ base: "sm", md: "md" }} color={textMuted}>
                                {!loadingEmailAccounts && !hasEmailAccounts
                                    ? "Email access not configured - Please contact your administrator"
                                    : "Compose and send branded emails to your clients"}
                            </Text>
                        </VStack>
                        <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }} mt={{ base: 3, md: 0 }}>
                            <Button
                                colorScheme="blue"
                                onClick={() => navigate('/emails/new')}
                                size={{ base: "md", md: "lg" }}
                                bg={getColor('primaryBlue')}
                                _hover={{ bg: getColor('primaryBlueHover') }}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Compose Email
                            </Button>
                        </Box>
                    </VStack>


                    {/* Show warning if no email accounts assigned */}
                    {/* Multi-stage Loading Progress */}
                    {(loadingEmailAddresses || loadingInboundOnly) && (
                        <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder} mb={4}>
                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    {/* Stage 1: Loading Email Accounts */}
                                    <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                            <Text color={textPrimary} fontWeight="medium">
                                                {loadingEmailAddresses ? '📧 Querying your email accounts...' : '✅ Email accounts loaded'}
                                            </Text>
                                            {loadingEmailAddresses && <Spinner size="sm" color={getColor('primaryBlue')} />}
                                            {!loadingEmailAddresses && <Text color="green.500">✓</Text>}
                                        </HStack>
                                        <Progress
                                            value={loadingEmailAddresses ? 50 : 100}
                                            size="sm"
                                            colorScheme="blue"
                                            isIndeterminate={loadingEmailAddresses}
                                            borderRadius="full"
                                        />
                                    </VStack>

                                    {/* Stage 2: Loading Emails */}
                                    {!loadingEmailAddresses && (
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Text color={textPrimary} fontWeight="medium">
                                                    {loadingInboundOnly ? '📬 Loading most recent emails...' : '✅ Emails loaded'}
                                                </Text>
                                                {loadingInboundOnly && <Spinner size="sm" color={getColor('primaryBlue')} />}
                                                {!loadingInboundOnly && <Text color="green.500">✓</Text>}
                                            </HStack>
                                            <Progress
                                                value={loadingInboundOnly ? 50 : 100}
                                                size="sm"
                                                colorScheme="green"
                                                isIndeterminate={loadingInboundOnly}
                                                borderRadius="full"
                                            />
                                        </VStack>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    {!loadingEmailAccounts && !hasEmailAccounts && (
                        <Card
                            bg="orange.50"
                            border="1px solid"
                            borderColor="orange.200"
                            _dark={{ bg: "orange.900", borderColor: "orange.700" }}
                        >
                            <CardBody>
                                <HStack spacing={3} align="start">
                                    <Icon
                                        as={FiAlertTriangle}
                                        color="orange.500"
                                        boxSize={5}
                                        mt={0.5}
                                    />
                                    <VStack align="start" spacing={2} flex={1}>
                                        <Text fontWeight="bold" color="orange.800" _dark={{ color: "orange.200" }}>
                                            No Email Address Assigned
                                        </Text>
                                        <Text fontSize="sm" color="orange.700" _dark={{ color: "orange.300" }}>
                                            You don't have any email addresses assigned to your account on the Email List page.
                                        </Text>
                                        <Text fontSize="sm" color="orange.700" _dark={{ color: "orange.300" }}>
                                            Please contact your system administrator to have an email address assigned to you before you can send or receive emails.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    )}

                    {/* Email Address Selector - Show which inboxes are being monitored */}
                    {!loadingEmailAddresses && emailAddressesData?.myAccessibleEmailAddresses && emailAddressesData.myAccessibleEmailAddresses.length > 0 && (
                        <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder} mb={4}>
                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                        <Heading size="md" color={textPrimary}>
                                            📧 Your Email Inboxes
                                        </Heading>
                                        <Badge colorScheme="blue" variant="subtle" fontSize="md" px={3} py={1}>
                                            {emailAddressesData.myAccessibleEmailAddresses.length} {emailAddressesData.myAccessibleEmailAddresses.length === 1 ? 'Inbox' : 'Inboxes'}
                                        </Badge>
                                    </HStack>

                                    <Tabs
                                        index={activeInboxTab}
                                        onChange={(index) => {
                                            console.log(`🔄 [TAB CHANGE] Tab clicked - Index: ${index}`);
                                            setActiveInboxTab(index);

                                            const email = emailAddressesData.myAccessibleEmailAddresses[index];
                                            console.log('📧 [TAB CHANGE] Selected specific inbox:', {
                                                email: email.email,
                                                displayName: email.displayName,
                                                type: email.type,
                                                recordId: email.recordId
                                            });
                                            setSelectedEmailAddress(email.email);

                                            // Reset pagination when switching inboxes
                                            console.log('📄 [TAB CHANGE] Resetting pagination to page 1');
                                            setCurrentPages(prev => ({ ...prev, inbox: 1 }));

                                            console.log('🔄 [TAB CHANGE] Triggering email refetch...');
                                            refetchInboundOnly();
                                        }}
                                        variant="soft-rounded"
                                    >
                                        <TabList flexWrap="wrap" sx={{
                                            '& .chakra-tabs__tab[aria-selected=true]': {
                                                bg: `${getColor('primaryBlue')}20`,
                                                color: getColor('primaryBlue'),
                                                fontWeight: 'bold',
                                                borderColor: getColor('primaryBlue'),
                                                border: '2px solid'
                                            },
                                            '& .chakra-tabs__tab': {
                                                color: textMuted,
                                                border: '1px solid',
                                                borderColor: 'transparent',
                                                _hover: {
                                                    bg: `${getColor('primaryBlue')}10`,
                                                    color: getColor('primaryBlue')
                                                }
                                            }
                                        }}>
                                            {emailAddressesData.myAccessibleEmailAddresses.map((emailAddr: any, _index: number) => (
                                                <Tooltip
                                                    key={emailAddr.email}
                                                    label={
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontSize="xs">
                                                                <strong>Source:</strong> {emailAddr.type === 'PERSONAL' ?
                                                                    (emailAddr.recordId?.startsWith('client_') ? 'Client Record' : 'Email Account') :
                                                                    'Email Address Collection'}
                                                            </Text>
                                                            <Text fontSize="xs">
                                                                <strong>ID:</strong> {emailAddr.recordId}
                                                            </Text>
                                                        </VStack>
                                                    }
                                                    placement="bottom"
                                                    hasArrow
                                                >
                                                    <Tab>
                                                        <VStack spacing={0} align="center">
                                                            <HStack spacing={2}>
                                                                <Text fontSize="md" fontWeight="medium">{emailAddr.displayName}</Text>
                                                                {emailAddr.unreadCount > 0 && (
                                                                    <Badge colorScheme="red" variant="solid" fontSize="sm">
                                                                        {emailAddr.unreadCount}
                                                                    </Badge>
                                                                )}
                                                            </HStack>
                                                            <Text fontSize="sm" color={textMuted}>
                                                                {emailAddr.email}
                                                            </Text>
                                                            {/* Commented out type badge
                                                            <Badge
                                                                colorScheme={emailAddr.type === 'PERSONAL' ? 'green' : 'purple'}
                                                                variant="subtle"
                                                                fontSize="xs"
                                                                mt={1}
                                                            >
                                                                {emailAddr.type === 'PERSONAL' ? 'Personal' : 'Shared'}
                                                            </Badge>
                                                            */}
                                                        </VStack>
                                                    </Tab>
                                                </Tooltip>
                                            ))}
                                        </TabList>
                                    </Tabs>

                                    {selectedEmailAddress && (
                                        <Box p={3} bg={bg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
                                            <Text fontSize="sm" color={textSecondary}>
                                                <strong>Currently viewing:</strong> {selectedEmailAddress}
                                            </Text>
                                        </Box>
                                    )}

                                    {!selectedEmailAddress && (
                                        <Box p={3} bg={bg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
                                            <Text fontSize="sm" color={textSecondary}>
                                                <strong>Currently viewing:</strong> All accessible email inboxes
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    {/* Search and Filter Bar */}
                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody>
                            <VStack spacing={4}>
                                <VStack width="100%" spacing={{ base: 3, md: 4 }} align="stretch">
                                    <InputGroup width="100%">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiSearch} color={textMuted} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search emails..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            bg={bg}
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            _hover={{ borderColor: getColor('primaryBlue') }}
                                            _focus={{ borderColor: getColor('primaryBlue'), boxShadow: "0 0 0 1px #3B82F6" }}
                                            fontSize={{ base: "sm", md: "md" }}
                                        />
                                    </InputGroup>
                                    
                                    <HStack width="100%" spacing={{ base: 2, md: 4 }}>
                                    <Select
                                        flex={{ base: 1, md: "none" }}
                                        width={{ base: "100%", md: "200px" }}
                                        value={dateFilter}
                                        onChange={(e) => {
                                            setDateFilter(e.target.value);
                                            resetPagination();
                                        }}
                                        bg={bg}
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ borderColor: getColor('primaryBlue') }}
                                        _focus={{ borderColor: getColor('primaryBlue'), boxShadow: "0 0 0 1px #3B82F6" }}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last7Days">Last 7 Days</option>
                                        <option value="lastWeek">Last Week</option>
                                        <option value="last30Days">Last 30 Days</option>
                                        <option value="thisMonth">This Month</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="custom">Custom Range</option>
                                    </Select>
                                    
                                    <Select
                                        flex={{ base: 1, md: "none" }}
                                        width={{ base: "100%", md: "120px" }}
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            resetPagination();
                                        }}
                                        bg={bg}
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ borderColor: getColor('primaryBlue') }}
                                        _focus={{ borderColor: getColor('primaryBlue'), boxShadow: "0 0 0 1px #3B82F6" }}
                                    >
                                        <option value="5">5 per page</option>
                                        <option value="10">10 per page</option>
                                        <option value="20">20 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                    </Select>
                                    </HStack>
                                    
                                    <Button
                                        leftIcon={<FiFilter />}
                                        variant="outline"
                                        onClick={onFilterToggle}
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ bg: cardGradientBg }}
                                        width={{ base: "100%", md: "auto" }}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        {isFilterOpen ? 'Hide' : 'Show'} Filters
                                    </Button>
                                </VStack>
                                
                                <Collapse in={isFilterOpen} animateOpacity>
                                    <VStack spacing={4} width="100%" align="stretch">
                                        {/* Tag Filters */}
                                        <Box>
                                            <Text fontSize="sm" color={textSecondary} mb={2} fontWeight="medium">
                                                Filter by Tags:
                                            </Text>
                                            <Wrap spacing={2}>
                                                {availableLabelsData?.availableInboundEmailLabels?.map((label: string) => (
                                                    <WrapItem key={label}>
                                                        <Tag
                                                            size="md"
                                                            cursor="pointer"
                                                            bg={selectedLabels.includes(label) ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.1)"}
                                                            color="#A855F7"
                                                            border="1px solid"
                                                            borderColor={selectedLabels.includes(label) ? "#A855F7" : "rgba(168, 85, 247, 0.3)"}
                                                            onClick={() => {
                                                                if (selectedLabels.includes(label)) {
                                                                    setSelectedLabels(selectedLabels.filter(l => l !== label));
                                                                } else {
                                                                    setSelectedLabels([...selectedLabels, label]);
                                                                }
                                                            }}
                                                            _hover={{ bg: "rgba(168, 85, 247, 0.2)" }}
                                                        >
                                                            <TagLabel>{label}</TagLabel>
                                                            {selectedLabels.includes(label) && (
                                                                <TagCloseButton />
                                                            )}
                                                        </Tag>
                                                    </WrapItem>
                                                ))}
                                                {(!availableLabelsData?.availableInboundEmailLabels || availableLabelsData.availableInboundEmailLabels.length === 0) && (
                                                    <Text fontSize="sm" color={textMuted}>No tags available yet</Text>
                                                )}
                                            </Wrap>
                                        </Box>

                                        {/* Date Range for Custom */}
                                        {dateFilter === 'custom' && (
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
                                                        _hover={{ borderColor: getColor('primaryBlue') }}
                                                        _focus={{ borderColor: getColor('primaryBlue'), boxShadow: "0 0 0 1px #3B82F6" }}
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
                                                _hover={{ borderColor: getColor('primaryBlue') }}
                                                _focus={{ borderColor: getColor('primaryBlue'), boxShadow: "0 0 0 1px #3B82F6" }}
                                            />
                                        </InputGroup>
                                            </HStack>
                                        )}
                                    </VStack>
                                </Collapse>
                                
                                {(searchTerm || dateFilter !== 'all' || selectedLabels.length > 0) && (
                                    <HStack width="100%" justify="space-between">
                                        <Text fontSize="sm" color={textMuted}>
                                            Filtering emails 
                                            {searchTerm && ` containing "${searchTerm}"`} 
                                            {searchTerm && (dateFilter !== 'all' || selectedLabels.length > 0) && ' and '}
                                            {selectedLabels.length > 0 && `tagged with ${selectedLabels.join(', ')}`}
                                            {selectedLabels.length > 0 && dateFilter !== 'all' && ' and '}
                                            {dateFilter !== 'all' && dateFilter !== 'custom' && `from ${dateFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                            {dateFilter === 'custom' && customStartDate && customEndDate && 
                                                `from ${format(new Date(customStartDate), 'MMM dd, yyyy')} to ${format(new Date(customEndDate), 'MMM dd, yyyy')}`}
                                        </Text>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setDateFilter('all');
                                                setCustomStartDate('');
                                                setCustomEndDate('');
                                                setSelectedLabels([]);
                                            }}
                                            color={textMuted}
                                            _hover={{ color: textPrimary }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </HStack>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    <Tabs
                        variant="soft-rounded"
                        colorScheme="blue"
                        index={activeMainTab}
                        onChange={(index) => {
                            setActiveMainTab(index);
                            // Load outbound emails only when "All Emails" tab is selected (index 3)
                            if (index === 3 && !shouldLoadOutbound) {
                                setShouldLoadOutbound(true);
                            }
                        }}
                    >
                        <TabList bg={cardGradientBg} p={{ base: 1, md: 2 }} borderRadius="lg" border="1px solid" borderColor={cardBorder} overflowX="auto" whiteSpace="nowrap">
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 3 }}>
                                <HStack spacing={1}>
                                    <Text>{selectedEmailAddress ? selectedEmailAddress.split('@')[0] : 'Inbox'}</Text>
                                    {(() => {
                                        // Only show badge when data is loaded
                                        if (!emailAddressesData?.myAccessibleEmailAddresses && !unreadCount) {
                                            return null; // Don't show anything while loading
                                        }

                                        // Get unread count for selected email or total if no email selected
                                        const unreadCountToShow = selectedEmailAddress
                                            ? emailAddressesData?.myAccessibleEmailAddresses?.find((e: any) => e.email === selectedEmailAddress)?.unreadCount
                                            : unreadCount?.unreadInboundEmailCount;

                                        return unreadCountToShow && unreadCountToShow > 0 ? (
                                            <Badge colorScheme="red" borderRadius="full" size="sm">
                                                {unreadCountToShow}
                                            </Badge>
                                        ) : null;
                                    })()}
                                </HStack>
                            </Tab>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 3 }}>Sent</Tab>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 3 }}>Drafts</Tab>
                            <Tooltip 
                                label="Completed emails - Move back to Inbox if tasks are incomplete" 
                                placement="top"
                                bg={getColor('darkCardBg')}
                                color="white"
                                fontSize="sm"
                                px={4}
                                py={2}
                                borderRadius="md"
                                hasArrow
                                border="1px solid"
                                borderColor={getColor('primaryBlue')}
                            >
                                <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 3 }}>
                                    <HStack spacing={1}>
                                        <Icon as={FiArchive} boxSize={{ base: 3, md: 4 }} />
                                        <Text>Archived</Text>
                                    </HStack>
                                </Tab>
                            </Tooltip>
                            <Tab color={textMuted} _selected={{ bg: getColor('primaryBlue'), color: "white" }} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 3 }}>All</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Inbox Panel - First */}
                            <TabPanel px={0}>
                                {loadingInbound ? (
                                    <Center py={10}>
                                        <Spinner size="xl" color={getColor('primaryBlue')} />
                                    </Center>
                                ) : (
                                    <>
                                        {(() => {
                                            // Use server-side paginated data when email address is selected
                                            const emailData = selectedEmailAddress
                                                ? (inboundEmailsData?.emailInboxPaginated?.emails || [])
                                                : (inboundEmailsData?.inboundEmails || []);
                                            const totalCount = selectedEmailAddress
                                                ? (inboundEmailsData?.emailInboxPaginated?.totalCount || 0)
                                                : emailData.length;
                                            const totalPages = selectedEmailAddress
                                                ? (inboundEmailsData?.emailInboxPaginated?.totalPages || 1)
                                                : Math.ceil(totalCount / itemsPerPage);

                                            // Apply client-side filtering to displayed emails
                                            const filtered = filterEmails(emailData);

                                            if (filtered.length > 0) {
                                                return (
                                                    <>
                                                        {/* Mass action buttons */}
                                                        <HStack spacing={3} mb={4} p={4} bg={cardGradientBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                                                            {selectedEmailIds.size > 0 ? (
                                                                <>
                                                                    <Text fontSize="sm" fontWeight="bold" color={textPrimary}>
                                                                        {selectedEmailIds.size} email{selectedEmailIds.size > 1 ? 's' : ''} selected
                                                                    </Text>
                                                                    <ButtonGroup size="sm">
                                                                        <Button
                                                                            onClick={handleUnselectAll}
                                                                            variant="outline"
                                                                            borderColor={cardBorder}
                                                                        >
                                                                            Unselect All
                                                                        </Button>
                                                                        <Button
                                                                            leftIcon={<FiArchive />}
                                                                            onClick={handleMassArchive}
                                                                            colorScheme="blue"
                                                                            bg={getColor('primaryBlue')}
                                                                            _hover={{ bg: getColor('primaryBlueHover') }}
                                                                        >
                                                                            Archive Selected
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => handleSelectAll(filtered)}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    borderColor={cardBorder}
                                                                    leftIcon={<Checkbox size="sm" />}
                                                                >
                                                                    Select All ({filtered.length})
                                                                </Button>
                                                            )}
                                                        </HStack>

                                                        <VStack spacing={4} align="stretch">
                                                            {filtered.map((email: any) => (
                                                                <InboundEmailCard
                                                                    key={email.id}
                                                                    email={email}
                                                                    onManageTags={handleManageTags}
                                                                    onArchive={(id) => handleArchiveEmail(id, false)}
                                                                    isSelected={selectedEmailIds.has(email.id)}
                                                                    onSelectChange={handleEmailSelectionChange}
                                                                />
                                                            ))}
                                                        </VStack>

                                                        {/* Pagination Controls */}
                                                        {totalPages > 1 && (
                                                            <HStack justify="space-between" mt={6} p={4} bg={cardGradientBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Showing {((currentPages.inbox - 1) * itemsPerPage) + 1}-{Math.min(currentPages.inbox * itemsPerPage, totalCount)} of {totalCount} emails
                                                                </Text>
                                                                <HStack spacing={2}>
                                                                    <IconButton
                                                                        aria-label="Previous page"
                                                                        icon={<FiChevronLeft />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.inbox === 1}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, inbox: prev.inbox - 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />

                                                                    {/* Page numbers */}
                                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                        const pageNum = Math.max(1, Math.min(currentPages.inbox - 2 + i, totalPages - 4)) + i;
                                                                        if (pageNum > totalPages) return null;
                                                                        return (
                                                                            <Button
                                                                                key={pageNum}
                                                                                size="sm"
                                                                                onClick={() => setCurrentPages(prev => ({ ...prev, inbox: pageNum }))}
                                                                                variant={currentPages.inbox === pageNum ? "solid" : "outline"}
                                                                                bg={currentPages.inbox === pageNum ? getColor('primaryBlue') : "transparent"}
                                                                                color={currentPages.inbox === pageNum ? "white" : textPrimary}
                                                                                borderColor={cardBorder}
                                                                                _hover={{ bg: currentPages.inbox === pageNum ? getColor('primaryBlueHover') : cardGradientBg }}
                                                                            >
                                                                                {pageNum}
                                                                            </Button>
                                                                        );
                                                                    }).filter(Boolean)}
                                                                    
                                                                    <IconButton
                                                                        aria-label="Next page"
                                                                        icon={<FiChevronRight />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.inbox === totalPages}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, inbox: prev.inbox + 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />
                                                                </HStack>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Page {currentPages.inbox} of {totalPages}
                                                                </Text>
                                                            </HStack>
                                                        )}
                                                    </>
                                                );
                                            } else if (filtered.length === 0 && inboundEmails?.inboundEmails?.length > 0) {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiSearch} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No emails match your search criteria.
                                                                    </Text>
                                                                    <Button 
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setDateFilter('all');
                                                                            resetPagination();
                                                                        }}
                                                                        color={getColor('primaryBlue')}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            } else {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiInbox} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        {!loadingEmailAccounts && !hasEmailAccounts
                                                                            ? "No Email Address Assigned"
                                                                            : "No incoming emails found."}
                                                                    </Text>
                                                                    {!loadingEmailAccounts && !hasEmailAccounts && (
                                                                        <Text color={textMuted} fontSize="sm" textAlign="center" maxW="md">
                                                                            Please contact your system administrator to have an email address assigned before you can receive emails.
                                                                        </Text>
                                                                    )}
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            }
                                        })()}
                                    </>
                                )}
                            </TabPanel>

                            {/* Sent Panel - Second */}
                            <TabPanel px={0}>
                                {loadingSent ? (
                                    <Center py={10}>
                                        <Spinner size="xl" color={getColor('primaryBlue')} />
                                    </Center>
                                ) : (
                                    <>
                                        {(() => {
                                            const filtered = filterEmails(sentEmails?.emailsSent || []);
                                            if (filtered.length > 0) {
                                                return (
                                                    <VStack spacing={4} align="stretch">
                                                        {filtered.map((email: any) => (
                                                            <UnifiedEmailCard
                                                                key={email.id}
                                                                email={email}
                                                                isInbound={false}
                                                                isSelected={selectedEmailId === email.id}
                                                                onSelect={setSelectedEmailId}
                                                            />
                                                        ))}
                                                    </VStack>
                                                );
                                            } else if (sentEmails?.emailsSent?.length > 0) {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiSearch} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No emails match your search criteria.
                                                                    </Text>
                                                                    <Button 
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setDateFilter('all');
                                                                        }}
                                                                        color={getColor('primaryBlue')}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })() || (
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
                                    </>
                                )}
                            </TabPanel>

                            {/* Drafts Panel - Third */}
                            <TabPanel px={0}>
                                {loadingDrafts ? (
                                    <Center py={10}>
                                        <Spinner size="xl" color={getColor('primaryBlue')} />
                                    </Center>
                                ) : (
                                    <>
                                        {(() => {
                                            const filtered = filterEmails(draftEmails?.emailsDraft || []);
                                            if (filtered.length > 0) {
                                                return (
                                                    <VStack spacing={4} align="stretch">
                                                        {filtered.map((email: any) => (
                                                            <UnifiedEmailCard
                                                                key={email.id}
                                                                email={email}
                                                                isInbound={false}
                                                                isSelected={selectedEmailId === email.id}
                                                                onSelect={setSelectedEmailId}
                                                            />
                                                        ))}
                                                    </VStack>
                                                );
                                            } else if (draftEmails?.emailsDraft?.length > 0) {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiSearch} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No emails match your search criteria.
                                                                    </Text>
                                                                    <Button 
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setDateFilter('all');
                                                                        }}
                                                                        color={getColor('primaryBlue')}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })() || (
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
                                    </>
                                )}
                            </TabPanel>

                            {/* Archived Panel - Fourth */}
                            <TabPanel px={0}>
                                {loadingArchived ? (
                                    <Center py={10}>
                                        <Spinner size="xl" color={getColor('primaryBlue')} />
                                    </Center>
                                ) : (
                                    <>
                                        {(() => {
                                            const filtered = filterEmails(archivedEmails?.inboundEmails || []);
                                            const paginated = paginateEmails(filtered, currentPages.archived);
                                            
                                            if (paginated.paginatedEmails.length > 0) {
                                                return (
                                                    <>
                                                        {/* Mass action buttons for archived emails */}
                                                        <HStack spacing={3} mb={4} p={4} bg={cardGradientBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                                                            {selectedEmailIds.size > 0 ? (
                                                                <>
                                                                    <Text fontSize="sm" fontWeight="bold" color={textPrimary}>
                                                                        {selectedEmailIds.size} email{selectedEmailIds.size > 1 ? 's' : ''} selected
                                                                    </Text>
                                                                    <ButtonGroup size="sm">
                                                                        <Button
                                                                            onClick={handleUnselectAll}
                                                                            variant="outline"
                                                                            borderColor={cardBorder}
                                                                        >
                                                                            Unselect All
                                                                        </Button>
                                                                        <Button
                                                                            leftIcon={<FiInbox />}
                                                                            onClick={handleMassUnarchive}
                                                                            colorScheme="green"
                                                                            bg="green.500"
                                                                            _hover={{ bg: "green.600" }}
                                                                        >
                                                                            Unarchive Selected
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => handleSelectAll(paginated.paginatedEmails)}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    borderColor={cardBorder}
                                                                    leftIcon={<Checkbox size="sm" />}
                                                                >
                                                                    Select All ({paginated.paginatedEmails.length})
                                                                </Button>
                                                            )}
                                                        </HStack>

                                                        <VStack spacing={4} align="stretch">
                                                            {paginated.paginatedEmails.map((email: any) => (
                                                                <InboundEmailCard
                                                                    key={email.id}
                                                                    email={email}
                                                                    onManageTags={handleManageTags}
                                                                    onArchive={(id) => handleArchiveEmail(id, true)}
                                                                    isSelected={selectedEmailIds.has(email.id)}
                                                                    onSelectChange={handleEmailSelectionChange}
                                                                />
                                                            ))}
                                                        </VStack>
                                                        
                                                        {/* Pagination Controls */}
                                                        {paginated.totalPages > 1 && (
                                                            <HStack justify="space-between" mt={6} p={4} bg={cardGradientBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Showing {((currentPages.archived - 1) * itemsPerPage) + 1}-{Math.min(currentPages.archived * itemsPerPage, paginated.totalCount)} of {paginated.totalCount} emails
                                                                </Text>
                                                                <HStack spacing={2}>
                                                                    <IconButton
                                                                        aria-label="Previous page"
                                                                        icon={<FiChevronLeft />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.archived === 1}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, archived: prev.archived - 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />
                                                                    
                                                                    {/* Page numbers */}
                                                                    {Array.from({ length: Math.min(5, paginated.totalPages) }, (_, i) => {
                                                                        const pageNum = Math.max(1, Math.min(currentPages.archived - 2 + i, paginated.totalPages - 4)) + i;
                                                                        if (pageNum > paginated.totalPages) return null;
                                                                        return (
                                                                            <Button
                                                                                key={pageNum}
                                                                                size="sm"
                                                                                onClick={() => setCurrentPages(prev => ({ ...prev, archived: pageNum }))}
                                                                                variant={currentPages.archived === pageNum ? "solid" : "outline"}
                                                                                bg={currentPages.archived === pageNum ? getColor('primaryBlue') : "transparent"}
                                                                                color={currentPages.archived === pageNum ? "white" : textPrimary}
                                                                                borderColor={cardBorder}
                                                                                _hover={{ bg: currentPages.archived === pageNum ? getColor('primaryBlueHover') : cardGradientBg }}
                                                                            >
                                                                                {pageNum}
                                                                            </Button>
                                                                        );
                                                                    }).filter(Boolean)}
                                                                    
                                                                    <IconButton
                                                                        aria-label="Next page"
                                                                        icon={<FiChevronRight />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.archived === paginated.totalPages}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, archived: prev.archived + 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />
                                                                </HStack>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Page {currentPages.archived} of {paginated.totalPages}
                                                                </Text>
                                                            </HStack>
                                                        )}
                                                    </>
                                                );
                                            } else if (filtered.length === 0 && archivedEmails?.inboundEmails?.length > 0) {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiSearch} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No archived emails match your search criteria.
                                                                    </Text>
                                                                    <Button 
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setDateFilter('all');
                                                                            resetPagination();
                                                                        }}
                                                                        color={getColor('primaryBlue')}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            } else {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiArchive} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No archived emails yet.
                                                                    </Text>
                                                                    <Text color={textMuted} fontSize="sm">
                                                                        Archived emails will appear here after you archive them from your inbox.
                                                                    </Text>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            }
                                        })()}
                                    </>
                                )}
                            </TabPanel>

                            {/* All Emails Panel - Fifth */}
                            <TabPanel px={0}>
                                {loadingAll ? (
                                    <Center py={10}>
                                        <Spinner size="xl" color={getColor('primaryBlue')} />
                                    </Center>
                                ) : (
                                    <>
                                        {(() => {
                                            const combined = [
                                                ...(allEmails?.emails || []).map((e: any) => ({ ...e, isInbound: false })),
                                                ...(allEmails?.inboundEmails || []).map((e: any) => ({ ...e, isInbound: true }))
                                            ];
                                            const filtered = filterEmails(combined);

                                            if (filtered.length > 0) {
                                                const sorted = filtered.sort((a, b) => {
                                                    const dateA = new Date(a.isInbound ? a.date : (a.sentAt || a.createdAt));
                                                    const dateB = new Date(b.isInbound ? b.date : (b.sentAt || b.createdAt));
                                                    return dateB.getTime() - dateA.getTime();
                                                });

                                                // Apply pagination
                                                const paginated = paginateEmails(sorted, currentPages.all);

                                                return (
                                                    <>
                                                        <VStack spacing={4} align="stretch">
                                                            {paginated.paginatedEmails.map((email: any) => (
                                                                <UnifiedEmailCard
                                                                    key={`${email.isInbound ? 'inbound' : 'outbound'}-${email.id}`}
                                                                    email={email}
                                                                    isInbound={email.isInbound}
                                                                    isSelected={selectedEmailId === email.id}
                                                                    onSelect={setSelectedEmailId}
                                                                />
                                                            ))}
                                                        </VStack>

                                                        {/* Pagination Controls */}
                                                        {paginated.totalPages > 1 && (
                                                            <HStack justify="space-between" mt={6} p={4} bg={cardGradientBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Showing {((currentPages.all - 1) * itemsPerPage) + 1}-{Math.min(currentPages.all * itemsPerPage, paginated.totalCount)} of {paginated.totalCount} emails
                                                                </Text>
                                                                <HStack spacing={2}>
                                                                    <IconButton
                                                                        aria-label="Previous page"
                                                                        icon={<FiChevronLeft />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.all === 1}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, all: prev.all - 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />

                                                                    {/* Page numbers */}
                                                                    {Array.from({ length: Math.min(5, paginated.totalPages) }, (_, i) => {
                                                                        const pageNum = Math.max(1, Math.min(currentPages.all - 2 + i, paginated.totalPages - 4)) + i;
                                                                        if (pageNum > paginated.totalPages) return null;
                                                                        return (
                                                                            <Button
                                                                                key={pageNum}
                                                                                size="sm"
                                                                                onClick={() => setCurrentPages(prev => ({ ...prev, all: pageNum }))}
                                                                                variant={currentPages.all === pageNum ? "solid" : "outline"}
                                                                                bg={currentPages.all === pageNum ? getColor('primaryBlue') : "transparent"}
                                                                                color={currentPages.all === pageNum ? "white" : textPrimary}
                                                                                borderColor={cardBorder}
                                                                                _hover={{ bg: currentPages.all === pageNum ? getColor('primaryBlueHover') : cardGradientBg }}
                                                                            >
                                                                                {pageNum}
                                                                            </Button>
                                                                        );
                                                                    })}

                                                                    <IconButton
                                                                        aria-label="Next page"
                                                                        icon={<FiChevronRight />}
                                                                        size="sm"
                                                                        isDisabled={currentPages.all === paginated.totalPages}
                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, all: prev.all + 1 }))}
                                                                        variant="outline"
                                                                        borderColor={cardBorder}
                                                                        color={textPrimary}
                                                                        _hover={{ bg: cardGradientBg }}
                                                                    />
                                                                </HStack>
                                                                <Text fontSize="sm" color={textMuted}>
                                                                    Page {currentPages.all} of {paginated.totalPages}
                                                                </Text>
                                                            </HStack>
                                                        )}
                                                    </>
                                                );
                                            } else if (combined.length > 0) {
                                                return (
                                                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                        <CardBody>
                                                            <Center py={10}>
                                                                <VStack spacing={4}>
                                                                    <Icon as={FiSearch} boxSize={12} color={textMuted} />
                                                                    <Text color={textMuted} fontSize="lg">
                                                                        No emails match your search criteria.
                                                                    </Text>
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setDateFilter('all');
                                                                        }}
                                                                        color={getColor('primaryBlue')}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                </VStack>
                                                            </Center>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })() || (
                                            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                                                <CardBody>
                                                    <Center py={10}>
                                                        <VStack spacing={4}>
                                                            <Icon as={FiMail} boxSize={12} color={textMuted} />
                                                            <Text color={textMuted} fontSize="lg">
                                                                No emails found. Create your first email to get started.
                                                            </Text>
                                                            <Button
                                                                colorScheme="blue"
                                                                onClick={() => navigate('/emails/new')}
                                                                bg={getColor('primaryBlue')}
                                                                _hover={{ bg: getColor('primaryBlueHover') }}
                                                            >
                                                                Compose Your First Email
                                                            </Button>
                                                        </VStack>
                                                    </Center>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>

            <FooterWithFourColumns />

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold' color={textPrimary}>
                            Delete Email
                        </AlertDialogHeader>

                        <AlertDialogBody color={textSecondary}>
                            Are you sure you want to delete this email? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose} variant="ghost">
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Modal isOpen={isLabelPopoverOpen} onClose={onLabelPopoverClose} size="md">
                <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
                <ModalContent bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <ModalHeader color={textPrimary}>
                        Manage Tags for Email
                    </ModalHeader>
                    <ModalCloseButton color={textMuted} />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            {currentEmailForLabeling && (
                                <>
                                    <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                        <strong>Subject:</strong> {currentEmailForLabeling.subject}
                                    </Text>
                                    
                                    {currentEmailForLabeling.labels && currentEmailForLabeling.labels.length > 0 && (
                                        <Box>
                                            <Text fontSize="sm" color={textMuted} mb={2}>Current tags:</Text>
                                            <Wrap spacing={2}>
                                                {currentEmailForLabeling.labels.map((label: string) => (
                                                    <WrapItem key={label}>
                                                        <Tag
                                                            size="md"
                                                            bg="rgba(168, 85, 247, 0.2)"
                                                            color="#A855F7"
                                                            border="1px solid"
                                                            borderColor="rgba(168, 85, 247, 0.3)"
                                                        >
                                                            <TagLabel>{label}</TagLabel>
                                                            <TagCloseButton 
                                                                onClick={() => handleRemoveLabel(label)}
                                                            />
                                                        </Tag>
                                                    </WrapItem>
                                                ))}
                                            </Wrap>
                                        </Box>
                                    )}
                                    
                                    <Box>
                                        <Text fontSize="sm" color={textMuted} mb={2}>Add new tag:</Text>
                                        <HStack>
                                            <Input
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                placeholder="Enter tag name"
                                                size="sm"
                                                bg={bg}
                                                color={textPrimary}
                                                borderColor={cardBorder}
                                                _placeholder={{ color: textMuted }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddLabel();
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleAddLabel}
                                                bg={getColor('primaryBlue')}
                                                color="white"
                                                _hover={{ bg: getColor('primaryBlueHover') }}
                                                isDisabled={!newLabel.trim()}
                                            >
                                                Add
                                            </Button>
                                        </HStack>
                                    </Box>
                                    
                                    {availableLabelsData?.availableInboundEmailLabels && availableLabelsData.availableInboundEmailLabels.length > 0 && (
                                        <Box>
                                            <Text fontSize="sm" color={textMuted} mb={2}>Quick add from existing tags:</Text>
                                            <Wrap spacing={2}>
                                                {availableLabelsData.availableInboundEmailLabels
                                                    .filter((label: string) => 
                                                        !currentEmailForLabeling.labels?.includes(label)
                                                    )
                                                    .map((label: string) => (
                                                        <WrapItem key={label}>
                                                            <Tag
                                                                size="sm"
                                                                cursor="pointer"
                                                                bg={cardBorder}
                                                                color={textSecondary}
                                                                _hover={{ 
                                                                    bg: "rgba(168, 85, 247, 0.2)",
                                                                    color: "#A855F7"
                                                                }}
                                                                onClick={() => {
                                                                    setNewLabel(label);
                                                                    handleAddLabel();
                                                                }}
                                                            >
                                                                <TagLabel>{label}</TagLabel>
                                                            </Tag>
                                                        </WrapItem>
                                                    ))}
                                            </Wrap>
                                        </Box>
                                    )}
                                </>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onLabelPopoverClose} color={textMuted}>
                            Done
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default EmailsList;