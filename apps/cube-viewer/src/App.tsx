import React, { useEffect, useState } from 'react';
import { CameraView } from './components/CameraView';
import { AgentOverlay } from './components/AgentOverlay';
import { PaymentCube } from './components/PaymentCube';
import { PaymentModal } from './components/PaymentModal';
import { GPSCubeRenderer } from './components/GPSCubeRenderer';
import { useAgentStore } from './stores/agentStore';
import { usePaymentStore } from './stores/paymentStore';
import { createCubePayDatabase } from '@cubepay/database-client';
import { Filter, MapPin, Zap, Navigation } from 'lucide-react';

type FilterType = 'all' | 'crypto_qr' | 'virtual_card' | 'on_off_ramp' | 'ens_payment';
type ViewMode = 'screen' | 'gps';

function App() {
  const { agents, loadAgents } = useAgentStore();
  const { selectedAgent, showCube, selectAgent } = usePaymentStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('screen');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const dbClient = createCubePayDatabase(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    loadAgents(dbClient);
  }, [loadAgents]);

  // Mock test agent for demo
  const testAgent = {
    id: "test-1",
    agent_name: "Test Agent",
    screen_position: { x: 50, y: 50, z_index: 1 },
    payment_enabled: true
  };

  const filterButtons = [
    { id: 'all', label: 'All Agents', icon: '🎲', color: 'bg-blue-600' },
    { id: 'crypto_qr', label: 'Crypto QR', icon: '💳', color: 'bg-cyan-600' },
    { id: 'virtual_card', label: 'Virtual Card', icon: '💰', color: 'bg-purple-600' },
    { id: 'on_off_ramp', label: 'On/Off Ramp', icon: '🔄', color: 'bg-blue-500' },
    { id: 'ens_payment', label: 'ENS Pay', icon: '🌐', color: 'bg-yellow-600' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cubepay-bg">
      {/* Layer 1: Camera View */}
      <CameraView onLocationUpdate={(lat, lon) => setUserLocation({ lat, lon })} />

      {/* Layer 2: Agent Overlay (Screen Mode) or GPS Cubes (GPS Mode) */}
      {viewMode === 'screen' ? (
        <AgentOverlay filter={filter} />
      ) : (
        userLocation && (
          <GPSCubeRenderer
            userLatitude={userLocation.lat}
            userLongitude={userLocation.lon}
            radius={1000}
          />
        )
      )}

      {/* Layer 3: Payment Cube (only when agent selected AND showCube is true) */}
      {showCube && selectedAgent && (
        <PaymentCube agent={selectedAgent} />
      )}

      {/* Layer 4: Payment Modal */}
      <PaymentModal />

      {/* Top Bar - Stats & Info */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-cubepay-card px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-sm text-cubepay-text">{agents.length} agents nearby</span>
              </div>
            </div>
            <div className="bg-cubepay-card px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                {viewMode === 'gps' ? (
                  <>
                    <Navigation size={16} className="text-green-400" />
                    <span className="text-sm text-cubepay-text">GPS Mode</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-green-400" />
                    <span className="text-sm text-cubepay-text">Screen Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'screen' ? 'gps' : 'screen')}
              className="px-4 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Navigation size={16} />
              {viewMode === 'screen' ? 'GPS' : 'Screen'}
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                showFilters ? 'bg-blue-600' : 'bg-cubepay-card'
              }`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter Buttons Panel */}
        {showFilters && (
          <div className="mt-4 bg-cubepay-card rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {filterButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as FilterType)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    filter === btn.id
                      ? `${btn.color} text-white shadow-lg scale-105`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-xl mb-1">{btn.icon}</div>
                  <div className="text-xs">{btn.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar - Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex justify-center space-x-4">
          {/* Test Button */}
          <button
            onClick={() => selectAgent(testAgent as any)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
          >
            <span className="text-2xl">🎲</span>
            <span>Test Payment Cube</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
