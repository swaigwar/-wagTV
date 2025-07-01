/**
 * AI Output Sanitizer
 * 
 * Provides utilities for sanitizing AI-generated content to prevent
 * security issues like XSS attacks and content policy violations.
 */

import DOMPurify from 'dompurify';

interface SanitizerOptions {
  /** Maximum allowed length for sanitized output */
  maxLength?: number;
  /** HTML tags that are allowed in the output */
  allowedTags?: string[];
  /** Check for potentially harmful content */
  checkForHarmfulContent?: boolean;
}

/**
 * Default options for the sanitizer
 */
const defaultOptions: SanitizerOptions = {
  maxLength: 5000,
  allowedTags: ['p', 'br', 'b', 'i', 'u', 'ul', 'ol', 'li', 'code', 'pre'],
  checkForHarmfulContent: true,
};

/**
 * Patterns to detect potentially harmful content
 */
const harmfulPatterns: RegExp[] = [
  /how to (hack|steal|illegally)/i,
  /(create|make) (virus|malware)/i,
  /(bypass|circumvent) security/i,
  /script\s*?:/i,
  /javascript\s*?:/i,
  /onerror\s*?=/i,
  /onclick\s*?=/i,
  /eval\s*?\(/i,
];

/**
 * Sanitizes AI-generated text output to prevent security issues
 * @param {string} content - The AI-generated content to sanitize
 * @param {SanitizerOptions} options - Configuration options
 * @returns {string} - Sanitized content safe for rendering
 */
export function sanitizeAiOutput(content: string, options: SanitizerOptions = {}): string {
  if (!content) return '';
  
  // Merge options with defaults
  const mergedOptions: SanitizerOptions = {
    ...defaultOptions,
    ...options,
  };
  
  // Truncate if needed
  if (mergedOptions.maxLength && content.length > mergedOptions.maxLength) {
    content = content.substring(0, mergedOptions.maxLength);
  }
  
  // Check for harmful content
  if (mergedOptions.checkForHarmfulContent && detectHarmfulContent(content)) {
    return '[Content filtered for safety reasons]';
  }
  
  // Basic HTML sanitization
  return sanitizeHtml(content, mergedOptions.allowedTags || []);
}

/**
 * Detects potentially harmful content in AI outputs
 * @param {string} content - The content to check
 * @returns {boolean} - Whether harmful content was detected
 */
export function detectHarmfulContent(content: string): boolean {
  // Check against harmful patterns
  for (const pattern of harmfulPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sanitizes HTML content using DOMPurify
 * @param {string} html - The HTML content to sanitize
 * @param {string[]} allowedTags - List of allowed HTML tags
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtml(html: string, allowedTags: string[]): string {
  // Use DOMPurify for robust HTML sanitization
  if (typeof window !== 'undefined' && DOMPurify.isSupported) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class', 'id'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });
  }
  
  // Fallback for server-side or when DOMPurify is not available
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper function to safely render AI-generated content in React
 * Returns an object that can be used with dangerouslySetInnerHTML
 * but only after content has been properly sanitized
 */
export function safeAiHtml(content: string, options: SanitizerOptions = {}): { __html: string } {
  return { __html: sanitizeAiOutput(content, options) };
}

/**
 * Export the utilities
 */
const aiSanitizer = {
  sanitizeAiOutput,
  detectHarmfulContent,
  safeAiHtml,
};

export default aiSanitizer;
