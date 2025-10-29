import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  HStack,
  Box,
  Grid,
  Badge,
  Link,
  Select,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { Client, Tenant } from "../../generated/graphql";

interface FormData {
  name: string;
  domain: string;
  websiteUrl: string;
  clientId: string;
}



const GET_WEBSITE = gql`
  query GetWebsite($id: ID!) {
    tenant(id: $id) {
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

const UPDATE_TENANT = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      name
      domain
      websiteUrl
      clientId
      updatedAt
    }
  }
`;

const DELETE_TENANT = gql`
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`;

export default function WebsiteDetails() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    domain: "",
    websiteUrl: "",
    clientId: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_WEBSITE, {
    variables: { id },
    onCompleted: (data) => {
      if (data.tenant) {
        setFormData({
          name: data.tenant.name || "",
          domain: data.tenant.domain || "",
          websiteUrl: data.tenant.websiteUrl || "",
          clientId: data.tenant.clientId || "",
        });
      }
    },
  });

  const { data: clientsData } = useQuery(GET_CLIENTS);

  const [updateTenant, { loading: updateLoading }] = useMutation(
    UPDATE_TENANT,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Website information updated successfully",
          status: "success",
          duration: 5000,
        });
        setIsEditing(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      },
    }
  );

  const [deleteTenant, { loading: deleteLoading }] = useMutation(DELETE_TENANT, {
    onCompleted: (data) => {
      if (data.deleteTenant) {
        toast({
          title: "Website deleted successfully",
          description: `${website?.name} has been removed.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/websites");
      } else {
        toast({
          title: "Failed to delete website",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error deleting website",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.clientId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name and Client)",
        status: "error",
        duration: 5000,
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
      });
      return;
    }

    updateTenant({
      variables: {
        id,
        input: {
          name: formData.name.trim(),
          domain: cleanDomain || null,
          websiteUrl: formData.websiteUrl.trim() || null,
          clientId: formData.clientId,
        },
      },
    });
  };

  const handleDelete = () => {
    onOpen();
  };

  const confirmDelete = async () => {
    if (!id) return;

    try {
      await deleteTenant({
        variables: { id }
      });
      onClose();
    } catch (error) {
      // Error handled by onError callback
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clientsData?.clients?.find((c: Client) => c.id === clientId);
    return client ? `${client.fName} ${client.lName}` : "Unknown Client";
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const website = data?.tenant as Tenant;

  if (!website) return <div className="p-4">Website not found</div>;

  return (
    <Box backgroundColor="gray.50" minHeight="100vh">
      <NavbarWithCallToAction />
      <Container 
        maxW="6xl" 
        py={12}
        px={4}
      >
        <Card
          boxShadow="sm"
          borderRadius="lg"
          backgroundColor="white"
          border="1px"
          borderColor="gray.100"
        >
          <CardHeader>
            <HStack className="justify-between">
              <Heading size="lg">Website Details</Heading>
              {isEditing ? (
                <HStack spacing={2}>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    isLoading={updateLoading}
                    colorScheme="blue"
                  >
                    Save Changes
                  </Button>
                </HStack>
              ) : (
                <HStack spacing={2}>
                  <Button
                    onClick={handleDelete}
                    colorScheme="red"
                    variant="outline"
                  >
                    Delete
                  </Button>
                  <Button onClick={() => setIsEditing(true)} colorScheme="blue">
                    Edit
                  </Button>
                </HStack>
              )}
            </HStack>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack className="space-y-6">
                <Grid className="grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Box className="space-y-4">
                    <Heading size="sm">Website Information</Heading>
                    <FormControl>
                      <FormLabel>Website Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Domain <Text as="span" color="gray.500" fontSize="sm">(optional)</Text></FormLabel>
                      <Input
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fontFamily="mono"
                        placeholder="multipolarpeace.com (domain name only, optional)"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Website URL <Text as="span" color="gray.500" fontSize="sm">(optional)</Text></FormLabel>
                      <HStack>
                        <Input
                          name="websiteUrl"
                          value={formData.websiteUrl}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="https://example.com (optional)"
                        />
                        {website.websiteUrl && !isEditing && (
                          <Button
                            as={Link}
                            href={website.websiteUrl}
                            isExternal
                            size="sm"
                            colorScheme="blue"
                            rightIcon={<ExternalLinkIcon />}
                          >
                            Visit
                          </Button>
                        )}
                      </HStack>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Client</FormLabel>
                      {isEditing ? (
                        <Select
                          name="clientId"
                          value={formData.clientId}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a client</option>
                          {clientsData?.clients?.map((client: Client) => (
                            <option key={client.id} value={client.id}>
                              {client.fName} {client.lName} ({client.email})
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          value={getClientName(website.clientId)}
                          disabled={true}
                        />
                      )}
                    </FormControl>
                  </Box>
                </Grid>

                {/* Additional Information */}
                <Box className="space-y-4">
                  <Heading size="sm">Additional Information</Heading>
                  <Grid className="grid-cols-1 md:grid-cols-2 gap-4">
                    <Box>
                      <Text fontWeight="medium" mb={1}>Tenant ID:</Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontFamily="mono" color="gray.600">
                          {website?.id}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<CopyIcon />}
                          onClick={() => copyToClipboard(website?.id || "", "Tenant ID")}
                          _hover={{ bg: "blue.50" }}
                        >
                          Copy
                        </Button>
                      </HStack>
                    </Box>
                    <Text>Client ID: {website?.clientId}</Text>
                    <Text>Created: {new Date(website?.createdAt).toLocaleDateString()}</Text>
                    <Text>Last Updated: {new Date(website?.updatedAt).toLocaleDateString()}</Text>
                  </Grid>
                </Box>

                {/* Status Information */}
                <Box className="space-y-4">
                  <Heading size="sm">Status</Heading>
                  <HStack spacing={4}>
                    <Badge colorScheme={website.websiteUrl ? "green" : "gray"}>
                      {website.websiteUrl ? "URL Configured" : "No URL"}
                    </Badge>
                    <Badge colorScheme="blue">
                      Active
                    </Badge>
                  </HStack>
                </Box>
              </Stack>
            </form>
          </CardBody>
        </Card>
        <Box mt={12}>
          <FooterWithFourColumns />
        </Box>
      </Container>
      
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Website
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{website?.name}"? This action cannot be undone and will remove the website from the associated client.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete Website
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
} 