import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  useDisclosure,
  Flex,
  Spacer,
  useColorMode,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useMutation, useQuery, gql } from '@apollo/client';
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor } from "../../brandConfig";

const GET_OPPORTUNITY_MEMBERS = gql`
  query GetOpportunityMembers($opportunityId: String!) {
    opportunityMembers(opportunityId: $opportunityId) {
      id
      clientId
      clientName
      clientEmail
      role
      notes
      isActive
      totalEarned
      totalPending
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
    }
  }
`;

const ADD_OPPORTUNITY_MEMBER = gql`
  mutation AddOpportunityMember($opportunityId: String!, $input: OpportunityMemberInput!) {
    addOpportunityMember(opportunityId: $opportunityId, input: $input) {
      id
      clientId
      clientName
    }
  }
`;

const UPDATE_OPPORTUNITY_MEMBER = gql`
  mutation UpdateOpportunityMember($id: String!, $input: OpportunityMemberUpdateInput!) {
    updateOpportunityMember(id: $id, input: $input) {
      id
      role
    }
  }
`;

const REMOVE_OPPORTUNITY_MEMBER = gql`
  mutation RemoveOpportunityMember($id: String!) {
    removeOpportunityMember(id: $id)
  }
`;


interface OpportunityMembersProps {
  opportunityId: string;
  onMembersUpdate?: () => void;
}

const OpportunityMembers: React.FC<OpportunityMembersProps> = ({
  opportunityId,
  onMembersUpdate,
}) => {
  usePageTitle("Opportunity Members");

  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Brand styling
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    role: '',
    notes: '',
  });

  // Queries
  const { data: membersData, refetch: refetchMembers } = useQuery(GET_OPPORTUNITY_MEMBERS, {
    variables: { opportunityId },
    skip: !opportunityId,
  });

  const { data: clientsData } = useQuery(GET_CLIENTS);

  // Mutations
  const [addMember] = useMutation(ADD_OPPORTUNITY_MEMBER);
  const [updateMember] = useMutation(UPDATE_OPPORTUNITY_MEMBER);
  const [removeMember] = useMutation(REMOVE_OPPORTUNITY_MEMBER);

  const members = membersData?.opportunityMembers || [];
  const clients = clientsData?.clients || [];

  // Filter out clients that are already members
  const availableClients = clients.filter(
    (client: any) => !members.some((member: any) => member.clientId === client.id)
  );


  const handleOpenModal = (member?: any) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        clientId: member.clientId,
        role: member.role || '',
        notes: member.notes || '',
      });
      setIsEditMode(true);
    } else {
      setSelectedMember(null);
      setFormData({
        clientId: '',
        role: '',
        notes: '',
      });
      setIsEditMode(false);
    }
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (isEditMode && selectedMember) {
        await updateMember({
          variables: {
            id: selectedMember.id,
            input: {
              role: formData.role,
              notes: formData.notes,
            },
          },
        });
        toast({
          title: 'Member updated',
          status: 'success',
          duration: 3000,
        });
      } else {
        await addMember({
          variables: {
            opportunityId,
            input: formData,
          },
        });
        toast({
          title: 'Member added',
          status: 'success',
          duration: 3000,
        });
      }
      refetchMembers();
      onMembersUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleRemove = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember({ variables: { id: memberId } });
        toast({
          title: 'Member removed',
          status: 'success',
          duration: 3000,
        });
        refetchMembers();
        onMembersUpdate?.();
      } catch (error: any) {
        toast({
          title: 'Error removing member',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      }
    }
  };


  return (
    <Box bg={cardGradientBg} p={6} borderRadius="lg" border="1px" borderColor={cardBorder}>
      <Flex mb={4} align="center">
        <Text fontSize="lg" fontWeight="bold">
          Team Members
        </Text>
        <Spacer />
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          size="sm"
          onClick={() => handleOpenModal()}
        >
          Add Member
        </Button>
      </Flex>


      {members.length === 0 ? (
        <Box p={8} textAlign="center">
          <Text color={textSecondary}>No team members added yet</Text>
          <Text fontSize="sm" mt={2} color={textMuted}>
            Add members to configure commission splits per payment type
          </Text>
        </Box>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th isNumeric>Total Earned</Th>
              <Th isNumeric>Pending</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {members.map((member: any) => (
              <Tr key={member.id}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium" color={textPrimary}>{member.clientName}</Text>
                    <Text fontSize="xs" color={textMuted}>
                      {member.clientEmail}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme="blue">{member.role || 'Team Member'}</Badge>
                </Td>
                <Td isNumeric>
                  ${(member.totalEarned || 0).toLocaleString()}
                </Td>
                <Td isNumeric>
                  ${(member.totalPending || 0).toLocaleString()}
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="Edit member">
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(member)}
                      />
                    </Tooltip>
                    <Tooltip label="Remove member">
                      <IconButton
                        aria-label="Remove"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemove(member.id)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Add/Edit Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit Member' : 'Add Team Member'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!isEditMode && (
                <FormControl isRequired>
                  <FormLabel>Select Client</FormLabel>
                  <Select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    placeholder="Choose a client"
                  >
                    {availableClients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.fName} {client.lName} - {client.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Select role"
                >
                  <option value="Sales">Sales</option>
                  <option value="Account Manager">Account Manager</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Partner">Partner</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this member"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={!isEditMode && !formData.clientId}
            >
              {isEditMode ? 'Update' : 'Add Member'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OpportunityMembers;