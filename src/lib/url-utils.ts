/**
 * URL Utilities for SDP Sharing
 *
 * These utilities handle URL-based SDP sharing, allowing users to share
 * WebRTC offers and answers via clickable links instead of manual copy/paste.
 */

/**
 * Create a shareable URL with SDP in query params
 * @param sdp - Compressed SDP string
 * @param type - 'offer'
 * @returns Full URL with SDP as query parameter
 */
export function createSDPUrl(sdp: string, type: 'offer'): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('offer');
  url.searchParams.set(type, sdp);
  return url.toString();
}

/**
 * Parse URL parameter to extract offer
 * @returns Object with offer if present in URL
 */
export function parseUrlParams(): { offer?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    offer: params.get('offer') || undefined,
  };
}

/**
 * Extract SDP from text that might contain a URL
 * Handles cases where user pastes a full URL instead of just SDP
 * @param text - Text that might be a URL or raw SDP
 * @returns Extracted SDP string
 */
export function extractSDPFromText(text: string): string {
  const trimmed = text.trim();
  // Check if it looks like a URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const offer = url.searchParams.get('offer');
      return offer || trimmed;
    } catch {
      // If URL parsing fails, return original text
      return trimmed;
    }
  }

  // Return as-is if not a URL
  return trimmed;
}
