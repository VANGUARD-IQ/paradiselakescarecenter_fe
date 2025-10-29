import React from 'react';
import {
    Card,
    CardBody,
    HStack,
    VStack,
    Heading,
    Text,
    Badge,
    Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiInbox, FiSend, FiStar, FiPaperclip, FiEye, FiCheckCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getColor, getComponent } from "../../../brandConfig";

interface UnifiedEmailCardProps {
    email: any;
    isInbound: boolean;
}

export const UnifiedEmailCard: React.FC<UnifiedEmailCardProps> = ({ email, isInbound }) => {
    const navigate = useNavigate();
    
    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    const handleClick = () => {
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

    return (
        <Card
            bg={cardGradientBg}
            border="1px solid"
            borderColor={isInbound && !email.isRead ? getColor('primaryBlue') : cardBorder}
            borderRadius="xl"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: getComponent('card', 'hoverShadow'),
                borderColor: getColor('primaryBlue'),
            }}
            cursor="pointer"
            onClick={handleClick}
            opacity={isInbound && email.isRead ? 0.8 : 1}
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
                    </VStack>

                    {/* Right side - Stats (for sent emails) */}
                    {!isInbound && email.status === 'SENT' && (
                        <HStack spacing={3} display={{ base: "none", lg: "flex" }}>
                            <VStack spacing={0}>
                                <Icon as={FiEye} color={getColor('successGreen')} boxSize={4} />
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