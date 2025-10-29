import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useToast,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Container,
  Center,
  Icon,
  Tooltip,
  Code,
  useColorMode,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, CopyIcon } from "@chakra-ui/icons";
import { FiLock } from "react-icons/fi";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor } from "../../brandConfig";
import { useAuth } from "../../contexts/AuthContext";
import { ClickablePermissionBadge } from "./components/PermissionBadge";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import clientsModuleConfig from "./moduleConfig";

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
      permissions
      createdAt
    }
  }
`;

const GET_PERMISSION_ENUM = gql`
  query GetPermissionEnum {
    __type(name: "ClientPermission") {
      enumValues {
        name
        description
      }
    }
  }
`;

const ADD_CLIENT_PERMISSION = gql`
  mutation AddClientPermission($clientId: ID!, $permission: ClientPermission!) {
    addClientPermission(clientId: $clientId, permission: $permission) {
      id
      permissions
    }
  }
`;

const REMOVE_CLIENT_PERMISSION = gql`
  mutation RemoveClientPermission($clientId: ID!, $permission: ClientPermission!) {
    removeClientPermission(clientId: $clientId, permission: $permission) {
      id
      permissions
    }
  }
`;

const Permissions: React.FC = () => {
  usePageTitle("Client Permissions");
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: string }>({});

  // Consistent styling from brandConfig with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const hasPermission = user?.permissions?.includes("CLIENT_PERMISSIONS_MANAGEMENT");

  const { data, loading, error, refetch } = useQuery(GET_CLIENTS, {
    skip: !isAuthenticated || !hasPermission,
  });
  const { data: enumData } = useQuery(GET_PERMISSION_ENUM, {
    skip: !isAuthenticated || !hasPermission,
  });
  const [addPermission] = useMutation(ADD_CLIENT_PERMISSION);
  const [removePermission] = useMutation(REMOVE_CLIENT_PERMISSION);

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access permissions management",
        status: "warning",
        duration: 3000,
      });
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  // Get available permissions from GraphQL schema
  const availablePermissions = enumData?.__type?.enumValues?.map((v: any) => v.name) || [];

  const handleAddPermission = async (clientId: string) => {
    const permission = selectedPermissions[clientId];
    if (!permission) {
      toast({
        title: "No permission selected",
        description: "Please select a permission to add",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addPermission({
        variables: { clientId, permission },
      });
      
      toast({
        title: "Permission added",
        description: `Successfully added ${permission} permission`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      refetch();
      setSelectedPermissions({ ...selectedPermissions, [clientId]: "" });
    } catch (error: any) {
      toast({
        title: "Error adding permission",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemovePermission = async (clientId: string, permission: string) => {
    try {
      await removePermission({
        variables: { clientId, permission },
      });
      
      toast({
        title: "Permission removed",
        description: `Successfully removed ${permission} permission`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing permission",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast({
        title: "ID Copied",
        description: "Client ID has been copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy ID to clipboard",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredClients = data?.clients?.filter((client: any) => {
    const fullName = `${client.fName || ""} ${client.lName || ""} ${client.email || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="100%" px={{ base: 4, md: 8 }} flex="1" py={8}>
          <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
            <Spinner size="xl" color={textPrimary} />
          </Box>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Container maxW="100%" px={{ base: 4, md: 8 }} flex="1" py={8}>
          <Alert status="error">
            <AlertIcon />
            Error loading clients: {error.message}
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={clientsModuleConfig} />
      <Container maxW="100%" px={{ base: 4, md: 8 }} flex="1" py={4}>
        {/* Show access denied if user doesn't have permission */}
        {!authLoading && isAuthenticated && !hasPermission ? (
          <Center minH="50vh">
            <VStack spacing={6}>
              <Icon as={FiLock} boxSize={16} color={textMuted} />
              <Heading size="lg" color={textPrimary}>
                Access Denied
              </Heading>
              <Text color={textMuted} textAlign="center" maxW="md">
                You need CLIENT_PERMISSIONS_MANAGEMENT permission to access this page. Please contact your administrator to request access.
              </Text>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                _hover={{
                  borderColor: textSecondary,
                  bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)"
                }}
              >
                Go to Home
              </Button>
            </VStack>
          </Center>
        ) : (
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg" color={textPrimary}>🔐 Client Permissions Management</Heading>
        </HStack>

        <VStack spacing={3} align="stretch">
          <Alert
            status="info"
            bg={colorMode === 'light' ? "rgba(0, 122, 255, 0.05)" : "rgba(59, 130, 246, 0.1)"}
            borderColor={colorMode === 'light' ? "rgba(0, 122, 255, 0.2)" : "rgba(59, 130, 246, 0.3)"}
            borderWidth="1px"
          >
            <AlertIcon color={colorMode === 'light' ? "#007AFF" : "#3B82F6"} />
            <Text fontSize="sm" color={textSecondary}>
              Permissions are predefined in the system. To add new permission types, 
              please contact your system administrator to update the backend configuration.
            </Text>
          </Alert>
          
          <Alert
            status="success"
            bg={colorMode === 'light' ? "rgba(34, 197, 94, 0.05)" : "rgba(34, 197, 94, 0.1)"}
            borderColor={colorMode === 'light' ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.3)"}
            borderWidth="1px"
          >
            <AlertIcon color="#22C55E" />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color={textSecondary} fontWeight="bold">
                💡 Interactive Permission Badges
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                • Click any permission badge to open an interactive tooltip
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                • Click individual links in the tooltip to open specific pages
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                • Click outside the tooltip or use the X button to close it
              </Text>
            </VStack>
          </Alert>
        </VStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={textMuted} />
          </InputLeftElement>
          <Input
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
            borderColor={cardBorder}
            color={textPrimary}
            _placeholder={{ color: textMuted }}
            _hover={{ borderColor: textSecondary }}
            _focus={{
              borderColor: colorMode === 'light' ? "#007AFF" : textSecondary,
              boxShadow: colorMode === 'light'
                ? "0 0 0 1px rgba(0, 122, 255, 0.2)"
                : "0 0 0 1px rgba(255, 255, 255, 0.1)"
            }}
          />
        </InputGroup>

        <Box 
          overflowX="auto"
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          borderRadius="md"
          border="1px"
          borderColor={cardBorder}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color={textSecondary}>ID</Th>
                <Th color={textSecondary}>Client</Th>
                <Th color={textSecondary}>Email</Th>
                <Th color={textSecondary}>Phone</Th>
                <Th color={textSecondary}>Created</Th>
                <Th color={textSecondary}>Current Permissions</Th>
                <Th color={textSecondary}>Add Permission</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClients?.map((client: any) => (
                <Tr key={client.id}>
                  <Td>
                    <Tooltip label="Click to copy ID" hasArrow>
                      <HStack
                        spacing={2}
                        cursor="pointer"
                        onClick={() => handleCopyId(client.id)}
                        _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)" }}
                        p={1}
                        borderRadius="md"
                      >
                        <Code
                          fontSize="xs"
                          bg={colorMode === 'light' ? "rgba(0, 122, 255, 0.1)" : "rgba(59, 130, 246, 0.2)"}
                          color={colorMode === 'light' ? "#007AFF" : "#3B82F6"}
                          border="1px solid"
                          borderColor={colorMode === 'light' ? "rgba(0, 122, 255, 0.2)" : "rgba(59, 130, 246, 0.3)"}
                          whiteSpace="nowrap"
                        >
                          {client.id}
                        </Code>
                        <CopyIcon boxSize={3} color={textMuted} />
                      </HStack>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Text fontWeight="medium" color={textPrimary}>
                      {client.fName} {client.lName}
                    </Text>
                  </Td>
                  <Td>
                    <Text color={textSecondary}>{client.email}</Text>
                  </Td>
                  <Td>
                    <Text color={textSecondary}>{client.phoneNumber || '-'}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={textMuted}>
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={2} wrap="wrap">
                      {client.permissions?.map((permission: string) => (
                        <ClickablePermissionBadge
                          key={permission}
                          permission={permission}
                          showTooltip={true}
                          onRemove={() => handleRemovePermission(client.id, permission)}
                        />
                      ))}
                      {(!client.permissions || client.permissions.length === 0) && (
                        <Text color={textMuted} fontSize="sm">No permissions</Text>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Select
                        placeholder="Select permission"
                        size="sm"
                        value={selectedPermissions[client.id] || ""}
                        onChange={(e) =>
                          setSelectedPermissions({
                            ...selectedPermissions,
                            [client.id]: e.target.value,
                          })
                        }
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                      >
                        {availablePermissions.filter(
                          (perm: string) => !client.permissions?.includes(perm)
                        ).map((permission: string) => (
                          <option key={permission} value={permission} style={{ backgroundColor: '#1a1a1a' }}>
                            {permission}
                          </option>
                        ))}
                      </Select>
                      <IconButton
                        aria-label="Add permission"
                        icon={<AddIcon />}
                        size="sm"
                        bg="white"
                        color="black"
                        _hover={{
                          bg: "gray.100",
                          transform: "translateY(-2px)"
                        }}
                        onClick={() => handleAddPermission(client.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {filteredClients?.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color={textMuted}>No clients found matching your search.</Text>
          </Box>
        )}
      </VStack>
      )}
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default Permissions;