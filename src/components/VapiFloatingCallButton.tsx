import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Collapse,
  Flex,
  Progress,
} from "@chakra-ui/react";
import { keyframes } from '@emotion/react';
import {
  FiPhone,
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiX,
  FiMessageCircle,
} from "react-icons/fi";
import { gql, useQuery } from "@apollo/client";
import Vapi from "@vapi-ai/web";

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

// Animations
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(54, 158, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(54, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(54, 158, 255, 0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

export const VapiFloatingCallButton: React.FC = () => {
  const toast = useToast();
  const { data } = useQuery(GET_VAPI_CONFIG);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<string>("");
  const [volume, setVolume] = useState(0);
  const [showAttention, setShowAttention] = useState(true);
  
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Vapi SDK
  useEffect(() => {
    if (data?.getVapiConfig?.publicApiKey && !vapi) {
      try {
        const vapiInstance = new Vapi(data.getVapiConfig.publicApiKey);
        setVapi(vapiInstance);
        
        // Set up event listeners
        vapiInstance.on("call-start", () => {
          setIsCallActive(true);
          setIsConnecting(false);
          startCallTimer();
          toast({
            title: "Connected to Tom's Assistant",
            description: "You can now speak with the AI assistant",
            status: "success",
            duration: 3000,
            position: "top",
          });
        });

        vapiInstance.on("call-end", () => {
          setIsCallActive(false);
          setIsConnecting(false);
          stopCallTimer();
          setTranscript("");
          setIsExpanded(false);
          toast({
            title: "Call Ended",
            description: "Thank you for speaking with Tom's assistant",
            status: "info",
            duration: 3000,
            position: "top",
          });
        });

        vapiInstance.on("message", (message: any) => {
          if (message.type === "transcript" && message.transcript) {
            setTranscript(message.transcript);
          }
        });

        vapiInstance.on("volume-level", (level: number) => {
          setVolume(level);
        });

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error);
          toast({
            title: "Connection Error",
            description: "Unable to connect. Please try again.",
            status: "error",
            duration: 5000,
            position: "top",
          });
          setIsCallActive(false);
          setIsConnecting(false);
        });

      } catch (error: any) {
        console.error("Failed to initialize Vapi:", error);
      }
    }
  }, [data?.getVapiConfig?.publicApiKey]);

  // Show attention animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isExpanded && !isCallActive) {
        setShowAttention(true);
        setTimeout(() => setShowAttention(false), 3000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isExpanded, isCallActive]);

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
        title: "Not Available",
        description: "Voice assistant is not configured yet",
        status: "warning",
        duration: 3000,
        position: "top",
      });
      return;
    }

    try {
      setIsConnecting(true);
      setTranscript("");
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the call
      await vapi.start(data.getVapiConfig.assistantId);
      
    } catch (error: any) {
      console.error("Failed to start call:", error);
      
      let errorMessage = "Please check your connection and try again";
      if (error.message?.includes("Permission denied")) {
        errorMessage = "Please allow microphone access to use voice assistant";
      }
      
      toast({
        title: "Unable to Start Call",
        description: errorMessage,
        status: "error",
        duration: 5000,
        position: "top",
      });
      setIsConnecting(false);
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

  if (!data?.getVapiConfig?.isConfigured) {
    return null;
  }

  return (
    <>
      {/* Main floating button */}
      <Box
        position="fixed"
        bottom={{ base: "20px", md: "30px" }}
        right={{ base: "20px", md: "30px" }}
        zIndex={999}
      >
        {/* Expanded call interface */}
        <Collapse in={isExpanded} animateOpacity>
          <Box
            bg="rgba(20, 20, 20, 0.95)"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            p={5}
            mb={4}
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.5)"
            border="1px solid"
            borderColor="rgba(54, 158, 255, 0.3)"
            minW="320px"
            maxW="400px"
          >
            {/* Header */}
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Badge
                  colorScheme={isCallActive ? "green" : "blue"}
                  fontSize="xs"
                  px={2}
                  py={1}
                >
                  {isCallActive ? "Connected" : "Tom's AI Assistant"}
                </Badge>
                {isCallActive && (
                  <Text fontSize="sm" color="gray.400">
                    {formatDuration(callDuration)}
                  </Text>
                )}
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                color="gray.400"
                onClick={() => {
                  if (isCallActive) {
                    endCall();
                  }
                  setIsExpanded(false);
                }}
              />
            </Flex>

            {/* Call status and transcript */}
            {isCallActive && (
              <Box
                bg="rgba(0, 0, 0, 0.5)"
                borderRadius="lg"
                p={3}
                mb={4}
                minH="60px"
                maxH="120px"
                overflowY="auto"
              >
                {transcript ? (
                  <Text fontSize="sm" color="white">
                    {transcript}
                  </Text>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    Listening...
                  </Text>
                )}
                {volume > 0 && (
                  <Progress
                    value={volume * 100}
                    size="xs"
                    colorScheme="blue"
                    mt={2}
                  />
                )}
              </Box>
            )}

            {/* Call controls */}
            <VStack spacing={3}>
              {!isCallActive ? (
                <>
                  <Text fontSize="sm" color="gray.300" textAlign="center">
                    Click to start a voice conversation about our services
                  </Text>
                  <Button
                    size="md"
                    colorScheme="green"
                    leftIcon={<FiPhone />}
                    onClick={startCall}
                    isLoading={isConnecting}
                    loadingText="Connecting..."
                    w="full"
                  >
                    Start Voice Call
                  </Button>
                </>
              ) : (
                <HStack spacing={3} w="full" justify="center">
                  <IconButton
                    aria-label="Toggle mute"
                    icon={isMuted ? <FiMicOff /> : <FiMic />}
                    onClick={toggleMute}
                    colorScheme={isMuted ? "red" : "gray"}
                    variant={isMuted ? "solid" : "outline"}
                  />
                  <Button
                    colorScheme="red"
                    leftIcon={<FiPhoneOff />}
                    onClick={endCall}
                    flex={1}
                  >
                    End Call
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>
        </Collapse>

        {/* Floating button */}
        <Button
          size="lg"
          borderRadius="full"
          colorScheme="blue"
          boxShadow="0 10px 40px rgba(54, 158, 255, 0.4)"
          onClick={() => setIsExpanded(!isExpanded)}
          leftIcon={isCallActive ? <FiPhoneOff /> : <FiMessageCircle />}
          px={6}
          py={7}
          fontSize="md"
          fontWeight="600"
          bg="linear-gradient(135deg, #369eff 0%, #147fd6 100%)"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "0 15px 50px rgba(54, 158, 255, 0.5)",
          }}
          animation={
            showAttention && !isExpanded && !isCallActive
              ? `${pulse} 2s infinite, ${float} 3s ease-in-out infinite`
              : isCallActive
              ? `${wiggle} 0.5s ease-in-out infinite`
              : undefined
          }
          position="relative"
          _before={
            showAttention && !isExpanded && !isCallActive
              ? {
                  content: '""',
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  width: "20px",
                  height: "20px",
                  bg: "red.500",
                  borderRadius: "full",
                  animation: `${pulse} 1s infinite`,
                }
              : undefined
          }
        >
          {isCallActive ? "Active Call" : "Talk to Tom's AI"}
        </Button>

        {/* Tooltip bubble */}
        {showAttention && !isExpanded && !isCallActive && (
          <Box
            position="absolute"
            bottom="100%"
            right="0"
            mb={2}
            bg="white"
            color="gray.800"
            px={4}
            py={2}
            borderRadius="lg"
            boxShadow="lg"
            fontSize="sm"
            fontWeight="500"
            whiteSpace="nowrap"
            _before={{
              content: '""',
              position: "absolute",
              bottom: "-6px",
              right: "30px",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid white",
            }}
            animation={`${float} 2s ease-in-out infinite`}
          >
            👋 Need help? Click to chat!
          </Box>
        )}
      </Box>
    </>
  );
};