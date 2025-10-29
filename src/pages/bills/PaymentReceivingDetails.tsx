import React from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Card,
    CardHeader,
    CardBody,
    Button,
    Badge,
    SimpleGrid,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Center,
    Flex,
} from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";

/**
 * 📊 DATABASE STORAGE STRUCTURE
 *
 * This payment receiving information is stored in the MongoDB database as part of the Tenant model:
 *
 * Collection: tenants
 * Field: paymentReceivingDetails (embedded object)
 *
 * Structure:
 * Tenant {
 *   id: String
 *   ...other tenant fields...
 *   paymentReceivingDetails: {
 *     acceptedMethods: String[] // ["BANK_TRANSFER", "CRYPTO", "STRIPE", "PAYPAL"]
 *     isVerified: Boolean
 *
 *     bankAccount: {
 *       accountName: String    // e.g., "Thomas Miller"
 *       bsb: String           // e.g., "772772"
 *       accountNumber: String // e.g., "123456789"
 *       bankName: String      // Optional: e.g., "Commonwealth Bank"
 *       swiftCode: String     // Optional: for international transfers
 *     }
 *
 *     cryptoWallets: [{
 *       network: String       // e.g., "BTC", "ETH", "USDT"
 *       walletAddress: String // The crypto wallet address
 *       memo: String         // Optional: memo/tag for certain networks
 *     }]
 *
 *     cryptoDiscountPercentage: Number // e.g., 20 for 20% discount
 *
 *     stripeConnect: {
 *       stripeAccountId: String // Connected Stripe account ID
 *       accountVerified: Boolean
 *       verifiedAt: Date
 *     }
 *
 *     paypalEmail: String // PayPal email address
 *   }
 * }
 *
 * This data is stored on the Tenant record (company-wide), not per-client.
 * All bills from this business will use the same payment receiving details.
 */

const GET_CURRENT_TENANT = gql`
    query GetCurrentTenant {
        currentTenant {
            id
            name
            paymentReceivingDetails {
                acceptedMethods
                bankAccount {
                    accountName
                    bsb
                    accountNumber
                    bankName
                    swiftCode
                }
                cryptoWallets {
                    walletAddress
                    network
                    memo
                }
                stripeConnect {
                    stripeAccountId
                    accountVerified
                    verifiedAt
                }
                paypalEmail
                isVerified
                cryptoDiscountPercentage
            }
        }
    }
`;

const PaymentReceivingDetails = () => {
    usePageTitle("Payment Receiving Details");
    const navigate = useNavigate();
    const toast = useToast();
    const bg = getColor("background.main");

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    const { data, loading, error } = useQuery(GET_CURRENT_TENANT);

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
                <Container maxW="container.xl" py={12} flex="1">
                    <Center h="50vh">
                        <Spinner size="xl" color={getColor("primary")} />
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
                <Container maxW="container.xl" py={12} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        Error loading payment details. Please try again.
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const tenant = data?.currentTenant;
    const paymentDetails = tenant?.paymentReceivingDetails;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={billsModuleConfig} />

            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Page Header */}
                    <HStack justify="space-between" align="center" flexWrap="wrap" spacing={4}>
                        <VStack align="start" spacing={2}>
                            <Heading size="lg" color={textPrimary}>💳 Payment Receiving Details</Heading>
                            <Text fontSize="sm" color={textMuted}>
                                Manage how you receive payments from your clients
                            </Text>
                        </VStack>
                        
                        <Button
                            onClick={() => navigate("/bills/payment-details/edit")}
                            bg="white"
                            color="black"
                            _hover={{
                                bg: "gray.100",
                                transform: "translateY(-2px)"
                            }}
                            leftIcon={<EditIcon />}
                        >
                            Edit Payment Details
                        </Button>
                    </HStack>

                    {/* Main Payment Details Card */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        borderWidth="1px"
                        borderColor={cardBorder}
                        overflow="hidden">
                        <CardBody>
                            {paymentDetails ? (
                                <VStack align="stretch" spacing={6}>
                                    {/* Payment Status */}
                                    {paymentDetails.acceptedMethods?.length > 0 && (
                                        <Box p={4} bg="rgba(34, 197, 94, 0.1)" borderRadius="md" borderWidth="1px" borderColor="rgba(34, 197, 94, 0.3)">
                                            <HStack spacing={2}>
                                                <Badge 
                                                    bg="rgba(34, 197, 94, 0.2)"
                                                    color="#22C55E"
                                                    border="1px solid"
                                                    borderColor="rgba(34, 197, 94, 0.3)"
                                                    fontSize="sm"
                                                    px={3}
                                                    py={1}
                                                >
                                                    ✅ Payment Methods Active
                                                </Badge>
                                                <Text fontSize="sm" color={textMuted}>
                                                    Ready to receive payments via {paymentDetails.acceptedMethods.length} method{paymentDetails.acceptedMethods.length > 1 ? 's' : ''}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    )}

                                    {/* Accepted Methods */}
                                    <Box>
                                        <Heading size="sm" mb={3} color={textPrimary}>Accepted Payment Methods</Heading>
                                        {paymentDetails.acceptedMethods?.length > 0 ? (
                                            <Flex wrap="wrap" gap={2}>
                                                {paymentDetails.acceptedMethods.map((method: string) => (
                                                    <Badge 
                                                        key={method} 
                                                        bg="rgba(59, 130, 246, 0.2)" 
                                                        color="#3B82F6" 
                                                        border="1px solid" 
                                                        borderColor="rgba(59, 130, 246, 0.3)"
                                                        fontSize="sm"
                                                        px={3}
                                                        py={1}
                                                    >
                                                        {method === "BANK_TRANSFER" ? "🏦 Bank Transfer" :
                                                         method === "CRYPTO" ? "₿ Cryptocurrency" :
                                                         method === "STRIPE" ? "💳 Credit Cards" :
                                                         method === "PAYPAL" ? "💰 PayPal" : method}
                                                    </Badge>
                                                ))}
                                            </Flex>
                                        ) : (
                                            <Text color={textMuted}>No payment methods configured</Text>
                                        )}
                                    </Box>

                                    {/* Bank Account Details */}
                                    {paymentDetails.bankAccount && (
                                        <Box p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                                            <Heading size="sm" mb={3} color={textPrimary}>🏦 Bank Account Details</Heading>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Account Name</Text>
                                                    <Text color={textPrimary}>{paymentDetails.bankAccount.accountName}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>BSB</Text>
                                                    <Text color={textPrimary}>{paymentDetails.bankAccount.bsb}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Account Number</Text>
                                                    <Text color={textPrimary}>****{paymentDetails.bankAccount.accountNumber.slice(-4)}</Text>
                                                </Box>
                                                {paymentDetails.bankAccount.bankName && (
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>Bank Name</Text>
                                                        <Text color={textPrimary}>{paymentDetails.bankAccount.bankName}</Text>
                                                    </Box>
                                                )}
                                            </SimpleGrid>
                                        </Box>
                                    )}

                                    {/* Crypto Wallets */}
                                    {paymentDetails.cryptoWallets?.length > 0 && (
                                        <Box p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                                            <Heading size="sm" mb={3} color={textPrimary}>₿ Cryptocurrency Wallets</Heading>
                                            <VStack align="stretch" spacing={3}>
                                                {paymentDetails.cryptoWallets.map((wallet: any, index: number) => (
                                                    <Box key={index} p={3} bg="rgba(0, 0, 0, 0.3)" borderRadius="md">
                                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                                            <Box>
                                                                <Text fontSize="xs" fontWeight="semibold" color={textSecondary}>Network</Text>
                                                                <Badge bg="rgba(168, 85, 247, 0.2)" color="#A855F7" border="1px solid" borderColor="rgba(168, 85, 247, 0.3)">
                                                                    {wallet.network}
                                                                </Badge>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="xs" fontWeight="semibold" color={textSecondary}>Address</Text>
                                                                <Text fontFamily="mono" fontSize="sm" color={textPrimary} isTruncated>
                                                                    {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-8)}
                                                                </Text>
                                                            </Box>
                                                            {wallet.memo && (
                                                                <Box>
                                                                    <Text fontSize="xs" fontWeight="semibold" color={textSecondary}>Memo</Text>
                                                                    <Text fontSize="sm" color={textPrimary}>{wallet.memo}</Text>
                                                                </Box>
                                                            )}
                                                        </SimpleGrid>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Crypto Discount */}
                                    {paymentDetails.cryptoDiscountPercentage && (
                                        <Box 
                                            p={4} 
                                            bgGradient="linear(to-r, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))"
                                            borderRadius="md" 
                                            borderWidth="1px" 
                                            borderColor="rgba(168, 85, 247, 0.3)"
                                        >
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" color={textPrimary}>💸 Crypto Payment Discount</Text>
                                                    <Text fontSize="sm" color={textSecondary}>
                                                        Customers save {paymentDetails.cryptoDiscountPercentage}% when paying with cryptocurrency
                                                    </Text>
                                                </VStack>
                                                <Badge 
                                                    fontSize="xl" 
                                                    px={4} 
                                                    py={2}
                                                    bg="rgba(168, 85, 247, 0.2)" 
                                                    color="#A855F7" 
                                                    border="2px solid" 
                                                    borderColor="rgba(168, 85, 247, 0.5)"
                                                >
                                                    {paymentDetails.cryptoDiscountPercentage}% OFF
                                                </Badge>
                                            </HStack>
                                        </Box>
                                    )}

                                    {/* Stripe Connect Status */}
                                    {paymentDetails.stripeConnect?.stripeAccountId && (
                                        <Box p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                                            <HStack spacing={2} mb={2}>
                                                <Text fontWeight="bold" color={textPrimary}>💳 Stripe Connect</Text>
                                                <Badge 
                                                    bg={paymentDetails.stripeConnect.accountVerified ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 191, 36, 0.2)"}
                                                    color={paymentDetails.stripeConnect.accountVerified ? "#22C55E" : "#FBBF24"}
                                                    border="1px solid"
                                                    borderColor={paymentDetails.stripeConnect.accountVerified ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 191, 36, 0.3)"}
                                                >
                                                    {paymentDetails.stripeConnect.accountVerified ? "Verified" : "Pending"}
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="sm" color={textSecondary}>
                                                Account ID: <Text as="span" fontFamily="mono">{paymentDetails.stripeConnect.stripeAccountId}</Text>
                                            </Text>
                                            {paymentDetails.stripeConnect.verifiedAt && (
                                                <Text fontSize="sm" color={textMuted}>
                                                    Verified on: {new Date(paymentDetails.stripeConnect.verifiedAt).toLocaleDateString()}
                                                </Text>
                                            )}
                                        </Box>
                                    )}

                                    {/* PayPal */}
                                    {paymentDetails.paypalEmail && (
                                        <Box p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
                                            <Text fontWeight="bold" mb={2} color={textPrimary}>💰 PayPal</Text>
                                            <Text color={textSecondary}>
                                                Email: <Text as="span" color={textPrimary}>{paymentDetails.paypalEmail}</Text>
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            ) : (
                                <VStack spacing={4} py={8} textAlign="center">
                                    <Text color={textMuted}>No payment details configured</Text>
                                    <Text fontSize="sm" color={textMuted}>
                                        Set up your payment receiving details to start accepting payments from clients.
                                    </Text>
                                    <Button
                                        onClick={() => navigate("/bills/payment-details/edit")}
                                        colorScheme="blue"
                                    >
                                        Configure Payment Details
                                    </Button>
                                </VStack>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default PaymentReceivingDetails;