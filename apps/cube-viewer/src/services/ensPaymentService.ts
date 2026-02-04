/**
 * ENS Payment Service
 *
 * Handles ENS domain resolution, payment preferences,
 * and integration with the payment system
 */

import {
  createENSClient,
  type ENSAgentProfile,
} from "@cubepay/wallet-connector";

export interface ENSPaymentConfig {
  domain: string;
  resolvedAddress: string;
  network: "mainnet" | "sepolia";
  avatar?: string;
  description?: string;
  minPayment?: number;
  maxPayment?: number;
  preferredChain?: string;
  preferredToken?: string;
}

class ENSPaymentService {
  private ensClient = createENSClient();
  private cache: Map<string, { data: ENSPaymentConfig; timestamp: number }> =
    new Map();
  private cacheTimeout = 3600000; // 1 hour

  /**
   * Resolve ENS domain and fetch payment configuration
   */
  async resolveENSPayment(
    domain: string,
    network: "mainnet" | "sepolia" = "sepolia",
  ): Promise<ENSPaymentConfig | null> {
    // Check cache
    const cached = this.cache.get(domain);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const profile = await this.ensClient.getAgentProfile(domain);
      if (!profile) return null;

      const config: ENSPaymentConfig = {
        domain,
        resolvedAddress: profile.address,
        network,
        avatar: profile.avatar,
        description: profile.description,
        minPayment: profile.paymentPreferences?.minPayment
          ? parseFloat(profile.paymentPreferences.minPayment)
          : undefined,
        maxPayment: profile.paymentPreferences?.maxPayment
          ? parseFloat(profile.paymentPreferences.maxPayment)
          : undefined,
        preferredChain: profile.paymentPreferences?.preferredChain,
        preferredToken: profile.paymentPreferences?.preferredToken,
      };

      // Cache the result
      this.cache.set(domain, { data: config, timestamp: Date.now() });

      return config;
    } catch (error) {
      console.error(`Failed to resolve ENS payment for ${domain}:`, error);
      return null;
    }
  }

  /**
   * Validate payment amount against ENS constraints
   */
  validatePaymentAmount(
    amount: number,
    config: ENSPaymentConfig,
  ): {
    valid: boolean;
    error?: string;
  } {
    if (config.minPayment && amount < config.minPayment) {
      return {
        valid: false,
        error: `Minimum payment: $${config.minPayment} USDC`,
      };
    }

    if (config.maxPayment && amount > config.maxPayment) {
      return {
        valid: false,
        error: `Maximum payment: $${config.maxPayment} USDC`,
      };
    }

    return { valid: true };
  }

  /**
   * Get recommended chain for payment based on ENS preferences
   */
  getRecommendedChain(
    config: ENSPaymentConfig,
  ): { chainId: number; name: string } | null {
    // Map of chain names to IDs
    const chainMap: Record<string, number> = {
      ethereum: 1,
      "ethereum-mainnet": 1,
      "ethereum-sepolia": 11155111,
      sepolia: 11155111,
      base: 8453,
      "base-sepolia": 84532,
      arbitrum: 42161,
      polygon: 137,
      optimism: 10,
      avalanche: 43114,
      solana: 900, // Special ID for Solana
    };

    if (!config.preferredChain) return null;

    const chainId = chainMap[config.preferredChain.toLowerCase()];
    if (!chainId) return null;

    const chainNames: Record<number, string> = {
      1: "Ethereum Mainnet",
      11155111: "Ethereum Sepolia",
      8453: "Base",
      84532: "Base Sepolia",
      42161: "Arbitrum",
      137: "Polygon",
      10: "Optimism",
      43114: "Avalanche",
      900: "Solana",
    };

    return { chainId, name: chainNames[chainId] || config.preferredChain };
  }

  /**
   * Format ENS profile for UI display
   */
  formatProfileForDisplay(profile: ENSAgentProfile) {
    return {
      domain: profile.name,
      address: profile.address,
      displayAddress: `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`,
      avatar: profile.avatar,
      description: profile.description,
      agentType: profile.agentType,
      rating: profile.rating,
      availability: profile.availability,
      social: {
        twitter: profile.social?.twitter,
        github: profile.social?.github,
        discord: profile.social?.discord,
      },
    };
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  clearCache(domain?: string) {
    if (domain) {
      this.cache.delete(domain);
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const ensPaymentService = new ENSPaymentService();

// Export factory function for testing
export function createENSPaymentService() {
  return new ENSPaymentService();
}
