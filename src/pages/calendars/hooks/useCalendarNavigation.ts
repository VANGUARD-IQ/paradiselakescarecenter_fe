// ============================================================================
// HOOK: useCalendarNavigation
// ============================================================================

interface UseCalendarNavigationParams {
  currentView: string;
  calendarRef: React.RefObject<any>;
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: string) => void;
  updateUrlParams: (params: any) => void;
  is24HourView: boolean;
}

interface UseCalendarNavigationReturn {
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  handleViewChange: (view: string) => void;
}

/**
 * Custom hook to manage calendar navigation and view controls
 *
 * Features:
 * - Previous/Next navigation with scroll position preservation
 * - Today button with auto-scroll to current time
 * - View switching (month/week/day)
 * - URL parameter updates for navigation state
 */
export const useCalendarNavigation = ({
  currentView,
  calendarRef,
  setCurrentDate,
  setCurrentView,
  updateUrlParams,
  is24HourView,
}: UseCalendarNavigationParams): UseCalendarNavigationReturn => {

  const handlePrevious = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Capture current scroll position in week/day view
      let scrollTime: string | null = null;
      if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
        const scrollContainer = document.querySelector('.fc-scroller-liquid-absolute');
        if (scrollContainer) {
          const scrollTop = scrollContainer.scrollTop;
          const hoursFromTop = Math.floor(scrollTop / 60);
          const minutesFromTop = Math.floor((scrollTop % 60) * 60 / 60);
          scrollTime = `${String(hoursFromTop).padStart(2, '0')}:${String(minutesFromTop).padStart(2, '0')}:00`;
        }
      }

      calendarApi.prev();
      // Update current date based on the view
      const newDate = calendarApi.getDate();
      setCurrentDate(newDate);
      // Update URL with new date
      updateUrlParams({ date: newDate.toISOString().split('T')[0] });

      // Restore scroll position after navigation
      if (scrollTime && (currentView === 'timeGridWeek' || currentView === 'timeGridDay')) {
        setTimeout(() => {
          calendarApi.scrollToTime(scrollTime!);
        }, 100);
      }
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Capture current scroll position in week/day view
      let scrollTime: string | null = null;
      if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
        const scrollContainer = document.querySelector('.fc-scroller-liquid-absolute');
        if (scrollContainer) {
          const scrollTop = scrollContainer.scrollTop;
          const hoursFromTop = Math.floor(scrollTop / 60);
          const minutesFromTop = Math.floor((scrollTop % 60) * 60 / 60);
          scrollTime = `${String(hoursFromTop).padStart(2, '0')}:${String(minutesFromTop).padStart(2, '0')}:00`;
        }
      }

      calendarApi.next();
      // Update current date based on the view
      const newDate = calendarApi.getDate();
      setCurrentDate(newDate);
      // Update URL with new date
      updateUrlParams({ date: newDate.toISOString().split('T')[0] });

      // Restore scroll position after navigation
      if (scrollTime && (currentView === 'timeGridWeek' || currentView === 'timeGridDay')) {
        setTimeout(() => {
          calendarApi.scrollToTime(scrollTime!);
        }, 100);
      }
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      const today = new Date();
      setCurrentDate(today);
      // Update URL with today's date
      updateUrlParams({ date: today.toISOString().split('T')[0] });

      // If in week or day view, scroll to current time
      if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
        setTimeout(() => {
          // Calculate time offset to position current time at ~40% from top
          const scrollTime = new Date(today.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before current time
          calendarApi.scrollToTime(scrollTime.toTimeString().slice(0, 8));
        }, 200);
      }
    }
  };

  const handleViewChange = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Always go to today's date when switching views
      const today = new Date();
      calendarApi.gotoDate(today);
      calendarApi.changeView(view);
      setCurrentView(view);
      setCurrentDate(today);

      // Update URL with today's date and new view
      updateUrlParams({
        view,
        date: today.toISOString().split('T')[0],
        hours: is24HourView ? '24' : 'business'
      });
    }
  };

  return {
    handlePrevious,
    handleNext,
    handleToday,
    handleViewChange,
  };
};
