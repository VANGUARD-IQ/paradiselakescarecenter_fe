import React, { useState, useEffect } from "react";
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
  Box,
  Text,
  HStack,
  InputGroup,
  InputLeftAddon,
  Select,
  FormHelperText,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { getColor, getComponent, brandConfig } from "../../brandConfig";

// Country codes for phone number formatting (from SMS login modal)
const COUNTRY_CODES = [
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
];

const CREATE_CLIENT = gql`
  mutation CreateClient($input: ClientInput!) {
    createClient(input: $input) {
      id
      fName
      lName
      email
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectUpdateInput!) {
    updateProject(id: $id, input: $input) {
      id
      projectName
      projectGoal
      members {
        id
        fName
        lName
        email
      }
    }
  }
`;

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      members {
        id
        fName
        lName
        email
      }
    }
  }
`;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberAdded: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
}) => {
  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to Australia
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const toast = useToast();

  const [createClient, { loading: createLoading }] = useMutation(CREATE_CLIENT, {
    refetchQueries: ["GetClients"]
  });

  const [updateProject] = useMutation(UPDATE_PROJECT);

  const { data: projectData } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_CODES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Clear local number when changing countries to avoid confusion
      setLocalPhoneNumber("");
    }
  };

  // Format phone number when country or local number changes (from SMS login modal)
  useEffect(() => {
    if (!localPhoneNumber.trim()) {
      setFormattedPhoneNumber("");
      setFormData(prev => ({ ...prev, phoneNumber: "" }));
      return;
    }

    let cleanedLocal = localPhoneNumber.trim();

    // Remove any spaces, dashes, parentheses
    cleanedLocal = cleanedLocal.replace(/[\s\-\(\)]/g, "");

    // Remove any existing plus sign
    if (cleanedLocal.startsWith("+")) {
      cleanedLocal = cleanedLocal.substring(1);
    }

    // Remove country code if user accidentally included it
    const countryCodeWithoutPlus = selectedCountry.code.substring(1); // Remove + from country code
    if (cleanedLocal.startsWith(countryCodeWithoutPlus)) {
      cleanedLocal = cleanedLocal.substring(countryCodeWithoutPlus.length);
    }

    // Format the complete number
    const completeNumber = selectedCountry.code + cleanedLocal;
    setFormattedPhoneNumber(completeNumber);
    setFormData(prev => ({ ...prev, phoneNumber: completeNumber }));
  }, [selectedCountry, localPhoneNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPhoneNumber(e.target.value);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setLocalPhoneNumber("");
    setFormattedPhoneNumber("");
    setSelectedCountry(COUNTRY_CODES[0]);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Phone validation
    if (!formattedPhoneNumber || !formattedPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // Step 1: Create the new client
      const { data: clientData } = await createClient({
        variables: {
          input: {
            fName: formData.firstName.trim(),
            lName: formData.lastName.trim(),
            email: formData.email.trim(),
            phoneNumber: formattedPhoneNumber,
          }
        }
      });

      if (!clientData?.createClient) {
        throw new Error("Failed to create client");
      }

      // Step 2: Add the new client to the project as a member
      const currentMemberIds = projectData?.project?.members?.map((member: any) => member.id) || [];
      const updatedMemberIds = [...currentMemberIds, clientData.createClient.id];

      await updateProject({
        variables: {
          id: projectId,
          input: {
            members: updatedMemberIds,
          },
        },
      });

      toast({
        title: "Success!",
        description: `${formData.firstName} ${formData.lastName} has been created and added to the project`,
        status: "success",
        duration: 5000,
      });

      resetForm();
      onMemberAdded();
      onClose();

    } catch (error) {
      console.error("Error creating and adding member:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create and add member",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(30, 30, 30, 0.98)"
        backdropFilter="blur(20px)"
        borderColor={cardBorder}
        border="1px solid"
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
      >
        <ModalHeader borderBottom="1px" borderColor={cardBorder}>
          <Text color={textPrimary} fontFamily={brandConfig.fonts.heading}>
            Add New Team Member
          </Text>
        </ModalHeader>
        <ModalCloseButton 
          color={textSecondary}
          _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}
        />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color={textSecondary}>
              Create a new client and add them to this project as a team member.
            </Text>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>First Name<Text as="span" color="red.400">*</Text></FormLabel>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                borderRadius="lg"
                _placeholder={{ color: textMuted }}
                _focus={{
                  borderColor: textSecondary,
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
                _hover={{
                  borderColor: textSecondary
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Last Name<Text as="span" color="red.400">*</Text></FormLabel>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                borderRadius="lg"
                _placeholder={{ color: textMuted }}
                _focus={{
                  borderColor: textSecondary,
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
                _hover={{
                  borderColor: textSecondary
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Email<Text as="span" color="red.400">*</Text></FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                bg="rgba(0, 0, 0, 0.2)"
                border="1px"
                borderColor={cardBorder}
                color={textPrimary}
                borderRadius="lg"
                _placeholder={{ color: textMuted }}
                _focus={{
                  borderColor: textSecondary,
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
                _hover={{
                  borderColor: textSecondary
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Phone Number<Text as="span" color="red.400">*</Text></FormLabel>
              <VStack spacing={2} align="stretch">
                <Select
                  value={selectedCountry.code}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  borderRadius="lg"
                  _focus={{
                    borderColor: textSecondary,
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                  }}
                  _hover={{
                    borderColor: textSecondary
                  }}
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                      {country.flag} {country.name} ({country.code})
                    </option>
                  ))}
                </Select>
                <InputGroup>
                  <InputLeftAddon
                    bg="rgba(0, 0, 0, 0.3)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    {selectedCountry.code}
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    value={localPhoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                </InputGroup>
                {formattedPhoneNumber && (
                  <FormHelperText color={textSecondary}>
                    Formatted: {formattedPhoneNumber}
                  </FormHelperText>
                )}
              </VStack>
            </FormControl>

            <HStack spacing={3} pt={4}>
              <Button
                variant="outline"
                onClick={handleClose}
                flex={1}
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{ 
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)" 
                }}
              >
                Cancel
              </Button>
              <Button
                bg={getColor("components.button.primaryBg")}
                color="white"
                _hover={{ 
                  bg: getColor("components.button.primaryHover"),
                  transform: "translateY(-2px)"
                }}
                onClick={handleSubmit}
                isLoading={createLoading}
                loadingText="Creating..."
                flex={1}
                boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
              >
                Create & Add Member
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};