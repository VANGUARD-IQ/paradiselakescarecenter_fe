import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  HStack,
  Box,
  Grid,
  Badge,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Code,
  VStack,
  Divider,
  IconButton,
  Skeleton,
  SimpleGrid,
  useColorMode,
} from "@chakra-ui/react";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { AddIcon, ExternalLinkIcon, CopyIcon, InfoIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import { FiShoppingCart, FiGlobe, FiPackage, FiDollarSign, FiCalendar, FiFileText } from "react-icons/fi";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import clientsModuleConfig from "./moduleConfig";

interface FormData {
  fName: string;
  lName: string;
  email: string;
  phoneNumber: string;
}

const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      fName
      lName
      email
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      fName
      lName
      email
      phoneNumber
    }
  }
`;

const GET_WEBSITES_BY_CLIENT = gql`
  query GetWebsitesByClient($clientId: ID!) {
    websitesByClient(clientId: $clientId) {
      id
      name
      domain
      websiteUrl
      clientId
      createdAt
      updatedAt
    }
  }
`;

const GET_PRODUCTS_BY_CLIENT = gql`
  query GetProductsByClient($clientId: ID!) {
    productsByClient(clientId: $clientId) {
      id
      name
      description
      price
      status
      createdAt
    }
  }
`;

export default function ClientDetails() {
  usePageTitle("Client Details");
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    fName: "",
    lName: "",
    email: "",
    phoneNumber: "",
  });

  // Brand-specific colors from brandConfig with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const accentBlue = colorMode === 'light' ? "#007AFF" : "#3B82F6";
  const accentHover = colorMode === 'light' ? "#0051D0" : "#2563EB";

  const { loading, error, data } = useQuery(GET_CLIENT, {
    variables: { id },
    onCompleted: (data) => {
      setFormData({
        fName: data.client.fName || "",
        lName: data.client.lName || "",
        email: data.client.email || "",
        phoneNumber: data.client.phoneNumber || "",
      });
    },
  });

  const { data: websitesData, loading: websitesLoading } = useQuery(GET_WEBSITES_BY_CLIENT, {
    variables: { clientId: id },
  });

  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS_BY_CLIENT, {
    variables: { clientId: id },
    skip: !id,
  });

  const [updateClient, { loading: updateLoading }] = useMutation(
    UPDATE_CLIENT,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Client information updated successfully",
          status: "success",
          duration: 5000,
        });
        setIsEditing(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only include fields that have values
    const updateInput: any = {};
    if (formData.fName && formData.fName.trim()) updateInput.fName = formData.fName.trim();
    if (formData.lName && formData.lName.trim()) updateInput.lName = formData.lName.trim();
    if (formData.email && formData.email.trim()) updateInput.email = formData.email.trim();
    if (formData.phoneNumber && formData.phoneNumber.trim()) updateInput.phoneNumber = formData.phoneNumber.trim();

    updateClient({
      variables: {
        id,
        input: updateInput,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCopyId = async (clientId: string) => {
    try {
      await navigator.clipboard.writeText(clientId);
      toast({
        title: "ID Copied",
        description: "Client ID has been copied to clipboard",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ID",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh">
        <NavbarWithCallToAction />
        <Container maxW="6xl" py={12}>
          <Skeleton height="400px" borderRadius="lg" />
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.client) {
    return (
      <Box bg={bg} minHeight="100vh">
        <NavbarWithCallToAction />
        <Container maxW="6xl" py={12}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              {error?.message || "Client not found"}
            </AlertDescription>
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
      <ModuleBreadcrumb moduleConfig={clientsModuleConfig} />
      <Container maxW="100%" py={4} px={{ base: 4, md: 8 }} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Main Client Card */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderRadius="lg"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color={textPrimary}>Client Details</Heading>
                  <Text fontSize="sm" color={textMuted}>
                    Manage client information and related services
                  </Text>
                </VStack>
                {isEditing ? (
                  <HStack spacing={2}>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      color={textPrimary}
                      _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      isLoading={updateLoading}
                      bg={accentBlue}
                      color="white"
                      _hover={{ bg: accentHover }}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    leftIcon={<EditIcon />}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{
                      bg: colorMode === 'light' ? "rgba(0, 122, 255, 0.05)" : "rgba(59, 130, 246, 0.1)",
                      borderColor: accentBlue
                    }}
                  >
                    Edit Client
                  </Button>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <Stack spacing={6}>
                {/* Client ID Section with Tooltip */}
                <Box>
                  <HStack mb={2}>
                    <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>
                      Client/Practitioner ID
                    </Text>
                    <Tooltip 
                      label="This unique ID identifies the client in the system. It also serves as their Practitioner ID when they provide services to other clients."
                      hasArrow
                      placement="top"
                    >
                      <InfoIcon boxSize={3} color={textMuted} />
                    </Tooltip>
                  </HStack>
                  <HStack
                    spacing={2}
                    p={3}
                    bg={colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.2)"}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => handleCopyId(client.id)}
                    _hover={{
                      bg: colorMode === 'light' ? "rgba(0, 122, 255, 0.1)" : "rgba(59, 130, 246, 0.1)"
                    }}
                    transition="all 0.2s"
                  >
                    <Code 
                      fontSize="sm" 
                      bg="transparent" 
                      color={textPrimary}
                      wordBreak="break-all"
                    >
                      {client.id}
                    </Code>
                    <IconButton
                      aria-label="Copy ID"
                      icon={<CopyIcon />}
                      size="sm"
                      variant="ghost"
                      color={textMuted}
                      _hover={{ color: textPrimary }}
                    />
                  </HStack>
                </Box>

                <Divider borderColor={cardBorder} />

                {/* Basic Information Form */}
                <form onSubmit={handleSubmit}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <FormControl>
                      <FormLabel color={textSecondary} fontSize="sm">
                        First Name
                      </FormLabel>
                      <Input
                        name="fName"
                        value={formData.fName}
                        onChange={handleInputChange}
                        isReadOnly={!isEditing}
                        bg={isEditing
                          ? (colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)")
                          : "transparent"}
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: isEditing ? accentBlue : cardBorder }}
                        _focus={{
                          borderColor: accentBlue,
                          boxShadow: `0 0 0 1px ${accentBlue}`
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary} fontSize="sm">
                        Last Name
                      </FormLabel>
                      <Input
                        name="lName"
                        value={formData.lName}
                        onChange={handleInputChange}
                        isReadOnly={!isEditing}
                        bg={isEditing
                          ? (colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)")
                          : "transparent"}
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: isEditing ? accentBlue : cardBorder }}
                        _focus={{
                          borderColor: accentBlue,
                          boxShadow: `0 0 0 1px ${accentBlue}`
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary} fontSize="sm">
                        Email Address
                      </FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isReadOnly={!isEditing}
                        bg={isEditing
                          ? (colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)")
                          : "transparent"}
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: isEditing ? accentBlue : cardBorder }}
                        _focus={{
                          borderColor: accentBlue,
                          boxShadow: `0 0 0 1px ${accentBlue}`
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textSecondary} fontSize="sm">
                        Phone Number
                      </FormLabel>
                      <Input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        isReadOnly={!isEditing}
                        bg={isEditing
                          ? (colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)")
                          : "transparent"}
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: isEditing ? accentBlue : cardBorder }}
                        _focus={{
                          borderColor: accentBlue,
                          boxShadow: `0 0 0 1px ${accentBlue}`
                        }}
                      />
                    </FormControl>
                  </Grid>
                </form>
              </Stack>
            </CardBody>
          </Card>

          {/* Related Services Section */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Products Section */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FiPackage color={textPrimary} />
                      <Heading size="md" color={textPrimary}>Products</Heading>
                    </HStack>
                    <Tooltip 
                      label="View and manage products created by this client for sale on the platform"
                      hasArrow
                    >
                      <Text fontSize="xs" color={textMuted} cursor="help">
                        Client's product catalog
                      </Text>
                    </Tooltip>
                  </VStack>
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    bg={accentBlue}
                    color="white"
                    _hover={{ bg: accentHover }}
                    onClick={() => navigate(`/products/new?clientId=${id}`)}
                  >
                    New Product
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                {productsLoading ? (
                  <VStack spacing={3}>
                    <Skeleton height="60px" width="100%" />
                    <Skeleton height="60px" width="100%" />
                  </VStack>
                ) : productsData?.productsByClient?.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {productsData.productsByClient.slice(0, 3).map((product: any) => (
                      <Box
                        key={product.id}
                        p={3}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                        _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                              {product.name}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>
                              ${product.price}
                            </Text>
                          </VStack>
                          <Badge colorScheme={product.status === 'ACTIVE' ? 'green' : 'gray'}>
                            {product.status}
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                    {productsData.productsByClient.length > 3 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color={textSecondary}
                        onClick={() => navigate(`/products?clientId=${id}`)}
                      >
                        View all {productsData.productsByClient.length} products
                      </Button>
                    )}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={textMuted}>
                    No products created yet
                  </Text>
                )}
              </CardBody>
            </Card>

            {/* Websites Section */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FiGlobe color={textPrimary} />
                      <Heading size="md" color={textPrimary}>Websites</Heading>
                    </HStack>
                    <Tooltip 
                      label="Manage websites owned by this client including domains and hosting"
                      hasArrow
                    >
                      <Text fontSize="xs" color={textMuted} cursor="help">
                        Client's web properties
                      </Text>
                    </Tooltip>
                  </VStack>
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    bg={accentBlue}
                    color="white"
                    _hover={{ bg: accentHover }}
                    onClick={() => navigate(`/websites/new?clientId=${id}`)}
                  >
                    New Website
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                {websitesLoading ? (
                  <VStack spacing={3}>
                    <Skeleton height="60px" width="100%" />
                    <Skeleton height="60px" width="100%" />
                  </VStack>
                ) : websitesData?.websitesByClient?.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {websitesData.websitesByClient.slice(0, 3).map((website: any) => (
                      <Box
                        key={website.id}
                        p={3}
                        bg="rgba(0, 0, 0, 0.2)"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => navigate(`/websites/${website.id}`)}
                        _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                              {website.name}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>
                              {website.domain || "No domain"}
                            </Text>
                          </VStack>
                          <IconButton
                            aria-label="View website"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            variant="ghost"
                            color={textMuted}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (website.websiteUrl) {
                                window.open(website.websiteUrl, '_blank');
                              }
                            }}
                          />
                        </HStack>
                      </Box>
                    ))}
                    {websitesData.websitesByClient.length > 3 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color={textSecondary}
                        onClick={() => navigate(`/websites?clientId=${id}`)}
                      >
                        View all {websitesData.websitesByClient.length} websites
                      </Button>
                    )}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={textMuted}>
                    No websites created yet
                  </Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Additional Services Row */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Bills Section */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <FiDollarSign color={textPrimary} />
                    <Text fontWeight="medium" color={textPrimary}>Bills & Invoices</Text>
                  </HStack>
                  <Tooltip label="View all bills and invoices for this client">
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={cardBorder}
                      color={textSecondary}
                      _hover={{ bg: "rgba(59, 130, 246, 0.1)", borderColor: accentBlue }}
                      onClick={() => navigate(`/bills?clientId=${id}`)}
                    >
                      View Bills
                    </Button>
                  </Tooltip>
                </VStack>
              </CardBody>
            </Card>

            {/* Sessions Section */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <FiCalendar color={textPrimary} />
                    <Text fontWeight="medium" color={textPrimary}>Sessions</Text>
                  </HStack>
                  <Tooltip label="View all sessions and appointments for this client">
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={cardBorder}
                      color={textSecondary}
                      _hover={{ bg: "rgba(59, 130, 246, 0.1)", borderColor: accentBlue }}
                      onClick={() => navigate(`/sessions?clientId=${id}`)}
                    >
                      View Sessions
                    </Button>
                  </Tooltip>
                </VStack>
              </CardBody>
            </Card>

            {/* Projects Section */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <FiFileText color={textPrimary} />
                    <Text fontWeight="medium" color={textPrimary}>Projects</Text>
                  </HStack>
                  <Tooltip label="View all projects for this client">
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={cardBorder}
                      color={textSecondary}
                      _hover={{ bg: "rgba(59, 130, 246, 0.1)", borderColor: accentBlue }}
                      onClick={() => navigate(`/projects?clientId=${id}`)}
                    >
                      View Projects
                    </Button>
                  </Tooltip>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
}