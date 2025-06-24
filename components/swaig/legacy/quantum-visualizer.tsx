'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { logger } from '@/lib/utils/logger'
import rateLimiter from '@/lib/utils/rate-limiter'
import aiSanitizer from '@/lib/utils/ai-sanitizer'

// Maximum number of particles allowed
const DEFAULT_PARTICLE_COUNT = 1000
const MAX_PARTICLE_COUNT = parseInt(process.env.NEXT_PUBLIC_MAX_PARTICLES || '2000')

// Default user ID if not provided
const DEFAULT_USER_ID = 'anonymous'

// Define the allowed user configuration interface
interface QuantumConfig {
  speedFactor?: number;
  scaleFactor?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}

function QuantumParticles({
  particleCount = DEFAULT_PARTICLE_COUNT,
  userConfig = {}
}: {
  particleCount?: number,
  userConfig?: QuantumConfig
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null)

  // Apply input validation to particle count
  const validatedParticleCount = Math.min(
    Math.max(10, particleCount), // Minimum of 10 particles
    MAX_PARTICLE_COUNT           // Maximum defined by environment variable
  )

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

      return JSON.parse(configStr) as QuantumConfig;
    } catch (error) {
      logger.error('Error sanitizing user configuration', { error });
      return {} as QuantumConfig;
    }
  }, [userConfig]);

  const positions = useMemo(() => {
    const pos = new Float32Array(validatedParticleCount * 3)
    for (let i = 0; i < validatedParticleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [validatedParticleCount])

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()
    const matrix = new THREE.Matrix4()

    for (let i = 0; i < validatedParticleCount; i++) {
      const baseIndex = i * 3
      const baseX = positions.at(baseIndex) ?? 0
      const baseY = positions.at(baseIndex + 1) ?? 0
      const baseZ = positions.at(baseIndex + 2) ?? 0

      // Apply any sanitized user configuration to the animation
      const speedFactor = sanitizedConfig?.speedFactor || 1.0
      const scaleFactor = sanitizedConfig?.scaleFactor || 1.0

      const x = baseX + Math.sin(time + i * 0.1) * 2 * speedFactor
      const y = baseY + Math.cos(time + i * 0.1) * 2 * speedFactor
      const z = baseZ + Math.sin(time * 0.5 + i * 0.1) * 2 * speedFactor

      matrix.setPosition(x, y, z)

      // Apply validated scale factor with safety limits
      const safeScaleFactor = Math.min(Math.max(0.01, scaleFactor), 5.0)
      matrix.scale(new THREE.Vector3(0.1 * safeScaleFactor, 0.1 * safeScaleFactor, 0.1 * safeScaleFactor))

      meshRef.current.setMatrixAt(i, matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    logger.info('Quantum visualization initialized', {
      particleCount: validatedParticleCount,
      hasUserConfig: Object.keys(sanitizedConfig).length > 0
    })
  }, [validatedParticleCount, sanitizedConfig])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, validatedParticleCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={sanitizedConfig?.color || "#00ffff"}
        emissive={sanitizedConfig?.emissive || "#0088cc"}
        emissiveIntensity={Math.min(Math.max(0, sanitizedConfig?.emissiveIntensity || 0.3), 1)}
      />
    </instancedMesh>
  )
}

interface QuantumVisualizerProps {
  userId?: string;
  particleCount?: number;
  userConfig?: QuantumConfig;
}

export default function QuantumVisualizer({
  userId = DEFAULT_USER_ID,
  particleCount = DEFAULT_PARTICLE_COUNT,
  userConfig = {}
}: QuantumVisualizerProps) {
  const [error, setError] = useState<string | null>(null);

  // Check rate limiting
  useEffect(() => {
    const canProceed = rateLimiter.check(userId, 'quantum-visualizer');

    if (!canProceed) {
      setError('Rate limit exceeded. Please try again later.');
      logger.warn('Rate limit exceeded for quantum visualizer', { userId });
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
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        <QuantumParticles particleCount={particleCount} userConfig={userConfig} />
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  )
}
