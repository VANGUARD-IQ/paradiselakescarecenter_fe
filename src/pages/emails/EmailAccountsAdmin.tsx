import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  IconButton,
  Tooltip,
  Switch,
  useColorMode,
  Alert,
  AlertIcon,
  Code,
  OrderedList,
  ListItem,
  Divider,
  Link,
  ModalFooter
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiMail, FiUser, FiCopy, FiExternalLink, FiSettings } from 'react-icons/fi';
import { useQuery, useMutation, gql } from '@apollo/client';
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import { Client, EmailAddress } from "../../generated/graphql";

// GraphQL queries and mutations
const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
      permissions
    }
  }
`;

const GET_EMAIL_ADDRESSES = gql`
  query GetEmailAddresses {
    emailAddresses {
      id
      email
      name
      type
      associatedClients
      emailsSent
      emailsReceived
      lastSeenAt
      isRegisteredWithImprovMX
      isVerified
      primaryCalendarId
      linkedCalendarIds
      acceptedSenderEmailsForCalendarInvites
      acceptCalendarInvitesFromAnyone
      blockedDomainsForCalendarInvites
      postmarkEndpoint
      forwardingProvider
    }
  }
`;

const GET_CALENDARS = gql`
  query GetCalendars {
    calendars {
      id
      name
      type
      responsibleOwnerId
    }
  }
`;

const UPDATE_EMAIL_CALENDAR = gql`
  mutation UpdateEmailCalendar($emailId: String!, $primaryCalendarId: String, $linkedCalendarIds: [String!]) {
    updateEmailAddress(id: $emailId, input: {
      primaryCalendarId: $primaryCalendarId,
      linkedCalendarIds: $linkedCalendarIds
    }) {
      id
      primaryCalendarId
      linkedCalendarIds
    }
  }
`;

const ASSIGN_EMAIL_TO_CLIENT = gql`
  mutation AssignEmailToClient($emailId: String!, $clientId: String!) {
    assignEmailToClient(emailId: $emailId, clientId: $clientId) {
      id
      associatedClients
    }
  }
`;

const UNASSIGN_EMAIL_FROM_CLIENT = gql`
  mutation UnassignEmailFromClient($emailId: String!, $clientId: String!) {
    unassignEmailFromClient(emailId: $emailId, clientId: $clientId) {
      id
      associatedClients
    }
  }
`;

const CREATE_EMAIL_WITH_ALIAS = gql`
  mutation CreateEmailAddressWithAlias($input: CreateEmailAddressWithAliasInput!) {
    createEmailAddressWithAlias(input: $input) {
      id
      email
      name
      type
      associatedClients
    }
  }
`;

const TOGGLE_IMPROVMX_STATUS = gql`
  mutation ToggleImprovMXStatus($emailId: String!, $isRegistered: Boolean!) {
    updateEmailAddress(id: $emailId, input: { isRegisteredWithImprovMX: $isRegistered }) {
      id
      isRegisteredWithImprovMX
    }
  }
`;

// Microsoft 365 Email Forwarding Mutation
const CREATE_M365_EMAIL_FORWARDING = gql`
  mutation CreateEmailAddress($input: EmailAddressInput!) {
    createEmailAddress(input: $input) {
      id
      email
      name
      type
      postmarkEndpoint
      isRegisteredWithImprovMX
    }
  }
`;

const UPDATE_EMAIL_TYPE = gql`
  mutation UpdateEmailType($emailId: String!, $type: String!) {
    updateEmailAddress(id: $emailId, input: { type: $type }) {
      id
      type
    }
  }
`;

const UPDATE_FORWARDING_PROVIDER = gql`
  mutation UpdateForwardingProvider($emailId: String!, $provider: ForwardingProvider!) {
    updateEmailAddress(id: $emailId, input: { forwardingProvider: $provider }) {
      id
      forwardingProvider
    }
  }
`;

export const EmailAccountsAdmin: React.FC = () => {
    usePageTitle("Email Accounts Admin");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isForwardingOpen, onOpen: onForwardingOpen, onClose: onForwardingClose } = useDisclosure();
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedEmailForInstructions, setSelectedEmailForInstructions] = useState<any>(null);

  const [selectedEmail, setSelectedEmail] = useState<EmailAddress | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [registrationFilter, setRegistrationFilter] = useState<'registered' | 'unregistered' | 'all'>('registered');
  const [providerFilter, setProviderFilter] = useState<'all' | 'IMPROVMX' | 'MICROSOFT' | 'GOOGLE' | 'OTHER' | 'NONE'>('all');
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // State for creating new email
  const [newEmailAlias, setNewEmailAlias] = useState('');
  const [newEmailName, setNewEmailName] = useState('');
  const [newEmailType, setNewEmailType] = useState('BUSINESS');

  // State for Microsoft 365 forwarding
  const [forwardingType, setForwardingType] = useState<'SHARED' | 'DISTRIBUTION' | 'PERSONAL'>('SHARED');
  const [forwardingAlias, setForwardingAlias] = useState('');
  const [forwardingDisplayName, setForwardingDisplayName] = useState('');

  // State for editing email type
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

  // State for editing calendar assignments
  const [editingPrimaryCalendarId, setEditingPrimaryCalendarId] = useState<string | null>(null);
  const [editingLinkedCalendarsId, setEditingLinkedCalendarsId] = useState<string | null>(null);

  // GraphQL queries
  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
  const { data: emailsData, loading: emailsLoading, refetch: refetchEmails } = useQuery(GET_EMAIL_ADDRESSES);
  const { data: calendarsData } = useQuery(GET_CALENDARS);
  
  // GraphQL mutations
  const [assignEmail] = useMutation(ASSIGN_EMAIL_TO_CLIENT, {
    onCompleted: () => {
      toast({
        title: 'Email assigned successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchEmails();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error assigning email',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [unassignEmail] = useMutation(UNASSIGN_EMAIL_FROM_CLIENT, {
    onCompleted: () => {
      toast({
        title: 'Email unassigned successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchEmails();
    },
    onError: (error) => {
      toast({
        title: 'Error unassigning email',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [createEmailWithAlias] = useMutation(CREATE_EMAIL_WITH_ALIAS, {
    onCompleted: (data) => {
      toast({
        title: 'Email created successfully',
        description: `Created ${data.createEmailAddressWithAlias.email}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      refetchEmails();
      onCreateClose();
      // Reset form
      setNewEmailAlias('');
      setNewEmailName('');
      setNewEmailType('BUSINESS');
    },
    onError: (error) => {
      toast({
        title: 'Error creating email',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [toggleImprovMXStatus] = useMutation(TOGGLE_IMPROVMX_STATUS, {
    onCompleted: () => {
      toast({
        title: 'ImprovMX status updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating ImprovMX status',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Refetch to revert the optimistic update
      refetchEmails();
    },
  });

  const [updateEmailType] = useMutation(UPDATE_EMAIL_TYPE, {
    onCompleted: () => {
      toast({
        title: 'Email type updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      refetchEmails();
    },
    onError: (error) => {
      toast({
        title: 'Error updating email type',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateForwardingProvider] = useMutation(UPDATE_FORWARDING_PROVIDER, {
    onCompleted: () => {
      toast({
        title: 'Forwarding provider updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      refetchEmails();
    },
    onError: (error) => {
      toast({
        title: 'Error updating forwarding provider',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [createM365Forwarding] = useMutation(CREATE_M365_EMAIL_FORWARDING, {
    onCompleted: (data) => {
      const emailData = data.createEmailAddress;

      toast({
        title: 'Email Created Successfully',
        description: `${emailData.email} has been created. Click on it in the list to view setup instructions.`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });

      // Reset form and close modal
      setForwardingAlias('');
      setForwardingDisplayName('');
      setForwardingType('SHARED');
      onForwardingClose();
      refetchEmails(); // Refresh the email list
    },
    onError: (error) => {
      toast({
        title: 'Error creating forwarding setup',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateEmailCalendar] = useMutation(UPDATE_EMAIL_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'Calendar assignment updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchEmails();
    },
    onError: (error) => {
      toast({
        title: 'Error updating calendar assignment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const { colorMode } = useColorMode();
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  // Use brighter colors for dark theme
  const textColor = "white";
  const mutedTextColor = "gray.300";
  const labelColor = "gray.400";

  const clients: Client[] = clientsData?.clients || [];
  const emailAddresses: EmailAddress[] = emailsData?.emailAddresses || [];

  // Filter email addresses based on search, type, direction, and registration status
  const filteredEmails = emailAddresses.filter(email => {
    const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || email.type === filterType;

    // Filter by direction (incoming/outgoing)
    let matchesDirection = true;
    if (directionFilter === 'incoming') {
      matchesDirection = email.emailsReceived > 0;
    } else if (directionFilter === 'outgoing') {
      matchesDirection = email.emailsSent > 0;
    }

    // Filter by registration status
    let matchesRegistration = true;
    if (registrationFilter === 'registered') {
      matchesRegistration = email.isRegisteredWithImprovMX === true;
    } else if (registrationFilter === 'unregistered') {
      matchesRegistration = email.isRegisteredWithImprovMX !== true;
    }

    // Filter by forwarding provider
    let matchesProvider = true;
    if (providerFilter !== 'all') {
      matchesProvider = email.forwardingProvider === providerFilter || (!email.forwardingProvider && providerFilter === 'NONE');
    }

    return matchesSearch && matchesType && matchesDirection && matchesRegistration && matchesProvider;
  });

  const handleAssignEmail = async (clientId: string) => {
    if (!selectedEmail) return;
    
    await assignEmail({
      variables: {
        emailId: selectedEmail.id,
        clientId: clientId,
      },
    });
  };

  const handleUnassignEmail = async (emailId: string, clientId: string) => {
    await unassignEmail({
      variables: {
        emailId,
        clientId,
      },
    });
  };

  const openAssignModal = (email: EmailAddress) => {
    setSelectedEmail(email);
    setClientSearchTerm(''); // Reset search when opening modal
    onOpen();
  };

  const handleCreateEmail = async () => {
    if (!newEmailAlias.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email alias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await createEmailWithAlias({
      variables: {
        input: {
          alias: newEmailAlias,
          name: newEmailName || undefined,
          type: newEmailType,
        },
      },
    });
  };

  const handleToggleImprovMX = async (emailId: string, currentStatus: boolean) => {
    await toggleImprovMXStatus({
      variables: {
        emailId,
        isRegistered: !currentStatus,
      },
      optimisticResponse: {
        updateEmailAddress: {
          __typename: 'EmailAddress',
          id: emailId,
          isRegisteredWithImprovMX: !currentStatus,
        },
      },
    });
  };

  const handleUpdateEmailType = async (emailId: string, newType: string) => {
    await updateEmailType({
      variables: {
        emailId,
        type: newType,
      },
    });
    setEditingEmailId(null);
  };

  const handleUpdateForwardingProvider = async (emailId: string, newProvider: string) => {
    await updateForwardingProvider({
      variables: {
        emailId,
        provider: newProvider,
      },
    });
    setEditingProviderId(null);
  };

  const handleUpdatePrimaryCalendar = async (emailId: string, calendarId: string | null) => {
    await updateEmailCalendar({
      variables: {
        emailId,
        primaryCalendarId: calendarId === 'none' ? null : calendarId,
      },
    });
    setEditingPrimaryCalendarId(null);
  };

  const handleUpdateLinkedCalendars = async (emailId: string, calendarIds: string[]) => {
    await updateEmailCalendar({
      variables: {
        emailId,
        linkedCalendarIds: calendarIds,
      },
    });
    setEditingLinkedCalendarsId(null);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard',
      status: 'info',
      duration: 2000,
    });
  };

  const handleViewSetupInstructions = (email: EmailAddress) => {
    if (email.postmarkEndpoint && !email.isRegisteredWithImprovMX) {
      setSelectedEmailForInstructions({
        alias: email.email,
        displayName: email.name,
        postmarkEndpoint: email.postmarkEndpoint,
        type: email.type
      });
      setShowInstructions(true);
    }
  };

  const handleCreateForwarding = async () => {
    if (!forwardingAlias.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email alias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Use the actual Postmark inbound address from your server
    const postmarkEndpoint = `c167efbd0aabb934087409a8be5588be@inbound.postmarkapp.com`;
    const fullEmail = `${forwardingAlias}@vanguardiq.com.au`;

    // Check if email already exists
    const existingEmail = emailAddresses.find(e => e.email === fullEmail);
    if (existingEmail) {
      toast({
        title: 'Email Already Exists',
        description: `The email ${fullEmail} already exists in the system. You can click on it to view setup instructions.`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      onForwardingClose();
      return;
    }

    console.log('Creating M365 forwarding with:', {
      email: fullEmail,
      name: forwardingDisplayName || forwardingAlias,
      type: forwardingType === 'SHARED' ? 'SUPPORT' :
            forwardingType === 'DISTRIBUTION' ? 'BUSINESS' : 'PERSONAL',
      postmarkEndpoint,
      isRegisteredWithImprovMX: false,
      isVerified: true
    });

    try {
      const result = await createM365Forwarding({
        variables: {
          input: {
            email: fullEmail,
            name: forwardingDisplayName || forwardingAlias,
            type: forwardingType === 'SHARED' ? 'SUPPORT' :
                  forwardingType === 'DISTRIBUTION' ? 'BUSINESS' : 'PERSONAL',
            postmarkEndpoint: postmarkEndpoint,
            isRegisteredWithImprovMX: false, // This is a Microsoft 365 email
            isVerified: true, // Mark as verified since it's manually configured
            forwardingProvider: 'MICROSOFT' // Set provider to Microsoft 365
          },
        },
      });

      console.log('Created email successfully:', result.data);

      // Show setup instructions immediately after creation
      if (result.data?.createEmailAddress) {
        setSelectedEmailForInstructions({
          alias: fullEmail,
          displayName: forwardingDisplayName || forwardingAlias,
          postmarkEndpoint: postmarkEndpoint,
          type: forwardingType === 'SHARED' ? 'SUPPORT' :
                forwardingType === 'DISTRIBUTION' ? 'BUSINESS' : 'PERSONAL'
        });
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Error creating M365 forwarding:', error);
      // Error is handled by the mutation's onError callback
    }
  };

  if (clientsLoading || emailsLoading) {
    return (
      <Box minH="100vh" bg={bg} p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.400" />
          <Text color={textColor}>Loading email accounts...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
      <Box p={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch" maxW={{ base: "100%", lg: "none" }}>
        {/* Header */}
        <Box>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={textColor} mb={2}>
            📧 Email Account Management
          </Text>
          <Text color={mutedTextColor} fontSize={{ base: "md", md: "lg" }} lineHeight="1.6">
            Control which emails your clients can access. Assign specific email addresses to individual clients - they'll only see emails sent to their assigned addresses when they visit their inbox.
          </Text>
        </Box>

        {/* Email Processing Flow Info */}
        <Card
          bg="blue.900"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px solid"
          borderColor="blue.700"
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack align="start" spacing={3}>
              <HStack>
                <Text fontSize="lg" fontWeight="bold" color="blue.200">
                  📋 Email Routing & Processing Flow
                </Text>
                <Badge colorScheme="blue" fontSize="xs">SINGLE SOURCE OF TRUTH</Badge>
              </HStack>
              <Box pl={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.300">
                    <strong>1. 🎯 Primary Calendar ID:</strong> Direct routing to ONE specific calendar (highest priority)
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    <strong>2. 📅 Linked Calendar IDs:</strong> Secondary calendars that may receive events
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    <strong>3. 👥 Associated Clients:</strong> Who can VIEW and MANAGE this email (not for routing)
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={2}>
                    <strong>Processing Order:</strong> Incoming email → Check EmailAddress.primaryCalendarId → If not set, check linkedCalendarIds → If none, use associatedClients[0]'s personal calendar
                  </Text>
                  <Text fontSize="xs" color="orange.300" mt={2}>
                    ⚠️ <strong>Important:</strong> EmailAddress model is the SINGLE SOURCE OF TRUTH. Client.email is for login only, not email routing.
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <HStack spacing={{ base: 2, md: 4 }} direction={{ base: "column", md: "row" }} align="stretch">
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
            flex={1}
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1} flex="1">
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Tracked Email Addresses</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                    {emailAddresses.length}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                    Auto-detected from incoming emails
                  </Text>
                </VStack>
                <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="blue.500" color="white">
                  <FiMail size={24} />
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
            flex={1}
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1} flex="1">
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Assigned to Clients</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                    {emailAddresses.filter(e => e.associatedClients && e.associatedClients.length > 0).length}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                    Addresses with client access
                  </Text>
                </VStack>
                <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="green.500" color="white">
                  <FiUser size={24} />
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
            flex={1}
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1} flex="1">
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Unassigned Addresses</Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                    {emailAddresses.filter(e => !e.associatedClients || e.associatedClients.length === 0).length}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                    Need client assignment
                  </Text>
                </VStack>
                <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="orange.500" color="white">
                  <FiMail size={24} />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Filters */}
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px solid"
          borderColor={cardBorder}
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Search email addresses..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor={cardBorder}
                color={textColor}
                _placeholder={{ color: "gray.500" }}
              />
              <HStack spacing={3} justifyContent="space-between">
                <HStack spacing={3} flex="1">
                <Select
                  value={registrationFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegistrationFilter(e.target.value as 'registered' | 'unregistered' | 'all')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  flex={1}
                >
                  <option value="registered">Registered Only</option>
                  <option value="unregistered">Unregistered Only</option>
                  <option value="all">All Emails</option>
                </Select>
                <Select
                  value={providerFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProviderFilter(e.target.value as 'all' | 'IMPROVMX' | 'MICROSOFT' | 'GOOGLE' | 'OTHER' | 'NONE')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  flex={1}
                >
                  <option value="all">All Providers</option>
                  <option value="IMPROVMX">ImprovMX</option>
                  <option value="MICROSOFT">Microsoft 365</option>
                  <option value="GOOGLE">Google Workspace</option>
                  <option value="OTHER">Other Provider</option>
                  <option value="NONE">No Provider</option>
                </Select>
                <Select
                  value={directionFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDirectionFilter(e.target.value as 'all' | 'incoming' | 'outgoing')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  flex={1}
                >
                  <option value="all">All Directions</option>
                  <option value="incoming">Incoming (Sent to us)</option>
                  <option value="outgoing">Outgoing (We sent to)</option>
                </Select>
                <Select
                  value={filterType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  flex={1}
                >
                  <option value="all">All Types</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="BUSINESS">Business</option>
                  <option value="SUPPORT">Support</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="NOREPLY">No Reply</option>
                </Select>
                </HStack>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FiSettings />}
                    colorScheme="purple"
                    onClick={onForwardingOpen}
                    size="md"
                    variant="outline"
                  >
                    Setup M365 Forwarding
                  </Button>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={onCreateOpen}
                    size="md"
                  >
                    Create Email
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Email Addresses Table */}
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px solid"
          borderColor={cardBorder}
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <Box overflowX="auto" width="100%">
              <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth="700px">
                <Thead position="sticky" top={0} bg={cardGradientBg}>
                  <Tr>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="180px">
                      <Tooltip label="📧 email: The email address being tracked. This is the unique identifier for routing emails and calendar invites (Required)" placement="top" hasArrow>
                        <Text>Email Address</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="80px">
                      <Tooltip label="📝 type: Categorizes the email (PERSONAL, WORK, SUPPORT, etc). Helps organize and filter email addresses by purpose" placement="top" hasArrow>
                        <Text>Type</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="120px">
                      <Tooltip label="🌐 Provider: Which service manages this email's forwarding (ImprovMX, Microsoft 365, Google Workspace, etc)" placement="top" hasArrow>
                        <Text>Provider</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="120px">
                      <Tooltip label="🔗 isRegisteredWithImprovMX: Whether this email is set up with ImprovMX for forwarding. Enables email routing through ImprovMX service" placement="top" hasArrow>
                        <Text>ImprovMX</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="150px">
                      <Tooltip label="📅 primaryCalendarId: The main calendar where invites to this email are added. Single source of truth for calendar routing" placement="top" hasArrow>
                        <Text>Primary Calendar</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="100px">
                      <Tooltip label="🔄 linkedCalendarIds: Additional calendars that receive copies of invites. Allows one email to update multiple calendars" placement="top" hasArrow>
                        <Text>Linked Cals</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="150px">
                      <Tooltip label="🛡️ Calendar Invite Rules: Controls who can send calendar invites (acceptCalendarInvitesFromAnyone, acceptedSenderEmailsForCalendarInvites, blockedDomainsForCalendarInvites). Prevents spam and unauthorized calendar events" placement="top" hasArrow>
                        <Text>Invite Rules</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }} minW="250px">
                      <Tooltip label="👥 associatedClients: Links this email to specific clients/users. Determines who can access calendars and emails sent to this address" placement="top" hasArrow>
                        <Text>Assigned Clients</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }} minW="100px">
                      <Tooltip label="📊 emailsSent/emailsReceived: Tracks email activity statistics. Helps identify active vs inactive email addresses" placement="top" hasArrow>
                        <Text>Activity</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }} minW="100px">
                      <Tooltip label="🕐 lastSeenAt: When this email was last active. Helps identify stale or abandoned email addresses" placement="top" hasArrow>
                        <Text>Last Seen</Text>
                      </Tooltip>
                    </Th>
                    <Th color={labelColor} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} minW="80px">
                      <Text>Actions</Text>
                    </Th>
                  </Tr>
                </Thead>
              <Tbody>
                {filteredEmails.map((email) => (
                  <Tr key={email.id}>
                    <Td px={{ base: 2, md: 4 }}>
                      <VStack align="start" spacing={1}>
                        <Text color={textColor} fontWeight="medium" fontSize={{ base: "xs", md: "sm" }} noOfLines={2}>
                          {email.email}
                        </Text>
                        {email.name && (
                          <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.300" noOfLines={1}>
                            {email.name}
                          </Text>
                        )}
                        <Text display={{ base: "block", md: "none" }} fontSize="2xs" color="gray.400">
                          {email.associatedClients && email.associatedClients.length > 0 ? `${email.associatedClients.length} client(s)` : "Unassigned"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      {editingEmailId === email.id ? (
                        <Select
                          size="sm"
                          value={email.type}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateEmailType(email.id, e.target.value)}
                          onBlur={() => setEditingEmailId(null)}
                          autoFocus
                          width="100px"
                        >
                          <option value="BUSINESS">Business</option>
                          <option value="PERSONAL">Personal</option>
                          <option value="SUPPORT">Support</option>
                          <option value="MARKETING">Marketing</option>
                          <option value="NOREPLY">No Reply</option>
                          <option value="UNKNOWN">Unknown</option>
                        </Select>
                      ) : (
                        <Badge
                          colorScheme={
                            email.type === 'PERSONAL' ? 'blue' :
                            email.type === 'BUSINESS' ? 'green' :
                            email.type === 'SUPPORT' ? 'yellow' :
                            email.type === 'MARKETING' ? 'purple' :
                            'gray'
                          }
                          variant="subtle"
                          fontSize={{ base: "2xs", md: "xs" }}
                          cursor="pointer"
                          onClick={() => setEditingEmailId(email.id)}
                          _hover={{ opacity: 0.8 }}
                        >
                          {email.type === 'PERSONAL' ? 'PERS' : email.type === 'BUSINESS' ? 'BIZ' : email.type === 'MARKETING' ? 'MKTG' : email.type}
                        </Badge>
                      )}
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      {editingProviderId === email.id ? (
                        <Select
                          size="sm"
                          value={email.forwardingProvider || 'NONE'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateForwardingProvider(email.id, e.target.value)}
                          onBlur={() => setEditingProviderId(null)}
                          autoFocus
                          width="120px"
                        >
                          <option value="IMPROVMX">ImprovMX</option>
                          <option value="MICROSOFT">Microsoft 365</option>
                          <option value="GOOGLE">Google</option>
                          <option value="OTHER">Other</option>
                          <option value="NONE">None</option>
                        </Select>
                      ) : (
                        <Badge
                          colorScheme={
                            email.forwardingProvider === 'IMPROVMX' ? 'cyan' :
                            email.forwardingProvider === 'MICROSOFT' ? 'blue' :
                            email.forwardingProvider === 'GOOGLE' ? 'green' :
                            email.forwardingProvider === 'OTHER' ? 'orange' :
                            'gray'
                          }
                          variant="subtle"
                          fontSize={{ base: "2xs", md: "xs" }}
                          cursor="pointer"
                          onClick={() => setEditingProviderId(email.id)}
                          _hover={{ opacity: 0.8 }}
                        >
                          {email.forwardingProvider === 'IMPROVMX' ? 'ImprovMX' :
                           email.forwardingProvider === 'MICROSOFT' ? 'MS 365' :
                           email.forwardingProvider === 'GOOGLE' ? 'Google' :
                           email.forwardingProvider === 'OTHER' ? 'Other' :
                           'None'}
                        </Badge>
                      )}
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Switch
                            size="sm"
                            colorScheme="green"
                            isChecked={email.isRegisteredWithImprovMX}
                            onChange={() => handleToggleImprovMX(email.id, email.isRegisteredWithImprovMX)}
                          />
                          <Text fontSize="xs" color={email.isRegisteredWithImprovMX ? "green.400" : "gray.400"}>
                            {email.isRegisteredWithImprovMX ? "Registered" : "Not Registered"}
                          </Text>
                        </HStack>
                        {email.isVerified !== undefined && (
                          <Badge
                            colorScheme={email.isVerified ? "blue" : "orange"}
                            fontSize="2xs"
                            variant="subtle"
                          >
                            {email.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      {editingPrimaryCalendarId === email.id ? (
                        <Select
                          size="sm"
                          value={email.primaryCalendarId || 'none'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdatePrimaryCalendar(email.id, e.target.value)}
                          onBlur={() => setEditingPrimaryCalendarId(null)}
                          autoFocus
                          width="150px"
                          fontSize="xs"
                        >
                          <option value="none">Not set</option>
                          {calendarsData?.calendars?.map((calendar: any) => (
                            <option key={calendar.id} value={calendar.id}>
                              {calendar.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Box
                          cursor="pointer"
                          onClick={() => setEditingPrimaryCalendarId(email.id)}
                          _hover={{ opacity: 0.8 }}
                        >
                          {email.primaryCalendarId ? (
                            <VStack align="start" spacing={0}>
                              <Badge colorScheme="green" fontSize="xs" variant="subtle">
                                🎯 Primary
                              </Badge>
                              <Text fontSize="2xs" color="gray.400">
                                {calendarsData?.calendars?.find((c: any) => c.id === email.primaryCalendarId)?.name || email.primaryCalendarId.slice(-6)}
                              </Text>
                            </VStack>
                          ) : (
                            <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                              Click to set
                            </Badge>
                          )}
                        </Box>
                      )}
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      {editingLinkedCalendarsId === email.id ? (
                        <VStack align="start" spacing={2}>
                          <Select
                            size="sm"
                            placeholder="Add calendar..."
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              if (e.target.value && !email.linkedCalendarIds?.includes(e.target.value)) {
                                handleUpdateLinkedCalendars(
                                  email.id,
                                  [...(email.linkedCalendarIds || []), e.target.value]
                                );
                              }
                            }}
                            width="150px"
                            fontSize="xs"
                          >
                            {calendarsData?.calendars
                              ?.filter((cal: any) => !email.linkedCalendarIds?.includes(cal.id))
                              ?.map((calendar: any) => (
                                <option key={calendar.id} value={calendar.id}>
                                  {calendar.name}
                                </option>
                              ))}
                          </Select>
                          <VStack align="start" spacing={1}>
                            {email.linkedCalendarIds?.map((calId: string) => {
                              const calendar = calendarsData?.calendars?.find((c: any) => c.id === calId);
                              return (
                                <HStack key={calId} spacing={1}>
                                  <Badge colorScheme="blue" fontSize="2xs">
                                    {calendar?.name || calId.slice(-6)}
                                  </Badge>
                                  <IconButton
                                    aria-label="Remove"
                                    icon={<FiTrash2 />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() =>
                                      handleUpdateLinkedCalendars(
                                        email.id,
                                        (email.linkedCalendarIds || []).filter((id: string) => id !== calId)
                                      )
                                    }
                                  />
                                </HStack>
                              );
                            })}
                          </VStack>
                          <Button
                            size="xs"
                            onClick={() => setEditingLinkedCalendarsId(null)}
                          >
                            Done
                          </Button>
                        </VStack>
                      ) : (
                        <Box
                          cursor="pointer"
                          onClick={() => setEditingLinkedCalendarsId(email.id)}
                          _hover={{ opacity: 0.8 }}
                        >
                          {email.linkedCalendarIds && email.linkedCalendarIds.length > 0 ? (
                            <VStack align="start" spacing={0}>
                              <Badge colorScheme="blue" fontSize="xs" variant="subtle">
                                📅 {email.linkedCalendarIds.length} linked
                              </Badge>
                              <Text fontSize="2xs" color="gray.400">
                                Click to edit
                              </Text>
                            </VStack>
                          ) : (
                            <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                              Click to add
                            </Badge>
                          )}
                        </Box>
                      )}
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      <VStack align="start" spacing={1}>
                        {email.acceptCalendarInvitesFromAnyone && (
                          <Badge colorScheme="green" fontSize="xs">
                            Accepts All
                          </Badge>
                        )}
                        {email.acceptedSenderEmailsForCalendarInvites && email.acceptedSenderEmailsForCalendarInvites.length > 0 && (
                          <Tooltip label={`Accepts from: ${email.acceptedSenderEmailsForCalendarInvites.join(', ')}`}>
                            <Badge colorScheme="blue" fontSize="xs">
                              {email.acceptedSenderEmailsForCalendarInvites.length} Allowed
                            </Badge>
                          </Tooltip>
                        )}
                        {email.blockedDomainsForCalendarInvites && email.blockedDomainsForCalendarInvites.length > 0 && (
                          <Tooltip label={`Blocks: ${email.blockedDomainsForCalendarInvites.join(', ')}`}>
                            <Badge colorScheme="red" fontSize="xs">
                              {email.blockedDomainsForCalendarInvites.length} Blocked
                            </Badge>
                          </Tooltip>
                        )}
                        {!email.acceptCalendarInvitesFromAnyone &&
                         (!email.acceptedSenderEmailsForCalendarInvites || email.acceptedSenderEmailsForCalendarInvites.length === 0) &&
                         (!email.blockedDomainsForCalendarInvites || email.blockedDomainsForCalendarInvites.length === 0) && (
                          <Text fontSize="xs" color="gray.500">No rules</Text>
                        )}
                      </VStack>
                    </Td>
                    <Td display={{ base: "none", md: "table-cell" }} px={{ base: 2, md: 4 }}>
                      <VStack align="start" spacing={2} maxW="250px">
                        {!email.associatedClients || email.associatedClients.length === 0 ? (
                          <Text fontSize="sm" color="gray.400">
                            Unassigned
                          </Text>
                        ) : (
                          email.associatedClients.map((clientId) => {
                            const client = clients.find(c => c.id === clientId);
                            return (
                              <Box key={clientId} p={2} borderRadius="md" bg="whiteAlpha.50" border="1px solid" borderColor={cardBorder} width="100%">
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={0.5} flex={1}>
                                    <Text fontSize="xs" fontWeight="medium" color={textColor}>
                                      {client ? `${client.fName} ${client.lName}` : 'Unknown Client'}
                                    </Text>
                                    {client?.email && (
                                      <Text fontSize="2xs" color="gray.400" noOfLines={1}>
                                        {client.email}
                                      </Text>
                                    )}
                                    {client?.phoneNumber && (
                                      <Text fontSize="2xs" color="gray.400">
                                        📱 {client.phoneNumber}
                                      </Text>
                                    )}
                                    <Text fontSize="2xs" color="gray.500">
                                      ID: {clientId}
                                    </Text>
                                  </VStack>
                                  <IconButton
                                    aria-label="Unassign client"
                                    icon={<FiTrash2 />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleUnassignEmail(email.id, clientId)}
                                  />
                                </HStack>
                              </Box>
                            );
                          })
                        )}
                      </VStack>
                    </Td>
                    <Td display={{ base: "none", lg: "table-cell" }} px={{ base: 2, md: 4 }}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color={textColor}>
                          📤 {email.emailsSent} sent
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          📥 {email.emailsReceived} received
                        </Text>
                      </VStack>
                    </Td>
                    <Td display={{ base: "none", lg: "table-cell" }} px={{ base: 2, md: 4 }}>
                      <Text fontSize="xs" color="gray.300">
                        {email.lastSeenAt ? new Date(email.lastSeenAt).toLocaleDateString() : "-"}
                      </Text>
                    </Td>
                    <Td px={{ base: 2, md: 4 }}>
                      <HStack spacing={1}>
                        {!email.isRegisteredWithImprovMX && (
                          <Button
                            leftIcon={<FiSettings />}
                            size={{ base: "xs", md: "sm" }}
                            variant="outline"
                            colorScheme="purple"
                            onClick={() => {
                              // If no postmarkEndpoint exists, use the default one
                              const endpoint = email.postmarkEndpoint || 'c167efbd0aabb934087409a8be5588be@inbound.postmarkapp.com';
                              setSelectedEmailForInstructions({
                                alias: email.email,
                                displayName: email.name || email.email,
                                postmarkEndpoint: endpoint,
                                type: email.type || 'BUSINESS'
                              });
                              setShowInstructions(true);
                            }}
                            fontSize={{ base: "xs", md: "sm" }}
                          >
                            View Microsoft Forwarding Instructions
                          </Button>
                        )}
                        <Tooltip label="Assign to client">
                          <IconButton
                            aria-label="Assign email"
                            icon={<FiPlus />}
                            size={{ base: "xs", md: "sm" }}
                            variant="ghost"
                            colorScheme="blue"
                            minW={{ base: "28px", md: "32px" }}
                            onClick={() => openAssignModal(email)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* How It Works Info Box */}
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px solid"
          borderColor={cardBorder}
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack align="start" spacing={{ base: 2, md: 3 }}>
              <HStack>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={textColor}>
                  📚 How Email Assignment Works
                </Text>
              </HStack>
              <VStack align="start" spacing={{ base: 1, md: 2 }} pl={{ base: 2, md: 4 }}>
                <HStack align="start" spacing={{ base: 2, md: 3 }}>
                  <Text color="blue.400" fontWeight="bold">1.</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">
                    Email addresses are automatically tracked when emails arrive at your Postmark inbound webhook
                  </Text>
                </HStack>
                <HStack align="start" spacing={{ base: 2, md: 3 }}>
                  <Text color="blue.400" fontWeight="bold">2.</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">
                    Click the plus button next to any email address to assign it to specific clients
                  </Text>
                </HStack>
                <HStack align="start" spacing={{ base: 2, md: 3 }}>
                  <Text color="blue.400" fontWeight="bold">3.</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">
                    Clients will only see emails from their assigned addresses in their inbox
                  </Text>
                </HStack>
                <HStack align="start" spacing={{ base: 2, md: 3 }}>
                  <Text color="blue.400" fontWeight="bold">4.</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">
                    System admins always see all emails regardless of assignments
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Assignment Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "md" }}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent 
            bg={cardGradientBg} 
            border="1px solid" 
            borderColor={cardBorder}
            margin={{ base: 0, md: "auto" }}
            borderRadius={{ base: 0, md: "md" }}
            maxH={{ base: "100vh", md: "90vh" }}
          >
            <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
              Assign Email: {selectedEmail?.email}
            </ModalHeader>
            <ModalCloseButton color={textColor} />
            <ModalBody pb={6}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Text color="gray.300" fontSize={{ base: "sm", md: "md" }}>
                  Select a client to assign this email address to:
                </Text>

                <Input
                  placeholder="Search by name, email, or client ID..."
                  value={clientSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientSearchTerm(e.target.value)}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  _placeholder={{ color: "gray.500" }}
                  mb={2}
                />

                <VStack spacing={2} align="stretch" maxH={{ base: "300px", md: "400px" }} overflowY="auto">
                  {clients
                    .filter(client => {
                      const searchLower = clientSearchTerm.toLowerCase();
                      return (
                        client.id.toLowerCase().includes(searchLower) ||
                        (client.fName?.toLowerCase().includes(searchLower) ?? false) ||
                        (client.lName?.toLowerCase().includes(searchLower) ?? false) ||
                        (client.email?.toLowerCase().includes(searchLower) ?? false)
                      );
                    })
                    .map((client) => (
                    <HStack
                      key={client.id}
                      p={{ base: 3, md: 4 }}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={cardBorder}
                      justify="space-between"
                      bg="whiteAlpha.50"
                      direction={{ base: "column", md: "row" }}
                      align={{ base: "stretch", md: "center" }}
                      spacing={{ base: 2, md: 3 }}
                    >
                      <VStack align={{ base: "stretch", md: "start" }} spacing={1} flex="1">
                        <Text color={textColor} fontWeight="medium" fontSize={{ base: "sm", md: "md" }} textAlign={{ base: "center", md: "left" }}>
                          {client.fName} {client.lName}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400" textAlign={{ base: "center", md: "left" }}>
                          {client.email}
                        </Text>
                        {client.phoneNumber && (
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400" textAlign={{ base: "center", md: "left" }}>
                            📱 {client.phoneNumber}
                          </Text>
                        )}
                        <Text fontSize={{ base: "xs", md: "xs" }} color="gray.500" textAlign={{ base: "center", md: "left" }}>
                          ID: {client.id}
                        </Text>
                      </VStack>
                      <Button
                        size={{ base: "sm", md: "sm" }}
                        colorScheme="blue"
                        width={{ base: "100%", md: "auto" }}
                        minW={{ md: "120px" }}
                        onClick={() => handleAssignEmail(client.id)}
                        isDisabled={selectedEmail?.associatedClients?.includes(client.id)}
                      >
                        {selectedEmail?.associatedClients?.includes(client.id) ? 'Already Assigned' : 'Assign'}
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Create Email Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={{ base: "full", md: "md" }}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            margin={{ base: 0, md: "auto" }}
            borderRadius={{ base: 0, md: "md" }}
          >
            <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
              Create New Email Address (ImprovMX)
            </ModalHeader>
            <ModalCloseButton color={textColor} />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Email Alias *
                  </Text>
                  <Input
                    placeholder="e.g., support, info, sales"
                    value={newEmailAlias}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmailAlias(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor={cardBorder}
                    color={textColor}
                    _placeholder={{ color: "gray.500" }}
                  />
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Only lowercase letters, numbers, dots and dashes allowed
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Display Name (Optional)
                  </Text>
                  <Input
                    placeholder="e.g., Customer Support"
                    value={newEmailName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmailName(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor={cardBorder}
                    color={textColor}
                    _placeholder={{ color: "gray.500" }}
                  />
                </Box>

                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Email Type
                  </Text>
                  <Select
                    value={newEmailType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEmailType(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor={cardBorder}
                    color={textColor}
                  >
                    <option value="BUSINESS">Business</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="SUPPORT">Support</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="NOREPLY">No Reply</option>
                    <option value="UNKNOWN">Unknown</option>
                  </Select>
                </Box>

                <Alert status="info" bg="blue.900" border="1px solid" borderColor="blue.700">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold" color="blue.200" mb={2}>
                      🚀 Automatic ImprovMX Forwarding
                    </Text>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="blue.100">
                        This option uses <strong>ImprovMX</strong> for automatic email forwarding:
                      </Text>
                      <VStack align="start" pl={4} spacing={1}>
                        <Text fontSize="xs" color="gray.300">
                          ✅ <strong>Instant setup</strong> - forwarding rules created automatically
                        </Text>
                        <Text fontSize="xs" color="gray.300">
                          ✅ <strong>No manual configuration</strong> - works immediately
                        </Text>
                        <Text fontSize="xs" color="gray.300">
                          ✅ <strong>Auto-forwards to Postmark</strong> for programmatic processing
                        </Text>
                        <Text fontSize="xs" color="gray.300">
                          ✅ <strong>Perfect for new emails</strong> not in Microsoft 365
                        </Text>
                      </VStack>
                      <Divider borderColor="blue.600" my={2} />
                      <Text fontSize="xs" color="orange.300">
                        💡 <strong>Already using Microsoft 365?</strong> Use the purple "Setup M365 Forwarding" button instead to keep emails in your existing Microsoft system.
                      </Text>
                    </VStack>
                  </Box>
                </Alert>

                <HStack spacing={3} justify="flex-end" pt={2}>
                  <Button variant="ghost" onClick={onCreateClose} color={textColor}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleCreateEmail}
                    isDisabled={!newEmailAlias.trim()}
                  >
                    Create Email
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Microsoft 365 Forwarding Setup Modal */}
        <Modal isOpen={isForwardingOpen} onClose={onForwardingClose} size="xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
          >
            <ModalHeader color={textColor}>Setup Microsoft 365 Email Forwarding</ModalHeader>
            <ModalCloseButton color={textColor} />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Alert status="info" bg="blue.900" border="1px solid" borderColor="blue.700">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Manual Setup Required</Text>
                    <Text fontSize="sm">
                      This will generate instructions for configuring email forwarding in Microsoft 365 to Postmark.
                    </Text>
                  </Box>
                </Alert>

                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Forwarding Type
                  </Text>
                  <Select
                    value={forwardingType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForwardingType(e.target.value as any)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor={cardBorder}
                    color={textColor}
                  >
                    <option value="SHARED">Shared Mailbox (Team Access)</option>
                    <option value="DISTRIBUTION">Distribution List (Multiple Recipients)</option>
                    <option value="PERSONAL">Personal Alias (Single User)</option>
                  </Select>
                </Box>

                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Email Alias
                  </Text>
                  <HStack>
                    <Input
                      placeholder="support"
                      value={forwardingAlias}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForwardingAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: "gray.500" }}
                    />
                    <Text color="gray.400">@vanguardiq.com.au</Text>
                  </HStack>
                </Box>

                <Box>
                  <Text color="gray.300" fontSize="sm" mb={2}>
                    Display Name
                  </Text>
                  <Input
                    placeholder="Support Team"
                    value={forwardingDisplayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForwardingDisplayName(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor={cardBorder}
                    color={textColor}
                    _placeholder={{ color: "gray.500" }}
                  />
                </Box>

                <Alert status="info" bg="purple.900" border="1px solid" borderColor="purple.700" fontSize="sm">
                  <AlertIcon />
                  <Box>
                    {(selectedEmailForInstructions?.type === 'SUPPORT' || selectedEmailForInstructions?.type === 'SHARED') && (
                      <>
                        <Text fontWeight="bold">Shared Mailbox</Text>
                        <Text>Perfect for support@, info@, sales@. Multiple people can access without extra licenses.</Text>
                      </>
                    )}
                    {(selectedEmailForInstructions?.type === 'BUSINESS' || selectedEmailForInstructions?.type === 'DISTRIBUTION') && (
                      <>
                        <Text fontWeight="bold">Distribution List</Text>
                        <Text>Emails forward to all list members. Great for team@, alerts@.</Text>
                      </>
                    )}
                    {selectedEmailForInstructions?.type === 'PERSONAL' && (
                      <>
                        <Text fontWeight="bold">Personal Alias</Text>
                        <Text>Additional email address for an existing user mailbox.</Text>
                      </>
                    )}
                  </Box>
                </Alert>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onForwardingClose} color={textColor}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleCreateForwarding}
                isDisabled={!forwardingAlias}
              >
                Create Email & Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Setup Instructions Modal */}
        <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} size="2xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            maxH="90vh"
            overflowY="auto"
          >
            <ModalHeader color={textColor}>
              Setup Instructions for {selectedEmailForInstructions?.alias}
            </ModalHeader>
            <ModalCloseButton color={textColor} />
            <ModalBody pb={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="success" bg="green.900" border="1px solid" borderColor="green.700">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Postmark Endpoint Created</Text>
                    <Code colorScheme="green" bg="green.800">{selectedEmailForInstructions?.postmarkEndpoint}</Code>
                  </Box>
                </Alert>

                <Box>
                  <Text fontWeight="bold" mb={3} color={textColor}>Setup Steps in Microsoft 365 Admin Center:</Text>
                  <OrderedList spacing={3} color="gray.300">
                    <ListItem>
                      <Text fontWeight="semibold">Open Microsoft 365 Admin Center</Text>
                      <Link
                        href="https://admin.microsoft.com/Adminportal/Home#/users"
                        isExternal
                        color="blue.400"
                      >
                        Go to Admin Center <FiExternalLink style={{ display: 'inline' }} />
                      </Link>
                    </ListItem>

                    {(selectedEmailForInstructions?.type === 'SUPPORT' || selectedEmailForInstructions?.type === 'SHARED') && (
                      <>
                        <ListItem>
                          <Text fontWeight="semibold">Create a Shared Mailbox</Text>
                          <Text fontSize="sm" color="gray.400">
                            Navigate to Teams & Groups → Shared mailboxes → Add a shared mailbox
                          </Text>
                          <Text fontSize="sm" mt={1}>
                            • Name: <Code>{selectedEmailForInstructions?.displayName}</Code>
                          </Text>
                          <Text fontSize="sm">
                            • Email: <Code>{selectedEmailForInstructions?.alias?.replace('@vanguardiq.com.au', '')}</Code>
                          </Text>
                        </ListItem>
                        <ListItem>
                          <Text fontWeight="semibold">Add Members to the Shared Mailbox</Text>
                          <Text fontSize="sm" color="gray.400">
                            Add users who need to access this mailbox
                          </Text>
                        </ListItem>
                      </>
                    )}

                    {(selectedEmailForInstructions?.type === 'BUSINESS' || selectedEmailForInstructions?.type === 'DISTRIBUTION') && (
                      <>
                        <ListItem>
                          <Text fontWeight="semibold">Create a Distribution List</Text>
                          <Text fontSize="sm" color="gray.400">
                            Navigate to Teams & Groups → Distribution lists → Add a group
                          </Text>
                          <Text fontSize="sm" mt={1}>
                            • Name: <Code>{selectedEmailForInstructions?.displayName}</Code>
                          </Text>
                          <Text fontSize="sm">
                            • Email: <Code>{selectedEmailForInstructions?.alias?.replace('@vanguardiq.com.au', '')}</Code>
                          </Text>
                        </ListItem>
                        <ListItem>
                          <Text fontWeight="semibold">Add Members to the List</Text>
                          <Text fontSize="sm" color="gray.400">
                            Add all recipients who should receive emails sent to this list
                          </Text>
                        </ListItem>
                      </>
                    )}

                    {selectedEmailForInstructions?.type === 'PERSONAL' && (
                      <ListItem>
                        <Text fontWeight="semibold">Add Alias to User Mailbox</Text>
                        <Text fontSize="sm" color="gray.400">
                          Navigate to Users → Active users → Select user → Manage email addresses
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          Add alias: <Code>{selectedEmailForInstructions?.alias}</Code>
                        </Text>
                      </ListItem>
                    )}

                    <ListItem>
                      <Text fontWeight="semibold">Setup Mail Flow Rule for Postmark</Text>
                      <VStack align="start" spacing={2} mt={2}>
                        <Alert status="warning" bg="orange.900" border="1px solid" borderColor="orange.700" fontSize="sm">
                          <AlertIcon />
                          <Box>
                            <Text fontWeight="bold">Important: Switch to Exchange Admin Center</Text>
                            <Text fontSize="xs">You're currently in Microsoft 365 Admin. Click below to go to Exchange Admin:</Text>
                          </Box>
                        </Alert>
                        <Link
                          href="https://admin.exchange.microsoft.com/#/mailflow/rules"
                          isExternal
                          color="blue.400"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          → Open Exchange Admin Center - Mail Flow Rules <FiExternalLink style={{ display: 'inline' }} />
                        </Link>
                        <Text fontSize="xs" color="gray.400">
                          Or from Microsoft 365 Admin: Click "Show all" in left menu → "Exchange" → "Mail flow" → "Rules"
                        </Text>
                      </VStack>

                      <Box bg="gray.800" p={3} borderRadius="md" mt={3}>
                        <Text fontSize="sm" color="gray.200" fontWeight="bold" mb={2}>
                          Detailed Steps in Exchange Admin Center:
                        </Text>

                        <VStack align="stretch" spacing={3} pl={2}>
                          <Box>
                            <Text fontSize="sm" color="blue.300" fontWeight="semibold">Step 1: Create New Rule</Text>
                            <Text fontSize="xs" color="gray.400">• Click "+ Add a rule" button</Text>
                            <Text fontSize="xs" color="gray.400">• Select "Create a new rule"</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="blue.300" fontWeight="semibold">Step 2: Set Rule Conditions</Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Name:</strong> <Code fontSize="xs">Forward {selectedEmailForInstructions?.alias?.replace('@vanguardiq.com.au', '')} to Postmark</Code></Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Apply this rule if:</strong> Select "The recipient..." → "address contains any of these words"</Text>
                            <Text fontSize="xs" color="gray.400" pl={4}>→ Enter: <Code fontSize="xs">{selectedEmailForInstructions?.alias}</Code></Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Do the following:</strong> Select "Redirect the message to..." → "Select one"</Text>
                            <Text fontSize="xs" color="gray.400" pl={4}>→ Click in the field and type/paste: <Code fontSize="xs">{selectedEmailForInstructions?.postmarkEndpoint}</Code></Text>
                            <Text fontSize="xs" color="gray.400" pl={4}>→ Press Enter or semicolon (;) to add it</Text>
                            <Text fontSize="xs" color="gray.400" pl={4}>→ Click "Save" to confirm the recipient</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="blue.300" fontWeight="semibold">Step 3: Configure Rule Settings</Text>
                            <Text fontSize="xs" color="gray.400">• Click "Next" to go to settings page</Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Rule mode:</strong> Select <Badge colorScheme="green" fontSize="xs">Enforce</Badge></Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Severity:</strong> Leave as "Not specified"</Text>
                            <Text fontSize="xs" color="gray.400">• <strong>Stop processing more rules:</strong> <Badge colorScheme="orange" fontSize="xs">CHECK THIS BOX</Badge> (Important!)</Text>
                            <Text fontSize="xs" color="gray.400">• Leave other settings as default</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="blue.300" fontWeight="semibold">Step 4: Optional - Keep a Copy</Text>
                            <Text fontSize="xs" color="gray.400">• Back in rule conditions, click "+ Add action"</Text>
                            <Text fontSize="xs" color="gray.400">• Select "Bcc the message to..." or "Send a copy to..."</Text>
                            <Text fontSize="xs" color="gray.400">• Add: <Code fontSize="xs">{selectedEmailForInstructions?.alias}</Code> (your shared mailbox)</Text>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="blue.300" fontWeight="semibold">Step 5: Finish</Text>
                            <Text fontSize="xs" color="gray.400">• Click "Next" to review</Text>
                            <Text fontSize="xs" color="gray.400">• Click "Finish" or "Save" to create the rule</Text>
                          </Box>
                        </VStack>
                      </Box>
                    </ListItem>

                    <ListItem>
                      <Text fontWeight="semibold">Test the Configuration</Text>
                      <Text fontSize="sm" color="gray.400">
                        Send a test email to <Code>{selectedEmailForInstructions?.alias}</Code> and verify:
                      </Text>
                      <VStack align="stretch" spacing={1} pl={4} mt={1}>
                        <Text fontSize="sm">✓ Email arrives in the mailbox</Text>
                        <Text fontSize="sm">✓ Copy is forwarded to Postmark endpoint</Text>
                        <Text fontSize="sm">✓ Check Postmark activity logs</Text>
                      </VStack>
                    </ListItem>
                  </OrderedList>
                </Box>

                <Divider borderColor={cardBorder} />

                <Alert status="warning" bg="orange.900" border="1px solid" borderColor="orange.700">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Important Notes:</Text>
                    <Text fontSize="sm">• Changes may take 15-30 minutes to propagate in Microsoft 365</Text>
                    <Text fontSize="sm">• The Postmark endpoint will process incoming emails programmatically</Text>
                    <Text fontSize="sm">• Keep a copy in the mailbox for backup and manual review</Text>
                  </Box>
                </Alert>

                <HStack justify="space-between">
                  <Button
                    onClick={() => handleCopyToClipboard(selectedEmailForInstructions?.postmarkEndpoint)}
                    leftIcon={<FiCopy />}
                    variant="outline"
                    colorScheme="purple"
                  >
                    Copy Postmark Endpoint
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      setShowInstructions(false);
                      setSelectedEmailForInstructions(null);
                    }}
                  >
                    Done
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};