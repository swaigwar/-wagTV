'use client'

import React, { useState } from 'react'
import aiSanitizer from '@/lib/utils/ai-sanitizer'
import rateLimiter from '@/lib/utils/rate-limiter'

export default function SafeAIQueryComponent() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingQuota, setRemainingQuota] = useState({
    requestsRemainingMinute: 60,
    requestsRemainingHour: 1000
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    const userId = 'test-user-123'
    const canProceed = rateLimiter.check(userId)

    if (!canProceed) {
      setError('Rate limit exceeded. Please try again later.')
      setRemainingQuota(rateLimiter.getRemainingQuota(userId))
      return
    }

    if (aiSanitizer.detectHarmfulContent(prompt)) {
      setError('Your prompt contains content that is not allowed')
      return
    }

    setIsLoading(true)

    try {
      const mockResponse = await simulateAIResponse(prompt)
      const sanitizedResponse = aiSanitizer.sanitizeAiOutput(mockResponse)
      setResponse(sanitizedResponse)
    } catch (err) {
      setError('An error occurred while processing your request')
      console.error('AI processing error:', err)
    } finally {
      setIsLoading(false)
      setRemainingQuota(rateLimiter.getRemainingQuota(userId))
    }
  }

  const simulateAIResponse = async (userPrompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `This is a simulated AI response to: "${userPrompt}". The response demonstrates how output would be processed and sanitized before being displayed to the user.`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Secure AI Interaction</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            placeholder="Enter your prompt here..."
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit'}
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

      {response && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">AI Response:</h3>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap">
            {aiSanitizer.sanitizeAiOutput(response)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Note: The response has been sanitized for security
          </div>
        </div>
      )}
    </div>
  )
}