'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect, memo } from 'react'
import * as THREE from 'three'
import { logger } from '@/lib/utils/logger'

const MAX_PARTICLES = parseInt(process.env['NEXT_PUBLIC_MAX_PARTICLES'] || '1000')

const QuantumParticles = memo(function QuantumParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const particleCount = Math.min(MAX_PARTICLES, 500) // Reduced for better performance
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 50
      pos[i3 + 1] = (Math.random() - 0.5) * 50
      pos[i3 + 2] = (Math.random() - 0.5) * 50
      
      // Vary colors for visual interest
      const hue = (i / particleCount) * 360
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6)
      col[i3] = color.r
      col[i3 + 1] = color.g
      col[i3 + 2] = color.b
    }
    
    return { positions: pos, colors: col }
  }, [particleCount])

  // Optimize animation loop with reduced calculations
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    const matrix = new THREE.Matrix4()
    const scale = new THREE.Vector3(0.1, 0.1, 0.1)
    
    // Update only every other frame for performance
    if (Math.floor(time * 60) % 2 === 0) {
      for (let i = 0; i < particleCount; i++) {
        const baseIndex = i * 3
        const baseX = positions[baseIndex] ?? 0
        const baseY = positions[baseIndex + 1] ?? 0
        const baseZ = positions[baseIndex + 2] ?? 0
        
        // Simplified animation calculations
        const phase = i * 0.1
        const x = baseX + Math.sin(time + phase) * 1.5
        const y = baseY + Math.cos(time + phase) * 1.5
        const z = baseZ + Math.sin(time * 0.3 + phase) * 1.5
        
        matrix.setPosition(x, y, z)
        matrix.scale(scale)
        meshRef.current.setMatrixAt(i, matrix)
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  useEffect(() => {
    logger.info('Optimized quantum visualization initialized', { 
      particleCount,
      maxParticles: MAX_PARTICLES 
    })
  }, [particleCount])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.8}
      />
    </instancedMesh>
  )
})

export default function OptimizedQuantumVisualizer() {
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
        <QuantumParticles />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          maxDistance={50}
          minDistance={10}
        />
      </Canvas>
    </div>
  )
}