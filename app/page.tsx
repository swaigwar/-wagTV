'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useState } from 'react';
import ChannelSelector from '@/components/ui/channel-selector';
import OptimizedQuantumVisualizer from '@/components/swaig/optimized-quantum-visualizer';
import ErrorBoundary from '@/components/ui/error-boundary';
import SecurityBadge from '@/components/ui/SecurityBadge';
import { logger } from '@/lib/utils/logger';

function StarField() {
  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  );
}

function BigBangVisualizer() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl neon-text mb-4">Big Bang Cinema</h2>
        <p className="text-gray-300 mb-8">
          Ultra-cinematic cosmic origin story
        </p>
        <div className="glass-panel p-6 max-w-md">
          <p className="text-sm text-gray-400">
            Journey from the quantum fluctuations at the dawn of time to the
            formation of galaxies. Experience the universe&apos;s birth in
            stunning visual detail.
          </p>
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-80 transition-opacity">
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentChannel, setCurrentChannel] = useState('cosmic');

  useEffect(() => {
    setMounted(true);
    logger.info('Application mounted successfully');
    logger.info('Three.js Canvas initializing...');
  }, []);

  const renderChannel = () => {
    switch (currentChannel) {
      case 'quantum':
        logger.info('Rendering Quantum channel')
        return (
          <ErrorBoundary>
            <OptimizedQuantumVisualizer particleCount={100} />
          </ErrorBoundary>
        )
      case 'bigbang':
        logger.info('Rendering Big Bang channel')
        return (
          <ErrorBoundary>
            <BigBangVisualizer />
          </ErrorBoundary>
        )
      case 'cosmic':
      default:
        logger.info('Rendering Cosmic channel')
        return (
          <ErrorBoundary>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <StarField />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </ErrorBoundary>
        )
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400 text-xl">Loading SWAIG TV...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="relative w-full h-screen overflow-hidden bg-black">
        <ErrorBoundary>{renderChannel()}</ErrorBoundary>

        <div className="absolute top-4 left-4 z-10 glass-panel p-4">
          <h1 className="text-2xl font-bold neon-text mb-2">SWAIG TV</h1>
          <p className="text-gray-300 text-sm">Universal Quantum Simulation Platform</p>
          <SecurityBadge />
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ChannelSelector
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
          />
        </div>

        <div className="absolute bottom-4 right-4 z-10 glass-panel p-3">
          <p className="text-gray-400 text-xs">
            OG iNfinit€ J€st€R | GSG Inspired
          </p>
          <p className="text-gray-500 text-xs">Channel: {currentChannel}</p>
        </div>
      </main>
    </ErrorBoundary>
  )
}
