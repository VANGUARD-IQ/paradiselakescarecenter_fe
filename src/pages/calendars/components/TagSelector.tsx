import React, { useState, useEffect } from 'react';
import {
  Box,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  Grid,
  Text,
  useToast,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { FaTag, FaPlus, FaCheck } from 'react-icons/fa';
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
    }
  }
`;

const SUGGEST_TAG_COLORS = gql`
  query SuggestTagColors {
    suggestTagColors
  }
`;

interface TagSelectorProps {
  calendarId: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  calendarId,
  selectedTags,
  onTagsChange,
  placeholder = "Add tags...",
}) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#BAE1FF');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagColors, setTagColors] = useState<Record<string, string>>({});

  // Fetch existing tags
  const { data: tagsData, refetch: refetchTags } = useQuery(GET_CALENDAR_TAGS, {
    variables: { calendarId },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || ''
      }
    }
  });

  // Fetch suggested colors
  const { data: colorsData } = useQuery(SUGGEST_TAG_COLORS);

  // Mutation for creating/updating tags
  const [upsertTag] = useMutation(UPSERT_CALENDAR_TAG);

  // Build tag color map
  useEffect(() => {
    if (tagsData?.calendarTags) {
      const colorMap: Record<string, string> = {};
      tagsData.calendarTags.forEach((tag: any) => {
        colorMap[tag.name] = tag.color;
      });
      setTagColors(colorMap);
    }
  }, [tagsData]);

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      // Create the tag in the backend
      await upsertTag({
        variables: {
          calendarId,
          input: {
            name: newTagName.trim(),
            color: selectedColor,
          }
        },
        context: {
          headers: {
            'x-tenant-id': localStorage.getItem('tenantId') || ''
          }
        }
      });

      // Add to selected tags
      if (!selectedTags.includes(newTagName.trim())) {
        onTagsChange([...selectedTags, newTagName.trim()]);
      }

      // Reset form and close popover
      setNewTagName('');
      setIsAddingTag(false);
      
      // Refetch tags to update the list
      refetchTags();
      
      toast({
        title: 'Tag created',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error creating tag',
        description: 'Failed to create the tag',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Handle selecting an existing tag
  const handleSelectTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  // Get suggested colors
  const suggestedColors = colorsData?.suggestTagColors || [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
    '#E0BBE4', '#C7CEEA', '#FFDAC1', '#B5EAD7', '#FFE5B4'
  ];

  // Get existing tags
  const existingTags = tagsData?.calendarTags || [];
  const availableTags = existingTags.filter((tag: any) => 
    !selectedTags.includes(tag.name)
  );

  return (
    <VStack align="stretch" spacing={3}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <Wrap spacing={2}>
          {selectedTags.map((tag) => (
            <WrapItem key={tag}>
              <Tag
                size="md"
                borderRadius="full"
                variant="solid"
                backgroundColor={tagColors[tag] || '#E2E8F0'}
                color={tagColors[tag] ? 'gray.800' : 'white'}
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {/* Add Tag Input */}
      <HStack>
        <Popover 
          isOpen={isAddingTag} 
          onClose={() => {
            setIsAddingTag(false);
            setNewTagName('');
          }}
          closeOnBlur={false}
          placement="bottom-start"
          returnFocusOnClose={false}
        >
          <PopoverTrigger>
            <InputGroup size="sm">
              <InputLeftElement>
                <FaTag color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={placeholder}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onClick={() => setIsAddingTag(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagName.trim()) {
                    handleAddTag();
                  } else if (e.key === 'Escape') {
                    setIsAddingTag(false);
                    setNewTagName('');
                  }
                }}
              />
            </InputGroup>
          </PopoverTrigger>
          <PopoverContent width="300px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              {newTagName ? 'Create New Tag' : 'Select or Create Tag'}
            </PopoverHeader>
            <PopoverBody>
              <VStack align="stretch" spacing={3}>
                {/* Existing tags */}
                {availableTags.length > 0 && !newTagName && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Existing Tags
                    </Text>
                    <Wrap spacing={2}>
                      {availableTags.map((tag: any) => (
                        <WrapItem key={tag.id}>
                          <Tag
                            size="sm"
                            borderRadius="full"
                            variant="solid"
                            backgroundColor={tag.color}
                            color="gray.800"
                            cursor="pointer"
                            onClick={() => {
                              handleSelectTag(tag.name);
                              setIsAddingTag(false);
                            }}
                            _hover={{ opacity: 0.8 }}
                          >
                            <TagLabel>{tag.name}</TagLabel>
                            {tag.usageCount > 0 && (
                              <Text fontSize="xs" ml={1} opacity={0.7}>
                                ({tag.usageCount})
                              </Text>
                            )}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* Color picker for new tag */}
                {newTagName && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Choose Color
                    </Text>
                    <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                      {suggestedColors.slice(0, 10).map((color: string) => (
                        <Tooltip key={color} label={color}>
                          <Box
                            w="32px"
                            h="32px"
                            borderRadius="md"
                            backgroundColor={color}
                            cursor="pointer"
                            border={selectedColor === color ? '2px solid' : '1px solid'}
                            borderColor={selectedColor === color ? 'blue.500' : 'gray.300'}
                            onClick={() => setSelectedColor(color)}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {selectedColor === color && (
                              <FaCheck size={12} color="gray.700" />
                            )}
                          </Box>
                        </Tooltip>
                      ))}
                    </Grid>
                    
                    <Button
                      size="sm"
                      colorScheme="blue"
                      width="full"
                      mt={3}
                      onClick={handleAddTag}
                      leftIcon={<FaPlus />}
                    >
                      Create Tag
                    </Button>
                  </Box>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
    </VStack>
  );
};