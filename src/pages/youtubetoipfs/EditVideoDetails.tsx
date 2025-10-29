import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Badge,
  Divider,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Select,
  Tooltip
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiCopy,
  FiShare2,
  FiTrash2,
  FiGlobe,
  FiLock,
  FiPlus,
  FiExternalLink,
  FiShield
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_VIDEO = gql`
  query IPFSVideo($id: String!) {
    ipfsVideo(id: $id) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      thumbnailUrl
      source
      fileSize
      mimeType
      uploadedBy
      uploadedByName
      tags
      viewCount
      isPublic
      isPrivateFile
      createdAt
      updatedAt
    }
  }
`;

const GET_VIDEO_BY_HASH = gql`
  query IPFSVideoByHash($ipfsHash: String!) {
    ipfsVideoByHash(ipfsHash: $ipfsHash) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      thumbnailUrl
      source
      fileSize
      mimeType
      uploadedBy
      uploadedByName
      tags
      viewCount
      isPublic
      isPrivateFile
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_VIDEO = gql`
  mutation UpdateIPFSVideo($id: String!, $input: IPFSVideoInput!) {
    updateIPFSVideo(id: $id, input: $input) {
      id
      title
      description
      tags
      isPublic
      isPrivateFile
      ipfsUrl
    }
  }
`;

const DELETE_VIDEO = gql`
  mutation DeleteIPFSVideo($id: String!) {
    deleteIPFSVideo(id: $id)
  }
`;

// Sharing mutations - commented out until backend supports sharing
// const SHARE_VIDEO = gql`
//   mutation ShareIPFSVideo($videoId: String!, $userId: String!, $permission: String!) {
//     shareIPFSVideo(videoId: $videoId, userId: $userId, permission: $permission) {
//       id
//       sharedWith {
//         userId
//         userName
//         permission
//         sharedAt
//       }
//     }
//   }
// `;

// const UNSHARE_VIDEO = gql`
//   mutation UnshareIPFSVideo($videoId: String!, $userId: String!) {
//     unshareIPFSVideo(videoId: $videoId, userId: $userId) {
//       id
//       sharedWith {
//         userId
//         userName
//         permission
//         sharedAt
//       }
//     }
//   }
// `;

const EditVideoDetails: React.FC = () => {
  usePageTitle("Edit Video Details");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textColor = "white";
  const mutedTextColor = "gray.300";

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPrivateFile, setIsPrivateFile] = useState(false);
  // const [shareEmail, setShareEmail] = useState('');
  // const [sharePermission, setSharePermission] = useState('view');
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if id is IPFS hash (starts with Qm or baf) or database ID
  const isIPFSHash = id?.startsWith('Qm') || id?.startsWith('baf');

  const { data, loading, error } = useQuery(
    isIPFSHash ? GET_VIDEO_BY_HASH : GET_VIDEO,
    {
      variables: isIPFSHash ? { ipfsHash: id } : { id },
      skip: !id,
      onCompleted: (data) => {
        const video = data?.ipfsVideo || data?.ipfsVideoByHash;
        if (video) {
          setTitle(video.title || '');
          setDescription(video.description || '');
          setTags(video.tags || []);
          setIsPublic(video.isPublic || false);
          setIsPrivateFile(video.isPrivateFile || false);
        }
      }
    }
  );

  const [updateVideo] = useMutation(UPDATE_VIDEO, {
    onCompleted: () => {
      toast({
        title: 'Video updated successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update video',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  const [deleteVideo] = useMutation(DELETE_VIDEO, {
    onCompleted: () => {
      toast({
        title: 'Video deleted successfully',
        status: 'success',
        duration: 3000,
      });
      navigate('/youtubetoipfs');
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete video',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setIsDeleting(false);
    }
  });

  // Sharing mutations - commented out until backend supports sharing
  // const [shareVideo] = useMutation(SHARE_VIDEO, {
  //   refetchQueries: [{ query: GET_VIDEO, variables: { id } }],
  //   onCompleted: () => {
  //     toast({
  //       title: 'Video shared successfully',
  //       status: 'success',
  //       duration: 3000,
  //     });
  //     setShareEmail('');
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Failed to share video',
  //       description: error.message,
  //       status: 'error',
  //       duration: 5000,
  //     });
  //   }
  // });

  // const [unshareVideo] = useMutation(UNSHARE_VIDEO, {
  //   refetchQueries: [{ query: GET_VIDEO, variables: { id } }],
  //   onCompleted: () => {
  //     toast({
  //       title: 'Access removed successfully',
  //       status: 'success',
  //       duration: 3000,
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Failed to remove access',
  //       description: error.message,
  //       status: 'error',
  //       duration: 5000,
  //     });
  //   }
  // });

  const handleSave = async () => {
    const videoData = data?.ipfsVideo || data?.ipfsVideoByHash;
    const videoId = videoData?.id; // Always use the database ID for updates

    if (!videoId) {
      toast({
        title: 'Error: Video ID not found',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    await updateVideo({
      variables: {
        id: videoId,
        input: {
          title,
          description,
          tags,
          isPublic,
          isPrivateFile
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    const videoData = data?.ipfsVideo || data?.ipfsVideoByHash;
    const videoId = videoData?.id; // Always use the database ID for delete

    if (!videoId) {
      toast({
        title: 'Error: Video ID not found',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsDeleting(true);
    await deleteVideo({ variables: { id: videoId } });
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Sharing functions - commented out until backend supports sharing
  // const handleShare = async () => {
  //   if (!shareEmail) {
  //     toast({
  //       title: 'Please enter an email or user ID',
  //       status: 'warning',
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //   await shareVideo({
  //     variables: {
  //       videoId: id,
  //       userId: shareEmail, // This could be email or userId
  //       permission: sharePermission
  //     }
  //   });
  // };

  // const handleUnshare = async (userId: string) => {
  //   await unshareVideo({
  //     variables: {
  //       videoId: id,
  //       userId
  //     }
  //   });
  // };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/youtubetoipfs/video/${data?.ipfsVideo?.ipfsHash || id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Share link copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box flex="1">
          <Container maxW="6xl" py={8}>
            <Center>
              <Spinner size="xl" color={textColor} />
            </Center>
          </Container>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const videoData = data?.ipfsVideo || data?.ipfsVideoByHash;
  if (error || !videoData) {
    return (
      <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box flex="1">
          <Container maxW="6xl" py={8}>
            <Center>
              <VStack spacing={4}>
                <Text fontSize="xl" color={mutedTextColor}>
                  Video not found or you don't have permission to edit it
                </Text>
                <Button onClick={() => navigate('/youtubetoipfs')}>
                  Back to Gallery
                </Button>
              </VStack>
            </Center>
          </Container>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const video = data.ipfsVideo || data.ipfsVideoByHash;

  return (
    <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={youtubeToIPFSModuleConfig} />

      <Box flex="1">
        <Container maxW="6xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate(`/youtubetoipfs/video/${id}`)}
              >
                Back to Video
              </Button>
              <HStack>
                <Button
                  leftIcon={<FiEye />}
                  variant="outline"
                  onClick={() => window.open(`/youtubetoipfs/video/${video.id}`, '_blank')}
                >
                  View Public Page
                </Button>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="blue"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </HStack>
            </HStack>

            {/* Basic Details */}
            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
              <CardHeader>
                <Heading size="md" color={textColor}>Basic Details</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel color={textColor}>Title</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter video title"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: mutedTextColor }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter video description"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      _placeholder={{ color: mutedTextColor }}
                      rows={4}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>Tags</FormLabel>
                    <Wrap mb={2}>
                      {tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag size="md" colorScheme="blue">
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    <InputGroup>
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add a tag"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                        _placeholder={{ color: mutedTextColor }}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={<FiPlus />}
                          aria-label="Add tag"
                          size="sm"
                          onClick={handleAddTag}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Privacy Settings */}
            <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
              <CardHeader>
                <Heading size="md" color={textColor}>Privacy Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <Box display="flex" alignItems="center">
                      <FormLabel htmlFor="public-switch" mb="0" color={textColor}>
                        <HStack>
                          {isPublic ? <FiGlobe /> : <FiLock />}
                          <Text>Make video public</Text>
                        </HStack>
                      </FormLabel>
                      <Switch
                        id="public-switch"
                        isChecked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        colorScheme="green"
                      />
                    </Box>
                    <FormHelperText color={mutedTextColor} mt={2}>
                      {isPublic
                        ? "Anyone with the link can view this video without logging in."
                        : "Only you and people you share with can view this video."
                      }
                    </FormHelperText>
                  </FormControl>

                  <Divider borderColor={cardBorder} />

                  <FormControl>
                    <Box display="flex" alignItems="center">
                      <FormLabel htmlFor="private-file-switch" mb="0" color={textColor}>
                        <HStack>
                          <FiShield />
                          <Text>Private Pinata File</Text>
                        </HStack>
                      </FormLabel>
                      <Switch
                        id="private-file-switch"
                        isChecked={isPrivateFile}
                        onChange={(e) => setIsPrivateFile(e.target.checked)}
                        colorScheme="orange"
                      />
                    </Box>
                    <FormHelperText color={mutedTextColor} mt={2}>
                      {isPrivateFile
                        ? "This video is stored as a private file on Pinata and uses authenticated gateway access."
                        : "This video is stored as a public file on Pinata and can be accessed via any IPFS gateway."
                      }
                    </FormHelperText>
                  </FormControl>

                  <Divider borderColor={cardBorder} />

                  {/* Share Link */}
                  <Box>
                    <Text fontWeight="bold" mb={2} color={textColor}>Share Link</Text>
                    <InputGroup>
                      <Input
                        value={`${window.location.origin}/youtubetoipfs/video/${video.ipfsHash || id}`}
                        isReadOnly
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor={cardBorder}
                        color={textColor}
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={copyShareLink}>
                          <FiCopy />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {isPublic && (
                      <Alert status="info" mt={2} bg="blue.900" border="1px solid" borderColor="blue.700">
                        <AlertIcon />
                        <Text fontSize="sm">This link can be shared publicly. Anyone can view the video.</Text>
                      </Alert>
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Sharing with Specific Users - Hidden until backend supports it */}
            {/* Will be implemented when backend supports sharing functionality */}

            {/* Danger Zone */}
            <Card bg="red.900" border="1px solid" borderColor="red.700">
              <CardHeader>
                <Heading size="md" color={textColor}>Danger Zone</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text color={mutedTextColor}>
                    Once you delete a video, there is no going back. The video will be removed from our database,
                    but the IPFS content may still exist on the network.
                  </Text>
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    loadingText="Deleting..."
                  >
                    Delete Video Permanently
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      <FooterWithFourColumns />
    </Box>
  );
};

export default EditVideoDetails;