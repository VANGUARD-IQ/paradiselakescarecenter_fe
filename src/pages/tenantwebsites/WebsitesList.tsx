import React from "react";
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Button,
  Skeleton,
  useToast,
  HStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Link,
} from "@chakra-ui/react";
import { ApolloCache, gql, useMutation, useQuery } from "@apollo/client";
import { EditIcon, DeleteIcon, ViewIcon, ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns"; 
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FiGlobe, FiUsers, FiTrendingUp, FiLink } from "react-icons/fi";
interface Website {
    id: string;
    name: string;
    domain?: string;
    status?: string;
    [key: string]: any;
}

const GET_ALL_WEBSITES = gql`
  query GetAllWebsites {
    websites {
      id
      name
      domain
      websiteUrl
      clientId
      createdAt
      updatedAt
      client {
        id
        fName
        lName
        email
      }
    }
  }
`;

const DELETE_TENANT = gql`
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`;


interface GetWebsitesResponse {
  websites: Website[];
}

const StatCard = ({ 
  title, 
  stat, 
  icon, 
  color 
}: { 
  title: string; 
  stat: number; 
  icon: React.ReactNode; 
  color: string; 
}) => {
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.100"
    >
      <HStack spacing={4}>
        <Box color={color}>
          {icon}
        </Box>
        <Stat>
          <StatLabel color="gray.500">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
        </Stat>
      </HStack>
    </Box>
  );
};

const getNewWebsitesThisMonth = (websites?: Website[]) => {
  if (!websites) return 0;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return websites.filter(website => 
    new Date(website.createdAt) >= startOfMonth
  ).length;
};

const WebsitesList = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery<GetWebsitesResponse>(GET_ALL_WEBSITES);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [websiteToDelete, setWebsiteToDelete] = React.useState<Website | null>(null);

  const [deleteTenant, { loading: deleteLoading }] = useMutation(DELETE_TENANT, {
    onCompleted: (data) => {
      if (data.deleteTenant) {
        toast({
          title: "Website deleted successfully",
          description: `${websiteToDelete?.name} has been removed.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        refetch();
        onClose();
        setWebsiteToDelete(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = (website: Website) => {
    navigate(`/website/${website.id}`);
  };

  const handleViewWebsite = (website: Website) => {
    navigate(`/website/${website.id}`);
  };

  const handleDelete = (website: Website) => {
    setWebsiteToDelete(website);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!websiteToDelete) return;

    try {
      await deleteTenant({
        variables: { id: websiteToDelete.id }
      });
    } catch (error) {
      // Error handled by onError callback
    }
  };

  const openWebsiteUrl = (websiteUrl: string) => {
    window.open(websiteUrl, "_blank");
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

  if (error) {
    toast({
      title: "Error loading websites",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <>
      <NavbarWithCallToAction /> 
      <Container maxW="container.xl" py={8}>
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="lg">Websites</Heading>
              <Button
                colorScheme="green"
                onClick={() => navigate("/websites/new")}
              >
                New Website
              </Button>
            </HStack>
          </CardHeader>

          <Box px={6} pb={6}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <StatCard
                title="Total Websites"
                stat={data?.websites?.length || 0}
                icon={<FiGlobe size="3em" />}
                color="blue.500"
              />
              <StatCard
                title="With URLs"
                stat={data?.websites?.filter((website: Website) => website.websiteUrl).length || 0}
                icon={<FiLink size="3em" />}
                color="green.500"
              />
              <StatCard
                title="New This Month"
                stat={getNewWebsitesThisMonth(data?.websites)}
                icon={<FiTrendingUp size="3em" />}
                color="purple.500"
              />
              <StatCard
                title="Unique Clients"
                stat={data?.websites ? data.websites.reduce((acc, website) => acc.includes(website.clientId) ? acc : [...acc, website.clientId], [] as string[]).length : 0}
                icon={<FiUsers size="3em" />}
                color="orange.500"
              />
            </SimpleGrid>
          </Box>

          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Domain</Th>
                    <Th>Client</Th>
                    <Th>Tenant ID</Th>
                    <Th>Website URL</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    // Loading state with skeleton rows
                    [...Array(3)].map((_, index) => (
                      <Tr key={`skeleton-${index}`}>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                        <Td>
                          <Skeleton height="20px" />
                        </Td>
                      </Tr>
                    ))
                  ) : data?.websites?.length ? (
                    // Actual data rows
                    data.websites.map((website: Website) => (
                      <Tr key={website.id}>
                        <Td>
                          <Text fontWeight="medium">{website.name}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontFamily="mono">
                            {website.domain}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {website.client ? `${website.client.fName} ${website.client.lName}` : "Unknown Client"}
                          </Text>
                          {website.client && (
                            <Text fontSize="xs" color="gray.500">
                              {website.client.email}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Text fontSize="xs" fontFamily="mono" color="gray.600" maxW="200px" isTruncated>
                              {website.id}
                            </Text>
                            <IconButton
                              aria-label="Copy tenant ID"
                              icon={<CopyIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => copyToClipboard(website.id, "Tenant ID")}
                              _hover={{ bg: "gray.100" }}
                              flexShrink={0}
                            />
                          </HStack>
                        </Td>
                        <Td>
                          {website.websiteUrl ? (
                            <HStack spacing={2}>
                              <Link
                                href={website.websiteUrl}
                                isExternal
                                color="blue.500"
                                fontSize="sm"
                              >
                                Visit Site
                              </Link>
                              <ExternalLinkIcon boxSize={3} color="blue.500" />
                            </HStack>
                          ) : (
                            <Badge colorScheme="gray" size="sm">
                              No URL
                            </Badge>
                          )}
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(website.createdAt)}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit website"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(website)}
                            />
                            <IconButton
                              aria-label="Delete website"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(website)}
                            />
                            <IconButton
                              aria-label="View website"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="teal"
                              onClick={() => handleViewWebsite(website)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    // No data state
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8}>
                        <Text color="gray.500">No websites found</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
        <FooterWithFourColumns />
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
              Are you sure you want to delete "{websiteToDelete?.name}"? This action cannot be undone.
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
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default WebsitesList; 