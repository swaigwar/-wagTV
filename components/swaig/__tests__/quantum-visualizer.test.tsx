import React from 'react'
import { render, screen } from '@testing-library/react'
import QuantumVisualizer from '../optimized-quantum-visualizer'

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useFrame: jest.fn(),
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}))

jest.mock('three', () => ({
  Matrix4: jest.fn().mockImplementation(() => ({
    setPosition: jest.fn(),
    scale: jest.fn(),
  })),
  Vector3: jest.fn().mockImplementation(() => ({})),
}))

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}))

describe('QuantumVisualizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<QuantumVisualizer />)
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('contains orbit controls', () => {
    render(<QuantumVisualizer />)
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
  })

  it('has proper wrapper styling', () => {
    const { container } = render(<QuantumVisualizer />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('w-full', 'h-full')
  })

  it('initializes with expected structure', () => {
    render(<QuantumVisualizer />)

    // Should have canvas
    expect(screen.getByTestId('canvas')).toBeInTheDocument()

    // Should have controls
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
  })
})