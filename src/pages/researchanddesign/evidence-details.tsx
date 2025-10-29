import React, { useState, useEffect } from 'react';
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
  Badge,
  useToast,
  useColorModeValue,
  useColorMode,
  Text,
  Image,
  Container,
} from '@chakra-ui/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  ArrowBackIcon,
  EditIcon,
  DownloadIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';

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

const GET_RD_EVIDENCE = gql`
  query GetRDEvidence($projectId: String, $activityId: String) {
    getRDEvidence(projectId: $projectId, activityId: $activityId) {
      id
      rdProjectId
      rdActivityId
      evidenceType
      title
      description
      fileUrl
      content
      captureDate
      source
      participants
      metadata
    }
  }
`;

const ResearchAndDesignEvidenceDetails: React.FC = () => {
  usePageTitle("R&D Evidence Details");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);
  const transcriptionBg = "rgba(0, 0, 0, 0.3)";

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    projectId: '',
    activityId: '',
    source: '',
    participants: '',
  });

  // Fetch real data from GraphQL
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_RD_PROJECTS);
  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_RD_ACTIVITIES, {
    variables: { projectId: editForm.projectId },
    skip: !editForm.projectId
  });
  const { data: evidenceData, loading: evidenceLoading } = useQuery(GET_RD_EVIDENCE, {
    variables: { projectId: projectId || undefined },
  });

  // Get data from queries
  const projects = projectsData?.getRDProjects || [];
  const activities = activitiesData?.getRDActivities || [];
  const evidence = evidenceData?.getRDEvidence || [];

  // Find the specific evidence item
  const selectedEvidence = evidence.find((item: any) => item.id === evidenceId);

  const evidenceTypes = [
    { value: 'document', label: 'Document', icon: '📄', description: 'PDFs, Word docs, spreadsheets' },
    { value: 'screenshot', label: 'Screenshot', icon: '📸', description: 'Screen captures, UI mockups' },
    { value: 'photo', label: 'Photo', icon: '📷', description: 'Physical photos, whiteboard sessions' },
    { value: 'audio', label: 'Audio', icon: '🎤', description: 'Audio recordings, meetings' },
    { value: 'meeting-notes', label: 'Meeting Notes', icon: '📝', description: 'AI-generated meeting notes from audio' },
    { value: 'code', label: 'Code', icon: '💻', description: 'Source code, scripts, configs' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email communications' },
    { value: 'chat', label: 'Chat', icon: '💬', description: 'Chat logs, messaging' },
    { value: 'other', label: 'Other', icon: '📎', description: 'Other file types' },
  ];

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? `${project.projectName} ${project.projectCode ? `(${project.projectCode})` : ''}` : 'Unknown Project';
  };

  const getActivityName = (activityId: string) => {
    if (!activityId) return 'Unassigned';
    const activity = activities.find((a: any) => a.id === activityId);
    return activity ? activity.activityName : 'Unassigned';
  };

  const getEvidenceIcon = (type: string) => {
    const evidenceType = evidenceTypes.find(et => et.value === type);
    return evidenceType ? evidenceType.icon : '📎';
  };

  // Initialize edit form when evidence loads
  useEffect(() => {
    if (selectedEvidence) {
      setEditForm({
        title: selectedEvidence.title || '',
        description: selectedEvidence.description || '',
        projectId: selectedEvidence.rdProjectId || '',
        activityId: selectedEvidence.rdActivityId || '',
        source: selectedEvidence.source || '',
        participants: selectedEvidence.participants || '',
      });
    }
  }, [selectedEvidence]);

  const handleSave = () => {
    // TODO: Implement update mutation
    toast({
      title: 'Update evidence',
      description: 'Evidence update functionality coming soon!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    setIsEditing(false);
  };

  if (evidenceLoading) {
    return (
      <>
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <Text>Loading evidence...</Text>
        </Container>
        <FooterWithFourColumns />
      </>
    );
  }

  if (!selectedEvidence) {
    return (
      <>
        <NavbarWithCallToAction />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6}>
            <Text>Evidence not found</Text>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`)}
            >
              Back to Evidence
            </Button>
          </VStack>
        </Container>
        <FooterWithFourColumns />
      </>
    );
  }

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
      <NavbarWithCallToAction />
      <Container maxW="container.xl" py={8} flex="1">
        {/* Header */}
        <HStack mb={6} justify="space-between">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            color={textPrimary}
            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
            onClick={() => navigate(`/researchanddesign/evidence${projectId ? `?project=${projectId}` : ''}`)}
          >
            Back to Evidence
          </Button>
          
          {!isEditing && (
            <Button
              leftIcon={<EditIcon />}
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
              onClick={() => setIsEditing(true)}
              boxShadow="0 4px 15px rgba(107, 70, 193, 0.3)"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Edit
            </Button>
          )}
        </HStack>

        <VStack spacing={6} align="stretch">
          <Heading size="2xl" color={textPrimary}>
            {isEditing ? 'Edit Evidence' : 'Evidence Details'}
          </Heading>

          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader borderBottom="1px" borderColor={cardBorder}>
              <HStack>
                <Text fontSize="3xl">{getEvidenceIcon(selectedEvidence.evidenceType)}</Text>
                <Badge 
                  bg={getColor("badges.blue.bg", colorMode)}
                  color={getColor("badges.blue.color", colorMode)}
                  border="1px solid"
                  borderColor={getColor("badges.blue.border", colorMode)}
                  fontSize="md"
                >
                  {selectedEvidence.evidenceType}
                </Badge>
                <Text fontSize="md" color={textSecondary}>
                  {selectedEvidence.captureDate ? new Date(selectedEvidence.captureDate).toLocaleString() : 'No date'}
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Media Viewer */}
                {selectedEvidence.fileUrl && (
                  <Box>
                    {selectedEvidence.evidenceType === 'audio' && (
                      <VStack spacing={3}>
                        <Text fontWeight="semibold">Audio Recording</Text>
                        <audio controls style={{ width: '100%' }}>
                          <source src={selectedEvidence.fileUrl} type="audio/webm" />
                          <source src={selectedEvidence.fileUrl} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      </VStack>
                    )}
                    {(selectedEvidence.evidenceType === 'photo' || selectedEvidence.evidenceType === 'screenshot') && (
                      <VStack spacing={3}>
                        <Text fontWeight="semibold">Image</Text>
                        <Image 
                          src={selectedEvidence.fileUrl} 
                          alt={selectedEvidence.title}
                          maxH="300px"
                          objectFit="contain"
                        />
                      </VStack>
                    )}
                    {selectedEvidence.evidenceType === 'document' && selectedEvidence.fileUrl && selectedEvidence.fileUrl.includes('.pdf') && (
                      <VStack spacing={3}>
                        <HStack justify="space-between" width="100%">
                          <Text fontWeight="semibold" color={textPrimary}>PDF Document</Text>
                          <Button
                            size="sm"
                            leftIcon={<DownloadIcon />}
                            as="a"
                            href={selectedEvidence.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download PDF
                          </Button>
                        </HStack>
                        <Box
                          width="100%"
                          height="600px"
                          border="1px solid"
                          borderColor={cardBorder}
                          borderRadius="md"
                          overflow="hidden"
                          bg="white"
                        >
                          <iframe
                            src={selectedEvidence.fileUrl}
                            width="100%"
                            height="100%"
                            title="PDF Preview"
                            style={{ border: 'none' }}
                          />
                        </Box>
                      </VStack>
                    )}
                    {selectedEvidence.evidenceType === 'meeting-notes' && selectedEvidence.fileUrl && (
                      <VStack spacing={3}>
                        <HStack justify="space-between" width="100%">
                          <Text fontWeight="semibold" color={textPrimary}>Meeting Notes PDF</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="green" variant="solid">AI Generated</Badge>
                          <Button
                              size="sm"
                              leftIcon={<DownloadIcon />}
                              as="a"
                              href={selectedEvidence.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download PDF
                            </Button>
                          </HStack>
                        </HStack>
                        <Box
                          width="100%"
                          height="600px"
                          border="1px solid"
                          borderColor={cardBorder}
                          borderRadius="md"
                          overflow="hidden"
                          bg="white"
                        >
                          <iframe
                            src={selectedEvidence.fileUrl}
                            width="100%"
                            height="100%"
                            title="Meeting Notes PDF Preview"
                            style={{ border: 'none' }}
                          />
                        </Box>
                      </VStack>
                    )}
                    {!['audio', 'photo', 'screenshot', 'document', 'meeting-notes'].includes(selectedEvidence.evidenceType) && (
                      <VStack spacing={3}>
                        <Text fontWeight="semibold">File</Text>
                        <Button
                          leftIcon={<DownloadIcon />}
                          as="a"
                          href={selectedEvidence.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open File
                        </Button>
                      </VStack>
                    )}
                    {selectedEvidence.evidenceType === 'document' && selectedEvidence.fileUrl && !selectedEvidence.fileUrl.includes('.pdf') && (
                      <VStack spacing={3}>
                        <Text fontWeight="semibold">Document</Text>
                        <Button
                          leftIcon={<DownloadIcon />}
                          as="a"
                          href={selectedEvidence.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Document
                        </Button>
                      </VStack>
                    )}
                  </Box>
                )}

                {/* Editable Form Fields */}
                <Grid templateColumns="1fr" gap={4}>
                  <FormControl>
                    <FormLabel color={textPrimary} fontSize="md">Title</FormLabel>
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
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
                    ) : (
                      <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" fontSize="md" color={textPrimary}>
                        {selectedEvidence.title || 'No title'}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textPrimary} fontSize="md">Description</FormLabel>
                    {isEditing ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={4}
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
                    ) : (
                      <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" minH="100px" fontSize="md" color={textPrimary}>
                        {selectedEvidence.description || 'No description'}
                      </Text>
                    )}
                  </FormControl>

                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Project</FormLabel>
                      {isEditing ? (
                        <Select
                          value={editForm.projectId}
                          onChange={(e) => setEditForm({...editForm, projectId: e.target.value, activityId: ''})}
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
                          <option value="" style={{ backgroundColor: '#1a1a1a' }}>Select project...</option>
                          {projects.map((project: any) => (
                            <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                              {project.projectName} {project.projectCode && `(${project.projectCode})`}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" fontSize="md" color={textPrimary}>
                          {getProjectName(selectedEvidence.rdProjectId)}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Activity</FormLabel>
                      {isEditing ? (
                        <Select
                          value={editForm.activityId}
                          onChange={(e) => setEditForm({...editForm, activityId: e.target.value})}
                          isDisabled={!editForm.projectId || activitiesLoading}
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
                          <option value="" style={{ backgroundColor: '#1a1a1a' }}>Select activity...</option>
                          {activities.filter((a: any) => a.rdProjectId === editForm.projectId).map((activity: any) => (
                            <option key={activity.id} value={activity.id} style={{ backgroundColor: '#1a1a1a' }}>
                              {activity.activityName}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" fontSize="md" color={textPrimary}>
                          {getActivityName(selectedEvidence.rdActivityId)}
                        </Text>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Source</FormLabel>
                      {isEditing ? (
                        <Input
                          value={editForm.source}
                          onChange={(e) => setEditForm({...editForm, source: e.target.value})}
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
                      ) : (
                        <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" fontSize="md" color={textPrimary}>
                          {selectedEvidence.source || 'No source specified'}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textPrimary} fontSize="md">Participants</FormLabel>
                      {isEditing ? (
                        <Input
                          value={editForm.participants}
                          onChange={(e) => setEditForm({...editForm, participants: e.target.value})}
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
                      ) : (
                        <Text p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md" fontSize="md" color={textPrimary}>
                          {selectedEvidence.participants || 'No participants listed'}
                        </Text>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Audio Transcription */}
                {selectedEvidence.evidenceType === 'audio' && selectedEvidence.content && (
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <HStack justify="space-between">
                        <HStack>
                          <Text fontWeight="semibold" color={textPrimary} fontSize="lg">Audio Transcription</Text>
                          <Badge 
                            bg={getColor("badges.green.bg", colorMode)}
                            color={getColor("badges.green.color", colorMode)}
                            border="1px solid"
                            borderColor={getColor("badges.green.border", colorMode)}
                            fontSize="sm"
                          >AI Generated</Badge>
                        </HStack>
                        <HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            color={textPrimary}
                            borderColor={cardBorder}
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => {
                              navigator.clipboard.writeText(selectedEvidence.content);
                              toast({
                                title: 'Copied to clipboard',
                                status: 'success',
                                duration: 2000,
                              });
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            color={textPrimary}
                            borderColor={cardBorder}
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            onClick={() => {
                              const blob = new Blob([selectedEvidence.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${selectedEvidence.title || 'transcription'}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Download
                          </Button>
                        </HStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" color={textSecondary}>
                          Generated using OpenAI Whisper AI • {selectedEvidence.content.split(/\s+/).filter((word: string) => word.length > 0).length} words
                        </Text>
                        <Box
                          p={4}
                          bg={transcriptionBg}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={cardBorder}
                          fontFamily="mono"
                          fontSize="sm"
                          lineHeight="1.6"
                          whiteSpace="pre-wrap"
                          color={textPrimary}
                        >
                          {selectedEvidence.content}
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* No Transcription Message for Audio */}
                {selectedEvidence.evidenceType === 'audio' && !selectedEvidence.content && (
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardBody>
                      <VStack spacing={3}>
                        <HStack>
                          <Text fontWeight="semibold" color={textPrimary} fontSize="lg">Audio Transcription</Text>
                          <Badge 
                            bg={getColor("badges.gray.bg", colorMode)}
                            color={getColor("badges.gray.color", colorMode)}
                            border="1px solid"
                            borderColor={getColor("badges.gray.border", colorMode)}
                            fontSize="sm"
                          >Not Available</Badge>
                        </HStack>
                        <Text fontSize="sm" color={textSecondary} textAlign="center">
                          This audio file doesn't have a transcription. 
                          Future uploads will automatically include AI-generated transcriptions.
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Metadata (excluding audio transcriptions which are shown above) */}
                {selectedEvidence.content && selectedEvidence.evidenceType !== 'audio' && (
                  <Box>
                    <Text fontWeight="semibold" mb={2} color={textPrimary} fontSize="lg">Content</Text>
                    <Box p={4} bg="rgba(0, 0, 0, 0.3)" borderRadius="md" fontFamily="mono" fontSize="sm" border="1px solid" borderColor={cardBorder}>
                      {(() => {
                        try {
                          return <pre style={{ color: textPrimary }}>{JSON.stringify(JSON.parse(selectedEvidence.content), null, 2)}</pre>;
                        } catch {
                          return <Text whiteSpace="pre-wrap" color={textPrimary}>{selectedEvidence.content}</Text>;
                        }
                      })()}
                    </Box>
                  </Box>
                )}

                {/* Additional Metadata */}
                {selectedEvidence.metadata && (
                  <Box>
                    <Text fontWeight="semibold" mb={2} color={textPrimary} fontSize="lg">Additional Metadata</Text>
                    <Box p={4} bg="rgba(0, 0, 0, 0.3)" borderRadius="md" fontFamily="mono" fontSize="sm" border="1px solid" borderColor={cardBorder}>
                      {(() => {
                        try {
                          return <pre style={{ color: textPrimary }}>{JSON.stringify(JSON.parse(selectedEvidence.metadata), null, 2)}</pre>;
                        } catch {
                          return <Text whiteSpace="pre-wrap" color={textPrimary}>{selectedEvidence.metadata}</Text>;
                        }
                      })()}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <HStack spacing={4} justify="flex-end">
                    <Button 
                      variant="ghost" 
                      color={textPrimary}
                      _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      bg="white"
                      color="black"
                      _hover={{ 
                        bg: "gray.100",
                        transform: "translateY(-2px)"
                      }}
                      onClick={handleSave}
                      boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                    >
                      Save Changes
                    </Button>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignEvidenceDetails;