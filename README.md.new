# SWAIG TV - Universal Quantum Simulation Platform

## Alpha v1.1.0

SWAIG TV is an experimental platform for visualising quantum simulations in the browser using **Next.js&nbsp;14**, **Three.js** and **WebAssembly**. It is aimed at DIY artists and curious creators who want to explore generative visuals. This project is in an early alpha state—expect rough edges and please report any issues.

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
Then open [http://localhost:3000](http://localhost:3000) and enjoy the quantum vibes!

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

## Project Structure

### Components

- `/components/swaig/optimized-quantum-visualizer.tsx` - Main quantum visualization component
- `/components/swaig/safe-quantum-visualizer.tsx` - Safety-focused wrapper
- `/components/swaig/safe-ai-query.tsx` - Reusable AI query component with safety measures
- `/components/swaig/legacy/` - Archived previous versions of components

## Configuration

WebAssembly modules should be placed in `lib/quantum/wasm/`. Security headers are configured in `next.config.js`. TypeScript is set to strict mode using `tsconfig.json` and includes the Next.js TypeScript plugin.

## Contributing

Contributions are welcome! Feel free to open an issue or pull request. By contributing you agree to release your work under the MIT License found in `LICENSE`.

## License

MIT
