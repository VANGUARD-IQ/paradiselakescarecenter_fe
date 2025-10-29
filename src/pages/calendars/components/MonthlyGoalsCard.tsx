import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Progress,
  SimpleGrid,
  Divider,
  Checkbox,
  Icon,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { FiTarget, FiUser } from 'react-icons/fi';
import { getMonthYearDisplay } from '../utils/timezoneHelpers';

interface MonthlyGoalsCardProps {
  currentDate: Date;
  localGoals: any[] | null;
  clientsData: any;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  setIsGoalsModalOpen: (open: boolean) => void;
  handleToggleCheckpoint: (goalId: string, checkpointId: string, completed: boolean) => void;
  cardGradientBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
}

/**
 * Component to display monthly goals with progress tracking
 *
 * Features:
 * - Month progress calendar view
 * - Goal cards with checkpoints/tasks
 * - Dependency tracking between goals
 * - Client assignment display
 * - Progress percentage indicators
 * - Interactive checkbox task completion
 */
export const MonthlyGoalsCard: React.FC<MonthlyGoalsCardProps> = ({
  currentDate,
  localGoals,
  clientsData,
  selectedGoalId,
  setSelectedGoalId,
  setIsGoalsModalOpen,
  handleToggleCheckpoint,
  cardGradientBg,
  cardBorder,
  textPrimary,
  textSecondary,
  primaryColor,
}) => {
  return (
    <Box
      position="sticky"
      top="0"
      zIndex={10}
      mb={4}
    >
      <Card
        bg={cardGradientBg}
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        border="1px solid"
        borderColor={cardBorder}
      >
        <CardHeader pb={2}>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <HStack flex="1" minW="200px">
                <Icon as={StarIcon} color={primaryColor} boxSize={{ base: 4, md: 5 }} />
                <Heading size={{ base: "sm", md: "md" }} color={textPrimary}>
                  {getMonthYearDisplay(currentDate)} Goals
                </Heading>
              </HStack>
              <Button
                size={{ base: "xs", md: "sm" }}
                colorScheme="blue"
                onClick={() => setIsGoalsModalOpen(true)}
              >
                Edit Goals
              </Button>
            </Flex>

            {/* Month Progress Indicator */}
            <Box
              p={3}
              bg="rgba(255, 255, 255, 0.02)"
              borderRadius="md"
              border="1px solid"
              borderColor={cardBorder}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color={textSecondary} fontWeight="semibold">
                  MONTH PROGRESS
                </Text>
                <Text fontSize="xs" color={primaryColor} fontWeight="bold">
                  Day {new Date().getDate()} of {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}
                </Text>
              </HStack>
              <SimpleGrid columns={{ base: 10, sm: 15, md: 31 }} spacing={1} width="100%">
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                  const dayNum = i + 1;
                  const today = new Date().getDate();
                  const isPast = dayNum < today;
                  const isToday = dayNum === today;

                  return (
                    <Flex
                      key={dayNum}
                      position="relative"
                      minW="25px"
                      h="25px"
                      alignItems="center"
                      justifyContent="center"
                      fontSize={{ base: "10px", md: "11px" }}
                      fontWeight={isToday ? "bold" : "normal"}
                      color={isPast ? textSecondary : (isToday ? primaryColor : textPrimary)}
                      bg={isToday ? "rgba(59, 130, 246, 0.2)" : (isPast ? "rgba(0, 0, 0, 0.2)" : "transparent")}
                      borderRadius="sm"
                      border={isToday ? "1px solid" : "none"}
                      borderColor={primaryColor}
                      opacity={isPast && !isToday ? 0.5 : 1}
                      transition="all 0.2s"
                      overflow="hidden"
                      _hover={!isPast ? {
                        bg: "rgba(59, 130, 246, 0.1)",
                        transform: "scale(1.1)"
                      } : {}}
                    >
                      {isPast && !isToday && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="-50%"
                          right="-50%"
                          height="1px"
                          bg={textSecondary}
                          transform="rotate(-45deg)"
                        />
                      )}
                      {dayNum}
                    </Flex>
                  );
                })}
              </SimpleGrid>
              <Progress
                value={(new Date().getDate() / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) * 100}
                size="xs"
                colorScheme="blue"
                mt={2}
                borderRadius="full"
              />
            </Box>

            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
              {localGoals && localGoals.length > 0 && (
                <Badge colorScheme="green" fontSize={{ base: "xs", md: "sm" }}>
                  {localGoals.reduce((acc: number, goal: any) =>
                    acc + goal.checkpoints.filter((t: any) => t.completed).length, 0
                  )} / {localGoals.reduce((acc: number, goal: any) =>
                    acc + goal.checkpoints.length, 0
                  )} tasks
                </Badge>
              )}
              <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary}>
                Progress: {(localGoals && localGoals.length > 0)
                  ? Math.round(localGoals.reduce((acc: number, g: any) => acc + g.progressPercentage, 0) / localGoals.length)
                  : 0}%
              </Text>
            </Flex>
          </VStack>
        </CardHeader>
        <CardBody pt={2}>
          {!localGoals || localGoals.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color={textSecondary} mb={4}>No goals set for this month</Text>
              <Button
                colorScheme="blue"
                onClick={() => setIsGoalsModalOpen(true)}
              >
                Add Your First Goal
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {localGoals.map((goal: any) => {
                // Find if this goal depends on another
                const dependsOn = goal.parentGoalId ? localGoals.find((g: any) => g.id === goal.parentGoalId) : null;
                const isBlocked = dependsOn && dependsOn.progressPercentage < 100;

                // Find assigned client
                const assignedClient = goal.assignedTo && clientsData?.clients ?
                  clientsData.clients.find((c: any) => c.id === goal.assignedTo) : null;

                return (
                  <Box
                    key={goal.id}
                    p={4}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={isBlocked ? 'orange.500' : cardBorder}
                    position="relative"
                    opacity={isBlocked ? 0.7 : 1}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setIsGoalsModalOpen(true);
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.05)",
                      transform: !isBlocked ? "translateY(-2px)" : "none",
                      boxShadow: !isBlocked ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                    }}
                  >
                    {/* Dependency indicator */}
                    {dependsOn && (
                      <Box
                        position="absolute"
                        top="-10px"
                        left="10px"
                        bg={isBlocked ? "orange.500" : "green.500"}
                        color="white"
                        fontSize="10px"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="bold"
                        zIndex={1}
                      >
                        {isBlocked ? `Blocked by: ${dependsOn.title.slice(0, 20)}...` : `✓ Dependency met`}
                      </Box>
                    )}

                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon
                            as={goal.icon || FiTarget}
                            color={isBlocked ? 'orange.400' : (goal.color || 'blue.400')}
                            boxSize={5}
                          />
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={isBlocked ? 'orange.400' : (goal.color || 'blue.400')}
                            textTransform="uppercase"
                          >
                            {goal.category}
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={isBlocked ? 'orange' : (goal.progressPercentage >= 70 ? 'green' : goal.progressPercentage >= 40 ? 'yellow' : 'red')}
                          fontSize="xs"
                        >
                          {isBlocked ? '🔒' : ''} {goal.progressPercentage}%
                        </Badge>
                      </HStack>

                      <VStack align="stretch" spacing={1}>
                        <Text color={textPrimary} fontWeight="semibold" fontSize="sm">
                          {goal.title}
                        </Text>
                        {assignedClient && (
                          <HStack spacing={1}>
                            <Icon as={FiUser} color={textSecondary} boxSize={3} />
                            <Text fontSize="xs" color={textSecondary}>
                              {assignedClient.fName} {assignedClient.lName}
                            </Text>
                          </HStack>
                        )}
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={textSecondary}>
                            Current: {goal.currentValue || '0'}
                          </Text>
                          <Text fontSize="xs" color={primaryColor} fontWeight="bold">
                            Target: {goal.targetValue || '1'}
                          </Text>
                        </HStack>
                      </VStack>

                      <Progress
                        value={goal.progressPercentage || 0}
                        size="sm"
                        colorScheme={goal.color ? goal.color.replace('#', '').toLowerCase() : 'blue'}
                        borderRadius="full"
                        bg="rgba(255, 255, 255, 0.1)"
                        hasStripe
                        isAnimated
                      />

                      <Divider borderColor={cardBorder} />

                      <VStack align="stretch" spacing={1}>
                        {(goal.checkpoints || goal.tasks || []).slice(0, 3).map((task: any) => (
                          <HStack key={task.id} spacing={2} align="flex-start">
                            <Checkbox
                              isChecked={task.completed}
                              onChange={(e) => {
                                if (goal.id && task.id) {
                                  handleToggleCheckpoint(goal.id, task.id, e.target.checked);
                                }
                              }}
                              size="sm"
                              colorScheme={goal.color ? goal.color.replace('#', '').toLowerCase() : 'blue'}
                              mt={0.5}
                            />
                            <Text
                              fontSize="xs"
                              color={task.completed ? textSecondary : textPrimary}
                              textDecoration={task.completed ? 'line-through' : 'none'}
                              flex="1"
                              wordBreak="break-word"
                            >
                              {task.title || task.text || 'Untitled task'}
                            </Text>
                          </HStack>
                        ))}
                        {(goal.checkpoints?.length || goal.tasks?.length || 0) > 3 && (
                          <Text fontSize="xs" color={textSecondary} fontStyle="italic">
                            +{(goal.checkpoints?.length || goal.tasks?.length || 0) - 3} more tasks...
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};
