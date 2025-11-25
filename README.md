# Colour Palette Picker
A "Single Purpose Website" that solves a tiny, annoying problem elegantly: colour picker. A beautiful, distraction-free web application for generating harmonious colour palettes.

## Features

- Generate random 5-colour palettes using colour harmony algorithms
- Lock individual colours to preserve favorites while generating variations
- Adjust colours with HSL sliders
- Copy colour values in HEX, RGB, or HSL formats
- Export palettes as JSON or shareable URLs
- View WCAG contrast ratios for accessibility
- Clean, minimal interface that adapts to the current palette

## Tech Stack

- React 19 with TypeScript
- Vite for fast development and builds
- styled-components for dynamic styling
- Vitest for unit testing
- fast-check for property-based testing

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Run tests
```bash
npm test
```

### Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # React components
├── utils/          # Utility functions (colour conversions, harmony algorithms)
├── hooks/          # Custom React hooks
└── test/           # Test setup and utilities
```

## Testing

The project uses a dual testing approach:
- **Unit tests** with Vitest for specific examples and edge cases
- **Property-based tests** with fast-check for universal correctness properties

Run tests with:
```bash
npm test              # Run once
npm run test:watch    # Watch mode
```
