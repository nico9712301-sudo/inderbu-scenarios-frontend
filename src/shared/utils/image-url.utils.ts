/**
 * Utility functions for handling image URLs
 */

/**
 * Get the correct API base URL based on environment
 */
export function getApiBaseUrl(): string {
  // In production, use the backend URL from environment variables
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://inderbu-scenarios-backend.vercel.app';
  }

  // For development, prefer environment variable or fallback to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

/**
 * Normalize image URL to ensure it's a complete URL
 */
export function normalizeImageUrl(url: string | undefined): string {
  if (!url) return '';

  // If URL already includes protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = getApiBaseUrl();

  // If URL starts with /, it's a relative path - construct full URL
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  // Otherwise, assume it's a relative path and prepend base URL
  return `${baseUrl}/${url}`;
}