import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'floating-navbar-state';
const DEBOUNCE_DELAY = 500;
const DEBUG = true; // Enable debug logging

interface NavbarState {
  isExpanded: boolean;
  activeCategory: string | null;
  expandedModules: string[];
}

const defaultState: NavbarState = {
  isExpanded: false,
  activeCategory: null,
  expandedModules: [],
};

const log = (message: string, data?: any) => {
  if (DEBUG) {
    // console.log(`🎯 [NavbarState] ${message}`, data || '');
  }
};

export const useNavbarState = (userId?: string) => {
  // Create a unique storage key per user (client) if userId is provided
  // This ensures each user has their own navbar preferences
  const storageKey = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;

  log('Hook initialized', { userId, storageKey });

  // Use refs to track if we're the source of changes
  const isLocalUpdate = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout>();

  // Load initial state from localStorage
  const loadState = (): NavbarState => {
    log('Loading state from localStorage', { storageKey });
    try {
      const stored = localStorage.getItem(storageKey);
      log('Raw stored value', stored);

      if (stored) {
        const parsed = JSON.parse(stored);
        log('Parsed stored state', parsed);

        // Return the full saved state including isExpanded
        const loadedState = {
          isExpanded: parsed.isExpanded || false,
          activeCategory: parsed.activeCategory || null,
          expandedModules: parsed.expandedModules || [],
        };
        log('Returning loaded state (preserving isExpanded)', loadedState);
        return loadedState;
      }
      log('No stored state found, using default');
    } catch (error) {
      console.error('Failed to load navbar state:', error);
    }
    return defaultState;
  };

  // Initialize state from localStorage
  const initialState = loadState();
  log('Initial state loaded', initialState);

  const [isExpanded, setIsExpanded] = useState<boolean>(initialState.isExpanded);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialState.activeCategory);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const modules = new Set(initialState.expandedModules);
    log('Initial expanded modules', Array.from(modules));
    return modules;
  });

  // Save state to localStorage (debounced)
  const saveState = useCallback(() => {
    log('saveState called', { isExpanded, activeCategory, expandedModules: Array.from(expandedModules) });

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      log('Cleared existing save timer');
    }

    saveTimerRef.current = setTimeout(() => {
      log('Executing save after debounce');
      try {
        isLocalUpdate.current = true;
        const state: NavbarState = {
          isExpanded,
          activeCategory,
          expandedModules: Array.from(expandedModules),
        };
        log('Saving state to localStorage', { storageKey, state });
        localStorage.setItem(storageKey, JSON.stringify(state));
        log('State saved successfully');

        // Verify save
        const saved = localStorage.getItem(storageKey);
        log('Verification - saved value', saved);
      } catch (error) {
        console.error('Failed to save navbar state:', error);
      } finally {
        // Reset the flag after a short delay
        setTimeout(() => {
          isLocalUpdate.current = false;
          log('Reset isLocalUpdate flag');
        }, 100);
      }
    }, DEBOUNCE_DELAY);
  }, [isExpanded, activeCategory, expandedModules, storageKey]);

  // Save state whenever it changes
  useEffect(() => {
    log('State changed, triggering save', {
      isExpanded,
      activeCategory,
      expandedModules: Array.from(expandedModules)
    });
    saveState();
  }, [isExpanded, activeCategory, expandedModules, saveState]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    log('Setting up storage event listener');

    const handleStorageChange = (e: StorageEvent) => {
      log('Storage event received', {
        key: e.key,
        newValue: e.newValue,
        oldValue: e.oldValue,
        isLocalUpdate: isLocalUpdate.current
      });

      // Ignore our own changes
      if (isLocalUpdate.current) {
        log('Ignoring our own storage change');
        return;
      }

      if (e.key === storageKey && e.newValue && e.oldValue !== e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          log('Syncing state from other tab', newState);

          // Sync all state including isExpanded for consistent experience
          setIsExpanded(newState.isExpanded);
          setActiveCategory(newState.activeCategory);
          setExpandedModules(new Set(newState.expandedModules || []));
          log('State synced successfully (including isExpanded)');
        } catch (error) {
          console.error('Failed to sync navbar state:', error);
        }
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      log('Cleaning up storage event listener');
      window.removeEventListener('storage', handleStorageChange);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [storageKey]);

  // Enhanced toggle function for modules
  const toggleModuleExpanded = useCallback((moduleId: string) => {
    log('toggleModuleExpanded called', { moduleId });

    setExpandedModules(prev => {
      const newExpanded = new Set(prev);
      const wasExpanded = newExpanded.has(moduleId);

      if (wasExpanded) {
        newExpanded.delete(moduleId);
        log('Module collapsed', { moduleId, expandedModules: Array.from(newExpanded) });
      } else {
        newExpanded.add(moduleId);
        log('Module expanded', { moduleId, expandedModules: Array.from(newExpanded) });
      }
      return newExpanded;
    });
  }, []);

  // Reset state (useful for logout)
  const resetState = useCallback(() => {
    log('Resetting navbar state');
    setIsExpanded(defaultState.isExpanded);
    setActiveCategory(defaultState.activeCategory);
    setExpandedModules(new Set(defaultState.expandedModules));
    localStorage.removeItem(storageKey);
    log('State reset and localStorage cleared', { storageKey });
  }, [storageKey]);

  return {
    isExpanded,
    setIsExpanded,
    activeCategory,
    setActiveCategory,
    expandedModules,
    setExpandedModules,
    toggleModuleExpanded,
    resetState,
  };
};