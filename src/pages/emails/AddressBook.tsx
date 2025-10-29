import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  Select,
  Button,
  Badge,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Spinner,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Wrap,
  WrapItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Container,
  Card,
  CardHeader,
  CardBody,
  Tooltip,
} from '@chakra-ui/react';
import { FiUsers, FiEdit, FiTrash, FiMail, FiPlus, FiDownload, FiUpload, FiSend } from 'react-icons/fi';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import emailsModuleConfig from './moduleConfig';
import { EmailAddress } from "../../generated/graphql";

// GraphQL queries
const EMAIL_ADDRESSES_QUERY = gql`
  query EmailAddresses($search: String, $type: String, $isVerified: Boolean, $isBlocked: Boolean, $limit: Float!, $offset: Float!) {
    emailAddresses(
      search: $search
      type: $type
      isVerified: $isVerified
      isBlocked: $isBlocked
      limit: $limit
      offset: $offset
    ) {
      id
      email
      name
      company
      type
      isVerified
      isBlocked
      notes
      emailsSent
      emailsReceived
      firstSeenAt
      lastSeenAt
      tags
      domain
      canReceiveMarketing
      canReceiveTransactional
      acceptedSenderEmailsForCalendarInvites
      acceptCalendarInvitesFromAnyone
      blockedDomainsForCalendarInvites
      primaryCalendarId
      linkedCalendarIds
    }
  }
`;

const EMAIL_ADDRESS_STATS_QUERY = gql`
  query EmailAddressStats {
    emailAddressStats {
      totalAddresses
      verifiedAddresses
      blockedAddresses
      personalEmails
      businessEmails
      totalEmailsSent
      totalEmailsReceived
    }
  }
`;

const CREATE_EMAIL_ADDRESS_MUTATION = gql`
  mutation CreateEmailAddress($input: EmailAddressInput!) {
    createEmailAddress(input: $input) {
      id
      email
      name
      company
      type
    }
  }
`;

const UPDATE_EMAIL_ADDRESS_MUTATION = gql`
  mutation UpdateEmailAddress($id: String!, $input: EmailAddressUpdateInput!) {
    updateEmailAddress(id: $id, input: $input) {
      id
      email
      name
      company
      type
      isVerified
      isBlocked
      notes
      tags
      canReceiveMarketing
      canReceiveTransactional
    }
  }
`;

const DELETE_EMAIL_ADDRESS_MUTATION = gql`
  mutation DeleteEmailAddress($id: String!) {
    deleteEmailAddress(id: $id)
  }
`;


export const AddressBook: React.FC = () => {
    usePageTitle("Address Book");
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [directionFilter, setDirectionFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [editingAddress, setEditingAddress] = useState<EmailAddress | null>(null);
  const [newAddress, setNewAddress] = useState({
    email: '',
    name: '',
    company: '',
    type: 'UNKNOWN',
    notes: '',
    tags: [] as string[],
    canReceiveMarketing: true,
    canReceiveTransactional: true,
  });
  const [newTag, setNewTag] = useState('');
  
  // Queries - Show ALL emails, don't filter at query level
  const { data, loading, refetch, error } = useQuery(EMAIL_ADDRESSES_QUERY, {
    variables: {
      limit: 500, // Get all addresses
      offset: 0,
    },
    fetchPolicy: 'network-only', // Always fetch fresh data
  });
  
  // Log any errors for debugging
  if (error) {
    console.error('Error fetching email addresses:', error);
  }
  
  const { data: statsData } = useQuery(EMAIL_ADDRESS_STATS_QUERY);
  
  // Mutations
  const [createAddress] = useMutation(CREATE_EMAIL_ADDRESS_MUTATION, {
    onCompleted: () => {
      toast({
        title: 'Contact added successfully',
        status: 'success',
        duration: 3000,
      });
      refetch();
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add contact',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
  
  const [updateAddress] = useMutation(UPDATE_EMAIL_ADDRESS_MUTATION, {
    onCompleted: () => {
      toast({
        title: 'Contact updated successfully',
        status: 'success',
        duration: 3000,
      });
      refetch();
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update contact',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
  
  const [deleteAddress] = useMutation(DELETE_EMAIL_ADDRESS_MUTATION, {
    onCompleted: () => {
      toast({
        title: 'Contact deleted',
        status: 'success',
        duration: 2000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete contact',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
  
  // Handlers
  const resetForm = () => {
    setNewAddress({
      email: '',
      name: '',
      company: '',
      type: 'UNKNOWN',
      notes: '',
      tags: [],
      canReceiveMarketing: true,
      canReceiveTransactional: true,
    });
    setEditingAddress(null);
    setNewTag('');
  };
  
  const handleOpenModal = (address?: EmailAddress) => {
    if (address) {
      setEditingAddress(address);
      setNewAddress({
        email: address.email,
        name: address.name || '',
        company: address.company || '',
        type: address.type,
        notes: address.notes || '',
        tags: address.tags || [],
        canReceiveMarketing: address.canReceiveMarketing,
        canReceiveTransactional: address.canReceiveTransactional,
      });
    } else {
      resetForm();
    }
    onOpen();
  };
  
  const handleSave = () => {
    if (editingAddress) {
      updateAddress({
        variables: {
          id: editingAddress.id,
          input: {
            name: newAddress.name || undefined,
            company: newAddress.company || undefined,
            type: newAddress.type,
            notes: newAddress.notes || undefined,
            tags: newAddress.tags,
            canReceiveMarketing: newAddress.canReceiveMarketing,
            canReceiveTransactional: newAddress.canReceiveTransactional,
          },
        },
      });
    } else {
      createAddress({
        variables: {
          input: newAddress,
        },
      });
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteAddress({ variables: { id } });
    }
  };
  
  const handleSendEmail = (email: string, name?: string) => {
    // Navigate to compose email page with pre-filled recipient
    const params = new URLSearchParams({
      to: email,
      recipientName: name || ''
    });
    navigate(`/emails/new?${params.toString()}`);
  };
  
  const handleAddTag = () => {
    if (newTag && !newAddress.tags.includes(newTag)) {
      setNewAddress({
        ...newAddress,
        tags: [...newAddress.tags, newTag],
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setNewAddress({
      ...newAddress,
      tags: newAddress.tags.filter(t => t !== tag),
    });
  };
  
  const exportContacts = () => {
    const csvContent = [
      ['Email', 'Name', 'Company', 'Type', 'Verified', 'Tags', 'Notes'].join(','),
      ...(data?.emailAddresses || []).map((addr: EmailAddress) =>
        [
          addr.email,
          addr.name || '',
          addr.company || '',
          addr.type,
          addr.isVerified ? 'Yes' : 'No',
          (addr.tags || []).join(';'),
          addr.notes || '',
        ].map(field => `"${field}"`).join(',')
      ),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `address-book-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  const stats = statsData?.emailAddressStats;
  const allAddresses = data?.emailAddresses || [];
  
  // Debug logging
  console.log('Address Book Data:', {
    totalFromQuery: allAddresses.length,
    statsTotal: stats?.totalAddresses,
    loading,
    error
  });
  
  // Apply client-side filters
  const addresses = allAddresses.filter((address: EmailAddress) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        address.email.toLowerCase().includes(search) ||
        address.name?.toLowerCase().includes(search) ||
        address.company?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Type filter
    if (typeFilter && typeFilter !== '') {
      if (address.type !== typeFilter) return false;
    }
    
    // Verification filter
    if (verifiedFilter !== undefined) {
      if (address.isVerified !== verifiedFilter) return false;
    }
    
    // Direction filter
    if (directionFilter === 'incoming') {
      // Show addresses that have sent us emails (emailsReceived > 0)
      return address.emailsReceived > 0;
    } else if (directionFilter === 'outgoing') {
      // Show addresses that we've sent emails to (emailsSent > 0)
      return address.emailsSent > 0;
    }
    
    // 'all' - show everything
    return true;
  });
  
  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={emailsModuleConfig} />
      <Container maxW={{ base: "100%", md: "container.md", lg: "container.xl" }} px={{ base: 3, md: 8 }} py={{ base: 4, md: 12 }} flex="1">
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
        >
          <CardHeader borderBottom="1px" borderColor={cardBorder} p={{ base: 3, md: 6 }}>
            <VStack align="stretch" spacing={{ base: 3, md: 0 }}>
              <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>📚 Address Book</Heading>
              <HStack spacing={{ base: 2, md: 3 }} flexWrap={{ base: "wrap", md: "nowrap" }} justify={{ base: "stretch", md: "flex-end" }}>
                <Button 
                  leftIcon={<FiPlus />} 
                  bg="white"
                  color="black"
                  _hover={{ 
                    bg: "gray.100",
                    transform: "translateY(-2px)"
                  }}
                  onClick={() => handleOpenModal()}
                  boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", sm: "auto" }}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Add Contact
                </Button>
                <Button 
                  leftIcon={<FiDownload />} 
                  bg="rgba(59, 130, 246, 0.2)"
                  color="#3B82F6"
                  border="1px solid"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                  onClick={exportContacts}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "100%", sm: "auto" }}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Export CSV
                </Button>
              </HStack>
            </VStack>
          </CardHeader>

          <CardBody p={{ base: 3, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        
              {/* Stats */}
              {stats && (
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing={{ base: 2, md: 4 }}>
                  <Box
                    p={{ base: 2, md: 4 }}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Total Contacts</StatLabel>
                      <StatNumber color={textPrimary} fontSize={{ base: "md", md: "2xl" }}>{stats.totalAddresses}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Verified</StatLabel>
                      <StatNumber color="#22C55E" fontSize={{ base: "md", md: "2xl" }}>{stats.verifiedAddresses}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Blocked</StatLabel>
                      <StatNumber color="#EF4444" fontSize={{ base: "md", md: "2xl" }}>{stats.blockedAddresses}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Personal</StatLabel>
                      <StatNumber color="#3B82F6" fontSize={{ base: "md", md: "2xl" }}>{stats.personalEmails}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Business</StatLabel>
                      <StatNumber color="#A855F7" fontSize={{ base: "md", md: "2xl" }}>{stats.businessEmails}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Emails Sent</StatLabel>
                      <StatNumber color="#FB923C" fontSize={{ base: "md", md: "2xl" }}>{stats.totalEmailsSent}</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <Stat>
                      <StatLabel color={textSecondary} fontSize={{ base: "xs", md: "sm" }}>Emails Received</StatLabel>
                      <StatNumber color="#14B8A6" fontSize={{ base: "md", md: "2xl" }}>{stats.totalEmailsReceived}</StatNumber>
                    </Stat>
                  </Box>
                </SimpleGrid>
              )}
        
              {/* Filters */}
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  width="100%"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                  _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                />
                
                <HStack spacing={{ base: 2, md: 4 }} width="100%">
                <Select
                  placeholder="All directions"
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value as 'all' | 'incoming' | 'outgoing')}
                  flex={1}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                  _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                >
                  <option value="all">All Emails</option>
                  <option value="incoming">Incoming (People who sent to us)</option>
                  <option value="outgoing">Outgoing (People we sent to)</option>
                </Select>
                
                <Select
                  placeholder="All types"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  flex={1}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                >
            <option value="">All Types</option>
            <option value="PERSONAL">Personal</option>
            <option value="BUSINESS">Business</option>
            <option value="SUPPORT">Support</option>
            <option value="NOREPLY">No Reply</option>
            <option value="MARKETING">Marketing</option>
            <option value="UNKNOWN">Unknown</option>
                </Select>
                
                <Select
                  placeholder="Verification status"
                  value={verifiedFilter === undefined ? '' : verifiedFilter.toString()}
                  onChange={(e) => setVerifiedFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                  flex={1}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                >
            <option value="">All Status</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
                </Select>
                </HStack>
              </VStack>
        
              {/* Contact List */}
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="xl" color="#3B82F6" />
                  <Text mt={2} color={textSecondary}>Loading contacts...</Text>
                </Box>
              ) : (
                <Box overflowX="auto" width="100%">
                  <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth={{ base: "800px", md: "100%" }}>
                    <Thead>
                      <Tr>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>Email</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Name</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Company</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>Type</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Status</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Emails</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Tags</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Calendar Rules</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Last Seen</Th>
                        <Th color={textSecondary} borderColor={cardBorder} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {addresses.map((address: EmailAddress) => (
                  <Tr key={address.id} _hover={{ bg: 'rgba(255, 255, 255, 0.02)' }}>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                      <Text fontWeight="medium" color={textPrimary} fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>{address.email}</Text>
                      {address.domain && (
                        <Text fontSize="sm" color={textSecondary}>
                          @{address.domain}
                        </Text>
                      )}
                    </Td>
                    <Td borderColor={cardBorder} color={textPrimary} display={{ base: "none", md: "table-cell" }} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>{address.name || '-'}</Td>
                    <Td borderColor={cardBorder} color={textPrimary} display={{ base: "none", lg: "table-cell" }} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>{address.company || '-'}</Td>
                    <Td borderColor={cardBorder}>
                      <Badge
                        bg={
                          address.type === 'PERSONAL' ? 'rgba(59, 130, 246, 0.2)' :
                          address.type === 'BUSINESS' ? 'rgba(34, 197, 94, 0.2)' :
                          address.type === 'SUPPORT' ? 'rgba(168, 85, 247, 0.2)' :
                          address.type === 'NOREPLY' ? 'rgba(156, 163, 175, 0.2)' :
                          address.type === 'MARKETING' ? 'rgba(251, 146, 60, 0.2)' :
                          'rgba(156, 163, 175, 0.2)'
                        }
                        color={
                          address.type === 'PERSONAL' ? '#3B82F6' :
                          address.type === 'BUSINESS' ? '#22C55E' :
                          address.type === 'SUPPORT' ? '#A855F7' :
                          address.type === 'NOREPLY' ? '#9CA3AF' :
                          address.type === 'MARKETING' ? '#FB923C' :
                          '#9CA3AF'
                        }
                        border="1px solid"
                        borderColor={
                          address.type === 'PERSONAL' ? 'rgba(59, 130, 246, 0.3)' :
                          address.type === 'BUSINESS' ? 'rgba(34, 197, 94, 0.3)' :
                          address.type === 'SUPPORT' ? 'rgba(168, 85, 247, 0.3)' :
                          address.type === 'NOREPLY' ? 'rgba(156, 163, 175, 0.3)' :
                          address.type === 'MARKETING' ? 'rgba(251, 146, 60, 0.3)' :
                          'rgba(156, 163, 175, 0.3)'
                        }
                      >
                        {address.type}
                      </Badge>
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                      <VStack align="start" spacing={1}>
                        {address.isVerified && (
                          <Badge 
                            bg="rgba(34, 197, 94, 0.2)"
                            color="#22C55E"
                            border="1px solid"
                            borderColor="rgba(34, 197, 94, 0.3)"
                          >Verified</Badge>
                        )}
                        {address.isBlocked && (
                          <Badge 
                            bg="rgba(239, 68, 68, 0.2)"
                            color="#EF4444"
                            border="1px solid"
                            borderColor="rgba(239, 68, 68, 0.3)"
                          >Blocked</Badge>
                        )}
                        {!address.canReceiveMarketing && (
                          <Badge 
                            bg="rgba(251, 146, 60, 0.2)"
                            color="#FB923C"
                            border="1px solid"
                            borderColor="rgba(251, 146, 60, 0.3)"
                          >No Marketing</Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", lg: "table-cell" }}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>↗ {address.emailsSent} sent</Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>↘ {address.emailsReceived} received</Text>
                      </VStack>
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", xl: "table-cell" }}>
                      <Wrap>
                        {address.tags?.slice(0, 3).map((tag) => (
                          <WrapItem key={tag}>
                            <Tag 
                              size="sm" 
                              bg="rgba(168, 85, 247, 0.2)"
                              color="#A855F7"
                              border="1px solid"
                              borderColor="rgba(168, 85, 247, 0.3)"
                            >
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                        {address.tags && address.tags.length > 3 && (
                          <WrapItem>
                            <Tag size="sm" colorScheme="gray">
                              <TagLabel>+{address.tags.length - 3}</TagLabel>
                            </Tag>
                          </WrapItem>
                        )}
                      </Wrap>
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", lg: "table-cell" }} fontSize={{ base: "xs", md: "sm" }}>
                      <VStack align="start" spacing={1}>
                        {address.acceptCalendarInvitesFromAnyone && (
                          <Badge colorScheme="green" size="sm">Accepts All</Badge>
                        )}
                        {address.acceptedSenderEmailsForCalendarInvites && address.acceptedSenderEmailsForCalendarInvites.length > 0 && (
                          <Tooltip label={`Accepts from: ${address.acceptedSenderEmailsForCalendarInvites.join(', ')}`}>
                            <Badge colorScheme="blue" size="sm">
                              {address.acceptedSenderEmailsForCalendarInvites.length} Allowed
                            </Badge>
                          </Tooltip>
                        )}
                        {address.blockedDomainsForCalendarInvites && address.blockedDomainsForCalendarInvites.length > 0 && (
                          <Tooltip label={`Blocks: ${address.blockedDomainsForCalendarInvites.join(', ')}`}>
                            <Badge colorScheme="red" size="sm">
                              {address.blockedDomainsForCalendarInvites.length} Blocked
                            </Badge>
                          </Tooltip>
                        )}
                        {!address.acceptCalendarInvitesFromAnyone &&
                         (!address.acceptedSenderEmailsForCalendarInvites || address.acceptedSenderEmailsForCalendarInvites.length === 0) &&
                         (!address.blockedDomainsForCalendarInvites || address.blockedDomainsForCalendarInvites.length === 0) && (
                          <Text fontSize="xs" color="gray.500">No rules</Text>
                        )}
                      </VStack>
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", lg: "table-cell" }} fontSize={{ base: "xs", md: "sm" }}>
                      {address.lastSeenAt
                        ? new Date(address.lastSeenAt).toLocaleDateString()
                        : '-'}
                    </Td>
                    <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                      <HStack spacing={1}>
                        <Tooltip label="Send Email">
                          <IconButton
                            aria-label="Send Email"
                            icon={<FiSend />}
                            size={{ base: "xs", md: "sm" }}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleSendEmail(address.email || '', address.name || '')}
                          />
                        </Tooltip>
                        <Tooltip label="Edit Contact">
                          <IconButton
                            aria-label="Edit"
                            icon={<FiEdit />}
                            size={{ base: "xs", md: "sm" }}
                            variant="ghost"
                            onClick={() => handleOpenModal(address)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete Contact">
                          <IconButton
                            aria-label="Delete"
                            icon={<FiTrash />}
                            size={{ base: "xs", md: "sm" }}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(address.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {addresses.length === 0 && (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={8} borderColor={cardBorder}>
                      <Text color={textMuted}>No contacts found</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
                </Box>
              )}
        
              {/* Add/Edit Contact Modal */}
              <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
                <ModalContent 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <ModalHeader color={textPrimary} borderBottom="1px" borderColor={cardBorder}>
                    {editingAddress ? 'Edit Contact' : 'Add New Contact'}
                  </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={newAddress.email}
                    onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                    isDisabled={!!editingAddress}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textPrimary}>Name</FormLabel>
                  <Input
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textPrimary}>Company</FormLabel>
                  <Input
                    value={newAddress.company}
                    onChange={(e) => setNewAddress({ ...newAddress, company: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textPrimary}>Type</FormLabel>
                  <Select
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="BUSINESS">Business</option>
                    <option value="SUPPORT">Support</option>
                    <option value="NOREPLY">No Reply</option>
                    <option value="MARKETING">Marketing</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textPrimary}>Tags</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <HStack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 3 }}>
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        flex="1"
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                        _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                      />
                      <Button 
                        onClick={handleAddTag}
                        bg="rgba(59, 130, 246, 0.2)"
                        color="#3B82F6"
                        border="1px solid"
                        borderColor="rgba(59, 130, 246, 0.3)"
                        width={{ base: "100%", md: "auto" }}
                        minW={{ md: "80px" }}
                        _hover={{ bg: "rgba(59, 130, 246, 0.3)" }}
                      >Add</Button>
                    </HStack>
                    <Wrap mt={2}>
                      {newAddress.tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag 
                            size="md" 
                            bg="rgba(168, 85, 247, 0.2)"
                            color="#A855F7"
                            border="1px solid"
                            borderColor="rgba(168, 85, 247, 0.3)"
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </VStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textPrimary}>Notes</FormLabel>
                  <Textarea
                    value={newAddress.notes}
                    onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                    rows={3}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    _focus={{ borderColor: "#3B82F6", boxShadow: "0 0 0 1px #3B82F6" }}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0" color={textPrimary}>Can receive marketing emails</FormLabel>
                  <Switch
                    isChecked={newAddress.canReceiveMarketing}
                    onChange={(e) => setNewAddress({ ...newAddress, canReceiveMarketing: e.target.checked })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0" color={textPrimary}>Can receive transactional emails</FormLabel>
                  <Switch
                    isChecked={newAddress.canReceiveTransactional}
                    onChange={(e) => setNewAddress({ ...newAddress, canReceiveTransactional: e.target.checked })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px" borderColor={cardBorder}>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onClose}
                color={textPrimary}
                _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
              >
                Cancel
              </Button>
              <Button
                bg="#3B82F6"
                color="white"
                _hover={{ bg: "#2563EB" }}
                onClick={handleSave}
                isDisabled={!newAddress.email}
              >
                {editingAddress ? 'Update' : 'Add'} Contact
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
            </VStack>
          </CardBody>
        </Card>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};