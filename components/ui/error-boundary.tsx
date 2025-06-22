'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error logging service
    } else {
      console.error('SWAIG TV Error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="glass-panel p-8 max-w-md text-center">
            <h2 className="text-2xl neon-text mb-4">Quantum Flux Detected</h2>
            <p className="text-gray-300 mb-4">
              The quantum simulation encountered an unexpected state. 
              Reality is being recalibrated...
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-80 transition-opacity"
            >
              Reset Quantum Field
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}