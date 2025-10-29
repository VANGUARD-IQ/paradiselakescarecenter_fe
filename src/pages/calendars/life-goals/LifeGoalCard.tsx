import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  IconButton,
  Tooltip,
  useColorMode,
  Progress,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, InfoIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiDollarSign, FiTarget } from 'react-icons/fi';
import { getColor } from '../../../brandConfig';
import type { ZoomLevel } from './LifeGoalsTimeline';

interface LifeGoalCardProps {
  goal: any;
  birthDate: Date;
  zoomConfig: any;
  onEdit: (goal: any) => void;
  onResize?: (goal: any, newStartDate: Date, newEndDate: Date) => void;
  onDelete?: (goal: any) => void;
}

const GOAL_TYPE_COLORS: Record<string, string> = {
  CAREER: '#3B82F6',
  FINANCIAL: '#10B981',
  HEALTH: '#EF4444',
  RELATIONSHIP: '#EC4899',
  LEARNING: '#8B5CF6',
  LEGACY: '#F59E0B',
};

export const LifeGoalCard: React.FC<LifeGoalCardProps> = ({
  goal,
  birthDate,
  zoomConfig,
  onEdit,
  onResize,
  onDelete,
}) => {
  const { colorMode } = useColorMode();
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Reset temp dates when goal changes
  useEffect(() => {
    setTempStartDate(null);
    setTempEndDate(null);
  }, [goal.id]);

  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  // Use temp dates during resize, otherwise use goal dates
  const startDate = tempStartDate || new Date(goal.startTime);
  const endDate = tempEndDate || new Date(goal.endTime);

  // Calculate position and height
  const daysSinceBirth = Math.floor((startDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const topPosition = daysSinceBirth * zoomConfig.pixelsPerDay;
  const height = Math.max(durationDays * zoomConfig.pixelsPerDay, 30); // Min height for visibility

  const goalType = goal.metadata?.['X-LIFE-GOAL-TYPE'] || 'CAREER';
  const goalColor = GOAL_TYPE_COLORS[goalType] || '#3B82F6';
  const financialTarget = goal.metadata?.['X-FINANCIAL-TARGET'] || 0;
  const completionPercentage = goal.metadata?.['X-COMPLETION-PERCENTAGE'] || 0;

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();

    console.log('🎯 Starting resize from', edge);
    setIsResizing(edge);

    const startY = e.clientY;
    const originalStart = new Date(goal.startTime);
    const originalEnd = new Date(goal.endTime);

    // Store the current resizing state in a ref to access in handleMouseUp
    let currentTempStartDate: Date | null = null;
    let currentTempEndDate: Date | null = null;

    // Add global mouse event listeners
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      const deltaY = moveEvent.clientY - startY;
      const daysDelta = Math.round(deltaY / zoomConfig.pixelsPerDay);

      console.log('📏 Resize delta:', daysDelta, 'days');

      if (edge === 'top') {
        // Resizing from top changes start date
        const newStartDate = new Date(originalStart);
        newStartDate.setDate(originalStart.getDate() + daysDelta);

        // Don't allow start date to go past end date
        if (newStartDate < originalEnd) {
          currentTempStartDate = newStartDate;
          currentTempEndDate = null;
          setTempStartDate(newStartDate);
          setTempEndDate(null);
        }
      } else {
        // Resizing from bottom changes end date
        const newEndDate = new Date(originalEnd);
        newEndDate.setDate(originalEnd.getDate() + daysDelta);

        // Don't allow end date to go before start date
        if (newEndDate > originalStart) {
          currentTempEndDate = newEndDate;
          currentTempStartDate = null;
          setTempEndDate(newEndDate);
          setTempStartDate(null);
        }
      }
    };

    const handleMouseUp = () => {
      console.log('🛑 Ending resize');
      console.log('Current temp dates:', { currentTempStartDate, currentTempEndDate });

      // Use the current temp values from the closure
      const finalStart = currentTempStartDate || originalStart;
      const finalEnd = currentTempEndDate || originalEnd;

      // Check if dates actually changed
      const datesChanged =
        finalStart.getTime() !== originalStart.getTime() ||
        finalEnd.getTime() !== originalEnd.getTime();

      if (datesChanged && onResize) {
        console.log('💾 Calling onResize with changed dates:', {
          originalStart: originalStart.toISOString(),
          originalEnd: originalEnd.toISOString(),
          finalStart: finalStart.toISOString(),
          finalEnd: finalEnd.toISOString()
        });
        onResize(goal, finalStart, finalEnd);
      } else {
        console.log('⏭️ No date changes, skipping resize');
      }

      // Reset state
      setIsResizing(null);
      setTempStartDate(null);
      setTempEndDate(null);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Determine if we should show details based on zoom level
  const showDetails = zoomConfig.pixelsPerDay >= 0.5;
  const showFullDetails = zoomConfig.pixelsPerDay >= 2;

  return (
    <Box
      position="absolute"
      top={`${topPosition}px`}
      left="10px"
      right="10px"
      minH={`${height}px`}
      bg={`${goalColor}15`}
      borderLeft="4px solid"
      borderLeftColor={goalColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={cardBorder}
      cursor={isResizing ? 'ns-resize' : 'pointer'}
      transition={isResizing ? 'none' : 'all 0.2s'}
      _hover={isResizing ? {} : {
        transform: 'translateX(5px)',
        boxShadow: 'lg',
        bg: `${goalColor}25`,
      }}
      onClick={() => !isResizing && onEdit(goal)}
    >
      {/* Top resize handle */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="10px"
        cursor="ns-resize"
        bg={isResizing === 'top' ? `${goalColor}50` : 'transparent'}
        _hover={{ bg: `${goalColor}50` }}
        onMouseDown={(e) => handleResizeStart(e, 'top')}
        onClick={(e) => e.stopPropagation()}
        zIndex={10}
      />

      {/* Bottom resize handle */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        h="10px"
        cursor="ns-resize"
        bg={isResizing === 'bottom' ? `${goalColor}50` : 'transparent'}
        _hover={{ bg: `${goalColor}50` }}
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        onClick={(e) => e.stopPropagation()}
        zIndex={10}
      />

      {/* Content */}
      <Box p={showFullDetails ? 3 : 1}>
      {showFullDetails ? (
        <VStack align="stretch" spacing={2} h="100%">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <FiTarget color={goalColor} />
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={textPrimary}
                noOfLines={2}
              >
                {goal.title}
              </Text>
            </HStack>
            <HStack spacing={0}>
              <IconButton
                aria-label="Edit goal"
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(goal);
                }}
              />
              {onDelete && (
                <IconButton
                  aria-label="Delete goal"
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOpen();
                  }}
                />
              )}
            </HStack>
          </HStack>

          {goal.description && (
            <Text fontSize="xs" color={textSecondary} noOfLines={3}>
              {goal.description}
            </Text>
          )}

          {financialTarget > 0 && (
            <HStack spacing={2} fontSize="xs">
              <FiDollarSign color={goalColor} />
              <Text color={textSecondary}>
                ${financialTarget.toLocaleString()} target
              </Text>
            </HStack>
          )}

          {completionPercentage > 0 && (
            <Box>
              <Progress
                value={completionPercentage}
                size="sm"
                colorScheme="green"
                borderRadius="full"
              />
              <Text fontSize="xs" color={textSecondary} mt={1}>
                {completionPercentage}% complete
              </Text>
            </Box>
          )}

          <HStack fontSize="xs" color={textSecondary} mt="auto">
            <Text>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>
      ) : showDetails ? (
        <HStack justify="space-between" h="100%">
          <HStack spacing={1} flex="1" minW="0">
            <FiTarget color={goalColor} size={12} />
            <Text fontSize="xs" color={textPrimary} noOfLines={1} fontWeight="medium">
              {goal.title}
            </Text>
          </HStack>
          {financialTarget > 0 && (
            <Tooltip label={`$${financialTarget.toLocaleString()} target`}>
              <Box>
                <FiDollarSign color={goalColor} size={12} />
              </Box>
            </Tooltip>
          )}
        </HStack>
      ) : (
        <HStack h="100%" px={1} align="center">
          <Text
            fontSize="xs"
            color={textPrimary}
            noOfLines={1}
            fontWeight="semibold"
            textShadow={colorMode === 'light' ?
              '0 1px 2px rgba(255, 255, 255, 0.8)' :
              '0 1px 2px rgba(0, 0, 0, 0.8)'
            }
          >
            {goal.title}
          </Text>
        </HStack>
      )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Life Goal
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  onDeleteClose();
                  if (onDelete) {
                    onDelete(goal);
                  }
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};