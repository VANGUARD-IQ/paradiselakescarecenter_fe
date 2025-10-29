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
  Select,
  HStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns"; 
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { Client } from "../../generated/graphql";

interface FormData {
  name: string;
  domain: string;
  websiteUrl: string;
  clientId: string;
}


const initialFormData: FormData = {
  name: "",
  domain: "",
  websiteUrl: "",
  clientId: "",
};

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
    }
  }
`;

const CREATE_TENANT = gql`
  mutation CreateTenant($input: TenantInput!) {
    createTenant(input: $input) {
      id
      name
      domain
      websiteUrl
      clientId
      createdAt
      updatedAt
    }
  }
`;

const NewWebsiteForm = () => {
  const [searchParams] = useSearchParams();
  const preSelectedClientId = searchParams.get("clientId");
  
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    clientId: preSelectedClientId || ""
  });
  const [createTenant, { loading }] = useMutation(CREATE_TENANT, {
    refetchQueries: ["GetAllWebsites"]
  });
  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.clientId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name and Client)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Basic domain validation - only if domain is provided (optional field)
    let cleanDomain = null;
    if (formData.domain && formData.domain.trim()) {
      cleanDomain = formData.domain.trim().toLowerCase();
      if (cleanDomain.startsWith("http://") || cleanDomain.startsWith("https://")) {
        cleanDomain = cleanDomain.replace(/^https?:\/\//, "");
      }
      if (cleanDomain.endsWith("/")) {
        cleanDomain = cleanDomain.slice(0, -1);
      }
      
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(cleanDomain)) {
        toast({
          title: "Invalid Domain",
          description: "Please enter just the domain name (e.g., multipolarpeace.com) without http:// or https://",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    // Basic URL validation (if provided)
    if (formData.websiteUrl && !formData.websiteUrl.startsWith("http")) {
      toast({
        title: "Invalid Website URL",
        description: "Website URL must start with http:// or https://",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await createTenant({
        variables: {
          input: {
            name: formData.name.trim(),
            domain: cleanDomain || null,
            websiteUrl: formData.websiteUrl.trim() || null,
            clientId: formData.clientId
          }
        }
      });
      
      toast({
        title: "Success!",
        description: "New website has been successfully created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      navigate("/websites");
    } catch (error) {
      console.error("Error creating website:", error);
      toast({
        title: "Error creating website",
        description: error instanceof Error 
          ? error.message 
          : "There was an error creating the website. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openNewClientForm = () => {
    window.open("/newclient", "_blank");
  };

  return ( 
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <Card mt={4}>
          <CardHeader>
            <Heading size="lg">New Website</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Website Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter website name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Domain <Text as="span" color="gray.500" fontSize="sm">(optional)</Text></FormLabel>
                  <Input
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="multipolarpeace.com (domain name only, optional)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Website URL <Text as="span" color="gray.500" fontSize="sm">(optional)</Text></FormLabel>
                  <Input
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://example.com (optional)"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Client</FormLabel>
                  <HStack spacing={2} align="end">
                    <Select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      placeholder="Select a client"
                      flex={1}
                    >
                      {clientsData?.clients?.map((client: Client) => (
                        <option key={client.id} value={client.id}>
                          {client.fName} {client.lName} ({client.email})
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={openNewClientForm}
                      variant="outline"
                      leftIcon={<ExternalLinkIcon />}
                      flexShrink={0}
                    >
                      New Client
                    </Button>
                  </HStack>
                  {clientsLoading && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Loading clients...
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  isDisabled={clientsLoading}
                >
                  Create Website
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default NewWebsiteForm; 