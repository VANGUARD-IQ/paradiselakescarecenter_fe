import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiArrowLeft, FiEdit, FiCheck, FiTrash2, FiUser, FiMail, FiPhone, FiDollarSign, FiCalendar, FiRefreshCcw, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import { OpportunityTasks } from "../../components/opportunities/OpportunityTasks";
import { OpportunityMeetings } from "../../components/opportunities/OpportunityMeetings";
import { OpportunityNotes } from "../../components/opportunities/OpportunityNotes";
import OpportunityMembers from "./OpportunityMembers";
import PaymentSplits from "./PaymentSplits";
import opportunitiesModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Queries and Mutations
const GET_ALL_CLIENTS = gql`
  query GetAllClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
    }
  }
`;

const GET_OPPORTUNITY = gql`
  query GetOpportunity($id: String!) {
    opportunity(id: $id) {
      id
      title
      description
      clientId
      clientName
      clientEmail
      clientPhone
      value
      valuePaymentStatus
      valueReceivedDate
      stage
      status
      priority
      probability
      expectedCloseDate
      source
      campaign
      internalNotes
      products
      services
      tags
      assignedTo
      assignedToName
      expectedRevenue
      createdAt
      updatedAt
      lastActivityDate
      taskCount
      meetingCount
      emailCount
      callCount
      noteCount
      paymentSchedule {
        description
        amount
        dueDate
        status
        paymentStatus
        receivedDate
        paidDate
        notes
        memberSplits {
          clientId
          clientName
          percentage
          amount
          payoutDelayDays
          payoutDate
          payoutNotes
          payoutStatus
          paidOutDate
          transactionId
        }
      }
      recurringPayment {
        monthlyAmount
        probability
        description
        startDate
        endDate
        paymentStatus
        lastPaymentDate
        nextPaymentDate
        memberSplits {
          clientId
          clientName
          percentage
          amount
          payoutDelayDays
          payoutDate
          payoutNotes
          payoutStatus
          paidOutDate
          transactionId
        }
      }
      valueMemberSplits {
        clientId
        clientName
        percentage
        amount
        payoutDelayDays
        payoutDate
        payoutNotes
        payoutStatus
        paidOutDate
        transactionId
      }
      memberCount
      totalScheduledAmount
      totalPaidAmount
      projectedTotalValue
    }
  }
`;

const UPDATE_OPPORTUNITY = gql`
  mutation UpdateOpportunity($id: String!, $input: OpportunityUpdateInput!) {
    updateOpportunity(id: $id, input: $input) {
      id
      title
      description
      value
      stage
      priority
      probability
      expectedCloseDate
      source
      campaign
      internalNotes
      paymentSchedule {
        description
        amount
        dueDate
        status
        paidDate
        notes
      }
      recurringPayment {
        monthlyAmount
        probability
        description
        startDate
        endDate
      }
    }
  }
`;

const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdateOpportunityPaymentStatus($opportunityId: String!, $paymentIndex: Int!, $status: PaymentScheduleStatus!) {
    updateOpportunityPaymentStatus(opportunityId: $opportunityId, paymentIndex: $paymentIndex, status: $status) {
      id
      paymentSchedule {
        description
        amount
        dueDate
        status
        paidDate
        notes
      }
      totalPaidAmount
      expectedRevenue
    }
  }
`;

const DELETE_OPPORTUNITY = gql`
  mutation DeleteOpportunity($id: String!) {
    deleteOpportunity(id: $id)
  }
`;

const GET_OPPORTUNITY_MEMBERS = gql`
  query GetOpportunityMembers($opportunityId: String!) {
    opportunityMembers(opportunityId: $opportunityId) {
      id
      clientId
      clientName
      clientEmail
      role
      notes
      isActive
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

const OpportunityDetail: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayments, setIsEditingPayments] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [paymentFormData, setPaymentFormData] = useState<any>({
    paymentSchedule: [],
    recurringPayment: {
      monthlyAmount: 0,
      probability: 100,
      description: '',
      startDate: '',
      endDate: ''
    }
  });
  const { colorMode } = useColorMode();

  // Brand styling variables
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardHeaderBg = getColor("background.cardHeader", colorMode) || (colorMode === 'light' ? "gray.50" : "gray.800");
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_OPPORTUNITY, {
    variables: { id },
    skip: !id,
  });

  const { data: stagesData } = useQuery(GET_OPPORTUNITY_STAGES);
  const stages = stagesData?.opportunityStages || [];

  const { data: clientsData, loading: loadingClients } = useQuery(GET_ALL_CLIENTS);
  const clients = clientsData?.clients || [];

  // Debug: Log clients data
  useEffect(() => {
    if (clientsData) {
      console.log('Clients loaded:', clients.length, clients);
    }
  }, [clientsData, clients]);

  // Update page title based on opportunity name
  usePageTitle(data?.opportunity?.title ? `${data.opportunity.title} - Opportunity Details` : 'Opportunity Details');

  const { data: membersData, refetch: refetchMembers } = useQuery(GET_OPPORTUNITY_MEMBERS, {
    variables: { opportunityId: id },
    skip: !id,
  });

  // Mutations
  const [updateOpportunity] = useMutation(UPDATE_OPPORTUNITY);
  const [deleteOpportunity, { loading: deleting }] = useMutation(DELETE_OPPORTUNITY);
  const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS);

  const opportunity = data?.opportunity;

  // Initialize form data when opportunity loads
  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        clientId: opportunity.clientId || '',
        value: opportunity.value || 0,
        stage: opportunity.stage || 'LEAD',
        priority: opportunity.priority || 'MEDIUM',
        probability: opportunity.probability || 0,
        expectedCloseDate: opportunity.expectedCloseDate || '',
        source: opportunity.source || '',
        campaign: opportunity.campaign || '',
        internalNotes: opportunity.internalNotes || '',
      });

      // Initialize payment form data
      setPaymentFormData({
        paymentSchedule: opportunity.paymentSchedule || [],
        recurringPayment: opportunity.recurringPayment || {
          monthlyAmount: 0,
          probability: 100,
          description: '',
          startDate: '',
          endDate: ''
        }
      });
    }
  }, [opportunity]);

  const handleSave = async () => {
    try {
      // Helper function to convert date string to ISO format
      const formatDateToISO = (dateStr: string) => {
        if (!dateStr) return undefined;
        // Convert YYYY-MM-DD to ISO 8601 format with time
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return undefined;
        return date.toISOString();
      };

      // Prepare input without clientId (not updatable)
      const { clientId, ...updateInput } = formData;

      await updateOpportunity({
        variables: {
          id,
          input: {
            ...updateInput,
            value: parseFloat(formData.value.toString()),
            expectedCloseDate: formatDateToISO(formData.expectedCloseDate)
          }
        }
      });

      toast({
        title: 'Opportunity updated',
        description: 'Changes have been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update opportunity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        clientId: opportunity.clientId || '',
        value: opportunity.value || 0,
        stage: opportunity.stage || 'LEAD',
        priority: opportunity.priority || 'MEDIUM',
        probability: opportunity.probability || 0,
        expectedCloseDate: opportunity.expectedCloseDate || '',
        source: opportunity.source || '',
        campaign: opportunity.campaign || '',
        internalNotes: opportunity.internalNotes || '',
      });
    }
    setIsEditing(false);
  };

  const handleSavePayments = async () => {
    try {
      // Helper function to convert date string to ISO format
      const formatDateToISO = (dateStr: string) => {
        if (!dateStr) return undefined;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return undefined;
        return date.toISOString();
      };

      await updateOpportunity({
        variables: {
          id,
          input: {
            paymentSchedule: paymentFormData.paymentSchedule
              .filter((p: any) => p.description && p.amount > 0)
              .map((p: any) => ({
                description: p.description,
                amount: parseFloat(p.amount.toString()),
                dueDate: formatDateToISO(p.dueDate) || new Date().toISOString(),
                status: p.status || 'PENDING',
                paidDate: p.paidDate ? formatDateToISO(p.paidDate) : undefined,
                notes: p.notes
              })),
            recurringPayment: paymentFormData.recurringPayment.monthlyAmount > 0 ? {
              monthlyAmount: parseFloat(paymentFormData.recurringPayment.monthlyAmount.toString()),
              probability: paymentFormData.recurringPayment.probability,
              description: paymentFormData.recurringPayment.description,
              startDate: formatDateToISO(paymentFormData.recurringPayment.startDate) || new Date().toISOString(),
              endDate: formatDateToISO(paymentFormData.recurringPayment.endDate)
            } : undefined
          }
        }
      });

      toast({
        title: 'Payment details updated',
        description: 'Changes have been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditingPayments(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update payment details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelPayments = () => {
    if (opportunity) {
      setPaymentFormData({
        paymentSchedule: opportunity.paymentSchedule || [],
        recurringPayment: opportunity.recurringPayment || {
          monthlyAmount: 0,
          probability: 100,
          description: '',
          startDate: '',
          endDate: ''
        }
      });
    }
    setIsEditingPayments(false);
  };

  // Payment schedule functions
  const addPaymentScheduleItem = () => {
    setPaymentFormData((prev: any) => ({
      ...prev,
      paymentSchedule: [
        ...prev.paymentSchedule,
        {
          description: '',
          amount: 0,
          dueDate: '',
          status: 'PENDING',
          notes: ''
        }
      ]
    }));
  };

  const updatePaymentScheduleItem = (index: number, field: string, value: any) => {
    setPaymentFormData((prev: any) => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePaymentScheduleItem = (index: number) => {
    setPaymentFormData((prev: any) => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateRecurringPayment = (field: string, value: any) => {
    setPaymentFormData((prev: any) => ({
      ...prev,
      recurringPayment: {
        ...prev.recurringPayment,
        [field]: value
      }
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }

    try {
      await deleteOpportunity({
        variables: { id }
      });

      toast({
        title: 'Opportunity deleted',
        description: 'The opportunity has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/opportunities');
    } catch (error: any) {
      toast({
        title: 'Failed to delete opportunity',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      LEAD: 'blue',
      QUALIFIED: 'cyan',
      PROPOSAL: 'orange',
      NEGOTIATION: 'yellow',
      CLOSED_WON: 'green',
      CLOSED_LOST: 'red',
    };
    return colors[stage] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      LOW: 'gray',
      MEDIUM: 'blue',
      HIGH: 'orange',
      CRITICAL: 'red',
    };
    return colors[priority] || 'gray';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />
        <Container maxW="4xl" py={8} flex="1">
          <HStack justify="center" py={20}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textPrimary}>Loading opportunity...</Text>
          </HStack>
        </Container>
        <Box position="sticky" bottom={0} zIndex={10}>
          <FooterWithFourColumns />
        </Box>
      </Box>
    );
  }

  if (error || !opportunity) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />
        <Container maxW="4xl" py={8} flex="1">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error ? error.message : 'Opportunity not found'}
          </Alert>
          <Button
            mt={4}
            bg="rgba(255, 255, 255, 0.1)"
            color={textPrimary}
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/opportunities')}
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
          >
            Back to Opportunities
          </Button>
        </Container>
        <Box position="sticky" bottom={0} zIndex={10}>
          <FooterWithFourColumns />
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />

      <Container maxW="6xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <HStack>
              <Button
                bg="rgba(255, 255, 255, 0.1)"
                color={textPrimary}
                leftIcon={<FiArrowLeft />}
                onClick={() => navigate('/opportunities')}
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                transition="all 0.2s"
                size={{ base: 'sm', md: 'md' }}
              >
                Back
              </Button>
            </HStack>

            <VStack spacing={2} align="stretch">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  fontSize={{ base: 'lg', md: '2xl' }}
                  fontWeight="bold"
                  bg={colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.05)'}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                />
              ) : (
                <Heading size={{ base: 'md', md: 'lg' }} color={textPrimary}>{opportunity.title}</Heading>
              )}

              <HStack spacing={2} flexWrap="wrap">
                {isEditing ? (
                  <>
                    <Select
                      value={formData.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="sm"
                      width="auto"
                      minW="120px"
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
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="sm"
                      width="auto"
                      minW="120px"
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
                  </>
                ) : (
                  <>
                    <Badge colorScheme={getStageColor(opportunity.stage)}>
                      {opportunity.stage}
                    </Badge>
                    <Badge colorScheme={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority}
                    </Badge>
                  </>
                )}
              </HStack>
            </VStack>

            <HStack spacing={2} flexWrap="wrap">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    borderColor={cardBorder}
                    color={textPrimary}
                    size={{ base: 'sm', md: 'md' }}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<FiCheck />}
                    onClick={handleSave}
                    bg={primaryColor}
                    color="white"
                    size={{ base: 'sm', md: 'md' }}
                    _hover={{ bg: primaryHover }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  leftIcon={<FiEdit />}
                  onClick={() => setIsEditing(true)}
                  bg="rgba(255, 255, 255, 0.1)"
                  color={textPrimary}
                  size={{ base: 'sm', md: 'md' }}
                  _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                >
                  Edit
                </Button>
              )}
              <Button
                leftIcon={<FiTrash2 />}
                onClick={handleDelete}
                isLoading={deleting}
                colorScheme="red"
                variant="outline"
                size={{ base: 'sm', md: 'md' }}
              >
                Delete
              </Button>
            </HStack>
          </VStack>

          {/* Stats Cards */}
          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
            <GridItem>
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
                borderRadius="lg"
              >
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Value</StatLabel>
                    {isEditing ? (
                      <InputGroup size="lg">
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
                            _hover={{ borderColor: textSecondary }}
                            _focus={{
                              borderColor: primaryColor,
                              boxShadow: `0 0 0 1px ${primaryColor}`,
                            }}
                          />
                        </NumberInput>
                      </InputGroup>
                    ) : (
                      <StatNumber color={textPrimary}>
                        {formatCurrency(opportunity.value)}
                      </StatNumber>
                    )}
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
                borderRadius="lg"
              >
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Expected Revenue</StatLabel>
                    {isEditing ? (
                      <VStack align="stretch" spacing={2}>
                        <HStack>
                          <Text color={textPrimary} fontWeight="bold" fontSize="2xl">{formData.probability}%</Text>
                        </HStack>
                        <Slider
                          value={formData.probability}
                          onChange={(value) => handleInputChange('probability', value)}
                          min={0}
                          max={100}
                          step={5}
                        >
                          <SliderTrack bg={colorMode === 'light' ? 'gray.200' : 'rgba(255, 255, 255, 0.1)'}>
                            <SliderFilledTrack bg={primaryColor} />
                          </SliderTrack>
                          <SliderThumb boxSize={6}>
                            <Box color={primaryColor} as={FiDollarSign} />
                          </SliderThumb>
                        </Slider>
                        <Text fontSize="sm" color={textMuted}>
                          Expected: {formatCurrency(formData.value * formData.probability / 100)}
                        </Text>
                      </VStack>
                    ) : (
                      <>
                        <StatNumber color={textPrimary}>
                          {formatCurrency(opportunity.expectedRevenue)}
                        </StatNumber>
                        <StatHelpText color={textMuted}>
                          <VStack align="start" spacing={0}>
                            <Text>{opportunity.probability}% win probability</Text>
                            <Text fontSize="xs" opacity={0.8}>
                              {formatCurrency(opportunity.value)} × {opportunity.probability}%
                              {opportunity.paymentSchedule?.length > 0 && ` + scheduled`}
                              {opportunity.recurringPayment?.monthlyAmount > 0 && ` + recurring`}
                            </Text>
                          </VStack>
                        </StatHelpText>
                      </>
                    )}
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
                borderRadius="lg"
              >
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Expected Close</StatLabel>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _hover={{ borderColor: textSecondary }}
                        _focus={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }}
                      />
                    ) : (
                      <StatNumber fontSize="lg" color={textPrimary}>
                        {formatDate(opportunity.expectedCloseDate)}
                      </StatNumber>
                    )}
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card
                bg={cardGradientBg}
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                border="1px"
                borderColor={cardBorder}
                borderRadius="lg"
              >
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Activities</StatLabel>
                    <StatNumber color={textPrimary}>
                      {opportunity.taskCount + opportunity.meetingCount + opportunity.emailCount + opportunity.callCount}
                    </StatNumber>
                    <StatHelpText color={textMuted}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs">Tasks: {opportunity.taskCount || 0}</Text>
                        <Text fontSize="xs">Meetings: {opportunity.meetingCount || 0}</Text>
                        <Text fontSize="xs">Emails: {opportunity.emailCount || 0}</Text>
                        <Text fontSize="xs">Calls: {opportunity.callCount || 0}</Text>
                      </VStack>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Main Content Tabs */}
          <Tabs colorScheme="blue" isLazy>
            <TabList borderBottomColor={cardBorder} overflowX="auto" overflowY="hidden">
              <Tab color={textSecondary} fontSize={{ base: 'sm', md: 'md' }} _selected={{ color: primaryColor, borderColor: primaryColor }}>Overview</Tab>
              <Tab color={textSecondary} fontSize={{ base: 'sm', md: 'md' }} _selected={{ color: primaryColor, borderColor: primaryColor }}>Payment</Tab>
              <Tab color={textSecondary} fontSize={{ base: 'sm', md: 'md' }} _selected={{ color: primaryColor, borderColor: primaryColor }}>Team</Tab>
              <Tab color={textSecondary} fontSize={{ base: 'sm', md: 'md' }} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                Activities ({opportunity.taskCount + opportunity.meetingCount + opportunity.emailCount + opportunity.callCount})
              </Tab>
              <Tab color={textSecondary} fontSize={{ base: 'sm', md: 'md' }} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                Notes ({opportunity.noteCount || 0})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel px={0}>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
                  {/* Client Information */}
                  <GridItem>
                    <Card
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                    >
                      <CardHeader>
                        <Text fontWeight="bold" color={textPrimary}>Client Information</Text>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack>
                            <FiUser color={textSecondary} />
                            <Text color={textPrimary}>{opportunity.clientName}</Text>
                          </HStack>
                          {opportunity.clientEmail && (
                            <HStack>
                              <FiMail color={textSecondary} />
                              <Text color={textSecondary}>{opportunity.clientEmail}</Text>
                            </HStack>
                          )}
                          {opportunity.clientPhone && (
                            <HStack>
                              <FiPhone color={textSecondary} />
                              <Text color={textSecondary}>{opportunity.clientPhone}</Text>
                            </HStack>
                          )}
                          {isEditing && (
                            <Text color={textMuted} fontSize="xs" fontStyle="italic">
                              Note: Client cannot be changed after opportunity creation
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Opportunity Details */}
                  <GridItem>
                    <Card
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                    >
                      <CardHeader>
                        <Text fontWeight="bold" color={textPrimary}>Details</Text>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Text color={textMuted}>Source:</Text>
                            {isEditing ? (
                              <Select
                                value={formData.source}
                                onChange={(e) => handleInputChange('source', e.target.value)}
                                size="sm"
                                bg="rgba(255, 255, 255, 0.05)"
                                borderColor={cardBorder}
                                color={textPrimary}
                                _hover={{ borderColor: textSecondary }}
                                _focus={{
                                  borderColor: primaryColor,
                                  boxShadow: `0 0 0 1px ${primaryColor}`,
                                }}
                              >
                                <option value="">None</option>
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Email">Email Campaign</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Event">Event</option>
                                <option value="Partner">Partner</option>
                                <option value="Other">Other</option>
                              </Select>
                            ) : (
                              <Text color={textPrimary}>{opportunity.source || 'Not set'}</Text>
                            )}
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={textMuted}>Campaign:</Text>
                            {isEditing ? (
                              <Input
                                value={formData.campaign}
                                onChange={(e) => handleInputChange('campaign', e.target.value)}
                                placeholder="Campaign name"
                                size="sm"
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
                            ) : (
                              <Text color={textPrimary}>{opportunity.campaign || 'Not set'}</Text>
                            )}
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={textMuted}>Assigned to:</Text>
                            <Text color={textPrimary}>{opportunity.assignedToName || 'Unassigned'}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={textMuted}>Last activity:</Text>
                            <Text color={textPrimary}>{formatDate(opportunity.lastActivityDate)}</Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Description */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Card
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                    >
                      <CardHeader>
                        <Text fontWeight="bold" color={textPrimary}>Description</Text>
                      </CardHeader>
                      <CardBody>
                        {isEditing ? (
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
                        ) : (
                          <Text color={textSecondary}>
                            {opportunity.description || 'No description provided'}
                          </Text>
                        )}
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Internal Notes */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Card
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                    >
                      <CardHeader>
                        <Text fontWeight="bold" color={textPrimary}>Internal Notes</Text>
                      </CardHeader>
                      <CardBody>
                        {isEditing ? (
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
                        ) : (
                          <Text color={textSecondary}>
                            {opportunity.internalNotes || 'No internal notes'}
                          </Text>
                        )}
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Win Probability */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Card
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                    >
                      <CardHeader>
                        <Text fontWeight="bold" color={textPrimary}>Win Probability</Text>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch">
                          <HStack justify="space-between">
                            <Text color={textSecondary}>Chance of closing</Text>
                            <Text fontWeight="bold" color={textPrimary}>{opportunity.probability}%</Text>
                          </HStack>
                          <Progress
                            value={opportunity.probability}
                            colorScheme="blue"
                            borderRadius="full"
                            bg={colorMode === 'light' ? 'gray.200' : 'rgba(255, 255, 255, 0.1)'}
                          />
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Payment Tracking Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Edit/Save/Cancel Buttons */}
                  <HStack justify="flex-end" spacing={2}>
                    {isEditingPayments ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={cardBorder}
                          color={textPrimary}
                          onClick={handleCancelPayments}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FiCheck />}
                          bg={primaryColor}
                          color="white"
                          _hover={{ bg: primaryHover }}
                          onClick={handleSavePayments}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<FiEdit />}
                        bg="rgba(255, 255, 255, 0.1)"
                        color={textPrimary}
                        _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                        onClick={() => setIsEditingPayments(true)}
                      >
                        Edit Payment Details
                      </Button>
                    )}
                  </HStack>

                  {/* Payment Schedule */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color={textPrimary}>Payment Schedule</Text>
                        {!isEditingPayments && opportunity.totalScheduledAmount > 0 && (
                          <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                            Total: ${opportunity.totalScheduledAmount?.toLocaleString()}
                          </Badge>
                        )}
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {isEditingPayments ? (
                        <VStack spacing={4} align="stretch">
                          {paymentFormData.paymentSchedule.map((payment: any, index: number) => (
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
                                <Input
                                  placeholder="Description (e.g., Initial deposit)"
                                  value={payment.description}
                                  onChange={(e) => updatePaymentScheduleItem(index, 'description', e.target.value)}
                                  bg="rgba(255, 255, 255, 0.05)"
                                  borderColor={cardBorder}
                                  color={textPrimary}
                                />
                                <HStack spacing={4} width="full">
                                  <InputGroup flex="1">
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
                                  <Input
                                    type="date"
                                    value={payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => updatePaymentScheduleItem(index, 'dueDate', e.target.value)}
                                    flex="1"
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                  />
                                </HStack>
                                <Textarea
                                  placeholder="Notes (optional)"
                                  value={payment.notes || ''}
                                  onChange={(e) => updatePaymentScheduleItem(index, 'notes', e.target.value)}
                                  rows={2}
                                  bg="rgba(255, 255, 255, 0.05)"
                                  borderColor={cardBorder}
                                  color={textPrimary}
                                />
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
                        </VStack>
                      ) : opportunity.paymentSchedule && opportunity.paymentSchedule.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {opportunity.paymentSchedule.map((payment: any, index: number) => (
                            <Box key={index} p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" border="1px" borderColor={cardBorder}>
                              <HStack justify="space-between" mb={3}>
                                <VStack align="start" spacing={1}>
                                  <Text color={textPrimary} fontWeight="bold">{payment.description}</Text>
                                  <HStack spacing={4}>
                                    <HStack>
                                      <FiDollarSign color={textSecondary} />
                                      <Text color={textPrimary} fontSize="lg">${payment.amount.toLocaleString()}</Text>
                                    </HStack>
                                    <HStack>
                                      <FiCalendar color={textSecondary} />
                                      <Text color={textSecondary}>Due: {new Date(payment.dueDate).toLocaleDateString()}</Text>
                                    </HStack>
                                  </HStack>
                                  {payment.notes && <Text color={textMuted} fontSize="sm">{payment.notes}</Text>}
                                </VStack>
                                <VStack align="end">
                                  <Badge
                                    colorScheme={
                                      payment.status === 'PAID' ? 'green' :
                                      payment.status === 'OVERDUE' ? 'red' :
                                      payment.status === 'CANCELLED' ? 'gray' :
                                      'yellow'
                                    }
                                    fontSize="sm"
                                    px={2}
                                    py={1}
                                  >
                                    {payment.status}
                                  </Badge>
                                  {payment.paidDate && (
                                    <Text color={textMuted} fontSize="xs">
                                      Paid: {new Date(payment.paidDate).toLocaleDateString()}
                                    </Text>
                                  )}
                                  {payment.status !== 'PAID' && payment.status !== 'CANCELLED' && (
                                    <Button
                                      size="sm"
                                      leftIcon={<FiCheckCircle />}
                                      colorScheme="green"
                                      variant="outline"
                                      onClick={async () => {
                                        try {
                                          await updatePaymentStatus({
                                            variables: {
                                              opportunityId: opportunity.id,
                                              paymentIndex: index,
                                              status: 'PAID'
                                            }
                                          });
                                          toast({
                                            title: 'Payment marked as paid',
                                            status: 'success',
                                            duration: 3000,
                                            isClosable: true,
                                          });
                                          refetch();
                                        } catch (error: any) {
                                          toast({
                                            title: 'Failed to update payment status',
                                            description: error.message || 'An error occurred',
                                            status: 'error',
                                            duration: 5000,
                                            isClosable: true,
                                          });
                                        }
                                      }}
                                    >
                                      Mark as Paid
                                    </Button>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          ))}

                          {opportunity.totalPaidAmount > 0 && (
                            <HStack justify="space-between" pt={3} borderTop="1px" borderColor={cardBorder}>
                              <Text color={textPrimary} fontWeight="bold">Total Paid:</Text>
                              <Text color="green.400" fontSize="lg" fontWeight="bold">
                                ${opportunity.totalPaidAmount?.toLocaleString()}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      ) : (
                        <Text color={textMuted} textAlign="center">No payment schedule defined</Text>
                      )}
                    </CardBody>
                  </Card>

                  {/* Recurring Subscription */}
                  <Card
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                  >
                    <CardHeader>
                      <HStack>
                        <FiRefreshCcw color={primaryColor} />
                        <Text fontWeight="bold" color={textPrimary}>Recurring Subscription</Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {isEditingPayments ? (
                        <VStack spacing={4} align="stretch">
                          <FormControl>
                            <FormLabel color={textPrimary}>Monthly Amount (AUD)</FormLabel>
                            <InputGroup>
                              <InputLeftAddon bg="rgba(255, 255, 255, 0.1)" borderColor={cardBorder} color={textPrimary}>$</InputLeftAddon>
                              <NumberInput
                                value={paymentFormData.recurringPayment.monthlyAmount}
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
                              Subscription Probability: {paymentFormData.recurringPayment.probability}%
                            </FormLabel>
                            <Slider
                              value={paymentFormData.recurringPayment.probability}
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
                              value={paymentFormData.recurringPayment.description}
                              onChange={(e) => updateRecurringPayment('description', e.target.value)}
                              placeholder="e.g., Monthly maintenance"
                              bg="rgba(255, 255, 255, 0.05)"
                              borderColor={cardBorder}
                              color={textPrimary}
                            />
                          </FormControl>
                          <HStack spacing={4}>
                            <FormControl flex="1">
                              <FormLabel color={textPrimary}>Start Date</FormLabel>
                              <Input
                                type="date"
                                value={paymentFormData.recurringPayment.startDate ? new Date(paymentFormData.recurringPayment.startDate).toISOString().split('T')[0] : ''}
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
                                value={paymentFormData.recurringPayment.endDate ? new Date(paymentFormData.recurringPayment.endDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => updateRecurringPayment('endDate', e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                borderColor={cardBorder}
                                color={textPrimary}
                              />
                            </FormControl>
                          </HStack>
                        </VStack>
                      ) : opportunity.recurringPayment && opportunity.recurringPayment.monthlyAmount > 0 ? (
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Text color={textMuted}>Monthly Amount:</Text>
                            <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                              ${opportunity.recurringPayment.monthlyAmount.toLocaleString()}/month
                            </Text>
                          </HStack>

                          {opportunity.recurringPayment.description && (
                            <HStack justify="space-between">
                              <Text color={textMuted}>Description:</Text>
                              <Text color={textPrimary}>{opportunity.recurringPayment.description}</Text>
                            </HStack>
                          )}

                          <HStack justify="space-between">
                            <Text color={textMuted}>Probability:</Text>
                            <Badge colorScheme="blue" fontSize="sm">
                              {opportunity.recurringPayment.probability}%
                            </Badge>
                          </HStack>

                          {opportunity.recurringPayment.startDate && (
                            <HStack justify="space-between">
                              <Text color={textMuted}>Start Date:</Text>
                              <Text color={textPrimary}>
                                {new Date(opportunity.recurringPayment.startDate).toLocaleDateString()}
                              </Text>
                            </HStack>
                          )}

                          {opportunity.recurringPayment.endDate && (
                            <HStack justify="space-between">
                              <Text color={textMuted}>End Date:</Text>
                              <Text color={textPrimary}>
                                {new Date(opportunity.recurringPayment.endDate).toLocaleDateString()}
                              </Text>
                            </HStack>
                          )}

                          <Box pt={3} borderTop="1px" borderColor={cardBorder}>
                            <Text color={textMuted} fontSize="sm">
                              Projected Annual Value: ${(opportunity.recurringPayment.monthlyAmount * 12 * opportunity.recurringPayment.probability / 100).toLocaleString()}
                            </Text>
                          </Box>
                        </VStack>
                      ) : (
                        <Text color={textMuted} textAlign="center">No recurring subscription defined</Text>
                      )}
                    </CardBody>
                  </Card>

                  {/* Total Value Summary */}
                  {opportunity.projectedTotalValue > 0 && (
                    <Card
                      bg={primaryColor}
                      bgGradient="linear(to-r, brand.500, brand.600)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      borderRadius="lg"
                    >
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Text color="white" fontWeight="bold" fontSize="xl">
                            Total Projected Value
                          </Text>
                          <Text color="white" fontSize="3xl" fontWeight="bold">
                            ${opportunity.projectedTotalValue?.toLocaleString()}
                          </Text>
                          <VStack align="start" spacing={1}>
                            <Text color="whiteAlpha.900" fontSize="sm">
                              • One-off: ${(opportunity.value * opportunity.probability / 100).toLocaleString()}
                            </Text>
                            {opportunity.totalScheduledAmount > 0 && (
                              <Text color="whiteAlpha.900" fontSize="sm">
                                • Scheduled: ${opportunity.totalScheduledAmount.toLocaleString()}
                              </Text>
                            )}
                            {opportunity.recurringPayment?.monthlyAmount > 0 && (
                              <Text color="whiteAlpha.900" fontSize="sm">
                                • Recurring: ${(opportunity.recurringPayment.monthlyAmount * 12).toLocaleString()}/year
                              </Text>
                            )}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              {/* Team & Splits Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Team Members Management */}
                  <OpportunityMembers
                    opportunityId={id!}
                    onMembersUpdate={() => {
                      refetch();
                      refetchMembers();
                    }}
                  />

                  {/* One-off Payment Value Split - Always Show if there's a value */}
                  {opportunity.value > 0 && (
                    <Card
                      bg={cardGradientBg}
                      borderColor={cardBorder}
                      borderWidth="1px"
                      boxShadow="sm"
                      overflow="hidden"
                    >
                      <CardHeader bg={cardHeaderBg} borderBottom={`1px solid ${cardBorder}`}>
                        <HStack justify="space-between">
                          <Heading size="md" color={textPrimary}>
                            One-off Payment Commission Split
                          </Heading>
                          <Badge colorScheme="blue" fontSize="md">
                            ${opportunity.value.toLocaleString()}
                          </Badge>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        {membersData?.opportunityMembers && membersData.opportunityMembers.length > 0 ? (
                          <PaymentSplits
                            opportunityId={id || ''}
                            paymentType="oneoff"
                            paymentAmount={opportunity.value}
                            paymentStatus={opportunity.valuePaymentStatus}
                            receivedDate={opportunity.valueReceivedDate}
                            members={membersData.opportunityMembers}
                            currentSplits={opportunity.valueMemberSplits}
                            onSplitsUpdate={(splits) => {
                              updateOpportunity({
                                variables: {
                                  id,
                                  input: { valueMemberSplits: splits }
                                }
                              }).then(() => {
                                refetch();
                              });
                            }}
                            onPaymentStatusUpdate={() => {
                              refetch();
                            }}
                          />
                        ) : (
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Text>Add team members above to configure commission splits for this payment</Text>
                          </Alert>
                        )}
                      </CardBody>
                    </Card>
                  )}

                  {/* Other Payment Types Splits - Will implement later */}
                  {(opportunity.paymentSchedule?.length > 0 ||
                    opportunity.recurringPayment) && (
                    <Card
                      bg={cardGradientBg}
                      borderColor={cardBorder}
                      borderWidth="1px"
                      boxShadow="sm"
                      overflow="hidden"
                    >
                      <CardHeader bg={cardHeaderBg} borderBottom={`1px solid ${cardBorder}`}>
                        <Heading size="md" color={textPrimary}>Other Payment Types</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {/* Payment Schedule Splits */}
                          {opportunity.paymentSchedule?.map((payment: any, index: number) => (
                            <PaymentSplits
                              key={index}
                              opportunityId={id || ''}
                              paymentType="schedule"
                              paymentAmount={payment.amount}
                              paymentLabel={`${index}`}
                              paymentStatus={payment.paymentStatus}
                              receivedDate={payment.receivedDate}
                              members={membersData?.opportunityMembers || []}
                              currentSplits={payment.memberSplits}
                              onSplitsUpdate={(splits) => {
                                const updatedSchedule = opportunity.paymentSchedule.map((p: any, i: number) => {
                                  if (i === index) {
                                    // Only include fields expected by PaymentScheduleInput
                                    return {
                                      description: p.description,
                                      amount: p.amount,
                                      dueDate: p.dueDate,
                                      status: p.status,
                                      paidDate: p.paidDate,
                                      notes: p.notes,
                                      memberSplits: splits
                                    };
                                  }
                                  // Keep other payments with only expected fields
                                  return {
                                    description: p.description,
                                    amount: p.amount,
                                    dueDate: p.dueDate,
                                    status: p.status,
                                    paidDate: p.paidDate,
                                    notes: p.notes,
                                    memberSplits: p.memberSplits
                                  };
                                });
                                updateOpportunity({
                                  variables: {
                                    id,
                                    input: { paymentSchedule: updatedSchedule }
                                  }
                                }).then(() => {
                                  refetch();
                                });
                              }}
                              onPaymentStatusUpdate={() => {
                                refetch();
                              }}
                            />
                          ))}

                          {/* Recurring Payment Split */}
                          {opportunity.recurringPayment && (
                            <PaymentSplits
                              opportunityId={id || ''}
                              paymentType="recurring"
                              paymentAmount={opportunity.recurringPayment.monthlyAmount}
                              paymentStatus={opportunity.recurringPayment.paymentStatus}
                              receivedDate={opportunity.recurringPayment.lastPaymentDate}
                              members={membersData?.opportunityMembers || []}
                              currentSplits={opportunity.recurringPayment.memberSplits}
                              onSplitsUpdate={(splits) => {
                                updateOpportunity({
                                  variables: {
                                    id,
                                    input: {
                                      recurringPayment: {
                                        monthlyAmount: opportunity.recurringPayment.monthlyAmount,
                                        probability: opportunity.recurringPayment.probability,
                                        description: opportunity.recurringPayment.description,
                                        startDate: opportunity.recurringPayment.startDate,
                                        endDate: opportunity.recurringPayment.endDate,
                                        memberSplits: splits
                                      }
                                    }
                                  }
                                }).then(() => {
                                  refetch();
                                });
                              }}
                              onPaymentStatusUpdate={() => {
                                refetch();
                              }}
                            />
                          )}

                          {/* No payments configured */}
                          {!opportunity.value &&
                           (!opportunity.paymentSchedule || opportunity.paymentSchedule.length === 0) &&
                           !opportunity.recurringPayment && (
                            <Alert status="info" borderRadius="md">
                              <AlertIcon />
                              <Text>Configure payment details in the Payment Tracking tab to set up commission splits</Text>
                            </Alert>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              {/* Activities Tab */}
              <TabPanel px={0}>
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList mb={4}>
                    <Tab>Tasks</Tab>
                    <Tab>Meetings</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <OpportunityTasks opportunityId={opportunity.id} />
                    </TabPanel>
                    <TabPanel px={0}>
                      <OpportunityMeetings opportunityId={opportunity.id} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel px={0}>
                <OpportunityNotes opportunityId={opportunity.id} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default OpportunityDetail;