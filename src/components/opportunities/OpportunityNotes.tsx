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
  Card,
  CardBody,
  Checkbox,
  Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { FiPlus, FiEdit, FiTrash2, FiBookmark, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { getColor } from "../../brandConfig";

// GraphQL Queries and Mutations
const GET_OPPORTUNITY_NOTES = gql`
  query GetOpportunityNotes($opportunityId: String!) {
    opportunityNotes(opportunityId: $opportunityId) {
      id
      title
      content
      type
      priority
      visibility
      isPinned
      isActionable
      isDecisionFactor
      isRisk
      isOpportunity
      sentiment
      contactPerson
      contactEmail
      followUpRequired
      followUpDate
      followUpAction
      followUpCompleted
      tags
      category
      createdAt
      createdByName
      lastEditedAt
      lastEditedByName
    }
  }
`;

const CREATE_OPPORTUNITY_NOTE = gql`
  mutation CreateOpportunityNote($input: OpportunityNoteInput!) {
    createOpportunityNote(input: $input) {
      id
      title
    }
  }
`;

const UPDATE_OPPORTUNITY_NOTE = gql`
  mutation UpdateOpportunityNote($id: String!, $input: OpportunityNoteUpdateInput!) {
    updateOpportunityNote(id: $id, input: $input) {
      id
      title
    }
  }
`;

const DELETE_OPPORTUNITY_NOTE = gql`
  mutation DeleteOpportunityNote($id: String!) {
    deleteOpportunityNote(id: $id)
  }
`;

interface OpportunityNotesProps {
  opportunityId: string;
}

export const OpportunityNotes: React.FC<OpportunityNotesProps> = ({ opportunityId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    priority: 'MEDIUM',
    visibility: 'PUBLIC',
    contactPerson: '',
    contactEmail: '',
    isPinned: false,
    isActionable: false,
    isDecisionFactor: false,
    isRisk: false,
    isOpportunity: false,
    sentiment: '',
    followUpRequired: false,
    followUpDate: '',
    followUpAction: '',
    tags: [] as string[],
    category: '',
  });

  const toast = useToast();

  // Color scheme
  const primaryColor = getColor("blue.500");
  const cardBorder = "rgba(255, 255, 255, 0.1)";
  const textPrimary = "white";
  const textMuted = "gray.400";
  const cardGradientBg = "linear-gradient(135deg, rgba(31, 37, 89, 0.8) 0%, rgba(17, 21, 51, 0.8) 100%)";

  // Queries
  const { loading, data, refetch } = useQuery(GET_OPPORTUNITY_NOTES, {
    variables: { opportunityId },
  });

  // Mutations
  const [createNote] = useMutation(CREATE_OPPORTUNITY_NOTE, {
    onCompleted: () => {
      toast({
        title: 'Note created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error creating note',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [updateNote] = useMutation(UPDATE_OPPORTUNITY_NOTE, {
    onCompleted: () => {
      toast({
        title: 'Note updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: 'Error updating note',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [deleteNote] = useMutation(DELETE_OPPORTUNITY_NOTE, {
    onCompleted: () => {
      toast({
        title: 'Note deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting note',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleOpenModal = (note?: any) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        type: note.type,
        priority: note.priority,
        visibility: note.visibility,
        contactPerson: note.contactPerson || '',
        contactEmail: note.contactEmail || '',
        isPinned: note.isPinned || false,
        isActionable: note.isActionable || false,
        isDecisionFactor: note.isDecisionFactor || false,
        isRisk: note.isRisk || false,
        isOpportunity: note.isOpportunity || false,
        sentiment: note.sentiment || '',
        followUpRequired: note.followUpRequired || false,
        followUpDate: note.followUpDate ? new Date(note.followUpDate).toISOString().split('T')[0] : '',
        followUpAction: note.followUpAction || '',
        tags: note.tags || [],
        category: note.category || '',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        priority: 'MEDIUM',
        visibility: 'PUBLIC',
        contactPerson: '',
        contactEmail: '',
        isPinned: false,
        isActionable: false,
        isDecisionFactor: false,
        isRisk: false,
        isOpportunity: false,
        sentiment: '',
        followUpRequired: false,
        followUpDate: '',
        followUpAction: '',
        tags: [],
        category: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = async () => {
    const input: any = {
      ...formData,
      opportunityId,
    };

    if (formData.followUpDate) {
      input.followUpDate = new Date(formData.followUpDate);
    }

    if (editingNote) {
      await updateNote({
        variables: {
          id: editingNote.id,
          input: {
            ...formData,
            followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
          },
        },
      });
    } else {
      await createNote({
        variables: { input },
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote({
        variables: { id: noteId },
      });
    }
  };

  const toggleNoteExpansion = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const togglePin = async (note: any) => {
    await updateNote({
      variables: {
        id: note.id,
        input: { isPinned: !note.isPinned },
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CALL_NOTES': return 'blue';
      case 'MEETING_NOTES': return 'purple';
      case 'EMAIL_SUMMARY': return 'cyan';
      case 'CUSTOMER_FEEDBACK': return 'green';
      case 'COMPETITOR_INTEL': return 'red';
      case 'PRICING_DISCUSSION': return 'orange';
      case 'RISK_ASSESSMENT': return 'red';
      case 'WIN_LOSS_ANALYSIS': return 'yellow';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="xl" color={primaryColor} />
      </Box>
    );
  }

  const notes = data?.opportunityNotes || [];
  const pinnedNotes = notes.filter((n: any) => n.isPinned);
  const unpinnedNotes = notes.filter((n: any) => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
          Notes ({notes.length})
        </Text>
        <Button
          leftIcon={<FiPlus />}
          onClick={() => handleOpenModal()}
          size="sm"
          bg={primaryColor}
          color="white"
          _hover={{ opacity: 0.8 }}
        >
          Add Note
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        {sortedNotes.length === 0 ? (
          <Text color={textMuted} textAlign="center" py={4}>
            No notes yet. Add notes to capture important information about this opportunity.
          </Text>
        ) : (
          sortedNotes.map((note: any) => {
            const isExpanded = expandedNotes.has(note.id);
            const truncatedContent = note.content.length > 150 && !isExpanded
              ? note.content.substring(0, 150) + '...'
              : note.content;

            return (
              <Card
                key={note.id}
                bg={cardGradientBg}
                borderRadius="md"
                border="1px"
                borderColor={note.isPinned ? primaryColor : cardBorder}
                position="relative"
              >
                <CardBody>
                  {note.isPinned && (
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="blue"
                      variant="solid"
                    >
                      <FiBookmark style={{ marginRight: '4px' }} />
                      Pinned
                    </Badge>
                  )}

                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold" color={textPrimary} fontSize="lg">
                          {note.title}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={getPriorityColor(note.priority)} size="sm">
                            {note.priority}
                          </Badge>
                          <Badge colorScheme={getTypeColor(note.type)} size="sm">
                            {note.type.replace(/_/g, ' ')}
                          </Badge>
                          {note.isActionable && (
                            <Badge colorScheme="orange" size="sm">
                              <FiCheckCircle style={{ marginRight: '2px' }} />
                              Actionable
                            </Badge>
                          )}
                          {note.isRisk && (
                            <Badge colorScheme="red" size="sm">
                              <FiAlertCircle style={{ marginRight: '2px' }} />
                              Risk
                            </Badge>
                          )}
                          {note.isOpportunity && (
                            <Badge colorScheme="green" size="sm">
                              <FiTrendingUp style={{ marginRight: '2px' }} />
                              Opportunity
                            </Badge>
                          )}
                          {note.isDecisionFactor && (
                            <Badge colorScheme="purple" size="sm">
                              Decision Factor
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                      <HStack>
                        <IconButton
                          aria-label="Pin note"
                          icon={<FiBookmark />}
                          size="sm"
                          variant="ghost"
                          color={note.isPinned ? primaryColor : textMuted}
                          onClick={() => togglePin(note)}
                        />
                        <IconButton
                          aria-label="Edit note"
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          color={textMuted}
                          onClick={() => handleOpenModal(note)}
                        />
                        <IconButton
                          aria-label="Delete note"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          color="red.400"
                          onClick={() => handleDeleteNote(note.id)}
                        />
                      </HStack>
                    </HStack>

                    <Text color={textPrimary} whiteSpace="pre-wrap">
                      {truncatedContent}
                    </Text>

                    {note.content.length > 150 && (
                      <Button
                        size="sm"
                        variant="link"
                        color={primaryColor}
                        onClick={() => toggleNoteExpansion(note.id)}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Button>
                    )}

                    {note.contactPerson && (
                      <HStack>
                        <FiUser color={textMuted} />
                        <Text fontSize="sm" color={textMuted}>
                          Contact: {note.contactPerson}
                          {note.contactEmail && ` (${note.contactEmail})`}
                        </Text>
                      </HStack>
                    )}

                    {note.followUpRequired && (
                      <Box p={2} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                        <Text fontSize="sm" color="orange.300" fontWeight="bold">
                          Follow-up Required
                        </Text>
                        {note.followUpDate && (
                          <Text fontSize="sm" color={textMuted}>
                            Due: {format(new Date(note.followUpDate), 'MMM d, yyyy')}
                          </Text>
                        )}
                        {note.followUpAction && (
                          <Text fontSize="sm" color={textMuted}>
                            Action: {note.followUpAction}
                          </Text>
                        )}
                      </Box>
                    )}

                    <Divider borderColor={cardBorder} />

                    <HStack justify="space-between">
                      <Text fontSize="xs" color={textMuted}>
                        Created by {note.createdByName} on {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                      </Text>
                      {note.lastEditedAt && (
                        <Text fontSize="xs" color={textMuted}>
                          Edited by {note.lastEditedByName}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })
        )}
      </VStack>

      {/* Note Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor={cardBorder} maxH="90vh" overflowY="auto">
          <ModalHeader color={textPrimary}>
            {editingNote ? 'Edit Note' : 'New Note'}
          </ModalHeader>
          <ModalCloseButton color={textMuted} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textMuted}>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textMuted}>Content</FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note here..."
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  minH="150px"
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel color={textMuted}>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="GENERAL">General</option>
                    <option value="CALL_NOTES">Call Notes</option>
                    <option value="MEETING_NOTES">Meeting Notes</option>
                    <option value="EMAIL_SUMMARY">Email Summary</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="CUSTOMER_FEEDBACK">Customer Feedback</option>
                    <option value="COMPETITOR_INTEL">Competitor Intel</option>
                    <option value="TECHNICAL_REQUIREMENTS">Technical Requirements</option>
                    <option value="PRICING_DISCUSSION">Pricing Discussion</option>
                    <option value="DECISION_CRITERIA">Decision Criteria</option>
                    <option value="RISK_ASSESSMENT">Risk Assessment</option>
                    <option value="WIN_LOSS_ANALYSIS">Win/Loss Analysis</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textMuted}>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color={textMuted}>Contact Person</FormLabel>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Name of contact person"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textMuted}>Contact Email</FormLabel>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textMuted}>Flags</FormLabel>
                <VStack align="start" spacing={2}>
                  <Checkbox
                    isChecked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    colorScheme="blue"
                    color={textMuted}
                  >
                    Pin to top
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.isActionable}
                    onChange={(e) => setFormData({ ...formData, isActionable: e.target.checked })}
                    colorScheme="orange"
                    color={textMuted}
                  >
                    Requires action
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.isDecisionFactor}
                    onChange={(e) => setFormData({ ...formData, isDecisionFactor: e.target.checked })}
                    colorScheme="purple"
                    color={textMuted}
                  >
                    Influences buying decision
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.isRisk}
                    onChange={(e) => setFormData({ ...formData, isRisk: e.target.checked })}
                    colorScheme="red"
                    color={textMuted}
                  >
                    Represents a risk
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.isOpportunity}
                    onChange={(e) => setFormData({ ...formData, isOpportunity: e.target.checked })}
                    colorScheme="green"
                    color={textMuted}
                  >
                    Upsell/expansion opportunity
                  </Checkbox>
                </VStack>
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={formData.followUpRequired}
                  onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                  colorScheme="orange"
                  color={textMuted}
                >
                  Follow-up required
                </Checkbox>
              </FormControl>

              {formData.followUpRequired && (
                <>
                  <FormControl>
                    <FormLabel color={textMuted}>Follow-up Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textMuted}>Follow-up Action</FormLabel>
                    <Input
                      value={formData.followUpAction}
                      onChange={(e) => setFormData({ ...formData, followUpAction: e.target.value })}
                      placeholder="What action needs to be taken?"
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
              onClick={handleSaveNote}
              bg={primaryColor}
            >
              {editingNote ? 'Update' : 'Create'} Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};