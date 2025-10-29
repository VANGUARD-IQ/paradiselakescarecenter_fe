import React, { useState } from 'react';
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    HStack,
    Select,
    useToast,
    Text,
    Badge,
    Spinner,
    FormHelperText,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Card,
    CardBody,
    Center,
    InputGroup,
    InputRightElement,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Checkbox,
    CheckboxGroup,
    List,
    ListItem
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { FiSend, FiSave, FiArrowLeft, FiCopy, FiFile, FiDownload, FiUsers, FiSearch, FiPackage } from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import EmailComposer from "./components/EmailComposer";
import { format } from 'date-fns';
import { ConvertToProjectModal } from './components/ConvertToProjectModal';

const EMAIL_QUERY = gql`
    query GetEmail($id: ID!) {
        email(id: $id) {
            id
            subject
            bodyMarkdown
            bodyHtml
            from
            to
            cc
            bcc
            replyTo
            status
            createdAt
            sentAt
            opens
            clicks
            messageId
            errorMessage
            attachments {
                name
                contentType
                contentLength
                content
            }
        }
    }
`;

const UPDATE_EMAIL_MUTATION = gql`
    mutation UpdateEmail($id: ID!, $input: EmailUpdateInput!) {
        updateEmail(id: $id, input: $input) {
            id
            subject
            status
        }
    }
`;

const SEND_EMAIL_MUTATION = gql`
    mutation SendEmail($id: ID!) {
        sendEmail(id: $id) {
            id
            status
            sentAt
        }
    }
`;

const DUPLICATE_EMAIL_MUTATION = gql`
    mutation DuplicateEmail($id: ID!) {
        duplicateEmail(id: $id) {
            id
        }
    }
`;

const EMAIL_SENDERS_QUERY = gql`
    query GetEmailSenders {
        emailSenders
    }
`;

const ADDRESS_BOOK_QUERY = gql`
    query GetEmailAddresses($search: String) {
        emailAddresses(search: $search) {
            id
            email
            name
            type
            emailsSent
            emailsReceived
        }
    }
`;

const EmailView: React.FC = () => {
    usePageTitle("Email View");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    
    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");
    const previewBg = bg; // Use main background for better contrast
    const inputBg = bg; // Consistent input background

    const [isEditing, setIsEditing] = useState(false);
    const [subject, setSubject] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [bodyMarkdown, setBodyMarkdown] = useState('');
    
    // Address book states
    const [searchTerm, setSearchTerm] = useState('');
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [currentField, setCurrentField] = useState<'to' | 'cc' | 'bcc'>('to');
    const { isOpen: isAddressBookOpen, onOpen: onAddressBookOpen, onClose: onAddressBookClose } = useDisclosure();
    const { isOpen: isConvertModalOpen, onOpen: onConvertModalOpen, onClose: onConvertModalClose } = useDisclosure();

    const { data, loading, refetch } = useQuery(EMAIL_QUERY, {
        variables: { id },
        onCompleted: (data) => {
            if (data?.email) {
                setSubject(data.email.subject);
                setFrom(data.email.from);
                setTo(data.email.to);
                setCc(data.email.cc || '');
                setBcc(data.email.bcc || '');
                setReplyTo(data.email.replyTo || '');
                setBodyMarkdown(data.email.bodyMarkdown);
                // Debug attachments
                console.log('Email attachments:', data.email.attachments);
            }
        }
    });

    const { data: sendersData } = useQuery(EMAIL_SENDERS_QUERY);
    
    // Query for autocomplete suggestions
    const { data: addressBookData } = useQuery(ADDRESS_BOOK_QUERY, {
        variables: { search: searchTerm },
        skip: !searchTerm || searchTerm.length < 2
    });
    
    // Query for modal - fetches all addresses or filtered by modal search
    const { data: allAddressesData } = useQuery(ADDRESS_BOOK_QUERY, {
        variables: { search: modalSearchTerm || undefined },
        skip: !isAddressBookOpen
    });

    // Address book handlers
    const handleToChange = (value: string) => {
        setTo(value);
        setSearchTerm(value);
        setShowSuggestions(value.length >= 2);
    };

    const selectEmail = (email: string) => {
        setTo(email);
        setShowSuggestions(false);
        setSearchTerm('');
    };

    const openAddressBookFor = (field: 'to' | 'cc' | 'bcc') => {
        setCurrentField(field);
        onAddressBookOpen();
    };

    const handleAddressBookSelect = () => {
        if (selectedEmails.length > 0) {
            const emailsString = selectedEmails.join(', ');
            if (currentField === 'to') {
                setTo(emailsString);
            } else if (currentField === 'cc') {
                setCc(emailsString);
            } else if (currentField === 'bcc') {
                setBcc(emailsString);
            }
            setSelectedEmails([]);
            setModalSearchTerm('');
            onAddressBookClose();
        }
    };
    
    const handleAddressBookClose = () => {
        setModalSearchTerm('');
        setSelectedEmails([]);
        onAddressBookClose();
    };

    const [updateEmail] = useMutation(UPDATE_EMAIL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Email updated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsEditing(false);
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Error updating email',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    const [sendEmail] = useMutation(SEND_EMAIL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Email sent successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Error sending email',
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

    const handleSave = async () => {
        await updateEmail({
            variables: {
                id,
                input: {
                    subject,
                    from,
                    to,
                    cc: cc || undefined,
                    bcc: bcc || undefined,
                    replyTo: replyTo || undefined,
                    bodyMarkdown
                }
            }
        });
    };

    const handleSend = async () => {
        await sendEmail({
            variables: { id }
        });
    };

    const handleDuplicate = async () => {
        await duplicateEmail({
            variables: { id }
        });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDownloadAttachment = (attachment: any) => {
        // Create a blob from the base64 content
        const byteCharacters = atob(attachment.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.contentType });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <Spinner size="xl" color={getColor("primaryBlue")} />
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const email = data?.email;
    const isDraft = email?.status === 'DRAFT';
    const isSent = email?.status === 'SENT';

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: 'gray',
            SENT: 'green',
            FAILED: 'red',
            SCHEDULED: 'blue'
        };
        return colors[status] || 'gray';
    };

    return (
        <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <HStack>
                        <Button
                            leftIcon={<FiArrowLeft />}
                            variant="outline"
                            borderColor={cardBorder}
                            color={textPrimary}
                            _hover={{ bg: cardGradientBg }}
                            onClick={() => navigate('/emails')}
                        >
                            Back to Emails
                        </Button>
                        <Button 
                            leftIcon={<FiPackage />}
                            size="lg"
                            variant="solid"
                            bg="green.500"
                            color="white"
                            _hover={{ bg: "green.600", transform: "scale(1.05)" }}
                            _active={{ bg: "green.700" }}
                            onClick={onConvertModalOpen}
                            px={8}
                            fontSize="lg"
                            fontWeight="bold"
                            boxShadow="lg"
                        >
                            Convert to Project
                        </Button>
                        <Heading size="lg" color={textPrimary}>
                            {isEditing ? 'Edit Email' : 'View Email'}
                        </Heading>
                        <Badge colorScheme={getStatusColor(email?.status)} variant="solid">
                            {email?.status}
                        </Badge>
                    </HStack>
                    <HStack>
                        {isDraft && !isEditing && (
                            <>
                                <Button 
                                    onClick={() => setIsEditing(true)}
                                    variant="outline"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _hover={{ bg: cardGradientBg }}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    leftIcon={<FiSend />} 
                                    bg={getColor('primaryBlue')}
                                    color="white"
                                    _hover={{ bg: getColor('primaryBlueHover') }}
                                    onClick={handleSend}
                                >
                                    Send Now
                                </Button>
                            </>
                        )}
                        {isEditing && (
                            <>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditing(false)}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _hover={{ bg: cardGradientBg }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    leftIcon={<FiSave />} 
                                    bg={getColor('primaryBlue')}
                                    color="white"
                                    _hover={{ bg: getColor('primaryBlueHover') }}
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </>
                        )}
                        {!isEditing && (
                            <>
                                <Button 
                                    leftIcon={<FiCopy />} 
                                    variant="outline" 
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _hover={{ bg: cardGradientBg }}
                                    onClick={handleDuplicate}
                                >
                                    Duplicate
                                </Button>
                                {isSent && (
                                    <Button 
                                        leftIcon={<FiSend />} 
                                        variant="outline" 
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ bg: cardGradientBg }}
                                        onClick={() => {
                                            // Format the original email for quoting
                                            const sentDate = email.sentAt ? format(new Date(email.sentAt), 'PPpp') : 'Unknown date';
                                            const originalBody = email.bodyMarkdown || email.bodyHtml?.replace(/<[^>]*>/g, '') || '';
                                            const quotedBody = `\n\n---\n\nOn ${sentDate}, ${email.from} wrote:\n\n${originalBody.split('\n').map((line: string) => `> ${line}`).join('\n')}`;
                                            
                                            // Extract just email address from "Name <email>" format
                                            const fromEmailMatch = email.from.match(/<(.+?)>/) || email.from.match(/([^\s]+@[^\s]+)/);
                                            const replyToEmail = fromEmailMatch ? fromEmailMatch[1] : email.from;
                                            
                                            // Create a new draft with same recipients and quoted content
                                            navigate('/emails/new', {
                                                state: {
                                                    to: email.to,
                                                    cc: email.cc,
                                                    subject: `Re: ${email.subject}`,
                                                    replyTo: replyToEmail,
                                                    bodyMarkdown: quotedBody
                                                }
                                            });
                                        }}
                                    >
                                        Reply All
                                    </Button>
                                )}
                            </>
                        )}
                    </HStack>
                </HStack>

                {isSent && (
                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody>
                        <StatGroup>
                            <Stat>
                                <StatLabel color={textMuted}>Sent At</StatLabel>
                                <StatNumber fontSize="md" color={textPrimary}>
                                    {email.sentAt && format(new Date(email.sentAt), 'PPpp')}
                                </StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel color={textMuted}>Opens</StatLabel>
                                <StatNumber color={textPrimary}>{email.opens || 0}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel color={textMuted}>Clicks</StatLabel>
                                <StatNumber color={textPrimary}>{email.clicks || 0}</StatNumber>
                            </Stat>
                            {email.messageId && (
                                <Stat>
                                    <StatLabel color={textMuted}>Message ID</StatLabel>
                                    <StatNumber fontSize="sm" color={textPrimary} wordBreak="break-all">{email.messageId}</StatNumber>
                                </Stat>
                            )}
                        </StatGroup>
                        </CardBody>
                    </Card>
                )}

                {email?.status === 'FAILED' && email?.errorMessage && (
                    <Card bg={cardGradientBg} border="1px solid" borderColor="red.500">
                        <CardBody>
                            <Text color="red.400" fontWeight="bold">Error:</Text>
                            <Text color="red.300">{email.errorMessage}</Text>
                        </CardBody>
                    </Card>
                )}

                <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel color={textMuted}>From</FormLabel>
                            {isEditing ? (
                                <Select
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    bg={inputBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                >
                                    {sendersData?.emailSenders?.map((sender: string) => (
                                        <option key={sender} value={sender} style={{ backgroundColor: '#1a1a1a' }}>
                                            {sender}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <Text color={textPrimary}>{from}</Text>
                            )}
                        </FormControl>

                        <FormControl>
                            <FormLabel color={textMuted}>To</FormLabel>
                            {isEditing ? (
                                <>
                                    <InputGroup>
                                        <Input
                                            type="text"
                                            value={to}
                                            onChange={(e) => handleToChange(e.target.value)}
                                            placeholder="recipient@example.com or multiple emails separated by commas"
                                            bg={inputBg}
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                            onFocus={() => to.length >= 2 && setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label="Open address book"
                                                icon={<FiUsers />}
                                                size="sm"
                                                variant="ghost"
                                                color={textSecondary}
                                                onClick={() => openAddressBookFor('to')}
                                                _hover={{ color: getColor('primaryBlue') }}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    {showSuggestions && addressBookData?.emailAddresses && addressBookData.emailAddresses.length > 0 && (
                                        <Box 
                                            position="absolute" 
                                            zIndex={10} 
                                            w="full" 
                                            mt={1} 
                                            bg={cardGradientBg} 
                                            border="1px solid" 
                                            borderColor={cardBorder}
                                            borderRadius="md"
                                            boxShadow="lg"
                                            maxH="200px"
                                            overflowY="auto"
                                        >
                                            <List p={2}>
                                                {addressBookData.emailAddresses.map((address: any) => (
                                                    <ListItem
                                                        key={address.id}
                                                        p={2}
                                                        cursor="pointer"
                                                        _hover={{ bg: getColor('background.overlay') }}
                                                        borderRadius="md"
                                                        onClick={() => selectEmail(address.email)}
                                                    >
                                                        <HStack justify="space-between">
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" color={textPrimary}>
                                                                    {address.name || address.email}
                                                                </Text>
                                                                {address.name && (
                                                                    <Text fontSize="xs" color={textMuted}>
                                                                        {address.email}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                            <Badge 
                                                                colorScheme={
                                                                    address.type === 'PERSONAL' ? 'blue' :
                                                                    address.type === 'BUSINESS' ? 'green' :
                                                                    'gray'
                                                                }
                                                                size="sm"
                                                            >
                                                                {address.type}
                                                            </Badge>
                                                        </HStack>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Text color={textPrimary}>{to}</Text>
                            )}
                        </FormControl>

                        {(cc || isEditing) && (
                            <FormControl>
                                <FormLabel color={textMuted}>CC</FormLabel>
                                {isEditing ? (
                                    <InputGroup>
                                        <Input
                                            type="text"
                                            value={cc}
                                            onChange={(e) => setCc(e.target.value)}
                                            placeholder="Optional: Add CC recipients"
                                            bg={inputBg}
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label="Open address book for CC"
                                                icon={<FiUsers />}
                                                size="sm"
                                                variant="ghost"
                                                color={textSecondary}
                                                onClick={() => openAddressBookFor('cc')}
                                                _hover={{ color: getColor('primaryBlue') }}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                ) : (
                                    <Text color={textPrimary}>{cc}</Text>
                                )}
                            </FormControl>
                        )}

                        {(bcc || isEditing) && (
                            <FormControl>
                                <FormLabel color={textMuted}>BCC</FormLabel>
                                {isEditing ? (
                                    <InputGroup>
                                        <Input
                                            type="text"
                                            value={bcc}
                                            onChange={(e) => setBcc(e.target.value)}
                                            placeholder="Optional: Add BCC recipients"
                                            bg={inputBg}
                                            borderColor={cardBorder}
                                            color={textPrimary}
                                            _placeholder={{ color: textMuted }}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label="Open address book for BCC"
                                                icon={<FiUsers />}
                                                size="sm"
                                                variant="ghost"
                                                color={textSecondary}
                                                onClick={() => openAddressBookFor('bcc')}
                                                _hover={{ color: getColor('primaryBlue') }}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                ) : (
                                    <Text color={textPrimary}>{bcc}</Text>
                                )}
                            </FormControl>
                        )}

                        {(replyTo || isEditing) && (
                            <FormControl>
                                <FormLabel color={textMuted}>Reply To</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={replyTo}
                                        onChange={(e) => setReplyTo(e.target.value)}
                                        placeholder="Optional: Different reply address"
                                        bg={inputBg}
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                    />
                                ) : (
                                    <Text color={textPrimary}>{replyTo}</Text>
                                )}
                            </FormControl>
                        )}

                        {(email?.attachments && email.attachments.length > 0) && (
                            <FormControl>
                                <FormLabel color={textMuted}>
                                    <HStack>
                                        <Text>Attachments</Text>
                                        <Badge colorScheme="blue">{email.attachments.length}</Badge>
                                    </HStack>
                                </FormLabel>
                                <VStack align="stretch" spacing={2}>
                                    {email.attachments.map((attachment: any, index: number) => (
                                        <HStack
                                            key={index}
                                            p={3}
                                            bg={inputBg}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            justify="space-between"
                                            _hover={{ borderColor: getColor('primaryBlue') }}
                                        >
                                            <HStack flex={1}>
                                                <Box color="green.500">
                                                    <FiFile size="20px" />
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                                                        {attachment.name}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Badge colorScheme="green" fontSize="xs">
                                                            Attached
                                                        </Badge>
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {formatFileSize(attachment.contentLength)}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                            <Button
                                                size="sm"
                                                leftIcon={<FiDownload />}
                                                variant="ghost"
                                                color={getColor('primaryBlue')}
                                                onClick={() => handleDownloadAttachment(attachment)}
                                            >
                                                Download
                                            </Button>
                                        </HStack>
                                    ))}
                                </VStack>
                            </FormControl>
                        )}

                        <Divider />

                        {isEditing ? (
                            <EmailComposer
                                subject={subject}
                                onSubjectChange={setSubject}
                                content={bodyMarkdown}
                                onContentChange={setBodyMarkdown}
                                contentType="html"
                                placeholder="Write your email content..."
                                subjectPlaceholder="Enter email subject"
                                showSubject={true}
                            />
                        ) : (
                            <>
                                <FormControl>
                                    <FormLabel color={textMuted}>Subject</FormLabel>
                                    <Heading size="md" color={textPrimary}>{subject}</Heading>
                                </FormControl>
                                <FormControl>
                                    <FormLabel color={textMuted}>Email Body</FormLabel>
                                    <EmailComposer
                                        subject={subject}
                                        onSubjectChange={() => {}}
                                        content={bodyMarkdown}
                                        onContentChange={() => {}}
                                        contentType="html"
                                        isReadOnly={true}
                                        showSubject={false}
                                    />
                                </FormControl>
                            </>
                        )}
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
        <FooterWithFourColumns />

        {/* Address Book Modal */}
        <Modal isOpen={isAddressBookOpen} onClose={handleAddressBookClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                <ModalHeader color={textPrimary}>
                    Select Recipients for {currentField.toUpperCase()} from Address Book
                </ModalHeader>
                <ModalCloseButton color={textSecondary} />
                <ModalBody pb={6}>
                    <VStack align="stretch" spacing={4}>
                        <InputGroup>
                            <Input
                                placeholder="Search address book..."
                                bg={bg}
                                borderColor={cardBorder}
                                color={textPrimary}
                                _placeholder={{ color: textMuted }}
                                value={modalSearchTerm}
                                onChange={(e) => setModalSearchTerm(e.target.value)}
                            />
                            <InputRightElement>
                                <FiSearch color={textMuted} />
                            </InputRightElement>
                        </InputGroup>
                        
                        <Text fontSize="sm" color={textMuted}>
                            {allAddressesData?.emailAddresses?.length || 0} contacts in address book
                        </Text>
                        
                        <CheckboxGroup value={selectedEmails} onChange={(values) => setSelectedEmails(values as string[])}>
                            <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
                                {allAddressesData?.emailAddresses?.map((address: any) => (
                                    <Box
                                        key={address.id}
                                        p={3}
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        borderRadius="md"
                                        _hover={{ bg: getColor('background.overlay') }}
                                    >
                                        <Checkbox value={address.email} colorScheme="blue">
                                            <HStack spacing={3} ml={2}>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" color={textPrimary}>
                                                        {address.name || address.email}
                                                    </Text>
                                                    {address.name && (
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {address.email}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </HStack>
                                        </Checkbox>
                                    </Box>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                        
                        <HStack justify="space-between">
                            <Text fontSize="sm" color={textMuted}>
                                {selectedEmails.length} recipient(s) selected
                            </Text>
                            <HStack>
                                <Button variant="outline" onClick={handleAddressBookClose} borderColor={cardBorder}>
                                    Cancel
                                </Button>
                                <Button 
                                    colorScheme="blue" 
                                    onClick={handleAddressBookSelect}
                                    isDisabled={selectedEmails.length === 0}
                                >
                                    Add Recipients
                                </Button>
                            </HStack>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>

        {/* Convert to Project Modal */}
        <ConvertToProjectModal 
            isOpen={isConvertModalOpen}
            onClose={onConvertModalClose}
            email={{
                id: id || '',
                subject: subject,
                bodyMarkdown: bodyMarkdown,
                from: from
            }}
        />
    </Box>
    );
};

export default EmailView;