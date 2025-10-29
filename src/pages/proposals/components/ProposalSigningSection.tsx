import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Divider,
  Heading,
  Text,
  Input,
  FormControl,
  Collapse,
  useToast,
  useColorMode,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  PinInput,
  PinInputField,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { CheckCircleIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SignatureCapture } from './SignatureCapture';
import { SignedAgreementPDF } from './SignedAgreementPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { getColor, getComponent } from '../../../brandConfig';

const GET_PROPOSAL_BY_SLUG = gql`
  query GetProposalBySlug($slug: String!) {
    getProposalBySlug(slug: $slug) {
      id
      companyName
      title
      agreementMarkdown
      status
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

const PUBLIC_GET_PROPOSAL = gql`
  query PublicGetProposal($slug: String!, $tenantId: String!) {
    publicProposal(slug: $slug, tenantId: $tenantId) {
      id
      companyName
      title
      agreementMarkdown
      status
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
      signatureImage
      signatureImagePinataUrl
      signatureImagePinataCid
      signedAt
      ipAddress
      emailVerified
      phoneVerified
    }
  }
`;

const REQUEST_PROPOSAL_EMAIL_VERIFICATION = gql`
  mutation RequestProposalEmailVerification($input: RequestProposalEmailVerificationInput!) {
    requestProposalEmailVerification(input: $input)
  }
`;

const VERIFY_PROPOSAL_EMAIL = gql`
  mutation VerifyProposalEmail($input: VerifyProposalEmailInput!) {
    verifyProposalEmail(input: $input)
  }
`;

const SIGN_PROPOSAL_MUTATION = gql`
  mutation SignProposal(
    $proposalId: ID!
    $clientId: ID
    $signerName: String!
    $signerEmail: String!
    $signerRole: String
    $signatureImage: String!
    $emailVerificationCode: String
    $postmarkMessageId: String
    $signerPhone: String
    $phoneVerificationCode: String
  ) {
    signProposal(
      proposalId: $proposalId
      clientId: $clientId
      signerName: $signerName
      signerEmail: $signerEmail
      signerRole: $signerRole
      signatureImage: $signatureImage
      emailVerificationCode: $emailVerificationCode
      postmarkMessageId: $postmarkMessageId
      signerPhone: $signerPhone
      phoneVerificationCode: $phoneVerificationCode
    ) {
      id
      signerName
      signedAt
      emailVerified
      phoneVerified
    }
  }
`;

interface ProposalSigningSectionProps {
  proposalSlug: string;
  tenantId?: string; // Required for public access (no authentication)
  onSigningComplete?: () => void;
}

// Helper functions to work with scheduled payments
const hasScheduledPayments = (proposal: any): boolean => {
  if (!proposal) return false;
  return proposal.scheduledPayments && proposal.scheduledPayments.length > 0;
};

const getScheduledPayments = (proposal: any): any[] => {
  if (!proposal || !proposal.scheduledPayments) return [];
  return proposal.scheduledPayments;
};

export const ProposalSigningSection: React.FC<ProposalSigningSectionProps> = ({
  proposalSlug,
  tenantId,
  onSigningComplete,
}) => {
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signatureImage, setSignatureImage] = useState('');
  const [showAgreement, setShowAgreement] = useState(true);

  // Email verification state
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [postmarkMessageId, setPostmarkMessageId] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Progressive tooltip state
  const [currentStep, setCurrentStep] = useState(1);
  const [showTooltip, setShowTooltip] = useState(true);

  // SMS verification placeholder
  const [signerPhone, setSignerPhone] = useState('');
  const [_phoneVerificationCode] = useState('');
  const [_isPhoneVerified] = useState(false);

  const toast = useToast();
  const { colorMode } = useColorMode();

  const cardGradientBg = colorMode === 'light'
    ? `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 248, 0.9) 50%, rgba(255, 255, 255, 0.95) 100%)`
    : `linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(20, 20, 20, 0.8) 100%)`;
  const cardBorder = colorMode === 'light' ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const formFieldBg = getComponent("form", "fieldBg", colorMode);
  const formFieldBorder = getComponent("form", "fieldBorder", colorMode);

  // Use public query when tenantId is provided (public access), otherwise use authenticated query
  const proposalQuery = tenantId ? PUBLIC_GET_PROPOSAL : GET_PROPOSAL_BY_SLUG;
  const queryVariables = tenantId
    ? { slug: proposalSlug, tenantId }
    : { slug: proposalSlug };

  console.log('🔍 Proposal query mode:', tenantId ? 'PUBLIC' : 'AUTHENTICATED');
  console.log('🔍 Query variables:', queryVariables);

  // Fetch proposal
  const { data: proposalData, loading: loadingProposal, refetch: refetchProposal } = useQuery(proposalQuery, {
    variables: queryVariables,
  });

  // Fetch signatures
  const { data: signaturesData, refetch: refetchSignatures } = useQuery(GET_PROPOSAL_SIGNATURES, {
    variables: { proposalId: proposalData?.getProposalBySlug?.id || proposalData?.publicProposal?.id },
    skip: !(proposalData?.getProposalBySlug?.id || proposalData?.publicProposal?.id),
  });

  // Mutations
  const [requestEmailVerification, { loading: requestingEmail }] = useMutation(REQUEST_PROPOSAL_EMAIL_VERIFICATION);
  const [verifyEmail, { loading: verifyingEmail }] = useMutation(VERIFY_PROPOSAL_EMAIL);
  const [signProposal, { loading: signing }] = useMutation(SIGN_PROPOSAL_MUTATION);

  const proposal = proposalData?.getProposalBySlug || proposalData?.publicProposal;
  const signatures = signaturesData?.getProposalSignatures || [];

  console.log('📋 Proposal loaded:', {
    id: proposal?.id,
    companyName: proposal?.companyName,
    status: proposal?.status,
    isPublicAccess: !!tenantId
  });

  const handleSignatureCapture = (signature: string) => {
    setSignatureImage(signature);
  };

  const handleRequestEmailVerification = async () => {
    if (!signerEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await requestEmailVerification({
        variables: {
          input: {
            proposalId: proposalSlug,
            email: signerEmail.trim(),
          },
        },
      });

      const messageId = result.data?.requestProposalEmailVerification;
      setPostmarkMessageId(messageId || '');
      setShowEmailVerification(true);
      setCurrentStep(3); // Move to verification code step

      toast({
        title: 'Verification email sent',
        description: `Check ${signerEmail.trim()} for your verification code`,
        status: 'info',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error sending verification email',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailVerificationCode.trim()) {
      toast({
        title: 'Verification code required',
        description: 'Please enter the code from your email',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await verifyEmail({
        variables: {
          input: {
            proposalId: proposalSlug,
            email: signerEmail.trim(),
            verificationCode: emailVerificationCode.trim(),
          },
        },
      });

      if (result.data?.verifyProposalEmail) {
        setIsEmailVerified(true);
        setCurrentStep(4); // Move to signature step
        toast({
          title: 'Email verified!',
          description: 'You can now sign the proposal',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Invalid verification code',
        description: error instanceof Error ? error.message : 'Please check your code and try again',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSign = async () => {
    console.log('🖊️ ========== SIGN BUTTON CLICKED ==========');
    console.log('🖊️ Signer Name:', signerName);
    console.log('🖊️ Signer Email:', signerEmail);
    console.log('🖊️ Email Verified:', isEmailVerified);
    console.log('🖊️ Has Signature:', !!signatureImage);
    console.log('🖊️ Signature Image Length:', signatureImage?.length || 0);
    console.log('🖊️ Email Verification Code:', emailVerificationCode);
    console.log('🖊️ Postmark Message ID:', postmarkMessageId);

    if (!signerName.trim()) {
      console.log('❌ Validation failed: Name required');
      toast({
        title: 'Name required',
        description: 'Please enter your full name',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!signerEmail.trim()) {
      console.log('❌ Validation failed: Email required');
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!isEmailVerified) {
      console.log('❌ Validation failed: Email not verified');
      toast({
        title: 'Email verification required',
        description: 'Please verify your email before signing',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!signatureImage) {
      console.log('❌ Validation failed: No signature');
      toast({
        title: 'Signature required',
        description: 'Please draw your signature',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    console.log('✅ All validations passed, submitting to backend...');

    try {
      const variables = {
        proposalId: proposal.id,
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        signatureImage: signatureImage,
        emailVerificationCode: emailVerificationCode.trim(),
        postmarkMessageId: postmarkMessageId,
        signerPhone: signerPhone.trim() || undefined,
        phoneVerificationCode: _phoneVerificationCode.trim() || undefined,
      };

      console.log('📤 Sending GraphQL mutation with variables:', {
        proposalId: variables.proposalId,
        signerName: variables.signerName,
        signerEmail: variables.signerEmail,
        hasSignatureImage: !!variables.signatureImage,
        signatureImageLength: variables.signatureImage?.length,
        emailVerificationCode: variables.emailVerificationCode,
        postmarkMessageId: variables.postmarkMessageId,
      });

      const result = await signProposal({ variables });

      console.log('✅ GraphQL mutation successful:', result);

      // Build success message with next steps
      let successDescription = 'Thank you for your signature.';
      if (proposal.projectId || hasScheduledPayments(proposal)) {
        successDescription += ' Next steps: ';
        const steps = [];
        if (proposal.projectId) {
          steps.push('Click "View Project" to track progress');
        }
        if (hasScheduledPayments(proposal)) {
          steps.push('Click "Payment 1" to make your first payment');
        } else if (proposal.draftBillId) {
          steps.push('Click "View Full Total Bill" to make your payment');
        }
        successDescription += steps.join(' and ') + '.';
      }

      toast({
        title: 'Proposal signed!',
        description: successDescription,
        status: 'success',
        duration: 8000,
      });

      console.log('🔄 Refetching proposal and signatures...');
      // Refetch both proposal (to get updated status) and signatures
      await Promise.all([
        refetchProposal(),
        refetchSignatures(),
      ]);
      console.log('✅ Refetch complete');

      // Clear form
      setSignerName('');
      setSignerEmail('');
      setSignatureImage('');
      console.log('🧹 Form cleared');

      if (onSigningComplete) {
        console.log('🎯 Calling onSigningComplete callback');
        onSigningComplete();
      }

      console.log('🖊️ ========== SIGN COMPLETE ==========');
    } catch (error) {
      console.error('❌ Error during signing:', error);
      toast({
        title: 'Error signing proposal',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loadingProposal) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4} color={textSecondary}>Loading proposal...</Text>
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Alert status="error">
        <AlertIcon />
        Proposal not found. Please check the URL and try again.
      </Alert>
    );
  }

  const isFullySigned = proposal.status === 'FULLY_SIGNED';

  const successGreen = getColor('status.success', colorMode);

  return (
    <Box bg={cardGradientBg} backdropFilter="blur(10px)" p={{ base: 4, md: 8 }} borderRadius="lg" shadow="md" borderColor={cardBorder} borderWidth="1px" width="100%">
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Project Tracker CTA - Prominent at top */}
        {proposal.projectId && (
          <Box
            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)"
            backdropFilter="blur(20px)"
            p={{ base: 6, md: 8 }}
            borderRadius={{ base: "xl", md: "2xl" }}
            borderWidth={3}
            borderColor={successGreen}
            shadow="2xl"
            width="100%"
          >
            <VStack spacing={{ base: 4, md: 6 }} align="center">
              <VStack spacing={3}>
                <Heading size={{ base: "lg", md: "xl" }} textAlign="center" color={textPrimary}>
                  📋 View All Tasks Itemized
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={textSecondary} textAlign="center" maxW="700px">
                  Before reading the full agreement below, visit the project tracker to see all tasks broken down in detail. Every milestone, deliverable, and feature is itemized so you know exactly what you're getting.
                </Text>
              </VStack>

              <Button
                as="a"
                href={`/project/${proposal.projectId}`}
                target="_blank"
                size="lg"
                colorScheme="green"
                fontSize={{ base: "lg", md: "xl" }}
                px={{ base: 6, md: 12 }}
                py={{ base: 6, md: 8 }}
                height="auto"
                rightIcon={<ExternalLinkIcon />}
              >
                Open Project Tracker
              </Button>

              <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} fontStyle="italic" textAlign="center">
                💡 Opens in new tab • Track real-time progress • See all milestones
              </Text>
            </VStack>
          </Box>
        )}

        <HStack justify="space-between" align="start" flexWrap={{ base: "wrap", md: "nowrap" }} gap={2}>
          <Box>
            <Heading size="lg">{proposal.title}</Heading>
            <Text fontSize="sm" color={textSecondary} mt={1}>
              {proposal.companyName}
            </Text>

            {/* Display linked project and bills if available - Keep small links for reference */}
            {(proposal.projectId || proposal.draftBillId || hasScheduledPayments(proposal)) && (
              <VStack align="start" spacing={2} mt={2}>
                {proposal.draftBillId && (
                  <ChakraLink
                    href={`/bill/${proposal.draftBillId}`}
                    color="blue.500"
                    fontSize="sm"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    isExternal
                    target="_blank"
                  >
                    View Full Total Bill <ExternalLinkIcon mx="2px" />
                  </ChakraLink>
                )}
                {hasScheduledPayments(proposal) && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color={textSecondary} mb={1}>
                      Payment Schedule:
                    </Text>
                    <VStack align="start" spacing={1} pl={2}>
                      {getScheduledPayments(proposal).map((payment: any, index: number) => (
                        <HStack key={`scheduled-${index}`} spacing={2}>
                          {payment.billId ? (
                            <ChakraLink
                              href={`/bill/${payment.billId}`}
                              color="blue.500"
                              fontSize="sm"
                              display="flex"
                              alignItems="center"
                              gap={1}
                              isExternal
                              target="_blank"
                            >
                              {payment.description || `Payment ${index + 1}`}
                              {payment.daysAfterPrevious !== undefined && (
                                <Text as="span" fontSize="xs" color={textSecondary}>
                                  ({payment.daysAfterPrevious} days)
                                </Text>
                              )}
                              <ExternalLinkIcon mx="2px" />
                            </ChakraLink>
                          ) : (
                            <Text fontSize="sm" color={textSecondary}>
                              {payment.description || `Payment ${index + 1}`}
                              {payment.daysAfterPrevious !== undefined && (
                                <Text as="span" fontSize="xs" ml={1}>
                                  ({payment.daysAfterPrevious} days)
                                </Text>
                              )}
                            </Text>
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </Box>
          <Badge
            colorScheme={
              isFullySigned ? 'green' :
              proposal.status === 'PARTIALLY_SIGNED' ? 'yellow' :
              'gray'
            }
            fontSize="md"
            px={3}
            py={1}
          >
            {proposal.status.replace('_', ' ')}
          </Badge>
        </HStack>

        {/* Existing Signatures */}
        {signatures.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={3} color={textPrimary}>
              Signatures ({signatures.length})
            </Text>
            <VStack spacing={3} align="stretch">
              {signatures.map((sig: any) => (
                <Box
                  key={sig.id}
                  p={4}
                  bg={colorMode === 'light' ? 'green.50' : 'green.900'}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="green.300"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text fontWeight="bold" color={textPrimary}>
                          {sig.signerName}
                          {sig.signerRole && ` (${sig.signerRole})`}
                        </Text>
                      </HStack>
                      {sig.signerEmail && (
                        <Text fontSize="sm" color={textSecondary}>{sig.signerEmail}</Text>
                      )}
                      <Text fontSize="xs" color={textMuted}>
                        Signed: {new Date(sig.signedAt).toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Next Steps - Prominent CTA after signing */}
        {isFullySigned && (proposal.projectId || hasScheduledPayments(proposal) || proposal.draftBillId) && (
          <Box
            bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
            p={6}
            borderRadius="lg"
            borderWidth={2}
            borderColor="blue.400"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={textPrimary}>
                🎉 Thank You! Next Steps:
              </Heading>

              {/* First Payment Link - Most Prominent */}
              {hasScheduledPayments(proposal) && getScheduledPayments(proposal)[0]?.billId && (
                <Box>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    1. Make Your First Payment
                  </Text>
                  <Button
                    as="a"
                    href={`/bill/${getScheduledPayments(proposal)[0].billId}`}
                    target="_blank"
                    colorScheme="green"
                    size="lg"
                    width="full"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Pay First Installment - {getScheduledPayments(proposal)[0].description || 'Payment 1'}
                  </Button>
                </Box>
              )}

              {/* Full Bill Payment if no scheduled payments */}
              {!hasScheduledPayments(proposal) && proposal.draftBillId && (
                <Box>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    1. Make Your Payment
                  </Text>
                  <Button
                    as="a"
                    href={`/bill/${proposal.draftBillId}`}
                    target="_blank"
                    colorScheme="green"
                    size="lg"
                    width="full"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Pay Full Amount
                  </Button>
                </Box>
              )}

              {/* Project Tracker */}
              {proposal.projectId && (
                <Box>
                  <Text fontWeight="bold" color={textPrimary} mb={2}>
                    {hasScheduledPayments(proposal) || proposal.draftBillId ? '2.' : '1.'} Track Project Progress
                  </Text>
                  <Button
                    as="a"
                    href={`/project/${proposal.projectId}`}
                    target="_blank"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Open Project Tracker
                  </Button>
                </Box>
              )}

              <Text fontSize="sm" color={textSecondary} fontStyle="italic">
                💡 All links open in a new tab so you can keep this page open for reference
              </Text>
            </VStack>
          </Box>
        )}

        {/* Download PDF if any signatures exist */}
        {signatures.length > 0 && (
          <Box>
            <PDFDownloadLink
              document={
                <SignedAgreementPDF
                  proposalTitle={proposal.title}
                  companyName={proposal.companyName}
                  agreementContent={proposal.agreementMarkdown}
                  signatures={signatures}
                />
              }
              fileName={`${proposalSlug}-signed-agreement.pdf`}
            >
              {({ loading }) => (
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  isLoading={loading}
                  w="full"
                >
                  Download Signed Agreement ({signatures.length} signature{signatures.length !== 1 ? 's' : ''})
                </Button>
              )}
            </PDFDownloadLink>
          </Box>
        )}

        <Divider />

        {/* Agreement Content */}
        <Box>
          <Button
            onClick={() => setShowAgreement(!showAgreement)}
            variant="outline"
            colorScheme="blue"
            size="sm"
            mb={4}
          >
            {showAgreement ? 'Hide' : 'Show'} Full Agreement
          </Button>

          <Collapse in={showAgreement} animateOpacity>
            <Box
              w="full"
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              p={8}
              borderRadius="xl"
              borderWidth={1}
              borderColor={cardBorder}
              maxH="600px"
              overflowY="auto"
              boxShadow="inner"
              sx={{
                // Typography & Spacing
                lineHeight: '1.8',
                maxWidth: '800px',
                margin: '0 auto',

                // Headings
                '& h1': {
                  fontSize: '3xl',
                  fontWeight: 'extrabold',
                  mt: 8,
                  mb: 4,
                  pb: 3,
                  borderBottom: `2px solid ${cardBorder}`,
                  color: colorMode === 'light' ? 'blue.700' : 'blue.300',
                  letterSpacing: 'tight',
                },
                '& h2': {
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  mt: 6,
                  mb: 3,
                  color: colorMode === 'light' ? 'gray.800' : 'gray.100',
                  position: 'relative',
                  pl: 4,
                  _before: {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '70%',
                    bg: 'blue.500',
                    borderRadius: 'full',
                  }
                },
                '& h3': {
                  fontSize: 'xl',
                  fontWeight: 'semibold',
                  mt: 5,
                  mb: 2,
                  color: colorMode === 'light' ? 'gray.700' : 'gray.200',
                },

                // Paragraphs
                '& p': {
                  mb: 4,
                  fontSize: 'md',
                  color: textPrimary,
                  lineHeight: '1.8',
                },

                // Lists
                '& ul, & ol': {
                  ml: 6,
                  mb: 4,
                  mt: 2,
                },
                '& li': {
                  mb: 2,
                  pl: 2,
                  fontSize: 'md',
                  color: textPrimary,
                  position: 'relative',
                },
                '& ul li::marker': {
                  color: 'blue.500',
                  fontSize: 'lg',
                },

                // Strong/Bold
                '& strong': {
                  fontWeight: 'bold',
                  color: colorMode === 'light' ? 'gray.900' : 'gray.50',
                },

                // Horizontal Rules
                '& hr': {
                  my: 8,
                  borderColor: cardBorder,
                  borderWidth: '2px',
                  opacity: 0.6,
                },

                // Blockquotes
                '& blockquote': {
                  pl: 4,
                  py: 3,
                  my: 4,
                  borderLeft: `4px solid`,
                  borderColor: 'blue.400',
                  bg: colorMode === 'light' ? 'blue.50' : 'rgba(66, 153, 225, 0.1)',
                  borderRadius: 'md',
                  fontStyle: 'italic',
                },

                // Code blocks
                '& code': {
                  px: 2,
                  py: 1,
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontFamily: 'mono',
                },
                '& pre': {
                  p: 4,
                  bg: colorMode === 'light' ? 'gray.900' : 'gray.800',
                  color: 'green.300',
                  borderRadius: 'lg',
                  overflow: 'auto',
                  fontSize: 'sm',
                  lineHeight: '1.6',
                },
                '& pre code': {
                  bg: 'transparent',
                  p: 0,
                },

                // Tables
                '& table': {
                  width: '100%',
                  my: 4,
                  borderCollapse: 'collapse',
                },
                '& th': {
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                  p: 3,
                  textAlign: 'left',
                  fontWeight: 'bold',
                  borderBottom: `2px solid ${cardBorder}`,
                },
                '& td': {
                  p: 3,
                  borderBottom: `1px solid ${cardBorder}`,
                },

                // Links
                '& a': {
                  color: 'blue.500',
                  textDecoration: 'underline',
                  _hover: {
                    color: 'blue.600',
                  }
                },

                // Scrollbar styling
                '&::-webkit-scrollbar': {
                  width: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                  borderRadius: 'full',
                },
                '&::-webkit-scrollbar-thumb': {
                  bg: colorMode === 'light' ? 'gray.400' : 'gray.500',
                  borderRadius: 'full',
                  _hover: {
                    bg: colorMode === 'light' ? 'gray.500' : 'gray.400',
                  }
                },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {proposal.agreementMarkdown}
              </ReactMarkdown>
            </Box>
          </Collapse>
        </Box>

        {/* Signing Section (hide if fully signed) - CENTERED */}
        {!isFullySigned && (
          <>
            <Divider />

            <Box maxW="700px" mx="auto" width="100%">
              <Heading size={{ base: "sm", md: "md" }} mb={4} textAlign="center">Sign Agreement</Heading>

              <VStack spacing={4} align="stretch">
                {/* Step 1: Name */}
                <HStack spacing={{ base: 2, md: 4 }} align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <FormControl isRequired flex="1">
                    <Text fontWeight="bold" mb={2} color={textPrimary}>Full Legal Name:</Text>
                    <Input
                      placeholder="Enter your full name"
                      value={signerName}
                      onChange={(e) => {
                        setSignerName(e.target.value);
                        if (e.target.value.trim()) {
                          setCurrentStep(2);
                        }
                      }}
                      size="lg"
                      bg={formFieldBg}
                      borderColor={formFieldBorder}
                    />
                  </FormControl>
                  {currentStep === 1 && showTooltip && !signerName && (
                    <Box
                      position="relative"
                      bg="yellow.400"
                      color="gray.800"
                      p={3}
                      borderRadius="md"
                      maxW={{ base: "full", md: "200px" }}
                      fontSize="sm"
                      fontWeight="bold"
                      width={{ base: "100%", md: "auto" }}
                      mt={{ base: 2, md: 0 }}
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: { base: "50%", md: '-10px' },
                        top: { base: '-10px', md: '50%' },
                        transform: { base: 'translateX(-50%)', md: 'translateY(-50%)' },
                        width: 0,
                        height: 0,
                        borderTop: { base: '10px solid transparent', md: '10px solid transparent' },
                        borderBottom: { base: '10px solid transparent', md: '10px solid transparent' },
                        borderRight: { base: '0', md: '10px solid' },
                        borderLeft: { base: '10px solid transparent', md: '0' },
                        borderRightColor: { base: 'transparent', md: 'yellow.400' },
                        borderTopColor: { base: 'yellow.400', md: 'transparent' },
                      }}
                    >
                      👋 Step 1: Enter your full legal name here
                    </Box>
                  )}
                </HStack>

                {/* Step 2: Email & Verification */}
                <HStack spacing={{ base: 2, md: 4 }} align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <FormControl isRequired flex="1">
                    <Text fontWeight="bold" mb={2} color={textPrimary}>Email Address:</Text>
                    <HStack>
                      <Input
                        placeholder="your.email@example.com"
                        type="email"
                        value={signerEmail}
                        onChange={(e) => {
                          setSignerEmail(e.target.value);
                        }}
                        size="lg"
                        bg={formFieldBg}
                        borderColor={formFieldBorder}
                        isDisabled={isEmailVerified}
                      />
                      {!isEmailVerified && (
                        <Button
                          colorScheme="blue"
                          onClick={handleRequestEmailVerification}
                          isLoading={requestingEmail}
                          isDisabled={!signerEmail.trim()}
                        >
                          Verify
                        </Button>
                      )}
                      {isEmailVerified && (
                        <Badge colorScheme="green" p={2} fontSize="md">
                          ✓ Verified
                        </Badge>
                      )}
                    </HStack>
                  </FormControl>
                  {currentStep === 2 && showTooltip && !!signerName && !signerEmail && (
                    <Box
                      position="relative"
                      bg="yellow.400"
                      color="gray.800"
                      p={3}
                      borderRadius="md"
                      maxW="200px"
                      fontSize="sm"
                      fontWeight="bold"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '10px solid',
                        borderRightColor: 'yellow.400',
                      }}
                    >
                      📧 Step 2: Enter your email & click Verify
                    </Box>
                  )}
                </HStack>

                {/* Email Verification Code Input */}
                {showEmailVerification && !isEmailVerified && (
                  <HStack spacing={{ base: 2, md: 4 }} align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                    <Box
                      flex="1"
                      p={{ base: 3, md: 4 }}
                      bg={colorMode === 'light' ? 'blue.50' : 'rgba(0, 122, 255, 0.1)'}
                      borderRadius="md"
                      borderWidth={1}
                      borderColor={colorMode === 'light' ? 'blue.300' : 'rgba(0, 122, 255, 0.3)'}
                      width="100%"
                    >
                      <Text fontWeight="bold" mb={2} color={textPrimary} fontSize={{ base: "sm", md: "md" }}>
                        Enter Verification Code:
                      </Text>
                      <Text fontSize={{ base: "xs", md: "sm" }} color={textSecondary} mb={3}>
                        We sent a 4-digit code to {signerEmail}. Please enter it below.
                      </Text>
                      <HStack spacing={{ base: 2, md: 4 }} justify="center" flexWrap={{ base: "wrap", sm: "nowrap" }}>
                        <PinInput
                          value={emailVerificationCode}
                          onChange={setEmailVerificationCode}
                          onComplete={handleVerifyEmail}
                          autoFocus
                          size={{ base: "md", md: "lg" }}
                        >
                          <PinInputField
                            bg={formFieldBg}
                            color={textPrimary}
                            borderColor={formFieldBorder}
                            _focus={{ borderColor: getComponent("form", "fieldBorderFocus", colorMode) }}
                          />
                          <PinInputField
                            bg={formFieldBg}
                            color={textPrimary}
                            borderColor={formFieldBorder}
                            _focus={{ borderColor: getComponent("form", "fieldBorderFocus", colorMode) }}
                            mr={{ base: 0, md: 4 }}
                          />
                          <PinInputField
                            bg={formFieldBg}
                            color={textPrimary}
                            borderColor={formFieldBorder}
                            _focus={{ borderColor: getComponent("form", "fieldBorderFocus", colorMode) }}
                            ml={{ base: 0, md: 4 }}
                          />
                          <PinInputField
                            bg={formFieldBg}
                            color={textPrimary}
                            borderColor={formFieldBorder}
                            _focus={{ borderColor: getComponent("form", "fieldBorderFocus", colorMode) }}
                          />
                        </PinInput>
                      </HStack>
                      <HStack justify="center" mt={4}>
                        <Button
                          colorScheme="green"
                          onClick={handleVerifyEmail}
                          isLoading={verifyingEmail}
                          isDisabled={emailVerificationCode.length !== 4}
                          size="sm"
                        >
                          Confirm Code
                        </Button>
                      </HStack>
                    </Box>
                    {currentStep === 3 && showTooltip && showEmailVerification && !isEmailVerified && (
                      <Box
                        position="relative"
                        bg="yellow.400"
                        color="gray.800"
                        p={3}
                        borderRadius="md"
                        maxW="200px"
                        fontSize="sm"
                        fontWeight="bold"
                        _before={{
                          content: '""',
                          position: 'absolute',
                          left: '-10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 0,
                          height: 0,
                          borderTop: '10px solid transparent',
                          borderBottom: '10px solid transparent',
                          borderRight: '10px solid',
                          borderRightColor: 'yellow.400',
                        }}
                      >
                        🔐 Step 3: Enter the 4-digit code from your email
                      </Box>
                    )}
                  </HStack>
                )}

                {/* Step 4: Signature */}
                <HStack spacing={{ base: 2, md: 4 }} align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Box flex="1" width="100%">
                    <SignatureCapture
                      onSignatureCapture={(sig) => {
                        handleSignatureCapture(sig);
                        setCurrentStep(5);
                      }}
                      disabled={!isEmailVerified}
                    />
                  </Box>
                  {currentStep === 4 && showTooltip && isEmailVerified && !signatureImage && (
                    <Box
                      position="relative"
                      bg="yellow.400"
                      color="gray.800"
                      p={3}
                      borderRadius="md"
                      maxW="200px"
                      fontSize="sm"
                      fontWeight="bold"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '10px solid',
                        borderRightColor: 'yellow.400',
                      }}
                    >
                      ✍️ Step 4: Draw your signature in the box
                    </Box>
                  )}
                </HStack>

                <Text fontSize="xs" color={textMuted}>
                  Date: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>

                {/* Step 5: Submit */}
                <HStack spacing={{ base: 2, md: 4 }} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Button
                    flex="1"
                    colorScheme="green"
                    size={{ base: "md", md: "lg" }}
                    onClick={handleSign}
                    leftIcon={<CheckCircleIcon />}
                    isLoading={signing}
                    isDisabled={!signerName.trim() || !isEmailVerified || !signatureImage}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Sign & Accept Agreement
                  </Button>
                  {currentStep === 5 && showTooltip && !!signatureImage && (
                    <Box
                      position="relative"
                      bg="green.400"
                      color="white"
                      p={3}
                      borderRadius="md"
                      maxW="200px"
                      fontSize="sm"
                      fontWeight="bold"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '10px solid',
                        borderRightColor: 'green.400',
                      }}
                    >
                      🎉 Step 5: Click to finalize!
                    </Box>
                  )}
                </HStack>
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ProposalSigningSection;
