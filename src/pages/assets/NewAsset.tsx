import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Select,
  Textarea,
  useToast,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  IconButton,
  Wrap,
  WrapItem,
  Spinner,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { AddIcon, CalendarIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import assetsModuleConfig from "./moduleConfig";

// GraphQL Queries and Mutations
const GET_ASSET_FORM_DATA = gql`
  query GetAssetFormData {
    assetTypes {
      id
      name
      category
      icon
      maintenanceIntervalDays
    }
    companies {
      id
      name
    }
    clients {
      id
      fName
      lName
      profilePhoto
      isEmployee
    }
  }
`;

const GET_ASSET = gql`
  query GetAsset($id: ID!) {
    asset(id: $id) {
      id
      assetId
      name
      assetType {
        id
        name
      }
      company {
        id
        name
      }
      assignedTo {
        id
        fName
        lName
      }
      manufacturer
      model
      serialNumber
      purchaseDate
      purchasePrice
      supplier
      warrantyExpiry
      status
      condition
      location {
        building
        floor
        room
        section
        coordinates
      }
      description
      photos
      barcode
      lastMaintenanceDate
      nextMaintenanceDate
      maintenanceNotes
      tags
      customFields
    }
  }
`;

const CREATE_ASSET = gql`
  mutation CreateAsset($input: AssetInput!) {
    createAsset(input: $input) {
      id
      assetId
      name
      qrCode
      publicUrl
    }
  }
`;

const UPDATE_ASSET = gql`
  mutation UpdateAsset($id: ID!, $input: UpdateAssetInput!) {
    updateAsset(id: $id, input: $input) {
      id
      assetId
      name
    }
  }
`;

const NewAsset = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEditMode = !!id;
  const { colorMode } = useColorMode();

  usePageTitle("New Asset");

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

  const [activeTab, setActiveTab] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [formData, setFormData] = useState({
    assetId: "",
    name: "",
    assetType: "",
    company: "",
    assignedTo: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: 0,
    supplier: "",
    warrantyExpiry: "",
    status: "ACTIVE",
    condition: "GOOD",
    location: {
      building: "",
      floor: "",
      room: "",
      section: "",
      coordinates: "",
    },
    description: "",
    photos: [] as string[],
    barcode: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    maintenanceNotes: "",
    tags: [] as string[],
    customFields: "",
  });

  const [errors, setErrors] = useState<any>({});

  const { loading: loadingFormData, data: formDataResponse } = useQuery(GET_ASSET_FORM_DATA);
  const { loading: loadingAsset, data: assetData } = useQuery(GET_ASSET, {
    skip: !isEditMode,
    variables: { id },
    onCompleted: (data) => {
      if (data.asset) {
        const asset = data.asset;
        setFormData({
          assetId: asset.assetId,
          name: asset.name,
          assetType: asset.assetType?.id || "",
          company: asset.company?.id || "",
          assignedTo: asset.assignedTo?.id || "",
          manufacturer: asset.manufacturer || "",
          model: asset.model || "",
          serialNumber: asset.serialNumber || "",
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
          purchasePrice: asset.purchasePrice || 0,
          supplier: asset.supplier || "",
          warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : "",
          status: asset.status || "ACTIVE",
          condition: asset.condition || "GOOD",
          location: asset.location || {
            building: "",
            floor: "",
            room: "",
            section: "",
            coordinates: "",
          },
          description: asset.description || "",
          photos: asset.photos || [],
          barcode: asset.barcode || "",
          lastMaintenanceDate: asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate).toISOString().split('T')[0] : "",
          nextMaintenanceDate: asset.nextMaintenanceDate ? new Date(asset.nextMaintenanceDate).toISOString().split('T')[0] : "",
          maintenanceNotes: asset.maintenanceNotes || "",
          tags: asset.tags || [],
          customFields: asset.customFields || "",
        });
      }
    },
  });

  const [createAsset, { loading: creating }] = useMutation(CREATE_ASSET, {
    onCompleted: (data) => {
      toast({
        title: "Asset created",
        description: `Asset ${data.createAsset.name} has been created with QR code.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate(`/assets/${data.createAsset.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating asset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateAsset, { loading: updating }] = useMutation(UPDATE_ASSET, {
    onCompleted: (data) => {
      toast({
        title: "Asset updated",
        description: `Asset ${data.updateAsset.name} has been updated.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate(`/assets/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error updating asset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.assetId.trim()) {
      newErrors.assetId = "Asset ID is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Asset name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setActiveTab(0); // Go to first tab with errors
      return;
    }

    const input = {
      ...formData,
      purchaseDate: formData.purchaseDate || undefined,
      warrantyExpiry: formData.warrantyExpiry || undefined,
      lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      assetType: formData.assetType || undefined,
      company: formData.company || undefined,
      assignedTo: formData.assignedTo || undefined,
      purchasePrice: formData.purchasePrice || undefined,
      location: Object.values(formData.location).some(v => v) ? formData.location : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      photos: formData.photos.length > 0 ? formData.photos : undefined,
    };

    if (isEditMode) {
      const { assetId, ...updateInput } = input;
      await updateAsset({
        variables: {
          id,
          input: updateInput,
        },
      });
    } else {
      await createAsset({
        variables: {
          input,
        },
      });
    }
  };

  // Calculate next maintenance date based on asset type
  useEffect(() => {
    if (formData.assetType && formData.purchaseDate) {
      const assetType = formDataResponse?.assetTypes?.find((t: any) => t.id === formData.assetType);
      if (assetType?.maintenanceIntervalDays) {
        const purchaseDate = new Date(formData.purchaseDate);
        const nextDate = new Date(purchaseDate);
        nextDate.setDate(nextDate.getDate() + assetType.maintenanceIntervalDays);
        handleChange("nextMaintenanceDate", nextDate.toISOString().split('T')[0]);
      }
    }
  }, [formData.assetType, formData.purchaseDate]);

  if (loadingFormData || loadingAsset) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <VStack spacing={6}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading asset data...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const employees = formDataResponse?.clients?.filter((c: any) => c.isEmployee) || [];

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }} spacing={4}>
            <HStack spacing={4}>
              <IconButton
                icon={<ArrowBackIcon />}
                aria-label="Back"
                variant="ghost"
                color={textPrimary}
                _hover={{ bg: cardGradientBg }}
                onClick={() => navigate("/assets")}
              />
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                  {isEditMode ? "Edit Asset" : "Create New Asset"}
                </Text>
                <Text color={textMuted}>
                  {isEditMode ? "Update asset information" : "Register a new asset with QR code"}
                </Text>
              </Box>
            </HStack>
          </HStack>

          {/* Form Tabs */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <Tabs index={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab>Basic Info</Tab>
                  <Tab>Purchase Details</Tab>
                  <Tab>Location & Assignment</Tab>
                  <Tab>Maintenance</Tab>
                </TabList>

                <TabPanels>
                  {/* Basic Info Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired isInvalid={!!errors.assetId}>
                          <FormLabel>Asset ID</FormLabel>
                          <Input
                            value={formData.assetId}
                            onChange={(e) => handleChange("assetId", e.target.value)}
                            placeholder="e.g., LAPTOP-001, PUMP-A23"
                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                            borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                            color={textPrimary}
                            _placeholder={{ color: textMuted }}
                            _focus={{
                              borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                              boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                            }}
                          />
                          <FormHelperText>Unique identifier for this asset</FormHelperText>
                          <FormErrorMessage>{errors.assetId}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.name}>
                          <FormLabel>Asset Name</FormLabel>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="e.g., Dell Laptop, IVAC Pump"
                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                            borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                            color={textPrimary}
                            _placeholder={{ color: textMuted }}
                            _focus={{
                              borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                              boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                            }}
                          />
                          <FormHelperText>Friendly name for the asset</FormHelperText>
                          <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Asset Type</FormLabel>
                          <Select
                            value={formData.assetType}
                            onChange={(e) => handleChange("assetType", e.target.value)}
                            placeholder="Select asset type"
                            bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                            borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                            color={textPrimary}
                            _focus={{
                              borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                              boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                            }}
                          >
                            {formDataResponse?.assetTypes?.map((type: any) => (
                              <option key={type.id} value={type.id}>
                                {type.icon} {type.name} ({type.category})
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Company</FormLabel>
                          <Select
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}
                            placeholder="Select company"
                          >
                            {formDataResponse?.companies?.map((company: any) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Manufacturer</FormLabel>
                          <Input
                            value={formData.manufacturer}
                            onChange={(e) => handleChange("manufacturer", e.target.value)}
                            placeholder="e.g., Dell, Apple, B. Braun"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Model</FormLabel>
                          <Input
                            value={formData.model}
                            onChange={(e) => handleChange("model", e.target.value)}
                            placeholder="e.g., XPS 15, MacBook Pro, Infusomat"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Serial Number</FormLabel>
                          <Input
                            value={formData.serialNumber}
                            onChange={(e) => handleChange("serialNumber", e.target.value)}
                            placeholder="Enter serial number"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Barcode</FormLabel>
                          <Input
                            value={formData.barcode}
                            onChange={(e) => handleChange("barcode", e.target.value)}
                            placeholder="Scan or enter barcode"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          placeholder="Additional details about the asset"
                          rows={3}
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
                        <FormLabel>Tags</FormLabel>
                        <InputGroup>
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add tags for searchability"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          />
                          <InputRightElement>
                            <IconButton
                              icon={<AddIcon />}
                              aria-label="Add tag"
                              size="sm"
                              onClick={addTag}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <Wrap mt={2}>
                          {formData.tags.map((tag) => (
                            <WrapItem key={tag}>
                              <Tag size="md" variant="solid" bg={primaryColor} color="white">
                                <TagLabel>{tag}</TagLabel>
                                <TagCloseButton onClick={() => removeTag(tag)} />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </FormControl>
                    </VStack>
                  </TabPanel>

                  {/* Purchase Details Tab */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Purchase Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => handleChange("purchaseDate", e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Purchase Price</FormLabel>
                        <NumberInput
                          value={formData.purchasePrice}
                          onChange={(value) => handleChange("purchasePrice", Number(value))}
                          precision={2}
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
                        <FormLabel>Supplier</FormLabel>
                        <Input
                          value={formData.supplier}
                          onChange={(e) => handleChange("supplier", e.target.value)}
                          placeholder="Where was it purchased from"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Warranty Expiry</FormLabel>
                        <Input
                          type="date"
                          value={formData.warrantyExpiry}
                          onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) => handleChange("status", e.target.value)}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="IN_MAINTENANCE">In Maintenance</option>
                          <option value="RETIRED">Retired</option>
                          <option value="DISPOSED">Disposed</option>
                          <option value="LOST">Lost</option>
                          <option value="DAMAGED">Damaged</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Condition</FormLabel>
                        <Select
                          value={formData.condition}
                          onChange={(e) => handleChange("condition", e.target.value)}
                        >
                          <option value="NEW">New</option>
                          <option value="EXCELLENT">Excellent</option>
                          <option value="GOOD">Good</option>
                          <option value="FAIR">Fair</option>
                          <option value="POOR">Poor</option>
                          <option value="BROKEN">Broken</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </TabPanel>

                  {/* Location & Assignment Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Assigned To</FormLabel>
                        <Select
                          value={formData.assignedTo}
                          onChange={(e) => handleChange("assignedTo", e.target.value)}
                          placeholder="Select employee"
                        >
                          {employees.map((employee: any) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.fName} {employee.lName}
                            </option>
                          ))}
                        </Select>
                        <FormHelperText>Employee responsible for this asset</FormHelperText>
                      </FormControl>

                      <Divider />

                      <Text fontWeight="bold">Location Details</Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Building</FormLabel>
                          <Input
                            value={formData.location.building}
                            onChange={(e) => handleChange("location.building", e.target.value)}
                            placeholder="e.g., Main Office, Warehouse A"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Floor</FormLabel>
                          <Input
                            value={formData.location.floor}
                            onChange={(e) => handleChange("location.floor", e.target.value)}
                            placeholder="e.g., 2nd Floor, Ground Floor"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Room</FormLabel>
                          <Input
                            value={formData.location.room}
                            onChange={(e) => handleChange("location.room", e.target.value)}
                            placeholder="e.g., Room 201, Conference Room"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Section</FormLabel>
                          <Input
                            value={formData.location.section}
                            onChange={(e) => handleChange("location.section", e.target.value)}
                            placeholder="e.g., IT Department, Reception"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>GPS Coordinates</FormLabel>
                        <Input
                          value={formData.location.coordinates}
                          onChange={(e) => handleChange("location.coordinates", e.target.value)}
                          placeholder="Optional: latitude, longitude"
                        />
                      </FormControl>
                    </VStack>
                  </TabPanel>

                  {/* Maintenance Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Last Maintenance Date</FormLabel>
                          <Input
                            type="date"
                            value={formData.lastMaintenanceDate}
                            onChange={(e) => handleChange("lastMaintenanceDate", e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Next Maintenance Date</FormLabel>
                          <Input
                            type="date"
                            value={formData.nextMaintenanceDate}
                            onChange={(e) => handleChange("nextMaintenanceDate", e.target.value)}
                          />
                          <FormHelperText>
                            {formData.assetType && "Auto-calculated based on asset type maintenance interval"}
                          </FormHelperText>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Maintenance Notes</FormLabel>
                        <Textarea
                          value={formData.maintenanceNotes}
                          onChange={(e) => handleChange("maintenanceNotes", e.target.value)}
                          placeholder="Special maintenance instructions or requirements"
                          rows={4}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Custom Fields (JSON)</FormLabel>
                        <Textarea
                          value={formData.customFields}
                          onChange={(e) => handleChange("customFields", e.target.value)}
                          placeholder='{"field1": "value1", "field2": "value2"}'
                          rows={3}
                        />
                        <FormHelperText>Additional custom data in JSON format</FormHelperText>
                      </FormControl>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Submit Button */}
              <HStack justify="flex-end" mt={6} spacing={4} direction={{ base: "column", md: "row" }}>
                <Button
                  variant="outline"
                  onClick={() => navigate("/assets")}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ bg: cardGradientBg }}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", md: "auto" }}
                >
                  Cancel
                </Button>
                <Button
                  bg={primaryColor}
                  color="white"
                  _hover={{ bg: primaryHover }}
                  onClick={handleSubmit}
                  isLoading={creating || updating}
                  loadingText={isEditMode ? "Updating..." : "Creating..."}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", md: "auto" }}
                >
                  {isEditMode ? "Update Asset" : "Create Asset"}
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default NewAsset;