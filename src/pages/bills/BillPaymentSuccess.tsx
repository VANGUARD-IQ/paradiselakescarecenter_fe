import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon,
  Icon,
  Divider,
  SimpleGrid,
  Badge,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { CheckCircleIcon, DownloadIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { brandConfig, getColor } from "../../brandConfig";
import * as confettiLib from "canvas-confetti";

const confetti = confettiLib.default || confettiLib;

const GET_BILL = gql`
  query GetBillById($id: ID!) {
    bill(id: $id) {
      id
      isPaid
      status
      paymentMethod
      currency
      projectId
      totalAmount
      lineItems {
        id
        description
        amount
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_CLIENT_BY_BILL = gql`
  query GetClientDetailsByBillId($billId: ID!) {
    getClientDetailsByBillId(billId: $billId) {
      id
      fName
      lName
      email
      businessName
    }
  }
`;

const BillPaymentSuccess = () => {
  usePageTitle("Payment Success");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Brand colors with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  const { data: billData, loading: billLoading } = useQuery(GET_BILL, {
    variables: { id },
  });

  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_BY_BILL, {
    variables: { billId: id },
  });

  // Trigger confetti animation on mount
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const bill = billData?.bill;
  const client = clientData?.getClientDetailsByBillId;

  const getDisplayBillId = (fullId: string) => {
    return fullId.substring(0, 4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box minH="100vh" bg={bg}>
      <NavbarWithCallToAction />
      
      <Container maxW="container.lg" py={12}>
        <VStack spacing={8} align="stretch">
          {/* Success Header */}
          <VStack spacing={4} textAlign="center">
            <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
            <Heading size="2xl" color={brandConfig.colors.text.inverse}>
              Payment Successful!
            </Heading>
            <Text fontSize="lg" color={textSecondary}>
              Thank you for your payment. Your transaction has been completed successfully.
            </Text>
          </VStack>

          {/* Payment Details Card */}
          <Card
            bg={cardGradientBg}
            borderColor={cardBorder}
            borderWidth="1px"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={textPrimary}>
                  Payment Receipt
                </Heading>
                <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                  PAID
                </Badge>
              </HStack>
            </CardHeader>

            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Transaction Summary */}
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color={textSecondary} mb={2}>
                    TRANSACTION SUMMARY
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color={textSecondary}>Invoice Number</Text>
                      <Text fontSize="lg" fontWeight="bold" color={brandConfig.colors.text.inverse}>
                        #{bill ? getDisplayBillId(bill.id) : "..."}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textSecondary}>Amount Paid</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.400">
                        ${bill?.totalAmount?.toFixed(2) || "0.00"} {bill?.currency || "AUD"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textSecondary}>Payment Date</Text>
                      <Text fontSize="md" color={brandConfig.colors.text.inverse}>
                        {formatDate(new Date().toISOString())}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={textSecondary}>Payment Method</Text>
                      <Text fontSize="md" color={brandConfig.colors.text.inverse}>
                        Credit/Debit Card (Stripe)
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Customer Information */}
                {client && (
                  <>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color={textSecondary} mb={2}>
                        CUSTOMER INFORMATION
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color={textSecondary}>Name</Text>
                          <Text fontSize="md" color={brandConfig.colors.text.inverse}>
                            {client.fName} {client.lName}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color={textSecondary}>Email</Text>
                          <Text fontSize="md" color={brandConfig.colors.text.inverse}>
                            {client.email}
                          </Text>
                        </Box>
                        {client.businessName && (
                          <Box>
                            <Text fontSize="sm" color={textSecondary}>Business</Text>
                            <Text fontSize="md" color={brandConfig.colors.text.inverse}>
                              {client.businessName}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Line Items */}
                {bill?.lineItems && bill.lineItems.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color={textSecondary} mb={2}>
                      ITEMS PAID
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {bill.lineItems.map((item: any) => (
                        <HStack key={item.id} justify="space-between" p={2}>
                          <Text color={brandConfig.colors.text.inverse}>{item.description}</Text>
                          <Text fontWeight="bold" color={brandConfig.colors.text.inverse}>
                            ${item.amount.toFixed(2)}
                          </Text>
                        </HStack>
                      ))}
                      <Divider />
                      <HStack justify="space-between" p={2}>
                        <Text fontWeight="bold" color={brandConfig.colors.text.inverse}>
                          Total Paid
                        </Text>
                        <Text fontWeight="bold" fontSize="lg" color="green.400">
                          ${bill.totalAmount?.toFixed(2) || "0.00"} {bill?.currency || "AUD"}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {/* Confirmation Notice */}
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Payment Confirmed</Text>
                    <Text fontSize="sm">
                      A confirmation email has been sent to your registered email address with the payment details.
                    </Text>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <HStack spacing={4} justify="center">
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              onClick={() => navigate(`/bill/${id}`)}
              colorScheme="gray"
            >
              Back to Bill
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="blue"
              onClick={() => {
                navigate(`/bill/${id}/preview`);
              }}
            >
              Download Receipt
            </Button>
          </HStack>

          {/* Additional Information */}
          <Card
            bg={cardGradientBg}
            borderColor={cardBorder}
            borderWidth="1px"
          >
            <CardBody>
              <VStack spacing={3} align="start">
                <Text fontWeight="bold" color={textPrimary}>
                  What's Next?
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  • Your payment has been processed and the bill is now marked as paid
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  • You will receive a confirmation email shortly with your receipt
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  • You can download a PDF copy of your receipt at any time from the bill details page
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  • If you have any questions, please contact our support team
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default BillPaymentSuccess;