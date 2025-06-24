# SWAIG TV AI Safety Tools

This directory contains AI safety tools and configurations for the SWAIG TV project. These tools are designed to enhance the security and safety of AI components within the application.

## Getting Started

To set up the AI safety tools, follow these steps:

### 1. Install Required Tools

```bash
# Make the installer script executable
chmod +x scripts/install-ai-tools.sh

# Run the installer (uses Homebrew to install Python and tools)
./scripts/install-ai-tools.sh
```

### 2. Run Security Scan

```bash
# Run the security scan to check for AI safety issues
node scripts/security-scan.js
```

## Available Tools

### Rate Limiting

The rate limiter (`lib/utils/rate-limiter.ts`) provides protection against API abuse by limiting the number of requests that can be made to AI models.

```typescript
import rateLimiter from '@/lib/utils/rate-limiter';

// Check if a request should be allowed
const canProceed = rateLimiter.check('user-123');

if (canProceed) {
  // Make the AI model call
} else {
  // Return error to user
}
```

### Output Sanitization

The AI sanitizer (`lib/utils/ai-sanitizer.ts`) ensures that AI-generated content is safe to display to users.

```typescript
import aiSanitizer from '@/lib/utils/ai-sanitizer';

// Sanitize AI output
const safeOutput = aiSanitizer.sanitizeAiOutput(aiResponseText);

// For React components, use safeAiHtml with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={aiSanitizer.safeAiHtml(safeOutput)} />
```

### Semgrep Rules

Custom Semgrep rules for AI safety are defined in `security/semgrep.yml`. These rules check for:

- AI prompt injection vulnerabilities
- Unsanitized AI output rendering
- Hardcoded AI model credentials
- Missing rate limiting

Run Semgrep to check for these issues:

```bash
semgrep --config=security/semgrep.yml .
```

### Security Scan

The security scan script (`scripts/security-scan.js`) performs comprehensive security checks, including AI-specific safety checks.

## Example Implementation

An example of a secure AI component is provided in `components/swaig/safe-ai-query.tsx`. This component demonstrates:

- Proper rate limiting
- Input validation
- Output sanitization
- Error handling

## Best Practices

1. **Always sanitize user inputs** before sending them to AI models
2. **Always sanitize AI outputs** before displaying them to users
3. **Implement rate limiting** for all AI model calls
4. **Use environment variables** for AI API keys
5. **Monitor AI usage** for unusual patterns

## Documentation

For more detailed information, see:

- [AI Safety Guidelines](security/AI-SAFETY-GUIDELINES.md)
- [Security Audit Report](stv%20v1.2%20SECURITY-AUDIT-REPORT.md)

## Contributing

When working with AI components, please follow the AI safety guidelines and use the provided utilities for rate limiting and output sanitization.
