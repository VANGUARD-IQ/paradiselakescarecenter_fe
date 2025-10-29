import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  InputGroup,
  InputLeftAddon,
  FormHelperText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Collapse,
  useDisclosure,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiDollarSign, FiPlus, FiTrash2, FiCalendar, FiRefreshCcw } from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import opportunitiesModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Queries and Mutations
const GET_CLIENT = gql`
  query GetClient($phoneNumber: String!) {
    clientByPhoneNumber(phoneNumber: $phoneNumber) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: ID!) {
    client(id: $id) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const SEARCH_CLIENTS = gql`
  query SearchClients($search: String, $tags: [String!]) {
    searchClients(search: $search, tags: $tags) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
    }
  }
`;

const GET_OPPORTUNITY_STAGES = gql`
  query GetOpportunityStages {
    opportunityStages {
      id
      name
      code
      order
      color
      defaultProbability
    }
  }
`;

const CREATE_OPPORTUNITY = gql`
  mutation CreateOpportunity($input: OpportunityInput!) {
    createOpportunity(input: $input) {
      id
      title
      clientId
      value
      stage
      status
      paymentSchedule {
        description
        amount
        dueDate
        status
      }
      recurringPayment {
        monthlyAmount
        probability
        description
        startDate
        endDate
      }
      projectedTotalValue
    }
  }
`;

const NewOpportunity: React.FC = () => {
  usePageTitle("New Opportunity");

  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { colorMode } = useColorMode();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: clientId || '',
    value: 0,
    stage: 'LEAD',
    priority: 'MEDIUM',
    probability: 10,
    expectedCloseDate: '',
    source: '',
    campaign: '',
    internalNotes: '',
    products: [] as string[],
    services: [] as string[],
    tags: [] as string[],
    paymentSchedule: [] as Array<{
      description: string;
      amount: number;
      dueDate: string;
      notes?: string;
    }>,
    recurringPayment: {
      monthlyAmount: 0,
      probability: 100,
      description: '',
      startDate: '',
      endDate: ''
    }
  });

  const [clientSearch, setClientSearch] = useState('');

  // Queries
  const { data: stagesData } = useQuery(GET_OPPORTUNITY_STAGES);
  const { data: clientData, loading: loadingClient } = useQuery(
    GET_CLIENT_BY_ID,
    {
      variables: { id: clientId },
      skip: !clientId // Skip only when there's NO clientId
    }
  );

  // Search clients query - get all clients when no clientId is provided
  const { data: clientsData, loading: loadingClients } = useQuery(SEARCH_CLIENTS, {
    variables: { search: clientSearch || "" }, // Pass empty string to get all clients
    skip: !!clientId, // Skip if we already have a clientId from URL
    fetchPolicy: 'cache-and-network' // Ensure we always have fresh data
  });

  // Mutation
  const [createOpportunity, { loading: creating }] = useMutation(CREATE_OPPORTUNITY);

  const stages = stagesData?.opportunityStages || [];
  const client = clientData?.client;
  const availableClients = clientsData?.searchClients || [];

  // Update clientId when client is loaded from URL
  useEffect(() => {
    if (client && clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: client.id
      }));
    }
  }, [client, clientId]);

  // Update probability when stage changes
  useEffect(() => {
    const selectedStage = stages.find((s: any) => s.code === formData.stage);
    if (selectedStage) {
      setFormData(prev => ({
        ...prev,
        probability: selectedStage.defaultProbability
      }));
    }
  }, [formData.stage, stages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.clientId) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a title and select a client',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Helper function to convert date string to ISO format
      const formatDateToISO = (dateStr: string) => {
        if (!dateStr) return undefined;
        // Convert YYYY-MM-DD to ISO 8601 format with time
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return undefined;
        return date.toISOString();
      };

      const result = await createOpportunity({
        variables: {
          input: {
            ...formData,
            value: parseFloat(formData.value.toString()),
            expectedCloseDate: formatDateToISO(formData.expectedCloseDate),
            paymentSchedule: formData.paymentSchedule
              .filter(p => p.description && p.amount > 0)
              .map(p => ({
                ...p,
                dueDate: formatDateToISO(p.dueDate) || new Date().toISOString()
              })),
            recurringPayment: formData.recurringPayment.monthlyAmount > 0 ? {
              ...formData.recurringPayment,
              startDate: formatDateToISO(formData.recurringPayment.startDate) || new Date().toISOString(),
              endDate: formatDateToISO(formData.recurringPayment.endDate)
            } : undefined
          }
        }
      });

      toast({
        title: 'Opportunity created',
        description: 'The opportunity has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/opportunities/${result.data.createOpportunity.id}`);
    } catch (error: any) {
      toast({
        title: 'Failed to create opportunity',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Brand styling variables
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);
  const expectedRevenue = formData.value * (formData.probability / 100);

  // Calculate total scheduled payments
  const totalScheduled = formData.paymentSchedule.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // Calculate projected total with recurring
  const recurringMonths = formData.recurringPayment.startDate && formData.recurringPayment.endDate
    ? Math.max(0, Math.ceil((new Date(formData.recurringPayment.endDate).getTime() - new Date(formData.recurringPayment.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000)))
    : 12;
  const recurringTotal = formData.recurringPayment.monthlyAmount * recurringMonths * (formData.recurringPayment.probability / 100);
  const projectedTotal = expectedRevenue + totalScheduled + recurringTotal;

  // Payment schedule functions
  const addPaymentScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: [
        ...prev.paymentSchedule,
        {
          description: '',
          amount: 0,
          dueDate: '',
          notes: ''
        }
      ]
    }));
  };

  const updatePaymentScheduleItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePaymentScheduleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter((_, i) => i !== index)
    }));
  };

  const updateRecurringPayment = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurringPayment: {
        ...prev.recurringPayment,
        [field]: value
      }
    }));
  };

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />

      <Container maxW="4xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              <Button
                bg="rgba(255, 255, 255, 0.1)"
                color={textPrimary}
                leftIcon={<FiArrowLeft />}
                onClick={() => navigate(-1)}
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                transition="all 0.2s"
              >
                Back
              </Button>
              <Heading size="lg" color={textPrimary}>New Opportunity</Heading>
            </HStack>
          </HStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Client Selection/Information Card */}
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
                <CardHeader>
                  <Text fontWeight="bold" color={textPrimary}>Client Information</Text>
                </CardHeader>
                <CardBody>
                  {clientId && loadingClient ? (
                    // Show loading state while fetching client
                    <Text color={textSecondary}>Loading client information...</Text>
                  ) : clientId && client ? (
                    // Show client info when clientId is in URL
                    <HStack spacing={6}>
                      <HStack>
                        <FiUser color={textSecondary} />
                        <Text color={textPrimary}>{client.fName} {client.lName}</Text>
                        {client.businessName && (
                          <Badge colorScheme="blue">{client.businessName}</Badge>
                        )}
                      </HStack>
                      {client.email && (
                        <HStack>
                          <FiMail color={textSecondary} />
                          <Text color={textSecondary}>{client.email}</Text>
                        </HStack>
                      )}
                      {client.phoneNumber && (
                        <HStack>
                          <FiPhone color={textSecondary} />
                          <Text color={textSecondary}>{client.phoneNumber}</Text>
                        </HStack>
                      )}
                    </HStack>
                  ) : (
                    // Show client selector dropdown when no clientId in URL
                    <VStack spacing={4} align="stretch">
                      <VStack spacing={2} align="stretch">
                        <FormLabel color={textPrimary} mb={0}>Search Clients</FormLabel>
                        <Input
                          placeholder="Search clients by name, email, or phone..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.1)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          _placeholder={{ color: textMuted }}
                          _hover={{
                            borderColor: textSecondary,
                            bg: colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.15)'
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                            bg: colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.15)'
                          }}
                        />
                      </VStack>
                      <FormControl isRequired>
                        <FormLabel color={textPrimary}>Select Client</FormLabel>
                        <Select
                          placeholder="Choose a client"
                          value={formData.clientId}
                          onChange={(e) => {
                            const newClientId = e.target.value;
                            handleInputChange('clientId', newClientId);
                            // Update URL with selected client ID
                            if (newClientId) {
                              const newUrl = `/opportunities/new?clientId=${newClientId}`;
                              window.history.replaceState(null, '', newUrl);
                            }
                          }}
                          isRequired
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.1)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          sx={{
                            option: {
                              bg: colorMode === 'light' ? 'white' : '#1a1a1a',
                              color: colorMode === 'light' ? 'black' : 'white',
                              _hover: {
                                bg: colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.2)'
                              }
                            }
                          }}
                          _hover={{
                            borderColor: textSecondary,
                            bg: colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.15)'
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                            bg: colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.15)'
                          }}
                        >
                          {availableClients.map((c: any) => (
                            <option key={c.id} value={c.id} style={{ background: colorMode === 'light' ? 'white' : '#1a1a1a', color: colorMode === 'light' ? 'black' : 'white' }}>
                              {c.fName} {c.lName}
                              {c.businessName && ` - ${c.businessName}`}
                              {c.email && ` (${c.email})`}
                              {!c.email && c.phoneNumber && ` (${c.phoneNumber})`}
                            </option>
                          ))}
                        </Select>
                        {loadingClients && (
                          <Text fontSize="sm" color={textMuted} mt={1}>
                            Loading clients...
                          </Text>
                        )}
                        {!loadingClients && availableClients.length === 0 && (
                          <Text fontSize="sm" color={textMuted} mt={1}>
                            {clientSearch
                              ? `No clients found matching "${clientSearch}"`
                              : "No clients available. Please create a client first."
                            }
                          </Text>
                        )}
                      </FormControl>

                      {/* Show selected client info if one is selected */}
                      {formData.clientId && !clientId && (() => {
                        const selectedClient = availableClients.find((c: any) => c.id === formData.clientId);
                        return selectedClient ? (
                          <Box pt={2} borderTop="1px" borderColor={cardBorder}>
                            <HStack spacing={4}>
                              <HStack>
                                <FiUser color={textSecondary} />
                                <Text fontSize="sm" color={textPrimary}>{selectedClient.fName} {selectedClient.lName}</Text>
                              </HStack>
                              {selectedClient.email && (
                                <HStack>
                                  <FiMail color={textSecondary} />
                                  <Text fontSize="sm" color={textSecondary}>{selectedClient.email}</Text>
                                </HStack>
                              )}
                              {selectedClient.phoneNumber && (
                                <HStack>
                                  <FiPhone color={textSecondary} />
                                  <Text fontSize="sm" color={textSecondary}>{selectedClient.phoneNumber}</Text>
                                </HStack>
                              )}
                            </HStack>
                          </Box>
                        ) : null;
                      })()}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* Opportunity Details */}
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
                <CardHeader>
                  <Text fontWeight="bold" color={textPrimary}>Opportunity Details</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel color={textPrimary}>Title</FormLabel>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Website Development for ABC Company"
                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary}>Description</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the opportunity..."
                        rows={4}
                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                      />
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl isRequired flex="1">
                        <FormLabel color={textPrimary}>One-off Payment Value (AUD)</FormLabel>
                        <InputGroup>
                          <InputLeftAddon bg="rgba(255, 255, 255, 0.1)" borderColor={cardBorder} color={textPrimary}>$</InputLeftAddon>
                          <NumberInput
                            value={formData.value}
                            onChange={(_, value) => handleInputChange('value', value || 0)}
                            min={0}
                            flex="1"
                          >
                            <NumberInputField
                              bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                              borderColor={cardBorder}
                              color={textPrimary}
                              _placeholder={{ color: textMuted }}
                              _hover={{ borderColor: textSecondary }}
                              _focus={{
                                borderColor: primaryColor,
                                boxShadow: `0 0 0 1px ${primaryColor}`,
                              }}
                            />
                            <NumberInputStepper borderColor={cardBorder}>
                              <NumberIncrementStepper borderColor={cardBorder} color={textPrimary} />
                              <NumberDecrementStepper borderColor={cardBorder} color={textPrimary} />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color={textPrimary}>Expected Close Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.expectedCloseDate}
                          onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                        />
                      </FormControl>
                    </HStack>

                    <HStack spacing={4}>
                      <FormControl flex="1">
                        <FormLabel color={textPrimary}>Stage</FormLabel>
                        <Select
                          value={formData.stage}
                          onChange={(e) => handleInputChange('stage', e.target.value)}
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                        >
                          {stages.map((stage: any) => (
                            <option key={stage.code} value={stage.code}>
                              {stage.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color={textPrimary}>Priority</FormLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel color={textPrimary}>
                        Win Probability: {formData.probability}%
                      </FormLabel>
                      <Slider
                        value={formData.probability}
                        onChange={(value) => handleInputChange('probability', value)}
                        min={0}
                        max={100}
                        step={5}
                      >
                        <SliderTrack>
                          <SliderFilledTrack bg={primaryColor} />
                        </SliderTrack>
                        <SliderThumb boxSize={6}>
                          <Box color={primaryColor} as={FiDollarSign} />
                        </SliderThumb>
                      </Slider>
                      <FormHelperText color={textSecondary}>
                        Expected Revenue: ${expectedRevenue.toLocaleString()}
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Payment Tracking */}
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
                <CardHeader>
                  <Text fontWeight="bold" color={textPrimary}>Payment Tracking</Text>
                </CardHeader>
                <CardBody>
                  <Tabs variant="soft-rounded" colorScheme="brand">
                    <TabList mb={4}>
                      <Tab color={textSecondary} _selected={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}>
                        Payment Schedule
                      </Tab>
                      <Tab color={textSecondary} _selected={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}>
                        Recurring Subscription
                      </Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          {/* Payment Schedule Items */}
                          {formData.paymentSchedule.map((payment, index) => (
                            <Box key={index} p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" border="1px" borderColor={cardBorder}>
                              <VStack spacing={3}>
                                <HStack width="full" justify="space-between">
                                  <Text color={textPrimary} fontWeight="semibold">Payment #{index + 1}</Text>
                                  <IconButton
                                    aria-label="Remove payment"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => removePaymentScheduleItem(index)}
                                  />
                                </HStack>

                                <FormControl>
                                  <FormLabel color={textPrimary}>Description</FormLabel>
                                  <Input
                                    value={payment.description}
                                    onChange={(e) => updatePaymentScheduleItem(index, 'description', e.target.value)}
                                    placeholder="e.g., Initial deposit, Final payment"
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                  />
                                </FormControl>

                                <HStack spacing={4} width="full">
                                  <FormControl flex="1">
                                    <FormLabel color={textPrimary}>Amount (AUD)</FormLabel>
                                    <InputGroup>
                                      <InputLeftAddon bg="rgba(255, 255, 255, 0.1)" borderColor={cardBorder} color={textPrimary}>$</InputLeftAddon>
                                      <NumberInput
                                        value={payment.amount}
                                        onChange={(_, value) => updatePaymentScheduleItem(index, 'amount', value || 0)}
                                        min={0}
                                        width="full"
                                      >
                                        <NumberInputField
                                          bg="rgba(255, 255, 255, 0.05)"
                                          borderColor={cardBorder}
                                          color={textPrimary}
                                        />
                                      </NumberInput>
                                    </InputGroup>
                                  </FormControl>

                                  <FormControl flex="1">
                                    <FormLabel color={textPrimary}>Due Date</FormLabel>
                                    <Input
                                      type="date"
                                      value={payment.dueDate}
                                      onChange={(e) => updatePaymentScheduleItem(index, 'dueDate', e.target.value)}
                                      bg="rgba(255, 255, 255, 0.05)"
                                      borderColor={cardBorder}
                                      color={textPrimary}
                                    />
                                  </FormControl>
                                </HStack>

                                <FormControl>
                                  <FormLabel color={textPrimary}>Notes (Optional)</FormLabel>
                                  <Textarea
                                    value={payment.notes}
                                    onChange={(e) => updatePaymentScheduleItem(index, 'notes', e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={2}
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                  />
                                </FormControl>
                              </VStack>
                            </Box>
                          ))}

                          <Button
                            onClick={addPaymentScheduleItem}
                            leftIcon={<FiPlus />}
                            variant="outline"
                            borderColor={primaryColor}
                            color={primaryColor}
                            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                          >
                            Add Payment
                          </Button>

                          {formData.paymentSchedule.length > 0 && (
                            <Box p={3} bg="rgba(255, 255, 255, 0.1)" borderRadius="md">
                              <Text color={textPrimary} fontWeight="bold">
                                Total Scheduled: ${totalScheduled.toLocaleString()}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </TabPanel>

                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          <FormControl>
                            <FormLabel color={textPrimary}>Monthly Amount (AUD)</FormLabel>
                            <InputGroup>
                              <InputLeftAddon bg="rgba(255, 255, 255, 0.1)" borderColor={cardBorder} color={textPrimary}>$</InputLeftAddon>
                              <NumberInput
                                value={formData.recurringPayment.monthlyAmount}
                                onChange={(_, value) => updateRecurringPayment('monthlyAmount', value || 0)}
                                min={0}
                                width="full"
                              >
                                <NumberInputField
                                  bg="rgba(255, 255, 255, 0.05)"
                                  borderColor={cardBorder}
                                  color={textPrimary}
                                />
                              </NumberInput>
                            </InputGroup>
                          </FormControl>

                          <FormControl>
                            <FormLabel color={textPrimary}>
                              Subscription Probability: {formData.recurringPayment.probability}%
                            </FormLabel>
                            <Slider
                              value={formData.recurringPayment.probability}
                              onChange={(value) => updateRecurringPayment('probability', value)}
                              min={0}
                              max={100}
                              step={5}
                            >
                              <SliderTrack>
                                <SliderFilledTrack bg={primaryColor} />
                              </SliderTrack>
                              <SliderThumb boxSize={6}>
                                <Box color={primaryColor} as={FiRefreshCcw} />
                              </SliderThumb>
                            </Slider>
                          </FormControl>

                          <FormControl>
                            <FormLabel color={textPrimary}>Description</FormLabel>
                            <Input
                              value={formData.recurringPayment.description}
                              onChange={(e) => updateRecurringPayment('description', e.target.value)}
                              placeholder="e.g., Monthly maintenance, SaaS subscription"
                              bg="rgba(255, 255, 255, 0.05)"
                              borderColor={cardBorder}
                              color={textPrimary}
                              _placeholder={{ color: textMuted }}
                            />
                          </FormControl>

                          <HStack spacing={4}>
                            <FormControl flex="1">
                              <FormLabel color={textPrimary}>Start Date</FormLabel>
                              <Input
                                type="date"
                                value={formData.recurringPayment.startDate}
                                onChange={(e) => updateRecurringPayment('startDate', e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                borderColor={cardBorder}
                                color={textPrimary}
                              />
                            </FormControl>

                            <FormControl flex="1">
                              <FormLabel color={textPrimary}>End Date (Optional)</FormLabel>
                              <Input
                                type="date"
                                value={formData.recurringPayment.endDate}
                                onChange={(e) => updateRecurringPayment('endDate', e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                borderColor={cardBorder}
                                color={textPrimary}
                              />
                            </FormControl>
                          </HStack>

                          {formData.recurringPayment.monthlyAmount > 0 && (
                            <Box p={3} bg="rgba(255, 255, 255, 0.1)" borderRadius="md">
                              <VStack align="start">
                                <Text color={textPrimary} fontWeight="bold">
                                  Recurring Value ({recurringMonths} months): ${recurringTotal.toLocaleString()}
                                </Text>
                                <Text color={textSecondary} fontSize="sm">
                                  Monthly: ${formData.recurringPayment.monthlyAmount.toLocaleString()} × {recurringMonths} months × {formData.recurringPayment.probability}% probability
                                </Text>
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>

                  {/* Total Projected Value Summary */}
                  {(expectedRevenue > 0 || totalScheduled > 0 || recurringTotal > 0) && (
                    <Box mt={6} p={4} bg={primaryColor} bgGradient="linear(to-r, brand.500, brand.600)" borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <Text color="white" fontWeight="bold" fontSize="lg">
                          Total Projected Value: ${projectedTotal.toLocaleString()}
                        </Text>
                        <VStack align="start" spacing={1}>
                          {expectedRevenue > 0 && (
                            <Text color="whiteAlpha.900" fontSize="sm">
                              • One-off payment: ${expectedRevenue.toLocaleString()} ({formData.probability}% probability)
                            </Text>
                          )}
                          {totalScheduled > 0 && (
                            <Text color="whiteAlpha.900" fontSize="sm">
                              • Scheduled payments: ${totalScheduled.toLocaleString()}
                            </Text>
                          )}
                          {recurringTotal > 0 && (
                            <Text color="whiteAlpha.900" fontSize="sm">
                              • Recurring subscription: ${recurringTotal.toLocaleString()} ({formData.recurringPayment.probability}% probability)
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    </Box>
                  )}
                </CardBody>
              </Card>

              {/* Source & Tracking */}
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
                <CardHeader>
                  <Text fontWeight="bold" color={textPrimary}>Source & Tracking</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <FormControl flex="1">
                        <FormLabel color={textPrimary}>Lead Source</FormLabel>
                        <Select
                          value={formData.source}
                          onChange={(e) => handleInputChange('source', e.target.value)}
                          placeholder="Select source"
                          bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                          borderColor={cardBorder}
                          color={textPrimary}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                        >
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Email">Email Campaign</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Event">Event</option>
                          <option value="Partner">Partner</option>
                          <option value="Other">Other</option>
                        </Select>
                      </FormControl>

                      <FormControl flex="1">
                        <FormLabel color={textPrimary}>Campaign</FormLabel>
                        <Input
                          value={formData.campaign}
                          onChange={(e) => handleInputChange('campaign', e.target.value)}
                          placeholder="Marketing campaign name"
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
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel color={textPrimary}>Internal Notes</FormLabel>
                      <Textarea
                        value={formData.internalNotes}
                        onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                        placeholder="Notes for internal use only..."
                        rows={3}
                        bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <HStack justify="flex-end" spacing={4}>
                <Button
                  variant="outline"
                  borderColor={primaryColor}
                  color={primaryColor}
                  onClick={() => navigate(-1)}
                  _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                  transition="all 0.2s"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg={primaryColor}
                  color="white"
                  _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  fontWeight="semibold"
                  leftIcon={<FiSave />}
                  isLoading={creating}
                  loadingText="Creating..."
                >
                  Create Opportunity
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default NewOpportunity;