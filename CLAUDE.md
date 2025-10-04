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
- **[src/hooks/useStreamReady.ts](src/hooks/useStreamReady.ts)** - Tracks when media stream is ready (has tracks)
- **[src/hooks/useUrlParams.ts](src/hooks/useUrlParams.ts)** - Parses URL parameters for offer initialization
- **[src/hooks/useAutoAnswer.ts](src/hooks/useAutoAnswer.ts)** - Automatically generates answer when offer is received
- **[src/hooks/useClipboard.ts](src/hooks/useClipboard.ts)** - Handles clipboard operations with browser permission handling

### Utilities

- **[src/lib/sdp-compression.ts](src/lib/sdp-compression.ts)** - Gzip compression/decompression for SDP strings
- **[src/lib/url-utils.ts](src/lib/url-utils.ts)** - URL creation and parsing for offer sharing, SDP extraction from URLs
- **[src/lib/constants.ts](src/lib/constants.ts)** - Shared styles, WebRTC config (STUN servers, timeouts)
- **[src/lib/utils.ts](src/lib/utils.ts)** - Tailwind class merging utility (cn)

### WebRTC Implementation

- **Non-trickle ICE**: Manual SDP exchange via copy/paste (all ICE candidates embedded in SDP)
- **Asymmetric URL/SDP flow**:
  - Offers are shared as URLs (`?offer=...`) for easy one-click access
  - Answers use raw SDP to preserve sender's peer connection state
  - Prevents connection reset when sender receives answer
- **STUN server**: Google STUN server for NAT traversal
- **Connection timeout**: Auto-fails after 30 seconds in "connecting" state
- **SDP validation**: Zod schema validation before applying remote SDP (supports both compressed and raw JSON formats)
- **Auto-answer**: Automatically generates answer when offer URL is opened
- **Stream readiness**: Waits for local media before creating peer connection
- **Proper cleanup**: Closes peer connections when reinitializing or hanging up
- **States tracked**: Connection state, ICE connection state, loading states
- **Features**: Offer/Answer creation, automatic answer, hangup, retry on failure, reload button
- **Clipboard handling**: User-initiated tracking for Safari/Firefox compatibility

### UI Components

- Uses shadcn/ui components (New York style) in [src/components/ui/](src/components/ui/)
- Toast notifications for errors and user feedback ([src/components/ui/toast.tsx](src/components/ui/toast.tsx))
- Path aliases: `@/` maps to `src/` (configured in [tsconfig.json](tsconfig.json) and [components.json](components.json))
- Icons from `lucide-react`

### Error Handling

- React Error Boundary catches component errors
- Toast notifications replace alert() for better UX ([src/lib/handleError.ts](src/lib/handleError.ts))
- Connection timeout prevents hanging in "connecting" state
- SDP validation with Zod before applying
- Graceful handling of invalid SDP formats (compressed/uncompressed/malformed)
- Clear error messages distinguish between decompression and parsing failures

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
- **Single responsibility**: Each hook handles one feature (URL parsing, auto-answer, clipboard, stream readiness)
- **No code duplication**: Shared styles and constants extracted to [src/lib/constants.ts](src/lib/constants.ts)
- **Proper cleanup**: All resources (streams, connections, timeouts) cleaned up on unmount
- **Memoization**: Callbacks memoized with useCallback to prevent unnecessary re-renders
- **Type safety**: Strict TypeScript mode, proper null handling
- **Reusability**: Custom hooks can be used across components independently

## User Flow

### Sender (Creating Offer)

1. Click "Create Offer" → Peer connection initialized, loading spinner shown
2. Offer URL auto-copied to clipboard: `https://app.com/?offer=compressed_sdp`
3. Send URL to receiver via any communication channel
4. Receive raw answer SDP from receiver
5. Paste answer SDP → Auto-connects (applies answer to existing peer connection)
6. Bidirectional video/audio streaming established

### Receiver (Receiving Offer)

1. Open offer URL: `https://app.com/?offer=...`
2. Offer auto-populated from URL parameters
3. Local media stream initialized (camera/microphone access)
4. Answer automatically generated when stream is ready
5. Raw answer SDP auto-copied to clipboard (not URL!)
6. Send answer SDP back to sender
7. Bidirectional video/audio streaming established

### Why Asymmetric (URL vs SDP)?

- **Offer = URL**: One-click access for receiver, initializes new peer connection
- **Answer = Raw SDP**: Preserves sender's existing peer connection, prevents reset
- Opening an answer URL would destroy sender's waiting peer connection
