#!/usr/bin/env node
import { execSync } from 'child_process'
// import { logger } from '../lib/utils/logger.js'

console.log('🔒 DIY Enterprise Security Scanner Starting...\n')

const runCommand = (command, description) => {
  try {
    console.log(`🔍 ${description}...`)
    // command comes from predefined securityChecks array - no user input
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe'],
      timeout: 30000
    })
    console.log(`✅ ${description} completed\n`)
    return output
  } catch (error) {
    console.error(`❌ ${description} failed:`)
    console.error(error.stdout || error.message)
    if (error.stderr) {
      console.error('STDERR:', error.stderr)
    }
    console.log('')
    return null
  }
}

// Security Scan Suite
const securityChecks = [
  {
    command: 'npm audit --audit-level=moderate',
    description: 'NPM Dependency Vulnerability Scan'
  },
  {
    command: 'npm run lint',
    description: 'ESLint Security Rules Check'
  }
]

// Check if Semgrep is available
const semgrepAvailable = (() => {
  try {
    execSync('which semgrep', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

if (semgrepAvailable) {
  securityChecks.push({
    command: 'semgrep --config=security/semgrep.yml .',
    description: 'Semgrep Static Security Analysis'
  })
} else {
  console.log('⚠️  Semgrep - Optional tool not installed (non-critical)')
  console.log('   Install with: pip install semgrep\n')
}

// Check if AI Security Tools are available
const aiSecurityToolsAvailable = (() => {
  try {
    const venvPath = `${process.env.HOME}/.venvs/ai-safety-tools/bin`;
    const wrapperPath = `${process.env.HOME}/.local/bin`;

    // Try the wrapper script first, then the venv path
    try {
      execSync(`which llmscan || [ -f "${wrapperPath}/llmscan" ]`, { stdio: 'ignore' });
      return true;
    } catch {
      try {
        execSync(`[ -f "${venvPath}/llmscan" ]`, { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
  } catch {
    return false;
  }
})()

if (aiSecurityToolsAvailable) {
  const venvActivate = `source ${process.env.HOME}/.venvs/ai-safety-tools/bin/activate && `;

  securityChecks.push({
    command: `${venvActivate}llmscan scan components/ || ~/.local/bin/llmscan scan components/`,
    description: 'LLM Safety Scanner - Scanning AI Components'
  })
  securityChecks.push({
    command: `${venvActivate}promptinject test components/swaig/ || ~/.local/bin/promptinject test components/swaig/`,
    description: 'AI Prompt Injection Test - Checking for vulnerabilities'
  })
} else {
  console.log('⚠️  AI Security Tools - Not installed (recommended)')
  console.log('   Install with: ./scripts/install-ai-tools.sh\n')
}

// Check for Trunk AI security tools
const trunkAiAvailable = (() => {
  try {
    execSync('trunk check --help | grep ai-security', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

if (trunkAiAvailable) {
  securityChecks.push({
    command: 'trunk check --filter=ai-security',
    description: 'Trunk AI Security Check - Scanning for AI vulnerabilities'
  })
} else {
  console.log('⚠️  Trunk AI Security - Plugin not enabled (recommended)')
  console.log('   Enable in .trunk/trunk.yaml\n')
}

let totalIssues = 0
let criticalIssues = 0

console.log('=' .repeat(60))
console.log('🚀 SWAIG TV - DIY Enterprise Security Report')
console.log('=' .repeat(60))

for (const check of securityChecks) {
  const output = runCommand(check.command, check.description)

  if (output === null) {
    criticalIssues++
  }

  if (output && (output.includes('error') || output.includes('ERROR'))) {
    totalIssues++
  }
}

// AI Safety Specific Checks
console.log('=' .repeat(60))
console.log('🤖 AI SAFETY SPECIFIC CHECKS')
console.log('=' .repeat(60))

// Check for proper rate limiting on AI components
const aiRateLimitingCheck = runCommand(
  'grep -r "rateLimiter" --include="*.tsx" --include="*.ts" components/swaig/ lib/utils/',
  'AI Rate Limiting Check'
)

if (!aiRateLimitingCheck || aiRateLimitingCheck.trim() === '') {
  console.log('⚠️  AI Rate Limiting - No rate limiting found in AI components')
  console.log('   Consider implementing rate limiting for AI model calls\n')
  totalIssues++
}

// Check for AI output sanitization
const aiOutputSanitizationCheck = runCommand(
  'grep -r "sanitize" --include="*.tsx" --include="*.ts" components/swaig/ lib/utils/',
  'AI Output Sanitization Check'
)

if (!aiOutputSanitizationCheck || aiOutputSanitizationCheck.trim() === '') {
  console.log('⚠️  AI Output Sanitization - No sanitization found in AI components')
  console.log('   Consider implementing output sanitization for AI-generated content\n')
  totalIssues++
}

// Generate security report
console.log('=' .repeat(60))
console.log('📊 SECURITY SCAN SUMMARY')
console.log('=' .repeat(60))
console.log(`Total Security Checks: ${securityChecks.length + 2}`) // +2 for AI-specific checks
console.log(`Issues Found: ${totalIssues}`)
console.log(`Critical Issues: ${criticalIssues}`)

if (criticalIssues > 0) {
  console.log('\n❌ SECURITY SCAN FAILED - Critical issues must be fixed!')
  process.exit(1)
} else if (totalIssues > 0) {
  console.log('\n⚠️  SECURITY SCAN COMPLETED WITH WARNINGS')
  process.exit(0)
} else {
  console.log('\n✅ SECURITY SCAN PASSED - No critical issues found!')
  process.exit(0)
}