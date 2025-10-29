import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  useColorMode,
  Box,
  Text,
  Icon,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { FaUserCheck, FaPodcast } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { UPDATE_CLIENT } from "../queries";
import type { CaptureUserDetailsModalProps, UserDetailsFormData } from "../types";
import { getColor, brandConfig } from "../../../brandConfig";

export const CaptureUserDetailsModal: React.FC<CaptureUserDetailsModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUpdateSuccess,
  currentUserData
}) => {
  const [formData, setFormData] = useState<UserDetailsFormData>({
    firstName: currentUserData?.fName || "",
    lastName: currentUserData?.lName || "",
    email: currentUserData?.email || "",
    phoneNumber: currentUserData?.phoneNumber || "",
  });
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [updateClient, { loading }] = useMutation(UPDATE_CLIENT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Determine which fields are missing
  const needsEmail = !currentUserData?.email;
  const needsPhone = !currentUserData?.phoneNumber;

  const handleSubmit = async () => {
    // Basic validation - check only required fields
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Missing information",
        description: "Please fill in your first and last name",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Validate email only if needed
    if (needsEmail) {
      if (!formData.email) {
        toast({
          title: "Missing email",
          description: "Please enter your email address",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          status: "error",
          duration: 3000,
        });
        return;
      }
    }

    // Validate phone only if needed
    if (needsPhone && !formData.phoneNumber) {
      toast({
        title: "Missing phone number",
        description: "Please enter your phone number",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // Build update input with only fields being updated
      const updateInput: any = {
        fName: formData.firstName,
        lName: formData.lastName,
      };

      if (needsEmail && formData.email) {
        updateInput.email = formData.email;
      }

      if (needsPhone && formData.phoneNumber) {
        updateInput.phoneNumber = formData.phoneNumber;
      }

      const { data: _data } = await updateClient({
        variables: {
          id: userId,
          input: updateInput
        }
      });

      toast({
        title: "Success! 🎉",
        description: "Your profile has been updated!",
        status: "success",
        duration: 5000,
      });

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your profile",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Consistent styling using brand colors - follows light/dark mode standard
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode); // Warm gold #e6ab11
  const primaryHover = getColor("primaryHover", colorMode); // Deep gold #8d721e
  const accentColor = getColor("accent", colorMode); // Warm orange #e5541d

  // Don't show modal if we already have all the data
  if (currentUserData?.fName && currentUserData?.lName && currentUserData?.email && currentUserData?.phoneNumber) {
    console.log('✅ User already has complete profile data, not showing modal');
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false} size="lg">
      <ModalOverlay
        bg={colorMode === 'light' ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.7)"}
        backdropFilter="blur(10px)"
      />
      <ModalContent
        bg={cardBg}
        backdropFilter="blur(20px)"
        borderColor={cardBorder}
        border="1px solid"
        boxShadow={colorMode === 'light' ? "0 8px 32px 0 rgba(0, 0, 0, 0.1)" : "0 8px 32px 0 rgba(0, 0, 0, 0.5)"}
      >
        <ModalHeader borderBottom="1px" borderColor={cardBorder}>
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FaUserCheck} color={primaryColor} />
              <Text color={textPrimary} fontFamily={brandConfig.fonts.heading}>
                Complete Your Profile
              </Text>
            </HStack>
            <Badge
              bg={`${primaryColor}20`}
              color={primaryColor}
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              <HStack spacing={1}>
                <Icon as={FaPodcast} boxSize={3} />
                <Text>Get Instant Podcast Access</Text>
              </HStack>
            </Badge>
          </VStack>
        </ModalHeader>
        <ModalCloseButton 
          color={textSecondary}
          _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}
        />
        <ModalBody pb={6} pt={6}>
          <VStack align="stretch" spacing={4}>
            <Text color={textSecondary} fontSize="md">
              Complete your profile to unlock exclusive podcast content and receive notifications when new episodes are released.
            </Text>
            
            {/* Debug info - show client ID if available */}
            {(userId || currentUserData) && (
              <Box
                p={3}
                bg={`${primaryColor}10`}
                borderRadius="md"
                border="1px solid"
                borderColor={`${primaryColor}40`}
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color={textMuted}>Client Information:</Text>
                  {userId && (
                    <Text fontSize="xs" color={textSecondary}>
                      ID: {userId}
                    </Text>
                  )}
                  {currentUserData?.fName && currentUserData?.lName && (
                    <Text fontSize="xs" color={textSecondary}>
                      Current Name: {currentUserData.fName} {currentUserData.lName}
                    </Text>
                  )}
                  {currentUserData?.email && (
                    <Text fontSize="xs" color={textSecondary}>
                      Current Email: {currentUserData.email}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
          <VStack spacing={4} mt={4}>
            <FormControl isRequired>
              <FormLabel color={textPrimary}>First Name<Text as="span" color="red.400">*</Text></FormLabel>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                borderRadius="lg"
                _placeholder={{ color: textMuted }}
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}40`
                }}
                _hover={{
                  borderColor: primaryColor
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Last Name<Text as="span" color="red.400">*</Text></FormLabel>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                borderRadius="lg"
                _placeholder={{ color: textMuted }}
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}40`
                }}
                _hover={{
                  borderColor: primaryColor
                }}
              />
            </FormControl>

            {/* Only show email field if it's missing */}
            {needsEmail && (
              <FormControl isRequired>
                <FormLabel color={textPrimary}>Email<Text as="span" color="red.400">*</Text></FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  borderRadius="lg"
                  _placeholder={{ color: textMuted }}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}40`
                  }}
                  _hover={{
                    borderColor: primaryColor
                  }}
                />
              </FormControl>
            )}

            {/* Only show phone field if it's missing */}
            {needsPhone && (
              <FormControl isRequired>
                <FormLabel color={textPrimary}>Phone Number<Text as="span" color="red.400">*</Text></FormLabel>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number (e.g., +61412345678)"
                  bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  borderRadius="lg"
                  _placeholder={{ color: textMuted }}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}40`
                  }}
                  _hover={{
                    borderColor: primaryColor
                  }}
                />
              </FormControl>
            )}

            <Button
              bg={primaryColor}
              color="white"
              _hover={{
                bg: primaryHover,
                transform: "translateY(-2px)"
              }}
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
              w="full"
              mt={4}
              size="lg"
              boxShadow={`0 2px 4px ${primaryColor}40`}
              leftIcon={<Icon as={FaPodcast} />}
            >
              Save and Get Podcast Access
            </Button>

            <Text fontSize="xs" color={textMuted} textAlign="center" mt={2}>
              By completing your profile, you'll receive email notifications about new podcast episodes and exclusive content.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};