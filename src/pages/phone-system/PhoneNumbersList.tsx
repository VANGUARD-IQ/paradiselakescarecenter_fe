import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useDisclosure,
  Code,
  useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { EditIcon, DeleteIcon, PhoneIcon, AddIcon, SearchIcon, RepeatIcon, WarningIcon, CheckCircleIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import phoneSystemModuleConfig from './moduleConfig';

// GraphQL Queries and Mutations
const GET_PHONE_NUMBERS = gql`
  query GetPhoneNumbers {
    phoneNumbers {
      id
      phoneNumber
      friendlyName
      forwardToNumber
      status
      capabilities
      recordCalls
      autoTranscribe
      monthlyCost
      currency
      locality
      region
      purchasedAt
      lastUsedAt
    }
  }
`;

const SEARCH_AVAILABLE_NUMBERS = gql`
  query SearchAvailablePhoneNumbers(
    $country: String!
    $areaCode: String
    $contains: String
    $capabilities: [PhoneCapability!]
    $limit: Int
  ) {
    searchAvailablePhoneNumbers(
      country: $country
      areaCode: $areaCode
      contains: $contains
      capabilities: $capabilities
      limit: $limit
    ) {
      phoneNumber
      friendlyName
      locality
      region
      capabilities
      monthlyCost
      currency
    }
  }
`;

const PURCHASE_PHONE_NUMBER = gql`
  mutation PurchasePhoneNumber($input: PurchasePhoneNumberInput!) {
    purchasePhoneNumber(input: $input) {
      id
      phoneNumber
      friendlyName
      status
    }
  }
`;

const UPDATE_PHONE_NUMBER = gql`
  mutation UpdatePhoneNumber($id: ID!, $input: TwilioPhoneNumberInput!) {
    updatePhoneNumber(id: $id, input: $input) {
      id
      phoneNumber
      friendlyName
      forwardToNumber
      recordCalls
      autoTranscribe
    }
  }
`;

const RELEASE_PHONE_NUMBER = gql`
  mutation ReleasePhoneNumber($id: ID!) {
    releasePhoneNumber(id: $id)
  }
`;

const SYNC_TWILIO_NUMBERS = gql`
  mutation SyncTwilioNumbers {
    syncTwilioNumbers {
      id
      phoneNumber
      friendlyName
      status
    }
  }
`;

export const PhoneNumbersList: React.FC = () => {
  usePageTitle("Phone Numbers");
  const navigate = useNavigate();
  const toast = useToast();
  const apolloClient = useApolloClient();
  const { isOpen: isPurchaseOpen, onOpen: onPurchaseOpen, onClose: onPurchaseClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { colorMode } = useColorMode();

  // Brand styling variables
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);
  const successGreen = getColor("successGreen", colorMode);
  const errorRed = getColor("status.error", colorMode);
  const infoBlue = getColor("status.info", colorMode);
  const warningColor = getColor("status.warning", colorMode);
  const purpleAccent = getColor("purpleAccent", colorMode);
  
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [searchParams, setSearchParams] = useState({
    country: "AU",
    areaCode: "",
    contains: "",
  });
  const [purchaseForm, setPurchaseForm] = useState({
    phoneNumber: "",
    friendlyName: "",
    forwardToNumber: "",
    recordCalls: true,
    autoTranscribe: true,
  });
  const [editForm, setEditForm] = useState({
    forwardToNumber: "",
    recordCalls: true,
    autoTranscribe: true,
  });
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Queries
  const { data, loading, refetch } = useQuery(GET_PHONE_NUMBERS);

  // Mutations
  const [purchasePhoneNumber] = useMutation(PURCHASE_PHONE_NUMBER, {
    onCompleted: () => {
      toast({
        title: "Phone number purchased successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onPurchaseClose();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to purchase phone number",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updatePhoneNumber] = useMutation(UPDATE_PHONE_NUMBER, {
    onCompleted: () => {
      toast({
        title: "Phone number updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onEditClose();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to update phone number",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [syncTwilioNumbers, { loading: syncing }] = useMutation(SYNC_TWILIO_NUMBERS, {
    onCompleted: (data) => {
      console.log('✅ Sync completed successfully:', data);
      const numberCount = data?.syncTwilioNumbers?.length || 0;
      toast({
        title: "Phone numbers synced successfully",
        description: `Found and synced ${numberCount} phone number(s)`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      console.error('❌ Sync failed:', error);
      console.error('Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
      
      // Provide more detailed error message
      let errorMessage = error.message;
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid Twilio credentials. Please check your Account SID and Auth Token in tenant settings.';
      } else if (error.message.includes('not configured')) {
        errorMessage = 'Twilio credentials not configured. Please add them in tenant settings.';
      }
      
      toast({
        title: "Failed to sync phone numbers",
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    },
  });

  const [releasePhoneNumber] = useMutation(RELEASE_PHONE_NUMBER, {
    onCompleted: () => {
      toast({
        title: "Phone number released successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to release phone number",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSearchAvailableNumbers = async () => {
    setIsSearching(true);
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_AVAILABLE_NUMBERS,
        variables: {
          country: searchParams.country,
          areaCode: searchParams.areaCode || undefined,
          contains: searchParams.contains || undefined,
          capabilities: ["VOICE"],
          limit: 10,
        },
      });
      setAvailableNumbers(data.searchAvailablePhoneNumbers);
    } catch (error) {
      toast({
        title: "Failed to search available numbers",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectNumber = (number: any) => {
    setPurchaseForm({
      ...purchaseForm,
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
    });
  };

  const handlePurchase = () => {
    purchasePhoneNumber({
      variables: {
        input: purchaseForm,
      },
    });
  };

  const handleEdit = (phoneNumber: any) => {
    setSelectedNumber(phoneNumber);
    setEditForm({
      forwardToNumber: phoneNumber.forwardToNumber || "",
      recordCalls: phoneNumber.recordCalls,
      autoTranscribe: phoneNumber.autoTranscribe,
    });
    onEditOpen();
  };

  const handleUpdate = () => {
    if (selectedNumber) {
      updatePhoneNumber({
        variables: {
          id: selectedNumber.id,
          input: editForm,
        },
      });
    }
  };

  const handleRelease = (id: string) => {
    if (window.confirm("Are you sure you want to release this phone number? This action cannot be undone.")) {
      releasePhoneNumber({
        variables: { id },
      });
    }
  };

  const formatPhoneNumber = (number: string) => {
    // Format phone number for better readability
    if (number.startsWith("+61")) {
      return number.replace(/(\+61)(\d)(\d{4})(\d{4})/, "$1 $2 $3 $4");
    }
    return number;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "red";
      case "PENDING":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />
        <Container maxW={{ base: "container.sm", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
          <VStack spacing={8}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading phone numbers...</Text>
          </VStack>
        </Container>
        <Box position="sticky" bottom={0} zIndex={10}>
          <FooterWithFourColumns />
        </Box>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />

      <Container maxW={{ base: "container.sm", lg: "container.xl" }} px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <VStack align="start" spacing={2}>
              <Heading size={{ base: "md", md: "lg" }} color={textPrimary} fontFamily={brandConfig.fonts.heading}>📞 Phone System</Heading>
              <Text color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Manage your phone numbers and call settings</Text>
            </VStack>
            <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
              <Button
                leftIcon={<AddIcon />}
                bg={primaryColor}
                color="white"
                _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                fontWeight="semibold"
                onClick={onPurchaseOpen}
                width={{ base: "100%", md: "auto" }}
                minW={{ md: "160px" }}
              >
                Purchase Number
              </Button>
            </Box>
          </VStack>

          {/* Twilio Configuration Status Card */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardHeader>
              <VStack spacing={4} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>Twilio Configuration</Heading>
                <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                  <Button
                    leftIcon={<RepeatIcon />}
                    size={{ base: "md", md: "sm" }}
                    onClick={async () => {
                      console.log('🔄 Starting Twilio sync...');
                      console.log('Tenant ID:', brandConfig.tenantId || localStorage.getItem('tenantId'));
                      try {
                        const result = await syncTwilioNumbers();
                        console.log('Sync result:', result);
                      } catch (error) {
                        console.error('Direct error catch:', error);
                      }
                    }}
                    isLoading={syncing}
                    variant="outline"
                    colorScheme="blue"
                    width={{ base: "100%", md: "auto" }}
                  >
                    Sync Numbers
                  </Button>
                </Box>
              </VStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Configuration Instructions */}
                <Alert status="info" variant="subtle" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Heading size="sm" color={textPrimary} mb={2}>📋 Step-by-Step Twilio Configuration</Heading>
                        <Text fontSize="sm" color={textMuted}>Follow these exact steps in your Twilio Console:</Text>
                      </Box>
                      
                      <Box bg="rgba(0,0,0,0.2)" p={3} borderRadius="md">
                        <Text fontWeight="bold" fontSize="sm" mb={2}>Step 1: Open Twilio Console</Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="solid"
                          rightIcon={<ExternalLinkIcon />}
                          onClick={() => window.open('https://console.twilio.com/us1/develop/phone-numbers/manage/incoming', '_blank')}
                        >
                          Open Twilio Phone Numbers
                        </Button>
                      </Box>

                      <Box bg="rgba(0,0,0,0.2)" p={3} borderRadius="md">
                        <Text fontWeight="bold" fontSize="sm" mb={2}>Step 2: Click on your phone number (+61468003978)</Text>
                        <Text fontSize="xs" color={textMuted}>This opens the number configuration page</Text>
                      </Box>

                      <Box bg="rgba(0,0,0,0.2)" p={3} borderRadius="md">
                        <Text fontWeight="bold" fontSize="sm" mb={2}>Step 3: Configure Voice Settings</Text>
                        <Text fontSize="xs" color={textMuted} mb={2}>In the "Voice Configuration" section:</Text>
                        <VStack align="stretch" spacing={2} pl={2}>
                          <Text fontSize="xs">1️⃣ Set "Configure with" to <Code>Webhook</Code></Text>
                          <Text fontSize="xs">2️⃣ Set "A call comes in" to <Code>Webhook</Code></Text>
                          <Text fontSize="xs">3️⃣ Paste the Voice URL below and set to <Code>HTTP POST</Code></Text>
                          <Text fontSize="xs" color="green.400">✅ That's it! Recording is handled automatically</Text>
                        </VStack>
                        <Alert status="info" size="sm" mt={2}>
                          <AlertIcon />
                          <Text fontSize="xs">
                            <strong>Note:</strong> Recording callbacks are configured automatically when calls are made. You don't need to set the Recording URL in Twilio.
                          </Text>
                        </Alert>
                      </Box>

                      <Text fontWeight="bold" fontSize="sm" color={textPrimary}>Voice Webhook URL:</Text>
                      <VStack align="stretch" spacing={3}>
                      {/* Voice Webhook - This is the only one you need to configure */}
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={1}>Copy this URL for "A call comes in":</Text>
                        <HStack>
                          <Input
                            value={`https://business-builder-backend-sy9bw.ondigitalocean.app/webhooks/twilio/voice/${brandConfig.tenantId || localStorage.getItem('tenantId')}`}
                            isReadOnly
                            size="sm"
                            fontFamily="monospace"
                          />
                          <IconButton
                            aria-label="Copy voice URL"
                            icon={<CopyIcon />}
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://business-builder-backend-sy9bw.ondigitalocean.app/webhooks/twilio/voice/${brandConfig.tenantId || localStorage.getItem('tenantId')}`
                              );
                              toast({
                                title: "Voice URL copied",
                                status: "success",
                                duration: 2000,
                              });
                            }}
                          />
                        </HStack>
                      </Box>
                    </VStack>
                    </VStack>
                    
                    <Divider my={3} />
                    
                    <Box bg="rgba(0,0,0,0.2)" p={3} borderRadius="md">
                      <Text fontWeight="bold" fontSize="sm" mb={2}>Step 4: Save Configuration</Text>
                      <VStack align="stretch" spacing={1}>
                        <Text fontSize="xs">• Scroll to the bottom of the Twilio page</Text>
                        <Text fontSize="xs">• Click the blue <Code>Save configuration</Code> button</Text>
                        <Text fontSize="xs" color="green.400" fontWeight="bold">✅ Your phone is now configured!</Text>
                      </VStack>
                    </Box>
                    
                    <Box bg="rgba(0,0,0,0.2)" p={3} borderRadius="md">
                      <Text fontWeight="bold" fontSize="sm" mb={2}>Step 5: Sync Numbers Here</Text>
                      <Text fontSize="xs" color={textMuted} mb={2}>After saving in Twilio, click Sync Numbers above to import your configuration</Text>
                    </Box>
                  </Box>
                </Alert>

                {/* Number Configuration Status */}
                {data?.phoneNumbers?.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2} color={textPrimary}>Configuration Status:</Text>
                    <VStack spacing={2} align="stretch">
                      {data.phoneNumbers.map((number: any) => (
                        <HStack key={number.id} justify="space-between" p={2} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" borderColor={cardBorder} border="1px solid">
                          <Text fontSize="sm" fontFamily="monospace" color={textPrimary}>{number.phoneNumber}</Text>
                          {number.status === "ACTIVE" ? (
                            <HStack spacing={1}>
                              <CheckCircleIcon color={successGreen} />
                              <Text fontSize="xs" color={successGreen}>Configured</Text>
                            </HStack>
                          ) : (
                            <HStack spacing={1}>
                              <WarningIcon color={warningColor} />
                              <Text fontSize="xs" color={warningColor}>Needs Configuration</Text>
                            </HStack>
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 4, md: 6 }}>
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
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Active Numbers</Text>
                  <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {data?.phoneNumbers?.filter((n: any) => n.status === "ACTIVE").length || 0}
                  </Text>
                </VStack>
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
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Monthly Cost</Text>
                  <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    ${data?.phoneNumbers?.reduce((sum: number, n: any) => sum + n.monthlyCost, 0).toFixed(2) || "0.00"}
                  </Text>
                </VStack>
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
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Recording Enabled</Text>
                  <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {data?.phoneNumbers?.filter((n: any) => n.recordCalls).length || 0}
                  </Text>
                </VStack>
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
                <VStack align="start">
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>Auto Transcribe</Text>
                  <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textPrimary}>
                    {data?.phoneNumbers?.filter((n: any) => n.autoTranscribe).length || 0}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Phone Numbers Table */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardHeader>
              <Heading size="md" color={textPrimary} fontFamily={brandConfig.fonts.heading}>Your Phone Numbers</Heading>
            </CardHeader>
            <CardBody>
              {data?.phoneNumbers?.length > 0 ? (
                <Box overflowX="auto" width="100%">
                  <Table variant="simple" size={{ base: "sm", md: "md" }} minWidth="800px">
                    <Thead position="sticky" top={0} bg={cardGradientBg}>
                      <Tr>
                        <Th color={textMuted} borderColor={cardBorder} minW="140px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Phone Number</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="120px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Name</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="120px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Forward To</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="80px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="80px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Recording</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="80px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Transcribe</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="80px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Cost</Th>
                        <Th color={textMuted} borderColor={cardBorder} minW="120px" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.phoneNumbers.map((number: any) => (
                        <Tr key={number.id}>
                          <Td fontFamily="monospace" color={textPrimary} borderColor={cardBorder} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }}>{formatPhoneNumber(number.phoneNumber)}</Td>
                          <Td color={textPrimary} borderColor={cardBorder} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>{number.friendlyName}</Td>
                          <Td color={textSecondary} borderColor={cardBorder} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>{number.forwardToNumber || "-"}</Td>
                          <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                            <Badge 
                              bg={getStatusColor(number.status) === "green" ? "rgba(34, 197, 94, 0.2)" : getStatusColor(number.status) === "red" ? "rgba(239, 68, 68, 0.2)" : "rgba(251, 191, 36, 0.2)"}
                              color={getStatusColor(number.status) === "green" ? successGreen : getStatusColor(number.status) === "red" ? errorRed : warningColor}
                              border="1px solid"
                              borderColor={getStatusColor(number.status) === "green" ? "rgba(34, 197, 94, 0.3)" : getStatusColor(number.status) === "red" ? "rgba(239, 68, 68, 0.3)" : "rgba(251, 191, 36, 0.3)"}
                              fontSize={{ base: "xs", md: "sm" }}
                              px={2}
                              py={1}
                            >
                              {number.status}
                            </Badge>
                          </Td>
                          <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                            <Badge 
                              bg={number.recordCalls ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                              color={number.recordCalls ? successGreen : textMuted}
                              border="1px solid"
                              borderColor={number.recordCalls ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                              fontSize={{ base: "xs", md: "sm" }}
                              px={2}
                              py={1}
                            >
                              {number.recordCalls ? "ON" : "OFF"}
                            </Badge>
                          </Td>
                          <Td borderColor={cardBorder} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                            <Badge 
                              bg={number.autoTranscribe ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
                              color={number.autoTranscribe ? successGreen : textMuted}
                              border="1px solid"
                              borderColor={number.autoTranscribe ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                              fontSize={{ base: "xs", md: "sm" }}
                              px={2}
                              py={1}
                            >
                              {number.autoTranscribe ? "ON" : "OFF"}
                            </Badge>
                          </Td>
                          <Td color={textSecondary} borderColor={cardBorder} px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>${number.monthlyCost}/mo</Td>
                          <Td borderColor={cardBorder} px={{ base: 2, md: 4 }}>
                            <VStack spacing={2} direction={{ base: "column", md: "row" }} minW={{ base: "80px", md: "120px" }}>
                              <IconButton
                                aria-label="Edit"
                                icon={<EditIcon />}
                                size={{ base: "sm", md: "sm" }}
                                onClick={() => handleEdit(number)}
                                bg="rgba(255, 255, 255, 0.1)"
                                color={textPrimary}
                                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                                minW="44px"
                                minH="44px"
                              />
                              <IconButton
                                aria-label="Release"
                                icon={<DeleteIcon />}
                                size={{ base: "sm", md: "sm" }}
                                onClick={() => handleRelease(number.id)}
                                bg={errorRed}
                                color="white"
                                _hover={{ bg: errorRed, opacity: 0.8 }}
                                minW="44px"
                                minH="44px"
                              />
                            </VStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Alert 
                  status="info"
                  bg="rgba(59, 130, 246, 0.1)"
                  borderColor="rgba(59, 130, 246, 0.3)"
                  border="1px solid"
                >
                  <AlertIcon color={infoBlue} />
                  <VStack align="start">
                    <Text color={textPrimary}>No phone numbers yet</Text>
                    <Text fontSize="sm" color={textSecondary}>Purchase your first phone number to get started with the phone system.</Text>
                  </VStack>
                </Alert>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Purchase Number Modal */}
      <Modal isOpen={isPurchaseOpen} onClose={onPurchaseClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Purchase Phone Number</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* Search Parameters */}
              <Card w="full">
                <CardBody>
                  <VStack spacing={4}>
                    <Heading size="sm">Search Available Numbers</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
                      <FormControl>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={searchParams.country}
                          onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
                        >
                          <option value="AU">Australia</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Area Code</FormLabel>
                        <Input
                          placeholder="e.g., 02"
                          value={searchParams.areaCode}
                          onChange={(e) => setSearchParams({ ...searchParams, areaCode: e.target.value })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Contains</FormLabel>
                        <Input
                          placeholder="e.g., 1234"
                          value={searchParams.contains}
                          onChange={(e) => setSearchParams({ ...searchParams, contains: e.target.value })}
                        />
                      </FormControl>
                    </SimpleGrid>
                    <Button
                      leftIcon={<SearchIcon />}
                      colorScheme="blue"
                      onClick={handleSearchAvailableNumbers}
                      isLoading={isSearching}
                      w="full"
                    >
                      Search Available Numbers
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Available Numbers */}
              {availableNumbers.length > 0 && (
                <Card w="full">
                  <CardBody>
                    <VStack spacing={4}>
                      <Heading size="sm">Available Numbers</Heading>
                      <VStack spacing={2} w="full">
                        {availableNumbers.map((number) => (
                          <HStack
                            key={number.phoneNumber}
                            p={3}
                            border="1px"
                            borderColor={purchaseForm.phoneNumber === number.phoneNumber ? "blue.500" : "gray.200"}
                            borderRadius="md"
                            w="full"
                            justify="space-between"
                            cursor="pointer"
                            onClick={() => handleSelectNumber(number)}
                            _hover={{ borderColor: "blue.300" }}
                          >
                            <VStack align="start">
                              <Text fontWeight="bold">{formatPhoneNumber(number.phoneNumber)}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {number.locality}, {number.region}
                              </Text>
                            </VStack>
                            <Text fontWeight="bold">${number.monthlyCost}/mo</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Configuration */}
              {purchaseForm.phoneNumber && (
                <Card w="full">
                  <CardBody>
                    <VStack spacing={4}>
                      <Heading size="sm">Configure Number</Heading>
                      <FormControl>
                        <FormLabel>Friendly Name</FormLabel>
                        <Input
                          value={purchaseForm.friendlyName}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, friendlyName: e.target.value })}
                          placeholder="e.g., Main Office"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Forward To (Optional)</FormLabel>
                        <Input
                          value={purchaseForm.forwardToNumber}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, forwardToNumber: e.target.value })}
                          placeholder="e.g., +61400000000"
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Record Calls</FormLabel>
                        <Switch
                          isChecked={purchaseForm.recordCalls}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, recordCalls: e.target.checked })}
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Auto Transcribe</FormLabel>
                        <Switch
                          isChecked={purchaseForm.autoTranscribe}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, autoTranscribe: e.target.checked })}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPurchaseClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handlePurchase}
              isDisabled={!purchaseForm.phoneNumber}
            >
              Purchase Number
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Number Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size={{ base: "full", md: "lg" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Phone Number</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Forward To</FormLabel>
                <Input
                  value={editForm.forwardToNumber}
                  onChange={(e) => setEditForm({ ...editForm, forwardToNumber: e.target.value })}
                  placeholder="e.g., +61400000000"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Record Calls</FormLabel>
                <Switch
                  isChecked={editForm.recordCalls}
                  onChange={(e) => setEditForm({ ...editForm, recordCalls: e.target.checked })}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Auto Transcribe</FormLabel>
                <Switch
                  isChecked={editForm.autoTranscribe}
                  onChange={(e) => setEditForm({ ...editForm, autoTranscribe: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};

