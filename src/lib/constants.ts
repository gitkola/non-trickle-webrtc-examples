import { cn } from './utils';

/**
 * Shared UI Constants and Styles
 */

// WebRTC Configuration
export const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};

// Connection timeout in milliseconds (600 seconds)
export const CONNECTION_TIMEOUT_MS = 600000;

// Shared Button Styles
export const PANEL_BUTTON_STYLES = cn(
  'shrink-0',
  'h-12',
  'border-0',
  'rounded-none',
  'bg-teal-500',
  'hover:bg-teal-600',
  'active:bg-teal-700'
);

// Shared Input Styles
export const PANEL_INPUT_STYLES = cn(
  'h-12',
  'w-full',
  'px-2',
  'font-mono',
  'text-background',
  'bg-foreground',
  'rounded-none',
  'border-none'
);

// Icon button size for action buttons
export const ICON_BUTTON_SIZE = 'size-12';
