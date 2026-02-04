import { useCallback } from 'react';
import { useENSStore } from '../stores/ensStore';
import useENSPaymentShortcuts from './useENSPaymentShortcuts';
import type { ENSShortcut } from '../components/ENSPaymentShortcuts';

export interface ARPaymentAgent {
  id: string;
  agent_name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  ens_domain?: string;
  ens_verified?: boolean;
  ens_payment_enabled?: boolean;
  hasQuickPayment?: boolean;
}

/**
 * Hook to integrate AR/GPS display with ENS payment shortcuts
 * Provides methods to:
 * - Quick-start payment for nearby agents
 * - Display ENS verification status in AR
 * - Track payment history from AR interactions
 */
export const useARENSPayments = () => {
  const { shortcuts, getByDomain, updateUsage, addShortcut } =
    useENSPaymentShortcuts();
  const { getCachedResolution, isResolutionInProgress } = useENSStore();

  /**
   * Check if agent has a saved quick payment shortcut
   */
  const hasQuickPayment = useCallback(
    (ensDomain?: string) => {
      if (!ensDomain) return false;
      return !!getByDomain(ensDomain);
    },
    [getByDomain]
  );

  /**
   * Get quick payment shortcut for agent
   */
  const getQuickPayment = useCallback(
    (ensDomain?: string) => {
      if (!ensDomain) return null;
      return getByDomain(ensDomain);
    },
    [getByDomain]
  );

  /**
   * Execute quick payment for AR-selected agent
   */
  const executeQuickPayment = useCallback(
    (shortcut: ENSShortcut) => {
      // Update usage statistics
      updateUsage(shortcut.id);

      // Return payment details for immediate processing
      return {
        domain: shortcut.domain,
        amount: shortcut.amount,
        chain: shortcut.chain,
        address: shortcut.resolvedAddress || shortcut.address,
        shortcutId: shortcut.id,
      };
    },
    [updateUsage]
  );

  /**
   * Save new shortcut from AR agent interaction
   */
  const saveARPaymentShortcut = useCallback(
    (agent: ARPaymentAgent, amount: string, chain: number) => {
      if (!agent.ens_domain) {
        throw new Error('Cannot save shortcut for non-ENS agent');
      }

      const existingShortcut = getByDomain(agent.ens_domain);
      if (existingShortcut) {
        return existingShortcut;
      }

      // Create new shortcut
      return addShortcut({
        domain: agent.ens_domain,
        address: '', // Will be resolved on demand
        amount,
        chain,
        lastUsed: Date.now(),
        isFavorite: false,
      });
    },
    [getByDomain, addShortcut]
  );

  /**
   * Enrich AR agent data with ENS and shortcut info
   */
  const enrichARAgent = useCallback(
    (agent: ARPaymentAgent): ARPaymentAgent & {
      shortcut?: ENSShortcut;
      isResolving: boolean;
    } => {
      const shortcut = agent.ens_domain ? getByDomain(agent.ens_domain) : null;
      const isResolving = agent.ens_domain
        ? isResolutionInProgress(agent.ens_domain)
        : false;

      return {
        ...agent,
        shortcut: shortcut || undefined,
        isResolving,
        hasQuickPayment: !!shortcut,
      };
    },
    [getByDomain, isResolutionInProgress]
  );

  /**
   * Filter agents for quick payment display
   */
  const getQuickPaymentAgents = useCallback(
    (agents: ARPaymentAgent[]) => {
      return agents.filter((agent) => hasQuickPayment(agent.ens_domain));
    },
    [hasQuickPayment]
  );

  /**
   * Get favorites from shortcuts that appear in AR
   */
  const getARFavorites = useCallback(
    (agents: ARPaymentAgent[]) => {
      return agents.filter((agent) => {
        const shortcut = getByDomain(agent.ens_domain || '');
        return shortcut?.isFavorite;
      });
    },
    [getByDomain]
  );

  /**
   * Get agents sorted by shortcut usage
   */
  const getARByFrequency = useCallback(
    (agents: ARPaymentAgent[]) => {
      return agents.sort((a, b) => {
        const shortcutA = getByDomain(a.ens_domain || '');
        const shortcutB = getByDomain(b.ens_domain || '');

        return (shortcutB?.useCount || 0) - (shortcutA?.useCount || 0);
      });
    },
    [getByDomain]
  );

  return {
    shortcuts,
    hasQuickPayment,
    getQuickPayment,
    executeQuickPayment,
    saveARPaymentShortcut,
    enrichARAgent,
    getQuickPaymentAgents,
    getARFavorites,
    getARByFrequency,
  };
};

export default useARENSPayments;
