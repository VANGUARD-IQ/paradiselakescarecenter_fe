import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Badge,
  Stack,
  Divider,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FaCheckCircle, FaServer, FaChartLine, FaRocket, FaExchangeAlt, FaTachometerAlt, FaLifeRing } from 'react-icons/fa';
import { MdSecurity, MdBackup } from 'react-icons/md';

interface MaintenancePlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  icon: any;
  color: string;
}

const SiteMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [siteUrl, setSiteUrl] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('brand.500', 'brand.400');

  const plans: MaintenancePlan[] = [
    {
      name: 'Site Maintenance',
      price: 97,
      description: 'Essential hosting and maintenance for one site',
      icon: FaServer,
      color: 'blue.500',
      features: [
        'Hosting infrastructure (up to 5GB)',
        'SSL certificate management',
        'Daily automated backups',
        'Security monitoring',
        'Uptime monitoring (99.9% guarantee)',
        'Monthly performance reports',
        'Critical security updates',
        'DNS management',
        'Email support',
      ],
    },
    {
      name: 'No-Effort Premium',
      price: 297,
      description: 'Complete hands-off site management',
      icon: FaRocket,
      color: 'purple.500',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        'Everything in Site Maintenance',
        'Weekly proactive maintenance',
        'Performance optimization',
        'Plugin/dependency updates',
        'CDN integration for speed',
        'Priority support (4hr SLA)',
        'Quarterly site audits',
        'Database optimization',
        'Image optimization',
        'Advanced caching setup',
      ],
    },
    {
      name: 'Growth Partner',
      price: 597,
      description: 'Your technical partner for growth',
      icon: FaChartLine,
      color: 'green.500',
      features: [
        'Everything in No-Effort Premium',
        'Bi-weekly feature updates',
        'A/B testing implementation',
        'Analytics reporting',
        'SEO monitoring & tweaks',
        'Conversion optimization',
        '2hrs/month development changes',
        'API monitoring',
        'Load testing',
        'Custom performance dashboards',
        'Dedicated account manager',
      ],
    },
  ];

  const handoverOption = {
    name: 'Self-Host Handover',
    price: 497,
    description: 'One-time transfer for self-hosting',
    features: [
      'Complete documentation package',
      '30-day transition support',
      'Training session on maintenance',
      'Full backup of all configurations',
      'Deployment guide',
      'Security best practices guide',
      'Emergency contact for 30 days',
    ],
  };

  const handleGetStarted = (planName: string) => {
    if (!siteUrl) {
      toast({
        title: 'Site URL Required',
        description: 'Please enter your site URL to continue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedPlan(planName);
    toast({
      title: 'Setting up your plan',
      description: `Preparing ${planName} for ${siteUrl}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Navigate to subscription setup with site details
    navigate(`/profile/subscription-checkout?plan=${encodeURIComponent(planName)}&site=${encodeURIComponent(siteUrl)}`);
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Badge colorScheme="green" fontSize="md" px={3} py={1}>
            DevOps as a Service
          </Badge>
          <Heading size="2xl">
            Site Maintenance & Hosting Plans
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl">
            Keep your site secure, fast, and always online. Choose the maintenance plan that fits your needs.
          </Text>
        </VStack>

        {/* Site URL Input */}
        <Box maxW="md" mx="auto" mb={12}>
          <FormControl>
            <FormLabel>Which site needs maintenance?</FormLabel>
            <Input
              placeholder="e.g., easypropertyinvestor.com.au"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              size="lg"
            />
          </FormControl>
        </Box>

        {/* Value Proposition Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={12}>
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>Average Downtime Cost</StatLabel>
            <StatNumber color="red.500">$5,600/hr</StatNumber>
            <StatHelpText>For small businesses</StatHelpText>
          </Stat>
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>Sites Hacked Daily</StatLabel>
            <StatNumber color="orange.500">30,000+</StatNumber>
            <StatHelpText>Due to poor maintenance</StatHelpText>
          </Stat>
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <StatLabel>Time Saved Monthly</StatLabel>
            <StatNumber color="green.500">15+ hrs</StatNumber>
            <StatHelpText>With our maintenance</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Maintenance Plans */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={12}>
          {plans.map((plan) => (
            <Box
              key={plan.name}
              bg={cardBg}
              borderRadius="lg"
              p={8}
              border="2px"
              borderColor={plan.highlighted ? highlightColor : borderColor}
              position="relative"
              transform={plan.highlighted ? 'scale(1.05)' : 'scale(1)'}
              boxShadow={plan.highlighted ? 'xl' : 'lg'}
            >
              {plan.badge && (
                <Badge
                  position="absolute"
                  top="-12px"
                  right="24px"
                  colorScheme="purple"
                  fontSize="sm"
                  px={3}
                  py={1}
                >
                  {plan.badge}
                </Badge>
              )}
              
              <VStack spacing={6} align="stretch">
                <Icon as={plan.icon} w={12} h={12} color={plan.color} />
                
                <Box>
                  <Heading size="lg" mb={2}>{plan.name}</Heading>
                  <Text color="gray.600">{plan.description}</Text>
                </Box>

                <Box>
                  <HStack align="baseline">
                    <Text fontSize="5xl" fontWeight="bold">${plan.price}</Text>
                    <Text fontSize="lg" color="gray.500">/month per site</Text>
                  </HStack>
                </Box>

                <Divider />

                <List spacing={3}>
                  {plan.features.map((feature, idx) => (
                    <ListItem key={idx} display="flex" alignItems="start">
                      <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                      <Text fontSize="sm">{feature}</Text>
                    </ListItem>
                  ))}
                </List>

                <Button
                  colorScheme={plan.highlighted ? 'purple' : 'blue'}
                  size="lg"
                  onClick={() => handleGetStarted(plan.name)}
                  isDisabled={!siteUrl}
                >
                  Get Started
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Divider my={12} />

        {/* Self-Hosting Option */}
        <Box bg={cardBg} borderRadius="lg" p={8} border="1px" borderColor={borderColor}>
          <Stack direction={{ base: 'column', lg: 'row' }} spacing={8} align="center">
            <Icon as={FaExchangeAlt} w={16} h={16} color="orange.500" />
            
            <Box flex={1}>
              <Heading size="lg" mb={3}>
                Prefer to Self-Host?
              </Heading>
              <Text color="gray.600" mb={4}>
                We understand some businesses prefer complete control. Our one-time handover package ensures a smooth transition.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {handoverOption.features.map((feature, idx) => (
                  <HStack key={idx} align="start">
                    <Icon as={FaCheckCircle} color="green.500" mt={1} />
                    <Text fontSize="sm">{feature}</Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>

            <Box textAlign="center">
              <Text fontSize="4xl" fontWeight="bold">${handoverOption.price}</Text>
              <Text color="gray.500" mb={4}>one-time</Text>
              <Button
                colorScheme="orange"
                size="lg"
                onClick={() => handleGetStarted('Self-Host Handover')}
                isDisabled={!siteUrl}
              >
                Get Handover Package
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Why Maintenance Matters */}
        <Box mt={16}>
          <Heading size="xl" mb={8} textAlign="center">
            Why Professional Maintenance Matters
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <VStack
              p={6}
              bg={cardBg}
              borderRadius="lg"
              align="start"
              spacing={3}
            >
              <Icon as={MdSecurity} w={8} h={8} color="red.500" />
              <Heading size="md">Security</Heading>
              <Text fontSize="sm" color="gray.600">
                78% of hacked sites are compromised due to outdated software
              </Text>
            </VStack>

            <VStack
              p={6}
              bg={cardBg}
              borderRadius="lg"
              align="start"
              spacing={3}
            >
              <Icon as={FaTachometerAlt} w={8} h={8} color="blue.500" />
              <Heading size="md">Performance</Heading>
              <Text fontSize="sm" color="gray.600">
                Sites slow down 40% within 6 months without optimization
              </Text>
            </VStack>

            <VStack
              p={6}
              bg={cardBg}
              borderRadius="lg"
              align="start"
              spacing={3}
            >
              <Icon as={MdBackup} w={8} h={8} color="green.500" />
              <Heading size="md">Backups</Heading>
              <Text fontSize="sm" color="gray.600">
                60% of businesses that lose data shut down within 6 months
              </Text>
            </VStack>

            <VStack
              p={6}
              bg={cardBg}
              borderRadius="lg"
              align="start"
              spacing={3}
            >
              <Icon as={FaLifeRing} w={8} h={8} color="purple.500" />
              <Heading size="md">Support</Heading>
              <Text fontSize="sm" color="gray.600">
                Get issues resolved in hours, not days or weeks
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        {/* FAQ Section */}
        <Box mt={16}>
          <Heading size="xl" mb={8} textAlign="center">
            Frequently Asked Questions
          </Heading>
          
          <Stack spacing={4} maxW="3xl" mx="auto">
            <Box p={6} bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={2}>What happens if I want to cancel?</Heading>
              <Text color="gray.600">
                All plans are month-to-month with no lock-in contracts. Cancel anytime with 30 days notice, and we'll provide a complete handover.
              </Text>
            </Box>

            <Box p={6} bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={2}>Can I upgrade or downgrade?</Heading>
              <Text color="gray.600">
                Yes! You can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.
              </Text>
            </Box>

            <Box p={6} bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={2}>Do you work with custom-built sites?</Heading>
              <Text color="gray.600">
                Absolutely! We specialize in maintaining custom React sites, WordPress, and other platforms. The same great service applies.
              </Text>
            </Box>

            <Box p={6} bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={2}>What's included in the 2hrs of development time?</Heading>
              <Text color="gray.600">
                Growth Partner plans include 2 hours monthly for small changes like updating content, adding features, or fixing bugs. Unused hours don't roll over.
              </Text>
            </Box>
          </Stack>
        </Box>

        {/* CTA Section */}
        <Box
          mt={16}
          p={12}
          bg={`linear-gradient(135deg, ${useColorModeValue('purple.500', 'purple.600')}, ${useColorModeValue('blue.500', 'blue.600')})`}
          borderRadius="xl"
          textAlign="center"
          color="white"
        >
          <Heading size="xl" mb={4}>
            Ready to Never Worry About Your Site Again?
          </Heading>
          <Text fontSize="lg" mb={8}>
            Join hundreds of businesses that trust us with their digital presence
          </Text>
          <Button
            size="lg"
            colorScheme="whiteAlpha"
            bg="white"
            color="purple.600"
            _hover={{ bg: 'gray.100' }}
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
          >
            Choose Your Plan
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SiteMaintenance;