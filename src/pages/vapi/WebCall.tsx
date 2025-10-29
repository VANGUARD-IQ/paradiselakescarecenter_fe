import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  useColorModeValue,
  Spinner,
  Divider,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  SimpleGrid,
  Progress,
} from "@chakra-ui/react";
import {
  FiPhone,
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiUser,
} from "react-icons/fi";
import { gql, useQuery } from "@apollo/client";
import Vapi from "@vapi-ai/web";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';
import { VapiConfigForm } from "./VapiConfigForm";

const GET_VAPI_CONFIG = gql`
  query GetVapiConfig {
    getVapiConfig {
      publicApiKey
      assistantId
      phoneNumberId
      isConfigured
    }
  }
`;


export const WebCall: React.FC = () => {
  usePageTitle("Web Call");
  const toast = useToast();
  const { data, loading, error, refetch } = useQuery(GET_VAPI_CONFIG);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string; timestamp: Date }>>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("idle");
  const [volume, setVolume] = useState(0);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const transcriptBg = "rgba(0, 0, 0, 0.2)";

  // Initialize Vapi SDK
  useEffect(() => {
    if (data?.getVapiConfig?.publicApiKey && !vapi) {
      try {
        const vapiInstance = new Vapi(data.getVapiConfig.publicApiKey);
        setVapi(vapiInstance);
        
        // Set up event listeners
        vapiInstance.on("call-start", () => {
          setIsCallActive(true);
          setCallStatus("connected");
          setIsConnecting(false);
          startCallTimer();
          toast({
            title: "Call Connected",
            description: "Your voice call has started",
            status: "success",
            duration: 3000,
          });
        });

        vapiInstance.on("call-end", () => {
          setIsCallActive(false);
          setCallStatus("ended");
          setIsConnecting(false);
          stopCallTimer();
          setTranscript([]);
          toast({
            title: "Call Ended",
            description: "Your voice call has ended",
            status: "info",
            duration: 3000,
          });
        });

        vapiInstance.on("message", (message: any) => {
          console.log("Vapi message:", message);
          if (message.type === "transcript") {
            setTranscript(prev => [...prev, {
              role: message.role,
              text: message.transcript,
              timestamp: new Date()
            }]);
          }
        });

        vapiInstance.on("volume-level", (level: number) => {
          setVolume(level);
        });

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error);
          toast({
            title: "Call Error",
            description: error.message || "An error occurred during the call",
            status: "error",
            duration: 5000,
          });
          setIsCallActive(false);
          setIsConnecting(false);
          setCallStatus("error");
        });

        // Additional events for better debugging
        vapiInstance.on("speech-start", () => {
          console.log("User started speaking");
        });

        vapiInstance.on("speech-end", () => {
          console.log("User stopped speaking");
        });

      } catch (error: any) {
        console.error("Failed to initialize Vapi:", error);
        toast({
          title: "Initialization Failed",
          description: "Could not initialize Vapi SDK",
          status: "error",
          duration: 5000,
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (vapi && isCallActive) {
        vapi.stop();
      }
    };
  }, [data?.getVapiConfig?.publicApiKey]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCall = async () => {
    if (!vapi || !data?.getVapiConfig?.assistantId) {
      toast({
        title: "Configuration Error",
        description: "Vapi is not properly configured. Please ensure API keys and Assistant ID are set.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsConnecting(true);
      setCallStatus("connecting");
      setTranscript([]);
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the call with the assistant
      await vapi.start(data.getVapiConfig.assistantId);
      
    } catch (error: any) {
      console.error("Failed to start call:", error);
      
      let errorMessage = "Please check your configuration and try again";
      if (error.message?.includes("Permission denied")) {
        errorMessage = "Microphone access was denied. Please allow microphone access and try again.";
      } else if (error.message?.includes("assistant")) {
        errorMessage = "Assistant not found. Please check your Assistant ID configuration.";
      }
      
      toast({
        title: "Failed to start call",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
      setIsConnecting(false);
      setCallStatus("error");
    }
  };

  const endCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  const toggleMute = () => {
    if (vapi && isCallActive) {
      const newMutedState = !isMuted;
      vapi.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Browser web audio doesn't provide direct speaker control
    // This is more of a UI indicator for the user
  };

  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <HStack justify="center">
                <Spinner />
                <Text>Loading Vapi configuration...</Text>
              </HStack>
            </CardBody>
          </Card>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.getVapiConfig?.isConfigured) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />
        <Container maxW="container.xl" py={8} flex="1">
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" color={textPrimary} mb={2}>
                🎤 Web Voice Call
              </Heading>
              <Text color={textSecondary}>
                Configure Vapi to start making AI-powered voice calls
              </Text>
            </Box>

            {error ? (
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Error loading configuration</Text>
                  <Text fontSize="sm">
                    {error.message}
                  </Text>
                </Box>
              </Alert>
            ) : (
              <>
                <Alert status="warning" mb={4}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Vapi is not configured</Text>
                    <Text fontSize="sm">
                      Please configure your Vapi API keys below to enable voice calling features.
                    </Text>
                  </Box>
                </Alert>
                
                {/* Configuration Form */}
                <VapiConfigForm onConfigured={() => refetch()} />
              </>
            )}
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="container.xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color={textPrimary} mb={2}>
              🎤 Web Voice Call
            </Heading>
            <Text color={textSecondary}>
              Start an AI-powered voice conversation
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Call Controls */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size="md" color={textPrimary}>Call Controls</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {/* Call Status */}
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="semibold" color={textPrimary}>Status:</Text>
                    <Badge
                      colorScheme={
                        isCallActive ? "green" :
                        isConnecting ? "yellow" :
                        callStatus === "error" ? "red" :
                        "gray"
                      }
                    >
                      {isConnecting ? "Connecting..." :
                       isCallActive ? "Connected" :
                       callStatus === "error" ? "Error" :
                       "Ready"}
                    </Badge>
                  </HStack>

                  {/* Call Duration */}
                  {isCallActive && (
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold" color={textPrimary}>Duration:</Text>
                      <Text fontFamily="monospace" color={textSecondary}>{formatDuration(callDuration)}</Text>
                    </HStack>
                  )}

                  {/* Volume Indicator */}
                  {isCallActive && (
                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="semibold" color={textPrimary}>Volume:</Text>
                        <Text fontSize="sm" color={textSecondary}>{Math.round(volume * 100)}%</Text>
                      </HStack>
                      <Progress value={volume * 100} size="sm" colorScheme="blue" />
                    </Box>
                  )}

                  <Divider />

                  {/* Main Call Button */}
                  <Button
                    size="lg"
                    colorScheme={isCallActive ? "red" : "green"}
                    leftIcon={isCallActive ? <FiPhoneOff /> : <FiPhone />}
                    onClick={isCallActive ? endCall : startCall}
                    isLoading={isConnecting}
                    loadingText="Connecting..."
                    w="full"
                    isDisabled={!data?.getVapiConfig?.assistantId}
                  >
                    {isCallActive ? "End Call" : "Start Voice Assistant"}
                  </Button>

                  {/* Call Controls */}
                  {isCallActive && (
                    <HStack spacing={4}>
                      <IconButton
                        aria-label="Toggle mute"
                        icon={isMuted ? <FiMicOff /> : <FiMic />}
                        onClick={toggleMute}
                        colorScheme={isMuted ? "red" : "gray"}
                        variant={isMuted ? "solid" : "outline"}
                        size="lg"
                      />
                      <IconButton
                        aria-label="Toggle speaker"
                        icon={isSpeakerOn ? <FiVolume2 /> : <FiVolumeX />}
                        onClick={toggleSpeaker}
                        colorScheme={isSpeakerOn ? "blue" : "gray"}
                        variant={isSpeakerOn ? "solid" : "outline"}
                        size="lg"
                      />
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Transcript */}
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <Heading size="md" color={textPrimary}>Conversation Transcript</Heading>
              </CardHeader>
              <CardBody>
                <Box
                  maxH="400px"
                  overflowY="auto"
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={cardBorder}
                  bg={transcriptBg}
                >
                  {transcript.length === 0 ? (
                    <Text color={textMuted} textAlign="center">
                      {isCallActive ? "Waiting for conversation..." : "Start a call to see the transcript"}
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {transcript.map((entry, index) => (
                        <Box key={index}>
                          <HStack mb={1}>
                            <Badge colorScheme={entry.role === "user" ? "blue" : "green"}>
                              {entry.role === "user" ? "You" : "Assistant"}
                            </Badge>
                            <Text fontSize="xs" color={textMuted}>
                              {entry.timestamp.toLocaleTimeString()}
                            </Text>
                          </HStack>
                          <Text color={textPrimary}>{entry.text}</Text>
                        </Box>
                      ))}
                      <div ref={transcriptEndRef} />
                    </VStack>
                  )}
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Instructions */}
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">How to use:</Text>
              <VStack align="start" spacing={1} mt={2} fontSize="sm">
                <Text>1. Click "Start Voice Assistant" to begin a voice conversation</Text>
                <Text>2. Allow microphone access when prompted by your browser</Text>
                <Text>3. Speak naturally - the AI assistant will respond</Text>
                <Text>4. Use the mute button to temporarily disable your microphone</Text>
                <Text>5. View the real-time transcript on the right</Text>
                <Text>6. Click "End Call" when you're finished</Text>
              </VStack>
            </Box>
          </Alert>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};