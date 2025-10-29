import React, { useState, useEffect, useRef } from 'react';
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
    FormHelperText,
    Divider,
    Card,
    CardBody,
    CardHeader,
    Stack,
    IconButton,
    Badge,
    InputGroup,
    InputRightElement,
    List,
    ListItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Checkbox,
    CheckboxGroup,
    useColorMode
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { FiSend, FiSave, FiPaperclip, FiX, FiFile, FiUsers, FiSearch, FiDownload, FiUpload } from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import EmailComposer from "./components/EmailComposer";
import { EMAIL_TEMPLATE_CONTENT, downloadMarkdownFile } from './markdownTemplates';
import { marked } from 'marked';

const CREATE_EMAIL_MUTATION = gql`
    mutation CreateEmail($input: EmailComposeInput!) {
        createEmail(input: $input) {
            id
            subject
            status
            attachments {
                name
                contentType
                contentLength
            }
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

const CLIENTS_QUERY = gql`
    query GetClients {
        clients {
            id
            fName
            lName
            email
            businessName
        }
    }
`;

const IMPROVE_EMAIL_MUTATION = gql`
    mutation ImproveOutgoingEmail($emailContent: String!, $subject: String) {
        improveOutgoingEmail(emailContent: $emailContent, subject: $subject)
    }
`;

const NewEmail: React.FC = () => {
    usePageTitle("New Email");
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { colorMode } = useColorMode();
    
    // Consistent styling from brandConfig
    const bg = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const [subject, setSubject] = useState('');
    const [from, setFrom] = useState('');
    const [fromPreset, setFromPreset] = useState<string | null>(null); // Track if from was preset from reply data
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [bodyMarkdown, setBodyMarkdown] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isReply, setIsReply] = useState(false);
    const [attachments, setAttachments] = useState<Array<{
        name: string;
        contentType: string;
        content: string;
        size: number;
    }>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const markdownFileInputRef = useRef<HTMLInputElement>(null);

    // Address book states
    const [searchTerm, setSearchTerm] = useState('');
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [currentField, setCurrentField] = useState<'to' | 'cc' | 'bcc'>('to');
    const [isImproving, setIsImproving] = useState(false);
    const [includeClients, setIncludeClients] = useState(false);
    const { isOpen: isAddressBookOpen, onOpen: onAddressBookOpen, onClose: onAddressBookClose } = useDisclosure();

    const { data: sendersData } = useQuery(EMAIL_SENDERS_QUERY);
    
    // Query for autocomplete suggestions
    const { data: addressBookData } = useQuery(ADDRESS_BOOK_QUERY, {
        variables: { search: searchTerm },
        skip: !searchTerm || searchTerm.length < 2
    });
    
    // Query for client emails
    const { data: clientsData } = useQuery(CLIENTS_QUERY, {
        skip: !searchTerm || searchTerm.length < 2
    });
    
    // Query for modal - fetches all addresses or filtered by modal search
    const { data: allAddressesData } = useQuery(ADDRESS_BOOK_QUERY, {
        variables: { search: modalSearchTerm || undefined },
        skip: !isAddressBookOpen
    });
    
    // Query for all clients in modal
    const { data: allClientsData } = useQuery(CLIENTS_QUERY, {
        skip: !isAddressBookOpen || !includeClients
    });

    useEffect(() => {
        // Check for location state first (for Reply All functionality)
        if (location.state) {
            const state = location.state as any;
            if (state.to) setTo(state.to);
            if (state.cc) setCc(state.cc);
            if (state.subject) setSubject(state.subject);
            if (state.replyTo) {
                // Extract just the email address from "Name <email>" format
                const emailMatch = state.replyTo.match(/<(.+?)>/) || state.replyTo.match(/([^\s]+@[^\s]+)/);
                setReplyTo(emailMatch ? emailMatch[1] : state.replyTo);
            }
            if (state.bodyMarkdown) setBodyMarkdown(state.bodyMarkdown);
            if (state.subject?.startsWith('Re:')) setIsReply(true);
        } else {
            // Parse query parameters for action type
            const searchParams = new URLSearchParams(location.search);
            const action = searchParams.get('action');
            
            if (action === 'forward') {
                // Handle forwarding from sessionStorage
                const forwardDataStr = sessionStorage.getItem('forwardEmail');
                if (forwardDataStr) {
                    const forwardData = JSON.parse(forwardDataStr);
                    setSubject(forwardData.subject);
                    setTo(''); // Leave empty for user to fill
                    
                    // Format date for the forward header
                    const formattedDate = forwardData.date ? new Date(forwardData.date).toLocaleString() : 'Unknown date';
                    
                    // Use HTML body if available with proper formatting
                    let originalContent = '';
                    if (forwardData.htmlBody) {
                        // For HTML content, preserve it in a cleaner format
                        originalContent = `\n\n---------- Forwarded message ----------\nFrom: ${forwardData.fromName}\nDate: ${formattedDate}\nSubject: ${forwardData.originalSubject}\n\n`;
                        // Add the HTML content directly - it will be rendered properly
                        originalContent += forwardData.htmlBody;
                        setBodyMarkdown(originalContent);
                    } else {
                        // For plain text, use the standard format
                        originalContent = forwardData.textBody || '';
                        const forwardedMessage = `\n\n---------- Forwarded message ----------\nFrom: ${forwardData.fromName}\nDate: ${formattedDate}\nSubject: ${forwardData.originalSubject}\n\n${originalContent}`;
                        setBodyMarkdown(forwardedMessage);
                    }
                    
                    // Clear the sessionStorage after use
                    sessionStorage.removeItem('forwardEmail');
                }
            } else if (action === 'reply' || action === 'replyAll') {
                // Handle reply from sessionStorage
                const replyDataStr = sessionStorage.getItem('replyEmail');
                if (replyDataStr) {
                    const replyData = JSON.parse(replyDataStr);
                    setIsReply(true);
                    setTo(replyData.to);
                    if (replyData.cc) setCc(replyData.cc);
                    setSubject(replyData.subject);

                    // Set the 'from' field to the original recipient email if available
                    if (replyData.originalTo) {
                        // Extract just the email address from formats like "Tom Miller <tom@tommillerservices.com>"
                        const emailMatch = replyData.originalTo.match(/<(.+?)>/);
                        if (emailMatch) {
                            setFromPreset(emailMatch[1]);
                        } else if (replyData.originalTo.includes('@')) {
                            setFromPreset(replyData.originalTo);
                        }
                    }

                    // Format date for the quote header
                    const formattedDate = replyData.date ? new Date(replyData.date).toLocaleString() : 'Unknown date';

                    // Create properly formatted quoted reply with HTML preservation
                    let quotedMessage = '';

                    if (replyData.htmlBody) {
                        // For HTML emails, create a properly formatted blockquote
                        quotedMessage = `\n\n<div style="border-left: 2px solid #ccc; margin-left: 0; padding-left: 10px; color: #666;">\n<p style="margin: 0 0 10px 0;"><strong>On ${formattedDate}, ${replyData.fromName} wrote:</strong></p>\n${replyData.htmlBody}\n</div>`;
                    } else if (replyData.textBody) {
                        // For plain text emails, use traditional quote format
                        const originalContent = replyData.textBody;
                        quotedMessage = `\n\n---\n\nOn ${formattedDate}, ${replyData.fromName} wrote:\n\n${originalContent.split('\n').map((line: string) => `> ${line}`).join('\n')}`;
                    } else {
                        // Fallback if neither is available
                        quotedMessage = `\n\n---\n\nOn ${formattedDate}, ${replyData.fromName} wrote:\n\n> [Original message content]`;
                    }

                    setBodyMarkdown(quotedMessage);

                    // Clear the sessionStorage after use
                    sessionStorage.removeItem('replyEmail');
                }
            } else if (searchParams.has('to')) {
                // Handle direct email composition with pre-filled recipient
                const toEmail = searchParams.get('to') || '';
                setTo(toEmail);
                const recipientName = searchParams.get('recipientName') || '';
                // Optionally set a subject with the recipient name
                if (recipientName) {
                    setSubject(`Message for ${recipientName}`);
                }
            } else if (searchParams.has('replyTo')) {
                // Fallback to URL params for backward compatibility
                setIsReply(true);
                
                // Set recipient to the original sender
                const replyToEmail = searchParams.get('replyTo') || '';
                setTo(replyToEmail);
                
                // Set CC recipients for Reply to All
                const replyCcEmail = searchParams.get('replyCc') || '';
                if (replyCcEmail) {
                    setCc(replyCcEmail);
                }
                
                // Set subject with "Re:" prefix
                const replySubject = searchParams.get('replySubject') || '';
                setSubject(replySubject);
                
                // Format the reply body with quoted original message
                const replyFromName = searchParams.get('replyFromName') || replyToEmail;
                const replyDate = searchParams.get('replyDate') || '';
                const replyBody = searchParams.get('replyBody') || '';
                const replyHtmlBody = searchParams.get('replyHtmlBody') || '';
                
                // Use text body if available, otherwise try to extract text from HTML
                const originalContent = replyBody || replyHtmlBody.replace(/<[^>]*>/g, '');
                
                // Format date for the quote header
                const formattedDate = replyDate ? new Date(replyDate).toLocaleString() : 'Unknown date';
                
                // Create quoted reply format
                const quotedMessage = `\n\n---\n\nOn ${formattedDate}, ${replyFromName} wrote:\n\n${originalContent.split('\n').map((line: string) => `> ${line}`).join('\n')}`;
                
                setBodyMarkdown(quotedMessage);
            }
        }
    }, [location.search, location.state]);

    useEffect(() => {
        // Set the from field based on priority:
        // 1. If we have a preset from reply data, use that if it exists in senders list
        // 2. Otherwise use the first available sender
        if (sendersData?.emailSenders?.length > 0) {
            if (fromPreset) {
                // Check if the preset email exists in the senders list
                const matchingSender = sendersData.emailSenders.find((sender: string) => {
                    // Handle both plain email and "Name <email>" format
                    return sender === fromPreset || sender.includes(fromPreset);
                });

                if (matchingSender) {
                    setFrom(matchingSender);
                } else {
                    // Fallback to first sender if preset doesn't match
                    if (!from) {
                        setFrom(sendersData.emailSenders[0]);
                    }
                }
                // Clear the preset after using it
                setFromPreset(null);
            } else if (!from) {
                // No preset and no current from, use first sender
                setFrom(sendersData.emailSenders[0]);
            }
        }
    }, [sendersData, fromPreset, from]);

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
        setIncludeClients(false);
        onAddressBookClose();
    };

    const handleImproveEmail = async () => {
        if (!bodyMarkdown) {
            toast({
                title: 'No content to improve',
                description: 'Please write some email content first',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsImproving(true);
        try {
            const result = await improveEmail({
                variables: {
                    emailContent: bodyMarkdown,
                    subject: subject || undefined
                }
            });

            if (result.data?.improveOutgoingEmail) {
                setBodyMarkdown(result.data.improveOutgoingEmail);
                toast({
                    title: 'Email improved!',
                    description: 'Your email has been enhanced with AI',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error improving email:', error);
            toast({
                title: 'Improvement failed',
                description: 'Could not improve email. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsImproving(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB total limit (Postmark limit)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB per file
        let totalSize = attachments.reduce((acc, att) => acc + att.size, 0);
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check individual file size
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: `File too large: ${file.name}`,
                    description: `Maximum file size is 5MB`,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                continue;
            }

            // Check total size
            if (totalSize + file.size > MAX_TOTAL_SIZE) {
                toast({
                    title: 'Total attachment size exceeded',
                    description: 'Maximum total size is 10MB',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                break;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const base64 = (e.target.result as string).split(',')[1]; // Remove data URL prefix
                    setAttachments(prev => [...prev, {
                        name: file.name,
                        contentType: file.type || 'application/octet-stream',
                        content: base64,
                        size: file.size
                    }]);
                    successCount++;
                    
                    // Show success toast for each file
                    toast({
                        title: `Attachment added`,
                        description: `${file.name} has been attached successfully`,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                    });
                }
            };
            reader.readAsDataURL(file);
            totalSize += file.size;
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDownloadTemplate = () => {
        downloadMarkdownFile(EMAIL_TEMPLATE_CONTENT, 'email-template.md');
        toast({
            title: 'Template downloaded',
            description: 'Edit the file and import it to populate your email',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    const parseEmailMetadata = (markdown: string): {
        to?: string;
        from?: string;
        subject?: string;
        cc?: string;
        bcc?: string;
        replyTo?: string;
        body: string;
    } => {
        const lines = markdown.split('\n');
        const metadata: any = {};
        let bodyStartIndex = 0;
        let inMetadataSection = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check if we're in the Email Metadata section
            if (line === '## Email Metadata') {
                inMetadataSection = true;
                continue;
            }

            // End of metadata section
            if (inMetadataSection && (line === '---' || line.startsWith('## '))) {
                bodyStartIndex = i;
                break;
            }

            // Parse metadata fields
            if (inMetadataSection && line.startsWith('**')) {
                const match = line.match(/\*\*(.+?):\*\*\s*(.*)/);
                if (match) {
                    const key = match[1].toLowerCase().replace('-', '');
                    const value = match[2].trim();
                    if (value) {
                        metadata[key] = value;
                    }
                }
            }
        }

        // Get the body content after metadata
        const bodyLines = lines.slice(bodyStartIndex);
        // Remove the first separator line if it exists
        if (bodyLines[0] && bodyLines[0].trim() === '---') {
            bodyLines.shift();
        }
        // Skip empty lines at the start
        while (bodyLines.length > 0 && !bodyLines[0].trim()) {
            bodyLines.shift();
        }
        // Remove "## Email Body" header if it exists
        if (bodyLines[0] && bodyLines[0].trim() === '## Email Body') {
            bodyLines.shift();
        }

        const body = bodyLines.join('\n').trim();

        return {
            to: metadata.to,
            from: metadata.from,
            subject: metadata.subject,
            cc: metadata.cc,
            bcc: metadata.bcc,
            replyTo: metadata.replyto,
            body
        };
    };

    const handleMarkdownImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            toast({
                title: 'Invalid file type',
                description: 'Please select a markdown file (.md or .markdown)',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const text = await file.text();
            const { to: toEmail, from: fromEmail, subject: emailSubject, cc: ccEmail, bcc: bccEmail, replyTo: replyToEmail, body } = parseEmailMetadata(text);

            // Convert markdown body to HTML
            const htmlBody = await marked(body, {
                gfm: true,
                breaks: true
            });

            // Populate form fields
            if (toEmail) setTo(toEmail);
            if (fromEmail && sendersData?.emailSenders?.includes(fromEmail)) {
                setFrom(fromEmail);
            }
            if (emailSubject) setSubject(emailSubject);
            if (ccEmail) setCc(ccEmail);
            if (bccEmail) setBcc(bccEmail);
            if (replyToEmail) setReplyTo(replyToEmail);
            if (htmlBody) setBodyMarkdown(htmlBody);

            toast({
                title: 'Markdown imported successfully',
                description: 'Email fields have been populated from the markdown file',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error importing markdown:', error);
            toast({
                title: 'Import failed',
                description: 'Could not parse markdown file. Please check the format.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }

        // Reset file input
        if (markdownFileInputRef.current) {
            markdownFileInputRef.current.value = '';
        }
    };

    const [improveEmail] = useMutation(IMPROVE_EMAIL_MUTATION);
    const [createEmail] = useMutation(CREATE_EMAIL_MUTATION, {
        onCompleted: (data) => {
            toast({
                title: 'Email saved as draft',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            if (isSaving) {
                navigate(`/email/${data.createEmail.id}`);
            }
        },
        onError: (error) => {
            toast({
                title: 'Error saving email',
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
            navigate('/emails');
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

    const handleSaveDraft = async () => {
        if (!subject || !to || !bodyMarkdown) {
            toast({
                title: 'Missing required fields',
                description: 'Please fill in subject, to, and body',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }


        setIsSaving(true);
        await createEmail({
            variables: {
                input: {
                    subject,
                    from: from || undefined,
                    to,
                    cc: cc && cc.trim() !== '' ? cc : undefined,
                    bcc: bcc && bcc.trim() !== '' ? bcc : undefined,
                    replyTo: replyTo && replyTo.trim() !== '' ? replyTo : undefined,
                    bodyMarkdown,
                    attachments: attachments.map(att => ({
                        name: att.name,
                        contentType: att.contentType,
                        content: att.content
                    }))
                }
            }
        });
    };

    const handleSendNow = async () => {
        if (!subject || !to || !bodyMarkdown) {
            toast({
                title: 'Missing required fields',
                description: 'Please fill in subject, to, and body',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        console.log('📧 [FRONTEND] Sending email with:');
        console.log('📧 [FRONTEND] - From:', from || 'NOT PROVIDED');
        console.log('📧 [FRONTEND] - To:', to);
        console.log('📧 [FRONTEND] - Subject:', subject);

        setIsSaving(false);
        const result = await createEmail({
            variables: {
                input: {
                    subject,
                    from: from || undefined,
                    to,
                    cc: cc && cc.trim() !== '' ? cc : undefined,
                    bcc: bcc && bcc.trim() !== '' ? bcc : undefined,
                    replyTo: replyTo && replyTo.trim() !== '' ? replyTo : undefined,
                    bodyMarkdown,
                    attachments: attachments.map(att => ({
                        name: att.name,
                        contentType: att.contentType,
                        content: att.content
                    }))
                }
            }
        });

        if (result.data?.createEmail?.id) {
            await sendEmail({
                variables: {
                    id: result.data.createEmail.id
                }
            });
        }
    };

    return (
        <Box minH="100vh" bg={bg} overflowX="hidden">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
            
            <Container maxW={{ base: "100%", md: "container.md", lg: "container.xl" }} py={{ base: 4, md: 8 }} px={{ base: 3, md: 8 }}>
                <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                    <Stack direction={{ base: "column", lg: "row" }} justify="space-between" spacing={{ base: 4, lg: 0 }}>
                        <VStack align="start" spacing={1}>
                            <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color={textPrimary}>
                                {isReply ? 'Reply to Email' : 'Compose Email'}
                            </Heading>
                            <Text color={textMuted} fontSize={{ base: "sm", md: "md" }}>
                                {isReply ? 'Compose your reply with quoted message' : 'Create and send branded emails with markdown support'}
                            </Text>
                        </VStack>
                        <Stack direction={{ base: "column", sm: "row" }} spacing={{ base: 2, sm: 3 }} width={{ base: "100%", lg: "auto" }}>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/emails')}
                                borderColor={cardBorder}
                                color={textSecondary}
                                size={{ base: "sm", md: "md" }}
                                width={{ base: "100%", sm: "auto" }}
                            >
                                Cancel
                            </Button>
                            {sendersData?.emailSenders?.length > 0 && (
                                <>
                                    <Button
                                        leftIcon={<FiSave />}
                                        onClick={handleSaveDraft}
                                        variant="outline"
                                        borderColor={getColor('primaryBlue')}
                                        color={getColor('primaryBlue')}
                                        _hover={{ bg: getColor('components.button.secondaryBg') }}
                                        size={{ base: "sm", md: "md" }}
                                        width={{ base: "100%", sm: "auto" }}
                                    >
                                        Save Draft
                                    </Button>
                                    <Button
                                        leftIcon={<FiSend />}
                                        colorScheme="blue"
                                        onClick={handleSendNow}
                                        bg={getColor('primaryBlue')}
                                        _hover={{ bg: getColor('primaryBlueHover') }}
                                        size={{ base: "sm", md: "md" }}
                                        width={{ base: "100%", sm: "auto" }}
                                    >
                                        Send Now
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>

                    <Card 
                        bg={cardGradientBg} 
                        border="1px solid" 
                        borderColor={cardBorder}
                        borderRadius="xl"
                        overflow="hidden"
                    >
                        <CardHeader p={{ base: 4, md: 6 }}>
                            <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>
                                Email Details
                            </Heading>
                        </CardHeader>
                        <CardBody p={{ base: 4, md: 6 }}>
                            {sendersData?.emailSenders?.length === 0 ? (
                                <Box
                                    p={8}
                                    textAlign="center"
                                    bg="red.900"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="red.600"
                                >
                                    <Text fontSize="lg" color="red.200" mb={2}>
                                        ⚠️ No Email Address Assigned
                                    </Text>
                                    <Text color="red.300" mb={4}>
                                        You don't have any email addresses assigned to your account.
                                    </Text>
                                    <Text color="red.400" fontSize="sm">
                                        Please contact your system administrator to have an email address assigned to you before you can send emails.
                                    </Text>
                                    <Button
                                        mt={6}
                                        onClick={() => navigate('/emails')}
                                        variant="outline"
                                        borderColor="red.400"
                                        color="red.400"
                                        _hover={{ bg: "red.900" }}
                                    >
                                        Back to Inbox
                                    </Button>
                                </Box>
                            ) : (
                                <Stack spacing={{ base: 4, md: 6 }}>
                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>From</FormLabel>
                                    <Select
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                        placeholder="Select sender"
                                        bg={bg}
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                    >
                                        {sendersData?.emailSenders?.map((sender: string) => (
                                            <option key={sender} value={sender}>
                                                {sender}
                                            </option>
                                        ))}
                                    </Select>
                                    <FormHelperText color={textMuted}>
                                        Select the sender email address
                                    </FormHelperText>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>To</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type="email"
                                            value={to}
                                            onChange={(e) => handleToChange(e.target.value)}
                                            placeholder="recipient@example.com or multiple emails separated by commas"
                                            bg={bg}
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
                                    {showSuggestions && ((addressBookData?.emailAddresses && addressBookData.emailAddresses.length > 0) || 
                                                        (clientsData?.clients && clientsData.clients.length > 0)) && (
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
                                            maxH="300px"
                                            overflowY="auto"
                                        >
                                            <List p={2}>
                                                {/* Email Addresses Section */}
                                                {addressBookData?.emailAddresses && addressBookData.emailAddresses.length > 0 && (
                                                    <>
                                                        <Text fontSize="xs" color={textMuted} px={2} py={1} fontWeight="bold">
                                                            EMAIL ADDRESSES
                                                        </Text>
                                                        {addressBookData.emailAddresses.map((address: any) => (
                                                            <ListItem
                                                                key={`addr-${address.id}`}
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
                                                    </>
                                                )}
                                                
                                                {/* Clients Section */}
                                                {clientsData?.clients && clientsData.clients.length > 0 && (
                                                    <>
                                                        {addressBookData?.emailAddresses?.length > 0 && <Divider my={2} borderColor={cardBorder} />}
                                                        <Text fontSize="xs" color={textMuted} px={2} py={1} fontWeight="bold">
                                                            CLIENTS
                                                        </Text>
                                                        {clientsData.clients
                                                            .filter((client: any) => client.email)
                                                            .filter((client: any) => {
                                                                const searchLower = searchTerm.toLowerCase();
                                                                return client.email.toLowerCase().includes(searchLower) ||
                                                                       `${client.fName} ${client.lName}`.toLowerCase().includes(searchLower) ||
                                                                       (client.businessName && client.businessName.toLowerCase().includes(searchLower));
                                                            })
                                                            .map((client: any) => (
                                                            <ListItem
                                                                key={`client-${client.id}`}
                                                                p={2}
                                                                cursor="pointer"
                                                                _hover={{ bg: getColor('background.overlay') }}
                                                                borderRadius="md"
                                                                onClick={() => selectEmail(client.email)}
                                                            >
                                                                <HStack justify="space-between">
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontSize="sm" color={textPrimary}>
                                                                            {`${client.fName} ${client.lName}`}
                                                                        </Text>
                                                                        <Text fontSize="xs" color={textMuted}>
                                                                            {client.email}
                                                                        </Text>
                                                                        {client.businessName && (
                                                                            <Text fontSize="xs" color={textMuted}>
                                                                                {client.businessName}
                                                                            </Text>
                                                                        )}
                                                                    </VStack>
                                                                    <Badge colorScheme="purple" size="sm">
                                                                        CLIENT
                                                                    </Badge>
                                                                </HStack>
                                                            </ListItem>
                                                        ))}
                                                    </>
                                                )}
                                            </List>
                                        </Box>
                                    )}
                                    <FormHelperText color={textMuted}>
                                        Separate multiple email addresses with commas
                                    </FormHelperText>
                                </FormControl>

                                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
                                    <FormControl flex={1}>
                                        <FormLabel color={textPrimary}>CC</FormLabel>
                                        <InputGroup>
                                            <Input
                                                type="email"
                                                value={cc}
                                                onChange={(e) => setCc(e.target.value)}
                                                placeholder="Optional: Add CC recipients"
                                                bg={bg}
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
                                    </FormControl>

                                    <FormControl flex={1}>
                                        <FormLabel color={textPrimary}>BCC</FormLabel>
                                        <InputGroup>
                                            <Input
                                                type="email"
                                                value={bcc}
                                                onChange={(e) => setBcc(e.target.value)}
                                                placeholder="Optional: Add BCC recipients"
                                                bg={bg}
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
                                    </FormControl>
                                </Stack>

                                <FormControl>
                                    <FormLabel color={textPrimary}>Reply To</FormLabel>
                                        <Input
                                        type="email"
                                        value={replyTo}
                                        onChange={(e) => setReplyTo(e.target.value)}
                                        placeholder="Optional: Different reply address"
                                        bg={bg}
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                    />
                                    <FormHelperText color={textMuted}>
                                        Leave blank to use the sender address
                                    </FormHelperText>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color={textPrimary}>
                                        <HStack>
                                            <Text>Attachments & Import</Text>
                                            {attachments.length > 0 && (
                                                <Badge colorScheme="blue">{attachments.length}</Badge>
                                            )}
                                        </HStack>
                                    </FormLabel>

                                    <VStack align="stretch" spacing={3}>
                                        {/* Hidden file inputs */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={handleFileSelect}
                                            accept="*/*"
                                        />
                                        <input
                                            ref={markdownFileInputRef}
                                            type="file"
                                            accept=".md,.markdown"
                                            style={{ display: 'none' }}
                                            onChange={handleMarkdownImport}
                                        />

                                        {/* Action buttons */}
                                        <HStack spacing={2} wrap="wrap">
                                            <Button
                                                leftIcon={<FiPaperclip />}
                                                onClick={() => fileInputRef.current?.click()}
                                                variant="outline"
                                                borderColor={cardBorder}
                                                color={textSecondary}
                                                _hover={{ borderColor: getColor('primaryBlue'), color: getColor('primaryBlue') }}
                                                size="sm"
                                            >
                                                Add Attachment
                                            </Button>
                                            <Button
                                                leftIcon={<FiUpload />}
                                                onClick={() => markdownFileInputRef.current?.click()}
                                                variant="outline"
                                                borderColor={cardBorder}
                                                color={textSecondary}
                                                _hover={{ borderColor: getColor('primaryBlue'), color: getColor('primaryBlue') }}
                                                size="sm"
                                            >
                                                Import Markdown
                                            </Button>
                                            <Button
                                                leftIcon={<FiDownload />}
                                                onClick={handleDownloadTemplate}
                                                variant="outline"
                                                borderColor={cardBorder}
                                                color={textSecondary}
                                                _hover={{ borderColor: getColor('primaryBlue'), color: getColor('primaryBlue') }}
                                                size="sm"
                                            >
                                                Download Template
                                            </Button>
                                        </HStack>
                                        
                                        {/* Attachment list */}
                                        {attachments.length > 0 && (
                                            <VStack align="stretch" spacing={2}>
                                                {attachments.map((attachment, index) => (
                                                    <HStack
                                                        key={index}
                                                        p={2}
                                                        bg={bg}
                                                        borderRadius="md"
                                                        border="1px solid"
                                                        borderColor={cardBorder}
                                                        justify="space-between"
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
                                                                        {formatFileSize(attachment.size)}
                                                                    </Text>
                                                                </HStack>
                                                            </VStack>
                                                        </HStack>
                                                        <IconButton
                                                            aria-label="Remove attachment"
                                                            icon={<FiX />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="red.500"
                                                            onClick={() => removeAttachment(index)}
                                                        />
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        )}

                                        <FormHelperText color={textMuted}>
                                            Attachments: 5MB per file, 10MB total. Import markdown files to auto-populate email fields and convert to HTML.
                                        </FormHelperText>
                                    </VStack>
                                </FormControl>

                                <Divider borderColor={cardBorder} />

                                <Divider borderColor={cardBorder} />

                                <EmailComposer
                                    subject={subject}
                                    onSubjectChange={setSubject}
                                    content={bodyMarkdown}
                                    onContentChange={setBodyMarkdown}
                                    contentType="html"
                                    placeholder="Write your email content..."
                                    subjectPlaceholder="Enter email subject"
                                    onImprove={handleImproveEmail}
                                    isImproving={isImproving}
                                    showSubject={true}
                                />
                                </Stack>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* Address Book Modal */}
            <Modal isOpen={isAddressBookOpen} onClose={handleAddressBookClose} size={{ base: "full", md: "xl" }}>
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
                                {includeClients && allClientsData?.clients && (
                                    <>, {allClientsData.clients.filter((c: any) => c.email).length} clients</>
                                )}
                            </Text>
                            
                            <CheckboxGroup value={selectedEmails} onChange={(values) => setSelectedEmails(values as string[])}>
                                <VStack align="stretch" spacing={2} maxH={{ base: "300px", md: "400px" }} overflowY="auto">
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
                                    
                                    {/* Client emails when checkbox is checked */}
                                    {includeClients && allClientsData?.clients
                                        ?.filter((client: any) => client.email)
                                        .filter((client: any) => {
                                            if (!modalSearchTerm) return true;
                                            const searchLower = modalSearchTerm.toLowerCase();
                                            return client.email.toLowerCase().includes(searchLower) ||
                                                   `${client.fName} ${client.lName}`.toLowerCase().includes(searchLower) ||
                                                   (client.businessName && client.businessName.toLowerCase().includes(searchLower));
                                        })
                                        .map((client: any) => (
                                        <Box
                                            key={`client-${client.id}`}
                                            p={3}
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            borderRadius="md"
                                            _hover={{ bg: getColor('background.overlay') }}
                                        >
                                            <Checkbox value={client.email} colorScheme="blue">
                                                <HStack spacing={3} ml={2}>
                                                    <VStack align="start" spacing={0}>
                                                        <HStack spacing={2}>
                                                            <Text fontSize="sm" color={textPrimary}>
                                                                {`${client.fName} ${client.lName}`}
                                                            </Text>
                                                            <Badge colorScheme="purple" size="sm">
                                                                CLIENT
                                                            </Badge>
                                                        </HStack>
                                                        <Text fontSize="xs" color={textMuted}>
                                                            {client.email}
                                                        </Text>
                                                        {client.businessName && (
                                                            <Text fontSize="xs" color={textMuted}>
                                                                {client.businessName}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                            </Checkbox>
                                        </Box>
                                    ))}
                                </VStack>
                            </CheckboxGroup>
                            
                            {/* Include Clients Checkbox */}
                            <Checkbox 
                                isChecked={includeClients}
                                onChange={(e) => setIncludeClients(e.target.checked)}
                                colorScheme="purple"
                            >
                                Include Clients
                            </Checkbox>
                            
                            <Stack direction={{ base: "column", sm: "row" }} justify="space-between" spacing={{ base: 3, sm: 0 }}>
                                <Text fontSize="sm" color={textMuted} textAlign={{ base: "center", sm: "left" }}>
                                    {selectedEmails.length} recipient(s) selected
                                </Text>
                                <Stack direction={{ base: "column-reverse", sm: "row" }} spacing={{ base: 2, sm: 3 }} width={{ base: "100%", sm: "auto" }}>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleAddressBookClose} 
                                        borderColor={cardBorder}
                                        size={{ base: "sm", md: "md" }}
                                        width={{ base: "100%", sm: "auto" }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        colorScheme="blue" 
                                        onClick={handleAddressBookSelect}
                                        isDisabled={selectedEmails.length === 0}
                                        size={{ base: "sm", md: "md" }}
                                        width={{ base: "100%", sm: "auto" }}
                                    >
                                        Add Recipients
                                    </Button>
                                </Stack>
                            </Stack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default NewEmail;