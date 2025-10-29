import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
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
    SimpleGrid,
    useToast,
    Switch,
    Tag,
    Wrap,
    WrapItem,
    Badge,
    UnorderedList,
    ListItem,
    Checkbox,
    CheckboxGroup,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    Card,
    CardHeader,
    CardBody,
    IconButton,
    Divider,
    Link,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, ExternalLinkIcon, EmailIcon, PhoneIcon, TimeIcon, CalendarIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

const GET_SELLER_PROFILE = gql`
  query GetSellerProfile($id: ID!) {
    sellerProfile(id: $id) {
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
        latitude
        longitude
      }
      socialMedia {
        website
        facebook
        instagram
        twitter
        linkedin
        youtube
        tiktok
      }
      businessHours {
        day
        openTime
        closeTime
        isClosed
      }
      aboutStory
      certifications
      yearsInBusiness
      isVerified
      isFeatured
      averageRating
      reviewCount
      minimumOrderAmount
      deliveryRadius
      offersDelivery
      offersPickup
      offersShipping
      madeByClient {
        id
        fName
        lName
        email
      }
      allowedEditorsClients {
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

const UPDATE_SELLER_PROFILE = gql`
  mutation UpdateSellerProfile($id: ID!, $input: UpdateSellerProfileInput!) {
    updateSellerProfile(id: $id, input: $input) {
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
      socialMedia {
        website
        facebook
        instagram
        twitter
        linkedin
        youtube
        tiktok
      }
      businessHours {
        day
        openTime
        closeTime
        isClosed
      }
      aboutStory
      certifications
      yearsInBusiness
      minimumOrderAmount
      deliveryRadius
      offersDelivery
      offersPickup
      offersShipping
      allowedEditorsClients {
        id
        fName
        lName
        email
      }
    }
  }
`;

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;

const businessTypeLabels: Record<string, string> = {
    // FARM: "🚜 Farm",
    // ESSENTIAL_OILS: "🌿 Essential Oils",
    // HANDMADE_CRAFTS: "🎨 Handmade Crafts",
    // HEALTH_WELLNESS: "💪 Health & Wellness",
    // FOOD_BEVERAGE: "🍯 Food & Beverage",
    // CLOTHING_FASHION: "👗 Clothing & Fashion",
    // HOME_GARDEN: "🏡 Home & Garden",
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

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SellerProfileView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { isAuthenticated, user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<any>(null);
    const [mainImage, setMainImage] = useState<string>("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const bg = getColor("background.surface");

    const { loading, error, data } = useQuery(GET_SELLER_PROFILE, {
        variables: { id },
        skip: !id,
        onCompleted: (data) => {
            if (data?.sellerProfile) {
                setEditedProfile(data.sellerProfile);
                setMainImage(data.sellerProfile.logoImage || data.sellerProfile.images?.[0] || "");
            }
        }
    });

    // Fetch clients for allowed editors dropdown
    const { data: clientsData } = useQuery(GET_CLIENTS);

    const [updateSellerProfile, { loading: updateLoading }] = useMutation(UPDATE_SELLER_PROFILE);
    const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);

    useEffect(() => {
        if (data?.sellerProfile) {
            setEditedProfile(data.sellerProfile);
            setMainImage(data.sellerProfile.logoImage || data.sellerProfile.images?.[0] || "");
        }
    }, [data]);

    // Check if user can edit this profile
    const canEdit = isAuthenticated && user && (
        user.id === data?.sellerProfile?.madeByClient?.id ||
        data?.sellerProfile?.allowedEditorsClients?.some((client: any) => client.id === user.id)
    );

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

            let updatedProfile;
            if (isLogo) {
                updatedProfile = {
                    ...editedProfile,
                    logoImage: newImageUrl
                };
                setEditedProfile(updatedProfile);
                // Update main image if it's the logo
                setMainImage(newImageUrl);
            } else {
                updatedProfile = {
                    ...editedProfile,
                    images: [...(editedProfile?.images || []), newImageUrl]
                };
                setEditedProfile(updatedProfile);
                // Set as main image if it's the first gallery image
                if (!editedProfile?.images?.length && !editedProfile?.logoImage) {
                    setMainImage(newImageUrl);
                }
            }

            toast({
                title: "Image uploaded successfully",
                status: "success",
                duration: 3000,
            });

            // Auto-save the profile with the new image
            await autoSaveProfile(updatedProfile);

        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        }
    };

    // Auto-save function for image uploads
    const autoSaveProfile = async (profileToSave: any) => {
        try {
            // Clean the data to remove __typename fields
            const cleanedInput = {
                businessName: profileToSave.businessName,
                description: profileToSave.description,
                businessType: profileToSave.businessType,
                logoImage: profileToSave.logoImage,
                images: profileToSave.images,
                categories: profileToSave.categories,
                specialties: profileToSave.specialties,
                contactEmail: profileToSave.contactEmail,
                contactPhone: profileToSave.contactPhone,
                address: cleanGraphQLObject(profileToSave.address),
                socialMedia: cleanGraphQLObject(profileToSave.socialMedia),
                businessHours: cleanGraphQLObject(profileToSave.businessHours),
                aboutStory: profileToSave.aboutStory,
                certifications: profileToSave.certifications,
                yearsInBusiness: profileToSave.yearsInBusiness,
                minimumOrderAmount: profileToSave.minimumOrderAmount,
                deliveryRadius: profileToSave.deliveryRadius,
                offersDelivery: profileToSave.offersDelivery,
                offersPickup: profileToSave.offersPickup,
                offersShipping: profileToSave.offersShipping,
                allowedEditors: profileToSave.allowedEditorsClients?.map((client: any) => client.id) || []
            };

            const { data } = await updateSellerProfile({
                variables: {
                    id,
                    input: cleanedInput
                }
            });

            if (data?.updateSellerProfile) {
                // Update the edited profile with the response data
                setEditedProfile(data.updateSellerProfile);
                toast({
                    title: "Profile updated automatically",
                    status: "info",
                    duration: 2000,
                });
            }
        } catch (error) {
            toast({
                title: "Auto-save failed",
                description: "Image uploaded but profile auto-save failed. Please save manually.",
                status: "warning",
                duration: 5000,
            });
        }
    };

    // Helper function to remove __typename from objects
    const cleanGraphQLObject = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) {
            return obj.map(cleanGraphQLObject);
        }
        if (typeof obj === 'object') {
            const cleaned: any = {};
            for (const key in obj) {
                if (key !== '__typename') {
                    cleaned[key] = cleanGraphQLObject(obj[key]);
                }
            }
            return cleaned;
        }
        return obj;
    };

    const handleSave = async () => {
        if (!editedProfile) return;

        try {
            // Clean the data to remove __typename fields
            const cleanedInput = {
                businessName: editedProfile.businessName,
                description: editedProfile.description,
                businessType: editedProfile.businessType,
                logoImage: editedProfile.logoImage,
                images: editedProfile.images,
                categories: editedProfile.categories,
                specialties: editedProfile.specialties,
                contactEmail: editedProfile.contactEmail,
                contactPhone: editedProfile.contactPhone,
                address: cleanGraphQLObject(editedProfile.address),
                socialMedia: cleanGraphQLObject(editedProfile.socialMedia),
                businessHours: cleanGraphQLObject(editedProfile.businessHours),
                aboutStory: editedProfile.aboutStory,
                certifications: editedProfile.certifications,
                yearsInBusiness: editedProfile.yearsInBusiness,
                minimumOrderAmount: editedProfile.minimumOrderAmount,
                deliveryRadius: editedProfile.deliveryRadius,
                offersDelivery: editedProfile.offersDelivery,
                offersPickup: editedProfile.offersPickup,
                offersShipping: editedProfile.offersShipping,
                allowedEditors: editedProfile.allowedEditorsClients?.map((client: any) => client.id) || []
            };

            const { data } = await updateSellerProfile({
                variables: {
                    id,
                    input: cleanedInput
                }
            });

            if (data?.updateSellerProfile) {
                // Update the edited profile with the response data
                setEditedProfile(data.updateSellerProfile);
                toast({
                    title: "Profile updated successfully",
                    status: "success",
                    duration: 3000,
                });
                setIsEditing(false);
            }
        } catch (error) {
            toast({
                title: "Error updating profile",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        }
    };

    const formatBusinessHours = (hours: any[]) => {
        if (!hours?.length) return "No hours specified";

        return daysOfWeek.map(day => {
            const dayHours = hours.find(h => h.day.toLowerCase() === day.toLowerCase());
            if (!dayHours || dayHours.isClosed) {
                return `${day}: Closed`;
            }
            return `${day}: ${dayHours.openTime} - ${dayHours.closeTime}`;
        }).join("\n");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data?.sellerProfile) return <div>Seller profile not found</div>;

    const profile = data.sellerProfile;
    const currentProfile = isEditing ? editedProfile : profile;
    const allImages = [currentProfile?.logoImage, ...(currentProfile?.images || [])].filter(Boolean);

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />

            <Container maxW="container.xl" py={12} flex="1">
                {/* Header with edit button */}
                {canEdit && (
                    <HStack justify="flex-end" mb={4}>
                        <Button
                            leftIcon={isEditing ? <CheckIcon /> : <EditIcon />}
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            isLoading={updateLoading}
                            bg={isEditing ? getComponent("button", "primaryBg") : getComponent("button", "secondaryBg")}
                            color={isEditing ? getColor("text.inverse") : getColor("text.primary")}
                            _hover={{
                                bg: isEditing ? getComponent("button", "primaryHover") : getComponent("button", "secondaryHover")
                            }}
                            fontFamily={brandConfig.fonts.body}
                        >
                            {isEditing ? "Save Changes" : "Edit Profile"}
                        </Button>
                    </HStack>
                )}

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10}>
                    {/* Left side - Images and Gallery */}
                    <Stack spacing={6}>
                        {/* Main Image */}
                        <Box>
                            <Image
                                src={mainImage}
                                alt={profile.businessName}
                                width="100%"
                                height="400px"
                                objectFit="cover"
                                borderRadius="lg"
                                border="1px"
                                borderColor={getColor("border.light")}
                                fallback={
                                    <Box
                                        width="100%"
                                        height="400px"
                                        bg={getColor("background.light")}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor={getColor("border.light")}
                                    >
                                        <VStack spacing={4}>
                                            <Text fontSize="6xl">{profile.businessName.charAt(0).toUpperCase()}</Text>
                                            <Text color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>No image available</Text>
                                        </VStack>
                                    </Box>
                                }
                            />
                        </Box>

                        {/* Image Upload Controls - Only show when editing */}
                        {isEditing && canEdit && (
                            <Card bg={getColor("background.card")} border="1px" borderColor={getColor("border.light")}>
                                <CardHeader>
                                    <Heading size="sm" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        📸 Update Images
                                    </Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        {/* Logo Upload */}
                                        <Box>
                                            <Text fontWeight="bold" mb={2} color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                Business Logo
                                            </Text>
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
                                                size="sm"
                                            />
                                            <Text fontSize="xs" color={getColor("text.muted")} mt={1} fontFamily={brandConfig.fonts.body}>
                                                💡 Recommended: 400x400px square logo for best results
                                            </Text>
                                        </Box>

                                        <Divider />

                                        {/* Gallery Images */}
                                        <Box>
                                            <HStack justify="space-between" mb={2}>
                                                <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                    Gallery Images
                                                </Text>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, false)}
                                                    display="none"
                                                    id="gallery-upload-edit"
                                                />
                                                <Button
                                                    as="label"
                                                    htmlFor="gallery-upload-edit"
                                                    leftIcon={<AddIcon />}
                                                    size="sm"
                                                    cursor="pointer"
                                                    bg={getComponent("button", "secondaryBg")}
                                                    color={getColor("text.primary")}
                                                    _hover={{ bg: getComponent("button", "secondaryHover") }}
                                                >
                                                    Add Image
                                                </Button>
                                            </HStack>
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Image Gallery */}
                        {allImages.length > 1 && (
                            <SimpleGrid columns={4} spacing={2}>
                                {allImages.map((img, index) => (
                                    <Box
                                        key={index}
                                        position="relative"
                                        cursor="pointer"
                                        borderWidth={mainImage === img ? "2px" : "1px"}
                                        borderColor={mainImage === img ? getColor("primary") : getColor("border.light")}
                                        borderRadius="md"
                                        onClick={() => setMainImage(img)}
                                        overflow="hidden"
                                    >
                                        <Image
                                            src={img}
                                            alt={`${profile.businessName} image ${index + 1}`}
                                            width="100%"
                                            height="80px"
                                            objectFit="cover"
                                            opacity={mainImage === img ? 1 : 0.6}
                                            _hover={{ opacity: 1 }}
                                            transition="opacity 0.2s"
                                        />
                                        {/* Delete button - only show when editing and it's not the logo */}
                                        {isEditing && canEdit && img !== editedProfile?.logoImage && (
                                            <IconButton
                                                aria-label="Delete image"
                                                icon={<DeleteIcon />}
                                                position="absolute"
                                                top={1}
                                                right={1}
                                                size="xs"
                                                colorScheme="red"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const updatedProfile = {
                                                        ...editedProfile,
                                                        images: editedProfile.images?.filter((image: string) => image !== img) || []
                                                    };
                                                    setEditedProfile(updatedProfile);
                                                    
                                                    // Auto-save after deleting image
                                                    await autoSaveProfile(updatedProfile);
                                                    
                                                    toast({
                                                        title: "Image deleted",
                                                        status: "success",
                                                        duration: 2000,
                                                    });
                                                }}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        )}
                    </Stack>

                    {/* Right side - Profile Details */}
                    <Stack spacing={6}>
                        {/* Business Header */}
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={2}>
                                    {isEditing ? (
                                        <VStack align="stretch" spacing={3} width="full">
                                            <FormControl>
                                                <FormLabel>Business Name</FormLabel>
                                                <Input
                                                    value={editedProfile?.businessName || ''}
                                                    onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, businessName: e.target.value }))}
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
                                                <FormLabel>Business Type</FormLabel>
                                                <Select
                                                    value={editedProfile?.businessType || ''}
                                                    onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, businessType: e.target.value }))}
                                                    bg={getComponent("form", "fieldBg")}
                                                    border="1px"
                                                    borderColor={getComponent("form", "fieldBorder")}
                                                    _focus={{
                                                        borderColor: getComponent("form", "fieldBorderFocus"),
                                                        boxShadow: getComponent("form", "fieldShadowFocus")
                                                    }}
                                                >
                                                    {Object.entries(businessTypeLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </VStack>
                                    ) : (
                                        <>
                                            <Heading size="xl" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                                {profile.businessName}
                                            </Heading>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="blue" p={2} borderRadius="lg">
                                                    {businessTypeLabels[profile.businessType] || profile.businessType}
                                                </Badge>
                                                {profile.isVerified && (
                                                    <Badge colorScheme="green" p={2} borderRadius="lg">✅ Verified</Badge>
                                                )}
                                                {profile.isFeatured && (
                                                    <Badge colorScheme="purple" p={2} borderRadius="lg">⭐ Featured</Badge>
                                                )}
                                            </HStack>
                                        </>
                                    )}
                                </VStack>
                            </HStack>

                           

                            {/* Description */}
                            <Box>
                                {isEditing ? (
                                    <FormControl>
                                        <FormLabel>Description</FormLabel>
                                        <Textarea
                                            value={editedProfile?.description || ''}
                                            onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, description: e.target.value }))}
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
                                ) : (
                                    <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body} lineHeight="1.6">
                                        {profile.description}
                                    </Text>
                                )}
                            </Box>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        📞 Contact Information
                                    </Heading>
                                </CardHeader>
                                <CardBody>
                                    {isEditing ? (
                                        <VStack spacing={4} align="stretch">
                                            <FormControl>
                                                <FormLabel>Contact Email (Optional)</FormLabel>
                                                <Input
                                                    type="email"
                                                    value={editedProfile?.contactEmail || ''}
                                                    onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, contactEmail: e.target.value }))}
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
                                                    value={editedProfile?.contactPhone || ''}
                                                    onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, contactPhone: e.target.value }))}
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
                                            {/* Address Editing */}
                                            <Box>
                                                <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body} mb={3}>
                                                    📍 Address
                                                </Text>
                                                <VStack spacing={3} align="stretch">
                                                    <FormControl>
                                                        <FormLabel>Street Address (Optional)</FormLabel>
                                                        <Input
                                                            value={editedProfile?.address?.street || ''}
                                                            onChange={(e) => setEditedProfile((prev: any) => ({
                                                                ...prev,
                                                                address: { ...prev.address, street: e.target.value }
                                                            }))}
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
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                                        <FormControl>
                                                            <FormLabel>City (Optional)</FormLabel>
                                                            <Input
                                                                value={editedProfile?.address?.city || ''}
                                                                onChange={(e) => setEditedProfile((prev: any) => ({
                                                                    ...prev,
                                                                    address: { ...prev.address, city: e.target.value }
                                                                }))}
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
                                                                value={editedProfile?.address?.state || ''}
                                                                onChange={(e) => setEditedProfile((prev: any) => ({
                                                                    ...prev,
                                                                    address: { ...prev.address, state: e.target.value }
                                                                }))}
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
                                                                value={editedProfile?.address?.postcode || ''}
                                                                onChange={(e) => setEditedProfile((prev: any) => ({
                                                                    ...prev,
                                                                    address: { ...prev.address, postcode: e.target.value }
                                                                }))}
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
                                                                value={editedProfile?.address?.country || ''}
                                                                onChange={(e) => setEditedProfile((prev: any) => ({
                                                                    ...prev,
                                                                    address: { ...prev.address, country: e.target.value }
                                                                }))}
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
                                            </Box>
                                        </VStack>
                                    ) : (
                                        <VStack spacing={3} align="stretch">
                                            {profile.contactEmail && (
                                                <HStack>
                                                    <EmailIcon color={getColor("primary")} />
                                                    <Link
                                                        href={`mailto:${profile.contactEmail}`}
                                                        color={getColor("primary")}
                                                        fontFamily={brandConfig.fonts.body}
                                                    >
                                                        {profile.contactEmail}
                                                    </Link>
                                                </HStack>
                                            )}
                                            {profile.contactPhone && (
                                                <HStack>
                                                    <PhoneIcon color={getColor("primary")} />
                                                    <Link
                                                        href={`tel:${profile.contactPhone}`}
                                                        color={getColor("primary")}
                                                        fontFamily={brandConfig.fonts.body}
                                                    >
                                                        {profile.contactPhone}
                                                    </Link>
                                                </HStack>
                                            )}
                                            {profile.address && (
                                                <Box>
                                                    <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                        📍 Address
                                                    </Text>
                                                    <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                                        {profile.address.street}<br />
                                                        {profile.address.city}, {profile.address.state} {profile.address.postcode}<br />
                                                        {profile.address.country}
                                                    </Text>
                                                </Box>
                                            )}
                                        </VStack>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Delivery Options */}
                            <Card>
                                <CardHeader>
                                    <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        🚚 Service Options
                                    </Heading>
                                </CardHeader>
                                <CardBody>
                                    {isEditing ? (
                                        <VStack spacing={4} align="stretch">
                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                <Box p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md">
                                                    <VStack spacing={2}>
                                                        <Switch
                                                            isChecked={editedProfile?.offersDelivery || false}
                                                            onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, offersDelivery: e.target.checked }))}
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
                                                            isChecked={editedProfile?.offersPickup || false}
                                                            onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, offersPickup: e.target.checked }))}
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
                                                            isChecked={editedProfile?.offersShipping || false}
                                                            onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, offersShipping: e.target.checked }))}
                                                        />
                                                        <Text fontWeight="bold">📦 Shipping</Text>
                                                        <Text fontSize="sm" color={getColor("text.muted")} textAlign="center">
                                                            Mail/courier shipping
                                                        </Text>
                                                    </VStack>
                                                </Box>
                                            </SimpleGrid>

                                            {editedProfile?.offersDelivery && (
                                                <FormControl>
                                                    <FormLabel>Delivery Radius (km)</FormLabel>
                                                    <NumberInput
                                                        value={editedProfile?.deliveryRadius || 0}
                                                        onChange={(_, value) => setEditedProfile((prev: any) => ({ ...prev, deliveryRadius: value || 0 }))}
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

                                            <FormControl>
                                                <FormLabel>Minimum Order Amount ($)</FormLabel>
                                                <NumberInput
                                                    value={editedProfile?.minimumOrderAmount || 0}
                                                    onChange={(_, value) => setEditedProfile((prev: any) => ({ ...prev, minimumOrderAmount: value || 0 }))}
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
                                        </VStack>
                                    ) : (
                                        <>
                                            <HStack spacing={4} flexWrap="wrap">
                                                {profile.offersDelivery && (
                                                    <Badge colorScheme="green" p={2} borderRadius="lg">
                                                        🚚 Delivery
                                                        {profile.deliveryRadius > 0 && ` (${profile.deliveryRadius}km)`}
                                                    </Badge>
                                                )}
                                                {profile.offersPickup && (
                                                    <Badge colorScheme="blue" p={2} borderRadius="lg">🏪 Pickup</Badge>
                                                )}
                                                {profile.offersShipping && (
                                                    <Badge colorScheme="purple" p={2} borderRadius="lg">📦 Shipping</Badge>
                                                )}
                                            </HStack>
                                            {profile.minimumOrderAmount > 0 && (
                                                <Text fontSize="sm" color={getColor("text.muted")} mt={2} fontFamily={brandConfig.fonts.body}>
                                                    Minimum order: ${profile.minimumOrderAmount}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </VStack>
                    </Stack>
                </Grid>

                {/* Permission Management - Only show when editing */}
                {isEditing && canEdit && (
                    <Card mt={8}>
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                👥 Profile Editors
                            </Heading>
                            <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                                Allow other users to help manage this seller profile
                            </Text>
                        </CardHeader>
                        <CardBody>
                            <FormControl>
                                <FormLabel>Allowed Editors</FormLabel>
                                <CheckboxGroup
                                    value={editedProfile?.allowedEditorsClients?.map((client: any) => client.id) || []}
                                    onChange={(values) => setEditedProfile((prev: any) => ({ 
                                        ...prev, 
                                        allowedEditors: values as string[],
                                        allowedEditorsClients: clientsData?.clients?.filter((client: any) => 
                                            values.includes(client.id)
                                        ) || []
                                    }))}
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
                )}

                {/* Detailed Information Sections */}
                <Box mt={10}>
                    <Accordion allowMultiple defaultIndex={[0]} width="100%">
                        {/* About Story */}
                        {(profile.aboutStory || isEditing) && (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        📖 Our Story
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    {isEditing ? (
                                        <FormControl>
                                            <FormLabel>About Your Story</FormLabel>
                                            <Textarea
                                                value={editedProfile?.aboutStory || ''}
                                                onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, aboutStory: e.target.value }))}
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
                                    ) : (
                                        <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body} lineHeight="1.6">
                                            {profile.aboutStory}
                                        </Text>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* Specialties */}
                        {profile.specialties?.length > 0 && (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        ⭐ Specialties
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Wrap>
                                        {profile.specialties.map((specialty: string, idx: number) => (
                                            <WrapItem key={idx}>
                                                <Tag colorScheme="blue" variant="subtle">{specialty}</Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* Certifications */}
                        {(profile.certifications || isEditing) && (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        🏆 Certifications & Awards
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    {isEditing ? (
                                        <FormControl>
                                            <FormLabel>Certifications</FormLabel>
                                            <Textarea
                                                value={editedProfile?.certifications || ''}
                                                onChange={(e) => setEditedProfile((prev: any) => ({ ...prev, certifications: e.target.value }))}
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
                                    ) : (
                                        <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body} whiteSpace="pre-line">
                                            {profile.certifications}
                                        </Text>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* Business Hours */}
                        {profile.businessHours?.length > 0 && (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        ⏰ Business Hours
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Table variant="simple" size="sm">
                                        <Tbody>
                                            {daysOfWeek.map(day => {
                                                const dayHours = profile.businessHours.find((h: any) =>
                                                    h.day.toLowerCase() === day.toLowerCase()
                                                );
                                                return (
                                                    <Tr key={day}>
                                                        <Td fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                                            {day}
                                                        </Td>
                                                        <Td color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                                            {dayHours && !dayHours.isClosed
                                                                ? `${dayHours.openTime} - ${dayHours.closeTime}`
                                                                : "Closed"
                                                            }
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </AccordionPanel>
                            </AccordionItem>
                        )}

                        {/* Social Media */}
                        {profile.socialMedia && Object.values(profile.socialMedia).some(Boolean) && (
                            <AccordionItem>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                                        🌐 Find Us Online
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <VStack spacing={3} align="stretch">
                                        {profile.socialMedia.website && (
                                            <HStack>
                                                <Text fontWeight="bold" w="100px" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Website:</Text>
                                                <Link
                                                    href={profile.socialMedia.website}
                                                    isExternal
                                                    color={getColor("primary")}
                                                    fontFamily={brandConfig.fonts.body}
                                                >
                                                    {profile.socialMedia.website} <ExternalLinkIcon mx="2px" />
                                                </Link>
                                            </HStack>
                                        )}
                                        {profile.socialMedia.facebook && (
                                            <HStack>
                                                <Text fontWeight="bold" w="100px" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Facebook:</Text>
                                                <Link
                                                    href={profile.socialMedia.facebook}
                                                    isExternal
                                                    color={getColor("primary")}
                                                    fontFamily={brandConfig.fonts.body}
                                                >
                                                    Facebook Page <ExternalLinkIcon mx="2px" />
                                                </Link>
                                            </HStack>
                                        )}
                                        {profile.socialMedia.instagram && (
                                            <HStack>
                                                <Text fontWeight="bold" w="100px" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>Instagram:</Text>
                                                <Link
                                                    href={profile.socialMedia.instagram}
                                                    isExternal
                                                    color={getColor("primary")}
                                                    fontFamily={brandConfig.fonts.body}
                                                >
                                                    Instagram Profile <ExternalLinkIcon mx="2px" />
                                                </Link>
                                            </HStack>
                                        )}
                                        {/* Add other social media links similarly */}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        )}
                    </Accordion>
                </Box>

                {/* Navigation */}
                <HStack justify="space-between" mt={8}>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/seller-profiles")}
                        fontFamily={brandConfig.fonts.body}
                    >
                        ← Back to All Profiles
                    </Button>

                    {/* TODO: Add link to this seller's products */}
                    <Button
                        bg={getComponent("button", "primaryBg")}
                        color={getColor("text.inverse")}
                        _hover={{ bg: getComponent("button", "primaryHover") }}
                        onClick={() => navigate(`/products?seller=${id}`)}
                        fontFamily={brandConfig.fonts.body}
                    >
                        View Products →
                    </Button>
                </HStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default SellerProfileView; 