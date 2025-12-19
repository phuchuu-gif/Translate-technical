
import React, { useRef, useState, useEffect } from 'react';
import { X, Crop, MousePointer2 } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const RegionCapture: React.FC<Props> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function startCapture() {
      try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as any,
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error starting screen capture:", err);
        onCancel();
      }
    }
    startCapture();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    captureRegion();
  };

  const captureRegion = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate selection box
    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width < 5 || height < 5) return; // Prevent tiny accidental snips

    // Map screen coordinates to video resolution
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const scaleX = videoWidth / displayWidth;
    const scaleY = videoHeight / displayHeight;

    canvas.width = width * scaleX;
    canvas.height = height * scaleY;

    ctx.drawImage(
      video,
      left * scaleX, top * scaleY, width * scaleX, height * scaleY,
      0, 0, width * scaleX, height * scaleY
    );

    const base64 = canvas.toDataURL('image/png');
    onCapture(base64);
    stream?.getTracks().forEach(track => track.stop());
  };

  const rectStyle = {
    left: Math.min(startPos.x, currentPos.x),
    top: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black cursor-crosshair overflow-hidden">
      <video 
        ref={videoRef} 
        autoPlay 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      <div 
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isSelecting && (
          <div 
            className="absolute border-2 border-cad-accent bg-cad-accent/10 shadow-[0_0_15px_rgba(6,150,215,0.5)] pointer-events-none"
            style={rectStyle}
          />
        )}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-cad-900/90 border border-cad-600 px-6 py-3 rounded-full flex items-center gap-4 pointer-events-none shadow-2xl">
        <div className="bg-cad-accent p-1.5 rounded text-white animate-pulse">
          <Crop size={18} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">CHẾ ĐỘ QUÉT VÙNG</p>
          <p className="text-gray-400 text-xs">Nhấn giữ và kéo để chọn khu vực cần dịch</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          className="pointer-events-auto ml-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default RegionCapture;
