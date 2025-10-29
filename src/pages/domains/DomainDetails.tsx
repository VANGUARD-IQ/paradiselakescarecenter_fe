import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Select,
  IconButton,
  useToast,
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
  Badge,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Textarea,
  useColorMode,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiRefreshCw, FiLock, FiMail, FiGlobe } from 'react-icons/fi';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { useNavigate, useParams } from 'react-router-dom';

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export const DomainDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  // Consistent styling
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const buttonBg = getColor("primary", colorMode);

  // Mock domain data
  const [domain] = useState({
    id: id,
    name: 'example.com',
    status: 'REGISTERED',
    registrationDate: '2024-01-15',
    expiryDate: '2025-01-15',
    autoRenew: true,
    privacyProtection: true,
    locked: false,
    nameservers: [
      'ns1.vercel-dns.com',
      'ns2.vercel-dns.com'
    ]
  });

  // DNS Records state
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([
    { id: '1', type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 },
    { id: '2', type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 },
    { id: '3', type: 'MX', name: '@', value: 'mx1.emailservice.com', ttl: 3600, priority: 10 },
    { id: '4', type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
  ]);

  // New/Edit record state
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<DNSRecord>>({
    type: 'A',
    name: '',
    value: '',
    ttl: 3600
  });

  const handleAddRecord = () => {
    if (!newRecord.name || !newRecord.value) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    const record: DNSRecord = {
      id: Date.now().toString(),
      type: newRecord.type as DNSRecord['type'],
      name: newRecord.name || '',
      value: newRecord.value || '',
      ttl: newRecord.ttl || 3600,
      priority: newRecord.priority
    };

    setDnsRecords([...dnsRecords, record]);
    setNewRecord({ type: 'A', name: '', value: '', ttl: 3600 });
    onClose();
    
    toast({
      title: 'Record added',
      description: 'DNS record has been added successfully',
      status: 'success',
      duration: 3000
    });
  };

  const handleUpdateRecord = (record: DNSRecord) => {
    setDnsRecords(dnsRecords.map(r => r.id === record.id ? record : r));
    setEditingRecord(null);
    
    toast({
      title: 'Record updated',
      description: 'DNS record has been updated successfully',
      status: 'success',
      duration: 3000
    });
  };

  const handleDeleteRecord = (id: string) => {
    setDnsRecords(dnsRecords.filter(r => r.id !== id));
    
    toast({
      title: 'Record deleted',
      description: 'DNS record has been deleted successfully',
      status: 'success',
      duration: 3000
    });
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'A': 'green',
      'AAAA': 'teal',
      'CNAME': 'blue',
      'MX': 'purple',
      'TXT': 'orange',
      'NS': 'pink',
      'SRV': 'yellow',
      'CAA': 'red'
    };
    return colors[type] || 'gray';
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      
      <Container maxW="7xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/domains')}
              color={textPrimary}
            >
              Back to Domains
            </Button>
            <HStack>
              <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                {domain.status}
              </Badge>
              {domain.locked && (
                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                  <FiLock /> Locked
                </Badge>
              )}
            </HStack>
          </HStack>

          {/* Domain Overview */}
          <Card
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <HStack>
                <FiGlobe size={24} />
                <Heading size="lg" color={textPrimary}>
                  {domain.name}
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Box>
                  <Text fontSize="sm" color={textMuted}>Registration Date</Text>
                  <Text color={textPrimary} fontWeight="medium">
                    {new Date(domain.registrationDate).toLocaleDateString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={textMuted}>Expiry Date</Text>
                  <Text color={textPrimary} fontWeight="medium">
                    {new Date(domain.expiryDate).toLocaleDateString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={textMuted}>Auto-Renew</Text>
                  <Switch isChecked={domain.autoRenew} colorScheme="green" />
                </Box>
                <Box>
                  <Text fontSize="sm" color={textMuted}>Privacy Protection</Text>
                  <Switch isChecked={domain.privacyProtection} colorScheme="blue" />
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Tabs variant="enclosed">
            <TabList>
              <Tab color={textPrimary}>DNS Records</Tab>
              <Tab color={textPrimary}>Nameservers</Tab>
              <Tab color={textPrimary}>Email Configuration</Tab>
              <Tab color={textPrimary}>Transfer & Security</Tab>
            </TabList>

            <TabPanels>
              {/* DNS Records Tab */}
              <TabPanel>
                <Card
                  bg={cardGradientBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="xl"
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md" color={textPrimary}>
                        DNS Records
                      </Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        onClick={onOpen}
                        bg={buttonBg}
                        color="white"
                        size="sm"
                        _hover={{ bg: getColor("secondary", colorMode) }}
                      >
                        Add Record
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th color={textMuted}>Type</Th>
                            <Th color={textMuted}>Name</Th>
                            <Th color={textMuted}>Value</Th>
                            <Th color={textMuted}>TTL</Th>
                            <Th color={textMuted}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dnsRecords.map((record) => (
                            <Tr key={record.id}>
                              <Td>
                                <Badge colorScheme={getRecordTypeColor(record.type)}>
                                  {record.type}
                                </Badge>
                              </Td>
                              <Td color={textPrimary}>
                                {editingRecord?.id === record.id ? (
                                  <Input
                                    size="sm"
                                    value={editingRecord.name}
                                    onChange={(e) => setEditingRecord({
                                      ...editingRecord,
                                      name: e.target.value
                                    })}
                                  />
                                ) : (
                                  record.name
                                )}
                              </Td>
                              <Td color={textPrimary}>
                                {editingRecord?.id === record.id ? (
                                  <Input
                                    size="sm"
                                    value={editingRecord.value}
                                    onChange={(e) => setEditingRecord({
                                      ...editingRecord,
                                      value: e.target.value
                                    })}
                                  />
                                ) : (
                                  <Text fontSize="sm" isTruncated maxW="300px">
                                    {record.value}
                                  </Text>
                                )}
                              </Td>
                              <Td color={textMuted}>
                                {editingRecord?.id === record.id ? (
                                  <Input
                                    size="sm"
                                    type="number"
                                    value={editingRecord.ttl}
                                    onChange={(e) => setEditingRecord({
                                      ...editingRecord,
                                      ttl: parseInt(e.target.value)
                                    })}
                                  />
                                ) : (
                                  `${record.ttl}s`
                                )}
                              </Td>
                              <Td>
                                {editingRecord?.id === record.id ? (
                                  <HStack>
                                    <IconButton
                                      icon={<FiSave />}
                                      aria-label="Save"
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleUpdateRecord(editingRecord)}
                                    />
                                    <IconButton
                                      icon={<FiX />}
                                      aria-label="Cancel"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingRecord(null)}
                                    />
                                  </HStack>
                                ) : (
                                  <HStack>
                                    <IconButton
                                      icon={<FiEdit2 />}
                                      aria-label="Edit"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingRecord(record)}
                                    />
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      aria-label="Delete"
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleDeleteRecord(record.id)}
                                    />
                                  </HStack>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Nameservers Tab */}
              <TabPanel>
                <Card
                  bg={cardGradientBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="xl"
                >
                  <CardHeader>
                    <Heading size="md" color={textPrimary}>
                      Nameservers
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Alert status="info">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Using Vercel DNS. Changes to nameservers will affect all DNS records.
                        </Text>
                      </Alert>
                      
                      {domain.nameservers.map((ns, index) => (
                        <Input
                          key={index}
                          value={ns}
                          readOnly
                          bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                          color={textPrimary}
                        />
                      ))}
                      
                      <Button variant="outline" leftIcon={<FiRefreshCw />}>
                        Update Nameservers
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Email Configuration Tab */}
              <TabPanel>
                <Card
                  bg={cardGradientBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  borderRadius="xl"
                >
                  <CardHeader>
                    <HStack>
                      <FiMail />
                      <Heading size="md" color={textPrimary}>
                        Email Configuration
                      </Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Alert status="warning">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Configure MX records in the DNS Records tab to enable email for this domain.
                        </Text>
                      </Alert>
                      
                      <Text color={textSecondary}>
                        Quick setup guides:
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Button variant="outline" size="sm">
                          Setup Google Workspace
                        </Button>
                        <Button variant="outline" size="sm">
                          Setup Microsoft 365
                        </Button>
                        <Button variant="outline" size="sm">
                          Setup ProtonMail
                        </Button>
                        <Button variant="outline" size="sm">
                          Setup Custom SMTP
                        </Button>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Transfer & Security Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Card
                    bg={cardGradientBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="xl"
                  >
                    <CardHeader>
                      <Heading size="md" color={textPrimary}>
                        Domain Security
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Box>
                            <Text color={textPrimary} fontWeight="medium">
                              Domain Lock
                            </Text>
                            <Text fontSize="sm" color={textMuted}>
                              Prevent unauthorized transfers
                            </Text>
                          </Box>
                          <Switch isChecked={!domain.locked} colorScheme="green" />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Box>
                            <Text color={textPrimary} fontWeight="medium">
                              DNSSEC
                            </Text>
                            <Text fontSize="sm" color={textMuted}>
                              Enable DNS Security Extensions
                            </Text>
                          </Box>
                          <Switch colorScheme="green" />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Box>
                            <Text color={textPrimary} fontWeight="medium">
                              Two-Factor Authentication
                            </Text>
                            <Text fontSize="sm" color={textMuted}>
                              Extra security for domain management
                            </Text>
                          </Box>
                          <Switch isChecked colorScheme="green" />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
                    bg={cardGradientBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="xl"
                  >
                    <CardHeader>
                      <Heading size="md" color={textPrimary}>
                        Transfer Domain
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Alert status="info">
                          <AlertIcon />
                          <Text fontSize="sm">
                            To transfer this domain, unlock it first and get the authorization code.
                          </Text>
                        </Alert>
                        
                        <Button variant="outline" isDisabled={domain.locked}>
                          Get Authorization Code
                        </Button>
                        
                        <Text fontSize="sm" color={textMuted}>
                          Authorization codes are valid for 30 days and can only be used once.
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Add DNS Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={cardGradientBg} borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>Add DNS Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color={textPrimary}>Type</FormLabel>
                <Select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as DNSRecord['type'] })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  color={textPrimary}
                >
                  <option value="A">A - IPv4 Address</option>
                  <option value="AAAA">AAAA - IPv6 Address</option>
                  <option value="CNAME">CNAME - Alias</option>
                  <option value="MX">MX - Mail Server</option>
                  <option value="TXT">TXT - Text Record</option>
                  <option value="NS">NS - Nameserver</option>
                  <option value="SRV">SRV - Service</option>
                  <option value="CAA">CAA - Certificate Authority</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textPrimary}>Name</FormLabel>
                <Input
                  placeholder="@ for root or subdomain name"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textPrimary}>Value</FormLabel>
                <Textarea
                  placeholder="Record value"
                  value={newRecord.value}
                  onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  color={textPrimary}
                />
              </FormControl>

              {newRecord.type === 'MX' && (
                <FormControl>
                  <FormLabel color={textPrimary}>Priority</FormLabel>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newRecord.priority}
                    onChange={(e) => setNewRecord({ ...newRecord, priority: parseInt(e.target.value) })}
                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                    color={textPrimary}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel color={textPrimary}>TTL (seconds)</FormLabel>
                <Input
                  type="number"
                  value={newRecord.ttl}
                  onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  color={textPrimary}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color={textPrimary}>
              Cancel
            </Button>
            <Button
              bg={buttonBg}
              color="white"
              onClick={handleAddRecord}
              _hover={{ bg: getColor("secondary", colorMode) }}
            >
              Add Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};