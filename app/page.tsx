'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useEffect, useState } from 'react'

function StarField() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('SWAIG TV: Application mounted successfully')
    console.log('SWAIG TV: Three.js Canvas initializing...')
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-cyan-400 text-xl">Loading SWAIG TV...</div>
      </div>
    )
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <StarField />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      <div className="absolute top-4 left-4 z-10 glass-panel p-4">
        <h1 className="text-2xl font-bold neon-text mb-2">SWAIG TV</h1>
        <p className="text-gray-300 text-sm">Universal Quantum Simulation Platform</p>
        <p className="text-gray-400 text-xs mt-2">Alpha v1.0.0</p>
      </div>

      <div className="absolute bottom-4 right-4 z-10 glass-panel p-3">
        <p className="text-gray-400 text-xs">OG iNfinit€ J€st€R | GSG Inspired</p>
        <p className="text-gray-500 text-xs">Move to navigate</p>
      </div>
    </main>
  )
}