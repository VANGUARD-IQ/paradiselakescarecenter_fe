import React, { useState, useEffect } from 'react';
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
  Flex,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import { gql, useQuery } from '@apollo/client';
import { getColor } from '../../../brandConfig';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ProposalSigningSection } from '../../proposals/components/ProposalSigningSection';
import mermaid from 'mermaid';

const PUBLIC_GET_PROPOSAL = gql`
  query PublicGetProposal($slug: String!, $tenantId: String!) {
    publicProposal(slug: $slug, tenantId: $tenantId) {
      id
      projectId
      title
    }
  }
`;

const WattDropProposal: React.FC = () => {
  const { colorMode } = useColorMode();
  const [showAgreement, setShowAgreement] = useState(true);

  // Fetch proposal to get project ID
  const { data: proposalData, loading: loadingProposal } = useQuery(PUBLIC_GET_PROPOSAL, {
    variables: {
      slug: 'wattdrop',
      tenantId: '684d0930cc7a27bb01ac83ce'
    }
  });

  // Video URL - WattLab presentation video
  const VIDEO_URL = "https://scarlet-professional-perch-484.mypinata.cloud/ipfs/bafybeiagfj4p4btmp3ozj3dzpz7ngcwxgu2tw3fawmsrl5pu4qmvhqpiyi?pinataGatewayToken=iV2thLpd6huZwgwEQIv6a1Wh3XNIAcOA1c0qcCpWgb5v_321BFsY_3yfbC2EPxg3";

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

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: colorMode === 'dark' ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#34d399',
        primaryTextColor: colorMode === 'dark' ? '#fff' : '#000',
        primaryBorderColor: '#34d399',
        lineColor: '#34d399',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#f59e0b',
      }
    });
    mermaid.contentLoaded();
  }, [colorMode]);

  const platformFeatures = [
    {
      emoji: '🎯',
      title: 'Branded Platform',
      desc: 'WattLab colors and identity across the entire platform'
    },
    {
      emoji: '📊',
      title: 'Investor CRM',
      desc: 'Track opportunities and relationships across cities'
    },
    {
      emoji: '📧',
      title: 'Communication Tools',
      desc: 'SMS (Australia) + Email + Booking system'
    },
    {
      emoji: '🗺️',
      title: 'Public Roadmap',
      desc: 'Transparent project tracking for investors'
    },
    {
      emoji: '🪙',
      title: 'Token Designer',
      desc: 'Mechanism mapping and documentation'
    },
    {
      emoji: '⚡',
      title: 'Carbon Proofs',
      desc: 'Battery data → Carbon → Token workflow'
    },
  ];

  const milestones = [
    { amount: '$978', title: 'Foundation & Setup', desc: 'Domain, branding, auth, CRM, email, booking' },
    { amount: '$1,000', title: 'Core Platform Build', desc: 'SMS, opportunities, jobs, roadmap, presentations' },
    { amount: '$1,000', title: 'Token Ecosystem & Launch', desc: 'Token designer, carbon proofs, payment flows, testing' },
  ];

  const faqs = [
    {
      q: 'What exactly are we getting?',
      a: 'A complete digital platform to manage your investor relationships, document your token mechanism, track opportunities across cities, and plan your launch - all in one place.',
    },
    {
      q: 'How long until launch?',
      a: '8 weeks total from first payment. We work in 3 phases with payments due as each phase completes.',
    },
    {
      q: 'What happens after the $2,978 is paid?',
      a: 'Platform transitions to $97/month managed service including hosting, maintenance, monthly roadmap updates, and support. Additional features beyond the included scope are billed separately.',
    },
    {
      q: 'Do we own the platform?',
      a: 'Yes! You own all the frontend code and data. You can export everything at any time. If you cancel the managed service, you can export all your data and import it into a new CRM using standard processes. You\'ll need to arrange your own marketing and platform management.',
    },
  ];

  return (
    <>
      <NavbarWithCallToAction />

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
            ? 'radial-gradient(60% 60% at 0% 0%, rgba(248, 249, 250, 0.8) 0%, transparent 50%), radial-gradient(50% 50% at 50% 50%, #34d39933 0%, transparent 100%)'
            : 'radial-gradient(60% 60% at 0% 0%, rgba(17, 35, 52, 0.8) 0%, transparent 50%), radial-gradient(50% 50% at 50% 50%, #34d39933 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Container maxW="1200px" py={{ base: 8, md: 20 }} px={{ base: 4, md: 6 }} position="relative" zIndex={1}>

          {/* Above the Fold Hero */}
          <VStack spacing={{ base: 4, md: 6 }} align="center" mb={{ base: 8, md: 16 }}>
            <Badge
              colorScheme="green"
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
              bgGradient="linear(to-r, green.400, blue.500)"
              bgClip="text"
              px={{ base: 2, md: 0 }}
            >
              WattLab Token Ecosystem Platform
            </Heading>

            <Text
              fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
              color={textSecondary}
              textAlign="center"
              maxW="900px"
              px={{ base: 2, md: 4 }}
            >
              Transform Cycling into Verified Carbon Offset Tokens •
              GPS-Verified Activity • Blockchain-Powered Rewards •
              Multi-City Expansion Ready
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
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color={successGreen}>
                  $2,978 AUD
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
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color={primaryBlue}>
                  $97/mo
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
              8-Week Build Schedule
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
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, transparent 60%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch" position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Heading size={{ base: "lg", md: "xl" }} color={textPrimary} textAlign="center">
                  See The Platform Walkthrough
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={textSecondary} textAlign="center">
                  Watch this video to see the complete platform demo
                </Text>
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
                bg="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                borderWidth={2}
                borderColor={successGreen}
                mt={4}
              >
                <HStack spacing={4} justify="center" align="start">
                  <CheckCircleIcon color={successGreen} boxSize={{ base: 6, md: 8 }} flexShrink={0} />
                  <VStack spacing={2} align="start">
                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textPrimary}>
                      Goal: Monetize Carbon Offsets Through Verified Cycling
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary}>
                      Transform GPS-verified cycling activity into tradeable carbon offset tokens. Track battery data, mint tokens automatically, and enable businesses to purchase verified proof of carbon reduction.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Text fontSize="sm" color={textSecondary} textAlign="center">
                👇 Scroll down for detailed breakdown
              </Text>
            </VStack>
          </Box>

          {/* Platform Features Grid */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={6}
            mb={16}
          >
            {platformFeatures.map((feature, idx) => (
              <Box
                key={idx}
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
                  <Text fontSize="4xl">{feature.emoji}</Text>
                  <Heading size="md" color={textPrimary}>
                    {feature.title}
                  </Heading>
                  <Text color={textSecondary}>
                    {feature.desc}
                  </Text>
                </VStack>
              </Box>
            ))}
          </Grid>

          {/* What You're Getting */}
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
                  Complete Token Ecosystem Platform
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center">
                  Everything you need to launch and manage your carbon offset token
                </Text>
              </VStack>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <VStack align="start" spacing={3}>
                  <HStack><CheckCircleIcon color={successGreen} /><Text fontWeight="bold">Foundation</Text></HStack>
                  <List spacing={2} pl={6}>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />WattLab branded platform</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />User authentication</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Investor/client CRM</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Branded email system</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Meeting booking calendar</ListItem>
                  </List>
                </VStack>

                <VStack align="start" spacing={3}>
                  <HStack><CheckCircleIcon color={successGreen} /><Text fontWeight="bold">Platform Tools</Text></HStack>
                  <List spacing={2} pl={6}>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Australian SMS messaging</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Opportunity tracker by city</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Job/task management</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Public roadmap page</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Investor presentation tools</ListItem>
                  </List>
                </VStack>

                <VStack align="start" spacing={3}>
                  <HStack><CheckCircleIcon color={successGreen} /><Text fontWeight="bold">Token Ecosystem</Text></HStack>
                  <List spacing={2} pl={6}>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Token mechanism designer</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Battery → Carbon → Token workflow</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Cryptographic proof system design</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Business payment verification</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Hidden launch planning portal</ListItem>
                  </List>
                </VStack>

                <VStack align="start" spacing={3}>
                  <HStack><CheckCircleIcon color={successGreen} /><Text fontWeight="bold">Ongoing Support</Text></HStack>
                  <List spacing={2} pl={6}>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />$97/month managed service</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Monthly roadmap updates</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Hosting and maintenance</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Email/SMS management</ListItem>
                    <ListItem><ListIcon as={CheckCircleIcon} color={successGreen} />Data export support</ListItem>
                  </List>
                </VStack>
              </Grid>
            </VStack>
          </Box>

          {/* Token Ecosystem Flow Chart */}
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
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorMode === 'light'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, transparent 60%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <VStack spacing={8} align="stretch" position="relative" zIndex={1}>
              <VStack spacing={3}>
                <Heading size="xl" textAlign="center" color={textPrimary}>
                  🪙 How The Token Ecosystem Works
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center" maxW="800px">
                  Every kilometer cycled creates verifiable carbon offset tokens. One-time sale prevents double-counting.
                </Text>
              </VStack>

              <Box
                bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)'}
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                overflow="auto"
              >
                <div className="mermaid">
                  {`graph TD
    A[🚴 Cyclist Rides Bike] -->|GPS Tracking| B[📍 Distance Recorded]
    B -->|Battery Data| C[⚡ 1km = 1 Token Minted]
    C --> D[🪙 Token Owned by Cyclist]

    D -->|Sale on Platform| E{Token Purchase}
    E -->|Business Buys Token| F[💰 Cyclist Receives Payment]
    F --> G[📊 Platform Takes Commission]

    E --> H{Token Status}
    H -->|Option 1| I[🔥 Token Destroyed<br/>Offset Claimed]
    H -->|Option 2| J[👤 Moved to Buyer Account<br/>Proof of Offset]

    I --> K[✅ Carbon Offset Verified<br/>Cannot Be Sold Again]
    J --> K

    K --> L[🚫 Prevents Double-Dipping<br/>One Token = One Sale Only]

    style A fill:#34d399,stroke:#059669,stroke-width:2px,color:#000
    style C fill:#34d399,stroke:#059669,stroke-width:2px,color:#000
    style D fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style F fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style I fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style J fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style K fill:#22c55e,stroke:#15803d,stroke-width:2px,color:#fff
    style L fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff`}
                </div>
              </Box>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <Box
                  bg="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor={successGreen}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">🚴</Text>
                    <Text fontWeight="bold" color={textPrimary}>Step 1: Ride & Track</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      GPS-verified cycling activity tracked through battery data. 1km = 1 token minted.
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor={primaryBlue}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">💰</Text>
                    <Text fontWeight="bold" color={textPrimary}>Step 2: Sell Token</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Cyclist sells token on platform. Receives payment minus platform commission.
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="#ef4444"
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">🚫</Text>
                    <Text fontWeight="bold" color={textPrimary}>Step 3: One-Time Use</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Token destroyed or moved to buyer. Cannot be sold again. Prevents double-counting.
                    </Text>
                  </VStack>
                </Box>
              </Grid>

              <Box
                bg="linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)"
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                borderWidth={2}
                borderColor="purple.400"
              >
                <VStack spacing={3}>
                  <Text fontSize="xl" fontWeight="bold" color={textPrimary} textAlign="center">
                    🔐 Cryptographic Proof System
                  </Text>
                  <Text fontSize="sm" color={textSecondary} textAlign="center" maxW="700px">
                    Every token has verifiable proof linking battery data → distance traveled → carbon saved → token minted.
                    Businesses can prove their carbon offset claims with transparent, auditable blockchain records.
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Token Supply & Flow Chart */}
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
            position="relative"
            overflow="hidden"
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
            <VStack spacing={8} align="stretch" position="relative" zIndex={1}>
              <VStack spacing={3}>
                <Heading size="xl" textAlign="center" color={textPrimary}>
                  📊 Token Supply Dynamics
                </Heading>
                <Text fontSize="lg" color={textSecondary} textAlign="center" maxW="800px">
                  How tokens enter and exit the ecosystem - maintaining verifiable carbon offset integrity
                </Text>
              </VStack>

              <Box
                bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)'}
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                overflow="auto"
              >
                <div className="mermaid">
                  {`graph LR
    subgraph Supply["🟢 TOKEN SUPPLY IN (Minting)"]
        A1[🚴 Cyclist 1 rides 10km] --> M1[⚡ 10 tokens minted]
        A2[🚴 Cyclist 2 rides 25km] --> M2[⚡ 25 tokens minted]
        A3[🚴 Cyclist 3 rides 15km] --> M3[⚡ 15 tokens minted]
        M1 --> POOL[💎 Active Token Pool<br/>50 Tokens Available]
        M2 --> POOL
        M3 --> POOL
    end

    subgraph Market["💰 MARKETPLACE"]
        POOL --> SALE1[🏢 Business A buys 20 tokens]
        POOL --> SALE2[🏭 Business B buys 15 tokens]
        POOL --> SALE3[👤 Individual buys 5 tokens]

        SALE1 --> PAY1[💵 Cyclists paid for 20 tokens]
        SALE2 --> PAY2[💵 Cyclists paid for 15 tokens]
        SALE3 --> PAY3[💵 Cyclists paid for 5 tokens]
    end

    subgraph Removal["🔴 TOKEN SUPPLY OUT (Burning)"]
        PAY1 --> BURN1[🔥 20 tokens DESTROYED]
        PAY2 --> BURN2[🔥 15 tokens DESTROYED]
        PAY3 --> HOLD[👤 5 tokens in buyer wallet]

        BURN1 --> REGISTRY[📋 Carbon Registry<br/>35 tons CO2 offset verified]
        BURN2 --> REGISTRY
        HOLD -.->|Can claim later| REGISTRY
    end

    REGISTRY --> PREVENT[🚫 Prevents Re-sale<br/>Each token = ONE offset claim only]

    style Supply fill:#d1fae5,stroke:#059669,stroke-width:3px
    style Market fill:#dbeafe,stroke:#1d4ed8,stroke-width:3px
    style Removal fill:#fee2e2,stroke:#b91c1c,stroke-width:3px
    style POOL fill:#34d399,stroke:#059669,stroke-width:2px,color:#000
    style REGISTRY fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style PREVENT fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    style BURN1 fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style BURN2 fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style HOLD fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff`}
                </div>
              </Box>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <Box
                  bg="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor={successGreen}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">🟢</Text>
                    <Text fontWeight="bold" color={textPrimary}>Tokens IN</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      New tokens minted every time cyclists ride. Supply increases with verified activity.
                    </Text>
                    <Text fontSize="xs" color={textSecondary} fontWeight="bold">
                      Example: 50km total = 50 new tokens
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor={primaryBlue}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">💰</Text>
                    <Text fontWeight="bold" color={textPrimary}>Marketplace</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Businesses and individuals purchase tokens from active pool. Cyclists get paid.
                    </Text>
                    <Text fontSize="xs" color={textSecondary} fontWeight="bold">
                      Example: 40 tokens sold from pool
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)"
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="#ef4444"
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="2xl">🔴</Text>
                    <Text fontWeight="bold" color={textPrimary}>Tokens OUT</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Tokens destroyed upon offset claim. Removed from circulation permanently.
                    </Text>
                    <Text fontSize="xs" color={textSecondary} fontWeight="bold">
                      Example: 35 tokens burned = 35 tons CO2
                    </Text>
                  </VStack>
                </Box>
              </Grid>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Box
                  bg="linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)"
                  p={{ base: 4, md: 6 }}
                  borderRadius="lg"
                  borderWidth={2}
                  borderColor="purple.400"
                >
                  <VStack spacing={3} align="start">
                    <HStack>
                      <Text fontSize="2xl">💎</Text>
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        Active Token Pool
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textSecondary}>
                      Tokens waiting to be purchased. Owned by cyclists who completed verified rides. Available for immediate sale on the marketplace.
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)"
                  p={{ base: 4, md: 6 }}
                  borderRadius="lg"
                  borderWidth={2}
                  borderColor="#f59e0b"
                >
                  <VStack spacing={3} align="start">
                    <HStack>
                      <Text fontSize="2xl">📋</Text>
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        Carbon Registry
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textSecondary}>
                      Permanent record of verified carbon offsets. Each destroyed token = 1 ton CO2 offset that cannot be claimed again. Blockchain-verified.
                    </Text>
                  </VStack>
                </Box>
              </Grid>

              <Box
                bg="linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)"
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                borderWidth={2}
                borderColor="#dc2626"
              >
                <VStack spacing={3}>
                  <HStack>
                    <Text fontSize="2xl">🚫</Text>
                    <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
                      Why Token Burning Matters
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={textSecondary} textAlign="center" maxW="900px">
                    When a business claims a carbon offset, the token is permanently destroyed (burned). This prevents the same offset from being sold multiple times.
                    Each token can only satisfy ONE carbon offset claim - ever. This maintains the integrity and credibility of the entire carbon offset ecosystem.
                  </Text>
                  <Text fontSize="xs" color={textSecondary} fontStyle="italic">
                    🔐 Cryptographically verified on blockchain - transparent and auditable by anyone
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
                3 Milestone Payments
              </Heading>

              <VStack spacing={4} align="stretch">
                {milestones.map((milestone, idx) => (
                  <Box key={idx} p={5} bg={colorMode === 'dark' ? 'rgba(30, 30, 35, 0.8)' : 'gray.50'} borderRadius="lg">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" color={textSecondary}>
                          Payment {idx + 1}
                        </Text>
                        <Heading size="md" color={textPrimary}>
                          {milestone.title}
                        </Heading>
                        <Text color={textSecondary}>
                          {milestone.desc}
                        </Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="bold" color={successGreen}>
                        {milestone.amount}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <Box
                bg="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
                p={6}
                borderRadius="lg"
                borderWidth={1}
                borderColor={successGreen}
              >
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                    Total Development Cost: $2,978 AUD
                  </Text>
                  <Text color={textSecondary} textAlign="center">
                    Each payment unlocks the next phase of development
                  </Text>
                </VStack>
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
          >
            <VStack spacing={6} position="relative" zIndex={1}>
              <Heading size="xl" textAlign="center" color={textPrimary}>
                Review The Complete Agreement
              </Heading>

              <Button
                size="lg"
                colorScheme="green"
                onClick={() => setShowAgreement(!showAgreement)}
              >
                {showAgreement ? 'Hide ▲' : 'Show ▼'} Full Agreement
              </Button>

              {showAgreement && (
                <Box w="full" pt={6}>
                  <ProposalSigningSection
                    proposalSlug="wattdrop"
                    tenantId="684d0930cc7a27bb01ac83ce"
                  />
                </Box>
              )}
            </VStack>
          </Box>

          {/* Final CTA */}
          <Box
            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.2) 100%)"
            backdropFilter="blur(20px)"
            p={{ base: 6, md: 12 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={{ base: 2, md: 3 }}
            borderColor={successGreen}
            shadow="2xl"
            textAlign="center"
            width="100%"
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Heading size={{ base: "xl", md: "2xl" }} color={textPrimary}>
                Ready to Launch WattLab?
              </Heading>

              <Text fontSize={{ base: "md", md: "xl" }} color={textSecondary} maxW="600px" px={{ base: 2, md: 0 }}>
                Let's build your token ecosystem platform and start monetizing carbon offsets through verified cycling activity
              </Text>

              <VStack spacing={{ base: 3, md: 4 }} pt={{ base: 2, md: 4 }}>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>
                  Next Steps:
                </Text>
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={{ base: 3, md: 6 }} maxW="800px" width="100%">
                  <VStack p={{ base: 3, md: 4 }} borderRadius="lg" bg="rgba(34, 197, 94, 0.1)" borderWidth={2} borderColor="rgba(34, 197, 94, 0.3)">
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>1️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Review the agreement above</Text>
                  </VStack>
                  <VStack p={{ base: 3, md: 4 }} borderRadius="lg" bg="rgba(34, 197, 94, 0.1)" borderWidth={2} borderColor="rgba(34, 197, 94, 0.3)">
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>2️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Watch the video (if available)</Text>
                  </VStack>
                  <VStack p={{ base: 3, md: 4 }} borderRadius="lg" bg="rgba(34, 197, 94, 0.1)" borderWidth={2} borderColor="rgba(34, 197, 94, 0.3)">
                    <Text fontSize={{ base: "2xl", md: "3xl" }}>3️⃣</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} textAlign="center">Sign when ready</Text>
                  </VStack>
                  <VStack p={{ base: 3, md: 4 }} borderRadius="lg" bg="rgba(59, 130, 246, 0.1)" borderWidth={2} borderColor="rgba(59, 130, 246, 0.3)">
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
                  colorScheme="green"
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

export default WattDropProposal;
