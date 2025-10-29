import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Spinner,
  Divider,
  Link,
} from '@chakra-ui/react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiPlus, FiEdit, FiTrash2, FiVideo, FiPhone, FiMapPin, FiCalendar, FiClock, FiUsers, FiLink } from 'react-icons/fi';
import { format } from 'date-fns';
import { getColor } from "../../brandConfig";

// GraphQL Queries and Mutations
const GET_OPPORTUNITY_MEETINGS = gql`
  query GetOpportunityMeetings($opportunityId: String!) {
    opportunityMeetings(opportunityId: $opportunityId) {
      id
      title
      description
      type
      status
      format
      scheduledDate
      duration
      location
      address
      meetingUrl
      attendees {
        name
        email
        role
        company
        isInternal
        attended
      }
      objectives
      notes
      outcome
      nextSteps
      followUpDate
      createdAt
      organizerName
    }
  }
`;

const CREATE_OPPORTUNITY_MEETING = gql`
  mutation CreateOpportunityMeeting($input: OpportunityMeetingInput!) {
    createOpportunityMeeting(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_OPPORTUNITY_MEETING = gql`
  mutation UpdateOpportunityMeeting($id: String!, $input: OpportunityMeetingUpdateInput!) {
    updateOpportunityMeeting(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const DELETE_OPPORTUNITY_MEETING = gql`
  mutation DeleteOpportunityMeeting($id: String!) {
    deleteOpportunityMeeting(id: $id)
  }
`;

interface OpportunityMeetingsProps {
  opportunityId: string;
}

export const OpportunityMeetings: React.FC<OpportunityMeetingsProps> = ({ opportunityId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'OTHER',
    format: 'VIDEO_CALL',
    scheduledDate: '',
    duration: 60,
    location: '',
    address: '',
    meetingUrl: '',
    objectives: '',
    preparationNotes: '',
    notes: '',
    outcome: '',
    nextSteps: '',
  });

  const toast = useToast();

  // Color scheme
  const primaryColor = getColor("blue.500");
  const cardBorder = "rgba(255, 255, 255, 0.1)";
  const textPrimary = "white";
  const textMuted = "gray.400";
  const cardGradientBg = "linear-gradient(135deg, rgba(31, 37, 89, 0.8) 0%, rgba(17, 21, 51, 0.8) 100%)";

  // Queries
  const { loading, data, refetch } = useQuery(GET_OPPORTUNITY_MEETINGS, {
    variables: { opportunityId },
  });

  // Mutations
  const [createMeeting] = useMutation(CREATE_OPPORTUNITY_MEETING, {
    onCompleted: () => {
      toast({
        title: 'Meeting scheduled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error creating meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateMeeting] = useMutation(UPDATE_OPPORTUNITY_MEETING, {
    onCompleted: () => {
      toast({
        title: 'Meeting updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error updating meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteMeeting] = useMutation(DELETE_OPPORTUNITY_MEETING, {
    onCompleted: () => {
      toast({
        title: 'Meeting deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleOpenModal = (meeting?: any) => {
    if (meeting) {
      setEditingMeeting(meeting);
      const scheduledDate = new Date(meeting.scheduledDate);
      const dateStr = scheduledDate.toISOString().slice(0, 16); // Format for datetime-local input

      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        type: meeting.type,
        format: meeting.format,
        scheduledDate: dateStr,
        duration: meeting.duration,
        location: meeting.location || '',
        address: meeting.address || '',
        meetingUrl: meeting.meetingUrl || '',
        objectives: meeting.objectives || '',
        preparationNotes: meeting.preparationNotes || '',
        notes: meeting.notes || '',
        outcome: meeting.outcome || '',
        nextSteps: meeting.nextSteps || '',
      });
    } else {
      setEditingMeeting(null);
      setFormData({
        title: '',
        description: '',
        type: 'OTHER',
        format: 'VIDEO_CALL',
        scheduledDate: '',
        duration: 60,
        location: '',
        address: '',
        meetingUrl: '',
        objectives: '',
        preparationNotes: '',
        notes: '',
        outcome: '',
        nextSteps: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
  };

  const handleSaveMeeting = async () => {
    const input: any = {
      ...formData,
      opportunityId,
      scheduledDate: new Date(formData.scheduledDate),
      duration: Number(formData.duration),
    };

    if (editingMeeting) {
      const updateInput: any = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate),
        duration: Number(formData.duration),
      };

      await updateMeeting({
        variables: {
          id: editingMeeting.id,
          input: updateInput,
        },
      });
    } else {
      await createMeeting({
        variables: { input },
      });
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      await deleteMeeting({
        variables: { id: meetingId },
      });
    }
  };

  const handleStatusChange = async (meetingId: string, newStatus: string) => {
    await updateMeeting({
      variables: {
        id: meetingId,
        input: { status: newStatus },
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'NO_SHOW': return 'orange';
      case 'RESCHEDULED': return 'purple';
      default: return 'gray';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'VIDEO_CALL': return <FiVideo />;
      case 'PHONE_CALL': return <FiPhone />;
      case 'IN_PERSON': return <FiMapPin />;
      default: return <FiUsers />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="xl" color={primaryColor} />
      </Box>
    );
  }

  const meetings = data?.opportunityMeetings || [];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
          Meetings ({meetings.length})
        </Text>
        <Button
          leftIcon={<FiPlus />}
          onClick={() => handleOpenModal()}
          size="sm"
          bg={primaryColor}
          color="white"
          _hover={{ opacity: 0.8 }}
        >
          Schedule Meeting
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        {meetings.length === 0 ? (
          <Text color={textMuted} textAlign="center" py={4}>
            No meetings scheduled yet. Schedule your first meeting to track discussions with this opportunity.
          </Text>
        ) : (
          meetings.map((meeting: any) => (
            <Box
              key={meeting.id}
              p={4}
              bg={cardGradientBg}
              borderRadius="md"
              border="1px"
              borderColor={cardBorder}
            >
              <HStack justify="space-between" mb={3}>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Box color={primaryColor}>{getFormatIcon(meeting.format)}</Box>
                    <Text fontWeight="bold" color={textPrimary} fontSize="lg">
                      {meeting.title}
                    </Text>
                  </HStack>
                  {meeting.description && (
                    <Text fontSize="sm" color={textMuted}>
                      {meeting.description}
                    </Text>
                  )}
                </VStack>
                <HStack>
                  <IconButton
                    aria-label="Edit meeting"
                    icon={<FiEdit />}
                    size="sm"
                    variant="ghost"
                    color={textMuted}
                    onClick={() => handleOpenModal(meeting)}
                  />
                  <IconButton
                    aria-label="Delete meeting"
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                  />
                </HStack>
              </HStack>

              <VStack align="stretch" spacing={2}>
                <HStack spacing={3} flexWrap="wrap">
                  <Badge colorScheme={getStatusColor(meeting.status)} size="sm">
                    {meeting.status}
                  </Badge>
                  <Badge colorScheme="purple" size="sm">
                    {meeting.type}
                  </Badge>
                  <HStack spacing={1}>
                    <FiCalendar size="14" color={textMuted} />
                    <Text fontSize="sm" color={textMuted}>
                      {format(new Date(meeting.scheduledDate), 'MMM d, yyyy h:mm a')}
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <FiClock size="14" color={textMuted} />
                    <Text fontSize="sm" color={textMuted}>
                      {meeting.duration} mins
                    </Text>
                  </HStack>
                </HStack>

                {(meeting.location || meeting.meetingUrl) && (
                  <HStack spacing={3}>
                    {meeting.location && (
                      <Text fontSize="sm" color={textMuted}>
                        <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                        {meeting.location}
                      </Text>
                    )}
                    {meeting.meetingUrl && (
                      <Link href={meeting.meetingUrl} isExternal color={primaryColor} fontSize="sm">
                        <FiLink style={{ display: 'inline', marginRight: '4px' }} />
                        Join Meeting
                      </Link>
                    )}
                  </HStack>
                )}

                {meeting.objectives && (
                  <Box>
                    <Text fontSize="xs" color={textMuted} fontWeight="bold" mb={1}>
                      Objectives:
                    </Text>
                    <Text fontSize="sm" color={textPrimary}>
                      {meeting.objectives}
                    </Text>
                  </Box>
                )}

                {meeting.outcome && (
                  <Box>
                    <Text fontSize="xs" color={textMuted} fontWeight="bold" mb={1}>
                      Outcome:
                    </Text>
                    <Text fontSize="sm" color={textPrimary}>
                      {meeting.outcome}
                    </Text>
                  </Box>
                )}

                {meeting.attendees && meeting.attendees.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color={textMuted} fontWeight="bold" mb={1}>
                      Attendees ({meeting.attendees.length}):
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {meeting.attendees.map((attendee: any, index: number) => (
                        <Badge
                          key={index}
                          colorScheme={attendee.isInternal ? 'blue' : 'green'}
                          size="sm"
                        >
                          {attendee.name} {attendee.role && `(${attendee.role})`}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Meeting Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor={cardBorder}>
          <ModalHeader color={textPrimary}>
            {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
          </ModalHeader>
          <ModalCloseButton color={textMuted} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textMuted}>Meeting Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Product Demo Call"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textMuted}>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting description"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel color={textMuted}>Meeting Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="INITIAL_CALL">Initial Call</option>
                    <option value="DISCOVERY">Discovery</option>
                    <option value="DEMO">Demo</option>
                    <option value="PROPOSAL_PRESENTATION">Proposal Presentation</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CLOSING">Closing</option>
                    <option value="CHECK_IN">Check In</option>
                    <option value="REVIEW">Review</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textMuted}>Format</FormLabel>
                  <Select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="VIDEO_CALL">Video Call</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="IN_PERSON">In Person</option>
                    <option value="HYBRID">Hybrid</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel color={textMuted}>Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textMuted}>Duration (minutes)</FormLabel>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  />
                </FormControl>
              </HStack>

              {formData.format === 'IN_PERSON' || formData.format === 'HYBRID' ? (
                <FormControl>
                  <FormLabel color={textMuted}>Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Meeting location"
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  />
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel color={textMuted}>Meeting Link</FormLabel>
                  <Input
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel color={textMuted}>Objectives</FormLabel>
                <Textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="What do you want to achieve in this meeting?"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              {editingMeeting && (
                <>
                  <Divider borderColor={cardBorder} />
                  <FormControl>
                    <FormLabel color={textMuted}>Meeting Notes</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes from the meeting"
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                      minH="100px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textMuted}>Outcome</FormLabel>
                    <Textarea
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      placeholder="What was the outcome of the meeting?"
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textMuted}>Next Steps</FormLabel>
                    <Textarea
                      value={formData.nextSteps}
                      onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                      placeholder="What are the next steps?"
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                    />
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal} color={textMuted}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveMeeting}
              bg={primaryColor}
            >
              {editingMeeting ? 'Update' : 'Schedule'} Meeting
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};