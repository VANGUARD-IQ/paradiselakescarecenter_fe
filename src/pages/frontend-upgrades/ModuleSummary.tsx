import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Code,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
} from '@chakra-ui/react';
import { FiCheckCircle, FiCopy, FiCode, FiBook } from 'react-icons/fi';
import { getColor } from '../../brandConfig';
import ReactMarkdown from 'react-markdown';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';

const ModuleSummary: React.FC = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const developerBrief = `# Frontend Upgrades Module - Developer Brief

## Purpose
Track and manage code improvements across multiple tenant frontend sites. This module allows you to:
- Register code upgrades from any tenant site
- Track which commits contain the improvements
- Monitor deployment status across all tenant sites
- Document implementation details with markdown

## Key Features
✅ **Git Commit Tracking** - Link one or more GitHub commit URLs
✅ **Origin Tracking** - Record which tenant innovated the feature
✅ **Multi-Site Deployment** - Auto-populates all tenants + master
✅ **Status Management** - Track: Pending → In Progress → Completed → Skipped
✅ **Markdown Documentation** - Attach detailed implementation notes
✅ **Progress Visualization** - See completion % across sites
✅ **Categorization** - UI Enhancement, Bug Fix, Performance, Security, etc.

## When to Use This Module
Use this module when you:
1. Implement a feature on one tenant site that should be replicated
2. Find a bug fix that affects multiple sites
3. Create a performance improvement worth sharing
4. Refactor code in a way that benefits all sites
5. Need to track which sites have received specific updates

## How to Create an Upgrade Entry

### Step 1: Identify the Improvement
- What changed?
- Why is it valuable?
- Which tenant site has it first?

### Step 2: Get the Git Commit URLs
Example: https://github.com/username/repo/commit/abc123...

### Step 3: Create the Entry
Navigate to: \`/frontend-upgrades/new\`

Fill in:
- **Title**: Brief description (e.g., "Dynamic Color Configuration")
- **Description**: What problem does it solve?
- **Category**: Select appropriate type
- **Origin Tenant**: Where was it first created?
- **Git Commits**: Paste the commit URL(s)
- **Documentation**: (Optional) Add markdown notes

### Step 4: Track Progress
For each tenant site:
1. Open the upgrade detail view
2. Click "Update" next to the tenant
3. Change status as you apply it
4. Add notes about any customizations needed

## Example Use Case

\`\`\`
Title: "Floating Navbar Dynamic Colors"
Description: "Refactored FloatingNavbar to use brandConfig.getColor()
             instead of hardcoded colors, enabling easy theme customization"
Category: UI_ENHANCEMENT
Origin: Blooming Brilliant
Commits:
  - https://github.com/.../commit/bed4769...
  - https://github.com/.../commit/98a7b5d...

Status:
  ✅ Master Frontend: COMPLETED
  ⏳ Blooming Brilliant: COMPLETED (origin)
  ⏳ Tenant Site A: PENDING
  ⏳ Tenant Site B: PENDING
\`\`\`

## Permissions
Requires: \`FRONTEND_UPGRADES_ADMIN\` or \`ADMIN\` permission

## GraphQL API

### Queries
\`\`\`graphql
query GetUpgrades {
  frontendUpgrades {
    id
    title
    description
    gitCommitUrls
    category
    originTenantName
    completedCount
    totalTenantCount
  }
}
\`\`\`

### Mutations
\`\`\`graphql
mutation CreateUpgrade($input: CreateFrontendUpgradeInput!) {
  createFrontendUpgrade(input: $input) {
    id
    title
  }
}

mutation MarkApplied($input: MarkUpgradeAppliedInput!) {
  markUpgradeApplied(input: $input) {
    id
  }
}
\`\`\`

## Backend Models
- **Location**: \`business-builder-backend/src/entities/models/FrontendUpgrade.ts\`
- **Resolver**: \`business-builder-backend/src/resolvers/frontendUpgrade.resolver.ts\`

## Frontend Components
- **List**: \`/frontend-upgrades\` - Overview with stats
- **Create**: \`/frontend-upgrades/new\` - Track new upgrade
- **Detail**: \`/frontend-upgrades/:id\` - View & update status
- **Module Config**: \`src/pages/frontend-upgrades/moduleConfig.ts\`

## Best Practices

### Do:
✅ Create upgrade entries BEFORE applying to multiple sites
✅ Include all related commit URLs
✅ Add markdown documentation for complex changes
✅ Update status immediately after applying to each site
✅ Add notes if customization was needed per tenant

### Don't:
❌ Skip creating entries for "small" changes (they add up!)
❌ Forget to mark master frontend as completed
❌ Leave upgrades in "pending" after applying them
❌ Mix unrelated changes in one upgrade entry

## Integration with Development Workflow

1. **During Development**: When creating a feature, think "will other sites need this?"
2. **After Commit**: Copy the GitHub commit URL
3. **Create Entry**: Register in Frontend Upgrades module
4. **Deploy to Master**: Apply to master frontend first
5. **Roll Out**: Systematically apply to each tenant site
6. **Track Progress**: Mark complete as you go

## Markdown Documentation Tips

Use the documentation field to capture:
- Implementation gotchas
- Environment-specific changes needed
- Configuration differences per tenant
- Dependencies or prerequisites
- Testing steps
- Screenshots/examples

## Future Enhancements
- Automated deployment integration
- Bulk status updates
- Email notifications on new upgrades
- Version tagging
- Rollback tracking
`;

  const quickStartBrief = `I need help using the Frontend Upgrades Tracking Module.

**Context**: We have a multi-tenant platform where code improvements from one tenant site should be tracked and deployed to other tenant sites.

**Goal**: ${copiedSection === 'create' ? 'Create a new upgrade entry' : copiedSection === 'update' ? 'Update the status of an existing upgrade' : 'Understand how to use this module'}

**What I need**:
${copiedSection === 'create' ? `
1. Navigate to /frontend-upgrades/new
2. Fill in the form with:
   - Title: [Brief description]
   - Description: [What it improves]
   - Category: [Select type]
   - Origin Tenant: [Where created]
   - Git Commit URLs: [GitHub URLs]
   - Documentation: [Optional markdown]
` : copiedSection === 'update' ? `
1. Open the upgrade detail page
2. Find the tenant in the status table
3. Click "Update" button
4. Change status (PENDING/IN_PROGRESS/COMPLETED/SKIPPED)
5. Add any notes
` : `
Please explain:
1. The purpose of this module
2. When to use it
3. How to create upgrade entries
4. How to track progress across tenant sites
5. Best practices for our workflow
`}

**Backend**: business-builder-backend (GraphQL/TypeScript/MongoDB)
**Frontend**: business-builder-master-frontend (React/Chakra UI)
**Module Location**: src/pages/frontend-upgrades/
`;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: 'Copied to clipboard!',
      description: 'Brief ready to paste for Claude',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box p={6}>
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">Frontend Upgrades Module - Overview</Heading>
          <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
            v1.0.0
          </Badge>
        </HStack>

        {/* Quick Stats */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardBody>
            <HStack spacing={8} justify="space-around">
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color={getColor('secondary', colorMode)}>🔄</Text>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Track Upgrades</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color={getColor('secondary', colorMode)}>📊</Text>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Monitor Progress</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color={getColor('secondary', colorMode)}>📝</Text>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Document Changes</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color={getColor('secondary', colorMode)}>🎯</Text>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Multi-Site Deploy</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Purpose */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardHeader>
            <Heading size="md">Purpose</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Text mb={4}>
              This module helps you track code improvements created on any tenant site and manage their deployment
              across all your frontend applications (master + tenant sites).
            </Text>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Track which tenant first innovated a feature
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Link GitHub commit URLs for easy reference
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Monitor deployment status across all sites
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Document implementation details with markdown
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Visualize progress with completion percentages
              </ListItem>
            </List>
          </CardBody>
        </Card>

        {/* Quick Action Briefs */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardHeader>
            <Heading size="md">Quick Action Briefs for Claude</Heading>
            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} mt={2}>
              Copy these briefs to ask Claude for help with specific tasks
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Button
                  leftIcon={<FiCopy />}
                  size="sm"
                  onClick={() => handleCopy(quickStartBrief.replace('${copiedSection === \'create\' ? \'Create a new upgrade entry\' : copiedSection === \'update\' ? \'Update the status of an existing upgrade\' : \'Understand how to use this module\'}', 'Understand how to use this module'), 'general')}
                  colorScheme={copiedSection === 'general' ? 'green' : 'blue'}
                  flex={1}
                >
                  {copiedSection === 'general' ? 'Copied!' : 'General Help Brief'}
                </Button>
                <Button
                  leftIcon={<FiCopy />}
                  size="sm"
                  onClick={() => handleCopy(quickStartBrief.replace('${copiedSection === \'create\' ? \'Create a new upgrade entry\' : copiedSection === \'update\' ? \'Update the status of an existing upgrade\' : \'Understand how to use this module\'}', 'Create a new upgrade entry'), 'create')}
                  colorScheme={copiedSection === 'create' ? 'green' : 'blue'}
                  flex={1}
                >
                  {copiedSection === 'create' ? 'Copied!' : 'Create Upgrade Brief'}
                </Button>
                <Button
                  leftIcon={<FiCopy />}
                  size="sm"
                  onClick={() => handleCopy(quickStartBrief.replace('${copiedSection === \'create\' ? \'Create a new upgrade entry\' : copiedSection === \'update\' ? \'Update the status of an existing upgrade\' : \'Understand how to use this module\'}', 'Update the status of an existing upgrade'), 'update')}
                  colorScheme={copiedSection === 'update' ? 'green' : 'blue'}
                  flex={1}
                >
                  {copiedSection === 'update' ? 'Copied!' : 'Update Status Brief'}
                </Button>
              </HStack>
              <Box
                p={4}
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                borderRadius="md"
                fontSize="sm"
                fontFamily="monospace"
                whiteSpace="pre-wrap"
              >
                {quickStartBrief.replace(/\$\{[^}]+\}/g, '[Task-specific content]')}
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Full Documentation */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Complete Developer Documentation</Heading>
              <Button
                leftIcon={<FiCopy />}
                size="sm"
                onClick={() => handleCopy(developerBrief, 'full')}
                colorScheme={copiedSection === 'full' ? 'green' : 'blue'}
              >
                {copiedSection === 'full' ? 'Copied!' : 'Copy Full Docs'}
              </Button>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Tabs>
              <TabList>
                <Tab><FiBook /> Documentation</Tab>
                <Tab><FiCode /> Markdown Source</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                    borderRadius="md"
                    maxH="600px"
                    overflowY="auto"
                  >
                    <ReactMarkdown>{developerBrief}</ReactMarkdown>
                  </Box>
                </TabPanel>
                <TabPanel px={0}>
                  <Box
                    as="pre"
                    p={4}
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                    borderRadius="md"
                    fontSize="sm"
                    maxH="600px"
                    overflowY="auto"
                    whiteSpace="pre-wrap"
                  >
                    <Code>{developerBrief}</Code>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default ModuleSummary;
