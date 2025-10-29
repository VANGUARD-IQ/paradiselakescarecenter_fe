import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  useToast,
  useColorModeValue,
  useColorMode,
  Text,
  Alert,
  AlertIcon,
  Progress,
  IconButton,
  Badge,
  Divider,
  Container,
  Grid,
  GridItem,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { 
  ArrowBackIcon,
  RepeatIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { FaMicrophone, FaStop, FaPause, FaPlay, FaDownload } from 'react-icons/fa';

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;

const UPLOAD_RD_EVIDENCE = gql`
  mutation UploadRDEvidence(
    $projectId: String!
    $evidenceType: String!
    $activityId: String
    $title: String
    $description: String
    $fileUrl: String
    $content: String
    $source: String
    $participants: String
  ) {
    uploadRDEvidence(
      projectId: $projectId
      evidenceType: $evidenceType
      activityId: $activityId
      title: $title
      description: $description
      fileUrl: $fileUrl
      content: $content
      source: $source
      participants: $participants
    ) {
      id
      title
      evidenceType
      fileUrl
      captureDate
    }
  }
`;

const GET_RD_PROJECTS = gql`
  query GetRDProjects {
    getRDProjects {
      id
      projectName
      projectCode
      status
      projectType
    }
  }
`;

const GET_RD_ACTIVITIES = gql`
  query GetRDActivities($projectId: String) {
    getRDActivities(projectId: $projectId) {
      id
      activityName
      activityType
      rdProjectId
    }
  }
`;


const GENERATE_MEETING_NOTES = gql`
  mutation GenerateMeetingNotes($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const GET_TENANT_LEMONFOX_API_KEY = gql`
  query GetTenantLemonfoxApiKey {
    getTenantLemonfoxApiKey
  }
`;

const ResearchAndDesignRecordAudio: React.FC = () => {
  usePageTitle("Record R&D Audio");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const activityId = searchParams.get('activity');
  const toast = useToast();
  const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);
  const [uploadRDEvidence] = useMutation(UPLOAD_RD_EVIDENCE);
  const [generateMeetingNotes] = useMutation(GENERATE_MEETING_NOTES);
  
  // Query hook for tenant API key
  const { refetch: refetchApiKey } = useQuery(GET_TENANT_LEMONFOX_API_KEY);
  
  // Helper function to clean AI responses
  const cleanAIResponse = (text: string): string => {
    // Remove surrounding quotes if present
    let cleaned = text.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    // Remove common AI preambles
    cleaned = cleaned.replace(/^(Here is|Here are|This is|The following is|Based on the transcription,?)\s*/i, '');
    return cleaned.trim();
  };
  
  // Form state - needs to be declared before queries
  const [audioDetails, setAudioDetails] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    activityId: activityId || '',
    evidenceType: 'meeting', // Default to meeting for audio recordings
    source: 'Audio Recording',
    participants: '',
    tags: '',
  });
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Transcription and meeting notes state
  const [transcription, setTranscription] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [lastNotesContext, setLastNotesContext] = useState<string>("");
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [showTranscriptionEdit, setShowTranscriptionEdit] = useState(false);
  const [showMeetingNotesEdit, setShowMeetingNotesEdit] = useState(false);
  
  // Fetch projects and activities
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS);
  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: audioDetails.projectId },
    skip: !audioDetails.projectId
  });
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get data from queries
  const projects = projectsData?.getRDProjects || [];
  const activities = activitiesData?.getRDActivities || [];

  const getFilteredActivities = () => {
    if (!audioDetails.projectId || !activities) return [];
    return activities.filter((a: any) => a.rdProjectId === audioDetails.projectId);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Create MediaRecorder with best available format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Generate default title if not provided
        if (!audioDetails.title) {
          const timestamp = new Date().toLocaleString();
          setAudioDetails(prev => ({
            ...prev,
            title: `Audio Recording - ${timestamp}`
          }));
        }
        
        // Automatically start transcription
        await handleAutoTranscribe(audioBlob, mimeType);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Recording started',
        description: 'Your audio is being recorded',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording failed',
        description: 'Could not access microphone. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      toast({
        title: 'Recording stopped',
        description: 'Your audio has been saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Delete recording
  const deleteRecording = () => {
    cleanup();
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    
    toast({
      title: 'Recording deleted',
      description: 'You can start a new recording',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Upload audio to IPFS/Pinata
  const uploadAudio = async () => {
    if (!audioBlob || !audioDetails.title) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and ensure audio is recorded',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create File object from blob
      const filename = `${audioDetails.title.replace(/\s+/g, '-')}-${Date.now()}.webm`;
      const file = new File([audioBlob], filename, { type: 'audio/webm' });

      // Upload to IPFS using the mutation
      const { data } = await uploadFile({
        variables: { file },
        context: {
          headers: {
            "apollo-require-preflight": "true",
            "x-apollo-operation-name": "UploadUnencryptedFile"
          }
        }
      });

      const hash = data.uploadUnencryptedFile;
      const ipfsUrl = `https://gateway.lighthouse.storage/ipfs/${hash}`;
      
      console.log('Audio uploaded to IPFS:', {
        hash,
        url: ipfsUrl,
        details: audioDetails,
        duration: recordingTime,
      });

      // Save evidence record to database
      const evidenceResult = await uploadRDEvidence({
        variables: {
          projectId: audioDetails.projectId,
          evidenceType: audioDetails.evidenceType,
          activityId: audioDetails.activityId || null,
          title: audioDetails.title,
          description: audioDetails.description,
          fileUrl: ipfsUrl,
          source: audioDetails.source,
          participants: audioDetails.participants,
          content: JSON.stringify({
            duration: recordingTime,
            format: 'webm',
            tags: audioDetails.tags,
            fileName: filename
          })
        }
      });

      console.log('Evidence saved:', evidenceResult.data);
      
      toast({
        title: 'Audio uploaded successfully',
        description: 'Your audio evidence has been saved',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back to evidence page
      setTimeout(() => {
        navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Could not upload audio. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-transcribe after recording stops using Lemonfox.ai
  const handleAutoTranscribe = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      // First, get the tenant's Lemonfox API key
      setTranscriptionProgress(5);
      
      const { data: keyData } = await refetchApiKey();
      const apiKey = keyData?.getTenantLemonfoxApiKey;
      
      if (!apiKey) {
        throw new Error('Lemonfox.ai API key not configured for this tenant. Please contact support.');
      }
      
      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording-${timestamp}.${mimeType === 'audio/webm' ? 'webm' : 'wav'}`;
      const file = new File([blob], filename, { type: mimeType });
      
      // Start with initial progress
      setTranscriptionProgress(10);
      
      // Simulate progress more realistically for Lemonfox.ai
      let progress = 10;
      progressInterval = setInterval(() => {
        progress += Math.random() * 12; // Increase by 5-17%
        if (progress > 90) progress = 90; // Don't go to 100% until actually complete
        setTranscriptionProgress(Math.floor(progress));
      }, 1500); // Update every 1.5 seconds
      
      // Call Lemonfox.ai API with tenant-specific API key
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'english');
      formData.append('response_format', 'json');

      let response;
      try {
        response = await fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData
        });
      } catch (fetchError) {
        // Clear progress simulation on error
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        console.error('Network error calling Lemonfox.ai:', fetchError);
        throw new Error(`Network error: Cannot reach Lemonfox.ai API. This may be due to CORS restrictions or network connectivity issues.`);
      }
      
      // Clear progress simulation and set to 100%
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setTranscriptionProgress(100);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Lemonfox.ai API error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      
      if (result?.text) {
        setTranscription(result.text);
        setShowTranscriptionEdit(true);
        
        const wordCount = result.text.split(/\s+/).filter((word: string) => word.length > 0).length;
        
        toast({
          title: 'Transcription complete!',
          description: `Processed using Lemonfox.ai • ${wordCount} words`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Auto-generate meeting notes if this is a meeting type
        if (audioDetails.evidenceType === 'meeting' || audioDetails.evidenceType === 'interview') {
          await handleGenerateMeetingNotes(result.text);
        }
      }
    } catch (error: any) {
      // Make sure to clear the progress interval on error too
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      console.error('Auto-transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: error.message || 'Could not transcribe audio automatically',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
    }
  };
  
  // Generate meeting notes from transcription
  const handleGenerateMeetingNotes = async (transcriptionText: string) => {
    setIsGeneratingNotes(true);
    
    try {
      // Clean up transcription to remove excessive repetition
      const cleanedTranscription = transcriptionText
        .replace(/(\b(yeah|yes|um|uh|hmm)\b\s*){3,}/gi, 'Yes. ') // Replace multiple "yeah"s
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Detect if this is test content or minimal content
      const isTestContent = /^(test|testing|hello|hi|check|mic|microphone|one two three|1 2 3).{0,20}$/i.test(cleanedTranscription);
      const isMinimalContent = cleanedTranscription.split(/\s+/).length < 10; // Less than 10 words
      const isRepetitiveContent = /^(\w+[\s,]*){1,3}$/.test(cleanedTranscription.replace(/[.,!?]/g, ''));
      
      if (isTestContent || isMinimalContent || isRepetitiveContent) {
        // For test/minimal content, provide a simple, appropriate response
        const simpleNotes = `**Meeting Overview**: Audio recording test\n\n**Content**: ${cleanedTranscription}\n\n**Note**: This appears to be a test recording. For actual meetings, record substantive discussion content to generate detailed R&D meeting notes.`;
        setMeetingNotes(simpleNotes);
        setShowMeetingNotesEdit(true);
        
        toast({
          title: '📝 Simple notes created',
          description: 'Test content detected - generated basic notes',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
        return;
      }
      
      // Limit transcription length to ensure complete responses
      const maxTranscriptionLength = 2000; // Reasonable limit for AI processing
      const limitedTranscription = cleanedTranscription.length > maxTranscriptionLength 
        ? cleanedTranscription.substring(0, maxTranscriptionLength) + '...' 
        : cleanedTranscription;
      
      const context = `Convert this meeting transcription into structured R&D meeting notes. Include all sections completely:

**Meeting Overview**: Brief summary
**Key Points**: Main discussion topics  
**Decisions Made**: Agreements/conclusions
**Discoveries**: Insights/findings
**Action Items**: Next steps (complete this section fully)
**Technical Details**: Important specifications

Ensure ALL sections are complete, especially Action Items. Return only the formatted meeting notes. Transcription: "${limitedTranscription}"`;
      setLastNotesContext(context);
      
      const { data } = await generateMeetingNotes({
        variables: {
          text: limitedTranscription,
          context: context
        },
      });
      
      if (data?.improveDescription) {
        const cleanedNotes = cleanAIResponse(data.improveDescription);
        
        // Check if response seems incomplete (ends abruptly)
        if (cleanedNotes.endsWith('- ') || cleanedNotes.match(/\w+\s*$/)) {
          // Try to regenerate with shorter input if it seems cut off
          const shorterTranscription = limitedTranscription.substring(0, 1500);
          const retryContext = `Create complete R&D meeting notes from this transcription. Ensure ALL sections finish properly, especially Action Items. Keep it concise but complete. Transcription: "${shorterTranscription}"`;
          setLastNotesContext(retryContext);
          
          const retryData = await generateMeetingNotes({
            variables: {
              text: shorterTranscription,
              context: retryContext
            },
          });
          
          if (retryData?.data?.improveDescription) {
            const retryCleaned = cleanAIResponse(retryData.data.improveDescription);
            setMeetingNotes(retryCleaned);
          } else {
            setMeetingNotes(cleanedNotes + '\n\n[Note: Meeting notes may be incomplete due to processing limits]');
          }
        } else {
          setMeetingNotes(cleanedNotes);
        }
        
        setShowMeetingNotesEdit(true);
        
        toast({
          title: '📝 Meeting notes generated!',
          description: 'Claude has created structured meeting notes from your recording',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Meeting notes generation error:', error);
      toast({
        title: 'Meeting notes generation failed',
        description: error.message || 'Could not generate meeting notes',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Save transcription as evidence
  const saveTranscriptionAsEvidence = async () => {
    if (!transcription || !audioDetails.projectId) {
      toast({
        title: 'Missing information',
        description: 'Please ensure you have a transcription and project selected',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    setIsUploading(true);
    try {
      // Convert audio blob to base64 if available
      let fileBase64 = null;
      let fileName = null;
      if (audioBlob) {
        const reader = new FileReader();
        fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });
        fileName = `${audioDetails.title.replace(/\s+/g, '-')}-${Date.now()}.webm`;
      }
      
      const { data } = await uploadRDEvidence({
        variables: {
          projectId: audioDetails.projectId,
          evidenceType: 'audio',
          activityId: audioDetails.activityId || null,
          title: audioDetails.title,
          description: `${audioDetails.description}\n\nTranscription:\n${transcription}`,
          fileBase64: fileBase64,
          fileName: fileName,
          content: transcription,
          source: audioDetails.source,
          participants: audioDetails.participants,
        },
      });
      
      toast({
        title: 'Evidence saved!',
        description: 'Audio recording and transcription saved as evidence',
        status: 'success',
        duration: 5000,
      });
      
      // Navigate to evidence page
      setTimeout(() => {
        navigate(`/researchanddesign/evidence/${data.uploadRDEvidence.id}?project=${audioDetails.projectId}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('Save evidence error:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save evidence',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save meeting notes as evidence
  const saveMeetingNotesAsEvidence = async () => {
    if (!meetingNotes || !audioDetails.projectId) {
      toast({
        title: 'Missing information',
        description: 'Please ensure you have meeting notes and project selected',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const { data } = await uploadRDEvidence({
        variables: {
          projectId: audioDetails.projectId,
          evidenceType: 'document',
          activityId: audioDetails.activityId || null,
          title: `Meeting Notes - ${audioDetails.title}`,
          description: 'AI-generated meeting notes from audio recording',
          content: meetingNotes,
          source: 'AI Meeting Notes Generator',
          participants: audioDetails.participants,
        },
      });
      
      toast({
        title: 'Meeting notes saved!',
        description: 'Meeting notes saved as evidence',
        status: 'success',
        duration: 5000,
      });
      
      // Navigate to evidence page
      setTimeout(() => {
        navigate(`/researchanddesign/evidence/${data.uploadRDEvidence.id}?project=${audioDetails.projectId}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('Save meeting notes error:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save meeting notes',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Download audio
  const downloadAudio = () => {
    if (audioURL && audioBlob) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `${audioDetails.title || 'audio-recording'}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.xl" py={8}>
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`)}
          >
            Back to Evidence
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <Heading size="lg" color={getColor("text.primary", colorMode)}>
            Record Audio Evidence
          </Heading>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
            {/* Recording Controls */}
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} height="full">
                <CardHeader>
                  <Heading size="md">Audio Recorder</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    {/* Recording Status */}
                    <Box textAlign="center" py={8}>
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
                      <CircularProgress
                        value={isRecording ? (recordingTime % 60) / 60 * 100 : 0}
                        size="200px"
                        thickness="4px"
                        color={isRecording ? 'red.500' : getColor("primary", colorMode)}
                      >
                        <CircularProgressLabel>
                          <VStack spacing={2}>
                            <Text fontSize="3xl" fontWeight="bold">
                              {formatTime(recordingTime)}
                            </Text>
                            {isRecording && (
                              <Badge colorScheme={isPaused ? 'yellow' : 'red'}>
                                {isPaused ? 'PAUSED' : 'RECORDING'}
                              </Badge>
                            )}
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Box>

                    {/* Control Buttons */}
                    <HStack spacing={4} justify="center">
                      {!isRecording && !audioURL && (
                        <Button
                          leftIcon={<FaMicrophone />}
                          size="lg"
                          colorScheme="red"
                          onClick={startRecording}
                          width="200px"
                        >
                          Start Recording
                        </Button>
                      )}

                      {isRecording && (
                        <>
                          <IconButton
                            aria-label={isPaused ? 'Resume' : 'Pause'}
                            icon={isPaused ? <FaPlay /> : <FaPause />}
                            size="lg"
                            variant="outline"
                            onClick={togglePause}
                          />
                          <Button
                            leftIcon={<FaStop />}
                            size="lg"
                            colorScheme="red"
                            variant="outline"
                            onClick={stopRecording}
                          >
                            Stop Recording
                          </Button>
                        </>
                      )}

                      {audioURL && !isRecording && (
                        <>
                          <Button
                            leftIcon={<RepeatIcon />}
                            size="lg"
                            variant="outline"
                            onClick={() => {
                              deleteRecording();
                              startRecording();
                            }}
                          >
                            Record Again
                          </Button>
                          <IconButton
                            aria-label="Delete recording"
                            icon={<DeleteIcon />}
                            size="lg"
                            colorScheme="red"
                            variant="outline"
                            onClick={deleteRecording}
                          />
                        </>
                      )}
                    </HStack>

                    {/* Audio Player */}
                    {audioURL && (
                      <Box width="100%" pt={4}>
                        <Divider mb={4} />
                        <VStack spacing={4}>
                          <Text fontWeight="semibold">Preview Recording</Text>
                          <audio controls style={{ width: '100%' }}>
                            <source src={audioURL} type="audio/webm" />
                            Your browser does not support the audio element.
                          </audio>
                          <HStack spacing={2}>
                            <Button
                              leftIcon={<FaDownload />}
                              size="sm"
                              variant="outline"
                              onClick={downloadAudio}
                            >
                              Download Audio
                            </Button>
                            <Button
                              leftIcon={<FaMicrophone />}
                              size="sm"
                              bg={getColor("primary", colorMode)}
                              color="white"
                              _hover={{ bg: getColor("primaryHover", colorMode) }}
                              onClick={() => audioBlob && handleAutoTranscribe(audioBlob, 'audio/webm')}
                              isDisabled={isTranscribing || !audioBlob}
                              isLoading={isTranscribing}
                              loadingText="Transcribing..."
                            >
                              Transcribe with Lemonfox.ai
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}

                    {/* Auto-transcription Progress */}
                    {isTranscribing && (
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold" color={getColor("primary", colorMode)}>
                            🤖 AI Transcribing Audio...
                          </Text>
                          <Text fontSize="xs" color={getColor("text.secondary", colorMode)}>
                            {transcriptionProgress}%
                          </Text>
                        </HStack>
                        <Progress
                          value={transcriptionProgress}
                          size="md"
                          colorScheme="blue"
                          hasStripe
                          isAnimated
                          borderRadius="md"
                        />
                        <Text fontSize="xs" color={getColor("text.secondary", colorMode)} mt={2}>
                          🧠 Using Lemonfox.ai Whisper v3 • Click "Transcribe with Lemonfox.ai" button
                        </Text>
                      </Box>
                    )}
                    
                    {/* AI Notes Generation Progress */}
                    {isGeneratingNotes && (
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold" color={getColor("primary", colorMode)}>
                            📝 AI Generating Meeting Notes...
                          </Text>
                        </HStack>
                        <Progress
                          size="md"
                          colorScheme="green"
                          isIndeterminate
                          borderRadius="md"
                        />
                        <Text fontSize="xs" color={getColor("text.secondary", colorMode)} mt={2}>
                          🤖 Using Claude AI to create structured meeting notes
                        </Text>
                      </Box>
                    )}

                    {/* Recording Tips */}
                    <Alert status="info" borderRadius="md" mt={4}>
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold" fontSize="sm">🎯 AI-Powered Meeting Documentation:</Text>
                        <Text fontSize="xs">🎤 Record your R&D meetings, discussions, and interviews</Text>
                        <Text fontSize="xs">🤖 Transcription using Lemonfox.ai Whisper v3 API</Text>
                        <Text fontSize="xs">📝 Professional meeting notes generated by Claude AI</Text>
                        <Text fontSize="xs">💾 Save structured meeting notes as project evidence</Text>
                      </VStack>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Audio Details Form */}
            <GridItem>
              <Card bg={cardBg} borderColor={borderColor} height="full">
                <CardHeader>
                  <Heading size="md">Audio Details</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        value={audioDetails.title}
                        onChange={(e) => setAudioDetails({...audioDetails, title: e.target.value})}
                        placeholder="e.g., Team Discussion on Algorithm Selection"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Evidence Type</FormLabel>
                    <Select
                        value={audioDetails.evidenceType}
                        onChange={(e) => setAudioDetails({...audioDetails, evidenceType: e.target.value})}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={getColor("border.darkCard", colorMode)}
                      color={getColor("text.primaryDark", colorMode)}
                      size="lg"
                      fontSize="md"
                      _hover={{ borderColor: getColor("text.secondaryDark", colorMode) }}
                      _focus={{
                        borderColor: getColor("text.secondaryDark", colorMode),
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      >
                      <option value="meeting" style={{ backgroundColor: '#1a1a1a' }}>🏢 Meeting Audio - Meeting recordings with transcription</option>
                      <option value="audio" style={{ backgroundColor: '#1a1a1a' }}>🎤 Audio Recording - General audio recordings</option>
                      <option value="interview" style={{ backgroundColor: '#1a1a1a' }}>🎙️ Interview - Interview recordings</option>
                      <option value="presentation" style={{ backgroundColor: '#1a1a1a' }}>📊 Presentation - Presentation recordings</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={audioDetails.description}
                        onChange={(e) => setAudioDetails({...audioDetails, description: e.target.value})}
                        placeholder="Describe the content and context of this audio recording..."
                        rows={4}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Project</FormLabel>
                      <Select
                        value={audioDetails.projectId}
                        onChange={(e) => setAudioDetails({...audioDetails, projectId: e.target.value, activityId: ''})}
                        placeholder={projectsLoading ? "Loading projects..." : "Select project..."}
                        isDisabled={projectsLoading}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={getColor("border.darkCard", colorMode)}
                        color={getColor("text.primaryDark", colorMode)}
                        size="lg"
                        fontSize="md"
                        _hover={{ borderColor: getColor("text.secondaryDark", colorMode) }}
                        _focus={{
                          borderColor: getColor("text.secondaryDark", colorMode),
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                            {project.projectName} {project.projectCode && `(${project.projectCode})`}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Activity (optional)</FormLabel>
                      <Select
                        value={audioDetails.activityId}
                        onChange={(e) => setAudioDetails({...audioDetails, activityId: e.target.value})}
                        placeholder={activitiesLoading ? "Loading activities..." : "Select activity..."}
                        isDisabled={!audioDetails.projectId || activitiesLoading}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={getColor("border.darkCard", colorMode)}
                        color={getColor("text.primaryDark", colorMode)}
                        size="lg"
                        fontSize="md"
                        _hover={{ borderColor: getColor("text.secondaryDark", colorMode) }}
                        _focus={{
                          borderColor: getColor("text.secondaryDark", colorMode),
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        {getFilteredActivities().map((activity: any) => (
                          <option key={activity.id} value={activity.id} style={{ backgroundColor: '#1a1a1a' }}>
                            {activity.activityName}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Participants</FormLabel>
                      <Input
                        value={audioDetails.participants}
                        onChange={(e) => setAudioDetails({...audioDetails, participants: e.target.value})}
                        placeholder="List participants separated by commas"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tags (optional)</FormLabel>
                      <Input
                        value={audioDetails.tags}
                        onChange={(e) => setAudioDetails({...audioDetails, tags: e.target.value})}
                        placeholder="e.g., meeting, brainstorming, technical-discussion"
                      />
                    </FormControl>

                    {/* Transcription Display and Edit */}
                    {transcription && showTranscriptionEdit && (
                      <Card bg={cardBg} borderColor={borderColor}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <HStack>
                              <Heading size="sm">🤖 Raw AI Transcription</Heading>
                              <Badge colorScheme="gray" variant="outline">Reference Only</Badge>
                            </HStack>
                            <Badge colorScheme="yellow" variant="outline">Optional</Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Alert status="info" borderRadius="md">
                              <AlertIcon />
                              <Text fontSize="sm">
                                ℹ️ This is the raw transcription. The structured meeting notes above are recommended for evidence.
                              </Text>
                            </Alert>
                            <Textarea
                              value={transcription}
                              onChange={(e) => setTranscription(e.target.value)}
                              minH="200px"
                              fontFamily="mono"
                              fontSize="sm"
                              placeholder="Raw transcription will appear here..."
                              bg={getColor("background.light", colorMode)}
                            />
                            <HStack justify="space-between">
                              <Text fontSize="xs" color={getColor("text.secondary", colorMode)}>
                                {transcription.split(/\\s+/).filter(w => w.length > 0).length} words • Raw speech-to-text output
                              </Text>
                              <HStack>
                                <Button
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(transcription)}
                                  variant="outline"
                                >
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={saveTranscriptionAsEvidence}
                                  variant="outline"
                                  isLoading={isUploading}
                                  isDisabled={!audioDetails.projectId}
                                >
                                  Save Raw Transcription
                                </Button>
                              </HStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                    
                    {/* Meeting Notes Display and Edit */}
                    {meetingNotes && showMeetingNotesEdit && (
                      <Card bg={cardBg} borderColor={getColor("primary", colorMode)} borderWidth="2px">
                        <CardHeader>
                          <HStack justify="space-between">
                            <HStack>
                              <Heading size="sm">📝 Professional Meeting Notes</Heading>
                              <Badge colorScheme="blue" variant="solid">Claude AI Generated</Badge>
                            </HStack>
                            <Badge colorScheme="green" variant="outline">Recommended for Evidence</Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Alert status="success" borderRadius="md">
                              <AlertIcon />
                              <Text fontSize="sm">
                                ✅ These structured meeting notes are formatted for R&D documentation and ready to save as evidence.
                              </Text>
                            </Alert>
                            <Textarea
                              value={meetingNotes}
                              onChange={(e) => setMeetingNotes(e.target.value)}
                              minH="350px"
                              fontSize="sm"
                              placeholder="Professional meeting notes will appear here..."
                              bg={getColor("background.light", colorMode)}
                            />
                            <HStack justify="space-between">
                              <Text fontSize="xs" color={getColor("text.secondary", colorMode)}>
                                📊 Structured for R&D compliance • 📝 Professional format • 🎯 Ready for evidence
                              </Text>
                              <HStack>
                                <Button
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(meetingNotes)}
                                  variant="outline"
                                >
                                  Copy
                                </Button>
                                <Button
                                  size="lg"
                                  onClick={saveMeetingNotesAsEvidence}
                                  bg={getColor("primary", colorMode)}
                                  color="white"
                                  _hover={{ bg: getColor("primaryHover", colorMode) }}
                                  isLoading={isUploading}
                                  isDisabled={!audioDetails.projectId}
                                  leftIcon={<Text>💾</Text>}
                                >
                                  Save Meeting Notes as Evidence
                                </Button>
                              </HStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Upload Button - Legacy option */}
                    {audioBlob && !transcription && (
                      <Button
                        width="full"
                        bg={getColor("primary", colorMode)}
                        color="white"
                        _hover={{ bg: getColor("primaryHover", colorMode) }}
                        onClick={uploadAudio}
                        isDisabled={!audioBlob || !audioDetails.title || !audioDetails.projectId || isUploading}
                        isLoading={isUploading}
                        loadingText="Uploading..."
                      >
                        Upload Audio Only (Without AI Processing)
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default ResearchAndDesignRecordAudio;