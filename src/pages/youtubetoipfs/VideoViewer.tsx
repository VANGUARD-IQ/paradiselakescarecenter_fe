import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  useToast,
  IconButton,
  Link as ChakraLink,
  Divider,
  Wrap,
  WrapItem,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
  Spinner,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiExternalLink,
  FiCopy,
  FiShare2,
  FiEye,
  FiCalendar,
  FiHardDrive,
  FiGlobe,
  FiLock,
  FiEdit,
  FiMaximize,
  FiMinimize,
  FiPlay,
  FiDownload
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import youtubeToIPFSModuleConfig from "./moduleConfig";
import { IPFS_CONFIG } from "./config";
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

const VideoViewer: React.FC = () => {
  usePageTitle("Video Viewer");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { colorMode, setColorMode } = useColorMode();

  // Use proper color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareUrl, setShareUrl] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(true); // Default to theater mode

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('auth_token');

  // Set dark mode by default for non-logged in users
  useEffect(() => {
    if (!isLoggedIn && colorMode !== 'dark') {
      setColorMode('dark');
    }
  }, [isLoggedIn, colorMode, setColorMode]);

  // Check if id is IPFS hash (starts with Qm) or database ID
  const isIPFSHash = id?.startsWith('Qm');

  const { data, loading, error } = useQuery(
    isIPFSHash ? GET_VIDEO_BY_HASH : GET_VIDEO,
    {
      variables: isIPFSHash ? { ipfsHash: id } : { id },
      skip: !id
    }
  );

  const video = data?.ipfsVideo || data?.ipfsVideoByHash;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      status: 'success',
      duration: 2000,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/youtubetoipfs/video/${video.ipfsHash}`;
    setShareUrl(url);
    onOpen();
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

  if (error || !video) {
    return (
      <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box flex="1">
          <Container maxW="6xl" py={8}>
            <Center>
              <VStack spacing={4}>
                <Text fontSize="xl" color={mutedTextColor}>
                  {error ? 'Error loading video' : 'Video not found'}
                </Text>
                {!video?.isPublic && !isLoggedIn && (
                  <Text fontSize="md" color={mutedTextColor}>
                    This video is private. Please log in to view it.
                  </Text>
                )}
                {isLoggedIn ? (
                  <Button onClick={() => navigate('/youtubetoipfs')}>
                    Back to Gallery
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/login')}>
                    Log In
                  </Button>
                )}
              </VStack>
            </Center>
          </Container>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  // Check if video is private and user is not logged in
  if (!video.isPublic && !isLoggedIn) {
    return (
      <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <Box flex="1">
          <Container maxW="6xl" py={8}>
            <Center>
              <VStack spacing={4}>
                <Text fontSize="xl" color={mutedTextColor}>
                  This video is private
                </Text>
                <Text fontSize="md" color={mutedTextColor}>
                  Please log in to view this content.
                </Text>
                <Button onClick={() => navigate('/login')}>
                  Log In
                </Button>
              </VStack>
            </Center>
          </Container>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const isOwner = video.uploadedBy === localStorage.getItem('userId'); // Assuming userId is stored

  return (
    <Box bg={bg} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      {isLoggedIn && <ModuleBreadcrumb moduleConfig={youtubeToIPFSModuleConfig} />}

      <Box flex="1">
        <Container maxW={isTheaterMode ? "100%" : "6xl"} px={isTheaterMode ? 0 : 6} py={isTheaterMode ? 0 : 8}>
          {/* Theater Mode Video Player */}
          {isTheaterMode && (
            <Box bg="black" position="relative" mb={4}>
              <Box maxW="1920px" mx="auto" position="relative">
                <Box
                  position="relative"
                  paddingTop="56.25%" // 16:9 aspect ratio
                  bg="black"
                >
                  <video
                    controls
                    autoPlay
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onLoadStart={() => {
                      console.log('🎬 [VIDEO] Load started - Theater Mode');
                    }}
                    onLoadedMetadata={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      console.log('📊 [VIDEO] Metadata loaded:', JSON.stringify({
                        duration: videoEl.duration,
                        videoWidth: videoEl.videoWidth,
                        videoHeight: videoEl.videoHeight,
                        readyState: videoEl.readyState,
                        networkState: videoEl.networkState
                      }, null, 2));
                    }}
                    onCanPlay={() => {
                      console.log('▶️ [VIDEO] Can play');
                    }}
                    onError={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      console.error('❌ [VIDEO] Error occurred:', JSON.stringify({
                        error: videoEl.error,
                        errorCode: videoEl.error?.code,
                        errorMessage: videoEl.error?.message,
                        networkState: videoEl.networkState,
                        readyState: videoEl.readyState,
                        currentSrc: videoEl.currentSrc
                      }, null, 2));
                    }}
                    onProgress={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      if (videoEl.buffered.length > 0) {
                        const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
                        const bufferedPercent = (bufferedEnd / videoEl.duration) * 100;
                        console.log(`⏳ [VIDEO] Buffering: ${bufferedPercent.toFixed(1)}%`);
                      }
                    }}
                    onStalled={() => {
                      console.warn('⚠️ [VIDEO] Playback stalled');
                    }}
                    onWaiting={() => {
                      console.log('⏸️ [VIDEO] Waiting for data...');
                    }}
                  >
                    <source
                      src={(() => {
                        const token = localStorage.getItem('auth_token');
                        let videoUrl = '';

                        console.log('🎥 [VIDEO] Building video URL for Theater Mode');
                        console.log('🎥 [VIDEO] Details:', JSON.stringify({
                          isPrivateFile: video.isPrivateFile,
                          ipfsHash: video.ipfsHash,
                          ipfsUrl: video.ipfsUrl,
                          hasToken: !!token,
                          tokenLength: token?.length || 0
                        }, null, 2));

                        if (video.isPrivateFile) {
                          // Use proxy endpoint for private files with token in URL
                          // Ensure token is properly encoded for URL
                          const encodedToken = encodeURIComponent(token || '');

                          // Determine the correct proxy URL based on environment
                          const isProduction = window.location.hostname !== 'localhost';
                          const proxyBaseUrl = isProduction
                            ? 'https://api.tommillerservices.com'
                            : 'http://localhost:4000';

                          videoUrl = `${proxyBaseUrl}/api/ipfs/proxy/${video.ipfsHash}?token=${encodedToken}`;
                          console.log('🔒 [VIDEO] Private file - Using proxy URL with encoded token');
                          console.log('🌍 [VIDEO] Environment:', isProduction ? 'Production' : 'Development');
                          console.log('🔗 [VIDEO] Full URL:', videoUrl.substring(0, 150) + '...');
                          console.log('🔑 [VIDEO] Token present:', !!token, 'Length:', token?.length || 0);
                        } else if (video.ipfsUrl?.startsWith('http')) {
                          videoUrl = video.ipfsUrl;
                          console.log('🌐 [VIDEO] Public file - Using direct URL:', videoUrl);
                        } else {
                          videoUrl = IPFS_CONFIG.getIPFSUrl(video.ipfsHash || video.ipfsUrl, false);
                          console.log('📡 [VIDEO] Using IPFS gateway URL:', videoUrl);
                        }

                        return videoUrl;
                      })()}
                      type={video.mimeType || 'video/mp4'}
                    />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              </Box>
            </Box>
          )}

          <Container maxW="6xl" py={isTheaterMode ? 4 : 0}>
          <VStack spacing={6} align="stretch">
          {/* Header with Controls */}
          <HStack justify="space-between" wrap="wrap" spacing={2}>
            {isLoggedIn ? (
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/youtubetoipfs')}
                size="md"
              >
                Back to Gallery
              </Button>
            ) : (
              <Box />
            )}

            <HStack spacing={2}>
              <Button
                leftIcon={isTheaterMode ? <FiMinimize /> : <FiMaximize />}
                variant="outline"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                size="md"
                title={isTheaterMode ? "Exit Theater Mode" : "Enter Theater Mode"}
              >
                {isTheaterMode ? "Normal View" : "Theater Mode"}
              </Button>
              {isOwner && isLoggedIn && (
                <Button
                  leftIcon={<FiEdit />}
                  variant="outline"
                  onClick={() => navigate(`/youtubetoipfs/video/${video.id}/edit`)}
                  size="md"
                >
                  Edit
                </Button>
              )}
              <Button
                leftIcon={<FiShare2 />}
                onClick={handleShare}
                colorScheme="blue"
                size="md"
              >
                Share
              </Button>
            </HStack>
          </HStack>

          {/* Normal Mode Video Player */}
          {!isTheaterMode && (
            <Card
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="xl"
              overflow="hidden"
            >
              <CardBody p={0}>
                <Box bg="black" position="relative">
                  <video
                    controls
                    autoPlay
                    width="100%"
                    style={{
                      maxHeight: '600px',
                      display: 'block'
                    }}
                    onLoadStart={() => {
                      console.log('🎬 [VIDEO] Load started - Normal Mode');
                    }}
                    onLoadedMetadata={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      console.log('📊 [VIDEO] Metadata loaded:', JSON.stringify({
                        duration: videoEl.duration,
                        videoWidth: videoEl.videoWidth,
                        videoHeight: videoEl.videoHeight,
                        readyState: videoEl.readyState,
                        networkState: videoEl.networkState
                      }, null, 2));
                    }}
                    onCanPlay={() => {
                      console.log('▶️ [VIDEO] Can play');
                    }}
                    onError={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      console.error('❌ [VIDEO] Error occurred:', JSON.stringify({
                        error: videoEl.error,
                        errorCode: videoEl.error?.code,
                        errorMessage: videoEl.error?.message,
                        networkState: videoEl.networkState,
                        readyState: videoEl.readyState,
                        currentSrc: videoEl.currentSrc
                      }, null, 2));
                    }}
                    onProgress={(e) => {
                      const videoEl = e.target as HTMLVideoElement;
                      if (videoEl.buffered.length > 0) {
                        const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
                        const bufferedPercent = (bufferedEnd / videoEl.duration) * 100;
                        console.log(`⏳ [VIDEO] Buffering: ${bufferedPercent.toFixed(1)}%`);
                      }
                    }}
                    onStalled={() => {
                      console.warn('⚠️ [VIDEO] Playback stalled');
                    }}
                    onWaiting={() => {
                      console.log('⏸️ [VIDEO] Waiting for data...');
                    }}
                  >
                    <source
                      src={(() => {
                        const token = localStorage.getItem('auth_token');
                        let videoUrl = '';

                        console.log('🎥 [VIDEO] Building video URL for Normal Mode');
                        console.log('🎥 [VIDEO] Details:', JSON.stringify({
                          isPrivateFile: video.isPrivateFile,
                          ipfsHash: video.ipfsHash,
                          ipfsUrl: video.ipfsUrl,
                          hasToken: !!token,
                          tokenLength: token?.length || 0
                        }, null, 2));

                        if (video.isPrivateFile) {
                          // Use proxy endpoint for private files with token in URL
                          // Ensure token is properly encoded for URL
                          const encodedToken = encodeURIComponent(token || '');

                          // Determine the correct proxy URL based on environment
                          const isProduction = window.location.hostname !== 'localhost';
                          const proxyBaseUrl = isProduction
                            ? 'https://api.tommillerservices.com'
                            : 'http://localhost:4000';

                          videoUrl = `${proxyBaseUrl}/api/ipfs/proxy/${video.ipfsHash}?token=${encodedToken}`;
                          console.log('🔒 [VIDEO] Private file - Using proxy URL with encoded token');
                          console.log('🌍 [VIDEO] Environment:', isProduction ? 'Production' : 'Development');
                          console.log('🔗 [VIDEO] Full URL:', videoUrl.substring(0, 150) + '...');
                          console.log('🔑 [VIDEO] Token present:', !!token, 'Length:', token?.length || 0);
                        } else if (video.ipfsUrl?.startsWith('http')) {
                          videoUrl = video.ipfsUrl;
                          console.log('🌐 [VIDEO] Public file - Using direct URL:', videoUrl);
                        } else {
                          videoUrl = IPFS_CONFIG.getIPFSUrl(video.ipfsHash || video.ipfsUrl, false);
                          console.log('📡 [VIDEO] Using IPFS gateway URL:', videoUrl);
                        }

                        return videoUrl;
                      })()}
                      type={video.mimeType || 'video/mp4'}
                    />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              </CardBody>
            </Card>
          )}

          {/* Video Info */}
          <Card
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            boxShadow="md"
            backdropFilter="blur(10px)"
          >
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2} flex="1">
                    <Heading size="lg" color={textColor}>{video.title}</Heading>
                    <HStack spacing={4}>
                      <Badge colorScheme={video.isPublic ? 'green' : 'gray'}>
                        {video.isPublic ? (
                          <HStack spacing={1}>
                            <FiGlobe size={12} />
                            <Text>Public</Text>
                          </HStack>
                        ) : (
                          <HStack spacing={1}>
                            <FiLock size={12} />
                            <Text>Private</Text>
                          </HStack>
                        )}
                      </Badge>
                      <HStack color={mutedTextColor}>
                        <FiEye />
                        <Text fontSize="sm">{video.viewCount} views</Text>
                      </HStack>
                      <HStack color={mutedTextColor}>
                        <FiCalendar />
                        <Text fontSize="sm">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>

                  <VStack align="end" spacing={2}>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Uploaded by {video.uploadedByName || 'Anonymous'}
                    </Text>
                  </VStack>
                </HStack>

                {video.description && (
                  <>
                    <Divider borderColor={cardBorder} />
                    <Box>
                      <Text fontWeight="bold" mb={2} color={textColor}>Description</Text>
                      <Text color={mutedTextColor}>{video.description}</Text>
                    </Box>
                  </>
                )}

                {video.tags && video.tags.length > 0 && (
                  <>
                    <Divider borderColor={cardBorder} />
                    <Box>
                      <Text fontWeight="bold" mb={2} color={textColor}>Tags</Text>
                      <Wrap>
                        {video.tags.map((tag: string) => (
                          <WrapItem key={tag}>
                            <Tag colorScheme="blue">{tag}</Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  </>
                )}

                <Divider borderColor={cardBorder} />

                {/* Technical Details */}
                <Box>
                  <Text fontWeight="bold" mb={3} color={textColor}>Technical Details</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Stat>
                      <StatLabel color={mutedTextColor}>IPFS Hash</StatLabel>
                      <HStack>
                        <Text fontSize="sm" fontFamily="mono" noOfLines={1} color={textColor}>
                          {video.ipfsHash}
                        </Text>
                        <IconButton
                          icon={<FiCopy />}
                          aria-label="Copy IPFS hash"
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(video.ipfsHash, 'IPFS hash')}
                        />
                      </HStack>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>File Size</StatLabel>
                      <StatNumber fontSize="md" color={textColor}>
                        <HStack>
                          <FiHardDrive />
                          <Text>{formatFileSize(video.fileSize)}</Text>
                        </HStack>
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>MIME Type</StatLabel>
                      <StatNumber fontSize="md" color={textColor}>{video.mimeType || 'video/mp4'}</StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>Source</StatLabel>
                      <StatNumber fontSize="md" color={textColor}>{video.source}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Divider borderColor={cardBorder} />

                {/* IPFS Links */}
                <Box>
                  <Text fontWeight="bold" mb={3} color={textColor}>IPFS Gateways</Text>
                  <VStack align="stretch" spacing={2}>
                    {video.isPrivateFile ? (
                      <>
                        <HStack>
                          <ChakraLink
                            href={IPFS_CONFIG.getIPFSUrl(video.ipfsHash, true)}
                            isExternal
                            color="blue.500"
                          >
                            Private Pinata Gateway (Authenticated) <FiExternalLink style={{ display: 'inline' }} />
                          </ChakraLink>
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>
                          This is a private file and requires authentication to access via other gateways.
                        </Text>
                      </>
                    ) : (
                      <>
                        <HStack>
                          <ChakraLink
                            href={IPFS_CONFIG.getIPFSUrl(video.ipfsHash, false)}
                            isExternal
                            color="blue.500"
                          >
                            Public Pinata Gateway <FiExternalLink style={{ display: 'inline' }} />
                          </ChakraLink>
                        </HStack>
                        <HStack>
                          <ChakraLink
                            href={`https://ipfs.io/ipfs/${video.ipfsHash}`}
                            isExternal
                            color="blue.500"
                          >
                            IPFS.io Gateway <FiExternalLink style={{ display: 'inline' }} />
                          </ChakraLink>
                        </HStack>
                        <HStack>
                          <ChakraLink
                            href={`https://gateway.ipfs.io/ipfs/${video.ipfsHash}`}
                            isExternal
                            color="blue.500"
                          >
                            Gateway.ipfs.io <FiExternalLink style={{ display: 'inline' }} />
                          </ChakraLink>
                        </HStack>
                      </>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
          </VStack>
          </Container>
        </Container>
      </Box>

      {/* Share Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
        >
          <ModalHeader color={textColor}>Share Video</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color={textColor}>Share this video using the link below:</Text>
              <InputGroup>
                <Input
                  value={shareUrl}
                  isReadOnly
                  bg={inputBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  color={textColor}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl, 'Share link')}
                  >
                    Copy
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text fontSize="sm" color={mutedTextColor}>
                Anyone with this link can view the video on IPFS
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} color={textColor}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FooterWithFourColumns />
    </Box>
  );
};

// Add missing import
import { SimpleGrid } from '@chakra-ui/react';

export default VideoViewer;