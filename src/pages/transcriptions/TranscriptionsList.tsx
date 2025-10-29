import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  VStack,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { getColor, brandConfig } from '../../brandConfig';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import transcriptionsModuleConfig from './moduleConfig';

const GET_TRANSCRIPTIONS = gql`
  query GetTranscriptions {
    transcriptions {
      id
      title
      description
      status
      duration
      detectedLanguage
      confidence
      fileName
      fileSize
      createdAt
      owner {
        id
        fName
        lName
      }
    }
  }
`;

const TranscriptionsList: React.FC = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // Brand styling
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);
  const primaryHover = getColor("primaryHover", colorMode);

  const { data, loading, error, refetch } = useQuery(GET_TRANSCRIPTIONS, {
    pollInterval: 10000, // Poll every 10 seconds for status updates
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'gray', icon: FiClock, label: 'Pending' },
      UPLOADING: { color: 'purple', icon: FiClock, label: 'Uploading' },
      PROCESSING: { color: 'blue', icon: FiClock, label: 'Processing' },
      COMPLETED: { color: 'green', icon: FiCheckCircle, label: 'Completed' },
      FAILED: { color: 'red', icon: FiXCircle, label: 'Failed' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge colorScheme={config.color} display="flex" alignItems="center" gap={1}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={transcriptionsModuleConfig} />

      <Container maxW="container.xl" py={8} flex="1">
        <HStack justify="space-between" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
            >
              🎤 Transcriptions
            </Heading>
            <Text color={textSecondary} fontSize="sm">
              AI-powered audio and video transcription
            </Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            bg={primaryColor}
            color="white"
            _hover={{ bg: primaryHover }}
            onClick={() => navigate("/transcriptions/new")}
          >
            New Transcription
          </Button>
        </HStack>

        {loading && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary} mt={4}>Loading transcriptions...</Text>
          </Box>
        )}

        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Error loading transcriptions</Text>
              <Text fontSize="sm">{error.message}</Text>
            </VStack>
          </Alert>
        )}

        {data && data.transcriptions.length === 0 && (
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody textAlign="center" py={10}>
              <Text color={textPrimary} fontSize="lg" mb={2}>
                No transcriptions yet
              </Text>
              <Text color={textSecondary} mb={4}>
                Upload your first audio or video file to get started
              </Text>
              <Button
                leftIcon={<FiPlus />}
                bg={primaryColor}
                color="white"
                _hover={{ bg: primaryHover }}
                onClick={() => navigate("/transcriptions/new")}
              >
                Create First Transcription
              </Button>
            </CardBody>
          </Card>
        )}

        {data && data.transcriptions.length > 0 && (
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color={textSecondary}>Title</Th>
                    <Th color={textSecondary}>Status</Th>
                    <Th color={textSecondary}>File</Th>
                    <Th color={textSecondary}>Duration</Th>
                    <Th color={textSecondary}>Language</Th>
                    <Th color={textSecondary}>Created</Th>
                    <Th color={textSecondary}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.transcriptions.map((transcription: any) => (
                    <Tr
                      key={transcription.id}
                      _hover={{ bg: 'rgba(255, 255, 255, 0.02)' }}
                      cursor="pointer"
                      onClick={() => navigate(`/transcriptions/${transcription.id}`)}
                    >
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text color={textPrimary} fontWeight="medium">
                            {transcription.title}
                          </Text>
                          {transcription.description && (
                            <Text color={textSecondary} fontSize="xs" noOfLines={1}>
                              {transcription.description}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>{getStatusBadge(transcription.status)}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text color={textPrimary} fontSize="sm">
                            {transcription.fileName || 'Unknown'}
                          </Text>
                          <Text color={textSecondary} fontSize="xs">
                            {formatFileSize(transcription.fileSize)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text color={textPrimary} fontSize="sm">
                          {formatDuration(transcription.duration)}
                        </Text>
                      </Td>
                      <Td>
                        <Text color={textPrimary} fontSize="sm">
                          {transcription.detectedLanguage || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Text color={textPrimary} fontSize="sm">
                          {new Date(transcription.createdAt).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <Tooltip label="View Details">
                          <IconButton
                            aria-label="View transcription"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/transcriptions/${transcription.id}`);
                            }}
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Processing info alert */}
        {data && data.transcriptions.some((t: any) =>
          t.status === 'PROCESSING' || t.status === 'UPLOADING'
        ) && (
          <Alert status="info" borderRadius="lg" mt={4}>
            <AlertIcon />
            <Text fontSize="sm">
              Some transcriptions are still processing. This page will auto-refresh every 10 seconds.
            </Text>
          </Alert>
        )}
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default TranscriptionsList;
