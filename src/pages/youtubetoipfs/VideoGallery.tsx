import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link as ChakraLink,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FiPlus,
  FiVideo,
  FiExternalLink,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiEye,
  FiGlobe,
  FiLock,
  FiHardDrive,
  FiHash,
  FiPlay
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { getColor } from "../../brandConfig";
import { useColorMode } from "@chakra-ui/react";
import { IPFS_CONFIG } from "./config";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_MY_VIDEOS = gql`
  query MyIPFSVideos {
    myIPFSVideos {
      id
      title
      description
      ipfsHash
      ipfsUrl
      thumbnailUrl
      source
      fileSize
      mimeType
      tags
      viewCount
      isPublic
      createdAt
      updatedAt
    }
    myIPFSVideoCount
    totalIPFSStorageUsed
  }
`;

const GET_PUBLIC_VIDEOS = gql`
  query PublicIPFSVideos($limit: Float!) {
    publicIPFSVideos(limit: $limit) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      thumbnailUrl
      uploadedByName
      viewCount
      tags
      createdAt
    }
  }
`;

const DELETE_VIDEO = gql`
  mutation DeleteIPFSVideo($id: String!) {
    deleteIPFSVideo(id: $id)
  }
`;

interface Video {
  id: string;
  title: string;
  description?: string;
  ipfsHash: string;
  ipfsUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  viewCount: number;
  isPublic: boolean;
  tags?: string[];
  createdAt: string;
  uploadedByName?: string;
}

const VideoCard: React.FC<{
  video: Video;
  isOwner: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ video, isOwner, onView, onEdit, onDelete }) => {
  const { colorMode } = useColorMode();
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const toast = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      cursor="pointer"
      onClick={onView}
      _hover={{ shadow: 'lg', borderColor: 'blue.400' }}
    >
      <CardBody>
        {/* Video Thumbnail or Placeholder */}
        <Box
          h="200px"
          bg="gray.800"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={4}
          position="relative"
          overflow="hidden"
        >
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              objectFit="cover"
              w="full"
              h="full"
              borderRadius="md"
            />
          ) : video.ipfsUrl || video.ipfsHash ? (
            // Use video element to show first frame as thumbnail
            <Box position="relative" w="full" h="full">
              <video
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '0.375rem'
                }}
                preload="metadata"
                muted
              >
                <source
                  src={`${video.ipfsUrl?.startsWith('http')
                    ? video.ipfsUrl
                    : IPFS_CONFIG.getIPFSUrl(video.ipfsHash || video.ipfsUrl)}#t=0.1`}
                  type="video/mp4"
                />
              </video>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="blackAlpha.600"
                borderRadius="full"
                p={3}
              >
                <FiPlay size={24} color="white" />
              </Box>
            </Box>
          ) : (
            <FiVideo size={48} color="gray" />
          )}

          {/* View count badge */}
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="blackAlpha"
            variant="solid"
          >
            <HStack spacing={1}>
              <FiEye size={12} />
              <Text fontSize="xs">{video.viewCount}</Text>
            </HStack>
          </Badge>

          {/* Public/Private badge */}
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme={video.isPublic ? 'green' : 'gray'}
            variant="solid"
          >
            {video.isPublic ? <FiGlobe size={12} /> : <FiLock size={12} />}
          </Badge>
        </Box>

        {/* Video Info */}
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" align="start">
            <Text fontWeight="bold" fontSize="md" color={textPrimary} flex="1" wordBreak="break-word">
              {video.title}
            </Text>
            {isOwner && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList onClick={(e) => e.stopPropagation()}>
                  <MenuItem icon={<FiEdit />} onClick={onEdit}>
                    Edit
                  </MenuItem>
                  <MenuItem icon={<FiCopy />} onClick={() => copyToClipboard(video.ipfsHash)}>
                    Copy IPFS Hash
                  </MenuItem>
                  <MenuItem icon={<FiExternalLink />} as="a" href={IPFS_CONFIG.getIPFSUrl(video.ipfsHash)} target="_blank">
                    Open in IPFS
                  </MenuItem>
                  <MenuItem icon={<FiTrash2 />} onClick={onDelete} color="red.500">
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>

          {video.description && (
            <Text fontSize="sm" color={textSecondary} noOfLines={2}>
              {video.description}
            </Text>
          )}

          {video.tags && video.tags.length > 0 && (
            <HStack spacing={1} flexWrap="wrap">
              {video.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} size="sm" colorScheme="blue">
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 3 && (
                <Badge size="sm">+{video.tags.length - 3}</Badge>
              )}
            </HStack>
          )}

          <HStack justify="space-between" fontSize="xs" color={textSecondary}>
            <Text>{formatFileSize(video.fileSize)}</Text>
            <Text>{new Date(video.createdAt).toLocaleDateString()}</Text>
          </HStack>

          {!isOwner && video.uploadedByName && (
            <Text fontSize="xs" color={textSecondary}>
              By {video.uploadedByName}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const VideoGallery: React.FC = () => {
  usePageTitle("Video Gallery");
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
  const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: myVideosData, loading: loadingMyVideos, refetch: refetchMyVideos } = useQuery(GET_MY_VIDEOS);
  const { data: publicVideosData, loading: loadingPublicVideos } = useQuery(GET_PUBLIC_VIDEOS, {
    variables: { limit: 50 }
  });

  const [deleteVideo] = useMutation(DELETE_VIDEO, {
    onCompleted: () => {
      toast({
        title: 'Video deleted',
        status: 'success',
        duration: 3000,
      });
      refetchMyVideos();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete video',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  const handleDeleteVideo = () => {
    if (selectedVideo) {
      deleteVideo({ variables: { id: selectedVideo.id } });
    }
  };

  const formatStorageSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={youtubeToIPFSModuleConfig} />

      <Box flex="1">
        <Container maxW="7xl" py={8}>
          <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color={textPrimary}>IPFS Video Gallery</Heading>
              <Text color={textMuted}>
                Your decentralized video library
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiHash />}
                variant="outline"
                onClick={() => navigate('/youtubetoipfs/add-by-cid')}
              >
                Add by CID
              </Button>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={() => navigate('/youtubetoipfs/upload')}
              >
                Upload Video
              </Button>
            </HStack>
          </HStack>

          {/* Stats */}
          {myVideosData && (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>My Videos</StatLabel>
                    <StatNumber color={textPrimary}>{myVideosData.myIPFSVideoCount}</StatNumber>
                    <StatHelpText color="gray.400">
                      <HStack>
                        <FiVideo />
                        <Text>Total uploads</Text>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Storage Used</StatLabel>
                    <StatNumber color={textPrimary}>{formatStorageSize(myVideosData.totalIPFSStorageUsed)}</StatNumber>
                    <StatHelpText color="gray.400">
                      <HStack>
                        <FiHardDrive />
                        <Text>IPFS storage</Text>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
                <CardBody>
                  <Stat>
                    <StatLabel color={textMuted}>Total Views</StatLabel>
                    <StatNumber color={textPrimary}>
                      {myVideosData.myIPFSVideos.reduce((sum: number, v: Video) => sum + v.viewCount, 0)}
                    </StatNumber>
                    <StatHelpText color="gray.400">
                      <HStack>
                        <FiEye />
                        <Text>Across all videos</Text>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Tabs colorScheme="blue">
            <TabList>
              <Tab>My Videos</Tab>
              <Tab>Public Gallery</Tab>
            </TabList>

            <TabPanels>
              {/* My Videos Tab */}
              <TabPanel>
                {loadingMyVideos ? (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                ) : myVideosData?.myIPFSVideos?.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {myVideosData.myIPFSVideos.map((video: Video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        isOwner={true}
                        onView={() => navigate(`/youtubetoipfs/video/${video.id}`)}
                        onEdit={() => navigate(`/youtubetoipfs/video/${video.id}/edit`)}
                        onDelete={() => {
                          setSelectedVideo(video);
                          onOpen();
                        }}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <FiVideo size={48} color="gray" />
                      <Text color={textMuted}>No videos uploaded yet</Text>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        onClick={() => navigate('/youtubetoipfs/upload')}
                      >
                        Upload Your First Video
                      </Button>
                    </VStack>
                  </Center>
                )}
              </TabPanel>

              {/* Public Gallery Tab */}
              <TabPanel>
                {loadingPublicVideos ? (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                ) : publicVideosData?.publicIPFSVideos?.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {publicVideosData.publicIPFSVideos.map((video: Video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        isOwner={false}
                        onView={() => navigate(`/youtubetoipfs/video/${video.id}`)}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <FiGlobe size={48} color="gray" />
                      <Text color={textMuted}>No public videos available</Text>
                    </VStack>
                  </Center>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
          </VStack>
        </Container>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={cardGradientBg}
          border="1px solid"
          borderColor={cardBorder}
        >
          <ModalHeader color={textPrimary}>Delete Video</ModalHeader>
          <ModalCloseButton color={textPrimary} />
          <ModalBody>
            <Text color={textPrimary}>
              Are you sure you want to delete "{selectedVideo?.title}"? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color={textPrimary}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteVideo}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};

export default VideoGallery;