import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

export const ContextDebugger = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [operationContext, setOperationContext] = useState<any>(null);

  // Check admin status
  useEffect(() => {
    const storedPassword = localStorage.getItem("admin_password");
    setIsAdmin(storedPassword === "123456");
  }, []);

  // Capture the latest GraphQL operation context
  useEffect(() => {
    // Create a function to intercept Apollo operation context
    const captureNextOperationContext = () => {
      const originalFetch = window.fetch;
      
      window.fetch = function(input, init) {
        // Only intercept GraphQL operations
        if (init && 
            init.headers && 
            typeof input === "string" && 
            input.includes("graphql")) {
          
          try {
            // Capture headers
            const headers = init.headers as any;
            setOperationContext({
              url: input,
              headers: {
                authorization: headers.authorization ? "Bearer [redacted]" : "none",
                "x-tenant-id": headers["x-tenant-id"] || "not set",
                "x-apollo-operation-name": headers["x-apollo-operation-name"] || "unknown",
                "content-type": headers["content-type"] || "not set"
              },
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.error("Error capturing context:", e);
          }
        }
        
        return originalFetch.apply(this, [input, init]);
      };
      
      return () => {
        window.fetch = originalFetch;
      };
    };
    
    const cleanup = captureNextOperationContext();
    return cleanup;
  }, []);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box mt={8} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
      <Heading size="md" mb={4}>Context Debugger</Heading>
      
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Auth User Context
                {user && <Badge ml={2} colorScheme="green">Available</Badge>}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {user ? (
              <Stack spacing={3}>
                <Box>
                  <Text fontWeight="bold">User ID:</Text>
                  <Code p={2} borderRadius="md">{user.id}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Name:</Text>
                  <Code p={2} borderRadius="md">{`${user.fName || "N/A"} ${user.lName || "N/A"}`}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Phone:</Text>
                  <Code p={2} borderRadius="md">{user.phoneNumber || "N/A"}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Email:</Text>
                  <Code p={2} borderRadius="md">{user.email || "N/A"}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Role:</Text>
                  <Code p={2} borderRadius="md">{user.role || "N/A"}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Tenant ID:</Text>
                  <Code p={2} borderRadius="md">{user.tenantId || "N/A"}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Permissions:</Text>
                  <Code p={2} borderRadius="md">
                    {user.permissions ? user.permissions.join(", ") : "N/A"}
                  </Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Full User Object:</Text>
                  <Code 
                    p={2} 
                    borderRadius="md" 
                    whiteSpace="pre-wrap" 
                    display="block"
                    overflowX="auto"
                  >
                    {JSON.stringify(user, null, 2)}
                  </Code>
                </Box>
              </Stack>
            ) : (
              <Text>No user context available</Text>
            )}
          </AccordionPanel>
        </AccordionItem>
        
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Last GraphQL Operation Context
                {operationContext && <Badge ml={2} colorScheme="blue">Captured</Badge>}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {operationContext ? (
              <Stack spacing={3}>
                <Box>
                  <Text fontWeight="bold">Operation:</Text>
                  <Code p={2} borderRadius="md">{operationContext.headers["x-apollo-operation-name"]}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Tenant ID:</Text>
                  <Code p={2} borderRadius="md">{operationContext.headers["x-tenant-id"]}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Content Type:</Text>
                  <Code p={2} borderRadius="md">{operationContext.headers["content-type"]}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Auth:</Text>
                  <Code p={2} borderRadius="md">{operationContext.headers.authorization}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Timestamp:</Text>
                  <Code p={2} borderRadius="md">{operationContext.timestamp}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">URL:</Text>
                  <Code p={2} borderRadius="md">{operationContext.url}</Code>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Full Context:</Text>
                  <Code 
                    p={2} 
                    borderRadius="md" 
                    whiteSpace="pre-wrap" 
                    display="block"
                    overflowX="auto"
                  >
                    {JSON.stringify(operationContext, null, 2)}
                  </Code>
                </Box>
              </Stack>
            ) : (
              <Text>No operation context captured yet. Perform a GraphQL operation to capture data.</Text>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

    
    </Box>

    
  );
}; 