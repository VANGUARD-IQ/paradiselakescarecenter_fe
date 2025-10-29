import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  IconButton,
  Tooltip,
  Image,
  Link as ChakraLink,
  Wrap,
  WrapItem,
  Tag
} from '@chakra-ui/react';
import {
  FiVideo,
  FiUser,
  FiEye,
  FiTrash2,
  FiExternalLink,
  FiCopy,
  FiGlobe,
  FiLock,
  FiCalendar,
  FiHardDrive,
  FiPlay,
  FiDownload
} from 'react-icons/fi';
import { useQuery, useMutation, gql } from '@apollo/client';
import { format } from 'date-fns';
import { getColor } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { useNavigate } from 'react-router-dom';
import { IPFS_CONFIG } from "./config";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL queries and mutations
// Note: This query needs to be implemented in the backend
// For now, we'll use the public videos query as a placeholder
const GET_ALL_IPFS_VIDEOS = gql`
  query GetPublicIPFSVideos($limit: Float!) {
    publicIPFSVideos(limit: $limit) {
      id
      title
      description
      ipfsHash
      ipfsUrl
      thumbnailUrl
      originalUrl
      source
      duration
      fileSize
      mimeType
      uploadedBy
      uploadedByName
      tags
      viewCount
      isPublic
      youtubeVideoId
      youtubeChannelName
      youtubeChannelId
      createdAt
      updatedAt
      tenantId
    }
  }
`;

const DELETE_IPFS_VIDEO = gql`
  mutation DeleteIPFSVideo($id: String!) {
    deleteIPFSVideo(id: $id)
  }
`;

interface IPFSVideo {
  id: string;
  title: string;
  description?: string;
  ipfsHash: string;
  ipfsUrl: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  source: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  tags?: string[];
  viewCount: number;
  isPublic: boolean;
  youtubeVideoId?: string;
  youtubeChannelName?: string;
  youtubeChannelId?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

const IPFSVideosAdmin: React.FC = () => {
  usePageTitle("IPFS Videos Admin");
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [selectedVideo, setSelectedVideo] = useState<IPFSVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterTenant, setFilterTenant] = useState('all');

  // GraphQL queries
  const { data: videosData, loading: videosLoading, error: videosError, refetch: refetchVideos } = useQuery(GET_ALL_IPFS_VIDEOS, {
    variables: { limit: 1000 } // Get a large number of public videos for now
  });

  // GraphQL mutations
  const [deleteVideo] = useMutation(DELETE_IPFS_VIDEO, {
    onCompleted: () => {
      toast({
        title: 'Video deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchVideos();
      onDeleteClose();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting video',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const bg = getColor("background.main");
  const cardGradientBg = getColor("background.cardGradient");
  const cardBorder = getColor("border.darkCard");
  const textColor = "white";
  const mutedTextColor = "gray.300";
  const labelColor = "gray.400";

  const videos = videosData?.publicIPFSVideos || [];

  // Filter videos based on search and filters
  const filteredVideos = videos.filter((video: IPFSVideo) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.uploadedByName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'all' || video.source === filterSource;
    const matchesVisibility = filterVisibility === 'all' ||
                             (filterVisibility === 'public' && video.isPublic) ||
                             (filterVisibility === 'private' && !video.isPublic);
    const matchesTenant = filterTenant === 'all' || video.tenantId === filterTenant;

    return matchesSearch && matchesSource && matchesVisibility && matchesTenant;
  });

  const handleDeleteVideo = async () => {
    if (selectedVideo) {
      await deleteVideo({ variables: { id: selectedVideo.id } });
    }
  };

  const handleCopyToClipboard = (text: string, label: string = 'Text') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${label} copied to clipboard`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'YOUTUBE': return 'red';
      case 'UPLOAD': return 'blue';
      case 'OTHER': return 'gray';
      default: return 'gray';
    }
  };

  const getUniqueTenants = (): string[] => {
    const tenantIds = Array.from(new Set(videos.map((v: IPFSVideo) => v.tenantId).filter(Boolean))) as string[];
    return tenantIds;
  };

  const openViewModal = (video: IPFSVideo) => {
    setSelectedVideo(video);
    onViewOpen();
  };

  const openDeleteModal = (video: IPFSVideo) => {
    setSelectedVideo(video);
    onDeleteOpen();
  };

  if (videosLoading) {
    return (
      <Box minH="100vh" bg={bg} p={6} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={textColor} />
      </Box>
    );
  }

  if (videosError) {
    return (
      <Box minH="100vh" bg={bg}>
        <NavbarWithCallToAction />
        <Box p={6}>
          <Card bg={cardGradientBg} border="1px solid" borderColor={cardBorder}>
            <CardBody>
              <VStack spacing={4}>
                <Text color="red.400" fontSize="lg">Error loading IPFS videos</Text>
                <Text color={textColor} fontSize="sm">{videosError.message}</Text>
                <Button onClick={() => refetchVideos()} colorScheme="blue">
                  Try Again
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={youtubeToIPFSModuleConfig} />
      <Box p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch" maxW={{ base: "100%", lg: "none" }}>
          {/* Header */}
          <Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={textColor} mb={2}>
              🎬 IPFS Videos Administration
            </Text>
            <Text color={mutedTextColor} fontSize={{ base: "md", md: "lg" }} lineHeight="1.6">
              Manage all IPFS videos across all users and tenants. View detailed information, monitor usage, and perform administrative actions.
            </Text>

            {/* Warning about backend limitation */}
            <Box mt={4} p={3} bg="orange.900" borderRadius="md" border="1px solid" borderColor="orange.700">
              <Text color="orange.200" fontSize="sm">
                ⚠️ <strong>Backend Note:</strong> Currently showing public videos only. The backend needs an <code>allIPFSVideos</code> query with admin permissions to show all videos across all users and tenants.
              </Text>
            </Box>
          </Box>

          {/* Stats Cards */}
          <HStack spacing={{ base: 2, md: 4 }} direction={{ base: "column", md: "row" }} align="stretch">
            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={cardBorder}
              flex={1}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1} flex="1">
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Total Videos</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {videos.length}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      Across all tenants
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="blue.500" color="white">
                    <FiVideo size={24} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={cardBorder}
              flex={1}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1} flex="1">
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Total Views</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {videos.reduce((sum: number, video: IPFSVideo) => sum + video.viewCount, 0)}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      All videos combined
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="green.500" color="white">
                    <FiEye size={24} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={cardBorder}
              flex={1}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1} flex="1">
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Total Storage</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {formatFileSize(videos.reduce((sum: number, video: IPFSVideo) => sum + (video.fileSize || 0), 0))}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      IPFS storage used
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="purple.500" color="white">
                    <FiHardDrive size={24} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px solid"
              borderColor={cardBorder}
              flex={1}
            >
              <CardBody p={{ base: 4, md: 6 }}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1} flex="1">
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">Public Videos</Text>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                      {videos.filter((v: IPFSVideo) => v.isPublic).length}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" display={{ base: "none", md: "block" }}>
                      Publicly accessible
                    </Text>
                  </VStack>
                  <Box p={{ base: 2, md: 3 }} borderRadius="lg" bg="orange.500" color="white">
                    <FiGlobe size={24} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </HStack>

          {/* Filters */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Search videos by title, description, or uploader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                  _placeholder={{ color: "gray.500" }}
                />
                <HStack spacing={3} justifyContent="space-between">
                  <HStack spacing={3} flex="1">
                    <Select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      flex={1}
                    >
                      <option value="all">All Sources</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="UPLOAD">Upload</option>
                      <option value="OTHER">Other</option>
                    </Select>
                    <Select
                      value={filterVisibility}
                      onChange={(e) => setFilterVisibility(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      flex={1}
                    >
                      <option value="all">All Visibility</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </Select>
                    <Select
                      value={filterTenant}
                      onChange={(e) => setFilterTenant(e.target.value)}
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor={cardBorder}
                      color={textColor}
                      flex={1}
                    >
                      <option value="all">All Tenants</option>
                      {getUniqueTenants().map((tenantId) => (
                        <option key={tenantId} value={tenantId}>
                          {tenantId}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Videos Table */}
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px solid"
            borderColor={cardBorder}
          >
            <CardBody p={{ base: 2, md: 6 }}>
              <Box overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th color={labelColor}>Video</Th>
                      <Th color={labelColor}>Source</Th>
                      <Th color={labelColor}>Visibility</Th>
                      <Th color={labelColor}>Uploader</Th>
                      <Th color={labelColor}>Views</Th>
                      <Th color={labelColor}>Size/Duration</Th>
                      <Th color={labelColor}>IPFS Info</Th>
                      <Th color={labelColor}>Tags</Th>
                      <Th color={labelColor}>Created</Th>
                      <Th color={labelColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredVideos.map((video: IPFSVideo) => (
                      <Tr key={video.id}>
                        <Td>
                          <HStack spacing={3}>
                            {video.thumbnailUrl ? (
                              <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                boxSize={12}
                                objectFit="cover"
                                borderRadius="md"
                              />
                            ) : (
                              <Box
                                boxSize={12}
                                bg="gray.600"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <FiVideo color="gray" />
                              </Box>
                            )}
                            <VStack align="start" spacing={0}>
                              <Text color={textColor} fontWeight="medium" fontSize="sm" noOfLines={1}>
                                {video.title}
                              </Text>
                              {video.description && (
                                <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                  {video.description}
                                </Text>
                              )}
                              <Text fontSize="xs" color="gray.500">
                                ID: {video.id.slice(0, 8)}...
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Badge colorScheme={getSourceBadgeColor(video.source)}>
                              {video.source}
                            </Badge>
                            {video.youtubeVideoId && (
                              <Text fontSize="xs" color="gray.500">
                                YT: {video.youtubeVideoId}
                              </Text>
                            )}
                            {video.youtubeChannelName && (
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {video.youtubeChannelName}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={video.isPublic ? 'green' : 'gray'}>
                            {video.isPublic ? (
                              <HStack spacing={1}>
                                <FiGlobe size={10} />
                                <Text>Public</Text>
                              </HStack>
                            ) : (
                              <HStack spacing={1}>
                                <FiLock size={10} />
                                <Text>Private</Text>
                              </HStack>
                            )}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color={textColor} fontSize="sm">
                              {video.uploadedByName || 'Anonymous'}
                            </Text>
                            {video.uploadedBy && (
                              <Text fontSize="xs" color="gray.500">
                                ID: {video.uploadedBy.slice(0, 8)}...
                              </Text>
                            )}
                            <Text fontSize="xs" color="gray.500">
                              Tenant: {video.tenantId.slice(0, 8)}...
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <FiEye size={12} />
                            <Text color={textColor} fontSize="sm">
                              {video.viewCount}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color={textColor} fontSize="sm">
                              {formatFileSize(video.fileSize)}
                            </Text>
                            <Text color={mutedTextColor} fontSize="xs">
                              {formatDuration(video.duration)}
                            </Text>
                            {video.mimeType && (
                              <Text color="gray.500" fontSize="xs">
                                {video.mimeType}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={1}>
                              <Text color={textColor} fontSize="xs" fontFamily="mono">
                                {video.ipfsHash.slice(0, 10)}...
                              </Text>
                              <Tooltip label="Copy IPFS Hash">
                                <IconButton
                                  aria-label="Copy hash"
                                  icon={<FiCopy />}
                                  size="xs"
                                  variant="ghost"
                                  color={mutedTextColor}
                                  onClick={() => handleCopyToClipboard(video.ipfsHash, 'IPFS Hash')}
                                  _hover={{ color: textColor }}
                                />
                              </Tooltip>
                            </HStack>
                            <ChakraLink
                              href={IPFS_CONFIG.getIPFSUrl(video.ipfsHash)}
                              isExternal
                              color="blue.400"
                              fontSize="xs"
                              _hover={{ color: "blue.300" }}
                            >
                              View on IPFS <FiExternalLink style={{ display: 'inline' }} />
                            </ChakraLink>
                          </VStack>
                        </Td>
                        <Td>
                          {video.tags && video.tags.length > 0 ? (
                            <Wrap>
                              {video.tags.slice(0, 2).map((tag) => (
                                <WrapItem key={tag}>
                                  <Tag size="sm" colorScheme="blue">
                                    {tag}
                                  </Tag>
                                </WrapItem>
                              ))}
                              {video.tags.length > 2 && (
                                <WrapItem>
                                  <Tag size="sm" variant="outline">
                                    +{video.tags.length - 2}
                                  </Tag>
                                </WrapItem>
                              )}
                            </Wrap>
                          ) : (
                            <Text color={mutedTextColor} fontSize="sm">
                              None
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color={mutedTextColor} fontSize="xs">
                              {format(new Date(video.createdAt), 'MMM dd, yyyy')}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {format(new Date(video.createdAt), 'HH:mm')}
                            </Text>
                            {video.updatedAt !== video.createdAt && (
                              <Text color="gray.500" fontSize="xs">
                                Updated: {format(new Date(video.updatedAt), 'MMM dd')}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Video">
                              <IconButton
                                aria-label="View video"
                                icon={<FiPlay />}
                                size="sm"
                                variant="ghost"
                                color={textColor}
                                onClick={() => navigate(`/youtubetoipfs/video/${video.id}`)}
                              />
                            </Tooltip>
                            <Tooltip label="View Details">
                              <IconButton
                                aria-label="View details"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                color={textColor}
                                onClick={() => openViewModal(video)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Video">
                              <IconButton
                                aria-label="Delete video"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                color="red.400"
                                onClick={() => openDeleteModal(video)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {filteredVideos.length === 0 && (
                  <Box py={8} textAlign="center">
                    <Text color={mutedTextColor}>No videos found</Text>
                  </Box>
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Video Details Modal */}
          <Modal isOpen={isViewOpen} onClose={onViewClose} size={{ base: "full", md: "xl" }}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              margin={{ base: 0, md: "auto" }}
              borderRadius={{ base: 0, md: "md" }}
              maxH={{ base: "100vh", md: "90vh" }}
            >
              <ModalHeader color={textColor} fontSize={{ base: "lg", md: "xl" }}>
                Video Details
                {selectedVideo && (
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    {selectedVideo.title}
                  </Text>
                )}
              </ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody pb={6} maxH="60vh" overflowY="auto">
                {selectedVideo && (
                  <VStack spacing={4} align="stretch">
                    {/* Video Preview */}
                    {selectedVideo.thumbnailUrl && (
                      <Box>
                        <Text color="gray.300" fontSize="sm" mb={2}>
                          Thumbnail
                        </Text>
                        <Image
                          src={selectedVideo.thumbnailUrl}
                          alt={selectedVideo.title}
                          maxH="200px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      </Box>
                    )}

                    {/* Basic Info */}
                    <Box>
                      <Text color="gray.300" fontSize="sm" mb={2}>
                        Basic Information
                      </Text>
                      <VStack align="stretch" spacing={2} p={3} bg="whiteAlpha.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Title:</Text>
                          <Text color={textColor} fontSize="sm">{selectedVideo.title}</Text>
                        </HStack>
                        {selectedVideo.description && (
                          <HStack justify="space-between" align="start">
                            <Text color="gray.400" fontSize="sm">Description:</Text>
                            <Text color={textColor} fontSize="sm" textAlign="right" maxW="60%">
                              {selectedVideo.description}
                            </Text>
                          </HStack>
                        )}
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Source:</Text>
                          <Badge colorScheme={getSourceBadgeColor(selectedVideo.source)}>
                            {selectedVideo.source}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Visibility:</Text>
                          <Badge colorScheme={selectedVideo.isPublic ? 'green' : 'gray'}>
                            {selectedVideo.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Views:</Text>
                          <Text color={textColor} fontSize="sm">{selectedVideo.viewCount}</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Technical Details */}
                    <Box>
                      <Text color="gray.300" fontSize="sm" mb={2}>
                        Technical Details
                      </Text>
                      <VStack align="stretch" spacing={2} p={3} bg="whiteAlpha.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">File Size:</Text>
                          <Text color={textColor} fontSize="sm">{formatFileSize(selectedVideo.fileSize)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Duration:</Text>
                          <Text color={textColor} fontSize="sm">{formatDuration(selectedVideo.duration)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">MIME Type:</Text>
                          <Text color={textColor} fontSize="sm">{selectedVideo.mimeType || 'Unknown'}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">IPFS Hash:</Text>
                          <HStack>
                            <Text color={textColor} fontSize="xs" fontFamily="mono">
                              {selectedVideo.ipfsHash.slice(0, 15)}...
                            </Text>
                            <IconButton
                              aria-label="Copy hash"
                              icon={<FiCopy />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleCopyToClipboard(selectedVideo.ipfsHash, 'IPFS Hash')}
                            />
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Upload Info */}
                    <Box>
                      <Text color="gray.300" fontSize="sm" mb={2}>
                        Upload Information
                      </Text>
                      <VStack align="stretch" spacing={2} p={3} bg="whiteAlpha.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Uploaded By:</Text>
                          <Text color={textColor} fontSize="sm">{selectedVideo.uploadedByName || 'Anonymous'}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">User ID:</Text>
                          <Text color={textColor} fontSize="xs" fontFamily="mono">
                            {selectedVideo.uploadedBy || 'Unknown'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Tenant ID:</Text>
                          <Text color={textColor} fontSize="xs" fontFamily="mono">
                            {selectedVideo.tenantId}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Created:</Text>
                          <Text color={textColor} fontSize="sm">
                            {format(new Date(selectedVideo.createdAt), 'MMM dd, yyyy HH:mm')}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Updated:</Text>
                          <Text color={textColor} fontSize="sm">
                            {format(new Date(selectedVideo.updatedAt), 'MMM dd, yyyy HH:mm')}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* YouTube Info */}
                    {(selectedVideo.youtubeVideoId || selectedVideo.youtubeChannelName || selectedVideo.originalUrl) && (
                      <Box>
                        <Text color="gray.300" fontSize="sm" mb={2}>
                          YouTube Information
                        </Text>
                        <VStack align="stretch" spacing={2} p={3} bg="whiteAlpha.50" borderRadius="md">
                          {selectedVideo.youtubeVideoId && (
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Video ID:</Text>
                              <Text color={textColor} fontSize="sm">{selectedVideo.youtubeVideoId}</Text>
                            </HStack>
                          )}
                          {selectedVideo.youtubeChannelName && (
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Channel Name:</Text>
                              <Text color={textColor} fontSize="sm">{selectedVideo.youtubeChannelName}</Text>
                            </HStack>
                          )}
                          {selectedVideo.youtubeChannelId && (
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Channel ID:</Text>
                              <Text color={textColor} fontSize="sm">{selectedVideo.youtubeChannelId}</Text>
                            </HStack>
                          )}
                          {selectedVideo.originalUrl && (
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Original URL:</Text>
                              <ChakraLink
                                href={selectedVideo.originalUrl}
                                isExternal
                                color="blue.400"
                                fontSize="sm"
                              >
                                View Original <FiExternalLink style={{ display: 'inline' }} />
                              </ChakraLink>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {/* Tags */}
                    {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                      <Box>
                        <Text color="gray.300" fontSize="sm" mb={2}>
                          Tags
                        </Text>
                        <Wrap>
                          {selectedVideo.tags.map((tag) => (
                            <WrapItem key={tag}>
                              <Tag size="sm" colorScheme="blue">
                                {tag}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )}
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onViewClose} color={textColor}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
            >
              <ModalHeader color={textColor}>Delete Video</ModalHeader>
              <ModalCloseButton color={textColor} />
              <ModalBody>
                <Text color={textColor}>
                  Are you sure you want to delete "{selectedVideo?.title}"? This action cannot be undone and will remove the video from IPFS.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onDeleteClose} color={textColor}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteVideo}>
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default IPFSVideosAdmin;