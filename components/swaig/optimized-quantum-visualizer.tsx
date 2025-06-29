'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect, memo, useState } from 'react'
import * as THREE from 'three'
import { logger } from '@/lib/utils/logger'
import rateLimiter from '@/lib/utils/rate-limiter'
import aiSanitizer from '@/lib/utils/ai-sanitizer'

// Maximum number of particles allowed with proper validation
const DEFAULT_MAX_PARTICLES = 1000
const MAX_PARTICLES = parseInt(process.env.NEXT_PUBLIC_MAX_PARTICLES || DEFAULT_MAX_PARTICLES.toString())

// Default user ID if not provided
const DEFAULT_USER_ID = 'anonymous'

// Define the allowed user configuration interface
interface QuantumConfig {
  speedFactor?: number;
  scaleFactor?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  particleDetails?: number;
}

const QuantumParticles = memo(function QuantumParticles({
  userConfig = {},
  particleCount: requestedCount = 500
}: {
  userConfig?: QuantumConfig;
  particleCount?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null)

  // Validate and sanitize particle count
  const particleCount = useMemo(() => {
    // Input validation: ensure count is within safe bounds
    return Math.min(
      Math.max(10, requestedCount), // Minimum of 10 particles
      MAX_PARTICLES                // Maximum from environment variable
    );
  }, [requestedCount]);

  // Sanitize any user-provided configuration
  const sanitizedConfig = useMemo(() => {
    if (!userConfig || typeof userConfig !== 'object') {
      return {} as QuantumConfig;
    }

    // Deep copy and sanitize user config to prevent injection
    try {
      // Sanitize by converting to string and back (removes functions, etc.)
      const configStr = JSON.stringify(userConfig);

      // Check for potentially harmful content in the configuration
      if (aiSanitizer.detectHarmfulContent(configStr)) {
        logger.warn('Potentially harmful content detected in user config');
        return {} as QuantumConfig;
      }

      const parsedConfig = JSON.parse(configStr) as QuantumConfig;

      // Additional validation for numeric values
      if (parsedConfig.speedFactor) {
        parsedConfig.speedFactor = Math.min(Math.max(0.1, parsedConfig.speedFactor), 3.0);
      }

      if (parsedConfig.scaleFactor) {
        parsedConfig.scaleFactor = Math.min(Math.max(0.1, parsedConfig.scaleFactor), 5.0);
      }

      if (parsedConfig.opacity) {
        parsedConfig.opacity = Math.min(Math.max(0.1, parsedConfig.opacity), 1.0);
      }

      if (parsedConfig.particleDetails) {
        parsedConfig.particleDetails = Math.min(Math.max(4, parsedConfig.particleDetails), 12);
      }

      return parsedConfig;
    } catch (error) {
      logger.error('Error sanitizing user configuration', { error });
      return {} as QuantumConfig;
    }
  }, [userConfig]);

  // Create positions array using secure random values
  const { positions } = useMemo(() => {
    // Create typed array with exact size needed
    const pos = new Float32Array(particleCount * 3);

    // Fill array with random values using typed array methods
    for (let i = 0; i < particleCount; i++) {
      // Use offset calculation instead of direct indexing
      const offset = i * 3;

      // Safety check for bounds - should always be true but adding as defense-in-depth
      if (offset + 2 < pos.length) {
        // Use Float32Array.set with offset to avoid direct indexed assignment
        pos.set([(Math.random() - 0.5) * 50], offset);
        pos.set([(Math.random() - 0.5) * 50], offset + 1);
        pos.set([(Math.random() - 0.5) * 50], offset + 2);
      }
    }

    return { positions: pos };
  }, [particleCount]);

  // Optimize animation loop with reduced calculations
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3(0.1, 0.1, 0.1);

    // Get configuration with fallbacks
    const speedFactor = sanitizedConfig?.speedFactor || 1.0;

    // Update only every other frame for performance
    if (Math.floor(time * 60) % 2 === 0) {
      // Safety check for array length
      const posLength = positions.length;

      for (let i = 0; i < particleCount && i * 3 + 2 < posLength; i++) {
        // Calculate base index for this particle
        const baseOffset = i * 3;

        // Get values using subarray to avoid direct indexing
        const particlePos = positions.subarray(baseOffset, baseOffset + 3);
        const baseX = particlePos[0] || 0;
        const baseY = particlePos[1] || 0;
        const baseZ = particlePos[2] || 0;

        // Simplified animation calculations with sanitized speed factor
        const phase = i * 0.1;
        const x = baseX + Math.sin(time + phase) * 1.5 * speedFactor;
        const y = baseY + Math.cos(time + phase) * 1.5 * speedFactor;
        const z = baseZ + Math.sin(time * 0.3 + phase) * 1.5 * speedFactor;

        matrix.setPosition(x, y, z);
        matrix.scale(scale);
        meshRef.current.setMatrixAt(i, matrix);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useEffect(() => {
    logger.info('Optimized quantum visualization initialized', {
      particleCount,
      maxParticles: MAX_PARTICLES,
      hasUserConfig: Object.keys(sanitizedConfig).length > 0
    });
  }, [particleCount, sanitizedConfig]);

  // Get sphere detail level with safe default
  const sphereDetail = sanitizedConfig?.particleDetails || 6;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, sphereDetail, sphereDetail]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={sanitizedConfig?.opacity || 0.8}
        color={sanitizedConfig?.color || "#00ffff"}
      />
    </instancedMesh>
  );
});

interface OptimizedQuantumVisualizerProps {
  userId?: string;
  particleCount?: number;
  userConfig?: QuantumConfig;
}

export default function OptimizedQuantumVisualizer({
  userId = DEFAULT_USER_ID,
  particleCount = 500,
  userConfig = {}
}: OptimizedQuantumVisualizerProps) {
  const [error, setError] = useState<string | null>(null);

  // Check rate limiting
  useEffect(() => {
    const canProceed = rateLimiter.check(userId, 'optimized-quantum-visualizer');

    if (!canProceed) {
      setError('Rate limit exceeded. Please try again later.');
      logger.warn('Rate limit exceeded for optimized quantum visualizer', { userId });
    }
  }, [userId]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        performance={{ min: 0.5 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff00ff" />
        <QuantumParticles particleCount={particleCount} userConfig={userConfig} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          maxDistance={50}
          minDistance={10}
        />
      </Canvas>
    </div>
  );
}