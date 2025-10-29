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
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  IconButton,
  Tooltip,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Divider,
  useColorMode,
  SimpleGrid
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCalendar, FiUser, FiEdit, FiEye, FiMail, FiSettings, FiCopy, FiPhone, FiShare2, FiUsers, FiUserCheck, FiClock } from 'react-icons/fi';
import { useQuery, useMutation, gql } from '@apollo/client';
import { format } from 'date-fns';
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useNavigate } from 'react-router-dom';
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { calendarsModuleConfig } from "./moduleConfig";
import ExternalCalendarModal from "./ExternalCalendarModal";
import { CalendarType, CalendarVisibility } from "../../generated/graphql";

// GraphQL queries and mutations
const GET_ALL_CALENDARS = gql`
  query GetAllCalendars {
    calendars {
      id
      name
      description
      type
      visibility
      responsibleOwnerId
      ownerType
      linkedEmailAddressId
      companyId
      projectId
      color
      isPublic
      totalEvents
      upcomingEvents
      sharedFromEmail
      sharedFromName
      iCalUrl
      allowPublicBooking
      bookingPageSlug
      settings {
        timezone
        emailNotifications
        smsNotifications
        defaultReminderMinutes
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_EXTERNAL_CALENDARS = gql`
  query GetExternalCalendars {
    getExternalCalendars {
      id
      name
      type
      iCalUrl
      color
      sharedFromName
      sharedFromEmail
      isActive
      createdAt
    }
  }
`;

const CREATE_CALENDAR = gql`
  mutation CreateCalendar($input: BusinessCalendarInput!) {
    createCalendar(input: $input) {
      id
      name
      description
      type
      visibility
      color
      responsibleOwnerId
    }
  }
`;

const DELETE_CALENDAR = gql`
  mutation DeleteCalendar($id: String!) {
    deleteCalendar(id: $id)
  }
`;

const UPDATE_CALENDAR = gql`
  mutation UpdateCalendar($id: String!, $input: BusinessCalendarInput!) {
    updateCalendar(id: $id, input: $input) {
      id
      name
      description
      type
      visibility
      color
      acceptedEmailAddresses
    }
  }
`;

const GET_VERIFIED_EMAIL_ADDRESSES = gql`
  query GetVerifiedEmailAddresses {
    emailAddresses(isVerified: true) {
      id
      email
      name
      type
      isVerified
      isRegisteredWithImprovMX
      emailsReceived
      emailsSent
      domain
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
    }
  }
`;

const ADD_ACCEPTED_EMAIL = gql`
  mutation AddAcceptedEmailToCalendar($calendarId: String!, $email: String!) {
    addAcceptedEmailToCalendar(calendarId: $calendarId, email: $email) {
      id
      acceptedEmailAddresses
    }
  }
`;

const ADD_CLIENT_SHARE = gql`
  mutation AddClientShareToCalendar($calendarId: String!, $clientId: String!, $permissions: [String!]!, $notes: String) {
    addClientShareToCalendar(
      calendarId: $calendarId
      clientId: $clientId
      permissions: $permissions
      notes: $notes
    ) {
      id
      clientShares {
        clientId
        clientName
        permissions
        sharedAt
        isActive
      }
    }
  }
`;

const REMOVE_CLIENT_SHARE = gql`
  mutation RemoveClientShareFromCalendar($calendarId: String!, $clientId: String!) {
    removeClientShareFromCalendar(calendarId: $calendarId, clientId: $clientId) {
      id
      clientShares {
        clientId
        clientName
        permissions
        isActive
      }
    }
  }
`;

const REMOVE_ACCEPTED_EMAIL = gql`
  mutation RemoveAcceptedEmailFromCalendar($calendarId: String!, $email: String!) {
    removeAcceptedEmailFromCalendar(calendarId: $calendarId, email: $email) {
      id
      acceptedEmailAddresses
    }
  }
`;

const TRANSFER_OWNERSHIP = gql`
  mutation TransferCalendarOwnership($calendarId: String!, $newOwnerId: String) {
    transferCalendarOwnership(calendarId: $calendarId, newOwnerId: $newOwnerId) {
      id
      responsibleOwnerId
    }
  }
`;

const CalendarAccountsAdmin: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isEmailsOpen, onOpen: onEmailsOpen, onClose: onEmailsClose } = useDisclosure();
  const { isOpen: isSharesOpen, onOpen: onSharesOpen, onClose: onSharesClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  const { isOpen: isExternalOpen, onOpen: onExternalOpen, onClose: onExternalClose } = useDisclosure();

  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [selectedEmailToAdd, setSelectedEmailToAdd] = useState('');
  const [selectedClientToShare, setSelectedClientToShare] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [shareNotes, setShareNotes] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(new Set());

  // Update page title
  usePageTitle('Calendar Admin');

  // State for creating new calendar
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarDescription, setNewCalendarDescription] = useState('');
  const [newCalendarType, setNewCalendarType] = useState('BUSINESS');
  const [newCalendarVisibility, setNewCalendarVisibility] = useState('PRIVATE');
  const [newCalendarColor, setNewCalendarColor] = useState('#4A90E2');
  const [newCalendarTimezone, setNewCalendarTimezone] = useState('Australia/Sydney');

  // State for editing calendar
  const [editCalendarName, setEditCalendarName] = useState('');
  const [editCalendarDescription, setEditCalendarDescription] = useState('');
  const [editCalendarType, setEditCalendarType] = useState('');
  const [editCalendarVisibility, setEditCalendarVisibility] = useState('');
  const [editCalendarColor, setEditCalendarColor] = useState('');

  // GraphQL queries
  const { data: calendarsData, loading: calendarsLoading, error: calendarsError, refetch: refetchCalendars } = useQuery(GET_ALL_CALENDARS);
  const { data: externalCalendarsData, refetch: refetchExternalCalendars } = useQuery(GET_EXTERNAL_CALENDARS);
  const { data: emailAddressesData, loading: emailAddressesLoading } = useQuery(GET_VERIFIED_EMAIL_ADDRESSES);
  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);

  // Debug logging
  if (calendarsError) {
    console.error('Error fetching calendars:', calendarsError);
  }

  // Helper function to get owner details
  const getOwnerDetails = (ownerId: string) => {
    if (!clientsData?.clients) return null;
    return clientsData.clients.find((client: any) => client.id === ownerId);
  };


  // GraphQL mutations
  const [createCalendar] = useMutation(CREATE_CALENDAR, {
    onCompleted: (data) => {
      toast({
        title: 'Calendar created successfully',
        description: `Created ${data.createCalendar.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      refetchCalendars();
      onCreateClose();
      // Reset form
      setNewCalendarName('');
      setNewCalendarDescription('');
      setNewCalendarType('BUSINESS');
      setNewCalendarVisibility('PRIVATE');
      setNewCalendarColor('#4A90E2');
      setNewCalendarTimezone('Australia/Sydney');
    },
    onError: (error) => {
      toast({
        title: 'Error creating calendar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateCalendar] = useMutation(UPDATE_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'Calendar updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
      onEditClose();
    },
    onError: (error) => {
      toast({
        title: 'Error updating calendar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteCalendar] = useMutation(DELETE_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'Calendar deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting calendar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [addAcceptedEmail] = useMutation(ADD_ACCEPTED_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email address added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
      setSelectedEmailToAdd('');
    },
    onError: (error) => {
      toast({
        title: 'Error adding email address',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [addClientShare] = useMutation(ADD_CLIENT_SHARE, {
    onCompleted: () => {
      toast({
        title: 'Client share added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
      setSelectedClientToShare('');
      setSelectedPermissions([]);
      setShareNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Error adding client share',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [removeClientShare] = useMutation(REMOVE_CLIENT_SHARE, {
    onCompleted: () => {
      toast({
        title: 'Client share removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
    },
    onError: (error) => {
      toast({
        title: 'Error removing client share',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [transferOwnership] = useMutation(TRANSFER_OWNERSHIP, {
    onCompleted: () => {
      toast({
        title: 'Ownership transferred successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
      onTransferClose();
      setNewOwnerId('');
    },
    onError: (error) => {
      toast({
        title: 'Error transferring ownership',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [removeAcceptedEmail] = useMutation(REMOVE_ACCEPTED_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email address removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchCalendars();
    },
    onError: (error) => {
      toast({
        title: 'Error removing email address',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textColor = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const mutedTextColor = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const labelColor = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  const calendars = calendarsData?.calendars || [];

  // Get enum values from generated types
  const calendarTypes = Object.entries(CalendarType).map(([key, value]) => ({
    name: value,
    label: key.replace(/([A-Z])/g, ' $1').trim(), // Convert "SharedExternal" to "Shared External"
  }));

  const calendarVisibilities = Object.entries(CalendarVisibility).map(([key, value]) => ({
    name: value,
    label: key,
  }));

  // Debug logging
  console.log('Calendars data:', {
    calendarsData,
    calendars,
    count: calendars.length,
    loading: calendarsLoading,
    error: calendarsError,
    calendarTypes,
    calendarVisibilities
  });

  // Filter calendars based on search and filters
  const filteredCalendars = calendars.filter((calendar: any) => {
    const matchesSearch = calendar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calendar.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || calendar.type === filterType;
    const matchesVisibility = filterVisibility === 'all' || calendar.visibility === filterVisibility;

    return matchesSearch && matchesType && matchesVisibility;
  });

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a calendar name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await createCalendar({
      variables: {
        input: {
          name: newCalendarName,
          description: newCalendarDescription || undefined,
          type: newCalendarType,
          visibility: newCalendarVisibility,
          color: newCalendarColor,
          settings: {
            timezone: newCalendarTimezone,
            emailNotifications: true,
            smsNotifications: false,
            defaultReminderMinutes: 15
          }
        },
      },
    });
  };

  const handleUpdateCalendar = async () => {
    if (!selectedCalendar) return;

    await updateCalendar({
      variables: {
        id: selectedCalendar.id,
        input: {
          name: editCalendarName,
          description: editCalendarDescription || undefined,
          type: editCalendarType,
          visibility: editCalendarVisibility,
          color: editCalendarColor,
        },
      },
    });
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (window.confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      await deleteCalendar({
        variables: { id: calendarId },
      });
    }
  };

  const openEditModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setEditCalendarName(calendar.name);
    setEditCalendarDescription(calendar.description || '');
    setEditCalendarType(calendar.type);
    setEditCalendarVisibility(calendar.visibility);
    setEditCalendarColor(calendar.color || '#4A90E2');
    onEditOpen();
  };

  const openEmailsModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setSelectedEmailToAdd('');
    onEmailsOpen();
  };

  const openSharesModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setSelectedClientToShare('');
    setSelectedPermissions([]);
    setShareNotes('');
    onSharesOpen();
  };

  const handleAddEmail = async () => {
    if (!selectedCalendar || !selectedEmailToAdd) return;

    await addAcceptedEmail({
      variables: {
        calendarId: selectedCalendar.id,
        email: selectedEmailToAdd
      }
    });
  };

  const handleRemoveEmail = async (email: string) => {
    if (!selectedCalendar) return;

    await removeAcceptedEmail({
      variables: {
        calendarId: selectedCalendar.id,
        email: email
      }
    });
  };

  const handleAddClientShare = async () => {
    if (!selectedCalendar || !selectedClientToShare || selectedPermissions.length === 0) return;

    await addClientShare({
      variables: {
        calendarId: selectedCalendar.id,
        clientId: selectedClientToShare,
        permissions: selectedPermissions,
        notes: shareNotes || undefined
      }
    });
  };

  const handleRemoveClientShare = async (clientId: string) => {
    if (!selectedCalendar) return;

    await removeClientShare({
      variables: {
        calendarId: selectedCalendar.id,
        clientId: clientId
      }
    });
  };

  const openTransferModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setNewOwnerId('');
    onTransferOpen();
  };

  const handleTransferOwnership = async () => {
    if (!selectedCalendar) return;

    await transferOwnership({
      variables: {
        calendarId: selectedCalendar.id,
        newOwnerId: newOwnerId || undefined
      }
    });
  };

  const handleCopyToClipboard = (text: string, label: string = 'Text') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${label} copied to clipboard`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const getCalendarTypeColor = (type: string) => {
    switch (type) {
      case 'BUSINESS': return 'blue';
      case 'EMAIL': return 'green';
      case 'PERSONAL': return 'purple';
      case 'COMPANY': return 'orange';
      case 'EMPLOYEE': return 'cyan';
      case 'RESOURCE': return 'pink';
      case 'PROJECT': return 'yellow';
      default: return 'gray';
    }
  };

  const getVisibilityBadgeColor = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return 'green';
      case 'PRIVATE': return 'red';
      case 'SHARED': return 'blue';
      case 'COMPANY': return 'orange';
      case 'TEAM': return 'purple';
      default: return 'gray';
    }
  };

  // Toggle calendar selection
  const toggleCalendarSelection = (calendarId: string) => {
    setSelectedCalendarIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(calendarId)) {
        newSet.delete(calendarId);
      } else {
        newSet.add(calendarId);
      }
      return newSet;
    });
  };

  // Select/Deselect all calendars
  const toggleAllCalendars = () => {
    if (selectedCalendarIds.size === filteredCalendars.length) {
      setSelectedCalendarIds(new Set());
    } else {
      setSelectedCalendarIds(new Set(filteredCalendars.map((c: any) => c.id)));
    }
  };

  // Open selected calendars in new tab
  const openMultipleCalendars = () => {
    if (selectedCalendarIds.size === 0) {
      toast({
        title: 'No calendars selected',
        description: 'Please select at least one calendar to view',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const calendarIds = Array.from(selectedCalendarIds).join(',');
    const url = `/calendars/view?calendars=${calendarIds}`;
    window.open(url, '_blank');

    // Clear selection after opening
    setSelectedCalendarIds(new Set());
  };

  if (calendarsLoading || clientsLoading) {
    return (
      <Box minH="100vh" bg={bg}>
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
        <Box p={6} display="flex" alignItems="center" justifyContent="center" minH="50vh">
          <Spinner size="xl" color={textColor} />
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (calendarsError) {
    return (
      <Box minH="100vh" bg={bg}>
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
        <Box p={6}>
          <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
            <CardBody>
              <VStack spacing={4}>
                <Text color="red.400" fontSize="lg">Error loading calendars</Text>
                <Text color={textColor} fontSize="sm">{calendarsError.message}</Text>
                <Button onClick={() => refetchCalendars()} colorScheme="blue">
                  Try Again
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
      <Box p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch" maxW={{ base: "100%", lg: "none" }}>
          {/* Header */}
          <Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={textColor} mb={2}>
              📅 Calendar Management
            </Text>
            <Text color={mutedTextColor} fontSize={{ base: "md", md: "lg" }} lineHeight="1.6">
              Manage all business calendars, configure sharing settings, and monitor calendar usage across the organization.
            </Text>
          </Box>

          {/* Field Relationship Info Box */}
          <Card
            bg="blue.900"
            border="2px solid"
            borderColor="blue.600"
            borderRadius="lg"
            p={4}
          >
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color="blue.300">
                    📊 BusinessCalendar Field Analysis & Recommendations
                  </Text>
                </HStack>
                <Divider borderColor="blue.700" />

                <Box>
                  <Text fontWeight="bold" color="green.300" mb={2}>✅ FIELDS TO KEEP:</Text>
                  <VStack align="start" spacing={1} pl={4}>
                    <Text color="gray.300" fontSize="sm">• <strong>responsibleOwnerId</strong> - Primary client who owns the calendar</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>linkedEmailAddressId</strong> - Links to EmailAddress entity (single source of truth)</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>type, visibility, name, description</strong> - Core calendar properties</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>companyId, projectId</strong> - For company/project specific calendars</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>sharedFromEmail/Name</strong> - Track external calendar shares (Google/Outlook)</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>settings</strong> - Timezone, notifications, working hours</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>syncInfo</strong> - For external calendar sync</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" color="green.300" mb={2}>✨ FINAL ARCHITECTURE:</Text>
                  <VStack align="start" spacing={1} pl={4}>
                    <Text color="gray.300" fontSize="sm">• <strong>EmailAddress</strong> is now the single source of truth for email-to-calendar routing</Text>
                    <Text color="gray.300" fontSize="sm">• <strong>BusinessCalendar</strong> focuses on calendar configuration and display</Text>
                    <Text color="gray.300" fontSize="sm">• Email acceptance rules and client sharing are managed via EmailAddress entity</Text>
                    <Text color="gray.300" fontSize="sm">• Cleaner separation of concerns and no data duplication</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" color="cyan.300" mb={2}>🔑 KEY PRINCIPLE:</Text>
                  <Text color="gray.100" fontSize="sm">
                    EmailAddress entity should be the SINGLE SOURCE OF TRUTH for:
                  </Text>
                  <VStack align="start" spacing={1} pl={4} mt={1}>
                    <Text color="gray.300" fontSize="sm">1. Which emails can send to a calendar (via primaryCalendarId)</Text>
                    <Text color="gray.300" fontSize="sm">2. Which clients can access emails (via associatedClients)</Text>
                    <Text color="gray.300" fontSize="sm">3. Email-to-calendar routing rules</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400" fontStyle="italic">
                    💡 Hover over column headers below to see field-specific recommendations
                  </Text>
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
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Total Calendars</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {calendars.length}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      Active calendars in system
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="blue.500" color="white">
                    <FiCalendar size={24} />
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
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Total Events</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {calendars.reduce((sum: number, cal: any) => sum + (cal.totalEvents || 0), 0)}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      Across all calendars
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="green.500" color="white">
                    <FiCalendar size={24} />
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
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Public Calendars</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {calendars.filter((c: any) => c.visibility === 'PUBLIC').length}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      Visible to all users
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="purple.500" color="white">
                    <FiEye size={24} />
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
                  placeholder="Search calendars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  _placeholder={{ color: "gray.500" }}
                />
                <HStack spacing={3} justifyContent="space-between">
                  <HStack spacing={3} flex="1">
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      flex={1}
                    >
                      <option value="all">All Types</option>
                      {calendarTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={filterVisibility}
                      onChange={(e) => setFilterVisibility(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      flex={1}
                    >
                      <option value="all">All Visibility</option>
                      {calendarVisibilities.map((visibility) => (
                        <option key={visibility.name} value={visibility.name}>
                          {visibility.label}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  <HStack spacing={2}>
                    {selectedCalendarIds.size > 0 && (
                      <Button
                        leftIcon={<FiEye />}
                        colorScheme="purple"
                        onClick={openMultipleCalendars}
                        size="md"
                        variant="outline"
                      >
                        View {selectedCalendarIds.size} Calendar{selectedCalendarIds.size !== 1 ? 's' : ''}
                      </Button>
                    )}
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      onClick={onCreateOpen}
                      size="md"
                    >
                      Create Calendar
                    </Button>
                    <Button
                      leftIcon={<FiShare2 />}
                      colorScheme="green"
                      onClick={onExternalOpen}
                      size="md"
                      variant="outline"
                    >
                      Add External Calendar
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Calendars Table */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
          >
            <CardBody p={{ base: 2, md: 6 }}>
              <Box overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th color={labelColor} width="50px">
                        <Checkbox
                          isChecked={selectedCalendarIds.size === filteredCalendars.length && filteredCalendars.length > 0}
                          isIndeterminate={selectedCalendarIds.size > 0 && selectedCalendarIds.size < filteredCalendars.length}
                          onChange={toggleAllCalendars}
                          colorScheme="purple"
                        />
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - Calendar display name (Required)" placement="top" hasArrow>
                          <Text>Name</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - Type of calendar (BUSINESS, EMAIL, etc) - determines purpose (Required)" placement="top" hasArrow>
                          <Text>Type</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - Who can see this calendar (Required)" placement="top" hasArrow>
                          <Text>Visibility</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - responsibleOwnerId: Client ID who owns this calendar (Required)" placement="top" hasArrow>
                          <Text>Owner</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - sharedFromEmail: When calendar is shared from external source (Google/Outlook)" placement="top" hasArrow>
                          <Text>Shared From</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - Event count statistics (Read-only)" placement="top" hasArrow>
                          <Text>Events</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Tooltip label="✅ KEEP - Creation date (Auto-generated)" placement="top" hasArrow>
                          <Text>Created</Text>
                        </Tooltip>
                      </Th>
                      <Th color={labelColor}>
                        <Text>Actions</Text>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCalendars.map((calendar: any) => (
                      <Tr key={calendar.id}>
                        <Td width="50px">
                          <Checkbox
                            isChecked={selectedCalendarIds.has(calendar.id)}
                            onChange={() => toggleCalendarSelection(calendar.id)}
                            colorScheme="purple"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Box
                              w={3}
                              h={3}
                              borderRadius="full"
                              bg={calendar.color || '#4A90E2'}
                            />
                            <VStack align="start" spacing={0}>
                              <Text color={textColor} fontWeight="medium">
                                {calendar.name}
                              </Text>
                              {calendar.description && (
                                <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                  {calendar.description}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getCalendarTypeColor(calendar.type)}>
                            {calendar.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getVisibilityBadgeColor(calendar.visibility)}>
                            {calendar.visibility}
                          </Badge>
                        </Td>
                        <Td>
                          {(() => {
                            const ownerDetails = calendar.responsibleOwnerId ? getOwnerDetails(calendar.responsibleOwnerId) : null;
                            return (
                              <HStack spacing={2}>
                                {!calendar.responsibleOwnerId ? (
                                  <Box
                                    p={2}
                                    bg="whiteAlpha.50"
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor={cardBorder}
                                    flex="1"
                                  >
                                    <Text color={mutedTextColor} fontSize="sm" fontStyle="italic">
                                      No owner assigned
                                    </Text>
                                  </Box>
                                ) : ownerDetails ? (
                                  <Box
                                    p={2}
                                    bg="whiteAlpha.50"
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor={cardBorder}
                                    _hover={{ bg: "whiteAlpha.100" }}
                                    flex="1"
                                  >
                                    <VStack align="start" spacing={1}>
                                      {/* Name */}
                                      <HStack spacing={2}>
                                        <FiUser size={12} color={mutedTextColor} />
                                        <Text color={textColor} fontSize="sm" fontWeight="medium">
                                          {ownerDetails.fName} {ownerDetails.lName}
                                        </Text>
                                        <Badge colorScheme="green" size="sm">Owner</Badge>
                                      </HStack>

                                      {/* Email */}
                                      {ownerDetails.email && (
                                        <HStack spacing={2}>
                                          <FiMail size={12} color={mutedTextColor} />
                                          <Text color={mutedTextColor} fontSize="xs" noOfLines={1}>
                                            {ownerDetails.email}
                                          </Text>
                                        </HStack>
                                      )}

                                      {/* Client ID with copy */}
                                      <HStack spacing={1}>
                                        <Text color="gray.500" fontSize="xs">
                                          ID: {calendar.responsibleOwnerId}
                                        </Text>
                                        <Tooltip label="Copy Client ID">
                                          <IconButton
                                            aria-label="Copy ID"
                                            icon={<FiCopy />}
                                            size="xs"
                                            variant="ghost"
                                            color={mutedTextColor}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopyToClipboard(calendar.responsibleOwnerId, 'Client ID');
                                            }}
                                            _hover={{ color: textColor }}
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                ) : (
                                  <HStack spacing={1} flex="1">
                                    <Text color={textColor} fontSize="sm" noOfLines={1}>
                                      {calendar.responsibleOwnerId}
                                    </Text>
                                    <Tooltip label="Copy ID">
                                      <IconButton
                                        aria-label="Copy ID"
                                        icon={<FiCopy />}
                                        size="xs"
                                        variant="ghost"
                                        color={mutedTextColor}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyToClipboard(calendar.responsibleOwnerId, 'Owner ID');
                                        }}
                                        _hover={{ color: textColor }}
                                      />
                                    </Tooltip>
                                  </HStack>
                                )}
                                <Tooltip label="Transfer Ownership">
                                  <IconButton
                                    aria-label="Transfer ownership"
                                    icon={<FiUserCheck />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="orange"
                                    onClick={() => openTransferModal(calendar)}
                                  />
                                </Tooltip>
                              </HStack>
                            );
                          })()}
                        </Td>
                        <Td>
                          {calendar.sharedFromEmail ? (
                            <Text color={textColor} fontSize="sm" noOfLines={1}>
                              {calendar.sharedFromEmail}
                            </Text>
                          ) : (
                            <Text color={mutedTextColor} fontSize="sm">
                              -
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text color={textColor} fontSize="sm">
                              {calendar.totalEvents || 0} total
                            </Text>
                            <Text color={mutedTextColor} fontSize="xs">
                              {calendar.upcomingEvents || 0} upcoming
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text color={mutedTextColor} fontSize="xs">
                            {format(new Date(calendar.createdAt), 'MMM dd, yyyy')}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Calendar">
                              <IconButton
                                aria-label="View calendar"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                color={textColor}
                                onClick={() => window.open(`/calendars/${calendar.id}/view`, '_blank')}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Calendar">
                              <IconButton
                                aria-label="Edit calendar"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                color={textColor}
                                onClick={() => openEditModal(calendar)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Calendar">
                              <IconButton
                                aria-label="Delete calendar"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                color="red.400"
                                onClick={() => handleDeleteCalendar(calendar.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {filteredCalendars.length === 0 && (
                  <Box py={8} textAlign="center">
                    <Text color={mutedTextColor}>No calendars found</Text>
                  </Box>
                )}
              </Box>
            </CardBody>
          </Card>
          {/* Card-based Calendar View */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
              📋 Calendar Cards View
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredCalendars.map((calendar: any) => {
                const ownerDetails = calendar.responsibleOwnerId ? getOwnerDetails(calendar.responsibleOwnerId) : null;
                const bookingUrl = calendar.bookingPageSlug
                  ? `${window.location.origin}/book/${calendar.bookingPageSlug}`
                  : null;

                return (
                  <Card
                    key={calendar.id}
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px solid"
                    borderColor={cardBorder}
                    transition="all 0.3s ease"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
                      borderColor: 'blue.400'
                    }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Header with color indicator and checkbox */}
                        <HStack justify="space-between" align="start">
                          <HStack spacing={3} flex={1}>
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              bg={calendar.color || '#4A90E2'}
                              flexShrink={0}
                            />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
                                {calendar.name}
                              </Text>
                              {calendar.description && (
                                <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                                  {calendar.description}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          <Checkbox
                            isChecked={selectedCalendarIds.has(calendar.id)}
                            onChange={() => toggleCalendarSelection(calendar.id)}
                            colorScheme="purple"
                          />
                        </HStack>

                        {/* Badges */}
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={getCalendarTypeColor(calendar.type)}>
                            {calendar.type}
                          </Badge>
                          <Badge colorScheme={getVisibilityBadgeColor(calendar.visibility)}>
                            {calendar.visibility}
                          </Badge>
                          {calendar.totalEvents > 0 && (
                            <Badge colorScheme="green">
                              {calendar.totalEvents} events
                            </Badge>
                          )}
                        </HStack>

                        {/* Owner Info */}
                        {ownerDetails && (
                          <Box
                            p={2}
                            bg="whiteAlpha.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor={cardBorder}
                          >
                            <HStack spacing={2}>
                              <FiUser size={14} color={mutedTextColor} />
                              <Text fontSize="sm" color={textColor} fontWeight="medium">
                                {ownerDetails.fName} {ownerDetails.lName}
                              </Text>
                            </HStack>
                            {ownerDetails.email && (
                              <HStack spacing={2} mt={1}>
                                <FiMail size={12} color={mutedTextColor} />
                                <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                  {ownerDetails.email}
                                </Text>
                              </HStack>
                            )}
                          </Box>
                        )}

                        <Divider borderColor={cardBorder} />

                        {/* Client-Style Action Buttons */}
                        <VStack spacing={2} align="stretch">
                          {/* Row 1: Edit & Event Types */}
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiEdit />}
                              colorScheme="blue"
                              variant="outline"
                              flex={1}
                              onClick={() => navigate(`/calendars/${calendar.id}/edit`)}
                            >
                              Edit
                            </Button>
                            {calendar.allowPublicBooking && (
                              <Button
                                size="sm"
                                leftIcon={<FiCalendar />}
                                colorScheme="purple"
                                variant="outline"
                                flex={1}
                                onClick={() => navigate(`/calendars/${calendar.id}/event-types`)}
                              >
                                Event Types
                              </Button>
                            )}
                          </HStack>

                          {/* Row 2: Availability & Copy URL */}
                          <HStack spacing={2}>
                            {calendar.allowPublicBooking && (
                              <Button
                                size="sm"
                                leftIcon={<FiClock />}
                                colorScheme="green"
                                variant="outline"
                                flex={1}
                                onClick={() => navigate(`/calendars/${calendar.id}/availability`)}
                              >
                                Availability
                              </Button>
                            )}
                            {bookingUrl && (
                              <Tooltip label="Copy booking URL">
                                <Button
                                  size="sm"
                                  leftIcon={<FiCopy />}
                                  colorScheme="teal"
                                  variant="outline"
                                  flex={1}
                                  onClick={() => handleCopyToClipboard(bookingUrl, 'Booking URL')}
                                >
                                  Copy URL
                                </Button>
                              </Tooltip>
                            )}
                          </HStack>

                          <Divider borderColor={cardBorder} />

                          {/* Row 3: Admin-Specific Actions */}
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiUsers />}
                              colorScheme="cyan"
                              variant="outline"
                              flex={1}
                              onClick={() => openSharesModal(calendar)}
                            >
                              Share
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<FiMail />}
                              colorScheme="orange"
                              variant="outline"
                              flex={1}
                              onClick={() => openEmailsModal(calendar)}
                            >
                              Emails
                            </Button>
                          </HStack>

                          {/* Row 4: Transfer & Delete */}
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiUserCheck />}
                              colorScheme="yellow"
                              variant="outline"
                              flex={1}
                              onClick={() => openTransferModal(calendar)}
                            >
                              Transfer
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<FiTrash2 />}
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => handleDeleteCalendar(calendar.id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>

            {filteredCalendars.length === 0 && (
              <Box py={8} textAlign="center">
                <Text color={mutedTextColor}>No calendars found</Text>
              </Box>
            )}
          </Box>


          {/* Create Calendar Modal */}
          <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={{ base: "full", md: "lg" }}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              margin={{ base: 0, md: "auto" }}
              borderRadius={{ base: 0, md: "md" }}
            >
              <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
                Create New Calendar
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Name *
                    </Text>
                    <Input
                      placeholder="e.g., Team Meetings, Project X Calendar"
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: "gray.500" }}
                    />
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Description (Optional)
                    </Text>
                    <Textarea
                      placeholder="Calendar description..."
                      value={newCalendarDescription}
                      onChange={(e) => setNewCalendarDescription(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: "gray.500" }}
                      rows={3}
                    />
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Type
                    </Text>
                    <Select
                      value={newCalendarType}
                      onChange={(e) => setNewCalendarType(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      {calendarTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Visibility
                    </Text>
                    <Select
                      value={newCalendarVisibility}
                      onChange={(e) => setNewCalendarVisibility(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      {calendarVisibilities.map((visibility) => (
                        <option key={visibility.name} value={visibility.name}>
                          {visibility.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Color
                    </Text>
                    <HStack spacing={2}>
                      <Input
                        type="color"
                        value={newCalendarColor}
                        onChange={(e) => setNewCalendarColor(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        w={16}
                        h={10}
                      />
                      <Input
                        value={newCalendarColor}
                        onChange={(e) => setNewCalendarColor(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                        flex={1}
                      />
                    </HStack>
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Timezone
                    </Text>
                    <Select
                      value={newCalendarTimezone}
                      onChange={(e) => setNewCalendarTimezone(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      <option value="Australia/Sydney">Australia/Sydney</option>
                      <option value="Australia/Melbourne">Australia/Melbourne</option>
                      <option value="Australia/Brisbane">Australia/Brisbane</option>
                      <option value="Australia/Perth">Australia/Perth</option>
                      <option value="Australia/Adelaide">Australia/Adelaide</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </Box>

                  <Box bg="blue.900" p={3} borderRadius="md" border="1px solid" borderColor="blue.700">
                    <Text color="blue.200" fontSize="sm">
                      ℹ️ This will create a new calendar that can be shared with clients and used for scheduling events.
                    </Text>
                  </Box>

                  <HStack spacing={3} justify="flex-end" pt={2}>
                    <Button variant="ghost" onClick={onCreateClose} color={textColor}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleCreateCalendar}
                      isDisabled={!newCalendarName.trim()}
                    >
                      Create Calendar
                    </Button>
                  </HStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Edit Calendar Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size={{ base: "full", md: "lg" }}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              margin={{ base: 0, md: "auto" }}
              borderRadius={{ base: 0, md: "md" }}
            >
              <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
                Edit Calendar
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Name *
                    </Text>
                    <Input
                      value={editCalendarName}
                      onChange={(e) => setEditCalendarName(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: "gray.500" }}
                    />
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Description
                    </Text>
                    <Textarea
                      value={editCalendarDescription}
                      onChange={(e) => setEditCalendarDescription(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: "gray.500" }}
                      rows={3}
                    />
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Type
                    </Text>
                    <Select
                      value={editCalendarType}
                      onChange={(e) => setEditCalendarType(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      {calendarTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Visibility
                    </Text>
                    <Select
                      value={editCalendarVisibility}
                      onChange={(e) => setEditCalendarVisibility(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      {calendarVisibilities.map((visibility) => (
                        <option key={visibility.name} value={visibility.name}>
                          {visibility.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Calendar Color
                    </Text>
                    <HStack spacing={2}>
                      <Input
                        type="color"
                        value={editCalendarColor}
                        onChange={(e) => setEditCalendarColor(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        w={16}
                        h={10}
                      />
                      <Input
                        value={editCalendarColor}
                        onChange={(e) => setEditCalendarColor(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                        flex={1}
                      />
                    </HStack>
                  </Box>

                  <HStack spacing={3} justify="flex-end" pt={2}>
                    <Button variant="ghost" onClick={onEditClose} color={textColor}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleUpdateCalendar}
                      isDisabled={!editCalendarName.trim()}
                    >
                      Update Calendar
                    </Button>
                  </HStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Email Management Modal */}
          <Modal isOpen={isEmailsOpen} onClose={onEmailsClose} size={{ base: "full", md: "lg" }}>
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
                Manage Accepted Email Addresses
                {selectedCalendar && (
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    {selectedCalendar.name}
                  </Text>
                )}
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  {/* Current Accepted Emails */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Currently Accepted Email Addresses
                    </Text>
                    {selectedCalendar?.acceptedEmailAddresses && selectedCalendar.acceptedEmailAddresses.length > 0 ? (
                      <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                        {selectedCalendar.acceptedEmailAddresses.map((email: string) => (
                          <HStack
                            key={email}
                            p={2}
                            bg="whiteAlpha.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor={cardBorder}
                            justify="space-between"
                          >
                            <Text color={textColor} fontSize="sm">{email}</Text>
                            <IconButton
                              aria-label="Remove email"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              color="red.400"
                              onClick={() => handleRemoveEmail(email)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text color={mutedTextColor} fontSize="sm" p={3} textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        No email addresses added yet
                      </Text>
                    )}
                  </Box>

                  {/* Add New Email */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Add Email Address (Only Verified & Receiving Emails)
                    </Text>
                    <HStack spacing={2}>
                      <Select
                        placeholder="Select an email address..."
                        value={selectedEmailToAdd}
                        onChange={(e) => setSelectedEmailToAdd(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                        flex="1"
                      >
                        {emailAddressesData?.emailAddresses
                          ?.filter((emailAddr: any) =>
                            // Only show verified emails registered with ImprovMX
                            emailAddr.isVerified &&
                            emailAddr.isRegisteredWithImprovMX &&
                            // Don't show emails already added
                            !selectedCalendar?.acceptedEmailAddresses?.includes(emailAddr.email)
                          )
                          .map((emailAddr: any) => (
                            <option key={emailAddr.id} value={emailAddr.email}>
                              {emailAddr.email} {emailAddr.name ? `(${emailAddr.name})` : ''}
                            </option>
                          ))}
                      </Select>
                      <Button
                        colorScheme="blue"
                        onClick={handleAddEmail}
                        isDisabled={!selectedEmailToAdd}
                      >
                        Add
                      </Button>
                    </HStack>
                    <Text color="gray.500" fontSize="xs" mt={2}>
                      Only email addresses that are verified and registered with ImprovMX are shown
                    </Text>
                  </Box>

                  {/* Info Box */}
                  <Box bg="blue.900" p={3} borderRadius="md" border="1px solid" borderColor="blue.700">
                    <Text color="blue.200" fontSize="sm">
                      ℹ️ These email addresses can accept calendar invites on behalf of this calendar.
                      Only emails registered with ImprovMX are available for selection.
                    </Text>
                  </Box>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Client Shares Management Modal */}
          <Modal isOpen={isSharesOpen} onClose={onSharesClose} size={{ base: "full", md: "xl" }}>
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
                Manage Calendar Sharing
                {selectedCalendar && (
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    {selectedCalendar.name}
                  </Text>
                )}
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  {/* Current Client Shares */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Currently Shared With Clients
                    </Text>
                    {selectedCalendar?.clientShares && selectedCalendar.clientShares.filter((share: any) => share.isActive).length > 0 ? (
                      <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                        {selectedCalendar.clientShares
                          .filter((share: any) => share.isActive)
                          .map((share: any) => {
                            const client = clientsData?.clients?.find((c: any) => c.id === share.clientId);
                            return (
                              <Box
                                key={share.clientId}
                                p={3}
                                bg="whiteAlpha.50"
                                borderRadius="md"
                                border="1px solid"
                                borderColor={cardBorder}
                              >
                                <HStack justify="space-between" mb={2}>
                                  <VStack align="start" spacing={1}>
                                    <Text color={textColor} fontSize="sm" fontWeight="medium">
                                      {client ? `${client.fName} ${client.lName}` : share.clientName || share.clientId}
                                    </Text>
                                    {client?.email && (
                                      <Text color={mutedTextColor} fontSize="xs">
                                        {client.email}
                                      </Text>
                                    )}
                                  </VStack>
                                  <IconButton
                                    aria-label="Remove share"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    color="red.400"
                                    onClick={() => handleRemoveClientShare(share.clientId)}
                                  />
                                </HStack>
                                <VStack align="start" spacing={1}>
                                  <Text color="gray.400" fontSize="xs">Permissions:</Text>
                                  <HStack wrap="wrap" spacing={1}>
                                    {share.permissions.map((perm: string) => (
                                      <Badge key={perm} colorScheme="purple" size="sm">
                                        {perm.replace(/_/g, ' ')}
                                      </Badge>
                                    ))}
                                  </HStack>
                                  {share.notes && (
                                    <Text color={mutedTextColor} fontSize="xs" mt={1}>
                                      Note: {share.notes}
                                    </Text>
                                  )}
                                  {share.sharedAt && (
                                    <Text color="gray.500" fontSize="xs">
                                      Shared: {format(new Date(share.sharedAt), 'MMM dd, yyyy')}
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            );
                          })}
                      </VStack>
                    ) : (
                      <Text color={mutedTextColor} fontSize="sm" p={3} textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        Not shared with any clients yet
                      </Text>
                    )}
                  </Box>

                  <Divider borderColor={cardBorder} />

                  {/* Add New Client Share */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Share With Client
                    </Text>
                    <Select
                      placeholder="Select a client..."
                      value={selectedClientToShare}
                      onChange={(e) => setSelectedClientToShare(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      mb={3}
                    >
                      {clientsData?.clients
                        ?.filter((client: any) => {
                          // Don't show the owner
                          if (client.id === selectedCalendar?.responsibleOwnerId) return false;
                          // Don't show already shared clients
                          const existingShare = selectedCalendar?.clientShares?.find(
                            (share: any) => share.clientId === client.id && share.isActive
                          );
                          return !existingShare;
                        })
                        .map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.fName} {client.lName} ({client.email})
                          </option>
                        ))}
                    </Select>

                    {/* Permissions Selection */}
                    <Box mb={3}>
                      <Text color="gray.300" fontSize="sm" mb={2}>
                        Select Permissions
                      </Text>
                      <VStack align="start" spacing={2} pl={2}>
                        <Checkbox
                          isChecked={selectedPermissions.includes('VIEW_EVENTS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'VIEW_EVENTS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'VIEW_EVENTS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">View Events</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('CREATE_EVENTS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'CREATE_EVENTS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'CREATE_EVENTS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Create Events</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('EDIT_EVENTS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'EDIT_EVENTS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'EDIT_EVENTS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Edit Events</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('DELETE_EVENTS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'DELETE_EVENTS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'DELETE_EVENTS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Delete Events</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('MANAGE_SETTINGS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'MANAGE_SETTINGS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'MANAGE_SETTINGS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Manage Settings</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('MANAGE_EMAILS')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'MANAGE_EMAILS']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'MANAGE_EMAILS'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Manage Email Addresses</Text>
                        </Checkbox>
                        <Checkbox
                          isChecked={selectedPermissions.includes('SHARE_CALENDAR')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, 'SHARE_CALENDAR']);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== 'SHARE_CALENDAR'));
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm">Share Calendar</Text>
                        </Checkbox>
                        <Divider my={2} borderColor={cardBorder} />
                        <Checkbox
                          isChecked={selectedPermissions.includes('FULL_ADMIN')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(['FULL_ADMIN']);
                            } else {
                              setSelectedPermissions([]);
                            }
                          }}
                          color={textColor}
                        >
                          <Text fontSize="sm" fontWeight="bold">Full Admin (All Permissions)</Text>
                        </Checkbox>
                      </VStack>
                    </Box>

                    {/* Notes */}
                    <Box mb={3}>
                      <Text color="gray.300" fontSize="sm" mb={2}>
                        Notes (Optional)
                      </Text>
                      <Textarea
                        placeholder="Add notes about this share..."
                        value={shareNotes}
                        onChange={(e) => setShareNotes(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                        _placeholder={{ color: "gray.500" }}
                        rows={2}
                      />
                    </Box>

                    <Button
                      colorScheme="purple"
                      onClick={handleAddClientShare}
                      isDisabled={!selectedClientToShare || selectedPermissions.length === 0}
                      width="full"
                    >
                      Share Calendar
                    </Button>
                  </Box>

                  {/* Info Box */}
                  <Box bg="purple.900" p={3} borderRadius="md" border="1px solid" borderColor="purple.700">
                    <Text color="purple.200" fontSize="sm">
                      👥 Share this calendar with other clients to collaborate. Each client can have different permission levels.
                    </Text>
                  </Box>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Transfer Ownership Modal */}
          <Modal isOpen={isTransferOpen} onClose={onTransferClose} size={{ base: "full", md: "lg" }}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              margin={{ base: 0, md: "auto" }}
              borderRadius={{ base: 0, md: "md" }}
            >
              <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
                Transfer Calendar Ownership
                {selectedCalendar && (
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    {selectedCalendar.name}
                  </Text>
                )}
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  {/* Current Owner */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Current Owner
                    </Text>
                    {(() => {
                      const currentOwner = selectedCalendar?.responsibleOwnerId && clientsData?.clients?.find(
                        (c: any) => c.id === selectedCalendar.responsibleOwnerId
                      );
                      return selectedCalendar && !selectedCalendar.responsibleOwnerId ? (
                        <Box p={3} bg="whiteAlpha.50" borderRadius="md" border="1px solid" borderColor={cardBorder}>
                          <Text color={mutedTextColor} fontSize="sm" fontStyle="italic">
                            No owner currently assigned
                          </Text>
                        </Box>
                      ) : currentOwner ? (
                        <Box p={3} bg="whiteAlpha.50" borderRadius="md" border="1px solid" borderColor={cardBorder}>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <FiUser size={14} color={textColor} />
                              <Text color={textColor} fontSize="sm" fontWeight="medium">
                                {currentOwner.fName} {currentOwner.lName}
                              </Text>
                            </HStack>
                            {currentOwner.email && (
                              <Text color={mutedTextColor} fontSize="xs">
                                {currentOwner.email}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ) : (
                        <Text color={mutedTextColor} fontSize="sm">
                          ID: {selectedCalendar?.responsibleOwnerId}
                        </Text>
                      );
                    })()}
                  </Box>

                  {/* New Owner Selection */}
                  <Box>
                    <Text color="gray.300" fontSize="sm" mb={2}>
                      Select New Owner
                    </Text>
                    <Select
                      placeholder="Select a client or no owner..."
                      value={newOwnerId}
                      onChange={(e) => setNewOwnerId(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                    >
                      <option value="">No Owner (Unassigned)</option>
                      {clientsData?.clients
                        ?.filter((client: any) =>
                          // Don't show current owner
                          client.id !== selectedCalendar?.responsibleOwnerId
                        )
                        .map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.fName} {client.lName} ({client.email})
                          </option>
                        ))}
                    </Select>
                  </Box>

                  {/* Warning Message */}
                  <Box bg="orange.900" p={3} borderRadius="md" border="1px solid" borderColor="orange.700">
                    <VStack align="start" spacing={2}>
                      <Text color="orange.200" fontSize="sm" fontWeight="medium">
                        ⚠️ Important Information
                      </Text>
                      <Text color="orange.200" fontSize="xs">
                        • The new owner will have full control over this calendar
                      </Text>
                      <Text color="orange.200" fontSize="xs">
                        • The current owner will retain full admin access as a shared user
                      </Text>
                      <Text color="orange.200" fontSize="xs">
                        • The new owner can remove anyone's access, including the previous owner
                      </Text>
                    </VStack>
                  </Box>

                  {/* Actions */}
                  <HStack spacing={3} justify="flex-end" pt={2}>
                    <Button variant="ghost" onClick={onTransferClose} color={textColor}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="orange"
                      onClick={handleTransferOwnership}
                    >
                      Transfer Ownership
                    </Button>
                  </HStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* External Calendar Modal */}
          <ExternalCalendarModal
            isOpen={isExternalOpen}
            onClose={onExternalClose}
            onSuccess={() => {
              refetchCalendars();
              refetchExternalCalendars();
              onExternalClose();
            }}
          />
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default CalendarAccountsAdmin;