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
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import productsModuleConfig from './moduleConfig';
import SortableImage from "./components/SortableImage";
import { FiShoppingCart } from "react-icons/fi";
import { CartPreview } from "./components/CartPreview";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { LoginWithSmsModal } from "../authentication";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Product, ProductVariant, Cart } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Define interfaces

interface ShippingDetails {
  weight: number;
  dimensions: string;
  availableShippingMethods: string[];
  requiresSpecialHandling: boolean;
}


const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      memberPrice
      type
      pricingModel
      stockLevel
      sku
      isActive
      images
      variants {
        variantId
        title
        price
        sku
        stockLevel
      }
      categories
      tags
      ingredients
      howToUse
      benefits
      isFeatured
      isBestSeller
      shipping {
        weight
        dimensions
        availableShippingMethods
        requiresSpecialHandling
      }
      shippingInfo
      availableFrom
      availableUntil
      seller {
        id
        fName
        lName
        email
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
      lifeEssentialCategory
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      memberPrice
      type
      pricingModel
      stockLevel
      sku
      isActive
      images
      variants {
        variantId
        title
        price
        sku
        stockLevel
      }
      categories
      tags
      ingredients
      howToUse
      benefits
      isFeatured
      isBestSeller
      shipping {
        weight
        dimensions
        availableShippingMethods
        requiresSpecialHandling
      }
      shippingInfo
      availableFrom
      availableUntil
      sellerProfile {
        id
        businessName
        logoImage
        businessType
        isVerified
        isFeatured
      }
      enableForSyndicate
      lifeEssentialCategory
    }
  }
`;

export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  INTERNATIONAL = "INTERNATIONAL",
  LOCAL_PICKUP = "LOCAL_PICKUP"
}

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($input: CartItemInput!) {
    addToCart(input: $input) {
      id
      items {
        id
        product {
          id
          name
          price
        }
        quantity
        selectedVariantId
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      expiresAt
    }
  }
`;

const GET_ACTIVE_CART = gql`
  query GetActiveCart {
    activeCartByClient {
      id
      items {
        id
        product {
          id
          name
          price
        }
        quantity
        selectedVariantId
      }
    }
  }
`;

const GET_CART = gql`
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      items {
        id
        product {
          id
          name
          price
        }
        quantity
        selectedVariantId
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      expiresAt
    }
  }
`;

const GET_SELLER_PROFILES_BY_CLIENT = gql`
  query GetSellerProfilesByClient($clientId: ID!) {
    sellerProfilesByClient(clientId: $clientId) {
      id
      businessName
      description
      businessType
      logoImage
      isVerified
      isFeatured
      contactEmail
      contactPhone
      offersDelivery
      offersPickup
      offersShipping
    }
  }
`;

const GET_MY_SELLER_PROFILES = gql`
  query GetMySellerProfiles {
    mySellerProfiles {
      id
      businessName
      description
      businessType
      logoImage
      isVerified
      isFeatured
    }
  }
`;

type DraggableImage = {
  id: string;
  url: string;
};

const ProductView: React.FC = () => {
  usePageTitle("Product Details");
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);

  const [draggableImages, setDraggableImages] = useState<DraggableImage[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(localStorage.getItem("cart_id"));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const bg = getColor("background.surface");

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  const { data: sellerProfilesData } = useQuery(GET_SELLER_PROFILES_BY_CLIENT, {
    variables: { clientId: data?.product?.seller?.id },
    skip: !data?.product?.seller?.id,
  });

  const { data: mySellerProfilesData } = useQuery(GET_MY_SELLER_PROFILES, {
    skip: !isAuthenticated,
  });

  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT);
  const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
    onCompleted: (data) => {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
        status: "success",
        duration: 3000,
      });
      setCartId(data.addToCart.id);
      localStorage.setItem("cart_id", data.addToCart.id);
    },
    refetchQueries: [{ query: GET_ACTIVE_CART }],
    onError: (error) => {
      // Error handling for add to cart
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (editedProduct?.images) {
      const images = editedProduct.images.map((url, index) => ({
        id: `img-${Date.now()}-${index}`,
        url
      }));
      setDraggableImages(images);
    }
  }, [editedProduct?.images]);

  useEffect(() => {
    if (data?.product) {
      setEditedProduct(data.product);
      setMainImage(data.product.images[0] || "");
    }
  }, [data]);

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

      const newImage = {
        id: `img-${Date.now()}`,
        url: newImageUrl
      };

      setDraggableImages(prev => [...prev, newImage]);
      setEditedProduct(prev =>
        prev ? {
          ...prev,
          images: [...(prev.images || []), newImageUrl]
        } : null
      );

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
  const handleDeleteImage = (index: number) => {
    setDraggableImages(prev => prev.filter((_, i) => i !== index));
    setEditedProduct(prev =>
      prev ? {
        ...prev,
        images: prev.images?.filter((_, i) => i !== index)
      } : null
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (!editedProduct?.images) return;

    const oldIndex = editedProduct.images.findIndex((url, index) =>
      `${index}-${url}` === active.id
    );
    const newIndex = editedProduct.images.findIndex((url, index) =>
      `${index}-${url}` === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    setEditedProduct(prev => {
      if (!prev || !prev.images) return null;
      const newImages = arrayMove(prev.images, oldIndex, newIndex);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    try {
      // Clean up the shipping object by removing __typename
      const cleanShipping = editedProduct.shipping ? {
        weight: editedProduct.shipping.weight,
        dimensions: editedProduct.shipping.dimensions,
        availableShippingMethods: editedProduct.shipping.availableShippingMethods,
        requiresSpecialHandling: editedProduct.shipping.requiresSpecialHandling
      } : undefined;
      const { data } = await updateProduct({
        variables: {
          id,
          input: {
            name: editedProduct.name,
            description: editedProduct.description,
            price: editedProduct.price,
            memberPrice: editedProduct.memberPrice,
            type: editedProduct.type,
            pricingModel: editedProduct.pricingModel,
            sku: editedProduct.sku,
            stockLevel: editedProduct.stockLevel,
            images: editedProduct.images,
            variants: editedProduct.variants,
            categories: editedProduct.categories,
            tags: editedProduct.tags,
            ingredients: editedProduct.ingredients,
            howToUse: editedProduct.howToUse,
            benefits: editedProduct.benefits,
            isFeatured: editedProduct.isFeatured,
            isBestSeller: editedProduct.isBestSeller,
            shipping: cleanShipping,
            shippingInfo: editedProduct.shippingInfo,
            availableFrom: editedProduct.availableFrom,
            availableUntil: editedProduct.availableUntil,
            sellerProfileId: editedProduct.sellerProfile?.id || null,
            enableForSyndicate: editedProduct.enableForSyndicate,
            lifeEssentialCategory: editedProduct.lifeEssentialCategory
          }
        }
      });

      if (data?.updateProduct) {
        toast({
          title: "Product updated successfully",
          status: "success",
          duration: 3000,
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error updating product",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddToCart = () => {
    console.log("Adding to cart with variables:", {
      productId: id,
      quantity,
      selectedVariant
    });

    addToCart({
      variables: {
        input: {
          productId: id,
          quantity,
          ...(selectedVariant ? { selectedVariantId: selectedVariant } : {})
        },
      },
    }).then(result => {
      console.log("Add to cart success:", result);
    }).catch(error => {
      console.error("Add to cart error:", error);
      console.error("Error details:", {
        id,
        quantity,
        selectedVariant,
        errorMessage: error.message
      });
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.product) return <div>No product found</div>;

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={productsModuleConfig} />
      <Container maxW="container.xl" py={12} flex="1">
        {isAuthenticated && (
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
              {isEditing ? "Save Changes" : "Edit Product"}
            </Button>
          </HStack>
        )}

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={10}>
          {/* Left side - Images */}
          <Stack spacing={4}>
            {isEditing ? (
              <VStack spacing={4} width="100%">
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
                </FormControl>

                {isEditing && editedProduct?.images && editedProduct.images.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SimpleGrid columns={2} spacing={4} width="100%">
                      <SortableContext
                        items={editedProduct.images.map((url, index) => `${index}-${url}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {editedProduct.images.map((url, index) => (
                          <SortableImage
                            key={`${index}-${url}`}
                            id={`${index}-${url}`}
                            url={url}
                            index={index}
                            onDelete={() => handleDeleteImage(index)}
                          />
                        ))}
                      </SortableContext>
                    </SimpleGrid>
                  </DndContext>
                )}
              </VStack>
            ) : (
              <Stack spacing={4}>
                {/* Main Image */}
                <Box>
                  <Image
                    src={mainImage}
                    alt={data.product.name}
                    width="100%"
                    height="auto"
                    borderRadius="lg"
                    border="1px"
                    borderColor={getColor("border.light")}
                  />
                </Box>

                {/* Thumbnail Gallery */}
                {data.product.images && data.product.images.length > 1 && (
                  <SimpleGrid columns={4} spacing={2}>
                    {data.product.images.map((img: string, index: number) => (
                      <Box
                        key={img}
                        cursor="pointer"
                        borderWidth={mainImage === img ? "2px" : "1px"}
                        borderColor={mainImage === img ? getColor("primary") : getColor("border.light")}
                        borderRadius="md"
                        onClick={() => setMainImage(img)}
                      >
                        <Image
                          src={img}
                          alt={`Product view ${index + 1}`}
                          width="100%"
                          height="auto"
                          opacity={mainImage === img ? 1 : 0.6}
                          _hover={{ opacity: 1 }}
                          transition="opacity 0.2s"
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            )}
          </Stack>

          {/* Right side - Product Details */}
          <Stack spacing={6}>
            {isEditing ? (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Product Name
                  </FormLabel>
                  <Input
                    value={editedProduct?.name}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Description
                  </FormLabel>
                  <Textarea
                    value={editedProduct?.description}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, description: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Price
                  </FormLabel>
                  <Input
                    type="number"
                    value={editedProduct?.price}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, price: parseFloat(e.target.value) } : null
                    )}
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
                </FormControl>

                {/* Member Price Field */}
                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Member Price (Optional)
                  </FormLabel>
                  <Input
                    type="number"
                    value={editedProduct?.memberPrice ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      setEditedProduct(prev =>
                        prev ? { ...prev, memberPrice: value } : null
                      );
                    }}
                    placeholder="Leave empty for no member price"
                    bg={getComponent("form", "fieldBg")}
                    border="1px"
                    borderColor={getComponent("form", "fieldBorder")}
                    borderRadius="lg"
                    _placeholder={{ color: getComponent("form", "placeholderColor") }}
                    _focus={{
                      borderColor: getComponent("form", "fieldBorderFocus"),
                      boxShadow: getComponent("form", "fieldShadowFocus")
                    }}
                    fontFamily={brandConfig.fonts.body}
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
                    SKU
                  </FormLabel>
                  <Input
                    value={editedProduct?.sku}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, sku: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Stock Level
                  </FormLabel>
                  <Input
                    type="number"
                    value={editedProduct?.stockLevel}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, stockLevel: parseInt(e.target.value) || 0 } : null
                    )}
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
                </FormControl>

                {/* Seller Profile Selection */}
                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Seller Profile (Optional)
                  </FormLabel>
                  <Select
                    value={editedProduct?.sellerProfile?.id || ""}
                    onChange={(e) => {
                      const selectedProfileId = e.target.value;
                      const selectedProfile = selectedProfileId
                        ? mySellerProfilesData?.mySellerProfiles?.find((p: any) => p.id === selectedProfileId)
                        : null;

                      setEditedProduct(prev =>
                        prev ? {
                          ...prev,
                          sellerProfile: selectedProfile || undefined
                        } : null
                      );
                    }}
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
                    <option value="">No seller profile</option>
                    {mySellerProfilesData?.mySellerProfiles?.map((profile: any) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.businessName} ({profile.businessType})
                        {profile.isVerified && " ✓"}
                      </option>
                    ))}
                  </Select>
                  {editedProduct?.sellerProfile && (
                    <Box mt={2} p={3} bg={getColor("background.light")} borderRadius="md">
                      <HStack spacing={3}>
                        {editedProduct.sellerProfile.logoImage && (
                          <Image
                            src={editedProduct.sellerProfile.logoImage}
                            alt={editedProduct.sellerProfile.businessName}
                            width="40px"
                            height="40px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        )}
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="bold" fontSize="sm" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              {editedProduct.sellerProfile.businessName}
                            </Text>
                            {editedProduct.sellerProfile.isVerified && (
                              <Badge colorScheme="green" size="sm">✅</Badge>
                            )}
                            {editedProduct.sellerProfile.isFeatured && (
                              <Badge colorScheme="purple" size="sm">⭐</Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                            {editedProduct.sellerProfile.businessType}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    How to Use
                  </FormLabel>
                  <Textarea
                    value={editedProduct?.howToUse || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, howToUse: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Benefits
                  </FormLabel>
                  <Textarea
                    value={editedProduct?.benefits || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, benefits: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Categories (comma-separated)
                  </FormLabel>
                  <Input
                    value={editedProduct?.categories?.join(", ") || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, categories: e.target.value.split(",").map(cat => cat.trim()).filter(cat => cat) } : null
                    )}
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
                    value={editedProduct?.lifeEssentialCategory || ""}
                    onChange={(e) => (setEditedProduct as any)((prev: any) =>
                      prev ? { ...prev, lifeEssentialCategory: e.target.value || null } : null
                    )}
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
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Tags (comma-separated)
                  </FormLabel>
                  <Input
                    value={editedProduct?.tags?.join(", ") || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Ingredients (comma-separated)
                  </FormLabel>
                  <Textarea
                    value={editedProduct?.ingredients?.join(", ") || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, ingredients: e.target.value.split(",").map(ing => ing.trim()).filter(ing => ing) } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={getComponent("form", "labelColor")}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Shipping Information (Optional)
                  </FormLabel>
                  <Textarea
                    value={editedProduct?.shippingInfo || ""}
                    onChange={(e) => setEditedProduct(prev =>
                      prev ? { ...prev, shippingInfo: e.target.value } : null
                    )}
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
                </FormControl>

                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text
                        color={getComponent("form", "labelColor")}
                        fontWeight="500"
                        fontSize="sm"
                        fontFamily={brandConfig.fonts.body}
                      >
                        Featured Product
                      </Text>
                      <Switch
                        isChecked={editedProduct?.isFeatured}
                        onChange={(e) => setEditedProduct(prev =>
                          prev ? { ...prev, isFeatured: e.target.checked } : null
                        )}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text
                        color={getComponent("form", "labelColor")}
                        fontWeight="500"
                        fontSize="sm"
                        fontFamily={brandConfig.fonts.body}
                      >
                        Best Seller
                      </Text>
                      <Switch
                        isChecked={editedProduct?.isBestSeller}
                        onChange={(e) => setEditedProduct(prev =>
                          prev ? { ...prev, isBestSeller: e.target.checked } : null
                        )}
                      />
                    </VStack>
                  </HStack>
                </FormControl>

                <FormControl>
                  <VStack align="start" spacing={1}>
                    <Text
                      color={getComponent("form", "labelColor")}
                      fontWeight="500"
                      fontSize="sm"
                      fontFamily={brandConfig.fonts.body}
                    >
                      Product Active
                    </Text>
                    <Switch
                      isChecked={editedProduct?.isActive}
                      onChange={(e) => setEditedProduct(prev =>
                        prev ? { ...prev, isActive: e.target.checked } : null
                      )}
                    />
                  </VStack>
                </FormControl>

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
                        isChecked={editedProduct?.enableForSyndicate}
                        onChange={(e) => setEditedProduct(prev =>
                          prev ? { ...prev, enableForSyndicate: e.target.checked } : null
                        )}
                        size="lg"
                      />
                    </HStack>
                  </FormControl>
                </Box>

                {/* Variants Section */}
                <Box borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg" p={4}>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                      Product Variants
                    </Heading>
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={() => setEditedProduct(prev => prev ? {
                        ...prev,
                        variants: [
                          ...(prev.variants || []),
                          {
                            variantId: `VAR-${prev.variants?.length || 0 + 1}`,
                            title: `Variant ${prev.variants?.length || 0 + 1}`,
                            price: prev.price,
                            sku: `${prev.sku}-VAR-${prev.variants?.length || 0 + 1}`,
                            stockLevel: 0
                          }
                        ]
                      } : null)}
                      size="sm"
                      bg={getComponent("button", "secondaryBg")}
                      color={getColor("text.primary")}
                      _hover={{ bg: getComponent("button", "secondaryHover") }}
                      fontFamily={brandConfig.fonts.body}
                    >
                      Add Variant
                    </Button>
                  </HStack>

                  {editedProduct?.variants?.map((variant, idx) => (
                    <VStack key={idx} p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md" mb={4} spacing={4}>
                      <HStack width="100%" justify="space-between">
                        <Heading size="sm" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                          Variant {idx + 1}
                        </Heading>
                        <Button
                          size="sm"
                          bg={getColor("status.error")}
                          color={getColor("text.inverse")}
                          _hover={{ bg: getColor("status.error") }}
                          onClick={() => setEditedProduct(prev => prev ? {
                            ...prev,
                            variants: prev.variants?.filter((_, index) => index !== idx)
                          } : null)}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Delete
                        </Button>
                      </HStack>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Title
                        </FormLabel>
                        <Input
                          value={variant.title}
                          onChange={(e) => setEditedProduct(prev => {
                            if (!prev) return null;
                            const newVariants = [...(prev.variants || [])];
                            newVariants[idx] = { ...variant, title: e.target.value };
                            return { ...prev, variants: newVariants };
                          })}
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
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Price
                        </FormLabel>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => setEditedProduct(prev => {
                            if (!prev) return null;
                            const newVariants = [...(prev.variants || [])];
                            newVariants[idx] = { ...variant, price: parseFloat(e.target.value) || 0 };
                            return { ...prev, variants: newVariants };
                          })}
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
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          SKU
                        </FormLabel>
                        <Input
                          value={variant.sku || ""}
                          onChange={(e) => setEditedProduct(prev => {
                            if (!prev) return null;
                            const newVariants = [...(prev.variants || [])];
                            newVariants[idx] = { ...variant, sku: e.target.value };
                            return { ...prev, variants: newVariants };
                          })}
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
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Stock Level
                        </FormLabel>
                        <Input
                          type="number"
                          value={variant.stockLevel}
                          onChange={(e) => setEditedProduct(prev => {
                            if (!prev) return null;
                            const newVariants = [...(prev.variants || [])];
                            newVariants[idx] = { ...variant, stockLevel: parseInt(e.target.value) || 0 };
                            return { ...prev, variants: newVariants };
                          })}
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
                      </FormControl>
                    </VStack>
                  ))}
                </Box>

                {/* Shipping Details Section for Physical Products */}
                {editedProduct?.shipping && (
                  <Box borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg" p={4}>
                    <Heading size="md" mb={4} color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                      Shipping Information
                    </Heading>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Weight (kg)
                        </FormLabel>
                        <Input
                          type="number"
                          value={editedProduct.shipping.weight}
                          onChange={(e) => (setEditedProduct as any)((prev: any) => prev ? {
                            ...prev,
                            shipping: {
                              ...prev.shipping,
                              weight: parseFloat(e.target.value) || 0
                            }
                          } : null)}
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
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Dimensions (LxWxH cm)
                        </FormLabel>
                        <Input
                          value={editedProduct.shipping.dimensions}
                          onChange={(e) => (setEditedProduct as any)((prev: any) => prev ? {
                            ...prev,
                            shipping: {
                              ...prev.shipping,
                              dimensions: e.target.value
                            }
                          } : null)}
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
                      </FormControl>

                      <FormControl>
                        <VStack align="start" spacing={1}>
                          <Text
                            color={getComponent("form", "labelColor")}
                            fontWeight="500"
                            fontSize="sm"
                            fontFamily={brandConfig.fonts.body}
                          >
                            Requires Special Handling
                          </Text>
                          <Switch
                            isChecked={editedProduct.shipping.requiresSpecialHandling}
                            onChange={(e) => (setEditedProduct as any)((prev: any) => prev ? {
                              ...prev,
                              shipping: {
                                ...prev.shipping,
                                requiresSpecialHandling: e.target.checked
                              }
                            } : null)}
                          />
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Available Shipping Methods
                        </FormLabel>
                        <CheckboxGroup
                          value={editedProduct.shipping.availableShippingMethods}
                          onChange={(values) => (setEditedProduct as any)((prev: any) => prev ? {
                            ...prev,
                            shipping: {
                              ...prev.shipping,
                              availableShippingMethods: values as ShippingMethod[]
                            }
                          } : null)}
                        >
                          <VStack align="start">
                            {Object.values(ShippingMethod).map((method) => (
                              <Checkbox
                                key={method}
                                value={method}
                              >
                                {method.replace("_", " ")}
                              </Checkbox>
                            ))}
                          </VStack>
                        </CheckboxGroup>
                      </FormControl>
                    </VStack>
                  </Box>
                )}
              </VStack>
            ) : (
              // Buyer View / Display Mode
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="xl" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                    {data.product.name}
                  </Heading>
                  <HStack spacing={2} mt={2} wrap="wrap">
                    {data.product.isBestSeller && (
                      <Badge colorScheme="orange">Best Seller</Badge>
                    )}
                    {data.product.isFeatured && (
                      <Badge colorScheme="purple">Featured</Badge>
                    )}
                    {data.product.lifeEssentialCategory && (
                      <Badge colorScheme="purple" variant="subtle">
                        {LIFE_ESSENTIAL_CATEGORY_LABELS[data.product.lifeEssentialCategory as LifeEssentialCategory]}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                <Box>
                  <Heading size="lg" color={getColor("primary")} fontFamily={brandConfig.fonts.heading}>
                    ${data.product.price.toFixed(2)}
                  </Heading>

                  {/* Display member price if available */}
                  {data.product.memberPrice != null && data.product.memberPrice > 0 && (
                    <Text color={getColor("status.success")} fontWeight="bold" fontFamily={brandConfig.fonts.body}>
                      Member Price: ${data.product.memberPrice.toFixed(2)}
                    </Text>
                  )}

                  <Text color={data.product.stockLevel > 0 ? getColor("status.success") : getColor("status.error")} fontFamily={brandConfig.fonts.body}>
                    {data.product.stockLevel > 0 ? "In Stock" : "Out of Stock"}
                  </Text>
                </Box>

                <Box>
                  <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                    Description
                  </Heading>
                  <Text mt={2} color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                    {data.product.description}
                  </Text>
                </Box>

                {/* Seller Information */}
                <Box borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg" p={4} bg={getColor("background.light")}>
                  <VStack spacing={3} align="stretch">
                    <Heading size="md" color={getColor("text.primary")} fontFamily={brandConfig.fonts.heading}>
                      👤 Sold by
                    </Heading>

                    {/* Show seller profile if directly associated with product */}
                    {data.product.sellerProfile ? (
                      <Box>
                        <HStack justify="space-between" align="center" mb={3}>
                          <HStack spacing={3} align="center">
                            {data.product.sellerProfile.logoImage && (
                              <Image
                                src={data.product.sellerProfile.logoImage}
                                alt={data.product.sellerProfile.businessName}
                                width="50px"
                                height="50px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                            )}
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                  {data.product.sellerProfile.businessName}
                                </Text>
                                {data.product.sellerProfile.isVerified && (
                                  <Badge colorScheme="green" size="sm">✅ Verified</Badge>
                                )}
                                {data.product.sellerProfile.isFeatured && (
                                  <Badge colorScheme="purple" size="sm">⭐ Featured</Badge>
                                )}
                              </HStack>
                              <Text fontSize="sm" color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                                {data.product.sellerProfile.businessType}
                              </Text>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/seller-profile/${data.product.sellerProfile!.id}`)}
                            rightIcon={<ExternalLinkIcon />}
                            borderColor={getColor("primary")}
                            color={getColor("primary")}
                            _hover={{ bg: getColor("primary"), color: getColor("text.inverse") }}
                            fontFamily={brandConfig.fonts.body}
                          >
                            View Store
                          </Button>
                        </HStack>

                        {/* Owner details */}
                        {/* <Box p={3} bg={getColor("background.surface")} borderRadius="md">
                          <Text fontSize="sm" color={getColor("text.muted")} fontFamily={brandConfig.fonts.body}>
                            Business Owner:
                          </Text>
                          <Text fontWeight="medium" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                            {data.product.seller.fName} {data.product.seller.lName}
                          </Text>
                        </Box> */}
                      </Box>
                    ) : (
                      // Fallback to basic seller info if no seller profile
                      <Box>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                              {data.product.seller.fName} {data.product.seller.lName}
                            </Text>
                            <Text fontSize="sm" color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body}>
                              {data.product.seller.email}
                            </Text>
                          </VStack>
                          {sellerProfilesData?.sellerProfilesByClient?.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/seller-profile/${sellerProfilesData.sellerProfilesByClient[0].id}`)}
                              rightIcon={<ExternalLinkIcon />}
                              borderColor={getColor("primary")}
                              color={getColor("primary")}
                              _hover={{ bg: getColor("primary"), color: getColor("text.inverse") }}
                              fontFamily={brandConfig.fonts.body}
                            >
                              View Store
                            </Button>
                          )}
                        </HStack>

                        {/* Show seller profile preview if available */}
                        {sellerProfilesData?.sellerProfilesByClient?.length > 0 && (
                          <Box mt={2}>
                            {sellerProfilesData.sellerProfilesByClient.map((profile: any) => (
                              <HStack key={profile.id} spacing={3} align="start">
                                {profile.logoImage && (
                                  <Image
                                    src={profile.logoImage}
                                    alt={profile.businessName}
                                    width="60px"
                                    height="60px"
                                    objectFit="cover"
                                    borderRadius="md"
                                  />
                                )}
                                <VStack align="start" spacing={1} flex={1}>
                                  <HStack spacing={2}>
                                    <Text fontWeight="bold" color={getColor("text.primary")} fontFamily={brandConfig.fonts.body}>
                                      {profile.businessName}
                                    </Text>
                                    {profile.isVerified && (
                                      <Badge colorScheme="green" size="sm">✅ Verified</Badge>
                                    )}
                                    {profile.isFeatured && (
                                      <Badge colorScheme="purple" size="sm">⭐ Featured</Badge>
                                    )}
                                  </HStack>
                                  <Text fontSize="sm" color={getColor("text.secondary")} fontFamily={brandConfig.fonts.body} noOfLines={2}>
                                    {profile.description}
                                  </Text>
                                  <HStack spacing={2} mt={1}>
                                    {profile.offersDelivery && (
                                      <Badge colorScheme="green" size="sm">🚚 Delivery</Badge>
                                    )}
                                    {profile.offersPickup && (
                                      <Badge colorScheme="blue" size="sm">🏪 Pickup</Badge>
                                    )}
                                    {profile.offersShipping && (
                                      <Badge colorScheme="purple" size="sm">📦 Shipping</Badge>
                                    )}
                                  </HStack>
                                </VStack>
                              </HStack>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </VStack>
                </Box>

                {/* Add to Cart Section */}
                <Box borderWidth="1px" borderColor={getColor("border.light")} borderRadius="lg" p={4} bg={getColor("background.light")}>
                  <VStack spacing={4}>
                    {data.product.variants && data.product.variants.length > 0 && (
                      <FormControl>
                        <FormLabel
                          color={getComponent("form", "labelColor")}
                          fontWeight="500"
                          fontSize="sm"
                          mb={2}
                          fontFamily={brandConfig.fonts.body}
                        >
                          Select Variant
                        </FormLabel>
                        <Select
                          value={selectedVariant || ""}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedVariant(e.target.value)}
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
                          <option value="">Select a variant</option>
                          {data.product.variants.map((variant: ProductVariant) => (
                            <option key={variant.variantId} value={variant.variantId}>
                              {variant.title} - ${variant.price.toFixed(2)}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <FormControl>
                      <FormLabel
                        color={getComponent("form", "labelColor")}
                        fontWeight="500"
                        fontSize="sm"
                        mb={2}
                        fontFamily={brandConfig.fonts.body}
                      >
                        Quantity
                      </FormLabel>
                      <NumberInput
                        min={1}
                        value={quantity}
                        onChange={(_, value) => setQuantity(value)}
                      >
                        <NumberInputField
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
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <Button
                      bg={getComponent("button", "primaryBg")}
                      color={getColor("text.inverse")}
                      _hover={{ bg: getComponent("button", "primaryHover") }}
                      leftIcon={<FiShoppingCart />}
                      isLoading={addingToCart}
                      loadingText="Adding to cart..."
                      size="lg"
                      width="full"
                      fontFamily={brandConfig.fonts.body}
                      onClick={isAuthenticated ? handleAddToCart : () => setIsLoginModalOpen(true)}
                    >
                      Add to Cart
                    </Button>
                  </VStack>
                </Box>

              </VStack>
            )}
          </Stack>
        </Grid>
      </Container>
      <CartPreview />
      <FooterWithFourColumns />
      <LoginWithSmsModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          // Optionally reload the page or refresh auth state
          window.location.reload();
        }}
      />
    </Box>
  );
};

export default ProductView; 