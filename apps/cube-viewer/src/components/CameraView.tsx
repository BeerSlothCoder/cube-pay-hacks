import React, { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPin, Navigation } from 'lucide-react';

interface CameraViewProps {
  onLocationUpdate?: (lat: number, lon: number) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onLocationUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const { position, error: gpsError, loading: gpsLoading } = useGeolocation();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setCameraActive(true);
              setError('');
            }).catch(err => {
              console.error('❌ Camera error:', err.message);
              setError('Could not start video source');
              setUseFallback(true);
            });
          };
        }
      } catch (err) {
        console.error('❌ Camera error:', err instanceof Error ? err.message : 'Unknown error');
        setError('Could not start video source');
        setUseFallback(true);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update parent component with GPS position
  useEffect(() => {
    if (position && onLocationUpdate) {
      onLocationUpdate(position.latitude, position.longitude);
    }
  }, [position, onLocationUpdate]);

  useEffect(() => {
    if (!useFallback || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw AR grid fallback
    ctx.fillStyle = '#0A0E1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0A0E1A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw crosshair at center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY);
    ctx.lineTo(centerX + 30, centerY);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#00D4FF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AR VIEW - DEMO MODE', centerX, centerY + 60);
  }, [useFallback]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      {!useFallback ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}

      {/* Status indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Camera status */}
        <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${
            cameraActive ? 'bg-green-500' : 
            useFallback ? 'bg-yellow-500' : 
            error ? 'bg-red-500' : 'bg-blue-500'
          }`} />
          <span className="text-white text-sm font-medium">
            {cameraActive ? 'Camera Active' : 
             useFallback ? 'AR Demo Mode' : 
             error ? 'Camera Error' : 'Initializing...'}
          </span>
        </div>

        {/* GPS status */}
        {position && (
          <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <MapPin size={16} className="text-green-500" />
            <span className="text-white text-xs font-mono">
              {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {/* GPS accuracy */}
        {position && (
          <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <Navigation size={16} className="text-blue-400" />
            <span className="text-white text-xs">
              Accuracy: ±{position.accuracy.toFixed(0)}m
            </span>
          </div>
        )}

        {/* GPS error */}
        {gpsError && (
          <div className="flex items-center gap-2 bg-red-900 bg-opacity-50 px-3 py-2 rounded-lg border border-red-600">
            <MapPin size={16} className="text-red-400" />
            <span className="text-white text-xs">
              GPS Error: {gpsError.message}
            </span>
          </div>
        )}
      </div> 
           error ? 'Camera Error' : 'Requesting Camera...'}
        </span>
      </div>
    </div>
  );
};
