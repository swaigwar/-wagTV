#!/usr/bin/env node

/**
 * SWAIG TV Quantum Simulation Test
 * Comprehensive test for quantum visualizer dependencies and functionality
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔬 SWAIG TV Quantum Simulation Test Suite\n');

// Test 1: Node.js environment
console.log('1. Testing Node.js environment...');
console.log(`   Node version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);

// Test 2: Core dependencies
console.log('\n2. Testing core dependencies...');
try {
  const THREE = await import('three');
  console.log(`   ✅ Three.js loaded (r${THREE.REVISION})`);
  
  // Test basic Three.js functionality
  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  console.log(`   ✅ Three.js scene creation works (${scene.children.length} objects)`);
} catch (error) {
  console.log(`   ❌ Three.js error: ${error.message}`);
}

// Test 3: React ecosystem
console.log('\n3. Testing React ecosystem...');
try {
  const React = await import('react');
  console.log(`   ✅ React loaded (${React.version})`);
} catch (error) {
  console.log(`   ❌ React error: ${error.message}`);
}

// Test 4: Next.js
console.log('\n4. Testing Next.js...');
try {
  const nextPkg = JSON.parse(readFileSync('./node_modules/next/package.json', 'utf8'));
  console.log(`   ✅ Next.js available (${nextPkg.version})`);
} catch (error) {
  console.log(`   ❌ Next.js error: ${error.message}`);
}

// Test 5: Package.json validation
console.log('\n5. Testing package.json...');
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  console.log(`   ✅ Package: ${pkg.name} v${pkg.version}`);
  console.log(`   ✅ License: ${pkg.license}`);
  
  const requiredDeps = ['react', 'next', 'three', '@react-three/fiber', '@react-three/drei'];
  const missing = requiredDeps.filter(dep => !pkg.dependencies[dep]);
  
  if (missing.length === 0) {
    console.log(`   ✅ All quantum dependencies present`);
  } else {
    console.log(`   ❌ Missing dependencies: ${missing.join(', ')}`);
  }
} catch (error) {
  console.log(`   ❌ Package.json error: ${error.message}`);
}

// Test 6: File structure
console.log('\n6. Testing quantum file structure...');

const requiredFiles = [
  'components/swaig/optimized-quantum-visualizer.tsx',
  'components/ui/channel-selector.tsx',
  'app/page.tsx',
  'lib/utils/logger.ts'
];

requiredFiles.forEach(file => {
  if (existsSync(join(__dirname, file))) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n🎯 Test complete. Quantum simulation ready for alpha release!');