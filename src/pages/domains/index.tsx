import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Badge,
  useToast,
  InputGroup,
  InputRightElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  useColorMode,
} from '@chakra-ui/react';
import { FiSearch, FiShoppingCart, FiGlobe, FiLock, FiMail, FiDollarSign } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';

const SEARCH_DOMAINS = gql`
  query SearchDomains($input: DomainSearchInput!) {
    searchDomains(input: $input) {
      domain
      available
      price
      currency
      premium
    }
  }
`;

const MY_DOMAINS = gql`
  query MyDomains {
    myDomains {
      id
      domainName
      status
      expiryDate
      autoRenew
      nameservers {
        hostname
      }
    }
  }
`;

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
  premium: boolean;
}

export const DomainsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [cart, setCart] = useState<DomainResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Consistent styling
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const buttonBg = getColor("primary", colorMode);

  const { data: myDomainsData, loading: domainsLoading } = useQuery(MY_DOMAINS, {
    fetchPolicy: 'cache-and-network'
  });

  const handleSearch = async () => {
    if (!searchTerm) {
      toast({
        title: 'Enter a domain name',
        description: 'Please enter a domain name to search',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search results for now
    const tlds = ['com', 'net', 'org', 'io', 'co', 'app'];
    const baseName = searchTerm.replace(/\.[^/.]+$/, '');
    
    const results: DomainResult[] = tlds.map(tld => ({
      domain: `${baseName}.${tld}`,
      available: Math.random() > 0.3,
      price: tld === 'com' ? 14.99 : tld === 'io' ? 49.99 : tld === 'app' ? 29.99 : 19.99,
      currency: 'USD',
      premium: false
    }));

    setSearchResults(results);
    setIsSearching(false);
  };

  const addToCart = (domain: DomainResult) => {
    if (cart.find(d => d.domain === domain.domain)) {
      toast({
        title: 'Already in cart',
        description: `${domain.domain} is already in your cart`,
        status: 'info',
        duration: 2000
      });
      return;
    }

    setCart([...cart, domain]);
    toast({
      title: 'Added to cart',
      description: `${domain.domain} has been added to your cart`,
      status: 'success',
      duration: 2000
    });
  };

  const removeFromCart = (domain: string) => {
    setCart(cart.filter(d => d.domain !== domain));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      
      <Container maxW="7xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="2xl" mb={4} color={textPrimary}>
              Domain Registration & DNS Management
            </Heading>
            <Text fontSize="lg" color={textSecondary}>
              Register domains, manage DNS records, and accept crypto payments
            </Text>
          </Box>

          {/* Search Section */}
          <Card
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardBody>
              <VStack spacing={4}>
                <InputGroup size="lg">
                  <Input
                    placeholder="Search for your perfect domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="2.5rem"
                      size="md"
                      onClick={handleSearch}
                      isLoading={isSearching}
                      bg={buttonBg}
                      color="white"
                      _hover={{ bg: getColor("secondary", colorMode) }}
                    >
                      <FiSearch />
                    </Button>
                  </InputRightElement>
                </InputGroup>

                {/* Popular TLDs */}
                <HStack spacing={2} wrap="wrap">
                  <Text fontSize="sm" color={textMuted}>Popular:</Text>
                  {['.com', '.net', '.org', '.io', '.co', '.app'].map(tld => (
                    <Badge
                      key={tld}
                      cursor="pointer"
                      onClick={() => {
                        const baseName = searchTerm.replace(/\.[^/.]+$/, '');
                        setSearchTerm(baseName + tld);
                        handleSearch();
                      }}
                      colorScheme="blue"
                      variant="subtle"
                    >
                      {tld}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="xl"
              backdropFilter="blur(10px)"
            >
              <CardHeader>
                <Heading size="md" color={textPrimary}>
                  Search Results
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {searchResults.map((result) => (
                    <HStack
                      key={result.domain}
                      p={4}
                      bg={result.available ? "rgba(72, 187, 120, 0.1)" : "rgba(245, 101, 101, 0.1)"}
                      borderRadius="md"
                      justify="space-between"
                    >
                      <HStack>
                        <FiGlobe color={result.available ? "#48BB78" : "#F56565"} />
                        <Text color={textPrimary} fontWeight="medium">
                          {result.domain}
                        </Text>
                        <Badge colorScheme={result.available ? "green" : "red"}>
                          {result.available ? "Available" : "Taken"}
                        </Badge>
                      </HStack>
                      
                      {result.available && (
                        <HStack>
                          <Text color={textPrimary} fontWeight="bold">
                            ${result.price}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => addToCart(result)}
                            bg={buttonBg}
                            color="white"
                            _hover={{ bg: getColor("secondary", colorMode) }}
                            leftIcon={<FiShoppingCart />}
                          >
                            Add to Cart
                          </Button>
                        </HStack>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Cart */}
          {cart.length > 0 && (
            <Card
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="xl"
              backdropFilter="blur(10px)"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color={textPrimary}>
                    Shopping Cart ({cart.length} items)
                  </Heading>
                  <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
                    Total: ${getTotalPrice()}
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {cart.map((item) => (
                    <HStack key={item.domain} justify="space-between">
                      <Text color={textPrimary}>{item.domain}</Text>
                      <HStack>
                        <Text color={textPrimary}>${item.price}</Text>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeFromCart(item.domain)}
                        >
                          Remove
                        </Button>
                      </HStack>
                    </HStack>
                  ))}
                  
                  <Divider my={4} />
                  
                  <HStack justify="space-between">
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<FaBitcoin />}
                      onClick={() => navigate('/domains/checkout?payment=crypto')}
                    >
                      Pay with Crypto
                    </Button>
                    <Button
                      size="lg"
                      bg={buttonBg}
                      color="white"
                      _hover={{ bg: getColor("secondary", colorMode) }}
                      leftIcon={<FiDollarSign />}
                      onClick={() => navigate('/domains/checkout?payment=card')}
                    >
                      Pay with Card
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Tabs for Management */}
          <Tabs variant="enclosed">
            <TabList>
              <Tab color={textPrimary}>My Domains</Tab>
              <Tab color={textPrimary}>DNS Management</Tab>
              <Tab color={textPrimary}>Email Setup</Tab>
              <Tab color={textPrimary}>Pricing</Tab>
            </TabList>

            <TabPanels>
              {/* My Domains */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {myDomainsData?.myDomains?.map((domain: any) => (
                    <Card
                      key={domain.id}
                      bg={cardGradientBg}
                      border="1px solid"
                      borderColor={cardBorder}
                      cursor="pointer"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                      _hover={{ borderColor: buttonBg }}
                    >
                      <CardBody>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <FiGlobe />
                            <Text fontWeight="bold" color={textPrimary}>
                              {domain.domainName}
                            </Text>
                          </HStack>
                          <Badge colorScheme={domain.status === 'REGISTERED' ? 'green' : 'yellow'}>
                            {domain.status}
                          </Badge>
                          <Text fontSize="sm" color={textMuted}>
                            Expires: {new Date(domain.expiryDate).toLocaleDateString()}
                          </Text>
                          {domain.autoRenew && (
                            <Badge colorScheme="blue" size="sm">
                              Auto-Renew
                            </Badge>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                  
                  {(!myDomainsData?.myDomains || myDomainsData.myDomains.length === 0) && (
                    <Text color={textMuted}>No domains registered yet</Text>
                  )}
                </SimpleGrid>
              </TabPanel>

              {/* DNS Management */}
              <TabPanel>
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  Select a domain from "My Domains" tab to manage DNS records
                </Alert>
                
                <VStack align="stretch" spacing={4}>
                  <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <CardHeader>
                      <Heading size="sm" color={textPrimary}>
                        DNS Features
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <HStack>
                          <Badge>A Records</Badge>
                          <Text fontSize="sm" color={textMuted}>Point to IP address</Text>
                        </HStack>
                        <HStack>
                          <Badge>CNAME</Badge>
                          <Text fontSize="sm" color={textMuted}>Alias to another domain</Text>
                        </HStack>
                        <HStack>
                          <Badge>MX Records</Badge>
                          <Text fontSize="sm" color={textMuted}>Email routing</Text>
                        </HStack>
                        <HStack>
                          <Badge>TXT Records</Badge>
                          <Text fontSize="sm" color={textMuted}>Verification & SPF</Text>
                        </HStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Email Setup */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <CardHeader>
                      <HStack>
                        <FiMail />
                        <Heading size="sm" color={textPrimary}>
                          Professional Email
                        </Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Text color={textSecondary} mb={4}>
                        Add professional email to your domain
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Stat>
                          <StatLabel color={textMuted}>Basic</StatLabel>
                          <StatNumber color={textPrimary}>$3/mo</StatNumber>
                          <StatHelpText>1 mailbox, 5GB</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel color={textMuted}>Professional</StatLabel>
                          <StatNumber color={textPrimary}>$5/mo</StatNumber>
                          <StatHelpText>5 mailboxes, 25GB</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel color={textMuted}>Business</StatLabel>
                          <StatNumber color={textPrimary}>$10/mo</StatNumber>
                          <StatHelpText>Unlimited, 100GB</StatHelpText>
                        </Stat>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Pricing */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <CardHeader>
                      <Heading size="sm" color={textPrimary}>Domain Only</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                          $14.99<Text as="span" fontSize="sm" color={textMuted}>/year</Text>
                        </Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Domain registration</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Basic DNS</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Web forwarding</Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardGradientBg} border="1px solid" borderColor={buttonBg}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="sm" color={textPrimary}>Professional</Heading>
                        <Badge colorScheme="blue">Popular</Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                          $19.99<Text as="span" fontSize="sm" color={textMuted}>/year</Text>
                        </Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Everything in Basic</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ WHOIS privacy</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Premium DNS</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ SSL certificate</Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                    <CardHeader>
                      <Heading size="sm" color={textPrimary}>Business</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                          $29.99<Text as="span" fontSize="sm" color={textMuted}>/year</Text>
                        </Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Everything in Pro</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Email hosting</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Advanced DNS</Text>
                        <Text fontSize="sm" color={textSecondary}>✓ Priority support</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};