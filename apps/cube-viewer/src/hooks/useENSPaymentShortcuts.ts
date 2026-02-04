import { useState, useCallback, useEffect } from 'react';
import type { ENSShortcut } from '../components/ENSPaymentShortcuts';

const STORAGE_KEY = 'ens_payment_shortcuts';

export const useENSPaymentShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<ENSShortcut[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load shortcuts from localStorage
  useEffect(() => {
    const loadShortcuts = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ENSShortcut[];
          setShortcuts(parsed);
        }
      } catch (error) {
        console.error('Failed to load shortcuts:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadShortcuts();
  }, []);

  // Persist shortcuts to localStorage
  const saveShortcuts = useCallback((newShortcuts: ENSShortcut[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
      setShortcuts(newShortcuts);
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
    }
  }, []);

  // Add new shortcut
  const addShortcut = useCallback(
    (shortcut: Omit<ENSShortcut, 'id' | 'createdAt' | 'useCount'>) => {
      const newShortcut: ENSShortcut = {
        ...shortcut,
        id: `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        useCount: 0,
      };

      saveShortcuts([...shortcuts, newShortcut]);
      return newShortcut;
    },
    [shortcuts, saveShortcuts]
  );

  // Remove shortcut
  const removeShortcut = useCallback(
    (id: string) => {
      const filtered = shortcuts.filter((s) => s.id !== id);
      saveShortcuts(filtered);
    },
    [shortcuts, saveShortcuts]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = shortcuts.map((s) =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      );
      saveShortcuts(updated);
    },
    [shortcuts, saveShortcuts]
  );

  // Update shortcut usage
  const updateUsage = useCallback(
    (id: string) => {
      const updated = shortcuts.map((s) =>
        s.id === id
          ? {
              ...s,
              useCount: s.useCount + 1,
              lastUsed: Date.now(),
            }
          : s
      );
      saveShortcuts(updated);
    },
    [shortcuts, saveShortcuts]
  );

  // Update shortcut details
  const updateShortcut = useCallback(
    (id: string, updates: Partial<ENSShortcut>) => {
      const updated = shortcuts.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      saveShortcuts(updated);
    },
    [shortcuts, saveShortcuts]
  );

  // Clear all shortcuts
  const clearAll = useCallback(() => {
    saveShortcuts([]);
  }, [saveShortcuts]);

  // Get shortcut by domain
  const getByDomain = useCallback(
    (domain: string) => {
      return shortcuts.find((s) => s.domain.toLowerCase() === domain.toLowerCase());
    },
    [shortcuts]
  );

  // Get favorites
  const getFavorites = useCallback(() => {
    return shortcuts.filter((s) => s.isFavorite);
  }, [shortcuts]);

  // Get recent shortcuts
  const getRecent = useCallback(
    (limit = 5) => {
      return shortcuts
        .sort((a, b) => (b.lastUsed || b.createdAt) - (a.lastUsed || a.createdAt))
        .slice(0, limit);
    },
    [shortcuts]
  );

  // Get frequent shortcuts
  const getFrequent = useCallback(
    (limit = 5) => {
      return shortcuts.sort((a, b) => b.useCount - a.useCount).slice(0, limit);
    },
    [shortcuts]
  );

  return {
    shortcuts,
    isLoaded,
    addShortcut,
    removeShortcut,
    toggleFavorite,
    updateUsage,
    updateShortcut,
    clearAll,
    getByDomain,
    getFavorites,
    getRecent,
    getFrequent,
  };
};

export default useENSPaymentShortcuts;
