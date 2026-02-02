import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createCubePayDatabase } from '@cubepay/database-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ScreenPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  z_index: number;
}

function ScreenPositionPicker({ onSelect }: { onSelect: (pos: ScreenPosition) => void }) {
  const [position, setPosition] = useState<ScreenPosition>({ x: 50, y: 50, z_index: 1 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPos = { x, y, z_index: position.z_index };
    setPosition(newPos);
    onSelect(newPos);
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg cursor-crosshair overflow-hidden"
        onClick={handleClick}
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <div className="absolute w-full border-t border-blue-400" style={{ top: `${i * 10}%` }} />
              <div className="absolute h-full border-l border-blue-400" style={{ left: `${i * 10}%` }} />
            </React.Fragment>
          ))}
        </div>

        {/* Selected Position */}
        <div 
          className="absolute w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        />

        <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          Click to position agent on screen
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-1">X Position: {position.x.toFixed(1)}%</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={position.x}
            onChange={(e) => {
              const newPos = { ...position, x: parseFloat(e.target.value) };
              setPosition(newPos);
              onSelect(newPos);
            }}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-1">Y Position: {position.y.toFixed(1)}%</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={position.y}
            onChange={(e) => {
              const newPos = { ...position, y: parseFloat(e.target.value) };
              setPosition(newPos);
              onSelect(newPos);
            }}
            className="w-full"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm text-gray-300 mb-1">Z-Index: {position.z_index}</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            value={position.z_index}
            onChange={(e) => {
              const newPos = { ...position, z_index: parseInt(e.target.value) || 1 };
              setPosition(newPos);
              onSelect(newPos);
            }}
            className="w-full px-2 py-1 bg-gray-700 text-white rounded"
          />
        </div>
      </div>
    </div>
  );
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onSelect(lat, lng);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
      </MapContainer>
    </div>
  );
}

function App() {
  const [agentName, setAgentName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [screenPosition, setScreenPosition] = useState<ScreenPosition>({ x: 50, y: 50, z_index: 1 });
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeploy = async () => {
    if (!agentName || !location) {
      setMessage('❌ Please fill in agent name and select location');
      return;
    }

    setDeploying(true);
    setMessage('');

    try {
      const dbClient = createCubePayDatabase(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      await dbClient.deployAgent({
        agent_name: agentName,
        latitude: location.lat,
        longitude: location.lng,
        screen_position: screenPosition,
        payment_enabled: paymentEnabled,
      });

      setMessage('✅ Agent deployed successfully!');
      setAgentName('');
      setLocation(null);
    } catch (error) {
      setMessage(`❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎲 CubePay Deployment Hub</h1>
          <p className="text-gray-400">Deploy payment agents to real-world locations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Agent Info */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Agent Details</h2>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., Coffee Shop Agent"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentEnabled}
                    onChange={(e) => setPaymentEnabled(e.target.checked)}
                    className="w-5 h-5 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">Enable Payment Cube</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Screen Position</h2>
              <p className="text-sm text-gray-400 mb-4">Position where agent appears in AR view (percentage of screen)</p>
              <ScreenPositionPicker onSelect={setScreenPosition} />
            </div>

            <button
              onClick={handleDeploy}
              disabled={deploying || !agentName || !location}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors"
            >
              {deploying ? '🚀 Deploying...' : '🎲 Deploy Agent'}
            </button>

            {message && (
              <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Right Column - Location */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Physical Location</h2>
              <p className="text-sm text-gray-400 mb-4">Click on the map to select deployment location</p>
              <LocationPicker onSelect={(lat, lng) => setLocation({ lat, lng })} />
              {location && (
                <div className="mt-4 text-sm text-gray-300">
                  📍 Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
