import React from "react";
import { DeploymentForm } from "./components/DeploymentForm";
import { CubePreview } from "./components/CubePreview";
import type { DeployedObject } from "@cubepay/types";
import "leaflet/dist/leaflet.css";

function App() {
  const handleDeploymentSuccess = (agent: DeployedObject) => {
    console.log("Agent deployed successfully:", agent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-cream">
      <div className="py-8 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            🎲 CubePay Deployment Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Deploy your AI payment agent to the world with blockchain-powered
            payments
          </p>
        </div>

        {/* Deployment Form */}
        <DeploymentForm onSuccess={handleDeploymentSuccess} />
      </div>
    </div>
  );
}

export default App;
