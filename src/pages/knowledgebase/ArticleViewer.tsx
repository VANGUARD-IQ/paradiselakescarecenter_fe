import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FaBook, 
  FaClock, 
  FaDollarSign, 
  FaArrowLeft, 
  FaExternalLinkAlt,
  FaCopy,
  FaCheck
} from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { KnowledgeBasePermissionGuard } from "./Permissions";
import { getColor } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import knowledgebaseModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// Import the markdown content as strings
import { n8nSetupContent } from './guides/n8nSetupContent';
import { claudeSetupContent } from './guides/claudeSetupContent';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeRequired: string;
  cost?: string;
  tags: string[];
}

const articles: Record<string, Article> = {
  'n8n-digitalocean-setup': {
    id: 'n8n-digitalocean-setup',
    title: 'How to Create and Host an n8n Server with DigitalOcean',
    slug: 'n8n-digitalocean-setup',
    category: 'Internal Company Training',
    description: 'Step-by-step guide to setting up your own n8n automation server on DigitalOcean',
    content: n8nSetupContent,
    difficulty: 'Intermediate',
    timeRequired: '1-2 hours',
    cost: '~$25/month',
    tags: ['n8n', 'automation', 'digitalocean', 'hosting', 'docker', 'workflow']
  },
  'claude-code-mac-setup': {
    id: 'claude-code-mac-setup',
    title: 'How to Install and Set Up Claude Code on Your Mac',
    slug: 'claude-code-mac-setup',
    category: 'Internal Company Training',
    description: 'Complete guide to installing and configuring Claude Code AI assistant on macOS',
    content: claudeSetupContent,
    difficulty: 'Beginner',
    timeRequired: '30 minutes',
    cost: '~$20/month',
    tags: ['claude', 'ai', 'vscode', 'mac', 'development', 'tools']
  }
};

const ArticleViewer: React.FC = () => {
  usePageTitle("Article Viewer");
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const bg = getColor("background.main", colorMode);
  const cardBg = getColor("background.cardGradient", colorMode);
  const borderColor = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  const article = slug ? articles[slug] : null;

  useEffect(() => {
    // Scroll to top when article loads
    window.scrollTo(0, 0);
  }, [slug]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'green';
      case 'Intermediate':
        return 'yellow';
      case 'Advanced':
        return 'red';
      default:
        return 'gray';
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!article) {
    return (
      <KnowledgeBasePermissionGuard>
        <Box bg={bg} minHeight="100vh">
          <NavbarWithCallToAction />
          <ModuleBreadcrumb moduleConfig={knowledgebaseModuleConfig} />
          <Container maxW="container.lg" py={12}>
            <Alert status="error">
              <AlertIcon />
              Article not found
            </Alert>
            <Button mt={4} onClick={() => navigate('/knowledgebase')}>
              Back to Knowledge Base
            </Button>
          </Container>
          <FooterWithFourColumns />
        </Box>
      </KnowledgeBasePermissionGuard>
    );
  }

  return (
    <KnowledgeBasePermissionGuard>
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={knowledgebaseModuleConfig} />

        <Container maxW="container.lg" py={12} flex="1">
          <VStack spacing={6} align="stretch">
            {/* Breadcrumb */}
            <Breadcrumb color={textMuted} fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/knowledgebase">
                  Knowledge Base
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{article.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Back Button */}
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              size="sm"
              width="fit-content"
              onClick={() => navigate('/knowledgebase')}
              color={textPrimary}
              _hover={{ color: getColor("primary", colorMode) }}
            >
              Back to Knowledge Base
            </Button>

            {/* Article Header */}
            <Box
              bg={cardBg}
              p={8}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              backdropFilter="blur(10px)"
            >
              <VStack align="start" spacing={4}>
                <HStack spacing={3} flexWrap="wrap">
                  <Badge 
                    colorScheme={getDifficultyColor(article.difficulty)}
                    fontSize="sm"
                    px={3}
                    py={1}
                  >
                    {article.difficulty}
                  </Badge>
                  <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                    {article.category}
                  </Badge>
                </HStack>
                
                <Heading size="xl" color={textPrimary}>
                  {article.title}
                </Heading>
                
                <Text fontSize="lg" color={textSecondary}>
                  {article.description}
                </Text>
                
                <HStack spacing={6} color={textMuted} fontSize="sm">
                  <HStack>
                    <Icon as={FaClock} />
                    <Text>{article.timeRequired}</Text>
                  </HStack>
                  {article.cost && (
                    <HStack>
                      <Icon as={FaDollarSign} />
                      <Text>{article.cost}</Text>
                    </HStack>
                  )}
                </HStack>

                <HStack flexWrap="wrap" spacing={2} pt={2}>
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag}
                      bg={colorMode === 'light' ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.2)"}
                      color={colorMode === 'light' ? "#6366F1" : "#8B5CF6"}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Article Content */}
            <Box
              className="markdown-content"
              sx={{
                '& h1': { 
                  color: textPrimary, 
                  fontSize: '2xl', 
                  fontWeight: 'bold', 
                  mt: 8, 
                  mb: 4,
                  pb: 2,
                  borderBottomWidth: '1px',
                  borderColor: borderColor
                },
                '& h2': { 
                  color: textPrimary, 
                  fontSize: 'xl', 
                  fontWeight: 'bold', 
                  mt: 6, 
                  mb: 3 
                },
                '& h3': { 
                  color: textPrimary, 
                  fontSize: 'lg', 
                  fontWeight: 'semibold', 
                  mt: 4, 
                  mb: 2 
                },
                '& h4': { 
                  color: textPrimary, 
                  fontSize: 'md', 
                  fontWeight: 'semibold', 
                  mt: 3, 
                  mb: 2 
                },
                '& p': { 
                  color: textSecondary, 
                  lineHeight: 'tall', 
                  mb: 4 
                },
                '& ul': { 
                  color: textSecondary, 
                  pl: 6, 
                  mb: 4,
                  listStyleType: 'disc'
                },
                '& ol': { 
                  color: textSecondary, 
                  pl: 6, 
                  mb: 4,
                  listStyleType: 'decimal'
                },
                '& li': { 
                  mb: 2,
                  lineHeight: 'tall'
                },
                '& a': {
                  color: getColor("primary", colorMode),
                  textDecoration: 'underline',
                  _hover: { opacity: 0.8 }
                },
                '& blockquote': {
                  borderLeftWidth: '4px',
                  borderLeftColor: getColor("primary", colorMode),
                  pl: 4,
                  py: 2,
                  my: 4,
                  fontStyle: 'italic',
                  color: textMuted
                },
                '& code': {
                  bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                  color: colorMode === 'light' ? '#059669' : '#34D399',
                  px: 2,
                  py: 0.5,
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontFamily: 'monospace'
                },
                '& pre': {
                  bg: 'transparent !important',
                  p: 0,
                  my: 4,
                  borderRadius: 'lg',
                  overflow: 'hidden'
                },
                '& hr': {
                  borderColor: borderColor,
                  my: 8
                },
                '& strong': {
                  color: textPrimary,
                  fontWeight: 'bold'
                },
                '& em': {
                  fontStyle: 'italic'
                },
                '& table': {
                  width: '100%',
                  mb: 4,
                  borderWidth: '1px',
                  borderColor: borderColor
                },
                '& th': {
                  bg: cardBg,
                  color: textPrimary,
                  fontWeight: 'bold',
                  p: 3,
                  borderWidth: '1px',
                  borderColor: borderColor
                },
                '& td': {
                  color: textSecondary,
                  p: 3,
                  borderWidth: '1px',
                  borderColor: borderColor
                }
              }}
            >
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    
                    return !inline && match ? (
                      <Box position="relative" my={4}>
                        <Button
                          size="xs"
                          position="absolute"
                          top={2}
                          right={2}
                          zIndex={1}
                          onClick={() => copyToClipboard(codeString)}
                          leftIcon={copiedCode === codeString ? <FaCheck /> : <FaCopy />}
                          colorScheme={copiedCode === codeString ? "green" : "gray"}
                          variant="solid"
                        >
                          {copiedCode === codeString ? 'Copied!' : 'Copy'}
                        </Button>
                        {React.createElement(SyntaxHighlighter as any, {
                          style: vscDarkPlus,
                          language: match[1],
                          PreTag: "div",
                          customStyle: {
                            margin: 0,
                            borderRadius: '0.5rem',
                            background: colorMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.5)'
                          },
                          ...props
                        }, codeString)}
                      </Box>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children }: any) {
                    const isExternal = href?.startsWith('http');
                    return (
                      <Button
                        as="a"
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        variant="link"
                        color={getColor("primary", colorMode)}
                        rightIcon={isExternal ? <FaExternalLinkAlt size="12px" /> : undefined}
                        size="sm"
                      >
                        {children}
                      </Button>
                    );
                  }
                }}
              >
                {article.content}
              </ReactMarkdown>
            </Box>

            {/* Footer Navigation */}
            <Divider borderColor={borderColor} />
            
            <HStack justify="space-between">
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                onClick={() => navigate('/knowledgebase')}
                color={textPrimary}
                borderColor={borderColor}
                _hover={{
                  borderColor: getColor("primary", colorMode),
                  color: getColor("primary", colorMode)
                }}
              >
                Back to Knowledge Base
              </Button>
              
              <HStack>
                <Icon as={FaBook} color={textMuted} />
                <Text color={textMuted} fontSize="sm">
                  Internal Training Material
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Container>
        
        <FooterWithFourColumns />
      </Box>
    </KnowledgeBasePermissionGuard>
  );
};

export default ArticleViewer;