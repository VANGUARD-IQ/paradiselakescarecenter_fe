import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  Badge,
  Alert,
  AlertIcon,
  Button,
  Select,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useColorMode,
} from '@chakra-ui/react';
import { CheckIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { useMutation, gql } from '@apollo/client';
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor } from "../../brandConfig";

const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($opportunityId: String!, $paymentType: String!, $status: String!, $receivedDate: DateTime) {
    updatePaymentStatus(opportunityId: $opportunityId, paymentType: $paymentType, status: $status, receivedDate: $receivedDate) {
      id
      valuePaymentStatus
      valueReceivedDate
    }
  }
`;

const UPDATE_PAYOUT_STATUS = gql`
  mutation UpdatePayoutStatus($opportunityId: String!, $paymentType: String!, $clientId: String!, $status: String!, $paidOutDate: DateTime, $transactionId: String) {
    updatePayoutStatus(opportunityId: $opportunityId, paymentType: $paymentType, clientId: $clientId, status: $status, paidOutDate: $paidOutDate, transactionId: $transactionId) {
      id
    }
  }
`;

interface MemberSplit {
  clientId: string;
  clientName?: string;
  percentage: number;
  payoutDelayDays?: number;
  payoutDate?: Date | string;
  payoutNotes?: string;
  amount?: number;
  payoutStatus?: string;
  paidOutDate?: Date | string;
  transactionId?: string;
}

interface PaymentSplitsProps {
  opportunityId: string;
  paymentType: 'oneoff' | 'recurring' | 'schedule';
  paymentAmount: number;
  paymentLabel?: string;
  paymentStatus?: string;
  receivedDate?: Date | string;
  members: any[];
  currentSplits?: MemberSplit[];
  onSplitsUpdate: (splits: MemberSplit[]) => void;
  onPaymentStatusUpdate?: () => void;
}

const PaymentSplits: React.FC<PaymentSplitsProps> = ({
  opportunityId,
  paymentType,
  paymentAmount,
  paymentLabel,
  paymentStatus = 'PENDING',
  receivedDate,
  members,
  currentSplits = [],
  onSplitsUpdate,
  onPaymentStatusUpdate,
}) => {
  usePageTitle("Payment Splits");

  const toast = useToast();
  const { colorMode } = useColorMode();
  const [splits, setSplits] = useState<MemberSplit[]>([]);
  const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS);
  const [updatePayoutStatus] = useMutation(UPDATE_PAYOUT_STATUS);

  // Brand styling
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  useEffect(() => {
    // Initialize splits with current data or create default splits for all members
    if (currentSplits && currentSplits.length > 0) {
      // Use existing splits for this specific payment type
      setSplits(currentSplits.map(split => ({
        ...split,
        amount: (paymentAmount * (split.percentage || 0)) / 100,
      })));
    } else if (members.length > 0) {
      // Create new splits based on member defaults + unallocated
      const defaultSplits = [
        ...members.map((member) => ({
          clientId: member.clientId,
          clientName: member.clientName,
          percentage: 0, // Start with 0% - user must explicitly set
          payoutDelayDays: 7, // Default to 7 days, configurable per payment
          amount: 0,
        })),
        // Add unallocated entry
        {
          clientId: 'unallocated',
          clientName: 'Unallocated (Company)',
          percentage: 100, // Start with 100% unallocated
          payoutDelayDays: 0,
          amount: paymentAmount,
        }
      ];
      setSplits(defaultSplits);
    }
  }, [members, currentSplits, paymentAmount, paymentType]);

  const totalPercentage = splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  const handlePercentageChange = (index: number, value: number) => {
    const newSplits = [...splits];
    newSplits[index].percentage = value;
    newSplits[index].amount = (paymentAmount * value) / 100;

    // Auto-adjust unallocated percentage
    const unallocatedIndex = newSplits.findIndex(s => s.clientId === 'unallocated');
    if (unallocatedIndex !== -1 && index !== unallocatedIndex) {
      const allocatedTotal = newSplits.reduce((sum, split, idx) =>
        idx !== unallocatedIndex ? sum + (split.percentage || 0) : sum, 0
      );
      const remaining = Math.max(0, 100 - allocatedTotal);
      newSplits[unallocatedIndex].percentage = remaining;
      newSplits[unallocatedIndex].amount = (paymentAmount * remaining) / 100;
    }

    setSplits(newSplits);
  };

  const handlePayoutDelayChange = (index: number, value: number) => {
    const newSplits = [...splits];
    newSplits[index].payoutDelayDays = value;
    newSplits[index].payoutDate = undefined; // Clear date if setting delay
    setSplits(newSplits);
  };

  const handlePayoutDateChange = (index: number, value: string) => {
    const newSplits = [...splits];
    newSplits[index].payoutDate = value;
    newSplits[index].payoutDelayDays = undefined; // Clear delay if setting date
    setSplits(newSplits);
  };

  const handleNotesChange = (index: number, value: string) => {
    const newSplits = [...splits];
    newSplits[index].payoutNotes = value;
    setSplits(newSplits);
  };

  const autoDistribute = () => {
    if (splits.length === 0) return;

    // Distribute equally among actual members (not unallocated)
    const actualMembers = splits.filter(s => s.clientId !== 'unallocated');
    if (actualMembers.length === 0) return;

    const equalPercentage = 100 / actualMembers.length;
    const newSplits = splits.map((split) => ({
      ...split,
      percentage: split.clientId === 'unallocated' ? 0 : equalPercentage,
      amount: split.clientId === 'unallocated' ? 0 : (paymentAmount * equalPercentage) / 100,
    }));
    setSplits(newSplits);
  };

  const saveSplits = () => {
    if (!isValid) {
      toast({
        title: 'Invalid splits',
        description: 'Total percentage must equal 100%',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Filter splits to only include fields expected by the backend MemberSplitInput
    // Note: paidOutDate and transactionId are read-only fields from the backend
    // and should not be sent in mutations
    const splitsForBackend = splits.map(split => ({
      clientId: split.clientId,
      percentage: split.percentage,
      payoutDelayDays: split.payoutDelayDays,
      payoutDate: split.payoutDate,
      payoutNotes: split.payoutNotes,
      payoutStatus: split.payoutStatus,
      // Excluded fields: paidOutDate and transactionId are managed by the backend
    }));

    onSplitsUpdate(splitsForBackend);
    toast({
      title: `${getPaymentTypeLabel()} splits saved`,
      status: 'success',
      duration: 2000,
    });
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    try {
      const paymentTypeKey = paymentType === 'oneoff' ? 'oneoff' :
                            paymentType === 'recurring' ? 'recurring' :
                            `schedule-${paymentLabel}`;

      await updatePaymentStatus({
        variables: {
          opportunityId,
          paymentType: paymentTypeKey,
          status: newStatus,
          receivedDate: newStatus === 'RECEIVED' ? new Date() : null,
        },
      });

      toast({
        title: 'Payment status updated',
        status: 'success',
        duration: 3000,
      });

      onPaymentStatusUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error updating payment status',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePayoutStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const paymentTypeKey = paymentType === 'oneoff' ? 'oneoff' :
                            paymentType === 'recurring' ? 'recurring' :
                            `schedule-${paymentLabel}`;

      await updatePayoutStatus({
        variables: {
          opportunityId,
          paymentType: paymentTypeKey,
          clientId,
          status: newStatus,
          paidOutDate: newStatus === 'PAID' ? new Date() : null,
        },
      });

      toast({
        title: 'Payout status updated',
        status: 'success',
        duration: 3000,
      });

      onPaymentStatusUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error updating payout status',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'gray';
      case 'RECEIVED':
        return 'green';
      case 'DISTRIBUTED':
        return 'blue';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'gray';
      case 'SCHEDULED':
        return 'yellow';
      case 'PROCESSING':
        return 'orange';
      case 'PAID':
        return 'green';
      case 'FAILED':
        return 'red';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentTypeColor = () => {
    switch (paymentType) {
      case 'oneoff':
        return 'blue';
      case 'recurring':
        return 'green';
      case 'schedule':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getPaymentTypeLabel = () => {
    switch (paymentType) {
      case 'oneoff':
        return 'One-off Payment';
      case 'recurring':
        return 'Recurring Payment';
      case 'schedule':
        return paymentLabel || 'Scheduled Payment';
      default:
        return 'Payment';
    }
  };

  if (members.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>Add team members to configure payment splits</Text>
      </Alert>
    );
  }

  return (
    <Box bg={cardGradientBg} p={4} borderRadius="md" border="1px" borderColor={cardBorder}>
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack>
            <Badge colorScheme={getPaymentTypeColor()} fontSize="sm">
              {getPaymentTypeLabel()}
            </Badge>
            <Text fontWeight="bold" fontSize="lg">
              ${paymentAmount.toLocaleString()}
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
                colorScheme={getPaymentStatusColor(paymentStatus)}
                variant="outline"
              >
                Payment: {paymentStatus}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handlePaymentStatusChange('PENDING')}>
                  Mark as Pending
                </MenuItem>
                <MenuItem onClick={() => handlePaymentStatusChange('RECEIVED')}>
                  Mark as Received
                </MenuItem>
                <MenuItem onClick={() => handlePaymentStatusChange('DISTRIBUTED')}>
                  Mark as Distributed
                </MenuItem>
                <MenuItem onClick={() => handlePaymentStatusChange('CANCELLED')}>
                  Mark as Cancelled
                </MenuItem>
              </MenuList>
            </Menu>
            {receivedDate && (
              <Text fontSize="sm" color={textMuted}>
                Received: {format(new Date(receivedDate), 'MMM d, yyyy')}
              </Text>
            )}
          </HStack>
          <Button size="sm" variant="outline" onClick={autoDistribute}>
            Distribute Equally
          </Button>
        </Flex>

        <Alert
          status={isValid ? 'success' : 'warning'}
          size="sm"
          borderRadius="md"
        >
          <AlertIcon />
          <Text fontSize="sm">
            Total: {totalPercentage.toFixed(1)}%
            {!isValid && ` (${(100 - totalPercentage).toFixed(1)}% ${totalPercentage > 100 ? 'over' : 'remaining'})`}
          </Text>
        </Alert>

        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Member</Th>
              <Th isNumeric>Split %</Th>
              <Th isNumeric>Amount</Th>
              <Th>Payout Schedule</Th>
              <Th>Payout Status</Th>
              <Th>Notes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {splits.map((split, index) => {
              const member = members.find(m => m.clientId === split.clientId);
              const displayName = split.clientName || member?.clientName || 'Unknown Member';
              const isUnallocated = split.clientId === 'unallocated';
              return (
              <Tr key={split.clientId} bg={isUnallocated ? getColor('background.overlay', colorMode) : undefined}>
                <Td>
                  <Text fontWeight="medium" color={isUnallocated ? textMuted : textPrimary}>
                    {displayName}
                  </Text>
                </Td>
                <Td isNumeric>
                  <NumberInput
                    value={split.percentage}
                    onChange={(_, value) => handlePercentageChange(index, value)}
                    min={0}
                    max={100}
                    precision={2}
                    size="sm"
                    width="100px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
                <Td isNumeric>
                  <Text fontWeight="bold" color="green.600">
                    ${(split.amount || 0).toLocaleString()}
                  </Text>
                </Td>
                <Td>
                  <VStack spacing={1} align="start">
                    <Select
                      size="sm"
                      value={split.payoutDate ? 'date' : 'delay'}
                      onChange={(e) => {
                        if (e.target.value === 'delay') {
                          handlePayoutDelayChange(index, split.payoutDelayDays || 7);
                        }
                      }}
                    >
                      <option value="delay">Days after payment</option>
                      <option value="date">Specific date</option>
                    </Select>
                    {split.payoutDate ? (
                      <Input
                        type="date"
                        size="sm"
                        value={split.payoutDate as string}
                        onChange={(e) => handlePayoutDateChange(index, e.target.value)}
                      />
                    ) : (
                      <HStack>
                        <NumberInput
                          value={split.payoutDelayDays || 7}
                          onChange={(_, value) => handlePayoutDelayChange(index, value)}
                          min={0}
                          max={365}
                          size="sm"
                          width="80px"
                        >
                          <NumberInputField />
                        </NumberInput>
                        <Text fontSize="sm" color={textMuted}>days</Text>
                      </HStack>
                    )}
                  </VStack>
                </Td>
                <Td>
                  {!isUnallocated && (
                    <Menu>
                      <MenuButton
                        as={Button}
                        size="xs"
                        colorScheme={getPayoutStatusColor(split.payoutStatus || 'PENDING')}
                        variant="outline"
                        isDisabled={paymentStatus !== 'RECEIVED'}
                      >
                        {split.payoutStatus || 'PENDING'}
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handlePayoutStatusChange(split.clientId, 'PENDING')}>
                          Pending
                        </MenuItem>
                        <MenuItem onClick={() => handlePayoutStatusChange(split.clientId, 'SCHEDULED')}>
                          Scheduled
                        </MenuItem>
                        <MenuItem onClick={() => handlePayoutStatusChange(split.clientId, 'PROCESSING')}>
                          Processing
                        </MenuItem>
                        <MenuItem onClick={() => handlePayoutStatusChange(split.clientId, 'PAID')}>
                          Paid
                        </MenuItem>
                        <MenuItem onClick={() => handlePayoutStatusChange(split.clientId, 'FAILED')}>
                          Failed
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </Td>
                <Td>
                  <Input
                    size="sm"
                    placeholder="Notes"
                    value={split.payoutNotes || ''}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                  />
                </Td>
              </Tr>
              );
            })}
          </Tbody>
        </Table>

        <HStack justify="flex-end">
          <Button
            colorScheme="blue"
            size="sm"
            leftIcon={<CheckIcon />}
            onClick={saveSplits}
            isDisabled={!isValid}
          >
            Save Splits
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PaymentSplits;