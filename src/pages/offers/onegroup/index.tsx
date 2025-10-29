import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  AspectRatio,
  useColorMode,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { gql, useQuery } from '@apollo/client';
import { getColor } from '../../../brandConfig';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ProposalSigningSection } from '../../proposals/components/ProposalSigningSection';

const PUBLIC_GET_PROPOSAL = gql`
  query PublicGetProposal($slug: String!, $tenantId: String!) {
    publicProposal(slug: $slug, tenantId: $tenantId) {
      id
      projectId
      title
    }
  }
`;

const OneGroupStructuredProposal: React.FC = () => {
  const { colorMode } = useColorMode();
  const [showAgreement, setShowAgreement] = useState(true);

  // Fetch proposal to get project ID
  const { data: proposalData, loading: loadingProposal } = useQuery(PUBLIC_GET_PROPOSAL, {
    variables: {
      slug: 'onegroup',
      tenantId: '684d0930cc7a27bb01ac83ce'
    }
  });

  // Video URL
  const VIDEO_URL = "https://scarlet-professional-perch-484.mypinata.cloud/ipfs/bafybeig6mqxp5eazs2eqyvsz7ucjpne7hsn6di5dgt5kdzazlz5y4xlnz4?pinataGatewayToken=iV2thLpd6huZwgwEQIv6a1Wh3XNIAcOA1c0qcCpWgb5v_321BFsY_3yfbC2EPxg3";

  // Colors
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = colorMode === 'light'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 248, 248, 0.65) 50%, rgba(255, 255, 255, 0.7) 100%)'
    : 'linear-gradient(135deg, rgba(20, 20, 20, 0.7) 0%, rgba(30, 30, 30, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)';
  const cardBorder = colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const textPrimary = getColor(colorMode === 'light' ? 'text.primary' : 'text.primaryDark', colorMode);
  const textSecondary = getColor(colorMode === 'light' ? 'text.secondary' : 'text.secondaryDark', colorMode);
  const primaryBlue = getColor('primary', colorMode);
  const successGreen = getColor('status.success', colorMode);

  const calculatorCategories = [
    {
      category: 'Refinance/Loan Calculators',
      items: [
        { name: 'Refinance + Solar Savings Calculator', path: '/tools/refinance-solar', keyword: 'refinance solar savings calculator' },
        { name: 'Borrowing Power Calculator', path: '/tools/borrowing-power', keyword: 'borrowing power calculator' },
        { name: 'Refinance Savings Calculator', path: '/tools/refinance', keyword: 'refinance savings calculator' },
        { name: 'Loan Comparison Calculator', path: '/tools/comparison', keyword: 'loan comparison calculator' },
        { name: 'Personal/Asset Finance Calculator', path: '/tools/personal-asset', keyword: 'personal finance calculator and asset finance calculator' },
        { name: 'Finance Calculator *', path: '', keyword: 'finance calculator' },
      ]
    },
    {
      category: 'Solar-Specific Calculators',
      items: [
        { name: 'Solar Savings Calculator', path: '/tools/solar-savings', keyword: 'solar savings calculator' },
        { name: 'Solar & Battery + Property Investment Tax Benefits Calculator', path: '', keyword: 'solar battery tax benefits calculator' },
        { name: 'Solar Loan Calculator', path: '/tools/solar-loan', keyword: 'solar loan calculator' },
        { name: 'Solar Value-Add Calculator', path: '', keyword: 'solar property value calculator' },
        { name: 'Battery Storage ROI Calculator *', path: '', keyword: 'battery storage roi calculator' },
        { name: 'Battery Rebate Calculator *', path: '', keyword: 'battery rebate calculator' },
      ]
    },
    {
      category: 'Property Investment Calculators',
      items: [
        { name: 'SMSF Property Calculator', path: '/tools/smsf', keyword: 'smsf property calculator' },
        { name: 'Stamp Duty Calculator', path: '/tools/stamp-duty', keyword: 'stamp duty calculator' },
        { name: 'Property Investment ROI Calculator', path: '/tools/investment-calculator', keyword: 'property investment roi calculator' },
        { name: 'Rental Yield Calculator', path: '/tools/rental-yield', keyword: 'rental yield calculator' },
        { name: 'Portfolio Growth Projector', path: '/tools/portfolio-growth', keyword: 'property portfolio calculator' },
      ]
    },
    {
      category: 'Integrated Property + Solar Calculators',
      items: [
        { name: 'Property + Solar ROI Calculator', path: '/tools/property-solar-roi', keyword: 'property solar roi calculator' },
        { name: 'Property + Solar Value Calculator', path: '/tools/property-solar-value', keyword: 'solar increase property value calculator' },
        { name: 'Investment Property + Solar ROI Calculator', path: '/tools/investment-solar-roi', keyword: 'investment property solar calculator' },
        { name: 'Tax Optimization Calculator', path: '/tools/tax-optimization', keyword: 'property solar tax benefits calculator' },
      ]
    },
    {
      category: 'Utility Comparison',
      items: [
        { name: 'Bill Comparison Calculator *', path: '', keyword: 'bill comparison calculator' },
      ]
    }
  ];

  const investmentFeatures = [
    'Unified Dashboard Foundation: Combines GoHighLevel + Pipedrive (what WordPress/Webflow can\'t do)',
    'Microservices for daily, weekly, monthly, yearly snapshots',
    'Bird\'s eye calendar for scheduling & automation across divisions',
    'Then Monthly Features: Cross-Vertical Analytics (CAC, CLV, MRR)',
    'Customer journey tracking: Solar → Finance → Property',
    'Sales pipeline conversion across all divisions',
    'Employee productivity dashboards by division',
    'Referral tracking showing compounding effect',
    'Lead source attribution with cross-vertical flow',
    'Due diligence data export (investment-ready data room)',
  ];

  const milestones = [
    { amount: '$2,000', title: 'Project Kickoff', desc: 'Initializing boilerplate and unified site structure' },
    { amount: '$4,797', title: 'Core Pages & Infrastructure', desc: 'SEO module, authentication, 3-vertical navigation' },
    { amount: '$4,000', title: 'All Three Divisions & Calculators', desc: 'Solar, Finance, Property pages + 20+ calculators' },
    { amount: '$4,000', title: 'CRM Integration & Legal Docs', desc: 'Cross-vertical CRM integration, legal pages' },
    { amount: '$2,000', title: 'Launch & Team Training', desc: 'Train 2 people on all verticals, domain setup, launch' },
  ];

  const faqs = [
    {
      q: 'What if we want to cancel after 12 months?',
      a: '30 days notice, no penalties. Your site keeps working. We help you transition to new hosting if needed.',
    },
    {
      q: 'Can we change the calculators later?',
      a: "Yes! That's exactly what the monthly feature budget is for. Want to add a new calculator type? That's your monthly feature.",
    },
    {
      q: 'What if we need MORE than 1 feature per month?',
      a: "The real value is in the command module dashboard. You won't know what metrics you need until you see it working with your data. Once you use the dashboard, you'll naturally discover the next set of business metrics you want to track. That's exactly what this ongoing monthly feature is for - implementing those new metrics as your business needs evolve.",
    },
    {
      q: 'How long until we\'re live?',
      a: 'P.S. Timeline-wise: 8 weeks total, with most pages done in the first 4 weeks if we hit it hard. Pages will be ready for SEO optimization and content changes that your trained team can handle.',
    },
  ];

  return (
    <>
      <NavbarWithCallToAction />

      {/* Falling snow effect */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        zIndex={0}
        overflow="hidden"
      >
        {[...Array(50)].map((_, i) => {
          const startLeft = -20 + Math.random() * 60; // Start from diagonal left area
          const diagonalDistance = 30 + Math.random() * 40; // How far right it travels
          return (
            <Box
              key={i}
              position="absolute"
              top={-10}
              left={`${startLeft}%`}
              width="4px"
              height="4px"
              bg="white"
              borderRadius="50%"
              opacity={0.6}
              animation={`snowfall-diagonal-${i} ${10 + Math.random() * 15}s linear infinite`}
              sx={{
                animationDelay: `${Math.random() * 5}s`,
                [`@keyframes snowfall-diagonal-${i}`]: {
                  '0%': {
                    transform: 'translateY(-10px) translateX(0) rotate(-15deg)',
                    opacity: 0,
                  },
                  '10%': {
                    opacity: 0.6,
                  },
                  '90%': {
                    opacity: 0.6,
                  },
                  '100%': {
                    transform: `translateY(100vh) translateX(${diagonalDistance}vw) rotate(-15deg)`,
                    opacity: 0,
                  },
                },
              }}
            />
          );
        })}
      </Box>

      {/* Diagonal Sunshine Rays */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        zIndex={0}
        overflow="hidden"
      >
        {/* Main wide sunshine beam - narrower at top, wider at bottom */}
        <Box
          position="absolute"
          top="-30%"
          left="0%"
          width="0"
          height="0"
          borderStyle="solid"
          borderWidth="0 25vw 150vh 25vw"
          borderColor="transparent transparent rgba(255, 255, 255, 0.25) transparent"
          transform="rotate(-15deg)"
          transformOrigin="top center"
          animation="sunshine 12s ease-in-out infinite"
          filter="blur(40px)"
          sx={{
            '@keyframes sunshine': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 0.7 },
            },
          }}
        />

        {/* Flickering God Rays - random on/off like clouds passing */}
        <Box
          position="absolute"
          top="-10%"
          left="12%"
          width="1.5px"
          height="120%"
          background="rgba(255, 255, 255, 0.12)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker1 6s ease-in-out infinite"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker1': {
              '0%': { opacity: 0 },
              '10%': { opacity: 0.5 },
              '30%': { opacity: 0.3 },
              '50%': { opacity: 0 },
              '70%': { opacity: 0.4 },
              '100%': { opacity: 0 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="18%"
          width="1px"
          height="120%"
          background="rgba(255, 255, 255, 0.1)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker2 8s ease-in-out infinite 1s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker2': {
              '0%': { opacity: 0.3 },
              '25%': { opacity: 0 },
              '40%': { opacity: 0.5 },
              '60%': { opacity: 0.2 },
              '85%': { opacity: 0 },
              '100%': { opacity: 0.3 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="24%"
          width="1.5px"
          height="120%"
          background="rgba(255, 255, 255, 0.15)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker3 7s ease-in-out infinite 2s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker3': {
              '0%': { opacity: 0 },
              '20%': { opacity: 0.6 },
              '45%': { opacity: 0 },
              '65%': { opacity: 0.3 },
              '90%': { opacity: 0.5 },
              '100%': { opacity: 0 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="30%"
          width="1px"
          height="120%"
          background="rgba(255, 255, 255, 0.08)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker4 9s ease-in-out infinite 3s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker4': {
              '0%': { opacity: 0.4 },
              '30%': { opacity: 0 },
              '55%': { opacity: 0.3 },
              '75%': { opacity: 0 },
              '95%': { opacity: 0.2 },
              '100%': { opacity: 0.4 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="36%"
          width="1.5px"
          height="120%"
          background="rgba(255, 255, 255, 0.13)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker5 5.5s ease-in-out infinite 1.5s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker5': {
              '0%': { opacity: 0 },
              '15%': { opacity: 0.4 },
              '40%': { opacity: 0.6 },
              '60%': { opacity: 0 },
              '80%': { opacity: 0.3 },
              '100%': { opacity: 0 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="42%"
          width="1px"
          height="120%"
          background="rgba(255, 255, 255, 0.09)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker6 10s ease-in-out infinite 4s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker6': {
              '0%': { opacity: 0.2 },
              '25%': { opacity: 0.5 },
              '50%': { opacity: 0 },
              '70%': { opacity: 0.4 },
              '90%': { opacity: 0 },
              '100%': { opacity: 0.2 },
            },
          }}
        />
        <Box
          position="absolute"
          top="-10%"
          left="48%"
          width="1.5px"
          height="120%"
          background="rgba(255, 255, 255, 0.11)"
          transform="rotate(-15deg)"
          transformOrigin="top left"
          animation="flicker7 6.5s ease-in-out infinite 2.5s"
          filter="blur(1px)"
          sx={{
            '@keyframes flicker7': {
              '0%': { opacity: 0 },
              '20%': { opacity: 0.3 },
              '45%': { opacity: 0.5 },
              '65%': { opacity: 0 },
              '85%': { opacity: 0.4 },
              '100%': { opacity: 0 },
            },
          }}
        />
      </Box>

      {/* Hero Section */}
      <Box
        bg="transparent"
        minH="100vh"
        position="relative"
        overflow="hidden"
        width="100%"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: colorMode === 'light'
            ? 'radial-gradient(60% 60% at 0% 0%, rgba(248, 249, 250, 0.8) 0%, transparent 50%), radial-gradient(50% 50% at 50% 50%, #369eff33 0%, transparent 100%)'
            : 'radial-gradient(60% 60% at 0% 0%, rgba(17, 35, 52, 0.8) 0%, transparent 50%), radial-gradient(50% 50% at 50% 50%, #369eff33 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Container maxW="1200px" py={{ base: 8, md: 20 }} px={{ base: 4, md: 6 }} position="relative" zIndex={1}>

          {/* Above the Fold Hero */}
          <VStack spacing={{ base: 4, md: 6 }} align="center" mb={{ base: 8, md: 16 }}>
            <Badge
              colorScheme="blue"
              fontSize={{ base: "md", md: "lg" }}
              px={{ base: 4, md: 6 }}
              py={{ base: 2, md: 3 }}
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              🎯 Exclusive Proposal
            </Badge>

            <Heading
              fontSize={{ base: '2xl', sm: '3xl', md: '5xl', lg: '6xl' }}
              fontWeight="extrabold"
              textAlign="center"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              px={{ base: 2, md: 0 }}
            >
              One Group Website Development
            </Heading>

            <Text
              fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
              color={textSecondary}
              textAlign="center"
              maxW="900px"
              px={{ base: 2, md: 4 }}
            >
              Unified Digital Platform for Solar, Finance & Property Investment •
              80 Pages Across All Three Verticals • 20+ Cross-Vertical Calculators •
              Track the Compounding Customer Journey
            </Text>

            <Flex
              direction={{ base: 'column', sm: 'row' }}
              gap={{ base: 4, md: 8 }}
              pt={4}
              align="center"
            >
              <VStack spacing={1}>
                <Text fontSize="sm" color={textSecondary} textTransform="uppercase">
                  One-Time Build
                </Text>
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color={primaryBlue}>
                  $16,797
                </Text>
              </VStack>

              <Divider
                display={{ base: 'block', sm: 'none' }}
                w="60px"
              />
              <Divider
                display={{ base: 'none', sm: 'block' }}
                orientation="vertical"
                h="60px"
                mx={8}
              />

              <VStack spacing={1}>
                <Text fontSize="sm" color={textSecondary} textTransform="uppercase">
                  Monthly Service
                </Text>
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color={successGreen}>
                  $497/mo
                </Text>
              </VStack>
            </Flex>

            <Badge
              colorScheme="green"
              fontSize={{ base: "sm", md: "md" }}
              px={{ base: 3, md: 4 }}
              py={{ base: 1.5, md: 2 }}
              borderRadius="md"
            >
              Total Package Value: $28,500+
            </Badge>
          </VStack>

          {/* Video Section */}
          <Box
            position="relative"
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 8 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            overflow="hidden"
            width="100%"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorMode === 'light'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch" position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Heading size={{ base: "lg", md: "xl" }} color={textPrimary} textAlign="center">
                  See The Complete Walkthrough
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={textSecondary} textAlign="center">
                  Watch this 8-minute video to see:
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3} w="full" maxW="600px">
                  <HStack spacing={2}>
                    <CheckCircleIcon color={primaryBlue} flexShrink={0} />
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>All 80 pages mapped out</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CheckCircleIcon color={primaryBlue} flexShrink={0} />
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>Unified dashboard walkthrough</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CheckCircleIcon color={primaryBlue} flexShrink={0} />
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>GoHighLevel + Pipedrive integration</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CheckCircleIcon color={primaryBlue} flexShrink={0} />
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>How your team edits pages</Text>
                  </HStack>
                </Grid>
              </VStack>

              <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden">
                <video
                  controls
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                  }}
                >
                  <source src={VIDEO_URL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </AspectRatio>

              <Box
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)"
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                borderWidth={2}
                borderColor={primaryBlue}
                mt={4}
              >
                <HStack spacing={4} justify="center" align="start">
                  <CheckCircleIcon color={primaryBlue} boxSize={{ base: 6, md: 8 }} flexShrink={0} />
                  <VStack spacing={2} align="start">
                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textPrimary}>
                      Goal: Build the Ultimate Command Module for Your Business
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
                      Aggregate data from Pipedrive, GoHighLevel, Xero, Google Ads, and Facebook into daily, weekly, and monthly snapshots. Enable forecasting with manual data input capability.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Text fontSize="sm" color={textSecondary} textAlign="center">
                👇 Scroll down for detailed breakdown
              </Text>
            </VStack>
          </Box>

          {/* Value Proposition Grid */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={6}
            mb={16}
          >
            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">📊</Text>
                <Heading size="md" color={textPrimary}>
                  20+ Industry Calculators
                </Heading>
                <Text color={textSecondary}>
                  Tailored for organic SEO traffic in solar, finance, and property investment industries
                </Text>
              </VStack>
            </Box>

            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">📊</Text>
                <Heading size="md" color={textPrimary}>
                  Unified Dashboard
                </Heading>
                <Text color={textSecondary}>
                  Aggregates GoHighLevel + Pipedrive data in one view - what WordPress & Webflow can't do
                </Text>
              </VStack>
            </Box>

            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">💼</Text>
                <Heading size="md" color={textPrimary}>
                  Investment-Ready Data
                </Heading>
                <Text color={textSecondary}>
                  Track CAC, CLV, MRR, and all metrics investors demand for due diligence
                </Text>
              </VStack>
            </Box>

            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">✏️</Text>
                <Heading size="md" color={textPrimary}>
                  Train Your Team
                </Heading>
                <Text color={textSecondary}>
                  Edit content, manage SEO, update pages - no developer needed for changes
                </Text>
              </VStack>
            </Box>

            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">⛓️</Text>
                <Heading size="md" color={textPrimary}>
                  Blockchain & AI Ready
                </Heading>
                <Text color={textSecondary}>
                  Future-proof for smart contract automation and AI integrations
                </Text>
              </VStack>
            </Box>

            <Box
              bg={cardGradientBg}
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="xl"
              borderWidth={2}
              borderColor={cardBorder}
              shadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="4xl">🚀</Text>
                <Heading size="md" color={textPrimary}>
                  Ongoing Growth
                </Heading>
                <Text color={textSecondary}>
                  1 new investor-ready feature per month - continuous improvement
                </Text>
              </VStack>
            </Box>
          </Grid>

          {/* Calculators Section */}
          <Box
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={8} align="stretch">
              <VStack spacing={3}>
                <Heading size="xl" textAlign="center" color={textPrimary}>
                  Lead Generation Powerhouse: 20+ Industry Calculators
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center">
                  Tailored to attract organic SEO traffic across solar, finance, and property investment industries
                </Text>
              </VStack>

              {calculatorCategories.map((category, categoryIdx) => (
                <VStack key={categoryIdx} spacing={4} align="stretch">
                  <Heading size="md" color={primaryBlue}>
                    {category.category}
                  </Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    {category.items.map((calc, idx) => (
                      <HStack key={idx} spacing={3} align="start">
                        <CheckCircleIcon color={primaryBlue} mt={1} flexShrink={0} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color={textPrimary} fontSize="sm">
                            {calc.name}
                          </Text>
                          <Text fontSize="xs" color={textSecondary}>
                            Captures "{calc.keyword}" searches
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </Grid>
                  {categoryIdx < calculatorCategories.length - 1 && <Divider />}
                </VStack>
              ))}

              <Box
                bg="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
                p={4}
                borderRadius="lg"
                borderWidth={1}
                borderColor={successGreen}
              >
                <VStack spacing={2}>
                  <Text textAlign="center" fontWeight="bold" color={successGreen}>
                    💡 These alone are worth $15,000+ in SEO value
                  </Text>
                  <Text textAlign="center" fontSize="xs" color={textSecondary}>
                    * = Added from Lead Generation Powerhouse list
                  </Text>
                </VStack>
              </Box>

              <Box
                bg={colorMode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)'}
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                borderWidth={2}
                borderColor={primaryBlue}
                borderStyle="dashed"
              >
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <Text fontSize="xl">📋</Text>
                    <Text fontWeight="bold" color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                      What's Included in This Proposal
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} textAlign="center">
                    This proposal accounts for <Text as="span" fontWeight="bold" color={primaryBlue}>6 custom-logic calculators</Text> of your choice from the 22 identified above. Each calculator is fully customized with your branding, SEO optimization, and lead capture integration.
                  </Text>
                  <Divider />
                  <HStack spacing={2} flexWrap="wrap" justify="center">
                    <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} textAlign="center">
                      Want more calculators? Additional calculators can be built on request at
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={primaryBlue}>
                      $700/calculator
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Divider borderColor={cardBorder} />

              {/* Calculator Lead Magnet Ecosystem */}
              <Box
                bg="linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%)"
                p={{ base: 6, md: 8 }}
                borderRadius="xl"
                borderWidth={2}
                borderColor="purple.400"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.3), transparent 70%)',
                  pointerEvents: 'none',
                }}
              >
                <VStack spacing={4} position="relative" zIndex={1}>
                  <HStack spacing={3}>
                    <Text fontSize="3xl">🧲</Text>
                    <Heading size="lg" color={textPrimary} textAlign="center">
                      Calculator Lead Magnet Ecosystem
                    </Heading>
                  </HStack>

                  <Text fontSize={{ base: "md", md: "lg" }} color={textPrimary} textAlign="center" fontWeight="semibold" maxW="900px">
                    Position One Group as the industry-wide calculator authority. When customers search for ANY calculator in solar, finance, or property investment, they find YOU first.
                  </Text>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} w="full" pt={2}>
                    <VStack
                      bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
                      p={4}
                      borderRadius="lg"
                      spacing={2}
                    >
                      <Text fontSize="2xl">🎯</Text>
                      <Text fontWeight="bold" color={textPrimary} textAlign="center" fontSize="sm">
                        Capture Leads
                      </Text>
                      <Text fontSize="xs" color={textSecondary} textAlign="center">
                        Every calculator is a lead magnet targeting high-intent searches
                      </Text>
                    </VStack>

                    <VStack
                      bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
                      p={4}
                      borderRadius="lg"
                      spacing={2}
                    >
                      <Text fontSize="2xl">🔄</Text>
                      <Text fontWeight="bold" color={textPrimary} textAlign="center" fontSize="sm">
                        Nurture Through Ecosystem
                      </Text>
                      <Text fontSize="xs" color={textSecondary} textAlign="center">
                        Cross-promote between solar, finance, and property services
                      </Text>
                    </VStack>

                    <VStack
                      bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
                      p={4}
                      borderRadius="lg"
                      spacing={2}
                    >
                      <Text fontSize="2xl">💰</Text>
                      <Text fontWeight="bold" color={textPrimary} textAlign="center" fontSize="sm">
                        Convert Across Verticals
                      </Text>
                      <Text fontSize="xs" color={textSecondary} textAlign="center">
                        Turn single-service leads into multi-vertical customers
                      </Text>
                    </VStack>
                  </Grid>

                  <Box
                    bg={colorMode === 'light' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.25)'}
                    p={4}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor="purple.300"
                    mt={2}
                  >
                    <Text textAlign="center" fontWeight="bold" color="purple.300" fontSize={{ base: "sm", md: "md" }}>
                      ⚡ This isn't just SEO—it's a self-sustaining lead generation machine
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Investment-Ready Features */}
          <Box
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={8} align="stretch">
              <VStack spacing={3}>
                <Heading size="xl" textAlign="center" color={textPrimary}>
                  Built for Investment Readiness
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center" maxW="700px">
                  We build the unified dashboard foundation that combines GoHighLevel + Pipedrive - what WordPress/Webflow can't do - then add investment-ready features monthly
                </Text>
              </VStack>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {investmentFeatures.map((feature, idx) => (
                  <HStack key={idx} spacing={3} align="start">
                    <StarIcon color="yellow.400" mt={1} />
                    <Text color={textSecondary}>{feature}</Text>
                  </HStack>
                ))}
              </Grid>

              <Box
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)"
                p={6}
                borderRadius="lg"
                borderWidth={1}
                borderColor={primaryBlue}
              >
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                    This is the data room investors request
                  </Text>
                  <Text color={textSecondary} textAlign="center">
                    Most businesses spend 6 months preparing this data for due diligence. Your unified dashboard keeps it updated in real-time with daily, weekly, monthly, and yearly snapshots.
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Pricing Breakdown */}
          <Box
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={8} align="stretch">
              <Heading size="xl" textAlign="center" color={textPrimary}>
                Investment Breakdown
              </Heading>

              <VStack spacing={4} align="stretch">
                <Heading size="lg" color={textPrimary}>
                  ONE-TIME BUILD: $16,797
                </Heading>

                {milestones.map((milestone, idx) => (
                  <Box key={idx} p={5} bg={colorMode === 'dark' ? 'rgba(30, 30, 35, 0.8)' : 'gray.50'} borderRadius="lg">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" color={textSecondary}>
                          Milestone {idx + 1}
                        </Text>
                        <Heading size="md" color={textPrimary}>
                          {milestone.title}
                        </Heading>
                        <Text color={textSecondary}>
                          {milestone.desc}
                        </Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="bold" color={primaryBlue}>
                        {milestone.amount}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <Divider />

              <VStack spacing={4} align="stretch">
                <Heading size="lg" color={textPrimary}>
                  ONGOING: $497/MONTH
                </Heading>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <VStack align="start" spacing={2}>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Complete hosting & infrastructure</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Security updates & monitoring</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Daily backups & recovery</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>SSL certificates</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Performance optimization</Text></HStack>
                  </VStack>

                  <VStack align="start" spacing={2}>
                    <HStack><CheckCircleIcon color={successGreen} /><Text fontWeight="bold">1 new investor-ready feature/month</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Technical support</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>2 content editor licenses</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Database management</Text></HStack>
                    <HStack><CheckCircleIcon color={successGreen} /><Text>Software updates</Text></HStack>
                  </VStack>
                </Grid>
              </VStack>
            </VStack>
          </Box>

          {/* Comparison Table */}
          <Box
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Heading size={{ base: "lg", md: "xl" }} textAlign="center" color={textPrimary}>
                Why Not WordPress or Webflow?
              </Heading>

              <Box overflowX="auto" w="full">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Capability</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>WordPress/Webflow</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }} color={primaryBlue}>Native JavaScript Solution</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Technology Stack</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>Template-based, PHP/proprietary</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen} fontWeight="bold">Modern JavaScript (React/Node)</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Code Ownership</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Locked to platform</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ You own 100% of code</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Custom Features</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Plugin limitations</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Unlimited customization</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>AI Integration</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Limited chatbot plugins</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Full AI automation ready</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Web3 & Blockchain</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Not possible</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Native smart contract support</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Workflow Automation</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Basic Zapier integrations</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Custom automation engine</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Unified CRM Dashboard</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Can't aggregate data sources</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ GoHighLevel + Pipedrive unified</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Investment Analytics</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Basic reporting only</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ CAC, CLV, MRR tracking</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Performance</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>⚠️ Plugin bloat slows site</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Optimized, lightning fast</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Scalability</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>⚠️ Database limitations</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Enterprise-grade infrastructure</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Developer Freedom</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>❌ Constrained by platform</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen}>✅ Any feature imaginable</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>Investment Value</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }}>Template site</Td>
                      <Td fontSize={{ base: "xs", md: "sm" }} color={successGreen} fontWeight="bold">Custom-built asset you own</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              <Box
                bg="linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)"
                p={4}
                borderRadius="lg"
                borderWidth={1}
                borderColor="purple.400"
              >
                <Text textAlign="center" fontWeight="bold">
                  Yes, it costs more upfront. But you get 3x the value and own it outright.
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* FAQ Section */}
          <Box
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="xl" textAlign="center" color={textPrimary}>
                Frequently Asked Questions
              </Heading>

              <Accordion allowToggle w="full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} borderColor={cardBorder}>
                    <AccordionButton py={4}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold" fontSize="lg" color={textPrimary}>
                          {faq.q}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text color={textSecondary}>{faq.a}</Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </Box>

          {/* Project Tracker CTA - Will be added once project is created */}
          {/* <Box
            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)"
            backdropFilter="blur(20px)"
            p={{ base: 6, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={3}
            borderColor={successGreen}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            width="100%"
          >
            <VStack spacing={{ base: 4, md: 6 }} align="center">
              <VStack spacing={3}>
                <Heading size={{ base: "lg", md: "xl" }} textAlign="center" color={textPrimary}>
                  📋 View All Tasks Itemized
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={textSecondary} textAlign="center" maxW="700px">
                  Before reading the full agreement below, visit the project tracker to see all tasks broken down in detail. Every milestone, deliverable, and feature is itemized so you know exactly what you're getting.
                </Text>
              </VStack>

              <Button
                as="a"
                href="/project/YOUR_PROJECT_ID_HERE"
                target="_blank"
                size="lg"
                colorScheme="green"
                fontSize={{ base: "lg", md: "xl" }}
                px={{ base: 6, md: 12 }}
                py={{ base: 6, md: 8 }}
                height="auto"
                rightIcon={<Icon viewBox="0 0 24 24" boxSize={6}>
                  <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                </Icon>}
              >
                Open Project Tracker
              </Button>

              <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} fontStyle="italic" textAlign="center">
                💡 Opens in new tab • See 80+ tasks across 5 milestones • Track real-time progress
              </Text>
            </VStack>
          </Box> */}

          {/* Agreement Preview */}
          <Box
            position="relative"
            bg={cardGradientBg}
            backdropFilter="blur(20px)"
            p={{ base: 4, md: 10 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={2}
            borderColor={cardBorder}
            shadow="2xl"
            mb={{ base: 8, md: 16 }}
            overflow="hidden"
            width="100%"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorMode === 'light'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <VStack spacing={6} position="relative" zIndex={1}>
              <Heading size="xl" textAlign="center" color={textPrimary}>
                Review The Complete Agreement
              </Heading>

              <Button
                size="lg"
                colorScheme="blue"
                onClick={() => setShowAgreement(!showAgreement)}
              >
                {showAgreement ? 'Hide ▲' : 'Show ▼'} Full Agreement
              </Button>

              {showAgreement && (
                <Box w="full" pt={6}>
                  <ProposalSigningSection
                    proposalSlug="onegroup"
                    tenantId="684d0930cc7a27bb01ac83ce"
                  />
                </Box>
              )}
            </VStack>
          </Box>

          {/* Final CTA */}
          <Box
            bg="linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)"
            backdropFilter="blur(20px)"
            p={{ base: 6, md: 12 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={{ base: 2, md: 3 }}
            borderColor={primaryBlue}
            shadow="2xl"
            textAlign="center"
            width="100%"
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Heading size={{ base: "xl", md: "2xl" }} color={textPrimary}>
                Ready to Get Started?
              </Heading>

              <Text fontSize={{ base: "md", md: "xl" }} color={textSecondary} maxW="600px" px={{ base: 2, md: 0 }}>
                Let's build One Group a unified digital platform with a dashboard that makes your business investment-ready from day one
              </Text>

              <VStack spacing={{ base: 3, md: 4 }} pt={{ base: 2, md: 4 }}>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>
                  Next Steps:
                </Text>
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={{ base: 3, md: 6 }} maxW="800px" width="100%">
                  <VStack
                    position="relative"
                    p={{ base: 3, md: 4 }}
                    borderRadius="lg"
                    bg={colorMode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)'}
                    borderWidth={2}
                    borderColor={colorMode === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'lg',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(147, 197, 253, 0.2) 100%)',
                      opacity: 0,
                      animation: 'shimmer 3s ease-in-out infinite',
                      pointerEvents: 'none',
                    }}
                    sx={{
                      '@keyframes shimmer': {
                        '0%, 100%': { opacity: 0 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  >
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>1️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Review the agreement above</Text>
                  </VStack>
                  <VStack
                    position="relative"
                    p={{ base: 3, md: 4 }}
                    borderRadius="lg"
                    bg={colorMode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)'}
                    borderWidth={2}
                    borderColor={colorMode === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'lg',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(147, 197, 253, 0.2) 100%)',
                      opacity: 0,
                      animation: 'shimmer 3s ease-in-out infinite 0.5s',
                      pointerEvents: 'none',
                    }}
                    sx={{
                      '@keyframes shimmer': {
                        '0%, 100%': { opacity: 0 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  >
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>2️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Watch the video walkthrough</Text>
                  </VStack>
                  <VStack
                    position="relative"
                    p={{ base: 3, md: 4 }}
                    borderRadius="lg"
                    bg={colorMode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)'}
                    borderWidth={2}
                    borderColor={colorMode === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'lg',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(147, 197, 253, 0.2) 100%)',
                      opacity: 0,
                      animation: 'shimmer 3s ease-in-out infinite 1s',
                      pointerEvents: 'none',
                    }}
                    sx={{
                      '@keyframes shimmer': {
                        '0%, 100%': { opacity: 0 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  >
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>3️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Sign when ready</Text>
                  </VStack>
                  <VStack
                    position="relative"
                    p={{ base: 3, md: 4 }}
                    borderRadius="lg"
                    bg={colorMode === 'light' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.1)'}
                    borderWidth={2}
                    borderColor={colorMode === 'light' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'lg',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(134, 239, 172, 0.3) 100%)',
                      opacity: 0,
                      animation: 'shimmer 3s ease-in-out infinite 1.5s',
                      pointerEvents: 'none',
                    }}
                    sx={{
                      '@keyframes shimmer': {
                        '0%, 100%': { opacity: 0 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  >
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>4️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">We kick off Week 1</Text>
                  </VStack>
                </Grid>
              </VStack>

              <Divider />

              <VStack spacing={3}>
                <Text fontSize="lg" color={textSecondary}>
                  Questions? Let's talk.
                </Text>
                <Button
                  as="a"
                  href="mailto:tom@tommillerservices.com"
                  size="lg"
                  colorScheme="blue"
                  fontSize="xl"
                >
                  📧 tom@tommillerservices.com
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Container>
      </Box>

      <FooterWithFourColumns />
    </>
  );
};

export default OneGroupStructuredProposal;
