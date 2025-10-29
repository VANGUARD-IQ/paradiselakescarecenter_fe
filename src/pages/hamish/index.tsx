import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  Divider,
  useColorMode,
  Flex,
  Button,
  HStack,
} from '@chakra-ui/react';
import { getColor } from '../../brandConfig';
import { FaPlay, FaClock, FaBook, FaUserGraduate, FaRocket, FaCog } from 'react-icons/fa';
import PageContainer from './PageContainer';

interface VideoSection {
  title: string;
  description: string;
  videos: VideoPlaceholder[];
  icon: any;
  color: string;
}

interface VideoPlaceholder {
  id: string;
  title: string;
  duration: string;
  description: string;
  isCompleted?: boolean;
}

const HamishTraining: React.FC = () => {
  const { colorMode } = useColorMode();

  // Placeholder training sections
  const trainingSections: VideoSection[] = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of navigating and using the system',
      icon: FaRocket,
      color: 'green',
      videos: [
        {
          id: 'gs-1',
          title: 'Welcome & System Overview',
          duration: '5:30',
          description: 'Introduction to the platform and its key features',
        },
        {
          id: 'gs-2',
          title: 'Initial Setup & Configuration',
          duration: '8:45',
          description: 'Set up your account and configure basic settings',
        },
        {
          id: 'gs-3',
          title: 'Dashboard Navigation',
          duration: '6:20',
          description: 'Learn how to navigate the main dashboard and menus',
        },
      ],
    },
    {
      title: 'Client Management',
      description: 'Master client creation, management, and communication',
      icon: FaUserGraduate,
      color: 'blue',
      videos: [
        {
          id: 'cm-1',
          title: 'Adding New Clients',
          duration: '7:15',
          description: 'Step-by-step guide to creating client profiles',
        },
        {
          id: 'cm-2',
          title: 'Managing Client Information',
          duration: '9:30',
          description: 'Update and maintain client records effectively',
        },
        {
          id: 'cm-3',
          title: 'Client Communication Tools',
          duration: '11:00',
          description: 'Use SMS, email, and other communication features',
        },
      ],
    },
    {
      title: 'Projects & Tasks',
      description: 'Learn project management and task tracking features',
      icon: FaBook,
      color: 'purple',
      videos: [
        {
          id: 'pt-1',
          title: 'Creating Projects',
          duration: '8:00',
          description: 'Set up and configure new projects',
        },
        {
          id: 'pt-2',
          title: 'Task Management',
          duration: '10:15',
          description: 'Create, assign, and track tasks efficiently',
        },
        {
          id: 'pt-3',
          title: 'Project Reporting',
          duration: '7:45',
          description: 'Generate and understand project reports',
        },
      ],
    },
    {
      title: 'Billing & Invoicing',
      description: 'Handle billing, invoicing, and payment processing',
      icon: FaClock,
      color: 'orange',
      videos: [
        {
          id: 'bi-1',
          title: 'Creating Invoices',
          duration: '9:00',
          description: 'Generate professional invoices for clients',
        },
        {
          id: 'bi-2',
          title: 'Payment Processing',
          duration: '12:30',
          description: 'Accept and manage client payments',
        },
        {
          id: 'bi-3',
          title: 'Billing Reports',
          duration: '6:45',
          description: 'Track revenue and payment history',
        },
      ],
    },
    {
      title: 'Advanced Features',
      description: 'Explore automation, integrations, and advanced tools',
      icon: FaCog,
      color: 'red',
      videos: [
        {
          id: 'af-1',
          title: 'Automation Setup',
          duration: '14:00',
          description: 'Configure automated workflows and processes',
        },
        {
          id: 'af-2',
          title: 'Third-Party Integrations',
          duration: '11:30',
          description: 'Connect with external tools and services',
        },
        {
          id: 'af-3',
          title: 'Custom Configurations',
          duration: '13:15',
          description: 'Customize the system for your specific needs',
        },
      ],
    },
  ];

  const handlePlayVideo = (videoId: string) => {
    // Placeholder for video playback functionality
    console.log(`Playing video: ${videoId}`);
    // TODO: Implement video player modal or navigation
  };

  return (
    <PageContainer title="Training Center">
      <Box bg={getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode)} minH="100vh" py={8}>
        <Container maxW="7xl">
          {/* Header Section */}
          <VStack spacing={2} mb={10} align="center">
            <Heading size="2xl" textAlign="center">
              Welcome to the Training Center
            </Heading>
            <Text fontSize="xl" color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)} textAlign="center">
              Learn everything you need to know about using the system effectively
            </Text>
            <HStack spacing={4} mt={4}>
              <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                15 Videos Available
              </Badge>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                Beginner to Advanced
              </Badge>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                ~3 Hours Total
              </Badge>
            </HStack>
          </VStack>

          {/* Progress Overview */}
          <Card mb={8} bg={getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode)} borderColor={getColor("border.darkCard", colorMode)} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="md" mb={2}>Your Learning Progress</Heading>
                  <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
                    Complete all training modules to become a system expert
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="3xl" fontWeight="bold" color={getColor("primary", colorMode)}>
                    0%
                  </Text>
                  <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>Completed</Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Training Sections */}
          <VStack spacing={8} align="stretch">
            {trainingSections.map((section, index) => (
              <Box key={index}>
                <Flex align="center" mb={4}>
                  <Icon as={section.icon} boxSize={6} color={`${section.color}.500`} mr={3} />
                  <Box>
                    <Heading size="lg">{section.title}</Heading>
                    <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>{section.description}</Text>
                  </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {section.videos.map((video) => (
                    <Card
                      key={video.id}
                      bg={getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode)}
                      borderColor={getColor("border.darkCard", colorMode)}
                      borderWidth="1px"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: colorMode === 'light' ? 'lg' : getColor("components.card.hoverShadow", colorMode),
                        borderColor: `${section.color}.500`
                      }}
                      transition="all 0.2s"
                      cursor="pointer"
                      onClick={() => handlePlayVideo(video.id)}
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="start">
                          <Box flex="1">
                            <Heading size="sm" mb={1}>
                              {video.title}
                            </Heading>
                            <HStack spacing={2}>
                              <Icon as={FaClock} boxSize={3} color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} />
                              <Text fontSize="sm" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)}>
                                {video.duration}
                              </Text>
                            </HStack>
                          </Box>
                          <Icon 
                            as={FaPlay} 
                            boxSize={8} 
                            color={`${section.color}.500`}
                            opacity={0.7}
                            _hover={{ opacity: 1 }}
                          />
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm" color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
                          {video.description}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                {index < trainingSections.length - 1 && (
                  <Divider mt={8} borderColor={getColor("border.darkCard", colorMode)} />
                )}
              </Box>
            ))}
          </VStack>

          {/* Help Section */}
          <Card mt={10} bg={getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode)} borderColor={getColor("border.darkCard", colorMode)} borderWidth="1px">
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md">Need Additional Help?</Heading>
                <Text textAlign="center" color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
                  If you have questions or need assistance beyond these training videos,
                  our support team is here to help.
                </Text>
                <HStack spacing={4}>
                  <Button colorScheme="blue" size="lg">
                    Contact Support
                  </Button>
                  <Button variant="outline" colorScheme="blue" size="lg">
                    View Documentation
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Coming Soon Notice */}
          <Box
            mt={8}
            p={4}
            bg={colorMode === 'light' ? "yellow.50" : "rgba(251, 191, 36, 0.1)"}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colorMode === 'light' ? "yellow.200" : "rgba(251, 191, 36, 0.3)"}
          >
            <Text
              fontWeight="bold"
              color={colorMode === 'light' ? "yellow.800" : getColor("starYellow", colorMode)}
              mb={2}
            >
              🎬 Videos Coming Soon!
            </Text>
            <Text color={colorMode === 'light' ? "yellow.700" : getColor("text.secondaryDark", colorMode)}>
              We're currently producing high-quality training videos for each section.
              Check back soon for comprehensive video tutorials that will help you master every aspect of the system.
            </Text>
          </Box>
        </Container>
      </Box>
    </PageContainer>
  );
};

export default HamishTraining;