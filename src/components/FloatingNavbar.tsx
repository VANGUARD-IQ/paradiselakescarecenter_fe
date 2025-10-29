import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  IconButton,
  Text,
  Collapse,
  Portal,
  useDisclosure,
  Flex,
  Badge,
  Avatar,
  Icon,
  useColorMode,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiUser,
  FiPackage,
  FiFolder,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiGrid,
  FiPhone,
  FiMail,
  FiLock,
  FiCpu,
  FiBriefcase,
  FiDatabase,
  FiExternalLink,
  FiVideo,
  FiSun,
  FiMoon,
  FiMic,
  FiRefreshCw,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginWithSmsModal } from '../pages/authentication';
import { getColor } from '../brandConfig';

// Import module configs
import profileModuleConfig from '../pages/profile/moduleConfig';
import subscriptionModuleConfig from '../pages/subscriptions/moduleConfig';
import clientsModuleConfig from '../pages/clients/moduleConfig';
import employeesModuleConfig from '../pages/employees/moduleConfig';
import companiesModuleConfig from '../pages/companies/moduleConfig';
import assetsModuleConfig from '../pages/assets/moduleConfig';
import { calendarsModuleConfig } from '../pages/calendars/moduleConfig';
import productsModuleConfig from '../pages/products/moduleConfig';
import projectsModuleConfig from '../pages/projects/moduleConfig';
import billsModuleConfig from '../pages/bills/moduleConfig';
import emailsModuleConfig from '../pages/emails/moduleConfig';
import passwordsModuleConfig from '../pages/passwords/moduleConfig';
import tenantManagementModuleConfig from '../pages/tenant-management/moduleConfig';
import adminModuleConfig from '../pages/admin/moduleConfig';
import providerModuleConfig from '../pages/provider/moduleConfig';
import phoneSystemModuleConfig from '../pages/phone-system/moduleConfig';
import knowledgebaseModuleConfig from '../pages/knowledgebase/moduleConfig';
import meetingSummarizerModule from '../pages/meeting-summarizer/moduleConfig';
import vapiModuleConfig from '../pages/vapi/moduleConfig';
import opportunitiesModuleConfig from '../pages/opportunities/moduleConfig';
import youtubeToIPFSModuleConfig from '../pages/youtubetoipfs/moduleConfig';
import transcriptionsModuleConfig from '../pages/transcriptions/moduleConfig';
import proposalsModuleConfig from '../pages/proposals/moduleConfig';
import companyKnowledgeModuleConfig from '../pages/companyknowledge/moduleConfig';
import frontendUpgradesModuleConfig from '../pages/frontend-upgrades/moduleConfig';
import { useNavbarState } from '../hooks/useNavbarState';

// Animations
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Icon mapping for modules
const moduleIcons: Record<string, any> = {
  profile: FiUser,
  clients: FiUsers,
  employees: FiBriefcase,
  companies: FiDatabase,
  assets: FiPackage,
  calendars: FiCalendar,
  sessions: FiCalendar,
  products: FiPackage,
  projects: FiFolder,
  bills: FiDollarSign,
  opportunities: FiDollarSign,
  proposals: FiExternalLink,
  youtubetoipfs: FiVideo,
  emails: FiMail,
  passwords: FiLock,
  'phone-system': FiPhone,
  vapi: FiPhone,
  'meeting-summarizer': FiCpu,
  transcriptions: FiMic,
  knowledgebase: FiDatabase,
  companyknowledge: FiDatabase,
  researchanddesign: FiCpu,
  subscriptions: FiDollarSign,
  provider: FiSettings,
  'frontend-upgrades': FiRefreshCw,
  'tenant-management': FiDatabase,
  admin: FiSettings,
};

export const FloatingNavbar: React.FC = () => {
  // Use persistent state management with client-specific storage
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  // Use client ID for user-specific navbar state
  const clientId = user?.clientId || user?.client?.id || user?.id;


  const {
    isExpanded,
    setIsExpanded,
    activeCategory,
    setActiveCategory,
    expandedModules,
    toggleModuleExpanded,
    resetState,
  } = useNavbarState(clientId);


  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const navigate = useNavigate();

  // Refresh auth data when component mounts and user is authenticated but data is missing
  useEffect(() => {

    if (isAuthenticated && (!user || !user.permissions)) {
      refreshAuth();
    }
  }, [isAuthenticated, user, refreshAuth]);

  // All available module configs
  const allModuleConfigs = [
    profileModuleConfig,
    clientsModuleConfig,
    employeesModuleConfig,
    companiesModuleConfig,
    assetsModuleConfig,
    calendarsModuleConfig,
    passwordsModuleConfig,
    productsModuleConfig,
    projectsModuleConfig,
    billsModuleConfig,
    opportunitiesModuleConfig,
    proposalsModuleConfig,
    youtubeToIPFSModuleConfig,
    emailsModuleConfig,
    phoneSystemModuleConfig,
    vapiModuleConfig,
    meetingSummarizerModule,
    transcriptionsModuleConfig,
    subscriptionModuleConfig,
    providerModuleConfig,
    knowledgebaseModuleConfig,
    companyKnowledgeModuleConfig,
    frontendUpgradesModuleConfig,
    tenantManagementModuleConfig,
    adminModuleConfig,
  ];

  // Filter modules based on user permissions
  const getAvailableModules = () => {
    // console.log('📦 [4] FloatingNavbar - Getting available modules', {
    //   totalModules: allModuleConfigs.length,
    //   hasUser: !!user,
    //   userPermissions: user?.permissions || [],
    // });

    if (!user || !user.permissions || user.permissions.length === 0) {
      return [];
    }

    const filteredModules = allModuleConfigs.filter(module => {
      const hasPermission = user?.permissions?.some((permission: string) => {
        // Check for view permissions in the standard format
        const hasViewPermission = module.permissions?.view?.includes(permission) || false;
        if (hasViewPermission) {
          // console.log('✅ [6] FloatingNavbar - Module accessible', {
          //   module: module.id,
          //   permission,
          //   viewPermissions: module.permissions.view,
          // });
        }
        return hasViewPermission;
      }) || false;

      return hasPermission;
    });


    return filteredModules;
  };

  // Group modules by category
  const categorizedModules = {
    // 'Core': ['profile', 'clients', 'employees', 'companies'],
    'Core': [ 'clients', ],

    'Human Management': ['employees', 'companies', 'passwords'],

    'Delivery': [  'assets'],

    'Communication': ['calendars', 'emails', 'phone-system', 'vapi',],

    'Media & Content': ['youtubetoipfs', 'knowledgebase', 'companyknowledge', 'transcriptions'],

    'Sell Ready': ['assets',],




    // 'Other Modules': ['researchanddesign', 'provider', ],

    // 'To Improve': ['sessions', 'subscriptions','products'],


    'Settings': ['profile'],


  };

  const availableModules = isAuthenticated ? getAvailableModules() : [];


  const handleNavItemClick = (path: string) => {
    navigate(path);
    // Keep the menu state but close the expanded view
    setIsExpanded(false);
  };

  const handleOpenInNewTab = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsExpanded(false);
    // Reset navbar state on logout
    resetState();
  };

  // Filter navigation items based on user permissions
  const getVisibleNavItems = (navigation: any) => {
    if (!navigation) return [];

    // Handle different navigation formats
    let navItems: any[] = [];
    if (Array.isArray(navigation)) {
      navItems = navigation;
    } else if (navigation.sub && Array.isArray(navigation.sub)) {
      navItems = navigation.sub;
    }

    return navItems.filter((item: any) => {
      // If no permissions required, show to everyone
      if (!item.permissions || item.permissions.length === 0) return true;

      // Check if user has required permission
      const hasPermission = user?.permissions?.some((permission: string) =>
        item.permissions.includes(permission)
      ) || false;


      return hasPermission;
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isExpanded && !target.closest('.floating-navbar-container')) {
        setIsExpanded(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, setIsExpanded, setActiveCategory]);

  return (
    <>
      <Portal>
        <Box
          className="floating-navbar-container"
          position="fixed"
          bottom="20px"
          left="20px"
          zIndex={998}
        >
          {/* Expanded Navigation Panel */}
          <Collapse in={isExpanded} animateOpacity>
            <Box
              bg={colorMode === 'light'
                ? "rgba(255, 255, 255, 0.98)"
                : "rgba(10, 10, 15, 0.95)"}
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              border="1px solid"
              borderColor={getColor("border.light", colorMode)}
              p={4}
              mb={4}
              minW="320px"
              maxW="400px"
              maxH="70vh"
              overflowY="auto"
              boxShadow={colorMode === 'light'
                ? "0 10px 40px rgba(0, 0, 0, 0.15)"
                : "0 20px 60px rgba(0, 0, 0, 0.8)"}
              animation={`${slideIn} 0.3s ease-out`}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: getColor("secondary", colorMode),
                  borderRadius: '2px',
                },
              }}
            >
              {/* Theme Toggle Button - Always visible */}
              <Flex justify="flex-end" mb={3}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  size="sm"
                  variant="ghost"
                  color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                  onClick={toggleColorMode}
                  _hover={{
                    bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.1)',
                  }}
                />
              </Flex>

              {/* User Profile Section */}
              {isAuthenticated && user && (
                <Flex
                  align="center"
                  justify="space-between"
                  mb={4}
                  p={3}
                  bg={colorMode === 'light' ? "rgba(90, 200, 250, 0.05)" : "rgba(90, 200, 250, 0.1)"}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={colorMode === 'light' ? "rgba(90, 200, 250, 0.1)" : "rgba(90, 200, 250, 0.2)"}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={`${user.fName || user.firstName || ""} ${user.lName || user.lastName || ""}`}
                      src={user.profilePhoto || undefined}
                      bg={getColor("secondary", colorMode)}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="600" color={colorMode === 'light' ? "gray.700" : "white"}>
                        {user.fName || user.firstName || 'User'} {user.lName || user.lastName || ''}
                      </Text>
                      <Text fontSize="xs" color={colorMode === 'light' ? "gray.500" : "gray.400"}>
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                  <IconButton
                    aria-label="Logout"
                    icon={<FiLogOut />}
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    onClick={handleLogout}
                    _hover={{
                      bg: 'rgba(255, 0, 0, 0.1)',
                      transform: 'scale(1.1)',
                    }}
                  />
                </Flex>
              )}

              {/* Quick Actions */}
              <HStack mb={4} spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FiHome />}
                  bg={getColor("secondary", colorMode)}
                  color="white"
                  fontWeight="600"
                  borderRadius="full"
                  _hover={{
                    bg: getColor("secondaryHover", colorMode),
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  onClick={() => {
                    navigate('/');
                    setIsExpanded(false);
                  }}
                >
                  Home
                </Button>
                {!isAuthenticated && (
                  <Button
                    size="sm"
                    bg={getColor("secondary", colorMode)}
                    color="white"
                    fontWeight="600"
                    borderRadius="full"
                    onClick={onLoginOpen}
                    _hover={{
                      bg: getColor("secondaryHover", colorMode),
                      transform: 'translateY(-2px)',
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                )}
              </HStack>

              {/* Module Categories */}
              {isAuthenticated && (
                <VStack spacing={2} align="stretch">
                  {Object.entries(categorizedModules).map(([category, moduleIds]) => {
                    const categoryModules = availableModules.filter(m => 
                      moduleIds.includes(m.id)
                    );
                    
                    if (categoryModules.length === 0) return null;

                    return (
                      <Box key={category}>
                        <Button
                          size="sm"
                          variant="ghost"
                          color={colorMode === 'light' ? "gray.600" : "gray.400"}
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          justifyContent="space-between"
                          w="full"
                          onClick={() => {
                            const newCategory = activeCategory === category ? null : category;
                            setActiveCategory(newCategory);
                          }}
                          _hover={{
                            bg: colorMode === 'light' ? 'rgba(90, 200, 250, 0.1)' : 'rgba(90, 200, 250, 0.15)',
                            color: getColor("secondary", colorMode),
                          }}
                          rightIcon={
                            <Box
                              transform={activeCategory === category ? 'rotate(90deg)' : 'rotate(0)'}
                              transition="transform 0.2s"
                            >
                              <FiChevronRight />
                            </Box>
                          }
                        >
                          {category}
                        </Button>
                        
                        <Collapse in={activeCategory === category} animateOpacity>
                          <VStack spacing={1} align="stretch" mt={2} pl={4}>
                            {categoryModules.map((module) => {
                              const IconComponent = moduleIcons[module.id] || FiGrid;
                              const isModuleExpanded = expandedModules.has(module.id);
                              const visibleNavItems = getVisibleNavItems(module.navigation);
                              
                              // Get the main module path (handle different navigation formats)
                              let mainModulePath = `/module/${module.id}`;
                              if (module.navigation) {
                                if (Array.isArray(module.navigation) && module.navigation[0]) {
                                  mainModulePath = module.navigation[0].path;
                                } else if (!Array.isArray(module.navigation) && typeof module.navigation === 'object' && 'main' in module.navigation) {
                                  mainModulePath = (module.navigation as any).main.path;
                                }
                              } else if (module.routes?.[0]) {
                                mainModulePath = module.routes[0].path;
                              }
                              
                              return (
                                <Box key={module.id}>
                                  <HStack 
                                    spacing={0}
                                    onMouseEnter={() => setHoveredItem(`module-${module.id}`)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      color={colorMode === 'light' ? "gray.700" : "gray.300"}
                                      flex="1"
                                      justifyContent="flex-start"
                                      leftIcon={<Icon as={IconComponent} />}
                                      onClick={() => {
                                        // Navigate to the main module page
                                        handleNavItemClick(mainModulePath);
                                      }}
                                      position="relative"
                                      _hover={{
                                        bg: colorMode === 'light' ? 'rgba(90, 200, 250, 0.1)' : 'rgba(90, 200, 250, 0.15)',
                                        color: getColor("secondary", colorMode),
                                        transform: 'translateX(4px)',
                                        _before: {
                                          opacity: 1,
                                        }
                                      }}
                                      _before={{
                                        content: '""',
                                        position: 'absolute',
                                        left: '-16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px',
                                        height: '70%',
                                        bg: `linear-gradient(180deg, transparent, ${getColor("secondary", colorMode)}, transparent)`,
                                        borderRadius: 'full',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                      }}
                                      transition="all 0.2s"
                                    >
                                      {module.name}
                                    </Button>
                                    
                                    {/* Open in new tab button - shows on hover */}
                                    <IconButton
                                      aria-label="Open in new tab"
                                      icon={<FiExternalLink size="12" />}
                                      size="xs"
                                      variant="ghost"
                                      color="gray.400"
                                      opacity={hoveredItem === `module-${module.id}` ? 1 : 0}
                                      pointerEvents={hoveredItem === `module-${module.id}` ? 'auto' : 'none'}
                                      onClick={() => handleOpenInNewTab(mainModulePath)}
                                      _hover={{
                                        bg: 'rgba(90, 200, 250, 0.2)',
                                        color: getColor("secondary", colorMode),
                                      }}
                                      transition="all 0.2s"
                                    />
                                    
                                    {/* Expand/collapse button */}
                                    {visibleNavItems.length > 0 && (
                                      <IconButton
                                        aria-label="Expand module"
                                        icon={
                                          <Box
                                            transform={isModuleExpanded ? 'rotate(90deg)' : 'rotate(0)'}
                                            transition="transform 0.2s"
                                          >
                                            <FiChevronRight size="14" />
                                          </Box>
                                        }
                                        size="xs"
                                        variant="ghost"
                                        color="gray.400"
                                        onClick={() => {
                                          toggleModuleExpanded(module.id);
                                        }}
                                        _hover={{
                                          bg: colorMode === 'light' ? 'rgba(90, 200, 250, 0.1)' : 'rgba(90, 200, 250, 0.15)',
                                          color: getColor("secondary", colorMode),
                                        }}
                                      />
                                    )}
                                  </HStack>
                                  
                                  {/* Sub-navigation items */}
                                  <Collapse in={isModuleExpanded} animateOpacity>
                                    <VStack spacing={0.5} align="stretch" mt={1} pl={8}>
                                      {visibleNavItems.map((navItem: any) => (
                                        <HStack
                                          key={navItem.path}
                                          spacing={0}
                                          onMouseEnter={() => setHoveredItem(`nav-${navItem.path}`)}
                                          onMouseLeave={() => setHoveredItem(null)}
                                        >
                                          <Button
                                            size="xs"
                                            variant="ghost"
                                            color={colorMode === 'light' ? "gray.600" : "gray.400"}
                                            flex="1"
                                            justifyContent="flex-start"
                                            leftIcon={navItem.icon ? <Text fontSize="xs">{navItem.icon}</Text> : undefined}
                                            onClick={() => handleNavItemClick(navItem.path)}
                                            fontSize="xs"
                                            fontWeight="400"
                                            _hover={{
                                              bg: 'rgba(90, 200, 250, 0.1)',
                                              color: getColor("secondary", colorMode),
                                              transform: 'translateX(2px)',
                                            }}
                                            transition="all 0.15s"
                                          >
                                            {navItem.label}
                                            {navItem.badge && (
                                              <Badge
                                                ml={1}
                                                colorScheme={navItem.badge.color || 'gray'}
                                                fontSize="2xs"
                                                variant="subtle"
                                              >
                                                {navItem.badge.text}
                                              </Badge>
                                            )}
                                          </Button>
                                          
                                          {/* Open in new tab button for sub-items */}
                                          <IconButton
                                            aria-label="Open in new tab"
                                            icon={<FiExternalLink size="10" />}
                                            size="xs"
                                            variant="ghost"
                                            color="gray.500"
                                            opacity={hoveredItem === `nav-${navItem.path}` ? 1 : 0}
                                            pointerEvents={hoveredItem === `nav-${navItem.path}` ? 'auto' : 'none'}
                                            onClick={() => handleOpenInNewTab(navItem.path)}
                                            minW="20px"
                                            h="20px"
                                            _hover={{
                                              bg: 'rgba(90, 200, 250, 0.2)',
                                              color: getColor("secondary", colorMode),
                                            }}
                                            transition="all 0.2s"
                                          />
                                        </HStack>
                                      ))}
                                    </VStack>
                                  </Collapse>
                                </Box>
                              );
                            })}
                          </VStack>
                        </Collapse>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </Collapse>

          {/* Floating Menu Button */}
          <IconButton
            aria-label="Toggle navigation"
            icon={isExpanded ? <FiX /> : <FiMenu />}
            size="lg"
            borderRadius="full"
            bg={getColor("secondary", colorMode)}
            color="white"
            border="2px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            _hover={{
              bg: getColor("secondaryHover", colorMode),
              transform: 'scale(1.1) rotate(180deg)',
              boxShadow: "0 6px 20px rgba(90, 200, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
            }}
            _active={{
              transform: 'scale(0.95)',
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2)"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            animation={!isExpanded ? `${float} 3s ease-in-out infinite` : undefined}
            position="relative"
          />
        </Box>
      </Portal>

      {/* Login Modal */}
      <LoginWithSmsModal
        isOpen={isLoginOpen}
        onClose={onLoginClose}
        onLoginSuccess={() => {
          onLoginClose();
          window.location.reload();
        }}
      />
    </>
  );
};