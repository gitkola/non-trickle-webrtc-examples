# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A WebRTC demonstration application for non-trickle ICE negotiation. Built with Bun runtime, React 19, Tailwind CSS 4, and shadcn/ui components.

## Development Commands

### Starting Development Server
```bash
bun dev              # Start dev server with HMR at http://localhost:3000
```

### Production
```bash
bun start            # Run production server
bun run build        # Build for production (outputs to dist/)
```

### Build System
The project uses a custom build script ([build.ts](build.ts)) that:
- Scans for all HTML files in `src/`
- Bundles with Tailwind CSS via `bun-plugin-tailwind`
- Supports CLI arguments for build configuration (run `bun run build.ts --help`)

## Architecture

### Server ([src/index.tsx](src/index.tsx))
- Uses `Bun.serve()` with route-based routing (no Express)
- Serves HTML with automatic bundling and HMR in development
- HTML imports directly support React/TSX without separate bundler
- Development mode includes browser console echoing and hot reload

### Frontend Structure
- **Entry point**: [src/index.html](src/index.html) imports [src/frontend.tsx](src/frontend.tsx)
- **Main app**: [src/App.tsx](src/App.tsx) - WebRTC connection orchestration
- **Components**: [src/components/](src/components/) - UI components including VideoComponent
- **Styling**: [styles/globals.css](styles/globals.css) with Tailwind CSS 4

### WebRTC Implementation ([src/App.tsx](src/App.tsx))
- Manual SDP exchange (non-trickle ICE) - users copy/paste offers and answers
- Uses Google STUN server for NAT traversal
- Maintains peer connection, local/remote streams, and ICE candidates in refs
- Connection states: disconnected → connecting → connected/failed

### UI Components
- Uses shadcn/ui components (New York style) in [src/components/ui/](src/components/ui/)
- Path aliases: `@/` maps to `src/` (configured in [tsconfig.json](tsconfig.json) and [components.json](components.json))
- Icons from `lucide-react`

## Key Technologies

- **Runtime**: Bun (not Node.js)
- **Bundler**: Bun's built-in bundler with HTML imports (not Vite/Webpack)
- **Styling**: Tailwind CSS 4 with CSS variables
- **State**: React hooks (useState, useRef, useEffect)
- **WebRTC**: Native browser WebRTC APIs
