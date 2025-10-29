import React, { useEffect } from "react";
import { Button, useDisclosure, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { UnifiedLoginModal } from "./UnifiedLoginModal";
import { getColor, getComponent } from "../../../brandConfig";
import type { SecureMembershipButtonProps } from "../types";

export const SecureMembershipButton: React.FC<SecureMembershipButtonProps> = ({ size }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth, user } = useAuth();
  const [buttonText, setButtonText] = React.useState("Get Empowered");

  // Refresh auth context every 10 seconds
  useEffect(() => {
    // Initial refresh when component mounts
    refreshAuth();

    const intervalId = setInterval(() => {
      refreshAuth();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [refreshAuth]);

  // Update button text when user data changes
  useEffect(() => {
    if (user?.encryptedSignatureIpfsUrl) {
      console.log("User has signature:", user.encryptedSignatureIpfsUrl);
      setButtonText("View Products");
    } else {
      console.log("No signature found for user:", user);
      setButtonText("Get Empowered");
    }
  }, [user]);

  const handleClick = () => {
    if (!isAuthenticated) {
      onOpen();
      return;
    }

    if (user?.encryptedSignatureIpfsUrl) {
      navigate("/products");
    } else {
      navigate("/agreement");
    }
  };

  const handleLoginSuccess = async () => {
    await refreshAuth();
    onClose();
    navigate("/");
  };

  return (
    <>
      <VStack spacing={2}>
        <Button
          onClick={handleClick}
          size={{ base: "sm", md: size || "md" }}
          px={{ base: 3, md: 6 }}
          py={{ base: 1, md: 2 }}
          rounded="lg"
          fontWeight="600"
          bg="white"
          color="black"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          boxShadow="0 4px 20px rgba(54, 158, 255, 0.15)"
          position="relative"
          overflow="hidden"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          fontSize={{ base: "sm", md: "md" }}
          whiteSpace="nowrap"
          _before={{
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "0",
            height: "0",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(54, 158, 255, 0.3) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            transition: "width 0.4s ease, height 0.4s ease",
          }}
          _hover={{
            transform: "translateY(-2px) scale(1.02)",
            boxShadow: "0 8px 30px rgba(54, 158, 255, 0.25)",
            bg: "rgba(255, 255, 255, 0.95)",
            borderColor: "rgba(54, 158, 255, 0.4)",
            _before: {
              width: "300px",
              height: "300px",
            }
          }}
          _active={{
            transform: "translateY(0) scale(0.98)",
            boxShadow: "0 2px 10px rgba(54, 158, 255, 0.2)",
          }}
        >
          {buttonText}
        </Button>

        {!isAuthenticated && (
          <Text
            fontSize="xs"
            color={getColor("text.muted")}
            fontWeight="500"
            cursor="pointer"
            onClick={onOpen}
            px={3}
            py={1}
            rounded="md"
            transition="all 0.2s ease"
            _hover={{
              color: getColor("primary"),
              bg: getColor("background.overlay"),
              transform: "scale(1.02)",
            }}
            textAlign="center"
            letterSpacing="wide"
          >
            login
          </Text>
        )}
      </VStack>

      <UnifiedLoginModal
        isOpen={isOpen}
        onClose={onClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};