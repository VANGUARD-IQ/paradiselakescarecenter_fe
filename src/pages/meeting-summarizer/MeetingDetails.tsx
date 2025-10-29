import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useToast,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  IconButton,
  Textarea,
  Tag,
  TagLabel,
  SimpleGrid,
  Input,
  Select,
  FormControl,
  FormLabel,
  useColorMode,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlay, FiPause, FiDownload, FiCopy, FiRefreshCw, FiTrash2, FiCheckSquare, FiEdit2, FiSave, FiX, FiUserPlus, FiUserMinus, FiPlus, FiFolder } from 'react-icons/fi';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor, getComponent, brandConfig } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import meetingSummarizerModule from './moduleConfig';
import { AddMemberModal } from './AddMemberModal';
import { AddToProjectModal } from './AddToProjectModal';
import { usePageTitle } from '../../hooks/useDocumentTitle';

// Helper function to normalize Pinata URLs
const normalizePinataUrl = (url: string) => {
  if (!url) return '';

  // Fix double https:// issue
  if (url.startsWith('https://https://')) {
    return url.replace('https://https://', 'https://');
  }

  // Fix http://https:// issue
  if (url.startsWith('http://https://')) {
    return url.replace('http://https://', 'https://');
  }

  // If URL has the gateway URL twice, fix it
  if (url.includes('gateway.pinata.cloud/ipfs/') && url.includes('mypinata.cloud')) {
    // Extract just the mypinata part
    const match = url.match(/(scarlet-professional-perch-484\.mypinata\.cloud\/ipfs\/[a-zA-Z0-9]+)/);
    if (match) {
      return `https://${match[1]}`;
    }
  }

  // If it's already a proper URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's just a hash with domain, build the URL
  if (url.includes('mypinata.cloud')) {
    return `https://${url}`;
  }

  return `https://gateway.pinata.cloud/ipfs/${url}`;
};

const GET_MEETING = gql`
  query GetMeeting($id: ID!) {
    meeting(id: $id) {
      id
      title
      description
      date
      location
      attendees
      audioUrl
      audioIpfsHash
      status
      transcription
      summary
      createdAt
      updatedAt
      teamMembers {
        id
        fName
        lName
        email
        phoneNumber
      }
      participants {
        name
        role
        clientId
      }
    }
  }
`;

const GET_MEETING_TASKS = gql`
  query GetMeetingTasks($meetingId: ID!) {
    meetingTasks(meetingId: $meetingId) {
      id
      task
      assigneeName
      assignedTo {
        id
        fName
        lName
      }
      dueDate
      priority
      completed
      notes
    }
  }
`;


const REGENERATE_TRANSCRIPTION = gql`
  mutation RegenerateTranscription($meetingId: ID!) {
    regenerateTranscription(meetingId: $meetingId) {
      id
      status
    }
  }
`;

const DELETE_MEETING = gql`
  mutation DeleteMeeting($id: ID!) {
    deleteMeeting(id: $id)
  }
`;

const EXTRACT_ACTION_ITEMS = gql`
  mutation ExtractActionItems($transcription: String!, $attendees: [String!]) {
    extractActionItemsFromTranscription(transcription: $transcription, attendees: $attendees)
  }
`;

const CREATE_MEETING_TASKS = gql`
  mutation CreateMeetingTasks($meetingId: ID!, $tasks: [MeetingTaskInput!]!) {
    createMeetingTasks(meetingId: $meetingId, tasks: $tasks) {
      id
      task
      assigneeName
      assignedTo {
        id
        fName
        lName
      }
      dueDate
      priority
      completed
      notes
    }
  }
`;

const UPDATE_MEETING_PARTICIPANTS = gql`
  mutation UpdateMeetingParticipants($meetingId: ID!, $participants: [MeetingParticipantInput!]!) {
    updateMeetingParticipants(meetingId: $meetingId, participants: $participants) {
      id
      participants {
        name
        role
        clientId
      }
    }
  }
`;

const DELETE_MEETING_TASKS = gql`
  mutation DeleteMeetingTasks($meetingId: ID!) {
    deleteMeetingTasks(meetingId: $meetingId)
  }
`;

const UPDATE_MEETING_TASK = gql`
  mutation UpdateMeetingTask($id: ID!, $input: UpdateMeetingTaskInput!) {
    updateMeetingTask(id: $id, input: $input) {
      id
      task
      assigneeName
      assignedTo {
        id
        fName
        lName
      }
      dueDate
      priority
      completed
      notes
    }
  }
`;

const UPDATE_MEETING = gql`
  mutation UpdateMeeting($id: ID!, $input: UpdateMeetingInput!) {
    updateMeeting(id: $id, input: $input) {
      id
      title
      description
    }
  }
`;

const ADD_MEETING_MEMBER = gql`
  mutation AddMeetingMember($meetingId: ID!, $clientId: ID!) {
    addMeetingMember(meetingId: $meetingId, clientId: $clientId) {
      id
      teamMembers {
        id
        fName
        lName
        email
      }
    }
  }
`;

const REMOVE_MEETING_MEMBER = gql`
  mutation RemoveMeetingMember($meetingId: ID!, $clientId: ID!) {
    removeMeetingMember(meetingId: $meetingId, clientId: $clientId) {
      id
      teamMembers {
        id
        fName
        lName
        email
      }
    }
  }
`;

const MeetingDetails: React.FC = () => {
  usePageTitle('Meeting Details');
  console.log('🎬 MeetingDetails component mounting...');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  console.log('📍 Meeting ID from URL:', id);
  const toast = useToast();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [actionItems, setActionItems] = React.useState<any[]>([]);
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [participantCount, setParticipantCount] = React.useState<number>(0);
  const [showActionItems, setShowActionItems] = React.useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = React.useState<number | null>(null);
  const [editingParticipants, setEditingParticipants] = React.useState(false);
  const [tempParticipants, setTempParticipants] = React.useState<any[]>([]);
  const [tempTask, setTempTask] = React.useState<any>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState('');
  const [showAddToProjectModal, setShowAddToProjectModal] = React.useState(false);
  const [selectedTaskForProject, setSelectedTaskForProject] = React.useState<any>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
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
  const mutedTextColor = textMuted; // For compatibility

  const { data, loading, error, refetch } = useQuery(GET_MEETING, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
    onError: (err) => {
      console.error('❌ Error fetching meeting:', err);
      console.error('GraphQL errors:', err.graphQLErrors);
      console.error('Network error:', err.networkError);
    },
    onCompleted: (data) => {
      console.log('✅ Meeting data received:', data);
    }
  });

  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery(GET_MEETING_TASKS, {
    variables: { meetingId: id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('✅ Meeting tasks received:', data);
    }
  });


  const [deleteMeeting] = useMutation(DELETE_MEETING, {
    onCompleted: () => {
      toast({
        title: 'Meeting deleted',
        description: 'The meeting has been deleted successfully.',
        status: 'success',
        duration: 3000,
      });
      navigate('/meeting-summarizer');
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [extractActionItems, { loading: extracting }] = useMutation(EXTRACT_ACTION_ITEMS, {
    onCompleted: (data) => {
      try {
        const result = JSON.parse(data.extractActionItemsFromTranscription);
        
        // Handle both old format (array) and new format (object with participants)
        if (Array.isArray(result)) {
          // Old format - just action items array
          setActionItems(result);
        } else {
          // New format with participants - validate and clean the data
          const cleanedActionItems = (result.actionItems || []).map((item: any) => {
            // Handle invalid dates like "ASAP"
            let cleanDueDate = '';
            if (item.dueDate) {
              // Check if it's a valid date format (yyyy-mm-dd)
              if (/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)) {
                cleanDueDate = item.dueDate;
              } else if (item.dueDate.toLowerCase() === 'asap') {
                // Convert ASAP to tomorrow's date
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                cleanDueDate = tomorrow.toISOString().split('T')[0];
              }
            }
            
            return {
              assignee: item.assignee || '',
              task: item.task || '',
              dueDate: cleanDueDate,
              priority: item.priority || 'MEDIUM',
              completed: item.completed === true,
              notes: item.notes || '',
              saved: false  // Always mark as unsaved when extracted
            };
          });
          
          const cleanedParticipants = (result.participants || []).map((p: any) => ({
            name: p.name || 'Unknown',
            role: p.role || null,
            clientId: null // Don't set clientId from extraction
          }));
          
          setActionItems(cleanedActionItems);
          setParticipants(cleanedParticipants);
          setParticipantCount(result.estimatedParticipantCount || result.participants?.length || 0);
          
          // Log for debugging
          console.log('Cleaned action items:', cleanedActionItems);
          console.log('Cleaned participants:', cleanedParticipants);
        }
        
        setShowActionItems(true);
        setIsSaved(false);
        toast({
          title: `Found ${Array.isArray(result) ? result.length : (result.actionItems?.length || 0)} action items`,
          description: result.estimatedParticipantCount ? `${result.estimatedParticipantCount} participants identified` : undefined,
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error parsing action items:', error);
        toast({
          title: "Failed to parse action items",
          description: "The AI response was not in the expected format",
          status: "error",
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to extract action items",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [createMeetingTasks] = useMutation(CREATE_MEETING_TASKS, {
    onCompleted: () => {
      setIsSaved(true);
      refetchTasks();
      toast({
        title: "Tasks saved successfully",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save tasks",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [updateMeetingParticipants] = useMutation(UPDATE_MEETING_PARTICIPANTS, {
    refetchQueries: [{ query: GET_MEETING, variables: { id } }],
    onCompleted: () => {
      toast({
        title: "Participants updated",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update participants",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [deleteMeetingTasks] = useMutation(DELETE_MEETING_TASKS, {
    onCompleted: () => {
      refetchTasks();
    },
  });

  const [createSingleTask] = useMutation(CREATE_MEETING_TASKS, {
    onCompleted: () => {
      refetchTasks();
      toast({
        title: "Task saved",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save task",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [updateMeetingTask] = useMutation(UPDATE_MEETING_TASK, {
    onCompleted: () => {
      refetchTasks();
      toast({
        title: "Task updated",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [addMeetingMember] = useMutation(ADD_MEETING_MEMBER, {
    refetchQueries: [{ query: GET_MEETING, variables: { id } }],
    onCompleted: () => {
      toast({
        title: "Team member added",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add team member",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [removeMeetingMember] = useMutation(REMOVE_MEETING_MEMBER, {
    refetchQueries: [{ query: GET_MEETING, variables: { id } }],
    onCompleted: () => {
      toast({
        title: "Team member removed",
        status: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove team member",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const [updateMeeting] = useMutation(UPDATE_MEETING, {
    refetchQueries: [{ query: GET_MEETING, variables: { id } }],
    onCompleted: () => {
      toast({
        title: 'Meeting updated',
        description: 'Meeting title has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      setIsEditingTitle(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  const [regenerateTranscription, { loading: regenerating }] = useMutation(REGENERATE_TRANSCRIPTION, {
    onCompleted: () => {
      toast({
        title: "Transcription regeneration started",
        description: "The audio is being reprocessed. This may take a few minutes.",
        status: "info",
        duration: 5000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to regenerate transcription",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  // Load tasks from separate query
  React.useEffect(() => {
    if (tasksData?.meetingTasks && !showActionItems) {
      const loadedTasks = tasksData.meetingTasks.map((task: any) => ({
        id: task.id, // Keep the task ID for updates
        assignee: task.assigneeName || (task.assignedTo ? `${task.assignedTo.fName} ${task.assignedTo.lName}` : ''),
        task: task.task,
        dueDate: task.dueDate || '',
        priority: task.priority || 'MEDIUM',
        completed: task.completed || false,
        saved: true, // Mark as saved since it came from backend
      }));
      setActionItems(loadedTasks);
      if (loadedTasks.length > 0) {
        setShowActionItems(true);
        setIsSaved(true); // All loaded tasks are already saved
      }
    }
  }, [tasksData]);

  // Load participants from meeting data
  React.useEffect(() => {
    if (data?.meeting?.participants) {
      setParticipants(data.meeting.participants);
      setParticipantCount(data.meeting.participants.length);
    }
  }, [data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const copyTranscription = () => {
    if (meeting?.transcription) {
      navigator.clipboard.writeText(meeting.transcription);
      toast({
        title: 'Copied!',
        description: 'Transcription copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const downloadTranscription = () => {
    if (meeting?.transcription) {
      const content = `Meeting: ${meeting.title}\n` +
        `Date: ${formatDate(meeting.date)}\n` +
        `Location: ${meeting.location || 'N/A'}\n` +
        `Attendees: ${meeting.attendees?.join(', ') || 'N/A'}\n\n` +
        `Summary:\n${meeting.summary || 'No summary available'}\n\n` +
        `Transcription:\n${meeting.transcription}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRegenerate = () => {
    if (id) {
      regenerateTranscription({ variables: { meetingId: id } });
    }
  };

  const handleExtractActionItems = () => {
    if (meeting?.transcription) {
      extractActionItems({
        variables: {
          transcription: meeting.transcription,
          attendees: meeting.attendees || []
        }
      });
    }
  };

  const handleAddMember = (clientId: string, clientName: string) => {
    if (id) {
      addMeetingMember({
        variables: {
          meetingId: id,
          clientId
        }
      });
    }
  };

  const handleRemoveMember = (clientId: string) => {
    if (id) {
      removeMeetingMember({
        variables: {
          meetingId: id,
          clientId
        }
      });
    }
  };

  const handleSaveTasks = async () => {
    console.log('🔵 SAVE ALL TASKS CLICKED - FUNCTION STARTED');
    
    // Immediate check if we have tasks
    if (!actionItems || actionItems.length === 0) {
      console.error('❌ No action items to save!');
      toast({
        title: 'No tasks to save',
        description: 'Please add some tasks first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    console.log('📊 Current state:', {
      meetingId: id,
      actionItemsCount: actionItems.length,
      participantsCount: participants.length,
      rawActionItems: JSON.stringify(actionItems, null, 2),
      rawParticipants: JSON.stringify(participants, null, 2)
    });
    
    if (id) {
      // Validate and prepare ALL tasks (we delete and recreate all)
      const validTasks = actionItems.filter(item => {
        const hasRequiredFields = item.task && item.task.trim() !== '';
        const hasAssignee = item.assignee && item.assignee.trim() !== '';
        
        if (!hasRequiredFields) {
          console.warn('❌ Skipping invalid task:', {
            item,
            reason: 'Missing task description'
          });
          return false;
        }
        
        if (!hasAssignee) {
          console.warn('❌ Skipping invalid task:', {
            item,
            reason: 'Missing assignee'
          });
          return false;
        }
        
        // Check if assignee is either a participant or team member
        const isParticipant = participants.some(p => p.name === item.assignee);
        const isTeamMember = meeting?.teamMembers?.some((member: any) => {
          const fullName = `${member.fName} ${member.lName}`.trim();
          return fullName === item.assignee;
        });
        
        if (!isParticipant && !isTeamMember) {
          console.warn('❌ Skipping invalid task:', {
            item,
            reason: 'Assignee is not a meeting participant or team member'
          });
          return false;
        }
        
        console.log('✅ Valid task:', item);
        return true;
      });
      
      console.log(`📝 Filtered tasks: ${validTasks.length} valid out of ${actionItems.length} total`);
      
      // Debug: Log exactly what we have
      validTasks.forEach((task, i) => {
        console.log(`Task ${i+1} raw data:`, {
          task: task.task,
          taskType: typeof task.task,
          assignee: task.assignee,
          allKeys: Object.keys(task)
        });
      });
      
      if (validTasks.length === 0) {
        console.error('🚫 No valid tasks to save!');
        const invalidCount = actionItems.length - validTasks.length;
        toast({
          title: 'No valid tasks to save',
          description: `${invalidCount} task(s) are missing descriptions or valid assignees. Tasks must be assigned to meeting participants or team members.`,
          status: 'warning',
          duration: 6000,
        });
        return;
      }
      
      const tasksToSend = validTasks.map((item, index) => {
        const taskData: any = {
          task: String(item.task)
        };
        // Only add optional fields if they have values
        if (item.assignee) taskData.assignee = String(item.assignee);
        if (item.dueDate && item.dueDate !== '') taskData.dueDate = String(item.dueDate);
        if (item.priority) taskData.priority = String(item.priority);
        if (item.completed === true) taskData.completed = true;
        if (item.notes && item.notes !== '') taskData.notes = String(item.notes);
        
        console.log(`📋 Task ${index + 1} prepared:`, taskData);
        return taskData;
      });
      
      const participantsToSend = participants
        .filter(p => {
          const hasName = p.name && typeof p.name === 'string' && p.name.trim() !== '';
          if (!hasName) {
            console.warn('❌ Skipping participant without valid name:', p);
          }
          return hasName;
        })
        .map((p, index) => {
          const participantData: any = {
            name: String(p.name).trim()
          };
          // Only add role if it exists and is not empty
          if (p.role && typeof p.role === 'string' && p.role.trim() !== '') {
            participantData.role = String(p.role).trim();
          }
          // Only add clientId if it's a valid MongoDB ObjectId (24 characters)
          if (p.clientId && typeof p.clientId === 'string' && p.clientId.length === 24) {
            participantData.clientId = p.clientId;
            console.log(`👤 Participant ${index + 1} has linked clientId:`, p.clientId);
          }
          
          console.log(`👥 Participant ${index + 1} prepared:`, participantData);
          return participantData;
        });
      
      // First, delete existing tasks
      await deleteMeetingTasks({
        variables: { meetingId: id }
      });
      
      // Then create new tasks with assigneeName instead of assignee
      const tasksForNewMutation = tasksToSend.map(task => {
        // Create clean task object without undefined fields
        const cleanTask: any = {
          task: task.task
        };
        
        // Only add fields that have values
        if (task.assignee) {
          cleanTask.assigneeName = task.assignee;
        }
        if (task.dueDate && task.dueDate !== '') {
          cleanTask.dueDate = task.dueDate;
        }
        if (task.priority) {
          cleanTask.priority = task.priority;
        }
        if (task.completed === true) {
          cleanTask.completed = true;
        }
        if (task.notes && task.notes !== '') {
          cleanTask.notes = task.notes;
        }
        
        return cleanTask;
      });
      
      const tasksVariables = {
        meetingId: id,
        tasks: tasksForNewMutation
      };
      
      console.log('📤 CREATING TASKS:', JSON.stringify(tasksVariables, null, 2));
      
      // Log each task individually for debugging
      tasksVariables.tasks.forEach((task: any, index: number) => {
        console.log(`📝 Task ${index + 1} details:`, {
          hasTask: !!task.task,
          taskLength: task.task?.length,
          taskValue: task.task,
          allFields: Object.keys(task),
          fullTask: JSON.stringify(task)
        });
      });
      
      try {
        await createMeetingTasks({
          variables: tasksVariables
        });
        console.log('✅ Tasks created successfully!');
      } catch (error: any) {
        console.error('❌ TASKS MUTATION ERROR:', error);
        console.error('Error details:', {
          message: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError
        });
        
        // Log validation errors specifically
        if (error.graphQLErrors?.[0]?.extensions?.validationErrors) {
          const validationErrors = error.graphQLErrors[0].extensions.validationErrors;
          console.error('🔴 VALIDATION ERRORS:', validationErrors);
          
          // Try to parse the validation error details
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            validationErrors.forEach((err: any) => {
              console.error('Validation error detail:', {
                property: err.property,
                constraints: err.constraints,
                value: err.value,
                children: err.children
              });
            });
          }
        }
        
        toast({
          title: 'Failed to save tasks',
          description: error.message || 'Please check the console for details',
          status: 'error',
          duration: 5000,
        });
        return; // Exit early on error
      }
      
      // Update participants if we have any (skip if empty)
      if (participantsToSend.length > 0) {
        const participantsVariables = {
          meetingId: id,
          participants: participantsToSend
        };
        
        console.log('📤 UPDATING PARTICIPANTS:', JSON.stringify(participantsVariables, null, 2));
        
        try {
          await updateMeetingParticipants({
            variables: participantsVariables
          });
        } catch (error: any) {
          console.error('❌ PARTICIPANTS MUTATION ERROR:', error);
          console.error('Error details:', {
            message: error.message,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError
          });
          // Don't fail the entire operation if participants update fails
          toast({
            title: "Warning",
            description: "Tasks saved but participants update failed. You can update participants separately.",
            status: "warning",
            duration: 5000,
          });
        }
      } else {
        console.log('📤 No participants to update, skipping participants mutation');
      }
      
      console.log('📊 Summary:', {
        meetingId: id,
        tasksCount: tasksToSend.length,
        participantsCount: participantsToSend.length,
        hasParticipants: participantsToSend.length > 0
      });
    } else {
      console.error('❌ No meeting ID available!');
    }
  };

  const startEditingTask = (index: number) => {
    setEditingTaskIndex(index);
    setTempTask({ ...actionItems[index] });
  };

  const saveTaskEdit = async () => {
    if (editingTaskIndex !== null && tempTask && id) {
      // Validate that task is assigned to a meeting member
      if (!tempTask.assignee || tempTask.assignee.trim() === '') {
        toast({
          title: "Assignment required",
          description: "Please assign this task to a meeting participant or team member before saving.",
          status: "warning",
          duration: 4000,
        });
        return;
      }

      // Check if assignee is either a participant or team member
      const isParticipant = participants.some(p => p.name === tempTask.assignee);
      const isTeamMember = meeting?.teamMembers?.some((member: any) => {
        const fullName = `${member.fName} ${member.lName}`.trim();
        return fullName === tempTask.assignee;
      });

      if (!isParticipant && !isTeamMember) {
        toast({
          title: "Invalid assignee",
          description: "Task must be assigned to a meeting participant or team member.",
          status: "warning",
          duration: 4000,
        });
        return;
      }

      try {
        // Prepare task data
        const taskData: any = {
          task: String(tempTask.task),
          assigneeName: String(tempTask.assignee),
          priority: tempTask.priority || 'MEDIUM',
          completed: tempTask.completed === true
        };
        
        if (tempTask.dueDate && tempTask.dueDate !== '') {
          taskData.dueDate = String(tempTask.dueDate);
        }

        // If task has an ID, update it; otherwise create new
        if (tempTask.id) {
          // Update existing task
          await updateMeetingTask({
            variables: {
              id: tempTask.id,
              input: taskData
            }
          });
        } else {
          // Create new task
          await createSingleTask({
            variables: {
              meetingId: id,
              tasks: [taskData]
            }
          });
        }

        // Update local state to reflect saved status
        const newTasks = [...actionItems];
        newTasks[editingTaskIndex] = { ...tempTask, saved: true };
        setActionItems(newTasks);
        setEditingTaskIndex(null);
        setTempTask(null);
        setIsSaved(true);
      } catch (error) {
        console.error('Failed to save task:', error);
      }
    }
  };

  const cancelTaskEdit = () => {
    setEditingTaskIndex(null);
    setTempTask(null);
  };

  const startEditingParticipants = () => {
    setEditingParticipants(true);
    setTempParticipants([...participants]);
  };

  const saveParticipantsEdit = () => {
    setParticipants(tempParticipants);
    setParticipantCount(tempParticipants.length);
    setEditingParticipants(false);
    setIsSaved(false);
  };

  const cancelParticipantsEdit = () => {
    setEditingParticipants(false);
    setTempParticipants([]);
  };

  const startEditingTitle = () => {
    setIsEditingTitle(true);
    setTempTitle(meeting?.title || '');
  };

  const saveTitleEdit = async () => {
    if (!tempTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Meeting title cannot be empty.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await updateMeeting({
        variables: {
          id: meeting.id,
          input: {
            title: tempTitle.trim()
          }
        }
      });
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setTempTitle(meeting?.title || '');
  };

  const addParticipant = () => {
    setTempParticipants([...tempParticipants, { name: '', role: 'unknown' }]);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...tempParticipants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setTempParticipants(newParticipants);
  };

  const removeParticipant = (index: number) => {
    setTempParticipants(tempParticipants.filter((_, i) => i !== index));
  };

  const addNewTask = () => {
    const newTask = {
      assignee: '',
      task: '',
      dueDate: '',
      priority: 'MEDIUM',
      completed: false,
      notes: '',
      saved: false
    };
    setActionItems([...actionItems, newTask]);
    setShowActionItems(true);
    setIsSaved(false);
    // Automatically start editing the new task
    setEditingTaskIndex(actionItems.length);
    setTempTask(newTask);
  };

  // Log the current state
  console.log('📊 MeetingDetails state:', {
    id,
    loading,
    error: error?.message,
    hasData: !!data,
    meeting: data?.meeting
  });
  
  // Early return if no ID
  if (!id) {
    console.error('❌ No meeting ID provided');
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <Alert status="error">
            <AlertIcon />
            No meeting ID provided
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (loading && !data) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <VStack spacing={4}>
            <Spinner size="xl" color={textColor} />
            <Text color={textColor}>Loading meeting details...</Text>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <Alert status="error">
            <AlertIcon />
            <VStack align="start">
              <Text>Error loading meeting: {error.message}</Text>
              {error.graphQLErrors?.map((e: any, i: number) => (
                <Text key={i} fontSize="sm">{e.message}</Text>
              ))}
            </VStack>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  const meeting = data?.meeting;

  if (!meeting) {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <Alert status="warning">
            <AlertIcon />
            Meeting not found
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }

  try {
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        
        <Container maxW="container.xl" py={12} flex="1">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/meeting-summarizer')}
              color={textColor}
            >
              Back to Meetings
            </Button>
            <HStack spacing={2}>
              <Button
                variant="ghost"
                colorScheme="red"
                leftIcon={<FiTrash2 />}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
                    deleteMeeting({ variables: { id: meeting.id } });
                  }
                }}
                color="red.500"
              >
                Delete
              </Button>
              <Badge colorScheme={getStatusColor(meeting.status)} fontSize="md" px={3} py={1}>
                {meeting.status}
              </Badge>
            </HStack>
          </HStack>

          <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <VStack align="start" spacing={2}>
                {isEditingTitle ? (
                  <HStack spacing={2} width="full">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      size="lg"
                      fontWeight="bold"
                      color={textColor}
                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                      border="1px solid"
                      borderColor={cardBorder}
                      _focus={{
                        borderColor: buttonBg,
                        boxShadow: `0 0 0 1px ${buttonBg}`
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveTitleEdit();
                        }
                      }}
                    />
                    <IconButton
                      icon={<FiSave />}
                      colorScheme="green"
                      onClick={saveTitleEdit}
                      aria-label="Save title"
                    />
                    <IconButton
                      icon={<FiX />}
                      variant="ghost"
                      color={textColor}
                      onClick={cancelTitleEdit}
                      aria-label="Cancel edit"
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2}>
                    <Heading color={textColor} fontFamily={brandConfig.fonts.heading}>
                      {meeting.title}
                    </Heading>
                    <IconButton
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      color={textColor}
                      onClick={startEditingTitle}
                      aria-label="Edit title"
                    />
                  </HStack>
                )}
                {meeting.description && (
                  <Text color={mutedTextColor}>{meeting.description}</Text>
                )}
              </VStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Text fontWeight="semibold" color={textColor}>Date:</Text>
                    <Text color={mutedTextColor}>{formatDate(meeting.date)}</Text>
                  </HStack>
                  {meeting.location && (
                    <HStack>
                      <Text fontWeight="semibold" color={textColor}>Location:</Text>
                      <Text color={mutedTextColor}>{meeting.location}</Text>
                    </HStack>
                  )}
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="semibold" color={textColor}>Attendees:</Text>
                      <HStack wrap="wrap" spacing={2}>
                        {meeting.attendees.map((attendee: string, index: number) => (
                          <Tag key={index} colorScheme="blue" size="sm">
                            {attendee}
                          </Tag>
                        ))}
                      </HStack>
                    </VStack>
                  )}
                </VStack>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Text fontWeight="semibold" color={textColor}>Created:</Text>
                    <Text color={mutedTextColor}>{formatDate(meeting.createdAt)}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="semibold" color={textColor}>Updated:</Text>
                    <Text color={mutedTextColor}>{formatDate(meeting.updatedAt)}</Text>
                  </HStack>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Team Members Section */}
          <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={textColor}>Team Members</Heading>
                <Button
                  leftIcon={<FiUserPlus />}
                  onClick={() => setShowAddMemberModal(true)}
                  size="sm"
                  bg={getColor("components.button.primaryBg")}
                  color="white"
                  _hover={{ 
                    bg: getColor("components.button.primaryHover"),
                    transform: "translateY(-2px)"
                  }}
                  boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                >
                  Add Member
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {meeting.teamMembers && meeting.teamMembers.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {meeting.teamMembers.map((member: any) => (
                    <HStack key={member.id} justify="space-between" p={3} bg={bg} borderRadius="md">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" color={textColor}>
                          {`${member.fName} ${member.lName}`.trim()}
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color={mutedTextColor}>
                            {member.email || 'No email'}
                          </Text>
                          {member.phoneNumber && (
                            <Text fontSize="sm" color={mutedTextColor}>
                              • {member.phoneNumber}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                      <IconButton
                        icon={<FiUserMinus />}
                        onClick={() => handleRemoveMember(member.id)}
                        aria-label="Remove member"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                      />
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color={mutedTextColor}>No team members added yet</Text>
              )}
            </CardBody>
          </Card>

          {meeting.audioUrl && (
            <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
              <CardHeader>
                <Heading size="md" color={textColor}>Audio Recording</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <audio
                    ref={audioRef}
                    src={normalizePinataUrl(meeting.audioUrl || meeting.audioIpfsHash)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <HStack spacing={3}>
                    <IconButton
                      icon={isPlaying ? <FiPause /> : <FiPlay />}
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      bg={getColor("components.button.primaryBg")}
                      color="white"
                      _hover={{ 
                        bg: getColor("components.button.primaryHover"),
                        transform: "translateY(-2px)"
                      }}
                      boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                      size="lg"
                    />
                    <Button
                      as="a"
                      href={normalizePinataUrl(meeting.audioUrl || meeting.audioIpfsHash)}
                      download
                      leftIcon={<FiDownload />}
                      variant="outline"
                      color={textColor}
                    >
                      Download Audio
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {meeting.summary && (
            <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
              <CardHeader>
                <Heading size="md" color={textColor}>Summary</Heading>
              </CardHeader>
              <CardBody>
                <Text color={textColor} whiteSpace="pre-wrap">
                  {meeting.summary}
                </Text>
              </CardBody>
            </Card>
          )}

          {meeting.transcription && (
            <Card 
            bg={cardGradientBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color={textColor}>Transcription</Heading>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<FiCopy />}
                      onClick={copyTranscription}
                      aria-label="Copy transcription"
                      size="sm"
                      variant="ghost"
                      color={textColor}
                    />
                    <IconButton
                      icon={<FiDownload />}
                      onClick={downloadTranscription}
                      aria-label="Download transcription"
                      size="sm"
                      variant="ghost"
                      color={textColor}
                    />
                    <IconButton
                      icon={<FiRefreshCw />}
                      onClick={handleRegenerate}
                      isLoading={regenerating}
                      aria-label="Regenerate transcription"
                      size="sm"
                      variant="ghost"
                      color={textColor}
                    />
                    <Button
                      leftIcon={<FiCheckSquare />}
                      onClick={handleExtractActionItems}
                      isLoading={extracting}
                      size="sm"
                      bg={getColor("components.button.primaryBg")}
                      color="white"
                      _hover={{ 
                        bg: getColor("components.button.primaryHover"),
                        transform: "translateY(-2px)"
                      }}
                      boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                    >
                      Create Tasks Today
                    </Button>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <Textarea
                  value={meeting.transcription}
                  readOnly
                  minH="300px"
                  resize="vertical"
                  bg={colorMode === 'light' ? "gray.50" : cardGradientBg}
                  color={textColor}
                  fontFamily="monospace"
                />
              </CardBody>
            </Card>
          )}

          {meeting.status === 'processing' && (
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={2} flex="1">
                <Text>Audio is being processed...</Text>
                <Text fontSize="sm">The transcription will appear here once complete. This page will refresh automatically.</Text>
                <Button
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={handleRegenerate}
                  isLoading={regenerating}
                  colorScheme="blue"
                  variant="outline"
                >
                  Retry Transcription
                </Button>
              </VStack>
            </Alert>
          )}

          {showActionItems && (actionItems.length > 0 || participants.length > 0) && (
            <Card 
              bg={cardGradientBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="xl"
              backdropFilter="blur(10px)"
            >
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md" color={textColor}>Action Items</Heading>
                    {participantCount > 0 && (
                      <Text fontSize="sm" color={textMuted}>
                        {participantCount} participant{participantCount !== 1 ? 's' : ''} identified
                      </Text>
                    )}
                  </VStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowActionItems(false)}
                    color={textColor}
                  >
                    Hide
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  {/* Participants section */}
                  {(participants.length > 0 || editingParticipants) && (
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text color={textColor} fontWeight="semibold">
                          Meeting Participants:
                        </Text>
                        {!editingParticipants ? (
                          <IconButton
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            color={textColor}
                            onClick={startEditingParticipants}
                            aria-label="Edit participants"
                          />
                        ) : (
                          <HStack>
                            <IconButton
                              icon={<FiSave />}
                              size="sm"
                              colorScheme="green"
                              onClick={saveParticipantsEdit}
                              aria-label="Save participants"
                            />
                            <IconButton
                              icon={<FiX />}
                              size="sm"
                              variant="ghost"
                              color={textColor}
                              onClick={cancelParticipantsEdit}
                              aria-label="Cancel edit"
                            />
                          </HStack>
                        )}
                      </HStack>
                      
                      {!editingParticipants ? (
                        <HStack spacing={2} wrap="wrap">
                          {participants.map((participant, index) => (
                            <Tag
                              key={index}
                              size="md"
                              variant="subtle"
                              colorScheme={participant.name.includes('Unknown') ? 'gray' : 'blue'}
                            >
                              <TagLabel>
                                {participant.name}
                                {participant.role && participant.role !== 'unknown' && ` (${participant.role})`}
                              </TagLabel>
                            </Tag>
                          ))}
                        </HStack>
                      ) : (
                        <VStack align="stretch" spacing={2}>
                          {tempParticipants.map((participant, index) => (
                            <HStack key={index} spacing={2}>
                              <Input
                                size="sm"
                                value={participant.name}
                                onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                                placeholder="Name"
                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                color={textColor}
                                borderColor="rgba(255, 255, 255, 0.2)"
                              />
                              <Select
                                size="sm"
                                value={participant.role}
                                onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                                bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                                color={textColor}
                                borderColor="rgba(255, 255, 255, 0.2)"
                              >
                                <option value="unknown">Unknown</option>
                                <option value="developer">Developer</option>
                                <option value="client">Client</option>
                                <option value="manager">Manager</option>
                                <option value="designer">Designer</option>
                                <option value="stakeholder">Stakeholder</option>
                              </Select>
                              <IconButton
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                color="red.400"
                                onClick={() => removeParticipant(index)}
                                aria-label="Remove participant"
                              />
                            </HStack>
                          ))}
                          <Button
                            size="sm"
                            leftIcon={<FiUserPlus />}
                            variant="ghost"
                            color={textColor}
                            onClick={addParticipant}
                          >
                            Add Participant
                          </Button>
                        </VStack>
                      )}
                    </Box>
                  )}
                  
                  {/* Action items section */}
                  {(actionItems.length > 0 || showActionItems) && (
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Text color={textColor} fontWeight="semibold">
                          Action Items:
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FiPlus />}
                            variant="outline"
                            onClick={addNewTask}
                            color={textColor}
                          >
                            Add Task
                          </Button>
                          {actionItems.length > 0 && (
                            <Button
                              size="sm"
                              leftIcon={<FiSave />}
                              colorScheme="green"
                              onClick={handleSaveTasks}
                            >
                              Save All Tasks
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                      <VStack align="stretch" spacing={4}>
                        {actionItems.map((item, index) => {
                          // Check if task is valid
                          const hasAssignee = item.assignee && item.assignee.trim() !== '';
                          const isParticipant = participants.some(p => p.name === item.assignee);
                          const isTeamMember = meeting?.teamMembers?.some((member: any) => {
                            const fullName = `${member.fName} ${member.lName}`.trim();
                            return fullName === item.assignee;
                          });
                          const isValidAssignee = hasAssignee && (isParticipant || isTeamMember);
                          const isValid = item.task && item.task.trim() !== '' && isValidAssignee;
                          
                          return (
                          <Box
                            key={index}
                            p={4}
                            borderRadius="md"
                            bg={colorMode === 'light' ? "gray.50" : "rgba(255, 255, 255, 0.05)"}
                            border="2px solid"
                            borderColor={isValid ? (colorMode === 'light' ? "gray.200" : "rgba(255, 255, 255, 0.1)") : "rgba(255, 59, 48, 0.3)"}
                          >
                            {editingTaskIndex === index ? (
                              // Edit mode
                              <VStack align="stretch" spacing={3}>
                                <HStack spacing={2}>
                                  <FormControl flex={1}>
                                    <Select
                                      size="sm"
                                      value={tempTask?.assignee || ''}
                                      onChange={(e) => setTempTask({ ...tempTask, assignee: e.target.value })}
                                      bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.08)"}
                                      color={textColor}
                                    >
                                      <option value="">Select Assignee</option>
                                      <optgroup label="Meeting Participants">
                                        {participants.map((p, i) => (
                                          <option key={`p-${i}`} value={p.name}>{p.name}</option>
                                        ))}
                                      </optgroup>
                                      {meeting.teamMembers && meeting.teamMembers.length > 0 && (
                                        <optgroup label="Team Members">
                                          {meeting.teamMembers.map((member: any) => {
                                            const fullName = `${member.fName} ${member.lName}`.trim();
                                            return (
                                              <option key={`m-${member.id}`} value={fullName}>{fullName}</option>
                                            );
                                          })}
                                        </optgroup>
                                      )}
                                    </Select>
                                  </FormControl>
                                  <Select
                                    size="sm"
                                    value={tempTask?.priority || ''}
                                    onChange={(e) => setTempTask({ ...tempTask, priority: e.target.value })}
                                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.08)"}
                                    color={textColor}
                                    width="150px"
                                  >
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                  </Select>
                                  <Input
                                    size="sm"
                                    type="date"
                                    value={tempTask?.dueDate || ''}
                                    onChange={(e) => setTempTask({ ...tempTask, dueDate: e.target.value })}
                                    placeholder="Due date"
                                    bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.08)"}
                                    color={textColor}
                                    width="150px"
                                  />
                                </HStack>
                                <Textarea
                                  size="sm"
                                  value={tempTask?.task || ''}
                                  onChange={(e) => setTempTask({ ...tempTask, task: e.target.value })}
                                  placeholder="Task description"
                                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.08)"}
                                  color={textColor}
                                  rows={2}
                                />
                                <Input
                                  size="sm"
                                  value={tempTask?.notes || ''}
                                  onChange={(e) => setTempTask({ ...tempTask, notes: e.target.value })}
                                  placeholder="Notes (optional)"
                                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.08)"}
                                  color={textColor}
                                />
                                <HStack justify="flex-end">
                                  <IconButton
                                    icon={<FiSave />}
                                    size="sm"
                                    colorScheme="green"
                                    onClick={saveTaskEdit}
                                    aria-label="Save task"
                                  />
                                  <IconButton
                                    icon={<FiX />}
                                    size="sm"
                                    variant="ghost"
                                    color={textColor}
                                    onClick={cancelTaskEdit}
                                    aria-label="Cancel edit"
                                  />
                                </HStack>
                              </VStack>
                            ) : (
                              // Display mode
                              <>
                                <HStack justify="space-between" mb={2}>
                                  <HStack>
                                    <Badge
                                      colorScheme={
                                        item.priority === 'HIGH' ? 'red' :
                                        item.priority === 'MEDIUM' ? 'yellow' : 'green'
                                      }
                                    >
                                      {item.priority}
                                    </Badge>
                                    <Text color={textColor} fontWeight="semibold">
                                      {item.assignee}
                                    </Text>
                                    {item.saved && (
                                      <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                        Saved
                                      </Badge>
                                    )}
                                  </HStack>
                                  <HStack>
                                    {item.dueDate && (
                                      <Text color={textMuted} fontSize="sm">
                                        {item.dueDate}
                                      </Text>
                                    )}
                                    <IconButton
                                      icon={<FiFolder />}
                                      size="xs"
                                      variant="ghost"
                                      color={textColor}
                                      onClick={() => {
                                        setSelectedTaskForProject(item);
                                        setShowAddToProjectModal(true);
                                      }}
                                      aria-label="Add to project"
                                      title="Add to project"
                                    />
                                    <IconButton
                                      icon={<FiEdit2 />}
                                      size="xs"
                                      variant="ghost"
                                      color={textColor}
                                      onClick={() => startEditingTask(index)}
                                      aria-label="Edit task"
                                    />
                                  </HStack>
                                </HStack>
                                <VStack align="start" spacing={2}>
                                  <Text color={textColor}>
                                    {item.task}
                                  </Text>
                                  {!isValid && (
                                    <Text fontSize="sm" color="red.400" fontStyle="italic">
                                      ⚠️ {!hasAssignee ? 'No assignee selected' : 'Invalid assignee - must be a meeting participant or team member'}
                                    </Text>
                                  )}
                                </VStack>
                              </>
                            )}
                          </Box>
                          )
                        })}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {meeting.status === 'failed' && (
            <Alert status="error">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text>Transcription failed</Text>
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                  isLoading={regenerating}
                  leftIcon={<FiRefreshCw />}
                >
                  Retry Transcription
                </Button>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Container>

        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleAddMember}
        />

        <AddToProjectModal
          isOpen={showAddToProjectModal}
          onClose={() => setShowAddToProjectModal(false)}
          taskText={selectedTaskForProject?.task || ''}
          assigneeName={selectedTaskForProject?.assignee}
          dueDate={selectedTaskForProject?.dueDate}
          priority={selectedTaskForProject?.priority}
        />

        <FooterWithFourColumns />
      </Box>
    );
  } catch (err) {
    console.error('❌ Error rendering MeetingDetails:', err);
    return (
      <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <NavbarWithCallToAction />
        <ModuleBreadcrumb moduleConfig={meetingSummarizerModule} />
        <Container maxW="container.xl" py={12} flex="1">
          <Alert status="error">
            <AlertIcon />
            <Text>Error rendering page: {String(err)}</Text>
          </Alert>
        </Container>
        <FooterWithFourColumns />
      </Box>
    );
  }
};

export default MeetingDetails;