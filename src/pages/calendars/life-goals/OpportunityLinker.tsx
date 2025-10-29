import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Checkbox,
  Badge,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { getColor } from '../../../brandConfig';
import { useQuery, gql } from '@apollo/client';

const GET_OPPORTUNITIES = gql`
  query GetOpportunities($status: OpportunityStatus, $stage: String) {
    opportunities(status: $status, stage: $stage) {
      id
      title
      description
      clientName
      value
      stage
      status
      priority
      probability
      expectedRevenue
      expectedCloseDate
      assignedToName
    }
  }
`;

interface OpportunityLinkerProps {
  selectedOpportunities: string[];
  onOpportunitiesChange: (opportunityIds: string[]) => void;
}

export const OpportunityLinker: React.FC<OpportunityLinkerProps> = ({
  selectedOpportunities,
  onOpportunitiesChange,
}) => {
  const { colorMode } = useColorMode();

  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);

  const [searchTerm, setSearchTerm] = useState('');

  // Fetch opportunities (all statuses and stages)
  const { loading, error, data } = useQuery(GET_OPPORTUNITIES, {
    variables: {
      // Don't filter by status or stage - get all opportunities
    },
    context: {
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || '',
      },
    },
  });

  const opportunities = data?.opportunities || [];

  // Filter opportunities by search term
  const filteredOpportunities = opportunities.filter((opp: any) =>
    (opp.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOpportunity = (opportunityId: string) => {
    if (selectedOpportunities.includes(opportunityId)) {
      onOpportunitiesChange(selectedOpportunities.filter(id => id !== opportunityId));
    } else {
      onOpportunitiesChange([...selectedOpportunities, opportunityId]);
    }
  };

  // Calculate selected opportunities stats
  const selectedOpportunitiesData = opportunities.filter((opp: any) =>
    selectedOpportunities.includes(opp.id)
  );
  const totalValue = selectedOpportunitiesData.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);
  const weightedValue = selectedOpportunitiesData.reduce(
    (sum: number, opp: any) => sum + (opp.value || 0) * ((opp.probability || 0) / 100),
    0
  );
  const expectedRevenue = selectedOpportunitiesData.reduce(
    (sum: number, opp: any) => sum + (opp.expectedRevenue || 0),
    0
  );

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      LEAD: 'gray',
      QUALIFIED: 'blue',
      PROPOSAL: 'purple',
      NEGOTIATION: 'orange',
      WON: 'green',
      LOST: 'red',
      PROSPECTING: 'gray',
      QUALIFICATION: 'blue',
      CLOSED_WON: 'green',
      CLOSED_LOST: 'red',
    };
    return colors[stage] || 'gray';
  };

  const formatStage = (stage: string) => {
    const stageNames: Record<string, string> = {
      LEAD: 'Lead',
      QUALIFIED: 'Qualified',
      PROPOSAL: 'Proposal',
      NEGOTIATION: 'Negotiation',
      WON: 'Won',
      LOST: 'Lost',
      PROSPECTING: 'Prospecting',
      QUALIFICATION: 'Qualification',
      CLOSED_WON: 'Won',
      CLOSED_LOST: 'Lost',
    };
    return stageNames[stage] || stage;
  };

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text fontSize="sm">Failed to load opportunities: {error.message}</Text>
      </Alert>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {/* Search */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={textMuted} />
        </InputLeftElement>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search opportunities..."
          bg={formBg}
          color={textPrimary}
          borderColor={cardBorder}
          _placeholder={{ color: textMuted }}
        />
      </InputGroup>

      {/* Selected Summary */}
      {selectedOpportunities.length > 0 && (
        <Box p={3} bg={formBg} borderRadius="md" borderWidth="1px" borderColor={cardBorder}>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                Selected: {selectedOpportunities.length} opportunities
              </Text>
            </HStack>
            <HStack spacing={4} fontSize="sm">
              <HStack>
                <FiDollarSign color="#10B981" />
                <Text color={textSecondary}>
                  Total: <strong>${totalValue.toLocaleString()}</strong>
                </Text>
              </HStack>
              <HStack>
                <FiTrendingUp color="#F59E0B" />
                <Text color={textSecondary}>
                  Weighted: <strong>${Math.round(weightedValue).toLocaleString()}</strong>
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Opportunities List */}
      <Box
        maxH="300px"
        overflowY="auto"
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="md"
        p={2}
      >
        {loading ? (
          <VStack spacing={2}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="50px" />
            ))}
          </VStack>
        ) : filteredOpportunities.length === 0 ? (
          <Text color={textMuted} fontSize="sm" textAlign="center" py={4}>
            {searchTerm ? 'No opportunities match your search' : 'No opportunities available'}
          </Text>
        ) : (
          <VStack spacing={2} align="stretch">
            {filteredOpportunities.map((opportunity: any) => (
              <Box
                key={opportunity.id}
                p={3}
                borderWidth="1px"
                borderColor={cardBorder}
                borderRadius="md"
                bg={selectedOpportunities.includes(opportunity.id) ? `${formBg}` : 'transparent'}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  bg: formBg,
                  transform: 'translateX(2px)',
                }}
                onClick={() => handleToggleOpportunity(opportunity.id)}
              >
                <HStack spacing={3} justify="space-between">
                  <HStack flex="1" minW="0">
                    <Checkbox
                      isChecked={selectedOpportunities.includes(opportunity.id)}
                      onChange={() => handleToggleOpportunity(opportunity.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <VStack align="start" spacing={0} flex="1" minW="0">
                      <Text fontSize="sm" fontWeight="medium" color={textPrimary} noOfLines={1}>
                        {opportunity.title}
                      </Text>
                      <HStack spacing={2} fontSize="xs">
                        <Badge colorScheme={getStageColor(opportunity.stage)} fontSize="xs">
                          {formatStage(opportunity.stage)}
                        </Badge>
                        {opportunity.probability > 0 && (
                          <Text color={textMuted}>{opportunity.probability}% probability</Text>
                        )}
                        {opportunity.clientName && (
                          <Text color={textMuted}>• {opportunity.clientName}</Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                      ${opportunity.value?.toLocaleString() || '0'}
                    </Text>
                    {opportunity.expectedCloseDate && (
                      <Text fontSize="xs" color={textMuted}>
                        {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Helper Text */}
      <Text fontSize="xs" color={textMuted}>
        <strong>Tip:</strong> Link opportunities that contribute to this goal. The system will track
        their progress and calculate how many more opportunities you need to close.
      </Text>
    </VStack>
  );
};