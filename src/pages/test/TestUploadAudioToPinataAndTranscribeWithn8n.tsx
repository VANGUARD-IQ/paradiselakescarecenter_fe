import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Progress,
  Alert,
  AlertIcon,
  Input,
  useToast,
  Card,
  CardBody,
  Heading,
  Divider,
  Badge,
  Link,
  Textarea,
  ButtonGroup,
  Spinner,
} from '@chakra-ui/react';
import { AttachmentIcon, CopyIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import { gql, useMutation } from '@apollo/client';
import { getApiUrl, normalizePinataUrl } from '../../helpers';

export const UPLOAD_TO_PINATA = gql`
  mutation UploadToPinata($file: Upload!) {
    uploadToPinata(file: $file)
  }
`;

const TestUploadAudioToPinataAndTranscribeWithn8n: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pinataUrl, setPinataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // N8N webhook URL
  const N8N_WEBHOOK_URL = 'https://workflows.vanguardiq.com.au/webhook/audio-transcription';

  const [uploadToPinata] = useMutation(UPLOAD_TO_PINATA, {
    onCompleted: (data) => {
      console.log("Upload completed:", data);
      setUploadProgress(100);
      // Normalize the Pinata URL to ensure it has https://
      const normalizedUrl = normalizePinataUrl(data.uploadToPinata);
      setPinataUrl(normalizedUrl);
      console.log("Normalized Pinata URL:", normalizedUrl);
      toast({
        title: "Upload successful",
        description: `File uploaded: ${normalizedUrl}`,
        status: "success",
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  });

  const allowedFileTypes = [
    'audio/mpeg',     // .mp3
    'audio/wav',      // .wav
    'audio/m4a',      // .m4a
    'audio/x-m4a',    // .m4a (alternative MIME type)
    'audio/aac',      // .aac
    'audio/ogg',      // .ogg
    'audio/flac',     // .flac
    'audio/webm',     // .webm
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}. Please select an audio file.`);
        return;
      }

      // Validate file size (50MB limit to match your resolver)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 50MB limit.`);
        return;
      }

      setSelectedFile(file);
      setError(null);
      setTranscriptionResult(null);
      setPinataUrl(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const uploadFileToPinata = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const { data } = await uploadToPinata({
        variables: { file: selectedFile }
      });

      clearInterval(progressInterval);

      if (data.uploadToPinata) {
        // Normalize the URL to ensure proper format
        const normalizedUrl = normalizePinataUrl(data.uploadToPinata);
        console.log("Original URL:", data.uploadToPinata);
        console.log("Normalized URL:", normalizedUrl);
        return normalizedUrl;
      }

      throw new Error('No URL returned from Pinata upload');

    } catch (err: any) {
      console.error('Pinata upload error:', err);
      setError(`Upload failed: ${err.message}`);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const transcribeWithN8N = async (pinataUrl: string) => {
    setIsTranscribing(true);

    try {
      // Ensure the URL is properly normalized before sending to N8N
      const normalizedUrl = normalizePinataUrl(pinataUrl);
      console.log("Sending to N8N - Original URL:", pinataUrl);
      console.log("Sending to N8N - Normalized URL:", normalizedUrl);
      
      const payload = {
        pinataUrl: normalizedUrl,
        audioUrl: normalizedUrl, // Alternative field name for N8N workflow
        filename: selectedFile?.name
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`N8N webhook error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed');
      }

      console.log('N8N Response:', result);
      return result;

    } catch (err: any) {
      console.error('N8N transcription error:', err);
      setError(`Transcription failed: ${err.message}`);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };

  const processFullWorkflow = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first.');
      return;
    }

    setError(null);

    try {
      // Step 1: Upload to Pinata
      console.log('Step 1: Uploading to Pinata...');
      const uploadedUrl = await uploadFileToPinata();
      console.log('Pinata upload successful:', uploadedUrl);

      // Step 2: Send to n8n for transcription
      console.log('Step 2: Sending to n8n for transcription...');
      const transcriptionResult = await transcribeWithN8N(uploadedUrl!);
      console.log('Transcription successful:', transcriptionResult);

      setTranscriptionResult(transcriptionResult);

    } catch (err: any) {
      console.error('Full workflow error:', err);
      // Error already set in individual functions
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setTranscriptionResult(null);
    setError(null);
    setUploadProgress(0);
    setPinataUrl(null);
    setIsUploading(false);
    setIsTranscribing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyTranscription = () => {
    if (transcriptionResult?.transcription) {
      navigator.clipboard.writeText(transcriptionResult.transcription);
      toast({
        title: 'Copied!',
        description: 'Transcription copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const downloadTranscription = () => {
    if (transcriptionResult?.transcription) {
      const blob = new Blob([transcriptionResult.transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription-${transcriptionResult.filename || 'audio'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getCurrentStatus = () => {
    if (isUploading) return 'Uploading file to Pinata IPFS for secure, decentralized storage...';
    if (isTranscribing) return 'Processing with LemonFox AI...';
    if (transcriptionResult) return 'Complete!';
    return 'Ready to process';
  };

  const isProcessing = isUploading || isTranscribing;

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Audio Transcription Service
          </Heading>
          <Text color="gray.600">
            Upload audio files for AI transcription via Pinata IPFS and LemonFox AI
          </Text>
          <VStack spacing={1}>
            <Badge colorScheme="blue">
              GraphQL API: {getApiUrl()}
            </Badge>
            <Badge colorScheme="green">
              N8N Webhook: {N8N_WEBHOOK_URL}
            </Badge>
          </VStack>
        </Box>

        {!transcriptionResult && (
          <Card>
            <CardBody>
              <Box
                border="2px dashed"
                borderColor={selectedFile ? 'green.200' : 'gray.200'}
                borderRadius="md"
                p={8}
                textAlign="center"
                cursor={!isProcessing ? 'pointer' : 'default'}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                bg={selectedFile ? 'green.50' : 'gray.50'}
                _hover={!isProcessing ? { bg: 'gray.100' } : {}}
              >
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*"
                  display="none"
                  disabled={isProcessing}
                />
                
                {selectedFile ? (
                  <VStack spacing={3}>
                    <Box fontSize="3xl">🎵</Box>
                    <VStack spacing={1}>
                      <Text fontWeight="bold">{selectedFile.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </Text>
                      {pinataUrl && (
                        <Badge colorScheme="green">✅ Uploaded to IPFS</Badge>
                      )}
                    </VStack>
                  </VStack>
                ) : (
                  <VStack spacing={3}>
                    <AttachmentIcon boxSize={8} color="gray.400" />
                    <Text>Click to select or drag & drop an audio file</Text>
                    <Text fontSize="sm" color="gray.500">
                      Supported: MP3, WAV, M4A, AAC, OGG, FLAC, WebM
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Max size: 50MB
                    </Text>
                  </VStack>
                )}
              </Box>
            </CardBody>
          </Card>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {selectedFile && !transcriptionResult && (
          <HStack spacing={3} justify="center">
            <Button
              onClick={processFullWorkflow}
              disabled={isProcessing}
              colorScheme="blue"
              size="lg"
              leftIcon={isProcessing ? <Spinner size="sm" /> : undefined}
            >
              {isProcessing ? getCurrentStatus() : 'Upload & Transcribe'}
            </Button>
            <Button 
              onClick={resetUploader} 
              disabled={isProcessing}
              variant="outline"
            >
              Choose Different File
            </Button>
          </HStack>
        )}

        {isProcessing && (
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Progress value={isUploading ? uploadProgress : 100} size="lg" colorScheme="blue" w="100%" />
                <VStack spacing={2}>
                  <HStack>
                    <Badge colorScheme={pinataUrl ? 'green' : isUploading ? 'blue' : 'gray'}>
                      {pinataUrl ? '✓' : ''} Uploading file to Pinata IPFS for secure, decentralized storage
                    </Badge>
                  </HStack>
                  <HStack>
                    <Badge colorScheme={transcriptionResult ? 'green' : isTranscribing ? 'blue' : 'gray'}>
                      {transcriptionResult ? '✓' : ''} Processing with LemonFox AI
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {transcriptionResult && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Transcription Complete!</Heading>
                  <ButtonGroup size="sm">
                    <Button leftIcon={<CopyIcon />} onClick={copyTranscription}>
                      Copy
                    </Button>
                    <Button leftIcon={<DownloadIcon />} onClick={downloadTranscription}>
                      Download
                    </Button>
                    <Button leftIcon={<RepeatIcon />} onClick={resetUploader}>
                      New Upload
                    </Button>
                  </ButtonGroup>
                </HStack>
                
                <Divider />
                
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <Text fontWeight="bold">File:</Text>
                    <Text>{transcriptionResult.filename || selectedFile?.name}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">Audio URL:</Text>
                    <Link 
                      href={transcriptionResult.audioUrl || pinataUrl} 
                      isExternal 
                      color="blue.500"
                    >
                      View on IPFS
                    </Link>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">Processed:</Text>
                    <Text>{new Date(transcriptionResult.timestamp).toLocaleString()}</Text>
                  </HStack>
                </VStack>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>Transcription:</Text>
                  <Textarea
                    value={transcriptionResult.transcription || 'No transcription available'}
                    readOnly
                    minH="200px"
                    resize="vertical"
                    bg="gray.50"
                  />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Full N8N Response:</Text>
                  <Textarea
                    value={JSON.stringify(transcriptionResult, null, 2)}
                    readOnly
                    minH="150px"
                    resize="vertical"
                    bg="gray.50"
                    fontSize="sm"
                    fontFamily="monospace"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default TestUploadAudioToPinataAndTranscribeWithn8n;