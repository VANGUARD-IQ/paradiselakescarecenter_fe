import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  useToast,
  Progress,
  Icon,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Code,
  Container,
  useColorMode} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { 
  ArrowBackIcon,
  AttachmentIcon,
  DownloadIcon,
  CopyIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FaMicrophone, FaFileAudio } from 'react-icons/fa';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

const TRANSCRIBE_AUDIO = gql`
  mutation TranscribeAudio($file: Upload!) {
    transcribeAudio(audioFile: $file) {
      transcription
      logs
      processingTime
      fileSize
      processingRate
    }
  }
`;

const TRANSCRIBE_AND_SAVE_RD_EVIDENCE = gql`
  mutation TranscribeAndSaveRDEvidence(
    $file: Upload!
    $rdProjectId: String!
    $rdActivityId: String
    $title: String!
    $description: String
  ) {
    transcribeAndSaveRDEvidence(
      audioFile: $file
      rdProjectId: $rdProjectId
      rdActivityId: $rdActivityId
      title: $title
      description: $description
    )
  }
`;

const ResearchAndDesignTranscribe: React.FC = () => {
  const { colorMode } = useColorMode();
  usePageTitle("R&D Transcription");
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use brand config colors
  const bg = getColor("background.main", colorMode);
  const cardBg = getColor("background.cardGradient", colorMode);
  const borderColor = getColor("border.darkCard", colorMode);
  const selectedFileBg = getColor("background.darkSurface", colorMode);
  const aiEngineBg = "rgba(107, 70, 193, 0.1)"; // Purple tinted background
  const logsBg = "rgba(0, 0, 0, 0.3)";
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [pythonLogs, setPythonLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const [transcribeAudio] = useMutation(TRANSCRIBE_AUDIO);
  const [transcribeAndSaveRDEvidence] = useMutation(TRANSCRIBE_AND_SAVE_RD_EVIDENCE);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/wave',
        'audio/mp4',
        'audio/m4a',
        'audio/x-m4a',
        'audio/mp4a-latm',
        'audio/aac',
        'audio/webm',
        'audio/ogg',
        'audio/flac'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file (MP3, WAV, M4A, etc.)',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Check file size (max 150MB)
      const maxSize = 150 * 1024 * 1024; // 150MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 150MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setSelectedFile(file);
      setTranscription(''); // Clear previous transcription
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an audio file to transcribe',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTranscribing(true);
    setUploadProgress(0);
    setProcessingTime(0);
    const startTime = Date.now();

    try {
      // Simulate detailed progress stages
      setProgressStage('Uploading file...');
      setUploadProgress(10);

      // Start processing timer
      const timer = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Calculate timing based on file size for more realistic progress
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      const sizeMultiplier = Math.max(0.5, Math.min(2, fileSizeMB / 5)); // Scale based on file size
      
      const progressStages = [
        { progress: 10, stage: 'Uploading file...', duration: 800 * sizeMultiplier },
        { progress: 20, stage: 'Validating audio format...', duration: 600 },
        { progress: 30, stage: 'Analyzing audio properties...', duration: 700 },
        { progress: 40, stage: 'Preparing for AI processing...', duration: 500 },
        { progress: 50, stage: 'Loading Whisper AI model...', duration: 2000 },
        { progress: 60, stage: 'Initializing neural network...', duration: 1500 },
        { progress: 70, stage: 'Processing audio chunks...', duration: 1200 * sizeMultiplier },
        { progress: 80, stage: 'Transcribing speech to text...', duration: 2500 * sizeMultiplier },
        { progress: 90, stage: 'Finalizing transcription...', duration: 800 },
        { progress: 95, stage: 'Cleaning up temporary files...', duration: 500 },
      ];

      let currentStageIndex = 0;
      
      const advanceProgress = () => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setProgressStage(stage.stage);
          setUploadProgress(stage.progress);
          
          currentStageIndex++;
          setTimeout(advanceProgress, stage.duration);
        }
      };
      
      advanceProgress();

      const { data } = await transcribeAudio({
        variables: {
          file: selectedFile,
        },
      });

      clearInterval(timer);
      setUploadProgress(100);
      setProgressStage('Transcription complete!');

      if (data?.transcribeAudio) {
        const result = data.transcribeAudio;
        setTranscription(result.transcription);
        setPythonLogs(result.logs || []);
        
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        const wordCount = result.transcription.split(/\s+/).filter((word: string) => word.length > 0).length;
        
        toast({
          title: 'Transcription complete!',
          description: `Processed in ${result.processingTime.toFixed(1)}s • ${wordCount} words • ${result.processingRate.toFixed(1)} MB/min`,
          status: 'success',
          duration: 7000,
          isClosable: true,
        });
        
        // Auto-show logs if there are many (indicating a complex processing)
        if (result.logs && result.logs.length > 10) {
          setShowLogs(true);
        }
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: error.message || 'An error occurred during transcription',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setIsTranscribing(false);
      setUploadProgress(0);
    }
  };

  const handleCopyTranscription = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleDownloadTranscription = () => {
    if (transcription) {
      const blob = new Blob([transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription_${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setTranscription('');
    setUploadProgress(0);
    setProgressStage('');
    setProcessingTime(0);
    setPythonLogs([]);
    setShowLogs(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Container maxW="7xl" py={8} flex="1">
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate('/researchanddesign')}
          >
            Back to R&D Dashboard
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <Heading size="lg" color={textPrimary}>
            Audio Transcription
          </Heading>
          <Text color={textSecondary}>
            Upload an audio file to transcribe it using AI-powered speech recognition
          </Text>

          {/* File Upload Card */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textPrimary}>Upload Audio File</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel color={textPrimary}>Select Audio File</FormLabel>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    display="none"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload">
                    <Button
                      as="span"
                      leftIcon={<AttachmentIcon />}
                      variant="outline"
                      cursor="pointer"
                      w="full"
                      color={textPrimary}
                      borderColor={borderColor}
                      _hover={{ bg: "rgba(255, 255, 255, 0.05)", borderColor: textSecondary }}
                    >
                      Choose Audio File
                    </Button>
                  </label>
                  <FormHelperText color={textSecondary}>
                    Supported formats: MP3, WAV, M4A, OGG, FLAC (max 150MB)
                  </FormHelperText>
                </FormControl>

                {selectedFile && (
                  <Box
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={borderColor}
                    bg={selectedFileBg}
                  >
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FaFileAudio} color={getColor("primary", colorMode)} />
                          <Text fontWeight="semibold" color={textPrimary}>{selectedFile.name}</Text>
                        </HStack>
                        <Text fontSize="sm" color={getColor("text.secondary", colorMode)}>
                          {formatFileSize(selectedFile.size)}
                        </Text>
                      </VStack>
                      <IconButton
                        aria-label="Remove file"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleClear}
                      />
                    </HStack>
                  </Box>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color={getColor("text.secondary", colorMode)}>
                        {progressStage || 'Processing audio...'}
                      </Text>
                      <Text fontSize="xs" color={getColor("text.secondary", colorMode)}>
                        {processingTime}s • {uploadProgress}%
                      </Text>
                    </HStack>
                    <Progress
                      value={uploadProgress}
                      size="md"
                      colorScheme="blue"
                      hasStripe
                      isAnimated
                      borderRadius="md"
                    />
                    <VStack align="stretch" mt={3} spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color={uploadProgress > 20 ? getColor("status.success", colorMode) : getColor("text.secondary", colorMode)}>
                          {uploadProgress > 20 ? "✓" : "○"} File Upload
                        </Text>
                        <Text fontSize="xs" color={uploadProgress > 40 ? getColor("status.success", colorMode) : getColor("text.secondary", colorMode)}>
                          {uploadProgress > 40 ? "✓" : "○"} Audio Analysis
                        </Text>
                        <Text fontSize="xs" color={uploadProgress > 60 ? getColor("status.success", colorMode) : getColor("text.secondary", colorMode)}>
                          {uploadProgress > 60 ? "✓" : "○"} AI Model Loading
                        </Text>
                        <Text fontSize="xs" color={uploadProgress > 85 ? getColor("status.success", colorMode) : getColor("text.secondary", colorMode)}>
                          {uploadProgress > 85 ? "✓" : "○"} Speech Processing
                        </Text>
                      </HStack>
                      
                      {uploadProgress >= 50 && (
                        <Box p={2} bg={aiEngineBg} borderRadius="md" border="1px" borderColor={getColor("border.darkCard", colorMode)}>
                          <HStack>
                            <Box>
                              <Spinner size="sm" color={getColor("primary", colorMode)} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="semibold" color={getColor("primary", colorMode)}>
                                Whisper AI Engine Active
                              </Text>
                              <Text fontSize="xs" color={getColor("accent", colorMode)}>
                                {uploadProgress < 70 ? 'Loading neural network...' :
                                 uploadProgress < 85 ? 'Processing audio chunks...' :
                                 'Generating transcription...'}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                )}

                <Button
                  bg={getColor("primary", colorMode)}
                  color="white"
                  _hover={{ bg: getColor("primaryHover", colorMode) }}
                  size="lg"
                  onClick={handleTranscribe}
                  isLoading={isTranscribing}
                  loadingText="Transcribing..."
                  isDisabled={!selectedFile || isTranscribing}
                  leftIcon={<Icon as={FaMicrophone} />}
                >
                  Transcribe Audio
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Transcription Result */}
          {transcription && (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color={textPrimary}>Transcription Result</Heading>
                  <HStack>
                    <Button
                      size="sm"
                      leftIcon={<CopyIcon />}
                      variant="outline"
                      onClick={handleCopyTranscription}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<DownloadIcon />}
                      variant="outline"
                      onClick={handleDownloadTranscription}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<AttachmentIcon />}
                      bg={getColor("primary", colorMode)}
                      color="white"
                      _hover={{ bg: getColor("primaryHover", colorMode) }}
                      onClick={() => navigate('/researchanddesign/evidence/new')}
                    >
                      Save as Evidence
                    </Button>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  minH="300px"
                  fontFamily="mono"
                  fontSize="sm"
                  resize="vertical"
                  bg="rgba(0, 0, 0, 0.2)"
                  border="1px"
                  borderColor={borderColor}
                  color={textPrimary}
                  _focus={{
                    borderColor: textSecondary,
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                  }}
                  _hover={{
                    borderColor: textSecondary
                  }}
                />
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color={getColor("text.secondary", colorMode)}>
                    Word count: {transcription.split(/\s+/).filter(word => word.length > 0).length}
                  </Text>
                  {pythonLogs.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowLogs(!showLogs)}
                      leftIcon={<Icon as={FaFileAudio} />}
                    >
                      {showLogs ? 'Hide' : 'Show'} AI Processing Logs ({pythonLogs.length})
                    </Button>
                  )}
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Python Processing Logs */}
          {pythonLogs.length > 0 && showLogs && (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color={textPrimary}>AI Processing Logs</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLogs(false)}
                  >
                    Hide
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <Box
                  maxH="400px"
                  overflowY="auto"
                  bg={logsBg}
                  p={4}
                  borderRadius="md"
                  fontFamily="mono"
                  fontSize="sm"
                >
                  {pythonLogs.map((log, index) => (
                    <Text key={index} mb={1} color={getColor("text.secondary", colorMode)}>
                      {log}
                    </Text>
                  ))}
                </Box>
                <Text fontSize="xs" color={getColor("text.secondary", colorMode)} mt={2}>
                  Real-time output from OpenAI Whisper AI processing
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Info Alert */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold" color={textPrimary}>How it works</Text>
              <Text fontSize="sm" color={textSecondary}>
                Upload your audio file and our AI-powered transcription service will convert 
                speech to text. The transcription uses OpenAI's Whisper model for accurate 
                results across multiple languages and accents.
              </Text>
            </Box>
          </Alert>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignTranscribe;