import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import knowledgebaseModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const KnowledgeBasePermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = ["ADMIN", "TENANT_MASTER_ADMIN"],
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { colorMode } = useColorMode();

  // Show loading state
  if (loading) {
    return (
      <Box bg={getColor("background.main", colorMode)} minHeight="100vh">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={knowledgebaseModuleConfig} />
        <Container maxW="container.lg" py={12}>
          <VStack spacing={4}>
            <Text>Loading...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions
  const hasRequiredPermission = requiredPermissions.some(permission =>
    user.permissions?.includes(permission)
  );

  if (!hasRequiredPermission) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePageTitle("Knowledge Base Permissions");
    return (
      <Box bg={getColor("background.main", colorMode)} minHeight="100vh">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={knowledgebaseModuleConfig} />
        <Container maxW="container.lg" py={12}>
          <VStack spacing={6} align="center">
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <Heading size="md" mt={4} mb={1}>
                Access Denied
              </Heading>
              <Text>
                You don't have permission to access the Knowledge Base.
                This area is restricted to administrators only.
              </Text>
            </Alert>
            <Button
              onClick={() => window.history.back()}
              colorScheme="blue"
              size="lg"
            >
              Go Back
            </Button>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // User has permission, render children
  return <>{children}</>;
};