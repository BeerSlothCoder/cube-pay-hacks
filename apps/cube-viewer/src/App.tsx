import React, { useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { AgentOverlay } from './components/AgentOverlay';
import { PaymentCube } from './components/PaymentCube';
import { PaymentModal } from './components/PaymentModal';
import { useAgentStore } from './stores/agentStore';
import { usePaymentStore } from './stores/paymentStore';
import { createCubePayDatabase } from '@cubepay/database-client';

function App() {
  const { loadAgents } = useAgentStore();
  const { selectedAgent, showCube, selectAgent } = usePaymentStore();

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cubepay-bg">
      {/* Layer 1: Camera View */}
      <CameraView />

      {/* Layer 2: Agent Overlay */}
      <AgentOverlay />

      {/* Layer 3: Payment Cube (only when agent selected AND showCube is true) */}
      {showCube && selectedAgent && (
        <PaymentCube agent={selectedAgent} />
      )}

      {/* Layer 4: Payment Modal */}
      <PaymentModal />

      {/* Test Button */}
      <button
        onClick={() => selectAgent(testAgent as any)}
        className="absolute bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
      >
        🎲 Show Payment Cube
      </button>
    </div>
  );
}

export default App;
