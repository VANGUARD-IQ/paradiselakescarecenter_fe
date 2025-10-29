import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    HStack,
    VStack,
    Badge,
    useColorMode,
    Spinner,
    Alert,
    AlertIcon,
    Divider,
    Tag,
    TagLabel,
    Card,
    CardBody,
    Flex,
    Button,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { UnifiedLoginModal } from "../authentication/components/UnifiedLoginModal";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor, brandConfig } from "../../brandConfig";
import { format } from "date-fns";
import DOMPurify from "dompurify";

const GET_SHARED_ARTICLE = gql`
    query GetSharedArticle($token: String!) {
        sharedCompanyKnowledgeArticle(token: $token) {
            id
            title
            content
            category
            tags
            viewCount
            createdAt
            updatedAt
        }
    }
`;

const SharedArticleViewer: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { colorMode } = useColorMode();
    usePageTitle("Shared Knowledge Article");

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

    // Check if user is already authenticated
    useEffect(() => {
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            setIsAuthenticated(true);
        } else {
            setShowLoginModal(true);
        }
    }, []);

    const { data, loading, error } = useQuery(GET_SHARED_ARTICLE, {
        variables: { token },
        skip: !token || !isAuthenticated,
    });

    const handleLoginSuccess = (authToken: string) => {
        localStorage.setItem('auth_token', authToken);
        setIsAuthenticated(true);
        setShowLoginModal(false);
    };

    // Show login modal if not authenticated
    if (!isAuthenticated) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />

                <Container maxW="container.lg" py={8} flex="1">
                    <VStack spacing={6} align="center" py={12}>
                        <Badge colorScheme="blue" fontSize="md" px={4} py={2}>
                            🔐 SHARED ARTICLE - Login Required
                        </Badge>
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} textAlign="center">
                            Authentication Required
                        </Heading>
                        <Text color={textSecondary} textAlign="center" maxW="md">
                            This is a shared knowledge article. Please log in to view the content.
                        </Text>
                        <Button colorScheme="blue" onClick={() => setShowLoginModal(true)} size="lg">
                            Sign In to Continue
                        </Button>
                    </VStack>
                </Container>

                <FooterWithFourColumns />

                <UnifiedLoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={handleLoginSuccess}
                />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={8} flex="1">
                    <Flex justify="center" align="center" minH="400px">
                        <Spinner size="xl" />
                    </Flex>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !data?.sharedCompanyKnowledgeArticle) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={8} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        {error?.message || "Article not found or share link expired"}
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const article = data.sharedCompanyKnowledgeArticle;
    const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />

            <Container maxW="container.lg" py={8} flex="1">
                <VStack align="stretch" spacing={6}>
                    {/* Shared Badge */}
                    <Badge colorScheme="blue" alignSelf="start" fontSize="sm" px={3} py={1}>
                        🔐 SHARED ARTICLE - Login Required
                    </Badge>

                    {/* Title */}
                    <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size="2xl">
                        {article.title}
                    </Heading>

                    {/* Metadata */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <HStack justify="space-between" wrap="wrap" spacing={4}>
                                {article.category && (
                                    <HStack>
                                        <Text fontSize="sm" color={textSecondary}>Category:</Text>
                                        <Badge colorScheme="cyan">{article.category}</Badge>
                                    </HStack>
                                )}
                                <Text fontSize="sm" color={textSecondary}>
                                    👁️ {article.viewCount || 0} views
                                </Text>
                                <Text fontSize="sm" color={textSecondary}>
                                    Last updated: {format(new Date(article.updatedAt), 'MMM dd, yyyy')}
                                </Text>
                            </HStack>
                        </CardBody>
                    </Card>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <HStack wrap="wrap" spacing={2}>
                            <Text fontSize="sm" color={textSecondary}>Tags:</Text>
                            {article.tags.map((tag: string) => (
                                <Tag key={tag} colorScheme="blue">
                                    <TagLabel>{tag}</TagLabel>
                                </Tag>
                            ))}
                        </HStack>
                    )}

                    <Divider />

                    {/* Article Content */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <Box
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                sx={{
                                    '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: 4, mt: 6, color: textPrimary },
                                    '& h2': { fontSize: 'xl', fontWeight: 'bold', mb: 3, mt: 5, color: textPrimary },
                                    '& h3': { fontSize: 'lg', fontWeight: 'bold', mb: 2, mt: 4, color: textPrimary },
                                    '& p': { mb: 4, lineHeight: '1.8', color: textPrimary },
                                    '& ul, & ol': { ml: 6, mb: 4, color: textPrimary },
                                    '& li': { mb: 2, lineHeight: '1.6' },
                                    '& a': { color: 'blue.500', textDecoration: 'underline', _hover: { color: 'blue.700' } },
                                    '& code': { bg: 'gray.100', px: 2, py: 1, borderRadius: 'md', fontSize: 'sm', fontFamily: 'mono' },
                                    '& pre': { bg: 'gray.800', color: 'white', p: 4, borderRadius: 'md', overflowX: 'auto', mb: 4 },
                                    '& img': { maxW: '100%', borderRadius: 'md', my: 4, boxShadow: 'md' },
                                    '& blockquote': {
                                        borderLeft: '4px solid',
                                        borderColor: 'blue.500',
                                        pl: 4,
                                        py: 2,
                                        fontStyle: 'italic',
                                        mb: 4,
                                        bg: colorMode === 'light' ? 'blue.50' : 'rgba(66, 153, 225, 0.1)'
                                    },
                                    '& table': { width: '100%', mb: 4, borderCollapse: 'collapse' },
                                    '& th': { bg: 'gray.100', p: 2, border: '1px solid', borderColor: 'gray.300', fontWeight: 'bold' },
                                    '& td': { p: 2, border: '1px solid', borderColor: 'gray.300' },
                                }}
                            />
                        </CardBody>
                    </Card>

                    {/* Footer Info */}
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <Text fontSize="sm" color={textSecondary} textAlign="center">
                                This is a shared knowledge article. Authentication required to view.
                            </Text>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default SharedArticleViewer;
