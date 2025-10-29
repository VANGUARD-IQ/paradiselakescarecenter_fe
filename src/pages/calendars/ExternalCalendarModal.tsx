import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  Text,
  HStack,
  Box,
  Link,
  FormHelperText,
  useColorMode,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { getColor } from '../../brandConfig';

const ADD_EXTERNAL_CALENDAR = gql`
  mutation AddExternalCalendar($input: BusinessCalendarInput!) {
    createBusinessCalendar(input: $input) {
      id
      name
      iCalUrl
      color
      type
    }
  }
`;

interface ExternalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CALENDAR_COLORS = [
  { value: '#4285F4', label: 'Blue' },
  { value: '#DB4437', label: 'Red' },
  { value: '#F4B400', label: 'Yellow' },
  { value: '#0F9D58', label: 'Green' },
  { value: '#AB47BC', label: 'Purple' },
  { value: '#00ACC1', label: 'Cyan' },
  { value: '#FF7043', label: 'Orange' },
  { value: '#9E9E9E', label: 'Gray' },
];

const ExternalCalendarModal: React.FC<ExternalCalendarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const cardBg = getColor(colorMode === 'light' ? "background.card" : "background.darkSurface", colorMode);
  const formBg = getColor(colorMode === 'light' ? "background.light" : "background.taskCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const [name, setName] = useState('');
  const [icsUrl, setIcsUrl] = useState('');
  const [color, setColor] = useState('#4285F4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addExternalCalendar] = useMutation(ADD_EXTERNAL_CALENDAR, {
    onCompleted: () => {
      toast({
        title: 'External calendar added',
        description: 'The calendar has been added successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error adding calendar',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setIsSubmitting(false);
    },
  });

  const handleClose = () => {
    setName('');
    setIcsUrl('');
    setColor('#4285F4');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name || !icsUrl) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a name and calendar URL',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Basic validation for ICS URL
    if (!icsUrl.includes('.ics') && !icsUrl.includes('calendar')) {
      toast({
        title: 'Invalid URL',
        description: 'Please provide a valid calendar URL (ICS format)',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    await addExternalCalendar({
      variables: {
        input: {
          name,
          type: 'SHARED_EXTERNAL',
          iCalUrl: icsUrl,
          color,
          isPublic: true,
          visibility: 'SHARED',
          sharedFromName: name,
        },
      },
      context: {
        headers: {
          'x-tenant-id': localStorage.getItem('tenantId') || '',
        },
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg}>
        <ModalHeader>Add External Calendar</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="full" p={4} bg={formBg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
              <Text fontSize="sm" color={textSecondary}>
                Add a published calendar from Google Calendar, Outlook, or any other service
                that provides an ICS/iCal URL.
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Calendar Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Calendar, Holiday Calendar"
                bg={formBg}
                borderColor={cardBorder}
                color={textPrimary}
                _placeholder={{ color: textMuted }}
              />
              <FormHelperText color={textMuted}>A friendly name to identify this calendar</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textPrimary}>Calendar URL (ICS)</FormLabel>
              <Input
                value={icsUrl}
                onChange={(e) => setIcsUrl(e.target.value)}
                placeholder="https://calendar.example.com/calendar.ics"
                bg={formBg}
                borderColor={cardBorder}
                color={textPrimary}
                _placeholder={{ color: textMuted }}
              />
              <FormHelperText color={textMuted}>
                The ICS/iCal URL from the calendar provider
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel color={textPrimary}>Calendar Color</FormLabel>
              <HStack spacing={2}>
                <Select value={color} onChange={(e) => setColor(e.target.value)} bg={formBg} borderColor={cardBorder} color={textPrimary}>
                  {CALENDAR_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Box
                  w="40px"
                  h="40px"
                  bg={color}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={cardBorder}
                />
              </HStack>
            </FormControl>

            <Box w="full" p={3} bg={formBg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
              <Text fontSize="xs" color={textSecondary} mb={2}>
                <strong>How to get calendar URLs:</strong>
              </Text>
              <VStack align="start" spacing={1} fontSize="xs" color={textMuted}>
                <HStack>
                  <Text>• Google Calendar:</Text>
                  <Link
                    href="https://support.google.com/calendar/answer/37103"
                    isExternal
                    color={textSecondary}
                  >
                    Settings → Integrate → Secret address in iCal format
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
                <HStack>
                  <Text>• Outlook:</Text>
                  <Link
                    href="https://support.microsoft.com/en-us/office/share-your-calendar-in-outlook-on-the-web-7ecef8ae-139c-40d9-bae2-a23977ee58d5"
                    isExternal
                    color={textSecondary}
                  >
                    Calendar → Share → Publish calendar → ICS link
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Adding..."
          >
            Add Calendar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExternalCalendarModal;