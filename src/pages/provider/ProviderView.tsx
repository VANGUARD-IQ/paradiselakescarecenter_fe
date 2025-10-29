import { useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Button,
    Image,
    Avatar,
    Divider,
    Stack,
    Badge,
    Card,
    CardBody,
    CardHeader,
    Wrap,
    WrapItem,
    Center,
    useDisclosure,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    useToast,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Icon,
} from "@chakra-ui/react";
import {
    StarIcon,
    EmailIcon,
    PhoneIcon,
    ExternalLinkIcon,
    CheckCircleIcon,
    ArrowForwardIcon,
    ViewIcon,
    EditIcon,
    AddIcon,
    LinkIcon,
    CopyIcon
} from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { getColor, brandConfig } from "../../brandConfig";
import { useColorMode } from "@chakra-ui/react";

// Import modal components for services and products (assuming they exist)
// import ProductCarouselModal from "../../components/ProductCarouselModal";
// import ServicesCarouselModal from "../../components/ServicesCarouselModal";

const GET_MY_PROVIDER = gql`
  query GetMyProvider {
    myProvider {
      id
      title
      tagline
      description
      avatar
      heroImage
      roles {
        role
        organization
      }
      experience {
        title
        company
        period
        description
        achievements
      }
      education {
        degree
        institution
        year
        description
      }
      skills {
        name
        level
        endorsements
      }
      expertise
      achievements
      testimonials {
        name
        location
        rating
        text
        avatar
      }
      contactInfo {
        email
        phone
        website
        linkedIn
        twitter
        instagram
        facebook
      }
      availability {
        schedule
        timezone
        notes
      }
      featuredProductIds
      status
      aboutStory
      portfolioUrl
      urlSlug
      isPublic
      isFeatured
      client {
        id
        fName
        lName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_PUBLIC_PROVIDER_BY_CLIENT = gql`
  query GetPublicProviderByClient($clientId: ID!) {
    publicProviderByClient(clientId: $clientId) {
      id
      title
      tagline
      description
      avatar
      heroImage
      roles {
        role
        organization
      }
      experience {
        title
        company
        period
        description
        achievements
      }
      education {
        degree
        institution
        year
        description
      }
      skills {
        name
        level
        endorsements
      }
      expertise
      achievements
      testimonials {
        name
        location
        rating
        text
        avatar
      }
      contactInfo {
        email
        phone
        website
        linkedIn
        twitter
        instagram
        facebook
      }
      availability {
        schedule
        timezone
        notes
      }
      featuredProductIds
      status
      aboutStory
      portfolioUrl
      isPublic
      isFeatured
      client {
        id
        fName
        lName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_PUBLIC_PROVIDER_BY_SLUG = gql`
  query GetPublicProviderBySlug($urlSlug: String!) {
    publicProviderBySlug(urlSlug: $urlSlug) {
      id
      title
      tagline
      description
      avatar
      heroImage
      roles {
        role
        organization
      }
      experience {
        title
        company
        period
        description
        achievements
      }
      education {
        degree
        institution
        year
        description
      }
      skills {
        name
        level
        endorsements
      }
      expertise
      achievements
      testimonials {
        name
        location
        rating
        text
        avatar
      }
      contactInfo {
        email
        phone
        website
        linkedIn
        twitter
        instagram
        facebook
      }
      availability {
        schedule
        timezone
        notes
      }
      featuredProductIds
      status
      aboutStory
      portfolioUrl
      urlSlug
      isPublic
      isFeatured
      client {
        id
        fName
        lName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

const ProviderView = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [searchParams] = useSearchParams();
    const { urlSlug } = useParams<{ urlSlug: string }>();
    const clientId = searchParams.get('client');
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Theme-aware colors
    const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
    const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    // Determine which query to use - priority: urlSlug > clientId > authenticated user
    const isSlugView = !!urlSlug;
    const isClientView = !!clientId && !urlSlug;
    const isPublicView = isSlugView || isClientView;

    // Modal state management
    const {
        isOpen: isServicesModalOpen,
        onOpen: onServicesModalOpen,
        onClose: onServicesModalClose
    } = useDisclosure();

    const {
        isOpen: isProductsModalOpen,
        onOpen: onProductsModalOpen,
        onClose: onProductsModalClose
    } = useDisclosure();

    // Query for authenticated user's own provider
    const { loading: myLoading, error: myError, data: myData } = useQuery(GET_MY_PROVIDER, {
        skip: !isAuthenticated || isPublicView,
        fetchPolicy: 'cache-and-network'
    });

    // Query for public provider by client ID
    const { loading: clientLoading, error: clientError, data: clientData } = useQuery(GET_PUBLIC_PROVIDER_BY_CLIENT, {
        variables: { clientId },
        skip: !isClientView,
        fetchPolicy: 'cache-and-network'
    });

    // Query for public provider by URL slug
    const { loading: slugLoading, error: slugError, data: slugData } = useQuery(GET_PUBLIC_PROVIDER_BY_SLUG, {
        variables: { urlSlug },
        skip: !isSlugView,
        fetchPolicy: 'cache-and-network'
    });

    // Use the appropriate data based on the view type
    const loading = isSlugView ? slugLoading : (isClientView ? clientLoading : myLoading);
    const error = isSlugView ? slugError : (isClientView ? clientError : myError);
    const data = isSlugView ? slugData : (isClientView ? clientData : myData);
    const provider = isSlugView ? data?.publicProviderBySlug : (isClientView ? data?.publicProviderByClient : data?.myProvider);

    // Public profile URL helpers
    const getPublicProfileUrl = () => {
        if (!provider?.client?.id) return '';
        return `${window.location.origin}/provider?client=${provider.client.id}`;
    };

    const getSlugProfileUrl = () => {
        if (!provider?.urlSlug) return '';
        return `${window.location.origin}/provider/${provider.urlSlug}`;
    };

    const copyPublicUrl = async () => {
        const url = getPublicProfileUrl();
        if (!url) return;
        
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Link copied!",
                description: "Public profile link copied to clipboard",
                status: "success",
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: "Copy failed",
                description: "Could not copy link to clipboard",
                status: "error",
                duration: 3000,
            });
        }
    };

    const openPublicProfile = () => {
        const url = getPublicProfileUrl();
        if (url) {
            window.open(url, '_blank');
        }
    };

    const copySlugUrl = async () => {
        const url = getSlugProfileUrl();
        if (!url) return;
        
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Friendly link copied!",
                description: "Custom profile URL copied to clipboard",
                status: "success",
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: "Copy failed",
                description: "Could not copy link to clipboard",
                status: "error",
                duration: 3000,
            });
        }
    };

    const openSlugProfile = () => {
        const url = getSlugProfileUrl();
        if (url) {
            window.open(url, '_blank');
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const title = isPublicView 
            ? `${provider?.title || 'Professional Profile'} | ${brandConfig.siteName}`
            : `Professional Profile | ${brandConfig.siteName}`;
        document.title = title;
    }, [isPublicView, provider?.title]);

    if (!isAuthenticated && !isPublicView) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Alert status="warning" borderRadius="lg">
                        <AlertIcon />
                        <AlertTitle>Authentication Required</AlertTitle>
                        <AlertDescription>
                            Please log in to view your provider profile.
                        </AlertDescription>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Center>
                        <VStack spacing={4}>
                            <Spinner size="xl" color={getColor("primary")} />
                            <Text>Loading {isPublicView ? 'professional' : 'your'} profile...</Text>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Alert status="error" borderRadius="lg">
                        <AlertIcon />
                        <AlertTitle>Error Loading Profile</AlertTitle>
                        <AlertDescription>
                            {error.message}
                        </AlertDescription>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (!provider) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <AlertTitle>{isPublicView ? "Profile Not Found" : "No Provider Profile Found"}</AlertTitle>
                        <AlertDescription>
                            {isPublicView 
                                ? "This professional profile is not available or may be set to private."
                                : "You haven't created your provider profile yet. Create one to showcase your professional services and experience."
                            }
                        </AlertDescription>
                    </Alert>
                    {!isPublicView && (
                        <Box mt={6}>
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={() => navigate("/provider/edit")}
                            >
                                Create Your Provider Profile
                            </Button>
                        </Box>
                    )}
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }
    const clientName = provider.client ? `${provider.client.fName} ${provider.client.lName}` : "Professional";
    
    // Check if current user is the owner of this profile
    const isOwner = isAuthenticated && user?.id === provider.client?.id;

    return (
        <Box bg={getColor("background.main")} minHeight="100vh">
            <NavbarWithCallToAction />

            {/* Profile Management Bar - Only show for profile owner */}
            {isOwner && !isPublicView && (
                <Box 
                    bg="linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)"
                    borderBottom="1px" 
                    borderColor={getColor("border.light")} 
                    py={3}
                    backdropFilter="blur(10px)"
                >
                    <Container maxW="6xl">
                        <Stack 
                            direction={{ base: "column", md: "row" }}
                            justify="space-between" 
                            align={{ base: "start", md: "center" }}
                            spacing={{ base: 3, md: 2 }}
                        >
                            {/* Left side - Status info */}
                            <HStack spacing={3} align="center">
                                <Box w={2} h={2} bg={provider.status === 'ACTIVE' ? 'green.400' : 'orange.400'} borderRadius="full" />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium" color={getColor("text.primary")}>
                                        Profile Preview Mode
                                    </Text>
                                    <HStack spacing={2}>
                                        <Text fontSize="xs" color={getColor("text.muted")}>
                                            Status: {provider.status.toLowerCase()}
                                        </Text>
                                        <Text fontSize="xs" color={getColor("text.muted")}>•</Text>
                                        <Text fontSize="xs" color={getColor("text.muted")}>
                                            {provider.isPublic ? 'Publicly visible' : 'Private profile'}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>

                            {/* Right side - Actions */}
                            <Stack 
                                direction={{ base: "column", sm: "row" }}
                                spacing={2}
                                w={{ base: "full", md: "auto" }}
                            >
                                {provider.isPublic && (
                                    <Menu>
                                        <MenuButton 
                                            as={Button} 
                                            size="sm"
                                            variant="outline"
                                            leftIcon={<LinkIcon />}
                                            fontSize="sm"
                                            borderColor={getColor("border.light")}
                                            bg="white"
                                            _hover={{
                                                bg: getColor("background.light"),
                                                borderColor: getColor("primary")
                                            }}
                                            w={{ base: "full", sm: "auto" }}
                                        >
                                            <Text display={{ base: "none", sm: "inline" }}>Share Profile</Text>
                                            <Text display={{ base: "inline", sm: "none" }}>Share Links</Text>
                                        </MenuButton>
                                        <MenuList fontSize="sm" minW="300px" shadow="lg" border="1px" borderColor={getColor("border.light")}>
                                            {provider.urlSlug && (
                                                <>
                                                    <MenuItem icon={<ViewIcon />} onClick={openSlugProfile} _hover={{ bg: getColor("background.light") }}>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="medium">View Custom URL</Text>
                                                            <Text fontSize="xs" color={getColor("text.muted")}>
                                                                /{provider.urlSlug}
                                                            </Text>
                                                        </VStack>
                                                    </MenuItem>
                                                    <MenuItem icon={<CopyIcon />} onClick={copySlugUrl} _hover={{ bg: getColor("background.light") }}>
                                                        Copy Custom Link
                                                    </MenuItem>
                                                    <MenuItem 
                                                        onClick={copySlugUrl}
                                                        _hover={{ bg: getColor("background.light") }}
                                                        cursor="pointer"
                                                        py={3}
                                                    >
                                                        <VStack align="start" spacing={1} w="full">
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontSize="xs" color={getColor("text.muted")} fontWeight="medium">
                                                                    Custom URL (click to copy)
                                                                </Text>
                                                                <CopyIcon w={3} h={3} color={getColor("text.muted")} />
                                                            </HStack>
                                                            <Text 
                                                                fontSize="xs" 
                                                                fontFamily="mono"
                                                                bg={getColor("background.light")}
                                                                px={2}
                                                                py={1}
                                                                borderRadius="md"
                                                                wordBreak="break-all"
                                                                w="full"
                                                                color={getColor("primary")}
                                                            >
                                                                {getSlugProfileUrl()}
                                                            </Text>
                                                        </VStack>
                                                    </MenuItem>
                                                    <MenuDivider />
                                                </>
                                            )}
                                            <MenuItem icon={<ViewIcon />} onClick={openPublicProfile} _hover={{ bg: getColor("background.light") }}>
                                                View Standard URL
                                            </MenuItem>
                                            <MenuItem icon={<CopyIcon />} onClick={copyPublicUrl} _hover={{ bg: getColor("background.light") }}>
                                                Copy Standard Link
                                            </MenuItem>
                                            <MenuItem 
                                                onClick={copyPublicUrl}
                                                _hover={{ bg: getColor("background.light") }}
                                                cursor="pointer"
                                                py={3}
                                            >
                                                <VStack align="start" spacing={1} w="full">
                                                    <HStack justify="space-between" w="full">
                                                        <Text fontSize="xs" color={getColor("text.muted")} fontWeight="medium">
                                                            Standard URL (click to copy)
                                                        </Text>
                                                        <CopyIcon w={3} h={3} color={getColor("text.muted")} />
                                                    </HStack>
                                                    <Text 
                                                        fontSize="xs" 
                                                        fontFamily="mono"
                                                        bg={getColor("background.light")}
                                                        px={2}
                                                        py={1}
                                                        borderRadius="md"
                                                        wordBreak="break-all"
                                                        w="full"
                                                        color={getColor("primary")}
                                                    >
                                                        {getPublicProfileUrl()}
                                                    </Text>
                                                </VStack>
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                )}
                                <Button
                                    leftIcon={<EditIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => navigate("/provider/edit")}
                                    fontWeight="medium"
                                    shadow="sm"
                                    w={{ base: "full", sm: "auto" }}
                                    _hover={{
                                        transform: "translateY(-1px)",
                                        shadow: "md"
                                    }}
                                    transition="all 0.2s"
                                >
                                    Edit Profile
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>
            )}

            {/* Hero Section */}
            <Box
                position="relative"
                height={{ base: "70vh", md: "80vh" }}
                backgroundImage={provider.heroImage 
                    ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${provider.heroImage})`
                    : `linear-gradient(135deg, ${getColor("primary")} 0%, ${getColor("secondary")} 100%)`
                }
                backgroundSize="cover"
                backgroundPosition="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Container maxW="6xl" textAlign="center">
                    <VStack spacing={{ base: 4, md: 6 }} color="white" px={{ base: 4, md: 0 }}>
                        <Avatar
                            boxSize={{ base: "120px", sm: "160px", md: "200px", lg: "240px" }}
                            src={provider.avatar}
                            name={clientName}
                            border="4px solid white"
                            shadow="2xl"
                            mt={{ base: "40px", md: "0" }}
                        />
                        <Heading
                            as="h1"
                            size={{ base: "lg", sm: "xl", md: "2xl" }}
                            fontFamily={brandConfig.fonts.heading}
                            textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                            textAlign="center"
                        >
                            {clientName}
                        </Heading>
                        <Text
                            fontSize={{ base: "md", sm: "lg", md: "xl" }}
                            fontWeight="semibold"
                            textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                            textAlign="center"
                            px={{ base: 2, md: 0 }}
                        >
                            {provider.title}
                        </Text>
                        <Text
                            fontSize={{ base: "sm", sm: "md", md: "lg" }}
                            maxW={{ base: "90%", md: "600px" }}
                            textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                            textAlign="center"
                            lineHeight="tall"
                            px={{ base: 2, md: 0 }}
                        >
                            {provider.tagline}
                        </Text>
                        <Stack 
                            direction={{ base: "column", sm: "row" }} 
                            spacing={{ base: 3, sm: 4 }}
                            align="center"
                            w={{ base: "full", sm: "auto" }}
                            px={{ base: 4, sm: 0 }}
                        >
                            <Button
                                size={{ base: "md", md: "lg" }}
                                bg={getColor("secondary")}
                                color="white"
                                _hover={{
                                    bg: getColor("secondaryHover"),
                                    transform: "translateY(-2px)"
                                }}
                                rightIcon={<ArrowForwardIcon />}
                                shadow="lg"
                                transition="all 0.3s ease"
                                onClick={onServicesModalOpen}
                                w={{ base: "full", sm: "auto" }}
                                fontSize={{ base: "sm", md: "md" }}
                            >
                                Explore Services
                            </Button>
                            {provider.contactInfo?.email && (
                                <Button
                                    size={{ base: "md", md: "lg" }}
                                    variant="outline"
                                    borderColor="white"
                                    color="white"
                                    _hover={{
                                        bg: "whiteAlpha.200",
                                        transform: "translateY(-2px)"
                                    }}
                                    leftIcon={<EmailIcon />}
                                    shadow="lg"
                                    transition="all 0.3s ease"
                                    as="a"
                                    href={`mailto:${provider.contactInfo.email}`}
                                    w={{ base: "full", sm: "auto" }}
                                    fontSize={{ base: "sm", md: "md" }}
                                >
                                    Get In Touch
                                </Button>
                            )}
                        </Stack>
                    </VStack>
                </Container>
            </Box>

            {/* Offerings Section */}
            <Container maxW="6xl" py={12}>
                <VStack spacing={4} textAlign="center">
                    <Heading
                        as="h2"
                        size="2xl"
                        color={getColor("primary")}
                        fontFamily={brandConfig.fonts.heading}
                    >
                        {clientName.split(' ')[0]}'s Offerings
                    </Heading>
                    <Text
                        fontSize="lg"
                        color={textPrimary}
                        maxW="600px"
                    >
                        {provider.description}
                    </Text>
                </VStack>
            </Container>

            {/* Services Section */}
            <Container maxW="6xl" py={8}>
                <VStack spacing={12}>
                    <VStack spacing={4} textAlign="center">
                        <Heading
                            as="h3"
                            size="xl"
                            color={getColor("primary")}
                            fontFamily={brandConfig.fonts.heading}
                        >
                            Professional Services
                        </Heading>
                        <Text
                            fontSize="lg"
                            color={textPrimary}
                            maxW="600px"
                        >
                            Professional services designed to help you achieve your goals.
                        </Text>
                    </VStack>

                    {/* Services Preview Card */}
                    <Card maxW="600px" w="full" shadow="xl" borderRadius="2xl" overflow="hidden">
                        <Box position="relative">
                            <Box
                                h="250px"
                                bg={`linear-gradient(135deg, ${getColor("primary")} 0%, ${getColor("secondary")} 100%)`}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <VStack spacing={4} color="white" textAlign="center">
                                    <Icon as={ViewIcon} boxSize={12} />
                                    <Heading as="h4" size="lg" textShadow="2px 2px 4px rgba(0,0,0,0.7)">
                                        Explore All Services
                                    </Heading>
                                    <Text textShadow="1px 1px 2px rgba(0,0,0,0.7)">
                                        Professional consulting and coaching services
                                    </Text>
                                </VStack>
                            </Box>
                        </Box>
                        <CardBody textAlign="center">
                            <VStack spacing={4}>
                                <Text color={textPrimary}>
                                    Discover comprehensive professional services designed
                                    to transform your approach to success.
                                </Text>
                                <Button
                                    size="lg"
                                    bg={getColor("primary")}
                                    color="white"
                                    _hover={{
                                        bg: getColor("primaryHover"),
                                        transform: "translateY(-2px)"
                                    }}
                                    rightIcon={<ViewIcon />}
                                    onClick={onServicesModalOpen}
                                    shadow="md"
                                    transition="all 0.3s ease"
                                >
                                    View All Services
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* Products Section (if featured products exist) */}
            {provider.featuredProductIds?.length > 0 && (
                <Container maxW="6xl" py={8}>
                    <VStack spacing={12}>
                        <VStack spacing={4} textAlign="center">
                            <Heading
                                as="h3"
                                size="xl"
                                color={getColor("primary")}
                                fontFamily={brandConfig.fonts.heading}
                            >
                                Featured Products
                            </Heading>
                            <Text
                                fontSize="lg"
                                color={textPrimary}
                                maxW="600px"
                            >
                                Carefully selected products and resources.
                            </Text>
                        </VStack>

                        <Box textAlign="center">
                            <Button
                                size="lg"
                                bg={getColor("secondary")}
                                color="white"
                                _hover={{
                                    bg: getColor("secondaryHover"),
                                    transform: "translateY(-2px)"
                                }}
                                rightIcon={<ViewIcon />}
                                onClick={onProductsModalOpen}
                                shadow="lg"
                                transition="all 0.3s ease"
                            >
                                Explore All Products
                            </Button>
                        </Box>
                    </VStack>
                </Container>
            )}

            <Divider />

            {/* About Section */}
            <Container maxW="6xl" py={16}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
                    <VStack align="start" spacing={6}>
                        <Heading
                            as="h2"
                            size="xl"
                            color={getColor("primary")}
                            fontFamily={brandConfig.fonts.heading}
                        >
                            About {clientName}
                        </Heading>
                        
                        {provider.aboutStory && (
                            <Text
                                fontSize="lg"
                                color={textPrimary}
                                lineHeight="tall"
                            >
                                {provider.aboutStory}
                            </Text>
                        )}

                        {provider.roles?.length > 0 && (
                            <VStack align="start" spacing={3} width="full">
                                <Heading as="h3" size="md" color={getColor("secondary")}>
                                    Current Roles & Organizations
                                </Heading>
                                <Stack spacing={3}>
                                    {provider.roles.map((roleItem: {role: string, organization: string}, index: number) => (
                                        <Card key={index} variant="outline" size="sm">
                                            <CardBody>
                                                <HStack spacing={3}>
                                                    <Icon as={CheckCircleIcon} color={getColor("secondary")} />
                                                    <VStack align="start" spacing={1}>
                                                        <Text color={textPrimary} fontWeight="bold" fontSize="md">
                                                            {roleItem.role}
                                                        </Text>
                                                        <Text color={textPrimary} fontSize="sm" opacity={0.8}>
                                                            at {roleItem.organization}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </Stack>
                            </VStack>
                        )}

                        {provider.expertise?.length > 0 && (
                            <VStack align="start" spacing={3} width="full">
                                <Heading as="h3" size="md" color={getColor("secondary")}>
                                    Core Expertise
                                </Heading>
                                <Wrap spacing={2}>
                                    {provider.expertise.map((skill: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Badge
                                                colorScheme="blue"
                                                variant="subtle"
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                            >
                                                {skill}
                                            </Badge>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </VStack>
                        )}

                        {provider.achievements?.length > 0 && (
                            <VStack align="start" spacing={3} width="full">
                                <Heading as="h3" size="md" color={getColor("secondary")}>
                                    Key Achievements
                                </Heading>
                                <Stack spacing={2}>
                                    {provider.achievements.map((achievement: string, index: number) => (
                                        <HStack key={index} spacing={3}>
                                            <Icon as={CheckCircleIcon} color={getColor("secondary")} />
                                            <Text color={textPrimary}>{achievement}</Text>
                                        </HStack>
                                    ))}
                                </Stack>
                            </VStack>
                        )}
                    </VStack>

                    <Center>
                        <Image
                            src={provider.avatar}
                            alt={clientName}
                            borderRadius="2xl"
                            shadow="2xl"
                            maxW="400px"
                            w="full"
                            fallback={
                                <Box
                                    maxW="400px"
                                    w="full"
                                    h="400px"
                                    bg={getColor("background.light")}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    borderRadius="2xl"
                                    shadow="2xl"
                                >
                                    <VStack spacing={4}>
                                        <Text fontSize="6xl">{clientName.charAt(0).toUpperCase()}</Text>
                                        <Text color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                            Professional Profile
                                        </Text>
                                    </VStack>
                                </Box>
                            }
                        />
                    </Center>
                </SimpleGrid>
            </Container>

            {/* Professional Experience Section */}
            {provider.experience?.length > 0 && (
                <Container maxW="6xl" py={16}>
                    <VStack spacing={8}>
                        <Heading
                            as="h2"
                            size="xl"
                            color={getColor("primary")}
                            fontFamily={brandConfig.fonts.heading}
                            textAlign="center"
                        >
                            Professional Experience
                        </Heading>

                        <VStack spacing={6} width="full">
                            {provider.experience.map((exp: any, index: number) => (
                                <Card key={index} shadow="lg" borderRadius="xl" width="full">
                                    <CardBody>
                                        <VStack align="start" spacing={4}>
                                            <HStack justify="space-between" width="full" align="start">
                                                <VStack align="start" spacing={1}>
                                                    <Heading as="h3" size="md" color={getColor("primary")}>
                                                        {exp.title}
                                                    </Heading>
                                                    <Text fontWeight="bold" color={getColor("secondary")}>
                                                        {exp.company}
                                                    </Text>
                                                    <Text fontSize="sm" color={textPrimary}>
                                                        {exp.period}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Text color={textPrimary} lineHeight="tall">
                                                {exp.description}
                                            </Text>
                                            {exp.achievements?.length > 0 && (
                                                <VStack align="start" spacing={2} width="full">
                                                    <Text fontWeight="semibold" color={getColor("secondary")}>
                                                        Key Achievements:
                                                    </Text>
                                                    <Stack spacing={1} pl={4}>
                                                        {exp.achievements.map((achievement: string, achIndex: number) => (
                                                            <HStack key={achIndex} spacing={2}>
                                                                <Icon as={CheckCircleIcon} color={getColor("secondary")} w={4} h={4} />
                                                                <Text fontSize="sm" color={textPrimary}>{achievement}</Text>
                                                            </HStack>
                                                        ))}
                                                    </Stack>
                                                </VStack>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    </VStack>
                </Container>
            )}

            {/* Education Section */}
            {provider.education?.length > 0 && (
                <Box bg={bg} py={16}>
                    <Container maxW="6xl">
                        <VStack spacing={8}>
                            <Heading
                                as="h2"
                                size="xl"
                                color={getColor("primary")}
                                fontFamily={brandConfig.fonts.heading}
                                textAlign="center"
                            >
                                Education & Certifications
                            </Heading>

                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="full">
                                {provider.education.map((edu: any, index: number) => (
                                    <Card key={index} shadow="lg" borderRadius="xl" height="fit-content">
                                        <CardBody>
                                            <VStack align="start" spacing={3}>
                                                <Heading as="h3" size="sm" color={getColor("primary")}>
                                                    {edu.degree}
                                                </Heading>
                                                <Text fontWeight="bold" color={getColor("secondary")}>
                                                    {edu.institution}
                                                </Text>
                                                <Badge colorScheme="blue" variant="subtle">
                                                    {edu.year}
                                                </Badge>
                                                <Text fontSize="sm" color={textPrimary} lineHeight="tall">
                                                    {edu.description}
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </VStack>
                    </Container>
                </Box>
            )}

            {/* Skills Section */}
            {provider.skills?.length > 0 && (
                <Container maxW="6xl" py={16}>
                    <VStack spacing={8}>
                        <Heading
                            as="h2"
                            size="xl"
                            color={getColor("primary")}
                            fontFamily={brandConfig.fonts.heading}
                            textAlign="center"
                        >
                            Skills & Endorsements
                        </Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="full">
                            {provider.skills.map((skill: any, index: number) => (
                                <Card key={index} shadow="md" borderRadius="lg">
                                    <CardBody>
                                        <VStack align="start" spacing={3}>
                                            <HStack justify="space-between" width="full">
                                                <Text fontWeight="bold" color={getColor("primary")}>
                                                    {skill.name}
                                                </Text>
                                                <Badge
                                                    colorScheme={skill.level === "EXPERT" ? "green" : skill.level === "ADVANCED" ? "blue" : skill.level === "INTERMEDIATE" ? "orange" : "gray"}
                                                    variant="subtle"
                                                >
                                                    {skill.level}
                                                </Badge>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Text fontSize="sm" color={textPrimary}>
                                                    {skill.endorsements} endorsements
                                                </Text>
                                                <HStack spacing={1}>
                                                    {(() => {
                                                        const starCount = Math.min(5, Math.max(1, Math.floor(skill.endorsements / 10)));
                                                        return Array.from({ length: starCount }, (_, i) => (
                                                            <Icon key={i} as={StarIcon} color="yellow.400" w={3} h={3} />
                                                        ));
                                                    })()}
                                                </HStack>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            )}

            {/* Testimonials Section */}
            {provider.testimonials?.length > 0 && (
                <Box bg={bg} py={16}>
                    <Container maxW="6xl">
                        <VStack spacing={12}>
                            <VStack spacing={4} textAlign="center">
                                <Heading
                                    as="h2"
                                    size="xl"
                                    color={getColor("primary")}
                                    fontFamily={brandConfig.fonts.heading}
                                >
                                    Client Success Stories
                                </Heading>
                                <Text
                                    fontSize="lg"
                                    color={textPrimary}
                                    maxW="600px"
                                >
                                    Real experiences from clients who have transformed
                                    their approach through our services.
                                </Text>
                            </VStack>

                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                                {provider.testimonials.map((testimonial: any, index: number) => (
                                    <Card key={index} shadow="lg" borderRadius="xl">
                                        <CardHeader>
                                            <HStack spacing={4}>
                                                <Avatar
                                                    src={testimonial.avatar}
                                                    name={testimonial.name}
                                                    size="md"
                                                />
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="lg">
                                                        {testimonial.name}
                                                    </Text>
                                                    <Text fontSize="sm" color={textPrimary}>
                                                        {testimonial.location}
                                                    </Text>
                                                    <HStack spacing={1}>
                                                        {Array.from({ length: testimonial.rating }, (_, i) => (
                                                            <Icon key={i} as={StarIcon} color="yellow.400" w={4} h={4} />
                                                        ))}
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody pt={0}>
                                            <Text
                                                fontStyle="italic"
                                                color={textPrimary}
                                                lineHeight="tall"
                                            >
                                                "{testimonial.text}"
                                            </Text>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </VStack>
                    </Container>
                </Box>
            )}

            {/* Contact Section */}
            {provider.contactInfo && (
                <Container maxW="6xl" py={16}>
                    <VStack spacing={8} textAlign="center">
                        <VStack spacing={4}>
                            <Heading
                                as="h2"
                                size="xl"
                                color={getColor("primary")}
                                fontFamily={brandConfig.fonts.heading}
                            >
                                Ready to Get Started?
                            </Heading>
                            <Text
                                fontSize="lg"
                                color={textPrimary}
                                maxW="600px"
                            >
                                Let's connect and explore how we can work together
                                to achieve your goals.
                            </Text>
                        </VStack>

                        <HStack spacing={6} flexWrap="wrap" justify="center">
                            {provider.contactInfo.email && (
                                <Button
                                    size="lg"
                                    bg={getColor("primary")}
                                    color="white"
                                    _hover={{
                                        bg: getColor("primaryHover"),
                                        transform: "translateY(-2px)"
                                    }}
                                    leftIcon={<EmailIcon />}
                                    shadow="lg"
                                    transition="all 0.3s ease"
                                    as="a"
                                    href={`mailto:${provider.contactInfo.email}`}
                                >
                                    Email Me
                                </Button>
                            )}
                            {provider.contactInfo.phone && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    borderColor={getColor("primary")}
                                    color={getColor("primary")}
                                    _hover={{
                                        bg: getColor("background.light"),
                                        transform: "translateY(-2px)"
                                    }}
                                    leftIcon={<PhoneIcon />}
                                    shadow="lg"
                                    transition="all 0.3s ease"
                                    as="a"
                                    href={`tel:${provider.contactInfo.phone}`}
                                >
                                    Call Today
                                </Button>
                            )}
                            {provider.portfolioUrl && (
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    color={getColor("secondary")}
                                    _hover={{
                                        bg: getColor("background.light"),
                                        transform: "translateY(-2px)"
                                    }}
                                    rightIcon={<ExternalLinkIcon />}
                                    transition="all 0.3s ease"
                                    as="a"
                                    href={provider.portfolioUrl}
                                    target="_blank"
                                >
                                    View Portfolio
                                </Button>
                            )}
                        </HStack>

                        {(provider.contactInfo.email || provider.contactInfo.phone || provider.availability) && (
                            <Box
                                bg={getColor("background.card")}
                                p={8}
                                borderRadius="xl"
                                shadow="lg"
                                maxW="500px"
                                w="full"
                            >
                                <VStack spacing={4}>
                                    <Heading as="h3" size="md" color={getColor("primary")}>
                                        Connect Directly
                                    </Heading>
                                    <VStack spacing={2}>
                                        {provider.contactInfo.email && (
                                            <HStack>
                                                <Icon as={EmailIcon} color={getColor("secondary")} />
                                                <Text>{provider.contactInfo.email}</Text>
                                            </HStack>
                                        )}
                                        {provider.contactInfo.phone && (
                                            <HStack>
                                                <Icon as={PhoneIcon} color={getColor("secondary")} />
                                                <Text>{provider.contactInfo.phone}</Text>
                                            </HStack>
                                        )}
                                    </VStack>
                                    {provider.availability?.schedule && (
                                        <Text fontSize="sm" color={textPrimary} textAlign="center">
                                            {provider.availability.schedule}
                                        </Text>
                                    )}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </Container>
            )}

            <FooterWithFourColumns />

            {/* Modal Components */}
            {/* Uncomment when services and products modals are available
            <ServicesCarouselModal
                isOpen={isServicesModalOpen}
                onClose={onServicesModalClose}
            />

            <ProductCarouselModal
                isOpen={isProductsModalOpen}
                onClose={onProductsModalClose}
            />
            */}
        </Box>
    );
};

export default ProviderView;