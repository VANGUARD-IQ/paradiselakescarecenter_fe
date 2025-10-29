import React, { useState, useRef } from 'react';
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
  Progress,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  useToast,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Switch,
  useColorModeValue,
  Divider,
  Badge,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiUpload, FiVideo, FiX, FiPlus, FiExternalLink, FiCopy } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const UPLOAD_VIDEO_TO_IPFS = gql`
  mutation UploadVideoToIPFS($file: Upload!, $input: IPFSVideoInput!) {
    uploadVideoToIPFS(file: $file, input: $input) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      fileSize
      mimeType
      tags
      isPublic
      createdAt
    }
  }
`;

const UploadVideo: React.FC = () => {
  usePageTitle("Upload Video");
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    isPublic: true
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);

  const [uploadVideoToIPFS] = useMutation(UPLOAD_VIDEO_TO_IPFS, {
    onCompleted: (data) => {
      console.log('Upload completed:', data);
      setUploadedVideo(data.uploadVideoToIPFS);
      setUploadProgress(100);
      toast({
        title: 'Video uploaded successfully!',
        description: 'Your video has been uploaded to IPFS',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Reset form
      setSelectedFile(null);
      setVideoPreview(null);
      setFormData({
        title: '',
        description: '',
        tags: [],
        isPublic: true
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an MP4, MPEG, MOV, or AVI video file',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 500MB limit`,
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);

      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to upload',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your video',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await uploadVideoToIPFS({
        variables: {
          file: selectedFile,
          input: {
            title: formData.title,
            description: formData.description,
            tags: formData.tags,
            isPublic: formData.isPublic
          }
        }
      });
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
    });
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
              <Heading size="lg">Upload Video to IPFS</Heading>
              <Text color="gray.600">
                Upload your videos to the decentralized web
              </Text>
            </VStack>
            <Button
              leftIcon={<FiVideo />}
              onClick={() => navigate('/youtubetoipfs')}
              variant="outline"
            >
              My Videos
            </Button>
          </HStack>

          {/* Upload Form */}
          <Card bg={cardBg}>
            <CardHeader>
              <Text fontWeight="bold">Video Upload</Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* File Selection */}
                <FormControl>
                  <FormLabel>Select Video File</FormLabel>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                    onChange={handleFileSelect}
                    display="none"
                  />
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    colorScheme="blue"
                    size="lg"
                    w="full"
                  >
                    Choose Video File
                  </Button>
                  <FormHelperText>
                    Supported formats: MP4, MPEG, MOV, AVI (Max 500MB)
                  </FormHelperText>
                </FormControl>

                {/* Video Preview */}
                {selectedFile && videoPreview && (
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">Preview</Text>
                      <IconButton
                        icon={<FiX />}
                        aria-label="Remove video"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(null);
                          setVideoPreview(null);
                        }}
                      />
                    </HStack>
                    <Box borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                      <video
                        controls
                        width="100%"
                        style={{ maxHeight: '400px' }}
                      >
                        <source src={videoPreview} type={selectedFile.type} />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  </Box>
                )}

                {/* Title */}
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                  />
                </FormControl>

                {/* Description */}
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your video (optional)"
                    rows={4}
                  />
                </FormControl>

                {/* Tags */}
                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <HStack>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tags"
                    />
                    <IconButton
                      icon={<FiPlus />}
                      aria-label="Add tag"
                      onClick={handleAddTag}
                    />
                  </HStack>
                  {formData.tags.length > 0 && (
                    <Wrap mt={2}>
                      {formData.tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag colorScheme="blue">
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </FormControl>

                {/* Public Toggle */}
                <FormControl>
                  <HStack justify="space-between">
                    <Box>
                      <FormLabel mb={0}>Make Public</FormLabel>
                      <FormHelperText mt={0}>
                        Public videos can be viewed by anyone with the link
                      </FormHelperText>
                    </Box>
                    <Switch
                      isChecked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      colorScheme="blue"
                    />
                  </HStack>
                </FormControl>

                {/* Upload Progress */}
                {isUploading && (
                  <Box>
                    <Text mb={2}>Uploading... {uploadProgress}%</Text>
                    <Progress value={uploadProgress} colorScheme="blue" size="sm" />
                  </Box>
                )}

                {/* Upload Button */}
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleUpload}
                  isLoading={isUploading}
                  loadingText="Uploading..."
                  isDisabled={!selectedFile || !formData.title.trim()}
                  leftIcon={<FiUpload />}
                >
                  Upload to IPFS
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Success Message */}
          {uploadedVideo && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontWeight="bold">Video uploaded successfully!</Text>
                <VStack align="start" spacing={2} mt={2}>
                  <HStack>
                    <Text fontSize="sm">IPFS Hash:</Text>
                    <Badge>{uploadedVideo.ipfsHash}</Badge>
                    <IconButton
                      icon={<FiCopy />}
                      aria-label="Copy hash"
                      size="xs"
                      variant="ghost"
                      onClick={() => copyToClipboard(uploadedVideo.ipfsHash)}
                    />
                  </HStack>
                  <HStack>
                    <ChakraLink
                      href={uploadedVideo.ipfsUrl}
                      isExternal
                      color="blue.500"
                      fontSize="sm"
                    >
                      View on IPFS <FiExternalLink style={{ display: 'inline' }} />
                    </ChakraLink>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/youtubetoipfs/video/${uploadedVideo.id}`)}
                    >
                      View Details
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Alert>
          )}
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default UploadVideo;