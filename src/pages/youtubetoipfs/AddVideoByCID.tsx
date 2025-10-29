import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Switch,
  useColorModeValue,
  Divider,
  Link as ChakraLink,
  InputGroup,
  InputLeftElement,
  Code,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSave,
  FiX,
  FiVideo,
  FiExternalLink,
  FiInfo,
  FiCheck,
  FiHash
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { IPFS_CONFIG } from "./config";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL mutation for adding video by CID
const ADD_VIDEO_BY_CID = gql`
  mutation AddIPFSVideoByCID($input: IPFSVideoByCIDInput!) {
    addIPFSVideoByCID(input: $input) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      fileSize
      tags
      isPublic
      isPrivateFile
      createdAt
    }
  }
`;

const AddVideoByCID: React.FC = () => {
  usePageTitle("Add Video by CID");
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textPrimary = useColorModeValue('gray.900', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const [formData, setFormData] = useState({
    cid: '',
    title: '',
    description: '',
    fileName: '',
    fileSize: '',
    tags: [] as string[],
    isPublic: true,
    isPrivateFile: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addVideoByCID] = useMutation(ADD_VIDEO_BY_CID, {
    onCompleted: (data) => {
      toast({
        title: 'Video registered successfully!',
        description: 'Your IPFS video has been added/updated in your library',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Navigate to video viewer
      navigate(`/youtubetoipfs/video/${data.addIPFSVideoByCID.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Failed to add video',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.cid.trim()) {
      toast({
        title: 'CID is required',
        description: 'Please enter the IPFS CID for your video',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Title is required',
        description: 'Please enter a title for your video',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file size to bytes if provided
      let fileSizeInBytes = null;
      if (formData.fileSize) {
        const sizeMatch = formData.fileSize.match(/^([\d.]+)\s*(B|KB|MB|GB)?$/i);
        if (sizeMatch) {
          const [, value, unit = 'B'] = sizeMatch;
          const multipliers: Record<string, number> = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
          };
          fileSizeInBytes = Math.round(parseFloat(value) * multipliers[unit.toUpperCase()]);
        }
      }

      await addVideoByCID({
        variables: {
          input: {
            ipfsHash: formData.cid.trim(),
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            fileName: formData.fileName.trim() || undefined,
            fileSize: fileSizeInBytes || undefined,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            isPublic: formData.isPublic,
            isPrivateFile: formData.isPrivateFile
          }
        }
      });
    } catch (error) {
      console.error('Error adding video:', error);
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={youtubeToIPFSModuleConfig} />

      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color={textPrimary}>Add Video by CID</Heading>
              <Text color={textSecondary}>
                Register a video that's already uploaded to IPFS
              </Text>
            </VStack>
            <Button
              leftIcon={<FiVideo />}
              onClick={() => navigate('/youtubetoipfs')}
              variant="outline"
            >
              Back to Gallery
            </Button>
          </HStack>

          {/* Info Alert */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">How to use this page:</Text>
              <List spacing={1} mt={2}>
                <ListItem>
                  <ListIcon as={FiCheck} color="blue.500" />
                  Enter the CID (Content Identifier) from your Pinata dashboard
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck} color="blue.500" />
                  The CID looks like: <Code>bafyb...f4uey</Code>
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck} color="blue.500" />
                  Add metadata like title, description, and file size
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck} color="blue.500" />
                  Enable "Private Pinata File" if the CID is from a private file
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck} color="blue.500" />
                  Your video will be accessible via the appropriate IPFS gateway
                </ListItem>
              </List>
            </Box>
          </Alert>

          {/* Form Card */}
          <Card bg={cardBg} borderColor={borderColor} variant="outline">
            <CardHeader>
              <Heading size="md">Video Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* CID Input */}
                <FormControl isRequired>
                  <FormLabel>IPFS CID</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiHash color="gray" />
                    </InputLeftElement>
                    <Input
                      placeholder="e.g., bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
                      value={formData.cid}
                      onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                    />
                  </InputGroup>
                  <FormHelperText>
                    The Content Identifier from Pinata or IPFS
                  </FormHelperText>
                </FormControl>

                {/* Title Input */}
                <FormControl isRequired>
                  <FormLabel>Video Title</FormLabel>
                  <Input
                    placeholder="Enter a descriptive title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </FormControl>

                {/* File Name Input */}
                <FormControl>
                  <FormLabel>File Name</FormLabel>
                  <Input
                    placeholder="e.g., my-video.mp4 (optional)"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  />
                  <FormHelperText>
                    Original file name (helps identify the video type)
                  </FormHelperText>
                </FormControl>

                {/* File Size Input */}
                <FormControl>
                  <FormLabel>File Size</FormLabel>
                  <Input
                    placeholder="e.g., 301.83 MB (optional)"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  />
                  <FormHelperText>
                    Enter size with unit (B, KB, MB, or GB)
                  </FormHelperText>
                </FormControl>

                {/* Description */}
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Add a description of your video (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </FormControl>

                {/* Tags */}
                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Add tags for categorization"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                    />
                    <Button onClick={handleAddTag} leftIcon={<FiPlus />}>
                      Add
                    </Button>
                  </HStack>
                  {formData.tags.length > 0 && (
                    <Wrap mt={2}>
                      {formData.tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag size="md" variant="solid" colorScheme="blue">
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </FormControl>

                {/* Public/Private Toggle */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Make video public</FormLabel>
                  <Switch
                    isChecked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    colorScheme="blue"
                  />
                </FormControl>

                {/* Private Pinata File Toggle */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Private Pinata File</FormLabel>
                  <Switch
                    isChecked={formData.isPrivateFile}
                    onChange={(e) => setFormData({ ...formData, isPrivateFile: e.target.checked })}
                    colorScheme="orange"
                  />
                  <Text fontSize="sm" color={textSecondary} ml={3}>
                    Enable if this CID is from a private Pinata file
                  </Text>
                </FormControl>

                <Divider />

                {/* Action Buttons */}
                <HStack justify="space-between">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/youtubetoipfs')}
                    leftIcon={<FiX />}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText="Adding Video..."
                    leftIcon={<FiSave />}
                  >
                    Add Video
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* IPFS Gateway Info */}
          <Card bg={cardBg} borderColor={borderColor} variant="outline">
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <FiInfo color={textSecondary} />
                  <Text fontWeight="bold" color={textPrimary}>IPFS Gateway Access</Text>
                </HStack>
                <Text fontSize="sm" color={textSecondary}>
                  Once added, your video will be accessible through your private IPFS gateway:
                </Text>
                <Code fontSize="xs" p={2} borderRadius="md" w="full">
                  {IPFS_CONFIG.PRIVATE_GATEWAY_URL}/[YOUR-CID]
                </Code>
                <ChakraLink
                  href="https://docs.pinata.cloud/gateways/retrieving-files"
                  isExternal
                  color="blue.500"
                  fontSize="sm"
                >
                  Learn more about IPFS gateways <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default AddVideoByCID;