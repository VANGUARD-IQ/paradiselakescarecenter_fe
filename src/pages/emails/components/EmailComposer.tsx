import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Button,
    Textarea,
    Text,
    IconButton,
    ButtonGroup,
    Tooltip,
    Divider,
    useColorModeValue
} from '@chakra-ui/react';
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiList,
    FiLink,
    FiCode,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight
} from 'react-icons/fi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EmailComposerProps {
    subject: string;
    onSubjectChange: (value: string) => void;
    content: string;
    onContentChange: (value: string) => void;
    contentType?: 'html' | 'markdown';
    placeholder?: string;
    subjectPlaceholder?: string;
    isReadOnly?: boolean;
    onImprove?: () => void;
    isImproving?: boolean;
    showSubject?: boolean;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
    subject,
    onSubjectChange,
    content,
    onContentChange,
    contentType = 'html',
    subjectPlaceholder = 'Enter email subject',
    isReadOnly = false,
    onImprove,
    isImproving = false,
    showSubject = true
}) => {
    const [editorMode, setEditorMode] = useState<'visual' | 'source'>('visual');
    const [sourceContent, setSourceContent] = useState(content);
    const [activeTab, setActiveTab] = useState(0);

    // Use proper color mode values
    const bg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('white', 'gray.700');
    const cardBorder = useColorModeValue('gray.200', 'gray.600');
    const textPrimary = useColorModeValue('gray.800', 'white');
    const textSecondary = useColorModeValue('gray.600', 'gray.300');
    const textMuted = useColorModeValue('gray.500', 'gray.400');
    const cardGradientBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBorderColor = useColorModeValue('gray.300', 'gray.500');
    const readOnlyBg = useColorModeValue('white', 'gray.700');
    const readOnlyBorder = useColorModeValue('gray.200', 'gray.600');
    const readOnlyColor = useColorModeValue('gray.800', 'white');
    const primaryBlue = useColorModeValue('blue.500', 'blue.400');
    const primaryBlueHover = useColorModeValue('blue.600', 'blue.500');
    const overlayBg = useColorModeValue('gray.100', 'gray.700');

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    style: 'color: #3434ef; text-decoration: underline;'
                },
                // Add autolink functionality but with better cursor handling
                autolink: true,
                linkOnPaste: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: contentType === 'html' ? content : '',
        onUpdate: ({ editor }) => {
            if (editorMode === 'visual') {
                const html = editor.getHTML();
                onContentChange(html);
                setSourceContent(html);
            }
        },
        editable: !isReadOnly,
        // Add event handler for paste to handle link pasting better
        editorProps: {
            handlePaste: (_view, event) => {
                const text = event.clipboardData?.getData('text/plain');
                // Check if the pasted text is a URL
                if (text && /^https?:\/\//.test(text)) {
                    // Let TipTap handle the paste normally
                    // but add a small delay to move cursor after the link
                    setTimeout(() => {
                        if (editor) {
                            // Insert a space after the link and move cursor there
                            editor.chain()
                                .focus()
                                .insertContent(' ')
                                .run();
                        }
                    }, 10);
                }
                return false; // Let TipTap handle the paste
            }
        }
    });

    // Update editor when content changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML() && editorMode === 'visual') {
            editor.commands.setContent(content);
        }
    }, [content, editor, editorMode]);

    // Handle source mode changes
    const handleSourceChange = (value: string) => {
        setSourceContent(value);
        if (contentType === 'markdown') {
            onContentChange(value);
        } else {
            // For HTML mode, update the content
            onContentChange(value);
            if (editor) {
                editor.commands.setContent(value);
            }
        }
    };

    // Convert HTML to plain text for preview
    const htmlToPlainText = (html: string) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    // Toolbar button component
    const ToolbarButton: React.FC<{
        icon: React.ReactElement;
        onClick: () => void;
        isActive?: boolean;
        tooltip: string;
    }> = ({ icon, onClick, isActive = false, tooltip }) => (
        <Tooltip label={tooltip} placement="top">
            <IconButton
                aria-label={tooltip}
                icon={icon}
                size="sm"
                variant={isActive ? "solid" : "ghost"}
                bg={isActive ? primaryBlue : 'transparent'}
                color={isActive ? 'white' : textSecondary}
                _hover={{
                    bg: isActive ? primaryBlueHover : overlayBg,
                    color: isActive ? 'white' : textPrimary
                }}
                onClick={onClick}
                isDisabled={isReadOnly}
            />
        </Tooltip>
    );

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <VStack align="stretch" spacing={6}>
            {showSubject && (
                <FormControl>
                    <FormLabel color={textPrimary}>Subject</FormLabel>
                    <Input
                        value={subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubjectChange(e.target.value)}
                        placeholder={subjectPlaceholder}
                        size="lg"
                        bg={inputBg}
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: hoverBorderColor }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)' }}
                        fontWeight="medium"
                        isReadOnly={isReadOnly}
                    />
                </FormControl>
            )}

            <FormControl>
                <HStack justify="space-between" mb={3}>
                    <FormLabel color={textPrimary} mb={0}>Email Body</FormLabel>
                    <HStack>
                        {onImprove && (
                            <Button
                                size="sm"
                                leftIcon={<Text>✨</Text>}
                                onClick={onImprove}
                                isLoading={isImproving}
                                loadingText="Improving..."
                                colorScheme="purple"
                                variant="outline"
                                _hover={{ bg: 'purple.50', borderColor: 'purple.500' }}
                            >
                                Improve with AI
                            </Button>
                        )}
                        <ButtonGroup size="sm" isAttached variant="outline">
                            <Tooltip 
                                label="Rich text editor with formatting toolbar - edit visually like a word processor" 
                                placement="top"
                            >
                                <Button
                                    onClick={() => setEditorMode('visual')}
                                    variant={editorMode === 'visual' ? 'solid' : 'outline'}
                                    bg={editorMode === 'visual' ? primaryBlue : 'transparent'}
                                    color={editorMode === 'visual' ? 'white' : textSecondary}
                                    borderColor={cardBorder}
                                >
                                    Visual
                                </Button>
                            </Tooltip>
                            <Tooltip 
                                label="Edit raw HTML code directly - for advanced users who want precise control" 
                                placement="top"
                            >
                                <Button
                                    onClick={() => setEditorMode('source')}
                                    variant={editorMode === 'source' ? 'solid' : 'outline'}
                                    bg={editorMode === 'source' ? primaryBlue : 'transparent'}
                                    color={editorMode === 'source' ? 'white' : textSecondary}
                                    borderColor={cardBorder}
                                >
                                    Source
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                    </HStack>
                </HStack>

                <Tabs 
                    variant="soft-rounded" 
                    colorScheme="blue"
                    index={activeTab}
                    onChange={setActiveTab}
                >
                    <TabList bg={bg} p={2} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                        <Tooltip 
                            label={editorMode === 'visual' 
                                ? "Write and format your email content here" 
                                : "Edit the raw HTML source code directly"} 
                            placement="top"
                        >
                            <Tab color={textMuted} _selected={{ bg: primaryBlue, color: "white" }}>
                                {editorMode === 'visual' ? 'Compose' : 'Edit'}
                            </Tab>
                        </Tooltip>
                        <Tooltip 
                            label="Preview how your email will look with all formatting applied" 
                            placement="top"
                        >
                            <Tab color={textMuted} _selected={{ bg: primaryBlue, color: "white" }}>
                                HTML Preview
                            </Tab>
                        </Tooltip>
                        <Tooltip 
                            label="See how your email appears in plain text for email clients that don't support HTML" 
                            placement="top"
                        >
                            <Tab color={textMuted} _selected={{ bg: primaryBlue, color: "white" }}>
                                Plain Text
                            </Tab>
                        </Tooltip>
                    </TabList>

                    <TabPanels>
                        <TabPanel px={0}>
                            {editorMode === 'visual' ? (
                                <Box>
                                    {/* Toolbar */}
                                    {!isReadOnly && (
                                        <HStack
                                            p={2}
                                            mb={2}
                                            bg={bg}
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            borderRadius="md"
                                            spacing={1}
                                        >
                                            <ToolbarButton
                                                icon={<FiBold />}
                                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                                isActive={editor?.isActive('bold')}
                                                tooltip="Bold"
                                            />
                                            <ToolbarButton
                                                icon={<FiItalic />}
                                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                                isActive={editor?.isActive('italic')}
                                                tooltip="Italic"
                                            />
                                            <ToolbarButton
                                                icon={<FiUnderline />}
                                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                                isActive={editor?.isActive('underline')}
                                                tooltip="Underline"
                                            />
                                            <Divider orientation="vertical" h={6} borderColor={cardBorder} />
                                            <ToolbarButton
                                                icon={<FiList />}
                                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                                isActive={editor?.isActive('bulletList')}
                                                tooltip="Bullet List"
                                            />
                                            <ToolbarButton
                                                icon={<FiLink />}
                                                onClick={addLink}
                                                isActive={editor?.isActive('link')}
                                                tooltip="Add Link"
                                            />
                                            <ToolbarButton
                                                icon={<FiCode />}
                                                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                                                isActive={editor?.isActive('codeBlock')}
                                                tooltip="Code Block"
                                            />
                                            <Divider orientation="vertical" h={6} borderColor={cardBorder} />
                                            <ToolbarButton
                                                icon={<FiAlignLeft />}
                                                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                                                isActive={editor?.isActive({ textAlign: 'left' })}
                                                tooltip="Align Left"
                                            />
                                            <ToolbarButton
                                                icon={<FiAlignCenter />}
                                                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                                                isActive={editor?.isActive({ textAlign: 'center' })}
                                                tooltip="Align Center"
                                            />
                                            <ToolbarButton
                                                icon={<FiAlignRight />}
                                                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                                                isActive={editor?.isActive({ textAlign: 'right' })}
                                                tooltip="Align Right"
                                            />
                                        </HStack>
                                    )}
                                    
                                    {/* Editor */}
                                    <Box
                                        bg={isReadOnly ? readOnlyBg : inputBg}
                                        border="1px solid"
                                        borderColor={isReadOnly ? readOnlyBorder : cardBorder}
                                        borderRadius="md"
                                        minH="400px"
                                        p={4}
                                        sx={{
                                            '.ProseMirror': {
                                                minHeight: '380px',
                                                outline: 'none',
                                                color: isReadOnly ? readOnlyColor : textPrimary,
                                                '& p': { marginBottom: '1em' },
                                                '& h1, & h2, & h3': { 
                                                    fontWeight: 'bold', 
                                                    marginBottom: '0.5em',
                                                    marginTop: '1em'
                                                },
                                                '& h1': { fontSize: '2em' },
                                                '& h2': { fontSize: '1.5em' },
                                                '& h3': { fontSize: '1.2em' },
                                                '& ul, & ol': { 
                                                    paddingLeft: '2em',
                                                    marginBottom: '1em'
                                                },
                                                '& li': { marginBottom: '0.5em' },
                                                '& blockquote': {
                                                    borderLeft: '3px solid',
                                                    borderColor: cardBorder,
                                                    paddingLeft: '1em',
                                                    marginLeft: '0',
                                                    fontStyle: 'italic',
                                                    color: textSecondary
                                                },
                                                '& code': {
                                                    backgroundColor: cardGradientBg,
                                                    padding: '0.2em 0.4em',
                                                    borderRadius: '3px',
                                                    fontSize: '0.9em',
                                                    fontFamily: 'monospace'
                                                },
                                                '& pre': {
                                                    backgroundColor: cardGradientBg,
                                                    padding: '1em',
                                                    borderRadius: '5px',
                                                    overflow: 'auto',
                                                    marginBottom: '1em'
                                                }
                                            }
                                        }}
                                    >
                                        <EditorContent editor={editor} />
                                    </Box>
                                </Box>
                            ) : (
                                <Textarea
                                    value={sourceContent}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSourceChange(e.target.value)}
                                    placeholder={contentType === 'markdown'
                                        ? "Write in Markdown format..."
                                        : "Edit HTML source..."}
                                    minHeight="450px"
                                    fontFamily="mono"
                                    fontSize="sm"
                                    bg={inputBg}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                    _hover={{ borderColor: hoverBorderColor }}
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)' }}
                                    isReadOnly={isReadOnly}
                                />
                            )}
                        </TabPanel>

                        <TabPanel px={0}>
                            <Box
                                bg={bg}
                                p={6}
                                borderRadius="md"
                                minHeight="400px"
                                border="1px solid"
                                borderColor={cardBorder}
                            >
                                {contentType === 'markdown' ? (
                                    <Box
                                        sx={{
                                            '& h1, & h2, & h3, & h4, & h5, & h6': { 
                                                fontWeight: 'bold', 
                                                marginBottom: '0.5em',
                                                color: textPrimary
                                            },
                                            '& p': { 
                                                marginBottom: '1em', 
                                                color: textPrimary,
                                                lineHeight: '1.6'
                                            },
                                            '& a': { 
                                                color: primaryBlue, 
                                                textDecoration: 'underline',
                                                '&:hover': {
                                                    color: primaryBlueHover
                                                }
                                            },
                                            '& ul, & ol': { 
                                                paddingLeft: '2em', 
                                                marginBottom: '1em',
                                                '& li': {
                                                    color: textPrimary
                                                }
                                            },
                                            '& li': { 
                                                marginBottom: '0.5em', 
                                                color: textPrimary 
                                            },
                                            '& blockquote': {
                                                borderLeft: '3px solid',
                                                borderColor: cardBorder,
                                                paddingLeft: '1em',
                                                marginLeft: '0',
                                                fontStyle: 'italic',
                                                color: textSecondary
                                            },
                                            '& code': {
                                                backgroundColor: cardGradientBg,
                                                padding: '0.2em 0.4em',
                                                borderRadius: '3px',
                                                fontSize: '0.9em',
                                                fontFamily: 'monospace',
                                                color: primaryBlue
                                            },
                                            '& pre': {
                                                backgroundColor: cardGradientBg,
                                                padding: '1em',
                                                borderRadius: '5px',
                                                overflow: 'auto',
                                                marginBottom: '1em',
                                                '& code': {
                                                    backgroundColor: 'transparent',
                                                    padding: '0',
                                                    color: textPrimary
                                                }
                                            },
                                            '& strong': { 
                                                fontWeight: 'bold',
                                                color: textPrimary
                                            },
                                            '& em': { 
                                                fontStyle: 'italic',
                                                color: textPrimary
                                            },
                                            '& hr': {
                                                border: 'none',
                                                borderTop: '1px solid',
                                                borderColor: cardBorder,
                                                marginTop: '1em',
                                                marginBottom: '1em'
                                            },
                                            '& table': {
                                                width: '100%',
                                                marginBottom: '1em',
                                                borderCollapse: 'collapse',
                                                '& th, & td': {
                                                    padding: '0.5em',
                                                    border: '1px solid',
                                                    borderColor: cardBorder,
                                                    color: textPrimary
                                                },
                                                '& th': {
                                                    fontWeight: 'bold',
                                                    backgroundColor: cardGradientBg
                                                }
                                            }
                                        }}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {sourceContent}
                                        </ReactMarkdown>
                                    </Box>
                                ) : (
                                    <Box
                                        dangerouslySetInnerHTML={{ __html: sourceContent }}
                                        sx={{
                                            // Apply comprehensive HTML email styling
                                            '& *': {
                                                color: textPrimary // Default text color for all elements
                                            },
                                            '& h1, & h2, & h3, & h4, & h5, & h6': { 
                                                fontWeight: 'bold', 
                                                marginBottom: '0.5em',
                                                marginTop: '0.5em',
                                                color: textPrimary
                                            },
                                            '& h1': { fontSize: '2em' },
                                            '& h2': { fontSize: '1.5em' },
                                            '& h3': { fontSize: '1.2em' },
                                            '& h4': { fontSize: '1em' },
                                            '& p': { 
                                                marginBottom: '1em',
                                                color: textPrimary,
                                                lineHeight: '1.6'
                                            },
                                            '& a': { 
                                                color: primaryBlue, 
                                                textDecoration: 'underline',
                                                '&:hover': {
                                                    color: primaryBlueHover
                                                }
                                            },
                                            '& ul, & ol': { 
                                                paddingLeft: '2em', 
                                                marginBottom: '1em',
                                                '& li': {
                                                    color: textPrimary,
                                                    marginBottom: '0.5em'
                                                }
                                            },
                                            '& blockquote': {
                                                borderLeft: '3px solid',
                                                borderColor: cardBorder,
                                                paddingLeft: '1em',
                                                marginLeft: '0',
                                                fontStyle: 'italic',
                                                color: textSecondary
                                            },
                                            '& code': {
                                                backgroundColor: cardGradientBg,
                                                padding: '0.2em 0.4em',
                                                borderRadius: '3px',
                                                fontSize: '0.9em',
                                                fontFamily: 'monospace',
                                                color: primaryBlue
                                            },
                                            '& pre': {
                                                backgroundColor: cardGradientBg,
                                                padding: '1em',
                                                borderRadius: '5px',
                                                overflow: 'auto',
                                                marginBottom: '1em',
                                                '& code': {
                                                    backgroundColor: 'transparent',
                                                    padding: '0',
                                                    color: textPrimary
                                                }
                                            },
                                            '& strong, & b': { 
                                                fontWeight: 'bold',
                                                color: textPrimary
                                            },
                                            '& em, & i': { 
                                                fontStyle: 'italic',
                                                color: textPrimary
                                            },
                                            '& u': {
                                                textDecoration: 'underline',
                                                color: textPrimary
                                            },
                                            '& hr': {
                                                border: 'none',
                                                borderTop: '1px solid',
                                                borderColor: cardBorder,
                                                marginTop: '1em',
                                                marginBottom: '1em'
                                            },
                                            '& table': {
                                                width: '100%',
                                                marginBottom: '1em',
                                                borderCollapse: 'collapse',
                                                '& th, & td': {
                                                    padding: '0.5em',
                                                    border: '1px solid',
                                                    borderColor: cardBorder,
                                                    color: textPrimary
                                                },
                                                '& th': {
                                                    fontWeight: 'bold',
                                                    backgroundColor: cardGradientBg
                                                }
                                            },
                                            '& img': {
                                                maxWidth: '100%',
                                                height: 'auto',
                                                marginBottom: '1em'
                                            },
                                            // Common email client specific elements
                                            '& span': {
                                                color: 'inherit' // Let spans inherit parent color
                                            },
                                            '& div': {
                                                color: textPrimary
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel px={0}>
                            <Box
                                bg={bg}
                                p={6}
                                borderRadius="md"
                                minHeight="400px"
                                border="1px solid"
                                borderColor={cardBorder}
                            >
                                <Text
                                    whiteSpace="pre-wrap"
                                    color={textSecondary}
                                    fontFamily="system-ui, -apple-system, sans-serif"
                                    fontSize="14px"
                                    lineHeight="1.6"
                                >
                                    {htmlToPlainText(sourceContent)}
                                </Text>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </FormControl>
        </VStack>
    );
};

export default EmailComposer;