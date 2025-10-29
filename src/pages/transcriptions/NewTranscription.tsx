import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  Container,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  CardBody,
  useToast,
  VStack,
  Text,
  Progress,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  useColorMode,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiArrowLeft } from 'react-icons/fi';
import { getColor, brandConfig } from '../../brandConfig';
import { useAuth } from '../../contexts/AuthContext';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import transcriptionsModuleConfig from './moduleConfig';

const CREATE_TRANSCRIPTION = gql`
  mutation CreateTranscription($input: TranscriptionInput!) {
    createTranscription(input: $input) {
      id
      title
      status
    }
  }
`;

const UPLOAD_TO_PINATA = gql`
  mutation UploadToPinata($file: Upload!) {
    uploadToPinata(file: $file)
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

const NewTranscription: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'form' | 'uploading' | 'transcribing' | 'complete'>('form');

  const [createTranscription] = useMutation(CREATE_TRANSCRIPTION);
  const [uploadToPinata] = useMutation(UPLOAD_TO_PINATA);
  const [transcribeAudio] = useMutation(TRANSCRIBE_AUDIO);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-fill title if empty
      if (!formData.title) {
        setFormData({
          ...formData,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an audio or video file to transcribe',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to create transcriptions',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Step 1: Create transcription record
      setCurrentStep('form');
      setUploadProgress(10);

      const { data: transcriptionData } = await createTranscription({
        variables: {
          input: {
            title: formData.title,
            description: formData.description,
            owner: user.id,
          },
        },
      });

      const transcriptionId = transcriptionData.createTranscription.id;
      setUploadProgress(20);

      // Step 2: Upload file to Pinata
      setCurrentStep('uploading');
      setUploadProgress(30);

      const { data: pinataData } = await uploadToPinata({
        variables: {
          file: selectedFile,
        },
      });

      // uploadToPinata returns just the IPFS hash string
      const ipfsHash = pinataData.uploadToPinata;
      const pinataUrl = ipfsHash.startsWith('http')
        ? ipfsHash
        : `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      setUploadProgress(60);

      // Step 3: Trigger transcription
      setCurrentStep('transcribing');
      setUploadProgress(70);

      await transcribeAudio({
        variables: {
          input: {
            transcriptionId,
            audioUrl: pinataUrl,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          },
        },
      });

      setUploadProgress(100);
      setCurrentStep('complete');

      toast({
        title: 'Transcription started!',
        description: 'Your audio is being transcribed. This may take a few minutes.',
        status: 'success',
        duration: 5000,
      });

      // Navigate to the transcription details page
      setTimeout(() => {
        navigate(`/transcriptions/${transcriptionId}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error creating transcription:', error);
      setCurrentStep('form');
      setUploadProgress(0);

      toast({
        title: 'Error creating transcription',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case 'uploading':
        return '📤 Uploading file to IPFS...';
      case 'transcribing':
        return '🍋 Starting LemonFox transcription...';
      case 'complete':
        return '✅ Transcription started successfully!';
      default:
        return '';
    }
  };

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={transcriptionsModuleConfig} />

      <Container maxW="container.md" py={8} flex="1">
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          color={textSecondary}
          mb={4}
          onClick={() => navigate('/transcriptions')}
        >
          Back to Transcriptions
        </Button>

        <Heading
          mb={6}
          color={textPrimary}
          fontFamily={brandConfig.fonts.heading}
        >
          🎤 New Transcription
        </Heading>

        <Card
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
          borderRadius="lg"
        >
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {/* Title */}
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Title</FormLabel>
                  <Input
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    value={formData.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: e.target.value,
                    })}
                    placeholder="Enter transcription title"
                  />
                </FormControl>

                {/* Description */}
                <FormControl>
                  <FormLabel color={textPrimary}>Description (optional)</FormLabel>
                  <Textarea
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    value={formData.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: e.target.value,
                    })}
                    placeholder="Add a description for this transcription"
                    rows={3}
                  />
                </FormControl>

                {/* File Upload */}
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Audio/Video File</FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Input
                      type="file"
                      accept="audio/*,video/*,.mp3,.wav,.flac,.aac,.opus,.ogg,.m4a,.mp4,.mpeg,.mov,.webm"
                      onChange={handleFileChange}
                      display="none"
                      id="file-upload"
                    />
                    <Button
                      as="label"
                      htmlFor="file-upload"
                      leftIcon={<FiUpload />}
                      variant="outline"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                      cursor="pointer"
                    >
                      Choose File
                    </Button>

                    {selectedFile && (
                      <HStack
                        p={3}
                        bg="rgba(255, 255, 255, 0.03)"
                        borderRadius="md"
                        borderWidth={1}
                        borderColor={cardBorder}
                      >
                        <Icon as={FiFile} color={primaryColor} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text color={textPrimary} fontSize="sm" fontWeight="medium">
                            {selectedFile.name}
                          </Text>
                          <Text color={textSecondary} fontSize="xs">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </VStack>
                      </HStack>
                    )}
                  </VStack>
                </FormControl>

                {/* Progress */}
                {uploadProgress > 0 && (
                  <VStack w="full" spacing={2}>
                    <Progress
                      value={uploadProgress}
                      w="full"
                      colorScheme="blue"
                      borderRadius="full"
                      hasStripe
                      isAnimated
                    />
                    <Text color={textSecondary} fontSize="sm">
                      {getStepMessage()}
                    </Text>
                  </VStack>
                )}

                {/* Info Alert */}
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <VStack align="start" spacing={1} fontSize="sm">
                    <Text fontWeight="bold">Supported formats:</Text>
                    <Text>mp3, wav, flac, aac, opus, ogg, m4a, mp4, mpeg, mov, webm</Text>
                    <Text mt={2} fontWeight="bold">Processing time:</Text>
                    <Text>Typically 1-2 minutes for every 30 minutes of audio</Text>
                  </VStack>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  bg={primaryColor}
                  color="white"
                  _hover={{ bg: primaryHover }}
                  isLoading={currentStep !== 'form'}
                  loadingText={getStepMessage()}
                  width="full"
                  size="lg"
                  leftIcon={<FiUpload />}
                >
                  Upload & Transcribe
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default NewTranscription;
