/**
 * SWAIG TV AI Safety Configuration
 *
 * This configuration implements best practices for AI safety and security
 * based on recommendations from leading AI safety organizations.
 */

export const aiSafetyConfig = {
  // Rate limiting to prevent abuse
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    cooldownPeriod: 60 * 1000, // 1 minute in milliseconds
  },

  // Input validation and sanitization
  inputSanitization: {
    enabled: true,
    maxInputLength: 1000,
    blockedPatterns: [
      // Prevent common prompt injection attempts
      /^(ignore|disregard) (previous|above|all) instructions/i,
      /^(ignore|disregard) everything (above|before)/i,
      /you are now in (developer|DAN|sudo) mode/i,
      /system prompt:/i
    ],
    allowedTags: ['p', 'br', 'b', 'i', 'u', 'ul', 'ol', 'li'],
  },

  // Output safety measures
  outputSafety: {
    enabled: true,
    sanitizeOutput: true,
    checkForHarmfulContent: true,
    contentFilters: {
      hate: true,
      harassment: true,
      sexualContent: true,
      violence: true,
      selfHarm: true,
      illegalActivity: true,
    },
    maxOutputLength: 5000,
  },

  // Model configuration
  modelConfig: {
    // Use secure models with safety measures
    preferLocalModels: true,
    requireSafetyAlignment: true,
    // Temperature settings to reduce randomness for safety-critical functions
    safetyTemperature: 0.3,
    creativeTemperature: 0.7,
    // Content moderation
    moderationEnabled: true,
    // Logging for auditing
    logPrompts: true,
    logResponses: true,
  },

  // Authentication and authorization
  auth: {
    requireApiKeys: true,
    rotateKeysInterval: 30, // days
    trackKeyUsage: true,
  },

  // Monitoring and guardrails
  monitoring: {
    enableAnomalyDetection: true,
    alertOnSuspiciousActivity: true,
    recordUsageMetrics: true,
    dailyUsageLimits: true,
  },

  // Ethical use guidelines
  ethicalUse: {
    transparencyDisclosure: true,
    humanOversight: true,
    userFeedbackSystem: true,
  },

  // Red team testing configuration
  redTeam: {
    promptInjectionTests: true,
    dataPoisoningTests: true,
    robustnessTests: true,
    testFrequency: 'weekly',
  }
};

/**
 * AI Safety Middleware
 * Apply this to any routes that handle AI model calls
 */
export const aiSafetyMiddleware = async (req, res, next) => {
  try {
    // Rate limiting check
    const _clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // In a real implementation, we would use _clientIp for rate limiting checks

    // Input sanitization
    if (req.body && req.body.prompt) {
      // Check for potential prompt injection
      for (const pattern of aiSafetyConfig.inputSanitization.blockedPatterns) {
        if (pattern.test(req.body.prompt)) {
          return res.status(403).json({
            error: 'Potentially unsafe input detected',
            message: 'Your input contains patterns that are not allowed'
          });
        }
      }

      // Truncate long inputs
      if (req.body.prompt.length > aiSafetyConfig.inputSanitization.maxInputLength) {
        req.body.prompt = req.body.prompt.substring(0, aiSafetyConfig.inputSanitization.maxInputLength);
      }
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('AI Safety Middleware Error:', error);
    res.status(500).json({
      error: 'AI Safety Check Failed',
      message: 'An error occurred while checking AI safety'
    });
  }
};

/**
 * Output Safety Filter
 * Use this function to sanitize AI outputs before returning them to users
 */
export const sanitizeAiOutput = (output) => {
  if (!output) return '';

  // Truncate if needed
  if (output.length > aiSafetyConfig.outputSafety.maxOutputLength) {
    output = output.substring(0, aiSafetyConfig.outputSafety.maxOutputLength);
  }

  // Basic HTML sanitization - in production, use a proper sanitization library
  const tempElement = document.createElement('div');
  tempElement.textContent = output;

  return tempElement.innerHTML;
};

/**
 * Helper function to detect potentially harmful content in AI outputs
 */
export const detectHarmfulContent = (output) => {
  // Simplified example - in production, use a dedicated content moderation API
  const harmfulPatterns = [
    /how to (hack|steal|illegally)/i,
    /(create|make) (virus|malware)/i,
    /(bypass|circumvent) security/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(output)) {
      return true;
    }
  }

  return false;
};

export default aiSafetyConfig;
