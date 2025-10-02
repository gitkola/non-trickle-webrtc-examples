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
- **Error boundary**: [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) wraps app for graceful error handling
- **Main app**: [src/App.tsx](src/App.tsx) - UI orchestration layer (uses custom hooks)
- **Components**: [src/components/](src/components/) - UI components (OfferPanel, AnswerPanel, VideoComponent)
- **Styling**: [styles/globals.css](styles/globals.css) with Tailwind CSS 4

### Custom Hooks (Business Logic)
- **[src/hooks/useMediaStream.ts](src/hooks/useMediaStream.ts)** - Manages camera/mic streams, toggles, and cleanup
- **[src/hooks/useWebRTC.ts](src/hooks/useWebRTC.ts)** - Handles peer connection lifecycle, SDP exchange, connection timeouts

### Utilities
- **[src/lib/sdp-compression.ts](src/lib/sdp-compression.ts)** - Gzip compression/decompression for SDP strings
- **[src/lib/constants.ts](src/lib/constants.ts)** - Shared styles, WebRTC config (STUN servers, timeouts)
- **[src/lib/utils.ts](src/lib/utils.ts)** - Tailwind class merging utility (cn)

### WebRTC Implementation
- **Non-trickle ICE**: Manual SDP exchange via copy/paste (all ICE candidates embedded in SDP)
- **STUN server**: Google STUN server for NAT traversal
- **Connection timeout**: Auto-fails after 30 seconds in "connecting" state
- **SDP validation**: Zod schema validation before applying remote SDP
- **Proper cleanup**: Closes peer connections when reinitializing or hanging up
- **States tracked**: Connection state, ICE connection state
- **Features**: Offer/Answer creation, hangup, retry on failure

### UI Components
- Uses shadcn/ui components (New York style) in [src/components/ui/](src/components/ui/)
- Toast notifications for errors and user feedback ([src/components/ui/toast.tsx](src/components/ui/toast.tsx))
- Path aliases: `@/` maps to `src/` (configured in [tsconfig.json](tsconfig.json) and [components.json](components.json))
- Icons from `lucide-react`

### Error Handling
- React Error Boundary catches component errors
- Toast notifications replace alert() for better UX
- Connection timeout prevents hanging in "connecting" state
- SDP validation with Zod before applying

## Key Technologies

- **Runtime**: Bun (not Node.js)
- **Bundler**: Bun's built-in bundler with HTML imports (not Vite/Webpack)
- **Styling**: Tailwind CSS 4 with CSS variables
- **State**: React hooks (useState, useRef, useEffect, useCallback)
- **Custom hooks**: useMediaStream, useWebRTC (separation of concerns)
- **Validation**: Zod for SDP schema validation
- **WebRTC**: Native browser WebRTC APIs
- **Type safety**: TypeScript strict mode enabled

## Code Organization Principles

- **Separation of concerns**: UI logic in App.tsx, business logic in custom hooks
- **No code duplication**: Shared styles and constants extracted to [src/lib/constants.ts](src/lib/constants.ts)
- **Proper cleanup**: All resources (streams, connections, timeouts) cleaned up on unmount
- **Memoization**: Callbacks memoized with useCallback to prevent unnecessary re-renders
- **Type safety**: Strict TypeScript mode, proper null handling
