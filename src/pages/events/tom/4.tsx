import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { Link as RouterLink } from "react-router-dom";

// Event start time in Brisbane timezone
const EVENT_START_TIME = new Date("2025-06-10T10:00:00+10:00");

const Event4Page = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = EVENT_START_TIME.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true
        });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isLive: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinMeeting = () => {
    window.open("https://m.lifeessentials.club/ProgressiveDisclosures", "_blank");
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.lg" py={12}>
          <VStack spacing={8} align="stretch">
            {/* Event Header */}
            <Box textAlign="center">
              <Heading size="2xl" color="#2c5282" mb={4}>
                Community Building Workshop
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Hosted by Tom Miller
              </Text>
            </Box>

            {/* Countdown Timer */}
            {!timeLeft.isLive ? (
              <Box p={6} bg="blue.50" borderRadius="lg" textAlign="center">
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                  Event starts in:
                </Text>
                <SimpleGrid columns={4} spacing={4}>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      {timeLeft.days}
                    </Text>
                    <Text>days</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      {timeLeft.hours}
                    </Text>
                    <Text>hours</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      {timeLeft.minutes}
                    </Text>
                    <Text>minutes</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      {timeLeft.seconds}
                    </Text>
                    <Text>seconds</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            ) : (
              <Box 
                p={8} 
                bg="green.50" 
                borderRadius="xl" 
                textAlign="center"
                border="4px solid"
                borderColor="green.400"
                position="relative"
                overflow="hidden"
                animation="pulse 2s infinite"
                sx={{
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(72, 187, 120, 0.4)"
                    },
                    "70%": {
                      boxShadow: "0 0 0 20px rgba(72, 187, 120, 0)"
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(72, 187, 120, 0)"
                    }
                  }
                }}
              >
                <Text 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  mb={6}
                  color="green.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  🎉 Event is Live! 🎉
                </Text>
                
                <Text fontSize="xl" mb={8} color="gray.700">
                  Click the button below to join the event now
                </Text>

                <Button
                  size="lg"
                  colorScheme="green"
                  onClick={handleJoinMeeting}
                  rightIcon={<ExternalLinkIcon />}
                  height="60px"
                  px={8}
                  fontSize="xl"
                  fontWeight="bold"
                  bg="green.500"
                  _hover={{
                    bg: "green.600",
                    transform: "scale(1.05)",
                    boxShadow: "0 0 20px rgba(72, 187, 120, 0.4)"
                  }}
                  transition="all 0.3s ease"
                >
                  Click Here to Join Event
                </Button>

                <Text mt={4} fontSize="sm" color="gray.600">
                  The event will open in a new tab
                </Text>
              </Box>
            )}

            {/* Event Details */}
            <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="#2c5282">
                  About This Event
                </Heading>
                
                <Text fontSize="lg">
                  Discover how we&apos;re building a vibrant community around digital culture and web3 integration.
                </Text>

                {/* Module Content Section - Only visible when event is live */}
                {timeLeft.isLive && (
                  <Box mt={8}>
                    <Accordion allowMultiple>
                      <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="lg" mb={4}>
                        <h2>
                          <AccordionButton py={4}>
                            <Flex align="center" flex="1">
                              <Text fontSize="2xl" mr={3}>👥</Text>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold" fontSize="lg">Community Building</Text>
                                <Text fontSize="sm" color="gray.600">Growing together in the digital age</Text>
                              </Box>
                            </Flex>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={4}>
                            <Text>• Building meaningful connections in digital spaces</Text>
                            <Text>• Creating engaging community experiences</Text>
                            <Text>• Fostering collaboration and knowledge sharing</Text>
                            <Text>• Growing a sustainable community ecosystem</Text>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Box>
                )}

                {/* Navigation to Other Modules */}
                <Box mt={8} p={6} bg="gray.50" borderRadius="xl">
                  <Heading size="md" mb={4} color="gray.700">
                    Other Modules
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box 
                      as={RouterLink} 
                      to="/events/tom/3"
                      p={4} 
                      bg="white" 
                      borderRadius="lg" 
                      boxShadow="sm"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                      transition="all 0.3s"
                    >
                      <Text fontSize="2xl" mb={2}>🤝</Text>
                      <Text fontWeight="bold">Human Fabric Framework</Text>
                      <Text fontSize="sm" color="gray.600">Previous module</Text>
                    </Box>
                    <Box 
                      as={RouterLink} 
                      to="/events/tom/1"
                      p={4} 
                      bg="white" 
                      borderRadius="lg" 
                      boxShadow="sm"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                      transition="all 0.3s"
                    >
                      <Text fontSize="2xl" mb={2}>🌐</Text>
                      <Text fontWeight="bold">Digital Culture Vision</Text>
                      <Text fontSize="sm" color="gray.600">First module</Text>
                    </Box>
                    <Box 
                      as={RouterLink} 
                      to="/events/tom/2"
                      p={4} 
                      bg="white" 
                      borderRadius="lg" 
                      boxShadow="sm"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                      transition="all 0.3s"
                    >
                      <Text fontSize="2xl" mb={2}>⛓️</Text>
                      <Text fontWeight="bold">Web3 Integration</Text>
                      <Text fontSize="sm" color="gray.600">Second module</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default Event4Page; 