import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Link as ChakraLink,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Progress,
  Divider,
  useColorMode
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiArrowLeft, FiCheck, FiX, FiClock, FiEdit } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';

const GET_FRONTEND_UPGRADE = gql`
  query GetFrontendUpgrade($id: ID!) {
    frontendUpgrade(id: $id) {
      id
      title
      description
      gitCommitUrls
      category
      originTenantName
      markdownDocumentation
      createdDate
      lastModified
      createdBy
      completedCount
      totalTenantCount
      isPendingForMaster
      appliedToTenants {
        tenantId
        tenantName
        status
        appliedDate
        appliedBy
        notes
      }
    }
  }
`;

const MARK_UPGRADE_APPLIED = gql`
  mutation MarkUpgradeApplied($input: MarkUpgradeAppliedInput!) {
    markUpgradeApplied(input: $input) {
      id
      appliedToTenants {
        tenantId
        tenantName
        status
        appliedDate
        appliedBy
        notes
      }
    }
  }
`;

const categoryColors: Record<string, string> = {
  UI_ENHANCEMENT: 'purple',
  BUG_FIX: 'red',
  PERFORMANCE: 'green',
  SECURITY: 'orange',
  FEATURE: 'blue',
  REFACTOR: 'teal',
  ACCESSIBILITY: 'pink',
  OTHER: 'gray'
};

const categoryLabels: Record<string, string> = {
  UI_ENHANCEMENT: 'UI Enhancement',
  BUG_FIX: 'Bug Fix',
  PERFORMANCE: 'Performance',
  SECURITY: 'Security',
  FEATURE: 'Feature',
  REFACTOR: 'Refactor',
  ACCESSIBILITY: 'Accessibility',
  OTHER: 'Other'
};

const statusColors: Record<string, string> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  SKIPPED: 'orange'
};

const statusIcons: Record<string, any> = {
  PENDING: FiClock,
  IN_PROGRESS: FiEdit,
  COMPLETED: FiCheck,
  SKIPPED: FiX
};

const UpgradeDetail: React.FC = () => {
  const { colorMode } = useColorMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data, loading, refetch } = useQuery(GET_FRONTEND_UPGRADE, {
    variables: { id },
    skip: !id
  });

  const [markApplied, { loading: markLoading }] = useMutation(MARK_UPGRADE_APPLIED, {
    onCompleted: () => {
      toast({
        title: 'Status Updated',
        description: 'Successfully updated upgrade status for tenant',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
      onClose();
      setSelectedTenantId('');
      setSelectedStatus('');
      setNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const upgrade = data?.frontendUpgrade;

  const handleMarkStatus = (tenantId: string, currentStatus: string, currentNotes?: string) => {
    setSelectedTenantId(tenantId);
    setSelectedStatus(currentStatus);
    setNotes(currentNotes || '');
    onOpen();
  };

  const handleSubmitStatus = async () => {
    if (!selectedStatus) {
      toast({
        title: 'Validation Error',
        description: 'Please select a status',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await markApplied({
      variables: {
        input: {
          upgradeId: id,
          tenantId: selectedTenantId,
          status: selectedStatus,
          notes: notes || undefined
        }
      }
    });
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading upgrade details...</Text>
      </Box>
    );
  }

  if (!upgrade) {
    return (
      <Box p={6}>
        <Text>Upgrade not found</Text>
      </Box>
    );
  }

  const progressPercentage = (upgrade.completedCount / upgrade.totalTenantCount) * 100;

  return (
    <>
      <NavbarWithCallToAction />
      <Box p={6}>
        <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <IconButton
              aria-label="Go back"
              icon={<FiArrowLeft />}
              onClick={() => navigate('/frontend-upgrades')}
              variant="ghost"
            />
            <Heading size="lg">{upgrade.title}</Heading>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/frontend-upgrades/${id}/edit`)}
          >
            Edit
          </Button>
        </HStack>

        {/* Overview Card */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <Badge colorScheme={categoryColors[upgrade.category]}>
                  {categoryLabels[upgrade.category]}
                </Badge>
                {upgrade.isPendingForMaster && (
                  <Badge colorScheme="orange">Master Pending</Badge>
                )}
              </HStack>

              <Text>{upgrade.description}</Text>

              <Divider />

              <HStack spacing={8}>
                <Box>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Origin</Text>
                  <Text fontWeight="semibold">{upgrade.originTenantName}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Created</Text>
                  <Text fontWeight="semibold">{new Date(upgrade.createdDate).toLocaleDateString()}</Text>
                </Box>
                {upgrade.createdBy && (
                  <Box>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Created By</Text>
                    <Text fontWeight="semibold">{upgrade.createdBy}</Text>
                  </Box>
                )}
              </HStack>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Progress: {upgrade.completedCount} of {upgrade.totalTenantCount} sites
                  </Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                    {Math.round(progressPercentage)}%
                  </Text>
                </HStack>
                <Progress
                  value={progressPercentage}
                  colorScheme={progressPercentage === 100 ? 'green' : 'blue'}
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Git Commits */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardHeader>
            <Heading size="md">Git Commits</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" spacing={2}>
              {upgrade.gitCommitUrls.map((url: string, index: number) => (
                <HStack key={index}>
                  <Text fontSize="sm" fontWeight="semibold">#{index + 1}</Text>
                  <ChakraLink
                    href={url}
                    isExternal
                    color="blue.500"
                    fontSize="sm"
                  >
                    {url} <Icon as={FiExternalLink} ml={1} />
                  </ChakraLink>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Documentation */}
        {upgrade.markdownDocumentation && (
          <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
            <CardHeader>
              <Heading size="md">Documentation</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Box
                p={4}
                border="1px solid"
                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                borderRadius="md"
              >
                <ReactMarkdown>{upgrade.markdownDocumentation}</ReactMarkdown>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Tenant Status Table */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardHeader>
            <Heading size="md">Deployment Status by Tenant</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tenant</Th>
                    <Th>Status</Th>
                    <Th>Applied Date</Th>
                    <Th>Applied By</Th>
                    <Th>Notes</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {upgrade.appliedToTenants.map((tenant: any) => (
                    <Tr key={tenant.tenantId}>
                      <Td fontWeight="semibold">{tenant.tenantName}</Td>
                      <Td>
                        <Badge
                          colorScheme={statusColors[tenant.status]}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          w="fit-content"
                        >
                          <Icon as={statusIcons[tenant.status]} />
                          {tenant.status}
                        </Badge>
                      </Td>
                      <Td>
                        {tenant.appliedDate
                          ? new Date(tenant.appliedDate).toLocaleDateString()
                          : '-'}
                      </Td>
                      <Td>{tenant.appliedBy || '-'}</Td>
                      <Td maxW="200px" isTruncated>
                        {tenant.notes || '-'}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          onClick={() => handleMarkStatus(tenant.tenantId, tenant.status, tenant.notes)}
                        >
                          Update
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>

      {/* Update Status Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">
                {upgrade.appliedToTenants.find((t: any) => t.tenantId === selectedTenantId)?.tenantName}
              </Text>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="SKIPPED">Skipped</option>
              </Select>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this status update..."
                rows={3}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg={getColor('secondary', colorMode)}
              color="white"
              onClick={handleSubmitStatus}
              isLoading={markLoading}
              _hover={{ bg: getColor('secondaryHover', colorMode) }}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default UpgradeDetail;
