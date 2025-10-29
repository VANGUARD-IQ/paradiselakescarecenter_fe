import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Code,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { 
  PhoneIcon, 
  CheckCircleIcon, 
  EditIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import phoneSystemModuleConfig from './moduleConfig';

// GraphQL Queries and Mutations
const GET_MY_ASSIGNED_NUMBERS = gql`
  query GetMyAssignedPhoneNumbers {
    myAssignedPhoneNumbers {
      id
      phoneNumber
      friendlyName
      forwardToNumber
      status
      recordCalls
      autoTranscribe
      capabilities
      monthlyCost
      currency
      locality
      region
      isoCountry
      lastUsedAt
      isAssigned
      associatedClients
    }
  }
`;

const GET_ME = gql`
  query Me {
    me {
      id
      email
      fName
      lName
      phoneNumber
    }
  }
`;

const SETUP_CALL_FORWARDING = gql`
  mutation SetupCallForwarding($phoneNumberId: ID!, $forwardToNumber: String!, $recordCalls: Boolean) {
    setupCallForwarding(phoneNumberId: $phoneNumberId, forwardToNumber: $forwardToNumber, recordCalls: $recordCalls) {
      id
      phoneNumber
      forwardToNumber
      recordCalls
      status
    }
  }
`;

const DISABLE_CALL_FORWARDING = gql`
  mutation DisableCallForwarding($phoneNumberId: ID!) {
    disableCallForwarding(phoneNumberId: $phoneNumberId) {
      id
      phoneNumber
      forwardToNumber
      status
    }
  }
`;

const SYNC_TWILIO_NUMBERS = gql`
  mutation SyncTwilioNumbers {
    syncTwilioNumbers {
      id
      phoneNumber
      friendlyName
      status
      capabilities
    }
  }
`;

export const PhoneSystemDashboard: React.FC = () => {
  usePageTitle("Phone System Dashboard");
  const navigate = useNavigate();
  const toast = useToast();
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

  // State for each phone number's forwarding settings
  const [forwardingSettings, setForwardingSettings] = useState<Record<string, {
    forwardToNumber: string;
    recordCalls: boolean;
    isEditing: boolean;
  }>>({});

  // Queries
  const { data, loading, refetch } = useQuery(GET_MY_ASSIGNED_NUMBERS);
  const { data: userData } = useQuery(GET_ME);

  // Mutations
  const [setupCallForwarding, { loading: settingUp }] = useMutation(SETUP_CALL_FORWARDING, {
    onCompleted: (data) => {
      console.log('✅ Call forwarding setup successful:', data);
      toast({
        title: "Call forwarding activated",
        description: `Calls will now be forwarded to ${data.setupCallForwarding.forwardToNumber}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      console.error('❌ Call forwarding setup failed:', error);
      toast({
        title: "Setup failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [disableCallForwarding, { loading: disabling }] = useMutation(DISABLE_CALL_FORWARDING, {
    onCompleted: () => {
      toast({
        title: "Call forwarding disabled",
        description: "Calls will no longer be forwarded",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to disable",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [syncTwilioNumbers] = useMutation(SYNC_TWILIO_NUMBERS, {
    onCompleted: () => {
      toast({
        title: "Numbers synced",
        description: "Phone numbers have been synced with Twilio",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Initialize forwarding settings when data loads
  useEffect(() => {
    if (data?.myAssignedPhoneNumbers) {
      const settings: typeof forwardingSettings = {};
      data.myAssignedPhoneNumbers.forEach((number: any) => {
        settings[number.id] = {
          forwardToNumber: number.forwardToNumber || "",
          recordCalls: number.recordCalls ?? true,
          isEditing: false,
        };
      });
      setForwardingSettings(settings);
    }
  }, [data]);

  const handleSetupForwarding = async (phoneId: string) => {
    const settings = forwardingSettings[phoneId];
    if (!settings?.forwardToNumber) {
      toast({
        title: "Missing phone number",
        description: "Please enter a phone number to forward calls to",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log('🔧 Setting up call forwarding:', {
      phoneId,
      forwardTo: settings.forwardToNumber,
      recordCalls: settings.recordCalls
    });

    await setupCallForwarding({
      variables: {
        phoneNumberId: phoneId,
        forwardToNumber: settings.forwardToNumber,
        recordCalls: settings.recordCalls,
      },
    });

    // Exit edit mode
    setForwardingSettings(prev => ({
      ...prev,
      [phoneId]: { ...prev[phoneId], isEditing: false }
    }));
  };

  const handleDisableForwarding = async (phoneId: string) => {
    console.log('🔧 Disabling call forwarding for:', phoneId);
    await disableCallForwarding({
      variables: { phoneNumberId: phoneId },
    });
  };

  const formatPhoneNumber = (number: string) => {
    if (!number) return "";
    if (number.startsWith("+61")) {
      return number.replace(/(\+61)(\d)(\d{4})(\d{4})/, "$1 $2 $3 $4");
    }
    if (number.startsWith("+1")) {
      return number.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
    }
    return number;
  };

  if (loading) {
    return (
      <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />
        <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} py={8} flex="1">
          <VStack spacing={8}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading your phone numbers...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const assignedNumbers = data?.myAssignedPhoneNumbers || [];

  return (
    <Box minHeight="100vh" bg={bgMain} display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />

      <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.xl" }} py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }} flex="1">
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          {/* Header */}
          <VStack align="start" spacing={2}>
            <Heading size={{ base: "lg", md: "xl" }} color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              📞 Your Phone System
            </Heading>
            <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
              Manage call forwarding for your assigned business phone numbers
            </Text>
          </VStack>

          {/* No Numbers Alert */}
          {assignedNumbers.length === 0 && (
            <Alert 
              status="warning" 
              bg="rgba(251, 146, 60, 0.1)"
              borderColor="rgba(251, 146, 60, 0.3)"
              border="1px solid"
              borderRadius="lg"
            >
              <AlertIcon color={warningColor} />
              <Box>
                <AlertTitle color={textPrimary}>No Phone Numbers Assigned</AlertTitle>
                <AlertDescription color={textSecondary}>
                  You don't have any phone numbers assigned to your account yet. 
                  Please contact your administrator to get a phone number assigned.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Assigned Numbers Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
            {assignedNumbers.map((phoneNumber: any) => {
              const settings = forwardingSettings[phoneNumber.id] || {
                forwardToNumber: "",
                recordCalls: true,
                isEditing: false,
              };

              return (
                <Card
                  key={phoneNumber.id}
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                  borderRadius="lg"
                >
                  <CardHeader borderBottom="1px" borderColor={cardBorder}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color={textPrimary}>
                          {formatPhoneNumber(phoneNumber.phoneNumber)}
                        </Heading>
                        <Text fontSize="sm" color={textMuted}>
                          {phoneNumber.friendlyName || phoneNumber.locality || "Business Number"}
                        </Text>
                      </VStack>
                      <Badge
                        bg={phoneNumber.forwardToNumber ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 146, 60, 0.2)"}
                        color={phoneNumber.forwardToNumber ? successGreen : warningColor}
                        border="1px solid"
                        borderColor={phoneNumber.forwardToNumber ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 146, 60, 0.3)"}
                      >
                        {phoneNumber.forwardToNumber ? "Forwarding Active" : "Not Configured"}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {/* Current Status */}
                      {phoneNumber.forwardToNumber && !settings.isEditing && (
                        <Box p={3} bg="rgba(34, 197, 94, 0.1)" borderRadius="md" border="1px solid" borderColor="rgba(34, 197, 94, 0.3)">
                          <HStack spacing={2}>
                            <CheckCircleIcon color={successGreen} />
                            <Text color={textPrimary} fontSize="sm">
                              Forwarding to: <Code color={successGreen}>{formatPhoneNumber(phoneNumber.forwardToNumber)}</Code>
                            </Text>
                          </HStack>
                          {phoneNumber.recordCalls && (
                            <Text color={textMuted} fontSize="xs" mt={1} ml={6}>
                              📹 Call recording enabled
                            </Text>
                          )}
                        </Box>
                      )}

                      {/* Edit Form - Show automatically if not configured */}
                      {(settings.isEditing || !phoneNumber.forwardToNumber) ? (
                        <VStack spacing={3} align="stretch">
                          <FormControl>
                            <FormLabel color={textPrimary} fontSize="sm">Forward calls to:</FormLabel>
                            <VStack spacing={2} align="stretch">
                              {/* Quick option to use own phone number */}
                              {userData?.me?.phoneNumber && !settings.forwardToNumber && (
                                <Button
                                  size="sm"
                                  variant="solid"
                                  colorScheme="purple"
                                  leftIcon={<PhoneIcon />}
                                  onClick={() => setForwardingSettings(prev => ({
                                    ...prev,
                                    [phoneNumber.id]: { 
                                      ...prev[phoneNumber.id], 
                                      forwardToNumber: userData.me.phoneNumber,
                                      recordCalls: true,
                                      isEditing: true
                                    }
                                  }))}
                                  bg={primaryColor}
                                  color="white"
                                  _hover={{ bg: primaryHover }}
                                  width="full"
                                >
                                  Quick Setup: Forward to my number ({formatPhoneNumber(userData.me.phoneNumber)})
                                </Button>
                              )}
                              
                              {(settings.forwardToNumber || !userData?.me?.phoneNumber) && (
                                <>
                                  <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                      <PhoneIcon color={textMuted} />
                                    </InputLeftElement>
                                    <Input
                                      placeholder="+61 4XX XXX XXX"
                                      value={settings.forwardToNumber}
                                      onChange={(e) => setForwardingSettings(prev => ({
                                        ...prev,
                                        [phoneNumber.id]: { ...prev[phoneNumber.id], forwardToNumber: e.target.value }
                                      }))}
                                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
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
                                  {userData?.me?.phoneNumber && settings.forwardToNumber && (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      colorScheme="purple"
                                      leftIcon={<PhoneIcon />}
                                      onClick={() => setForwardingSettings(prev => ({
                                        ...prev,
                                        [phoneNumber.id]: { 
                                          ...prev[phoneNumber.id], 
                                          forwardToNumber: userData.me.phoneNumber 
                                        }
                                      }))}
                                      borderColor={primaryColor}
                                      color={primaryColor}
                                      _hover={{ bg: "rgba(139, 92, 246, 0.1)" }}
                                    >
                                      Use my phone number ({formatPhoneNumber(userData.me.phoneNumber)})
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              <Text fontSize="xs" color={textMuted}>
                                {userData?.me?.phoneNumber ? 
                                  "Choose quick setup or enter a different number" : 
                                  "Enter the phone number where calls should be forwarded"}
                              </Text>
                            </VStack>
                          </FormControl>

                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor={`record-${phoneNumber.id}`} mb="0" color={textPrimary} fontSize="sm">
                              Record calls
                            </FormLabel>
                            <Switch
                              id={`record-${phoneNumber.id}`}
                              isChecked={settings.recordCalls}
                              onChange={(e) => setForwardingSettings(prev => ({
                                ...prev,
                                [phoneNumber.id]: { ...prev[phoneNumber.id], recordCalls: e.target.checked }
                              }))}
                              colorScheme="blue"
                            />
                          </FormControl>

                          {/* Action Buttons */}
                          {settings.forwardToNumber && (
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                onClick={() => handleSetupForwarding(phoneNumber.id)}
                                isLoading={settingUp}
                                loadingText="Setting up..."
                                bg={primaryColor}
                                color="white"
                                _hover={{ bg: primaryHover }}
                                flex={1}
                                isDisabled={!settings.forwardToNumber}
                              >
                                Save & Activate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setForwardingSettings(prev => ({
                                  ...prev,
                                  [phoneNumber.id]: { 
                                    ...prev[phoneNumber.id], 
                                    isEditing: false,
                                    forwardToNumber: phoneNumber.forwardToNumber || "",
                                    recordCalls: phoneNumber.recordCalls || true
                                  }
                                }))}
                                borderColor={cardBorder}
                                color={textSecondary}
                                flex={1}
                              >
                                Cancel
                              </Button>
                            </HStack>
                          )}
                        </VStack>
                      ) : (
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<EditIcon />}
                            onClick={() => setForwardingSettings(prev => ({
                              ...prev,
                              [phoneNumber.id]: { 
                                ...prev[phoneNumber.id], 
                                isEditing: true,
                                forwardToNumber: phoneNumber.forwardToNumber || "",
                                recordCalls: phoneNumber.recordCalls !== false
                              }
                            }))}
                            variant="outline"
                            borderColor={cardBorder}
                            color={textSecondary}
                            _hover={{ borderColor: primaryColor, color: primaryColor }}
                            flex={1}
                          >
                            Edit Forwarding
                          </Button>
                          {phoneNumber.forwardToNumber && (
                            <Button
                              size="sm"
                              onClick={() => handleDisableForwarding(phoneNumber.id)}
                              isLoading={disabling}
                              variant="outline"
                              borderColor={errorRed}
                              color={errorRed}
                              _hover={{ bg: "rgba(239, 68, 68, 0.1)" }}
                              flex={1}
                            >
                              Disable
                            </Button>
                          )}
                        </HStack>
                      )}

                      {/* Quick Actions */}
                      <Divider borderColor={cardBorder} />
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/phone-system/recordings')}
                          color={textSecondary}
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                          flex={1}
                        >
                          View Recordings
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/phone-system/call')}
                          color={textSecondary}
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                          flex={1}
                        >
                          Make Call
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* System Status */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <HStack justify="space-between">
                <Heading size="md" color={textPrimary}>🛠️ System Status</Heading>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncTwilioNumbers()}
                  leftIcon={<RepeatIcon />}
                  borderColor={cardBorder}
                  color={textSecondary}
                  _hover={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Sync Numbers
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Stat>
                  <StatLabel color={textMuted}>Total Numbers</StatLabel>
                  <StatNumber color={textPrimary}>{assignedNumbers.length}</StatNumber>
                  <StatHelpText color={textMuted}>Assigned to you</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel color={textMuted}>Active Forwarding</StatLabel>
                  <StatNumber color={successGreen}>
                    {assignedNumbers.filter((n: any) => n.forwardToNumber).length}
                  </StatNumber>
                  <StatHelpText color={textMuted}>Numbers configured</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel color={textMuted}>Recording Status</StatLabel>
                  <StatNumber color={infoBlue}>
                    {assignedNumbers.filter((n: any) => n.recordCalls).length}
                  </StatNumber>
                  <StatHelpText color={textMuted}>With recording enabled</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Help Section */}
          <Alert
            status="info"
            bg="rgba(59, 130, 246, 0.1)"
            borderColor="rgba(59, 130, 246, 0.3)"
            border="1px solid"
            borderRadius="lg"
          >
            <AlertIcon color={infoBlue} />
            <Box>
              <AlertTitle color={textPrimary}>How Call Forwarding Works</AlertTitle>
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="sm" color={textSecondary}>
                  1. When someone calls your business number, our system receives the call
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  2. The call is automatically forwarded to your configured number
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  3. The caller sees your business number as the caller ID
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  4. If recording is enabled, the call is recorded and available in the recordings page
                </Text>
              </VStack>
            </Box>
          </Alert>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};