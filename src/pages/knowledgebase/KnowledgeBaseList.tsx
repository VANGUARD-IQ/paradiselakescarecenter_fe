import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  HStack,
  Button,
  Icon,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaClock, FaDollarSign, FaUserGraduate, FaArrowRight } from "react-icons/fa";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { KnowledgeBasePermissionGuard } from "./Permissions";
import { getColor } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import knowledgebaseModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeRequired: string;
  cost?: string;
  tags: string[];
}

const articles: Article[] = [
  {
    id: 'n8n-digitalocean-setup',
    title: 'How to Create and Host an n8n Server with DigitalOcean',
    slug: 'n8n-digitalocean-setup',
    category: 'Internal Company Training',
    description: 'Step-by-step guide to setting up your own n8n automation server on DigitalOcean for powerful workflow automation',
    difficulty: 'Intermediate',
    timeRequired: '1-2 hours',
    cost: '~$25/month',
    tags: ['n8n', 'automation', 'digitalocean', 'hosting', 'docker']
  },
  {
    id: 'claude-code-mac-setup',
    title: 'How to Install and Set Up Claude Code on Your Mac',
    slug: 'claude-code-mac-setup',
    category: 'Internal Company Training',
    description: 'Complete guide to installing and configuring Claude Code AI assistant on macOS for enhanced development',
    difficulty: 'Beginner',
    timeRequired: '30 minutes',
    cost: '~$20/month',
    tags: ['claude', 'ai', 'vscode', 'mac', 'development']
  }
];

const KnowledgeBaseList: React.FC = () => {
  usePageTitle("Knowledge Base");
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const bg = getColor("background.main", colorMode);
  const cardBg = getColor("background.cardGradient", colorMode);
  const borderColor = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

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

  return (
    <KnowledgeBasePermissionGuard>
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={knowledgebaseModuleConfig} />

        <Container maxW="container.xl" py={12} flex="1">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <VStack spacing={3} align="start">
              <HStack>
                <Icon as={FaBook} w={8} h={8} color={getColor("primary", colorMode)} />
                <Heading size="xl" color={textPrimary}>
                  Knowledge Base
                </Heading>
              </HStack>
              <Text fontSize="lg" color={textSecondary}>
                Internal company training and documentation for Tom Miller Services team
              </Text>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                Admin Access Only
              </Badge>
            </VStack>

            <Divider borderColor={borderColor} />

            {/* Category Section */}
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color={textMuted} textTransform="uppercase" letterSpacing="wide">
                Category
              </Text>
              <Heading size="md" color={textPrimary}>
                Internal Company Training
              </Heading>
            </VStack>

            {/* Articles Grid */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {articles.map((article) => (
                <Card
                  key={article.id}
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth="1px"
                  backdropFilter="blur(10px)"
                  overflow="hidden"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
                    borderColor: getColor("primary", colorMode),
                    transition: "all 0.2s"
                  }}
                  cursor="pointer"
                  onClick={() => navigate(`/knowledgebase/${article.slug}`)}
                >
                  <CardHeader pb={3}>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" width="100%">
                        <Badge 
                          colorScheme={getDifficultyColor(article.difficulty)}
                          fontSize="xs"
                        >
                          {article.difficulty}
                        </Badge>
                        <HStack spacing={4} fontSize="xs" color={textMuted}>
                          <HStack spacing={1}>
                            <Icon as={FaClock} />
                            <Text>{article.timeRequired}</Text>
                          </HStack>
                          {article.cost && (
                            <HStack spacing={1}>
                              <Icon as={FaDollarSign} />
                              <Text>{article.cost}</Text>
                            </HStack>
                          )}
                        </HStack>
                      </HStack>
                      <Heading size="md" color={textPrimary}>
                        {article.title}
                      </Heading>
                    </VStack>
                  </CardHeader>
                  
                  <CardBody py={3}>
                    <Text color={textSecondary} fontSize="sm" noOfLines={3}>
                      {article.description}
                    </Text>
                  </CardBody>

                  <CardFooter pt={3} borderTopWidth="1px" borderColor={borderColor}>
                    <VStack align="start" spacing={3} width="100%">
                      <HStack flexWrap="wrap" spacing={2}>
                        {article.tags.slice(0, 3).map((tag) => (
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
                        {article.tags.length > 3 && (
                          <Text fontSize="xs" color={textMuted}>
                            +{article.tags.length - 3} more
                          </Text>
                        )}
                      </HStack>
                      <Button
                        size="sm"
                        width="100%"
                        rightIcon={<FaArrowRight />}
                        bg="transparent"
                        color={textPrimary}
                        borderWidth="1px"
                        borderColor={borderColor}
                        _hover={{
                          bg: getColor("background.main", colorMode),
                          borderColor: getColor("primary", colorMode),
                          color: getColor("primary", colorMode)
                        }}
                      >
                        Read Article
                      </Button>
                    </VStack>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>

            {/* More Coming Soon */}
            <Card
              bg={cardBg}
              borderColor={borderColor}
              borderWidth="1px"
              borderStyle="dashed"
              backdropFilter="blur(10px)"
              p={8}
            >
              <VStack spacing={3}>
                <Icon as={FaUserGraduate} w={12} h={12} color={textMuted} />
                <Heading size="md" color={textPrimary}>
                  More Training Materials Coming Soon
                </Heading>
                <Text color={textSecondary} textAlign="center">
                  We're continuously adding new guides and training materials for the team.
                  Check back regularly for updates.
                </Text>
              </VStack>
            </Card>
          </VStack>
        </Container>
        
        <FooterWithFourColumns />
      </Box>
    </KnowledgeBasePermissionGuard>
  );
};

export default KnowledgeBaseList;