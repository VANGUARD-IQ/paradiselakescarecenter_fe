import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Grid,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Badge,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPalette, FaCheck, FaTimes } from 'react-icons/fa';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL queries and mutations
const GET_CALENDAR_TAGS = gql`
  query GetCalendarTags($calendarId: String!) {
    calendarTags(calendarId: $calendarId) {
      id
      name
      color
      description
      usageCount
    }
  }
`;

const UPSERT_CALENDAR_TAG = gql`
  mutation UpsertCalendarTag($calendarId: String!, $input: CalendarTagInput!) {
    upsertCalendarTag(calendarId: $calendarId, input: $input) {
      id
      name
      color
      description
      usageCount
    }
  }
`;

const DELETE_CALENDAR_TAG = gql`
  mutation DeleteCalendarTag($calendarId: String!, $name: String!) {
    deleteCalendarTag(calendarId: $calendarId, name: $name)
  }
`;

const SUGGEST_TAG_COLORS = gql`
  query SuggestTagColors {
    suggestTagColors
  }
`;

interface TagManagerProps {
  calendarId: string;
}

export const TagManager: React.FC<TagManagerProps> = ({ calendarId }) => {
  const { colorMode } = useColorMode();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [deleteTagName, setDeleteTagName] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Fetch calendar tags
  const { data: tagsData, refetch: refetchTags } = useQuery(GET_CALENDAR_TAGS, {
    variables: { calendarId },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch suggested colors
  const { data: colorsData } = useQuery(SUGGEST_TAG_COLORS, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Mutations
  const [upsertTag] = useMutation(UPSERT_CALENDAR_TAG, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    },
    onCompleted: () => {
      refetchTags();
      toast({
        title: 'Tag updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating tag',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const [deleteTag] = useMutation(DELETE_CALENDAR_TAG, {
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    },
    onCompleted: () => {
      refetchTags();
      toast({
        title: 'Tag deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting tag',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const calendarTags = tagsData?.calendarTags || [];
  const suggestedColors = colorsData?.suggestTagColors || [];

  const startEditing = (tag: any) => {
    setEditingTag(tag.id);
    setEditedName(tag.name);
    setEditedColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditedName('');
    setEditedColor('');
  };

  const saveEdit = async (originalName: string) => {
    if (!editedName.trim()) {
      toast({
        title: 'Tag name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    await upsertTag({
      variables: {
        calendarId,
        input: {
          name: editedName.trim(),
          color: editedColor,
          description: null
        }
      }
    });

    // If the name changed, we need to update any existing events
    if (originalName !== editedName.trim()) {
      // The backend will handle updating events with the old tag name
    }

    cancelEditing();
  };

  const handleDelete = async () => {
    if (deleteTagName) {
      await deleteTag({
        variables: {
          calendarId,
          name: deleteTagName
        }
      });
      setDeleteTagName(null);
    }
  };

  if (calendarTags.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text fontSize="sm" color="gray.400">
          No tags created yet. Tags will appear here when you add them to events.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch" w="full">
      <Text fontSize="sm" fontWeight="bold" mb={2} color="white">
        Manage Tags ({calendarTags.length})
      </Text>
      
      {calendarTags.map((tag: any) => (
        <Box key={tag.id}>
          {editingTag === tag.id ? (
            // Edit mode
            <HStack spacing={2} p={3} bg="rgba(255, 255, 255, 0.1)" borderRadius="md">
              <Input
                size="sm"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Tag name"
                maxW="150px"
                bg="rgba(255, 255, 255, 0.9)"
                color="black"
              />
              
              <Popover placement="bottom">
                <PopoverTrigger>
                  <Button
                    size="sm"
                    leftIcon={<FaPalette />}
                    style={{ backgroundColor: editedColor }}
                    _hover={{ opacity: 0.8 }}
                  >
                    Color
                  </Button>
                </PopoverTrigger>
                <PopoverContent width="280px">
                  <PopoverBody>
                    <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                      {suggestedColors.map((color: string) => (
                        <Box
                          key={color}
                          w="40px"
                          h="40px"
                          bg={color}
                          borderRadius="md"
                          cursor="pointer"
                          border={editedColor === color ? "2px solid" : "none"}
                          borderColor="blue.500"
                          onClick={() => setEditedColor(color)}
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.2s"
                        />
                      ))}
                    </Grid>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              <IconButton
                aria-label="Save"
                icon={<FaCheck />}
                size="sm"
                colorScheme="green"
                onClick={() => saveEdit(tag.name)}
              />
              
              <IconButton
                aria-label="Cancel"
                icon={<FaTimes />}
                size="sm"
                colorScheme="gray"
                onClick={cancelEditing}
              />
            </HStack>
          ) : (
            // Display mode
            <HStack spacing={2} p={2} _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }} borderRadius="md" transition="all 0.2s">
              <Box
                w="24px"
                h="24px"
                bg={tag.color}
                borderRadius="md"
                flexShrink={0}
              />
              
              <Text fontSize="sm" fontWeight="medium" flex={1} color="white">
                {tag.name}
              </Text>
              
              {tag.usageCount > 0 && (
                <Badge 
                  bg="rgba(59, 130, 246, 0.2)" 
                  color="white" 
                  fontSize="xs"
                  px={2}
                  borderRadius="full"
                >
                  {tag.usageCount} events
                </Badge>
              )}
              
              <Tooltip label="Edit tag">
                <IconButton
                  aria-label="Edit"
                  icon={<FaEdit />}
                  size="xs"
                  variant="solid"
                  bg="rgba(59, 130, 246, 0.2)"
                  color="white"
                  _hover={{ bg: 'rgba(59, 130, 246, 0.4)' }}
                  onClick={() => startEditing(tag)}
                />
              </Tooltip>
              
              <Tooltip label={tag.usageCount > 0 ? "Tag is in use" : "Delete tag"}>
                <IconButton
                  aria-label="Delete"
                  icon={<FaTrash />}
                  size="xs"
                  variant="solid"
                  bg={tag.usageCount > 0 ? 'rgba(100, 100, 100, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                  color={tag.usageCount > 0 ? 'gray.500' : 'red.300'}
                  _hover={tag.usageCount > 0 ? {} : { bg: 'rgba(239, 68, 68, 0.4)' }}
                  onClick={() => setDeleteTagName(tag.name)}
                  isDisabled={tag.usageCount > 0}
                  cursor={tag.usageCount > 0 ? 'not-allowed' : 'pointer'}
                />
              </Tooltip>
            </HStack>
          )}
        </Box>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteTagName !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteTagName(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Tag
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the tag "{deleteTagName}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteTagName(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};