import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Switch,
    useToast,
    Avatar,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Icon,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Checkbox,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorMode,
} from "@chakra-ui/react";
import { SearchIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { FaUserShield, FaUserCog, FaUserLock, FaHistory, FaShieldAlt, FaUser, FaUsers, FaKey } from "react-icons/fa";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import passwordsModuleConfig from "./moduleConfig";
import { format } from "date-fns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { Client, ClientPermission } from "../../generated/graphql";

// GraphQL Queries and Mutations
const GET_CLIENTS_WITH_PERMISSIONS = gql`
    query GetClientsWithPermissions {
        clients {
            id
            fName
            lName
            email
            phoneNumber
            permissions
            createdAt
            updatedAt
        }
    }
`;

const UPDATE_CLIENT_PERMISSIONS = gql`
    mutation UpdateClient($id: ID!, $input: ClientInput!) {
        updateClient(id: $id, input: $input) {
            id
            permissions
        }
    }
`;


const PasswordPermissions: React.FC = () => {
    usePageTitle("Password Permissions");
    const toast = useToast();
    const { colorMode } = useColorMode();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure();
    
    // Brand styling
    const bgMain = getColor("background.main", colorMode);
    const bgCard = getColor("background.cardGradient", colorMode);
    const borderCard = getColor("border.darkCard", colorMode);
    const primaryColor = getColor("primary", colorMode);
    const primaryHover = getColor("primaryHover", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const successGreen = getColor("successGreen", colorMode);
    const errorRed = getColor("status.error", colorMode);
    const warningYellow = getColor("status.warning", colorMode);
    const infoBlue = getColor("status.info", colorMode);

    // Queries
    const { data: clientsData, loading: clientsLoading, refetch: refetchClients } = useQuery(GET_CLIENTS_WITH_PERMISSIONS);

    // Mutations
    const [updatePermissions] = useMutation(UPDATE_CLIENT_PERMISSIONS, {
        onCompleted: () => {
            toast({
                title: "Permissions updated",
                description: "Client permissions have been successfully updated.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetchClients();
        },
        onError: (error) => {
            toast({
                title: "Error updating permissions",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    });

    // Calculate stats
    const stats = React.useMemo(() => {
        if (!clientsData?.clients) return { total: 0, admins: 0, users: 0 };
        
        const clients = clientsData.clients;
        return {
            total: clients.length,
            admins: clients.filter((c: Client) => c.permissions?.includes(ClientPermission.PasswordAdmin)).length,
            users: clients.filter((c: Client) => c.permissions?.includes(ClientPermission.PasswordUser)).length,
        };
    }, [clientsData]);

    // Filter clients based on role and search
    const filteredClients = React.useMemo(() => {
        if (!clientsData?.clients) return [];
        
        let filtered = [...clientsData.clients];
        
        // Filter by role
        if (filterRole === "admin") {
            filtered = filtered.filter(c => c.permissions?.includes("PASSWORD_ADMIN"));
        } else if (filterRole === "user") {
            filtered = filtered.filter(c => c.permissions?.includes("PASSWORD_USER") && !c.permissions?.includes("PASSWORD_ADMIN"));
        } else if (filterRole === "none") {
            filtered = filtered.filter(c => !c.permissions?.includes("PASSWORD_ADMIN") && !c.permissions?.includes("PASSWORD_USER"));
        }
        
        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.fName?.toLowerCase().includes(search) ||
                c.lName?.toLowerCase().includes(search) ||
                c.email?.toLowerCase().includes(search) ||
                c.phoneNumber?.includes(search)
            );
        }
        
        return filtered;
    }, [clientsData, filterRole, searchTerm]);

    const handlePermissionToggle = async (clientId: string, permission: string, currentHasPermission: boolean) => {
        const client = clientsData?.clients.find((c: Client) => c.id === clientId);
        if (!client) return;

        let newPermissions = [...(client.permissions || [])];
        
        if (currentHasPermission) {
            // Remove permission
            newPermissions = newPermissions.filter(p => p !== permission);
        } else {
            // Add permission
            if (!newPermissions.includes(permission)) {
                newPermissions.push(permission);
            }
        }

        await updatePermissions({
            variables: {
                id: clientId,
                input: {
                    permissions: newPermissions
                }
            }
        });
    };

    const handleBulkUpdate = async (permission: string, grant: boolean) => {
        if (selectedClients.length === 0) {
            toast({
                title: "No clients selected",
                description: "Please select at least one client to update.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Update each selected client
        for (const clientId of selectedClients) {
            const client = clientsData?.clients.find((c: Client) => c.id === clientId);
            if (!client) continue;

            let newPermissions = [...(client.permissions || [])];
            
            if (grant) {
                if (!newPermissions.includes(permission)) {
                    newPermissions.push(permission);
                }
            } else {
                newPermissions = newPermissions.filter(p => p !== permission);
            }

            await updatePermissions({
                variables: {
                    id: clientId,
                    input: {
                        permissions: newPermissions
                    }
                }
            });
        }

        toast({
            title: "Bulk update completed",
            description: `Updated ${selectedClients.length} users`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
        
        setSelectedClients([]);
        onBulkModalClose();
    };

    const getRoleBadge = (permissions: string[]) => {
        if (!permissions) return <Badge colorScheme="gray" fontSize="xs">None</Badge>;
        
        if (permissions.includes("PASSWORD_ADMIN")) {
            return <Badge colorScheme="purple" fontSize="xs">Admin</Badge>;
        } else if (permissions.includes("PASSWORD_USER")) {
            return <Badge colorScheme="blue" fontSize="xs">User</Badge>;
        }
        return <Badge colorScheme="gray" fontSize="xs">None</Badge>;
    };

    const selectAll = () => {
        setSelectedClients(filteredClients.map(c => c.id));
    };

    const deselectAll = () => {
        setSelectedClients([]);
    };

    return (
        <Box bg={bgMain} minH="100vh">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={passwordsModuleConfig} />

            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <Box>
                        <HStack justify="space-between" mb={4}>
                            <VStack align="start" spacing={1}>
                                <Heading 
                                    size="xl" 
                                    color={textPrimary}
                                    fontFamily={brandConfig.fonts.heading}
                                >
                                    <Icon as={FaUserShield} mr={3} />
                                    Password Permissions
                                </Heading>
                                <Text color={textSecondary}>
                                    Manage who can issue and view passwords
                                </Text>
                            </VStack>
                            {selectedClients.length > 0 && (
                                <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={onBulkModalOpen}
                                    leftIcon={<Icon as={FaUserCog} />}
                                >
                                    Bulk Update ({selectedClients.length})
                                </Button>
                            )}
                        </HStack>
                    </Box>

                    {/* Statistics */}
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                        <Card bg={bgCard} borderColor={borderCard} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Total Users</StatLabel>
                                    <StatNumber color={textPrimary}>
                                        {stats.total}
                                    </StatNumber>
                                    <StatHelpText color={textSecondary}>
                                        <Icon as={FaUser} mr={1} />
                                        All registered users
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgCard} borderColor={borderCard} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Password Admins</StatLabel>
                                    <StatNumber color={primaryColor}>
                                        {stats.admins}
                                    </StatNumber>
                                    <StatHelpText color={textSecondary}>
                                        <Icon as={FaShieldAlt} mr={1} />
                                        Can issue passwords
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgCard} borderColor={borderCard} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>Password Users</StatLabel>
                                    <StatNumber color={infoBlue}>
                                        {stats.users}
                                    </StatNumber>
                                    <StatHelpText color={textSecondary}>
                                        <Icon as={FaKey} mr={1} />
                                        Can view passwords
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgCard} borderColor={borderCard} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textMuted}>No Access</StatLabel>
                                    <StatNumber color={warningYellow}>
                                        {stats.total - stats.admins - stats.users}
                                    </StatNumber>
                                    <StatHelpText color={textSecondary}>
                                        <Icon as={FaUsers} mr={1} />
                                        Need permissions
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Tabs for Permission Management */}
                    <Card bg={bgCard} borderColor={borderCard} borderWidth="1px">
                        <CardBody>
                            <Tabs colorScheme="blue">
                                <TabList>
                                    <Tab color={textPrimary}>User Permissions</Tab>
                                    <Tab color={textPrimary}>Role Definitions</Tab>
                                </TabList>

                                <TabPanels>
                                    {/* User Permissions Tab */}
                                    <TabPanel>
                                        {/* Search and Filter */}
                                        <HStack spacing={4} mb={6}>
                                            <InputGroup flex={1}>
                                                <InputLeftElement>
                                                    <SearchIcon color={textMuted} />
                                                </InputLeftElement>
                                                <Input
                                                    placeholder="Search users by name or email..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    bg={colorMode === 'light' ? 'white' : 'rgba(0, 0, 0, 0.2)'}
                                                    border="1px solid"
                                                    borderColor={borderCard}
                                                    color={textPrimary}
                                                    _placeholder={{ color: textMuted }}
                                                />
                                            </InputGroup>
                                            <Select
                                                w="200px"
                                                value={filterRole}
                                                onChange={(e) => setFilterRole(e.target.value)}
                                                bg={colorMode === 'light' ? 'white' : 'rgba(0, 0, 0, 0.2)'}
                                                border="1px solid"
                                                borderColor={borderCard}
                                                color={textPrimary}
                                            >
                                                <option value="all">All Users</option>
                                                <option value="admin">Password Admins</option>
                                                <option value="user">Password Users Only</option>
                                                <option value="none">No Permissions</option>
                                            </Select>
                                            {filteredClients.length > 0 && (
                                                <HStack>
                                                    <Button size="sm" variant="outline" onClick={selectAll}>
                                                        Select All
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={deselectAll}>
                                                        Deselect All
                                                    </Button>
                                                </HStack>
                                            )}
                                        </HStack>

                                        {/* Users Table */}
                                        <Box overflowX="auto">
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        <Th color={textMuted}>Select</Th>
                                                        <Th color={textMuted}>User</Th>
                                                        <Th color={textMuted}>Contact</Th>
                                                        <Th color={textMuted}>Current Role</Th>
                                                        <Th color={textMuted}>Password Admin</Th>
                                                        <Th color={textMuted}>Password User</Th>
                                                        <Th color={textMuted}>Last Updated</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredClients.map((client: Client) => (
                                                        <Tr key={client.id}>
                                                            <Td>
                                                                <Checkbox
                                                                    isChecked={selectedClients.includes(client.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedClients([...selectedClients, client.id]);
                                                                        } else {
                                                                            setSelectedClients(selectedClients.filter(id => id !== client.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </Td>
                                                            <Td>
                                                                <HStack spacing={3}>
                                                                    <Avatar
                                                                        size="sm"
                                                                        name={`${client.fName} ${client.lName}`}
                                                                        bg={primaryColor}
                                                                    />
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text color={textPrimary} fontWeight="medium">
                                                                            {client.fName} {client.lName}
                                                                        </Text>
                                                                        <Text color={textMuted} fontSize="xs">
                                                                            ID: {client.id.slice(-6)}
                                                                        </Text>
                                                                    </VStack>
                                                                </HStack>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={0}>
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        {client.email}
                                                                    </Text>
                                                                    <Text color={textMuted} fontSize="xs">
                                                                        {client.phoneNumber}
                                                                    </Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                {getRoleBadge(client.permissions as string[] || [])}
                                                            </Td>
                                                            <Td>
                                                                <Switch
                                                                    isChecked={client.permissions?.includes(ClientPermission.PasswordAdmin) || false}
                                                                    onChange={() => handlePermissionToggle(
                                                                        client.id,
                                                                        "PASSWORD_ADMIN",
                                                                        client.permissions?.includes(ClientPermission.PasswordAdmin) || false
                                                                    )}
                                                                    colorScheme="purple"
                                                                />
                                                            </Td>
                                                            <Td>
                                                                <Switch
                                                                    isChecked={client.permissions?.includes(ClientPermission.PasswordUser) || false}
                                                                    onChange={() => handlePermissionToggle(
                                                                        client.id,
                                                                        "PASSWORD_USER",
                                                                        client.permissions?.includes(ClientPermission.PasswordUser) || false
                                                                    )}
                                                                    colorScheme="blue"
                                                                />
                                                            </Td>
                                                            <Td>
                                                                <Text color={textMuted} fontSize="xs">
                                                                    {format(new Date(client.updatedAt), "MMM dd, yyyy")}
                                                                </Text>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>

                                            {filteredClients.length === 0 && (
                                                <Box py={8} textAlign="center">
                                                    <Text color={textMuted}>No users found matching your criteria</Text>
                                                </Box>
                                            )}
                                        </Box>
                                    </TabPanel>

                                    {/* Role Definitions Tab */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            <Card bg="rgba(0, 0, 0, 0.2)" borderColor={borderCard} borderWidth="1px">
                                                <CardBody>
                                                    <HStack spacing={4} mb={4}>
                                                        <Icon as={FaUserShield} boxSize={8} color={primaryColor} />
                                                        <VStack align="start" spacing={1} flex={1}>
                                                            <Heading size="md" color={textPrimary}>
                                                                Password Admin
                                                            </Heading>
                                                            <Badge colorScheme="purple">PASSWORD_ADMIN</Badge>
                                                        </VStack>
                                                    </HStack>
                                                    <Text color={textSecondary} mb={4}>
                                                        Full access to password management system with the ability to create, edit, and share passwords.
                                                    </Text>
                                                    <VStack align="start" spacing={2}>
                                                        <Text color={textPrimary} fontWeight="semibold">Permissions:</Text>
                                                        <VStack align="start" spacing={1} pl={4}>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">Create new passwords</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">Edit all passwords</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">Share passwords with clients</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">View access logs</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">Manage permissions</Text>
                                                            </HStack>
                                                        </VStack>
                                                    </VStack>
                                                </CardBody>
                                            </Card>

                                            <Card bg="rgba(0, 0, 0, 0.2)" borderColor={borderCard} borderWidth="1px">
                                                <CardBody>
                                                    <HStack spacing={4} mb={4}>
                                                        <Icon as={FaUserLock} boxSize={8} color={infoBlue} />
                                                        <VStack align="start" spacing={1} flex={1}>
                                                            <Heading size="md" color={textPrimary}>
                                                                Password User
                                                            </Heading>
                                                            <Badge colorScheme="blue">PASSWORD_USER</Badge>
                                                        </VStack>
                                                    </HStack>
                                                    <Text color={textSecondary} mb={4}>
                                                        Limited access to view passwords that have been shared with them or issued to them.
                                                    </Text>
                                                    <VStack align="start" spacing={2}>
                                                        <Text color={textPrimary} fontWeight="semibold">Permissions:</Text>
                                                        <VStack align="start" spacing={1} pl={4}>
                                                            <HStack>
                                                                <Icon as={UnlockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">View passwords issued to them</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={UnlockIcon} color={successGreen} />
                                                                <Text color={textSecondary} fontSize="sm">Access shared passwords via link</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={errorRed} />
                                                                <Text color={textSecondary} fontSize="sm">Cannot create passwords</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Icon as={LockIcon} color={errorRed} />
                                                                <Text color={textSecondary} fontSize="sm">Cannot edit passwords</Text>
                                                            </HStack>
                                                        </VStack>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* Bulk Update Modal */}
            <Modal isOpen={isBulkModalOpen} onClose={onBulkModalClose} size="lg">
                <ModalOverlay />
                <ModalContent bg={bgCard} borderColor={borderCard} borderWidth="1px">
                    <ModalHeader color={textPrimary}>Bulk Update Permissions</ModalHeader>
                    <ModalCloseButton color={textMuted} />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Alert status="info">
                                <AlertIcon />
                                <Text fontSize="sm">
                                    You have selected {selectedClients.length} user(s) to update.
                                </Text>
                            </Alert>
                            
                            <Text color={textSecondary}>
                                Choose the permissions you want to grant or revoke for the selected users:
                            </Text>

                            <VStack spacing={3} align="stretch">
                                <Button
                                    leftIcon={<Icon as={FaUserShield} />}
                                    colorScheme="purple"
                                    variant="outline"
                                    onClick={() => handleBulkUpdate("PASSWORD_ADMIN", true)}
                                >
                                    Grant Password Admin
                                </Button>
                                <Button
                                    leftIcon={<Icon as={FaUserShield} />}
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() => handleBulkUpdate("PASSWORD_ADMIN", false)}
                                >
                                    Revoke Password Admin
                                </Button>
                                <Divider />
                                <Button
                                    leftIcon={<Icon as={FaUserLock} />}
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => handleBulkUpdate("PASSWORD_USER", true)}
                                >
                                    Grant Password User
                                </Button>
                                <Button
                                    leftIcon={<Icon as={FaUserLock} />}
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() => handleBulkUpdate("PASSWORD_USER", false)}
                                >
                                    Revoke Password User
                                </Button>
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onBulkModalClose} color={textSecondary}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default PasswordPermissions;