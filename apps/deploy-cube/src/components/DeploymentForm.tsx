import React, { useState, useEffect } from "react";
import {
  MapPin,
  Network,
  Zap,
  Hash,
  DollarSign,
  Upload,
  Globe,
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

const AGENT_TYPES: { value: AgentType; label: string; description: string }[] =
  [
    {
      value: "ai_avatar",
      label: "AI Avatar",
      description: "Conversational AI assistant with 3D avatar",
    },
    {
      value: "ar_portal",
      label: "AR Portal",
      description: "Gateway to virtual experiences",
    },
    {
      value: "nft_display",
      label: "NFT Display",
      description: "Showcase NFT collections in AR",
    },
    {
      value: "interactive_billboard",
      label: "Interactive Billboard",
      description: "Dynamic advertising display",
    },
    {
      value: "virtual_assistant",
      label: "Virtual Assistant",
      description: "Task-oriented AI helper",
    },
    {
      value: "game_character",
      label: "Game Character",
      description: "Interactive gaming agent",
    },
    {
      value: "tour_guide",
      label: "Tour Guide",
      description: "Location-based guide",
    },
    {
      value: "product_showcase",
      label: "Product Showcase",
      description: "3D product demonstration",
    },
    {
      value: "event_host",
      label: "Event Host",
      description: "Virtual event coordinator",
    },
    {
      value: "custom",
      label: "Custom Agent",
      description: "Your unique agent type",
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
    agent_type: "ai_avatar",
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
      {renderStepIndicator()}

      <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border border-gray-800">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={() => {
              if (currentStep === 1 && onCancel) {
                onCancel();
              } else if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as typeof currentStep);
              }
            }}
            className="px-6 py-3 bg-gray-800 text-cream rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            disabled={deploymentStatus === "deploying"}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() =>
                setCurrentStep((prev) => (prev + 1) as typeof currentStep)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={deploymentStatus === "deploying"}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deploymentStatus === "deploying" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Deploy Agent
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
