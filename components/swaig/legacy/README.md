# Legacy Components

This folder contains legacy components that have been replaced by improved versions in the parent directory.

## quantum-visualizer.tsx

This is the original implementation of the quantum visualizer component. It has been replaced by `optimized-quantum-visualizer.tsx` in the parent directory, which includes:

- Performance optimizations (memo for component and value caching)
- Better input validation and sanitization
- More consistent handling of environment variables
- Additional configuration options (opacity, particleDetails)
- Better error handling

For new implementations, please use the optimized version from the parent directory.

## Migrating from Legacy Components

If you're using any of these legacy components, please update your imports to use the optimized versions:

```typescript
// Change this:
import QuantumVisualizer from '@/components/swaig/legacy/quantum-visualizer'

// To this:
import QuantumVisualizer from '@/components/swaig/optimized-quantum-visualizer'
```

The optimized components maintain the same API while adding additional features and security improvements.
