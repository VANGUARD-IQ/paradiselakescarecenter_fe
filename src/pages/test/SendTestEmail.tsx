import React, { useState } from "react";
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
  Textarea,
  Select,
} from "@chakra-ui/react";
import { gql, useMutation } from "@apollo/client";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";

const SEND_TEST_EMAIL = gql`
  mutation SendTestEmail(
    $input: EmailInput!
  ) {
    sendTestEmail(
      input: $input
    ) {
      success
      message
    }
  }
`;

interface EmailFormData {
  to: string;
  subject: string;
  text: string;
  html: string;
  brand: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

const initialFormData: EmailFormData = {
  to: "",
  subject: "",
  text: "",
  html: "",
  brand: "TomMillerServices",
  cc: "",
  bcc: "",
  replyTo: "",
};

export default function SendTestEmail() {
  const [formData, setFormData] = useState<EmailFormData>(initialFormData);
  const toast = useToast();

  const [sendEmail, { loading }] = useMutation(SEND_TEST_EMAIL, {
    onCompleted: () => {
      toast({
        title: "Email Sent",
        description: "Test email has been sent successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending email with data:", {
      input: formData
    });
    try {
      const response = await sendEmail({
        variables: {
          input: {
            to: formData.to,
            subject: formData.subject,
            text: formData.text,
            html: formData.html,
            brand: formData.brand,
            cc: formData.cc || undefined,
            bcc: formData.bcc || undefined,
            replyTo: formData.replyTo || undefined
          }
        }
      });
      console.log("Response:", response);
    } catch (error) {
      console.error("Mutation error:", error);
    }
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <Card>
          <CardHeader>
            <Heading size="lg">Send Test Email</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>To</FormLabel>
                  <Input
                    name="to"
                    type="email"
                    value={formData.to}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>CC</FormLabel>
                  <Input
                    name="cc"
                    type="email"
                    value={formData.cc}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>BCC</FormLabel>
                  <Input
                    name="bcc"
                    type="email"
                    value={formData.bcc}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Reply To</FormLabel>
                  <Input
                    name="replyTo"
                    type="email"
                    value={formData.replyTo}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Text</FormLabel>
                  <Textarea
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>HTML</FormLabel>
                  <Textarea
                    name="html"
                    value={formData.html}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  >
                    <option value="TomMillerServices">TomMillerServices</option>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  isLoading={loading}
                  isDisabled={loading}
                  colorScheme="blue"
                >
                  Send Email
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Container>
      <FooterWithFourColumns />
    </>
  );
} 