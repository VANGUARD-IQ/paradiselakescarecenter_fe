import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  Badge,
  Spinner,
  Center,
  Button,
  useToast,
  CardHeader,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiServer,
  FiUsers,
  FiHardDrive,
  FiCode,
  FiMail,
  FiDollarSign,
  FiCreditCard,
  FiUserPlus,
  FiLock,
  FiPackage,
  FiList,
  FiShoppingCart,
  FiCalendar,
  FiClock,
  FiFileText,
  FiHome,
  FiBriefcase,
  FiSettings,
  FiDatabase,
  FiAlertCircle,
  FiHeadphones,
  FiBarChart2,
  FiTrendingUp,
  FiPrinter
} from "react-icons/fi";
import { NavbarWithCallToAction } from "../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { gql, useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "./authentication";
import { useModules } from "../hooks/useModules";
import { getColor, getComponent, brandConfig } from "../brandConfig";

interface NavItem {
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  comingSoon?: boolean;
}

interface NavGroup {
  title: string;
  subtitle?: string;
  items: NavItem[];
}

interface NavCardProps {
  item: NavItem;
}

const navigationGroups: Record<string, NavGroup> = {



  businessCalendar: {
    title: "🗓️ Business Command Center - Start Here",
    subtitle: "Get clear on what you're doing with your central planning hub",
    items: [
      {
        path: "/business-calendar",
        title: "Master Business Calendar",
        description: "Your command center - plan everything from client meetings to project deadlines in one place",
        icon: FiCalendar,
        comingSoon: true
      },
      {
        path: "/business-calendar/events",
        title: "Strategic Events Planner",
        description: "Plan networking events, workshops, and business milestones to grow your influence",
        icon: FiCalendar,
        comingSoon: true
      },
    ],
  },



  clients: {
    title: "👥 Client Relationship Hub - Your CRM",
    subtitle: "Add your first people to your CRM and nurture relationships that drive your business",
    items: [
      {
        path: "/clients",
        title: "All Your Clients",
        description: "Your relationship database - track conversations, preferences, and opportunities with every contact",
        icon: FiUsers,
      },
      {
        path: "/newclient",
        title: "Add New Contact",
        description: "Start building your network by adding people you meet - from prospects to partners",
        icon: FiUserPlus,
      },
    ],
  },






  admin: {
    title: "⚙️ Master Site Administration - Control Everything",
    subtitle: "Manage client sites, deploy updates, and control module access across your business empire",
    items: [
      {
        path: "/admin/tenants",
        title: "Tenant Management",
        description: "Manage all client sites - enable/disable modules, upgrade subscriptions, and control access",
        icon: FiSettings,
      },
      {
        path: "/admin/deploy",
        title: "Deployment Manager",
        description: "Deploy module updates across multiple client sites simultaneously",
        icon: FiServer,
      },
    ],
  },



  projects: {
    title: "🚀 Project Collaboration - Achieve Together",
    subtitle: "Work with clients on meaningful projects where you can achieve something impactful together",
    items: [
      {
        path: "/projects",
        title: "All Active Projects",
        description: "Track progress on client projects - from websites to blockchain implementations",
        icon: FiBriefcase,
      },
      {
        path: "/projects/new",
        title: "Start New Project",
        description: "Begin a new collaboration with a client - define scope, timeline, and deliverables",
        icon: FiBriefcase,
      },
    ],
  },


  sessions: {
    title: "📅 Booking & Networking - Build Your Network",
    subtitle: "Create valuable connections through strategic booking sessions and events",
    items: [
      {
        path: "/sessions/types",
        title: "Session Types",
        description: "Define consultation types, discovery calls, and service offerings to attract ideal clients",
        icon: FiList,
      },
      {
        path: "/sessions/types/create",
        title: "Create New Session Type",
        description: "Design new ways for people to connect with you and your services",
        icon: FiPackage,
      },
      {
        path: "/sessions/set-availabilities",
        title: "Set Your Availability",
        description: "Control when you're available for bookings to maintain work-life balance",
        icon: FiCalendar,
      },
      {
        path: "/schedule-session",
        title: "Publish Available Times",
        description: "Make your availability public so prospects can easily book with you",
        icon: FiClock,
        comingSoon: true
      },
      {
        path: "/sessions/client-booking-calendar",
        title: "My Scheduled Bookings",
        description: "See all your upcoming client sessions and prepare for each meeting",
        icon: FiCalendar,
      },
      {
        path: "/placeholder-for-dynamic-url",
        title: "Your Public Booking Page",
        description: "Share this link everywhere - your personal booking calendar for prospects to schedule with you",
        icon: FiCalendar,
      },
      {
        path: "/events/special",
        title: "Special Networking Events",
        description: "Host workshops, masterclasses, and networking events to attract multiple prospects at once",
        icon: FiCalendar,
        comingSoon: true
      },
    ],
  },



  smsCampaigns: {
    title: "📱 SMS Marketing Campaigns - Stay Connected",
    subtitle: "Set up people you know on SMS campaigns that guide them to book sessions with you",
    items: [
      {
        path: "/sms/campaigns",
        title: "All SMS Campaigns",
        description: "View your nurture sequences - like 4-part series that guide contacts to book consultations",
        icon: FiMail,
        comingSoon: true
      },
      {
        path: "/sms/campaigns/create",
        title: "Create New Campaign",
        description: "Design SMS sequences that provide value and naturally lead to booking opportunities",
        icon: FiMail,
        comingSoon: true
      },
      {
        path: "/sms/campaigns/stats",
        title: "Campaign Performance",
        description: "Track which messages get responses and drive the most bookings",
        icon: FiBarChart2,
        comingSoon: true
      },
      {
        path: "/sms/templates",
        title: "Message Templates",
        description: "Pre-written messages for different situations - follow-ups, introductions, and offers",
        icon: FiFileText,
        comingSoon: true
      },
    ],
  },


  subscriptions: {
    title: "💳 Recurring Revenue - Subscription Management",
    subtitle: "Set up and manage ongoing subscriptions for recurring services and reliable monthly revenue",
    items: [
      {
        path: "/subscriptions",
        title: "Subscriptions Dashboard",
        description: "Overview of all active subscriptions, revenue metrics, and billing health",
        icon: FiBarChart2,
      },
      {
        path: "/subscriptions/create",
        title: "Create New Subscription",
        description: "Set up recurring billing for ongoing services like monthly consulting retainers",
        icon: FiUserPlus,
      },
      {
        path: "/subscriptions/manage",
        title: "Manage Active Subscriptions",
        description: "View, modify, pause, or cancel existing client subscriptions",
        icon: FiSettings,
      },
      {
        path: "/subscriptions/invoices",
        title: "Invoice History",
        description: "Track all generated invoices, payment status, and subscription billing history",
        icon: FiFileText,
      },
    ],
  },

  bills: {
    title: "💰 One-Time Billing - Get Paid for Services",
    subtitle: "When you're providing one-time services or consulting, charge clients instantly or send invoices",
    items: [
      {
        path: "/subscriptions/manual-charging",
        title: "Charge Saved Payment Methods",
        description: "Instantly charge clients using their saved credit cards - perfect for consulting fees",
        icon: FiDollarSign,
      },
      {
        path: "/subscriptions/payment-methods",
        title: "Manage Payment Methods",
        description: "View and manage client credit cards and payment methods for easy charging",
        icon: FiCreditCard,
      },
      {
        path: "/bills",
        title: "All Invoices & Bills",
        description: "Track all your invoices - see what's paid, pending, and overdue for your service work",
        icon: FiFileText,
        comingSoon: true
      },
      {
        path: "/bills/new",
        title: "Create New Invoice",
        description: "Bill clients for consulting, development work, or any services you've provided",
        icon: FiDollarSign,
        comingSoon: true
      },
    ],
  },

  products: {
    title: "📦 Product Creation & Inventory - Build Together",
    subtitle: "When creating products together with clients, manage inventory and print professional labels",
    items: [
      {
        path: "/products/new",
        title: "Create New Product",
        description: "Add products you're creating with clients - from digital courses to physical goods",
        icon: FiPackage,
      },
      {
        path: "/print-labels",
        title: "Print Product Labels",
        description: "Create professional labels for physical products you're selling or shipping",
        icon: FiPrinter,
      },
      {
        path: "/products",
        title: "All Products & Inventory",
        description: "Manage your product catalog - track stock levels, pricing, and availability",
        icon: FiList,
      },
      {
        path: "/cart",
        title: "Shopping Cart Preview",
        description: "See how customers will experience buying your products online",
        icon: FiShoppingCart,
      },
    ],
  },

  websites: {
    title: "🌐 Website Development - Help Clients Online",
    subtitle: "If you're building websites for other clients, manage their projects and help set up their business",
    items: [
      {
        path: "/websites",
        title: "All Client Websites",
        description: "Track websites you're building for clients - from concept to launch",
        icon: FiServer,
        comingSoon: true
      },
      {
        path: "/websites/new",
        title: "Start New Website Project",
        description: "Begin a new website build for a client - plan their digital presence and business setup",
        icon: FiCode,
        comingSoon: true
      },
    ],
  },





  staticPages: {
    title: "Static Pages",
    items: [
      {
        path: "/",
        title: "Home Page",
        description: "View the main home page",
        icon: FiHome,
      },
      {
        path: "/about",
        title: "About Us",
        description: "About the organization",
        icon: FiUsers,
      },
      {
        path: "/services",
        title: "Services",
        description: "Our services page",
        icon: FiSettings,
      },
      {
        path: "/blog",
        title: "Blog",
        description: "Blog and announcements",
        icon: FiFileText,
      },
      {
        path: "/hardware-wallets",
        title: "Hardware Wallets",
        description: "Hardware wallet information page",
        icon: FiHardDrive,
      },
      {
        path: "/custom-website-development",
        title: "Custom Development",
        description: "Custom website development services",
        icon: FiCode,
      },
      {
        path: "/100members",
        title: "100 Members",
        description: "100 Members program page",
        icon: FiUsers,
      },
      {
        path: "/ecosystem-agreement",
        title: "Ecosystem Agreement",
        description: "Ecosystem agreement details",
        icon: FiFileText,
      },
      {
        path: "/welcome",
        title: "Welcome",
        description: "New member welcome page",
        icon: FiUsers,
      },
      {
        path: "/agreement",
        title: "Agreement",
        description: "Legal agreements page",
        icon: FiFileText,
      },
      {
        path: "/founders",
        title: "Founders",
        description: "About the founders",
        icon: FiUsers,
      },
      {
        path: "/governance",
        title: "Governance",
        description: "Governance structure",
        icon: FiSettings,
      },
      {
        path: "/governing-rules",
        title: "Governing Rules",
        description: "Organizational rules",
        icon: FiSettings,
      },
      {
        path: "/intro-session",
        title: "Intro Session",
        description: "Introduction session information",
        icon: FiCalendar,
      },
    ],
  },

  testPages: {
    title: "Test Pages",
    items: [
      {
        path: "/test/sendemail",
        title: "Email Testing",
        description: "Test email functionality",
        icon: FiMail,
      },
      {
        path: "/test/upload-encrypted",
        title: "Encrypted Upload Test",
        description: "Test encrypted file uploads",
        icon: FiServer,
      },
      {
        path: "/test/upload-unencrypted",
        title: "Unencrypted Upload Test",
        description: "Test unencrypted file uploads",
        icon: FiServer,
      },
      {
        path: "/test/auth",
        title: "Auth Testing",
        description: "Test two-word authentication system",
        icon: FiLock,
      },
      {
        path: "/test/cart",
        title: "Cart Testing",
        description: "Test client cart functionality",
        icon: FiShoppingCart,
      },
      {
        path: "/test/upload-pinata",
        title: "Pinata Upload Test",
        description: "Test file uploads to Pinata",
        icon: FiServer,
      },
      {
        path: "/test/upload",
        title: "File Upload Test",
        description: "Test general file uploads",
        icon: FiServer,
      },
    ],
  },

  smsPodcastFunnel: {
    title: "SMS Podcast Funnel",
    items: [
      {
        path: "/property",
        title: "Property Landing Page",
        description: "SMS opt-in landing page for property investment podcast",
        icon: FiHeadphones,
      },
      {
        path: "/p1",
        title: "Episode 1 Page",
        description: "First episode with voting functionality",
        icon: FiTrendingUp,
      },
      {
        path: "/investment-results",
        title: "Investment Results",
        description: "Display voting results and next steps",
        icon: FiBarChart2,
      },
    ],
  },

  fileManagement: {
    title: "File Management",
    items: [
      {
        path: "/file/placeholder-hash",
        title: "View Files",
        description: "View uploaded files by hash",
        icon: FiDatabase,
      },
    ],
  },
};

const GET_CLIENT_STATS = gql`
  query GetClientStats {
    clientStats
  }
`;

const GET_PRODUCT_STATS = gql`
  query GetProductStats {
    productStats
  }
`;

const NavCard: React.FC<NavCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const colorMode = useColorModeValue("light", "dark");
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textColor = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const mutedTextColor = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const accentColor = getColor("primary", colorMode);

  const handleClick = () => {
    if (!item.comingSoon) {
      window.open(item.path, "_blank");
    }
  };

  return (
    <Card
      as="button"
      onClick={handleClick}
      cursor={item.comingSoon ? "not-allowed" : "pointer"}
      bg={cardGradientBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="xl"
      _hover={{
        transform: item.comingSoon ? "none" : "translateY(-2px)",
        boxShadow: item.comingSoon ? "none" : "lg",
      }}
      opacity={item.comingSoon ? 0.6 : 1}
      transition="all 0.2s"
      position="relative"
    >
      <CardBody>
        <VStack align="start" spacing={2}>
          <Icon as={item.icon} boxSize={6} color={item.comingSoon ? mutedTextColor : accentColor} />
          <Heading size="sm" color={item.comingSoon ? mutedTextColor : textColor}>
            {item.title}
          </Heading>
          <Text fontSize="sm" color={mutedTextColor}>
            {item.description}
          </Text>

          {item.comingSoon && (
            <Badge colorScheme="gray" mt={2}>
              Coming Soon
            </Badge>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const StatCard: React.FC<{
  label: string;
  mainValue: number;
  subValues: { label: string; value: number; link?: string; color?: string }[];
  helpText: string;
  icon: React.ComponentType;
  animate?: boolean;
  mainLink?: string;
  mainColor?: string;
}> = ({ label, mainValue, subValues, helpText, icon, animate = false, mainLink, mainColor = "blue.500" }) => {


  return (
    <Stat
      as={motion.div as any}
      initial={animate ? { scale: 0.9, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition="all 0.2s"
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={"gray.200"}
      rounded={"lg"}
    >
      <StatLabel fontWeight={"medium"} isTruncated>
        {label}
      </StatLabel>
      <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
        <RouterLink
          to={mainLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: `var(--chakra-colors-${mainColor})` }}
        >
          {mainValue}
        </RouterLink>
        {subValues.map((subValue, index) => (
          <Text key={index} as="span" fontSize="sm" ml={2}>
            <Text as="span" color={subValue.color || "gray.500"}>
              {subValue.label}
            </Text>
            :{" "}
            {subValue.link ? (
              <RouterLink
                to={subValue.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: `var(--chakra-colors-${subValue.color || "gray.500"})` }}
              >
                {subValue.value}
              </RouterLink>
            ) : (
              <Text as="span" color={subValue.color || "gray.500"}>
                {subValue.value}
              </Text>
            )}
          </Text>
        ))}
      </StatNumber>
      <HStack justify="space-between">
        <StatHelpText>
          <HStack>
            <Icon as={icon} boxSize={4} />
            <Text>{helpText}</Text>
          </HStack>
        </StatHelpText>
        <StatHelpText>
          {/* <Text fontWeight="bold">
            Total: {total}
          </Text> */}
        </StatHelpText>
      </HStack>
    </Stat>
  );
};

const AdminDashboard = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { modules, userPermissions, loading: modulesLoading } = useModules();

  // Get color mode for proper theme support
  const colorMode = useColorModeValue("light", "dark");

  // Consistent styling from brandConfig matching email module pattern
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const infoBg = getColor(colorMode === 'light' ? "background.light" : "background.darkSurface", colorMode);

  // GraphQL queries for stats
  const { loading: clientLoading, data: clientData, error: clientError } = useQuery(GET_CLIENT_STATS, {
    skip: !isAuthenticated || !user?.permissions?.includes("ADMIN"),
    fetchPolicy: "network-only"
  });

  const { loading: productLoading, data: productData, error: productError } = useQuery(GET_PRODUCT_STATS, {
    skip: !isAuthenticated || !user?.permissions?.includes("ADMIN"),
    fetchPolicy: "network-only"
  });

  // Show errors if queries fail
  useEffect(() => {
    if (clientError) {
      toast({
        title: "Error loading client statistics",
        description: clientError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    if (productError) {
      toast({
        title: "Error loading product statistics",
        description: productError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [clientError, productError, toast]);

  // Function to get personal booking calendar URL
  const getPersonalCalendarUrl = () => {
    return user?.id ? `/sessions/practitioner-calendar/${user.id}` : "#";
  };

  // Show login modal if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, loading]);

  // Redirect if explicitly clicked logout from the login modal
  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    if (!isAuthenticated) {
      navigate("/");
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box bg={bg} minHeight="100vh">
        <NavbarWithCallToAction />
        <Container maxW="md" py={12}>
          <Center h="50vh">
            <VStack spacing={6}>
              <Spinner size="xl" color={getColor("primary")} thickness="4px" />
              <Text color={textSecondary}>Loading authentication information...</Text>
            </VStack>
          </Center>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Box bg={bg} minHeight="100vh">
        <NavbarWithCallToAction />
        <Container maxW="md" py={12}>
          <VStack spacing={8}>
            <Box bg={getColor("background.card")} p={8} rounded="xl" shadow={getComponent("card", "shadow")} w="full">
              <VStack spacing={4}>
                <Icon as={FiLock} boxSize={12} color={getColor("primary")} />
                <Heading size="lg" color={textPrimary}>Authentication Required</Heading>
                <Text textAlign="center" color={textSecondary}>Please log in to access the admin dashboard.</Text>
                <Button
                  bg={getComponent("button", "primaryBg")}
                  color={getColor("text.inverse")}
                  _hover={{ bg: getComponent("button", "primaryHover") }}
                  onClick={() => setIsLoginModalOpen(true)}
                  leftIcon={<FiLock />}
                >
                  Log In
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Container>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={handleLoginModalClose}
        />
        <FooterWithFourColumns />
      </Box>
    );
  }

  // No admin permission state
  // if (!user?.permissions?.includes("TENANT_MASTER_ADMIN")) {
  //   return (
  //     <>
  //       <NavbarWithCallToAction />
  //       <Box minH="100vh" bg={infoBg} py={12}>
  //         <Container maxW="md">
  //           <VStack spacing={8}>
  //             <Box bg="white" p={8} rounded="xl" shadow="lg" w="full">
  //               <VStack spacing={4}>
  //                 <Icon as={FiAlertCircle} boxSize={12} color="red.500" />
  //                 <Heading size="lg" color="red.500">Access Denied</Heading>
  //                 <Text textAlign="center">You do not have permission to view this page.</Text>
  //                 <Text textAlign="center">Admin access is required.</Text>
  //                 <Button 
  //                   colorScheme="blue" 
  //                   onClick={() => navigate("/")}
  //                   leftIcon={<FiHome />}
  //                 >
  //                   Return to Home
  //                 </Button>
  //               </VStack>
  //             </Box>
  //           </VStack>
  //         </Container>
  //       </Box>
  //       <FooterWithFourColumns />
  //     </>
  //   );
  // }

  // Admin dashboard content for authenticated admin users
  return (
    <Box bg={bg} minHeight="100vh">
      <NavbarWithCallToAction />
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Heading size="xl" color={textPrimary}>Admin Dashboard</Heading>

          {/* Stripe Testing Instructions */}
          <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textPrimary}>💳 Stripe Testing Guide</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>🧪 Test Mode Active</Text>
                  <Text fontSize="sm" color={textSecondary} mb={3}>
                    All Stripe transactions are in test mode. No real charges will be made.
                  </Text>
                </Box>

                <Box p={4} bg={formBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                  <Text fontWeight="bold" mb={2} color={textPrimary}>Test Credit Cards:</Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={textSecondary}><strong>Success:</strong> 4242 4242 4242 4242</Text>
                    <Text fontSize="sm" color={textSecondary}><strong>Declined:</strong> 4000 0000 0000 0002</Text>
                    <Text fontSize="sm" color={textSecondary}><strong>Requires 3D Secure:</strong> 4000 0027 6000 3184</Text>
                    <Text fontSize="sm" color={textSecondary}><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</Text>
                  </VStack>
                  <Text fontSize="xs" color={textMuted} mt={2}>
                    Use any future expiry date (e.g., 12/34) and any CVC (e.g., 123)
                  </Text>
                </Box>

                <Box p={4} bg={infoBg} borderRadius="lg" border="1px solid" borderColor={cardBorder}>
                  <Text fontWeight="bold" mb={2} color={textPrimary}>Testing Workflow:</Text>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color={textSecondary}>
                      1. Go to <strong>Payment Methods</strong> → Add test card (4242 4242 4242 4242)
                    </Text>
                    <Text fontSize="sm" color={textSecondary}>
                      2. Go to <strong>Manual Charging</strong> → Select client and saved card
                    </Text>
                    <Text fontSize="sm" color={textSecondary}>
                      3. Enter amount and description → Process charge
                    </Text>
                    <Text fontSize="sm" color={textSecondary}>
                      4. Check <strong>Invoice History</strong> for transaction records
                    </Text>
                  </VStack>
                </Box>

                <HStack spacing={4} pt={2}>
                  <Button
                    size="sm"
                    onClick={() => window.open("/subscriptions/payment-methods", "_blank")}
                    bg={getColor("primary")}
                    color={getColor("background.white")}
                    _hover={{ bg: getColor("secondary") }}
                  >
                    Test Payment Methods
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open("/subscriptions/manual-charging", "_blank")}
                    bg={getColor("secondary")}
                    color={getColor("background.white")}
                    _hover={{ bg: getColor("primary") }}
                  >
                    Test Manual Charging
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open("https://dashboard.stripe.com/test/dashboard", "_blank")}
                    borderColor={getColor("border.medium")}
                    color={getColor("text.primary")}
                    _hover={{ bg: getColor("background.overlay") }}
                  >
                    Stripe Dashboard
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Start: How to Manually Charge a Client */}
          <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textPrimary}>⚡ Quick Start: How to Manually Charge a Client</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" color={textSecondary} mb={4}>
                    Follow these 3 simple steps to set up clients and charge them for your services. Perfect for consulting, development work, or any one-time services.
                  </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {/* Step 1: Add Client */}
                  <Box
                    p={6}
                    bg={infoBg}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={cardBorder}
                    textAlign="center"
                    position="relative"
                  >
                    <Badge
                      colorScheme="purple"
                      position="absolute"
                      top={2}
                      left={2}
                      fontSize="xs"
                    >
                      Step 1
                    </Badge>
                    <Icon as={FiUserPlus} boxSize={8} color="purple.500" mb={3} />
                    <Heading size="sm" color={textPrimary} mb={2}>
                      Add Your Client
                    </Heading>
                    <Text fontSize="sm" color={textSecondary} mb={4}>
                      Start by adding the person or business you want to charge to your client database.
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => window.open("/newclient", "_blank")}
                      bg="purple.500"
                      color="white"
                      _hover={{ bg: "purple.600" }}
                      leftIcon={<FiUserPlus />}
                    >
                      Add New Client
                    </Button>
                  </Box>

                  {/* Step 2: Add Payment Method */}
                  <Box
                    p={6}
                    bg={infoBg}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={cardBorder}
                    textAlign="center"
                    position="relative"
                  >
                    <Badge
                      colorScheme="blue"
                      position="absolute"
                      top={2}
                      left={2}
                      fontSize="xs"
                    >
                      Step 2
                    </Badge>
                    <Icon as={FiCreditCard} boxSize={8} color="blue.500" mb={3} />
                    <Heading size="sm" color={textPrimary} mb={2}>
                      Save Payment Method
                    </Heading>
                    <Text fontSize="sm" color={textSecondary} mb={4}>
                      Securely save your client's credit card details so you can charge them later without asking for card info again.
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => window.open("/subscriptions/payment-methods", "_blank")}
                      bg="blue.500"
                      color="white"
                      _hover={{ bg: "blue.600" }}
                      leftIcon={<FiCreditCard />}
                    >
                      Manage Payment Methods
                    </Button>
                  </Box>

                  {/* Step 3: Manual Charge */}
                  <Box
                    p={6}
                    bg={infoBg}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={cardBorder}
                    textAlign="center"
                    position="relative"
                  >
                    <Badge
                      colorScheme="green"
                      position="absolute"
                      top={2}
                      left={2}
                      fontSize="xs"
                    >
                      Step 3
                    </Badge>
                    <Icon as={FiDollarSign} boxSize={8} color="green.500" mb={3} />
                    <Heading size="sm" color={textPrimary} mb={2}>
                      Charge Client
                    </Heading>
                    <Text fontSize="sm" color={textSecondary} mb={4}>
                      Instantly charge your client's saved payment method for consulting, services, or any work you've completed.
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => window.open("/subscriptions/manual-charging", "_blank")}
                      bg="green.500"
                      color="white"
                      _hover={{ bg: "green.600" }}
                      leftIcon={<FiDollarSign />}
                    >
                      Manual Charging
                    </Button>
                  </Box>
                </SimpleGrid>

                <Box p={4} bg={infoBg} borderRadius="lg">
                  <Text fontSize="sm" color={textSecondary} textAlign="center">
                    <strong>💡 Pro Tip:</strong> After completing these steps once, you can skip to Step 3 for repeat clients.
                    Their payment method stays saved for future charges!
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* User Debug Info */}
          <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textPrimary}>🔍 Debug: User & Permissions</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">User:</Text>
                  <Text fontSize="sm" color={textSecondary}>
                    {user ? `${user.fName} ${user.lName} (${user.email})` : "Not logged in"}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">User Permissions:</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {userPermissions.length > 0 ? (
                      userPermissions.map((perm: string) => (
                        <Badge key={perm} colorScheme="blue">
                          {perm}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="sm" color={getColor("status.error")}>No permissions found</Text>
                    )}
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Modules Debug Info */}
          <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textPrimary}>🔍 Debug: Discovered Modules</Heading>
            </CardHeader>
            <CardBody>
              {modulesLoading ? (
                <Text>Loading modules...</Text>
              ) : (
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Total Modules Found: {modules.length}</Text>
                    {modules.length === 0 && (
                      <Text fontSize="sm" color={getColor("status.warning")} mt={2}>
                        ℹ️ Module auto-discovery is currently disabled. Using hardcoded sidebar navigation instead.
                      </Text>
                    )}
                  </Box>
                  <Divider />
                  {modules.length === 0 ? (
                    <Box p={4} bg={formBg} borderRadius="md">
                      <Text color={textSecondary} fontSize="sm">
                        Module discovery system is commented out for simplicity.
                        The sidebar uses a hardcoded menu structure with the following modules:
                      </Text>
                      <VStack align="start" mt={3} spacing={1}>
                        <Text fontSize="sm">• 🏠 Core: Dashboard, Clients</Text>
                        <Text fontSize="sm">• 💼 Business: Sessions, Projects, Products</Text>
                        <Text fontSize="sm">• 💳 Billing: Subscriptions, Bills</Text>
                        <Text fontSize="sm">• ⚙️ Administration: Admin Dashboard, Websites</Text>
                      </VStack>
                    </Box>
                  ) : (
                    modules.map((module) => (
                      <Box key={module.id} p={4} border="1px" borderColor={getColor("border.light")} borderRadius="md">
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <HStack>
                              <Text fontSize="lg">{module.icon}</Text>
                              <Text fontWeight="bold">{module.name}</Text>
                              <Badge colorScheme="green">v{module.version}</Badge>
                              <Badge colorScheme="purple">{module.category}</Badge>
                            </HStack>
                            <Badge colorScheme={module.enabled ? "green" : "red"}>
                              {module.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color={textMuted}>
                            {module.description}
                          </Text>
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">Required Permissions:</Text>
                            <HStack spacing={1} flexWrap="wrap">
                              {module.permissions.view.map((perm: string) => (
                                <Badge
                                  key={perm}
                                  colorScheme={userPermissions.includes(perm) ? "green" : "red"}
                                  size="sm"
                                >
                                  {perm}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">Navigation Items: {module.navigation?.length || 0}</Text>
                            <Text fontSize="sm" fontWeight="medium">Routes: {module.routes?.length || 0}</Text>
                          </Box>
                        </VStack>
                      </Box>
                    ))
                  )}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Stats Section */}
          {/* <Box mb={8}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {clientLoading ? (
                <Skeleton height="200px" />
              ) : (
                <StatCard
                  label="Members"
                  mainValue={clientData?.clientStats?.[0] || 0}
                  subValues={[
                    { label: "24h", value: clientData?.clientStats?.[1] || 0, color: "purple.500" },
                    { label: "7 days", value: clientData?.clientStats?.[2] || 0, color: "green.500" },
                    { label: "30 days", value: clientData?.clientStats?.[3] || 0, color: "blue.500" }
                  ]}
                  helpText="Total registered clients"
                  icon={FiUsers}
                  animate={true}
                />
              )}
              
              {productLoading ? (
                <Skeleton height="200px" />
              ) : (
                <StatCard
                  label="Products"
                  mainValue={productData?.productStats?.[0] || 0}
                  subValues={[
                    { label: "24h", value: productData?.productStats?.[1] || 0, color: "purple.500" },
                    { label: "7 days", value: productData?.productStats?.[2] || 0, color: "green.500" },
                    { label: "30 days", value: productData?.productStats?.[3] || 0, color: "blue.500" },
                    { label: "Active", value: productData?.productStats?.[4] || 0, color: "teal.500" },
                  ]}
                  helpText={`Physical: ${productData?.productStats?.[7] || 0} | Digital: ${productData?.productStats?.[8] || 0}`
                }
                  icon={FiPackage}
                  animate={true}
                />
              )}

              <StatCard
                label="Sales Today"
                mainValue={0}
                subValues={[
                  { label: "7 days", value: 0, color: "green.500" },
                  { label: "30 days", value: 0, color: "blue.500" }
                ]}
                helpText="Revenue in AUD"
                icon={FiDollarSign}
                animate={true}
                mainColor="green.500"
              />
            </SimpleGrid>
          </Box> */}

          {/* Business Overview Stats */}
          <Box mb={8}>
            <VStack align="start" spacing={4} mb={6}>
              <Heading size="lg">Your Business at a Glance</Heading>
              <Text color={textMuted} fontSize="sm">
                Track your business growth across all activities - from client relationships to project delivery
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <StatCard
                label="Active Clients"
                mainValue={clientData?.clientStats?.[0] || 0}
                subValues={[
                  { label: "New this week", value: clientData?.clientStats?.[2] || 0, color: "green.500" },
                ]}
                helpText="Building relationships"
                icon={FiUsers}
                animate={true}
                mainColor="blue.500"
              />

              <StatCard
                label="Live Projects"
                mainValue={0}
                subValues={[
                  { label: "Websites", value: 0, color: "purple.500" },
                  { label: "Consulting", value: 0, color: "orange.500" },
                ]}
                helpText="Active collaborations"
                icon={FiBriefcase}
                animate={true}
                mainColor="purple.500"
              />

              <StatCard
                label="Bookings This Month"
                mainValue={0}
                subValues={[
                  { label: "Sessions", value: 0, color: "teal.500" },
                  { label: "Events", value: 0, color: "cyan.500" },
                ]}
                helpText="Networking activities"
                icon={FiCalendar}
                animate={true}
                mainColor="teal.500"
              />

              <StatCard
                label="Monthly Revenue"
                mainValue={0}
                subValues={[
                  { label: "Invoiced", value: 0, color: "green.500" },
                  { label: "Pending", value: 0, color: "yellow.500" },
                ]}
                helpText="Business income (AUD)"
                icon={FiDollarSign}
                animate={true}
                mainColor="green.500"
              />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mt={4}>
              <StatCard
                label="Website Projects"
                mainValue={0}
                subValues={[
                  { label: "In Development", value: 0, color: "blue.500" },
                  { label: "Launched", value: 0, color: "green.500" },
                ]}
                helpText="Client web solutions"
                icon={FiCode}
                animate={true}
                mainColor="blue.500"
              />

              <StatCard
                label="SMS Campaigns"
                mainValue={0}
                subValues={[
                  { label: "Active", value: 0, color: "purple.500" },
                  { label: "Messages Sent", value: 0, color: "orange.500" },
                ]}
                helpText="Marketing outreach"
                icon={FiMail}
                animate={true}
                mainColor="purple.500"
              />

              <StatCard
                label="Products Created"
                mainValue={productData?.productStats?.[0] || 0}
                subValues={[
                  { label: "Physical", value: productData?.productStats?.[7] || 0, color: "brown.500" },
                  { label: "Digital", value: productData?.productStats?.[8] || 0, color: "cyan.500" },
                ]}
                helpText={`Active: ${productData?.productStats?.[4] || 0} products`}
                icon={FiPackage}
                animate={true}
                mainColor="orange.500"
              />
            </SimpleGrid>
          </Box>

          {/* Navigation Sections */}
          <VStack spacing={8} align="stretch">
            {Object.entries(navigationGroups).map(([key, group]) => (
              <Box key={key}>
                <VStack align="start" spacing={2} mb={6}>
                  <Heading size="md" color={textPrimary}>
                    {group.title}
                  </Heading>
                  {group.subtitle && (
                    <Text color={textMuted} fontSize="sm" maxW="2xl">
                      {group.subtitle}
                    </Text>
                  )}
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {group.items.map((item) => {
                    // Handle special case for personal calendar URL
                    const itemPath = item.title === "Your Public Booking Page"
                      ? getPersonalCalendarUrl()
                      : item.path;

                    return (
                      <NavCard
                        key={itemPath}
                        item={{ ...item, path: itemPath }}
                      />
                    );
                  })}
                </SimpleGrid>
                <Divider mt={8} />
              </Box>
            ))}
          </VStack>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default AdminDashboard; 