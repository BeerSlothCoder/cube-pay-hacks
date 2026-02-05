/**
 * Agent Type Mapping and Conversion Utilities
 * Handles backward compatibility and type normalization
 */

import type { AgentType } from "@cubepay/types";

/**
 * Map agent types to display labels and metadata
 */
export const AGENT_TYPE_META = {
  "Virtual Terminal": {
    label: "Virtual ATM",
    emoji: "🏧",
    keywords: ["atm", "terminal", "crypto", "cash"],
    badge: "ARTM",
    badgeColor: "#0066ff",
    icon: "🏧",
  },
  "Payment Terminal": {
    label: "Payment Terminal - POS",
    emoji: "💳",
    keywords: ["payment", "pos", "terminal"],
    badge: "POS",
    badgeColor: "#8b5cf6",
    icon: "💳",
  },
  "Content Creator": {
    label: "My Payment Terminal",
    emoji: "💰",
    keywords: ["creator", "personal", "merchant"],
    badge: "CREATOR",
    badgeColor: "#f59e0b",
    icon: "💰",
  },
};

/**
 * Normalize agent type from various sources
 * Handles backward compatibility for legacy values
 *
 * @param agentType - Raw agent type value from database
 * @returns Normalized agent type or null if invalid
 */
export const normalizeAgentType = (
  agentType: string | null,
): AgentType | null => {
  if (!agentType || typeof agentType !== "string") {
    return null;
  }

  // Handle legacy "home_security" type
  if (agentType === "home_security") {
    return "Virtual Terminal";
  }

  // Handle legacy "payment_terminal" (lowercase)
  if (agentType === "payment_terminal") {
    return "Payment Terminal";
  }

  // Handle legacy "content_creator" (lowercase)
  if (agentType === "content_creator") {
    return "Content Creator";
  }

  // Handle string "null" from database
  if (agentType === "null" || agentType === "") {
    return null;
  }

  // Return as-is if already normalized
  if (agentType in AGENT_TYPE_META) {
    return agentType as AgentType;
  }

  return null;
};

/**
 * Check if agent is a Virtual Terminal (ARTM)
 *
 * @param agentType - Agent type value
 * @returns true if agent is Virtual Terminal type
 */
export const isVirtualTerminal = (
  agentType: string | null | undefined,
): boolean => {
  if (!agentType || typeof agentType !== "string") {
    return false;
  }

  const normalized = normalizeAgentType(agentType);
  return normalized === "Virtual Terminal";
};

/**
 * Check if agent is a Payment Terminal (POS)
 *
 * @param agentType - Agent type value
 * @returns true if agent is Payment Terminal type
 */
export const isPaymentTerminal = (
  agentType: string | null | undefined,
): boolean => {
  if (!agentType || typeof agentType !== "string") {
    return false;
  }

  const normalized = normalizeAgentType(agentType);
  return normalized === "Payment Terminal";
};

/**
 * Check if agent is a Content Creator
 *
 * @param agentType - Agent type value
 * @returns true if agent is Content Creator type
 */
export const isContentCreator = (
  agentType: string | null | undefined,
): boolean => {
  if (!agentType || typeof agentType !== "string") {
    return false;
  }

  const normalized = normalizeAgentType(agentType);
  return normalized === "Content Creator";
};

/**
 * Get display metadata for agent type
 *
 * @param agentType - Agent type value
 * @returns Metadata object or null if type is invalid
 */
export const getAgentTypeMetadata = (
  agentType: string | null | undefined,
): (typeof AGENT_TYPE_META)[keyof typeof AGENT_TYPE_META] | null => {
  const normalized = normalizeAgentType(agentType || null);
  if (!normalized) {
    return null;
  }

  return AGENT_TYPE_META[normalized as keyof typeof AGENT_TYPE_META] || null;
};

/**
 * Get icon/emoji for agent type
 *
 * @param agentType - Agent type value
 * @returns Icon emoji string or default
 */
export const getAgentTypeIcon = (
  agentType: string | null | undefined,
): string => {
  const metadata = getAgentTypeMetadata(agentType);
  return metadata?.icon || "🤖";
};

/**
 * Get badge color for agent type
 *
 * @param agentType - Agent type value
 * @returns Hex color code
 */
export const getAgentTypeBadgeColor = (
  agentType: string | null | undefined,
): string => {
  const metadata = getAgentTypeMetadata(agentType);
  return metadata?.badgeColor || "#6b7280"; // gray-500
};

/**
 * Get badge text for agent type
 *
 * @param agentType - Agent type value
 * @returns Badge text or empty string
 */
export const getAgentTypeBadge = (
  agentType: string | null | undefined,
): string => {
  const metadata = getAgentTypeMetadata(agentType);
  return metadata?.badge || "";
};

/**
 * Filter agents by normalized type
 * Automatically handles type conversion
 *
 * @param agents - Array of agents
 * @param typeFilter - Agent type to filter by (or null for any)
 * @returns Filtered agents
 */
export const filterByAgentType = <T extends { agent_type?: string | null }>(
  agents: T[],
  typeFilter: AgentType | null,
): T[] => {
  if (!typeFilter) {
    return agents;
  }

  return agents.filter((agent) => {
    const normalized = normalizeAgentType(agent.agent_type || null);
    return normalized === typeFilter;
  });
};

/**
 * Get all valid agent types
 *
 * @returns Array of valid agent types
 */
export const getAllAgentTypes = (): AgentType[] => {
  return Object.keys(AGENT_TYPE_META) as AgentType[];
};
