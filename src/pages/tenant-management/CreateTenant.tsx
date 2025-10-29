import React from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import tenantManagementModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      businessName
    }
  }
`;

const CREATE_TENANT = gql`
  mutation CreateTenant($input: TenantInput!) {
    createTenant(input: $input) {
      id
      name
      domain
      status
    }
  }
`;

const CreateTenant = () => {
  usePageTitle("Create New Tenant");
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [formData, setFormData] = React.useState({
    siteName: "",
    internalName: "",
    ownerId: "",
  });

  const [isCreating, setIsCreating] = React.useState(false);

  // Consistent styling from brandConfig (matching TenantsList)
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
  const [createTenant] = useMutation(CREATE_TENANT);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate internal name from site name
  const generateInternalName = (siteName: string) => {
    return siteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Auto-generate internal name when site name changes
  React.useEffect(() => {
    if (formData.siteName && !formData.internalName) {
      handleInputChange("internalName", generateInternalName(formData.siteName));
    }
  }, [formData.siteName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.siteName.trim()) {
      toast({
        title: "Site name required",
        description: "Please enter a site name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.internalName.trim()) {
      toast({
        title: "Internal name required",
        description: "Please enter an internal name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.ownerId) {
      toast({
        title: "Owner required",
        description: "Please select a tenant owner",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreating(true);

    try {
      console.log("🏗️ Creating tenant...");
      const tenantResult = await createTenant({
        variables: {
          input: {
            name: formData.internalName,
            clientId: formData.ownerId,
            domain: `${formData.internalName}.tommillerservices.com`,
            subscriptionTier: "FOUNDATION",
            skipGithubRepo: true,
            branding: {
              siteName: formData.siteName,
              tagline: "",
              description: "",
              primaryColor: "#3182CE",
              logo: "",
            },
            emailConfig: {
              fromEmail: `noreply@${formData.internalName}.tommillerservices.com`,
              fromName: formData.siteName,
            },
            smsConfig: {
              defaultSender: formData.siteName.substring(0, 11),
              defaultSenderType: "ALPHANUMERIC",
              defaultTags: [],
              defaultList: [],
            },
            apiKeys: {
              postmarkApiKey: "",
              cellcastApiKey: "",
              stripePublicKey: "",
              stripeSecretKey: "",
              stripeWebhookSecret: "",
            },
            moduleConfig: [],
          },
        },
      });

      const tenantId = tenantResult.data?.createTenant?.id;

      toast({
        title: "✅ Tenant created successfully!",
        description: `${formData.siteName} has been created. Configure the details on the next page.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to edit page to configure everything else
      navigate(`/tenants/${tenantId}/edit`);
    } catch (error) {
      console.error("❌ Error creating tenant:", error);
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create tenant. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={tenantManagementModuleConfig} />
      <Container maxW="container.xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="lg" color={textPrimary}>
              🏢 Create New Tenant
            </Heading>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate("/tenants")}
              variant="ghost"
            >
              Back to Tenants
            </Button>
          </HStack>

          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderColor={cardBorder}
            borderWidth="1px"
          >
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel color={textPrimary}>Site Name</FormLabel>
                      <Input
                        placeholder="e.g., One Property Australia"
                        value={formData.siteName}
                        onChange={(e) => handleInputChange("siteName", e.target.value)}
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textPrimary}>Internal Name</FormLabel>
                      <Input
                        placeholder="e.g., one-property-australia (auto-generated)"
                        value={formData.internalName}
                        onChange={(e) => handleInputChange("internalName", e.target.value)}
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textPrimary}>Owner</FormLabel>
                      <Select
                        placeholder="Select tenant owner..."
                        value={formData.ownerId}
                        onChange={(e) => handleInputChange("ownerId", e.target.value)}
                        size="lg"
                        isDisabled={clientsLoading}
                      >
                        {clientsData?.clients?.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.businessName || `${client.fName} ${client.lName}`} ({client.email})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <HStack spacing={4} justify="flex-end" pt={4}>
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/tenants")}
                        isDisabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        isLoading={isCreating}
                        loadingText="Creating..."
                      >
                        Create Tenant
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              borderColor={cardBorder}
              borderWidth="1px"
            >
              <CardBody>
                <Heading size="sm" color={textPrimary} mb={2}>
                  💡 What happens next?
                </Heading>
                <VStack align="start" spacing={1} color={textSecondary} fontSize="sm">
                  <Box>• Tenant will be created with default FREE tier</Box>
                  <Box>• You'll be redirected to the edit page to configure:</Box>
                  <Box pl={6}>- Branding (colors, logo, tagline)</Box>
                  <Box pl={6}>- GitHub repository settings</Box>
                  <Box pl={6}>- API keys (Postmark, Cellcast, Stripe)</Box>
                  <Box pl={6}>- Email & SMS configuration</Box>
                  <Box pl={6}>- Enabled modules</Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  };

  export default CreateTenant;
