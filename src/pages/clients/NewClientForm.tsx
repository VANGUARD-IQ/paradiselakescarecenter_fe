import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Container,
  useToast,
  Box,
  useColorMode,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor, brandConfig } from "../../brandConfig";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import clientsModuleConfig from "./moduleConfig";

interface FormData {
  email: string;
  fName: string;
  lName: string;
  phoneNumber: string;
}

const initialFormData: FormData = {
  email: "",
  fName: "",
  lName: "",
  phoneNumber: "",
};

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



const NewClientForm = () => {
  usePageTitle("New Client");
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isFromBooking, setIsFromBooking] = useState(false);
  const [createClient, { loading }] = useMutation(CREATE_CLIENT, {
    refetchQueries: ["GetClients"]
  });
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // Pre-fill from URL parameters (e.g., from booking)
  useEffect(() => {
    const fName = searchParams.get('fName');
    const lName = searchParams.get('lName');
    const email = searchParams.get('email');
    const phoneNumber = searchParams.get('phoneNumber');
    const source = searchParams.get('source');

    if (fName || lName || email || phoneNumber) {
      console.log('📋 Pre-filling client form from URL params');
      setFormData({
        fName: fName || '',
        lName: lName || '',
        email: email || '',
        phoneNumber: phoneNumber || '',
      });

      if (source === 'booking') {
        setIsFromBooking(true);
      }
    }
  }, [searchParams]);

  // Consistent styling from brandConfig with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fName.trim() || !formData.lName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in first name and last name",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Only validate email if it's provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    if (!formData.phoneNumber ||
      !formData.phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number in E.164 format (e.g., +12345678901)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/\s+/g, "");

      const input: any = {
        fName: formData.fName.trim(),
        lName: formData.lName.trim(),
        phoneNumber: cleanPhoneNumber
      };

      // Only include email if it's provided
      if (formData.email.trim()) {
        input.email = formData.email.trim();
      }

      await createClient({
        variables: { input }
      });

      toast({
        title: "Success!",
        description: "New client has been successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/clients");
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error creating client",
        description: error instanceof Error
          ? error.message
          : "There was an error creating the client. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={clientsModuleConfig} />
      <Container maxW="container.md" py={4} flex="1">
        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
          borderRadius="xl"
          overflow="hidden"
        >
          <CardHeader borderBottom="1px" borderColor={cardBorder}>
            <Heading
              size="lg"
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
              fontWeight="600"
            >
              👥 New Client
            </Heading>
          </CardHeader>
          <CardBody p={8}>
            {isFromBooking && (
              <Alert status="info" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Pre-filled from Booking</AlertTitle>
                  <AlertDescription fontSize="sm">
                    This form has been pre-filled with information from a public booking. Review and save to create the client record.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel
                    color={textPrimary}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                  >
                    First Name
                  </FormLabel>
                  <Input
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary,
                      boxShadow: colorMode === 'light'
                        ? "0 0 0 1px rgba(0, 122, 255, 0.2)"
                        : "0 0 0 1px rgba(255, 255, 255, 0.1)",
                      outline: "none"
                    }}
                    _hover={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary
                    }}
                    size="lg"
                    fontFamily={brandConfig.fonts.body}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    color={textPrimary}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                  >
                    Last Name
                  </FormLabel>
                  <Input
                    name="lName"
                    value={formData.lName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary,
                      boxShadow: colorMode === 'light'
                        ? "0 0 0 1px rgba(0, 122, 255, 0.2)"
                        : "0 0 0 1px rgba(255, 255, 255, 0.1)",
                      outline: "none"
                    }}
                    _hover={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary
                    }}
                    size="lg"
                    fontFamily={brandConfig.fonts.body}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    color={textPrimary}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                  >
                    Email (Optional)
                  </FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="john@example.com (optional)"
                    onChange={handleChange}
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary,
                      boxShadow: colorMode === 'light'
                        ? "0 0 0 1px rgba(0, 122, 255, 0.2)"
                        : "0 0 0 1px rgba(255, 255, 255, 0.1)",
                      outline: "none"
                    }}
                    _hover={{
                      borderColor: colorMode === 'light' ? "#007AFF" : textSecondary
                    }}
                    size="lg"
                    fontFamily={brandConfig.fonts.body}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    color={textPrimary}
                    fontWeight="500"
                    fontSize="sm"
                    mb={2}
                  >
                    Phone Number
                  </FormLabel>
                  <Box
                    border="1px"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    _focusWithin={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                    bg="rgba(0, 0, 0, 0.2)"
                    p={3}
                  >
                    <PhoneInput
                      international
                      defaultCountry="AU"
                      value={formData.phoneNumber}
                      onChange={(value) => {
                        console.log("Phone input value:", value);
                        setFormData(prev => ({ ...prev, phoneNumber: value || "" }))
                      }}
                      placeholder="Enter phone number"
                      style={{
                        ".PhoneInputInput": {
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: "16px",
                          fontFamily: brandConfig.fonts.body,
                          color: textPrimary
                        },
                        ".PhoneInputCountrySelect": {
                          border: "none",
                          background: "transparent",
                          color: textPrimary
                        }
                      }}
                    />
                  </Box>
                </FormControl>

                <Button
                  type="submit"
                  bg="white"
                  color="black"
                  _hover={{ 
                    bg: "gray.100",
                    transform: "translateY(-2px)"
                  }}
                  _active={{ transform: "translateY(1px)" }}
                  isLoading={loading}
                  loadingText="Creating Client..."
                  size="lg"
                  borderRadius="lg"
                  fontWeight="600"
                  boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                  mt={4}
                  fontFamily={brandConfig.fonts.body}
                >
                  Create Client
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default NewClientForm;
