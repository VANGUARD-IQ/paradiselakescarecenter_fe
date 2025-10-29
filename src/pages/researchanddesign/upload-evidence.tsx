import React, { useState, useCallback, useRef } from 'react';
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
  Grid,
  GridItem,
  useToast,
  useColorModeValue,
  useColorMode,
  Text,
  Alert,
  AlertIcon,
  Progress,
  Container,
  Icon,
  Spinner,
  Center,
  IconButton,
  Code,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  ArrowBackIcon,
  AttachmentIcon,
  CopyIcon,
  DownloadIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FaMicrophone, FaFileAudio } from 'react-icons/fa';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { MeetingNotesPDFDocument } from './components/MeetingNotesPDFDocument';
import { PDFViewer } from '@react-pdf/renderer';

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


const UPLOAD_RD_EVIDENCE = gql`
  mutation UploadRDEvidence(
    $projectId: String!
    $evidenceType: String!
    $activityId: String
    $title: String
    $description: String
    $fileBase64: String
    $fileName: String
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
      fileBase64: $fileBase64
      fileName: $fileName
      fileUrl: $fileUrl
      content: $content
      source: $source
      participants: $participants
    ) {
      id
      title
      evidenceType
      captureDate
    }
  }
`;


const GENERATE_MEETING_NOTES = gql`
  mutation GenerateMeetingNotes($transcription: String!) {
    convertTranscriptionIntoMeetingNotes(transcription: $transcription)
  }
`;

const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const GET_TENANT_LEMONFOX_API_KEY = gql`
  query GetTenantLemonfoxApiKey {
    getTenantLemonfoxApiKey
  }
`;

const ResearchAndDesignUploadEvidence: React.FC = () => {
  usePageTitle("Upload R&D Evidence");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const activityId = searchParams.get('activity');
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);
  const selectedFileBg = "rgba(0, 0, 0, 0.2)";
  const aiEngineBg = "rgba(59, 130, 246, 0.1)";
  const logsBg = "rgba(0, 0, 0, 0.2)";

  const [uploading, setUploading] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    projectId: projectId || '',
    activityId: activityId || '',
    evidenceType: 'document',
    title: '',
    description: '',
    source: '',
    participants: '',
    file: null as File | null,
  });

  const [dragActive, setDragActive] = useState(false);
  
  // Transcription state
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [showTranscriptionEdit, setShowTranscriptionEdit] = useState(false);
  const [meetingNotesContent, setMeetingNotesContent] = useState<string>('');
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  const [isImprovingTitle, setIsImprovingTitle] = useState(false);

  // Fetch real data from GraphQL
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS);
  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: newEvidence.projectId },
    skip: !newEvidence.projectId
  });

  // Mutation hooks
  const [uploadRDEvidence] = useMutation(UPLOAD_RD_EVIDENCE);
  const [generateMeetingNotes] = useMutation(GENERATE_MEETING_NOTES);
  const [improveDescription] = useMutation(IMPROVE_DESCRIPTION);
  
  // Query hook for tenant API key
  const { data: apiKeyData, refetch: refetchApiKey } = useQuery(GET_TENANT_LEMONFOX_API_KEY);

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

  // Get data from queries
  const projects = projectsData?.getRDProjects || [];
  const activities = activitiesData?.getRDActivities || [];

  const evidenceTypes = [
    { value: 'document', label: 'Document', icon: '📄', description: 'PDFs, Word docs, spreadsheets' },
    { value: 'screenshot', label: 'Screenshot', icon: '📸', description: 'Screen captures, UI mockups' },
    { value: 'photo', label: 'Photo', icon: '📷', description: 'Physical photos, whiteboard sessions' },
    { value: 'audio', label: 'Audio Recording', icon: '🎤', description: 'Audio recordings, meetings' },
    { value: 'meeting', label: 'Meeting Audio', icon: '🏢', description: 'Meeting recordings with transcription' },
    { value: 'meeting-notes', label: 'Upload Meeting Notes from Audio', icon: '📝', description: 'Upload audio and auto-generate meeting notes' },
    { value: 'code', label: 'Code', icon: '💻', description: 'Source code, scripts, configs' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email communications' },
    { value: 'chat', label: 'Chat', icon: '💬', description: 'Chat logs, messaging' },
    { value: 'other', label: 'Other', icon: '📎', description: 'Other file types' },
  ];

  const getFilteredActivities = () => {
    if (!newEvidence.projectId) return [];
    return activities.filter((a: any) => a.rdProjectId === newEvidence.projectId);
  };

  // Check if selected file is audio
  const isAudioFile = (file: File | null): boolean => {
    if (!file) return false;
    const audioTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
      'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/mp4a-latm', 'audio/aac',
      'audio/webm', 'audio/ogg', 'audio/flac'
    ];
    return audioTypes.includes(file.type);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setNewEvidence(prev => ({ ...prev, file, title: file.name.split('.')[0] }));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewEvidence(prev => ({ ...prev, file, title: file.name.split('.')[0] }));
      // Auto-set evidence type to meeting-notes if it's an audio file
      if (isAudioFile(file)) {
        setNewEvidence(prev => ({ ...prev, evidenceType: 'meeting-notes' }));
      }
    }
  };

  const handleTranscribe = async () => {
    if (!newEvidence.file || !isAudioFile(newEvidence.file)) {
      toast({
        title: 'No audio file selected',
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
      // First, get the tenant's Lemonfox API key
      setProgressStage('Getting API credentials...');
      setUploadProgress(5);
      
      const { data: keyData } = await refetchApiKey();
      const apiKey = keyData?.getTenantLemonfoxApiKey;
      
      if (!apiKey) {
        throw new Error('Lemonfox.ai API key not configured for this tenant. Please contact support.');
      }
      
      setProgressStage('Uploading to Lemonfox.ai...');
      setUploadProgress(10);

      // Start processing timer
      const timer = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Calculate timing based on file size for more realistic progress
      const fileSizeMB = newEvidence.file.size / (1024 * 1024);
      const sizeMultiplier = Math.max(0.5, Math.min(2, fileSizeMB / 5));
      
      const progressStages = [
        { progress: 10, stage: 'Uploading to Lemonfox.ai...', duration: 800 * sizeMultiplier },
        { progress: 30, stage: 'Connecting to Whisper v3 API...', duration: 600 },
        { progress: 50, stage: 'Processing with Whisper AI...', duration: 2000 * sizeMultiplier },
        { progress: 80, stage: 'Generating transcription...', duration: 1500 * sizeMultiplier },
        { progress: 95, stage: 'Finalizing results...', duration: 500 },
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

      // Call Lemonfox.ai API with tenant-specific API key
      const formData = new FormData();
      formData.append('file', newEvidence.file);
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
        clearInterval(timer);
        console.error('Network error calling Lemonfox.ai:', fetchError);
        throw new Error(`Network error: Cannot reach Lemonfox.ai API. This may be due to CORS restrictions or network connectivity issues.`);
      }

      clearInterval(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Lemonfox.ai API error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      
      setUploadProgress(100);
      setProgressStage('Transcription complete!');

      if (result?.text) {
        setTranscription(result.text);
        setShowTranscriptionEdit(true);
        
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        const wordCount = result.text.split(/\s+/).filter((word: string) => word.length > 0).length;
        
        toast({
          title: 'Transcription complete!',
          description: `Processed in ${finalTime}s using Lemonfox.ai • ${wordCount} words`,
          status: 'success',
          duration: 7000,
          isClosable: true,
        });

        // Generate structured meeting notes from transcription if it's a meeting type
        if (newEvidence.evidenceType === 'meeting' || newEvidence.evidenceType === 'meeting-notes') {
          await generateMeetingNotesFromTranscription(result.text);
        }
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: error.message || 'An error occurred during transcription with Lemonfox.ai',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setIsTranscribing(false);
      setUploadProgress(0);
    }
  };

  // Generate meeting notes from transcription
  const generateMeetingNotesFromTranscription = async (transcriptionText: string) => {
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
        const simpleNotes = `What was discussed?
A.1 ${cleanedTranscription}

What were the concerns?
B.1 No specific concerns identified in this brief recording.

How are these concerns addressed?
C.1 N/A - No concerns to address.

What are the action steps moving forward?
D.1 This appears to be a test recording. For actual R&D meetings, record substantive discussion content to generate detailed meeting notes with actionable items.`;
        
        // Store the simple notes for PDF preview
        setMeetingNotesContent(simpleNotes);
        
        // Set appropriate description based on evidence type
        if (newEvidence.evidenceType === 'meeting-notes') {
          setNewEvidence(prev => ({ 
            ...prev, 
            description: 'Meeting notes converted to PDF for R&D evidence documentation.'
          }));
        } else {
          setNewEvidence(prev => ({ 
            ...prev, 
            description: prev.description 
              ? `${prev.description}\n\n**Simple Notes:**\n${simpleNotes}`
              : simpleNotes
          }));
        }
        
        toast({
          title: '📝 Simple notes created',
          description: 'Test content detected - added basic notes',
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
      
      const { data } = await generateMeetingNotes({
        variables: {
          transcription: limitedTranscription
        },
      });
      
      if (data?.convertTranscriptionIntoMeetingNotes) {
        const cleanedNotes = cleanAIResponse(data.convertTranscriptionIntoMeetingNotes);
        
        // Store the meeting notes content for PDF preview
        setMeetingNotesContent(cleanedNotes);
        
        // For meeting-notes evidence type, set a simple description since the notes are shown in PDF preview
        if (newEvidence.evidenceType === 'meeting-notes') {
          setNewEvidence(prev => ({ 
            ...prev, 
            description: 'Meeting notes converted to PDF for R&D evidence documentation.'
          }));
        } else {
          // For other types, include the full meeting notes in description
          setNewEvidence(prev => ({ 
            ...prev, 
            description: prev.description 
              ? `${prev.description}\n\n**AI-Generated Meeting Notes:**\n${cleanedNotes}`
              : `**Professional Meeting Notes:**\n\n${cleanedNotes}`
          }));
        }
        
        toast({
          title: '📝 Meeting notes generated!',
          description: 'Structured meeting notes have been added to the description',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Meeting notes generation error:', error);
      // Fallback to simple transcription preview if meeting notes fail
      if (!newEvidence.description) {
        const preview = transcriptionText.substring(0, 200) + (transcriptionText.length > 200 ? '...' : '');
        setNewEvidence(prev => ({ ...prev, description: `Audio transcription: ${preview}` }));
      }
      
      toast({
        title: 'Meeting notes generation failed',
        description: 'Using basic transcription instead',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
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

  const handleUpload = async () => {
    console.log('🚀 ========== FRONTEND UPLOAD STARTED ==========');
    console.log('📝 Upload Evidence Details:', {
      evidenceType: newEvidence.evidenceType,
      projectId: newEvidence.projectId,
      title: newEvidence.title,
      hasFile: !!newEvidence.file,
      hasDescription: !!newEvidence.description,
      descriptionLength: newEvidence.description?.length || 0
    });
    
    if (!newEvidence.file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!newEvidence.projectId) {
      toast({
        title: 'Project required',
        description: 'Please select a project for this evidence.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!newEvidence.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for this evidence.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    try {
      // For meeting-notes type, only use the description (which contains meeting notes)
      // For other audio types, include transcription
      let finalDescription = newEvidence.description;
      let contentToStore = null;
      
      if (newEvidence.evidenceType === 'meeting-notes') {
        // Use the meeting notes content if available, otherwise fall back to description
        finalDescription = meetingNotesContent || newEvidence.description;
        contentToStore = meetingNotesContent; // Store the meeting notes content
      } else if (transcription && isAudioFile(newEvidence.file)) {
        // For other audio types, include transcription
        finalDescription = finalDescription 
          ? `${finalDescription}\n\nAudio Transcription:\n${transcription}`
          : `Audio Transcription:\n\n${transcription}`;
        contentToStore = transcription;
      }

      // Convert file to base64 for upload
      const fileBase64 = await fileToBase64(newEvidence.file);
      
      console.log('📤 About to call uploadRDEvidence GraphQL mutation');
      console.log('🔍 Final evidence data being sent:', {
        projectId: newEvidence.projectId,
        evidenceType: newEvidence.evidenceType,
        title: newEvidence.title.trim(),
        hasFileBase64: !!fileBase64,
        hasFinalDescription: !!finalDescription,
        hasContent: !!contentToStore
      });
      
      const { data } = await uploadRDEvidence({
        variables: {
          projectId: newEvidence.projectId,
          evidenceType: newEvidence.evidenceType,
          activityId: newEvidence.activityId || null,
          title: newEvidence.title.trim(),
          description: finalDescription,
          fileBase64: fileBase64,
          fileName: newEvidence.file.name,
          content: contentToStore,
          source: newEvidence.source || null,
          participants: newEvidence.participants || null,
        },
      });
      
      toast({
        title: 'Evidence Uploaded Successfully!',
        description: `${newEvidence.title} has been saved to the project${transcription ? ' with transcription' : ''}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate back to evidence page
      navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImproveTitle = async () => {
    const value = newEvidence.title;
    if (!value.trim()) {
      toast({
        title: 'No text to improve',
        description: 'Please enter a title first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsImprovingTitle(true);
    try {
      const context = `Please improve this R&D evidence title to be more professional and descriptive while keeping the core meaning intact. Make it concise but informative for research and development documentation. Return ONLY the improved title without any preamble, explanation, or quotes. Original title: "${value}"`;
      
      const { data } = await improveDescription({
        variables: { 
          text: value, 
          context: context 
        }
      });

      if (data?.improveDescription) {
        setNewEvidence(prev => ({ ...prev, title: cleanAIResponse(data.improveDescription) }));
        toast({
          title: '✨ Title improved!',
          description: 'Claude has enhanced your evidence title',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error improving title:', error);
      toast({
        title: 'Improvement failed',
        description: error instanceof Error ? error.message : 'Failed to improve title. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImprovingTitle(false);
    }
  };

  const handleImproveDescription = async () => {
    const value = newEvidence.description;
    if (!value.trim()) {
      toast({
        title: 'No text to improve',
        description: 'Please enter a description first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsImprovingDescription(true);
    try {
      const context = `Please improve the grammar, spelling, and professional tone of this R&D evidence description while keeping ALL the original facts and technical details exactly as written. IMPORTANT: Return the COMPLETE improved text - do not truncate or cut off any content. Keep the full length intact. Return ONLY the improved text without any preamble, explanation, or quotes. Full original text to improve: "${value}"`;
      
      const { data } = await improveDescription({
        variables: { 
          text: value, 
          context: context 
        }
      });

      if (data?.improveDescription) {
        setNewEvidence(prev => ({ ...prev, description: cleanAIResponse(data.improveDescription) }));
        toast({
          title: '✨ Description improved!',
          description: 'Claude has enhanced your evidence description',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error improving description:', error);
      toast({
        title: 'Improvement failed',
        description: error instanceof Error ? error.message : 'Failed to improve description. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImprovingDescription(false);
    }
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Container maxW="container.xl" py={8} flex="1">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`)}
          >
            Back to Evidence
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <Heading size="xl" color={textPrimary}>
            📤 Upload Evidence
          </Heading>

          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <Heading size="lg" color={textPrimary}>Evidence Details</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* File Drop Zone */}
                <Box
                  border="2px dashed"
                  borderColor={dragActive ? textPrimary : cardBorder}
                  borderRadius="md"
                  p={8}
                  textAlign="center"
                  bg={dragActive ? getColor("background.light", colorMode) : 'transparent'}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  cursor="pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <VStack spacing={3}>
                    <AttachmentIcon boxSize={8} color={getColor("text.secondary", colorMode)} />
                    <Text fontWeight="semibold" color={textPrimary}>
                      {newEvidence.file ? newEvidence.file.name : 'Drop files here or click to browse'}
                    </Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Supports documents, images, code files, and more
                    </Text>
                  </VStack>
                  <Input
                    id="file-input"
                    type="file"
                    display="none"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.py,.js,.json,.xml,.csv,.mp3,.wav,.m4a,.ogg,.flac,.webm,.aac"
                  />
                </Box>

                {/* Audio File Controls */}
                {newEvidence.file && isAudioFile(newEvidence.file) && (
                  <Card 
                    bg={selectedFileBg} 
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={FaFileAudio} color={getColor("primary", colorMode)} />
                              <Text fontWeight="semibold" color={textPrimary}>{newEvidence.file.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color={textSecondary}>
                              {formatFileSize(newEvidence.file.size)} • Audio File
                            </Text>
                          </VStack>
                          <IconButton
                            aria-label="Remove file"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setNewEvidence(prev => ({ ...prev, file: null }));
                              setTranscription('');
                              setShowTranscriptionEdit(false);
                            }}
                          />
                        </HStack>

                        {/* Transcribe Button */}
                        <Button
                          bg={getColor("primary", colorMode)}
                          color="white"
                          _hover={{ bg: getColor("primaryHover", colorMode) }}
                          size="lg"
                          onClick={handleTranscribe}
                          isLoading={isTranscribing}
                          loadingText="Transcribing..."
                          isDisabled={isTranscribing}
                          leftIcon={<Icon as={FaMicrophone} />}
                        >
                          Transcribe Audio
                        </Button>

                        {/* Progress Display */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" color={textSecondary}>
                                {progressStage || 'Processing audio...'}
                              </Text>
                              <Text fontSize="xs" color={textSecondary}>
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
                                <Text fontSize="xs" color={uploadProgress > 20 ? "green.500" : textSecondary}>
                                  {uploadProgress > 20 ? "✓" : "○"} File Upload
                                </Text>
                                <Text fontSize="xs" color={uploadProgress > 40 ? "green.500" : textSecondary}>
                                  {uploadProgress > 40 ? "✓" : "○"} Audio Analysis
                                </Text>
                                <Text fontSize="xs" color={uploadProgress > 60 ? "green.500" : textSecondary}>
                                  {uploadProgress > 60 ? "✓" : "○"} AI Model Loading
                                </Text>
                                <Text fontSize="xs" color={uploadProgress > 85 ? "green.500" : textSecondary}>
                                  {uploadProgress > 85 ? "✓" : "○"} Speech Processing
                                </Text>
                              </HStack>
                              
                              {uploadProgress >= 30 && (
                                <Box p={2} bg={aiEngineBg} borderRadius="md" border="1px" borderColor="blue.200">
                                  <HStack>
                                    <Box>
                                      <Spinner size="sm" color="blue.500" />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="xs" fontWeight="semibold" color="blue.600">
                                        Lemonfox.ai Whisper v3 Active
                                      </Text>
                                      <Text fontSize="xs" color="blue.500">
                                        {uploadProgress < 50 ? 'Connecting to API...' :
                                         uploadProgress < 80 ? 'Processing with Whisper AI...' :
                                         'Generating transcription...'}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Box>
                              )}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <FormControl>
                    <FormLabel color={textPrimary} fontSize="md">Evidence Type</FormLabel>
                    <Select
                      value={newEvidence.evidenceType}
                      onChange={(e) => setNewEvidence({...newEvidence, evidenceType: e.target.value})}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="lg"
                      fontSize="md"
                      _hover={{ borderColor: textSecondary }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      {evidenceTypes.map(type => (
                        <option key={type.value} value={type.value} style={{ backgroundColor: '#1a1a1a' }}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textPrimary} fontSize="md">Project</FormLabel>
                    <Select
                      value={newEvidence.projectId}
                      onChange={(e) => setNewEvidence({...newEvidence, projectId: e.target.value, activityId: ''})}
                      placeholder={projectsLoading ? "Loading projects..." : "Select project..."}
                      isDisabled={projectsLoading}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="lg"
                      fontSize="md"
                      _hover={{ borderColor: textSecondary }}
                      _focus={{
                        borderColor: textSecondary,
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
                </Grid>

                <FormControl>
                  <FormLabel color={textPrimary} fontSize="md">Activity (optional)</FormLabel>
                  <Select
                    value={newEvidence.activityId}
                    onChange={(e) => setNewEvidence({...newEvidence, activityId: e.target.value})}
                    placeholder={activitiesLoading ? "Loading activities..." : "Select activity..."}
                    isDisabled={!newEvidence.projectId || activitiesLoading}
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    size="lg"
                    fontSize="md"
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
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

                <FormControl isRequired>
                  <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Title</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    <Input
                      value={newEvidence.title}
                      onChange={(e) => setNewEvidence({...newEvidence, title: e.target.value})}
                      placeholder="Enter a descriptive title..."
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="lg"
                      fontSize="md"
                      _placeholder={{ color: textMuted }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      _hover={{
                        borderColor: textSecondary
                      }}
                    />
                    <HStack justify="flex-end">
                      <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                        <Button
                          onClick={handleImproveTitle}
                          isLoading={isImprovingTitle}
                          loadingText="✨ Improving..."
                          variant="outline"
                          borderColor={cardBorder}
                          color={textPrimary}
                          bg="rgba(0, 0, 0, 0.2)"
                          _hover={{
                            borderColor: textSecondary,
                            bg: "rgba(255, 255, 255, 0.05)"
                          }}
                          size="sm"
                          isDisabled={!newEvidence.title.trim()}
                        >
                          ✨ AI Improve
                        </Button>
                      </Tooltip>
                    </HStack>
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>
                    {newEvidence.evidenceType === 'meeting-notes' ? (
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text>Evidence Description</Text>
                          <Badge 
                            bg="rgba(34, 197, 94, 0.2)"
                            color="#22C55E"
                            border="1px solid"
                            borderColor="rgba(34, 197, 94, 0.3)"
                          >
                            AI-Generated Meeting Notes
                          </Badge>
                        </HStack>
                      </VStack>
                    ) : (
                      'Description'
                    )}
                  </FormLabel>
                  <Textarea
                    value={newEvidence.description}
                    onChange={(e) => setNewEvidence({...newEvidence, description: e.target.value})}
                    placeholder={newEvidence.evidenceType === 'meeting-notes' 
                      ? "The AI-generated meeting notes will appear here after transcription..."
                      : "Describe what this evidence shows and its relevance to the R&D activity..."
                    }
                    rows={newEvidence.evidenceType === 'meeting-notes' ? 8 : 4}
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    fontSize="md"
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                  <HStack justify="flex-end" mt={2}>
                    <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                      <Button
                        onClick={handleImproveDescription}
                        isLoading={isImprovingDescription}
                        loadingText="✨ Improving..."
                        variant="outline"
                        borderColor={cardBorder}
                        color={textPrimary}
                        bg="rgba(0, 0, 0, 0.2)"
                        _hover={{
                          borderColor: textSecondary,
                          bg: "rgba(255, 255, 255, 0.05)"
                        }}
                        size="sm"
                        isDisabled={!newEvidence.description.trim()}
                      >
                        ✨ AI Improve
                      </Button>
                    </Tooltip>
                  </HStack>
                  {newEvidence.evidenceType === 'meeting-notes' && newEvidence.description && (
                    <Text fontSize="sm" color="#22C55E" mt={1}>
                      ✅ These structured meeting notes are formatted for R&D documentation and ready to save as evidence.
                    </Text>
                  )}
                </FormControl>

                {/* PDF Preview for Meeting Notes */}
                {newEvidence.evidenceType === 'meeting-notes' && newEvidence.description && (
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color={textPrimary}>📄 PDF Preview</Heading>
                          <Badge 
                            bg="rgba(59, 130, 246, 0.2)"
                            color="#3B82F6"
                            border="1px solid"
                            borderColor="rgba(59, 130, 246, 0.3)"
                          >
                            PDF Document
                          </Badge>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Text fontSize="sm">
                            This is the actual PDF document that will be generated and stored as evidence.
                          </Text>
                        </Alert>
                        
                        <Box
                          border="1px solid"
                          borderColor={cardBorder}
                          borderRadius="md"
                          overflow="hidden"
                          bg="white"
                          height="600px"
                        >
                          <PDFViewer
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                          >
                            <MeetingNotesPDFDocument
                              title={newEvidence.title || 'Meeting Notes'}
                              description={meetingNotesContent || newEvidence.description}
                              participants={newEvidence.participants}
                              source={newEvidence.source}
                              projectName={projects.find((p: any) => p.id === newEvidence.projectId)?.projectName}
                              activityName={getFilteredActivities().find((a: any) => a.id === newEvidence.activityId)?.activityName}
                            />
                          </PDFViewer>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <FormControl>
                    <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Source (optional)</FormLabel>
                    <Input
                      value={newEvidence.source}
                      onChange={(e) => setNewEvidence({...newEvidence, source: e.target.value})}
                      placeholder="e.g., Email, Slack, Development Tool"
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="lg"
                      fontSize="md"
                      _placeholder={{ color: textMuted }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      _hover={{
                        borderColor: textSecondary
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="md" fontWeight="600" color={textPrimary}>Participants (optional)</FormLabel>
                    <Input
                      value={newEvidence.participants}
                      onChange={(e) => setNewEvidence({...newEvidence, participants: e.target.value})}
                      placeholder="People involved, separated by commas"
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      size="lg"
                      fontSize="md"
                      _placeholder={{ color: textMuted }}
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      _hover={{
                        borderColor: textSecondary
                      }}
                    />
                  </FormControl>
                </Grid>

                {/* Transcription Editing Interface */}
                {transcription && showTranscriptionEdit && (
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color={textPrimary}>
                            {newEvidence.evidenceType === 'meeting-notes' 
                              ? '🤖 Raw AI Transcription' 
                              : 'Review & Edit Transcription'}
                          </Heading>
                          {newEvidence.evidenceType === 'meeting-notes' && (
                            <HStack spacing={2}>
                              <Badge 
                                bg="rgba(251, 146, 60, 0.2)"
                                color="#FB923C"
                                border="1px solid"
                                borderColor="rgba(251, 146, 60, 0.3)"
                              >
                                Reference Only
                              </Badge>
                              <Badge 
                                bg="rgba(59, 130, 246, 0.2)"
                                color="#3B82F6"
                                border="1px solid"
                                borderColor="rgba(59, 130, 246, 0.3)"
                              >
                                Optional
                              </Badge>
                            </HStack>
                          )}
                        </VStack>
                        <HStack>
                          <Button
                            size="sm"
                            leftIcon={<CopyIcon />}
                            variant="outline"
                            borderColor={cardBorder}
                            color={textPrimary}
                            bg="rgba(0, 0, 0, 0.2)"
                            _hover={{
                              borderColor: textSecondary,
                              bg: "rgba(255, 255, 255, 0.05)"
                            }}
                            onClick={handleCopyTranscription}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<DownloadIcon />}
                            variant="outline"
                            borderColor={cardBorder}
                            color={textPrimary}
                            bg="rgba(0, 0, 0, 0.2)"
                            _hover={{
                              borderColor: textSecondary,
                              bg: "rgba(255, 255, 255, 0.05)"
                            }}
                            onClick={handleDownloadTranscription}
                          >
                            Download
                          </Button>
                        </HStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Alert 
                          status={newEvidence.evidenceType === 'meeting-notes' ? 'warning' : 'info'} 
                          borderRadius="md"
                        >
                          <AlertIcon />
                          <Text fontSize="sm">
                            {newEvidence.evidenceType === 'meeting-notes' 
                              ? '📚 Reference Only - This is the raw transcription. The structured meeting notes above are recommended for evidence.'
                              : 'Review and edit the transcription from Lemonfox.ai below. It will be automatically included when you upload the evidence.'
                            }
                          </Text>
                        </Alert>
                        <Textarea
                          value={transcription}
                          onChange={(e) => setTranscription(e.target.value)}
                          minH="300px"
                          fontFamily="mono"
                          fontSize="sm"
                          resize="vertical"
                          bg="rgba(0, 0, 0, 0.2)"
                          border="1px"
                          borderColor={cardBorder}
                          color={textPrimary}
                          _focus={{
                            borderColor: textSecondary,
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                          }}
                          _hover={{
                            borderColor: textSecondary
                          }}
                        />
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textSecondary}>
                            {transcription.split(/\s+/).filter(word => word.length > 0).length} words • Raw speech-to-text output
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            color={textPrimary}
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => {
                              setShowTranscriptionEdit(false);
                              setTranscription('');
                            }}
                          >
                            Discard Transcription
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}


                {newEvidence.evidenceType === 'meeting-notes' && newEvidence.description && transcription && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      📊 Structured for R&D compliance • 📝 Professional format • 🎯 Ready for evidence
                    </Text>
                  </Alert>
                )}

                {uploading && (
                  <Alert status="info">
                    <AlertIcon />
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textPrimary}>Uploading evidence...</Text>
                      <Progress size="sm" isIndeterminate mt={2} />
                    </Box>
                  </Alert>
                )}

                <HStack spacing={4} justify="flex-end">
                  <Button 
                    variant="ghost" 
                    color={textPrimary}
                    _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                    onClick={() => navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`)}
                    isDisabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg={getColor("primary", colorMode)}
                    color="white"
                    _hover={{ 
                      bg: getColor("primaryHover", colorMode),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(107, 70, 193, 0.4)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(107, 70, 193, 0.3)",
                    }}
                    onClick={handleUpload}
                    isDisabled={!newEvidence.file || !newEvidence.title || uploading}
                    isLoading={uploading}
                    loadingText="Uploading..."
                    boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Upload Evidence
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignUploadEvidence;