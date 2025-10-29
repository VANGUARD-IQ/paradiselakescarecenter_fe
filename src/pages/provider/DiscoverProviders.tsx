import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Button,
    Input,
    Select,
    Card,
    CardBody,
    CardHeader,
    Avatar,
    Badge,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    InputGroup,
    InputLeftElement,
    Switch,
    FormControl,
    FormLabel,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    TagCloseButton,
    useToast,
    useColorModeValue,
    Divider,
    Stack,
    IconButton,
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton
} from "@chakra-ui/react";
import {
    SearchIcon,
    ViewIcon,
    StarIcon,
    ExternalLinkIcon,
    EmailIcon,
    SettingsIcon,
    ChevronDownIcon
} from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { getColor, brandConfig } from "../../brandConfig";
import { useColorMode } from "@chakra-ui/react";

const DISCOVER_PROVIDERS = gql`
  query DiscoverProviders($searchQuery: String, $limit: Float, $scopeToTenant: Boolean) {
    discoverProviders(searchQuery: $searchQuery, limit: $limit, scopeToTenant: $scopeToTenant) {
      id
      title
      tagline
      description
      avatar
      expertise
      achievements
      status
      isPublic
      isFeatured
      contactInfo {
        email
        website
      }
      client {
        id
        fName
        lName
      }
      createdAt
      updatedAt
    }
  }
`;

const DiscoverProviders = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Theme-aware colors
    const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
    const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    
    // Filter modal state
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [scopeToTenant, setScopeToTenant] = useState(searchParams.get('scopeToTenant') !== 'false'); // Default to true unless explicitly set to false
    const [onlyFeatured, setOnlyFeatured] = useState(false);
    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('featured');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (scopeToTenant) params.set('scopeToTenant', 'true');
        if (onlyFeatured) params.set('featured', 'true');
        if (selectedExpertise.length > 0) params.set('expertise', selectedExpertise.join(','));
        if (sortBy !== 'featured') params.set('sort', sortBy);
        
        setSearchParams(params);
    }, [searchQuery, scopeToTenant, onlyFeatured, selectedExpertise, sortBy, setSearchParams]);

    // Lazy query for manual triggering
    const [executeSearch, { loading, error, data }] = useLazyQuery(DISCOVER_PROVIDERS, {
        fetchPolicy: 'cache-and-network'
    });

    // Map frontend sort values to backend enum values
    // Commented out as not currently used, but kept for future implementation
    // const mapSortByToEnum = (sortBy: string) => {
    //     switch (sortBy) {
    //         case 'featured': return 'FEATURED';
    //         case 'newest': return 'NEWEST';
    //         case 'oldest': return 'OLDEST';
    //         case 'alphabetical': return 'ALPHABETICAL';
    //         case 'updated': return 'UPDATED';
    //         default: return 'FEATURED';
    //     }
    // };

    // Execute search when filters change
    useEffect(() => {
        executeSearch({ 
            variables: { 
                searchQuery: searchQuery || undefined,
                limit: pageSize,
                scopeToTenant: isAuthenticated ? scopeToTenant : false
            } 
        });
    }, [searchQuery, scopeToTenant, isAuthenticated, executeSearch]);

    const providers = data?.discoverProviders || [];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleExpertiseAdd = (expertise: string) => {
        if (expertise && !selectedExpertise.includes(expertise)) {
            setSelectedExpertise([...selectedExpertise, expertise]);
        }
    };

    const handleExpertiseRemove = (expertise: string) => {
        setSelectedExpertise(selectedExpertise.filter(e => e !== expertise));
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setScopeToTenant(false);
        setOnlyFeatured(false);
        setSelectedExpertise([]);
        setSortBy('featured');
        setCurrentPage(1);
    };

    const viewProvider = (provider: any) => {
        if (provider.client?.id) {
            window.open(`/provider?client=${provider.client.id}`, '_blank');
        }
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />

            {/* Hero Section */}
            <Box
                bg="linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(30, 30, 30, 0.7) 50%, rgba(20, 20, 20, 0.9) 100%)"
                color="white"
                py={16}
                borderBottom="1px"
                borderColor={cardBorder}
            >
                <Container maxW="6xl" textAlign="center">
                    <VStack spacing={6}>
                        <Heading
                            as="h1"
                            size={{ base: "xl", md: "2xl" }}
                            fontFamily={brandConfig.fonts.heading}
                            textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                        >
                            🌟 Discover Amazing Professionals
                        </Heading>
                        <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            maxW="600px"
                            textShadow="1px 1px 2px rgba(0,0,0,0.3)"
                        >
                            Find coaches, consultants, and service providers who can help you achieve your goals
                        </Text>
                        
                        {/* Search Form */}
                        <Box w="full" maxW="600px">
                            <form onSubmit={handleSearchSubmit}>
                                <HStack spacing={2} w="full">
                                    <InputGroup size="lg" flex="1">
                                        <InputLeftElement>
                                            <SearchIcon color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search for coaches, consultants, services..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.3)"}
                                            color={colorMode === 'light' ? "black" : "white"}
                                            border="1px"
                                            borderColor={cardBorder}
                                            _placeholder={{ color: textMuted }}
                                            _focus={{
                                                borderColor: textSecondary,
                                                boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.3)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: textSecondary
                                            }}
                                            borderRadius="full"
                                        />
                                    </InputGroup>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        px={8}
                                        bg={getColor("components.button.primaryBg", colorMode)}
                                        color="white"
                                        _hover={{
                                            bg: getColor("components.button.primaryHover", colorMode),
                                            transform: "translateY(-2px)"
                                        }}
                                        borderRadius="full"
                                        isLoading={loading}
                                        flexShrink={0}
                                    >
                                        Search
                                    </Button>
                                </HStack>
                            </form>
                        </Box>

                        {/* Quick Filters */}
                        <HStack spacing={4} flexWrap="wrap" justify="center">
                            <Button
                                size="sm"
                                variant={onlyFeatured ? "solid" : "outline"}
                                bg={onlyFeatured ? brandConfig.colors.badges.yellow.bg : "transparent"}
                                color={onlyFeatured ? brandConfig.colors.badges.yellow.color : "white"}
                                borderColor={onlyFeatured ? brandConfig.colors.badges.yellow.border : "rgba(255, 255, 255, 0.3)"}
                                leftIcon={<StarIcon />}
                                onClick={() => setOnlyFeatured(!onlyFeatured)}
                                _hover={{
                                    bg: onlyFeatured ? brandConfig.colors.badges.yellow.border : "rgba(255, 255, 255, 0.1)"
                                }}
                            >
                                Featured Only
                            </Button>
                            {isAuthenticated && (
                                <Button
                                    size="sm"
                                    variant={scopeToTenant ? "solid" : "outline"}
                                    bg={scopeToTenant ? brandConfig.colors.badges.blue.bg : "transparent"}
                                    color={scopeToTenant ? brandConfig.colors.badges.blue.color : "white"}
                                    borderColor={scopeToTenant ? brandConfig.colors.badges.blue.border : "rgba(255, 255, 255, 0.3)"}
                                    _hover={{
                                        bg: scopeToTenant ? brandConfig.colors.badges.blue.border : "rgba(255, 255, 255, 0.1)"
                                    }}
                                    onClick={() => setScopeToTenant(!scopeToTenant)}
                                >
                                    My Organization Only
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="rgba(255, 255, 255, 0.3)"
                                color="white"
                                leftIcon={<SettingsIcon />}
                                rightIcon={<ChevronDownIcon />}
                                onClick={onFilterOpen}
                                _hover={{
                                    bg: "rgba(255, 255, 255, 0.1)",
                                    borderColor: "rgba(255, 255, 255, 0.5)"
                                }}
                            >
                                More Filters
                            </Button>
                        </HStack>
                    </VStack>
                </Container>
            </Box>

            {/* Results Section */}
            <Container maxW="7xl" py={12} flex="1">
                {/* Results Header */}
                <HStack justify="space-between" align="center" mb={8}>
                    <VStack align="start" spacing={1}>
                        <Heading size="lg" color={textPrimary}>
                            {loading ? "Searching..." : `${providers.length} Professionals Found`}
                        </Heading>
                        <Text color={textMuted} fontSize="sm">
                            {scopeToTenant 
                                ? "Showing providers from your organization" 
                                : "Showing providers from all organizations"
                            }
                        </Text>
                    </VStack>

                    <HStack spacing={4}>
                        {/* Active Filters */}
                        {(searchQuery || onlyFeatured || selectedExpertise.length > 0 || scopeToTenant) && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearAllFilters}
                                color={textPrimary}
                                _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            >
                                Clear Filters
                            </Button>
                        )}

                        {/* Sort Dropdown */}
                        <Menu>
                            <MenuButton 
                                as={Button} 
                                size="sm" 
                                variant="outline" 
                                rightIcon={<ChevronDownIcon />}
                                borderColor={cardBorder}
                                color={textPrimary}
                                bg="rgba(0, 0, 0, 0.2)"
                                _hover={{
                                    borderColor: textSecondary,
                                    bg: "rgba(255, 255, 255, 0.05)"
                                }}
                            >
                                Sort: {sortBy === 'featured' ? 'Featured' : 
                                       sortBy === 'newest' ? 'Newest' :
                                       sortBy === 'alphabetical' ? 'A-Z' : 'Recently Updated'}
                            </MenuButton>
                            <MenuList bg={cardGradientBg} borderColor={cardBorder}>
                                <MenuItem onClick={() => setSortBy('featured')} color={textPrimary} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>Featured First</MenuItem>
                                <MenuItem onClick={() => setSortBy('newest')} color={textPrimary} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>Newest</MenuItem>
                                <MenuItem onClick={() => setSortBy('alphabetical')} color={textPrimary} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>Alphabetical</MenuItem>
                                <MenuItem onClick={() => setSortBy('updated')} color={textPrimary} _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}>Recently Updated</MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                </HStack>

                {/* Active Filter Tags */}
                {(searchQuery || selectedExpertise.length > 0) && (
                    <Wrap spacing={2} mb={6}>
                        {searchQuery && (
                            <WrapItem>
                                <Tag 
                                    size="md" 
                                    bg={brandConfig.colors.badges.blue.bg}
                                    color={brandConfig.colors.badges.blue.color}
                                    border="1px solid"
                                    borderColor={brandConfig.colors.badges.blue.border}
                                >
                                    <TagLabel>Search: {searchQuery}</TagLabel>
                                    <TagCloseButton onClick={() => setSearchQuery('')} />
                                </Tag>
                            </WrapItem>
                        )}
                        {selectedExpertise.map(expertise => (
                            <WrapItem key={expertise}>
                                <Tag 
                                    size="md" 
                                    bg={brandConfig.colors.badges.purple.bg}
                                    color={brandConfig.colors.badges.purple.color}
                                    border="1px solid"
                                    borderColor={brandConfig.colors.badges.purple.border}
                                >
                                    <TagLabel>{expertise}</TagLabel>
                                    <TagCloseButton onClick={() => handleExpertiseRemove(expertise)} />
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                )}

                {/* Loading State */}
                {loading && (
                    <Center py={12}>
                        <VStack spacing={4}>
                            <Spinner size="xl" color="#3B82F6" />
                            <Text color={textMuted}>Finding amazing professionals...</Text>
                        </VStack>
                    </Center>
                )}

                {/* Error State */}
                {error && (
                    <Alert 
                        status="error" 
                        borderRadius="lg" 
                        mb={6}
                        bg={getColor("background.darkOverlay")}
                        borderColor={brandConfig.colors.status.error}
                        borderWidth="1px"
                    >
                        <AlertIcon color={brandConfig.colors.status.error} />
                        <AlertTitle color={textPrimary}>Search Error</AlertTitle>
                        <AlertDescription color={textSecondary}>{error.message}</AlertDescription>
                    </Alert>
                )}

                {/* Results Grid */}
                {!loading && !error && (
                    <>
                        {providers.length === 0 ? (
                            <Center py={12}>
                                <VStack spacing={4} textAlign="center">
                                    <Text fontSize="6xl">🔍</Text>
                                    <Heading size="md" color={textPrimary}>
                                        No providers found
                                    </Heading>
                                    <Text color={textMuted} maxW="400px">
                                        Try adjusting your search terms or filters to find more professionals.
                                    </Text>
                                    <Button onClick={clearAllFilters} colorScheme="blue" variant="outline">
                                        Clear All Filters
                                    </Button>
                                </VStack>
                            </Center>
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {providers.map((provider: any) => (
                                    <Card
                                        key={provider.id}
                                        bg={cardGradientBg}
                                        backdropFilter="blur(10px)"
                                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                        borderRadius="xl"
                                        overflow="hidden"
                                        border="1px"
                                        borderColor={cardBorder}
                                        _hover={{
                                            boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                                            transform: "translateY(-2px)",
                                            borderColor: textSecondary,
                                            transition: "all 0.3s ease"
                                        }}
                                        cursor="pointer"
                                        onClick={() => viewProvider(provider)}
                                    >
                                        <CardHeader pb={2} borderBottom="1px" borderColor={cardBorder}>
                                            <HStack spacing={4}>
                                                <Avatar
                                                    src={provider.avatar}
                                                    name={`${provider.client?.fName} ${provider.client?.lName}`}
                                                    size="lg"
                                                />
                                                <VStack align="start" spacing={1} flex="1">
                                                    <HStack justify="space-between" w="full">
                                                        <Text fontWeight="bold" fontSize="lg" noOfLines={1} color={textPrimary}>
                                                            {provider.client?.fName} {provider.client?.lName}
                                                        </Text>
                                                        {provider.isFeatured && (
                                                            <Badge 
                                                                bg="rgba(251, 191, 36, 0.2)"
                                                                color="#FBBF24"
                                                                border="1px solid"
                                                                borderColor="rgba(251, 191, 36, 0.3)"
                                                            >
                                                                <StarIcon w={2} h={2} mr={1} />
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                    <Text
                                                        fontWeight="semibold"
                                                        color="#3B82F6"
                                                        fontSize="sm"
                                                        noOfLines={2}
                                                        lineHeight="shorter"
                                                    >
                                                        {provider.title}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </CardHeader>

                                        <CardBody pt={0}>
                                            <VStack align="start" spacing={3}>
                                                <Text
                                                    fontSize="sm"
                                                    color={textMuted}
                                                    noOfLines={2}
                                                    lineHeight="tall"
                                                >
                                                    {provider.tagline}
                                                </Text>

                                                {provider.expertise?.length > 0 && (
                                                    <Wrap spacing={1}>
                                                        {provider.expertise.slice(0, 3).map((skill: string, index: number) => (
                                                            <WrapItem key={index}>
                                                                <Tag 
                                                                    size="sm" 
                                                                    bg={brandConfig.colors.badges.blue.bg}
                                                                    color={brandConfig.colors.badges.blue.color}
                                                                    border="1px solid"
                                                                    borderColor={brandConfig.colors.badges.blue.border}
                                                                >
                                                                    {skill}
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                        {provider.expertise.length > 3 && (
                                                            <WrapItem>
                                                                <Tag 
                                                                    size="sm" 
                                                                    bg={brandConfig.colors.badges.gray.bg}
                                                                    color={brandConfig.colors.badges.gray.color}
                                                                    border="1px solid"
                                                                    borderColor={brandConfig.colors.badges.gray.border}
                                                                >
                                                                    +{provider.expertise.length - 3} more
                                                                </Tag>
                                                            </WrapItem>
                                                        )}
                                                    </Wrap>
                                                )}

                                                <Divider />

                                                <HStack justify="space-between" w="full">
                                                    <HStack spacing={2}>
                                                        {provider.contactInfo?.email && (
                                                            <Tooltip label="Contact via email">
                                                                <IconButton
                                                                    aria-label="Email"
                                                                    icon={<EmailIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color="#3B82F6"
                                                                    _hover={{ bg: brandConfig.colors.badges.blue.bg }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.location.href = `mailto:${provider.contactInfo.email}`;
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                        {provider.contactInfo?.website && (
                                                            <Tooltip label="Visit website">
                                                                <IconButton
                                                                    aria-label="Website"
                                                                    icon={<ExternalLinkIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color="#3B82F6"
                                                                    _hover={{ bg: brandConfig.colors.badges.blue.bg }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(provider.contactInfo.website, '_blank');
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </HStack>
                                                    <Button
                                                        size="sm"
                                                        leftIcon={<ViewIcon />}
                                                        bg={brandConfig.components.button.whiteBg}
                                                        color={brandConfig.components.button.whiteText}
                                                        _hover={{ 
                                                            bg: brandConfig.components.button.whiteHover,
                                                            transform: "translateY(-2px)"
                                                        }}
                                                        variant="solid"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            viewProvider(provider);
                                                        }}
                                                    >
                                                        View Profile
                                                    </Button>
                                                </HStack>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        )}

                        {/* Pagination */}
                        {providers.length === pageSize && (
                            <Center mt={8}>
                                <Button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    isLoading={loading}
                                    bg={brandConfig.components.button.whiteBg}
                                    color={brandConfig.components.button.whiteText}
                                    _hover={{ 
                                        bg: brandConfig.components.button.whiteHover,
                                        transform: "translateY(-2px)"
                                    }}
                                    size="lg"
                                    px={8}
                                >
                                    Load More
                                </Button>
                            </Center>
                        )}
                    </>
                )}
            </Container>

            {/* Filter Modal */}
            <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="lg">
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
                <ModalContent
                    bg={cardGradientBg}
                    backdropFilter={colorMode === 'light' ? "none" : "blur(10px)"}
                    border="1px"
                    borderColor={cardBorder}
                >
                    <ModalHeader color={textPrimary} borderBottom="1px" borderColor={cardBorder}>Advanced Filters</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={6} align="stretch">
                            {isAuthenticated && (
                                <FormControl>
                                    <HStack justify="space-between">
                                        <FormLabel mb={0} color={textPrimary}>Search within my organization only</FormLabel>
                                        <Switch
                                            isChecked={scopeToTenant}
                                            onChange={(e) => setScopeToTenant(e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </HStack>
                                    <Text fontSize="xs" color={textMuted} mt={1}>
                                        When enabled, only shows providers from your organization
                                    </Text>
                                </FormControl>
                            )}

                            <FormControl>
                                <HStack justify="space-between">
                                    <FormLabel mb={0} color={textPrimary}>Featured providers only</FormLabel>
                                    <Switch
                                        isChecked={onlyFeatured}
                                        onChange={(e) => setOnlyFeatured(e.target.checked)}
                                        colorScheme="yellow"
                                    />
                                </HStack>
                                <Text fontSize="xs" color={textMuted} mt={1}>
                                    Show only highlighted and verified providers
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel color={textPrimary}>Add Expertise Filter</FormLabel>
                                <InputGroup>
                                    <Input
                                        placeholder="Type an expertise area and press Enter"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleExpertiseAdd(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                        bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.3)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                    />
                                </InputGroup>
                                <Text fontSize="xs" color={textMuted} mt={1}>
                                    Examples: coaching, consulting, marketing, design
                                </Text>
                                {selectedExpertise.length > 0 && (
                                    <Wrap spacing={2} mt={3}>
                                        {selectedExpertise.map(expertise => (
                                            <WrapItem key={expertise}>
                                                <Tag 
                                                    bg={brandConfig.colors.badges.purple.bg}
                                                    color={brandConfig.colors.badges.purple.color}
                                                    border="1px solid"
                                                    borderColor={brandConfig.colors.badges.purple.border}
                                                >
                                                    <TagLabel>{expertise}</TagLabel>
                                                    <TagCloseButton onClick={() => handleExpertiseRemove(expertise)} />
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                )}
                            </FormControl>

                            <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                                <Button
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    flex={1}
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _hover={{
                                        borderColor: textSecondary,
                                        bg: colorMode === 'light' ? "gray.50" : "rgba(255, 255, 255, 0.05)"
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                                <Button
                                    bg={getColor("components.button.primaryBg", colorMode)}
                                    color="white"
                                    _hover={{
                                        bg: getColor("components.button.primaryHover", colorMode),
                                        transform: "translateY(-2px)"
                                    }}
                                    onClick={onFilterClose}
                                    flex={1}
                                >
                                    Apply Filters
                                </Button>
                            </Stack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default DiscoverProviders;