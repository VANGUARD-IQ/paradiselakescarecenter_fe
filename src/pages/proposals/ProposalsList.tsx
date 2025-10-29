import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  useColorMode,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEye, FiEdit, FiExternalLink, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import proposalsModuleConfig from './moduleConfig';

const GET_ALL_PROPOSALS = gql`
  query GetAllProposals {
    getAllProposals {
      id
      companyName
      slug
      title
      status
      createdAt
      sentAt
      fullySignedAt
      customPagePath
    }
  }
`;

const CLEAR_PROPOSAL_SIGNATURES = gql`
  mutation ClearProposalSignatures($proposalId: ID!) {
    clearProposalSignatures(proposalId: $proposalId)
  }
`;

const DELETE_PROPOSAL = gql`
  mutation DeleteProposal($id: ID!) {
    deleteProposal(id: $id)
  }
`;

const ProposalsList: React.FC = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { data, loading, error, refetch } = useQuery(GET_ALL_PROPOSALS);
  const [clearSignatures] = useMutation(CLEAR_PROPOSAL_SIGNATURES);
  const [deleteProposal] = useMutation(DELETE_PROPOSAL);

  const bg = getColor("background.main", colorMode);
  const cardBg = colorMode === 'light' ? 'white' : 'gray.800';
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SENT': return 'blue';
      case 'PARTIALLY_SIGNED': return 'orange';
      case 'FULLY_SIGNED': return 'green';
      case 'EXPIRED': return 'red';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  // We'll fetch signature counts separately for each proposal
  // For now, we'll show status instead of signature count

  const handleClearSignatures = async (proposalId: string, companyName: string) => {
    if (!window.confirm(`Reset proposal for "${companyName}"? This will clear all signatures and start fresh from the agreement.`)) {
      return;
    }

    try {
      await clearSignatures({
        variables: { proposalId },
      });

      toast({
        title: 'Proposal reset',
        description: `"${companyName}" has been reset to draft status`,
        status: 'success',
        duration: 3000,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error resetting proposal',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteProposal = async (proposalId: string, companyName: string) => {
    if (!window.confirm(`⚠️ PERMANENTLY DELETE proposal for "${companyName}"?\n\nThis will delete:\n- The proposal\n- All signatures\n- All associated data\n\nThis action CANNOT be undone!`)) {
      return;
    }

    try {
      await deleteProposal({
        variables: { id: proposalId },
      });

      toast({
        title: 'Proposal deleted',
        description: `"${companyName}" has been permanently deleted`,
        status: 'success',
        duration: 3000,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error deleting proposal',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textPrimary}>Loading proposals...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <Alert status="error">
            <AlertIcon />
            Error loading proposals: {error.message}
          </Alert>
        </Container>
      </Box>
    );
  }

  const proposals = data?.getAllProposals || [];

  return (
    <>
      <NavbarWithCallToAction />
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <ModuleBreadcrumb moduleConfig={proposalsModuleConfig} />
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="xl" color={textPrimary}>Proposals</Heading>
              <Text color={textSecondary}>Manage all business proposals and signatures</Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => navigate('/proposals/new')}
            >
              New Proposal
            </Button>
          </HStack>

          {/* Proposals Table */}
          <Box
            bg={cardBg}
            borderRadius="lg"
            shadow="md"
            overflow="hidden"
          >
            {proposals.length === 0 ? (
              <VStack spacing={4} py={10}>
                <Text fontSize="xl" color={textSecondary}>No proposals yet</Text>
                <Text color={textSecondary}>Create your first proposal to get started</Text>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={() => navigate('/proposals/new')}
                >
                  Create Proposal
                </Button>
              </VStack>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Company</Th>
                    <Th>Title</Th>
                    <Th>Status</Th>
                    <Th>Signatures</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {proposals.map((proposal: any) => (
                    <Tr key={proposal.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color={textPrimary}>{proposal.companyName}</Text>
                          <Text fontSize="sm" color={textSecondary}>/{proposal.slug}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text color={textPrimary}>{proposal.title}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Text color={textPrimary}>
                          {proposal.status === 'FULLY_SIGNED' ? '✓ Signed' : '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text color={textSecondary} fontSize="sm">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details">
                            <IconButton
                              aria-label="View proposal"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/proposals/${proposal.id}`)}
                            />
                          </Tooltip>
                          {proposal.customPagePath && (
                            <Tooltip label="Open Custom Page">
                              <IconButton
                                aria-label="Open custom page"
                                icon={<FiExternalLink />}
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(proposal.customPagePath)}
                              />
                            </Tooltip>
                          )}
                          <Tooltip label="Edit Proposal">
                            <IconButton
                              aria-label="Edit proposal"
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                            />
                          </Tooltip>
                          <Tooltip label="Reset Signatures">
                            <IconButton
                              aria-label="Reset signatures"
                              icon={<FiRotateCcw />}
                              size="sm"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={() => handleClearSignatures(proposal.id, proposal.companyName)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete Proposal">
                            <IconButton
                              aria-label="Delete proposal"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteProposal(proposal.id, proposal.companyName)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
    <FooterWithFourColumns />
  </>
  );
};

export default ProposalsList;
