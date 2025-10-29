import React from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  Divider,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiCreditCard } from "react-icons/fi";

interface ProductVariant {
  variantId: string;
  title: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  variants?: ProductVariant[];
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariantId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

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
          variants {
            variantId
            title
            price
          }
        }
        quantity
        selectedVariantId
      }
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

export const CartPreview = () => {
  const { data, loading } = useQuery(GET_ACTIVE_CART, {
    fetchPolicy: "network-only", // This ensures we always get fresh data
  });
  
  // console.log('CartPreview - Render', {
  //   loading,
  //   data,
  //   hasActiveCart: !!data?.activeCartByClient
  // });

  // Don't show anything if there's no active cart
  if (loading) {
    // console.log('CartPreview - Loading state');
    return null;
  }

  if (!data?.activeCartByClient) {
    // console.log('CartPreview - No active cart found');
    return null;
  }

  const cartId = data.activeCartByClient.id;
  // console.log('CartPreview - Active cart found:', { cartId });

  const cardBg = "rgba(255, 255, 255, 0.98)";

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={999}
    >
      <Popover placement="top-end" trigger="hover">
        <PopoverTrigger>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              aria-label="Cart"
              icon={<FiShoppingCart />}
              colorScheme="blue"
              size="lg"
              rounded="full"
              boxShadow="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "xl"
              }}
            />
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          border="none"
          borderRadius="xl"
          boxShadow="xl"
          bg={cardBg}
          backdropFilter="blur(10px)"
          p={2}
          width="320px"
        >
          <PopoverArrow bg={cardBg} />
          <PopoverCloseButton />
          <PopoverHeader
            borderBottomWidth="0"
            fontWeight="semibold"
            fontSize="lg"
            pt={4}
            pb={2}
          >
            Your Cart
          </PopoverHeader>
          <PopoverBody p={0}>
            <CartContent cartId={cartId} />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

const CartContent = ({ cartId }: { cartId: string }) => {
  const { data, loading } = useQuery<{ cart: Cart }>(GET_CART, {
    variables: { cartId },
  });

  // console.log('CartContent - Render', {
  //   cartId,
  //   loading,
  //   hasData: !!data,
  //   itemsCount: data?.cart?.items?.length
  // });

  if (loading) return (
    <Box p={4} textAlign="center">
      <Spinner size="md" color="blue.500" />
    </Box>
  );

  if (!data?.cart?.items?.length) {
    return (
      <Box p={6} textAlign="center">
        <Box
          as={FiShoppingCart}
          size="24px"
          color="gray.300"
          mb={3}
          mx="auto"
        />
        <Text color="gray.500">Your cart is empty</Text>
      </Box>
    );
  }

  return (
    <Card variant="unstyled">
      <CardBody p={4}>
        <VStack align="stretch" spacing={4}>
          {React.createElement(AnimatePresence as any, {},
            data.cart.items.map((item: CartItem) => {
              const selectedVariant = item.selectedVariantId
                ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                : null;

              const price = selectedVariant ? selectedVariant.price : item.product.price;
              const variantTitle = selectedVariant ? selectedVariant.title : "Base Product";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {item.product.name}
                      </Text>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        fontSize="xs"
                      >
                        {variantTitle}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        Qty: {item.quantity} × ${price.toFixed(2)}
                      </Text>
                    </VStack>
                    <Text fontWeight="semibold" fontSize="sm">
                      ${(item.quantity * price).toFixed(2)}
                    </Text>
                  </HStack>
                </motion.div>
              );
            }))}

          <Divider />

          <HStack justify="space-between">
            <Text fontWeight="semibold">Total</Text>
            <Text fontWeight="bold" fontSize="lg">
              ${data.cart.items.reduce((total: number, item: CartItem) => {
                const selectedVariant = item.selectedVariantId 
                  ? item.product.variants?.find(v => v.variantId === item.selectedVariantId)
                  : null;
                const price = selectedVariant ? selectedVariant.price : item.product.price;
                return total + (item.quantity * price);
              }, 0).toFixed(2)}
            </Text>
          </HStack>

          <VStack spacing={2}>
            <Button
              colorScheme="blue"
              size="sm"
              width="full"
              leftIcon={<FiCreditCard />}
              onClick={() => window.location.href = "/cart"}
            >
              View Cart & Checkout
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}; 