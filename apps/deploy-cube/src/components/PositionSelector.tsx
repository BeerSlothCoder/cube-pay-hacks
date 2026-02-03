import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Monitor, Navigation, Locate } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

interface ScreenPosition {
  x: number;
  y: number;
  z_index: number;
}

interface PositionSelectorProps {
  gpsPosition: GPSPosition;
  screenPosition: ScreenPosition;
  onGPSChange: (position: GPSPosition) => void;
  onScreenChange: (position: ScreenPosition) => void;
}

// Map click handler component
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  gpsPosition,
  screenPosition,
  onGPSChange,
  onScreenChange,
}) => {
  const [positionMode, setPositionMode] = useState<"gps" | "screen">("gps");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    onGPSChange({
      ...gpsPosition,
      latitude: lat,
      longitude: lng,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onGPSChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || 0,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onScreenChange({
      ...screenPosition,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Position Mode Toggle */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setPositionMode("gps")}
          className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            positionMode === "gps"
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="font-semibold">GPS Position</span>
        </button>
        <button
          type="button"
          onClick={() => setPositionMode("screen")}
          className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            positionMode === "screen"
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
          }`}
        >
          <Monitor className="w-5 h-5" />
          <span className="font-semibold">Screen Position</span>
        </button>
      </div>

      {/* GPS Position */}
      {positionMode === "gps" && (
        <div className="space-y-4">
          {/* Get Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGettingLocation ? (
              <>
                <Navigation className="w-5 h-5 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Locate className="w-5 h-5" />
                Use My Current Location
              </>
            )}
          </button>

          {locationError && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {locationError}
            </div>
          )}

          {/* Map */}
          <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-700">
            <MapContainer
              center={[gpsPosition.latitude, gpsPosition.longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              key={`${gpsPosition.latitude}-${gpsPosition.longitude}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[gpsPosition.latitude, gpsPosition.longitude]}
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-400 text-center">
            Click on the map to set agent location
          </p>

          {/* GPS Coordinates Input */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Latitude
              </label>
              <input
                type="number"
                value={gpsPosition.latitude}
                onChange={(e) =>
                  onGPSChange({
                    ...gpsPosition,
                    latitude: parseFloat(e.target.value) || 0,
                  })
                }
                step="0.000001"
                min="-90"
                max="90"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Longitude
              </label>
              <input
                type="number"
                value={gpsPosition.longitude}
                onChange={(e) =>
                  onGPSChange({
                    ...gpsPosition,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                step="0.000001"
                min="-180"
                max="180"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Altitude (m)
              </label>
              <input
                type="number"
                value={gpsPosition.altitude}
                onChange={(e) =>
                  onGPSChange({
                    ...gpsPosition,
                    altitude: parseFloat(e.target.value) || 0,
                  })
                }
                step="1"
                min="-500"
                max="10000"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* GPS Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              GPS Position Info
            </h4>
            <p className="text-xs text-gray-400">
              This determines where the payment cube appears in AR when users
              are nearby. The cube will be visible within a configurable radius
              from this location.
            </p>
          </div>
        </div>
      )}

      {/* Screen Position */}
      {positionMode === "screen" && (
        <div className="space-y-4">
          {/* Screen Preview */}
          <div
            className="relative w-full h-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg cursor-crosshair overflow-hidden border-2 border-gray-700"
            onClick={handleScreenClick}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-600" />
              <div className="absolute top-2/4 left-0 right-0 h-px bg-gray-500" />
              <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-600" />
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-600" />
              <div className="absolute left-2/4 top-0 bottom-0 w-px bg-gray-500" />
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-600" />
            </div>

            {/* Position Marker */}
            <div
              className="absolute w-12 h-12 -ml-6 -mt-6 transition-all"
              style={{
                left: `${screenPosition.x}%`,
                top: `${screenPosition.y}%`,
                zIndex: screenPosition.z_index,
              }}
            >
              <div className="w-full h-full bg-blue-500 rounded-lg shadow-lg shadow-blue-500/50 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-blue-400 rounded" />
              </div>
            </div>

            {/* Coordinates Display */}
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded text-xs text-cream font-mono">
              X: {screenPosition.x.toFixed(1)}% | Y:{" "}
              {screenPosition.y.toFixed(1)}% | Z: {screenPosition.z_index}
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center">
            Click on the screen to position the payment cube
          </p>

          {/* Screen Position Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                X Position (%)
              </label>
              <input
                type="number"
                value={screenPosition.x}
                onChange={(e) =>
                  onScreenChange({
                    ...screenPosition,
                    x: Math.max(
                      0,
                      Math.min(100, parseFloat(e.target.value) || 0),
                    ),
                  })
                }
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Left to Right</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Y Position (%)
              </label>
              <input
                type="number"
                value={screenPosition.y}
                onChange={(e) =>
                  onScreenChange({
                    ...screenPosition,
                    y: Math.max(
                      0,
                      Math.min(100, parseFloat(e.target.value) || 0),
                    ),
                  })
                }
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Top to Bottom</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Z-Index
              </label>
              <input
                type="number"
                value={screenPosition.z_index}
                onChange={(e) =>
                  onScreenChange({
                    ...screenPosition,
                    z_index: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                step="1"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-cream text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Layer order</p>
            </div>
          </div>

          {/* Screen Position Presets */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Top Left", x: 20, y: 20 },
              { label: "Top Center", x: 50, y: 20 },
              { label: "Top Right", x: 80, y: 20 },
              { label: "Center Left", x: 20, y: 50 },
              { label: "Center", x: 50, y: 50 },
              { label: "Center Right", x: 80, y: 50 },
              { label: "Bottom Left", x: 20, y: 80 },
              { label: "Bottom Center", x: 50, y: 80 },
              { label: "Bottom Right", x: 80, y: 80 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onScreenChange({
                    ...screenPosition,
                    x: preset.x,
                    y: preset.y,
                  })
                }
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-cream hover:bg-gray-700 hover:border-blue-500 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Screen Position Info */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">
              Screen Position Info
            </h4>
            <p className="text-xs text-gray-400">
              This determines where the payment cube appears on the user's
              screen in AR mode. The cube will be overlaid at this position
              relative to the camera view.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
