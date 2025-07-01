---
➡️ **Public milestone frozen at [v1.5.0-alpha-secfix](https://github.com/swaigwar/-wagTV/releases/tag/v1.5.0-alpha-secfix)** – try it & report bugs. Active dev is now private.
---

![Security Policy](https://img.shields.io/badge/security-policy-blue)
![Release](https://img.shields.io/github/v/release/swaigwar/-wagTV)
![License](https://img.shields.io/badge/license-MIT-green)

# SWAIG TV - Universal Quantum Simulation Platform

## 🔐 Alpha v1.5.0 Security Milestone

SWAIG TV is an experimental platform for visualising quantum simulations in the browser using **Next.js&nbsp;14**, **Three.js** and **WebAssembly**. It is aimed at DIY artists and curious creators who want to explore generative visuals.

**Current Status**: Security hardened and ready for community testing at v1.5.0-alpha-secfix.

## Prerequisites

- **Node.js 18.17+**
- **npm 9+**
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/swaigwar/-wagTV.git
   cd -wagTV
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Husky (optional, for pre‑commit hooks)**
   ```bash
   npm run prepare
   ```
4. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
5. **Initialize quantum modules**
   ```bash
   npm run quantum:init
   ```

## Running the Project

### Development

```bash
npm run dev
```
Then open [http://localhost:3003](http://localhost:3003) and enjoy the quantum vibes!

## 🛡️ Security Testing

**Want to help test our security implementation?**

```bash
git checkout tags/v1.5.0-alpha-secfix
npm install && npm run dev
```

See [TESTING.md](TESTING.md) for specific security test scenarios. We welcome responsible security testing!

### Security Features Implemented:
- ✅ Content filtering and sanitization (PG-13 compliance)
- ✅ Rate limiting for AI queries (60/min, 1000/hour)
- ✅ XSS protection and CSP headers
- ✅ Object injection prevention
- ✅ Input validation and output sanitization

### Security Contact
- **Security issues**: Use [private vulnerability reporting](https://github.com/swaigwar/-wagTV/security/advisories/new)
- **General feedback**: Open a [Discussion](https://github.com/swaigwar/-wagTV/discussions)
- **Email**: security@swaggyverse.com (48h response time)

### Production Build

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Security Scan

```bash
npm run security:scan
```

### Analyze Bundle Size

```bash
npm run analyze
```

## Features

- 🌌 Cosmic visualizations with Three.js
- ⚛️ Quantum particle simulations
- 🔒 Enterprise-grade security scanning
- 🏷️ Built-in SecurityBadge showing app version
- 🛡️ OptimizedQuantumVisualizer sanitized to prevent object injection
- 🚀 Optimized performance
- 📱 Responsive design
- 🛡️ AI safety measures including rate limiting and content sanitization
- 🔐 Enhanced security audit compliance

## Security Features

- Content filtering and sanitization
- Rate limiting for AI queries
- XSS protection and CSP headers
- Object injection prevention
- Input validation and output sanitization

## Contributing

Contributions are welcome! Feel free to open an issue or pull request. By contributing you agree to release your work under the MIT License found in `LICENSE`.

## License

MIT

---

*Built for DIY creators who want to explore the quantum realm* ✨
