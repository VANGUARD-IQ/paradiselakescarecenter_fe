import React from 'react';
import {
    Stack,
    FormControl,
    FormLabel,
    FormHelperText,
    Select,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    HStack,
    Text,
    Badge,
    VStack,
    Button,
    Box,
    Divider
} from '@chakra-ui/react';
import { FiUsers, FiPaperclip, FiFile, FiX } from 'react-icons/fi';
import EmailComposer from './EmailComposer';

interface EmailFormFieldsProps {
    from: string;
    setFrom: (value: string) => void;
    to: string;
    handleToChange: (value: string) => void;
    cc: string;
    setCc: (value: string) => void;
    bcc: string;
    setBcc: (value: string) => void;
    replyTo: string;
    setReplyTo: (value: string) => void;
    subject: string;
    setSubject: (value: string) => void;
    bodyMarkdown: string;
    setBodyMarkdown: (value: string) => void;
    attachments: Array<{ name: string; size: number }>;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeAttachment: (index: number) => void;
    openAddressBookFor: (field: 'to' | 'cc' | 'bcc') => void;
    showSuggestions: boolean;
    setShowSuggestions: (value: boolean) => void;
    addressBookData: any;
    clientsData: any;
    searchTerm: string;
    selectEmail: (email: string) => void;
    sendersData: any;
    formatFileSize: (size: number) => string;
    handleImproveEmail: () => void;
    isImproving: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    bg: string;
    cardBorder: string;
    cardGradientBg: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    getColor: (key: string) => string;
}

export const EmailFormFields: React.FC<EmailFormFieldsProps> = ({
    from,
    setFrom,
    to,
    handleToChange,
    cc,
    setCc,
    bcc,
    setBcc,
    replyTo,
    setReplyTo,
    subject,
    setSubject,
    bodyMarkdown,
    setBodyMarkdown,
    attachments,
    handleFileSelect,
    removeAttachment,
    openAddressBookFor,
    showSuggestions,
    setShowSuggestions,
    addressBookData,
    clientsData,
    searchTerm,
    selectEmail,
    sendersData,
    formatFileSize,
    handleImproveEmail,
    isImproving,
    fileInputRef,
    bg,
    cardBorder,
    cardGradientBg,
    textPrimary,
    textSecondary,
    textMuted,
    getColor
}) => {
    return (
        <Stack spacing={{ base: 4, md: 6 }}>
            {/* From Field */}
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

            {/* To Field */}
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
                <FormHelperText color={textMuted}>
                    Separate multiple email addresses with commas
                </FormHelperText>
            </FormControl>

            {/* CC and BCC Fields */}
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

            {/* Reply To Field */}
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

            {/* Attachments Field */}
            <FormControl>
                <FormLabel color={textPrimary}>
                    <HStack>
                        <Text>Attachments</Text>
                        {attachments.length > 0 && (
                            <Badge colorScheme="blue">{attachments.length}</Badge>
                        )}
                    </HStack>
                </FormLabel>

                <VStack align="stretch" spacing={3}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        accept="*/*"
                    />

                    <Button
                        leftIcon={<FiPaperclip />}
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        borderColor={cardBorder}
                        color={textSecondary}
                        _hover={{ borderColor: getColor('primaryBlue'), color: getColor('primaryBlue') }}
                        size="sm"
                        w="fit-content"
                    >
                        Add Attachment
                    </Button>

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
                        Maximum file size: 5MB per file, 10MB total
                    </FormHelperText>
                </VStack>
            </FormControl>

            <Divider borderColor={cardBorder} />

            {/* Email Composer */}
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
    );
};