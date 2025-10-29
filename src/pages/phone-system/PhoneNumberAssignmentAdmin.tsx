import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  useToast,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  SimpleGrid,
  Avatar,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, DeleteIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, brandConfig } from '../../brandConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import phoneSystemModuleConfig from './moduleConfig';
import { Client } from "../../generated/graphql";

// GraphQL Queries and Mutations
const GET_PHONE_NUMBERS = gql`
  query GetPhoneNumbers {
    phoneNumbers {
      id
      phoneNumber
      friendlyName
      status
      capabilities
      isAssigned
      associatedClients
      assignedAt
      locality
      region
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
      profilePhoto
    }
  }
`;

const ASSIGN_PHONE_NUMBER = gql`
  mutation AssignPhoneNumberToClient($phoneNumberId: ID!, $clientId: ID!) {
    assignPhoneNumberToClient(phoneNumberId: $phoneNumberId, clientId: $clientId) {
      id
      phoneNumber
      isAssigned
      associatedClients
    }
  }
`;

const UNASSIGN_PHONE_NUMBER = gql`
  mutation UnassignPhoneNumberFromClient($phoneNumberId: ID!, $clientId: ID!) {
    unassignPhoneNumberFromClient(phoneNumberId: $phoneNumberId, clientId: $clientId) {
      id
      phoneNumber
      isAssigned
      associatedClients
    }
  }
`;


interface PhoneNumber {
  id: string;
  phoneNumber: string;
  friendlyName: string;
  status: string;
  capabilities: string[];
  isAssigned: boolean;
  associatedClients: string[];
  assignedAt?: string;
  locality?: string;
  region?: string;
}

export const PhoneNumberAssignmentAdmin: React.FC = () => {
  usePageTitle("Phone Number Assignment");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // Brand styling variables
  const bgMain = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const primaryColor = getColor("primary");
  const primaryHover = getColor("primaryHover");
  const successGreen = getColor("successGreen");
  const infoBlue = getColor("status.info");
  const warningColor = getColor("status.warning");
  const purpleAccent = getColor("purpleAccent");

  // Queries
  const { data: phoneData, loading: phoneLoading, refetch: refetchPhones } = useQuery(GET_PHONE_NUMBERS);
  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENTS);

  // Mutations
  const [assignPhoneNumber] = useMutation(ASSIGN_PHONE_NUMBER, {
    onCompleted: () => {
      toast({
        title: 'Phone number assigned',
        description: 'The phone number has been successfully assigned to the client.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchPhones();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Assignment failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [unassignPhoneNumber] = useMutation(UNASSIGN_PHONE_NUMBER, {
    onCompleted: () => {
      toast({
        title: 'Phone number unassigned',
        description: 'The phone number has been successfully unassigned from the client.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchPhones();
    },
    onError: (error) => {
      toast({
        title: 'Unassignment failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Filter phone numbers
  const filteredPhoneNumbers = phoneData?.phoneNumbers?.filter((phone: PhoneNumber) => {
    const matchesSearch = phone.phoneNumber.includes(searchTerm) || 
                          phone.friendlyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                          (filterType === 'assigned' && phone.isAssigned) ||
                          (filterType === 'unassigned' && !phone.isAssigned);
    return matchesSearch && matchesFilter;
  }) || [];

  // Get client details by ID
  const getClientById = (clientId: string): Client | undefined => {
    return clientData?.clients?.find((client: Client) => client.id === clientId);
  };

  // Handle assignment
  const handleAssign = () => {
    if (selectedPhoneNumber && selectedClients.length > 0) {
      selectedClients.forEach(clientId => {
        assignPhoneNumber({
          variables: {
            phoneNumberId: selectedPhoneNumber.id,
            clientId,
          },
        });
      });
    }
  };

  // Handle unassignment
  const handleUnassign = (phoneNumberId: string, clientId: string) => {
    unassignPhoneNumber({
      variables: {
        phoneNumberId,
        clientId,
      },
    });
  };

  // Stats calculation
  const totalNumbers = phoneData?.phoneNumbers?.length || 0;
  const assignedNumbers = phoneData?.phoneNumbers?.filter((p: PhoneNumber) => p.isAssigned).length || 0;
  const unassignedNumbers = totalNumbers - assignedNumbers;

  if (phoneLoading || clientLoading) {
    return (
      <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />
        <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
          <VStack spacing={8}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading phone assignments...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />

      <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} flex="1">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack align="start" spacing={2}>
            <Heading size={{ base: "md", md: "lg" }} color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              📞 Phone Number Assignment Management
            </Heading>
            <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
              Control which phone numbers your clients can use for outbound calls. Assign specific Twilio numbers to individual clients - they'll only be able to make calls from their assigned numbers.
            </Text>
          </VStack>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textMuted}>Total Phone Numbers</StatLabel>
                  <StatNumber color={textPrimary}>{totalNumbers}</StatNumber>
                  <Text fontSize="sm" color={textMuted}>Available in system</Text>
                </Stat>
              </CardBody>
            </Card>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textMuted}>Assigned Numbers</StatLabel>
                  <StatNumber color={successGreen}>{assignedNumbers}</StatNumber>
                  <Text fontSize="sm" color={textMuted}>With client access</Text>
                </Stat>
              </CardBody>
            </Card>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                transition: "all 0.2s"
              }}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textMuted}>Unassigned Numbers</StatLabel>
                  <StatNumber color={warningColor}>{unassignedNumbers}</StatNumber>
                  <Text fontSize="sm" color={textMuted}>Need assignment</Text>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
            <InputGroup maxW={{ base: "100%", md: "md" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={textMuted} />
              </InputLeftElement>
              <Input
                placeholder="Search phone numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="rgba(255, 255, 255, 0.05)"
                borderColor={cardBorder}
                color={textPrimary}
                _placeholder={{ color: textMuted }}
                _hover={{ borderColor: textSecondary }}
                _focus={{ 
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
              />
            </InputGroup>
            <Select 
              maxW={{ base: "100%", md: "200px" }} 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              bg="rgba(255, 255, 255, 0.05)"
              borderColor={cardBorder}
              color={textPrimary}
              _hover={{ borderColor: textSecondary }}
              _focus={{ 
                borderColor: primaryColor,
                boxShadow: `0 0 0 1px ${primaryColor}`,
              }}
              sx={{
                option: {
                  backgroundColor: '#1a1a2e',
                  color: '#e4e4e7',
                },
              }}
            >
              <option value="all">All Numbers</option>
              <option value="assigned">Assigned Only</option>
              <option value="unassigned">Unassigned Only</option>
            </Select>
          </Stack>

          {/* Phone Numbers Table */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody p={0} overflowX="auto">
              <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth={{ base: "700px", md: "100%" }}>
                <Thead>
                  <Tr>
                    <Th color={textMuted} borderColor={cardBorder}>Phone Number</Th>
                    <Th color={textMuted} borderColor={cardBorder}>Location</Th>
                    <Th color={textMuted} borderColor={cardBorder}>Status</Th>
                    <Th color={textMuted} borderColor={cardBorder}>Assigned Clients</Th>
                    <Th color={textMuted} borderColor={cardBorder}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPhoneNumbers.map((phone: PhoneNumber) => (
                    <Tr key={phone.id}>
                      <Td borderColor={cardBorder}>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color={textPrimary}>{phone.phoneNumber}</Text>
                          <Text fontSize="sm" color={textMuted}>{phone.friendlyName}</Text>
                        </VStack>
                      </Td>
                      <Td borderColor={cardBorder}>
                        <Text fontSize="sm" color={textSecondary}>
                          {phone.locality && phone.region ? `${phone.locality}, ${phone.region}` : 'N/A'}
                        </Text>
                      </Td>
                      <Td borderColor={cardBorder}>
                        <Badge
                          bg={phone.isAssigned ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 146, 60, 0.2)"}
                          color={phone.isAssigned ? successGreen : warningColor}
                          border="1px solid"
                          borderColor={phone.isAssigned ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 146, 60, 0.3)"}
                        >
                          {phone.isAssigned ? 'Assigned' : 'Unassigned'}
                        </Badge>
                      </Td>
                      <Td borderColor={cardBorder}>
                        {phone.associatedClients && phone.associatedClients.length > 0 ? (
                          <VStack align="start" spacing={1}>
                            {phone.associatedClients.map((clientId) => {
                              const client = getClientById(clientId);
                              return client ? (
                                <HStack key={clientId} spacing={2}>
                                  <Avatar size="xs" name={`${client.fName || ''} ${client.lName || ''}`} src={client.profilePhoto || undefined} />
                                  <Text fontSize="sm" color={textPrimary}>{client.fName} {client.lName}</Text>
                                  <IconButton
                                    aria-label="Remove assignment"
                                    icon={<DeleteIcon />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleUnassign(phone.id, clientId)}
                                  />
                                </HStack>
                              ) : (
                                <Text key={clientId} fontSize="sm" color={textMuted}>Unknown Client</Text>
                              );
                            })}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color={textMuted}>No clients assigned</Text>
                        )}
                      </Td>
                      <Td borderColor={cardBorder}>
                        <Button
                          size={{ base: "xs", md: "sm" }}
                          leftIcon={<AddIcon />}
                          onClick={() => {
                            setSelectedPhoneNumber(phone);
                            setSelectedClients(phone.associatedClients || []);
                            setModalSearchTerm('');
                            onOpen();
                          }}
                          bg={primaryColor}
                          color="white"
                          _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                          _active={{ transform: "translateY(0)" }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                        >
                          Manage
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Info Box */}
          <Alert 
            status="info"
            bg="rgba(59, 130, 246, 0.1)"
            borderColor="rgba(59, 130, 246, 0.3)"
            border="1px solid"
          >
            <AlertIcon color={infoBlue} />
            <Box>
              <Text fontWeight="bold" color={textPrimary}>How Phone Number Assignment Works</Text>
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>1. Phone numbers are automatically tracked when purchased from Twilio</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>2. Click the "Manage" button next to any phone number to assign it to specific clients</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>3. Clients will only be able to make calls from their assigned numbers</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>4. System admins can always use any phone number regardless of assignments</Text>
              </VStack>
            </Box>
          </Alert>
        </VStack>
      </Container>

      {/* Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder} border="1px solid">
          <ModalHeader color={textPrimary} fontFamily={brandConfig.fonts.heading}>
            Manage Phone Number Assignment
            {selectedPhoneNumber && (
              <Text fontSize="sm" fontWeight="normal" color={textMuted}>
                {selectedPhoneNumber.phoneNumber} - {selectedPhoneNumber.friendlyName}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color={textSecondary}>Select clients who should have access to this phone number:</Text>
              
              {/* Search input for clients */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={textMuted} />
                </InputLeftElement>
                <Input
                  placeholder="Search clients by name, email, or ID..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{ 
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                />
              </InputGroup>
              
              <Box maxH={{ base: "300px", md: "400px" }} overflowY="auto" border="1px" borderColor={cardBorder} borderRadius="md" p={2} bg="rgba(255, 255, 255, 0.05)">
                {clientData?.clients
                  ?.filter((client: Client) => {
                    if (!modalSearchTerm) return true;
                    const searchLower = modalSearchTerm.toLowerCase();
                    return (
                      client.id.toLowerCase().includes(searchLower) ||
                      (client.fName?.toLowerCase().includes(searchLower) ?? false) ||
                      (client.lName?.toLowerCase().includes(searchLower) ?? false) ||
                      (client.email && client.email.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((client: Client) => (
                  <HStack
                    key={client.id}
                    p={2}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                    cursor="pointer"
                    onClick={() => {
                      if (selectedClients.includes(client.id)) {
                        setSelectedClients(selectedClients.filter(id => id !== client.id));
                      } else {
                        setSelectedClients([...selectedClients, client.id]);
                      }
                    }}
                  >
                    <Box flex={1}>
                      <HStack>
                        <Avatar size="sm" name={`${client.fName || ''} ${client.lName || ''}`} src={client.profilePhoto || undefined} />
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="medium" color={textPrimary}>{client.fName} {client.lName}</Text>
                            <Badge 
                              bg="rgba(139, 92, 246, 0.2)" 
                              color={purpleAccent} 
                              border="1px solid" 
                              borderColor="rgba(139, 92, 246, 0.3)" 
                              fontSize="xs"
                            >
                              ID: {client.id.slice(0, 8)}...
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color={textMuted}>{client.email || client.phoneNumber}</Text>
                          <Text fontSize="xs" color={textMuted} opacity={0.7}>Full ID: {client.id}</Text>
                        </VStack>
                      </HStack>
                    </Box>
                    {selectedClients.includes(client.id) && (
                      <CheckCircleIcon color={successGreen} />
                    )}
                  </HStack>
                ))}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline"
              mr={3} 
              onClick={onClose}
              borderColor={cardBorder}
              color={textSecondary}
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              bg={primaryColor}
              color="white"
              _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              fontWeight="semibold"
            >
              Save Assignments
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};