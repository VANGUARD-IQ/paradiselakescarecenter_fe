import {
  Box,
  Container,
  Divider,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Link,
  useColorMode
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { Logo } from "../../../Logo"
// import { links } from './_data'
import { useAuth } from "../../../contexts/AuthContext";
import { CartPreview } from "../../../pages/products/components/CartPreview";
import { getColor, brandConfig, getComponent } from "../../../brandConfig";






export const FooterWithFourColumns = () => {
  const { user, isAuthenticated } = useAuth();
  const { colorMode } = useColorMode();

  // Detailed console logging of user data
  // console.log('🦶 Footer Auth State:', {
  //   isAuthenticated,
  //   userData: {
  //     id: user?.id,
  //     name: `${user?.fName} ${user?.lName}`,
  //     email: user?.email,
  //     role: user?.role,
  //     permissions: user?.permissions,
  //     isVerifiedSeller: user?.isVerifiedSeller,
  //     businessDetails: {
  //       name: user?.businessName,
  //       registrationNumber: user?.businessRegistrationNumber
  //     },
  //     addresses: {
  //       shipping: user?.shippingAddresses,
  //       billing: user?.billingAddresses
  //     },
  //     paymentDetails: user?.paymentReceivingDetails,
  //     documents: {
  //       signature: user?.encryptedSignatureIpfsUrl
  //     },
  //     dates: {
  //       created: user?.createdAt,
  //       updated: user?.updatedAt
  //     },
  //     tenantId: user?.tenantId
  //   }
  // });

  const links = [
    {
      // title: 'Company',
      links: [

        // { label: 'New Website', href: '/newwebsite' },
        // { label: 'Websites', href: '/websites' },
        // { label: 'Services', href: '/services' },
        // { label: 'New Service', href: '/services/new' },
        ...(isAuthenticated ? [{ label: "Marketplace", href: "/products" }] : []),
        // { label: "Governance", href: "/governance" },


        // ...(isAuthenticated && user?.permissions?.includes('SELLER') ? [{ label: 'Add Product', href: '/products/new' }] : []),
        // Add membership agreement link if signature exists
        ...(user?.encryptedSignatureIpfsUrl ? [
          {
            label: "My Signed Membership Agreement",
            href: `/membership-certificate/${user.id}`
          }
        ] : []),
        // { label: 'Careers', href: '#' },
        // { label: 'Press', href: '#' },
        // { label: 'FAQs', href: '/earn' },
      ],
    },
    {
      title: "Resources",
      links: [
        // { label: "Blog", href: "/blog" },
        // ...(isAuthenticated ? [{ label: "News", href: "/news" }] : []),
        // ...(isAuthenticated ? [{ label: 'SATS=>AUD', href: 'https://coincodex.com/convert/satoshi-sats/aud/1000/' }] : []),
        // { label: 'Case studies', href: '#' },
        // { label: 'Media Assets', href: '#' },
      ],
    },
    {
      title: "Admin",
      links: [
        ...(user?.permissions?.includes("admin") ? [{ label: "All Users (admin)", href: "/allusers" }] : []),
        ...(user?.permissions?.includes("admin") ? [{ label: "All Purchases (admin)", href: "/alluserspurchases" }] : []),
        // ...(user?.permissions?.includes("admin") ? [{ label: "Node Info (admin)", href: "/nodeinfo" }] : []),
        // ...(user?.permissions?.includes('admin') ? [{ label: 'BTCPay Invoices', href: '/btcpayinvoices' }] : []),
        // ...(user?.permissions?.includes('admin') ? [{ label: 'All Orders', href: '/allorders' }] : []),
        ...(user?.permissions?.includes("admin") ? [{ label: "3 Day Challenge", href: "/3daychallenge" }] : []),
        ...(user?.permissions?.includes("admin") ? [{ label: "1 Lead Magnet", href: "/leadmagnet" }] : []),
        ...(user?.permissions?.includes("admin") ? [{ label: "2 Webinar Invite", href: "/relationships/free-event" }] : []),
        ...(user?.permissions?.includes("admin") ? [{ label: "3 Sales Page", href: "/courses/relationships/start" }] : []),
        // ...(user?.permissions?.includes('admin') ? [{ label: '2 Webinar Sales Page', href: '/relationships/free-event' }] : []),
        // ...(user?.permissions?.includes('admin') ? [{ label: 'Relationship Registrations', href: '/admin/relationshipcourseregistrations' }] : []),
        // { label: 'Privacy Policy', href: '#' },
        // { label: 'Offer terms', href: '#' },
        // { label: 'License', href: '#' },
        // { label: "About", href: "/founders" },
      ],
    },
  ]

  // Debug log for links visibility
  // console.log('🔗 Footer Links State:', {
  //   isAuthenticated,
  //   userPermissions: user?.permissions,
  //   visibleLinks: links.map(group => ({
  //     title: group.title,
  //     links: group.links.map(link => link.label)
  //   }))
  // });

  // Debug log to verify signature URL condition
  // console.log('📜 Membership Agreement State:', {
  //   hasSignature: !!user?.encryptedSignatureIpfsUrl,
  //   signatureUrl: user?.encryptedSignatureIpfsUrl,
  //   userId: user?.id,
  //   membershipLink: user?.encryptedSignatureIpfsUrl ? `/membership-certificate/${user.id}` : null
  // });

  return (<>
    <Box
      bg={getComponent("footer", "bg", colorMode)}
      borderTop="1px solid"
      borderColor={getColor("border.light", colorMode)}
      py={8}
      mt="auto" // This pushes the footer to the bottom
    >
      <Container as="footer" role="contentinfo" maxW="6xl">
        <VStack spacing={8}>
          {/* Main Footer Content */}
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={8}
            width="full"
          >
            {/* Brand Section */}
            <VStack align="start" spacing={4}>
              <Logo />
              <Text fontSize="sm" color={getComponent("footer", "text", colorMode)} maxW="280px">
                {brandConfig.description}
              </Text>
            </VStack>

            {/* Links Section */}
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" fontWeight="600" color={colorMode === 'light' ? getColor("text.primary", colorMode) : "white"}>
                Quick Links
              </Text>
              <VStack align="start" spacing={2}>
                {links.slice(0, 2).map((group) =>
                  group.links.map((link, idx) => (
                    <Link
                      key={idx}
                      as={RouterLink}
                      to={link.href}
                      color={getComponent("footer", "linkColor", colorMode)}
                      fontSize="sm"
                      fontWeight="400"
                      transition="all 0.2s ease"
                      _hover={{
                        color: getComponent("footer", "linkHover", colorMode),
                        textDecoration: "none"
                      }}
                    >
                      {link.label}
                    </Link>
                  ))
                )}
              </VStack>
            </VStack>

            {/* Contact Section */}
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" fontWeight="600" color={colorMode === 'light' ? getColor("text.primary", colorMode) : "white"}>
                Contact
              </Text>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color={getComponent("footer", "text", colorMode)}>
                  {brandConfig.contact.businessType}
                </Text>
                <Text fontSize="sm" color={getComponent("footer", "text", colorMode)}>
                  {brandConfig.contact.industry}
                </Text>
                {brandConfig.contact.email && (
                  <Text fontSize="sm" color={getComponent("footer", "text", colorMode)}>
                    {brandConfig.contact.email}
                  </Text>
                )}
              
              </VStack>
            </VStack>
          </SimpleGrid>

          {/* Bottom Bar */}
          <Divider borderColor={getColor("border.light")} />

          <HStack justify="space-between" w="full" flexWrap="wrap" spacing={4}>
            <Text fontSize="xs" color={getComponent("footer", "text")}>
              &copy; {new Date().getFullYear()} {brandConfig.siteName}. All rights reserved.
            </Text>

            <HStack spacing={6} flexWrap="wrap">
              <Link
                as={RouterLink}
                to="/governance"
                fontSize="xs"
                color={getComponent("footer", "linkColor")}
                _hover={{
                  color: getComponent("footer", "linkHover"),
                  textDecoration: "none"
                }}
              >
                Privacy
              </Link>
              <Link
                as={RouterLink}
                to="/governance"
                fontSize="xs"
                color={getComponent("footer", "linkColor")}
                _hover={{
                  color: getComponent("footer", "linkHover"),
                  textDecoration: "none"
                }}
              >
                Terms
              </Link>
              <Link
                as={RouterLink}
                to="/"
                fontSize="xs"
                color={getComponent("footer", "linkColor")}
                _hover={{
                  color: getComponent("footer", "linkHover"),
                  textDecoration: "none"
                }}
              >
                Contact
              </Link>
            </HStack>
          </HStack>
        </VStack>
      </Container>
    </Box>

    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={999}
    >
      <CartPreview />
    </Box>
  </>
  )
}