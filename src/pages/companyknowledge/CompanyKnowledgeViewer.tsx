import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    Badge,
    useColorMode,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Divider,
    Tag,
    TagLabel,
    Card,
    CardBody,
    Flex,
    IconButton,
    Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, StarIcon, CopyIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companyKnowledgeModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor, brandConfig } from "../../brandConfig";
import { format } from "date-fns";
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
            shareToken
            isPinned
            isPublished
            viewCount
            metaDescription
            createdAt
            updatedAt
        }
    }
`;

const DELETE_ARTICLE = gql`
    mutation DeleteArticle($id: ID!) {
        deleteCompanyKnowledgeArticle(id: $id)
    }
`;

const TOGGLE_PIN = gql`
    mutation TogglePin($id: ID!) {
        togglePinCompanyKnowledgeArticle(id: $id) {
            id
            isPinned
        }
    }
`;

const CompanyKnowledgeViewer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    usePageTitle("View Article");

    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

    const { data, loading, error } = useQuery(GET_ARTICLE, {
        variables: { id },
        skip: !id,
    });

    const [deleteArticle] = useMutation(DELETE_ARTICLE, {
        onCompleted: () => {
            toast({
                title: "Article deleted",
                status: "success",
                duration: 3000,
            });
            navigate("/companyknowledge");
        },
        onError: (error) => {
            toast({
                title: "Error deleting article",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        },
    });

    const [togglePin] = useMutation(TOGGLE_PIN, {
        onCompleted: () => {
            toast({
                title: "Pin status updated",
                status: "success",
                duration: 2000,
            });
        },
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
            deleteArticle({ variables: { id } });
        }
    };

    const copyShareLink = () => {
        const link = article.allowPublicAccess
            ? `${window.location.origin}/kb/${article.publicSlug}`
            : article.shareToken
                ? `${window.location.origin}/kb/shared/${article.shareToken}`
                : null;

        if (link) {
            navigator.clipboard.writeText(link);
            toast({
                title: "Link copied!",
                description: "Share link copied to clipboard",
                status: "success",
                duration: 2000,
            });
        }
    };

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

    if (error || !data?.companyKnowledgeArticle) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        {error?.message || "Article not found"}
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const article = data.companyKnowledgeArticle;
    const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />

            <Container maxW="container.lg" py={8} flex="1">
                {/* Header */}
                <VStack align="stretch" spacing={6}>
                    {/* Title & Actions */}
                    <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
                            <HStack>
                                {article.isPinned && (
                                    <StarIcon color="yellow.400" boxSize={5} />
                                )}
                                <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                                    {article.title}
                                </Heading>
                            </HStack>
                            <HStack spacing={2}>
                                <Badge colorScheme={article.allowPublicAccess ? "green" : article.visibility === "SHARED" ? "blue" : "purple"}>
                                    {article.allowPublicAccess ? "PUBLIC" : article.visibility}
                                </Badge>
                                {!article.isPublished && (
                                    <Badge colorScheme="gray">DRAFT</Badge>
                                )}
                                {article.category && (
                                    <Badge colorScheme="cyan">{article.category}</Badge>
                                )}
                            </HStack>
                        </VStack>
                        <HStack>
                            <Tooltip label="Copy share link">
                                <IconButton
                                    icon={<CopyIcon />}
                                    aria-label="Copy link"
                                    onClick={copyShareLink}
                                    variant="ghost"
                                />
                            </Tooltip>
                            <Tooltip label={article.isPinned ? "Unpin" : "Pin"}>
                                <IconButton
                                    icon={<StarIcon />}
                                    aria-label="Toggle pin"
                                    onClick={() => togglePin({ variables: { id } })}
                                    variant="ghost"
                                    color={article.isPinned ? "yellow.400" : undefined}
                                />
                            </Tooltip>
                            <Button
                                leftIcon={<EditIcon />}
                                onClick={() => navigate(`/companyknowledge/${id}/edit`)}
                                size="sm"
                            >
                                Edit
                            </Button>
                            <Button
                                leftIcon={<DeleteIcon />}
                                colorScheme="red"
                                variant="outline"
                                onClick={handleDelete}
                                size="sm"
                            >
                                Delete
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Metadata */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <HStack justify="space-between" wrap="wrap">
                                <Text fontSize="sm" color={textSecondary}>
                                    👁️ {article.viewCount || 0} views
                                </Text>
                                <Text fontSize="sm" color={textSecondary}>
                                    Created: {format(new Date(article.createdAt), 'MMM dd, yyyy')}
                                </Text>
                                <Text fontSize="sm" color={textSecondary}>
                                    Updated: {format(new Date(article.updatedAt), 'MMM dd, yyyy')}
                                </Text>
                            </HStack>
                        </CardBody>
                    </Card>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <HStack wrap="wrap" spacing={2}>
                            {article.tags.map((tag: string) => (
                                <Tag key={tag} colorScheme="blue">
                                    <TagLabel>{tag}</TagLabel>
                                </Tag>
                            ))}
                        </HStack>
                    )}

                    {/* Public/Share Link Info */}
                    {(article.publicSlug || article.shareToken) && (
                        <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    {article.publicSlug && (
                                        <VStack align="stretch" spacing={2}>
                                            <Text fontSize="sm" color={textSecondary} fontWeight="bold">Public URL:</Text>
                                            <HStack>
                                                <Button
                                                    as="a"
                                                    href={`/kb/${article.publicSlug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    colorScheme="green"
                                                    size="sm"
                                                    flex={1}
                                                >
                                                    🌐 Open Public Link
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/kb/${article.publicSlug}`);
                                                        toast({
                                                            title: "Link copied!",
                                                            description: "Public URL copied to clipboard",
                                                            status: "success",
                                                            duration: 2000,
                                                        });
                                                    }}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Copy
                                                </Button>
                                            </HStack>
                                            <Text fontSize="xs" color={textSecondary} fontFamily="mono">
                                                {window.location.origin}/kb/{article.publicSlug}
                                            </Text>
                                        </VStack>
                                    )}
                                    {article.shareToken && (
                                        <VStack align="stretch" spacing={2}>
                                            <Text fontSize="sm" color={textSecondary} fontWeight="bold">Share URL:</Text>
                                            <HStack>
                                                <Button
                                                    as="a"
                                                    href={`/kb/shared/${article.shareToken}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    colorScheme="blue"
                                                    size="sm"
                                                    flex={1}
                                                >
                                                    🔐 Open Shared Link
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/kb/shared/${article.shareToken}`);
                                                        toast({
                                                            title: "Link copied!",
                                                            description: "Share URL copied to clipboard",
                                                            status: "success",
                                                            duration: 2000,
                                                        });
                                                    }}
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Copy
                                                </Button>
                                            </HStack>
                                            <Text fontSize="xs" color={textSecondary} fontFamily="mono">
                                                {window.location.origin}/kb/shared/{article.shareToken}
                                            </Text>
                                        </VStack>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    <Divider />

                    {/* Article Content */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <Box
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                sx={{
                                    '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: 4, color: textPrimary },
                                    '& h2': { fontSize: 'xl', fontWeight: 'bold', mb: 3, color: textPrimary },
                                    '& h3': { fontSize: 'lg', fontWeight: 'bold', mb: 2, color: textPrimary },
                                    '& p': { mb: 4, color: textPrimary },
                                    '& ul, & ol': { ml: 6, mb: 4, color: textPrimary },
                                    '& li': { mb: 2 },
                                    '& a': { color: 'blue.500', textDecoration: 'underline' },
                                    '& code': { bg: 'gray.100', px: 2, py: 1, borderRadius: 'md', fontSize: 'sm' },
                                    '& pre': { bg: 'gray.100', p: 4, borderRadius: 'md', overflowX: 'auto', mb: 4 },
                                    '& img': { maxW: '100%', borderRadius: 'md', my: 4 },
                                    '& blockquote': { borderLeft: '4px solid', borderColor: 'blue.500', pl: 4, py: 2, fontStyle: 'italic', mb: 4 },
                                }}
                            />
                        </CardBody>
                    </Card>

                    {/* Back Button */}
                    <Button onClick={() => navigate("/companyknowledge")} variant="outline">
                        ← Back to Articles
                    </Button>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyKnowledgeViewer;
