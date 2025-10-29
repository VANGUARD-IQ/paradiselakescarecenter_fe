import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Container,
  VStack,
  Heading,
  Box,
  Button,
  Text,
  Code,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { JWTDebugger } from "../../components/JWTDebugger";

const CREATE_CART = gql`
  mutation CreateCart {
    createCart {
      id
      items {
        id
        product {
          id
          name
        }
        quantity
      }
      createdAt
      expiresAt
    }
  }
`;

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

const GET_ME = gql`
  query Me {
    me {
      id
      email
      fName
      lName
      role
    }
  }
`;

const GET_ACTIVE_CART = gql`
  query ActiveCartByClient {
    activeCartByClient {
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

// Add interfaces for type safety
interface ProductVariant {
  variantId: string;
  title: string;
  price: number;
}

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    variants?: ProductVariant[];
  };
  quantity: number;
  selectedVariantId?: string;
}

const TestClientCart = () => {
  const [cartId, setCartId] = useState<string | null>(localStorage.getItem("cart_id"));
  const toast = useToast();

  // Query for current user
  const { loading: meLoading, error: meError, data: meData } = useQuery(GET_ME);

  // Query for active cart
  const { loading: activeCartLoading, error: activeCartError, data: activeCartData, refetch: refetchActiveCart } = useQuery(GET_ACTIVE_CART);

  // Query for existing cart by ID
  const { loading: cartLoading, error: cartError, data: cartData, refetch: refetchCart } = useQuery(GET_CART, {
    variables: { cartId },
    skip: !cartId,
  });

  // Mutation for creating new cart
  const [createCart, { loading: createLoading }] = useMutation(CREATE_CART, {
    onCompleted: (data) => {
      const newCartId = data.createCart.id;
      localStorage.setItem("cart_id", newCartId);
      setCartId(newCartId);
      toast({
        title: "Cart created",
        description: `New cart ID: ${newCartId}`,
        status: "success",
        duration: 5000,
      });
      refetchActiveCart();
    },
    onError: (error) => {
      toast({
        title: "Error creating cart",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [deleteCart, { loading: deleteLoading }] = useMutation(DELETE_CART, {
    onCompleted: () => {
      localStorage.removeItem("cart_id");
      setCartId(null);
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

  const handleCreateCart = () => {
    createCart();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading state while fetching user data
  if (meLoading) {
    return (
      <>
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Heading>Test Client Cart</Heading>
            <Spinner />
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </>
    );
  }

  // Show error if user data fetch fails
  if (meError) {
    return (
      <>
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Heading>Test Client Cart</Heading>
            <Text color="red.500">Error loading user data: {meError.message}</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </>
    );
  }

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>Test Client Cart</Heading>

          {/* User Info */}
          <Box p={4} borderWidth={1} borderRadius="md">
            <Heading size="md" mb={4}>Client Information</Heading>
            <VStack align="start" spacing={2}>
              <Text><strong>ID:</strong> {meData?.me?.id}</Text>
              <Text><strong>Email:</strong> {meData?.me?.email}</Text>
              <Text><strong>Name:</strong> {meData?.me?.fName} {meData?.me?.lName}</Text>
              <Text><strong>Role:</strong> {meData?.me?.role}</Text>
            </VStack>
          </Box>

          {/* Cart Status Section */}
          <Box p={4} borderWidth={1} borderRadius="md">
            <Heading size="md" mb={4}>Cart Status</Heading>
            {cartLoading || activeCartLoading ? (
              <Spinner />
            ) : cartError || activeCartError ? (
              <Text color="red.500">Error: {cartError?.message || activeCartError?.message}</Text>
            ) : activeCartData?.activeCartByClient ? (
              // Show active cart data
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Cart ID:</Text>
                  <Code>{cartData?.cart.id}</Code>
                </Box>
                <Box>
                  <Text fontWeight="bold">Client:</Text>
                  <Text>{cartData?.cart.client.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Created:</Text>
                  <Text>{formatDate(cartData?.cart.createdAt)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Expires:</Text>
                  <Text>{formatDate(cartData?.cart.expiresAt)}</Text>
                </Box>

                {/* Cart Items Table */}
                {cartData?.cart.items?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>Cart Items</Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th>Variant</Th>
                          <Th>Quantity</Th>
                          <Th>Price</Th>
                          <Th>Total</Th>
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
                              <Td>{item.product.name}</Td>
                              <Td>{variantTitle}</Td>
                              <Td>{item.quantity}</Td>
                              <Td>${price.toFixed(2)}</Td>
                              <Td>${(item.quantity * price).toFixed(2)}</Td>
                            </Tr>
                          );
                        })}
                        <Tr>
                          <Td colSpan={4} fontWeight="bold" textAlign="right">Total:</Td>
                          <Td fontWeight="bold">
                            ${cartData.cart.items.reduce((total: number, item: CartItem) => {
                              const selectedVariant = item.selectedVariantId 
                                ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                                : null;
                              const price = selectedVariant ? selectedVariant.price : item.product.price;
                              return total + (item.quantity * price);
                            }, 0).toFixed(2)}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                )}

                <Button
                  colorScheme="red"
                  onClick={() => {
                    if (cartId) {
                      deleteCart({ variables: { cartId } });
                    }
                  }}
                  isLoading={deleteLoading}
                >
                  Delete Cart
                </Button>
              </VStack>
            ) : !cartId ? (
              <VStack align="start" spacing={4}>
                <Text>No active cart found</Text>
                <Button
                  colorScheme="blue"
                  onClick={handleCreateCart}
                  isLoading={createLoading}
                >
                  Create New Cart
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Cart ID:</Text>
                  <Code>{cartData?.cart.id}</Code>
                </Box>
                <Box>
                  <Text fontWeight="bold">Client:</Text>
                  <Text>{cartData?.cart.client.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Created:</Text>
                  <Text>{formatDate(cartData?.cart.createdAt)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Expires:</Text>
                  <Text>{formatDate(cartData?.cart.expiresAt)}</Text>
                </Box>

                {/* Cart Items Table */}
                {cartData?.cart.items?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>Cart Items</Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th>Variant</Th>
                          <Th>Quantity</Th>
                          <Th>Price</Th>
                          <Th>Total</Th>
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
                              <Td>{item.product.name}</Td>
                              <Td>{variantTitle}</Td>
                              <Td>{item.quantity}</Td>
                              <Td>${price.toFixed(2)}</Td>
                              <Td>${(item.quantity * price).toFixed(2)}</Td>
                            </Tr>
                          );
                        })}
                        <Tr>
                          <Td colSpan={4} fontWeight="bold" textAlign="right">Total:</Td>
                          <Td fontWeight="bold">
                            ${cartData.cart.items.reduce((total: number, item: CartItem) => {
                              const selectedVariant = item.selectedVariantId 
                                ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                                : null;
                              const price = selectedVariant ? selectedVariant.price : item.product.price;
                              return total + (item.quantity * price);
                            }, 0).toFixed(2)}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                )}

                <Button
                  colorScheme="red"
                  onClick={() => {
                    if (cartId) {
                      deleteCart({ variables: { cartId } });
                    }
                  }}
                  isLoading={deleteLoading}
                >
                  Delete Cart
                </Button>
              </VStack>
            )}
          </Box>

          <JWTDebugger />
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default TestClientCart; 