import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  useToast,
  IconButton,
  Flex,
  Avatar,
  Divider,
  Spinner,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Wrap,
  WrapItem,
  Tag,
  TableContainer,
  Table,
  useColorMode,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  EditIcon,
  DeleteIcon,
  DownloadIcon,
  CalendarIcon,
  AddIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { FaQrcode, FaTools, FaCamera, FaHistory, FaPrint } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import assetsModuleConfig from "./moduleConfig";

// GraphQL Queries and Mutations
const GET_ASSET_DETAILS = gql`
  query GetAssetDetails($id: ID!) {
    asset(id: $id) {
      id
      assetId
      name
      assetType {
        id
        name
        category
        icon
        maintenanceIntervalDays
      }
      company {
        id
        name
        address
        phone
      }
      assignedTo {
        id
        fName
        lName
        email
        phone
        profilePhoto
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
      qrCode
      publicUrl
      barcode
      lastMaintenanceDate
      nextMaintenanceDate
      maintenanceNotes
      tags
      customFields
      createdAt
      updatedAt
      logCount
    }
    assetLogs(assetId: $id) {
      id
      assetId
      createdBy {
        id
        fName
        lName
        profilePhoto
      }
      action
      description
      photos
      conditionBefore
      conditionAfter
      cost
      notes
      timestamp
      nextActionDate
    }
  }
`;

const ADD_ASSET_LOG = gql`
  mutation AddAssetLog($input: AssetLogInput!) {
    addAssetLog(input: $input) {
      id
      action
      description
      timestamp
    }
  }
`;

const DELETE_ASSET = gql`
  mutation DeleteAsset($id: ID!) {
    deleteAsset(id: $id)
  }
`;

const AssetDetails = () => {
  usePageTitle("Asset Details");
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const hasPermission = (permissions: string[]) => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions?.includes(permission));
  };
  const qrCodeRef = useRef<HTMLDivElement>(null);

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
  
  const { isOpen: isLogModalOpen, onOpen: onLogModalOpen, onClose: onLogModalClose } = useDisclosure();
  const { isOpen: isQrModalOpen, onOpen: onQrModalOpen, onClose: onQrModalClose } = useDisclosure();

  const [logForm, setLogForm] = useState({
    action: "Comment",
    description: "",
    conditionBefore: "",
    conditionAfter: "",
    cost: 0,
    notes: "",
    nextActionDate: "",
    photos: [] as string[],
  });

  const { loading, error, data, refetch } = useQuery(GET_ASSET_DETAILS, {
    variables: { id },
  });

  const [addAssetLog, { loading: addingLog }] = useMutation(ADD_ASSET_LOG, {
    onCompleted: () => {
      toast({
        title: "Log entry added",
        description: "The log entry has been added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onLogModalClose();
      refetch();
      setLogForm({
        action: "Comment",
        description: "",
        conditionBefore: "",
        conditionAfter: "",
        cost: 0,
        notes: "",
        nextActionDate: "",
        photos: [],
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding log entry",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteAsset] = useMutation(DELETE_ASSET, {
    onCompleted: () => {
      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/assets");
    },
    onError: (error) => {
      toast({
        title: "Error deleting asset",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      await deleteAsset({ variables: { id } });
    }
  };

  const handleAddLog = async () => {
    const input = {
      assetId: id!,
      ...logForm,
      cost: logForm.cost || undefined,
      nextActionDate: logForm.nextActionDate || undefined,
      conditionBefore: logForm.conditionBefore || undefined,
      conditionAfter: logForm.conditionAfter || undefined,
      photos: logForm.photos.length > 0 ? logForm.photos : undefined,
    };

    await addAssetLog({ variables: { input } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "green";
      case "IN_MAINTENANCE": return "orange";
      case "RETIRED": return "gray";
      case "DISPOSED": return "red";
      case "LOST": return "purple";
      case "DAMAGED": return "yellow";
      default: return "gray";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW": return "teal";
      case "EXCELLENT": return "green";
      case "GOOD": return "blue";
      case "FAIR": return "yellow";
      case "POOR": return "orange";
      case "BROKEN": return "red";
      default: return "gray";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Created": return "🆕";
      case "Maintenance": return "🔧";
      case "Repair": return "🔨";
      case "Inspection": return "🔍";
      case "Comment": return "💬";
      case "Status Changed": return "🔄";
      case "Condition Changed": return "📊";
      default: return "📝";
    }
  };

  const printQRCode = () => {
    if (!qrCodeRef.current) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const asset = data?.asset;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset QR Code - ${asset?.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 2px solid #000;
              border-radius: 10px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .asset-info {
              margin: 10px 0;
            }
            .asset-id {
              font-size: 24px;
              font-weight: bold;
            }
            .asset-name {
              font-size: 18px;
              margin: 10px 0;
            }
            .company {
              font-size: 14px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="asset-id">Asset ID: ${asset?.assetId}</div>
            <div class="asset-name">${asset?.name}</div>
            <div class="qr-code">
              <img src="${asset?.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            ${asset?.company ? `<div class="company">${asset.company.name}</div>` : ''}
            <div class="asset-info">Scan for details</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <VStack spacing={6}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading asset details...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.asset) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
        <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <Text color={errorRed}>Error loading asset: {error?.message || "Asset not found"}</Text>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const asset = data.asset;
  const logs = data.assetLogs || [];

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
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
                <HStack spacing={2}>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {asset.assetType?.icon} {asset.name}
                  </Text>
                  {asset.qrCode && <FaQrcode size={20} color={primaryColor} />}
                </HStack>
                <Text color={textMuted}>Asset ID: {asset.assetId}</Text>
              </Box>
            </HStack>

            <VStack spacing={2} align="stretch" display={{ base: "flex", md: "none" }}>
              <HStack spacing={2} wrap="wrap">
                <Button
                  leftIcon={<FaQrcode />}
                  onClick={onQrModalOpen}
                  variant="outline"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ bg: cardGradientBg }}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "auto", md: "auto" }}
                >
                  View QR
                </Button>
                <Button
                  leftIcon={<FaPrint />}
                  onClick={printQRCode}
                  variant="outline"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ bg: cardGradientBg }}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "auto", md: "auto" }}
                >
                  Print QR
                </Button>
              </HStack>
              <HStack spacing={2} wrap="wrap">
                <Button
                  leftIcon={<AddIcon />}
                  onClick={onLogModalOpen}
                  bg={primaryColor}
                  color="white"
                  _hover={{ bg: primaryHover }}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", md: "auto" }}
                >
                  Add Log
                </Button>
                <Button
                  leftIcon={<EditIcon />}
                  onClick={() => navigate(`/assets/edit/${asset.id}`)}
                  bg={successGreen}
                  color="white"
                  _hover={{ bg: "green.600" }}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", md: "auto" }}
                >
                  Edit
                </Button>
                {hasPermission(["ADMIN", "ASSET_MANAGER"]) && (
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete"
                    bg={errorRed}
                    color="white"
                    _hover={{ bg: "red.600" }}
                    variant="solid"
                    onClick={handleDelete}
                    size={{ base: "sm", md: "md" }}
                  />
                )}
              </HStack>
            </VStack>

            <HStack spacing={2} display={{ base: "none", md: "flex" }}>
              <Button
                leftIcon={<FaQrcode />}
                onClick={onQrModalOpen}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{ bg: cardGradientBg }}
                size={{ base: "sm", md: "md" }}
                width={{ base: "100%", md: "auto" }}
              >
                View QR
              </Button>
              <Button
                leftIcon={<FaPrint />}
                onClick={printQRCode}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{ bg: cardGradientBg }}
                size={{ base: "sm", md: "md" }}
                width={{ base: "100%", md: "auto" }}
              >
                Print QR
              </Button>
              <Button
                leftIcon={<AddIcon />}
                onClick={onLogModalOpen}
                bg={primaryColor}
                color="white"
                _hover={{ bg: primaryHover }}
                size={{ base: "sm", md: "md" }}
                width={{ base: "100%", md: "auto" }}
              >
                Add Log
              </Button>
              <Button
                leftIcon={<EditIcon />}
                onClick={() => navigate(`/assets/edit/${asset.id}`)}
                bg={successGreen}
                color="white"
                _hover={{ bg: "green.600" }}
                size={{ base: "sm", md: "md" }}
                width={{ base: "100%", md: "auto" }}
              >
                Edit
              </Button>
              {hasPermission(["ADMIN", "ASSET_MANAGER"]) && (
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete"
                  bg={errorRed}
                  color="white"
                  _hover={{ bg: "red.600" }}
                  variant="solid"
                  onClick={handleDelete}
                  size={{ base: "sm", md: "md" }}
                />
              )}
            </HStack>
          </Flex>

          {/* Status Badges */}
          <HStack spacing={4}>
            <Badge colorScheme={getStatusColor(asset.status)} fontSize="md" px={3} py={1}>
              Status: {asset.status}
            </Badge>
            <Badge colorScheme={getConditionColor(asset.condition)} fontSize="md" px={3} py={1}>
              Condition: {asset.condition}
            </Badge>
            {asset.nextMaintenanceDate && new Date(asset.nextMaintenanceDate) <= new Date() && (
              <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                ⚠️ Maintenance Overdue
              </Badge>
            )}
          </HStack>

          {/* Main Content Tabs */}
          <Tabs>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Details</Tab>
              <Tab>History ({logs.length})</Tab>
              <Tab>Maintenance</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Basic Info Card */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Basic Information</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {asset.assetType && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Type:</Text>
                            <Text color={textPrimary}>{asset.assetType.name}</Text>
                          </HStack>
                        )}
                        {asset.manufacturer && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Manufacturer:</Text>
                            <Text color={textPrimary}>{asset.manufacturer}</Text>
                          </HStack>
                        )}
                        {asset.model && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Model:</Text>
                            <Text color={textPrimary}>{asset.model}</Text>
                          </HStack>
                        )}
                        {asset.serialNumber && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Serial Number:</Text>
                            <Text color={textPrimary}>{asset.serialNumber}</Text>
                          </HStack>
                        )}
                        {asset.barcode && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Barcode:</Text>
                            <Text color={textPrimary}>{asset.barcode}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Assignment Card */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Assignment & Location</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {asset.company && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Company:</Text>
                            <Text fontWeight="medium" color={textPrimary}>{asset.company.name}</Text>
                          </Box>
                        )}
                        {asset.assignedTo && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Assigned To:</Text>
                            <HStack spacing={2} mt={1}>
                              <Avatar
                                size="sm"
                                name={`${asset.assignedTo.fName} ${asset.assignedTo.lName}`}
                                src={asset.assignedTo.profilePhoto}
                              />
                              <Box>
                                <Text fontWeight="medium" color={textPrimary}>
                                  {asset.assignedTo.fName} {asset.assignedTo.lName}
                                </Text>
                                <Text fontSize="xs" color={textSecondary}>
                                  {asset.assignedTo.email}
                                </Text>
                              </Box>
                            </HStack>
                          </Box>
                        )}
                        {asset.location && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Location:</Text>
                            <Text color={textPrimary}>
                              {[
                                asset.location.building,
                                asset.location.floor,
                                asset.location.room,
                                asset.location.section,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Not specified"}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Purchase Info Card */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Purchase Information</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {asset.purchaseDate && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Purchase Date:</Text>
                            <Text color={textPrimary}>{new Date(asset.purchaseDate).toLocaleDateString()}</Text>
                          </HStack>
                        )}
                        {asset.purchasePrice && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Purchase Price:</Text>
                            <Text color={textPrimary}>${asset.purchasePrice.toFixed(2)}</Text>
                          </HStack>
                        )}
                        {asset.supplier && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Supplier:</Text>
                            <Text color={textPrimary}>{asset.supplier}</Text>
                          </HStack>
                        )}
                        {asset.warrantyExpiry && (
                          <HStack justify="space-between" direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }}>
                            <Text color={textSecondary}>Warranty Expiry:</Text>
                            <Text color={new Date(asset.warrantyExpiry) < new Date() ? errorRed : textPrimary}>
                              {new Date(asset.warrantyExpiry).toLocaleDateString()}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Quick Stats Card */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Statistics</Text>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Stat>
                          <StatLabel color={textSecondary}>Log Entries</StatLabel>
                          <StatNumber color={textPrimary}>{logs.length}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel color={textSecondary}>Age</StatLabel>
                          <StatNumber color={textPrimary}>
                            {asset.purchaseDate
                              ? Math.floor(
                                  (new Date().getTime() - new Date(asset.purchaseDate).getTime()) /
                                    (1000 * 60 * 60 * 24 * 365)
                                )
                              : "-"}
                          </StatNumber>
                          <StatHelpText color={textSecondary}>years</StatHelpText>
                        </Stat>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Description */}
                {asset.description && (
                  <Card
                    mt={6}
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Description</Text>
                    </CardHeader>
                    <CardBody>
                      <Text color={textPrimary}>{asset.description}</Text>
                    </CardBody>
                  </Card>
                )}

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <Card
                    mt={6}
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Tags</Text>
                    </CardHeader>
                    <CardBody>
                      <Wrap>
                        {asset.tags.map((tag: string) => (
                          <WrapItem key={tag}>
                            <Tag size="md" variant="solid" bg={primaryColor} color="white">
                              {tag}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CardBody>
                  </Card>
                )}
              </TabPanel>

              {/* Details Tab */}
              <TabPanel>
                <Card
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                  borderRadius="lg"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text color={textSecondary} fontSize="sm">Created:</Text>
                          <Text color={textPrimary}>{new Date(asset.createdAt).toLocaleString()}</Text>
                        </Box>
                        <Box>
                          <Text color={textSecondary} fontSize="sm">Last Updated:</Text>
                          <Text color={textPrimary}>{new Date(asset.updatedAt).toLocaleString()}</Text>
                        </Box>
                        {asset.publicUrl && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Public URL:</Text>
                            <Link href={asset.publicUrl} isExternal color={primaryColor}>
                              {asset.publicUrl} <ExternalLinkIcon mx="2px" />
                            </Link>
                          </Box>
                        )}
                      </SimpleGrid>

                      {asset.customFields && (
                        <Box>
                          <Text fontWeight="bold" mb={2} color={textPrimary}>Custom Fields</Text>
                          <Box p={3} bg={cardGradientBg} borderRadius="md" border="1px" borderColor={cardBorder}>
                            <pre style={{ color: textPrimary, fontSize: '12px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(JSON.parse(asset.customFields), null, 2)}</pre>
                          </Box>
                        </Box>
                      )}

                      {asset.photos && asset.photos.length > 0 && (
                        <Box>
                          <Text fontWeight="bold" mb={2} color={textPrimary}>Photos</Text>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            {asset.photos.map((photo: string, index: number) => (
                              <Image
                                key={index}
                                src={photo}
                                alt={`Asset photo ${index + 1}`}
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => window.open(photo, "_blank")}
                              />
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* History Tab */}
              <TabPanel>
                <Card
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                  borderRadius="lg"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      {logs.length === 0 ? (
                        <VStack py={8}>
                          <FaHistory size={48} color="gray" />
                          <Text color={textSecondary}>No history entries yet</Text>
                          <Button
                            onClick={onLogModalOpen}
                            bg={primaryColor}
                            color="white"
                            _hover={{ bg: primaryHover }}
                            size={{ base: "sm", md: "md" }}
                            width={{ base: "100%", md: "auto" }}
                          >
                            Add First Entry
                          </Button>
                        </VStack>
                      ) : (
                        logs.map((log: any) => (
                          <Box key={log.id} p={4} borderWidth={1} borderRadius="md" borderColor={cardBorder} bg={cardGradientBg}>
                            <Flex justify="space-between" align="start">
                              <HStack align="start" spacing={3}>
                                <Text fontSize="xl">{getActionIcon(log.action)}</Text>
                                <Box flex={1}>
                                  <HStack spacing={2}>
                                    <Text fontWeight="bold" color={textPrimary}>{log.action}</Text>
                                    <Text fontSize="sm" color={textSecondary}>
                                      {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                  </HStack>
                                  {log.description && (
                                    <Text mt={1}>{log.description}</Text>
                                  )}
                                  {log.notes && (
                                    <Text mt={1} fontSize="sm" color="gray.600">
                                      Notes: {log.notes}
                                    </Text>
                                  )}
                                  {(log.conditionBefore || log.conditionAfter) && (
                                    <HStack mt={2} spacing={2}>
                                      {log.conditionBefore && (
                                        <Badge colorScheme={getConditionColor(log.conditionBefore)}>
                                          {log.conditionBefore}
                                        </Badge>
                                      )}
                                      {log.conditionBefore && log.conditionAfter && (
                                        <Text fontSize="sm">→</Text>
                                      )}
                                      {log.conditionAfter && (
                                        <Badge colorScheme={getConditionColor(log.conditionAfter)}>
                                          {log.conditionAfter}
                                        </Badge>
                                      )}
                                    </HStack>
                                  )}
                                  {log.cost && (
                                    <Text mt={1} fontSize="sm" color="orange.500">
                                      Cost: ${log.cost.toFixed(2)}
                                    </Text>
                                  )}
                                  {log.nextActionDate && (
                                    <HStack mt={1} spacing={1}>
                                      <CalendarIcon boxSize={3} />
                                      <Text fontSize="sm">
                                        Next action: {new Date(log.nextActionDate).toLocaleDateString()}
                                      </Text>
                                    </HStack>
                                  )}
                                  {log.photos && log.photos.length > 0 && (
                                    <HStack mt={2} spacing={2}>
                                      {log.photos.map((photo: string, idx: number) => (
                                        <Image
                                          key={idx}
                                          src={photo}
                                          alt={`Log photo ${idx + 1}`}
                                          boxSize="50px"
                                          objectFit="cover"
                                          borderRadius="md"
                                          cursor="pointer"
                                          onClick={() => window.open(photo, "_blank")}
                                        />
                                      ))}
                                    </HStack>
                                  )}
                                  <HStack mt={2} spacing={2}>
                                    <Avatar
                                      size="xs"
                                      name={`${log.createdBy.fName} ${log.createdBy.lName}`}
                                      src={log.createdBy.profilePhoto}
                                    />
                                    <Text fontSize="xs" color="gray.500">
                                      {log.createdBy.fName} {log.createdBy.lName}
                                    </Text>
                                  </HStack>
                                </Box>
                              </HStack>
                            </Flex>
                          </Box>
                        ))
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Maintenance Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Maintenance Schedule</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {asset.lastMaintenanceDate && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Last Maintenance:</Text>
                            <Text color={textPrimary}>{new Date(asset.lastMaintenanceDate).toLocaleDateString()}</Text>
                          </Box>
                        )}
                        {asset.nextMaintenanceDate && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Next Maintenance:</Text>
                            <Text
                              color={new Date(asset.nextMaintenanceDate) <= new Date() ? errorRed : successGreen}
                              fontWeight="bold"
                            >
                              {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                            </Text>
                          </Box>
                        )}
                        {asset.assetType?.maintenanceIntervalDays && (
                          <Box>
                            <Text color={textSecondary} fontSize="sm">Maintenance Interval:</Text>
                            <Text color={textPrimary}>Every {asset.assetType.maintenanceIntervalDays} days</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Maintenance Notes</Text>
                    </CardHeader>
                    <CardBody>
                      <Text color={textPrimary}>{asset.maintenanceNotes || "No maintenance notes available"}</Text>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <Text fontWeight="bold" color={textPrimary}>Maintenance History</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        {logs
                          .filter((log: any) => log.action === "Maintenance" || log.action === "Repair")
                          .map((log: any) => (
                            <Box key={log.id} p={2} borderWidth={1} borderRadius="md" borderColor={cardBorder} bg={cardGradientBg}>
                              <HStack justify="space-between">
                                <Text fontWeight="medium" color={textPrimary}>{log.action}</Text>
                                <Text fontSize="sm" color={textSecondary}>
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </Text>
                              </HStack>
                              {log.description && (
                                <Text fontSize="sm" mt={1} color={textPrimary}>{log.description}</Text>
                              )}
                              {log.cost && (
                                <Text fontSize="sm" color={primaryColor}>
                                  Cost: ${log.cost.toFixed(2)}
                                </Text>
                              )}
                            </Box>
                          ))}
                        {logs.filter((log: any) => log.action === "Maintenance" || log.action === "Repair").length === 0 && (
                          <Text color={textSecondary} textAlign="center" py={4}>
                            No maintenance history
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
      <FooterWithFourColumns />

      {/* Add Log Modal */}
      <Modal isOpen={isLogModalOpen} onClose={onLogModalClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} backdropFilter="blur(10px)" border="1px" borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>Add Log Entry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Action Type</FormLabel>
                <Select
                  value={logForm.action}
                  onChange={(e) => setLogForm({ ...logForm, action: e.target.value })}
                >
                  <option value="Comment">Comment</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Condition Changed">Condition Changed</option>
                  <option value="Status Changed">Status Changed</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  placeholder="Describe what was done..."
                  rows={3}
                />
              </FormControl>

              {(logForm.action === "Condition Changed" || logForm.action === "Inspection") && (
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Condition Before</FormLabel>
                    <Select
                      value={logForm.conditionBefore}
                      onChange={(e) => setLogForm({ ...logForm, conditionBefore: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="NEW">New</option>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="BROKEN">Broken</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Condition After</FormLabel>
                    <Select
                      value={logForm.conditionAfter}
                      onChange={(e) => setLogForm({ ...logForm, conditionAfter: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="NEW">New</option>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="BROKEN">Broken</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              )}

              {(logForm.action === "Maintenance" || logForm.action === "Repair") && (
                <>
                  <FormControl>
                    <FormLabel>Cost</FormLabel>
                    <NumberInput
                      value={logForm.cost}
                      onChange={(value) => setLogForm({ ...logForm, cost: Number(value) })}
                      precision={2}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Next Action Date</FormLabel>
                    <Input
                      type="date"
                      value={logForm.nextActionDate}
                      onChange={(e) => setLogForm({ ...logForm, nextActionDate: e.target.value })}
                    />
                  </FormControl>
                </>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onLogModalClose}
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
              onClick={handleAddLog}
              isLoading={addingLog}
            >
              Add Entry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} backdropFilter="blur(10px)" border="1px" borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>Asset QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} ref={qrCodeRef}>
              <Text fontWeight="bold" fontSize="lg" color={textPrimary}>
                {asset.name}
              </Text>
              <Text color={textSecondary}>ID: {asset.assetId}</Text>
              {asset.qrCode && (
                <Image
                  src={asset.qrCode}
                  alt="Asset QR Code"
                  boxSize="250px"
                  mx="auto"
                />
              )}
              <Text fontSize="sm" color={textSecondary} textAlign="center">
                Scan this code to view asset details
              </Text>
              {asset.publicUrl && (
                <Link href={asset.publicUrl} isExternal color={primaryColor} fontSize="sm">
                  {asset.publicUrl} <ExternalLinkIcon mx="2px" />
                </Link>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={printQRCode}
              leftIcon={<FaPrint />}
              bg={primaryColor}
              color="white"
              _hover={{ bg: primaryHover }}
              mr={3}
            >
              Print
            </Button>
            <Button
              onClick={onQrModalClose}
              variant="outline"
              borderColor={cardBorder}
              color={textPrimary}
              _hover={{ bg: cardGradientBg }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssetDetails;