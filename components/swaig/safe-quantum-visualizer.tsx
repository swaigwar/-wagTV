'use client';

import React, { useState, useEffect } from 'react';
import aiSanitizer from '@/lib/utils/ai-sanitizer';
import rateLimiter from '@/lib/utils/rate-limiter';

// Define interfaces for component props and state
interface SafeAIVisualizerProps {
  initialPrompt?: string;
  userId: string;
}

interface VisualizerState {
  quantum: {
    amplitude: number;
    phase: number;
    entanglement: number;
  };
}

/**
 * A quantum AI visualizer component with built-in safety measures
 * for preventing abuse and ensuring secure rendering
 */
export default function SafeAIQuantumVisualizer({ initialPrompt = '', userId }: SafeAIVisualizerProps) {
  // Component state
  const [prompt, setPrompt] = useState(initialPrompt);
  const [visualization, setVisualization] = useState<VisualizerState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingQuota, setRemainingQuota] = useState({
    requestsRemainingMinute: 60,
    requestsRemainingHour: 1000
  });

  // Update quota information on mount
  useEffect(() => {
    setRemainingQuota(rateLimiter.getRemainingQuota(userId));
  }, [userId]);

  /**
   * Handle submission of AI prompt with safety measures
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for empty input
    if (!prompt.trim()) {
      setError('Please enter a quantum visualization prompt');
      return;
    }

    // Check rate limiting
    const canProceed = rateLimiter.check(userId);

    if (!canProceed) {
      setError('Rate limit exceeded. Please try again later.');
      setRemainingQuota(rateLimiter.getRemainingQuota(userId));
      return;
    }

    // Check for harmful content in the prompt
    if (aiSanitizer.detectHarmfulContent(prompt)) {
      setError('Your prompt contains content that is not allowed');
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, this would call an AI model API
      // Here we're simulating a response for demonstration
      const quantumVisualization = await simulateQuantumVisualization(prompt);
      setVisualization(quantumVisualization);
    } catch (err) {
      setError('An error occurred while processing your request');
      console.error('AI processing error:', err);
    } finally {
      setIsLoading(false);
      setRemainingQuota(rateLimiter.getRemainingQuota(userId));
    }
  };

  /**
   * Simulate a quantum visualization based on a prompt
   * This is a placeholder for actual AI model interaction
   */
  const simulateQuantumVisualization = async (userPrompt: string): Promise<VisualizerState> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate pseudorandom but deterministic values based on the prompt
    const promptHash = userPrompt.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use window.crypto for secure random generation if available
    const getSecureRandom = () => {
      if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff);
      }
      return Math.random();
    };

    // Create a visualization with secure random values influenced by the prompt
    return {
      quantum: {
        amplitude: 0.1 + (getSecureRandom() * 0.9 + (promptHash % 100) / 500),
        phase: getSecureRandom() * 2 * Math.PI,
        entanglement: 0.2 + getSecureRandom() * 0.8,
      }
    };
  };

  /**
   * Render the quantum visualization
   */
  const renderVisualization = () => {
    if (!visualization) return null;

    const { amplitude, phase, entanglement } = visualization.quantum;

    // Calculate visualization parameters
    const size = Math.floor(amplitude * 200);
    const hue = Math.floor((phase / (2 * Math.PI)) * 360);
    const opacity = 0.3 + entanglement * 0.7;

    return (
      <div className="mt-6 flex flex-col items-center">
        <h3 className="text-lg font-medium mb-4">Quantum Visualization</h3>

        {/* Main visualization element */}
        <div
          className="rounded-full bg-indigo-500 mb-4 transition-all duration-1000"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: `hsla(${hue}, 80%, 60%, ${opacity})`,
            boxShadow: `0 0 ${size / 4}px hsla(${hue}, 80%, 60%, 0.5)`,
            transform: `rotate(${phase}rad) scale(${0.8 + entanglement * 0.4})`,
          }}
        />

        {/* Parameters display */}
        <div className="grid grid-cols-3 gap-4 text-sm text-center">
          <div className="bg-gray-100 p-2 rounded-md">
            <div className="font-medium">Amplitude</div>
            <div>{amplitude.toFixed(4)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <div className="font-medium">Phase</div>
            <div>{phase.toFixed(4)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <div className="font-medium">Entanglement</div>
            <div>{entanglement.toFixed(4)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Quantum AI Visualizer</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your quantum prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            placeholder="Describe a quantum state to visualize..."
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Visualize Quantum State'}
          </button>

          <div className="text-sm text-gray-500">
            Remaining: {remainingQuota.requestsRemainingMinute}/min, {remainingQuota.requestsRemainingHour}/hr
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {visualization && renderVisualization()}
    </div>
  );
}
