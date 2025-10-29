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
  Progress,
  Select,
  useToast,
  Link as ChakraLink,
  Wrap,
  WrapItem,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useColorMode
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiPlus, FiFilter } from 'react-icons/fi';
import { getColor } from '../../brandConfig';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';

const GET_FRONTEND_UPGRADES = gql`
  query GetFrontendUpgrades($category: UpgradeCategory, $status: UpgradeStatus, $tenantId: ID) {
    frontendUpgrades(category: $category, status: $status, tenantId: $tenantId) {
      id
      title
      description
      gitCommitUrls
      category
      originTenantName
      createdDate
      completedCount
      totalTenantCount
      isPendingForMaster
      appliedToTenants {
        tenantId
        tenantName
        status
        appliedDate
      }
    }
  }
`;

const GET_UPGRADE_STATS = gql`
  query GetUpgradeStats {
    frontendUpgradeStats {
      totalUpgrades
      pendingUpgrades
      completedUpgrades
      inProgressUpgrades
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

const UpgradesList: React.FC = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, loading, error } = useQuery(GET_FRONTEND_UPGRADES, {
    variables: {
      category: categoryFilter || undefined,
      status: statusFilter || undefined
    }
  });

  const { data: statsData } = useQuery(GET_UPGRADE_STATS);

  const upgrades = data?.frontendUpgrades || [];
  const stats = statsData?.frontendUpgradeStats;

  const getProgressColor = (completedCount: number, totalCount: number) => {
    const percentage = (completedCount / totalCount) * 100;
    if (percentage === 100) return 'green';
    if (percentage >= 50) return 'blue';
    if (percentage > 0) return 'yellow';
    return 'gray';
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Box p={6}>
        <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Frontend Upgrades</Heading>
          <Button
            leftIcon={<FiPlus />}
            bg={getColor('secondary', colorMode)}
            color="white"
            onClick={() => navigate('/frontend-upgrades/new')}
            _hover={{ bg: getColor('secondaryHover', colorMode) }}
          >
            Track New Upgrade
          </Button>
        </Flex>

        {/* Stats */}
        {stats && (
          <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
            <CardBody>
              <StatGroup>
                <Stat>
                  <StatLabel>Total Upgrades</StatLabel>
                  <StatNumber>{stats.totalUpgrades}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Pending</StatLabel>
                  <StatNumber color="orange.500">{stats.pendingUpgrades}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>In Progress</StatLabel>
                  <StatNumber color="blue.500">{stats.inProgressUpgrades}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Completed</StatLabel>
                  <StatNumber color="green.500">{stats.completedUpgrades}</StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>
        )}

        {/* Filters */}
        <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
          <CardBody>
            <HStack spacing={4}>
              <Icon as={FiFilter} />
              <Select
                placeholder="All Categories"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                maxW="250px"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <Select
                placeholder="All Statuses"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="250px"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="SKIPPED">Skipped</option>
              </Select>
              {(categoryFilter || statusFilter) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCategoryFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Upgrades List */}
        {loading && <Text>Loading upgrades...</Text>}
        {error && (
          <Text color="red.500">Error loading upgrades: {error.message}</Text>
        )}

        {!loading && !error && upgrades.length === 0 && (
          <Card bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="lg" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  No upgrades tracked yet
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  bg={getColor('secondary', colorMode)}
                  color="white"
                  onClick={() => navigate('/frontend-upgrades/new')}
                  _hover={{ bg: getColor('secondaryHover', colorMode) }}
                >
                  Track Your First Upgrade
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {upgrades.map((upgrade: any) => (
          <Card
            key={upgrade.id}
            bg={colorMode === 'light' ? 'white' : getColor('background.darkSurface', colorMode)}
            _hover={{
              shadow: 'lg',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s'
            }}
            cursor="pointer"
            onClick={() => navigate(`/frontend-upgrades/${upgrade.id}`)}
          >
            <CardHeader>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Heading size="md">{upgrade.title}</Heading>
                  <Wrap>
                    <WrapItem>
                      <Badge colorScheme={categoryColors[upgrade.category]}>
                        {categoryLabels[upgrade.category]}
                      </Badge>
                    </WrapItem>
                    {upgrade.isPendingForMaster && (
                      <WrapItem>
                        <Badge colorScheme="orange">Master Pending</Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </HStack>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  Origin: {upgrade.originTenantName}
                </Text>
              </VStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={4}>
                <Text>{upgrade.description}</Text>

                {/* Git Commit Links */}
                {upgrade.gitCommitUrls && upgrade.gitCommitUrls.length > 0 && (
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" fontWeight="semibold">Commits:</Text>
                    {upgrade.gitCommitUrls.map((url: string, index: number) => (
                      <ChakraLink
                        key={index}
                        href={url}
                        isExternal
                        fontSize="sm"
                        color="blue.500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{index + 1} <Icon as={FiExternalLink} ml={1} />
                      </ChakraLink>
                    ))}
                  </HStack>
                )}

                {/* Progress */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Applied to {upgrade.completedCount} of {upgrade.totalTenantCount} sites
                    </Text>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                      {Math.round((upgrade.completedCount / upgrade.totalTenantCount) * 100)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={(upgrade.completedCount / upgrade.totalTenantCount) * 100}
                    colorScheme={getProgressColor(upgrade.completedCount, upgrade.totalTenantCount)}
                    size="sm"
                    borderRadius="full"
                  />
                </Box>

                {/* Date */}
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.500'}>
                  Created: {new Date(upgrade.createdDate).toLocaleDateString()}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default UpgradesList;
