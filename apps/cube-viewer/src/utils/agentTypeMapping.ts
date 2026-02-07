/**
 * Agent Type Mapping and Conversion Utilities
 * Handles backward compatibility and type normalization
 */

import type { AgentType } from "@cubepay/types";

/**
 * Map agent types to display labels and metadata
 * Updated to use clean snake_case types (no more repurposed legacy types)
 */
export const AGENT_TYPE_META = {
  // Clean new types (as stored in database)
  artm_terminal: {
    label: "ARTM Terminal",
    emoji: "🏧",
    keywords: ["atm", "terminal", "crypto", "cash"],
    badge: "ARTM",
    badgeColor: "#0066ff",
    icon: "🏧",
  },
  pos_terminal: {
    label: "Payment Terminal - POS",
    emoji: "💳",
    keywords: ["payment", "pos", "terminal"],
    badge: "POS",
    badgeColor: "#8b5cf6",
    icon: "💳",
  },
  my_payment_terminal: {
    label: "My Payment Terminal",
    emoji: "💰",
    keywords: ["creator", "personal", "merchant"],
    badge: "PERSONAL",
    badgeColor: "#f59e0b",
    icon: "💰",
  },
};

/**
 * Normalize agent type from various sources
 * Handles backward compatibility for legacy values and capitalized formats
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

  // Handle string "null" or empty from database
  if (agentType === "null" || agentType === "") {
    return null;
  }

  // === NEW CLEAN TYPES (primary) ===
  // These are the correct database values after migration
  if (agentType === "artm_terminal") {
    return "artm_terminal";
  }
  if (agentType === "pos_terminal") {
    return "pos_terminal";
  }
  if (agentType === "my_payment_terminal") {
    return "my_payment_terminal";
  }

  // === LEGACY TYPE CONVERSIONS (backward compatibility) ===
  // Convert old repurposed types to new clean types
  if (agentType === "home_security") {
    console.warn("Converting legacy type 'home_security' → 'artm_terminal'");
    return "artm_terminal";
  }
  if (agentType === "payment_terminal") {
    console.warn("Converting legacy type 'payment_terminal' → 'pos_terminal'");
    return "pos_terminal";
  }
  if (agentType === "content_creator") {
    console.warn(
      "Converting legacy type 'content_creator' → 'my_payment_terminal'",
    );
    return "my_payment_terminal";
  }

  // === CAPITALIZED LEGACY FORMATS (from old UI) ===
  // Handle "Virtual Terminal", "Payment Terminal", "Content Creator"
  if (agentType === "Virtual Terminal") {
    console.warn(
      "Converting capitalized type 'Virtual Terminal' → 'artm_terminal'",
    );
    return "artm_terminal";
  }
  if (agentType === "Payment Terminal") {
    console.warn(
      "Converting capitalized type 'Payment Terminal' → 'pos_terminal'",
    );
    return "pos_terminal";
  }
  if (agentType === "Content Creator") {
    console.warn(
      "Converting capitalized type 'Content Creator' → 'my_payment_terminal'",
    );
    return "my_payment_terminal";
  }

  // Return as-is if it's a valid type in our metadata
  if (agentType in AGENT_TYPE_META) {
    return agentType as AgentType;
  }

  // Unknown type
  console.warn(`Unknown agent type: ${agentType}`);
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
  return normalized === "artm_terminal";
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
  return normalized === "pos_terminal";
};

/**
 * Check if agent is My Payment Terminal (Personal Terminal)
 *
 * @param agentType - Agent type value
 * @returns true if agent is My Payment Terminal type
 */
export const isMyPaymentTerminal = (
  agentType: string | null | undefined,
): boolean => {
  if (!agentType || typeof agentType !== "string") {
    return false;
  }

  const normalized = normalizeAgentType(agentType);
  return normalized === "my_payment_terminal";
};

/**
 * @deprecated Use isMyPaymentTerminal instead
 * Check if agent is a Content Creator (legacy name)
 */
export const isContentCreator = (
  agentType: string | null | undefined,
): boolean => {
  return isMyPaymentTerminal(agentType);
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
