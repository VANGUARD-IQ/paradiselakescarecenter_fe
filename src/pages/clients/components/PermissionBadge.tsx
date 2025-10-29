import React, { useState, useRef, useEffect } from 'react';
import {
  Badge,
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Portal,
  ScaleFade,
  Icon,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { FiExternalLink, FiInfo, FiX } from 'react-icons/fi';
import { getPermissionTooltipContent } from '../../../utils/permissionRouteMapping';

interface PermissionBadgeProps {
  permission: string;
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onRemove?: () => void;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  permission,
  colorScheme = 'blue',
  size = 'md',
  showTooltip = true,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const tooltipContent = getPermissionTooltipContent(permission);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        badgeRef.current &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsOpen(!isOpen);
  };

  const getColorSchemeForPermission = (perm: string): string => {
    // Admin permissions
    if (perm.includes('ADMIN') || perm.includes('MASTER')) return 'red';
    // Email permissions
    if (perm.includes('EMAIL') || perm.includes('ADDRESS_BOOK')) return 'purple';
    // Phone permissions
    if (perm.includes('PHONE') || perm.includes('VAPI')) return 'green';
    // Project permissions
    if (perm.includes('PROJECT')) return 'orange';
    // Commerce permissions
    if (perm === 'SELLER' || perm === 'PRACTITIONER') return 'teal';
    // Default
    return colorScheme;
  };

  const badgeColor = getColorSchemeForPermission(permission);

  return (
    <>
      <Box ref={badgeRef} display="inline-block">
        <Badge
          colorScheme={badgeColor}
          size={size}
          cursor={showTooltip && tooltipContent ? 'pointer' : 'default'}
          onClick={showTooltip && tooltipContent ? handleBadgeClick : undefined}
          position="relative"
          px={3}
          py={1}
          borderRadius="md"
          fontWeight="medium"
          display="inline-flex"
          alignItems="center"
          gap={1}
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.2s"
        >
          {showTooltip && tooltipContent && (
            <Icon as={FiInfo} boxSize={3} />
          )}
          {permission}
          {onRemove && (
            <Box
              as="button"
              ml={1}
              onClick={(e: any) => {
                e.stopPropagation();
                onRemove();
              }}
              cursor="pointer"
              _hover={{ opacity: 0.7 }}
            >
              ×
            </Box>
          )}
        </Badge>
      </Box>

      {/* Interactive Tooltip Portal */}
      {showTooltip && tooltipContent && isOpen && (
        <Portal>
          <Box
            ref={tooltipRef}
            position="fixed"
            left={`${mousePosition.x}px`}
            top={`${mousePosition.y}px`}
            transform="translate(-50%, -100%)"
            zIndex={9999}
            pointerEvents="auto"
          >
            <ScaleFade in={isOpen} initialScale={0.9}>
              <Box
                bg="gray.800"
                color="white"
                px={4}
                py={3}
                borderRadius="lg"
                boxShadow="2xl"
                maxW="400px"
                border="1px solid"
                borderColor="gray.600"
                position="relative"
              >
                {/* Close button */}
                <IconButton
                  aria-label="Close"
                  icon={<FiX />}
                  size="xs"
                  position="absolute"
                  top={2}
                  right={2}
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'white', bg: 'gray.700' }}
                  onClick={() => setIsOpen(false)}
                />

                <VStack align="stretch" spacing={2}>
                  {/* Header */}
                  <Box pr={6}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {tooltipContent.title}
                    </Text>
                    <Text fontSize="xs" color="gray.300" mt={1}>
                      {tooltipContent.description}
                    </Text>
                  </Box>

                  {/* Divider */}
                  <Divider borderColor="gray.600" />

                  {/* Routes */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.400" mb={2}>
                      GRANTS ACCESS TO:
                    </Text>
                    <VStack align="stretch" spacing={1}>
                      {tooltipContent.routes.map((route, index) => (
                        <Link
                          key={index}
                          href={route.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          _hover={{ textDecoration: 'none' }}
                        >
                          <HStack
                            spacing={2}
                            p={2}
                            borderRadius="md"
                            _hover={{ bg: 'gray.700' }}
                            transition="background 0.2s"
                            cursor="pointer"
                          >
                            <Icon as={FiExternalLink} boxSize={3} color="blue.400" />
                            <Text fontSize="sm" color="blue.400" fontWeight="medium">
                              {route.label}
                            </Text>
                          </HStack>
                        </Link>
                      ))}
                    </VStack>
                  </Box>

                  {/* Footer hint */}
                  <Box pt={1} borderTop="1px solid" borderTopColor="gray.700">
                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                      Click any link to open in a new tab
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </ScaleFade>
          </Box>
        </Portal>
      )}
    </>
  );
};

// Export the interactive version as the ClickablePermissionBadge
export const ClickablePermissionBadge = PermissionBadge;