import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Text, 
  Heading, 
  List, 
  ListItem, 
  Link, 
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Divider
} from '@chakra-ui/react';

interface MarkdownRendererProps {
  content: string;
  fontSize?: string;
  color?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  fontSize = 'md',
  color 
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({children}) => <Heading as="h1" size="lg" mt={4} mb={2}>{children}</Heading>,
        h2: ({children}) => <Heading as="h2" size="md" mt={3} mb={2}>{children}</Heading>,
        h3: ({children}) => <Heading as="h3" size="sm" mt={2} mb={1}>{children}</Heading>,
        p: ({children}) => <Text fontSize={fontSize} color={color} mb={2}>{children}</Text>,
        ul: ({children}) => <List styleType="disc" pl={5} mb={2}>{children}</List>,
        ol: ({children}) => <List styleType="decimal" pl={5} mb={2}>{children}</List>,
        li: ({children}) => <ListItem fontSize={fontSize} color={color} mb={1}>{children}</ListItem>,
        a: ({href, children}) => <Link href={href} color="blue.500" isExternal>{children}</Link>,
        code: ({children, ...props}) => {
          const isInline = !String(children).includes('\n');
          return isInline ? (
            <Code fontSize="sm" px={1} py={0.5} borderRadius="sm">{children}</Code>
          ) : (
            <Code display="block" p={3} borderRadius="md" whiteSpace="pre-wrap" fontSize="sm" my={2}>
              {children}
            </Code>
          );
        },
        blockquote: ({children}) => (
          <Box borderLeft="4px solid" borderColor="gray.300" pl={4} py={2} my={2}>
            {children}
          </Box>
        ),
        table: ({children}) => (
          <Box overflowX="auto" my={3}>
            <Table variant="simple" size="sm">
              {children}
            </Table>
          </Box>
        ),
        thead: ({children}) => <Thead>{children}</Thead>,
        tbody: ({children}) => <Tbody>{children}</Tbody>,
        tr: ({children}) => <Tr>{children}</Tr>,
        th: ({children}) => <Th>{children}</Th>,
        td: ({children}) => <Td>{children}</Td>,
        hr: () => <Divider my={3} />,
        strong: ({children}) => <Text as="span" fontWeight="bold">{children}</Text>,
        em: ({children}) => <Text as="span" fontStyle="italic">{children}</Text>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};