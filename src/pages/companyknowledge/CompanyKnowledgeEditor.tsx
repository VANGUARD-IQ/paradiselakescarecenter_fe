import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    useColorMode,
    useToast,
    Spinner,
    Card,
    CardBody,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Switch,
    IconButton,
    Tooltip,
    Divider,
    Tag,
    TagLabel,
    TagCloseButton,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiList,
    FiLink,
    FiCode,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiImage,
    FiVideo,
    FiUpload,
} from "react-icons/fi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companyKnowledgeModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor, brandConfig } from "../../brandConfig";
import DOMPurify from "dompurify";

const GET_ARTICLE = gql`
    query GetArticle($id: ID!) {
        companyKnowledgeArticle(id: $id) {
            id
            title
            content
            category
            tags
            visibility
            allowPublicAccess
            publicSlug
            isPinned
            isPublished
            metaDescription
        }
    }
`;

const CREATE_ARTICLE = gql`
    mutation CreateArticle($input: CompanyKnowledgeInput!) {
        createCompanyKnowledgeArticle(input: $input) {
            id
            title
        }
    }
`;

const UPDATE_ARTICLE = gql`
    mutation UpdateArticle($id: ID!, $input: UpdateCompanyKnowledgeInput!) {
        updateCompanyKnowledgeArticle(id: $id, input: $input) {
            id
            title
        }
    }
`;

interface ArticleFormData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    visibility: string;
    allowPublicAccess: boolean;
    publicSlug: string;
    isPinned: boolean;
    isPublished: boolean;
    metaDescription: string;
}

const CompanyKnowledgeEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    usePageTitle(id === "new" ? "Create Article" : "Edit Article");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editorMode, setEditorMode] = useState<"visual" | "source">("visual");
    const [sourceContent, setSourceContent] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [newTag, setNewTag] = useState("");

    // Color mode values
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const inputBg = useColorModeValue("white", "gray.700");
    const primaryBlue = useColorModeValue("blue.500", "blue.400");
    const primaryBlueHover = useColorModeValue("blue.600", "blue.500");
    const overlayBg = useColorModeValue("gray.100", "gray.700");
    const instructionBg = useColorModeValue("blue.50", "blue.900");
    const instructionBorder = useColorModeValue("blue.200", "blue.700");

    const [formData, setFormData] = useState<ArticleFormData>({
        title: "",
        content: "",
        category: "",
        tags: [],
        visibility: "PRIVATE",
        allowPublicAccess: false,
        publicSlug: "",
        isPinned: false,
        isPublished: false,
        metaDescription: "",
    });

    const isEditMode = id && id !== "new";

    const { data, loading } = useQuery(GET_ARTICLE, {
        variables: { id: id as string },
        skip: !isEditMode,
        onCompleted: (data) => {
            if (data?.companyKnowledgeArticle) {
                const article = data.companyKnowledgeArticle;
                setFormData({
                    title: article.title || "",
                    content: article.content || "",
                    category: article.category || "",
                    tags: article.tags || [],
                    visibility: article.visibility || "PRIVATE",
                    allowPublicAccess: article.allowPublicAccess || false,
                    publicSlug: article.publicSlug || "",
                    isPinned: article.isPinned || false,
                    isPublished: article.isPublished || false,
                    metaDescription: article.metaDescription || "",
                });
                setSourceContent(article.content || "");
            }
        },
    });

    const [createArticle, { loading: creating }] = useMutation(CREATE_ARTICLE, {
        onCompleted: (data) => {
            toast({
                title: "Article created",
                status: "success",
                duration: 3000,
            });
            navigate(`/companyknowledge/${data.createCompanyKnowledgeArticle.id}`);
        },
        onError: (error) => {
            toast({
                title: "Error creating article",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        },
    });

    const [updateArticle, { loading: updating }] = useMutation(UPDATE_ARTICLE, {
        onCompleted: (data) => {
            toast({
                title: "Article updated",
                status: "success",
                duration: 3000,
            });
            navigate(`/companyknowledge/${data.updateCompanyKnowledgeArticle.id}`);
        },
        onError: (error) => {
            toast({
                title: "Error updating article",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        },
    });

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    style: "color: #3434ef; text-decoration: underline;",
                },
                autolink: true,
                linkOnPaste: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "article-image",
                },
            }),
        ],
        content: formData.content,
        onUpdate: ({ editor }) => {
            if (editorMode === "visual") {
                const html = editor.getHTML();
                setFormData({ ...formData, content: html });
                setSourceContent(html);
            }
        },
    });

    // Update editor when content changes externally
    useEffect(() => {
        if (editor && formData.content !== editor.getHTML() && editorMode === "visual") {
            editor.commands.setContent(formData.content);
        }
    }, [formData.content, editor, editorMode]);

    const handleSourceChange = (value: string) => {
        setSourceContent(value);
        setFormData({ ...formData, content: value });
        if (editor) {
            editor.commands.setContent(value);
        }
    };

    const addLink = () => {
        const url = window.prompt("Enter URL:");
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt("Enter image URL (or upload via IPFS):");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const embedVideo = () => {
        const url = window.prompt("Enter video URL (YouTube, Rumble, or IPFS):");
        if (url && editor) {
            // Create an iframe embed for the video
            let embedHtml = "";
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                const videoId = url.includes("youtu.be")
                    ? url.split("/").pop()
                    : new URL(url).searchParams.get("v");
                embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            } else if (url.includes("rumble.com")) {
                embedHtml = `<iframe width="560" height="315" src="${url}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                // Assume IPFS video
                embedHtml = `<video width="560" height="315" controls><source src="${url}" type="video/mp4"></video>`;
            }

            editor.chain().focus().insertContent(embedHtml).run();
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (file.name.endsWith(".md")) {
                    // Import markdown - convert to HTML or set as source
                    setSourceContent(content);
                    setFormData({ ...formData, content });
                } else {
                    // Assume HTML
                    setFormData({ ...formData, content });
                    setSourceContent(content);
                    if (editor) {
                        editor.commands.setContent(content);
                    }
                }
                toast({
                    title: "File imported",
                    status: "success",
                    duration: 2000,
                });
            };
            reader.readAsText(file);
        }
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData({ ...formData, tags: [...formData.tags, newTag] });
            setNewTag("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    };

    const handleSubmit = () => {
        const input = {
            title: formData.title,
            content: formData.content,
            category: formData.category || undefined,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            visibility: formData.visibility,
            allowPublicAccess: formData.allowPublicAccess,
            publicSlug: formData.publicSlug || undefined,
            isPinned: formData.isPinned,
            isPublished: formData.isPublished,
            metaDescription: formData.metaDescription || undefined,
        };

        if (isEditMode) {
            updateArticle({ variables: { id, input } });
        } else {
            createArticle({ variables: { input } });
        }
    };

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
                bg={isActive ? primaryBlue : "transparent"}
                color={isActive ? "white" : textSecondary}
                _hover={{
                    bg: isActive ? primaryBlueHover : overlayBg,
                    color: isActive ? "white" : textPrimary,
                }}
                onClick={onClick}
            />
        </Tooltip>
    );

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Flex justify="center" align="center" minH="400px">
                        <Spinner size="xl" />
                    </Flex>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />

            <Container maxW="container.xl" py={8} flex="1">
                <VStack align="stretch" spacing={6}>
                    {/* Header */}
                    <Flex justify="space-between" align="center">
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                            {id === "new" ? "Create Article" : "Edit Article"}
                        </Heading>
                        <HStack>
                            <Button variant="outline" onClick={() => navigate("/companyknowledge")}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleSubmit}
                                isLoading={creating || updating}
                                loadingText={id === "new" ? "Creating..." : "Saving..."}
                            >
                                {id === "new" ? "Create Article" : "Save Changes"}
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Basic Info */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>Title</FormLabel>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Article title"
                                        size="lg"
                                        bg={inputBg}
                                        color={textPrimary}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel color={textPrimary}>Meta Description (SEO)</FormLabel>
                                    <Textarea
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        placeholder="Brief description for search engines"
                                        bg={inputBg}
                                        color={textPrimary}
                                        rows={2}
                                    />
                                </FormControl>

                                <HStack spacing={4}>
                                    <FormControl>
                                        <FormLabel color={textPrimary}>Category</FormLabel>
                                        <Input
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Training, Process, Guidelines"
                                            bg={inputBg}
                                            color={textPrimary}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel color={textPrimary}>Visibility</FormLabel>
                                        <Select
                                            value={formData.visibility}
                                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                            bg={inputBg}
                                            color={textPrimary}
                                        >
                                            <option value="PRIVATE">Private (Permission Required)</option>
                                            <option value="SHARED">Shared (Login Required)</option>
                                            <option value="PUBLIC">Public (No Login)</option>
                                        </Select>
                                    </FormControl>
                                </HStack>

                                {/* Tags */}
                                <FormControl>
                                    <FormLabel color={textPrimary}>Tags</FormLabel>
                                    <HStack>
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add a tag"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddTag();
                                                }
                                            }}
                                            bg={inputBg}
                                            color={textPrimary}
                                        />
                                        <Button onClick={handleAddTag} size="sm">
                                            Add
                                        </Button>
                                    </HStack>
                                    {formData.tags.length > 0 && (
                                        <HStack wrap="wrap" spacing={2} mt={2}>
                                            {formData.tags.map((tag) => (
                                                <Tag key={tag} colorScheme="blue">
                                                    <TagLabel>{tag}</TagLabel>
                                                    <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                                                </Tag>
                                            ))}
                                        </HStack>
                                    )}
                                </FormControl>

                                {/* Public Access */}
                                {formData.visibility === "PUBLIC" && (
                                    <FormControl>
                                        <HStack justify="space-between">
                                            <FormLabel color={textPrimary} mb={0}>
                                                Allow Public Access
                                            </FormLabel>
                                            <Switch
                                                isChecked={formData.allowPublicAccess}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, allowPublicAccess: e.target.checked })
                                                }
                                                colorScheme="green"
                                            />
                                        </HStack>
                                        {formData.allowPublicAccess && (
                                            <Input
                                                value={formData.publicSlug}
                                                onChange={(e) => setFormData({ ...formData, publicSlug: e.target.value })}
                                                placeholder="custom-url-slug"
                                                mt={2}
                                                bg={inputBg}
                                                color={textPrimary}
                                            />
                                        )}
                                    </FormControl>
                                )}

                                {/* Publishing Options */}
                                <HStack spacing={8}>
                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel color={textPrimary} mb={0}>
                                            Pin Article
                                        </FormLabel>
                                        <Switch
                                            isChecked={formData.isPinned}
                                            onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                            colorScheme="yellow"
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel color={textPrimary} mb={0}>
                                            Publish
                                        </FormLabel>
                                        <Switch
                                            isChecked={formData.isPublished}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                            colorScheme="green"
                                        />
                                    </FormControl>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Content Editor */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                {/* Instructions */}
                                <Card bg={instructionBg} borderColor={instructionBorder} border="1px">
                                    <CardBody>
                                        <VStack align="stretch" spacing={2}>
                                            <Text fontWeight="bold" color={textPrimary} fontSize="sm">
                                                📝 Editor Instructions
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>Toolbar Buttons:</strong> Use Bold, Italic, Underline, Lists, Links, Code blocks, and Text alignment
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>📷 Image Button:</strong> Click to add images - enter an image URL or IPFS link (e.g., https://ipfs.io/ipfs/QmHash)
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>🎬 Video Button:</strong> Click to embed videos - supports YouTube, Rumble, and IPFS video URLs
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>📤 Import File:</strong> Click to import .md or .html files directly into the editor
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>Visual/Source:</strong> Switch between WYSIWYG editor and HTML source code editing
                                            </Text>
                                            <Text fontSize="xs" color={textSecondary}>
                                                <strong>Preview Tab:</strong> Click "Preview" to see how your article will look when published
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                <HStack justify="space-between">
                                    <FormLabel color={textPrimary} mb={0}>
                                        Article Content
                                    </FormLabel>
                                    <HStack>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileImport}
                                            accept=".md,.html"
                                            style={{ display: "none" }}
                                        />
                                        <Button
                                            size="sm"
                                            leftIcon={<FiUpload />}
                                            onClick={() => fileInputRef.current?.click()}
                                            variant="outline"
                                        >
                                            Import File
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setEditorMode("visual")}
                                            variant={editorMode === "visual" ? "solid" : "outline"}
                                            colorScheme={editorMode === "visual" ? "blue" : undefined}
                                        >
                                            Visual
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setEditorMode("source")}
                                            variant={editorMode === "source" ? "solid" : "outline"}
                                            colorScheme={editorMode === "source" ? "blue" : undefined}
                                        >
                                            Source
                                        </Button>
                                    </HStack>
                                </HStack>

                                <Tabs variant="soft-rounded" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
                                    <TabList>
                                        <Tab>Compose</Tab>
                                        <Tab>Preview</Tab>
                                    </TabList>

                                    <TabPanels>
                                        <TabPanel px={0}>
                                            {editorMode === "visual" ? (
                                                <Box>
                                                    {/* Toolbar */}
                                                    <HStack p={2} mb={2} bg={inputBg} border="1px" borderColor={cardBorder} borderRadius="md" spacing={1} flexWrap="wrap">
                                                        <ToolbarButton
                                                            icon={<FiBold />}
                                                            onClick={() => editor?.chain().focus().toggleBold().run()}
                                                            isActive={editor?.isActive("bold")}
                                                            tooltip="Bold"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiItalic />}
                                                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                                                            isActive={editor?.isActive("italic")}
                                                            tooltip="Italic"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiUnderline />}
                                                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                                            isActive={editor?.isActive("underline")}
                                                            tooltip="Underline"
                                                        />
                                                        <Divider orientation="vertical" h={6} />
                                                        <ToolbarButton
                                                            icon={<FiList />}
                                                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                                            isActive={editor?.isActive("bulletList")}
                                                            tooltip="Bullet List"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiLink />}
                                                            onClick={addLink}
                                                            isActive={editor?.isActive("link")}
                                                            tooltip="Add Link"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiImage />}
                                                            onClick={addImage}
                                                            tooltip="Add Image"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiVideo />}
                                                            onClick={embedVideo}
                                                            tooltip="Embed Video"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiCode />}
                                                            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                                                            isActive={editor?.isActive("codeBlock")}
                                                            tooltip="Code Block"
                                                        />
                                                        <Divider orientation="vertical" h={6} />
                                                        <ToolbarButton
                                                            icon={<FiAlignLeft />}
                                                            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                                                            isActive={editor?.isActive({ textAlign: "left" })}
                                                            tooltip="Align Left"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiAlignCenter />}
                                                            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                                                            isActive={editor?.isActive({ textAlign: "center" })}
                                                            tooltip="Align Center"
                                                        />
                                                        <ToolbarButton
                                                            icon={<FiAlignRight />}
                                                            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                                                            isActive={editor?.isActive({ textAlign: "right" })}
                                                            tooltip="Align Right"
                                                        />
                                                    </HStack>

                                                    {/* Editor */}
                                                    <Box
                                                        bg={inputBg}
                                                        border="1px"
                                                        borderColor={cardBorder}
                                                        borderRadius="md"
                                                        minH="500px"
                                                        p={4}
                                                        sx={{
                                                            ".ProseMirror": {
                                                                minHeight: "480px",
                                                                outline: "none",
                                                                color: textPrimary,
                                                                "& p": { marginBottom: "1em" },
                                                                "& h1, & h2, & h3": {
                                                                    fontWeight: "bold",
                                                                    marginBottom: "0.5em",
                                                                    marginTop: "1em",
                                                                },
                                                                "& h1": { fontSize: "2em" },
                                                                "& h2": { fontSize: "1.5em" },
                                                                "& h3": { fontSize: "1.2em" },
                                                                "& ul, & ol": {
                                                                    paddingLeft: "2em",
                                                                    marginBottom: "1em",
                                                                },
                                                                "& li": { marginBottom: "0.5em" },
                                                                "& code": {
                                                                    backgroundColor: cardGradientBg,
                                                                    padding: "0.2em 0.4em",
                                                                    borderRadius: "3px",
                                                                    fontFamily: "monospace",
                                                                },
                                                                "& pre": {
                                                                    backgroundColor: cardGradientBg,
                                                                    padding: "1em",
                                                                    borderRadius: "5px",
                                                                    overflow: "auto",
                                                                    marginBottom: "1em",
                                                                },
                                                                "& img": {
                                                                    maxWidth: "100%",
                                                                    borderRadius: "md",
                                                                    marginTop: "1em",
                                                                    marginBottom: "1em",
                                                                },
                                                                "& iframe, & video": {
                                                                    maxWidth: "100%",
                                                                    marginTop: "1em",
                                                                    marginBottom: "1em",
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <EditorContent editor={editor} />
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Textarea
                                                    value={sourceContent}
                                                    onChange={(e) => handleSourceChange(e.target.value)}
                                                    placeholder="Edit HTML source..."
                                                    minHeight="550px"
                                                    fontFamily="mono"
                                                    fontSize="sm"
                                                    bg={inputBg}
                                                    color={textPrimary}
                                                />
                                            )}
                                        </TabPanel>

                                        <TabPanel px={0}>
                                            <Box
                                                bg={inputBg}
                                                p={6}
                                                borderRadius="md"
                                                minHeight="500px"
                                                border="1px"
                                                borderColor={cardBorder}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }}
                                                sx={{
                                                    "& h1, & h2, & h3": { fontWeight: "bold", marginBottom: "0.5em", color: textPrimary },
                                                    "& p": { marginBottom: "1em", color: textPrimary },
                                                    "& ul, & ol": { paddingLeft: "2em", marginBottom: "1em", color: textPrimary },
                                                    "& img": { maxWidth: "100%", borderRadius: "md", marginTop: "1em", marginBottom: "1em" },
                                                    "& code": { backgroundColor: cardGradientBg, padding: "0.2em 0.4em", borderRadius: "3px" },
                                                    "& pre": { backgroundColor: cardGradientBg, padding: "1em", borderRadius: "5px", overflow: "auto" },
                                                }}
                                            />
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Save Button */}
                    <Flex justify="flex-end">
                        <HStack>
                            <Button variant="outline" onClick={() => navigate("/companyknowledge")}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={handleSubmit}
                                isLoading={creating || updating}
                                loadingText={id === "new" ? "Creating..." : "Saving..."}
                            >
                                {id === "new" ? "Create Article" : "Save Changes"}
                            </Button>
                        </HStack>
                    </Flex>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyKnowledgeEditor;
