import React, { useState, useEffect } from "react";
import { BILL_TEMPLATE_CONTENT, downloadMarkdownFile } from "./markdownTemplates";
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Textarea,
  IconButton,
  HStack,
  Badge,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { gql, useQuery, useMutation, useApolloClient, ApolloQueryResult } from "@apollo/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import billsModuleConfig from "./moduleConfig";
import { useAuth } from "../../contexts/AuthContext";
import { getColor } from "../../brandConfig";
import { Bill, BillInput } from "../../generated/graphql";

enum BillStatus {
  PROPOSAL = "PROPOSAL",
  DRAFT = "DRAFT",
  SENT = "SENT"
}

const GET_ALL_PROJECTS = gql`
  query GetAllProjects {
    projects {
      id
      projectName
      projectGoal
      progress
      billingClient {
        id
        fName
        lName
        email
        businessName
      }
    }
  }
`;

const GET_PROJECT_WITH_TASKS = gql`
  query GetProjectWithTasks($projectId: ID!) {
    project(id: $projectId) {
      id
      projectName
      projectGoal
      progress
      billingClient {
        id
        fName
        lName
        email
        businessName
      }
      tasks {
        id
        description
        status
        order
        billed
        assignedTo {
          id
          fName
          lName
        }
        media {
          url
          description
          fileType
        }
      }
    }
  }
`;

const CREATE_BILL = gql`
  mutation CreateBill($input: BillInput!) {
    createBill(input: $input) {
      id
      isPaid
      status
      paymentMethod
      currency
      acceptCardPayment
      acceptCryptoPayment
      clientId
      lineItems {
        id
        amount
        description
      }
      subtotal
      taxPercentage
      taxAmount
      totalAmount
      projectId
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
      businessName
    }
  }
`;

const GET_CURRENT_TENANT = gql`
  query GetCurrentTenant {
    currentTenant {
      id
      name
      companyDetails {
        companyName
        taxId
        taxPercentage
        billingEmail
        billingPhone
        billingAddress {
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
        }
      }
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
        }
      }
    }
  }
`;

const NewBill = () => {
  usePageTitle("New Bill");
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const client = useApolloClient(); // Get Apollo client instance
  const { user } = useAuth(); // Get current authenticated user

  // Consistent styling from brandConfig with theme support
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('projectId');
  
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [billStatus, setBillStatus] = useState<BillStatus>(BillStatus.DRAFT);
  const [currency, setCurrency] = useState<"AUD" | "USD">("AUD");
  const [acceptBankTransfer, setAcceptBankTransfer] = useState(true);
  const [acceptCardPayment, setAcceptCardPayment] = useState(true);
  const [acceptCryptoPayment, setAcceptCryptoPayment] = useState(false);
interface LineItem {
  description: string;
  amount: string | number;
}  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", amount: "" }]);

  // Fetch tenant company details for pre-population
  const { data: tenantData } = useQuery(GET_CURRENT_TENANT);
  const taxPercentage = tenantData?.currentTenant?.companyDetails?.taxPercentage ?? 10;

  // Calculate subtotal, GST, and total amount
  const subtotal = lineItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount as string) || 0;
    return sum + amount;
  }, 0);

  const gstAmount = subtotal * (taxPercentage / 100);
  const totalAmount = subtotal + gstAmount;

  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_ALL_PROJECTS, {
    onCompleted: (data) => {
      console.log("Project data received from query:", data);
      if (data?.projects) {
        console.log(`Received ${data.projects.length} projects`);
        // Check the structure of the first project if available
        if (data.projects.length > 0) {
          const sampleProject = data.projects[0];
          console.log("Sample project structure:", {
            id: sampleProject.id,
            name: sampleProject.projectName,
            tasksCount: sampleProject.tasks?.length || 0,
            hasTasks: Array.isArray(sampleProject.tasks),
            billsCount: sampleProject.bills?.length || 0,
            firstTaskBilled: sampleProject.tasks && sampleProject.tasks.length > 0
              ? sampleProject.tasks[0].billed
              : "No tasks"
          });
        }
      } else {
        console.log("No projects data received");
      }
    },
    onError: (error) => {
      console.error("Error fetching projects:", error);
    }
  });

  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);

  const [createBill, { loading: creatingBill }] = useMutation(CREATE_BILL);

  // Pre-populate line items when a project is selected
  const handleProjectSelect = (projectId: string) => {
    console.log("Project selected:", projectId);
    setSelectedProject(projectId);

    if (!projectId) {
      console.log("No project selected, resetting line items");
      setLineItems([{ description: "", amount: "" }]);
      setSelectedClient(""); // Also clear client
      return;
    }

    // Auto-select client from project
    const project = projectsData?.projects?.find((p: any) => p.id === projectId);
    if (project?.billingClient?.id) {
      console.log("Auto-selecting client from project:", project.billingClient);
      setSelectedClient(project.billingClient.id);
    }

    // Set a loading line item while we fetch data
    setLineItems([{ description: "Loading tasks...", amount: "" }]);

    // Fetch the specific project with its tasks
    client.query<{ project: any }>({
      query: GET_PROJECT_WITH_TASKS,
      variables: { projectId },
      fetchPolicy: "network-only" // Force a fresh fetch
    }).then((response: ApolloQueryResult<{ project: any }>) => {
      console.log("Project details fetched:", response.data);

      const projectData = response.data.project;
      if (!projectData) {
        console.log("Project data not found");
        setLineItems([{ description: "", amount: "" }]);
        toast({
          title: "Error",
          description: "Could not load project details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      console.log("Project tasks:", projectData.tasks);
      console.log("Task count:", projectData.tasks?.length || 0);

      // Check if tasks exist
      if (!projectData.tasks || projectData.tasks.length === 0) {
        console.log("No tasks found in this project");
        setLineItems([{ description: "", amount: "" }]);
        toast({
          title: "No tasks",
          description: "This project has no tasks. You can add custom line items.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Get tasks that aren't already billed
      const unbilledTasks = projectData.tasks.filter((task: any) => {
        console.log(`Task ${task.id} - ${task.description} - Billed:`, task.billed);
        // We need to check explicitly for false since billed is a boolean
        return task.billed === false;
      });

      console.log("Unbilled tasks:", unbilledTasks);
      console.log("Unbilled task count:", unbilledTasks.length);

      if (unbilledTasks.length === 0) {
        // If no unbilled tasks, keep an empty line item
        console.log("No unbilled tasks found");
        setLineItems([{ description: "", amount: "" }]);
        toast({
          title: "No unbilled tasks",
          description: "This project has no unbilled tasks. You can add custom line items.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create line items from unbilled tasks
      const newLineItems = unbilledTasks.map((task: any) => {
        console.log(`Creating line item for task: ${task.description}`);
        return {
          description: task.description,
          amount: "", // Default to empty, user will need to set amount
          taskId: task.id, // Store the task ID for reference
          status: task.status // Store the task status for reference
        };
      });

      console.log("New line items:", newLineItems);
      setLineItems(newLineItems);

      toast({
        title: "Tasks loaded",
        description: `Loaded ${newLineItems.length} unbilled tasks as line items.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }).catch(error => {
      console.error("Error fetching project details:", error);
      setLineItems([{ description: "", amount: "" }]);
      toast({
        title: "Error",
        description: "Failed to load project tasks. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  // Auto-select project from URL parameter when projects data is loaded
  useEffect(() => {
    if (projectIdFromUrl && projectsData?.projects && !selectedProject) {
      const projectExists = projectsData.projects.some((p: any) => p.id === projectIdFromUrl);
      if (projectExists) {
        console.log("Auto-selecting project from URL:", projectIdFromUrl);
        handleProjectSelect(projectIdFromUrl);
      }
    }
  }, [projectIdFromUrl, projectsData, selectedProject]);

  // Pre-fill from booking URL parameters
  useEffect(() => {
    const itemName = searchParams.get('itemName');
    const itemPrice = searchParams.get('itemPrice');
    const itemQuantity = searchParams.get('itemQuantity');
    const urlCurrency = searchParams.get('currency');
    const notes = searchParams.get('notes');

    if (itemName && itemPrice) {
      console.log('📋 Pre-filling bill from booking:', { itemName, itemPrice, itemQuantity });

      // Set line items
      const quantity = parseInt(itemQuantity || '1');
      const price = parseFloat(itemPrice);
      setLineItems([{
        description: itemName,
        amount: price * quantity
      }]);

      // Set currency if provided
      if (urlCurrency === 'AUD' || urlCurrency === 'USD') {
        setCurrency(urlCurrency);
      }

      // TODO: Set notes when that field is added to the form
      // setNotes(notes);
    }
  }, [searchParams]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: "" }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === "amount" ? (value === "" ? "" : parseFloat(value as string) || 0) : value,
    };
    setLineItems(newLineItems);
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting bill creation...");

    // Validate that either a project or a client is selected
    if (!selectedProject && !selectedClient) {
      console.error("❌ No project or client selected");
      toast({
        title: "Client Required",
        description: "Please select either a project or a client to bill",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Filter out line items with no description or zero amount
    const validLineItems = lineItems.filter(item => item.description && item.amount && Number(item.amount) > 0);
    console.log(`✅ Valid line items: ${validLineItems.length}`);

    if (validLineItems.length === 0) {
      console.error("❌ No valid line items");
      toast({
        title: "Error",
        description: "Please add at least one line item with a description and amount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Remove taskId and status from lineItems before submitting
      const cleanedLineItems = validLineItems.map(({ description, amount }) => ({
        description,
        amount: Number(amount)
      }));

      const billInput: any = {
        isPaid,
        status: billStatus,
        currency,
        acceptBankTransfer,
        acceptCardPayment,
        acceptCryptoPayment,
        lineItems: cleanedLineItems,
        subtotal,
        taxPercentage,
        taxAmount: gstAmount,
        totalAmount,
        issuedBy: user?.id, // Include the current user's ID as the issuer
      };

      // Only include clientId if one is selected (don't send empty string)
      if (selectedClient) {
        billInput.clientId = selectedClient;
      }

      // Only include projectId if one is selected
      if (selectedProject) {
        billInput.projectId = selectedProject;
      }

      console.log("📋 Creating bill with:", {
        ...billInput,
        totalAmount: totalAmount.toFixed(2),
        currency,
        lineItemsCount: cleanedLineItems.length,
        hasClientId: !!selectedClient,
        clientIdValue: selectedClient
      });

      const { data } = await createBill({
        variables: {
          input: billInput,
        },
      });

      console.log("✅ Bill created successfully:", {
        billId: data.createBill.id,
        currency: data.createBill.currency,
        totalLineItems: data.createBill.lineItems?.length,
        clientId: data.createBill.clientId,
        hasClientId: !!data.createBill.clientId
      });

      toast({
        title: "Success",
        description: `Bill created successfully in ${currency}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(`/bill/${data.createBill.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bill",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bg} minHeight="100vh">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={billsModuleConfig} />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading color={textPrimary}>📝 Create New Bill</Heading>
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<AddIcon />}
              onClick={() => downloadMarkdownFile(BILL_TEMPLATE_CONTENT, 'bill_template.md')}
            >
              Download .md Template
            </Button>
          </HStack>

          <Box
            p={6}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderWidth="1px"
            borderColor={cardBorder}
          >
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel color={textPrimary}>
                  Project (Optional)
                  {projectsLoading && <Text as="span" fontSize="xs" ml={2} color={textMuted}>(Loading projects...)</Text>}
                </FormLabel>
                <Select
                  placeholder={projectsLoading ? "Loading projects..." : "Select project (optional)"}
                  value={selectedProject}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  isDisabled={projectsLoading}
                  bg="rgba(0, 0, 0, 0.2)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                >
                  {projectsData?.projects.map((project: any) => (
                    <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                  {project.projectName} - {project.billingClient?.businessName || `${project.billingClient?.fName} ${project.billingClient?.lName}`}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color={textMuted} mt={1}>
                  Link this bill to a project to auto-populate line items from unbilled tasks, or leave blank to create a standalone bill.
                </Text>
              </FormControl>

              {/* Client dropdown - shown when no project is selected OR to override project client */}
              <FormControl isRequired={!selectedProject}>
                <FormLabel color={textPrimary}>
                  Client {selectedProject ? "(Auto-selected from project)" : ""}
                  {clientsLoading && !selectedProject && <Text as="span" fontSize="xs" ml={2} color={textMuted}>(Loading clients...)</Text>}
                </FormLabel>
                <Select
                  placeholder={clientsLoading ? "Loading clients..." : "Select client to bill"}
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  isDisabled={clientsLoading || !!selectedProject}
                  bg="rgba(0, 0, 0, 0.2)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                >
                  {clientsData?.clients?.map((client: any) => (
                    <option key={client.id} value={client.id} style={{ backgroundColor: '#1a1a1a' }}>
                      {client.businessName || `${client.fName} ${client.lName}`} ({client.email})
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color={textMuted} mt={1}>
                  {selectedProject
                    ? "Client is automatically selected from the project above"
                    : "Select who this bill is for - this is required"}
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color={textPrimary}>Currency</FormLabel>
                <Select
                  value={currency}
                  onChange={(e) => {
                    const newCurrency = e.target.value as "AUD" | "USD";
                    setCurrency(newCurrency);
                    console.log(`Currency changed to: ${newCurrency}`);
                  }}
                  bg="rgba(0, 0, 0, 0.2)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                >
                  <option value="AUD" style={{ backgroundColor: '#1a1a1a' }}>AUD - Australian Dollar</option>
                  <option value="USD" style={{ backgroundColor: '#1a1a1a' }}>USD - US Dollar</option>
                </Select>
              </FormControl>

              {/* Payment Method Toggles - Only visible for DRAFT bills */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={textPrimary} mb={3}>
                  Payment Methods Available to Customer
                </Text>
                <VStack align="stretch" spacing={3}>
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel htmlFor="bank-transfer" mb="0" color={textPrimary}>
                      Accept Bank Transfer
                    </FormLabel>
                    <Switch
                      id="bank-transfer"
                      isChecked={acceptBankTransfer}
                      onChange={(e) => setAcceptBankTransfer(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel htmlFor="card-payment" mb="0" color={textPrimary}>
                      Accept Card Payments (Stripe)
                    </FormLabel>
                    <Switch
                      id="card-payment"
                      isChecked={acceptCardPayment}
                      onChange={(e) => setAcceptCardPayment(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel htmlFor="crypto-payment" mb="0" color={textPrimary}>
                      Accept Crypto Payments (Bitcoin)
                    </FormLabel>
                    <Switch
                      id="crypto-payment"
                      isChecked={acceptCryptoPayment}
                      onChange={(e) => setAcceptCryptoPayment(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>
                </VStack>
                <Text fontSize="xs" color={textMuted} mt={2}>
                  Note: These options can only be changed while the bill is in DRAFT status
                </Text>
              </Box>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" color={textPrimary}>Is Paid?</FormLabel>
                <Switch isChecked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
              </FormControl>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            borderRadius="lg"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            borderWidth="1px"
            borderColor={cardBorder}
          >
            <HStack mb={4} justify="space-between">
              <Heading size="md" color={textPrimary}>Line Items</Heading>
              {selectedProject && (
                <Text fontSize="sm" color={textMuted}>
                  Line items are pre-populated with unbilled tasks from the selected project
                </Text>
              )}
            </HStack>
            <Box overflowX="auto" overflowY="hidden">
              <Table variant="simple" size={{ base: "sm", md: "md" }}>
                <Thead>
                  <Tr>
                    <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 4 }}>Description</Th>
                    <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 4 }}>Amount</Th>
                    <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 4 }} display={{ base: "none", md: "table-cell" }}>Status</Th>
                    <Th color={textSecondary} fontSize={{ base: "xs", md: "sm" }} px={{ base: 2, md: 4 }}>Action</Th>
                  </Tr>
                </Thead>
              <Tbody>
                {lineItems.map((item, index) => (
                  <Tr key={index}>
                    <Td px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                        placeholder="Item description"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        minH={{ base: "80px", md: "120px" }}
                        resize="vertical"
                        rows={5}
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </Td>
                    <Td px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleLineItemChange(index, "amount", e.target.value)}
                        placeholder="Amount"
                        bg="rgba(0, 0, 0, 0.2)"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _hover={{ borderColor: textSecondary }}
                        fontSize={{ base: "sm", md: "md" }}
                        minW={{ base: "80px", md: "120px" }}
                      />
                    </Td>
                    <Td px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                      <IconButton
                        aria-label="Remove line item"
                        icon={<DeleteIcon />}
                        onClick={() => handleRemoveLineItem(index)}
                        isDisabled={lineItems.length === 1}
                        size={{ base: "sm", md: "md" }}
                        variant="ghost"
                        colorScheme="red"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              </Table>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              onClick={handleAddLineItem}
              mt={4}
              size="sm"
              bg="white"
              color="black"
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)"
              }}
            >
              Add Line Item
            </Button>
          </Box>

          <HStack spacing={4}>
            <Button
              onClick={handleSubmit}
              isLoading={creatingBill}
              bg="white"
              color="black"
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)"
              }}
            >
              Create Bill
            </Button>
            <Button 
              onClick={() => navigate("/bills")}
              variant="outline"
              borderColor={cardBorder}
              color={textPrimary}
              _hover={{
                borderColor: textSecondary,
                bg: "rgba(255, 255, 255, 0.05)"
              }}
            >
              Cancel
            </Button>
          </HStack>
        </VStack>
      </Container>
      <FooterWithFourColumns />
      
      {/* Floating Total Display */}
      <Box
        position="fixed"
        bottom={8}
        right={8}
        p={6}
        bg="linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.9) 50%, rgba(20, 20, 20, 0.95) 100%)"
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        boxShadow="0 10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(54, 158, 255, 0.15)"
        borderWidth="1px"
        borderColor="rgba(54, 158, 255, 0.3)"
        transition="all 0.3s ease"
        _hover={{
          transform: "translateY(-2px) scale(1.02)",
          boxShadow: "0 15px 50px rgba(0, 0, 0, 0.6), 0 0 80px rgba(54, 158, 255, 0.25)",
          borderColor: "rgba(54, 158, 255, 0.5)"
        }}
        zIndex={1000}
      >
        <VStack spacing={3} align="stretch">
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
            color="rgba(255, 255, 255, 0.6)"
          >
            Bill Summary
          </Text>

          {/* Subtotal */}
          <HStack justify="space-between">
            <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">
              Subtotal
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="rgba(255, 255, 255, 0.9)">
              ${subtotal.toFixed(2)} {currency}
            </Text>
          </HStack>

          {/* GST/Tax */}
          <HStack justify="space-between">
            <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">
              GST ({taxPercentage}%)
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="rgba(255, 255, 255, 0.9)">
              ${gstAmount.toFixed(2)} {currency}
            </Text>
          </HStack>

          {/* Divider */}
          <Box height="1px" bg="rgba(54, 158, 255, 0.3)" my={1} />

          {/* Total */}
          <HStack justify="space-between" align="baseline">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="rgba(255, 255, 255, 0.8)"
            >
              Total
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="#FFFFFF"
              lineHeight="1"
            >
              ${totalAmount.toFixed(2)} {currency}
            </Text>
          </HStack>

          {lineItems.filter(item => item.amount && Number(item.amount) > 0).length > 0 && (
            <Text
              fontSize="xs"
              color="rgba(54, 158, 255, 0.8)"
              textAlign="center"
            >
              {lineItems.filter(item => item.amount && Number(item.amount) > 0).length} item{lineItems.filter(item => item.amount && Number(item.amount) > 0).length !== 1 ? 's' : ''}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default NewBill; 