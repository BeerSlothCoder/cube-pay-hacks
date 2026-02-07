import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Popup,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  Navigation,
  Filter,
  X,
  ArrowLeft,
  DollarSign,
  Home,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useGeolocation, calculateDistance } from "../hooks/useGeolocation";
import { useAgentStore } from "../stores/agentStore";
import { createCubePayDatabase } from "@cubepay/database-client";
import type { DeployedObject } from "@cubepay/types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Fallback location: Center of Europe
const DEFAULT_CENTER = { latitude: 50.64, longitude: 13.83 };

// Agent type colors & icons
const AGENT_COLORS: Record<string, string> = {
  payment_terminal: "#22c55e",
  pos_terminal: "#22c55e",
  artm_terminal: "#22c55e",
  home_security: "#a855f7",
  content_creator: "#f97316",
};
const DEFAULT_AGENT_COLOR = "#94a3b8";

function getAgentColor(agentType?: string): string {
  if (!agentType) return DEFAULT_AGENT_COLOR;
  return AGENT_COLORS[agentType] ?? DEFAULT_AGENT_COLOR;
}

function getAgentIcon(agentType?: string) {
  switch (agentType) {
    case "payment_terminal":
    case "pos_terminal":
    case "artm_terminal":
      return DollarSign;
    case "home_security":
      return Home;
    case "content_creator":
      return User;
    default:
      return MapPin;
  }
}

function formatAgentType(type?: string): string {
  if (!type) return "Unknown";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

interface AgentWithDistance extends DeployedObject {
  _distance?: number;
}

interface AgentMapViewProps {
  onBack?: () => void;
}

export function AgentMapView({ onBack }: AgentMapViewProps) {
  // ---------- Data ----------
  const { agents, loadAgents } = useAgentStore();
  const { position, loading: geoLoading } = useGeolocation();

  // ---------- Map state ----------
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: 13,
  });

  // ---------- UI state ----------
  const [selectedAgent, setSelectedAgent] = useState<AgentWithDistance | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [_mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // ---------- Filters ----------
  const [networkFilter, setNetworkFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [radiusKm, setRadiusKm] = useState(10);

  const mapRef = useRef<any>(null);

  // Load agents on mount
  useEffect(() => {
    const db = createCubePayDatabase(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    );
    loadAgents(db);
  }, [loadAgents]);

  // Center map on user location once available
  useEffect(() => {
    if (position) {
      setViewState((v) => ({
        ...v,
        longitude: position.longitude,
        latitude: position.latitude,
        zoom: 14,
      }));
    }
  }, [position?.latitude, position?.longitude]);

  // ---------- Derived data ----------
  const userLat = position?.latitude ?? DEFAULT_CENTER.latitude;
  const userLon = position?.longitude ?? DEFAULT_CENTER.longitude;

  const agentsWithDistance: AgentWithDistance[] = useMemo(() => {
    return agents
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => ({
        ...a,
        _distance: calculateDistance(
          userLat,
          userLon,
          a.latitude!,
          a.longitude!,
        ),
      }));
  }, [agents, userLat, userLon]);

  // Available networks / types for filter dropdowns
  const availableNetworks = useMemo(() => {
    const nets = new Set<string>();
    agentsWithDistance.forEach((a) => {
      if (a.deployment_network) nets.add(a.deployment_network);
    });
    return Array.from(nets).sort();
  }, [agentsWithDistance]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    agentsWithDistance.forEach((a) => {
      if (a.agent_type) types.add(a.agent_type);
    });
    return Array.from(types).sort();
  }, [agentsWithDistance]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agentsWithDistance.filter((a) => {
      if (networkFilter !== "all" && a.deployment_network !== networkFilter)
        return false;
      if (typeFilter !== "all" && a.agent_type !== typeFilter) return false;
      if (a._distance != null && a._distance > radiusKm * 1000) return false;
      return true;
    });
  }, [agentsWithDistance, networkFilter, typeFilter, radiusKm]);

  // ---------- Callbacks ----------
  const handleRecenter = useCallback(() => {
    if (position) {
      setViewState((v) => ({
        ...v,
        longitude: position.longitude,
        latitude: position.latitude,
        zoom: 14,
      }));
    }
  }, [position]);

  const handleMarkerClick = useCallback((agent: AgentWithDistance) => {
    setSelectedAgent(agent);
    setViewState((v) => ({
      ...v,
      longitude: agent.longitude!,
      latitude: agent.latitude!,
    }));
  }, []);

  const handleViewInAR = useCallback(() => {
    if (!selectedAgent) return;
    // Navigate to AR viewer — use query param
    const params = new URLSearchParams({ agentId: selectedAgent.id });
    window.location.hash = `#/ar-view?${params.toString()}`;
    if (onBack) onBack();
  }, [selectedAgent, onBack]);

  // ---------- Map style (memoized) ----------
  const mapStyle = useMemo(() => "mapbox://styles/mapbox/dark-v11", []);

  // ---------- Loading / Error states ----------
  if (geoLoading && !position) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950">
        <Loader2 size={48} className="text-green-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Loading Agent Map...
        </h2>
        <p className="text-slate-400 text-sm">
          Getting your location and nearby agents
        </p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Map Error</h2>
        <p className="text-slate-400 text-sm mb-6">{mapError}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950">
      {/* ===== Mapbox Map ===== */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onLoad={() => setMapLoaded(true)}
        onError={(e: any) =>
          setMapError(e.error?.message ?? "Failed to load map")
        }
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showAccuracyCircle={false}
        />

        {/* User Location Marker — pulsing blue dot */}
        {position && (
          <Marker
            longitude={position.longitude}
            latitude={position.latitude}
            anchor="center"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 relative" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-50" />
            </div>
          </Marker>
        )}

        {/* Agent Markers */}
        {filteredAgents.map((agent) => {
          const color = getAgentColor(agent.agent_type);
          const Icon = getAgentIcon(agent.agent_type);
          return (
            <Marker
              key={agent.id}
              longitude={agent.longitude!}
              latitude={agent.latitude!}
              anchor="bottom"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(agent);
              }}
            >
              <div
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                style={{ filter: `drop-shadow(0 2px 4px ${color}66)` }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={16} className="text-white" />
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Agent Info Popup */}
        {selectedAgent && selectedAgent.longitude && selectedAgent.latitude && (
          <Popup
            longitude={selectedAgent.longitude}
            latitude={selectedAgent.latitude}
            anchor="bottom"
            onClose={() => setSelectedAgent(null)}
            closeButton={false}
            closeOnClick={false}
            className="agent-map-popup"
            offset={20}
          >
            <div className="bg-slate-900 rounded-xl p-4 min-w-[240px] max-w-[280px] relative border border-slate-700">
              {/* Close button */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              {/* Agent name */}
              <h3 className="text-white font-bold text-sm pr-6 mb-2">
                {selectedAgent.agent_name}
              </h3>

              {/* Type badge */}
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mb-2"
                style={{
                  backgroundColor: getAgentColor(selectedAgent.agent_type),
                }}
              >
                {formatAgentType(selectedAgent.agent_type)}
              </span>

              {/* Distance */}
              {selectedAgent._distance != null && (
                <p className="text-slate-400 text-xs mb-1">
                  📍 {formatDistance(selectedAgent._distance)} away
                </p>
              )}

              {/* Network */}
              {selectedAgent.deployment_network && (
                <p className="text-slate-400 text-xs mb-1">
                  🌐 {selectedAgent.deployment_network}
                </p>
              )}

              {/* Fee */}
              {selectedAgent.payment_config?.default_amount != null && (
                <p className="text-slate-400 text-xs mb-1">
                  💰 {selectedAgent.payment_config.default_amount}{" "}
                  {selectedAgent.payment_config.currency ?? "USDC"}
                </p>
              )}

              {/* Description */}
              {selectedAgent.agent_description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                  {selectedAgent.agent_description}
                </p>
              )}

              {/* View in AR button */}
              <button
                onClick={handleViewInAR}
                className="mt-3 w-full py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                View in AR
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* ===== Header ===== */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg backdrop-blur-sm transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-white font-bold text-lg">Agent Map</h1>
            <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs rounded-full font-medium">
              {filteredAgents.length}
            </span>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
              showFilters ? "bg-blue-600" : "bg-slate-800/80 hover:bg-slate-700"
            }`}
          >
            <Filter size={20} className="text-white" />
          </button>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilters && (
          <div className="mt-3 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 space-y-3 pointer-events-auto">
            {/* Network filter */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">
                Network
              </label>
              <select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg border border-slate-700 focus:border-blue-500 outline-none"
              >
                <option value="all">All Networks</option>
                {availableNetworks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">
                Agent Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg border border-slate-700 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {formatAgentType(t)}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius slider */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">
                Search Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Re-center button (bottom-right) ===== */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-20 right-4 z-10 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full backdrop-blur-sm shadow-lg transition-colors"
      >
        <Navigation size={20} className="text-green-400" />
      </button>

      {/* ===== Agent count footer ===== */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg">
        <MapPin size={14} className="text-green-400" />
        <span className="text-slate-300 text-xs font-medium">
          {filteredAgents.length} nearby agent
          {filteredAgents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ===== Custom Mapbox popup styles ===== */}
      <style>{`
        .agent-map-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .agent-map-popup .mapboxgl-popup-tip {
          border-top-color: #0f172a !important;
        }
        .agent-map-popup .mapboxgl-popup-close-btn {
          display: none;
        }
      `}</style>
    </div>
  );
}
