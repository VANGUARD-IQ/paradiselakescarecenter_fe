import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    VStack,
    HStack,
    Input,
    FormControl,
    FormLabel,
    Textarea,
    useToast,
    Switch,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Center,
    Spinner,
    useDisclosure,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Badge,
    IconButton,
    Checkbox,
    CheckboxGroup,
    Divider,
} from "@chakra-ui/react";
import { CheckIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { LoginModal } from "../authentication";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

// GraphQL Queries and Mutations
const CREATE_SELLER_PROFILE = gql`
  mutation CreateSellerProfile($input: SellerProfileInput!) {
    createSellerProfile(input: $input) {
      id
      businessName
      description
      businessType
      status
    }
  }
`;

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
    }
  }
`;

// Enums
enum BusinessType {
    // FARM = "FARM",
    // ESSENTIAL_OILS = "ESSENTIAL_OILS",
    // HANDMADE_CRAFTS = "HANDMADE_CRAFTS",
    // HEALTH_WELLNESS = "HEALTH_WELLNESS",
    // FOOD_BEVERAGE = "FOOD_BEVERAGE",
    // CLOTHING_FASHION = "CLOTHING_FASHION",
    // HOME_GARDEN = "HOME_GARDEN",
    SERVICES = "SERVICES",
    OTHER = "OTHER",
    // Wellbeing Categories
    HEALTHY_HOME = "HEALTHY_HOME",
    HEALTHY_FOODS = "HEALTHY_FOODS",
    PERSONAL_WELLBEING = "PERSONAL_WELLBEING",
    RELATIONSHIPS = "RELATIONSHIPS",
    FAMILY_DEVELOPMENT = "FAMILY_DEVELOPMENT",
    ECONOMIC_WELLBEING = "ECONOMIC_WELLBEING",
    LIFELONG_LEARNING = "LIFELONG_LEARNING",
    SUSTAINABILITY_COMMUNITY = "SUSTAINABILITY_COMMUNITY",
    EMERGENCY_PREPAREDNESS = "EMERGENCY_PREPAREDNESS"
}

// Business Type Options
const businessTypeOptions = [
    // { value: BusinessType.FARM, label: "🚜 Farm" },
    // { value: BusinessType.ESSENTIAL_OILS, label: "🌿 Essential Oils" },
    // { value: BusinessType.HANDMADE_CRAFTS, label: "🎨 Handmade Crafts" },
    // { value: BusinessType.HEALTH_WELLNESS, label: "💪 Health & Wellness" },
    // { value: BusinessType.FOOD_BEVERAGE, label: "🍯 Food & Beverage" },
    // { value: BusinessType.CLOTHING_FASHION, label: "👗 Clothing & Fashion" },
    // { value: BusinessType.HOME_GARDEN, label: "🏡 Home & Garden" },
    { value: BusinessType.SERVICES, label: "⚙️ Services" },
    { value: BusinessType.OTHER, label: "📦 Other" },
    // Wellbeing Categories
    { value: BusinessType.HEALTHY_HOME, label: "🏠 Healthy Home" },
    { value: BusinessType.HEALTHY_FOODS, label: "🥗 Healthy Foods" },
    { value: BusinessType.PERSONAL_WELLBEING, label: "🧘 Personal Wellbeing" },
    { value: BusinessType.RELATIONSHIPS, label: "💕 Relationships" },
    { value: BusinessType.FAMILY_DEVELOPMENT, label: "👨‍👩‍👧‍👦 Family Development" },
    { value: BusinessType.ECONOMIC_WELLBEING, label: "💰 Economic Wellbeing" },
    { value: BusinessType.LIFELONG_LEARNING, label: "📚 Lifelong Learning & Skills" },
    { value: BusinessType.SUSTAINABILITY_COMMUNITY, label: "🌱 Sustainability & Community Wellbeing" },
    { value: BusinessType.EMERGENCY_PREPAREDNESS, label: "🚨 Emergency Preparedness" }
];

// Days of the week
const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface BusinessHours {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

interface Address {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

interface SocialMedia {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
}

interface SellerProfileData {
    businessName: string;
    description: string;
    businessType: BusinessType;
    logoImage?: string;
    images: string[];
    categories: string[];
    specialties: string[];
    contactEmail?: string;
    contactPhone?: string;
    address?: Address;
    socialMedia?: SocialMedia;
    businessHours: BusinessHours[];
    aboutStory?: string;
    certifications?: string;
    yearsInBusiness?: number;
    minimumOrderAmount?: number;
    deliveryRadius?: number;
    offersDelivery: boolean;
    offersPickup: boolean;
    offersShipping: boolean;
    allowedEditors: string[];
}

const DEFAULT_SELLER_PROFILE_DATA: SellerProfileData = {
    businessName: "",
    description: "",
    businessType: BusinessType.OTHER,
    logoImage: "",
    images: [],
    categories: [],
    specialties: [],
    contactEmail: "",
    contactPhone: "",
    address: {
        street: "",
        city: "",
        state: "",
        postcode: "",
        country: "Australia"
    },
    socialMedia: {
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        tiktok: ""
    },
    businessHours: daysOfWeek.map(day => ({
        day: day.toLowerCase(),
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: day === "Saturday" || day === "Sunday"
    })),
    aboutStory: "",
    certifications: "",
    yearsInBusiness: 0,
    minimumOrderAmount: 0,
    deliveryRadius: 0,
    offersDelivery: false,
    offersPickup: true,
    offersShipping: false,
    allowedEditors: []
};

const NewSellerProfile = () => {
    const { isAuthenticated, user, loading } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const toast = useToast();
    const [isEditing, setIsEditing] = useState(true);
    const [profileData, setProfileData] = useState<SellerProfileData>(DEFAULT_SELLER_PROFILE_DATA);

    const bg = getColor("background.surface");

    const [createSellerProfile, { loading: mutationLoading }] = useMutation(CREATE_SELLER_PROFILE);
    const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);

    // Fetch clients for allowed editors dropdown
    const { data: clientsData } = useQuery(GET_CLIENTS);

    // Check authentication when component mounts
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log("🔒 User not authenticated, showing login modal");
            onOpen();
        }
    }, [loading, isAuthenticated, onOpen]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Center minH="100vh" flex="1">
                    <Spinner size="xl" />
                </Center>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo = false) => {
        if (!e.target.files?.length) return;

        try {
            const file = e.target.files[0];
            const { data } = await uploadFile({
                variables: { file },
                context: {
                    headers: {
                        "apollo-require-preflight": "true",
                        "x-apollo-operation-name": "UploadUnencryptedFile"
                    }
                }
            });

            const hash = data.uploadUnencryptedFile;
            const newImageUrl = `https://gateway.lighthouse.storage/ipfs/${hash}`;

            if (isLogo) {
                setProfileData(prev => ({
                    ...prev,
                    logoImage: newImageUrl
                }));
            } else {
                setProfileData(prev => ({
                    ...prev,
                    images: [...prev.images, newImageUrl]
                }));
            }

            toast({
                title: "Image uploaded successfully",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleDeleteImage = (indexToDelete: number) => {
        setProfileData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToDelete)
        }));
    };

    const handleBusinessHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
        setProfileData(prev => ({
            ...prev,
            businessHours: prev.businessHours.map((hours, index) =>
                index === dayIndex ? { ...hours, [field]: value } : hours
            )
        }));
    };

    const handleAddressChange = (field: string, value: string | number) => {
        setProfileData(prev => ({
            ...prev,
            address: {
                ...prev.address!,
                [field]: value
            }
        }));
    };

    const handleSocialMediaChange = (field: string, value: string) => {
        setProfileData(prev => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia!,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createSellerProfile({
                variables: {
                    input: {
                        ...profileData,
                        businessHours: profileData.businessHours.map(hours => ({
                            ...hours,
                            day: hours.day.toLowerCase()
                        }))
                    }
                }
            });

            if (data?.createSellerProfile) {
                toast({
                    title: "Seller profile created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                navigate(`/seller-profile/${data.createSellerProfile.id}`);
            }
        } catch (error) {
            toast({
                title: "Error creating seller profile",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />

            <Container maxW="container.xl" py={12} flex="1">
                <Card
                    bg={getColor("background.card")}
                    boxShadow={getComponent("card", "shadow")}
                    border="1px"
                    borderColor={getColor("border.light")}
                    borderRadius="xl"
                    overflow="hidden"
                >
                    <CardHeader bg={getColor("background.light")} borderBottom="1px" borderColor={getColor("border.light")}>
                        <HStack justify="space-between" align="center" wrap="wrap">
                            <Heading size="lg" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                🏪 Create Seller Profile
                            </Heading>
                            <Button
                                bg={getComponent("button", "primaryBg")}
                                color={getColor("text.inverse")}
                                _hover={{ bg: getComponent("button", "primaryHover") }}
                                onClick={handleSubmit}
                                isLoading={mutationLoading}
                                leftIcon={<CheckIcon />}
                                fontFamily={brandConfig.fonts.body}
                            >
                                Create Profile
                            </Button>
                        </HStack>
                    </CardHeader>

                    <CardBody p={8}>
                        <VStack spacing={8} align="stretch">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">📝 Basic Information</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel>Business Name *</FormLabel>
                                            <Input
                                                value={profileData.businessName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                                                placeholder="Enter your business name"
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Business Type *</FormLabel>
                                            <Select
                                                value={profileData.businessType}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, businessType: e.target.value as BusinessType }))}
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            >
                                                {businessTypeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Description *</FormLabel>
                                            <Textarea
                                                value={profileData.description}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Describe your business and what you offer..."
                                                rows={4}
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Logo and Images */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">📸 Logo & Images</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6} align="stretch">
                                        {/* Logo Upload */}
                                        <Box>
                                            <Text fontWeight="bold" mb={3}>Business Logo</Text>
                                            <VStack spacing={4}>
                                                {profileData.logoImage && (
                                                    <Box
                                                        w="200px"
                                                        h="200px"
                                                        borderRadius="md"
                                                        overflow="hidden"
                                                        border="2px"
                                                        borderColor={getColor("primary")}
                                                    >
                                                        <Image
                                                            src={profileData.logoImage}
                                                            alt="Business Logo"
                                                            w="100%"
                                                            h="100%"
                                                            objectFit="cover"
                                                        />
                                                    </Box>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, true)}
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                                <Text fontSize="xs" color={getColor("text.muted")} mt={1} fontFamily={brandConfig.fonts.body}>
                                                    💡 Recommended: 400x400px square logo for best results
                                                </Text>
                                            </VStack>
                                        </Box>

                                        <Divider />

                                        {/* Gallery Images */}
                                        <Box>
                                            <HStack justify="space-between" mb={3}>
                                                <Text fontWeight="bold">Gallery Images</Text>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, false)}
                                                    display="none"
                                                    id="gallery-upload"
                                                />
                                                <Button
                                                    as="label"
                                                    htmlFor="gallery-upload"
                                                    leftIcon={<AddIcon />}
                                                    size="sm"
                                                    cursor="pointer"
                                                >
                                                    Add Image
                                                </Button>
                                            </HStack>

                                            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                                                {profileData.images.map((img, idx) => (
                                                    <Box
                                                        key={idx}
                                                        position="relative"
                                                        borderWidth="1px"
                                                        borderColor={getColor("border.light")}
                                                        borderRadius="md"
                                                        overflow="hidden"
                                                    >
                                                        <Image
                                                            src={img}
                                                            alt={`Gallery image ${idx + 1}`}
                                                            width="100%"
                                                            height="150px"
                                                            objectFit="cover"
                                                        />
                                                        <IconButton
                                                            aria-label="Delete image"
                                                            icon={<DeleteIcon />}
                                                            position="absolute"
                                                            top={2}
                                                            right={2}
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() => handleDeleteImage(idx)}
                                                        />
                                                    </Box>
                                                ))}
                                            </SimpleGrid>
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">📞 Contact Information</Heading>
                                </CardHeader>
                                <CardBody>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Contact Email (Optional)</FormLabel>
                                            <Input
                                                type="email"
                                                value={profileData.contactEmail}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, contactEmail: e.target.value }))}
                                                placeholder="business@example.com"
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Contact Phone (Optional)</FormLabel>
                                            <Input
                                                type="tel"
                                                value={profileData.contactPhone}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, contactPhone: e.target.value }))}
                                                placeholder="+61 4XX XXX XXX"
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">📍 Business Address</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel>Street Address (Optional)</FormLabel>
                                            <Input
                                                value={profileData.address?.street}
                                                onChange={(e) => handleAddressChange("street", e.target.value)}
                                                placeholder="123 Farm Road"
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl>
                                                <FormLabel>City (Optional)</FormLabel>
                                                <Input
                                                    value={profileData.address?.city}
                                                    onChange={(e) => handleAddressChange("city", e.target.value)}
                                                    placeholder="Byron Bay"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>State (Optional)</FormLabel>
                                                <Input
                                                    value={profileData.address?.state}
                                                    onChange={(e) => handleAddressChange("state", e.target.value)}
                                                    placeholder="NSW"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Postcode (Optional)</FormLabel>
                                                <Input
                                                    value={profileData.address?.postcode}
                                                    onChange={(e) => handleAddressChange("postcode", e.target.value)}
                                                    placeholder="2481"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Country (Optional)</FormLabel>
                                                <Input
                                                    value={profileData.address?.country}
                                                    onChange={(e) => handleAddressChange("country", e.target.value)}
                                                    placeholder="Australia"
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                />
                                            </FormControl>
                                        </SimpleGrid>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Business Details */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">💼 Business Details</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel>About Your Story</FormLabel>
                                            <Textarea
                                                value={profileData.aboutStory}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, aboutStory: e.target.value }))}
                                                placeholder="Tell your customers about your journey, values, and what makes your business special..."
                                                rows={4}
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl>
                                                <FormLabel>Years in Business</FormLabel>
                                                <NumberInput
                                                    value={profileData.yearsInBusiness}
                                                    onChange={(_, value) => setProfileData(prev => ({ ...prev, yearsInBusiness: value || 0 }))}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        bg={getComponent("form", "fieldBg")}
                                                        border="1px"
                                                        borderColor={getComponent("form", "fieldBorder")}
                                                        _focus={{
                                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                                        }}
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Minimum Order Amount ($)</FormLabel>
                                                <NumberInput
                                                    value={profileData.minimumOrderAmount}
                                                    onChange={(_, value) => setProfileData(prev => ({ ...prev, minimumOrderAmount: value || 0 }))}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        bg={getComponent("form", "fieldBg")}
                                                        border="1px"
                                                        borderColor={getComponent("form", "fieldBorder")}
                                                        _focus={{
                                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                                        }}
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>
                                        </SimpleGrid>

                                        <FormControl>
                                            <FormLabel>Certifications</FormLabel>
                                            <Textarea
                                                value={profileData.certifications}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, certifications: e.target.value }))}
                                                placeholder="List any certifications, awards, or qualifications..."
                                                rows={3}
                                                bg={getComponent("form", "fieldBg")}
                                                border="1px"
                                                borderColor={getComponent("form", "fieldBorder")}
                                                _focus={{
                                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                                }}
                                            />
                                        </FormControl>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Delivery Options */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">🚚 Delivery Options</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                            <Box p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md">
                                                <VStack spacing={2}>
                                                    <Switch
                                                        isChecked={profileData.offersDelivery}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, offersDelivery: e.target.checked }))}
                                                    />
                                                    <Text fontWeight="bold">🚚 Delivery</Text>
                                                    <Text fontSize="sm" color={getColor("text.muted")} textAlign="center">
                                                        Deliver to customers
                                                    </Text>
                                                </VStack>
                                            </Box>

                                            <Box p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md">
                                                <VStack spacing={2}>
                                                    <Switch
                                                        isChecked={profileData.offersPickup}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, offersPickup: e.target.checked }))}
                                                    />
                                                    <Text fontWeight="bold">🏪 Pickup</Text>
                                                    <Text fontSize="sm" color={getColor("text.muted")} textAlign="center">
                                                        Customer pickup
                                                    </Text>
                                                </VStack>
                                            </Box>

                                            <Box p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md">
                                                <VStack spacing={2}>
                                                    <Switch
                                                        isChecked={profileData.offersShipping}
                                                        onChange={(e) => setProfileData(prev => ({ ...prev, offersShipping: e.target.checked }))}
                                                    />
                                                    <Text fontWeight="bold">📦 Shipping</Text>
                                                    <Text fontSize="sm" color={getColor("text.muted")} textAlign="center">
                                                        Mail/courier shipping
                                                    </Text>
                                                </VStack>
                                            </Box>
                                        </SimpleGrid>

                                        {profileData.offersDelivery && (
                                            <FormControl>
                                                <FormLabel>Delivery Radius (km)</FormLabel>
                                                <NumberInput
                                                    value={profileData.deliveryRadius}
                                                    onChange={(_, value) => setProfileData(prev => ({ ...prev, deliveryRadius: value || 0 }))}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        bg={getComponent("form", "fieldBg")}
                                                        border="1px"
                                                        borderColor={getComponent("form", "fieldBorder")}
                                                        _focus={{
                                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                                            boxShadow: getComponent("form", "fieldShadowFocus")
                                                        }}
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </FormControl>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Permission Management */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md">👥 Profile Editors</Heading>
                                    <Text fontSize="sm" color={getColor("text.muted")}>
                                        Allow other users to help manage this seller profile
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <FormControl>
                                        <FormLabel>Allowed Editors</FormLabel>
                                        <CheckboxGroup
                                            value={profileData.allowedEditors}
                                            onChange={(values) => setProfileData(prev => ({ ...prev, allowedEditors: values as string[] }))}
                                        >
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                                {clientsData?.clients?.map((client: any) => (
                                                    <Checkbox key={client.id} value={client.id}>
                                                        {client.fName} {client.lName} ({client.email})
                                                    </Checkbox>
                                                ))}
                                            </SimpleGrid>
                                        </CheckboxGroup>
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </VStack>
                    </CardBody>
                </Card>
            </Container>

            <FooterWithFourColumns />

            {/* Login Modal */}
            <LoginModal
                isOpen={isOpen}
                onClose={() => {
                    onClose();
                    if (!isAuthenticated) {
                        navigate("/");
                    }
                }}
                onLoginSuccess={() => {
                    onClose();
                    toast({
                        title: "Welcome!",
                        description: "You can now create a seller profile.",
                        status: "success",
                        duration: 3000,
                    });
                }}
            />
        </Box>
    );
};

export default NewSellerProfile;
