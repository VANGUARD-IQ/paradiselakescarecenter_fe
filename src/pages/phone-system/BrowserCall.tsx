import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Text,
  Card,
  CardBody,
  CardHeader,
  useToast,
  HStack,
  Badge,
  Icon,
  IconButton,
  Divider,
  Select,
  Spinner,
  SimpleGrid,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiDelete } from 'react-icons/fi';
import { Device, Call } from '@twilio/voice-sdk';
import { useLazyQuery, useQuery, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import phoneSystemModuleConfig from './moduleConfig';

// Animations from FloatingNavbar
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(54, 158, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(54, 158, 255, 0.8), 0 0 40px rgba(54, 158, 255, 0.4); }
  100% { box-shadow: 0 0 5px rgba(54, 158, 255, 0.5); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const GET_TWILIO_TOKEN = gql`
  query GetTwilioAccessToken {
    getTwilioAccessToken
  }
`;

const GET_USER_PHONE_NUMBERS = gql`
  query GetUserAssignedPhoneNumbers {
    userAssignedPhoneNumbers {
      id
      phoneNumber
      friendlyName
      status
    }
  }
`;

export const BrowserCall: React.FC = () => {
  usePageTitle("Browser Call");
  const toast = useToast();
  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedCallerId, setSelectedCallerId] = useState<string>('');
  const [showDialpad, setShowDialpad] = useState(true); // Default to showing dialpad
  const timerRef = useRef<NodeJS.Timeout>();

  // Dialpad buttons configuration
  const dialpadButtons = [
    { value: '1', letters: '' },
    { value: '2', letters: 'ABC' },
    { value: '3', letters: 'DEF' },
    { value: '4', letters: 'GHI' },
    { value: '5', letters: 'JKL' },
    { value: '6', letters: 'MNO' },
    { value: '7', letters: 'PQRS' },
    { value: '8', letters: 'TUV' },
    { value: '9', letters: 'WXYZ' },
    { value: '*', letters: '' },
    { value: '0', letters: '+' },
    { value: '#', letters: '' },
  ];

  // Query for user's assigned phone numbers
  const { data: phoneNumbersData, loading: phoneNumbersLoading } = useQuery(GET_USER_PHONE_NUMBERS);

  // Set default caller ID when phone numbers are loaded
  useEffect(() => {
    if (phoneNumbersData?.userAssignedPhoneNumbers?.length > 0 && !selectedCallerId) {
      const firstNumber = phoneNumbersData.userAssignedPhoneNumbers[0].phoneNumber;
      console.log('📞 Setting default caller ID:', firstNumber);
      setSelectedCallerId(firstNumber);
    }
  }, [phoneNumbersData, selectedCallerId]);

  const [getToken, { loading: tokenLoading }] = useLazyQuery(GET_TWILIO_TOKEN, {
    onCompleted: async (data) => {
      if (data?.getTwilioAccessToken) {
        console.log('🎫 Access token received, initializing Twilio Device...');
        
        // Decode and log token details
        const tokenParts = data.getTwilioAccessToken.split('.');
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log('🌏 ==================== TWILIO CONNECTION INFO ====================');
        console.log('🌏 Token Region (twr):', header.twr || 'Not specified');
        console.log('🌏 Token Issuer (API Key):', payload.iss);
        console.log('🌏 Token Subject (Account SID):', payload.sub);
        console.log('🌏 Edge Location: sydney (specified in Device config)');
        console.log('🌏 Expected WebSocket: wss://chunderw-vpc-gll-sydney.twilio.com/signal');
        console.log('🌏 ==================================================================');
        
        try {
          const newDevice = new Device(data.getTwilioAccessToken, {
            logLevel: 1,
            edge: 'sydney', // Use Sydney edge for better latency in Australia
          });

          // Set up device event listeners
          newDevice.on('ready', () => {
            console.log('✅ Twilio Device is ready (event fired)');
            console.log('🌏 Successfully connected to Twilio edge location');
            console.log('🔊 Device state:', newDevice.state);
            console.log('📶 Device connection info:', {
              edge: newDevice.edge,
              state: newDevice.state,
            });
            // Don't set state here as we're doing it after registration
          });

          newDevice.on('error', (error) => {
            console.error('❌ Device error:', error);
            console.error('❌ Error details:', {
              message: error.message,
              code: error.code,
              twilioError: error.twilioError,
            });
            toast({
              title: 'Connection Error',
              description: error.message,
              status: 'error',
              duration: 5000,
            });
          });

          newDevice.on('incoming', (call) => {
            console.log('📞 Incoming call from:', call.parameters.From);
            console.log('📱 Auto-answering incoming call...');
            // Auto-answer for now
            call.accept();
            setActiveCall(call);
            setIsCalling(true);
            
            // Set up call event listeners for incoming calls
            call.on('disconnect', () => {
              console.log('📵 Incoming call disconnected');
              setIsCalling(false);
              setActiveCall(null);
              setIsMuted(false);
            });
            
            toast({
              title: 'Incoming Call',
              description: `Call from ${call.parameters.From}`,
              status: 'info',
              duration: 5000,
            });
          });

          // Register the device
          console.log('🌏 Registering device with Twilio...');
          console.log('🌏 Using edge location: sydney');
          console.log('🌏 Expected connection to: wss://chunderw-vpc-gll-sydney.twilio.com/signal');
          
          await newDevice.register();
          console.log('🌏 Device registered successfully');
          setDevice(newDevice);
          
          // Set connected state after successful registration
          setIsConnected(true);
          toast({
            title: 'Connected',
            description: 'Browser phone is ready to make calls',
            status: 'success',
            duration: 3000,
          });
        } catch (error: any) {
          console.error('Failed to initialize device:', error);
          toast({
            title: 'Initialization Failed',
            description: error?.message || 'Could not connect to Twilio',
            status: 'error',
            duration: 5000,
          });
        }
      }
    },
    onError: (error) => {
      console.error('Failed to get access token:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Could not get access token. You may need to configure Twilio API keys.',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Initialize on mount
  useEffect(() => {
    console.log('🌐 ✅ BrowserCall component mounted, initializing Twilio...');
    getToken();
    
    return () => {
      console.log('🌐 🧙 BrowserCall component unmounting, cleaning up...');
      if (device) {
        console.log('🔌 Destroying Twilio device...');
        device.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCalling && !timerRef.current) {
      console.log('⏱️ Starting call duration timer');
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (!isCalling && timerRef.current) {
      console.log('⏹️ Stopping call duration timer');
      clearInterval(timerRef.current);
      timerRef.current = undefined;
      setCallDuration(0);
    }
  }, [isCalling]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Dialpad functions
  const handleDialpadClick = (value: string) => {
    // If we're in a call, send DTMF tones
    if (isCalling && activeCall) {
      console.log(`📱 Sending DTMF tone: ${value}`);
      try {
        activeCall.sendDigits(value);
        toast({
          title: `Pressed ${value}`,
          status: 'info',
          duration: 1000,
          position: 'top',
          isClosable: false,
        });
      } catch (error: any) {
        console.error('❌ Failed to send DTMF tone:', error);
        toast({
          title: 'Failed to send tone',
          description: error.message || 'Could not send key press',
          status: 'error',
          duration: 3000,
        });
      }
    } else {
      // If not in a call, add to phone number input
      if (value === '0' && phoneNumber === '') {
        // Long press 0 for + (handled differently in mobile)
        setPhoneNumber('+');
      } else {
        setPhoneNumber(prev => prev + value);
      }
    }
  };

  const handleBackspace = () => {
    console.log('⏪ Backspace pressed');
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    console.log('🗑️ Clear button pressed');
    setPhoneNumber('');
  };

  const makeCall = async () => {
    console.log('📞 🎯 Attempting to make call...');
    console.log('📞 Device status:', device ? 'Ready' : 'Not initialized');
    console.log('📞 Phone number:', phoneNumber || 'None');
    console.log('📞 Selected caller ID:', selectedCallerId || 'None');
    
    if (!device || !phoneNumber) {
      console.warn('⚠️ Call blocked: Missing device or phone number');
      toast({
        title: 'Cannot Make Call',
        description: 'Please enter a phone number',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!selectedCallerId) {
      console.warn('⚠️ Call blocked: No caller ID selected');
      toast({
        title: 'Cannot Make Call',
        description: 'No phone number assigned to your account',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      console.log('📞 🚀 Initiating call...');
      console.log('📞 To:', phoneNumber);
      console.log('📱 From:', selectedCallerId);
      const call = await device.connect({
        params: {
          To: phoneNumber,
          From: selectedCallerId, // Pass the selected caller ID
        },
      });

      call.on('accept', () => {
        console.log('✅ Call connected');
        console.log('📱 DTMF tones can now be sent using the dialpad');
        setIsCalling(true);
        setActiveCall(call);
        toast({
          title: 'Call Connected',
          description: 'You can now use the dialpad to navigate phone menus',
          status: 'success',
          duration: 3000,
        });
      });

      call.on('disconnect', () => {
        console.log('📵 Call disconnected');
        console.log(`📊 Call duration: ${formatDuration(callDuration)}`);
        setIsCalling(false);
        setActiveCall(null);
        setIsMuted(false);
        toast({
          title: 'Call Ended',
          description: `Duration: ${formatDuration(callDuration)}`,
          status: 'info',
          duration: 3000,
        });
      });

      call.on('error', (error) => {
        console.error('❌ Call error:', error);
        console.error('❌ Call error details:', {
          message: error.message,
          code: error.code,
          twilioError: error.twilioError,
        });
        toast({
          title: 'Call Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      });

    } catch (error: any) {
      console.error('Failed to make call:', error);
      toast({
        title: 'Call Failed',
        description: error.message || 'Could not connect call',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const endCall = () => {
    if (activeCall) {
      console.log('📵 Ending call...');
      activeCall.disconnect();
    }
  };

  const toggleMute = () => {
    if (activeCall) {
      const newMuteState = !isMuted;
      console.log(`🔇 ${newMuteState ? 'Muting' : 'Unmuting'} microphone`);
      activeCall.mute(newMuteState);
      setIsMuted(newMuteState);
      toast({
        title: newMuteState ? 'Microphone Muted' : 'Microphone Unmuted',
        status: 'info',
        duration: 2000,
        position: 'top',
      });
    }
  };

  // Brand styling variables
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const bgMain = getColor("background.main");
  const primaryColor = getColor("primary");
  const successGreen = getColor("successGreen");
  const errorRed = getColor("status.error");
  const infoBlue = getColor("status.info");

  return (
    <Box bg={bgMain} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={phoneSystemModuleConfig} />
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} flex="1">
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          <Box>
            <Heading size="lg" mb={2} color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              <Icon as={FiPhone} mr={3} color={primaryColor} />
              Browser Phone (Beta)
            </Heading>
            <Text color={textSecondary}>
              Make calls directly from your browser using your computer's microphone and speakers
            </Text>
          </Box>

          <Alert 
            status="info"
            bg="rgba(59, 130, 246, 0.1)"
            borderColor="rgba(59, 130, 246, 0.3)"
            border="1px solid"
          >
            <AlertIcon color={infoBlue} />
            <Box>
              <Text fontWeight="bold" color={textPrimary}>Note: API Keys Required</Text>
              <Text fontSize="sm" color={textSecondary}>
                This feature requires Twilio API Key and Secret to be configured in your tenant settings.
                If you're seeing an error, use the regular "Make Outbound Call" feature instead.
              </Text>
            </Box>
          </Alert>

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
                <Heading size="md" color={textPrimary} fontFamily={brandConfig.fonts.heading}>Browser Phone</Heading>
                <Badge 
                  bg={isConnected ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}
                  color={isConnected ? successGreen : errorRed}
                  border="1px solid"
                  borderColor={isConnected ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Caller ID Selection */}
                {phoneNumbersLoading ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="lg" color={primaryColor} />
                    <Text color={textSecondary} mt={2}>Loading your phone numbers...</Text>
                  </Box>
                ) : phoneNumbersData?.userAssignedPhoneNumbers?.length === 0 ? (
                  <Alert 
                    status="warning"
                    bg="rgba(251, 146, 60, 0.1)"
                    borderColor="rgba(251, 146, 60, 0.3)"
                    border="1px solid"
                  >
                    <AlertIcon color="orange.400" />
                    <Box>
                      <Text fontWeight="bold" color={textPrimary}>No Phone Numbers Assigned</Text>
                      <Text fontSize="sm" color={textSecondary}>
                        You don't have any phone numbers assigned to your account. Please contact your administrator to assign a phone number to you.
                      </Text>
                    </Box>
                  </Alert>
                ) : (
                  <FormControl>
                    <FormLabel color={textPrimary} fontWeight="semibold">
                      Calling From
                      <Badge ml={2} colorScheme="blue" fontSize="xs">Your Caller ID</Badge>
                    </FormLabel>
                    <Select
                      value={selectedCallerId}
                      onChange={(e) => setSelectedCallerId(e.target.value)}
                      size="lg"
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ borderColor: textSecondary }}
                      _focus={{ 
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 1px ${primaryColor}`,
                      }}
                    >
                      {phoneNumbersData?.userAssignedPhoneNumbers?.map((number: any) => {
                        // Only show friendly name if it's different from the phone number
                        const displayName = number.friendlyName && 
                                          !number.friendlyName.includes(number.phoneNumber.replace('+', '')) && 
                                          number.friendlyName !== number.phoneNumber
                                          ? ` - ${number.friendlyName}` 
                                          : '';
                        return (
                          <option key={number.id} value={number.phoneNumber} style={{ background: '#1a1a1a' }}>
                            {number.phoneNumber}{displayName}
                          </option>
                        );
                      })}
                    </Select>
                    <Text fontSize="sm" color={textMuted} mt={1}>
                      This is the number that will appear on the recipient's caller ID
                    </Text>
                  </FormControl>
                )}

                {!isCalling ? (
                  <>
                    <FormControl>
                      <FormLabel color={textPrimary} fontWeight="semibold">Call To</FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type="tel"
                          placeholder="+61400000000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          isDisabled={!isConnected}
                          bg="rgba(255, 255, 255, 0.05)"
                          borderColor={cardBorder}
                          color={textPrimary}
                          fontSize="xl"
                          fontWeight="medium"
                          letterSpacing="wider"
                          _placeholder={{ color: textMuted }}
                          _hover={{ borderColor: textSecondary }}
                          _focus={{ 
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                          }}
                        />
                        <InputRightElement width="4.5rem">
                          <IconButton
                            aria-label="Clear number"
                            icon={<FiDelete />}
                            size="sm"
                            variant="ghost"
                            color={textSecondary}
                            onClick={handleClear}
                            isDisabled={!phoneNumber || !isConnected}
                            _hover={{ color: errorRed }}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="sm" color={textMuted}>
                          Enter number or use dialpad
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          color={primaryColor}
                          onClick={() => setShowDialpad(!showDialpad)}
                          _hover={{ bg: "rgba(54, 158, 255, 0.1)" }}
                        >
                          {showDialpad ? 'Hide' : 'Show'} Dialpad
                        </Button>
                      </HStack>
                    </FormControl>

                    {/* Futuristic Dialpad */}
                    {showDialpad && (
                      <Box
                        p={4}
                        bg="rgba(10, 10, 15, 0.95)"
                        backdropFilter="blur(20px)"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="rgba(54, 158, 255, 0.2)"
                        boxShadow="0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(54, 158, 255, 0.1)"
                      >
                        <SimpleGrid columns={3} spacing={2}>
                          {dialpadButtons.map((button) => (
                            <Button
                              key={button.value}
                              h="60px"
                              fontSize="2xl"
                              fontWeight="bold"
                              bg="rgba(54, 158, 255, 0.05)"
                              color={textPrimary}
                              border="1px solid"
                              borderColor="rgba(54, 158, 255, 0.2)"
                              borderRadius="xl"
                              position="relative"
                              overflow="hidden"
                              onClick={() => handleDialpadClick(button.value)}
                              isDisabled={!isConnected}
                              _hover={{
                                bg: "rgba(54, 158, 255, 0.15)",
                                borderColor: "rgba(54, 158, 255, 0.5)",
                                transform: "scale(1.05)",
                                animation: `${glow} 1s infinite`,
                              }}
                              _active={{
                                bg: "rgba(54, 158, 255, 0.25)",
                                transform: "scale(0.98)",
                              }}
                              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            >
                              <VStack spacing={0}>
                                <Text fontSize="2xl">{button.value}</Text>
                                {button.letters && (
                                  <Text fontSize="xs" color={textSecondary} position="absolute" bottom="8px">
                                    {button.letters}
                                  </Text>
                                )}
                              </VStack>
                            </Button>
                          ))}
                        </SimpleGrid>
                        
                        <HStack mt={3} spacing={2}>
                          <Button
                            flex={1}
                            h="50px"
                            leftIcon={<FiDelete />}
                            bg="rgba(239, 68, 68, 0.1)"
                            color={errorRed}
                            border="1px solid"
                            borderColor="rgba(239, 68, 68, 0.3)"
                            borderRadius="xl"
                            onClick={handleBackspace}
                            isDisabled={!phoneNumber || !isConnected}
                            _hover={{
                              bg: "rgba(239, 68, 68, 0.2)",
                              borderColor: "rgba(239, 68, 68, 0.5)",
                              animation: `${pulse} 0.5s`,
                            }}
                            _active={{
                              transform: "scale(0.98)",
                            }}
                            transition="all 0.2s"
                          >
                            Backspace
                          </Button>
                          <Button
                            flex={1}
                            h="50px"
                            leftIcon={<FiPhone />}
                            bg="rgba(34, 197, 94, 0.1)"
                            color={successGreen}
                            border="1px solid"
                            borderColor="rgba(34, 197, 94, 0.3)"
                            borderRadius="xl"
                            onClick={makeCall}
                            isDisabled={!phoneNumber || !isConnected}
                            _hover={{
                              bg: "rgba(34, 197, 94, 0.2)",
                              borderColor: "rgba(34, 197, 94, 0.5)",
                              animation: `${glow} 1s infinite`,
                            }}
                            _active={{
                              transform: "scale(0.98)",
                            }}
                            transition="all 0.2s"
                          >
                            Call
                          </Button>
                        </HStack>
                      </Box>
                    )}

                    <Button
                      size="lg"
                      leftIcon={<FiPhone />}
                      onClick={makeCall}
                      isDisabled={!isConnected || !phoneNumber}
                      isLoading={tokenLoading}
                      loadingText="Connecting..."
                      bg={successGreen}
                      color="white"
                      _hover={{ bg: getColor("status.success"), transform: "translateY(-2px)" }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.2s"
                      fontWeight="semibold"
                    >
                      Call
                    </Button>
                  </>
                ) : (
                  <VStack spacing={4}>
                    <VStack spacing={1}>
                      <Text fontSize="sm" color={textMuted}>Calling from</Text>
                      <Text fontSize="md" color={textSecondary}>
                        {selectedCallerId}
                      </Text>
                    </VStack>
                    <Divider borderColor={cardBorder} />
                    <VStack spacing={1}>
                      <Text fontSize="sm" color={textMuted}>Connected to</Text>
                      <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
                        {phoneNumber}
                      </Text>
                    </VStack>
                    <Badge 
                      fontSize="lg" 
                      px={4} 
                      py={2}
                      bg="rgba(34, 197, 94, 0.2)"
                      color={successGreen}
                      border="1px solid"
                      borderColor="rgba(34, 197, 94, 0.3)"
                    >
                      {formatDuration(callDuration)}
                    </Badge>
                    
                    {/* In-Call Dialpad for DTMF tones */}
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color={textSecondary} textAlign="center">
                        Press numbers to navigate phone menus
                      </Text>
                      <Box
                        p={3}
                        bg="rgba(10, 10, 15, 0.95)"
                        backdropFilter="blur(20px)"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="rgba(54, 158, 255, 0.2)"
                        boxShadow="0 10px 30px rgba(0, 0, 0, 0.5)"
                      >
                        <SimpleGrid columns={3} spacing={2}>
                          {dialpadButtons.map((button) => (
                            <Button
                              key={button.value}
                              h="50px"
                              fontSize="xl"
                              fontWeight="bold"
                              bg="rgba(54, 158, 255, 0.05)"
                              color={textPrimary}
                              border="1px solid"
                              borderColor="rgba(54, 158, 255, 0.2)"
                              borderRadius="lg"
                              position="relative"
                              overflow="hidden"
                              onClick={() => handleDialpadClick(button.value)}
                              _hover={{
                                bg: "rgba(54, 158, 255, 0.15)",
                                borderColor: "rgba(54, 158, 255, 0.5)",
                                transform: "scale(1.05)",
                              }}
                              _active={{
                                bg: "rgba(54, 158, 255, 0.25)",
                                transform: "scale(0.98)",
                              }}
                              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            >
                              <VStack spacing={0}>
                                <Text fontSize="xl">{button.value}</Text>
                                {button.letters && (
                                  <Text fontSize="xs" color={textSecondary} position="absolute" bottom="6px">
                                    {button.letters}
                                  </Text>
                                )}
                              </VStack>
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>
                    </VStack>
                    
                    <HStack spacing={4}>
                      <IconButton
                        aria-label="Toggle mute"
                        icon={isMuted ? <FiMicOff /> : <FiMic />}
                        size="lg"
                        onClick={toggleMute}
                        bg={isMuted ? errorRed : "rgba(255, 255, 255, 0.1)"}
                        color="white"
                        _hover={{ bg: isMuted ? errorRed : "rgba(255, 255, 255, 0.2)" }}
                      />
                      
                      <Button
                        size="lg"
                        leftIcon={<FiPhoneOff />}
                        onClick={endCall}
                        bg={errorRed}
                        color="white"
                        _hover={{ bg: getColor("status.error"), transform: "translateY(-2px)" }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.2s"
                        fontWeight="semibold"
                      >
                        End Call
                      </Button>
                    </HStack>
                  </VStack>
                )}
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
          >
            <CardHeader>
              <Heading size="md" color={textPrimary} fontFamily={brandConfig.fonts.heading}>How It Works</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Icon as={FiMic} color={infoBlue} />
                  <Text color={textSecondary}>Uses your computer's microphone for speaking</Text>
                </HStack>
                <HStack>
                  <Icon as={FiVolume2} color={successGreen} />
                  <Text color={textSecondary}>Audio plays through your computer speakers/headphones</Text>
                </HStack>
                <HStack>
                  <Icon as={FiPhone} color={getColor("purpleAccent")} />
                  <Text color={textSecondary}>Calls appear from your business phone number</Text>
                </HStack>
                <Divider borderColor={cardBorder} />
                <Text fontSize="sm" color={textMuted}>
                  <strong>Requirements:</strong> Chrome, Firefox, Safari 11+, or Edge browser with microphone permissions
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};