import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  Divider,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import vapiModuleConfig from './moduleConfig';

interface TodoItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  endpoint?: string;
  notes?: string;
}

interface TodoSection {
  title: string;
  description: string;
  todos: TodoItem[];
  order: number;
}

export const VapiTodos: React.FC = () => {
  usePageTitle("VAPI Todos");
  // Consistent styling from brandConfig
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");

  const [sections, setSections] = useState<TodoSection[]>([
    {
      title: "Foundation Setup",
      description: "Core infrastructure and configuration",
      order: 1,
      todos: [
        {
          id: "webhook-config",
          label: "Configure Webhook Handler",
          description: "Set up webhook endpoint for receiving Vapi events",
          completed: true,
          priority: "high",
          endpoint: "/webhooks/vapi",
          notes: "Already implemented in backend"
        },
        {
          id: "tenant-keys",
          label: "Add Vapi API Keys to Tenant",
          description: "Store public/private keys, assistant ID, phone number ID",
          completed: true,
          priority: "high",
          notes: "Available in Edit Tenant form"
        },
        {
          id: "call-log-entity",
          label: "Create VapiCallLog Entity",
          description: "Database model for storing call logs and lead data",
          completed: true,
          priority: "high",
          notes: "VapiCallLog.ts created"
        },
      ]
    },
    {
      title: "Calls Management",
      description: "Voice call functionality - PRIMARY FOCUS",
      order: 2,
      todos: [
        {
          id: "list-calls",
          label: "List Calls (GET /call)",
          description: "Fetch and display all call logs",
          completed: true,
          priority: "high",
          endpoint: "GET https://api.vapi.ai/call",
          notes: "Implemented in CallLogs.tsx"
        },
        {
          id: "get-call",
          label: "Get Call Details (GET /call/:id)",
          description: "View detailed information for a specific call",
          completed: true,
          priority: "high",
          endpoint: "GET https://api.vapi.ai/call/:id",
          notes: "Implemented - View in Call Logs page"
        },
        {
          id: "create-call",
          label: "Create Outbound Call (POST /call)",
          description: "Initiate phone calls programmatically",
          completed: false,
          priority: "high",
          endpoint: "POST https://api.vapi.ai/call"
        },
        {
          id: "update-call",
          label: "Update Call (PATCH /call/:id)",
          description: "Modify call properties",
          completed: false,
          priority: "medium",
          endpoint: "PATCH https://api.vapi.ai/call/:id"
        },
        {
          id: "delete-call",
          label: "Delete Call Data (DELETE /call/:id)",
          description: "Remove call records",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/call/:id"
        },
      ]
    },
    {
      title: "Assistants Management",
      description: "AI assistant configuration",
      order: 3,
      todos: [
        {
          id: "list-assistants",
          label: "List Assistants (GET /assistant)",
          description: "View all configured assistants",
          completed: false,
          priority: "high",
          endpoint: "GET https://api.vapi.ai/assistant"
        },
        {
          id: "create-assistant",
          label: "Create Assistant (POST /assistant)",
          description: "Build new AI assistants with custom prompts",
          completed: false,
          priority: "high",
          endpoint: "POST https://api.vapi.ai/assistant"
        },
        {
          id: "get-assistant",
          label: "Get Assistant (GET /assistant/:id)",
          description: "View assistant configuration",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/assistant/:id"
        },
        {
          id: "update-assistant",
          label: "Update Assistant (PATCH /assistant/:id)",
          description: "Modify assistant settings, prompts, tools",
          completed: false,
          priority: "high",
          endpoint: "PATCH https://api.vapi.ai/assistant/:id"
        },
        {
          id: "delete-assistant",
          label: "Delete Assistant (DELETE /assistant/:id)",
          description: "Remove assistant",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/assistant/:id"
        },
      ]
    },
    {
      title: "Phone Numbers",
      description: "Telephony number management",
      order: 4,
      todos: [
        {
          id: "list-phones",
          label: "List Phone Numbers (GET /phone-number)",
          description: "View all configured phone numbers",
          completed: false,
          priority: "high",
          endpoint: "GET https://api.vapi.ai/phone-number"
        },
        {
          id: "create-phone",
          label: "Create Phone Number (POST /phone-number)",
          description: "Purchase/import new phone numbers",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/phone-number"
        },
        {
          id: "get-phone",
          label: "Get Phone Number (GET /phone-number/:id)",
          description: "View phone number details",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/phone-number/:id"
        },
        {
          id: "update-phone",
          label: "Update Phone Number (PATCH /phone-number/:id)",
          description: "Modify phone number settings",
          completed: false,
          priority: "medium",
          endpoint: "PATCH https://api.vapi.ai/phone-number/:id"
        },
        {
          id: "delete-phone",
          label: "Delete Phone Number (DELETE /phone-number/:id)",
          description: "Remove phone number",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/phone-number/:id"
        },
      ]
    },
    {
      title: "Campaigns",
      description: "Bulk calling campaigns",
      order: 5,
      todos: [
        {
          id: "list-campaigns",
          label: "List Campaigns (GET /campaign)",
          description: "View all calling campaigns",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/campaign"
        },
        {
          id: "create-campaign",
          label: "Create Campaign (POST /campaign)",
          description: "Set up bulk calling campaigns",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/campaign"
        },
        {
          id: "get-campaign",
          label: "Get Campaign (GET /campaign/:id)",
          description: "View campaign details and statistics",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/campaign/:id"
        },
        {
          id: "update-campaign",
          label: "Update Campaign (PATCH /campaign/:id)",
          description: "Modify campaign settings",
          completed: false,
          priority: "medium",
          endpoint: "PATCH https://api.vapi.ai/campaign/:id"
        },
        {
          id: "delete-campaign",
          label: "Delete Campaign (DELETE /campaign/:id)",
          description: "Remove campaign",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/campaign/:id"
        },
      ]
    },
    {
      title: "Tools & Functions",
      description: "Custom tools and API integrations",
      order: 6,
      todos: [
        {
          id: "list-tools",
          label: "List Tools (GET /tool)",
          description: "View all available tools",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/tool"
        },
        {
          id: "create-tool",
          label: "Create Tool (POST /tool)",
          description: "Add custom functions/API tools",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/tool"
        },
        {
          id: "get-tool",
          label: "Get Tool (GET /tool/:id)",
          description: "View tool configuration",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/tool/:id"
        },
        {
          id: "update-tool",
          label: "Update Tool (PATCH /tool/:id)",
          description: "Modify tool settings",
          completed: false,
          priority: "low",
          endpoint: "PATCH https://api.vapi.ai/tool/:id"
        },
        {
          id: "delete-tool",
          label: "Delete Tool (DELETE /tool/:id)",
          description: "Remove tool",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/tool/:id"
        },
      ]
    },
    {
      title: "Knowledge Bases",
      description: "Document and knowledge management",
      order: 7,
      todos: [
        {
          id: "list-kb",
          label: "List Knowledge Bases (GET /knowledge-base)",
          description: "View all knowledge bases",
          completed: false,
          priority: "medium",
          endpoint: "GET https://api.vapi.ai/knowledge-base"
        },
        {
          id: "create-kb",
          label: "Create Knowledge Base (POST /knowledge-base)",
          description: "Upload documents for AI reference",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/knowledge-base"
        },
        {
          id: "get-kb",
          label: "Get Knowledge Base (GET /knowledge-base/:id)",
          description: "View knowledge base details",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/knowledge-base/:id"
        },
        {
          id: "update-kb",
          label: "Update Knowledge Base (PATCH /knowledge-base/:id)",
          description: "Modify knowledge base",
          completed: false,
          priority: "low",
          endpoint: "PATCH https://api.vapi.ai/knowledge-base/:id"
        },
        {
          id: "delete-kb",
          label: "Delete Knowledge Base (DELETE /knowledge-base/:id)",
          description: "Remove knowledge base",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/knowledge-base/:id"
        },
      ]
    },
    {
      title: "Files Management",
      description: "File uploads and management",
      order: 8,
      todos: [
        {
          id: "list-files",
          label: "List Files (GET /file)",
          description: "View all uploaded files",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/file"
        },
        {
          id: "upload-file",
          label: "Upload File (POST /file)",
          description: "Upload audio/document files",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/file"
        },
        {
          id: "get-file",
          label: "Get File (GET /file/:id)",
          description: "Download file",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/file/:id"
        },
        {
          id: "update-file",
          label: "Update File (PATCH /file/:id)",
          description: "Update file metadata",
          completed: false,
          priority: "low",
          endpoint: "PATCH https://api.vapi.ai/file/:id"
        },
        {
          id: "delete-file",
          label: "Delete File (DELETE /file/:id)",
          description: "Remove file",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/file/:id"
        },
      ]
    },
    {
      title: "Chats & Sessions",
      description: "Web chat and session management",
      order: 9,
      todos: [
        {
          id: "list-chats",
          label: "List Chats (GET /chat)",
          description: "View all chat conversations",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/chat"
        },
        {
          id: "create-chat",
          label: "Create Chat (POST /chat)",
          description: "Start new chat session",
          completed: false,
          priority: "low",
          endpoint: "POST https://api.vapi.ai/chat"
        },
        {
          id: "get-chat",
          label: "Get Chat (GET /chat/:id)",
          description: "View chat history",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/chat/:id"
        },
        {
          id: "delete-chat",
          label: "Delete Chat (DELETE /chat/:id)",
          description: "Remove chat history",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/chat/:id"
        },
        {
          id: "list-sessions",
          label: "List Sessions (GET /session)",
          description: "View all sessions",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/session"
        },
        {
          id: "create-session",
          label: "Create Session (POST /session)",
          description: "Start new session",
          completed: false,
          priority: "low",
          endpoint: "POST https://api.vapi.ai/session"
        },
        {
          id: "get-session",
          label: "Get Session (GET /session/:id)",
          description: "View session details",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/session/:id"
        },
        {
          id: "update-session",
          label: "Update Session (PATCH /session/:id)",
          description: "Modify session",
          completed: false,
          priority: "low",
          endpoint: "PATCH https://api.vapi.ai/session/:id"
        },
        {
          id: "delete-session",
          label: "Delete Session (DELETE /session/:id)",
          description: "End session",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/session/:id"
        },
      ]
    },
    {
      title: "Analytics & Monitoring",
      description: "Performance tracking and analytics",
      order: 10,
      todos: [
        {
          id: "analytics-queries",
          label: "Create Analytics Queries (POST /analytics)",
          description: "Generate analytics reports",
          completed: false,
          priority: "medium",
          endpoint: "POST https://api.vapi.ai/analytics"
        },
        {
          id: "get-logs",
          label: "Get Logs (GET /log)",
          description: "View system logs",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/log"
        },
        {
          id: "delete-logs",
          label: "Delete Logs (DELETE /log)",
          description: "Clear old logs",
          completed: false,
          priority: "low",
          endpoint: "DELETE https://api.vapi.ai/log"
        },
      ]
    },
    {
      title: "Advanced Features",
      description: "Squad management, workflows, and testing",
      order: 11,
      todos: [
        {
          id: "list-squads",
          label: "List Squads (GET /squad)",
          description: "View assistant teams",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/squad"
        },
        {
          id: "create-squad",
          label: "Create Squad (POST /squad)",
          description: "Build assistant teams",
          completed: false,
          priority: "low",
          endpoint: "POST https://api.vapi.ai/squad"
        },
        {
          id: "get-workflows",
          label: "Get Workflows (GET /workflow)",
          description: "View automation workflows",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/workflow"
        },
        {
          id: "create-workflow",
          label: "Create Workflow (POST /workflow)",
          description: "Build automation flows",
          completed: false,
          priority: "low",
          endpoint: "POST https://api.vapi.ai/workflow"
        },
        {
          id: "list-test-suites",
          label: "List Test Suites (GET /test-suite)",
          description: "View test configurations",
          completed: false,
          priority: "low",
          endpoint: "GET https://api.vapi.ai/test-suite"
        },
        {
          id: "create-test-suite",
          label: "Create Test Suite (POST /test-suite)",
          description: "Build test scenarios",
          completed: false,
          priority: "low",
          endpoint: "POST https://api.vapi.ai/test-suite"
        },
      ]
    },
    {
      title: "MCP Integration",
      description: "Model Context Protocol setup for AI assistants",
      order: 12,
      todos: [
        {
          id: "mcp-server-setup",
          label: "Configure MCP Server",
          description: "Set up Vapi MCP server for Claude Desktop/other AI tools",
          completed: false,
          priority: "medium",
          notes: "Use npx mcp-remote with Vapi API key"
        },
        {
          id: "mcp-client-setup",
          label: "Create MCP Client",
          description: "Build Node.js client for MCP integration",
          completed: false,
          priority: "low",
          notes: "For custom integrations beyond Claude Desktop"
        },
        {
          id: "mcp-tool-config",
          label: "Configure MCP Tool in Assistant",
          description: "Add MCP tool to assistant for dynamic capabilities",
          completed: false,
          priority: "low",
          notes: "Enable Zapier/Composio integrations"
        },
      ]
    },
  ]);

  const toggleTodo = (sectionIndex: number, todoIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].todos[todoIndex].completed = 
      !newSections[sectionIndex].todos[todoIndex].completed;
    setSections(newSections);
  };

  const calculateProgress = () => {
    const allTodos = sections.flatMap(s => s.todos);
    const completed = allTodos.filter(t => t.completed).length;
    return (completed / allTodos.length) * 100;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "yellow";
      case "low": return "gray";
      default: return "gray";
    }
  };

  const totalTodos = sections.reduce((acc, section) => acc + section.todos.length, 0);
  const completedTodos = sections.reduce((acc, section) => 
    acc + section.todos.filter(t => t.completed).length, 0
  );

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={vapiModuleConfig} />

      <Container maxW="7xl" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="xl" mb={2} color={textPrimary}>📋 Vapi Integration Todo List</Heading>
            <Text color={textSecondary}>
              Track implementation progress for all Vapi services
            </Text>
          </Box>

          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" color={textPrimary}>Overall Progress</Text>
                  <Text color={textSecondary}>{completedTodos} / {totalTodos} completed</Text>
                </HStack>
                <Progress value={calculateProgress()} colorScheme="green" size="lg" />
              </VStack>
            </CardBody>
          </Card>

          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Implementation Order:</Text>
              <Text fontSize="sm">
                1. Foundation → 2. Calls → 3. Assistants → 4. Phone Numbers → 5. Campaigns → 
                6. Tools → 7. Knowledge Bases → 8. Files → 9. Chats → 10. Analytics → 
                11. Advanced → 12. MCP
              </Text>
            </Box>
          </Alert>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>By Priority</Tab>
              <Tab>By Section</Tab>
              <Tab>Implementation Guide</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {["high", "medium", "low"].map(priority => (
                    <Card key={priority}
                      bg={cardGradientBg}
                      backdropFilter="blur(10px)"
                      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                      border="1px"
                      borderColor={cardBorder}
                    >
                      <CardHeader>
                        <HStack>
                          <Badge colorScheme={getPriorityColor(priority)}>
                            {priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Text fontWeight="bold" color={textPrimary}>
                            ({sections.flatMap(s => s.todos)
                              .filter(t => t.priority === priority).length} items)
                          </Text>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={2} align="stretch">
                          {sections.map((section, sIndex) => 
                            section.todos
                              .filter(todo => todo.priority === priority)
                              .map((todo, tIndex) => {
                                const actualIndex = section.todos.findIndex(t => t.id === todo.id);
                                return (
                                  <HStack key={todo.id} spacing={3}>
                                    <Checkbox
                                      isChecked={todo.completed}
                                      onChange={() => toggleTodo(sIndex, actualIndex)}
                                    />
                                    <Box flex={1}>
                                      <Text 
                                        textDecoration={todo.completed ? "line-through" : "none"}
                                        fontWeight="medium"
                                        color={textPrimary}
                                      >
                                        {todo.label}
                                      </Text>
                                      {todo.description && (
                                        <Text fontSize="sm" color={textMuted}>
                                          {todo.description}
                                        </Text>
                                      )}
                                      {todo.endpoint && (
                                        <Code fontSize="xs" mt={1}>
                                          {todo.endpoint}
                                        </Code>
                                      )}
                                    </Box>
                                    <Badge colorScheme="purple" fontSize="xs">
                                      {section.title}
                                    </Badge>
                                  </HStack>
                                );
                              })
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>

              <TabPanel>
                <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
                  {sections.sort((a, b) => a.order - b.order).map((section, sIndex) => (
                    <AccordionItem key={section.title}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Badge colorScheme="blue">{section.order}</Badge>
                              <Text fontWeight="bold" color={textPrimary}>{section.title}</Text>
                              <Text fontSize="sm" color={textMuted}>
                                ({section.todos.filter(t => t.completed).length}/{section.todos.length})
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color={textSecondary} mt={1}>
                              {section.description}
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={3} align="stretch">
                          {section.todos.map((todo, tIndex) => (
                            <HStack key={todo.id} spacing={3}>
                              <Checkbox
                                isChecked={todo.completed}
                                onChange={() => toggleTodo(sIndex, tIndex)}
                              />
                              <Box flex={1}>
                                <HStack>
                                  <Text 
                                    textDecoration={todo.completed ? "line-through" : "none"}
                                    fontWeight="medium"
                                  >
                                    {todo.label}
                                  </Text>
                                  <Badge 
                                    size="sm" 
                                    colorScheme={getPriorityColor(todo.priority)}
                                  >
                                    {todo.priority}
                                  </Badge>
                                </HStack>
                                {todo.description && (
                                  <Text fontSize="sm" color={textMuted}>
                                    {todo.description}
                                  </Text>
                                )}
                                {todo.endpoint && (
                                  <Code fontSize="xs" mt={1}>
                                    {todo.endpoint}
                                  </Code>
                                )}
                                {todo.notes && (
                                  <Text fontSize="xs" color="green.500" mt={1}>
                                    ✓ {todo.notes}
                                    {todo.id === "get-call" && (
                                      <> - <a href="/vapi/call-logs" style={{ textDecoration: 'underline' }}>Go to Call Logs</a></>
                                    )}
                                  </Text>
                                )}
                              </Box>
                            </HStack>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>Quick Start Guide</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Text fontWeight="bold" color={textPrimary}>1. Configure Webhook</Text>
                        <Code p={2}>
                          POST https://yourdomain.com/webhooks/vapi
                        </Code>
                        <Text fontSize="sm" color={textSecondary}>
                          Add this URL to Vapi Dashboard → Settings → Webhooks
                        </Text>
                        
                        <Divider my={2} />
                        
                        <Text fontWeight="bold" color={textPrimary}>2. Set API Keys</Text>
                        <Text fontSize="sm" color={textSecondary}>
                          Go to Admin → Tenants → Edit → Vapi Integration section
                        </Text>
                        
                        <Divider my={2} />
                        
                        <Text fontWeight="bold" color={textPrimary}>3. MCP Setup for Claude Desktop</Text>
                        <Code p={2} fontSize="xs">
{`{
  "mcpServers": {
    "vapi-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.vapi.ai/mcp",
        "--header",
        "Authorization: Bearer YOUR_VAPI_API_KEY"
      ],
      "env": {
        "VAPI_TOKEN": "YOUR_VAPI_API_KEY"
      }
    }
  }
}`}
                        </Code>
                        
                        <Divider my={2} />
                        
                        <Text fontWeight="bold" color={textPrimary}>4. Test with Call</Text>
                        <Text fontSize="sm" color={textSecondary}>
                          Call your configured phone number: +61 468 003 978
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>API Pattern</Heading>
                    </CardHeader>
                    <CardBody>
                      <Text fontSize="sm" mb={2} color={textSecondary}>
                        All Vapi API endpoints follow a consistent RESTful pattern:
                      </Text>
                      <VStack spacing={2} align="stretch" fontSize="sm">
                        <Code>GET /resource - List all resources</Code>
                        <Code>POST /resource - Create new resource</Code>
                        <Code>GET /resource/:id - Get specific resource</Code>
                        <Code>PATCH /resource/:id - Update resource</Code>
                        <Code>DELETE /resource/:id - Delete resource</Code>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>Priority Focus Areas</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        <HStack>
                          <Badge colorScheme="red">HIGH</Badge>
                          <Text fontSize="sm" color={textSecondary}>
                            Calls, Assistants, Phone Numbers - Core voice functionality
                          </Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="yellow">MEDIUM</Badge>
                          <Text fontSize="sm" color={textSecondary}>
                            Campaigns, Tools, Analytics - Business operations
                          </Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="gray">LOW</Badge>
                          <Text fontSize="sm" color={textSecondary}>
                            Chats, Files, Testing - Supporting features
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};