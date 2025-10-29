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
    Divider,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Image,
    Center,
    Flex,
} from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { EditIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent } from "../../brandConfig";

const GET_CLIENT = gql`
    query GetClient($id: ID!) {
        client(id: $id) {
            id
            tenantId
            createdAt
            updatedAt
            fName
            lName
            email
            phoneNumber
            role
            isVerifiedSeller
            businessName
            businessRegistrationNumber
            profilePhoto
            shippingAddresses {
                name
                phone
                address {
                    street
                    city
                    state
                    postcode
                    country
                }
                isDefault
                instructions
            }
            billingAddresses {
                name
                phone
                address {
                    street
                    city
                    state
                    postcode
                    country
                }
                isDefault
                instructions
            }
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
            permissions
        }
    }
`;

const ViewProfile = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const bg = getColor("background.main");
    
    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");
    const accentBlue = getColor("accentBlue");

    const { data, loading, error } = useQuery(GET_CLIENT, {
        variables: { id: user?.id },
        skip: !user?.id
    });

    if (loading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 12 }} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading profile details...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !data?.client) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 12 }} flex="1">
                    <Alert status="error">
                        <AlertIcon />
                        <Box>
                            <Text fontWeight="bold">Error Loading Profile</Text>
                            <Text fontSize={{ base: "sm", md: "md" }}>
                                {error?.message || "Profile not found"}
                            </Text>
                        </Box>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const client = data.client;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 12 }} flex="1">
                <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                    {/* Header - Responsive layout that stacks on mobile */}
                    <VStack spacing={4} align="stretch">
                        <VStack align="start" spacing={2}>
                            <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>👤 My Profile</Heading>
                            <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                                Client ID: <Text as="span" fontFamily="mono" color={textSecondary}>{client.id}</Text>
                            </Text>
                            <Box>
                                <Flex wrap="wrap" gap={2}>
                                    <Badge bg="rgba(168, 85, 247, 0.2)" color="#A855F7" border="1px solid" borderColor="rgba(168, 85, 247, 0.3)" fontSize={{ base: "xs", md: "sm" }}>{client.role}</Badge>
                                    {client.permissions?.map((permission: string) => (
                                        <Badge key={permission} bg="rgba(59, 130, 246, 0.2)" color="#3B82F6" border="1px solid" borderColor="rgba(59, 130, 246, 0.3)" whiteSpace="nowrap" fontSize={{ base: "xs", md: "sm" }}>
                                            {permission}
                                        </Badge>
                                    ))}
                                </Flex>
                            </Box>
                        </VStack>
                        
                        {/* Mobile-responsive button container */}
                        <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                            <Button
                                onClick={() => navigate("/profile/edit")}
                                bg="white"
                                color="black"
                                width={{ base: "100%", md: "auto" }}
                                minW={{ md: "140px" }}
                                size={{ base: "md", md: "lg" }}
                                _hover={{
                                    bg: "gray.100",
                                    transform: "translateY(-2px)"
                                }}
                                leftIcon={<EditIcon />}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </VStack>

                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, md: 8 }}>
                        {/* Profile Photo Card */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            borderWidth="1px"
                            borderColor={cardBorder}
                            overflow="hidden">
                            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                                <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>Profile Photo</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4} align="center">
                                    <Box
                                        position="relative"
                                        width={{ base: "150px", md: "200px" }}
                                        height={{ base: "150px", md: "200px" }}
                                        borderRadius="full"
                                        overflow="hidden"
                                        border="3px solid"
                                        borderColor={accentBlue}
                                    >
                                        {client.profilePhoto ? (
                                            <Image
                                                src={client.profilePhoto}
                                                alt={`${client.fName} ${client.lName}`}
                                                width="100%"
                                                height="100%"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <Center
                                                width="100%"
                                                height="100%"
                                                bg="rgba(59, 130, 246, 0.1)"
                                            >
                                                <Text fontSize={{ base: "4xl", md: "6xl" }} color={textPrimary}>
                                                    {client.fName?.[0]?.toUpperCase() || ""}
                                                    {client.lName?.[0]?.toUpperCase() || ""}
                                                </Text>
                                            </Center>
                                        )}
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Personal Information */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            borderWidth="1px"
                            borderColor={cardBorder}
                            overflow="hidden">
                            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                                <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>Personal Information</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={textPrimary}>Name</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>{client.fName} {client.lName}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={textPrimary}>Email</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>{client.email}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={textPrimary}>Phone</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>{client.phoneNumber}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={textPrimary}>Member Since</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>{new Date(client.createdAt).toLocaleDateString()}</Text>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Shipping Addresses */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            borderWidth="1px"
                            borderColor={cardBorder}
                            overflow="hidden">
                            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                                <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                                    <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>Shipping Addresses</Heading>
                                    <Button
                                        size={{ base: "xs", md: "sm" }}
                                        onClick={() => navigate("/profile/shipping")}
                                        bg="white"
                                        color="black"
                                        _hover={{
                                            bg: "gray.100",
                                            transform: "translateY(-1px)"
                                        }}
                                    >
                                        Manage
                                    </Button>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <VStack align="stretch" spacing={4}>
                                    {client.shippingAddresses?.length > 0 ? (
                                        client.shippingAddresses.map((address: any, index: number) => (
                                            <Box key={index} p={4} border="1px" borderColor={cardBorder} borderRadius="md" bg="rgba(0, 0, 0, 0.2)">
                                                <HStack justify="space-between" mb={2}>
                                                    <Text fontWeight="bold" color={textPrimary}>{address.name}</Text>
                                                    {address.isDefault && (
                                                        <Badge bg="rgba(34, 197, 94, 0.2)" color="#22C55E" border="1px solid" borderColor="rgba(34, 197, 94, 0.3)">Default</Badge>
                                                    )}
                                                </HStack>
                                                <Text color={textSecondary}>{address.address.street}</Text>
                                                <Text color={textSecondary}>{address.address.city}, {address.address.state} {address.address.postcode}</Text>
                                                <Text color={textSecondary}>{address.address.country}</Text>
                                                <Text mt={2} color={textMuted}>📞 {address.phone}</Text>
                                            </Box>
                                        ))
                                    ) : (
                                        <Text color={textMuted}>No shipping addresses added yet</Text>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Billing Addresses */}
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            borderWidth="1px"
                            borderColor={cardBorder}
                            overflow="hidden">
                            <CardHeader borderBottomWidth="1px" borderColor={cardBorder}>
                                <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                                    <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>Billing Addresses</Heading>
                                    <Button
                                        size={{ base: "xs", md: "sm" }}
                                        onClick={() => navigate("/bills/billing-details")}
                                        bg="white"
                                        color="black"
                                        _hover={{
                                            bg: "gray.100",
                                            transform: "translateY(-1px)"
                                        }}
                                    >
                                        Manage
                                    </Button>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <VStack align="stretch" spacing={4}>
                                    {client.billingAddresses?.length > 0 ? (
                                        client.billingAddresses.map((address: any, index: number) => (
                                            <Box key={index} p={4} border="1px" borderColor={cardBorder} borderRadius="md" bg="rgba(0, 0, 0, 0.2)">
                                                <HStack justify="space-between" mb={2}>
                                                    <Text fontWeight="bold" color={textPrimary}>{address.name}</Text>
                                                    {address.isDefault && (
                                                        <Badge bg="rgba(34, 197, 94, 0.2)" color="#22C55E" border="1px solid" borderColor="rgba(34, 197, 94, 0.3)">Default</Badge>
                                                    )}
                                                </HStack>
                                                <Text color={textSecondary}>{address.address.street}</Text>
                                                <Text color={textSecondary}>{address.address.city}, {address.address.state} {address.address.postcode}</Text>
                                                <Text color={textSecondary}>{address.address.country}</Text>
                                            </Box>
                                        ))
                                    ) : (
                                        <Text color={textMuted}>No billing addresses added yet</Text>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>

                    </SimpleGrid>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default ViewProfile; 