import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  useToast,
  HStack,
  Badge,
  Divider,
  Link,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_CURRENT_TENANT = gql`
  query GetCurrentTenant {
    currentTenant {
      id
      apiKeys {
        vapiPrivateApiKey
        vapiPublicApiKey
        vapiPhoneNumberId
        vapiAssistantId
      }
    }
  }
`;

const UPDATE_TENANT = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      apiKeys {
        vapiPrivateApiKey
        vapiPublicApiKey
        vapiPhoneNumberId
        vapiAssistantId
      }
    }
  }
`;

interface VapiConfigFormProps {
  onConfigured?: () => void;
}

export const VapiConfigForm: React.FC<VapiConfigFormProps> = ({ onConfigured }) => {
  usePageTitle("VAPI Configuration");
  const toast = useToast();
  const { data, loading: queryLoading, refetch } = useQuery(GET_CURRENT_TENANT);
  const [updateTenant, { loading: updateLoading }] = useMutation(UPDATE_TENANT);

  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");

  const [formData, setFormData] = useState({
    vapiPrivateApiKey: "",
    vapiPublicApiKey: "",
    vapiPhoneNumberId: "",
    vapiAssistantId: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data?.currentTenant?.apiKeys) {
      setFormData({
        vapiPrivateApiKey: data.currentTenant.apiKeys.vapiPrivateApiKey || "",
        vapiPublicApiKey: data.currentTenant.apiKeys.vapiPublicApiKey || "",
        vapiPhoneNumberId: data.currentTenant.apiKeys.vapiPhoneNumberId || "",
        vapiAssistantId: data.currentTenant.apiKeys.vapiAssistantId || "",
      });
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!data?.currentTenant?.id) {
      toast({
        title: "Error",
        description: "Unable to identify current tenant",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      await updateTenant({
        variables: {
          id: data.currentTenant.id,
          input: {
            apiKeys: {
              vapiPrivateApiKey: formData.vapiPrivateApiKey || undefined,
              vapiPublicApiKey: formData.vapiPublicApiKey || undefined,
              vapiPhoneNumberId: formData.vapiPhoneNumberId || undefined,
              vapiAssistantId: formData.vapiAssistantId || undefined,
            },
          },
        },
      });

      toast({
        title: "Configuration Saved",
        description: "Vapi settings have been updated successfully",
        status: "success",
        duration: 3000,
      });

      setIsEditing(false);
      await refetch();
      
      if (onConfigured) {
        onConfigured();
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update Vapi configuration",
        status: "error",
        duration: 5000,
      });
    }
  };

  const isConfigured = !!(
    formData.vapiPrivateApiKey &&
    formData.vapiPublicApiKey &&
    formData.vapiAssistantId
  );

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
    >
      <CardHeader borderBottom="1px" borderColor={cardBorder}>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <Heading size="md" color={textPrimary}>Vapi Configuration</Heading>
            {isConfigured && (
              <Badge colorScheme="green">Configured</Badge>
            )}
          </HStack>
          <Text fontSize="sm" color={textMuted}>
            Configure your Vapi API keys to enable voice calling features
          </Text>
        </VStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold" mb={2}>Setup Instructions:</Text>
              <VStack align="start" spacing={2} fontSize="sm">
                <Text>
                  1. Get your API keys from{" "}
                  <Link href="https://dashboard.vapi.ai/org/api-keys" isExternal color="blue.500">
                    Vapi API Keys Page <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
                <Text>   • Copy your Private Key (starts with sk-...)</Text>
                <Text>   • Copy your Public Key (starts with pk-...)</Text>
                <Text>
                  2. Import your Twilio number at{" "}
                  <Link href="https://dashboard.vapi.ai/phone-numbers" isExternal color="blue.500">
                    Phone Numbers <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
                <Text>
                  3. Create an assistant at{" "}
                  <Link href="https://dashboard.vapi.ai/assistants" isExternal color="blue.500">
                    Assistants <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
              </VStack>
            </Box>
          </Alert>

          <Divider />

          <FormControl>
            <FormLabel color={textPrimary}>
              Vapi Private API Key
              <Badge ml={2} colorScheme="red" fontSize="xs">BACKEND</Badge>
            </FormLabel>
            <Input
              type="text"
              value={formData.vapiPrivateApiKey}
              onChange={(e) => handleInputChange("vapiPrivateApiKey", e.target.value)}
              placeholder="sk-..."
              disabled={!isEditing}
              bg="rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              color={textPrimary}
              _placeholder={{ color: textMuted }}
              fontFamily="monospace"
            />
            {!isEditing && formData.vapiPrivateApiKey && (
              <Text fontSize="xs" color="green.400" mt={1}>
                ✅ Configured ({formData.vapiPrivateApiKey.length} characters)
              </Text>
            )}
            <Text fontSize="xs" color={textMuted} mt={1}>
              Server-side API key for managing assistants and calls
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color={textPrimary}>
              Vapi Public API Key
              <Badge ml={2} colorScheme="green" fontSize="xs">FRONTEND</Badge>
            </FormLabel>
            <Input
              value={formData.vapiPublicApiKey}
              onChange={(e) => handleInputChange("vapiPublicApiKey", e.target.value)}
              placeholder="pk-..."
              disabled={!isEditing}
              bg="rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              color={textPrimary}
              _placeholder={{ color: textMuted }}
            />
            <Text fontSize="xs" color={textMuted} mt={1}>
              Browser-side key for web-based voice calls
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color={textPrimary}>
              Phone Number ID
              <Badge ml={2} colorScheme="blue" fontSize="xs">OPTIONAL</Badge>
            </FormLabel>
            <Input
              value={formData.vapiPhoneNumberId}
              onChange={(e) => handleInputChange("vapiPhoneNumberId", e.target.value)}
              placeholder="c9e3d2b1-84b1-..."
              disabled={!isEditing}
              bg="rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              color={textPrimary}
              _placeholder={{ color: textMuted }}
            />
            <Text fontSize="xs" color={textMuted} mt={1}>
              Your imported Twilio number's Vapi ID (for phone calls)
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color={textPrimary}>
              Default Assistant ID
              <Badge ml={2} colorScheme="purple" fontSize="xs">REQUIRED</Badge>
            </FormLabel>
            <Input
              value={formData.vapiAssistantId}
              onChange={(e) => handleInputChange("vapiAssistantId", e.target.value)}
              placeholder="assistant_..."
              disabled={!isEditing}
              bg="rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              color={textPrimary}
              _placeholder={{ color: textMuted }}
            />
            <Text fontSize="xs" color={textMuted} mt={1}>
              Default AI assistant for voice calls
            </Text>
          </FormControl>

          <HStack spacing={4} w="full" justify="flex-end">
            {!isEditing ? (
              <Button
                colorScheme="blue"
                onClick={() => setIsEditing(true)}
              >
                Edit Configuration
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to saved values
                    if (data?.currentTenant?.apiKeys) {
                      setFormData({
                        vapiPrivateApiKey: data.currentTenant.apiKeys.vapiPrivateApiKey || "",
                        vapiPublicApiKey: data.currentTenant.apiKeys.vapiPublicApiKey || "",
                        vapiPhoneNumberId: data.currentTenant.apiKeys.vapiPhoneNumberId || "",
                        vapiAssistantId: data.currentTenant.apiKeys.vapiAssistantId || "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleSave}
                  isLoading={updateLoading}
                  loadingText="Saving..."
                >
                  Save Configuration
                </Button>
              </>
            )}
          </HStack>

          {isConfigured && !isEditing && (
            <Alert status="success" variant="subtle">
              <AlertIcon />
              <Text fontSize="sm">
                Vapi is configured and ready for voice calls!
              </Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};