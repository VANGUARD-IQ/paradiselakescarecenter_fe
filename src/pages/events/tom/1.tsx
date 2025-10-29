import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
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
const EVENT_START_TIME = new Date("2025-05-20T12:30:00+10:00");

const Event1Page = () => {
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
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
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
                LifeEssentialsClub Special Event
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Hosted by Tom Miller
              </Text>
              <Text fontSize="md" color="gray.500" mt={2}>
                Event Time: May 20, 2025 at 12:30 PM (Brisbane Time)
              </Text>
              <Text fontSize="md" color="gray.500">
                Current Time: {currentTime.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}
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
                  Join us for an exciting exploration of how we&apos;re building a new digital culture using web3 tools. This event marks the beginning of our journey to create a more transparent and accountable future.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🌐</Text>
                      <Text fontWeight="bold">1. Digital Culture Vision</Text>
                    </Flex>
                    <Text>Exploring how web3 tools can enhance human connection and accountability</Text>
                  </Box>
                  <Box p={4} bg="green.50" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>⛓️</Text>
                      <Text fontWeight="bold">2. Web3 Integration</Text>
                    </Flex>
                    <Text>How we&apos;re using blockchain technology to build trust and transparency</Text>
                  </Box>
                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>🤝</Text>
                      <Text fontWeight="bold">3. Human Fabric Framework</Text>
                    </Flex>
                    <Text>Creating a new model for organizational accountability and information access</Text>
                  </Box>
                  <Box p={4} bg="orange.50" borderRadius="md">
                    <Flex align="center" mb={2}>
                      <Text fontSize="2xl" mr={2}>👥</Text>
                      <Text fontWeight="bold">4. Community Building</Text>
                    </Flex>
                    <Text>How we can work together to shape this new digital culture</Text>
                  </Box>
                </SimpleGrid>

                <Text fontSize="lg">
                  This event serves as our first step in testing and building this new digital culture. We&apos;ll discuss Tom&apos;s crypto projects and explore how Life Essentials Club is pioneering the use of web3 tools to create a more transparent and connected future.
                </Text>

                {/* About Tom Section */}
                <Box 
                  p={{ base: 4, md: 6 }} 
                  bg="white" 
                  borderRadius="xl" 
                  boxShadow="lg"
                  border="1px solid"
                  borderColor="gray.200"
                  mt={8}
                >
                  <Flex 
                    direction={{ base: "column", md: "row" }} 
                    gap={{ base: 6, md: 8 }} 
                    align="center"
                  >
                    <Box
                      flex="1"
                      height={{ base: "250px", md: "300px" }}
                      width={{ base: "100%", md: "auto" }}
                      borderRadius="xl"
                      overflow="hidden"
                      position="relative"
                      maxW={{ base: "300px", md: "none" }}
                      mx="auto"
                    >
                      <Image
                        src="/tomprofile.jpeg"
                        alt="Tom Miller"
                        objectFit="contain"
                        width="100%"
                        height="100%"
                        bg="white"
                      />
                    </Box>
                    <Box flex="1" textAlign={{ base: "center", md: "left" }}>
                      <Heading size="lg" color="#2F855A" mb={4}>
                        About Your Host: Tom Miller
                      </Heading>
                      <Text color="gray.700" fontSize={{ base: "md", md: "lg" }} mb={4}>
                        Tom brings his expertise in blockchain technology and supply chain transparency 
                        to the Life Essentials Club. As a PhD candidate in Blockchain Security at Queensland 
                        University of Technology and published scholar, Tom combines academic rigor with over 
                        a decade of practical blockchain development experience.
                      </Text>
                      <Text color="gray.700" fontSize={{ base: "md", md: "lg" }} mb={4}>
                        His services include custom website development, blockchain integration solutions, 
                        secure crypto payment systems, and transparent supply chain tracking. Tom specializes in 
                        creating secure, decentralized systems that enhance human connection rather than replace it.
                      </Text>
                      <Flex 
                        gap={4} 
                        mt={6} 
                        direction={{ base: "column", sm: "row" }}
                        justify={{ base: "center", md: "flex-start" }}
                      >
                        <Button
                          as={RouterLink}
                          to="/founders"
                          colorScheme="green"
                          size={{ base: "md", md: "lg" }}
                          width={{ base: "full", sm: "auto" }}
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
                          }}
                          transition="all 0.3s ease"
                        >
                          Learn More About Tom
                        </Button>
                        <Button
                          as="a"
                          href="mailto:tom@lifeessentials.club"
                          colorScheme="blue"
                          size={{ base: "md", md: "lg" }}
                          width={{ base: "full", sm: "auto" }}
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
                          }}
                          transition="all 0.3s ease"
                        >
                          Contact Tom
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>

                {/* Module Content Section - Only visible when event is live */}
                {timeLeft.isLive && (
                  <Box mt={12}>
                    <Heading size="lg" color="#2c5282" mb={6}>
                      Event Content
                    </Heading>
                    <Text fontSize="lg" mb={8}>
                      Click on each module below to explore the content we&apos;ll cover during the event.
                    </Text>

                    <Accordion allowMultiple>
                      <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="lg" mb={4}>
                        <h2>
                          <AccordionButton py={4}>
                            <Flex align="center" flex="1">
                              <Text fontSize="2xl" mr={3}>🌐</Text>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold" fontSize="lg">Digital Culture Vision</Text>
                                <Text fontSize="sm" color="gray.600">Understanding the future of digital interaction</Text>
                              </Box>
                            </Flex>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={6}>
                            <Text fontSize="lg" fontWeight="bold" color="blue.600">
                              This is your invitation to a new way of living and working - a place where you can find support, opportunities, and the tools to create the life you want.
                            </Text>

                            <Box bg="orange.50" p={4} borderRadius="lg" border="1px solid" borderColor="orange.200">
                              <Text fontSize="md" fontWeight="medium" color="orange.800">
                                🚀 Remember: This is a journey, not a destination. We&apos;re building something meaningful together, step by step. Rome wasn&apos;t built in a day, and neither is a new way of living and working. But with consistent effort and community support, we can create lasting change.
                              </Text>
                            </Box>

                            <Box maxW="600px" mx="auto">
                              <Image
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                                alt="Digital Community Gathering"
                                borderRadius="xl"
                                mb={2}
                                boxShadow="lg"
                              />
                              <Text fontSize="sm" color="gray.600" textAlign="center">
                                A community where you can break free from the 9-to-5 mindset and discover new possibilities for your life
                              </Text>
                            </Box>

                            <Text>• Your Data, Your Control: No more worrying about who has access to your information - you decide who sees what</Text>
                            <Text>• Safe from Exploitation: Learn how to protect yourself from scams and build wealth on your own terms</Text>
                            <Text>• Expert Guidance: Get help from people who understand the new digital world and can guide you through it</Text>
                            <Text>• Regular Support: Join a community that meets regularly to help each other grow and succeed</Text>
                            <Text>• Future-Proof Skills: Learn the tools and technologies that will shape the future of work and business</Text>

                            <Box bg="blue.50" p={4} borderRadius="lg">
                              <Text fontSize="md" fontWeight="medium">
                                This isn&apos;t just another meeting - it&apos;s your gateway to a community of people who are creating new opportunities and breaking free from traditional constraints. Whether you want to start a business, learn new skills, or find better ways to manage your digital life, you&apos;ll find the support and tools you need here. Together, we&apos;ll take this journey one step at a time, building something meaningful for the long term.
                              </Text>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>

                    {/* Upcoming Modules Preview */}
                    <Box mt={8} p={6} bg="gray.50" borderRadius="xl">
                      <Heading size="md" mb={4} color="gray.700">
                        Upcoming Modules
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                          <Text fontSize="2xl" mb={2}>⛓️</Text>
                          <Text fontWeight="bold">Web3 Integration</Text>
                          <Text fontSize="sm" color="gray.600">Coming soon</Text>
                        </Box>
                        <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                          <Text fontSize="2xl" mb={2}>🤝</Text>
                          <Text fontWeight="bold">Human Fabric Framework</Text>
                          <Text fontSize="sm" color="gray.600">Coming soon</Text>
                        </Box>
                        <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                          <Text fontSize="2xl" mb={2}>👥</Text>
                          <Text fontWeight="bold">Community Building</Text>
                          <Text fontSize="sm" color="gray.600">Coming soon</Text>
                        </Box>
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

export default Event1Page;
