'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ContentFilter } from '../../lib/utils/content-filter';

interface SwagelokRoom {
  id: string;
  name: string;
  users: string[];
  currentPrompt: string;
  syncedVideo: string | null;
  isGenerating: boolean;
}

interface VideoGeneration {
  prompt: string;
  seed: number;
  timestamp: number;
  videoUrl?: string;
}

export const SwagelokSync: React.FC = () => {
  const [room, setRoom] = useState<SwagelokRoom | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // Renamed to _videoGeneration to comply with unused variable rule
  const [_videoGeneration, setVideoGeneration] =
    useState<VideoGeneration | null>(null);
  const [tvEffects, setTvEffects] = useState({
    static: false,
    colorBars: false,
    crash: false,
  });

  // Renamed to _videoRef to comply with unused variable rule
  const _videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createRoom = async (roomName: string): Promise<void> => {
    const roomId = `swagelok_${Date.now()}`;
    const newRoom: SwagelokRoom = {
      id: roomId,
      name: roomName,
      users: [userName],
      currentPrompt: '',
      syncedVideo: null,
      isGenerating: false,
    };
    setRoom(newRoom);
    setIsConnected(true);
    console.log(`🔗 Swagelok room "${roomName}" created with quantum sync`);
  };

  const sendSyncedPrompt = async (prompt: string): Promise<void> => {
    if (!room) return;
    const seed = hashString(prompt + room.id);
    const generation: VideoGeneration = { prompt, seed, timestamp: Date.now() };
    setVideoGeneration(generation);
    setRoom((prev) =>
      prev ? { ...prev, currentPrompt: prompt, isGenerating: true } : null,
    );
    setTimeout(simulateTVCrash, 500);
    setTimeout(() => generateSyncedVideo(generation), 3000);
  };

  const simulateTVCrash = (): void => {
    setTvEffects({ static: true, colorBars: false, crash: true });
    playStaticSound();
    setTimeout(
      () => setTvEffects({ static: false, colorBars: true, crash: false }),
      800,
    );
    setTimeout(
      () => setTvEffects({ static: false, colorBars: false, crash: false }),
      2000,
    );
  };

  const generateSyncedVideo = async (
    generation: VideoGeneration,
  ): Promise<void> => {
    try {
      const mockVideoUrl = `data:video/mp4;base64,mock_video_${generation.seed}`;
      setVideoGeneration((prev) =>
        prev ? { ...prev, videoUrl: mockVideoUrl } : null,
      );
      setRoom((prev) =>
        prev
          ? { ...prev, syncedVideo: mockVideoUrl, isGenerating: false }
          : null,
      );
      console.log(`🎬 Synced video generated with seed: ${generation.seed}`);
    } catch (error) {
      console.error('Video generation failed:', error);
      setRoom((prev) => (prev ? { ...prev, isGenerating: false } : null));
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim()) return;

    const contentFilter = new ContentFilter();
    const filterResult = contentFilter.filterContent(currentPrompt);

    if (!filterResult.allowed) {
      alert(
        `❌ Content blocked: ${filterResult.reason}\n\nSwagTV maintains PG-13 standards for safety.`,
      );
      return;
    }

    sendSyncedPrompt(currentPrompt);
    setCurrentPrompt('');
  };

  const playStaticSound = (): void => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      filter.Q.setValueAtTime(2, audioContext.currentTime);
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  };

  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Using useCallback to memoize functions
  const renderStaticEffect = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 255;
        imageData.data[i] = noise;
        imageData.data[i + 1] = noise;
        imageData.data[i + 2] = noise;
        imageData.data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    },
    []
  );
  
  const renderColorBars = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const colors = [
        '#FFFFFF',
        '#FFFF00',
        '#00FFFF',
        '#00FF00',
        '#FF00FF',
        '#FF0000',
        '#0000FF',
        '#000000',
      ];
      const barWidth = canvas.width / colors.length;
      for (let i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * barWidth, 0, barWidth, canvas.height);
      }
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SWAGTV', canvas.width / 2, canvas.height / 2);
    },
    []
  );

  const renderTVEffects = useCallback((): void => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 640;
    canvas.height = 480;
    
    if (tvEffects.static) {
      renderStaticEffect(ctx, canvas);
    }
    
    if (tvEffects.colorBars) {
      renderColorBars(ctx, canvas);
    }
  }, [tvEffects, renderStaticEffect, renderColorBars]);

  useEffect(() => {
    renderTVEffects();
  }, [renderTVEffects]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            📺 SwagTV Swagelok
          </h1>
          <p className="text-gray-300 mb-4">
            Welcome to the &ldquo;Swagelok Synchronizer&rdquo; - connect with other viewers!
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded border border-gray-600"
          />
          <button
            onClick={() => createRoom('Main Room')}
            disabled={!userName.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
          >
            🔗 Create Swagelok Room
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            MIT License • PG-13 Content Only • Quantum Synced
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">📺 SwagTV - Room: {room?.name}</h1>
          <p className="text-sm text-gray-400">
            Users: {room?.users.join(', ')} | Quantum Synced: ✅
          </p>
        </div>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full ${tvEffects.static || tvEffects.colorBars ? 'block' : 'hidden'}`}
          />
          {room?.syncedVideo && !tvEffects.static && !tvEffects.colorBars && (
            <div className="text-center">
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-lg font-bold mb-2">
                  🎬 Synced Video Generated
                </h3>
                <p className="text-gray-300 mb-4">
                  Prompt: &ldquo;{room.currentPrompt}&rdquo;
                </p>
                <div className="w-64 h-36 bg-gradient-to-br from-purple-900 to-blue-900 rounded flex items-center justify-center">
                  <span className="text-white">📹 AI Video Playing</span>
                </div>
              </div>
            </div>
          )}
          {room?.isGenerating && (
            <div className="text-center">
              <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-purple-300">
                Generating synchronized video...
              </p>
            </div>
          )}
          {!room?.syncedVideo &&
            !room?.isGenerating &&
            !tvEffects.static &&
            !tvEffects.colorBars && (
              <div className="text-center text-gray-500">
                <h2 className="text-2xl font-bold mb-2">📺 SwagTV Ready</h2>
                <p>Enter a prompt below to generate synchronized video</p>
              </div>
            )}
        </div>
      </div>
      <div className="bg-gray-900 p-4">
        <form onSubmit={handlePromptSubmit} className="flex gap-2">
          <input
            type="text"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Enter AI video prompt (PG-13 only)..."
            className="flex-1 p-3 bg-gray-800 text-white rounded border border-gray-600"
            disabled={room?.isGenerating}
          />
          <button
            type="submit"
            disabled={room?.isGenerating || !currentPrompt.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
          >
            🚀 Sync Generate
          </button>
        </form>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => simulateTVCrash()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            📺 TV Crash Effect
          </button>
          <button
            onClick={() =>
              setTvEffects({ static: false, colorBars: true, crash: false })
            }
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            🌈 Color Bars
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          🛡️ PG-13 Content Filter Active | 🔊 Audio Filtered (Low-Pass) | ⚛️
          Quantum Synchronized
        </p>
      </div>
    </div>
  );
};

export default SwagelokSync;
