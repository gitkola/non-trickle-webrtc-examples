/**
 * SDP Compression Utilities
 *
 * These utilities compress and decompress SDP (Session Description Protocol) strings
 * using gzip compression and base64 encoding to reduce the size of data that needs
 * to be manually copied and pasted between peers in non-trickle ICE scenarios.
 */

/**
 * Compress a string using gzip and encode to base64
 * @param str - The string to compress
 * @returns Base64-encoded compressed string
 */
export async function compressString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  writer.write(data);
  writer.close();
  const compressedData = await new Response(
    compressionStream.readable
  ).arrayBuffer();
  const bytes = new Uint8Array(compressedData);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64;
}

/**
 * Decompress a base64-encoded gzip string
 * @param base64 - The base64-encoded compressed string
 * @returns Decompressed string
 * @throws Error if decompression fails
 */
export async function decompressString(base64: string): Promise<string> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decompressionStream = new DecompressionStream('gzip');
  const writer = decompressionStream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const decompressedData = await new Response(
    decompressionStream.readable
  ).arrayBuffer();
  const decoder = new TextDecoder();
  return decoder.decode(decompressedData);
}
