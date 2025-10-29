import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
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
  useToast,
  SimpleGrid,
  Spacer,
  Center,
  Spinner,
  VStack,
  Divider,
  Icon,
  Tooltip,
  Link,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, AddIcon, InfoIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import productsModuleConfig from './moduleConfig';
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { motion } from "framer-motion";
import { Product, ProductVariant } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Life Essential Club Categories
const LEC_CATEGORIES = [
  {
    value: "HEALTHY_HOME",
    label: "🏠 Healthy Home",
    description: "Products and services to create a safe, clean, and sustainable living environment."
  },
  {
    value: "HEALTHY_FOODS", 
    label: "🥗 Healthy Foods",
    description: "Nutritious and accessible food options for optimal health."
  },
  {
    value: "PERSONAL_WELLBEING",
    label: "🧘 Personal Wellbeing", 
    description: "Products and services to support mental, emotional, and physical health."
  },
  {
    value: "RELATIONSHIPS",
    label: "💕 Relationships",
    description: "Resources to nurture healthy interpersonal connections."
  },
  {
    value: "FAMILY_DEVELOPMENT",
    label: "👨‍👩‍👧‍👦 Family Development",
    description: "Tools and resources for building resilient, thriving families."
  },
  {
    value: "ECONOMIC_WELLBEING",
    label: "💰 Economic Wellbeing",
    description: "Resources to support financial health and independence."
  },
  {
    value: "LIFELONG_LEARNING",
    label: "📚 Lifelong Learning & Skills",
    description: "Educational tools for personal and professional growth."
  },
  {
    value: "SUSTAINABILITY_COMMUNITY",
    label: "🌱 Sustainability & Community Wellbeing",
    description: "Promoting eco-conscious living and community care."
  },
  {
    value: "EMERGENCY_PREPAREDNESS",
    label: "🚨 Emergency Preparedness",
    description: "Ready resources for unexpected events."
  }
];

const GET_PRODUCTS = gql`
  query GetProducts($sellerProfileId: ID) {
    products(sellerProfileId: $sellerProfileId) {
      id
      name
      description
      price
      memberPrice
      images
      categories
      isActive
      seller {
        id
        fName
        lName
      }
      sellerProfile {
        id
        businessName
        logoImage
        businessType
        isVerified
        isFeatured
      }
      enableForSyndicate
    }
  }
`;

const GET_SELLER_PROFILE = gql`
  query GetSellerProfile($id: ID!) {
    sellerProfile(id: $id) {
      id
      businessName
      description
      businessType
      logoImage
      isVerified
      isFeatured
      madeByClient {
        id
        fName
        lName
      }
    }
  }
`;

const GET_ALL_SELLER_PROFILES = gql`
  query GetAllSellerProfiles {
    sellerProfiles {
      id
      businessName
      businessType
      logoImage
      isVerified
      isFeatured
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;


interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterInput {
  categories?: string[];
  priceRange?: PriceRange;
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const mainImage = product.images?.[0];
  const { isAuthenticated } = useAuth();
  const hasMemberDiscount = product.memberPrice && product.memberPrice < product.price;
  const discountPercentage = hasMemberDiscount
    ? Math.round(((product.price - product.memberPrice!) / product.price) * 100)
    : 0;

  // Brand styling variables
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const primaryColor = getColor("primary");
  const primaryHover = getColor("primaryHover");
  const successGreen = getColor("successGreen");
  const errorRed = getColor("status.error");
  const purpleAccent = getColor("purpleAccent");

  const handleDelete = async (productId: string) => {
    try {
      const { data } = await deleteProduct({
        variables: { id: productId },
        update(cache) {
          const existingProducts = cache.readQuery<{ products: Product[] }>({
            query: GET_PRODUCTS
          });

          if (existingProducts) {
            cache.writeQuery({
              query: GET_PRODUCTS,
              data: {
                products: existingProducts.products.filter(
                  product => product.id !== productId
                )
              }
            });
          }
        }
      });

      if (data.deleteProduct) {
        toast({
          title: "Product deleted successfully",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      position="relative"
      height={{ base: "450px", sm: "475px", md: "500px" }}
      display="flex"
      flexDirection="column"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
        borderColor: primaryColor
      }}
    >
      {/* Floating Price Tag */}
      <Box
        position="absolute"
        top={{ base: 2, md: 4 }}
        right={{ base: 2, md: 4 }}
        px={{ base: 3, md: 4 }}
        py={{ base: 2, md: 3 }}
        borderRadius="xl"
        fontSize="sm"
        fontWeight="bold"
        transform="rotate(5deg)"
        zIndex={2}
        bg={primaryColor}
        color="white"
        boxShadow="0 4px 20px rgba(59, 130, 246, 0.3)"
        _hover={{
          transform: "rotate(5deg) scale(1.05)",
          boxShadow: "0 8px 30px rgba(59, 130, 246, 0.4)",
        }}
        transition="all 0.2s"
      >
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" fontFamily={brandConfig.fonts.body}>
          ${product.price.toFixed(2)}
        </Text>
      </Box>

      {/* Member Price Badge - only show if there's a member discount */}
      {hasMemberDiscount && (
        <Box
          position="absolute"
          top={{ base: 2, md: 4 }}
          left={{ base: 2, md: 4 }}
          px={{ base: 3, md: 4 }}
          py={{ base: 1.5, md: 2 }}
          borderRadius="xl"
          fontSize="sm"
          fontWeight="bold"
          zIndex={2}
          bg={purpleAccent}
          color="white"
          boxShadow="0 4px 20px rgba(168, 85, 247, 0.3)"
          transform="rotate(-5deg)"
          _hover={{
            transform: "rotate(-5deg) scale(1.05)",
            boxShadow: "0 8px 30px rgba(168, 85, 247, 0.4)",
          }}
          transition="all 0.2s"
          onClick={() => !isAuthenticated && navigate("/")}
          cursor={!isAuthenticated ? "pointer" : "default"}
        >
          <VStack spacing={0}>
            <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="normal" fontFamily={brandConfig.fonts.body}>
              {isAuthenticated ? "Member Price" : "Members Save"}
            </Text>
            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" fontFamily={brandConfig.fonts.body}>
              {isAuthenticated
                ? `$${product.memberPrice!.toFixed(2)}`
                : `${discountPercentage}% Off`}
            </Text>
            {!isAuthenticated && (
              <Text fontSize="2xs" fontWeight="normal" mt={1} fontFamily={brandConfig.fonts.body}>
                Join Now →
              </Text>
            )}
          </VStack>
        </Box>
      )}

      {/* Image Container */}
      {mainImage && (
        <Box
          w="full"
          h={{ base: "200px", sm: "225px", md: "250px" }}
          borderRadius="md"
          overflow="hidden"
          position="relative"
          zIndex={1}
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
        >
          <Image
            src={mainImage}
            alt={product.name}
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
                bg="rgba(255, 255, 255, 0.05)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color={textPrimary} fontFamily={brandConfig.fonts.body}>
                  {product.name}
                </Text>
              </Box>
            }
          />
        </Box>
      )}

      <CardBody flex="1" display="flex" flexDirection="column">
        <VStack spacing={4} align="stretch" height="100%">
          <VStack align="stretch" spacing={3}>
            <Heading
              size={{ base: "sm", md: "md" }}
              noOfLines={2}
              color={textPrimary}
              _hover={{ color: primaryColor }}
              cursor="pointer"
              onClick={() => navigate(`/products/${product.id}`)}
              fontFamily={brandConfig.fonts.heading}
            >
              {product.name}
            </Heading>

            <Text
              noOfLines={{ base: 2, md: 3 }}
              color={textSecondary}
              fontSize={{ base: "xs", md: "sm" }}
              lineHeight="1.6"
              fontFamily={brandConfig.fonts.body}
            >
              {product.description}
            </Text>

            {/* Show seller profile info if available and not already filtering by this seller */}
            {product.sellerProfile && !searchParams.get('seller') && (
              <HStack spacing={{ base: 1, md: 2 }} mt={2} p={{ base: 1.5, md: 2 }} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                {product.sellerProfile.logoImage && (
                  <Image
                    src={product.sellerProfile.logoImage}
                    alt={product.sellerProfile.businessName}
                    width={{ base: "20px", md: "25px" }}
                    height={{ base: "20px", md: "25px" }}
                    objectFit="cover"
                    borderRadius="sm"
                  />
                )}
                <VStack align="start" spacing={0} flex={1}>
                  <HStack spacing={1}>
                    <Text fontSize="xs" fontWeight="bold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                      {product.sellerProfile.businessName}
                    </Text>
                    {product.sellerProfile.isVerified && (
                      <Badge colorScheme="green" size="sm">✅</Badge>
                    )}
                  </HStack>
                  <Text fontSize="2xs" color={textMuted} fontFamily={brandConfig.fonts.body}>
                    {product.sellerProfile.businessType}
                  </Text>
                </VStack>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products?seller=${product.sellerProfile!.id}`);
                  }}
                  color={primaryColor}
                  fontFamily={brandConfig.fonts.body}
                >
                  More →
                </Button>
              </HStack>
            )}

            {/* Add member price info in the card body for authenticated users */}
            {isAuthenticated && hasMemberDiscount && (
              <HStack spacing={2}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={textMuted}
                  textDecoration="line-through"
                  fontFamily={brandConfig.fonts.body}
                >
                  ${product.price.toFixed(2)}
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={purpleAccent}
                  fontFamily={brandConfig.fonts.body}
                >
                  ${product.memberPrice!.toFixed(2)}
                </Text>
                <Badge colorScheme="purple" variant="solid">
                  Save {discountPercentage}%
                </Badge>
              </HStack>
            )}
          </VStack>

          <Spacer />

          <VStack spacing={4} width="100%">
            <Divider borderColor={cardBorder} />

            <Button
              width="full"
              variant="outline"
              borderColor={primaryColor}
              color={primaryColor}
              _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
              size={{ base: "sm", md: "md" }}
              onClick={() => navigate(`/products/${product.id}`)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              transition="all 0.2s"
              fontWeight="semibold"
              fontFamily={brandConfig.fonts.body}
            >
              View Details
              <Icon as={ViewIcon} />
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const AllProducts = () => {
  usePageTitle("Products");
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lecCategoryFilter, setLecCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [expiryCountdown, setExpiryCountdown] = useState<string>("");
  const [loginTime, setLoginTime] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 100 });

  // Brand styling variables
  const bgMain = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const primaryColor = getColor("primary");
  const primaryHover = getColor("primaryHover");
  const successGreen = getColor("successGreen");
  const errorRed = getColor("status.error");
  const infoBlue = getColor("status.info");
  const warningColor = getColor("status.warning");
  const purpleAccent = getColor("purpleAccent");

  // Get seller profile ID from URL parameters
  const sellerProfileIdFromUrl = searchParams.get('seller');

  // Use URL parameter if available, otherwise use dropdown selection
  const activeSellerFilter = sellerProfileIdFromUrl || (selectedSeller !== "all" ? selectedSeller : undefined);

  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { sellerProfileId: activeSellerFilter },
    onCompleted: (data) => {
      console.log("Products Query Response:", {
        totalProducts: data?.products?.length,
        products: data?.products,
        sellerProfileFilter: activeSellerFilter
      });
    },
    onError: (error) => {
      console.error("Products Query Error:", error);
    }
  });

  // Query seller profile info if filtering by seller
  const { data: sellerProfileData } = useQuery(GET_SELLER_PROFILE, {
    variables: { id: activeSellerFilter },
    skip: !activeSellerFilter,
  });

  // Query all seller profiles for dropdown
  const { data: allSellerProfilesData } = useQuery(GET_ALL_SELLER_PROFILES);

  const allCategories = useMemo(() => {
    if (!data?.products) return [];
    const categoriesSet = new Set<string>();
    data.products.forEach((product: Product) => {
      product.categories?.forEach(category => categoriesSet.add(category));
    });
    return ["all", ...Array.from(categoriesSet)];
  }, [data]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!data?.products) return [];

    let filtered = [...data.products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by regular category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product =>
        product.categories?.includes(categoryFilter)
      );
    }

    // Filter by LEC category (based on seller profile business type)
    if (lecCategoryFilter !== "all") {
      filtered = filtered.filter(product =>
        product.sellerProfile?.businessType === lecCategoryFilter
      );
    }

    // Only show active products for non-admin users
    if (!isAdmin) {
      filtered = filtered.filter(product => product.isActive);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [data, searchTerm, sortBy, categoryFilter, lecCategoryFilter, isAdmin]);

  useEffect(() => {
    const updateCountdown = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const decoded = jwtDecode<{ exp: number; iat: number }>(token);
        const expiryTime = decoded.exp * 1000; // Convert to milliseconds
        const issuedTime = decoded.iat * 1000; // Convert to milliseconds
        const now = Date.now();
        const diff = expiryTime - now;

        // Calculate total duration
        const totalDurationMs = expiryTime - issuedTime;
        const totalDays = Math.floor(totalDurationMs / (1000 * 60 * 60 * 24));
        setTotalDuration(`${totalDays} days`);

        // Format login time
        setLoginTime(new Date(issuedTime).toLocaleString());

        // Calculate countdown
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setExpiryCountdown(`${hours} hours, ${minutes} minutes`);
        } else {
          setExpiryCountdown("Expired");
        }
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedPassword = localStorage.getItem("admin_password");
    setIsAdmin(storedPassword === "123456");
  }, []);

  if (authLoading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={productsModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Center h="50vh">
            <Spinner size="xl" color={primaryColor} />
          </Center>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={productsModuleConfig} />

      <Container 
        maxW={{ base: "container.sm", md: "container.md", lg: "container.lg", xl: "container.xl" }}
        px={{ base: 4, md: 8 }}
        py={{ base: 4, md: 8 }}
        flex="1"
      >
        <Stack spacing={8}>
          {/* Header Section */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
            overflow="hidden"
          >
            <CardBody>
              <Stack spacing={{ base: 4, md: 6 }}>
                <Stack 
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "stretch", md: "center" }}
                  spacing={{ base: 4, md: 4 }}
                >
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="sm"
                      color={textMuted}
                      textTransform="uppercase"
                      letterSpacing="wider"
                      fontFamily={brandConfig.fonts.body}
                    >
                      {sellerProfileData ? "Seller Profile" : "Product Catalog"}
                    </Text>
                    {sellerProfileData ? (
                      <VStack align="start" spacing={2}>
                        <HStack spacing={3} align="center">
                          {sellerProfileData.sellerProfile.logoImage && (
                            <Image
                              src={sellerProfileData.sellerProfile.logoImage}
                              alt={sellerProfileData.sellerProfile.businessName}
                              width="50px"
                              height="50px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          )}
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Heading 
                                size={{ base: "md", md: "lg" }}
                                color={textPrimary}
                                fontFamily={brandConfig.fonts.heading}
                              >
                                {sellerProfileData.sellerProfile.businessName}
                              </Heading>
                              {sellerProfileData.sellerProfile.isVerified && (
                                <Badge colorScheme="green">✅ Verified</Badge>
                              )}
                              {sellerProfileData.sellerProfile.isFeatured && (
                                <Badge colorScheme="purple">⭐ Featured</Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color={textSecondary} fontFamily={brandConfig.fonts.body}>
                              {sellerProfileData.sellerProfile.businessType} • Owner: {sellerProfileData.sellerProfile.madeByClient.fName} {sellerProfileData.sellerProfile.madeByClient.lName}
                            </Text>
                          </VStack>
                        </HStack>
                        {sellerProfileData.sellerProfile.description && (
                          <Text color={textSecondary} fontFamily={brandConfig.fonts.body} maxW="600px">
                            {sellerProfileData.sellerProfile.description}
                          </Text>
                        )}
                        <HStack spacing={4}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/seller-profile/${activeSellerFilter}`)}
                            borderColor={primaryColor}
                            color={primaryColor}
                            _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                            fontFamily={brandConfig.fonts.body}
                          >
                            View Full Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate('/products')}
                            color={textMuted}
                            _hover={{ color: textPrimary }}
                            fontFamily={brandConfig.fonts.body}
                          >
                            ← View All Products
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <Heading 
                        size={{ base: "md", md: "lg" }}
                        color={textPrimary}
                        fontFamily={brandConfig.fonts.heading}
                      >
                        All Products
                      </Heading>
                    )}
                  </VStack>
                  <Button
                    leftIcon={<AddIcon />}
                    bg={primaryColor}
                    color="white"
                    _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    onClick={() => navigate("/products/new")}
                    size={{ base: "md", md: "lg" }}
                    width={{ base: "100%", md: "auto" }}
                    minW={{ md: "200px" }}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Add New Physical Product
                  </Button>
                </Stack>

                {/* Life Essential Club Categories - Featured Filter */}
                <Box
                  p={6}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  border="2px"
                  borderColor={purpleAccent}
                  width="100%"
                >
                  <VStack align="stretch" spacing={4}>
                    <HStack spacing={3} align="center">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                        🌟 Life Essential Club Categories
                      </Text>
                      <Tooltip
                        label={
                          <VStack align="start" spacing={2} p={2}>
                            <Text fontSize="sm" fontFamily={brandConfig.fonts.body}>
                              These are the official Life Essential Club categories designed to help us rethink what is essential in life.
                            </Text>
                            <Text fontSize="sm" fontFamily={brandConfig.fonts.body}>
                              If you'd like to learn more, visit lifeessentials.club
                            </Text>
                          </VStack>
                        }
                        hasArrow
                        placement="top"
                        bg={cardGradientBg}
                        color={textPrimary}
                        borderRadius="lg"
                        p={3}
                        maxW="300px"
                      >
                        <Icon 
                          as={InfoIcon} 
                          color={purpleAccent} 
                          cursor="pointer"
                          _hover={{ color: primaryColor }}
                          onClick={() => window.open('https://www.lifeessentials.club/', '_blank')}
                        />
                      </Tooltip>
                    </HStack>
                    <Select
                      value={lecCategoryFilter}
                      onChange={(e) => setLecCategoryFilter(e.target.value)}
                      bg="rgba(255, 255, 255, 0.05)"
                      border="2px"
                      borderColor={purpleAccent}
                      color={textPrimary}
                      borderRadius="lg"
                      _focus={{
                        borderColor: purpleAccent,
                        boxShadow: `0 0 0 1px ${purpleAccent}`
                      }}
                      _hover={{ borderColor: purpleAccent }}
                      fontFamily={brandConfig.fonts.body}
                      size="lg"
                    >
                      <option value="all">All Life Essential Categories</option>
                      {LEC_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                    <Text fontSize="sm" color={textMuted} fontFamily={brandConfig.fonts.body}>
                      Filter products by Life Essential Club wellbeing categories
                    </Text>
                  </VStack>
                </Box>

                {/* Main Search and Filter Section */}
                <VStack spacing={6} align="stretch">
                  {/* Search Bar */}
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                      🔍 Search Products
                    </Text>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color={textMuted} />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                        fontFamily={brandConfig.fonts.body}
                      />
                    </InputGroup>
                  </VStack>

                  {/* Filter Controls Row */}
                  <Grid 
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={{ base: 4, md: 6 }}
                  >
                    {/* Product Categories */}
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="md" fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                        📂 Product Categories
                      </Text>
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                        fontFamily={brandConfig.fonts.body}
                      >
                        <option value="all">All Product Categories</option>
                        {allCategories.filter(cat => cat !== "all").map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </VStack>

                    {/* Sort Options */}
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="md" fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                        📊 Sort By
                      </Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                        fontFamily={brandConfig.fonts.body}
                      >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="stock">Stock Level</option>
                      </Select>
                    </VStack>

                    {/* Shop Filter */}
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="md" fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                        🏪 Shop / Seller
                      </Text>
                      <Select
                        value={selectedSeller}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedSeller(value);
                          // If a seller is selected via dropdown, navigate to clear URL params
                          if (value !== "all" && sellerProfileIdFromUrl) {
                            navigate('/products');
                          }
                        }}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                        fontFamily={brandConfig.fonts.body}
                        isDisabled={!!sellerProfileIdFromUrl} // Disable if URL filtering is active
                      >
                        <option value="all">All Shops</option>
                        {allSellerProfilesData?.sellerProfiles?.map((seller: any) => (
                          <option key={seller.id} value={seller.id}>
                            {seller.businessName}
                            {seller.isVerified ? " ✅" : ""}
                            {seller.isFeatured ? " ⭐" : ""}
                          </option>
                        ))}
                      </Select>
                    </VStack>
                  </Grid>

                  {/* Price Range Filter */}
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textPrimary} fontFamily={brandConfig.fonts.body}>
                      💰 Price Range Filter (AUD)
                    </Text>
                    <Stack 
                      direction={{ base: "column", sm: "row" }}
                      spacing={{ base: 3, sm: 4 }}
                      maxW={{ base: "100%", md: "50%" }}
                    >
                      <VStack align="stretch" spacing={1} flex={1}>
                        <Text fontSize="sm" color={textMuted} fontFamily={brandConfig.fonts.body}>
                          Minimum Price
                        </Text>
                        <Input
                          type="number"
                          placeholder="$0"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _placeholder={{ color: textMuted }}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                          fontFamily={brandConfig.fonts.body}
                        />
                      </VStack>
                      <Text 
                        fontSize="lg"
                        color={textMuted}
                        alignSelf={{ base: "center", sm: "end" }}
                        pb={{ base: 0, sm: 2 }}
                        display={{ base: "none", sm: "block" }}
                      >
                        -
                      </Text>
                      <VStack align="stretch" spacing={1} flex={1}>
                        <Text fontSize="sm" color={textMuted} fontFamily={brandConfig.fonts.body}>
                          Maximum Price
                        </Text>
                        <Input
                          type="number"
                          placeholder="$1000"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _placeholder={{ color: textMuted }}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                          fontFamily={brandConfig.fonts.body}
                        />
                      </VStack>
                    </Stack>
                    <Text fontSize="sm" color={textMuted} fontFamily={brandConfig.fonts.body}>
                      Filter products within your budget range
                    </Text>
                  </VStack>

                  {/* Clear Shop Filter Button */}
                  {sellerProfileIdFromUrl && (
                    <Box>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/products');
                          setSelectedSeller("all");
                        }}
                        fontFamily={brandConfig.fonts.body}
                        borderColor={primaryColor}
                        color={primaryColor}
                        _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                      >
                        Clear Shop Filter
                      </Button>
                    </Box>
                  )}
                </VStack>


              </Stack>
            </CardBody>
          </Card>

          {/* Products Grid */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              {loading ? (
                <SimpleGrid 
                  columns={{ base: 1, sm: 2, md: 2, lg: 3 }}
                  spacing={{ base: 4, md: 6 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} height={{ base: "350px", md: "400px" }} borderRadius="lg" />
                  ))}
                </SimpleGrid>
              ) : (
                <>
                  {filteredAndSortedProducts.length > 0 ? (
                    <SimpleGrid 
                      columns={{ base: 1, sm: 2, md: 2, lg: 3 }}
                      spacing={{ base: 4, md: 6 }}
                    >
                      {filteredAndSortedProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontSize="lg" color={textMuted} fontFamily={brandConfig.fonts.body}>
                        {sellerProfileData
                          ? `No products available from ${sellerProfileData.sellerProfile.businessName}`
                          : "No products found matching your criteria"
                        }
                      </Text>
                      {sellerProfileData && (
                        <Button
                          mt={4}
                          variant="outline"
                          onClick={() => navigate('/products')}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Browse All Products
                        </Button>
                      )}
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

export default AllProducts; 