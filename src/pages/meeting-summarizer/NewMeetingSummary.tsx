import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  Divider,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  Spinner,
  ButtonGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
} from '@chakra-ui/react';
import { 
  FiMic, 
  FiMicOff, 
  FiUpload, 
  FiPlay, 
  FiPause,
  FiSave
} from 'react-icons/fi';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import meetingSummarizerModule from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';

// GraphQL Mutations
const UPLOAD_TO_PINATA = gql`
  mutation UploadToPinata($file: Upload!) {
    uploadToPinata(file: $file)
  }
`;

const CREATE_MEETING = gql`
  mutation CreateMeeting($input: MeetingInput!) {
    createMeeting(input: $input) {
      id
      title
      description
      date
      location
      attendees
      audioUrl
      audioIpfsHash
      status
      createdAt
    }
  }
`;

const UPLOAD_MEETING_AUDIO = gql`
  mutation UploadMeetingAudio($meetingId: ID!, $audioIpfsHash: String!) {
    uploadMeetingAudio(meetingId: $meetingId, audioIpfsHash: $audioIpfsHash) {
      id
      audioUrl
      audioIpfsHash
      status
    }
  }
`;


const NewMeetingSummary: React.FC = () => {
  usePageTitle('New Meeting Summary');
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { colorMode } = useColorMode();

  // Theme-aware styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor(colorMode === 'light' ? "white" : "background.cardGradient", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.lightCard" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const buttonBg = getColor("primary", colorMode);
  const buttonHoverBg = getColor("secondary", colorMode);
  const textColor = textPrimary; // For compatibility
  const inputBg = colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)";
  const inputTextColor = colorMode === 'light' ? "gray.800" : textPrimary;
  const inputBorder = colorMode === 'light' ? "gray.200" : "rgba(255, 255, 255, 0.2)";

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [currentAttendee, setCurrentAttendee] = useState('');
  
  // Audio state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Upload and processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'transcribing' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);


  // GraphQL mutations
  const [uploadToPinata] = useMutation(UPLOAD_TO_PINATA);
  const [createMeeting] = useMutation(CREATE_MEETING);
  const [uploadMeetingAudio] = useMutation(UPLOAD_MEETING_AUDIO);

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        status: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Failed to start recording",
        description: "Please check your microphone permissions",
        status: "error",
        duration: 5000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        status: "success",
        duration: 2000,
      });
    }
  };

  const processAudioFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/mp3', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file",
        status: "error",
        duration: 5000,
      });
      return;
    }

    // Validate file size (150MB limit)
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file under 150MB",
        status: "error",
        duration: 5000,
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setRecordedAudio(null);
    
    toast({
      title: "File loaded",
      description: `${file.name} ready for upload`,
      status: "success",
      duration: 3000,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processAudioFile(file);
    }
  };

  const addAttendee = () => {
    if (currentAttendee.trim()) {
      setAttendees([...attendees, currentAttendee.trim()]);
      setCurrentAttendee('');
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a meeting title",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!selectedFile && !recordedAudio) {
      toast({
        title: "Audio required",
        description: "Please record or upload an audio file",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create the meeting
      const { data: meetingData } = await createMeeting({
        variables: {
          input: {
            title,
            description,
            date: new Date(date),
            location,
            attendees
          }
        }
      });

      const newMeetingId = meetingData.createMeeting.id;

      // Step 2: Upload audio to Pinata
      setIsUploading(true);
      setUploadStage('uploading');
      setUploadProgress(10); // Initial progress
      
      // Create File object from recorded audio if needed
      let fileToUpload = selectedFile;
      if (!fileToUpload && recordedAudio) {
        fileToUpload = new File([recordedAudio], `meeting-${Date.now()}.webm`, { type: 'audio/webm' });
      }

      const { data: uploadData } = await uploadToPinata({
        variables: { file: fileToUpload }
      });

      const ipfsHash = uploadData.uploadToPinata;
      
      // Update progress to 50% when IPFS upload is complete
      setUploadProgress(50);
      setUploadStage('transcribing');
      
      // Step 3: Update meeting with audio URL
      await uploadMeetingAudio({
        variables: {
          meetingId: newMeetingId,
          audioIpfsHash: ipfsHash
        }
      });
      
      // Update progress to 80% after submitting for transcription
      setUploadProgress(80);

      // Step 4: Transcription is handled by backend automatically
      // The backend calls n8n webhook when uploadMeetingAudio is called
      // Just show success and navigate
      
      toast({
        title: "Meeting created successfully",
        description: "Audio is being transcribed. This usually takes a few seconds.",
        status: "success",
        duration: 5000,
      });

      // Navigate to meeting details page
      setTimeout(() => {
        navigate(`/meeting-summarizer/${newMeetingId}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Failed to create meeting",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
      setUploadStage(null);
      setUploadProgress(0);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
      
      <Container maxW="container.xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading color={textColor} fontFamily={brandConfig.fonts.heading}>
              Create Meeting Summary
            </Heading>
            <Button
              variant="ghost"
              onClick={() => navigate('/meeting-summarizer')}
              color={textColor}
            >
              View All Meetings
            </Button>
          </HStack>

          <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <Heading size="lg" color={textColor}>Meeting Details</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="lg" fontWeight="semibold">Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter meeting title"
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={inputTextColor}
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: buttonBg, boxShadow: 'outline' }}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor} fontSize="lg" fontWeight="semibold">Description</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter meeting description"
                    bg={inputBg}
                    borderColor={inputBorder}
                    color={inputTextColor}
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: buttonBg, boxShadow: 'outline' }}
                    rows={3}
                    fontSize="md"
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color={textColor} fontSize="lg" fontWeight="semibold">Date</FormLabel>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      bg={inputBg}
                      borderColor={inputBorder}
                      color={inputTextColor}
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: buttonBg, boxShadow: 'outline' }}
                      size="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor} fontSize="lg" fontWeight="semibold">Location</FormLabel>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                      bg={inputBg}
                      borderColor={inputBorder}
                      color={inputTextColor}
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: buttonBg, boxShadow: 'outline' }}
                      size="lg"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel color={textColor} fontSize="lg" fontWeight="semibold">Attendees</FormLabel>
                  <HStack mb={2}>
                    <Input
                      value={currentAttendee}
                      onChange={(e) => setCurrentAttendee(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                      placeholder="Enter attendee name"
                      bg={inputBg}
                      borderColor={inputBorder}
                      color={inputTextColor}
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: buttonBg, boxShadow: 'outline' }}
                      size="lg"
                    />
                    <Button onClick={addAttendee} size="lg" bg={buttonBg} color="white" _hover={{ bg: buttonHoverBg }}>Add</Button>
                  </HStack>
                  <HStack wrap="wrap" spacing={2}>
                    {attendees.map((attendee, index) => (
                      <Tag key={index} size="md" colorScheme="blue">
                        <TagLabel>{attendee}</TagLabel>
                        <TagCloseButton onClick={() => removeAttendee(index)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <Heading size="lg" color={textColor}>Audio Recording</Heading>
            </CardHeader>
            <CardBody>
              <Tabs colorScheme="blue">
                <TabList>
                  <Tab color={textColor}>Record Audio</Tab>
                  <Tab color={textColor}>Upload Audio</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4}>
                      <ButtonGroup>
                        <Button
                          leftIcon={isRecording ? <FiMicOff /> : <FiMic />}
                          colorScheme={isRecording ? "red" : "green"}
                          onClick={isRecording ? stopRecording : startRecording}
                          size="lg"
                        >
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                      </ButtonGroup>

                      {isRecording && (
                        <HStack>
                          <Spinner color="red.500" />
                          <Text color={textColor}>Recording in progress...</Text>
                        </HStack>
                      )}

                      {recordedAudio && !isRecording && (
                        <Alert status="success">
                          <AlertIcon />
                          Audio recorded successfully
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4}>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        display="none"
                      />
                      
                      <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        w="100%"
                        p={8}
                        border="2px dashed"
                        borderColor={isDragging ? buttonBg : (colorMode === 'light' ? 'gray.300' : 'gray.600')}
                        borderRadius="xl"
                        bg={isDragging ? (colorMode === 'light' ? 'teal.50' : 'rgba(0, 128, 128, 0.1)') : (colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.05)')}
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        _hover={{
                          borderColor: buttonBg,
                          bg: colorMode === 'light' ? 'teal.50' : 'rgba(0, 128, 128, 0.1)'
                        }}
                      >
                        <VStack spacing={3}>
                          <FiUpload size={48} color={isDragging ? buttonBg : (colorMode === 'light' ? 'gray.600' : 'gray.400')} />
                          <Text color={colorMode === 'light' ? "gray.800" : textColor} fontSize="lg" fontWeight="semibold">
                            {isDragging ? 'Drop audio file here' : 'Drag & drop audio file here'}
                          </Text>
                          <Text color={colorMode === 'light' ? "gray.600" : textMuted} fontSize="md">
                            or click to browse
                          </Text>
                          <Text color={colorMode === 'light' ? "gray.500" : textMuted} fontSize="sm">
                            Supported formats: MP3, WAV, M4A, WebM, OGG (max 150MB)
                          </Text>
                        </VStack>
                      </Box>

                      {selectedFile && (
                        <Alert status="success" bg={colorMode === 'light' ? "green.50" : "rgba(72, 187, 120, 0.1)"} borderColor={colorMode === 'light' ? "green.200" : "rgba(72, 187, 120, 0.3)"}>
                          <AlertIcon color={colorMode === 'light' ? "green.500" : "green.300"} />
                          <Box>
                            <Text color={colorMode === 'light' ? "gray.800" : textColor} fontWeight="semibold">
                              {selectedFile.name}
                            </Text>
                            <Text color={colorMode === 'light' ? "gray.600" : textMuted} fontSize="sm">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </Text>
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {audioUrl && (
                <Box mt={4}>
                  <Divider mb={4} />
                  <VStack spacing={3}>
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                    <ButtonGroup>
                      <IconButton
                        icon={isPlaying ? <FiPause /> : <FiPlay />}
                        onClick={togglePlayPause}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        colorScheme="blue"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAudioUrl(null);
                          setSelectedFile(null);
                          setRecordedAudio(null);
                        }}
                      >
                        Clear Audio
                      </Button>
                    </ButtonGroup>
                  </VStack>
                </Box>
              )}

              {isUploading && (
                <Box mt={4}>
                  <VStack spacing={2} align="stretch">
                    <Text color={textColor} fontWeight="semibold">
                      {uploadStage === 'uploading' && 'Uploading audio to IPFS...'}
                      {uploadStage === 'transcribing' && 'Audio uploaded! Waiting for transcription...'}
                    </Text>
                    <Progress 
                      value={uploadProgress} 
                      size="sm" 
                      colorScheme={uploadStage === 'transcribing' ? "green" : "blue"}
                      hasStripe
                      isAnimated={uploadStage === 'transcribing'}
                    />
                    <Text color={textMuted} fontSize="sm">
                      {uploadStage === 'uploading' && `Uploading: ${uploadProgress}%`}
                      {uploadStage === 'transcribing' && 'Processing audio through AI transcription service...'}
                    </Text>
                  </VStack>
                </Box>
              )}
            </CardBody>
          </Card>

          <Button
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            size="lg"
            onClick={handleSubmit}
            isLoading={isProcessing}
            loadingText="Processing..."
            isDisabled={!title || (!selectedFile && !recordedAudio)}
            borderRadius="xl"
            leftIcon={<FiSave />}
          >
            Create Meeting Summary
          </Button>
        </VStack>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default NewMeetingSummary;