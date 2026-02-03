import React, { useState } from "react";
import {
  MapPin,
  Network,
  Zap,
  Hash,
  DollarSign,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createCubePayDatabase } from "@cubepay/database-client";
import { EVM_NETWORKS } from "@cubepay/network-config";
import type { AgentType, DeployedObject } from "@cubepay/types";
import { BlockchainSelector } from "./BlockchainSelector";
import { PositionSelector } from "./PositionSelector";
import { ARCGatewayConfig } from "./ARCGatewayConfig";
import { ENSIntegration } from "./ENSIntegration";
import { WalletConnector } from "./WalletConnector";

const AGENT_TYPES: { value: AgentType; label: string; description: string }[] =
  [
    {
      value: "home_security",
      label: "Virtual ATM",
      description: "Cryptocurrency ATM service for crypto-to-fiat conversion",
    },
    {
      value: "payment_terminal",
      label: "Payment Terminal - POS",
      description: "Point-of-sale payment processing terminal",
    },
    {
      value: "content_creator",
      label: "My Payment Terminal",
      description: "Personal payment terminal for creators and merchants",
    },
  ];

interface DeploymentFormData {
  // Agent Identity
  agent_name: string;
  agent_type: AgentType;
  agent_description: string;
  avatar_url: string;

  // GPS Position
  latitude: number;
  longitude: number;
  altitude: number;

  // Screen Position
  screen_x: number;
  screen_y: number;
  screen_z: number;

  // 3D Model
  model_url: string;

  // Blockchain
  network: string;
  chain_id: number;
  token_address: string;

  // Payment Config
  fee_type: "fixed" | "percentage";
  fee_amount: number;
  agent_wallet: string;

  // Arc Gateway
  arc_enabled: boolean;
  arc_fee_percentage: number;
  arc_supported_chains: number[];

  // ENS
  ens_domain: string;
  ens_enabled: boolean;

  // Interaction Methods
  interaction_methods: string[];

  // MCP Integrations
  mcp_integrations: string[];

  // Payment Methods (6-faced cube)
  payment_methods: string[];

  // AR Configuration
  visibility_range: number;
  interaction_range: number;
  ar_notifications: boolean;

  // Trailing Agent
  trailing_agent: boolean;
}

interface DeploymentFormProps {
  onSuccess?: (agent: DeployedObject) => void;
  onCancel?: () => void;
}

export const DeploymentForm: React.FC<DeploymentFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<DeploymentFormData>({
    agent_name: "",
    agent_type: "home_security",
    agent_description: "",
    avatar_url: "",
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 0,
    screen_x: 50,
    screen_y: 50,
    screen_z: 1,
    model_url: "",
    network: "ethereum-sepolia",
    chain_id: 11155111,
    token_address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    fee_type: "percentage",
    fee_amount: 5,
    agent_wallet: "",
    arc_enabled: false,
    arc_fee_percentage: 0.1,
    arc_supported_chains: [11155111, 84532, 421614],
    ens_domain: "",
    ens_enabled: false,
    interaction_methods: ["chat"],
    mcp_integrations: [],
    payment_methods: ["crypto_qr"],
    visibility_range: 25,
    interaction_range: 15,
    ar_notifications: true,
    trailing_agent: false,
  });

  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "validating" | "deploying" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deployedAgent, setDeployedAgent] = useState<DeployedObject | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const db = createCubePayDatabase(
    import.meta.env.VITE_SUPABASE_URL ||
      "https://okzjeufiaeznfyomfenk.supabase.co",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const updateField = <K extends keyof DeploymentFormData>(
    field: K,
    value: DeploymentFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Agent Identity
    if (!formData.agent_name.trim()) {
      setErrorMessage("Agent name is required");
      return false;
    }
    if (formData.agent_name.length < 3) {
      setErrorMessage("Agent name must be at least 3 characters");
      return false;
    }

    // GPS Validation
    if (formData.latitude < -90 || formData.latitude > 90) {
      setErrorMessage("Latitude must be between -90 and 90");
      return false;
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      setErrorMessage("Longitude must be between -180 and 180");
      return false;
    }

    // Screen Position Validation
    if (formData.screen_x < 0 || formData.screen_x > 100) {
      setErrorMessage("Screen X must be between 0 and 100");
      return false;
    }
    if (formData.screen_y < 0 || formData.screen_y > 100) {
      setErrorMessage("Screen Y must be between 0 and 100");
      return false;
    }

    // Model URL Validation
    if (formData.model_url && !isValidUrl(formData.model_url)) {
      setErrorMessage("Invalid 3D model URL");
      return false;
    }

    // Avatar URL Validation
    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      setErrorMessage("Invalid avatar URL");
      return false;
    }

    // Wallet Address Validation
    if (!formData.agent_wallet || !formData.agent_wallet.startsWith("0x")) {
      setErrorMessage("Valid agent wallet address is required");
      return false;
    }

    // Fee Validation
    if (formData.fee_amount < 0) {
      setErrorMessage("Fee amount cannot be negative");
      return false;
    }
    if (formData.fee_type === "percentage" && formData.fee_amount > 100) {
      setErrorMessage("Fee percentage cannot exceed 100%");
      return false;
    }

    // Payment Methods Validation
    if (formData.payment_methods.length === 0) {
      setErrorMessage("At least one payment method must be selected");
      return false;
    }

    // Interaction Methods Validation
    if (formData.interaction_methods.length === 0) {
      setErrorMessage("At least one interaction method must be selected");
      return false;
    }

    // Arc Gateway Validation
    if (formData.arc_enabled && formData.arc_supported_chains.length === 0) {
      setErrorMessage("Select at least one chain for Arc Gateway");
      return false;
    }

    // ENS Validation
    if (formData.ens_enabled && !formData.ens_domain.endsWith(".eth")) {
      setErrorMessage("ENS domain must end with .eth");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeploy = async () => {
    if (!validateForm()) {
      return;
    }

    setDeploymentStatus("deploying");
    setErrorMessage(null);

    try {
      const agentData: Partial<DeployedObject> = {
        agent_name: formData.agent_name,
        agent_type: formData.agent_type,
        agent_description: formData.agent_description,
        agent_persona: {
          name: formData.agent_name,
          avatar_url: formData.avatar_url,
        },
        location: {
          lat: formData.latitude,
          lng: formData.longitude,
          altitude: formData.altitude,
        },
        latitude: formData.latitude,
        longitude: formData.longitude,
        altitude: formData.altitude,
        screen_position: {
          x: formData.screen_x,
          y: formData.screen_y,
          z_index: formData.screen_z,
        },
        model_3d: formData.model_url
          ? {
              url: formData.model_url,
              format: "glb",
            }
          : undefined,
        network: formData.network,
        chain_id: formData.chain_id,
        token_address: formData.token_address,
        fee_type: formData.fee_type,
        fee_amount: formData.fee_amount,
        fee_percentage:
          formData.fee_type === "percentage" ? formData.fee_amount : undefined,
        agent_wallet: formData.agent_wallet,
        cube_enabled: true,
        payment_enabled: true,
        is_active: true,
        arc_gateway_enabled: formData.arc_enabled,
        arc_gateway_config: formData.arc_enabled
          ? {
              enabled: true,
              fee_percentage: formData.arc_fee_percentage,
              supported_chains: formData.arc_supported_chains,
            }
          : undefined,
        ens_domain: formData.ens_enabled ? formData.ens_domain : undefined,
        ens_enabled: formData.ens_enabled,
      };

      const deployed = await db.createAgent(agentData);

      if (!deployed) {
        throw new Error("Failed to create agent in database");
      }

      setDeployedAgent(deployed);
      setDeploymentStatus("success");

      if (onSuccess) {
        onSuccess(deployed);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to deploy agent",
      );
      setDeploymentStatus("error");
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep === step
                ? "bg-blue-600 text-white scale-110"
                : currentStep > step
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-400"
            }`}
          >
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 5 && (
            <div
              className={`w-12 h-1 transition-all ${
                currentStep > step ? "bg-green-600" : "bg-gray-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cream flex items-center gap-2">
        <Hash className="w-6 h-6 text-blue-400" />
        Agent Identity
      </h2>

      {/* Agent Name */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Agent Name *
        </label>
        <input
          type="text"
          value={formData.agent_name}
          onChange={(e) => updateField("agent_name", e.target.value)}
          placeholder="My Payment Agent"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500"
          maxLength={100}
        />
      </div>

      {/* Agent Type */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Agent Type *
        </label>
        <select
          value={formData.agent_type}
          onChange={(e) =>
            updateField("agent_type", e.target.value as AgentType)
          }
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream focus:outline-none focus:border-blue-500"
        >
          {AGENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-400">
          {
            AGENT_TYPES.find((t) => t.value === formData.agent_type)
              ?.description
          }
        </p>
      </div>

      {/* Agent Description */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Description
        </label>
        <textarea
          value={formData.agent_description}
          onChange={(e) => updateField("agent_description", e.target.value)}
          placeholder="Describe your agent's purpose and capabilities..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
          maxLength={500}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.agent_description.length}/500 characters
        </p>
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Avatar URL
        </label>
        <input
          type="url"
          value={formData.avatar_url}
          onChange={(e) => updateField("avatar_url", e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 3D Model URL */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          3D Model URL (GLB format)
        </label>
        <input
          type="url"
          value={formData.model_url}
          onChange={(e) => updateField("model_url", e.target.value)}
          placeholder="https://example.com/model.glb"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload your GLB file to a CDN or IPFS and paste the URL here
        </p>
      </div>

      {/* Interaction Methods */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-cream mb-4">
          Agent Interaction Methods
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "chat", label: "Chat" },
            { value: "voice", label: "Voice" },
            { value: "video", label: "Video" },
            { value: "ar", label: "AR" },
          ].map((method) => (
            <label
              key={method.value}
              className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.interaction_methods.includes(method.value)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...formData.interaction_methods, method.value]
                    : formData.interaction_methods.filter(
                        (m) => m !== method.value,
                      );
                  updateField("interaction_methods", methods);
                }}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-cream">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* MCP Server Interactions */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-cream mb-4">
          MCP Server Interactions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "Chat",
            "Voice",
            "Analysis",
            "Information Lookup",
            "Educational Content",
            "Study Planning",
            "Q&A",
            "Location Services",
            "Directory",
            "Navigation",
            "Content Generation",
            "Brainstorming",
            "Writing",
            "Game Creation",
            "Puzzles",
            "Entertainment",
          ].map((integration) => (
            <label
              key={integration}
              className="flex items-center gap-2 p-2 bg-gray-900 rounded cursor-pointer hover:bg-gray-800 transition-colors text-sm"
            >
              <input
                type="checkbox"
                checked={formData.mcp_integrations.includes(integration)}
                onChange={(e) => {
                  const integrations = e.target.checked
                    ? [...formData.mcp_integrations, integration]
                    : formData.mcp_integrations.filter(
                        (i) => i !== integration,
                      );
                  updateField("mcp_integrations", integrations);
                }}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-cream text-xs">{integration}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cream flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-400" />
        Positioning
      </h2>

      <PositionSelector
        gpsPosition={{
          latitude: formData.latitude,
          longitude: formData.longitude,
          altitude: formData.altitude,
        }}
        screenPosition={{
          x: formData.screen_x,
          y: formData.screen_y,
          z_index: formData.screen_z,
        }}
        onGPSChange={(gps) => {
          updateField("latitude", gps.latitude);
          updateField("longitude", gps.longitude);
          updateField("altitude", gps.altitude);
        }}
        onScreenChange={(screen) => {
          updateField("screen_x", screen.x);
          updateField("screen_y", screen.y);
          updateField("screen_z", screen.z_index);
        }}
      />

      {/* Trailing Agent */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.trailing_agent}
            onChange={(e) => updateField("trailing_agent", e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-cream font-medium">Trailing Agent</span>
            <p className="text-sm text-gray-400">
              Agent follows your GPS location in real-time
            </p>
          </div>
        </label>
      </div>

      {/* AR Configuration */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-cream mb-4">
          AR Configuration
        </h3>

        {/* Visibility Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-cream mb-2">
            Visibility Range: {formData.visibility_range}m
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.visibility_range}
            onChange={(e) =>
              updateField("visibility_range", parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0m</span>
            <span>100m</span>
          </div>
        </div>

        {/* Interaction Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-cream mb-2">
            Interaction Range: {formData.interaction_range}m
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.interaction_range}
            onChange={(e) =>
              updateField("interaction_range", parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0m</span>
            <span>100m</span>
          </div>
        </div>

        {/* AR Notifications */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ar_notifications}
            onChange={(e) => updateField("ar_notifications", e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-cream">Enable AR Notifications</span>
        </label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cream flex items-center gap-2">
        <Network className="w-6 h-6 text-blue-400" />
        Blockchain Configuration
      </h2>

      <BlockchainSelector
        selectedChainId={formData.chain_id}
        onSelect={(network) => {
          updateField("network", network.id);
          updateField("chain_id", network.chainId);
        }}
      />

      {/* Token Address */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Token Address (USDC)
        </label>
        <input
          type="text"
          value={formData.token_address}
          onChange={(e) => updateField("token_address", e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
        />
      </div>

      {/* Agent Wallet */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Agent Wallet Address *
        </label>
        <input
          type="text"
          value={formData.agent_wallet}
          onChange={(e) => updateField("agent_wallet", e.target.value)}
          placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Payments will be sent to this address
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cream flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-blue-400" />
        Payment Configuration
      </h2>

      {/* Fee Type */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          Fee Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField("fee_type", "fixed")}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              formData.fee_type === "fixed"
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
            }`}
          >
            Fixed Amount
          </button>
          <button
            type="button"
            onClick={() => updateField("fee_type", "percentage")}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              formData.fee_type === "percentage"
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
            }`}
          >
            Percentage
          </button>
        </div>
      </div>

      {/* Fee Amount */}
      <div>
        <label className="block text-sm font-medium text-cream mb-2">
          {formData.fee_type === "fixed"
            ? "Fee Amount (USDC)"
            : "Fee Percentage (%)"}
        </label>
        <input
          type="number"
          value={formData.fee_amount}
          onChange={(e) =>
            updateField("fee_amount", parseFloat(e.target.value) || 0)
          }
          min="0"
          max={formData.fee_type === "percentage" ? 100 : undefined}
          step={formData.fee_type === "percentage" ? 0.1 : 0.01}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream focus:outline-none focus:border-blue-500"
        />
        {formData.fee_type === "percentage" && (
          <p className="mt-1 text-sm text-gray-500">
            Example: 5% fee on $100 payment = $5
          </p>
        )}
      </div>

      {/* Revenue Calculator */}
      <div className="bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-6">
          💰 Revenue Projection
        </h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
            <span className="text-gray-300 font-medium text-lg">
              Per Interaction:
            </span>
            <span className="text-2xl font-bold text-emerald-400">
              {formData.fee_type === "fixed"
                ? `$${formData.fee_amount.toFixed(2)}`
                : `${formData.fee_amount}%`}{" "}
              USDC
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
            <span className="text-gray-300 font-medium text-lg">
              Estimated Daily (10 interactions):
            </span>
            <span className="text-2xl font-bold text-green-400">
              {formData.fee_type === "fixed"
                ? `$${(formData.fee_amount * 10).toFixed(2)}`
                : `~$${(formData.fee_amount * 10).toFixed(2)}`}{" "}
              USDC
            </span>
          </div>
          <div className="flex items-center justify-between pt-5 border-t-2 border-emerald-500/30 p-4 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-xl">
            <span className="text-white font-bold text-xl">
              🚀 Monthly Potential:
            </span>
            <span className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
              {formData.fee_type === "fixed"
                ? `$${(formData.fee_amount * 300).toFixed(2)}`
                : `~$${(formData.fee_amount * 300).toFixed(2)}`}{" "}
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* 6-Faced Payment Methods */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-cream mb-4">
          Payment Methods (6-Faced Cube)
        </h3>
        {formData.agent_wallet && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">
              Wallet Connected: {formData.agent_wallet.slice(0, 10)}...
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: "crypto_qr",
              label: "Crypto Payments",
              description: "QR code-based crypto payments",
            },
            {
              value: "bank_card",
              label: "Bank Virtual Card",
              description: "Apple Pay / Google Pay integration",
            },
            {
              value: "bank_qr",
              label: "Bank QR Payments",
              description: "Traditional bank QR codes",
            },
            {
              value: "voice",
              label: "Voice Commands",
              description: "Voice-activated payments",
            },
            {
              value: "sound",
              label: "Sound Payments",
              description: "Ultrasonic payment transfer",
            },
            {
              value: "onboard",
              label: "Onboard Crypto Education",
              description: "Help users start with crypto",
            },
          ].map((method) => (
            <label
              key={method.value}
              className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors border border-gray-700 hover:border-blue-500"
            >
              <input
                type="checkbox"
                checked={formData.payment_methods.includes(method.value)}
                onChange={(e) => {
                  const methods = e.target.checked
                    ? [...formData.payment_methods, method.value]
                    : formData.payment_methods.filter(
                        (m) => m !== method.value,
                      );
                  updateField("payment_methods", methods);
                }}
                className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-cream font-medium">{method.label}</div>
                <div className="text-xs text-gray-400">
                  {method.description}
                </div>
              </div>
            </label>
          ))}
        </div>
        {formData.payment_methods.length === 0 && (
          <p className="mt-3 text-sm text-red-400">
            * At least one payment method must be selected
          </p>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cream flex items-center gap-2">
        <Zap className="w-6 h-6 text-blue-400" />
        Advanced Features
      </h2>

      {/* Arc Gateway */}
      <ARCGatewayConfig
        enabled={formData.arc_enabled}
        feePercentage={formData.arc_fee_percentage}
        supportedChains={formData.arc_supported_chains}
        onEnabledChange={(enabled) => updateField("arc_enabled", enabled)}
        onFeeChange={(fee) => updateField("arc_fee_percentage", fee)}
        onChainsChange={(chains) => updateField("arc_supported_chains", chains)}
      />

      {/* ENS Integration */}
      <ENSIntegration
        enabled={formData.ens_enabled}
        domain={formData.ens_domain}
        onEnabledChange={(enabled) => updateField("ens_enabled", enabled)}
        onDomainChange={(domain) => updateField("ens_domain", domain)}
      />
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="text-center py-12">
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-cream mb-4">
        Agent Deployed Successfully!
      </h2>
      <p className="text-gray-400 mb-6">
        Your payment agent is now live and ready to accept payments.
      </p>
      {deployedAgent && (
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto text-left">
          <h3 className="font-semibold text-cream mb-4">Deployment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Agent ID:</span>
              <span className="text-cream font-mono">
                {deployedAgent.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-cream">{deployedAgent.agent_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-cream">{deployedAgent.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location:</span>
              <span className="text-cream">
                {deployedAgent.latitude.toFixed(4)},{" "}
                {deployedAgent.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Deploy Another Agent
      </button>
    </div>
  );

  if (deploymentStatus === "success") {
    return renderSuccessScreen();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Wallet Connector */}
      <WalletConnector
        onWalletConnect={(address, chainId) => {
          updateField("agent_wallet", address);
          console.log("Wallet connected:", address, "Chain ID:", chainId);
        }}
        onWalletDisconnect={() => {
          updateField("agent_wallet", "");
          console.log("Wallet disconnected");
        }}
      />

      {renderStepIndicator()}

      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-gray-700/50">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-8 p-5 bg-gradient-to-r from-red-900/30 to-red-800/30 backdrop-blur-sm border-2 border-red-500/50 rounded-xl flex items-start gap-3 shadow-lg shadow-red-500/20">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 font-medium text-lg">{errorMessage}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 flex justify-between gap-6">
          <button
            onClick={() => {
              if (currentStep === 1 && onCancel) {
                onCancel();
              } else if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as typeof currentStep);
              }
            }}
            className="group px-8 py-4 bg-gray-800/80 backdrop-blur-sm text-cream rounded-xl hover:bg-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-700/50 font-semibold text-lg"
            disabled={deploymentStatus === "deploying"}
          >
            {currentStep === 1 ? "← Cancel" : "← Back"}
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() =>
                setCurrentStep((prev) => (prev + 1) as typeof currentStep)
              }
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 font-semibold text-lg flex items-center gap-2"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={deploymentStatus === "deploying"}
              className="group px-10 py-5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-xl flex items-center gap-3"
            >
              {deploymentStatus === "deploying" ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>🚀 Deploy Agent Now</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
