import React, { useState } from "react";
import { DeploymentForm } from "./components/DeploymentForm";
import { LandingPage } from "./components/LandingPage";
import type { DeployedObject } from "@cubepay/types";
import "leaflet/dist/leaflet.css";

function App() {
  const [currentPage, setCurrentPage] = useState<string>("landing");

  const handleDeploymentSuccess = (agent: DeployedObject) => {
    console.log("Agent deployed successfully:", agent);
  };

  const handleNavigate = (page: string) => {
    if (page === "deploy") {
      setCurrentPage("deploy");
    } else {
      console.log("Navigate to:", page);
      // TODO: Implement other pages
    }
  };

  if (currentPage === "landing") {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "deploy") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-cream">
        <div className="py-10 px-4">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-10">
            <button
              onClick={() => setCurrentPage("landing")}
              className="group mb-6 px-6 py-3 bg-gray-800/80 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium border border-gray-700/50 flex items-center gap-2"
            >
              ← Back to Home
            </button>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎲 CubePay Deployment Hub
            </h1>
            <p className="text-gray-300 text-xl leading-relaxed">
              Deploy your AI payment agent to the world with blockchain-powered
              payments
            </p>
          </div>

          {/* Deployment Form */}
          <DeploymentForm
            onSuccess={handleDeploymentSuccess}
            onCancel={() => setCurrentPage("landing")}
          />
        </div>
      </div>
    );
  }

  return null;
}

export default App;
