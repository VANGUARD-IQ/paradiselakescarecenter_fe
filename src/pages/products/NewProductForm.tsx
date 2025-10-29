import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Badge,
  UnorderedList,
  ListItem,
  NumberInput,
  NumberInputField,
  Switch,
  CheckboxGroup,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  Center,
  Spinner,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, AddIcon } from "@chakra-ui/icons";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import productsModuleConfig from './moduleConfig';
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { LoginModal } from "../authentication";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Product, ProductVariant, ProductInput } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

enum ProductType {
  PHYSICAL = "PHYSICAL",
  DIGITAL_CONTENT = "DIGITAL_CONTENT",
  DIGITAL_COURSE = "DIGITAL_COURSE"
}

enum PricingModel {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
  SUBSCRIPTION = "SUBSCRIPTION"
}

export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  INTERNATIONAL = "INTERNATIONAL",
  LOCAL_PICKUP = "LOCAL_PICKUP"
}

enum LifeEssentialCategory {
  HEALTHY_HOME = "HEALTHY_HOME",
  HEALTHY_FOODS = "HEALTHY_FOODS",
  PERSONAL_WELLBEING = "PERSONAL_WELLBEING",
  RELATIONSHIPS = "RELATIONSHIPS",
  FAMILY_DEVELOPMENT = "FAMILY_DEVELOPMENT",
  ECONOMIC_WELLBEING = "ECONOMIC_WELLBEING",
  LIFELONG_LEARNING_SKILLS = "LIFELONG_LEARNING_SKILLS",
  SUSTAINABILITY_COMMUNITY_WELLBEING = "SUSTAINABILITY_COMMUNITY_WELLBEING",
  EMERGENCY_PREPAREDNESS = "EMERGENCY_PREPAREDNESS"
}

const LIFE_ESSENTIAL_CATEGORY_LABELS: Record<LifeEssentialCategory, string> = {
  [LifeEssentialCategory.HEALTHY_HOME]: "🏠 Healthy Home",
  [LifeEssentialCategory.HEALTHY_FOODS]: "🥗 Healthy Foods",
  [LifeEssentialCategory.PERSONAL_WELLBEING]: "🧘 Personal Wellbeing",
  [LifeEssentialCategory.RELATIONSHIPS]: "💕 Relationships",
  [LifeEssentialCategory.FAMILY_DEVELOPMENT]: "👨‍👩‍👧‍👦 Family Development",
  [LifeEssentialCategory.ECONOMIC_WELLBEING]: "💰 Economic Wellbeing",
  [LifeEssentialCategory.LIFELONG_LEARNING_SKILLS]: "📚 Lifelong Learning & Skills",
  [LifeEssentialCategory.SUSTAINABILITY_COMMUNITY_WELLBEING]: "🌱 Sustainability & Community Wellbeing",
  [LifeEssentialCategory.EMERGENCY_PREPAREDNESS]: "🚨 Emergency Preparedness"
};

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      type
      pricingModel
      sku
      stockLevel
      lifeEssentialCategory
    }
  }
`;

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;


interface ShippingDetails {
  weight: number;
  dimensions: string;
  availableShippingMethods: ShippingMethod[];
  requiresSpecialHandling: boolean;
  shippingRestrictions?: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  memberPrice?: number;
  type: string;
  pricingModel: string;
  stockLevel: number;
  sku: string;
  isActive: boolean;
  images: string[];
  seller?: {  // Make seller optional
    id: string;
    name: string;
  };
  shipping: ShippingDetails;
  isFeatured: boolean;
  categories: string[];
  tags: string[];
  variants: ProductVariant[];
  ingredients: string[];
  howToUse?: string;
  benefits?: string;
  averageRating?: number;
  reviewCount?: number;
  isBestSeller: boolean;
  shippingInfo?: string;
  availableFrom?: Date;
  availableUntil?: Date;
  enableForSyndicate: boolean;
  lifeEssentialCategory?: LifeEssentialCategory;
}

// Using your example data as DEFAULT_PRODUCT_DATA
const DEFAULT_PRODUCT_DATA: ProductData = {
  name: "",
  description: "",
  price: 0,
  memberPrice: 0,
  type: "PHYSICAL",
  pricingModel: "FIXED",
  stockLevel: 0,
  sku: "",
  isActive: true,
  images: [],

  variants: [],
  shipping: {
    weight: 0,
    dimensions: "",
    availableShippingMethods: [ShippingMethod.STANDARD],
    requiresSpecialHandling: false,
    shippingRestrictions: ""
  },
  ingredients: [],
  howToUse: "",
  benefits: "",
  categories: [],
  tags: [],
  isFeatured: true,
  isBestSeller: true,
  shippingInfo: "",
  availableFrom: new Date("2024-03-15T00:00:00Z"),
  availableUntil: new Date("2025-03-15T00:00:00Z"),
  enableForSyndicate: false,
  lifeEssentialCategory: undefined
};

interface FormErrors {
  name: boolean;
  description: boolean;
  price: boolean;
  memberPrice: boolean;
  sku: boolean;
  stockLevel: boolean;
  shippingWeight: boolean;
  shippingDimensions: boolean;
  shippingMethods: boolean;
}

const NewProductForm = () => {
  usePageTitle("New Product");
  const { isAuthenticated, user, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productData, setProductData] = useState<ProductData>(DEFAULT_PRODUCT_DATA);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: false,
    description: false,
    price: false,
    memberPrice: false,
    sku: false,
    stockLevel: false,
    shippingWeight: false,
    shippingDimensions: false,
    shippingMethods: false,
  });

  const bg = getColor("background.surface");

  const [createProduct, { loading: mutationLoading }] = useMutation(CREATE_PRODUCT);
  const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);

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
        <ModuleBreadcrumb moduleConfig={productsModuleConfig} />
        <Center minH="100vh" flex="1">
          <Spinner size="xl" />
        </Center>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setProductData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl]
      }));

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
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToDelete)
    }));
  };

  const handleAddVariant = () => {
    setProductData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variantId: `VAR-${prev.variants.length + 1}`,
          title: `[Variant ${prev.variants.length + 1} Title]`,
          price: 0,
          sku: `SKU-VAR-${prev.variants.length + 1}`,
          stockLevel: 0
        }
      ]
    }));
  };

  const handleDeleteVariant = (indexToDelete: number) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToDelete)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const isValid = validateForm();
    if (!isValid) {
      toast({
        title: "Form Error",
        description: "Please fill in all required fields correctly.",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      const { data } = await createProduct({
        variables: {
          input: {
            ...productData,
            shipping: productData.type === "PHYSICAL" ? {
              weight: productData.shipping.weight,
              dimensions: productData.shipping.dimensions,
              availableShippingMethods: productData.shipping.availableShippingMethods,
              requiresSpecialHandling: productData.shipping.requiresSpecialHandling,
              shippingRestrictions: productData.shipping.shippingRestrictions || undefined
            } : undefined
          }
        }
      });

      if (data?.createProduct) {
        toast({
          title: "Product created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/products/${data.createProduct.id}`);
      }
    } catch (error) {
      toast({
        title: "Error creating product",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const validateField = (name: string, value: any) => {
    switch (name) {
      case "name":
        return value.length >= 2;
      case "description":
        return value.length >= 10;
      case "price":
        return value > 0;
      case "memberPrice":
        return value >= 0 && (value <= productData.price || value === 0);
      case "sku":
        return value.length >= 3;
      case "stockLevel":
        return value >= 0;
      case "shippingWeight":
        return value > 0;
      case "shippingDimensions":
        return /^\d+x\d+x\d+$/.test(value);
      case "shippingMethods":
        return Array.isArray(value) && value.length > 0;
      default:
        return true;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log("Field changed:", field, value); // Debug log

    // Update product data
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update error state
    const isValid = validateField(field, value);
    console.log("Field validation:", field, isValid); // Debug log

    setFormErrors(prev => ({
      ...prev,
      [field]: !isValid
    }));
  };

  const validateForm = () => {
    const newErrors = {
      name: !validateField("name", productData.name),
      description: !validateField("description", productData.description),
      price: !validateField("price", productData.price),
      memberPrice: !validateField("memberPrice", productData.memberPrice),
      sku: !validateField("sku", productData.sku),
      stockLevel: !validateField("stockLevel", productData.stockLevel),
      shippingWeight: productData.type === "PHYSICAL" ? !validateField("shippingWeight", productData.shipping.weight) : false,
      shippingDimensions: productData.type === "PHYSICAL" ? !validateField("shippingDimensions", productData.shipping.dimensions) : false,
      shippingMethods: productData.type === "PHYSICAL" ? !validateField("shippingMethods", productData.shipping.availableShippingMethods) : false,
    };

    setFormErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleShippingChange = (field: string, value: any) => {
    setProductData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      }
    }));

    // Validate the field
    const isValid = validateField(`shipping${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
    setFormErrors(prev => ({
      ...prev,
      [`shipping${field.charAt(0).toUpperCase() + field.slice(1)}`]: !isValid
    }));
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={productsModuleConfig} />

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
                New Product
              </Heading>
              <HStack spacing={4}>
                <Button
                  leftIcon={isEditing ? <CheckIcon /> : <EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                  bg={getComponent("button", "secondaryBg")}
                  color={getColor("text.primary")}
                  _hover={{ bg: getComponent("button", "secondaryHover") }}
                  fontFamily={brandConfig.fonts.body}
                >
                  {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button
                  bg={getComponent("button", "primaryBg")}
                  color={getColor("text.inverse")}
                  _hover={{ bg: getComponent("button", "primaryHover") }}
                  onClick={handleSubmit}
                  isLoading={mutationLoading}
                  fontFamily={brandConfig.fonts.body}
                >
                  Save Product
                </Button>
              </HStack>
            </HStack>
          </CardHeader>

          <CardBody p={8}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={10}>
              {/* Left side - Images */}
              <Stack spacing={4}>
                {isEditing ? (
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel
                        color={getComponent("form", "labelColor")}
                        fontWeight="500"
                        fontSize="sm"
                        mb={2}
                        fontFamily={brandConfig.fonts.body}
                      >
                        Product Images
                      </FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        bg={getComponent("form", "fieldBg")}
                        border="1px"
                        borderColor={getComponent("form", "fieldBorder")}
                        borderRadius="lg"
                        _focus={{
                          borderColor: getComponent("form", "fieldBorderFocus"),
                          boxShadow: getComponent("form", "fieldShadowFocus")
                        }}
                        fontFamily={brandConfig.fonts.body}
                      />
                      <Text fontSize="sm" color={getColor("text.muted")} mt={1} fontFamily={brandConfig.fonts.body}>
                        Upload images one at a time. They will appear below.
                      </Text>
                    </FormControl>

                    {/* Image Preview Grid */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      {productData.images.map((img, idx) => (
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
                            alt={`Product image ${idx + 1}`}
                            width="100%"
                            height="200px"
                            objectFit="cover"
                          />
                          <Button
                            position="absolute"
                            top={2}
                            right={2}
                            size="sm"
                            bg={getColor("status.error")}
                            color={getColor("text.inverse")}
                            _hover={{ bg: getColor("status.error") }}
                            onClick={() => handleDeleteImage(idx)}
                            fontFamily={brandConfig.fonts.body}
                          >
                            Delete
                          </Button>
                        </Box>
                      ))}
                    </Grid>
                  </VStack>
                ) : (
                  <Box>
                    {/* Main Image */}
                    <Box
                      position="relative"
                      width="100%"
                      height="500px"
                      overflow="hidden"
                      borderRadius="lg"
                      mb={4}
                      border="1px"
                      borderColor={getColor("border.light")}
                    >
                      <Image
                        src={productData.images[selectedImage]}
                        alt={productData.name}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                      />
                    </Box>

                    {/* Thumbnail Images */}
                    <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                      {productData.images.map((img, idx) => (
                        <Box
                          key={idx}
                          position="relative"
                          cursor="pointer"
                          onClick={() => setSelectedImage(idx)}
                          overflow="hidden"
                          borderRadius="md"
                          borderWidth="2px"
                          borderColor={selectedImage === idx ? getColor("primary") : "transparent"}
                          transition="all 0.2s"
                          _hover={{ borderColor: getColor("primary") }}
                        >
                          <Box position="relative" paddingBottom="100%">
                            <Image
                              position="absolute"
                              top={0}
                              left={0}
                              width="100%"
                              height="100%"
                              src={img}
                              alt={`Product view ${idx + 1}`}
                              objectFit="cover"
                              opacity={selectedImage === idx ? 1 : 0.7}
                              transition="opacity 0.2s"
                            />
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Stack>

              {/* Right side - Product Details */}
              <Stack spacing={6}>
                {isEditing ? (
                  <Card variant="filled" p={6} bg={getColor("background.light")} border="1px" borderColor={getColor("border.light")}>
                    <VStack spacing={4} align="stretch">
                      <FormControl
                        isInvalid={formErrors.name}
                        bg={formErrors.name ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.name ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Product Name *
                        </FormLabel>
                        <Input
                          value={productData.name}
                          placeholder="Enter product name"
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          bg={getComponent("form", "fieldBg")}
                          border="1px"
                          borderColor={formErrors.name ? getColor("status.error") : getComponent("form", "fieldBorder")}
                          borderRadius="lg"
                          _placeholder={{ color: getComponent("form", "placeholderColor") }}
                          _focus={{
                            borderColor: getComponent("form", "fieldBorderFocus"),
                            boxShadow: getComponent("form", "fieldShadowFocus")
                          }}
                          fontFamily={brandConfig.fonts.body}
                        />
                        {formErrors.name && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            Name must be at least 2 characters long
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={formErrors.price}
                        bg={formErrors.price ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.price ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Price *
                        </FormLabel>
                        <NumberInput
                          value={productData.price}
                          min={0}
                          onChange={(valueString) => handleInputChange("price", parseFloat(valueString) || 0)}
                        >
                          <NumberInputField
                            bg={getComponent("form", "fieldBg")}
                            border="1px"
                            borderColor={formErrors.price ? getColor("status.error") : getComponent("form", "fieldBorder")}
                            borderRadius="lg"
                            _focus={{
                              borderColor: getComponent("form", "fieldBorderFocus"),
                              boxShadow: getComponent("form", "fieldShadowFocus")
                            }}
                            fontFamily={brandConfig.fonts.body}
                          />
                        </NumberInput>
                        {formErrors.price && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            Price must be greater than 0
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={formErrors.memberPrice}
                        bg={formErrors.memberPrice ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.memberPrice ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Member Price
                        </FormLabel>
                        <NumberInput
                          value={productData.memberPrice || 0}
                          min={0}
                          max={productData.price}
                          onChange={(valueString) => handleInputChange("memberPrice", parseFloat(valueString) || 0)}
                        >
                          <NumberInputField
                            bg={getComponent("form", "fieldBg")}
                            border="1px"
                            borderColor={formErrors.memberPrice ? getColor("status.error") : getComponent("form", "fieldBorder")}
                            borderRadius="lg"
                            _focus={{
                              borderColor: getComponent("form", "fieldBorderFocus"),
                              boxShadow: getComponent("form", "fieldShadowFocus")
                            }}
                            fontFamily={brandConfig.fonts.body}
                          />
                        </NumberInput>
                        {formErrors.memberPrice && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            Member price must be 0 or greater and less than or equal to regular price
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={formErrors.sku}
                        bg={formErrors.sku ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.sku ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          SKU *
                        </FormLabel>
                        <Input
                          value={productData.sku}
                          placeholder="Enter SKU"
                          onChange={(e) => handleInputChange("sku", e.target.value)}
                          bg={getComponent("form", "fieldBg")}
                          border="1px"
                          borderColor={formErrors.sku ? getColor("status.error") : getComponent("form", "fieldBorder")}
                          borderRadius="lg"
                          _placeholder={{ color: getComponent("form", "placeholderColor") }}
                          _focus={{
                            borderColor: getComponent("form", "fieldBorderFocus"),
                            boxShadow: getComponent("form", "fieldShadowFocus")
                          }}
                          fontFamily={brandConfig.fonts.body}
                        />
                        {formErrors.sku && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            SKU must be at least 3 characters long
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={formErrors.stockLevel}
                        bg={formErrors.stockLevel ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.stockLevel ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Stock Level *
                        </FormLabel>
                        <NumberInput
                          value={productData.stockLevel}
                          min={0}
                          onChange={(valueString) => handleInputChange("stockLevel", parseInt(valueString) || 0)}
                        >
                          <NumberInputField
                            bg={getComponent("form", "fieldBg")}
                            border="1px"
                            borderColor={formErrors.stockLevel ? getColor("status.error") : getComponent("form", "fieldBorder")}
                            borderRadius="lg"
                            _focus={{
                              borderColor: getComponent("form", "fieldBorderFocus"),
                              boxShadow: getComponent("form", "fieldShadowFocus")
                            }}
                            fontFamily={brandConfig.fonts.body}
                          />
                        </NumberInput>
                        {formErrors.stockLevel && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            Stock level must be 0 or greater
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={formErrors.description}
                        bg={formErrors.description ? getColor("status.error") : "transparent"}
                        transition="background-color 0.2s"
                        borderRadius="md"
                        p={formErrors.description ? 3 : 0}
                      >
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Description *
                        </FormLabel>
                        <Textarea
                          value={productData.description}
                          placeholder="Enter product description"
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          bg={getComponent("form", "fieldBg")}
                          border="1px"
                          borderColor={formErrors.description ? getColor("status.error") : getComponent("form", "fieldBorder")}
                          borderRadius="lg"
                          _placeholder={{ color: getComponent("form", "placeholderColor") }}
                          _focus={{
                            borderColor: getComponent("form", "fieldBorderFocus"),
                            boxShadow: getComponent("form", "fieldShadowFocus")
                          }}
                          fontFamily={brandConfig.fonts.body}
                        />
                        {formErrors.description && (
                          <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                            Description must be at least 10 characters long
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>How to Use</FormLabel>
                        <Textarea
                          value={productData.howToUse}
                          placeholder="Enter how to use instructions"
                          onChange={(e) => handleInputChange("howToUse", e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Benefits</FormLabel>
                        <Textarea
                          value={productData.benefits}
                          onChange={(e) => handleInputChange("benefits", e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Categories (comma-separated)</FormLabel>
                        <Input
                          value={productData.categories.join(", ")}
                          placeholder="Enter categories separated by commas"
                          onChange={(e) => handleInputChange("categories", e.target.value.split(",").map(cat => cat.trim()))}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          🌟 Life Essential Club Category (Optional)
                        </FormLabel>
                        <Select
                          value={productData.lifeEssentialCategory || ""}
                          onChange={(e) => handleInputChange("lifeEssentialCategory", e.target.value || undefined)}
                          placeholder="Select a Life Essential category"
                          bg={getComponent("form", "fieldBg")}
                          border="1px"
                          borderColor={getComponent("form", "fieldBorder")}
                          borderRadius="lg"
                          _focus={{
                            borderColor: getComponent("form", "fieldBorderFocus"),
                            boxShadow: getComponent("form", "fieldShadowFocus")
                          }}
                          fontFamily={brandConfig.fonts.body}
                        >
                          <option value="">None</option>
                          {Object.entries(LIFE_ESSENTIAL_CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                        <Text fontSize="sm" color={getColor("text.muted")} mt={1} fontFamily={brandConfig.fonts.body}>
                          Categorize your product for Life Essential Club members
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <Input
                          value={productData.tags.join(", ")}
                          placeholder="Enter tags separated by commas"
                          onChange={(e) => handleInputChange("tags", e.target.value.split(",").map(tag => tag.trim()))}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Ingredients (comma-separated)</FormLabel>
                        <Textarea
                          value={productData.ingredients.join(", ")}
                          placeholder="Enter ingredients separated by commas"
                          onChange={(e) => handleInputChange("ingredients", e.target.value.split(",").map(ing => ing.trim()))}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Variants</FormLabel>
                        {productData.variants.map((variant, idx) => (
                          <VStack key={idx} p={4} border="1px" borderColor="gray.200" borderRadius="md" mb={4} spacing={4}>
                            <HStack width="100%" justify="space-between">
                              <Heading size="md">
                                Variant {idx + 1}
                              </Heading>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteVariant(idx)}
                              >
                                Delete Variant
                              </Button>
                            </HStack>

                            <FormControl>
                              <FormLabel>Variant Title</FormLabel>
                              <Input
                                value={variant.title}
                                onChange={(e) => {
                                  const newVariants = [...productData.variants];
                                  newVariants[idx] = { ...variant, title: e.target.value };
                                  handleInputChange("variants", newVariants);
                                }}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Price</FormLabel>
                              <NumberInput value={variant.price} min={0}>
                                <NumberInputField
                                  onChange={(e) => {
                                    const newVariants = [...productData.variants];
                                    newVariants[idx] = { ...variant, price: parseFloat(e.target.value) || 0 };
                                    handleInputChange("variants", newVariants);
                                  }}
                                />
                              </NumberInput>
                            </FormControl>

                            <FormControl>
                              <FormLabel>SKU</FormLabel>
                              <Input
                                value={variant.sku || ''}
                                onChange={(e) => {
                                  const newVariants = [...productData.variants];
                                  newVariants[idx] = { ...variant, sku: e.target.value };
                                  handleInputChange("variants", newVariants);
                                }}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Stock Level</FormLabel>
                              <NumberInput value={variant.stockLevel} min={0}>
                                <NumberInputField
                                  onChange={(e) => {
                                    const newVariants = [...productData.variants];
                                    newVariants[idx] = { ...variant, stockLevel: parseInt(e.target.value) || 0 };
                                    handleInputChange("variants", newVariants);
                                  }}
                                />
                              </NumberInput>
                            </FormControl>
                          </VStack>
                        ))}

                        <Button
                          leftIcon={<AddIcon />}
                          onClick={handleAddVariant}
                          mt={4}
                          colorScheme="blue"
                        >
                          Add Variant
                        </Button>
                      </FormControl>

                      {/* Add the shipping form here for physical products */}
                      {productData.type === "PHYSICAL" && (
                        <Box borderWidth="1px" borderRadius="lg" p={4}>
                          <Heading size="md" mb={4}>Shipping Information</Heading>
                          <VStack spacing={4}>
                            <FormControl
                              isInvalid={formErrors.shippingWeight}
                              bg={formErrors.shippingWeight ? getColor("status.error") : "transparent"}
                              transition="background-color 0.2s"
                              borderRadius="md"
                              p={formErrors.shippingWeight ? 3 : 0}
                            >
                              <FormLabel
                                color={getComponent("form", "labelColor")}
                                fontWeight="500"
                                fontSize="sm"
                                mb={2}
                                fontFamily={brandConfig.fonts.body}
                              >
                                Weight (kg) *
                              </FormLabel>
                              <NumberInput
                                value={productData.shipping.weight}
                                min={0}
                                onChange={(value) => handleShippingChange("weight", parseFloat(value) || 0)}
                              >
                                <NumberInputField
                                  bg={getComponent("form", "fieldBg")}
                                  border="1px"
                                  borderColor={formErrors.shippingWeight ? getColor("status.error") : getComponent("form", "fieldBorder")}
                                  borderRadius="lg"
                                  _focus={{
                                    borderColor: getComponent("form", "fieldBorderFocus"),
                                    boxShadow: getComponent("form", "fieldShadowFocus")
                                  }}
                                  fontFamily={brandConfig.fonts.body}
                                />
                              </NumberInput>
                              {formErrors.shippingWeight && (
                                <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                                  Weight must be greater than 0
                                </Text>
                              )}
                            </FormControl>

                            <FormControl
                              isInvalid={formErrors.shippingDimensions}
                              bg={formErrors.shippingDimensions ? getColor("status.error") : "transparent"}
                              transition="background-color 0.2s"
                              borderRadius="md"
                              p={formErrors.shippingDimensions ? 3 : 0}
                            >
                              <FormLabel
                                color={getComponent("form", "labelColor")}
                                fontWeight="500"
                                fontSize="sm"
                                mb={2}
                                fontFamily={brandConfig.fonts.body}
                              >
                                Dimensions (cm) *
                              </FormLabel>
                              <Input
                                value={productData.shipping.dimensions}
                                placeholder="LxWxH (e.g., 10x5x5)"
                                onChange={(e) => handleShippingChange("dimensions", e.target.value)}
                                bg={getComponent("form", "fieldBg")}
                                border="1px"
                                borderColor={formErrors.shippingDimensions ? getColor("status.error") : getComponent("form", "fieldBorder")}
                                borderRadius="lg"
                                _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                _focus={{
                                  borderColor: getComponent("form", "fieldBorderFocus"),
                                  boxShadow: getComponent("form", "fieldShadowFocus")
                                }}
                                fontFamily={brandConfig.fonts.body}
                              />
                              {formErrors.shippingDimensions && (
                                <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                                  Please enter dimensions in format: LxWxH (e.g., 10x5x5)
                                </Text>
                              )}
                            </FormControl>

                            <FormControl
                              isInvalid={formErrors.shippingMethods}
                              bg={formErrors.shippingMethods ? getColor("status.error") : "transparent"}
                              transition="background-color 0.2s"
                              borderRadius="md"
                              p={formErrors.shippingMethods ? 3 : 0}
                            >
                              <FormLabel
                                color={getComponent("form", "labelColor")}
                                fontWeight="500"
                                fontSize="sm"
                                mb={2}
                                fontFamily={brandConfig.fonts.body}
                              >
                                Available Shipping Methods *
                              </FormLabel>
                              <CheckboxGroup
                                value={productData.shipping.availableShippingMethods}
                                onChange={(values) => handleShippingChange("availableShippingMethods", values)}
                              >
                                <VStack align="start">
                                  {Object.values(ShippingMethod).map((method) => (
                                    <Checkbox
                                      key={method}
                                      value={method}
                                      borderColor={formErrors.shippingMethods ? getColor("status.error") : "inherit"}
                                    >
                                      {method.replace("_", " ")}
                                    </Checkbox>
                                  ))}
                                </VStack>
                              </CheckboxGroup>
                              {formErrors.shippingMethods && (
                                <Text fontSize="sm" color={getColor("text.inverse")} mt={1} fontFamily={brandConfig.fonts.body}>
                                  Please select at least one shipping method
                                </Text>
                              )}
                            </FormControl>

                            <FormControl>
                              <FormLabel>Requires Special Handling</FormLabel>
                              <Switch
                                isChecked={productData.shipping.requiresSpecialHandling}
                                onChange={(e) => handleShippingChange("requiresSpecialHandling", e.target.checked)}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Shipping Restrictions</FormLabel>
                              <Textarea
                                value={productData.shipping.shippingRestrictions || ""}
                                placeholder="Enter any shipping restrictions or special handling instructions"
                                onChange={(e) => handleShippingChange("shippingRestrictions", e.target.value)}
                              />
                            </FormControl>
                          </VStack>
                        </Box>
                      )}

                      {/* Syndicate Settings */}
                      <Box borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg" p={4}>
                        <Heading size="md" mb={4} color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                          Cross-Store Settings
                        </Heading>
                        <FormControl>
                          <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={1} flex={1}>
                              <Text
                                color={getComponent("form", "labelColor")}
                                fontWeight="500"
                                fontSize="sm"
                                fontFamily={brandConfig.fonts.body}
                              >
                                Enable for Syndicate Stores
                              </Text>
                              <Text
                                fontSize="xs"
                                color={getColor("text.muted")}
                                fontFamily={brandConfig.fonts.body}
                                maxW="400px"
                              >
                                When enabled, this product will be searchable and discoverable on other branded stores within the network, expanding your reach to more customers.
                              </Text>
                            </VStack>
                            <Switch
                              isChecked={productData.enableForSyndicate}
                              onChange={(e) => setProductData(prev => ({
                                ...prev,
                                enableForSyndicate: e.target.checked
                              }))}
                              size="lg"
                            />
                          </HStack>
                        </FormControl>
                      </Box>
                    </VStack>
                  </Card>
                ) : (
                  <Card variant="filled" p={6} bg={getColor("background.light")} border="1px" borderColor={getColor("border.light")}>
                    <VStack align="start" spacing={4}>
                      <Heading as="h1" size="xl" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                        {productData.name}
                      </Heading>
                      <Text fontSize="2xl" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                        ${productData.price.toFixed(2)} AUD
                      </Text>

                      {/* Display member price in preview mode if it exists and is greater than 0 */}
                      {(productData.memberPrice ?? 0) > 0 && (
                        <Text fontSize="lg" color={getColor("status.success")} fontFamily={brandConfig.fonts.body}>
                          Member Price: ${(productData.memberPrice ?? 0).toFixed(2)} AUD
                        </Text>
                      )}

                      <HStack wrap="wrap">
                        {productData.isBestSeller && (
                          <Badge colorScheme="green">Best Seller</Badge>
                        )}
                        <Badge>{productData.type}</Badge>
                        <Badge>{productData.pricingModel}</Badge>
                        {productData.lifeEssentialCategory && (
                          <Badge colorScheme="purple" variant="subtle">
                            {LIFE_ESSENTIAL_CATEGORY_LABELS[productData.lifeEssentialCategory]}
                          </Badge>
                        )}
                      </HStack>

                      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]} width="100%">
                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              Description
                            </Box>
                          </AccordionButton>
                          <AccordionPanel color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                            {productData.description}
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              How to Use
                            </Box>
                          </AccordionButton>
                          <AccordionPanel color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                            {productData.howToUse}
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              Benefits
                            </Box>
                          </AccordionButton>
                          <AccordionPanel color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                            {productData.benefits}
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              Ingredients
                            </Box>
                          </AccordionButton>
                          <AccordionPanel>
                            <UnorderedList>
                              {productData.ingredients.map((ingredient, idx) => (
                                <ListItem key={idx} color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                  {ingredient}
                                </ListItem>
                              ))}
                            </UnorderedList>
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              Variants
                            </Box>
                          </AccordionButton>
                          <AccordionPanel>
                            {productData.variants.map((variant, idx) => (
                              <Box key={idx} p={2} mb={2} borderWidth="1px" borderColor={getColor("border.light")} borderRadius="md">
                                <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                  {variant.title}
                                </Text>
                                <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                  ${variant.price.toFixed(2)}
                                </Text>
                                <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                  SKU: {variant.sku}
                                </Text>
                                <Text color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                  Stock: {variant.stockLevel}
                                </Text>
                              </Box>
                            ))}
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </VStack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </CardBody>
        </Card>
      </Container>

      <FooterWithFourColumns />

      {/* Login Modal */}
      <LoginModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          // Redirect if they cancel login
          if (!isAuthenticated) {
            navigate("/");
          }
        }}
        onLoginSuccess={() => {
          onClose();
          toast({
            title: "Welcome!",
            description: "You can now add new products.",
            status: "success",
            duration: 3000,
          });
        }}
      />
    </Box>
  );
};

export default NewProductForm;