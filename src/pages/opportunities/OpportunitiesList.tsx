import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  SimpleGrid,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Center,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiTrendingUp,
  FiSearch,
  FiCalendar,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import opportunitiesModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Queries
const GET_OPPORTUNITIES = gql`
  query GetOpportunities($status: OpportunityStatus, $stage: String) {
    opportunities(status: $status, stage: $stage) {
      id
      title
      description
      clientId
      clientName
      clientEmail
      clientPhone
      value
      stage
      status
      priority
      probability
      expectedRevenue
      expectedCloseDate
      lastActivityDate
      assignedTo
      assignedToName
      source
      taskCount
      completedTaskCount
      createdAt
      updatedAt
    }
  }
`;

const GET_OPPORTUNITY_STAGES = gql`
  query GetOpportunityStages {
    opportunityStages {
      id
      name
      code
      order
      color
      icon
      defaultProbability
      isWonStage
      isLostStage
      currentOpportunities
    }
  }
`;

const GET_OPPORTUNITY_STATS = gql`
  query GetOpportunityStats {
    activeCount: opportunityCount(status: ACTIVE)
    wonCount: opportunityCount(status: WON)
    lostCount: opportunityCount(status: LOST)
    totalValue: totalOpportunityValue(status: ACTIVE)
    wonValue: totalOpportunityValue(status: WON)
  }
`;

const MOVE_OPPORTUNITY_STAGE = gql`
  mutation MoveOpportunityStage($id: String!, $newStage: String!) {
    moveOpportunityStage(id: $id, newStage: $newStage) {
      id
      stage
      status
      probability
      expectedRevenue
    }
  }
`;

const DELETE_OPPORTUNITY = gql`
  mutation DeleteOpportunity($id: String!) {
    deleteOpportunity(id: $id)
  }
`;

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  value: number;
  stage: string;
  status: string;
  priority: string;
  probability: number;
  expectedRevenue?: number;
  expectedCloseDate?: string;
  lastActivityDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  source?: string;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Stage {
  id: string;
  name: string;
  code: string;
  order: number;
  color: string;
  icon?: string;
  defaultProbability: number;
  isWonStage: boolean;
  isLostStage: boolean;
  currentOpportunities: number;
}

const OpportunityCard: React.FC<{
  opportunity: Opportunity;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ opportunity, onEdit, onDelete }) => {
  const { colorMode } = useColorMode();
  // Brand styling variables
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Card
      bg={cardGradientBg}
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      border="1px"
      borderColor={cardBorder}
      borderRadius="lg"
      mb={3}
      cursor="pointer"
      onClick={onEdit}
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
        transition: "all 0.2s"
      }}
    >
      <CardBody p={3}>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm" noOfLines={1} color={textPrimary}>
              {opportunity.title}
            </Text>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                color={textPrimary}
                size="xs"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList bg={cardGradientBg} borderColor={cardBorder}>
                <MenuItem icon={<FiEdit />} onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  Edit
                </MenuItem>
                <MenuItem icon={<FiTrash2 />} onClick={(e) => { e.stopPropagation(); onDelete(); }} color="red.500">
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          <HStack spacing={2}>
            <Badge colorScheme={getPriorityColor(opportunity.priority)} size="sm">
              {opportunity.priority}
            </Badge>
            <Text fontSize="xs" color={textMuted}>
              {opportunity.clientName}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
              ${opportunity.value.toLocaleString()}
            </Text>
            <Text fontSize="xs" color={textMuted}>
              {opportunity.probability}%
            </Text>
          </HStack>

          {opportunity.expectedCloseDate && (
            <HStack fontSize="xs" color={textMuted}>
              <FiCalendar />
              <Text>
                {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
              </Text>
            </HStack>
          )}

          <VStack spacing={1} align="stretch">
            <HStack justify="space-between" fontSize="xs">
              <Text color={textMuted}>Tasks</Text>
              <Text color={textPrimary} fontWeight="medium">
                {opportunity.completedTaskCount || 0} of {opportunity.taskCount || 0}
              </Text>
            </HStack>
            {opportunity.taskCount > 0 && (
              <Progress
                value={(opportunity.completedTaskCount / opportunity.taskCount) * 100}
                size="xs"
                colorScheme="green"
              />
            )}
          </VStack>

          <HStack fontSize="xs" color="gray.500" justify="space-between">
            <HStack spacing={2}>
              {opportunity.clientEmail && (
                <HStack spacing={1}>
                  <FiMail />
                  <Text>{opportunity.clientEmail}</Text>
                </HStack>
              )}
            </HStack>
            <HStack>
              {opportunity.clientPhone && (
                <Tooltip label={opportunity.clientPhone}>
                  <span><FiPhone /></span>
                </Tooltip>
              )}
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const OpportunitiesList: React.FC = () => {
  usePageTitle("Opportunities");

  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { colorMode } = useColorMode();

  // Queries
  const { data: opportunitiesData, loading: loadingOpportunities, refetch } = useQuery(GET_OPPORTUNITIES, {
    variables: { status: filterStatus === 'ALL' ? undefined : filterStatus }
  });

  const { data: stagesData, loading: loadingStages } = useQuery(GET_OPPORTUNITY_STAGES);
  const { data: statsData } = useQuery(GET_OPPORTUNITY_STATS);

  // Mutations
  const [moveStage] = useMutation(MOVE_OPPORTUNITY_STAGE);
  const [deleteOpportunity] = useMutation(DELETE_OPPORTUNITY);

  const opportunities = opportunitiesData?.opportunities || [];
  const stages = stagesData?.opportunityStages || [];

  // Group opportunities by stage
  const opportunitiesByStage = stages.reduce((acc: any, stage: Stage) => {
    acc[stage.code] = opportunities.filter((opp: Opportunity) => opp.stage === stage.code);
    return acc;
  }, {});

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    try {
      await moveStage({
        variables: {
          id: draggableId,
          newStage: newStage
        }
      });

      toast({
        title: 'Opportunity moved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to move opportunity',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await deleteOpportunity({ variables: { id } });
      toast({
        title: 'Opportunity deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to delete opportunity',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Brand styling variables
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const buttonBg = getColor("button.bg", colorMode);
  const buttonHoverBg = getColor("button.hoverBg", colorMode);

  if (loadingOpportunities || loadingStages) {
    return (
      <Box>
        <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />
        <Box maxW="100%" px={{ base: 4, md: 8 }} py={8} flex="1">
          <Center>
            <Spinner size="xl" />
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={opportunitiesModuleConfig} />

      <Box maxW="100%" px={{ base: 4, md: 8 }} py={8} flex="1">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <Heading size={{ base: 'md', md: 'lg' }} color={textPrimary}>Opportunities Pipeline</Heading>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                leftIcon={<FiTrendingUp />}
                variant="outline"
                size={{ base: 'sm', md: 'md' }}
                borderColor={colorMode === 'light' ? 'gray.300' : 'rgba(255, 255, 255, 0.3)'}
                color={textPrimary}
                _hover={{ bg: colorMode === 'light' ? 'gray.50' : cardGradientBg }}
                onClick={() => navigate('/opportunities/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                leftIcon={<FiPlus />}
                size={{ base: 'sm', md: 'md' }}
                bg={buttonBg}
                color="white"
                _hover={{ bg: buttonHoverBg }}
                onClick={() => navigate('/opportunities/new')}
              >
                New Opportunity
              </Button>
            </HStack>
          </VStack>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Active Opportunities</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">{statsData?.activeCount || 0}</StatNumber>
                  <StatHelpText color={textMuted}>
                    ${(statsData?.totalValue || 0).toLocaleString()} total value
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Won</StatLabel>
                  <StatNumber color="#48BB78" fontSize="2xl">{statsData?.wonCount || 0}</StatNumber>
                  <StatHelpText color={textMuted}>
                    ${(statsData?.wonValue || 0).toLocaleString()} revenue
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Lost</StatLabel>
                  <StatNumber color="#F56565" fontSize="2xl">{statsData?.lostCount || 0}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Win Rate</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    {statsData?.wonCount && statsData?.lostCount
                      ? Math.round((statsData.wonCount / (statsData.wonCount + statsData.lostCount)) * 100)
                      : 0}%
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
              borderRadius="lg"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Tasks</StatLabel>
                  <StatNumber color={textPrimary} fontSize="2xl">
                    {(() => {
                      const totalCompleted = opportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.completedTaskCount || 0), 0);
                      const totalTasks = opportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.taskCount || 0), 0);
                      return `${totalCompleted}/${totalTasks}`;
                    })()}
                  </StatNumber>
                  <StatHelpText color={textMuted}>
                    {(() => {
                      const totalCompleted = opportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.completedTaskCount || 0), 0);
                      const totalTasks = opportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.taskCount || 0), 0);
                      const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
                      return `${percentage}% complete`;
                    })()}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color={textMuted} />
              </InputLeftElement>
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={colorMode === 'light' ? 'white' : cardGradientBg}
                color={textPrimary}
                borderColor={cardBorder}
                _placeholder={{ color: textMuted }}
                _hover={{ borderColor: textSecondary }}
                _focus={{
                  borderColor: getColor("primary", colorMode),
                  boxShadow: `0 0 0 1px ${getColor("primary", colorMode)}`,
                }}
              />
            </InputGroup>

            <Select
              maxW="200px"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              bg={colorMode === 'light' ? 'white' : cardGradientBg}
              color={textPrimary}
              borderColor={cardBorder}
              _hover={{ borderColor: textSecondary }}
              _focus={{
                borderColor: getColor("primary", colorMode),
                boxShadow: `0 0 0 1px ${getColor("primary", colorMode)}`,
              }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Filter</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="ON_HOLD">On Hold</option>
            </Select>
          </HStack>

          {/* Kanban Board */}
          <Box overflowX="auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <HStack align="stretch" spacing={4} minW={stages.length * 300}>
                {stages.map((stage: Stage) => (
                  <Box key={stage.code} minW="300px" flex="1">
                    <VStack align="stretch" spacing={2}>
                      <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                      >
                        <CardHeader py={3}>
                          <HStack justify="space-between">
                            <HStack>
                              {stage.icon && <Text>{stage.icon}</Text>}
                              <Text fontWeight="bold" color={textPrimary}>{stage.name}</Text>
                            </HStack>
                            <Badge colorScheme="blue" bg={colorMode === 'light' ? 'blue.100' : 'rgba(56, 178, 255, 0.2)'} color={colorMode === 'light' ? 'blue.800' : 'white'}>
                              {opportunitiesByStage[stage.code]?.length || 0}
                            </Badge>
                          </HStack>
                          <Box
                            h="2px"
                            bg={stage.color}
                            mt={2}
                            borderRadius="full"
                          />
                        </CardHeader>
                      </Card>

                      <Droppable droppableId={stage.code}>
                        {(provided: any, snapshot: any) => (
                          <VStack
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            align="stretch"
                            spacing={0}
                            minH="400px"
                            bg={snapshot.isDraggingOver ? 'blue.50' : 'transparent'}
                            p={2}
                            borderRadius="md"
                            transition="background 0.2s"
                          >
                            {opportunitiesByStage[stage.code]?.map((opp: Opportunity, index: number) => (
                              <Draggable key={opp.id} draggableId={opp.id} index={index}>
                                {(provided: any, snapshot: any) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    opacity={snapshot.isDragging ? 0.5 : 1}
                                  >
                                    <OpportunityCard
                                      opportunity={opp}
                                      onEdit={() => navigate(`/opportunities/${opp.id}`)}
                                      onDelete={() => handleDelete(opp.id)}
                                    />
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </VStack>
                        )}
                      </Droppable>
                    </VStack>
                  </Box>
                ))}
              </HStack>
            </DragDropContext>
          </Box>
        </VStack>
      </Box>

      <FooterWithFourColumns />
    </Box>
  );
};

export default OpportunitiesList;