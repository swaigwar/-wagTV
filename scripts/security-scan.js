#!/usr/bin/env node
import { execSync } from 'child_process'
// import { logger } from '../lib/utils/logger.js'

console.log('🔒 DIY Enterprise Security Scanner Starting...\n')

const runCommand = (command, description) => {
  try {
    console.log(`🔍 ${description}...`)
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
  console.log('⚠️  Semgrep not installed. Install with: pip install semgrep\n')
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

// Generate security report
console.log('=' .repeat(60))
console.log('📊 SECURITY SCAN SUMMARY')
console.log('=' .repeat(60))
console.log(`Total Security Checks: ${securityChecks.length}`)
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