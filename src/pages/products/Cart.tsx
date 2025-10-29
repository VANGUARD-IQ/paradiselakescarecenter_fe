import React from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Container,
  VStack,
  Heading,
  Box,
  Button,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Grid,
  GridItem,
  useColorMode,
} from "@chakra-ui/react";
import { FiShoppingCart, FiTrash2, FiCreditCard } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import productsModuleConfig from './moduleConfig';
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useNavigate } from "react-router-dom";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { Cart as CartType, CartItem, Product } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Queries and Mutations
const GET_CART = gql`
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      client {
        id
        email
      }
      items {
        id
        product {
          id
          name
          price
          variants {
            variantId
            title
            price
          }
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

const DELETE_CART = gql`
  mutation DeleteCart($cartId: ID!) {
    deleteCart(cartId: $cartId)
  }
`;

const CREATE_PRODUCT_ORDER = gql`
  mutation CreateProductOrder($input: ProductOrderInput!) {
    createProductOrder(input: $input) {
      id
      client {
        id
        email
        fName
        lName
      }
      items {
        product {
          id
          name
          price
        }
        quantity
        priceAtTime
        selectedVariantId
      }
      totalAmount
      status
      payment {
        status
        method
      }
      createdAt
      updatedAt
    }
  }
`;

// TypeScript Interfaces
interface ProductVariant {
  variantId: string;
  title: string;
  price: number;
}


const Cart = () => {
  usePageTitle("Shopping Cart");
  const cartId = localStorage.getItem("cart_id");
  const toast = useToast();
  const { colorMode } = useColorMode();
  const bg = getColor("background.surface", colorMode);
  const navigate = useNavigate();

  // Query for existing cart
  const { loading: cartLoading, error: cartError, data: cartData } = useQuery(GET_CART, {
    variables: { cartId },
    skip: !cartId,
  });

  // Delete cart mutation
  const [deleteCart, { loading: deleteLoading }] = useMutation(DELETE_CART, {
    onCompleted: () => {
      localStorage.removeItem("cart_id");
      toast({
        title: "Cart deleted",
        description: "Cart has been successfully deleted",
        status: "success",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting cart",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  // Add create order mutation
  const [createOrder, { loading: createOrderLoading }] = useMutation(CREATE_PRODUCT_ORDER, {
    onCompleted: (data) => {
      toast({
        title: "Order created successfully",
        description: "Redirecting to order details...",
        status: "success",
        duration: 3000,
      });
      navigate(`/order/${data.createProductOrder.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating order",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const handleDeleteCart = () => {
    if (cartId) {
      deleteCart({ variables: { cartId } });
    }
  };

  const handleCheckout = async () => {
    if (!cartData?.cart?.items?.length) {
      console.log("No items in cart, returning");
      return;
    }

    console.group("Checkout Process Debug");

    const orderInput = {
      clientId: cartData.cart.client.id,
      items: cartData.cart.items.map((item: CartItem) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedVariantId: item.selectedVariantId,
      })),
      payment: {
        status: "PENDING",
        method: "STRIPE"
      }
    };

    try {
      const result = await createOrder({
        variables: { input: orderInput },
        context: {
          headers: {
            "x-apollo-operation-name": "CreateProductOrder",
            "apollo-require-preflight": "true",
            "content-type": "application/json"
          }
        }
      });

      // Order created successfully, no need for verification
      if (result.data?.createProductOrder?.id) {
        console.log("Order created successfully:", result.data.createProductOrder);
      }
    } catch (error: any) {
      console.error("Create Order Error:", error);
    }
    console.groupEnd();
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={productsModuleConfig} />

      <Container maxW="container.xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          <Card
            bg={getColor("background.card", colorMode)}
            boxShadow={getComponent("card", "shadow")}
            border="1px"
            borderColor={getColor("border.light", colorMode)}
            borderRadius="xl"
            overflow="hidden"
          >
            <CardHeader bg={getColor("background.light", colorMode)} borderBottom="1px" borderColor={getColor("border.light", colorMode)}>
              <HStack justify="space-between" align="center" wrap="wrap">
                <VStack align="start" spacing={2}>
                  <Text
                    fontSize="sm"
                    color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    fontFamily={brandConfig.fonts.body}
                  >
                    Shopping Cart
                  </Text>
                  <Heading size="lg" color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.heading}>
                    Your Items
                  </Heading>
                </VStack>
              </HStack>
            </CardHeader>

            <CardBody p={8}>
              {cartLoading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="xl" />
                </Box>
              ) : cartError ? (
                <Box p={4} borderRadius="md" bg={getColor("status.error", colorMode)} color={getColor("text.inverse", colorMode)}>
                  <Text>Error loading cart: {cartError.message}</Text>
                </Box>
              ) : !cartId || !cartData?.cart?.items?.length ? (
                <Box p={8} textAlign="center">
                  <Box
                    as={FiShoppingCart}
                    size="48px"
                    color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)}
                    mb={4}
                    mx="auto"
                  />
                  <Text fontSize="lg" mb={4} color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>
                    Your cart is empty
                  </Text>
                  <Button
                    bg={getComponent("button", "primaryBg")}
                    color={getColor("text.inverse", colorMode)}
                    _hover={{ bg: getComponent("button", "primaryHover") }}
                    size="lg"
                    onClick={() => window.location.href = "/products"}
                    leftIcon={<FiShoppingCart />}
                    fontFamily={brandConfig.fonts.body}
                  >
                    Browse Products
                  </Button>
                </Box>
              ) : (
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4}>
                  <GridItem>
                    <Box overflowX="auto" mx={-4} px={4}>
                      <Table variant="simple" size={{ base: "sm", md: "md" }}>
                        <Thead>
                          <Tr>
                            <Th color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Product</Th>
                            <Th display={{ base: "none", md: "table-cell" }} color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Variant</Th>
                            <Th color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Qty</Th>
                            <Th display={{ base: "none", md: "table-cell" }} color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Price</Th>
                            <Th color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Total</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {cartData.cart.items.map((item: CartItem) => {
                            const selectedVariant = item.selectedVariantId
                              ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                              : null;

                            const price = selectedVariant ? selectedVariant.price : item.product.price;
                            const variantTitle = selectedVariant ? selectedVariant.title : "Base Product";

                            return (
                              <Tr key={item.id}>
                                <Td fontWeight="medium" fontSize={{ base: "sm", md: "md" }} color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>
                                  {item.product.name}
                                  <Text
                                    display={{ base: "block", md: "none" }}
                                    fontSize="xs"
                                    color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}
                                    mt={1}
                                    fontFamily={brandConfig.fonts.body}
                                  >
                                    {variantTitle}
                                  </Text>
                                </Td>
                                <Td display={{ base: "none", md: "table-cell" }}>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {variantTitle}
                                  </Badge>
                                </Td>
                                <Td color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>{item.quantity}</Td>
                                <Td display={{ base: "none", md: "table-cell" }} color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>${price.toFixed(2)}</Td>
                                <Td fontWeight="bold" color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>${(item.quantity * price).toFixed(2)}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  </GridItem>

                  <GridItem>
                    <Box
                      p={{ base: 4, md: 6 }}
                      bg={getColor("background.light", colorMode)}
                      borderRadius="xl"
                      border="1px"
                      borderColor={getColor("border.light", colorMode)}
                    >
                      <Text fontWeight="semibold" fontSize="lg" mb={4} color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.heading}>
                        Order Summary
                      </Text>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Subtotal</Text>
                            <Text fontWeight="bold" color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>
                              ${cartData.cart.items.reduce((total: number, item: CartItem) => {
                                const selectedVariant = item.selectedVariantId
                                  ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                                  : null;
                                const price = selectedVariant ? selectedVariant.price : item.product.price;
                                return total + (item.quantity * price);
                              }, 0).toFixed(2)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" mb={4}>
                            <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Shipping</Text>
                            <Text color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.body}>Calculated at checkout</Text>
                          </HStack>
                          <Box pt={4} borderTopWidth={1} borderColor={getColor("border.light", colorMode)}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold" color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.heading}>Total</Text>
                              <Text fontSize="xl" fontWeight="bold" color={getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode)} fontFamily={brandConfig.fonts.heading}>
                                ${cartData.cart.items.reduce((total: number, item: CartItem) => {
                                  const selectedVariant = item.selectedVariantId
                                    ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                                    : null;
                                  const price = selectedVariant ? selectedVariant.price : item.product.price;
                                  return total + (item.quantity * price);
                                }, 0).toFixed(2)}
                              </Text>
                            </HStack>
                          </Box>
                        </Box>
                        <VStack spacing={3}>
                          <Button
                            bg={getComponent("button", "primaryBg")}
                            color={getColor("text.inverse", colorMode)}
                            _hover={{ bg: getComponent("button", "primaryHover") }}
                            size="lg"
                            width="full"
                            leftIcon={<FiCreditCard />}
                            onClick={handleCheckout}
                            isLoading={createOrderLoading}
                            fontFamily={brandConfig.fonts.body}
                          >
                            Proceed to Checkout
                          </Button>
                          <Button
                            variant="ghost"
                            color={getColor("status.error", colorMode)}
                            _hover={{ bg: getColor("status.error", colorMode), color: getColor("text.inverse", colorMode) }}
                            width="full"
                            leftIcon={<FiTrash2 />}
                            onClick={handleDeleteCart}
                            isLoading={deleteLoading}
                            fontFamily={brandConfig.fonts.body}
                          >
                            Clear Cart
                          </Button>
                        </VStack>
                      </VStack>
                    </Box>
                  </GridItem>
                </Grid>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default Cart; 