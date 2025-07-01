# Testing SWAIG TV v1.5.0 Security Features

Welcome to the SWAIG TV security testing guide! This release focuses on demonstrating production-ready security patterns for DIY AI builders.

## Quick Start

```bash
# Get the security milestone release
git checkout tags/v1.5.0-alpha-secfix
npm install
npm run dev
```

Navigate to [http://localhost:3003](http://localhost:3003)

## 🔐 Security Test Scenarios

### 1. Content Filter Testing

**Location**: Swagelok Sync channel  
**Purpose**: Test content filtering system

**Test Cases**:
```
❌ Try: "how to hack someone's computer"
❌ Try: "create a virus that destroys files"  
❌ Try: "bypass security systems"
❌ Try: "<script>alert('xss')</script>"
✅ Try: "create a beautiful sunset landscape"
```

**Expected Results**:
- Inappropriate content shows: "❌ Content blocked: [reason]"
- Safe content processes normally
- XSS attempts are escaped and displayed as text

### 2. Rate Limiting

**Location**: Any AI query interface  
**Purpose**: Test rate limiting (60/minute, 1000/hour)

**Test Cases**:
```bash
# Rapid-fire the same request
1. Submit AI query
2. Immediately submit again (repeat rapidly)
3. Watch for rate limit message
```

**Expected Results**:
- After ~60 requests/minute: "Rate limit exceeded" warning
- Shows remaining quota: "Remaining: X/min, Y/hr"
- Graceful degradation, not crashes

### 3. XSS Prevention

**Location**: All text input fields  
**Purpose**: Test input sanitization

**Test Cases**:
```html
<script>alert('xss')</script>
<img src="x" onerror="alert('xss')">
javascript:alert('xss')
"><script>alert('xss')</script>
```

**Expected Results**:
- All script tags displayed as plain text
- No JavaScript execution
- Content properly escaped in output

### 4. Particle Count Validation

**Location**: Quantum channel  
**Purpose**: Test parameter validation

**Test Cases**:
```bash
# Current hardcoded to 100, but testing bounds
1. Switch to Quantum channel
2. Observe particle count behavior  
3. All particles should render correctly
```

**Expected Results**:
- Particle count stays within safe bounds (2-100)
- Smooth rendering at all particle counts
- No memory leaks or crashes

### 5. Input Validation Edge Cases

**Location**: All input fields  
**Purpose**: Test edge case handling

**Test Cases**:
```
🧪 Empty inputs
🧪 Extremely long strings (10,000+ chars)
🧪 Unicode/emoji combinations: 🎭🎨🎯🚀
🧪 SQL injection attempts: '; DROP TABLE users; --
🧪 Path traversal: ../../etc/passwd
🧪 Null bytes: test\x00malicious
```

**Expected Results**:
- Graceful error handling
- No crashes or undefined behavior
- Appropriate error messages

## 🎯 Performance Testing

### Memory Usage
```bash
# Monitor with browser dev tools
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot
3. Test various particle counts (10, 50, 100)
4. Check for memory leaks
```

**Expected**: Memory usage stays under 100MB for normal operations

### Frame Rate
```bash
# Monitor rendering performance  
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Switch between channels
4. Test particle animations
```

**Expected**: Maintains 30+ FPS on modern hardware

## 🚨 Security Issues to Report

### Critical (Report Immediately)
- XSS execution (scripts actually run)
- Rate limiting bypass
- Content filter bypass with harmful content
- Memory corruption or crashes

### Important (Report Soon)
- Input validation failures
- Performance issues with security features
- UI/UX problems with security messages
- Documentation unclear or incorrect

### Nice to Have
- Performance optimizations
- UX improvements for security features
- Additional test case suggestions

## 📞 Reporting Results

### For Security Issues
**DO NOT** open public issues! Use:
- GitHub Private Vulnerability Report (preferred)
- Email: security@swaggyverse.com

### For General Feedback
- Open a [Discussion](https://github.com/swaigwar/-wagTV/discussions)
- Reference v1.5.0-alpha-secfix in your post
- Include browser/OS information

### Bug Report Template
```markdown
## Test Environment
- Browser: Chrome 120.0.6099.71
- OS: macOS 14.2
- Version: v1.5.0-alpha-secfix

## Test Scenario
[Which security test from this guide]

## Expected Behavior
[What should happen]

## Actual Behavior  
[What actually happened]

## Reproduction Steps
1. Step one
2. Step two
3. Step three

## Additional Context
[Screenshots, console errors, etc.]
```

## 🛡️ Security Features Deep Dive

### Content Filter Implementation
- **Location**: `src/lib/swagTVContentFilter.ts`
- **Patterns**: Regex-based with 90s MTV PG-13 standards
- **Response**: Blocks with reason + safe alternatives

### Rate Limiter
- **Location**: `lib/utils/rate-limiter.ts`  
- **Algorithm**: Token bucket with per-user tracking
- **Limits**: 60/minute, 1000/hour per user

### Input Sanitization
- **Location**: `lib/utils/ai-sanitizer.ts`
- **Method**: HTML escaping + content validation
- **Coverage**: All user inputs and AI outputs

## 🎯 What Makes This Secure

1. **Defense in Depth**: Multiple validation layers
2. **Fail Safe**: Errors block content, don't expose it
3. **Rate Limiting**: Prevents abuse and DoS
4. **Input Validation**: All inputs sanitized before use
5. **Output Encoding**: All outputs escaped for display

## 📚 For DIY AI Builders

This implementation demonstrates:
- Production-ready security patterns
- How to integrate security without breaking UX
- Real-world rate limiting strategies  
- Content filtering for AI applications
- Secure coding practices for React/Node.js

Feel free to adapt these patterns for your own projects!

---

**Happy Testing!** 🧪🔐  
Help us make SWAIG TV the most secure AI visualization platform for the DIY community.

**Last Updated**: 2024-12-27  
**Version**: v1.5.0-alpha-secfix  
**Contact**: security@swaggyverse.com