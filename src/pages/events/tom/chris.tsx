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
  Image,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

// Event start time in Brisbane timezone
const EVENT_START_TIME = new Date("2025-05-21T14:00:00+10:00");

const ChrisEventPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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
          hours: Math.floor((difference / 1000 / 60 / 60) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isLive: false
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(timeTimer);
    };
  }, []);

  const handleJoinMeeting = () => {
    window.open("https://m.lifeessentials.club/Block52Event", "_blank");
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box 
        minH="120vh" 
        bg="#000"
        position="relative"
        pt={20}
        sx={{
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(121, 135, 170, 0.1), rgba(153, 162, 186, 0.1), rgba(99, 102, 241, 0.1))",
            zIndex: 0,
            opacity: 0.8,
            filter: "blur(4px)",
          }
        }}
      >
        <Container maxW="container.lg" py={24} position="relative" zIndex={1}>
          <VStack spacing={8} align="stretch">
            {/* Logo Section */}
            <Box 
              textAlign="center" 
              mb={8}
              p={8}
              bg="rgba(0, 0, 0, 0.9)"
              borderRadius="xl"
              boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
              sx={{
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-4px",
                  left: "-4px",
                  right: "-4px",
                  bottom: "-4px",
                  borderRadius: "xl",
                  background: "linear-gradient(135deg, #7987aa, #6366f1, #99a2ba)",
                  zIndex: -1,
                  opacity: 0.8,
                  filter: "blur(4px)",
                }
              }}
            >
              <Image 
                src="https://cdn.prod.website-files.com/66be841c287e1333f501db9d/66be8457ec364eb7bc6ef676_BLOCK%2052%206-p-1600.png"
                alt="Block52 Logo"
                maxW="300px"
                mx="auto"
                mb={6}
              />
            </Box>

            {/* Event Header */}
            <Box 
              textAlign="center"
              p={8}
              borderRadius="xl"
              bg="rgba(0, 0, 0, 0.7)"
              boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
              sx={{
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-4px",
                  left: "-4px",
                  right: "-4px",
                  bottom: "-4px",
                  borderRadius: "xl",
                  background: "linear-gradient(135deg, #7987aa, #6366f1, #99a2ba)",
                  zIndex: -1,
                  opacity: 0.8,
                  filter: "blur(4px)",
                }
              }}
            >
              <Box
                p={6}
                mb={6}
                bg="rgba(99, 102, 241, 0.2)"
                borderRadius="lg"
                border="2px solid"
                borderColor="#6366f1"
                animation="pulse 2s infinite"
                sx={{
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)"
                    },
                    "70%": {
                      boxShadow: "0 0 0 20px rgba(99, 102, 241, 0)"
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)"
                    }
                  }
                }}
              >
                <Text fontSize="4xl" color="#f8e9ac" fontWeight="bold" mb={2}>
                  CHRIS
                </Text>
                <Text fontSize="2xl" color="#6366f1" fontWeight="bold" mb={4}>
                  🎮 EXCLUSIVE INVITATION 🎮
                </Text>
                <Text fontSize="xl" color="#99a2ba">
                  You&apos;ve been personally selected for a private preview
                </Text>
              </Box>

              <Text fontSize="md" color="#7987aa" mt={2}>
                Event Time: May 20, 2025 at 2:00 PM (Brisbane Time)
              </Text>
              <Text fontSize="md" color="#7987aa">
                Current Time: {currentTime.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}
              </Text>
            </Box>

            {/* Countdown Timer */}
            {!timeLeft.isLive ? (
              <Box 
                p={8} 
                bg="rgba(0, 0, 0, 0.8)" 
                borderRadius="xl" 
                textAlign="center"
                boxShadow="0 0 30px rgba(99, 102, 241, 0.6), 0 0 15px rgba(10, 13, 51, 0.5), 0 0 25px rgba(0, 0, 0, 0.4)"
                border="2px solid"
                borderColor="#6366f1"
                sx={{
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "-4px",
                    left: "-4px",
                    right: "-4px",
                    bottom: "-4px",
                    borderRadius: "xl",
                    background: "linear-gradient(135deg, #7987aa, #6366f1, #99a2ba)",
                    zIndex: -1,
                    opacity: 0.8,
                    filter: "blur(4px)",
                  }
                }}
              >
                <Text 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  mb={6} 
                  color="#f8e9ac"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  ⏰ Event Starts In ⏰
                </Text>
                <SimpleGrid columns={4} spacing={8}>
                  <Box 
                    p={4} 
                    bg="rgba(99, 102, 241, 0.3)" 
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="#6366f1"
                  >
                    <Text fontSize="5xl" fontWeight="bold" color="#f8e9ac">
                      {timeLeft.days}
                    </Text>
                    <Text fontSize="lg" color="#99a2ba" fontWeight="medium">DAYS</Text>
                  </Box>
                  <Box 
                    p={4} 
                    bg="rgba(99, 102, 241, 0.3)" 
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="#6366f1"
                  >
                    <Text fontSize="5xl" fontWeight="bold" color="#f8e9ac">
                      {timeLeft.hours}
                    </Text>
                    <Text fontSize="lg" color="#99a2ba" fontWeight="medium">HOURS</Text>
                  </Box>
                  <Box 
                    p={4} 
                    bg="rgba(99, 102, 241, 0.3)" 
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="#6366f1"
                  >
                    <Text fontSize="5xl" fontWeight="bold" color="#f8e9ac">
                      {timeLeft.minutes}
                    </Text>
                    <Text fontSize="lg" color="#99a2ba" fontWeight="medium">MINUTES</Text>
                  </Box>
                  <Box 
                    p={4} 
                    bg="rgba(99, 102, 241, 0.3)" 
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="#6366f1"
                  >
                    <Text fontSize="5xl" fontWeight="bold" color="#f8e9ac">
                      {timeLeft.seconds}
                    </Text>
                    <Text fontSize="lg" color="#99a2ba" fontWeight="medium">SECONDS</Text>
                  </Box>
                </SimpleGrid>
                <Text 
                  mt={6} 
                  fontSize="xl" 
                  color="#99a2ba"
                  fontWeight="medium"
                >
                  Don&apos;t miss this exclusive opportunity!
                </Text>
              </Box>
            ) : (
              <Box 
                p={8} 
                bg="rgba(0, 0, 0, 0.7)" 
                borderRadius="xl" 
                textAlign="center"
                border="4px solid"
                borderColor="#6366f1"
                position="relative"
                overflow="hidden"
                animation="pulse 2s infinite"
                boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                sx={{
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)"
                    },
                    "70%": {
                      boxShadow: "0 0 0 20px rgba(99, 102, 241, 0)"
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)"
                    }
                  }
                }}
              >
                <Text 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  mb={6}
                  color="#6366f1"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  🎉 Event is Live! 🎉
                </Text>
                
                <Text fontSize="xl" mb={8} color="#99a2ba">
                  Click the button below to join the event now
                </Text>

                <Button
                  size="lg"
                  onClick={handleJoinMeeting}
                  rightIcon={<ExternalLinkIcon />}
                  height="60px"
                  px={8}
                  fontSize="xl"
                  fontWeight="bold"
                  bg="#6366f1"
                  color="#fff"
                  _hover={{
                    bg: "#4f46e5",
                    transform: "scale(1.05)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
                  }}
                  transition="all 0.3s ease"
                >
                  Click Here to Join Event
                </Button>

                <Text mt={4} fontSize="sm" color="#7987aa">
                  The event will open in a new tab
                </Text>
              </Box>
            )}

            {/* Event Details */}
            <Box 
              bg="rgba(0, 0, 0, 0.7)" 
              p={8} 
              borderRadius="xl" 
              boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
              sx={{
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-4px",
                  left: "-4px",
                  right: "-4px",
                  bottom: "-4px",
                  borderRadius: "xl",
                  background: "linear-gradient(135deg, #7987aa, #6366f1, #99a2ba)",
                  zIndex: -1,
                  opacity: 0.8,
                  filter: "blur(4px)",
                }
              }}
            >
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="#6366f1">
                  About This Exclusive Preview
                </Heading>
                
                <Text fontSize="lg" color="#99a2ba">
                  Chris, you&apos;ve been selected for an exclusive preview of Block52&apos;s revolutionary Card Virtual Machine (CVM). This is your chance to experience the future of card gaming before anyone else.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="rgba(99, 102, 241, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🎮</Text>
                      <Text fontWeight="bold" color="#6366f1">1. Exclusive Gameplay</Text>
                    </Flex>
                    <Text color="#99a2ba">Be among the first to experience the CVM in action</Text>
                  </Box>
                  <Box p={4} bg="rgba(99, 102, 241, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🎯</Text>
                      <Text fontWeight="bold" color="#6366f1">2. Technical Deep Dive</Text>
                    </Flex>
                    <Text color="#99a2ba">Understanding the revolutionary CVM technology</Text>
                  </Box>
                  <Box p={4} bg="rgba(153, 162, 186, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🤝</Text>
                      <Text fontWeight="bold" color="#6366f1">3. Direct Access</Text>
                    </Flex>
                    <Text color="#99a2ba">One-on-one session with the Block52 team</Text>
                  </Box>
                  <Box p={4} bg="rgba(121, 135, 170, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>💡</Text>
                      <Text fontWeight="bold" color="#6366f1">4. Future Vision</Text>
                    </Flex>
                    <Text color="#99a2ba">Learn about the future of decentralized card gaming</Text>
                  </Box>
                </SimpleGrid>

                {/* Module Content Section - Only visible when event is live */}
                {timeLeft.isLive && (
                  <Box mt={12}>
                    <Heading size="lg" color="#6366f1" mb={6}>
                      Session Overview
                    </Heading>
                    <Text fontSize="lg" mb={8} color="#99a2ba">
                      Here&apos;s what we&apos;ll cover during our exclusive session:
                    </Text>

                    <Accordion allowMultiple>
                      <AccordionItem 
                        border="1px solid" 
                        borderColor="rgba(99, 102, 241, 0.3)" 
                        borderRadius="lg" 
                        mb={4}
                        bg="rgba(0, 0, 0, 0.5)"
                      >
                        <h2>
                          <AccordionButton py={4}>
                            <Flex align="center" flex="1">
                              <Text fontSize="2xl" mr={3}>🎮</Text>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold" fontSize="lg" color="#6366f1">Game Demo</Text>
                                <Text fontSize="sm" color="#99a2ba">Experience the CVM in action</Text>
                              </Box>
                            </Flex>
                            <AccordionIcon color="#6366f1" />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={6}>
                            <Text fontSize="lg" fontWeight="bold" color="#6366f1">
                              Experience the future of card gaming with our live demo
                            </Text>

                            <Box bg="rgba(99, 102, 241, 0.2)" p={4} borderRadius="lg">
                              <Text fontSize="md" fontWeight="medium" color="#99a2ba">
                                Watch as we demonstrate how the CVM ensures:
                              </Text>
                              <Text color="#99a2ba" mt={2}>• Provably fair shuffling and dealing</Text>
                              <Text color="#99a2ba">• Real-time game state management</Text>
                              <Text color="#99a2ba">• Instant payouts and transparent outcomes</Text>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>

          {/* Social Links */}
          <Box 
            mt={12} 
            textAlign="center" 
            opacity={0.7}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s"
          >
            <Text fontSize="sm" color="#black" mb={2}>
              Connect with Block52
            </Text>
            <Flex justify="center" gap={4}>
              <Link 
                href="https://pitch.com/v/block52-cvm-2xt7k8" 
                isExternal
                color="#black"
                _hover={{ color: "#6366f1" }}
                fontSize="sm"
              >
                Deck
              </Link>
              <Link 
                href="https://x.com/block52xyz" 
                isExternal
                color="#black"
                _hover={{ color: "#6366f1" }}
                fontSize="sm"
              >
                Twitter
              </Link>
              {/* <Link 
                href="https://discord.gg/block52" 
                isExternal
                color="#black"
                _hover={{ color: "#6366f1" }}
                fontSize="sm"
              >
                Discord
              </Link> */}
              <Link 
                href="https://block52.xyz" 
                isExternal
                color="#black"
                _hover={{ color: "#6366f1" }}
                fontSize="sm"
              >
                Website
              </Link>
            </Flex>
          </Box>
        </Container>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default ChrisEventPage;
