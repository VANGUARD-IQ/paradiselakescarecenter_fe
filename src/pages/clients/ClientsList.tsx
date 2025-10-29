import React from "react";
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Button,
  Skeleton,
  useToast,
  HStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Select,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useColorMode,
} from "@chakra-ui/react";
import { ApolloCache, gql, useMutation, useQuery } from "@apollo/client";
import { EditIcon, DeleteIcon, CopyIcon, SearchIcon, CloseIcon, AddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { FiUsers, FiUserCheck, FiUserPlus, FiPhone, FiDollarSign } from "react-icons/fi";
import { getColor } from "../../brandConfig";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import clientsModuleConfig from "./moduleConfig";
import { Client, ClientPermission } from "../../generated/graphql";

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
      permissions
      tags
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

const GET_ALL_TAGS = gql`
  query GetAllClientTags {
    allClientTags
  }
`;

const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      tags
    }
  }
`;


interface DeleteClientResponse {
  deleteClient: boolean;
}

interface GetClientsResponse {
  clients: Client[];
}

const StatCard = ({
  title,
  stat,
  icon,
  color
}: {
  title: string;
  stat: number;
  icon: React.ReactNode;
  color: string;
}) => {
  const { colorMode } = useColorMode();
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  
  return (
    <Box
      p={6}
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      borderRadius="lg"
      border="1px"
      borderColor={cardBorder}
    >
      <HStack spacing={4}>
        <Box color={color}>
          {icon}
        </Box>
        <Stat>
          <StatLabel color={textSecondary}>{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textPrimary}>
            {stat}
          </StatNumber>
        </Stat>
      </HStack>
    </Box>
  );
};

const getNewClientsThisMonth = (clients?: Client[]) => {
  if (!clients) return 0;
  // Note: This is just a placeholder since we don't have a creation date in the current client data
  // You might want to add a createdAt field to your client data to make this accurate
  return Math.floor(clients.length * 0.2); // Returns 20% of total clients as an example
};

const ClientsList = () => {
  usePageTitle("Clients");
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { loading, error, data, refetch } = useQuery(GET_CLIENTS);
  const { data: tagsData } = useQuery(GET_ALL_TAGS);
  const { data: enumData } = useQuery(GET_PERMISSION_ENUM);
  const toast = useToast();
  const [deleteClientMutation, { loading: deleteLoading }] = useMutation<
    DeleteClientResponse,
    { id: string }
  >(DELETE_CLIENT);
  const [updateClientMutation] = useMutation(UPDATE_CLIENT);
  const [addPermission] = useMutation(ADD_CLIENT_PERMISSION);
  const [removePermission] = useMutation(REMOVE_CLIENT_PERMISSION);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onClose: onTagModalClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(
    null
  );
  const [clientToEdit, setClientToEdit] = React.useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState("");
  const [clientTags, setClientTags] = React.useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<{ [key: string]: string }>({});

  // Consistent styling from brandConfig with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

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
        title: "Error",
        description: "Failed to copy ID to clipboard",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
        description: error.message,
        status: "error",
        duration: 4000,
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
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    onOpen();
  };

  // Filter clients based on search and tags
  const filteredClients = React.useMemo(() => {
    if (!data?.clients) return [];
    
    let filtered = [...data.clients];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((client: Client) =>
        client.fName?.toLowerCase().includes(search) ||
        client.lName?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phoneNumber?.toLowerCase().includes(search)
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((client: Client) =>
        client.tags && selectedTags.some(tag => client.tags?.includes(tag))
      );
    }
    
    return filtered;
  }, [data?.clients, searchTerm, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  const handleManageTags = (client: Client) => {
    setClientToEdit(client);
    setClientTags(client.tags || []);
    onTagModalOpen();
  };

  const handleAddTag = () => {
    if (newTag && !clientTags.includes(newTag)) {
      setClientTags([...clientTags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setClientTags(clientTags.filter(t => t !== tag));
  };

  const handleSaveTags = async () => {
    if (!clientToEdit) return;

    try {
      await updateClientMutation({
        variables: {
          id: clientToEdit.id,
          input: { tags: clientTags }
        }
      });

      toast({
        title: "Tags updated",
        description: "Client tags have been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      refetch();
      onTagModalClose();
      setClientToEdit(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client tags",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await deleteClientMutation({
        variables: { id: clientToDelete.id },
        update(cache: ApolloCache<unknown>) {
          const existingData = cache.readQuery<GetClientsResponse>({
            query: GET_CLIENTS,
          });

          if (existingData) {
            cache.writeQuery({
              query: GET_CLIENTS,
              data: {
                clients: existingData.clients.filter(
                  (c) => c.id !== clientToDelete.id
                ),
              },
            });
          }
        },
      });

      if (response.data?.deleteClient) {
        toast({
          title: "Client deleted",
          description: `${clientToDelete.fName} ${clientToDelete.lName} has been successfully removed.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        setClientToDelete(null);
      } else {
        throw new Error("Failed to delete client");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete client",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (error) {
    toast({
      title: "Error loading clients",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={clientsModuleConfig} />
      <Container maxW="100%" px={{ base: 4, md: 8 }} py={4} flex="1">
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
        >
          <CardHeader borderBottom="1px" borderColor={cardBorder}>
            <HStack justify="space-between">
              <Heading size="lg" color={textPrimary}>👥 Clients</Heading>
              <Button
                bg={colorMode === 'light' ? "#007AFF" : "white"}
                color={colorMode === 'light' ? "white" : "black"}
                _hover={{
                  bg: colorMode === 'light' ? "#0051D0" : "gray.100",
                  transform: "translateY(-2px)"
                }}
                onClick={() => navigate("/newclient")}
                boxShadow={colorMode === 'light'
                  ? "0 2px 4px rgba(0, 122, 255, 0.2)"
                  : "0 2px 4px rgba(255, 255, 255, 0.1)"}
              >
                New Client
              </Button>
            </HStack>
          </CardHeader>

          <Box px={6} pb={4}>
            <Alert
              status="info"
              mb={4}
              bg={colorMode === 'light'
                ? "rgba(0, 122, 255, 0.05)"
                : "rgba(59, 130, 246, 0.1)"}
              borderColor={colorMode === 'light'
                ? "rgba(0, 122, 255, 0.2)"
                : "rgba(59, 130, 246, 0.3)"}
              borderWidth="1px"
            >
              <AlertIcon color={colorMode === 'light' ? "#007AFF" : "#3B82F6"} />
              <Box>
                <AlertTitle color={textPrimary}>Practitioner ID Information</AlertTitle>
                <AlertDescription color={textSecondary}>
                  Each client has a unique ID that serves as their Practitioner ID. When booking appointments with other clients,
                  this same ID is referred to as the Practitioner ID. Click any ID below to copy it for lookup or booking purposes.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Search and Filter Section */}
            <VStack spacing={4} mb={6}>
              {/* Search Input */}
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={textMuted} />
                </InputLeftElement>
                <Input
                  placeholder="Search clients by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={colorMode === 'light'
                    ? "white"
                    : "rgba(255, 255, 255, 0.05)"}
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: colorMode === 'light'
                      ? "0 0 0 1px #007AFF"
                      : "0 0 0 1px #3B82F6",
                  }}
                />
              </InputGroup>

              {/* Tag Filter */}
              {tagsData?.allClientTags && tagsData.allClientTags.length > 0 && (
                <Box width="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={textSecondary}>Filter by Tags:</Text>
                    {(selectedTags.length > 0 || searchTerm) && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={clearFilters}
                        color={textSecondary}
                        leftIcon={<CloseIcon />}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </HStack>
                  <Wrap spacing={2}>
                    {tagsData.allClientTags.map((tag: string) => (
                      <WrapItem key={tag}>
                        <Tag
                          size="md"
                          variant={selectedTags.includes(tag) ? "solid" : "outline"}
                          colorScheme={selectedTags.includes(tag) ? "blue" : "gray"}
                          cursor="pointer"
                          onClick={() => handleTagToggle(tag)}
                          borderColor={selectedTags.includes(tag) ? "#3B82F6" : cardBorder}
                          _hover={{
                            transform: "scale(1.05)",
                            boxShadow: "0 0 0 1px #3B82F6",
                          }}
                        >
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

              {/* Active Filters Display */}
              {(searchTerm || selectedTags.length > 0) && (
                <HStack
                  width="100%"
                  justify="space-between"
                  p={3}
                  bg={colorMode === 'light'
                    ? "rgba(0, 122, 255, 0.05)"
                    : "rgba(59, 130, 246, 0.1)"}
                  borderRadius="md"
                >
                  <Text fontSize="sm" color={textPrimary}>
                    Showing {filteredClients.length} of {data?.clients?.length || 0} clients
                  </Text>
                  {selectedTags.length > 0 && (
                    <Badge colorScheme="blue" fontSize="xs">
                      {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <StatCard
                title="Total Clients"
                stat={filteredClients.length}
                icon={<FiUsers size="3em" />}
                color="#3B82F6"
              />
              <StatCard
                title="Active Clients"
                stat={filteredClients.filter((client: Client) => client.email).length}
                icon={<FiUserCheck size="3em" />}
                color="#22C55E"
              />
              <StatCard
                title="New This Month"
                stat={getNewClientsThisMonth(filteredClients)}
                icon={<FiUserPlus size="3em" />}
                color="#A855F7"
              />
              <StatCard
                title="With Phone Numbers"
                stat={filteredClients.filter((client: Client) => client.phoneNumber).length}
                icon={<FiPhone size="3em" />}
                color="#FB923C"
              />
            </SimpleGrid>
          </Box>

          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color={textSecondary} borderColor={cardBorder}>Client/Practitioner ID</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Name</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Email</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Phone</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Permissions</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Tags</Th>
                    <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    // Loading state with skeleton rows
                    [...Array(3)].map((_, index) => (
                      <Tr key={`skeleton-${index}`}>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                      </Tr>
                    ))
                  ) : filteredClients.length ? (
                    // Actual data rows
                    filteredClients.map((client: Client) => (
                      <Tr key={client.id}>
                        <Td borderColor={cardBorder}>
                          <Tooltip label="Click to copy ID" hasArrow>
                            <HStack
                              spacing={2}
                              cursor="pointer"
                              onClick={() => handleCopyId(client.id)}
                              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                              p={1}
                              borderRadius="md"
                            >
                              <Code
                                fontSize="xs"
                                wordBreak="break-all"
                                bg={colorMode === 'light'
                                  ? "rgba(0, 122, 255, 0.1)"
                                  : "rgba(59, 130, 246, 0.2)"}
                                color={colorMode === 'light' ? "#007AFF" : "#3B82F6"}
                                border="1px solid"
                                borderColor={colorMode === 'light'
                                  ? "rgba(0, 122, 255, 0.2)"
                                  : "rgba(59, 130, 246, 0.3)"}
                              >
                                {client.id}
                              </Code>
                              <CopyIcon boxSize={3} color={textMuted} />
                            </HStack>
                          </Tooltip>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <Text 
                            fontWeight="medium" 
                            color={textPrimary}
                            cursor="pointer"
                            _hover={{ color: "#3B82F6", textDecoration: "underline" }}
                            onClick={() => window.open(`/client/${client.id}`, '_blank')}
                          >
                            {`${client.fName} ${client.lName}`}
                          </Text>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <Text fontSize="sm" color={textSecondary}>{client.email}</Text>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <Text fontSize="sm" color={textSecondary}>{client.phoneNumber}</Text>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <VStack align="start" spacing={2}>
                            <Wrap spacing={1}>
                              {client.permissions && client.permissions.length > 0 ? (
                                client.permissions.map((permission: string) => (
                                  <WrapItem key={permission}>
                                    <Badge
                                      size="sm"
                                      colorScheme="purple"
                                      variant="subtle"
                                      fontSize="xs"
                                      pr={1}
                                    >
                                      {permission}
                                      <IconButton
                                        aria-label="Remove permission"
                                        icon={<SmallCloseIcon />}
                                        size="xs"
                                        variant="ghost"
                                        ml={1}
                                        minW="auto"
                                        h="auto"
                                        color="purple.500"
                                        _hover={{ color: "red.500" }}
                                        onClick={() => handleRemovePermission(client.id, permission)}
                                      />
                                    </Badge>
                                  </WrapItem>
                                ))
                              ) : (
                                <Text fontSize="xs" color={textMuted}>No permissions</Text>
                              )}
                            </Wrap>
                            <HStack spacing={2}>
                              <Select
                                size="xs"
                                placeholder="Add permission..."
                                value={selectedPermissions[client.id] || ""}
                                onChange={(e) => setSelectedPermissions({
                                  ...selectedPermissions,
                                  [client.id]: e.target.value
                                })}
                                bg="rgba(147, 51, 234, 0.1)"
                                borderColor="rgba(147, 51, 234, 0.3)"
                                color={textPrimary}
                                _hover={{ borderColor: "rgba(147, 51, 234, 0.5)" }}
                                fontSize="xs"
                                maxW="150px"
                              >
                                {availablePermissions
                                  .filter((p: string) => !client.permissions?.includes(p as ClientPermission))
                                  .map((permission: string) => (
                                    <option key={permission} value={permission}>
                                      {permission}
                                    </option>
                                  ))}
                              </Select>
                              {selectedPermissions[client.id] && (
                                <IconButton
                                  aria-label="Add permission"
                                  icon={<AddIcon />}
                                  size="xs"
                                  colorScheme="purple"
                                  onClick={() => handleAddPermission(client.id)}
                                />
                              )}
                            </HStack>
                          </VStack>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <HStack spacing={2}>
                            <Wrap spacing={1} flex="1">
                              {client.tags && client.tags.length > 0 ? (
                                client.tags.map((tag: string) => (
                                  <WrapItem key={tag}>
                                    <Tag
                                      size="sm"
                                      variant="subtle"
                                      colorScheme="blue"
                                    >
                                      <TagLabel>{tag}</TagLabel>
                                    </Tag>
                                  </WrapItem>
                                ))
                              ) : (
                                <Text fontSize="sm" color={textMuted}>No tags</Text>
                              )}
                            </Wrap>
                            <IconButton
                              aria-label="Manage tags"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleManageTags(client)}
                              _hover={{ bg: "rgba(59, 130, 246, 0.2)" }}
                            />
                          </HStack>
                        </Td>
                        <Td borderColor={cardBorder}>
                          <HStack spacing={2}>
                            <Tooltip label="Create Opportunity" hasArrow>
                              <IconButton
                                aria-label="Create opportunity"
                                icon={<FiDollarSign />}
                                size="sm"
                                bg="rgba(34, 197, 94, 0.2)"
                                color="#22C55E"
                                border="1px solid"
                                borderColor="rgba(34, 197, 94, 0.3)"
                                _hover={{ bg: "rgba(34, 197, 94, 0.3)" }}
                                onClick={() => navigate(`/opportunities/new?clientId=${client.id}`)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Client" hasArrow>
                              <IconButton
                                aria-label="Delete client"
                                icon={<DeleteIcon />}
                                size="sm"
                                bg="rgba(239, 68, 68, 0.2)"
                                color="#EF4444"
                                border="1px solid"
                                borderColor="rgba(239, 68, 68, 0.3)"
                                _hover={{ bg: "rgba(239, 68, 68, 0.3)" }}
                                onClick={() => handleDelete(client)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    // No data state
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8} borderColor={cardBorder}>
                        <Text color={textMuted}>No clients found</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Container>
      <FooterWithFourColumns />
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay bg="rgba(0, 0, 0, 0.8)">
          <AlertDialogContent 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            border="1px"
            borderColor={cardBorder}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textPrimary} borderBottom="1px" borderColor={cardBorder}>
              Delete Client
            </AlertDialogHeader>

            <AlertDialogBody color={textSecondary}>
              Are you sure you want to delete {clientToDelete?.fName} {clientToDelete?.lName}? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter borderTop="1px" borderColor={cardBorder}>
              <Button 
                ref={cancelRef} 
                onClick={onClose}
                variant="ghost"
                color={textPrimary}
                _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              >
                Cancel
              </Button>
              <Button
                bg="#EF4444"
                color="white"
                _hover={{ bg: "#DC2626" }}
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Tag Management Modal */}
      <Modal isOpen={isTagModalOpen} onClose={onTagModalClose} size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          border="1px"
          borderColor={cardBorder}
        >
          <ModalHeader color={textPrimary} borderBottom="1px" borderColor={cardBorder}>
            Manage Tags for {clientToEdit?.fName} {clientToEdit?.lName}
          </ModalHeader>
          <ModalCloseButton color={textPrimary} />
          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={textSecondary}>Current Tags</FormLabel>
                <Wrap spacing={2}>
                  {clientTags.length > 0 ? (
                    clientTags.map((tag) => (
                      <WrapItem key={tag}>
                        <Tag size="md" variant="solid" colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                        </Tag>
                      </WrapItem>
                    ))
                  ) : (
                    <Text color={textMuted}>No tags added yet</Text>
                  )}
                </Wrap>
              </FormControl>

              <FormControl>
                <FormLabel color={textSecondary}>Add New Tag</FormLabel>
                <HStack>
                  <Input
                    placeholder="Enter tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                    bg="rgba(255, 255, 255, 0.05)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleAddTag}
                    bg="#3B82F6"
                    _hover={{ bg: "#2563EB" }}
                  >
                    Add
                  </Button>
                </HStack>
              </FormControl>

              {tagsData?.allClientTags && tagsData.allClientTags.length > 0 && (
                <FormControl>
                  <FormLabel color={textSecondary}>Existing Tags</FormLabel>
                  <Wrap spacing={2}>
                    {tagsData.allClientTags
                      .filter((tag: string) => !clientTags.includes(tag))
                      .map((tag: string) => (
                        <WrapItem key={tag}>
                          <Tag
                            size="sm"
                            variant="outline"
                            colorScheme="gray"
                            cursor="pointer"
                            onClick={() => setClientTags([...clientTags, tag])}
                            _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                          >
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                  </Wrap>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={cardBorder}>
            <Button
              variant="ghost"
              mr={3}
              onClick={onTagModalClose}
              color={textPrimary}
              _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveTags}
              bg="#3B82F6"
              _hover={{ bg: "#2563EB" }}
            >
              Save Tags
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ClientsList;
