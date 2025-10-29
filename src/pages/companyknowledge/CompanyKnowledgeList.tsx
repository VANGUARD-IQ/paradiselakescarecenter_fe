import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    HStack,
    VStack,
    Card,
    CardBody,
    CardHeader,
    Badge,
    IconButton,
    useColorMode,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    SimpleGrid,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Tooltip,
    Flex,
    Tag,
    TagLabel,
    TagCloseButton,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, ViewIcon, EditIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companyKnowledgeModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor, brandConfig } from "../../brandConfig";
import { format } from "date-fns";

const GET_ARTICLES = gql`
    query GetArticles($category: String, $tags: [String!], $search: String, $onlyPublished: Boolean, $onlyPinned: Boolean) {
        companyKnowledgeArticles(
            category: $category
            tags: $tags
            search: $search
            onlyPublished: $onlyPublished
            onlyPinned: $onlyPinned
        ) {
            id
            title
            category
            tags
            visibility
            allowPublicAccess
            publicSlug
            isPinned
            isPublished
            viewCount
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

const CompanyKnowledgeList: React.FC = () => {
    usePageTitle("Company Knowledge");
    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showOnlyPublished, setShowOnlyPublished] = useState(false);
    const [showOnlyPinned, setShowOnlyPinned] = useState(false);

    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const primaryColor = getColor("primary", colorMode);

    const { data, loading, error, refetch } = useQuery(GET_ARTICLES, {
        variables: {
            category: selectedCategory,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            search: searchTerm || undefined,
            onlyPublished: showOnlyPublished || undefined,
            onlyPinned: showOnlyPinned || undefined,
        },
    });

    const [deleteArticle] = useMutation(DELETE_ARTICLE, {
        onCompleted: () => {
            toast({
                title: "Article deleted",
                status: "success",
                duration: 3000,
            });
            refetch();
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
            refetch();
        },
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteArticle({ variables: { id } });
        }
    };

    const getVisibilityBadge = (visibility: string, allowPublicAccess: boolean) => {
        if (allowPublicAccess) {
            return <Badge colorScheme="green">PUBLIC</Badge>;
        }
        if (visibility === "SHARED") {
            return <Badge colorScheme="blue">SHARED</Badge>;
        }
        return <Badge colorScheme="purple">PRIVATE</Badge>;
    };

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Flex justify="center" align="center" minH="400px">
                        <Spinner size="xl" color={primaryColor} />
                    </Flex>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />
                <Container maxW="container.xl" py={8} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        {error.message}
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const articles = data?.companyKnowledgeArticles || [];

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />

            <Container maxW="container.xl" py={8} flex="1">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6}>
                    <VStack align="start" spacing={1}>
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                            Company Knowledge
                        </Heading>
                        <Text color={textSecondary} fontSize="sm">
                            {articles.length} {articles.length === 1 ? 'article' : 'articles'} found
                        </Text>
                    </VStack>
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={() => navigate("/companyknowledge/new")}
                    >
                        New Article
                    </Button>
                </Flex>

                {/* Filters */}
                <Card bg={cardGradientBg} border="1px" borderColor={cardBorder} mb={6}>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            {/* Search */}
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                                    color={textPrimary}
                                />
                            </InputGroup>

                            {/* Filter Toggles */}
                            <HStack spacing={4}>
                                <Button
                                    size="sm"
                                    variant={showOnlyPublished ? "solid" : "outline"}
                                    colorScheme="green"
                                    onClick={() => setShowOnlyPublished(!showOnlyPublished)}
                                >
                                    Published Only
                                </Button>
                                <Button
                                    size="sm"
                                    variant={showOnlyPinned ? "solid" : "outline"}
                                    colorScheme="yellow"
                                    onClick={() => setShowOnlyPinned(!showOnlyPinned)}
                                    leftIcon={<StarIcon />}
                                >
                                    Pinned Only
                                </Button>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <Card bg={cardGradientBg} border="1px" borderColor={cardBorder}>
                        <CardBody>
                            <VStack py={8} spacing={4}>
                                <Text fontSize="xl" color={textSecondary}>
                                    No articles found
                                </Text>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => navigate("/companyknowledge/new")}
                                >
                                    Create Your First Article
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {articles.map((article: any) => (
                            <Card
                                key={article.id}
                                bg={cardGradientBg}
                                border="1px"
                                borderColor={cardBorder}
                                _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() => navigate(`/companyknowledge/${article.id}`)}
                            >
                                <CardHeader pb={2}>
                                    <HStack justify="space-between" align="start">
                                        <VStack align="start" spacing={1} flex={1}>
                                            <HStack>
                                                {article.isPinned && (
                                                    <StarIcon color="yellow.400" boxSize={4} />
                                                )}
                                                <Heading size="md" color={textPrimary} noOfLines={2}>
                                                    {article.title}
                                                </Heading>
                                            </HStack>
                                            <HStack spacing={2}>
                                                {getVisibilityBadge(article.visibility, article.allowPublicAccess)}
                                                {!article.isPublished && (
                                                    <Badge colorScheme="gray">DRAFT</Badge>
                                                )}
                                            </HStack>
                                        </VStack>
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                icon={<ViewIcon />}
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <MenuList>
                                                <MenuItem
                                                    icon={<ViewIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/companyknowledge/${article.id}`);
                                                    }}
                                                >
                                                    View
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<EditIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/companyknowledge/${article.id}/edit`);
                                                    }}
                                                >
                                                    Edit
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<StarIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePin({ variables: { id: article.id } });
                                                    }}
                                                >
                                                    {article.isPinned ? 'Unpin' : 'Pin'}
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<DeleteIcon />}
                                                    color="red.500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(article.id, article.title);
                                                    }}
                                                >
                                                    Delete
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                </CardHeader>
                                <CardBody pt={2}>
                                    <VStack align="stretch" spacing={3}>
                                        {/* Category */}
                                        {article.category && (
                                            <HStack>
                                                <Text fontSize="sm" color={textSecondary}>
                                                    📁 {article.category}
                                                </Text>
                                            </HStack>
                                        )}

                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <HStack wrap="wrap" spacing={2}>
                                                {article.tags.slice(0, 3).map((tag: string) => (
                                                    <Tag key={tag} size="sm" colorScheme="blue">
                                                        <TagLabel>{tag}</TagLabel>
                                                    </Tag>
                                                ))}
                                                {article.tags.length > 3 && (
                                                    <Text fontSize="xs" color={textSecondary}>
                                                        +{article.tags.length - 3} more
                                                    </Text>
                                                )}
                                            </HStack>
                                        )}

                                        {/* Stats */}
                                        <HStack justify="space-between" pt={2}>
                                            <Tooltip label="View count">
                                                <Text fontSize="sm" color={textSecondary}>
                                                    👁️ {article.viewCount || 0} views
                                                </Text>
                                            </Tooltip>
                                            <Text fontSize="xs" color={textSecondary}>
                                                {format(new Date(article.updatedAt), 'MMM dd, yyyy')}
                                            </Text>
                                        </HStack>

                                        {/* Public Slug */}
                                        {article.publicSlug && (
                                            <Text fontSize="xs" color="green.500" fontFamily="mono">
                                                /kb/{article.publicSlug}
                                            </Text>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyKnowledgeList;
