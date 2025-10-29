import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Textarea,
  Button,
  useToast,
} from '@chakra-ui/react';

interface EventNotesTabProps {
  eventNotes?: string;
  onSave: (notes: string) => void;
}

export const EventNotesTab: React.FC<EventNotesTabProps> = ({ eventNotes = '', onSave }) => {
  const [notes, setNotes] = useState(eventNotes);
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setNotes(eventNotes || '');
    setHasChanges(false);
  }, [eventNotes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== eventNotes);
  };

  const handleSave = () => {
    onSave(notes);
    setHasChanges(false);
    toast({
      title: 'Notes saved',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <VStack align="stretch" spacing={4} height="100%">
      <Text fontSize="lg" fontWeight="bold">
        Event Notes
      </Text>

      <Textarea
        placeholder="Add notes for this event... You can use this space to document preparation steps, important details, follow-up actions, or any other information related to this event."
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        minHeight="300px"
        resize="vertical"
      />

      <Button
        colorScheme="blue"
        onClick={handleSave}
        isDisabled={!hasChanges}
        alignSelf="flex-end"
      >
        Save Notes
      </Button>

      <Box fontSize="sm" color="gray.600" mt={2}>
        <Text>💡 Tip: Use notes to:</Text>
        <Text ml={4}>• Document meeting agendas and outcomes</Text>
        <Text ml={4}>• Track preparation steps for the event</Text>
        <Text ml={4}>• Record important decisions or action items</Text>
        <Text ml={4}>• Store reference links or resources</Text>
      </Box>
    </VStack>
  );
};
