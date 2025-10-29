import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Badge,
  Spinner,
  Select,
  Flex,
  TableContainer,
  useColorMode,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import assetsModuleConfig from "./moduleConfig";

// GraphQL Queries and Mutations
const GET_ASSET_TYPES = gql`
  query GetAssetTypes {
    assetTypes {
      id
      name
      description
      category
      icon
      requiredFields
      maintenanceIntervalDays
      isActive
    }
  }
`;

const CREATE_ASSET_TYPE = gql`
  mutation CreateAssetType($input: AssetTypeInput!) {
    createAssetType(input: $input) {
      id
      name
      category
      icon
    }
  }
`;

const DELETE_ASSET_TYPE = gql`
  mutation DeleteAssetType($id: ID!) {
    deleteAssetType(id: $id)
  }
`;

const AssetTypes = () => {
  usePageTitle("Asset Types");
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  // Brand colors
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);
  const successGreen = getColor("successGreen", colorMode);
  const errorRed = getColor("status.error", colorMode);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    icon: "",
    requiredFields: [] as string[],
    maintenanceIntervalDays: 0,
  });

  const [newRequiredField, setNewRequiredField] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_ASSET_TYPES);
  
  const [createAssetType, { loading: creating }] = useMutation(CREATE_ASSET_TYPE, {
    onCompleted: () => {
      toast({
        title: "Asset type created",
        description: "The asset type has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error creating asset type",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteAssetType] = useMutation(DELETE_ASSET_TYPE, {
    onCompleted: () => {
      toast({
        title: "Asset type deleted",
        description: "The asset type has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error deleting asset type",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      icon: "",
      requiredFields: [],
      maintenanceIntervalDays: 0,
    });
    setNewRequiredField("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Asset type name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const input = {
      ...formData,
      requiredFields: formData.requiredFields.length > 0 ? formData.requiredFields : undefined,
      maintenanceIntervalDays: formData.maintenanceIntervalDays || undefined,
    };

    await createAssetType({ variables: { input } });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the asset type "${name}"?`)) {
      await deleteAssetType({ variables: { id } });
    }
  };

  const addRequiredField = () => {
    if (newRequiredField && !formData.requiredFields.includes(newRequiredField)) {
      setFormData(prev => ({
        ...prev,
        requiredFields: [...prev.requiredFields, newRequiredField]
      }));
      setNewRequiredField("");
    }
  };

  const removeRequiredField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.filter(f => f !== field)
    }));
  };

  const categoryIcons = {
    "Medical Equipment": "🏥",
    "IT Equipment": "💻",
    "Furniture": "🪑",
    "Vehicles": "🚗",
    "Tools": "🔧",
    "Electronics": "📱",
    "Office Supplies": "📎",
    "Safety Equipment": "🦺",
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <VStack spacing={6}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading asset types...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <Text color={errorRed}>Error loading asset types: {error.message}</Text>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={4}>
            <HStack spacing={4} align="start" w={{ base: "100%", md: "auto" }}>
              <IconButton
                icon={<ArrowBackIcon />}
                aria-label="Back"
                variant="ghost"
                color={textPrimary}
                _hover={{ bg: cardGradientBg }}
                onClick={() => navigate("/assets")}
              />
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>Asset Types</Text>
                <Text color={textMuted}>Configure asset categories and types</Text>
              </Box>
            </HStack>
            <Button
              bg={primaryColor}
              color="white"
              _hover={{ bg: primaryHover }}
              leftIcon={<AddIcon />}
              onClick={onOpen}
              size={{ base: "sm", md: "md" }}
              width={{ base: "100%", md: "auto" }}
            >
              Add Asset Type
            </Button>
          </Flex>

          {/* Asset Types Table */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <Box overflowX="auto">
                <TableContainer>
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead>
                      <Tr>
                        <Th color={textSecondary}>Type</Th>
                        <Th color={textSecondary}>Category</Th>
                        <Th color={textSecondary}>Description</Th>
                        <Th color={textSecondary}>Maintenance Interval</Th>
                        <Th color={textSecondary}>Required Fields</Th>
                        <Th color={textSecondary}>Status</Th>
                        <Th color={textSecondary}>Actions</Th>
                      </Tr>
                    </Thead>
                <Tbody>
                  {data?.assetTypes?.map((type: any) => (
                    <Tr key={type.id}>
                      <Td>
                        <HStack>
                          <Text fontSize="lg">{type.icon}</Text>
                          <Text fontWeight="medium" color={textPrimary}>{type.name}</Text>
                        </HStack>
                      </Td>
                      <Td color={textPrimary}>{type.category}</Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={2} color={textPrimary}>
                          {type.description || "-"}
                        </Text>
                      </Td>
                      <Td color={textPrimary}>
                        {type.maintenanceIntervalDays
                          ? `${type.maintenanceIntervalDays} days`
                          : "-"}
                      </Td>
                      <Td>
                        {type.requiredFields?.length > 0 ? (
                          <Text fontSize="sm" color={textPrimary}>
                            {type.requiredFields.length} fields
                          </Text>
                        ) : (
                          <Text color={textPrimary}>"-"</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={type.isActive ? "green" : "gray"}>
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Delete"
                          size="sm"
                          variant="ghost"
                          color={errorRed}
                          _hover={{ bg: "red.50" }}
                          onClick={() => handleDelete(type.id, type.name)}
                        />
                      </Td>
                    </Tr>
                  ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {data?.assetTypes?.length === 0 && (
                <VStack py={8}>
                  <Text color={textSecondary}>No asset types configured</Text>
                  <Button
                    bg={primaryColor}
                    color="white"
                    _hover={{ bg: primaryHover }}
                    leftIcon={<AddIcon />}
                    onClick={onOpen}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Add First Type
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <FooterWithFourColumns />

      {/* Add Asset Type Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} backdropFilter="blur(10px)" border="1px" borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>Add Asset Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IVAC Pump, Hospital Bed, Laptop"
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this asset type"
                  rows={2}
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Select category"
                  >
                    {Object.keys(categoryIcons).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Icon</FormLabel>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Emoji icon"
                    maxLength={2}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Maintenance Interval (Days)</FormLabel>
                <NumberInput
                  value={formData.maintenanceIntervalDays}
                  onChange={(value) => setFormData({ ...formData, maintenanceIntervalDays: Number(value) })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Required Fields</FormLabel>
                <HStack>
                  <Input
                    value={newRequiredField}
                    onChange={(e) => setNewRequiredField(e.target.value)}
                    placeholder="Add required field"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequiredField())}
                  />
                  <IconButton
                    icon={<AddIcon />}
                    aria-label="Add field"
                    onClick={addRequiredField}
                  />
                </HStack>
                {formData.requiredFields.length > 0 && (
                  <VStack align="start" mt={2}>
                    {formData.requiredFields.map(field => (
                      <HStack key={field}>
                        <Text fontSize="sm">• {field}</Text>
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Remove"
                          size="xs"
                          variant="ghost"
                          onClick={() => removeRequiredField(field)}
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              borderColor={cardBorder}
              color={textPrimary}
              _hover={{ bg: cardGradientBg }}
            >
              Cancel
            </Button>
            <Button
              bg={primaryColor}
              color="white"
              _hover={{ bg: primaryHover }}
              onClick={handleSubmit}
              isLoading={creating}
            >
              Create Type
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssetTypes;