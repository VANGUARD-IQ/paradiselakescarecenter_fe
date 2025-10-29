import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  useToast,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

const REQUEST_AUTH = gql`
  mutation RequestAuth($input: AuthInput!) {
    requestAuth(input: $input)
  }
`;

const VERIFY_AUTH = gql`
  mutation VerifyAuth($input: VerifyInput!) {
    verifyAuth(input: $input)
  }
`;

const TestAuth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationWords, setVerificationWords] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const toast = useToast();

  const [requestAuth, { loading: requestLoading }] = useMutation(REQUEST_AUTH);
  const [verifyAuth, { loading: verifyLoading }] = useMutation(VERIFY_AUTH);

  const handleRequestAuth = async () => {
    try {
      const { data } = await requestAuth({
        variables: {
          input: { email }
        }
      });

      if (data.requestAuth) {
        setEmailSent(true);
        toast({
          title: "Verification email sent",
          description: "Please check your email for the verification words",
          status: "success",
          duration: 5000,
        });
      } else {
        throw new Error("Failed to send verification email");
      }
    } catch (error) {
      console.error("Request auth error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification email",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleVerifyAuth = async () => {
    try {
      const { data } = await verifyAuth({
        variables: {
          input: {
            email,
            words: verificationWords
          }
        }
      });

      if (data.verifyAuth) {
        setToken(data.verifyAuth);
        // Store the token in localStorage for future use
        localStorage.setItem("auth_token", data.verifyAuth);
        
        toast({
          title: "Verification successful",
          description: "You have been successfully authenticated",
          status: "success",
          duration: 5000,
        });
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error("Verify auth error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Verification failed",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>Test Authentication</Heading>
          
          {/* Step 1: Request Authentication */}
          <Box p={6} borderWidth={1} borderRadius="lg">
            <Heading size="md" mb={4}>Step 1: Request Authentication</Heading>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={emailSent || requestLoading}
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleRequestAuth}
                isLoading={requestLoading}
                loadingText="Sending..."
                disabled={!email || emailSent}
                width="full"
              >
                Request Verification
              </Button>
            </VStack>
          </Box>

          {/* Step 2: Verify Words */}
          {emailSent && (
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>Step 2: Verify Words</Heading>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Verification Words</FormLabel>
                  <Input
                    value={verificationWords}
                    onChange={(e) => setVerificationWords(e.target.value)}
                    placeholder="Enter the two words from your email"
                    disabled={verifyLoading || !!token}
                  />
                </FormControl>
                <Button
                  colorScheme="green"
                  onClick={handleVerifyAuth}
                  isLoading={verifyLoading}
                  loadingText="Verifying..."
                  disabled={!verificationWords || !!token}
                  width="full"
                >
                  Verify
                </Button>
              </VStack>
            </Box>
          )}

          {/* Display Token */}
          {token && (
            <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.50">
              <Heading size="md" mb={4}>Authentication Successful</Heading>
              <Text fontWeight="bold">JWT Token:</Text>
              <Box 
                p={4} 
                bg="white" 
                borderRadius="md" 
                mt={2}
                fontSize="sm"
                wordBreak="break-all"
              >
                {token}
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default TestAuth; 