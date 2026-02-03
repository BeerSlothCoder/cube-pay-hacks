/**
 * Advanced ENS Integration for CubePay
 *
 * Features:
 * - Text records for payment preferences
 * - Multiple addresses per chain stored in ENS
 * - Social profiles and metadata
 * - Content hash for decentralized agent profiles
 */

import { ethers } from "ethers";

/**
 * ENS Text Record Keys for CubePay
 */
export const ENS_TEXT_RECORDS = {
  // Payment Preferences
  PREFERRED_CHAIN: "com.cubepay.preferredChain",
  PREFERRED_TOKEN: "com.cubepay.preferredToken",
  MIN_PAYMENT: "com.cubepay.minPayment",
  MAX_PAYMENT: "com.cubepay.maxPayment",

  // Multi-Chain Addresses
  ETHEREUM_ADDRESS: "com.cubepay.address.ethereum",
  BASE_ADDRESS: "com.cubepay.address.base",
  ARBITRUM_ADDRESS: "com.cubepay.address.arbitrum",
  OPTIMISM_ADDRESS: "com.cubepay.address.optimism",
  POLYGON_ADDRESS: "com.cubepay.address.polygon",
  AVALANCHE_ADDRESS: "com.cubepay.address.avalanche",

  // Social & Identity (Standard ENS records)
  AVATAR: "avatar",
  DESCRIPTION: "description",
  EMAIL: "email",
  URL: "url",
  TWITTER: "com.twitter",
  GITHUB: "com.github",
  DISCORD: "com.discord",

  // Agent-Specific
  AGENT_TYPE: "com.cubepay.agentType",
  AGENT_LOCATION: "com.cubepay.location",
  AGENT_RATING: "com.cubepay.rating",
  AGENT_AVAILABILITY: "com.cubepay.availability",
};

/**
 * Payment preferences stored in ENS
 */
export interface ENSPaymentPreferences {
  preferredChain?: string;
  preferredToken?: string;
  minPayment?: string;
  maxPayment?: string;
  chainAddresses?: Record<string, string>;
}

/**
 * Agent profile stored in ENS
 */
export interface ENSAgentProfile {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  url?: string;
  social?: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
  agentType?: string;
  location?: string;
  rating?: string;
  availability?: string;
  paymentPreferences?: ENSPaymentPreferences;
}

/**
 * Advanced ENS Client for CubePay
 */
export class ENSClient {
  private provider: ethers.Provider;
  private resolver: any;

  constructor(providerUrl: string = "https://ethereum.publicnode.com") {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
  }

  /**
   * Resolve ENS name to Ethereum address
   */
  async resolveAddress(ensName: string): Promise<string | null> {
    try {
      const address = await this.provider.resolveName(ensName);
      return address;
    } catch (error) {
      console.error(`Failed to resolve ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Reverse resolve address to ENS name
   */
  async lookupAddress(address: string): Promise<string | null> {
    try {
      const ensName = await this.provider.lookupAddress(address);
      return ensName;
    } catch (error) {
      console.error(`Failed to reverse resolve ${address}:`, error);
      return null;
    }
  }

  /**
   * Get ENS resolver for a name
   */
  private async getResolver(ensName: string) {
    try {
      // TODO: Fix ethers Provider type - getResolver exists at runtime
      const resolver = await (this.provider as any).getResolver(ensName);
      return resolver;
    } catch (error) {
      console.error(`Failed to get resolver for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Read text record from ENS
   */
  async getText(ensName: string, key: string): Promise<string | null> {
    try {
      const resolver = await this.getResolver(ensName);
      if (!resolver) return null;

      const value = await resolver.getText(key);
      return value || null;
    } catch (error) {
      console.error(`Failed to read text record ${key} for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Read multiple text records in parallel
   */
  async getTextRecords(
    ensName: string,
    keys: string[],
  ): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.getText(ensName, key);
      }),
    );

    return results;
  }

  /**
   * Get payment preferences from ENS
   */
  async getPaymentPreferences(ensName: string): Promise<ENSPaymentPreferences> {
    const keys = [
      ENS_TEXT_RECORDS.PREFERRED_CHAIN,
      ENS_TEXT_RECORDS.PREFERRED_TOKEN,
      ENS_TEXT_RECORDS.MIN_PAYMENT,
      ENS_TEXT_RECORDS.MAX_PAYMENT,
      ENS_TEXT_RECORDS.ETHEREUM_ADDRESS,
      ENS_TEXT_RECORDS.BASE_ADDRESS,
      ENS_TEXT_RECORDS.ARBITRUM_ADDRESS,
      ENS_TEXT_RECORDS.OPTIMISM_ADDRESS,
      ENS_TEXT_RECORDS.POLYGON_ADDRESS,
      ENS_TEXT_RECORDS.AVALANCHE_ADDRESS,
    ];

    const records = await this.getTextRecords(ensName, keys);

    return {
      preferredChain: records[ENS_TEXT_RECORDS.PREFERRED_CHAIN] || undefined,
      preferredToken: records[ENS_TEXT_RECORDS.PREFERRED_TOKEN] || undefined,
      minPayment: records[ENS_TEXT_RECORDS.MIN_PAYMENT] || undefined,
      maxPayment: records[ENS_TEXT_RECORDS.MAX_PAYMENT] || undefined,
      chainAddresses: {
        ethereum: records[ENS_TEXT_RECORDS.ETHEREUM_ADDRESS] || "",
        base: records[ENS_TEXT_RECORDS.BASE_ADDRESS] || "",
        arbitrum: records[ENS_TEXT_RECORDS.ARBITRUM_ADDRESS] || "",
        optimism: records[ENS_TEXT_RECORDS.OPTIMISM_ADDRESS] || "",
        polygon: records[ENS_TEXT_RECORDS.POLYGON_ADDRESS] || "",
        avalanche: records[ENS_TEXT_RECORDS.AVALANCHE_ADDRESS] || "",
      },
    };
  }

  /**
   * Get complete agent profile from ENS
   */
  async getAgentProfile(ensName: string): Promise<ENSAgentProfile | null> {
    try {
      const address = await this.resolveAddress(ensName);
      if (!address) return null;

      // Get all text records
      const keys = [
        ENS_TEXT_RECORDS.AVATAR,
        ENS_TEXT_RECORDS.DESCRIPTION,
        ENS_TEXT_RECORDS.URL,
        ENS_TEXT_RECORDS.TWITTER,
        ENS_TEXT_RECORDS.GITHUB,
        ENS_TEXT_RECORDS.DISCORD,
        ENS_TEXT_RECORDS.AGENT_TYPE,
        ENS_TEXT_RECORDS.AGENT_LOCATION,
        ENS_TEXT_RECORDS.AGENT_RATING,
        ENS_TEXT_RECORDS.AGENT_AVAILABILITY,
      ];

      const records = await this.getTextRecords(ensName, keys);
      const paymentPreferences = await this.getPaymentPreferences(ensName);

      return {
        name: ensName,
        address,
        avatar: records[ENS_TEXT_RECORDS.AVATAR] || undefined,
        description: records[ENS_TEXT_RECORDS.DESCRIPTION] || undefined,
        url: records[ENS_TEXT_RECORDS.URL] || undefined,
        social: {
          twitter: records[ENS_TEXT_RECORDS.TWITTER] || undefined,
          github: records[ENS_TEXT_RECORDS.GITHUB] || undefined,
          discord: records[ENS_TEXT_RECORDS.DISCORD] || undefined,
        },
        agentType: records[ENS_TEXT_RECORDS.AGENT_TYPE] || undefined,
        location: records[ENS_TEXT_RECORDS.AGENT_LOCATION] || undefined,
        rating: records[ENS_TEXT_RECORDS.AGENT_RATING] || undefined,
        availability: records[ENS_TEXT_RECORDS.AGENT_AVAILABILITY] || undefined,
        paymentPreferences,
      };
    } catch (error) {
      console.error(`Failed to get agent profile for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Get content hash (for decentralized websites)
   */
  async getContentHash(ensName: string): Promise<string | null> {
    try {
      const resolver = await this.getResolver(ensName);
      if (!resolver) return null;

      const contentHash = await resolver.getContentHash();
      return contentHash || null;
    } catch (error) {
      console.error(`Failed to get content hash for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Get address for specific chain (EIP-2304)
   */
  async getAddressForChain(
    ensName: string,
    coinType: number,
  ): Promise<string | null> {
    try {
      const resolver = await this.getResolver(ensName);
      if (!resolver) return null;

      // coinType: 60 = ETH, 966 = Polygon, 501 = Solana, etc.
      const address = await resolver.getAddress(coinType);
      return address || null;
    } catch (error) {
      console.error(
        `Failed to get address for coinType ${coinType} on ${ensName}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Check if ENS name has payment settings configured
   */
  async hasPaymentSettings(ensName: string): Promise<boolean> {
    const prefs = await this.getPaymentPreferences(ensName);
    return !!(
      prefs.preferredChain ||
      prefs.preferredToken ||
      Object.values(prefs.chainAddresses || {}).some((addr) => addr)
    );
  }
}

/**
 * Factory function
 */
export function createENSClient(providerUrl?: string): ENSClient {
  return new ENSClient(providerUrl);
}
