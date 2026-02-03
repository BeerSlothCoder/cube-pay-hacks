import React, { useEffect, useState } from "react";
import { CameraView } from "./components/CameraView";
import { AgentOverlay } from "./components/AgentOverlay";
import { PaymentCube } from "./components/PaymentCube";
import { PaymentModal } from "./components/PaymentModal";
import { GPSCubeRenderer } from "./components/GPSCubeRenderer";
import { FilterPanel, type AgentFilters } from "./components/FilterPanel";
import { useAgentStore } from "./stores/agentStore";
import { usePaymentStore } from "./stores/paymentStore";
import { createCubePayDatabase } from "@cubepay/database-client";
import { Filter, MapPin, Zap, Navigation, X } from "lucide-react";

type ViewMode = "screen" | "gps";

function App() {
  const { agents, loadAgents } = useAgentStore();
  const { selectedAgent, showCube, selectAgent } = usePaymentStore();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AgentFilters | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("screen");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    const dbClient = createCubePayDatabase(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    loadAgents(dbClient);
  }, [loadAgents]);

  const handleFilterChange = (filters: AgentFilters) => {
    setActiveFilters(filters);
    console.log("Active filters:", filters);
    // TODO: Apply filters to agents list
  };

  const getActiveFilterCount = () => {
    if (!activeFilters) return 0;
    return (
      activeFilters.agentTypes.length +
      activeFilters.blockchains.length +
      activeFilters.paymentMethods.length
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cubepay-bg">
      {/* Layer 1: Camera View */}
      <CameraView
        onLocationUpdate={(lat, lon) => setUserLocation({ lat, lon })}
      />

      {/* Layer 2: Agent Overlay (Screen Mode) or GPS Cubes (GPS Mode) */}
      {viewMode === "screen" ? (
        <AgentOverlay filter="all" />
      ) : (
        userLocation && (
          <GPSCubeRenderer
            userLatitude={userLocation.lat}
            userLongitude={userLocation.lon}
            radius={
              activeFilters?.distanceKm ? activeFilters.distanceKm * 1000 : 1000
            }
          />
        )
      )}

      {/* Layer 3: Payment Cube (only when agent selected AND showCube is true) */}
      {showCube && selectedAgent && <PaymentCube agent={selectedAgent} />}

      {/* Layer 4: Payment Modal */}
      <PaymentModal />

      {/* Layer 5: Filter Panel (Side Panel) */}
      {showFilterPanel && (
        <div className="fixed right-0 top-0 bottom-0 z-50 shadow-2xl">
          <FilterPanel
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilterPanel(false)}
          />
        </div>
      )}

      {/* Top Bar - Stats & Info */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-cubepay-card px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-sm text-cubepay-text">
                  {agents.length} agents nearby
                </span>
              </div>
            </div>
            <div className="bg-cubepay-card px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                {viewMode === "gps" ? (
                  <>
                    <Navigation size={16} className="text-green-400" />
                    <span className="text-sm text-cubepay-text">GPS Mode</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-green-400" />
                    <span className="text-sm text-cubepay-text">
                      Screen Mode
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* GPS Location Status */}
            {userLocation && (
              <div className="px-3 py-2 bg-cubepay-card rounded-lg text-xs text-gray-400">
                {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
              </div>
            )}

            {/* View Mode Toggle */}
            <button
              onClick={() =>
                setViewMode(viewMode === "screen" ? "gps" : "screen")
              }
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                viewMode === "gps"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-cubepay-card hover:bg-gray-700"
              }`}
            >
              <Navigation size={16} />
              {viewMode === "screen" ? "Enable GPS" : "GPS Active"}
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                showFilterPanel
                  ? "bg-blue-600"
                  : "bg-cubepay-card hover:bg-gray-700"
              }`}
            >
              <Filter size={20} />
              {getActiveFilterCount() > 0 && (
                <span className="px-2 py-0.5 bg-white text-blue-600 text-xs rounded-full font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex justify-center items-center gap-4">
          {viewMode === "gps" && !userLocation && (
            <div className="bg-yellow-600 bg-opacity-90 px-4 py-2 rounded-lg flex items-center gap-2">
              <Navigation size={16} className="animate-pulse" />
              <span className="text-sm font-semibold">
                Getting your location...
              </span>
            </div>
          )}
          {viewMode === "gps" && userLocation && (
            <div className="bg-green-600 bg-opacity-90 px-4 py-2 rounded-lg flex items-center gap-2">
              <MapPin size={16} />
              <span className="text-sm font-semibold">
                GPS Active - {agents.length} agents nearby
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
