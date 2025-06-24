'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { logger } from '@/lib/utils/logger'

function QuantumParticles() {
  const meshRef = useRef<THREE.InstancedMesh | null>(null)
  const particleCount = 1000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    const matrix = new THREE.Matrix4()
    
    for (let i = 0; i < particleCount; i++) {
      const baseIndex = i * 3
      const baseX = positions.at(baseIndex) ?? 0
      const baseY = positions.at(baseIndex + 1) ?? 0
      const baseZ = positions.at(baseIndex + 2) ?? 0
      
      const x = baseX + Math.sin(time + i * 0.1) * 2
      const y = baseY + Math.cos(time + i * 0.1) * 2
      const z = baseZ + Math.sin(time * 0.5 + i * 0.1) * 2
      
      matrix.setPosition(x, y, z)
      matrix.scale(new THREE.Vector3(0.1, 0.1, 0.1))
      meshRef.current.setMatrixAt(i, matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    logger.info('Quantum visualization initialized', { particleCount })
  }, [particleCount])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#00ffff" emissive="#0088cc" emissiveIntensity={0.3} />
    </instancedMesh>
  )
}

export default function QuantumVisualizer() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        <QuantumParticles />
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  )
}