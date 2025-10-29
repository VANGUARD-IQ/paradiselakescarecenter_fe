import React from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Text,
  IconButton,
  useColorMode} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

const ResearchAndDesignActivityTypeSelector: React.FC = () => {
  const { colorMode } = useColorMode();
  usePageTitle("Select Activity Type");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const stage = searchParams.get('stage');
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  const handleCoreActivity = () => {
    const params = new URLSearchParams();
    if (projectId) params.set('project', projectId);
    if (stage) params.set('stage', stage);
    navigate(`/researchanddesign/activities/new-core?${params.toString()}`);
  };

  const handleSupportingActivity = () => {
    const params = new URLSearchParams();
    if (projectId) params.set('project', projectId);
    if (stage) params.set('stage', stage);
    navigate(`/researchanddesign/activities/new-supporting?${params.toString()}`);
  };

  return (
    <Box bg={bg} minH="100vh">
      <NavbarWithCallToAction />
      
      <Box pt={24} pb={8} px={8}>
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
          {/* Header */}
          <HStack justify="space-between" align="center" mb={4}>
            <HStack spacing={4}>
              <IconButton
                aria-label="Back"
                icon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                size="sm"
                variant="ghost"
              />
              <Heading size="lg" color={textPrimary}>
                Choose Activity Type
              </Heading>
            </HStack>
          </HStack>

          {/* Information Alert */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">R&D Activity Types</Text>
              <Text fontSize="sm">
                Core R&D activities involve systematic experimentation to resolve technical uncertainties.
                Supporting activities directly support Core R&D and must pass the dominant purpose test.
              </Text>
            </Box>
          </Alert>

          {/* Activity Type Selection Cards */}
          <VStack spacing={4} align="stretch">
            <Card
              bg={cardGradientBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              cursor="pointer"
              onClick={handleCoreActivity}
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
                borderColor: 'blue.400'
              }}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box 
                      bg="blue.500" 
                      color="white" 
                      px={3} 
                      py={1} 
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      CORE R&D
                    </Box>
                  </HStack>
                  <Heading size="md" color={textPrimary}>
                    Core R&D Activity
                  </Heading>
                  <Text color={textSecondary} fontSize="lg">
                    Activities that involve systematic experimentation to resolve technical uncertainties
                  </Text>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Requires genuine technical uncertainty
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Must have a testable hypothesis
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Involves systematic experimentation
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Generates new technical knowledge
                    </Text>
                  </VStack>
                  <Text fontSize="sm" color={textMuted} fontStyle="italic">
                    Examples: Algorithm development, new process creation, novel system design, technical feasibility testing
                  </Text>
                  <Button 
                    colorScheme="blue" 
                    size="md" 
                    mt={2}
                    rightIcon={<Text>→</Text>}
                  >
                    Create Core R&D Activity
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              cursor="pointer"
              onClick={handleSupportingActivity}
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
                borderColor: 'green.400'
              }}
              transition="all 0.3s"
            >
              <CardBody p={8}>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box 
                      bg="green.500" 
                      color="white" 
                      px={3} 
                      py={1} 
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      SUPPORTING R&D
                    </Box>
                  </HStack>
                  <Heading size="md" color={textPrimary}>
                    Supporting R&D Activity
                  </Heading>
                  <Text color={textSecondary} fontSize="lg">
                    Activities directly related to and supporting Core R&D activities
                  </Text>
                  <VStack align="start" spacing={2} pl={4}>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Must be linked to a Core R&D activity
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Dominant purpose must be supporting Core R&D
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Includes infrastructure, data processing, testing
                    </Text>
                    <Text fontSize="sm" color={textMuted}>
                      ✓ Must pass the dominant purpose test (51%+ for R&D)
                    </Text>
                  </VStack>
                  <Text fontSize="sm" color={textMuted} fontStyle="italic">
                    Examples: Platform infrastructure, data pipelines, testing frameworks, clinical validation systems
                  </Text>
                  <Button 
                    colorScheme="green" 
                    size="md" 
                    mt={2}
                    rightIcon={<Text>→</Text>}
                  >
                    Create Supporting R&D Activity
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Additional Information */}
          <Card
            bg="rgba(255, 255, 255, 0.02)"
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="lg"
          >
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="sm" color={textPrimary}>
                  Important Considerations
                </Heading>
                <Text fontSize="sm" color={textSecondary}>
                  <strong>Core R&D Activities:</strong> These are the primary experimental activities that qualify for R&DTI. 
                  They must demonstrate technical uncertainty that cannot be resolved by a competent professional using existing knowledge.
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  <strong>Supporting R&D Activities:</strong> These can only be claimed if they directly support Core R&D activities. 
                  The dominant purpose (more than 50%) must be to support Core R&D rather than commercial operations.
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  <strong>Note:</strong> You must have at least one Core R&D activity before creating Supporting activities.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignActivityTypeSelector;