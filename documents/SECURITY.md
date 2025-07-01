# 🔒 Security Guide

Enterprise-grade security for DIY developers. Keep your quantum realm safe!

## 🛡️ What's Protected

**Code Security**
- ESLint security rules catch common issues
- Semgrep custom rules for React/Next.js
- TypeScript strict mode prevents vulnerabilities

**Dependencies**  
- NPM audit scans for vulnerabilities
- GitHub dependency review on PRs
- Automated security updates

**Runtime Security**
- Content Security Policy headers
- HSTS, X-Frame-Options protection
- Error boundaries prevent data leaks
- Secure logging (no secrets)

**Development**
- Pre-commit security hooks
- Required scans for main branch
- Secret detection enabled

## 🔧 Security Commands

```bash
npm run security:scan    # Full security check
npm run security:audit   # Dependency audit only  
npm run security:lint    # Security linting only
```

Optional: `pip install semgrep` for advanced static analysis.

## 📊 Scan Results

Get detailed reports with vulnerability counts, rule violations, and fix recommendations.

## 🚨 Issue Response

- **Critical**: Fix immediately
- **High**: Fix within 24h  
- **Medium**: Fix within 1 week
- **Low**: Next sprint

Emergency fix: `npm audit fix --force && npm run security:scan`

## 🔐 Best Practices

**Golden Rules:**
1. Never commit secrets (use env vars)
2. Run security scans before releases
3. Keep dependencies updated
4. Use HTTPS everywhere
5. Validate all inputs
6. Handle errors securely
7. Log events, not secrets

**Pre-Deploy Checklist:**
- [ ] Security scans pass
- [ ] No hardcoded secrets  
- [ ] Security headers enabled
- [ ] Error boundaries added
- [ ] HTTPS configured

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)  
- [React Security Best Practices](https://react.dev/learn/writing-secure-react-code)

## 📞 Report Issues

Found a security bug? Please:
1. Don't create public issues
2. Email maintainers privately  
3. Allow time for fixes
4. Practice responsible disclosure

---

*Security isn't optional - it's essential for protecting your users* 🛡️