import React, { useState, useMemo } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Checkbox,
  CheckboxGroup,
  Text,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery, gql } from '@apollo/client';
import { getColor, getComponent } from '../../../brandConfig';
import { Client } from "../../../generated/graphql";

const SEARCH_CLIENTS = gql`
  query SearchClients($search: String, $tags: [String!]) {
    searchClients(search: $search, tags: $tags) {
      id
      fName
      lName
      email
      phoneNumber
      tags
    }
  }
`;

const GET_ALL_TAGS = gql`
  query GetAllClientTags {
    allClientTags
  }
`;


interface ClientSearchSelectorProps {
  selectedClients: string[];
  onSelectionChange: (clients: string[]) => void;
  allowMultiple?: boolean;
  placeholder?: string;
}

export const ClientSearchSelector: React.FC<ClientSearchSelectorProps> = ({
  selectedClients,
  onSelectionChange,
  allowMultiple = true,
  placeholder = "Search clients by name, email, or phone..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([0, 1]);
  const toast = useToast();
  
  // Query all available tags
  const { data: tagsData } = useQuery(GET_ALL_TAGS);
  
  // Search clients based on search term and tags
  const { loading, data, error } = useQuery(SEARCH_CLIENTS, {
    variables: {
      search: searchTerm || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    },
    skip: !searchTerm && selectedTags.length === 0,
  });
  
  const textSecondary = getColor("text.secondary");
  const textMuted = getColor("text.muted");
  const borderColor = getColor("border.light");
  
  const handleClientToggle = (clientId: string) => {
    if (allowMultiple) {
      if (selectedClients.includes(clientId)) {
        onSelectionChange(selectedClients.filter(id => id !== clientId));
      } else {
        onSelectionChange([...selectedClients, clientId]);
      }
    } else {
      onSelectionChange([clientId]);
    }
  };
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleSelectAll = () => {
    if (data?.searchClients) {
      const allIds = data.searchClients.map((client: Client) => client.id);
      onSelectionChange(allIds);
    }
  };
  
  const handleClearSelection = () => {
    onSelectionChange([]);
  };
  
  const selectedCount = selectedClients.length;
  const totalCount = data?.searchClients?.length || 0;
  
  return (
    <VStack spacing={4} align="stretch">
      <Accordion allowMultiple index={expandedSections} onChange={(expandedIndex) => setExpandedSections(expandedIndex as number[])}>
        {/* Search Section */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">Search Clients</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={0}>
            <VStack spacing={3} align="stretch">
              {/* Search Input */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={textMuted} />
                </InputLeftElement>
                <Input
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={getComponent("form", "fieldBg")}
                  border="1px"
                  borderColor={getComponent("form", "fieldBorder")}
                  _focus={{
                    borderColor: getComponent("form", "fieldBorderFocus"),
                    boxShadow: getComponent("form", "fieldShadowFocus"),
                  }}
                />
              </InputGroup>
              
              {/* Client Results */}
              {loading && (
                <HStack justify="center" py={4}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color={textSecondary}>Searching...</Text>
                </HStack>
              )}
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  Error searching clients: {error.message}
                </Alert>
              )}
              
              {data?.searchClients && data.searchClients.length > 0 && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={textSecondary}>
                      Found {totalCount} client{totalCount !== 1 ? 's' : ''}
                    </Text>
                    {allowMultiple && (
                      <HStack spacing={2}>
                        <Button size="xs" variant="link" onClick={handleSelectAll}>
                          Select All
                        </Button>
                        {selectedCount > 0 && (
                          <Button size="xs" variant="link" onClick={handleClearSelection}>
                            Clear
                          </Button>
                        )}
                      </HStack>
                    )}
                  </HStack>
                  
                  <VStack
                    align="stretch"
                    spacing={1}
                    maxH="200px"
                    overflowY="auto"
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={2}
                  >
                    {data.searchClients.map((client: Client) => (
                      <Box
                        key={client.id}
                        p={2}
                        borderRadius="md"
                        _hover={{ bg: getColor("background.overlay") }}
                      >
                        <HStack justify="space-between">
                          <HStack 
                            spacing={3} 
                            flex={1}
                            cursor="pointer"
                            onClick={() => handleClientToggle(client.id)}
                          >
                            <Box onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                isChecked={selectedClients.includes(client.id)}
                                onChange={() => handleClientToggle(client.id)}
                              />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {client.fName} {client.lName}
                              </Text>
                              <Text fontSize="xs" color={textMuted}>
                                {client.email || client.phoneNumber || 'No contact info'}
                              </Text>
                            </VStack>
                          </HStack>
                          {client.tags && client.tags.length > 0 && (
                            <Wrap spacing={1}>
                              {client.tags.slice(0, 2).map(tag => (
                                <WrapItem key={tag}>
                                  <Tag size="sm" variant="subtle" colorScheme="blue">
                                    <TagLabel>{tag}</TagLabel>
                                  </Tag>
                                </WrapItem>
                              ))}
                              {client.tags.length > 2 && (
                                <WrapItem>
                                  <Badge fontSize="xs" colorScheme="gray">
                                    +{client.tags.length - 2}
                                  </Badge>
                                </WrapItem>
                              )}
                            </Wrap>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
              
              {data?.searchClients && data.searchClients.length === 0 && (
                <Text fontSize="sm" color={textMuted} textAlign="center" py={4}>
                  No clients found matching your search
                </Text>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
        
        {/* Tag Filter Section */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <Box flex="1" textAlign="left">
              <HStack>
                <Text fontWeight="medium">Filter by Tags</Text>
                {selectedTags.length > 0 && (
                  <Badge colorScheme="blue" fontSize="xs">
                    {selectedTags.length} selected
                  </Badge>
                )}
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={0}>
            {tagsData?.allClientTags && tagsData.allClientTags.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color={textSecondary}>
                  Select tags to filter clients:
                </Text>
                <Wrap spacing={2}>
                  {tagsData.allClientTags.map((tag: string) => (
                    <WrapItem key={tag}>
                      <Tag
                        size="md"
                        variant={selectedTags.includes(tag) ? "solid" : "outline"}
                        colorScheme={selectedTags.includes(tag) ? "blue" : "gray"}
                        cursor="pointer"
                        onClick={() => handleTagToggle(tag)}
                        _hover={{
                          transform: "scale(1.05)",
                        }}
                      >
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
                {selectedTags.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTags([])}
                  >
                    Clear Tag Filters
                  </Button>
                )}
              </VStack>
            ) : (
              <Text fontSize="sm" color={textMuted} textAlign="center" py={4}>
                No tags available
              </Text>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Box>
          <Divider my={2} />
          <HStack justify="space-between">
            <Text fontSize="sm" color={textSecondary}>
              {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
            </Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={handleClearSelection}
              colorScheme="red"
            >
              Clear Selection
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};