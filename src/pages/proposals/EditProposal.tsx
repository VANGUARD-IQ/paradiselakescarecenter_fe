import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  useColorMode,
  useToast,
  IconButton,
  Badge,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import proposalsModuleConfig from './moduleConfig';

const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    getProposal(id: $id) {
      id
      companyName
      slug
      title
      agreementMarkdown
      customPagePath
      projectId
      draftBillId
      scheduledPayments {
        billId
        daysAfterPrevious
        description
      }
      notes
    }
  }
`;

// Removed unused GET_ALL_CLIENTS query

const UPDATE_PROPOSAL = gql`
  mutation UpdateProposal($id: ID!, $input: UpdateProposalInput!) {
    updateProposal(id: $id, input: $input) {
      id
      companyName
      slug
      title
      status
    }
  }
`;

// Removed unused RequiredSigner interface

interface ScheduledPayment {
  billId?: string;
  daysAfterPrevious?: number;
  description?: string;
}

const EditProposal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [agreementMarkdown, setAgreementMarkdown] = useState('');
  const [customPagePath, setCustomPagePath] = useState('');
  const [projectId, setProjectId] = useState('');
  const [draftBillId, setDraftBillId] = useState('');
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [notes, setNotes] = useState('');

  const { data: proposalData, loading: loadingProposal } = useQuery(GET_PROPOSAL, {
    variables: { id },
    skip: !id,
  });

  // Removed unused clients query
  const [updateProposal, { loading: updating }] = useMutation(UPDATE_PROPOSAL);

  const bg = getColor("background.main", colorMode);
  const cardBg = colorMode === 'light' ? 'white' : 'gray.800';
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);

  // Load proposal data
  useEffect(() => {
    if (proposalData?.getProposal) {
      const proposal = proposalData.getProposal;
      setCompanyName(proposal.companyName || '');
      setSlug(proposal.slug || '');
      setTitle(proposal.title || '');
      setAgreementMarkdown(proposal.agreementMarkdown || '');
      setCustomPagePath(proposal.customPagePath || '');
      setProjectId(proposal.projectId || '');
      setDraftBillId(proposal.draftBillId || '');
      setScheduledPayments(proposal.scheduledPayments || []);
      setNotes(proposal.notes || '');
    }
  }, [proposalData]);

  const handleAddScheduledPayment = () => {
    setScheduledPayments([...scheduledPayments, { billId: '', daysAfterPrevious: undefined, description: '' }]);
  };

  const handleRemoveScheduledPayment = (index: number) => {
    setScheduledPayments(scheduledPayments.filter((_, i) => i !== index));
  };

  const handleUpdateScheduledPayment = (index: number, field: keyof ScheduledPayment, value: any) => {
    const updated = [...scheduledPayments];
    updated[index] = { ...updated[index], [field]: value };
    setScheduledPayments(updated);
  };

  const handleSubmit = async () => {
    if (!companyName || !slug || !title || !agreementMarkdown) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Strip __typename from scheduledPayments before sending to backend
      const cleanScheduledPayments = scheduledPayments.map((payment: any) => {
        const { __typename, ...cleanPayment } = payment;
        return cleanPayment;
      });

      await updateProposal({
        variables: {
          id,
          input: {
            companyName,
            title,
            agreementMarkdown,
            projectId: projectId || undefined,
            draftBillId: draftBillId || undefined,
            scheduledPayments: cleanScheduledPayments.length > 0 ? cleanScheduledPayments : undefined,
            notes: notes || undefined,
          },
        },
      });

      toast({
        title: 'Proposal updated!',
        description: `Proposal "${companyName}" has been updated`,
        status: 'success',
        duration: 5000,
      });

      navigate('/proposals');
    } catch (error) {
      toast({
        title: 'Error updating proposal',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loadingProposal) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <>
      <NavbarWithCallToAction />
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <ModuleBreadcrumb
              moduleConfig={proposalsModuleConfig}
            />

            <Box bg={cardBg} p={8} borderRadius="lg" shadow="md">
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color={textPrimary}>Edit Proposal</Heading>

                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Company Name</FormLabel>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., One Group Australasia"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary}>URL Slug</FormLabel>
                  <Input
                    value={slug}
                    isReadOnly
                    placeholder="e.g., onegroup"
                    opacity={0.6}
                  />
                  <Text fontSize="sm" color={textSecondary} mt={1}>
                    Slug cannot be changed after creation
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Proposal Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Website Development & Managed IT Agreement"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary}>Custom Offer Page Path (Optional)</FormLabel>
                  <Input
                    value={customPagePath}
                    onChange={(e) => setCustomPagePath(e.target.value)}
                    placeholder="e.g., /offers/onegroup"
                  />
                  <Text fontSize="sm" color={textSecondary} mt={1}>
                    If you have a custom branded offer page, enter its path here (e.g., /offers/onegroup)
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary}>Project ID (Optional)</FormLabel>
                  <Input
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., 6234f234a234b234c234d234"
                  />
                  <Text fontSize="sm" color={textSecondary} mt={1}>
                    Link this proposal to an existing project
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary}>Draft Bill ID (Optional)</FormLabel>
                  <Input
                    value={draftBillId}
                    onChange={(e) => setDraftBillId(e.target.value)}
                    placeholder="e.g., 6234f234a234b234c234d234"
                  />
                  <Text fontSize="sm" color={textSecondary} mt={1}>
                    Draft bill to be paid upon signing
                  </Text>
                </FormControl>

                <Divider />

                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Box>
                      <Heading size="md" color={textPrimary}>Scheduled Payments</Heading>
                      <Text fontSize="sm" color={textSecondary} mt={1}>
                        Create a payment schedule with milestones
                      </Text>
                    </Box>
                    <Button
                      leftIcon={<FiPlus />}
                      size="sm"
                      onClick={handleAddScheduledPayment}
                      colorScheme="blue"
                    >
                      Add Payment
                    </Button>
                  </HStack>

                  {scheduledPayments.length === 0 ? (
                    <Box
                      p={6}
                      textAlign="center"
                      borderWidth={1}
                      borderRadius="md"
                      borderStyle="dashed"
                      color={textSecondary}
                    >
                      <Text>No scheduled payments yet. Click "Add Payment" to create a milestone.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {scheduledPayments.map((payment, index) => (
                        <Box
                          key={index}
                          p={4}
                          borderWidth={1}
                          borderRadius="md"
                          bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                        >
                          <HStack justify="space-between" mb={3}>
                            <Badge colorScheme="blue">Payment {index + 1}</Badge>
                            <IconButton
                              aria-label="Remove payment"
                              icon={<FiX />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveScheduledPayment(index)}
                            />
                          </HStack>
                          <VStack spacing={3} align="stretch">
                            <FormControl>
                              <FormLabel fontSize="sm" color={textPrimary}>Bill ID</FormLabel>
                              <Input
                                size="sm"
                                value={payment.billId || ''}
                                onChange={(e) => handleUpdateScheduledPayment(index, 'billId', e.target.value)}
                                placeholder="e.g., 6234f234a234b234c234d234"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color={textPrimary}>Days After Previous Payment</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                value={payment.daysAfterPrevious || ''}
                                onChange={(e) => handleUpdateScheduledPayment(index, 'daysAfterPrevious', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder={index === 0 ? "Days after signing (e.g., 0, 7, 14)" : "Days after previous payment"}
                              />
                              <Text fontSize="xs" color={textSecondary} mt={1}>
                                {index === 0 ? 'Days after proposal is signed' : 'Days after the previous payment is completed'}
                              </Text>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color={textPrimary}>Description</FormLabel>
                              <Input
                                size="sm"
                                value={payment.description || ''}
                                onChange={(e) => handleUpdateScheduledPayment(index, 'description', e.target.value)}
                                placeholder="e.g., Milestone 1: Core Pages & Infrastructure"
                              />
                            </FormControl>
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>

                <Divider />

                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Agreement (Markdown)</FormLabel>
                  <Textarea
                    value={agreementMarkdown}
                    onChange={(e) => setAgreementMarkdown(e.target.value)}
                    placeholder="Write your agreement in Markdown format"
                    rows={15}
                    fontFamily="monospace"
                  />
                  <Text fontSize="sm" color={textSecondary} mt={1}>
                    Write your agreement in Markdown format
                  </Text>
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel color={textPrimary}>Internal Notes (Optional)</FormLabel>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes about this proposal..."
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/proposals')}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiSave />}
                    onClick={handleSubmit}
                    isLoading={updating}
                  >
                    Update Proposal
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default EditProposal;
