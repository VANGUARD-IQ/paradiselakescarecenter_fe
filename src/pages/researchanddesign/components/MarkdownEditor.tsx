import React from 'react';
import {
  Box,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  bg?: string;
  borderColor?: string;
  color?: string;
  label?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 6,
  bg = "rgba(0, 0, 0, 0.2)",
  borderColor,
  color,
  label,
}) => {
  return (
    <VStack align="stretch" spacing={2}>
      {label && (
        <Text fontSize="sm" color="gray.500">
          {label}
        </Text>
      )}
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab fontSize="sm">
            <EditIcon mr={2} />
            Edit
          </Tab>
          <Tab fontSize="sm">
            <ViewIcon mr={2} />
            Preview
          </Tab>
          <Box flex={1} textAlign="right" pr={2} display="flex" alignItems="center" justifyContent="flex-end">
            <Badge colorScheme="green" fontSize="xs">Markdown Supported</Badge>
          </Box>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              bg={bg}
              border="1px"
              borderColor={borderColor}
              color={color}
              fontSize="md"
              fontFamily="monospace"
              _placeholder={{ color: "gray.500" }}
              _hover={{ borderColor: "purple.400" }}
              _focus={{ 
                borderColor: "purple.500", 
                boxShadow: "0 0 0 1px purple.500",
                outline: "none"
              }}
              transition="all 0.3s"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Supports **bold**, *italic*, lists (- item), and more
            </Text>
          </TabPanel>
          <TabPanel>
            <Box
              minHeight={`${rows * 24}px`}
              p={3}
              bg={bg}
              border="1px"
              borderColor={borderColor || "gray.600"}
              borderRadius="md"
              overflowY="auto"
            >
              {value ? (
                <MarkdownRenderer content={value} fontSize="md" color={color} />
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  Nothing to preview. Start typing in the Edit tab.
                </Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};