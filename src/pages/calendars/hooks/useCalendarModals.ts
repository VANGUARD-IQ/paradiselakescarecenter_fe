import { useState } from 'react';

// ============================================================================
// HOOK: useCalendarModals
// ============================================================================

interface UseCalendarModalsReturn {
  // Event modals
  selectedEvent: any;
  setSelectedEvent: React.Dispatch<React.SetStateAction<any>>;
  isEventModalOpen: boolean;
  setIsEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Create event modal
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newEventDate: string;
  setNewEventDate: React.Dispatch<React.SetStateAction<string>>;
  selectedTimeRange: { start: string; end: string; isAllDay?: boolean } | null;
  setSelectedTimeRange: React.Dispatch<React.SetStateAction<{ start: string; end: string; isAllDay?: boolean } | null>>;

  // iCal invite modal
  isICalModalOpen: boolean;
  setIsICalModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedICalInvite: any;
  setSelectedICalInvite: React.Dispatch<React.SetStateAction<any>>;

  // Goals modal
  isGoalsModalOpen: boolean;
  setIsGoalsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // External calendar modal
  isExternalCalendarModalOpen: boolean;
  setIsExternalCalendarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Helper functions
  openCreateModal: (date?: string, timeRange?: { start: string; end: string; isAllDay?: boolean }) => void;
  openEditModal: (event: any) => void;
  openICalModal: (eventData: any) => void;
  closeAllModals: () => void;
}

/**
 * Custom hook to manage calendar modal state
 *
 * Features:
 * - Event create/edit modal state
 * - iCal invite modal state
 * - Goals modal state
 * - External calendar modal state
 * - Helper functions to open/close modals
 */
export const useCalendarModals = (): UseCalendarModalsReturn => {
  // Event modals
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Create event modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string; isAllDay?: boolean } | null>(null);

  // iCal invite modal
  const [isICalModalOpen, setIsICalModalOpen] = useState(false);
  const [selectedICalInvite, setSelectedICalInvite] = useState<any>(null);

  // Goals modal
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  // External calendar modal
  const [isExternalCalendarModalOpen, setIsExternalCalendarModalOpen] = useState(false);

  // Helper functions
  const openCreateModal = (date?: string, timeRange?: { start: string; end: string; isAllDay?: boolean }) => {
    if (date) {
      setNewEventDate(date);
      setSelectedTimeRange(null);
    } else if (timeRange) {
      setSelectedTimeRange(timeRange);
      setNewEventDate('');
    }
    setIsCreateModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const openICalModal = (eventData: any) => {
    setSelectedICalInvite(eventData);
    setIsICalModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEventModalOpen(false);
    setIsICalModalOpen(false);
    setIsGoalsModalOpen(false);
    setIsExternalCalendarModalOpen(false);
    setSelectedEvent(null);
    setNewEventDate('');
    setSelectedTimeRange(null);
    setSelectedICalInvite(null);
  };

  return {
    // Event modals
    selectedEvent,
    setSelectedEvent,
    isEventModalOpen,
    setIsEventModalOpen,

    // Create event modal
    isCreateModalOpen,
    setIsCreateModalOpen,
    newEventDate,
    setNewEventDate,
    selectedTimeRange,
    setSelectedTimeRange,

    // iCal invite modal
    isICalModalOpen,
    setIsICalModalOpen,
    selectedICalInvite,
    setSelectedICalInvite,

    // Goals modal
    isGoalsModalOpen,
    setIsGoalsModalOpen,

    // External calendar modal
    isExternalCalendarModalOpen,
    setIsExternalCalendarModalOpen,

    // Helper functions
    openCreateModal,
    openEditModal,
    openICalModal,
    closeAllModals,
  };
};
