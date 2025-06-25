# SWAIG TV - Quantum Visual Platform

## Alpha v1.1.0

Experimental quantum visualization platform built with Next.js 14, Three.js and WebAssembly. Perfect for DIY creators exploring generative visuals. Alpha release - expect some rough edges!

## Prerequisites

- Node.js 18.17+
- npm 9+
- Git

## Quick Start

```bash
git clone https://github.com/swaigwar/-wagTV.git
cd -wagTV
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enjoy the quantum vibes!

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run security:scan` - Security check
- `npm run analyze` - Bundle analysis

## Features

- 🌌 Cosmic visualizations with Three.js
- ⚛️ Quantum particle simulations
- 🔒 Enterprise-grade security scanning
- 🏷️ Built-in SecurityBadge showing app version
- 🛡️ OptimizedQuantumVisualizer sanitized to prevent object injection
- 🚀 Optimized performance
- 📱 Responsive design
- 🛡️ AI safety measures including rate limiting and content sanitization

## Project Structure

### Components

- `/components/swaig/optimized-quantum-visualizer.tsx` - Main quantum visualization component
- `/components/swaig/safe-quantum-visualizer.tsx` - Safety-focused wrapper
- `/components/swaig/safe-ai-query.tsx` - Reusable AI query component with safety measures
- `/components/swaig/legacy/` - Archived previous versions of components

### Safety Utilities

- `/lib/utils/rate-limiter.ts` - Prevents API abuse through request throttling
- `/lib/utils/ai-sanitizer.ts` - Sanitizes AI-generated content for safety
- `/security/semgrep.yml` - Custom security rules for AI safety
- `/scripts/security-scan.js` - Automated security scanning

For more details on AI safety implementation, see the `AI-SAFETY-IMPLEMENTATION.md` and `AI-SAFETY-TECHNICAL-SUMMARY.md` documents.

## Contributing

Contributions welcome! Open issues or PRs. MIT licensed.

---

*Built for DIY creators who want to explore the quantum realm* ✨
