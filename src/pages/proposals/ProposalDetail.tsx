import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorMode,
  Badge,
  Spinner,
  List,
  ListItem,
  Divider,
} from '@chakra-ui/react';
import { FiEdit } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import proposalsModuleConfig from './moduleConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    getProposal(id: $id) {
      id
      companyName
      slug
      title
      agreementMarkdown
      customPagePath
      notes
      status
      createdAt
      projectId
      draftBillId
      scheduledPayments {
        billId
        daysAfterPrevious
        description
      }
    }
  }
`;

const GET_PROPOSAL_SIGNATURES = gql`
  query GetProposalSignatures($proposalId: ID!) {
    getProposalSignatures(proposalId: $proposalId) {
      id
      signerName
      signerEmail
      signerRole
      signedAt
      ipAddress
    }
  }
`;

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const { data: proposalData, loading: loadingProposal } = useQuery(GET_PROPOSAL, {
    variables: { id },
    skip: !id,
  });

  const { data: signaturesData } = useQuery(GET_PROPOSAL_SIGNATURES, {
    variables: { proposalId: id },
    skip: !id,
  });

  const bg = getColor("background.main", colorMode);
  const cardBg = colorMode === 'light' ? 'white' : 'gray.800';
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  if (loadingProposal) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  const proposal = proposalData?.getProposal;
  const signatures = signaturesData?.getProposalSignatures || [];

  if (!proposal) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Proposal not found</Text>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SENT': return 'blue';
      case 'PARTIALLY_SIGNED': return 'orange';
      case 'FULLY_SIGNED': return 'green';
      default: return 'gray';
    }
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <ModuleBreadcrumb
              moduleConfig={proposalsModuleConfig}
            />

            {/* Header */}
            <Box bg={cardBg} p={8} borderRadius="lg" shadow="md">
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack spacing={4}>
                    <Heading size="xl" color={textPrimary}>{proposal.companyName}</Heading>
                    <Badge colorScheme={getStatusColor(proposal.status)} fontSize="md">
                      {proposal.status}
                    </Badge>
                  </HStack>
                  <HStack>
                    <Button
                      leftIcon={<FiEdit />}
                      onClick={() => navigate(`/proposals/${id}/edit`)}
                      size="sm"
                    >
                      Edit
                    </Button>
                    {proposal.customPagePath && (
                      <Button
                        as="a"
                        href={proposal.customPagePath}
                        target="_blank"
                        variant="outline"
                        size="sm"
                      >
                        View Offer Page
                      </Button>
                    )}
                  </HStack>
                </HStack>

                <Text fontSize="xl" color={textSecondary}>{proposal.title}</Text>

                <HStack spacing={8} color={textSecondary}>
                  <Text><strong>Slug:</strong> {proposal.slug}</Text>
                  <Text><strong>Created:</strong> {new Date(proposal.createdAt).toLocaleDateString()}</Text>
                </HStack>

                {proposal.notes && (
                  <Box w="full">
                    <Text fontWeight="bold" color={textPrimary}>Notes:</Text>
                    <Text color={textSecondary}>{proposal.notes}</Text>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Signatures */}
            {signatures.length > 0 && (
              <Box bg={cardBg} p={8} borderRadius="lg" shadow="md">
                <VStack align="start" spacing={4}>
                  <Heading size="md" color={textPrimary}>Signature Audit Trail</Heading>
                  <List spacing={3} w="full">
                    {signatures.map((sig: any) => (
                      <ListItem key={sig.id}>
                        <HStack justify="space-between" p={3} borderWidth={1} borderRadius="md">
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Text fontWeight="bold" color={textPrimary}>{sig.signerName}</Text>
                              {sig.signerRole && <Badge>{sig.signerRole}</Badge>}
                            </HStack>
                            <Text fontSize="sm" color={textSecondary}>{sig.signerEmail}</Text>
                            <Text fontSize="xs" color={textSecondary}>IP: {sig.ipAddress}</Text>
                          </VStack>
                          <Text fontSize="sm" color={textSecondary}>
                            {new Date(sig.signedAt).toLocaleString()}
                          </Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              </Box>
            )}

            {/* Agreement Content */}
            <Box bg={cardBg} p={8} borderRadius="lg" shadow="md">
              <VStack align="start" spacing={4}>
                <Heading size="md" color={textPrimary}>Agreement</Heading>
                <Divider />
                <Box
                  w="full"
                  sx={{
                    '& h1': { fontSize: '2xl', fontWeight: 'bold', mt: 4, mb: 2 },
                    '& h2': { fontSize: 'xl', fontWeight: 'bold', mt: 3, mb: 2 },
                    '& h3': { fontSize: 'lg', fontWeight: 'bold', mt: 2, mb: 1 },
                    '& p': { mb: 2 },
                    '& ul': { ml: 4, mb: 2 },
                    '& li': { mb: 1 },
                    '& strong': { fontWeight: 'bold' },
                    '& hr': { my: 4 },
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {proposal.agreementMarkdown}
                  </ReactMarkdown>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default ProposalDetail;
