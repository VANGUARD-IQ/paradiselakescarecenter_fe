import React, { useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    Card,
    CardBody,
    Divider,
    IconButton,
    useToast,
    Spinner,
    Center,
    Icon,
    Link,
    Tooltip,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiArrowLeft, FiStar, FiTrash2, FiArchive, FiMail, FiDownload, FiPaperclip, FiExternalLink, FiPackage, FiCornerUpLeft, FiTag, FiUsers, FiCornerUpRight, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import CommunicationTaskList from './CommunicationTaskList';
import { ConvertToProjectModal } from './components/ConvertToProjectModal';

const GET_INBOUND_EMAIL_QUERY = gql`
    query GetInboundEmail($id: ID!) {
        inboundEmail(id: $id) {
            id
            messageId
            subject
            from
            fromName
            fromFull
            to
            toFull
            cc
            ccFull
            bcc
            replyTo
            date
            textBody
            htmlBody
            isRead
            isStarred
            folder
            labels
            attachments {
                name
                contentType
                contentLength
                ipfsUrl
                ipfsHash
            }
            tasks {
                id
                title
                description
                status
                priority
                dueDate
                assignedTo {
                    id
                    fName
                    lName
                    email
                }
                notes
                completedAt
                createdAt
            }
        }
    }
`;

// Unused - keeping for future implementation
// const MARK_AS_READ_MUTATION = gql`
//     mutation MarkAsRead($id: ID!, $isRead: Boolean!) {
//         markInboundEmailAsRead(id: $id, isRead: $isRead) {
//             id
//             isRead
//         }
//     }
// `;

const STAR_EMAIL_MUTATION = gql`
    mutation StarEmail($id: ID!, $isStarred: Boolean!) {
        starInboundEmail(id: $id, isStarred: $isStarred) {
            id
            isStarred
        }
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

const MOVE_TO_FOLDER_MUTATION = gql`
    mutation MoveToFolder($id: ID!, $folder: String!) {
        moveInboundEmailToFolder(id: $id, folder: $folder) {
            id
            folder
        }
    }
`;

const DELETE_EMAIL_MUTATION = gql`
    mutation DeleteInboundEmail($id: ID!) {
        deleteInboundEmail(id: $id)
    }
`;

const InboundEmailDetail: React.FC = () => {
    usePageTitle("Inbound Email");
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
    
    // Modal state for Convert to Project
    const { isOpen: isConvertModalOpen, onOpen: onConvertModalOpen, onClose: onConvertModalClose } = useDisclosure();
    
    // Modal state for Tag Management
    const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onClose: onTagModalClose } = useDisclosure();
    const [newLabel, setNewLabel] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_INBOUND_EMAIL_QUERY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-and-network',
        onError: (err) => {
            console.error('Failed to fetch email:', err);
            console.error('GraphQL Errors:', err.graphQLErrors);
            console.error('Network Error:', err.networkError);
            toast({
                title: 'Error loading email',
                description: err.message || 'Unable to fetch email details',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    });

    // DEBUG LOGGING FOR ATTACHMENTS AND TASKS
    React.useEffect(() => {
        if (data?.inboundEmail) {
            console.log('\n📧 ========== FRONTEND EMAIL DATA RECEIVED ==========');
            console.log('📧 Email ID:', data.inboundEmail.id);
            console.log('📧 Email Subject:', data.inboundEmail.subject);
            console.log('📧 Attachments exists:', !!data.inboundEmail.attachments);
            console.log('📧 Attachments is array:', Array.isArray(data.inboundEmail.attachments));
            console.log('📧 Attachments length:', data.inboundEmail.attachments?.length || 0);
            console.log('📧 Attachments data:', JSON.stringify(data.inboundEmail.attachments, null, 2));
            console.log('📧 Tasks exists:', !!data.inboundEmail.tasks);
            console.log('📧 Tasks is array:', Array.isArray(data.inboundEmail.tasks));
            console.log('📧 Tasks length:', data.inboundEmail.tasks?.length || 0);
            console.log('📧 Tasks data:', JSON.stringify(data.inboundEmail.tasks, null, 2));
            console.log('📧 ========== END FRONTEND EMAIL DATA ==========\n');
        }
    }, [data]);

    const { data: availableLabelsData } = useQuery(AVAILABLE_LABELS_QUERY);
    
    const [starEmail] = useMutation(STAR_EMAIL_MUTATION);
    const [moveToFolder] = useMutation(MOVE_TO_FOLDER_MUTATION);
    const [addLabel] = useMutation(ADD_EMAIL_LABEL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Tag added',
                status: 'success',
                duration: 2000,
            });
            refetch();
        },
    });
    
    const [removeLabel] = useMutation(REMOVE_EMAIL_LABEL_MUTATION, {
        onCompleted: () => {
            toast({
                title: 'Tag removed',
                status: 'success',
                duration: 2000,
            });
            refetch();
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
            navigate('/emails');
        }
    });

    const handleStar = async () => {
        if (data?.inboundEmail) {
            await starEmail({
                variables: {
                    id: data.inboundEmail.id,
                    isStarred: !data.inboundEmail.isStarred
                }
            });
        }
    };

    const handleArchive = async () => {
        if (data?.inboundEmail) {
            const isArchived = data.inboundEmail.folder === 'Archived';
            const newFolder = isArchived ? 'Inbox' : 'Archived';
            
            await moveToFolder({
                variables: {
                    id: data.inboundEmail.id,
                    folder: newFolder
                }
            });
            
            toast({
                title: isArchived ? 'Email moved back to inbox' : 'Email archived',
                description: isArchived ? 'Email has been restored to your inbox' : 'Email has been moved to archive',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Navigate back to emails list after action
            setTimeout(() => {
                navigate('/emails');
            }, 1000);
        }
    };

    const handleDownloadPDF = async () => {
        if (!data?.inboundEmail) return;
        
        try {
            // Find the email content container - use a more reliable selector
            // Look for the card body that contains the email content
            let emailContentElement = document.getElementById('email-content-container');
            
            // If no ID, try to find by content structure
            if (!emailContentElement) {
                // Look for the card body that contains the email
                const cardBodies = document.querySelectorAll('.chakra-card__body');
                Array.from(cardBodies).forEach((card) => {
                    // Check if this card contains email content by looking for specific elements
                    if (!emailContentElement && card.querySelector('.chakra-heading') && card.querySelector('.chakra-divider')) {
                        emailContentElement = card as HTMLElement;
                    }
                });
            }
            
            if (!emailContentElement) {
                throw new Error('Email content element not found');
            }

            // Show a loading toast while generating PDF
            toast({
                title: 'Generating PDF',
                description: 'Please wait while we prepare your PDF...',
                status: 'info',
                duration: 2000,
            });

            // Clone the element to avoid modifying the original
            const clonedElement = emailContentElement.cloneNode(true) as HTMLElement;
            
            // Remove interactive elements from the clone
            const buttonsToRemove = clonedElement.querySelectorAll('button, .chakra-button, [aria-label*="Manage"]');
            buttonsToRemove.forEach(button => button.remove());
            
            // Force black text and proper styling
            clonedElement.style.cssText = `
                position: absolute !important;
                left: -9999px !important;
                top: 0 !important;
                background-color: white !important;
                width: 800px !important;
                padding: 20px !important;
                color: black !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
            `;
            
            // Force all text elements to be black and ensure visibility
            const allTextElements = clonedElement.querySelectorAll('*');
            allTextElements.forEach((el) => {
                const element = el as HTMLElement;
                
                // Remove any height restrictions
                if (element.style.maxHeight) {
                    element.style.maxHeight = 'none';
                }
                if (element.style.height && element.style.height !== 'auto') {
                    element.style.height = 'auto';
                }
                element.style.overflow = 'visible';
                
                // Skip elements that should keep their background colors
                if (!element.classList.contains('chakra-badge') && 
                    !element.style.backgroundColor &&
                    !element.style.background) {
                    element.style.color = 'black';
                }
                // Ensure text in paragraphs and headings is black
                if (element.tagName.match(/^(P|H[1-6]|SPAN|DIV|TD|TH|LI)$/i)) {
                    element.style.color = 'black !important';
                }
            });

            // Temporarily append the clone to body for rendering
            document.body.appendChild(clonedElement);
            
            // Wait for images and content to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use html2canvas to capture the element
            const canvas = await html2canvas(clonedElement, {
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                allowTaint: true, // Allow tainted canvas for external images
                logging: false,
                backgroundColor: '#ffffff',
                width: 800,
                height: clonedElement.scrollHeight, // Capture full height
                windowWidth: 800,
                windowHeight: clonedElement.scrollHeight,
                onclone: (clonedDoc, element) => {
                    // Additional styling in the cloned document
                    element.style.color = 'black';
                    element.style.backgroundColor = 'white';
                    
                    // Ensure all text is black
                    const texts = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, td, th, li');
                    texts.forEach((textEl) => {
                        const el = textEl as HTMLElement;
                        if (!el.style.backgroundColor && !el.classList.contains('chakra-badge')) {
                            el.style.color = 'black';
                        }
                    });
                }
            });

            // Remove the cloned element
            document.body.removeChild(clonedElement);

            // Create PDF from canvas
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit the page
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margins on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Calculate how many pages we need
            const pageContentHeight = pdfHeight - 20; // Leave margins
            const totalPages = Math.ceil(imgHeight / pageContentHeight);
            
            // Add the image to PDF, splitting across pages if needed
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }
                
                const sourceY = page * (pageContentHeight * canvas.width / imgWidth);
                const sourceHeight = Math.min(canvas.height - sourceY, (pageContentHeight * canvas.width / imgWidth));
                
                // Create a temporary canvas for this page portion
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sourceHeight;
                const ctx = pageCanvas.getContext('2d');
                
                if (ctx) {
                    ctx.drawImage(
                        canvas,
                        0, sourceY, canvas.width, sourceHeight,
                        0, 0, canvas.width, sourceHeight
                    );
                    
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
                    
                    pdf.addImage(
                        pageImgData,
                        'PNG',
                        10,
                        10,
                        imgWidth,
                        pageImgHeight,
                        undefined,
                        'FAST'
                    );
                }
            }

            // Add metadata
            const email = data.inboundEmail;
            pdf.setProperties({
                title: email.subject,
                subject: `Email from ${email.from}`,
                author: brandConfig.siteName || 'Email Archive',
                keywords: email.labels?.join(', ') || '',
                creator: brandConfig.siteName || 'Email Archive'
            });

            // Download the PDF
            const fileName = `${email.subject.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_${format(new Date(email.date), 'yyyy-MM-dd')}.pdf`;
            pdf.save(fileName);
            
            toast({
                title: 'PDF Downloaded',
                description: 'Email has been exported as PDF',
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate PDF. Please try again.',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this email?')) {
            await deleteEmail({ variables: { id } });
        }
    };

    const handleAddLabel = async () => {
        if (newLabel && data?.inboundEmail) {
            await addLabel({
                variables: {
                    emailId: data.inboundEmail.id,
                    label: newLabel
                }
            });
            setNewLabel('');
        }
    };
    
    const handleRemoveLabel = async (label: string) => {
        if (data?.inboundEmail) {
            await removeLabel({
                variables: {
                    emailId: data.inboundEmail.id,
                    label: label
                }
            });
        }
    };
    
    const handleReply = () => {
        if (data?.inboundEmail) {
            const email = data.inboundEmail;

            // Store the email data in sessionStorage
            const replyData = {
                to: email.from,
                subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
                fromName: email.fromName || email.from || '',
                date: email.date,
                textBody: email.textBody || '',
                htmlBody: email.htmlBody || '',
                // Include the original recipient email address (the one that received this email)
                // This will be used to set the 'from' field in the reply
                originalTo: email.to && email.to.length > 0 ? email.to[0] : (email.toFull && email.toFull.length > 0 ? email.toFull[0] : null)
            };

            sessionStorage.setItem('replyEmail', JSON.stringify(replyData));
            navigate('/emails/new?action=reply');
        }
    };
    
    const handleReplyToAll = () => {
        if (data?.inboundEmail) {
            const email = data.inboundEmail;
            
            // Collect all recipients
            const toRecipients = [email.from];
            const ccRecipients: string[] = [];
            
            // Add original TO recipients to CC
            if (email.to && Array.isArray(email.to)) {
                email.to.forEach((recipient: string) => {
                    if (recipient && recipient !== email.from) {
                        ccRecipients.push(recipient);
                    }
                });
            }
            
            // Add original CC recipients to CC
            if (email.cc && Array.isArray(email.cc)) {
                email.cc.forEach((recipient: string) => {
                    if (recipient && !ccRecipients.includes(recipient)) {
                        ccRecipients.push(recipient);
                    }
                });
            }
            
            // Store the email data in sessionStorage
            const replyAllData = {
                to: toRecipients.join(','),
                cc: ccRecipients.join(','),
                subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
                fromName: email.fromName || email.from || '',
                date: email.date,
                textBody: email.textBody || '',
                htmlBody: email.htmlBody || '',
                // Include the original recipient email address for setting 'from' field
                originalTo: email.to && email.to.length > 0 ? email.to[0] : (email.toFull && email.toFull.length > 0 ? email.toFull[0] : null)
            };
            
            sessionStorage.setItem('replyEmail', JSON.stringify(replyAllData));
            navigate('/emails/new?action=replyAll');
        }
    };
    
    const handleForward = () => {
        if (data?.inboundEmail) {
            const email = data.inboundEmail;
            
            // Store the email data in sessionStorage to avoid URL length issues
            const forwardData = {
                subject: email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`,
                fromName: email.fromName || email.from || '',
                fromEmail: email.from || '',
                date: email.date,
                textBody: email.textBody || '',
                htmlBody: email.htmlBody || '',
                originalSubject: email.subject.replace('Fwd: ', ''),
                attachments: email.attachments || []
            };
            
            sessionStorage.setItem('forwardEmail', JSON.stringify(forwardData));
            
            // Navigate with a simple flag
            navigate('/emails/new?action=forward');
        }
    };

    if (loading) {
        return (
            <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
                <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
                <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
                <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
                    <Center py={20}>
                        <Spinner size="xl" color={getColor('primaryBlue')} />
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !data?.inboundEmail) {
        return (
            <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
                <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
                <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
                <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody>
                            <Center py={10}>
                                <VStack spacing={4}>
                                    <Icon as={FiMail} boxSize={12} color={textMuted} />
                                    <Text color={textMuted} fontSize="lg">
                                        {error ? 'Error loading email' : 'Email not found'}
                                    </Text>
                                    {error && (
                                        <VStack spacing={2}>
                                            <Text color={textMuted} fontSize="sm" textAlign="center">
                                                {error.message}
                                            </Text>
                                            {id && (
                                                <Text color={textMuted} fontSize="xs" fontFamily="mono">
                                                    ID: {id}
                                                </Text>
                                            )}
                                        </VStack>
                                    )}
                                    <Button
                                        leftIcon={<FiArrowLeft />}
                                        onClick={() => navigate('/emails')}
                                        variant="ghost"
                                    >
                                        Back to Emails
                                    </Button>
                                </VStack>
                            </Center>
                        </CardBody>
                    </Card>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const email = data.inboundEmail;

    return (
        <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
            
            <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <VStack align="stretch" spacing={{ base: 3, md: 0 }}>
                        <HStack spacing={{ base: 2, md: 3 }} flexWrap={{ base: "wrap", md: "nowrap" }} justify={{ base: "stretch", md: "flex-start" }}>
                            <Button
                                leftIcon={<FiArrowLeft />}
                                onClick={() => navigate('/emails')}
                                variant="outline"
                                borderColor={cardBorder}
                                color={textPrimary}
                                _hover={{ bg: cardGradientBg }}
                                size={{ base: "sm", md: "md" }}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Back to Inbox
                            </Button>
                            <Button
                                leftIcon={<FiCornerUpLeft />}
                                onClick={handleReply}
                                variant="solid"
                                bg={getColor('primaryBlue')}
                                color="white"
                                _hover={{ bg: getColor('primaryBlueHover'), transform: "scale(1.02)" }}
                                _active={{ bg: getColor('primaryBlue') }}
                                px={{ base: 4, md: 6 }}
                                fontWeight="medium"
                                size={{ base: "sm", md: "md" }}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Reply
                            </Button>
                            <Button
                                leftIcon={<FiUsers />}
                                onClick={handleReplyToAll}
                                variant="outline"
                                borderColor={getColor('primaryBlue')}
                                color={getColor('primaryBlue')}
                                _hover={{ bg: getColor('primaryBlue'), color: "white", transform: "scale(1.02)" }}
                                _active={{ bg: getColor('primaryBlueHover') }}
                                px={{ base: 4, md: 6 }}
                                fontWeight="medium"
                                size={{ base: "sm", md: "md" }}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Reply to All
                            </Button>
                            <Button
                                leftIcon={<FiCornerUpRight />}
                                onClick={handleForward}
                                variant="outline"
                                borderColor={getColor('primaryBlue')}
                                color={getColor('primaryBlue')}
                                _hover={{ bg: getColor('primaryBlue'), color: "white", transform: "scale(1.02)" }}
                                _active={{ bg: getColor('primaryBlueHover') }}
                                px={{ base: 4, md: 6 }}
                                fontWeight="medium"
                                size={{ base: "sm", md: "md" }}
                                width={{ base: "100%", md: "auto" }}
                            >
                                Forward
                            </Button>
                            <Button 
                                leftIcon={<FiPackage />}
                                size={{ base: "sm", md: "lg" }}
                                variant="solid"
                                bg="green.500"
                                color="white"
                                _hover={{ bg: "green.600", transform: "scale(1.05)" }}
                                _active={{ bg: "green.700" }}
                                onClick={onConvertModalOpen}
                                px={{ base: 4, md: 8 }}
                                fontSize={{ base: "sm", md: "lg" }}
                                fontWeight="bold"
                                boxShadow="lg"
                                width={{ base: "100%", md: "auto" }}
                            >
                                Convert to Project
                            </Button>
                        </HStack>
                        <HStack spacing={{ base: 2, md: 3 }} justify={{ base: "center", md: "flex-end" }}>
                            <Tooltip 
                                label="Export as PDF" 
                                placement="bottom"
                                bg={getColor('primaryBlue')}
                                color="white"
                                fontSize="sm"
                                px={3}
                                py={2}
                                borderRadius="md"
                                hasArrow
                            >
                                <IconButton
                                    aria-label="Export as PDF"
                                    icon={<FiFileText />}
                                    onClick={handleDownloadPDF}
                                    variant="ghost"
                                    color={textMuted}
                                    _hover={{ 
                                        transform: "scale(1.1)",
                                        color: getColor('primaryBlue')
                                    }}
                                />
                            </Tooltip>
                            
                            <Tooltip 
                                label={email.isStarred ? "Unstar email" : "Star email"} 
                                placement="bottom"
                                bg={getColor('primaryBlue')}
                                color="white"
                                fontSize="sm"
                                px={3}
                                py={2}
                                borderRadius="md"
                                hasArrow
                            >
                                <IconButton
                                    aria-label="Star email"
                                    icon={<FiStar />}
                                    onClick={handleStar}
                                    variant="ghost"
                                    color={email.isStarred ? getColor('starYellow') : textMuted}
                                    _hover={{ 
                                        transform: "scale(1.1)",
                                        color: email.isStarred ? getColor('starYellowHover') : getColor('primaryBlue')
                                    }}
                                />
                            </Tooltip>
                            
                            <Tooltip 
                                label={email.folder === 'Archived' 
                                    ? "Move back to Inbox if tasks are not completed" 
                                    : "Archive email when all tasks are done"} 
                                placement="bottom"
                                bg={getColor('primaryBlue')}
                                color="white"
                                fontSize="sm"
                                px={3}
                                py={2}
                                borderRadius="md"
                                hasArrow
                            >
                                <IconButton
                                    aria-label={email.folder === 'Archived' ? "Unarchive email" : "Archive email"}
                                    icon={<FiArchive />}
                                    onClick={handleArchive}
                                    variant="ghost"
                                    color={email.folder === 'Archived' ? getColor('primaryBlue') : textMuted}
                                    _hover={{ 
                                        transform: "scale(1.1)",
                                        color: getColor('primaryBlue')
                                    }}
                                />
                            </Tooltip>
                            
                            <Tooltip 
                                label="Delete email" 
                                placement="bottom"
                                bg={getColor('status.error')}
                                color="white"
                                fontSize="sm"
                                px={3}
                                py={2}
                                borderRadius="md"
                                hasArrow
                            >
                                <IconButton
                                    aria-label="Delete email"
                                    icon={<FiTrash2 />}
                                    onClick={handleDelete}
                                    variant="ghost"
                                    color="red.500"
                                    _hover={{ 
                                        transform: "scale(1.1)",
                                        color: "red.600",
                                        bg: "red.50"
                                    }}
                                />
                            </Tooltip>
                        </HStack>
                    </VStack>

                    <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <CardBody p={{ base: 3, md: 6 }} id="email-content-container">
                            <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
                                {/* Subject and metadata */}
                                <VStack align="stretch" spacing={3}>
                                    <VStack align="start" spacing={{ base: 2, md: 3 }}>
                                        <Heading size={{ base: "md", md: "lg", lg: "xl" }} color={textPrimary}>
                                            {email.subject}
                                        </Heading>
                                        {email.folder && (
                                            <Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }}>{email.folder}</Badge>
                                        )}
                                    </VStack>
                                    
                                    <HStack spacing={2} align="center">
                                        {email.labels?.length > 0 && (
                                            <Wrap spacing={2}>
                                                {email.labels.map((label: string) => (
                                                    <WrapItem key={label}>
                                                        <Tag
                                                            size="md"
                                                            bg="rgba(168, 85, 247, 0.2)"
                                                            color="#A855F7"
                                                            border="1px solid"
                                                            borderColor="rgba(168, 85, 247, 0.3)"
                                                        >
                                                            <TagLabel>{label}</TagLabel>
                                                        </Tag>
                                                    </WrapItem>
                                                ))}
                                            </Wrap>
                                        )}
                                        <Tooltip 
                                            label="Manage tags" 
                                            placement="top"
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
                                                onClick={onTagModalOpen}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </VStack>

                                <Divider borderColor={cardBorder} />

                                {/* From/To information */}
                                <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold" color={textMuted} fontSize={{ base: "sm", md: "md" }}>From:</Text>
                                        <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }} pl={{ base: 0, md: 4 }}>
                                            {email.fromFull || email.from}
                                        </Text>
                                    </VStack>
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold" color={textMuted} fontSize={{ base: "sm", md: "md" }}>To:</Text>
                                        <VStack align="start" spacing={1} pl={{ base: 0, md: 4 }}>
                                            {email.toFull?.map((to: string, index: number) => (
                                                <Text key={index} color={textPrimary} fontSize={{ base: "sm", md: "md" }}>{to}</Text>
                                            )) || email.to?.map((to: string, index: number) => (
                                                <Text key={index} color={textPrimary} fontSize={{ base: "sm", md: "md" }}>{to}</Text>
                                            ))}
                                        </VStack>
                                    </VStack>
                                    {email.cc?.length > 0 && (
                                        <HStack align="start">
                                            <Text fontWeight="bold" color={textMuted} minW="80px">CC:</Text>
                                            <VStack align="start" spacing={1}>
                                                {email.ccFull?.map((cc: string, index: number) => (
                                                    <Text key={index} color={textPrimary}>{cc}</Text>
                                                )) || email.cc?.map((cc: string, index: number) => (
                                                    <Text key={index} color={textPrimary}>{cc}</Text>
                                                ))}
                                            </VStack>
                                        </HStack>
                                    )}
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold" color={textMuted} fontSize={{ base: "sm", md: "md" }}>Date:</Text>
                                        <Text color={textPrimary} fontSize={{ base: "sm", md: "md" }} pl={{ base: 0, md: 4 }}>
                                            {format(new Date(email.date), 'PPpp')}
                                        </Text>
                                    </VStack>
                                </VStack>

                                <Divider borderColor={cardBorder} />

                                {/* Email content */}
                                <Box>
                                    {email.htmlBody ? (
                                        <Box
                                            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                                            color={textSecondary}
                                            sx={{
                                                '& a': { color: getColor('primaryBlue'), textDecoration: 'underline' },
                                                '& p': { marginBottom: '1em' },
                                                '& ul, & ol': { paddingLeft: '2em', marginBottom: '1em' },
                                                '& blockquote': { 
                                                    borderLeft: '3px solid',
                                                    borderColor: cardBorder,
                                                    paddingLeft: '1em',
                                                    marginLeft: '0',
                                                    color: textMuted
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Text whiteSpace="pre-wrap" color={textSecondary}>
                                            {email.textBody || 'No content available'}
                                        </Text>
                                    )}
                                </Box>

                                {/* Attachments */}
                                {email.attachments?.length > 0 && (
                                    <>
                                        <Divider borderColor={cardBorder} />
                                        <VStack align="stretch" spacing={3}>
                                            <HStack>
                                                <Icon as={FiPaperclip} color={textMuted} />
                                                <Text fontWeight="bold" color={textMuted}>
                                                    Attachments ({email.attachments.length})
                                                </Text>
                                            </HStack>
                                            <VStack align="stretch" spacing={2}>
                                                {email.attachments.map((attachment: any, index: number) => (
                                                    <Box key={index}>
                                                        {attachment.ipfsUrl ? (
                                                            <Link
                                                                href={attachment.ipfsUrl}
                                                                isExternal
                                                                _hover={{ textDecoration: 'none' }}
                                                            >
                                                                <HStack 
                                                                    p={3} 
                                                                    bg={bg} 
                                                                    borderRadius="md"
                                                                    border="1px solid"
                                                                    borderColor={cardBorder}
                                                                    cursor="pointer"
                                                                    _hover={{ 
                                                                        bg: 'whiteAlpha.50',
                                                                        borderColor: getColor('primaryBlue') 
                                                                    }}
                                                                    transition="all 0.2s"
                                                                >
                                                                    <Icon as={FiDownload} color={getColor('primaryBlue')} />
                                                                    <VStack align="start" spacing={0} flex={1}>
                                                                        <Text color={textPrimary} fontWeight="medium">
                                                                            {attachment.name}
                                                                        </Text>
                                                                        <HStack spacing={2}>
                                                                            <Text fontSize="sm" color={textMuted}>
                                                                                {attachment.contentType}
                                                                            </Text>
                                                                            <Text fontSize="sm" color={textMuted}>
                                                                                • {Math.round(attachment.contentLength / 1024)} KB
                                                                            </Text>
                                                                            {attachment.ipfsHash && (
                                                                                <Text fontSize="xs" color={textMuted} fontFamily="mono">
                                                                                    • IPFS: {attachment.ipfsHash.substring(0, 8)}...
                                                                                </Text>
                                                                            )}
                                                                        </HStack>
                                                                    </VStack>
                                                                    <Icon as={FiExternalLink} color={textMuted} />
                                                                </HStack>
                                                            </Link>
                                                        ) : (
                                                            <HStack 
                                                                p={3} 
                                                                bg={bg} 
                                                                borderRadius="md"
                                                                border="1px solid"
                                                                borderColor={cardBorder}
                                                                opacity={0.7}
                                                            >
                                                                <Icon as={FiPaperclip} color={textMuted} />
                                                                <VStack align="start" spacing={0} flex={1}>
                                                                    <Text color={textPrimary}>
                                                                        {attachment.name}
                                                                    </Text>
                                                                    <Text fontSize="sm" color={textMuted}>
                                                                        {attachment.contentType} • {Math.round(attachment.contentLength / 1024)} KB
                                                                    </Text>
                                                                </VStack>
                                                                <Badge colorScheme="gray" fontSize="xs">
                                                                    Not uploaded
                                                                </Badge>
                                                            </HStack>
                                                        )}
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </VStack>
                                    </>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                    
                    {/* Tasks Section */}
                    <Box mt={6}>
                        <CommunicationTaskList
                            tasks={email.tasks || []}
                            communicationId={id!}
                            communicationType="INBOUND_EMAIL"
                            onTasksUpdated={() => {
                                // Refetch email to get updated tasks
                                refetch();
                            }}
                            allowEdit={true}
                        />
                    </Box>
                </VStack>
            </Container>

            <FooterWithFourColumns />
            
            {/* Convert to Project Modal */}
            {data?.inboundEmail && (
                <ConvertToProjectModal 
                    isOpen={isConvertModalOpen}
                    onClose={onConvertModalClose}
                    email={{
                        id: data.inboundEmail.id,
                        subject: data.inboundEmail.subject || '',
                        bodyMarkdown: data.inboundEmail.textBody || '',
                        from: data.inboundEmail.from || ''
                    }}
                />
            )}
            
            {data?.inboundEmail && (
                <Modal isOpen={isTagModalOpen} onClose={onTagModalClose} size="md">
                    <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
                    <ModalContent bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                        <ModalHeader color={textPrimary}>
                            Manage Tags
                        </ModalHeader>
                        <ModalCloseButton color={textMuted} />
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
                                <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                    <strong>Subject:</strong> {data.inboundEmail.subject}
                                </Text>
                                
                                {data.inboundEmail.labels && data.inboundEmail.labels.length > 0 && (
                                    <Box>
                                        <Text fontSize="sm" color={textMuted} mb={2}>Current tags:</Text>
                                        <Wrap spacing={2}>
                                            {data.inboundEmail.labels.map((label: string) => (
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
                                                    !data.inboundEmail.labels?.includes(label)
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
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onClick={onTagModalClose} color={textMuted}>
                                Done
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </Box>
    );
};

export default InboundEmailDetail;