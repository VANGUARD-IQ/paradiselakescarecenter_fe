import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  HStack,
  Text,
  Button,
  ButtonGroup,
  Tooltip,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { getColor } from '../brandConfig';
import { ModuleConfig } from '../types/ModuleConfig';
import { useAuth } from '../contexts/AuthContext';

interface ModuleBreadcrumbProps {
  moduleConfig: ModuleConfig;
}

export const ModuleBreadcrumb: React.FC<ModuleBreadcrumbProps> = ({ moduleConfig }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Brand colors
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textPrimary = getColor("text.primaryDark");
  const textSecondary = getColor("text.secondaryDark");
  const textMuted = getColor("text.mutedDark");
  const primaryColor = getColor("primary");
  
  // Check if user has permission for a navigation item
  const hasPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    if (!user?.permissions) return false;
    
    return permissions.some(permission => 
      user.permissions?.includes(permission) || 
      user.permissions?.includes('ADMIN') || 
      user.permissions?.includes('TENANT_ADMIN')
    );
  };
  
  // Filter navigation items based on permissions
  const availableNavItems = moduleConfig.navigation.filter(item => 
    hasPermission(item.permissions)
  );
  
  // Find current page - check for exact matches first, then check for dynamic routes
  const currentPath = location.pathname;
  
  // Sort navigation items by path length (longest first) to match more specific routes first
  const sortedNavItems = [...availableNavItems].sort((a, b) => b.path.length - a.path.length);
  
  const currentNav = sortedNavItems.find(item => {
    // Check exact match first
    if (item.path === currentPath) return true;
    
    // For /client/:id routes, match with /clients
    if (currentPath.match(/^\/client\/[^/]+$/)) {
      return item.path === '/clients';
    }
    
    return false;
  });
  
  if (availableNavItems.length === 0) {
    return null; // Don't show breadcrumb if no navigation items available
  }
  
  return (
    <Box
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      borderBottom="1px"
      borderColor={cardBorder}
      px={{ base: 4, md: 8 }}
      py={3}
      mb={6}
      position="sticky"
      top="0"
      zIndex={10}
    >
      <HStack spacing={4} align="center">
        {/* Module Name */}
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={textPrimary}
          display={{ base: 'none', md: 'block' }}
        >
          {moduleConfig.name}
        </Text>

        <Divider orientation="vertical" height="20px" borderColor={cardBorder} />

        {/* Navigation Buttons */}
        <ButtonGroup size="sm" variant="ghost" spacing={1}>
          {availableNavItems.map((item, index) => {
            const isActive = currentNav?.path === item.path;
            
            return (
              <React.Fragment key={item.path}>
                {index > 0 && !isMobile && (
                  <ChevronRightIcon color={textMuted} />
                )}
                <Tooltip label={item.label} placement="bottom" hasArrow>
                  <Button
                    onClick={() => navigate(item.path)}
                    bg={isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
                    color={isActive ? primaryColor : textSecondary}
                    borderRadius="md"
                    border={isActive ? '1px solid' : '1px solid transparent'}
                    borderColor={isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
                    _hover={{
                      bg: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? primaryColor : textPrimary,
                      transform: 'translateY(-1px)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                    fontWeight={isActive ? 'semibold' : 'normal'}
                    leftIcon={
                      <Text fontSize="sm">
                        {item.icon}
                      </Text>
                    }
                  >
                    <Text display={{ base: isActive ? 'block' : 'none', md: 'block' }}>
                      {item.label}
                    </Text>
                  </Button>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </ButtonGroup>
      </HStack>
    </Box>
  );
};