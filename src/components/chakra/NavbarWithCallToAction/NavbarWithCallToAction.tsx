// components/chakra/NavbarWithCallToAction/NavbarWithCallToAction.tsx

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { Logo } from "../../../Logo";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getColor } from "../../../brandConfig";
import { FiLogOut } from 'react-icons/fi';

export const NavbarWithCallToAction = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Box
        position="sticky"
        top={0}
        left={0}
        right={0}
        zIndex="sticky"
        bg={colorMode === 'light'
          ? "#FFFFFF"
          : "rgba(8, 9, 10, 0.95)"}
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor={colorMode === 'light'
          ? "#E2E8F0"
          : "rgba(255, 255, 255, 0.1)"}
        boxShadow={colorMode === 'light'
          ? "0 1px 3px rgba(0, 0, 0, 0.12)"
          : "0 4px 20px 0 rgba(0, 0, 0, 0.5)"}
        margin={0}
        padding={0}
        width="100%"
        overflow="hidden"
      >
        <Container maxW="7xl" position="relative" zIndex={1} px={{ base: 3, md: 6 }}>
          <Flex
            minH={{ base: "56px", md: "64px" }}
            py={{ base: 2, md: 4 }}
            align="center"
            justify="space-between"
            gap={{ base: 2, md: 4 }}
            width="100%"
          >
            <Link onClick={handleLogoClick} style={{ cursor: "pointer" }} flexShrink={0}>
              <Logo />
            </Link>

          <HStack spacing={{ base: 1, md: 4 }} flexShrink={0}>
            {isAuthenticated && (
              <IconButton
                aria-label="Logout"
                icon={<FiLogOut />}
                size="sm"
                variant="ghost"
                color="red.400"
                onClick={handleLogout}
                _hover={{
                  color: "red.500",
                  bg: "red.50",
                }}
              />
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};