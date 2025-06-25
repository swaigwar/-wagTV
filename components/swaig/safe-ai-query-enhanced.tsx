'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ErrorReporter from '@/lib/utils/error-reporter';
import { IpRateLimiter } from '@/lib/utils/ip-rate-limiter';
import aiSanitizer from '@/lib/utils/ai-sanitizer';

// Corrected imports for missing or misnamed exports.

import rateLimiter from '@/lib/utils/rate-limiter';
import { logger } from '@/lib/utils/logger';

interface SafeAIQueryProps {
  userId?: string;
  modelId?: string;
  maxTokens?: number;
  maxPromptLength?: number;
}

export default function SafeAIQueryEnhanced({
  userId = 'anonymous',
  modelId = 'default',
  maxTokens = 1000,
  maxPromptLength = 500,
}: SafeAIQueryProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingQuota, setRemainingQuota] = useState({
    requestsRemainingMinute: 60,
    requestsRemainingHour: 1000,
  });

  // Update quota display
  const updateRemainingQuota = useCallback(() => {
    try {
      const quota = rateLimiter.getRemainingQuota(userId, modelId);
      setRemainingQuota(quota);
    } catch (err) {
      logger.error('Failed to get remaining quota', {
        userId,
        modelId,
        error: err,
      });
    }
  }, [userId, modelId]);

  // Check rate limits on component mount
  useEffect(() => {
    updateRemainingQuota();
  }, [updateRemainingQuota]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Length validation
    if (prompt.length > maxPromptLength) {
      setError(
        `Prompt too long. Maximum length is ${maxPromptLength} characters.`,
      );
      return;
    }

    try {
      // Content safety check
      if (aiSanitizer.detectHarmfulContent(prompt)) {
        setError(
          'Your prompt contains potentially harmful content that is not allowed',
        );
        logger.warn('Harmful content detected in prompt', {
          userId,
          promptLength: prompt.length,
        });
        return;
      }

      // Rate limit check - user level
      const canProceed = rateLimiter.check(userId, modelId);
      if (!canProceed) {
        setError('Rate limit exceeded. Please try again later.');
        updateRemainingQuota();
        return;
      }

      // IP-based rate limit check (more strict)
      const ipCheck = await IpRateLimiter.check(getUserIp(), userId);
      if (!ipCheck.allowed) {
        if (ipCheck.rateLimitStatus.banned) {
          setError(
            'Access temporarily restricted due to excessive usage. Please try again later.',
          );
          logger.warn('IP banned due to excessive usage', { userId });
        } else {
          setError('Rate limit exceeded. Please try again later.');
        }
        return;
      }

      // Proceed with AI request
      setIsLoading(true);

      try {
        // Make the AI request
        const result = await fetchAIResponse(
          prompt,
          userId,
          modelId,
          maxTokens,
        );

        // Sanitize the response
        const sanitizedResponse = aiSanitizer.sanitizeAiOutput(result, {
          maxLength: maxTokens * 4, // Rough character estimation
          allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
          checkForHarmfulContent: true,
        });

        setResponse(sanitizedResponse);
      } catch (err) {
        ErrorReporter.reportError(err as Error, {
          component: 'SafeAIQueryEnhanced',
          userId,
          modelId,
        });

        setError('Failed to get response from AI service. Please try again.');
      } finally {
        setIsLoading(false);
        updateRemainingQuota();
      }
    } catch (err) {
      logger.error('Error in AI query process', { error: err });
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // This would be your actual AI service call
  const fetchAIResponse = async (
    prompt: string,
    _userId: string,
    _modelId: string,
    _maxTokens: number,
  ): Promise<string> => {
    // Simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `Response to: "${prompt}"\nThis is a simulated AI response for demonstration purposes.`,
        );
      }, 1000);
    });
  };

  // Get IP address - in a real implementation, this would come from the request context
  const getUserIp = (): string => {
    return '127.0.0.1'; // Placeholder
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Safe AI Query</h2>
      <div className="mb-4 text-sm">
        <p>
          Requests remaining: {remainingQuota.requestsRemainingMinute} per
          minute / {remainingQuota.requestsRemainingHour} per hour
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700"
        >
          Your Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="block w-full p-2 border border-gray-300 rounded"
          placeholder="Enter your prompt here"
          maxLength={maxPromptLength}
        />
        <p className="text-xs text-gray-500 mt-1">
          {prompt.length}/{maxPromptLength} characters
        </p>
        {error && (
          <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLoading ? 'Processing...' : 'Submit Query'}
        </button>
      </form>
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Response:</h3>
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      </div>
    </div>
  );
}
