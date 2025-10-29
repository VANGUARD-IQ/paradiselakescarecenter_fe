import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Card,
  CardBody,
  HStack,
  IconButton,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';

const CREATE_FRONTEND_UPGRADE = gql`
  mutation CreateFrontendUpgrade($input: CreateFrontendUpgradeInput!) {
    createFrontendUpgrade(input: $input) {
      id
      title
    }
  }
`;

const GET_TENANTS = gql`
  query GetTenants {
    tenants {
      id
      name
      status
    }
  }
`;

const NewUpgrade: React.FC = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('UI_ENHANCEMENT');
  const [originTenantId, setOriginTenantId] = useState('');
  const [originTenantName, setOriginTenantName] = useState('');
  const [gitCommitUrls, setGitCommitUrls] = useState<string[]>(['']);
  const [markdownDocumentation, setMarkdownDocumentation] = useState('');

  const { data: tenantsData, loading: tenantsLoading, error: tenantsError } = useQuery(GET_TENANTS);
  const tenants = tenantsData?.tenants || [];

  // Debug logging
  React.useEffect(() => {
    if (tenantsData) {
      console.log('Tenants data:', tenantsData);
      console.log('All tenants:', tenants);
      console.log('Active tenants:', tenants.filter((t: any) => t.status === 'active'));
    }
    if (tenantsError) {
      console.error('Tenants error:', tenantsError);
    }
  }, [tenantsData, tenantsError, tenants]);

  const [createUpgrade, { loading }] = useMutation(CREATE_FRONTEND_UPGRADE, {
    onCompleted: (data) => {
      toast({
        title: 'Upgrade Created',
        description: `Successfully tracked upgrade: ${data.createFrontendUpgrade.title}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/frontend-upgrades');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const handleAddCommitUrl = () => {
    setGitCommitUrls([...gitCommitUrls, '']);
  };

  const handleRemoveCommitUrl = (index: number) => {
    setGitCommitUrls(gitCommitUrls.filter((_, i) => i !== index));
  };

  const handleCommitUrlChange = (index: number, value: string) => {
    const newUrls = [...gitCommitUrls];
    newUrls[index] = value;
    setGitCommitUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!title || !description || !category || !originTenantId || !originTenantName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Filter out empty commit URLs
    const filteredCommitUrls = gitCommitUrls.filter(url => url.trim() !== '');

    if (filteredCommitUrls.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one git commit URL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await createUpgrade({
      variables: {
        input: {
          title,
          description,
          category,
          originTenantId,
          originTenantName,
          gitCommitUrls: filteredCommitUrls,
          markdownDocumentation: markdownDocumentation || undefined
        }
      }
    });
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setOriginTenantId(selectedId);

    const selectedTenant = tenants.find((t: any) => t.id === selectedId);
    if (selectedTenant) {
      setOriginTenantName(selectedTenant.name);
    }
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box p={6}>
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        {/* Header */}
        <HStack>
          <IconButton
            aria-label="Go back"
            icon={<FiArrowLeft />}
            onClick={() => navigate('/frontend-upgrades')}
            variant="ghost"
          />
          <Heading size="lg">Track New Frontend Upgrade</Heading>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Basic Information</Heading>

                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Dynamic Color Configuration for FloatingNavbar"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of what this upgrade improves"
                      rows={3}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="UI_ENHANCEMENT">UI Enhancement</option>
                      <option value="BUG_FIX">Bug Fix</option>
                      <option value="PERFORMANCE">Performance</option>
                      <option value="SECURITY">Security</option>
                      <option value="FEATURE">Feature</option>
                      <option value="REFACTOR">Refactor</option>
                      <option value="ACCESSIBILITY">Accessibility</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Origin Tenant (Where was this first innovated?)</FormLabel>
                    <Select
                      value={originTenantId}
                      onChange={handleTenantChange}
                      placeholder="Select tenant site"
                    >
                      {tenants.map((tenant: any) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Git Commit URLs */}
            <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Git Commit URLs</Heading>
                    <Button
                      leftIcon={<FiPlus />}
                      size="sm"
                      onClick={handleAddCommitUrl}
                      colorScheme="blue"
                    >
                      Add URL
                    </Button>
                  </HStack>

                  {gitCommitUrls.map((url, index) => (
                    <HStack key={index}>
                      <FormControl>
                        <Input
                          value={url}
                          onChange={(e) => handleCommitUrlChange(index, e.target.value)}
                          placeholder="https://github.com/username/repo/commit/..."
                        />
                      </FormControl>
                      {gitCommitUrls.length > 1 && (
                        <IconButton
                          aria-label="Remove URL"
                          icon={<FiTrash2 />}
                          onClick={() => handleRemoveCommitUrl(index)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Markdown Documentation */}
            <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Documentation (Optional)</Heading>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                    Add detailed markdown documentation about this upgrade, including implementation notes, gotchas, etc.
                  </Text>

                  <Tabs>
                    <TabList>
                      <Tab>Edit</Tab>
                      <Tab>Preview</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0}>
                        <Textarea
                          value={markdownDocumentation}
                          onChange={(e) => setMarkdownDocumentation(e.target.value)}
                          placeholder="# Implementation Notes&#10;&#10;## What Changed&#10;- Point 1&#10;- Point 2&#10;&#10;## How to Apply&#10;1. Step 1&#10;2. Step 2"
                          rows={15}
                          fontFamily="monospace"
                        />
                      </TabPanel>
                      <TabPanel>
                        {markdownDocumentation ? (
                          <Box
                            p={4}
                            border="1px solid"
                            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                            borderRadius="md"
                            minH="300px"
                          >
                            <ReactMarkdown>{markdownDocumentation}</ReactMarkdown>
                          </Box>
                        ) : (
                          <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'}>
                            No documentation yet. Add some markdown content to see the preview.
                          </Text>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </Card>

            {/* Submit Button */}
            <HStack justify="flex-end" spacing={4}>
              <Button
                variant="ghost"
                onClick={() => navigate('/frontend-upgrades')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bg={getColor('secondary', colorMode)}
                color="white"
                isLoading={loading}
                _hover={{ bg: getColor('secondaryHover', colorMode) }}
              >
                Track Upgrade
              </Button>
            </HStack>
          </VStack>
        </form>
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default NewUpgrade;
