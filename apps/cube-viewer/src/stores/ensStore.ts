import { create } from 'zustand';

export interface ENSResolution {
  domain: string;
  address: string;
  avatar?: string;
  verified: boolean;
  resolvedAt: number; // timestamp
}

interface ENSStore {
  // Cache: domain -> resolved address
  resolutionCache: Map<string, ENSResolution>;
  
  // Track in-progress resolutions to prevent duplicates
  resolutionInProgress: Set<string>;
  
  // Last error message
  ensError: string | null;
  
  // Cache TTL in milliseconds (1 hour)
  CACHE_TTL: number;
  
  // Methods
  getCachedResolution: (domain: string) => ENSResolution | null;
  setCachedResolution: (domain: string, resolution: ENSResolution) => void;
  clearCache: () => void;
  invalidateDomain: (domain: string) => void;
  isResolutionInProgress: (domain: string) => boolean;
  setResolutionInProgress: (domain: string, inProgress: boolean) => void;
  setError: (error: string | null) => void;
  getError: () => string | null;
}

export const useENSStore = create<ENSStore>((set, get) => ({
  resolutionCache: new Map(),
  resolutionInProgress: new Set(),
  ensError: null,
  CACHE_TTL: 3600000, // 1 hour in milliseconds
  
  getCachedResolution: (domain: string) => {
    const state = get();
    const cached = state.resolutionCache.get(domain.toLowerCase());
    
    if (!cached) return null;
    
    // Check if cache has expired
    const age = Date.now() - cached.resolvedAt;
    if (age > state.CACHE_TTL) {
      state.invalidateDomain(domain);
      return null;
    }
    
    return cached;
  },
  
  setCachedResolution: (domain: string, resolution: ENSResolution) => {
    set((state) => {
      const newCache = new Map(state.resolutionCache);
      newCache.set(domain.toLowerCase(), {
        ...resolution,
        resolvedAt: Date.now(),
      });
      return { resolutionCache: newCache };
    });
  },
  
  clearCache: () => {
    set({ resolutionCache: new Map() });
  },
  
  invalidateDomain: (domain: string) => {
    set((state) => {
      const newCache = new Map(state.resolutionCache);
      newCache.delete(domain.toLowerCase());
      return { resolutionCache: newCache };
    });
  },
  
  isResolutionInProgress: (domain: string) => {
    return get().resolutionInProgress.has(domain.toLowerCase());
  },
  
  setResolutionInProgress: (domain: string, inProgress: boolean) => {
    set((state) => {
      const newInProgress = new Set(state.resolutionInProgress);
      if (inProgress) {
        newInProgress.add(domain.toLowerCase());
      } else {
        newInProgress.delete(domain.toLowerCase());
      }
      return { resolutionInProgress: newInProgress };
    });
  },
  
  setError: (error: string | null) => {
    set({ ensError: error });
  },
  
  getError: () => {
    return get().ensError;
  },
}));
