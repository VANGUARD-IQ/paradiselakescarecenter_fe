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
  Link,
  List,
  ListItem,
  ListIcon,
  Image,
} from "@chakra-ui/react";
import { ExternalLinkIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

// Event start time in Brisbane timezone
const EVENT_START_TIME = new Date("2025-05-20T12:30:00+10:00");

const Block52EventPage = () => {
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
              <Heading size="2xl" color="#6366f1" mb={4}>
                Block52: The Card Virtual Machine
              </Heading>
              <Text fontSize="xl" color="#99a2ba">
                Special Investment Event
              </Text>
              <Text fontSize="md" color="#7987aa" mt={2}>
                Event Time: May 20, 2025 at 12:30 PM (Brisbane Time)
              </Text>
              <Text fontSize="md" color="#7987aa">
                Current Time: {currentTime.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}
              </Text>
            </Box>

            {/* Countdown Timer */}
            {!timeLeft.isLive ? (
              <Box 
                p={6} 
                bg="rgba(0, 0, 0, 0.7)" 
                borderRadius="xl" 
                textAlign="center"
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
                <Text fontSize="xl" fontWeight="bold" mb={4} color="#6366f1">
                  Event starts in:
                </Text>
                <SimpleGrid columns={4} spacing={4}>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="#6366f1">
                      {timeLeft.days}
                    </Text>
                    <Text color="#99a2ba">days</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="#6366f1">
                      {timeLeft.hours}
                    </Text>
                    <Text color="#99a2ba">hours</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="#6366f1">
                      {timeLeft.minutes}
                    </Text>
                    <Text color="#99a2ba">minutes</Text>
                  </Box>
                  <Box>
                    <Text fontSize="3xl" fontWeight="bold" color="#6366f1">
                      {timeLeft.seconds}
                    </Text>
                    <Text color="#99a2ba">seconds</Text>
                  </Box>
                </SimpleGrid>
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
                  About This Event
                </Heading>
                
                <Text fontSize="lg" color="#99a2ba">
                  Join us for an exclusive look at Block52, the first Layer 1 protocol designed for provably fair, decentralized, and composable card gameplay. Learn about the revolutionary Card Virtual Machine (CVM) and discover early investment opportunities.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="rgba(99, 102, 241, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🎮</Text>
                      <Text fontWeight="bold" color="#6366f1">1. Game Demo</Text>
                    </Flex>
                    <Text color="#99a2ba">Experience the CVM in action with a live demo of our first card game</Text>
                  </Box>
                  <Box p={4} bg="rgba(99, 102, 241, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>💎</Text>
                      <Text fontWeight="bold" color="#6366f1">2. Investment Opportunity</Text>
                    </Flex>
                    <Text color="#99a2ba">Learn about early investment opportunities in Block52</Text>
                  </Box>
                  <Box p={4} bg="rgba(153, 162, 186, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🎯</Text>
                      <Text fontWeight="bold" color="#6366f1">3. Technical Deep Dive</Text>
                    </Flex>
                    <Text color="#99a2ba">Understanding the CVM and its revolutionary approach to card games</Text>
                  </Box>
                  <Box p={4} bg="rgba(121, 135, 170, 0.2)" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🤝</Text>
                      <Text fontWeight="bold" color="#6366f1">4. Team & Vision</Text>
                    </Flex>
                    <Text color="#99a2ba">Meet the team behind Block52 and learn about our vision</Text>
                  </Box>
                </SimpleGrid>

                {/* Module Content Section - Only visible when event is live */}
                {timeLeft.isLive && (
                  <Box mt={12}>
                    <Heading size="lg" color="#6366f1" mb={6}>
                      Event Content
                    </Heading>
                    <Text fontSize="lg" mb={8} color="#99a2ba">
                      Click on each module below to explore the content we&apos;ll cover during the event.
                    </Text>

                    <Accordion allowMultiple>
                      {/* Game Demo Section */}
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
                              <List spacing={3} mt={4}>
                                <ListItem color="#99a2ba">
                                  <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                  Provably fair shuffling and dealing
                                </ListItem>
                                <ListItem color="#99a2ba">
                                  <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                  Real-time game state management
                                </ListItem>
                                <ListItem color="#99a2ba">
                                  <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                  Instant payouts and transparent outcomes
                                </ListItem>
                              </List>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>

                      {/* Investment Opportunity Section */}
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
                              <Text fontSize="2xl" mr={3}>💎</Text>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold" fontSize="lg" color="#6366f1">Investment Opportunity</Text>
                                <Text fontSize="sm" color="#99a2ba">Early access to Block52</Text>
                              </Box>
                            </Flex>
                            <AccordionIcon color="#6366f1" />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={6}>
                            <Text fontSize="lg" fontWeight="bold" color="#6366f1">
                              $52 Token Utility
                            </Text>

                            <List spacing={3}>
                              <ListItem color="#99a2ba">
                                <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                Treasury-managed grants + rewards
                              </ListItem>
                              <ListItem color="#99a2ba">
                                <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                Bond to activate node rewards
                              </ListItem>
                              <ListItem color="#99a2ba">
                                <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                Pay transaction fees in gameplay
                              </ListItem>
                              <ListItem color="#99a2ba">
                                <ListIcon as={CheckCircleIcon} color="#6366f1" />
                                Govern protocol + treasury
                              </ListItem>
                            </List>

                            <Box bg="rgba(99, 102, 241, 0.2)" p={4} borderRadius="lg">
                              <Text fontSize="md" fontWeight="bold" mb={2} color="#6366f1">
                                Tokenomics
                              </Text>
                              <Text color="#99a2ba">Total Supply: 52,000,000</Text>
                            </Box>

                            <Link 
                              href="https://pitch.com/v/block52-token-metrics-spzn7n" 
                              isExternal 
                              color="#6366f1"
                              _hover={{ color: "#99a2ba" }}
                            >
                              View detailed tokenomics <ExternalLinkIcon mx="2px" />
                            </Link>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>

                      {/* Team & Vision Section */}
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
                              <Text fontSize="2xl" mr={3}>🤝</Text>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold" fontSize="lg" color="#6366f1">Team & Vision</Text>
                                <Text fontSize="sm" color="#99a2ba">Meet the team behind Block52</Text>
                              </Box>
                            </Flex>
                            <AccordionIcon color="#6366f1" />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={6}>
                            <Text fontSize="lg" fontWeight="bold" color="#6366f1">
                              Our Leadership Team
                            </Text>

                            <List spacing={4}>
                              <ListItem>
                                <Text fontWeight="bold" color="#6366f1">Lucas Cullen</Text>
                                <Text fontSize="sm" color="#99a2ba">
                                  Founder of DLTx, Bitcoin Brisbane, former Consensys developer
                                </Text>
                              </ListItem>
                              <ListItem>
                                <Text fontWeight="bold" color="#6366f1">Dan Dzian</Text>
                                <Text fontSize="sm" color="#99a2ba">
                                  Founder of Horselink and professional poker player
                                </Text>
                              </ListItem>
                              <ListItem>
                                <Text fontWeight="bold" color="#6366f1">Tom Miller</Text>
                                <Text fontSize="sm" color="#99a2ba">
                                  PhD in Blockchain and first employee at Consensys Australia
                                </Text>
                              </ListItem>
                              <ListItem>
                                <Text fontWeight="bold" color="#6366f1">Max Hunt</Text>
                                <Text fontSize="sm" color="#99a2ba">
                                  Co-Founder of SuperMassive, Former CBDO of Otaris
                                </Text>
                              </ListItem>
                              <ListItem>
                                <Text fontWeight="bold" color="#6366f1">Steven Alexiou</Text>
                                <Text fontSize="sm" color="#99a2ba">
                                  Co-Founder of SuperMassive, Former head of investments at Faculty Group
                                </Text>
                              </ListItem>
                            </List>

                            <Box bg="rgba(153, 162, 186, 0.2)" p={4} borderRadius="lg">
                              <Text fontSize="md" fontWeight="medium" color="#99a2ba">
                                Backed by early angel investor Young Global Leader World Economic Forum, and angel in 30+ startups including Ren Project, Quadrant, PowerLedger, and ThorChain.
                              </Text>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>

                    {/* Resources Section */}
                    <Box mt={8} p={6} bg="rgba(0, 0, 0, 0.5)" borderRadius="xl">
                      <Heading size="md" mb={4} color="#6366f1">
                        Additional Resources
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Link 
                          href="https://block52.xyz" 
                          isExternal
                          _hover={{ textDecoration: "none" }}
                        >
                          <Box 
                            p={4} 
                            bg="rgba(99, 102, 241, 0.2)" 
                            borderRadius="lg" 
                            boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                            _hover={{ 
                              transform: "translateY(-2px)", 
                              boxShadow: "0 0 30px rgba(10, 11, 44, 0.6), 0 0 15px rgba(10, 13, 51, 0.5), 0 0 25px rgba(0, 0, 0, 0.4)"
                            }} 
                            transition="all 0.3s"
                          >
                            <Text fontSize="2xl" mb={2}>🌐</Text>
                            <Text fontWeight="bold" color="#6366f1">Website</Text>
                            <Text fontSize="sm" color="#99a2ba">Visit Block52.xyz</Text>
                          </Box>
                        </Link>
                        <Link 
                          href="https://twitter.com/block52xyz" 
                          isExternal
                          _hover={{ textDecoration: "none" }}
                        >
                          <Box 
                            p={4} 
                            bg="rgba(99, 102, 241, 0.2)" 
                            borderRadius="lg" 
                            boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                            _hover={{ 
                              transform: "translateY(-2px)", 
                              boxShadow: "0 0 30px rgba(10, 11, 44, 0.6), 0 0 15px rgba(10, 13, 51, 0.5), 0 0 25px rgba(0, 0, 0, 0.4)"
                            }} 
                            transition="all 0.3s"
                          >
                            <Text fontSize="2xl" mb={2}>🐦</Text>
                            <Text fontWeight="bold" color="#6366f1">Twitter</Text>
                            <Text fontSize="sm" color="#99a2ba">Follow @block52xyz</Text>
                          </Box>
                        </Link>
                        <Link 
                          href="https://pitch.com/v/block52-cvm-2xt7k8" 
                          isExternal
                          _hover={{ textDecoration: "none" }}
                        >
                          <Box 
                            p={4} 
                            bg="rgba(153, 162, 186, 0.2)" 
                            borderRadius="lg" 
                            boxShadow="0 0 20px rgba(10, 11, 44, 0.4), 0 0 10px rgba(10, 13, 51, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)"
                            _hover={{ 
                              transform: "translateY(-2px)", 
                              boxShadow: "0 0 30px rgba(10, 11, 44, 0.6), 0 0 15px rgba(10, 13, 51, 0.5), 0 0 25px rgba(0, 0, 0, 0.4)"
                            }} 
                            transition="all 0.3s"
                          >
                            <Text fontSize="2xl" mb={2}>📊</Text>
                            <Text fontWeight="bold" color="#6366f1">Pitch Deck</Text>
                            <Text fontSize="sm" color="#99a2ba">View Presentation</Text>
                          </Box>
                        </Link>
                      </SimpleGrid>
                    </Box>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default Block52EventPage;
