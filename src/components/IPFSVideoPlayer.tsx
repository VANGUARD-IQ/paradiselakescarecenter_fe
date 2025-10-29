import React, { useState, useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    AspectRatio,
    Card,
    CardBody,
    Badge,
    IconButton,
    useColorMode,
    Tooltip,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getColor } from '../brandConfig';
import { IPFS_CONFIG } from '../pages/youtubetoipfs/config';

interface InstructionalVideo {
    ipfsHash: string;
    title: string;
    description?: string;
    ipfsUrl?: string;
}

interface IPFSVideoPlayerProps {
    videos: InstructionalVideo[];
    autoplay?: boolean;
}

export const IPFSVideoPlayer: React.FC<IPFSVideoPlayerProps> = ({ videos, autoplay = false }) => {
    const { colorMode } = useColorMode();
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

    if (!videos || videos.length === 0) {
        return null;
    }

    const currentVideo = videos[currentIndex];
    const hasMultiple = videos.length > 1;

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleVideoEnd = () => {
        // Auto-advance to next video if available
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
            <CardBody>
                <VStack spacing={4} align="stretch">
                    {/* Video Title */}
                    <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                                {currentVideo.title}
                            </Text>
                            {currentVideo.description && (
                                <Text fontSize="sm" color={textSecondary}>
                                    {currentVideo.description}
                                </Text>
                            )}
                        </VStack>
                        {hasMultiple && (
                            <Badge colorScheme="purple">
                                {currentIndex + 1} of {videos.length}
                            </Badge>
                        )}
                    </HStack>

                    {/* Video Player */}
                    <AspectRatio ratio={16 / 9} w="100%">
                        <video
                            ref={videoRef}
                            key={currentVideo.ipfsHash} // Force re-render when video changes
                            controls
                            autoPlay={autoplay}
                            onEnded={handleVideoEnd}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '8px',
                                backgroundColor: '#000',
                            }}
                        >
                            <source
                                src={currentVideo.ipfsUrl || IPFS_CONFIG.getIPFSUrl(currentVideo.ipfsHash)}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    </AspectRatio>

                    {/* Playlist Navigation */}
                    {hasMultiple && (
                        <HStack justify="space-between" align="center">
                            <Tooltip label="Previous video">
                                <IconButton
                                    aria-label="Previous video"
                                    icon={<ChevronLeftIcon />}
                                    onClick={handlePrevious}
                                    isDisabled={currentIndex === 0}
                                    size="sm"
                                    variant="outline"
                                />
                            </Tooltip>

                            <VStack spacing={1}>
                                <Text fontSize="xs" color={textSecondary} textAlign="center">
                                    Video {currentIndex + 1} of {videos.length}
                                </Text>
                            </VStack>

                            <Tooltip label="Next video">
                                <IconButton
                                    aria-label="Next video"
                                    icon={<ChevronRightIcon />}
                                    onClick={handleNext}
                                    isDisabled={currentIndex === videos.length - 1}
                                    size="sm"
                                    variant="outline"
                                />
                            </Tooltip>
                        </HStack>
                    )}

                    {/* Playlist Thumbnails */}
                    {hasMultiple && videos.length > 1 && (
                        <Box>
                            <Text fontSize="sm" fontWeight="medium" color={textPrimary} mb={2}>
                                Playlist:
                            </Text>
                            <VStack spacing={2} align="stretch">
                                {videos.map((video, index) => (
                                    <HStack
                                        key={video.ipfsHash}
                                        p={2}
                                        bg={index === currentIndex ? 'blue.500' : colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.05)'}
                                        borderRadius="md"
                                        cursor="pointer"
                                        onClick={() => setCurrentIndex(index)}
                                        borderWidth="1px"
                                        borderColor={index === currentIndex ? 'blue.500' : cardBorder}
                                        _hover={{
                                            bg: index === currentIndex ? 'blue.600' : colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        <Badge colorScheme={index === currentIndex ? 'white' : 'gray'}>
                                            {index + 1}
                                        </Badge>
                                        <VStack align="start" spacing={0} flex={1}>
                                            <Text
                                                fontSize="sm"
                                                fontWeight={index === currentIndex ? 'bold' : 'normal'}
                                                color={index === currentIndex ? 'white' : textPrimary}
                                                noOfLines={1}
                                            >
                                                {video.title}
                                            </Text>
                                            {video.description && (
                                                <Text
                                                    fontSize="xs"
                                                    color={index === currentIndex ? 'whiteAlpha.800' : textSecondary}
                                                    noOfLines={1}
                                                >
                                                    {video.description}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};

export default IPFSVideoPlayer;
