import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import {
    Box,
    Container,
    Grid,
    Image,
    Text,
    Button,
    Heading,
    Stack,
    HStack,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Badge,
    Card,
    CardBody,
    Skeleton,
    SimpleGrid,
    Spacer,
    Center,
    Spinner,
    VStack,
    Divider,
    Icon,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, AddIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { useColorMode } from "@chakra-ui/react";

const GET_PUBLIC_SELLER_PROFILES = gql`
  query GetSellerProfiles {
    sellerProfiles {
      id
      businessName
      description
      businessType
      status
      logoImage
      images
      categories
      specialties
      contactEmail
      contactPhone
      address {
        street
        city
        state
        postcode
        country
      }
      isVerified
      isFeatured
      averageRating
      reviewCount
      offersDelivery
      offersPickup
      offersShipping
      yearsInBusiness
      madeByClient {
        id
        fName
        lName
      }
    }
  }
`;

interface SellerProfile {
    id: string;
    businessName: string;
    description: string;
    businessType: string;
    status: string;
    logoImage?: string;
    images: string[];
    categories: string[];
    specialties: string[];
    contactEmail?: string;
    contactPhone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    isVerified: boolean;
    isFeatured: boolean;
    averageRating: number;
    reviewCount: number;
    offersDelivery: boolean;
    offersPickup: boolean;
    offersShipping: boolean;
    yearsInBusiness?: number;
    madeByClient: {
        id: string;
        fName: string;
        lName: string;
    };
}

const businessTypeLabels: Record<string, string> = {
    FARM: "🚜 Farm",
    ESSENTIAL_OILS: "🌿 Essential Oils",
    HANDMADE_CRAFTS: "🎨 Handmade Crafts",
    HEALTH_WELLNESS: "💪 Health & Wellness",
    FOOD_BEVERAGE: "🍯 Food & Beverage",
    CLOTHING_FASHION: "👗 Clothing & Fashion",
    HOME_GARDEN: "🏡 Home & Garden",
    SERVICES: "⚙️ Services",
    OTHER: "📦 Other",
    // Wellbeing Categories
    HEALTHY_HOME: "🏠 Healthy Home",
    HEALTHY_FOODS: "🥗 Healthy Foods",
    PERSONAL_WELLBEING: "🧘 Personal Wellbeing",
    RELATIONSHIPS: "💕 Relationships",
    FAMILY_DEVELOPMENT: "👨‍👩‍👧‍👦 Family Development",
    ECONOMIC_WELLBEING: "💰 Economic Wellbeing",
    LIFELONG_LEARNING: "📚 Lifelong Learning & Skills",
    SUSTAINABILITY_COMMUNITY: "🌱 Sustainability & Community Wellbeing",
    EMERGENCY_PREPAREDNESS: "🚨 Emergency Preparedness"
};

const SellerProfileCard = ({ profile }: { profile: SellerProfile }) => {
    const navigate = useNavigate();
    const mainImage = profile.logoImage || profile.images?.[0];

    return (
        <Card
            bg={getColor("background.card")}
            boxShadow={getComponent("card", "shadow")}
            border="1px"
            borderColor={getColor("border.light")}
            borderRadius="xl"
            overflow="hidden"
            transition="all 0.3s ease"
            position="relative"
            height={{ base: "auto", md: "500px" }}
            display="flex"
            flexDirection="column"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: "xl",
                borderColor: getColor("primary")
            }}
        >
            {/* Featured Badge */}
            {profile.isFeatured && (
                <Box
                    position="absolute"
                    top={4}
                    right={4}
                    px={3}
                    py={2}
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="bold"
                    zIndex={2}
                    bg={getColor("secondary")}
                    color={getColor("text.inverse")}
                    boxShadow="0 4px 20px rgba(121, 40, 202, 0.3)"
                    transform="rotate(5deg)"
                >
                    ⭐ Featured
                </Box>
            )}

            {/* Verified Badge */}
            {profile.isVerified && (
                <Box
                    position="absolute"
                    top={4}
                    left={4}
                    px={3}
                    py={2}
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="bold"
                    zIndex={2}
                    bg={getColor("status.success")}
                    color={getColor("text.inverse")}
                    boxShadow="0 4px 20px rgba(34, 197, 94, 0.3)"
                    transform="rotate(-5deg)"
                >
                    ✅ Verified
                </Box>
            )}

            {/* Image Container */}
            {mainImage && (
                <Box
                    w="full"
                    h="200px"
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                    zIndex={1}
                    boxShadow={getComponent("card", "shadow")}
                >
                    <Image
                        src={mainImage}
                        alt={profile.businessName}
                        objectFit="cover"
                        w="full"
                        h="full"
                        transition="all 0.5s ease"
                        _hover={{
                            transform: "scale(1.05)"
                        }}
                        fallback={
                            <Box
                                w="full"
                                h="full"
                                bg={getColor("background.light")}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Text color={getColor("text.primary")} fontFamily={brandConfig.fonts.body} fontSize="lg">
                                    {profile.businessName.charAt(0).toUpperCase()}
                                </Text>
                            </Box>
                        }
                    />
                </Box>
            )}

            <CardBody flex="1" display="flex" flexDirection="column">
                <VStack spacing={4} align="stretch" height="100%">
                    <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between" align="start">
                            <Heading
                                size="md"
                                noOfLines={2}
                                color={getColor("text.primary")}
                                _hover={{ color: getColor("primary") }}
                                cursor="pointer"
                                onClick={() => navigate(`/seller-profile/${profile.id}`)}
                                fontFamily={brandConfig.fonts.heading}
                            >
                                {profile.businessName}
                            </Heading>
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                {businessTypeLabels[profile.businessType] || profile.businessType}
                            </Badge>
                        </HStack>

                        <Text
                            noOfLines={3}
                            color={getColor("text.secondary")}
                            fontSize="sm"
                            lineHeight="1.6"
                            fontFamily={brandConfig.fonts.body}
                        >
                            {profile.description}
                        </Text>

                        {/* Owner info */}
                        <Text fontSize="xs" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                            By {profile.madeByClient.fName} {profile.madeByClient.lName}
                        </Text>

                        {/* Address */}
                        {profile.address && (
                            <Text fontSize="xs" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                📍 {profile.address.city}, {profile.address.state}
                            </Text>
                        )}

                        {/* Years in business */}
                        {profile.yearsInBusiness && profile.yearsInBusiness > 0 && (
                            <Text fontSize="xs" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                📅 {profile.yearsInBusiness} years in business
                            </Text>
                        )}

                        {/* Delivery options */}
                        <HStack spacing={2} flexWrap="wrap">
                            {profile.offersDelivery && (
                                <Badge colorScheme="green" variant="subtle" fontSize="xs">🚚 Delivery</Badge>
                            )}
                            {profile.offersPickup && (
                                <Badge colorScheme="blue" variant="subtle" fontSize="xs">🏪 Pickup</Badge>
                            )}
                            {profile.offersShipping && (
                                <Badge colorScheme="purple" variant="subtle" fontSize="xs">📦 Shipping</Badge>
                            )}
                        </HStack>

                        {/* Specialties */}
                        {profile.specialties?.length > 0 && (
                            <HStack spacing={1} flexWrap="wrap">
                                {profile.specialties.slice(0, 3).map((specialty, idx) => (
                                    <Badge key={idx} variant="outline" fontSize="xs">
                                        {specialty}
                                    </Badge>
                                ))}
                                {profile.specialties.length > 3 && (
                                    <Badge variant="outline" fontSize="xs">
                                        +{profile.specialties.length - 3} more
                                    </Badge>
                                )}
                            </HStack>
                        )}

                        {/* Rating */}
                        {profile.reviewCount > 0 && (
                            <HStack spacing={2}>
                                <Text fontSize="sm" fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                    ⭐ {profile.averageRating.toFixed(1)}
                                </Text>
                                <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                    ({profile.reviewCount} reviews)
                                </Text>
                            </HStack>
                        )}
                    </VStack>

                    <Spacer />

                    <VStack spacing={4} width="100%">
                        <Divider borderColor={getColor("border.light")} />

                        <Button
                            width="full"
                            bg={getComponent("button", "secondaryBg")}
                            color={getColor("text.primary")}
                            _hover={{ bg: getComponent("button", "secondaryHover") }}
                            variant="outline"
                            size="md"
                            onClick={() => navigate(`/seller-profile/${profile.id}`)}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap={2}
                            transition="all 0.3s ease"
                            fontFamily={brandConfig.fonts.body}
                        >
                            View Profile
                            <Icon as={ViewIcon} />
                        </Button>
                    </VStack>
                </VStack>
            </CardBody>
        </Card>
    );
};

const SellerProfilesList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const { colorMode } = useColorMode();

    // Theme-aware colors
    const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
    const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const { loading, error, data } = useQuery(GET_PUBLIC_SELLER_PROFILES, {
        onCompleted: (data) => {
            console.log("Seller Profiles Query Response:", {
                totalProfiles: data?.sellerProfiles?.length,
                profiles: data?.sellerProfiles
            });
        },
        onError: (error) => {
            console.error("Seller Profiles Query Error:", error);
        }
    });

    const allBusinessTypes = useMemo(() => {
        if (!data?.sellerProfiles) return [];
        const typesSet = new Set<string>();
        data.sellerProfiles.forEach((profile: SellerProfile) => {
            typesSet.add(profile.businessType);
        });
        return ["all", ...Array.from(typesSet)];
    }, [data]);

    const filteredAndSortedProfiles = useMemo(() => {
        if (!data?.sellerProfiles) return [];

        let filtered = [...data.sellerProfiles];

        if (searchTerm) {
            filtered = filtered.filter(profile =>
                profile.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (businessTypeFilter !== "all") {
            filtered = filtered.filter(profile => profile.businessType === businessTypeFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.averageRating - a.averageRating;
                case "reviews":
                    return b.reviewCount - a.reviewCount;
                case "years":
                    return (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0);
                default:
                    return a.businessName.localeCompare(b.businessName);
            }
        });

        return filtered;
    }, [data, searchTerm, businessTypeFilter, sortBy]);

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />

            <Container maxW="container.xl" py={8} flex="1">
                <Stack spacing={8}>
                    {/* Header Section */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        borderRadius="xl"
                        border="1px"
                        borderColor={getColor("border.light")}
                        overflow="hidden"
                    >
                        <CardBody>
                            <Stack spacing={6}>
                                <HStack justify="space-between" wrap="wrap" spacing={4}>
                                    <VStack align="start" spacing={2}>
                                        <Text
                                            fontSize="sm"
                                            color={getColor("text.muted")}
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            Business Directory
                                        </Text>
                                        <Heading size="lg" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                            🏪 Seller Profiles
                                        </Heading>
                                    </VStack>
                                    <Button
                                        leftIcon={<AddIcon />}
                                        bg={getComponent("button", "primaryBg")}
                                        color={getColor("text.inverse")}
                                        _hover={{ bg: getComponent("button", "primaryHover") }}
                                        onClick={() => navigate("/seller-profiles/new")}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        Create Seller Profile
                                    </Button>
                                </HStack>

                                {/* Search and Filter Section */}
                                <Grid
                                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                                    gap={4}
                                >
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon color={getColor("text.muted")} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search seller profiles..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus")
                                            }}
                                            _hover={{ borderColor: getColor("border.medium") }}
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </InputGroup>

                                    <Select
                                        value={businessTypeFilter}
                                        onChange={(e) => setBusinessTypeFilter(e.target.value)}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                        }}
                                        _hover={{ borderColor: getColor("border.medium") }}
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        <option value="all">All Business Types</option>
                                        {allBusinessTypes.filter(type => type !== "all").map(type => (
                                            <option key={type} value={type}>
                                                {businessTypeLabels[type] || type}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                        }}
                                        _hover={{ borderColor: getColor("border.medium") }}
                                        fontFamily={brandConfig.fonts.body}
                                    >
                                        <option value="name">Name</option>
                                        <option value="rating">Rating</option>
                                        <option value="reviews">Number of Reviews</option>
                                        <option value="years">Years in Business</option>
                                    </Select>
                                </Grid>
                            </Stack>
                        </CardBody>
                    </Card>

                    {/* Profiles Grid */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        borderRadius="xl"
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardBody>
                            {loading ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} height="400px" borderRadius="lg" />
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <>
                                    {filteredAndSortedProfiles.length > 0 ? (
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                            {filteredAndSortedProfiles.map((profile: SellerProfile) => (
                                                <SellerProfileCard key={profile.id} profile={profile} />
                                            ))}
                                        </SimpleGrid>
                                    ) : (
                                        <Box textAlign="center" py={10}>
                                            <Text fontSize="lg" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                                No seller profiles found matching your criteria
                                            </Text>
                                        </Box>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Stack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default SellerProfilesList; 