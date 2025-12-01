/**
 * Utility functions for handling image URLs
 */

/**
 * Get the correct API base URL based on environment
 */
export function getApiBaseUrl(): string {
  // Check for environment variable first (works in both client and server)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // For client-side in production, check window object
  if (typeof window !== 'undefined') {
    // Check Next.js runtime config first
    if ((window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
      return (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
    }

    // If we're on vercel production domain, use production backend
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('inderbu')) {
      return 'https://inderbu-scenarios-backend.vercel.app';
    }
  }

  // For development or fallback
  return 'http://localhost:3001';
}

/**
 * Normalize image URL to ensure it's a complete URL
 */
export function normalizeImageUrl(url: string | undefined): string {
  if (!url) return '';

  // Fix URLs that come with localhost:3001 from backend in production
  if (url.includes('localhost:3001')) {
    // Extract the path after localhost:3001
    const urlParts = url.split('localhost:3001');
    if (urlParts.length > 1) {
      const path = urlParts[1];
      const baseUrl = getApiBaseUrl();
      return `${baseUrl}${path}`;
    }
  }

  // If URL already includes correct protocol and domain, return as is
  if (url.startsWith('https://') && !url.includes('localhost:3001')) {
    return url;
  }

  // If URL includes http://localhost:3001, replace with correct base URL
  if (url.startsWith('http://localhost:3001')) {
    const path = url.replace('http://localhost:3001', '');
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${path}`;
  }

  // If URL already includes protocol but has localhost, fix it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's localhost, replace with correct base
    if (url.includes('localhost')) {
      const urlObj = new URL(url);
      const baseUrl = getApiBaseUrl();
      return `${baseUrl}${urlObj.pathname}`;
    }
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