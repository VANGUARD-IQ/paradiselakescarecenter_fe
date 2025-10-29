import { useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

// ============================================================================
// LOCALSTORAGE SCROLL POSITION UTILITIES
// ============================================================================
const SCROLL_STORAGE_KEY = 'calendar-scroll-position';

interface ScrollPosition {
  calendarId: string;
  view: string;
  scrollTime: string; // HH:MM:SS format
  timestamp: number;
}

/**
 * Save scroll position to localStorage
 */
const saveScrollPosition = (calendarId: string, view: string, scrollTime: string) => {
  try {
    const data: ScrollPosition = {
      calendarId,
      view,
      scrollTime,
      timestamp: Date.now(),
    };
    localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Saved scroll position:', data);
  } catch (error) {
    console.error('Failed to save scroll position:', error);
  }
};

/**
 * Load scroll position from localStorage
 * Only returns position if it's for the same calendar, view, and less than 5 minutes old
 */
const loadScrollPosition = (calendarId: string, view: string): string | null => {
  try {
    const stored = localStorage.getItem(SCROLL_STORAGE_KEY);
    if (!stored) return null;

    const data: ScrollPosition = JSON.parse(stored);

    // Only use if:
    // 1. Same calendar
    // 2. Same view (week/day)
    // 3. Less than 5 minutes old
    const fiveMinutes = 5 * 60 * 1000;
    if (
      data.calendarId === calendarId &&
      data.view === view &&
      Date.now() - data.timestamp < fiveMinutes
    ) {
      console.log('📂 Loaded scroll position:', data);
      return data.scrollTime;
    }

    return null;
  } catch (error) {
    console.error('Failed to load scroll position:', error);
    return null;
  }
};

/**
 * Get current scroll time from window or FullCalendar container
 */
const getCurrentScrollTime = (): string | null => {
  try {
    // Find the red "now" indicator line
    const nowIndicator = document.querySelector('.fc-timegrid-now-indicator-line') as HTMLElement;
    if (!nowIndicator) {
      console.log('⚠️ No "now" indicator found for scroll time calculation');
      return null;
    }

    // Get scroll container
    const scrollContainer = document.querySelector('.fc-scroller') as HTMLElement;
    if (!scrollContainer) {
      console.log('⚠️ No scroll container found');
      return null;
    }

    const scrollTop = scrollContainer.scrollTop || window.scrollY;
    const slotHeight = 48; // Approximate pixels per hour in FullCalendar
    const minutes = Math.floor((scrollTop / slotHeight) * 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const scrollTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    console.log(`📏 Current scroll time calculated: ${scrollTime}`);
    return scrollTime;
  } catch (error) {
    console.error('Failed to get current scroll time:', error);
    return null;
  }
};

// ============================================================================
// HOOK: useCalendarScroll
// ============================================================================

interface UseCalendarScrollParams {
  calendarId: string | undefined;
  currentView: string;
  isPreservingView: boolean;
  calendarRef: React.RefObject<any>;
}

interface UseCalendarScrollReturn {
  isManualScrollRef: React.MutableRefObject<boolean>;
  handleScrollToNow: () => void;
}

/**
 * Custom hook to manage calendar scroll behavior
 *
 * Features:
 * - Auto-scroll to current time on view load (with localStorage restoration)
 * - Manual "Scroll to Now" function
 * - Preserves scroll position after event save/edit
 * - Saves/loads scroll position from localStorage
 */
export const useCalendarScroll = ({
  calendarId,
  currentView,
  isPreservingView,
  calendarRef,
}: UseCalendarScrollParams): UseCalendarScrollReturn => {
  const toast = useToast();
  const isManualScrollRef = useRef(false);

  // ============================================================================
  // AUTO-SCROLL EFFECT
  // ============================================================================
  // This effect runs when:
  // - When switching to Week or Day view (via buttons)
  // - When pressing Today button
  // - When the component first loads in week/day view
  //
  // WHEN IT DOESN'T RUN (IMPORTANT):
  // - After creating a new event (isPreservingView = true)
  // - After editing an existing event (isPreservingView = true)
  // - During month view (only runs for timeGrid views)
  // ============================================================================
  useEffect(() => {
    // Skip auto-scroll if we're preserving the view (after save/edit) or if user manually scrolled
    if (isPreservingView || isManualScrollRef.current) {
      console.log('🚫 Skipping auto-scroll - isPreservingView:', isPreservingView, 'isManualScroll:', isManualScrollRef.current);
      return;
    }

    if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi && calendarId) {
        // Use requestAnimationFrame to ensure the view has rendered
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Try to load saved scroll position from localStorage first
            const savedScrollTime = loadScrollPosition(calendarId, currentView);

            let scrollTime: string;
            if (savedScrollTime) {
              console.log('📂 Restoring saved scroll position:', savedScrollTime);
              scrollTime = savedScrollTime;
            } else {
              // Default: scroll to 2 hours before current time
              const now = new Date();
              const defaultTime = new Date(now.getTime() - (2 * 60 * 60 * 1000));
              scrollTime = defaultTime.toTimeString().slice(0, 8);
              console.log('📜 Auto-scrolling to default time (2hrs before now):', scrollTime);
            }

            calendarApi.scrollToTime(scrollTime);
          }, 500); // Increased delay to ensure view is fully rendered
        });
      }
    }
  }, [currentView, isPreservingView, calendarId, calendarRef]);

  // ============================================================================
  // MANUAL SCROLL TO NOW FUNCTION
  // ============================================================================
  const handleScrollToNow = () => {
    console.log('🕐 Scroll to Now button clicked');
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) {
      console.log('❌ No calendar API available');
      return;
    }

    const now = new Date();

    // Only works in week/day views
    if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
      // Set ref flag to prevent auto-scroll from interfering (refs update synchronously)
      isManualScrollRef.current = true;

      // Scroll to CURRENT time (not 2 hours before - that's for auto-scroll)
      const scrollTimeStr = now.toTimeString().slice(0, 8);

      console.log('📍 Manual scroll to CURRENT time:', scrollTimeStr);

      // Wait for calendar to be fully rendered, then scroll
      setTimeout(() => {
        // Find the ACTUAL scrollable container with visible height (clientHeight > 0)
        const allScrollers = document.querySelectorAll('[class*="fc-scroller"]');
        console.log('🔍 Found FullCalendar scroller elements:', allScrollers.length);

        let scrollContainer: HTMLElement | null = null;

        // Find the one that's actually visible and scrollable
        allScrollers.forEach((el) => {
          const htmlEl = el as HTMLElement;
          console.log(`🔎 Checking: ${htmlEl.className}, scrollHeight: ${htmlEl.scrollHeight}px, clientHeight: ${htmlEl.clientHeight}px, scrollTop: ${htmlEl.scrollTop}px`);

          // Must have visible height AND scrollable content
          if (htmlEl.clientHeight > 0 && htmlEl.scrollHeight > htmlEl.clientHeight) {
            console.log(`✅ Found VISIBLE scrollable container: ${htmlEl.className}`);
            if (!scrollContainer) {
              scrollContainer = htmlEl;
            }
          }
        });

        if (!scrollContainer) {
          console.error('❌ No visible scrollable container found! Trying window scroll as fallback...');

          // Fallback: Try scrolling the window to show the current time indicator (red line)
          // Find the red "now" indicator line
          const nowIndicator = document.querySelector('.fc-timegrid-now-indicator-line') as HTMLElement;
          if (nowIndicator) {
            const indicatorTop = nowIndicator.getBoundingClientRect().top + window.scrollY;
            const viewportHeight = window.innerHeight;
            // Scroll so the red line is 50% down the page (middle of viewport)
            const targetScroll = indicatorTop - (viewportHeight * 0.5);

            console.log(`🔴 Found now indicator at ${indicatorTop}px, scrolling to ${targetScroll}px (50% down)`);

            window.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
          } else {
            // Fallback calculation if red line not found
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const totalMinutes = hours * 60 + minutes;
            const scrollTop = (totalMinutes / 60) * 48;

            console.log('⚠️ Red line not found, using calculated scroll');
            window.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          }

          // Save scroll position to localStorage
          if (calendarId) {
            saveScrollPosition(calendarId, currentView, scrollTimeStr);
          }

          toast({
            title: '🕐 Scrolled to current time',
            description: `Positioned at ${scrollTimeStr}`,
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
          return;
        }

        // TypeScript type assertion after null check
        const container = scrollContainer as HTMLElement;

        console.log(`📏 BEFORE scroll - scrollTop: ${container.scrollTop}px, scrollHeight: ${container.scrollHeight}px, clientHeight: ${container.clientHeight}px`);

        // Find the red "now" indicator line to position it correctly
        const nowIndicator = document.querySelector('.fc-timegrid-now-indicator-line') as HTMLElement;
        if (nowIndicator) {
          // Get the position of the red line relative to the scroll container
          const indicatorTop = nowIndicator.offsetTop;
          const containerHeight = container.clientHeight;
          // Scroll so the red line is 50% down the page (middle of viewport)
          const targetScroll = indicatorTop - (containerHeight * 0.5);

          console.log(`🔴 Found now indicator at ${indicatorTop}px, scrolling container to ${targetScroll}px (50% down)`);

          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        } else {
          // Fallback: Use FullCalendar's API
          console.log('⚠️ Red line not found, using scrollToTime API');
          calendarApi.scrollToTime(scrollTimeStr);
        }

        // Check AFTER setting
        setTimeout(() => {
          console.log(`📏 AFTER scroll - scrollTop: ${container.scrollTop}px`);

          // Save scroll position to localStorage
          if (calendarId) {
            saveScrollPosition(calendarId, currentView, scrollTimeStr);
          }
        }, 100);

        // Reset the ref flag after 3 seconds
        setTimeout(() => {
          isManualScrollRef.current = false;
          console.log('🔓 Manual scroll lock released');
        }, 3000);

        toast({
          title: '🕐 Scrolled to current time',
          description: `Positioned at ${scrollTimeStr}`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }, 600);
    } else {
      toast({
        title: 'Scroll to now only works in Week or Day view',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    isManualScrollRef,
    handleScrollToNow,
  };
};
