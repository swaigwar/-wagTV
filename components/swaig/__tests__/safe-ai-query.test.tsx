import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SafeAIQueryComponent from '../safe-ai-query'

// Mock the utility modules
jest.mock('@/lib/utils/ai-sanitizer', () => ({
  sanitizeAiOutput: jest.fn((content: string) => `Sanitized: ${content}`),
  detectHarmfulContent: jest.fn(() => false),
  safeAiHtml: jest.fn((content: string) => ({ __html: `Safe: ${content}` })),
}))

jest.mock('@/lib/utils/rate-limiter', () => ({
  check: jest.fn(() => true),
  getRemainingQuota: jest.fn(() => ({
    requestsRemainingMinute: 59,
    requestsRemainingHour: 999,
  })),
}))

describe('SafeAIQueryComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with initial state', () => {
    render(<SafeAIQueryComponent />)

    expect(screen.getByText('Secure AI Interaction')).toBeInTheDocument()
    expect(screen.getByLabelText('Enter your prompt:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByText(/Remaining: 60\/min, 1000\/hr/)).toBeInTheDocument()
  })

  it('shows error for empty prompt submission', async () => {
    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    expect(screen.getByText('Please enter a prompt')).toBeInTheDocument()
  })

  it('handles rate limiting', async () => {
    const rateLimiter = require('@/lib/utils/rate-limiter')
    rateLimiter.check.mockReturnValue(false)

    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(textarea, 'Test prompt')
    await user.click(submitButton)

    expect(screen.getByText('Rate limit exceeded. Please try again later.')).toBeInTheDocument()
  })

  it('detects harmful content', async () => {
    const aiSanitizer = require('@/lib/utils/ai-sanitizer')
    aiSanitizer.detectHarmfulContent.mockReturnValue(true)

    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(textarea, 'Harmful prompt')
    await user.click(submitButton)

    expect(screen.getByText('Your prompt contains content that is not allowed')).toBeInTheDocument()
  })

  it('successfully processes valid prompt', async () => {
    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(textarea, 'Valid test prompt')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument()

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('AI Response:')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Check that sanitizer was called
    const aiSanitizer = require('@/lib/utils/ai-sanitizer')
    expect(aiSanitizer.sanitizeAiOutput).toHaveBeenCalled()
  })

  it('updates remaining quota display', async () => {
    const rateLimiter = require('@/lib/utils/rate-limiter')
    rateLimiter.getRemainingQuota.mockReturnValue({
      requestsRemainingMinute: 58,
      requestsRemainingHour: 998,
    })

    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(textarea, 'Test prompt')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Remaining: 58\/min, 998\/hr/)).toBeInTheDocument()
    })
  })

  it('handles textarea input correctly', async () => {
    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:') as HTMLTextAreaElement

    await user.type(textarea, 'Test input')

    expect(textarea.value).toBe('Test input')
  })

  it('disables submit button during loading', async () => {
    const user = userEvent.setup()
    render(<SafeAIQueryComponent />)

    const textarea = screen.getByLabelText('Enter your prompt:')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    await user.type(textarea, 'Test prompt')
    await user.click(submitButton)

    const processingButton = screen.getByRole('button', { name: 'Processing...' })
    expect(processingButton).toBeDisabled()
  })
})