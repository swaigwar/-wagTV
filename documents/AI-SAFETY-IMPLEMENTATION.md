# SWAIG TV AI Safety Implementation

This document provides instructions for implementing the AI safety measures that have been added to the SWAIG TV project.

## Getting Started

### 1. Install the AI Safety Tools

The first step is to install the required AI safety tools using our custom installer script:

```bash
# Make the installer script executable (if not already)
chmod +x scripts/install-ai-tools.sh

# Run the installer
./scripts/install-ai-tools.sh
```

This script will:
- Install Python and pipx via Homebrew if needed
- Install Semgrep for static analysis
- Create a virtual environment for AI safety tools
- Install LLM safety scanning tools in the virtual environment
- Create wrapper scripts for easy access to the tools

### 2. Run the Security Scan

After installation, run the security scan to check for AI safety issues:

```bash
node scripts/security-scan.js
```

The security scan will:
- Check NPM dependencies for vulnerabilities
- Run ESLint with security rules
- Run Semgrep with AI-specific security rules
- Check for rate limiting implementation
- Check for output sanitization

## AI Safety Components

### Rate Limiting

The rate limiter (`lib/utils/rate-limiter.ts`) provides protection against API abuse. Here's how to use it:

```typescript
import rateLimiter from '@/lib/utils/rate-limiter';

// In your component
const userId = "user-123"; // Use a real user identifier in production

// Check if a request should be allowed
const canProceed = rateLimiter.check(userId);

if (canProceed) {
  // Make the AI model call
} else {
  // Show error to user
}

// Get remaining quota information
const quota = rateLimiter.getRemainingQuota(userId);
console.log(`Remaining: ${quota.requestsRemainingMinute}/minute, ${quota.requestsRemainingHour}/hour`);
```

### Output Sanitization

The AI sanitizer (`lib/utils/ai-sanitizer.ts`) ensures that AI-generated content is safe:

```typescript
import aiSanitizer from '@/lib/utils/ai-sanitizer';

// Sanitize AI output
const safeOutput = aiSanitizer.sanitizeAiOutput(aiResponseText);

// Check for harmful content
if (aiSanitizer.detectHarmfulContent(userInput)) {
  // Reject the input
}

// Render sanitized content in React
return (
  <div>
    {/* Split into paragraphs for safe rendering */}
    {safeOutput.split('\n').map((line, i) => (
      <p key={i}>{line || <br />}</p>
    ))}
  </div>
);
```

## Integrated Components

All AI-related components have been updated with safety measures:

### 1. `components/swaig/quantum-visualizer.tsx` 
Includes:
- Rate limiting for visualization requests
- Input validation for particle count and configuration
- Sanitization of user-provided configuration
- Safety boundaries for visualization parameters
- Error handling for rate-limited requests

### 2. `components/swaig/optimized-quantum-visualizer.tsx`
Includes:
- Enhanced security with typed array safety
- Boundary checking for all array accesses
- Comprehensive input validation
- Safe parameter handling with min/max limits
- Configurable user limits via environment variables

### 3. Example Components
Two example components are provided to demonstrate safe AI integration:
- `components/swaig/safe-ai-query.tsx` - A simple text-based AI interaction
- `components/swaig/safe-quantum-visualizer.tsx` - A more complex quantum visualization component

These components demonstrate:
- Proper rate limiting
- Input validation and sanitization
- Output safety measures
- Error handling
- Quota display

## Security Configuration

### Trunk Security Integration

Trunk integration is set up for AI security scanning:

1. Basic configuration is set in `.trunk/trunk.yaml`
2. The configuration enables pre-commit checks

If you need to run a Trunk check manually:

```bash
trunk check
```

### Semgrep Rules

The Semgrep rules in `security/semgrep.yml` check for common AI safety issues:

- AI prompt injection vulnerabilities
- Unsanitized AI output rendering
- Hardcoded AI model credentials
- Missing rate limiting

## Troubleshooting

### Python Tools Installation Issues

If you encounter issues with the Python tools installation:

1. Try running the installer script again
2. Check if the virtual environment was created at `~/.venvs/ai-safety-tools`
3. Manually activate the virtual environment:
   ```bash
   source ~/.venvs/ai-safety-tools/bin/activate
   ```

### ESLint Errors

If you see ESLint errors related to React components:

1. Ensure you've updated `.eslintrc.json` to disable the `react/no-danger` rule
2. Run `npm run lint:fix` to automatically fix ESLint issues

### Security Scan Failures

If the security scan fails:

1. Look for specific error messages in the output
2. Fix any critical issues identified
3. Run the scan again to verify fixes

### Trunk Configuration Issues

If you encounter issues with Trunk AI security plugin:

1. Make sure you have the latest version of Trunk CLI installed
2. Check if the AI security plugin repository URL is correct
3. Try updating the plugin reference in trunk.yaml

## Next Steps

To further enhance AI safety in your project:

1. Continue to improve AI input validation for all user inputs
2. Enhance content moderation for user-generated content
3. Create a monitoring system for AI usage
4. Implement regular security audits for AI components
5. Configure and use advanced options for the Trunk AI security plugins

For more detailed information, see the AI Safety Guidelines in `security/AI-SAFETY-GUIDELINES.md`.
