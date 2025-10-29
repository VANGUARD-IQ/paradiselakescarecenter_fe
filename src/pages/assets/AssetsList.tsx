import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Flex,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useBreakpointValue,
  Spinner,
  Avatar,
  Divider,
  Image,
  Heading,
  TableContainer,
  useColorMode,
} from "@chakra-ui/react";
import {
  SearchIcon,
  AddIcon,
  ChevronDownIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  DownloadIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import { FaQrcode, FaTools, FaBoxOpen, FaClipboardCheck } from "react-icons/fa";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import assetsModuleConfig from "./moduleConfig";

// GraphQL Queries
const GET_ASSETS = gql`
  query GetAssets {
    assets {
      id
      assetId
      name
      assetType {
        id
        name
        category
        icon
      }
      company {
        id
        name
      }
      assignedTo {
        id
        fName
        lName
        profilePhoto
      }
      manufacturer
      model
      serialNumber
      status
      condition
      location {
        building
        floor
        room
      }
      purchaseDate
      nextMaintenanceDate
      tags
      qrCode
      photos
    }
    assetStats
    assetTypes {
      id
      name
      category
      icon
    }
  }
`;

const DELETE_ASSET = gql`
  mutation DeleteAsset($id: ID!) {
    deleteAsset(id: $id)
  }
`;

const AssetsList = () => {
  usePageTitle("Assets");
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const hasPermission = (permissions: string[]) => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions?.includes(permission));
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  
  // Brand styling
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
  const warningColor = getColor("status.warning", colorMode);
  const infoBlue = getColor("status.info", colorMode);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });

  const { loading, error, data, refetch } = useQuery(GET_ASSETS);
  const [deleteAsset] = useMutation(DELETE_ASSET, {
    onCompleted: () => {
      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
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

  // Filter assets based on search and filters
  const filteredAssets = data?.assets?.filter((asset: any) => {
    const matchesSearch = 
      searchTerm === "" ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    const matchesType = filterType === "all" || asset.assetType?.id === filterType;
    const matchesCondition = filterCondition === "all" || asset.condition === filterCondition;

    return matchesSearch && matchesStatus && matchesType && matchesCondition;
  }) || [];

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset({ variables: { id } });
    }
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

  const stats = data?.assetStats || [0, 0, 0, 0];

  if (loading) return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" py={8} flex="1">
        <VStack spacing={6}>
          <Spinner size="xl" color={primaryColor} />
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
  
  if (error) return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" py={8} flex="1">
        <Text color={errorRed}>Error loading assets: {error.message}</Text>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={assetsModuleConfig} />
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>Assets</Heading>
              <Text color={textSecondary}>Manage and track company assets</Text>
            </Box>
            <Button
              bg={primaryColor}
              color="white"
              _hover={{ bg: primaryHover }}
              leftIcon={<AddIcon />}
              onClick={() => navigate("/assets/new")}
              size={{ base: "sm", md: "md" }}
              width={{ base: "100%", md: "auto" }}
            >
              Add Asset
            </Button>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                <Stat>
                  <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Total Assets</StatLabel>
                  <StatNumber color={textPrimary} fontSize={{ base: "xl", md: "2xl" }}>{stats[0]}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                <Stat>
                  <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Active</StatLabel>
                  <StatNumber color={successGreen} fontSize={{ base: "xl", md: "2xl" }}>{stats[1]}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                <Stat>
                  <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>In Maintenance</StatLabel>
                  <StatNumber color={warningColor} fontSize={{ base: "xl", md: "2xl" }}>{stats[2]}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                <Stat>
                  <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Need Maintenance</StatLabel>
                  <StatNumber color={errorRed} fontSize={{ base: "xl", md: "2xl" }}>{stats[3]}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <Flex gap={{ base: 3, md: 4 }} wrap="wrap" direction={{ base: "column", md: "row" }}>
                <InputGroup maxW={{ base: "100%", md: "300px" }}>
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                    borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                      boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                    }}
                  />
                </InputGroup>

                <Select
                  maxW={{ base: "100%", md: "150px" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                  color={textPrimary}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="IN_MAINTENANCE">In Maintenance</option>
                  <option value="RETIRED">Retired</option>
                  <option value="DISPOSED">Disposed</option>
                  <option value="LOST">Lost</option>
                  <option value="DAMAGED">Damaged</option>
                </Select>

                <Select
                  maxW={{ base: "100%", md: "150px" }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                  color={textPrimary}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                  }}
                >
                  <option value="all">All Types</option>
                  {data?.assetTypes?.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </Select>

                <Select
                  maxW={{ base: "100%", md: "150px" }}
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={colorMode === 'light' ? "gray.200" : cardBorder}
                  color={textPrimary}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(0, 122, 255, 0.2)" : "0 0 0 1px rgba(59, 130, 246, 0.2)"
                  }}
                >
                  <option value="all">All Conditions</option>
                  <option value="NEW">New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="BROKEN">Broken</option>
                </Select>
              </Flex>
            </CardBody>
          </Card>

          {/* Assets List/Table */}
          {isMobile ? (
            // Mobile Card View
            <VStack spacing={4}>
              {filteredAssets.map((asset: any) => (
                <Card 
                  key={asset.id} 
                  w="full" 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  borderRadius="lg"
                  _hover={{ 
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack>
                          <Text fontSize="lg" fontWeight="bold">
                            {asset.assetType?.icon} {asset.name}
                          </Text>
                          {asset.qrCode && <FaQrcode color="gray" />}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          ID: {asset.assetId}
                        </Text>
                        {asset.manufacturer && asset.model && (
                          <Text fontSize="sm">
                            {asset.manufacturer} {asset.model}
                          </Text>
                        )}
                        <HStack spacing={2}>
                          <Badge colorScheme={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <Badge colorScheme={getConditionColor(asset.condition)}>
                            {asset.condition}
                          </Badge>
                        </HStack>
                        {asset.company && (
                          <Text fontSize="sm">Company: {asset.company.name}</Text>
                        )}
                        {asset.assignedTo && (
                          <HStack spacing={2}>
                            <Avatar
                              size="xs"
                              name={`${asset.assignedTo.fName} ${asset.assignedTo.lName}`}
                              src={asset.assignedTo.profilePhoto}
                            />
                            <Text fontSize="sm">
                              {asset.assignedTo.fName} {asset.assignedTo.lName}
                            </Text>
                          </HStack>
                        )}
                        {asset.location && (
                          <Text fontSize="xs" color="gray.500">
                            📍 {[asset.location.building, asset.location.floor, asset.location.room]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                        )}
                        {asset.nextMaintenanceDate && (
                          <HStack spacing={1}>
                            <CalendarIcon boxSize={3} color="orange.500" />
                            <Text fontSize="xs" color="orange.500">
                              Next maintenance: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                            </Text>
                          </HStack>
                        )}
                      </VStack>

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<ChevronDownIcon />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<ViewIcon />} onClick={() => navigate(`/assets/${asset.id}`)}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<EditIcon />} onClick={() => navigate(`/assets/edit/${asset.id}`)}>
                            Edit
                          </MenuItem>
                          <MenuItem icon={<FaQrcode />} onClick={() => navigate(`/assets/${asset.id}/qr`)}>
                            View QR Code
                          </MenuItem>
                          <MenuItem icon={<FaTools />} onClick={() => navigate(`/assets/${asset.id}/maintenance`)}>
                            Log Maintenance
                          </MenuItem>
                          {hasPermission(["ADMIN", "ASSET_MANAGER"]) && (
                            <MenuItem 
                              icon={<DeleteIcon />} 
                              color="red.500"
                              onClick={() => handleDelete(asset.id)}
                            >
                              Delete
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            // Desktop Table View
            <Card>
              <CardBody overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Asset</Th>
                      <Th>Type</Th>
                      <Th>Company</Th>
                      <Th>Assigned To</Th>
                      <Th>Status</Th>
                      <Th>Condition</Th>
                      <Th>Location</Th>
                      <Th>Next Maintenance</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAssets.map((asset: any) => (
                      <Tr key={asset.id} _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)" }}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Text fontWeight="bold">{asset.name}</Text>
                              {asset.qrCode && <FaQrcode size={12} color="gray" />}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">ID: {asset.assetId}</Text>
                            {asset.manufacturer && (
                              <Text fontSize="xs" color="gray.500">
                                {asset.manufacturer} {asset.model}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text>{asset.assetType?.icon} {asset.assetType?.name}</Text>
                        </Td>
                        <Td>{asset.company?.name || "-"}</Td>
                        <Td>
                          {asset.assignedTo ? (
                            <HStack spacing={2}>
                              <Avatar
                                size="xs"
                                name={`${asset.assignedTo.fName} ${asset.assignedTo.lName}`}
                                src={asset.assignedTo.profilePhoto}
                              />
                              <Text fontSize="sm">
                                {asset.assignedTo.fName} {asset.assignedTo.lName}
                              </Text>
                            </HStack>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getConditionColor(asset.condition)}>
                            {asset.condition}
                          </Badge>
                        </Td>
                        <Td>
                          {asset.location ? (
                            <Text fontSize="sm">
                              {[asset.location.building, asset.location.floor, asset.location.room]
                                .filter(Boolean)
                                .join(", ")}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {asset.nextMaintenanceDate ? (
                            <Text fontSize="sm" color={new Date(asset.nextMaintenanceDate) <= new Date() ? "red.500" : "inherit"}>
                              {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<ChevronDownIcon />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem icon={<ViewIcon />} onClick={() => navigate(`/assets/${asset.id}`)}>
                                View Details
                              </MenuItem>
                              <MenuItem icon={<EditIcon />} onClick={() => navigate(`/assets/edit/${asset.id}`)}>
                                Edit
                              </MenuItem>
                              <MenuItem icon={<FaQrcode />} onClick={() => navigate(`/assets/${asset.id}/qr`)}>
                                View QR Code
                              </MenuItem>
                              <MenuItem icon={<FaTools />} onClick={() => navigate(`/assets/${asset.id}/maintenance`)}>
                                Log Maintenance
                              </MenuItem>
                              {hasPermission(["ADMIN", "ASSET_MANAGER"]) && (
                                <MenuItem 
                                  icon={<DeleteIcon />} 
                                  color="red.500"
                                  onClick={() => handleDelete(asset.id)}
                                >
                                  Delete
                                </MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )}

          {filteredAssets.length === 0 && (
            <Card>
              <CardBody>
                <VStack spacing={4} py={8}>
                  <FaBoxOpen size={48} color={textMuted} />
                  <Text color={textMuted}>No assets found</Text>
                  <Button
                    bg={primaryColor}
                    color="white"
                    _hover={{ bg: primaryHover }}
                    leftIcon={<AddIcon />}
                    onClick={() => navigate("/assets/new")}
                  >
                    Add First Asset
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default AssetsList;