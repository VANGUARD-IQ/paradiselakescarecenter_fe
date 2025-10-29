import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Button,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Textarea,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiMusic,
} from 'react-icons/fi';
import { getColor, brandConfig } from '../../brandConfig';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import transcriptionsModuleConfig from './moduleConfig';

const GET_TRANSCRIPTION = gql`
  query GetTranscription($id: ID!) {
    transcription(id: $id) {
      id
      title
      description
      audioUrl
      fileName
      fileSize
      duration
      transcription
      status
      errorMessage
      detectedLanguage
      confidence
      processingTime
      createdAt
      updatedAt
      owner {
        id
        fName
        lName
      }
    }
  }
`;

const RETRY_TRANSCRIPTION = gql`
  mutation RetryTranscription($id: ID!) {
    retryTranscription(id: $id) {
      id
      status
    }
  }
`;

const TRANSCRIBE_AUDIO = gql`
  mutation TranscribeAudio($input: TranscriptionUploadInput!) {
    transcribeAudio(input: $input) {
      id
      status
      transcription
    }
  }
`;

const DELETE_TRANSCRIPTION = gql`
  mutation DeleteTranscription($id: ID!) {
    deleteTranscription(id: $id)
  }
`;

const TranscriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Brand styling
  const bgMain = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const primaryColor = getColor("primary", colorMode);

  const { data, loading, error, refetch } = useQuery(GET_TRANSCRIPTION, {
    variables: { id },
  });

  // Set up polling based on status
  React.useEffect(() => {
    if (data?.transcription?.status === 'PROCESSING' || data?.transcription?.status === 'UPLOADING') {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.transcription?.status, refetch]);

  const [retryTranscription, { loading: retrying }] = useMutation(RETRY_TRANSCRIPTION, {
    onCompleted: () => {
      toast({
        title: 'Transcription restarted',
        status: 'success',
        duration: 3000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error retrying transcription',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [transcribeAudio, { loading: transcribing }] = useMutation(TRANSCRIBE_AUDIO, {
    onCompleted: () => {
      toast({
        title: 'Transcription started!',
        description: 'Your audio is being transcribed. This may take a few minutes.',
        status: 'success',
        duration: 5000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error starting transcription',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [deleteTranscription, { loading: deleting }] = useMutation(DELETE_TRANSCRIPTION, {
    onCompleted: () => {
      toast({
        title: 'Transcription deleted',
        status: 'success',
        duration: 3000,
      });
      navigate('/transcriptions');
    },
    onError: (error) => {
      toast({
        title: 'Error deleting transcription',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleDownload = () => {
    if (!data?.transcription?.transcription) return;

    const blob = new Blob([data.transcription.transcription], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.transcription.title || 'transcription'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Download started',
      status: 'success',
      duration: 2000,
    });
  };

  const handleRetry = () => {
    if (window.confirm('Are you sure you want to retry this transcription?')) {
      retryTranscription({ variables: { id } });
    }
  };

  const handleStartTranscription = () => {
    const audioUrl = window.prompt(
      'Enter the Pinata IPFS URL for the audio file:\n\n' +
      'Example: https://scarlet-professional-perch-484.mypinata.cloud/ipfs/bafyb...\n' +
      'or just the CID: bafyb...',
      transcription.audioUrl || ''
    );

    if (!audioUrl) return;

    // If they just entered a CID, construct the full URL
    const fullUrl = audioUrl.startsWith('http')
      ? audioUrl
      : `https://scarlet-professional-perch-484.mypinata.cloud/ipfs/${audioUrl}`;

    transcribeAudio({
      variables: {
        input: {
          transcriptionId: id,
          audioUrl: fullUrl,
          fileName: transcription.fileName || 'audio.m4a',
          fileSize: transcription.fileSize || 0,
        }
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transcription? This action cannot be undone.')) {
      deleteTranscription({ variables: { id } });
    }
  };

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
      <Badge colorScheme={config.color} display="flex" alignItems="center" gap={1} fontSize="md" p={2}>
        <Icon size={16} />
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

  if (loading) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={transcriptionsModuleConfig} />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={textSecondary}>Loading transcription...</Text>
          </VStack>
        </Box>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error || !data?.transcription) {
    return (
      <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={transcriptionsModuleConfig} />
        <Container maxW="container.md" flex="1" py={8}>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start">
              <Text fontWeight="bold">Error loading transcription</Text>
              <Text fontSize="sm">{error?.message || 'Transcription not found'}</Text>
            </VStack>
          </Alert>
          <Button
            leftIcon={<FiArrowLeft />}
            mt={4}
            onClick={() => navigate('/transcriptions')}
          >
            Back to Transcriptions
          </Button>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const transcription = data.transcription;

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={transcriptionsModuleConfig} />

      <Container maxW="container.xl" py={8} flex="1">
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            color={textSecondary}
            onClick={() => navigate('/transcriptions')}
          >
            Back to Transcriptions
          </Button>

          <HStack>
            {(transcription.status === 'PENDING' || transcription.status === 'UPLOADING') && (
              <Tooltip label="Start transcription with Pinata URL">
                <Button
                  leftIcon={<FiRefreshCw />}
                  onClick={handleStartTranscription}
                  isLoading={transcribing}
                  colorScheme="blue"
                  size="sm"
                >
                  Start Transcription
                </Button>
              </Tooltip>
            )}
            {transcription.status === 'FAILED' && (
              <Tooltip label="Retry transcription">
                <IconButton
                  aria-label="Retry"
                  icon={<FiRefreshCw />}
                  onClick={handleRetry}
                  isLoading={retrying}
                  colorScheme="blue"
                />
              </Tooltip>
            )}
            {transcription.status === 'COMPLETED' && (
              <Tooltip label="Download transcription">
                <IconButton
                  aria-label="Download"
                  icon={<FiDownload />}
                  onClick={handleDownload}
                  colorScheme="green"
                />
              </Tooltip>
            )}
            <Tooltip label="Delete transcription">
              <IconButton
                aria-label="Delete"
                icon={<FiTrash2 />}
                onClick={handleDelete}
                isLoading={deleting}
                colorScheme="red"
                variant="outline"
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Title and Status */}
        <VStack align="start" spacing={2} mb={6}>
          <HStack>
            <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading}>
              🎤 {transcription.title}
            </Heading>
            {getStatusBadge(transcription.status)}
          </HStack>
          {transcription.description && (
            <Text color={textSecondary}>{transcription.description}</Text>
          )}
        </VStack>

        {/* Metadata Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
          <GridItem>
            <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth={1}>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <FiFileText color={textSecondary} />
                    <Text color={textSecondary} fontSize="sm">File Name</Text>
                  </HStack>
                  <Text color={textPrimary} fontWeight="medium">
                    {transcription.fileName || 'Unknown'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth={1}>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <FiMusic color={textSecondary} />
                    <Text color={textSecondary} fontSize="sm">Duration</Text>
                  </HStack>
                  <Text color={textPrimary} fontWeight="medium">
                    {formatDuration(transcription.duration)}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth={1}>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text color={textSecondary} fontSize="sm">Language</Text>
                  <Text color={textPrimary} fontWeight="medium">
                    {transcription.detectedLanguage || 'Not detected'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth={1}>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text color={textSecondary} fontSize="sm">Confidence</Text>
                  <Text color={textPrimary} fontWeight="medium">
                    {transcription.confidence ? `${(transcription.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Processing Alert */}
        {(transcription.status === 'PROCESSING' || transcription.status === 'UPLOADING') && (
          <Alert status="info" borderRadius="lg" mb={6}>
            <AlertIcon />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold">Transcription in progress</Text>
              <Text fontSize="sm">
                Your audio is being transcribed. This page will refresh automatically every 5 seconds.
              </Text>
              {transcription.processingTime && (
                <Text fontSize="sm">Processing time so far: {transcription.processingTime.toFixed(2)}s</Text>
              )}
            </VStack>
          </Alert>
        )}

        {/* Error Alert */}
        {transcription.status === 'FAILED' && (
          <Alert status="error" borderRadius="lg" mb={6}>
            <AlertIcon />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold">Transcription failed</Text>
              <Text fontSize="sm">{transcription.errorMessage || 'An error occurred during transcription'}</Text>
              <Button
                size="sm"
                leftIcon={<FiRefreshCw />}
                onClick={handleRetry}
                isLoading={retrying}
                mt={2}
              >
                Retry Transcription
              </Button>
            </VStack>
          </Alert>
        )}

        {/* Transcription Text */}
        {transcription.status === 'COMPLETED' && transcription.transcription && (
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
            borderRadius="lg"
          >
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color={textPrimary}>
                  Transcription
                </Heading>
                <Button
                  leftIcon={<FiDownload />}
                  size="sm"
                  onClick={handleDownload}
                  colorScheme="green"
                >
                  Download as TXT
                </Button>
              </HStack>
              <Divider mb={4} />
              <Textarea
                value={transcription.transcription}
                readOnly
                bg="rgba(0, 0, 0, 0.2)"
                borderColor={cardBorder}
                color={textPrimary}
                minH="400px"
                fontFamily="monospace"
                fontSize="sm"
                p={4}
              />
              <VStack align="start" mt={4} spacing={1}>
                <Text color={textSecondary} fontSize="sm">
                  Word count: {transcription.transcription.split(/\s+/).length}
                </Text>
                <Text color={textSecondary} fontSize="sm">
                  Character count: {transcription.transcription.length}
                </Text>
                {transcription.processingTime && (
                  <Text color={textSecondary} fontSize="sm">
                    Processing time: {transcription.processingTime.toFixed(2)}s
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* No transcription yet */}
        {transcription.status === 'PENDING' && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Text>Transcription has not started yet. The audio file may still be uploading.</Text>
          </Alert>
        )}
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default TranscriptionDetails;
