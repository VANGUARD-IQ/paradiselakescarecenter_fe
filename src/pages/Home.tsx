import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Image,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getBrandValue } from "../brandConfig";
import { UnifiedLoginModal } from "./authentication/components/UnifiedLoginModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated } = useAuth();

  // Theme-aware colors
  const bg = getColor("background.main", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const accentBlue = getColor("primary", colorMode);
  const accentHover = getColor("primaryHover", colorMode);

  const handleLoginSuccess = () => {
    onClose();
    // Reload to update auth state
    window.location.reload();
  };

  return (
    <Box
      bg={bg}
      minHeight="100vh"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <NavbarWithCallToAction />

      <Container
        maxW="600px"
        py={20}
        position="relative"
        zIndex={2}
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={8} align="center" textAlign="center">
          {/* Logo */}
          <Image
            src={getBrandValue("logo.src")}
            alt={getBrandValue("logo.alt")}
            maxW={{ base: "200px", md: "300px" }}
            objectFit="contain"
          />

          {/* Site Name */}
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="600"
            letterSpacing="-0.02em"
            color={textPrimary}
            fontFamily={getBrandValue("fonts.heading")}
            lineHeight="1.1"
          >
            {getBrandValue("siteName")}
          </Heading>

          {/* Tagline */}
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color={textSecondary}
            maxW="500px"
            fontFamily={getBrandValue("fonts.body")}
            lineHeight="1.6"
          >
            {getBrandValue("tagline")}
          </Text>

          {/* Login Button - Only show when not authenticated */}
          {!isAuthenticated && (
            <>
              <Button
                size="lg"
                bg={accentBlue}
                color="white"
                _hover={{
                  bg: accentHover,
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                onClick={onOpen}
                px={12}
                py={7}
                fontSize="lg"
                borderRadius="lg"
                transition="all 0.2s"
              >
                Staff Login
              </Button>

              {/* Description */}
              <Text
                fontSize="sm"
                color={textSecondary}
                maxW="400px"
              >
                Management portal for Paradise Lakes Care Centre staff
              </Text>
            </>
          )}
        </VStack>
      </Container>

      <FooterWithFourColumns />

      {/* Login Modal */}
      <UnifiedLoginModal
        isOpen={isOpen}
        onClose={onClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </Box>
  );
};

export default Home;
